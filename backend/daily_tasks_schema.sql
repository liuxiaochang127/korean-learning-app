-- Create daily_study_tasks table for tracking daily snapshot
create table if not exists public.daily_study_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  word_id uuid references public.dictionary_entries(id) on delete cascade not null,
  study_date date not null,
  status text default 'pending', -- pending, completed
  task_type text default 'new', -- new, review
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, word_id, study_date)
);

alter table public.daily_study_tasks enable row level security;

create policy "Users can view own tasks" on public.daily_study_tasks for
select using (auth.uid () = user_id);

create policy "Users can insert own tasks" on public.daily_study_tasks for
insert
with
    check (auth.uid () = user_id);

create policy "Users can update own tasks" on public.daily_study_tasks for
update using (auth.uid () = user_id);

-- Index for faster lookups
create index idx_daily_tasks_user_date on public.daily_study_tasks (user_id, study_date);