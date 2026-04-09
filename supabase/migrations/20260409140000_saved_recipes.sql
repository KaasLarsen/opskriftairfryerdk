-- Gemte opskrifter (kør i Supabase SQL Editor én gang, eller via CLI migrate)
-- Kræver: projekt med auth.users

create table if not exists public.saved_recipes (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	recipe_slug text not null,
	created_at timestamptz not null default now(),
	unique (user_id, recipe_slug)
);

create index if not exists saved_recipes_user_id_idx on public.saved_recipes (user_id);

alter table public.saved_recipes enable row level security;

create policy "saved_recipes_select_own" on public.saved_recipes
	for select using (auth.uid() = user_id);

create policy "saved_recipes_insert_own" on public.saved_recipes
	for insert with check (auth.uid() = user_id);

create policy "saved_recipes_delete_own" on public.saved_recipes
	for delete using (auth.uid() = user_id);
