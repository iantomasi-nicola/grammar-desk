-- Grammar Desk: one table for your data and one private bucket for your files.
-- Paste this once in Supabase → SQL Editor → Run. It can be run again safely.

create table if not exists public.gd_docs (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  path text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, path)
);
create index if not exists gd_docs_user_updated on public.gd_docs (user_id, updated_at);

-- the server decides when a row changed, so devices with a wrong clock cannot confuse the sync
create or replace function public.gd_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists gd_touch on public.gd_docs;
create trigger gd_touch before insert or update on public.gd_docs for each row execute function public.gd_touch();

alter table public.gd_docs enable row level security;
drop policy if exists "gd select own" on public.gd_docs;
drop policy if exists "gd insert own" on public.gd_docs;
drop policy if exists "gd update own" on public.gd_docs;
drop policy if exists "gd delete own" on public.gd_docs;
create policy "gd select own" on public.gd_docs for select to authenticated using (auth.uid() = user_id);
create policy "gd insert own" on public.gd_docs for insert to authenticated with check (auth.uid() = user_id);
create policy "gd update own" on public.gd_docs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "gd delete own" on public.gd_docs for delete to authenticated using (auth.uid() = user_id);

do $$ begin
  alter publication supabase_realtime add table public.gd_docs;
exception when duplicate_object then null; end $$;

-- Files (your PDFs, practice-paper audio, parsed books): a private folder per user.
insert into storage.buckets (id, name, public) values ('gd-files', 'gd-files', false) on conflict (id) do nothing;
drop policy if exists "gd files read own" on storage.objects;
drop policy if exists "gd files write own" on storage.objects;
drop policy if exists "gd files update own" on storage.objects;
drop policy if exists "gd files delete own" on storage.objects;
create policy "gd files read own" on storage.objects for select to authenticated using (bucket_id = 'gd-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "gd files write own" on storage.objects for insert to authenticated with check (bucket_id = 'gd-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "gd files update own" on storage.objects for update to authenticated using (bucket_id = 'gd-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "gd files delete own" on storage.objects for delete to authenticated using (bucket_id = 'gd-files' and (storage.foldername(name))[1] = auth.uid()::text);
