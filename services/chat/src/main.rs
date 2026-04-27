use std::{collections::HashMap, env, sync::Arc};

use anyhow::Context;
use axum::{
    extract::{
        ws::{Message, WebSocket},
        ConnectInfo, Path, State, WebSocketUpgrade,
    },
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
};
use futures_util::{sink::SinkExt, stream::StreamExt};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::net::SocketAddr;
use tokio::sync::{broadcast, RwLock};
use tracing::{error, info};
use uuid::Uuid;

#[derive(Clone)]
struct AppState {
    pool: PgPool,
    jwt_secret: String,
    channels: Arc<RwLock<HashMap<Uuid, broadcast::Sender<OutboundMessage>>>>,
}

#[derive(Debug, Deserialize)]
struct Claims {
    sub: String,
    #[serde(default)]
    #[allow(dead_code)]
    exp: Option<i64>,
    #[serde(default)]
    #[allow(dead_code)]
    iat: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
struct AuthedUser {
    id: Uuid,
    member_number: i32,
    display_name: Option<String>,
    role: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type")]
enum OutboundMessage {
    #[serde(rename = "history")]
    History { messages: Vec<ChatMessage> },
    #[serde(rename = "message")]
    Message { message: ChatMessage },
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
enum InboundMessage {
    #[serde(rename = "send")]
    Send { body: String },
}

#[derive(Debug, Clone, Serialize)]
struct ChatMessage {
    id: Uuid,
    channel_id: Uuid,
    author_id: Uuid,
    author_name: Option<String>,
    author_member_number: i32,
    body: String,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,athion_chat=debug".into()),
        )
        .init();

    let database_url = env::var("DATABASE_URL").context("DATABASE_URL not set")?;
    let jwt_secret = env::var("JWT_SECRET").context("JWT_SECRET not set")?;
    let port: u16 = env::var("CHAT_PORT")
        .unwrap_or_else(|_| "3001".into())
        .parse()
        .context("CHAT_PORT must be a number")?;

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .context("connecting to Postgres")?;

    let state = AppState {
        pool,
        jwt_secret,
        channels: Arc::new(RwLock::new(HashMap::new())),
    };

    let app = Router::new()
        .route("/healthz", get(health))
        .route("/ws/:channel_slug", get(ws_handler))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("athion-chat listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;

    Ok(())
}

async fn health() -> impl IntoResponse {
    "ok"
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    Path(channel_slug): Path<String>,
    headers: HeaderMap,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> Result<axum::response::Response, (StatusCode, &'static str)> {
    let user = authenticate(&state, &headers)
        .await
        .ok_or((StatusCode::UNAUTHORIZED, "unauthorized"))?;

    let channel_id = sqlx::query_scalar!(
        r#"SELECT id FROM chat_channels WHERE slug = $1"#,
        channel_slug
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        error!(?e, "channel lookup failed");
        (StatusCode::INTERNAL_SERVER_ERROR, "db error")
    })?
    .ok_or((StatusCode::NOT_FOUND, "channel not found"))?;

    info!(user = %user.id, addr = %addr, channel = %channel_slug, "ws upgrade");
    Ok(ws.on_upgrade(move |socket| handle_socket(socket, state, user, channel_id)))
}

async fn authenticate(state: &AppState, headers: &HeaderMap) -> Option<AuthedUser> {
    let cookie_header = headers.get("cookie")?.to_str().ok()?;
    let token = cookie_header.split(';').find_map(|c| {
        c.trim().strip_prefix("auth_token=")
    })?;

    let mut validation = Validation::new(jsonwebtoken::Algorithm::HS256);
    validation.validate_exp = true;
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &validation,
    )
    .ok()?;

    let user_id = Uuid::parse_str(&claims.claims.sub).ok()?;

    let row = sqlx::query!(
        r#"SELECT id, member_number, display_name, role FROM users WHERE id = $1"#,
        user_id
    )
    .fetch_optional(&state.pool)
    .await
    .ok()??;

    Some(AuthedUser {
        id: row.id,
        member_number: row.member_number,
        display_name: row.display_name,
        role: row.role,
    })
}

async fn handle_socket(socket: WebSocket, state: AppState, user: AuthedUser, channel_id: Uuid) {
    let (mut sink, mut stream) = socket.split();

    let mut rx = {
        let mut channels = state.channels.write().await;
        let tx = channels
            .entry(channel_id)
            .or_insert_with(|| broadcast::channel::<OutboundMessage>(256).0)
            .clone();
        tx.subscribe()
    };

    if let Ok(history) = recent_messages(&state.pool, channel_id, 100).await {
        let payload = OutboundMessage::History { messages: history };
        if let Ok(text) = serde_json::to_string(&payload) {
            let _ = sink.send(Message::Text(text)).await;
        }
    }

    let forward = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            let text = match serde_json::to_string(&msg) {
                Ok(t) => t,
                Err(_) => continue,
            };
            if sink.send(Message::Text(text)).await.is_err() {
                break;
            }
        }
    });

    while let Some(Ok(msg)) = stream.next().await {
        match msg {
            Message::Text(text) => {
                let inbound: InboundMessage = match serde_json::from_str(&text) {
                    Ok(m) => m,
                    Err(_) => continue,
                };
                match inbound {
                    InboundMessage::Send { body } => {
                        let body = body.trim();
                        if body.is_empty() || body.len() > 1000 {
                            continue;
                        }
                        match insert_message(&state.pool, channel_id, user.id, body).await {
                            Ok(saved) => {
                                let out = ChatMessage {
                                    id: saved.id,
                                    channel_id,
                                    author_id: user.id,
                                    author_name: user.display_name.clone(),
                                    author_member_number: user.member_number,
                                    body: saved.body,
                                    created_at: saved.created_at,
                                };
                                let channels = state.channels.read().await;
                                if let Some(tx) = channels.get(&channel_id) {
                                    let _ = tx.send(OutboundMessage::Message { message: out });
                                }
                            }
                            Err(e) => {
                                error!(?e, "insert failed");
                            }
                        }
                    }
                }
            }
            Message::Close(_) => break,
            Message::Ping(_) | Message::Pong(_) | Message::Binary(_) => {}
        }
    }

    forward.abort();
    info!(user = %user.id, "ws disconnect");
}

struct InsertedMessage {
    id: Uuid,
    body: String,
    created_at: chrono::DateTime<chrono::Utc>,
}

async fn insert_message(
    pool: &PgPool,
    channel_id: Uuid,
    author_id: Uuid,
    body: &str,
) -> sqlx::Result<InsertedMessage> {
    let row = sqlx::query!(
        r#"
        INSERT INTO chat_messages (channel_id, author_id, body)
        VALUES ($1, $2, $3)
        RETURNING id, body, created_at
        "#,
        channel_id,
        author_id,
        body
    )
    .fetch_one(pool)
    .await?;
    Ok(InsertedMessage {
        id: row.id,
        body: row.body,
        created_at: row.created_at,
    })
}

async fn recent_messages(
    pool: &PgPool,
    channel_id: Uuid,
    limit: i64,
) -> sqlx::Result<Vec<ChatMessage>> {
    let rows = sqlx::query!(
        r#"
        SELECT m.id, m.channel_id, m.author_id, m.body, m.created_at,
               u.display_name, u.member_number
        FROM chat_messages m
        JOIN users u ON u.id = m.author_id
        WHERE m.channel_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2
        "#,
        channel_id,
        limit
    )
    .fetch_all(pool)
    .await?;

    let mut messages: Vec<ChatMessage> = rows
        .into_iter()
        .map(|r| ChatMessage {
            id: r.id,
            channel_id: r.channel_id,
            author_id: r.author_id,
            author_name: r.display_name,
            author_member_number: r.member_number,
            body: r.body,
            created_at: r.created_at,
        })
        .collect();

    messages.reverse();
    Ok(messages)
}
