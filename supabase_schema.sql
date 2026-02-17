-- DATA SCHEMA FOR FFS KATE

-- 1. Profiles (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  email text,
  active_program_id uuid
);

-- 2. Programs
create table public.programs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  created_at timestamp with time zone default now(),
  owner_id uuid references auth.users -- The client this program belongs to
);

-- 3. Workouts (Days within a program)
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs on delete cascade,
  day_name text not null, -- e.g., "Lower Body A"
  week_number int default 1,
  order_index int default 0
);

-- 4. Exercises (Specific movements in a workout)
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts on delete cascade,
  name text not null,
  suggested_sets int,
  suggested_reps text,
  suggested_weight text,
  video_id text, -- YouTube ID
  instructions text
);

-- 5. Logs (User performance)
create table public.logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  exercise_id uuid references public.exercises not null,
  reps int,
  weight text,
  timestamp timestamp with time zone default now()
);

-- 6. Scheduled Workouts (User's planned sessions)
create table public.scheduled_workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  workout_id uuid references public.workouts on delete cascade,
  scheduled_date date not null,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- ROW LEVEL SECURITY (RLS) policies
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.logs enable row level security;
alter table public.scheduled_workouts enable row level security;

-- Only users can see their own data
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can view their assigned programs" on public.programs for select using (auth.uid() = owner_id);
create policy "Users can view logs for their own exercises" on public.logs for all using (auth.uid() = user_id);
create policy "Users can manage their own schedule" on public.scheduled_workouts for all using (auth.uid() = user_id);

-- 7. Grant access to API roles
grant all on table public.scheduled_workouts to postgres, anon, authenticated, service_role;
