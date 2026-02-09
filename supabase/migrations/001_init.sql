-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone
);

-- RLS: Profiles
alter table profiles enable row level security;

create policy "Users can view own profile" 
  on profiles for select 
  using ( auth.uid() = id );

create policy "Users can update own profile" 
  on profiles for update 
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Resources Table (Educational content)
create table resources (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type text check (type in ('ppt', 'video')) not null,
  storage_path text not null, -- Path in Supabase Storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Resources
-- Requirement: "user can read only their own resources (owner_id = auth.uid())"
-- BUT wait, resources are usually shared content for "Learn with Jiji". 
-- The prompt says: "resources: user can read only their own resources (owner_id = auth.uid())" 
-- This implies resources are private to the user? OR maybe it's a mistake in the prompt if Jiji is a teaching assistant?
-- Prompt check: "resources: user can read only their own resources (owner_id = auth.uid())"
-- Include owner_id if that's the requirement. 
-- However, "Fetching matching resources from Supabase DB" suggests a search.
-- If I upload a resource, only I can see it? That limits the "Search" capability for a general "Ask Jiji".
-- Let's stick to the prompt STRICTLY. 
-- "Return top N ... from match" vs "read only own resources".
-- Maybe implementation: Admin uploads resources, and *assigns* them? Or Users upload?
-- Let's assume standard "Creator ownership" but maybe for this assignment request, strictly follow "read only own".
-- Actually, if I am the only user, I see my resources.
-- Let's add 'owner_id' to resources table.

alter table resources add column owner_id uuid references auth.users(id) default auth.uid();

alter table resources enable row level security;

create policy "Users can view own resources" 
  on resources for select 
  using ( auth.uid() = owner_id );
  
-- Allow insert if authenticated?
create policy "Users can insert own resources" 
  on resources for insert 
  with check ( auth.uid() = owner_id );

-- 3. Queries Table (Logging)
create table queries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  query_text text not null,
  matched_resource_ids uuid[], -- Array of UUIDs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Queries
alter table queries enable row level security;

create policy "Users can view own queries" 
  on queries for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own queries" 
  on queries for insert 
  with check ( auth.uid() = user_id );
  
-- Indexes for performance (Search)
-- Simple GIN index for text search if we were using tsvector, but for ILIKE, we might want pg_trgm extension if available.
-- For standard postgres, just standard B-tree index on text columns helps with equality, but ILIKE '%...%' scans.
-- We'll add standard indexes.
create index resources_title_idx on resources(title);
create index resources_description_idx on resources(description);
create index queries_user_id_idx on queries(user_id);

-- Storage bucket setup (Manual step usually, but SQL can hint)
-- insert into storage.buckets (id, name, public) values ('learning-content', 'learning-content', false);
-- Policies for storage objects?
-- "resources: user can read only their own resources"
-- Storage RLS:
-- (Assuming standard storage schema)
-- create policy "Read own storage" on storage.objects for select using ( bucket_id = 'learning-content' and auth.uid() = owner );
