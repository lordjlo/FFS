# 📜 Project Constitution: FFS Kate

## 🎯 North Star
To provide a premium online space for FFS Kate clients to access their personalized fitness programs, record workout results (reps, weights), and ensure correct form via exercise videos. (Confirmed by user)

## 🛠️ Technology Stack (Updated)
*   **Framework**: Next.js (App Router)
*   **Backend/Database**: **Supabase** (PostgreSQL + RLS)
*   **Authentication**: Supabase Auth (Magic Links, Google)
*   **hosting**: Vercel
*   **Videos**: Private YouTube Channel (Embedded)
*   **Payments**: Stripe
*   **Integrations**: Google Sheets API (Import Tool)

## 📊 Data Schema (Relational - Supabase)

### users (Table)
```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  display_name text,
  email text,
  active_program_id uuid,
  primary key (id)
);
```

### programs (Table)
```sql
create table programs (
  id uuid default uuid_generate_v4() primary key,
  title text,
  owner_id uuid references auth.users
);
```

### workouts (Table)
```sql
create table workouts (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references programs,
  day_name text,
  week_number int,
  order_index int
);
```

### exercises (Table)
```sql
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references workouts,
  name text,
  suggested_sets int,
  suggested_reps text,
  suggested_weight text,
  video_id text, -- YouTube Video ID
  instructions text
);
```

### logs (Table)
```sql
create table logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  exercise_id uuid references exercises,
  reps int,
  weight text,
  timestamp timestamp with time zone default now()
);
```

## 🏗️ Architectural Invariants
*   **Privacy**: Row Level Security (RLS) enabled on all tables. Users can only see their own logs and assigned programs.
*   **Suggested Logic**: "Suggested Weight" should default to the `suggested_weight` from the exercise table UNLESS a previous log exists for that user+exercise, in which case it uses the last logged weight.
*   **Import**: Tooling to sync Google Sheets (Programmes) -> Supabase.

## 📝 Behavioral Rules (Updated)
*   **Input**: Support simple type-in or future "voice-to-log" intent.
*   **Aesthetics**: Functional simplicity first, premium graphics via Stitch/Dribbble inspiration later.

## 🏗️ Architectural Invariants
*   Separation of concerns: Logic in `tools/` (if automation needed), UI in `src/`.
*   Mobile-first responsive design.
*   User data privacy (secure login areas).

## 📝 Behavioral Rules
*   Premium aesthetics: Smooth gradients, micro-animations, modern typography (Inter).
*   Deterministic logic for workout tracking.
