"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Kanban,
  NotebookPen,
  Calendar,
  FolderOpen,
  Bot,
  Plus,
  Bug,
  CheckSquare,
  BookOpen,
  Zap,
} from "lucide-react";

/* ─── Design tokens (from OpenDock base.css) ─── */
const C = {
  bgPrimary: "#0c0c0d",
  bgSecondary: "#111113",
  bgTertiary: "#18181b",
  bgElevated: "#1e1e21",
  bgHover: "rgba(255, 255, 255, 0.04)",
  textPrimary: "#e4e4e7",
  textSecondary: "#8b8b96",
  textTertiary: "#5a5a65",
  accent: "#64cfe9",
  border: "rgba(255, 255, 255, 0.08)",
  borderSubtle: "rgba(255, 255, 255, 0.04)",
} as const;

/* ─── Sidebar nav items ─── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Kanban, label: "Boards", active: true },
  { icon: NotebookPen, label: "Notes", active: false },
  { icon: Calendar, label: "Calendar", active: false },
  { icon: FolderOpen, label: "Files", active: false },
];

/* ─── Issue types ─── */
type IssueType = "bug" | "task" | "story" | "epic";

const ISSUE_TYPE_CONFIG: Record<
  IssueType,
  { icon: typeof Bug; color: string }
> = {
  bug: { icon: Bug, color: "#f87171" },
  task: { icon: CheckSquare, color: "#60a5fa" },
  story: { icon: BookOpen, color: "#4ade80" },
  epic: { icon: Zap, color: "#a78bfa" },
};

/* ─── Board columns ─── */
const COLUMNS = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To Do" },
  { id: "progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

/* ─── Label colors ─── */
const LABEL_COLORS: Record<string, string> = {
  frontend: "#60a5fa",
  backend: "#a78bfa",
  bug: "#f87171",
  feature: "#4ade80",
  infra: "#f59e0b",
};

/* ─── Tickets ─── */
interface Ticket {
  id: string;
  title: string;
  col: string;
  priority: "low" | "medium" | "high";
  type: IssueType;
  assignee: string;
  labels: string[];
}

const INITIAL_TICKETS: Ticket[] = [
  { id: "OD-14", title: "Add drag-and-drop reorder", col: "backlog", priority: "medium", type: "story", assignee: "R", labels: ["frontend"] },
  { id: "OD-15", title: "Calendar recurring events", col: "backlog", priority: "low", type: "story", assignee: "Q", labels: ["feature"] },
  { id: "OD-10", title: "Build notification system", col: "todo", priority: "high", type: "task", assignee: "N", labels: ["backend"] },
  { id: "OD-11", title: "Fix sidebar collapse anim", col: "todo", priority: "medium", type: "bug", assignee: "T", labels: ["bug"] },
  { id: "OD-7", title: "Implement sprint planning", col: "progress", priority: "high", type: "epic", assignee: "N", labels: ["feature"] },
  { id: "OD-8", title: "Notes markdown preview", col: "progress", priority: "medium", type: "story", assignee: "R", labels: ["frontend"] },
  { id: "OD-3", title: "Auth session management", col: "done", priority: "high", type: "task", assignee: "T", labels: ["backend"] },
  { id: "OD-4", title: "Board snapshot API", col: "done", priority: "medium", type: "task", assignee: "N", labels: ["backend"] },
];

const USERS: Record<string, { color: string; avatar: string }> = {
  N: { color: "#6366f1", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Noah&top=shortCurly&clothing=hoodie&clothesColor=6366f1&skinColor=f8d25c" },
  T: { color: "#8b5cf6", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Trevor&top=shortFlat&facialHair=beardLight&clothing=blazerAndShirt&skinColor=edb98a" },
  R: { color: "#0ea5e9", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Riley&top=shortWaved&clothing=graphicShirt&clothesColor=0ea5e9&skinColor=f8d25c" },
  Q: { color: "#f59e0b", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Quinn&top=dreads01&facialHair=beardMedium&clothing=hoodie&clothesColor=f59e0b&skinColor=ae5d29" },
};

const PRIORITY_COLORS = {
  high: "rgba(248, 113, 113, 0.8)",
  medium: "rgba(252, 211, 77, 0.8)",
  low: "rgba(52, 211, 153, 0.8)",
};

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/* ─── View tabs ─── */
const VIEW_TABS = [
  { label: "Board", active: true },
  { label: "List", active: false },
  { label: "Timeline", active: false },
];

/* ─── Ticket Card (matches TicketCard.tsx) ─── */
function TicketCard({ ticket }: { ticket: Ticket }) {
  const user = USERS[ticket.assignee];
  const issueType = ISSUE_TYPE_CONFIG[ticket.type];
  const IssueIcon = issueType.icon;

  return (
    <div
      style={{
        borderRadius: 6,
        border: "1px solid rgba(255, 255, 255, 0.06)",
        background: "rgba(255, 255, 255, 0.015)",
        padding: "10px 12px",
        cursor: "pointer",
        transition: "border-color 150ms, background 150ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.015)";
      }}
    >
      {/* Title row with issue type icon */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
        <IssueIcon
          size={12}
          style={{ color: issueType.color, flexShrink: 0, marginTop: 2 }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#d4d4d8",
            lineHeight: 1.4,
          }}
        >
          {ticket.title}
        </span>
      </div>

      {/* Bottom row: key + dots on left, assignee on right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
              fontSize: 10,
              color: "#737373",
            }}
          >
            {ticket.id}
          </span>
          {/* Priority dot */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: PRIORITY_COLORS[ticket.priority],
              flexShrink: 0,
            }}
          />
          {/* Label dots */}
          {ticket.labels.map((label) => (
            <div
              key={label}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: LABEL_COLORS[label] || "#737373",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        {/* Assignee avatar (initial letter in circle) */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 500,
              color: "#a1a1aa",
            }}
          >
            {ticket.assignee}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Board Column (matches KanbanColumn.tsx) ─── */
function BoardColumn({
  column,
  tickets,
}: {
  column: (typeof COLUMNS)[number];
  tickets: Ticket[];
}) {
  return (
    <div
      style={{
        width: 288,
        flexShrink: 0,
        alignSelf: "flex-start",
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.06)",
        padding: 14,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#737373",
            }}
          >
            {column.title}
          </span>
          <span
            style={{
              fontSize: 11,
              fontVariantNumeric: "tabular-nums",
              color: "#525252",
            }}
          >
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Ticket list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AnimatePresence mode="popLayout">
          {tickets.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <TicketCard ticket={t} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick create */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 10,
          padding: "4px 0",
          cursor: "pointer",
        }}
      >
        <Plus size={12} style={{ color: "#525252" }} />
        <span style={{ fontSize: 11, color: "#525252" }}>Create</span>
      </div>
    </div>
  );
}

/* ─── Exported OpenDockAppMock ─── */
export function OpenDockAppMock({ height = "520px" }: { height?: string }) {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const moveIdx = useRef(0);

  // Animate tickets moving between columns every 4s
  useEffect(() => {
    const moves = [
      { id: "OD-10", to: "progress" },
      { id: "OD-14", to: "todo" },
      { id: "OD-8", to: "done" },
      { id: "OD-11", to: "progress" },
      { id: "OD-15", to: "todo" },
      { id: "OD-10", to: "done" },
      { id: "OD-14", to: "progress" },
      { id: "OD-11", to: "done" },
    ];

    const interval = setInterval(() => {
      const move = moves[moveIdx.current % moves.length];
      setTickets((prev) =>
        prev.map((t) => (t.id === move.id ? { ...t, col: move.to } : t))
      );
      moveIdx.current++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
        background: C.bgPrimary,
        border: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", height }}>
        {/* ─── Sidebar ─── */}
        <div
          className="hidden md:flex"
          style={{
            width: 200,
            flexShrink: 0,
            flexDirection: "column",
            background: C.bgPrimary,
            borderRight: `1px solid ${C.borderSubtle}`,
          }}
        >
          {/* Nav items */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              padding: "12px 8px",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: item.active
                    ? "rgba(255, 255, 255, 0.04)"
                    : "transparent",
                  cursor: "pointer",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) => {
                  if (!item.active)
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!item.active)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <item.icon
                  size={16}
                  style={{
                    color: item.active ? C.textPrimary : C.textSecondary,
                    opacity: item.active ? 1 : 0.7,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 450,
                    color: item.active ? C.textPrimary : C.textSecondary,
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Sidebar footer — Claude button */}
          <div
            style={{
              borderTop: `1px solid ${C.borderSubtle}`,
              padding: "8px 8px 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Bot
                size={16}
                style={{ color: C.textSecondary, opacity: 0.7 }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 450,
                  color: C.textSecondary,
                }}
              >
                Claude
              </span>
            </div>
          </div>
        </div>

        {/* ─── Main content area ─── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: C.bgSecondary,
          }}
        >
          {/* Board header */}
          <div style={{ padding: "16px 20px 0" }}>
            {/* Board name + ticket count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                Sprint 4
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#737373",
                }}
              >
                {tickets.length} issues
              </span>
            </div>

            {/* View tabs */}
            <div
              style={{
                display: "flex",
                gap: 0,
                borderBottom: `1px solid ${C.borderSubtle}`,
              }}
            >
              {VIEW_TABS.map((tab) => (
                <div
                  key={tab.label}
                  style={{
                    position: "relative",
                    padding: "6px 12px 10px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: tab.active ? C.textPrimary : C.textTertiary,
                    }}
                  >
                    {tab.label}
                  </span>
                  {tab.active && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 12,
                        right: 12,
                        height: 1.5,
                        borderRadius: 1,
                        background: C.textPrimary,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Columns area */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              gap: 16,
              padding: 16,
            }}
          >
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tickets={tickets.filter((t) => t.col === col.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
