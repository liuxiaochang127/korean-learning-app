-- User Word Progress Table for SRS (Spaced Repetition System)
create table if not exists public.user_word_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  word_id uuid references public.dictionary_entries(id) on delete cascade not null,

-- SRS fields
ease_factor float default 2.5, -- Sm2 algorithm ease factor
interval int default 0, -- Days until next review
review_count int default 0, -- Total times reviewed

-- Timing
next_review_at timestamp with time zone default timezone('utc'::text, now()),
  last_reviewed_at timestamp with time zone default timezone('utc'::text, now()),

-- Status: 'new', 'learning', 'review', 'relearning'
status text default 'new',

-- Constraints
unique(user_id, word_id) );

-- RLS
alter table public.user_word_progress enable row level security;

create policy "Users can view own progress" on public.user_word_progress for
select using (auth.uid () = user_id);

create policy "Users can insert own progress" on public.user_word_progress for
insert
with
    check (auth.uid () = user_id);

create policy "Users can update own progress" on public.user_word_progress for
update using (auth.uid () = user_id);

-- Create index for performance
create index idx_user_word_progress_user_next_review on public.user_word_progress (user_id, next_review_at);