-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- 1. 用户资料 (PROFILES) - 扩展 Auth 表
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text,
  avatar_url text,
  level_text text default 'Lv 1', -- 等级文本
  daily_goal_current int default 0, -- 当前每日目标进度
  daily_goal_target int default 60, -- 每日目标总值
  current_streak int default 0, -- 当前连胜天数
  total_study_minutes int default 0, -- 总学习时长
  coins int default 0, -- 金币数
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 课程 (COURSES)
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null, -- 课程标题
  subtitle text, -- 副标题
  level_category text, -- 级别分类，例如 '初级', '中级'
  cover_url text, -- 封面图片 URL
  total_chapters int default 0, -- 总章节数
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. 章节 (CHAPTERS)
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses on delete cascade not null,
  chapter_number int not null, -- 章节序号
  title text not null, -- 章节标题
  korean_title text, -- 韩语标题
  description text, -- 描述
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 用户课程进度 (USER COURSE PROGRESS)
create table public.user_courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  progress_percent int default 0, -- 进度百分比
  status text default 'locked', --状态： 'locked'(锁定), 'in_progress'(进行中), 'completed'(已完成)
  last_accessed_at timestamp with time zone default timezone('utc'::text, now()), -- 最后访问时间
  unique(user_id, course_id)
);

-- 5. 词典词条 (DICTIONARY ENTRIES)
create table public.dictionary_entries (
  id uuid default uuid_generate_v4() primary key,
  korean text not null, -- 韩语单词
  romaja text, -- 罗马音
  pos text, -- 词性：名词, 动词, 形容词 等
  definition text not null, -- 定义/释义
  example_sentence text, -- 例句
  example_meaning text, -- 例句释义
  difficulty_level text, -- 难度分级，如 'Level 1'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. 用户收藏 (USER FAVORITES) - 词典
create table public.user_favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  entry_id uuid references public.dictionary_entries on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, entry_id)
);

-- 7. 抽认卡 (FLASHCARDS)
create table public.flashcards (
    id uuid default uuid_generate_v4 () primary key,
    chapter_id uuid references public.chapters on delete set null,
    front_text text not null, -- 正面文本 (韩语)
    back_text text not null, -- 背面文本 (定义/中文)
    back_meaning text, -- 详细释义
    example_sentence text, -- 上下文例句
    is_grammar boolean default false -- 是否为语法卡片
);

-- RLS 策略 (行级安全)
alter table public.profiles enable row level security;

alter table public.courses enable row level security;

alter table public.chapters enable row level security;

alter table public.user_courses enable row level security;

alter table public.dictionary_entries enable row level security;

alter table public.user_favorites enable row level security;

alter table public.flashcards enable row level security;

-- 静态内容的公共读取权限
create policy "Courses are public" on public.courses for
select using (true);

create policy "Chapters are public" on public.chapters for
select using (true);

create policy "Dictionary is public" on public.dictionary_entries for
select using (true);

create policy "Flashcards are public" on public.flashcards for
select using (true);

-- 用户私有访问权限
create policy "Users can view own profile" on public.profiles for
select using (auth.uid () = id);

create policy "Users can update own profile" on public.profiles for
update using (auth.uid () = id);

create policy "Users can view own course progress" on public.user_courses for
select using (auth.uid () = user_id);

create policy "Users can update own course progress" on public.user_courses for all using (auth.uid () = user_id);

create policy "Users can view own favorites" on public.user_favorites for
select using (auth.uid () = user_id);

create policy "Users can manage own favorites" on public.user_favorites for all using (auth.uid () = user_id);

-- 注册时自动创建 Profile 的触发器
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();