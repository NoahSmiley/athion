-- Profiles table — auto-created on signup via trigger
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  stripe_customer_id text unique,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Subscriptions table — synced from Stripe via webhooks
create type subscription_status as enum (
  'active', 'canceled', 'incomplete', 'incomplete_expired',
  'past_due', 'trialing', 'unpaid', 'paused'
);

create type product_type as enum ('flux', 'game_servers');

create table public.subscriptions (
  id text primary key, -- Stripe subscription ID
  user_id uuid references public.profiles(id) on delete cascade not null,
  status subscription_status not null,
  product product_type not null,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now()
);

-- IDE waitlist
create table public.ide_waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- Contact form submissions
create table public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ide_waitlist enable row level security;
alter table public.contact_submissions enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Subscriptions: users can read their own subscriptions
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Waitlist: anyone can insert
create policy "Anyone can join waitlist"
  on public.ide_waitlist for insert
  with check (true);

-- Contact: anyone can insert
create policy "Anyone can submit contact form"
  on public.contact_submissions for insert
  with check (true);

-- Indexes
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_ide_waitlist_email on public.ide_waitlist(email);
