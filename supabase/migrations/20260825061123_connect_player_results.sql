-- Build n' Stack player data and public leaderboard.
-- Private contact fields stay in build_n_stack_player_results. The browser
-- may insert a completed run, but anonymous users cannot read the table.

create schema if not exists private;

create table public.build_n_stack_player_results (
    id uuid primary key default gen_random_uuid(),
    run_id uuid not null unique,
    leaderboard_id uuid not null,
    player_name text not null check (char_length(btrim(player_name)) between 2 and 60),
    contact_number text not null check (char_length(btrim(contact_number)) between 7 and 24),
    email text not null check (
        char_length(btrim(email)) between 5 and 120
        and email = lower(btrim(email))
        and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
    score integer not null check (score between 0 and 100000),
    duration_ms integer not null check (duration_ms between 0 and 86400000),
    consent_version text not null check (char_length(btrim(consent_version)) between 1 and 50),
    consent_at timestamptz not null,
    completed_at timestamptz not null,
    created_at timestamptz not null default now()
);

create table public.build_n_stack_leaderboard (
    id uuid primary key,
    player_name text not null,
    score integer not null,
    completed_at timestamptz not null,
    updated_at timestamptz not null default now()
);

create table public.build_n_stack_admins (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

create index build_n_stack_results_email_idx
    on public.build_n_stack_player_results ((lower(email)));
create index build_n_stack_results_score_idx
    on public.build_n_stack_player_results (score desc, completed_at asc);
create index build_n_stack_results_leaderboard_id_idx
    on public.build_n_stack_player_results (leaderboard_id);
create index build_n_stack_leaderboard_score_idx
    on public.build_n_stack_leaderboard (score desc, completed_at asc);

create function private.assign_build_n_stack_leaderboard_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    select result.leaderboard_id
      into new.leaderboard_id
      from public.build_n_stack_player_results as result
     where lower(result.email) = lower(new.email)
     order by result.created_at asc
     limit 1;

    new.leaderboard_id := coalesce(new.leaderboard_id, gen_random_uuid());
    new.player_name := btrim(new.player_name);
    new.contact_number := btrim(new.contact_number);
    new.email := lower(btrim(new.email));
    new.consent_version := btrim(new.consent_version);
    return new;
end;
$$;

create function private.sync_build_n_stack_leaderboard_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.build_n_stack_leaderboard (
        id,
        player_name,
        score,
        completed_at,
        updated_at
    )
    values (
        new.leaderboard_id,
        new.player_name,
        new.score,
        new.completed_at,
        now()
    )
    on conflict (id) do update
       set player_name = excluded.player_name,
           score = excluded.score,
           completed_at = excluded.completed_at,
           updated_at = now()
     where excluded.score > public.build_n_stack_leaderboard.score
        or (
            excluded.score = public.build_n_stack_leaderboard.score
            and excluded.completed_at < public.build_n_stack_leaderboard.completed_at
        );
    return new;
end;
$$;

create function private.sync_build_n_stack_leaderboard_after_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    replacement public.build_n_stack_player_results%rowtype;
begin
    select result.*
      into replacement
      from public.build_n_stack_player_results as result
     where result.leaderboard_id = old.leaderboard_id
     order by result.score desc, result.completed_at asc
     limit 1;

    if found then
        update public.build_n_stack_leaderboard
           set player_name = replacement.player_name,
               score = replacement.score,
               completed_at = replacement.completed_at,
               updated_at = now()
         where id = old.leaderboard_id;
    else
        delete from public.build_n_stack_leaderboard
         where id = old.leaderboard_id;
    end if;
    return old;
end;
$$;

create trigger assign_build_n_stack_leaderboard_id_before_insert
before insert on public.build_n_stack_player_results
for each row execute function private.assign_build_n_stack_leaderboard_id();

create trigger sync_build_n_stack_leaderboard_after_insert
after insert on public.build_n_stack_player_results
for each row execute function private.sync_build_n_stack_leaderboard_after_insert();

create trigger sync_build_n_stack_leaderboard_after_delete
after delete on public.build_n_stack_player_results
for each row execute function private.sync_build_n_stack_leaderboard_after_delete();

alter table public.build_n_stack_player_results enable row level security;
alter table public.build_n_stack_leaderboard enable row level security;
alter table public.build_n_stack_admins enable row level security;

create policy "Anonymous players can submit valid runs"
on public.build_n_stack_player_results
for insert
to anon, authenticated
with check (
    consent_at <= completed_at
    and consent_at >= completed_at - interval '24 hours'
    and completed_at >= now() - interval '30 days'
    and completed_at <= now() + interval '5 minutes'
);

create policy "Admins can read player results"
on public.build_n_stack_player_results
for select
to authenticated
using (
    exists (
        select 1
          from public.build_n_stack_admins as admin
         where admin.user_id = (select auth.uid())
    )
);

create policy "Admins can delete player results"
on public.build_n_stack_player_results
for delete
to authenticated
using (
    exists (
        select 1
          from public.build_n_stack_admins as admin
         where admin.user_id = (select auth.uid())
    )
);

create policy "Public leaderboard is readable"
on public.build_n_stack_leaderboard
for select
to anon, authenticated
using (true);

create policy "Admins can verify their own access"
on public.build_n_stack_admins
for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.build_n_stack_player_results from anon, authenticated;
revoke all on table public.build_n_stack_leaderboard from anon, authenticated;
revoke all on table public.build_n_stack_admins from anon, authenticated;

grant insert (
    run_id,
    player_name,
    contact_number,
    email,
    score,
    duration_ms,
    consent_version,
    consent_at,
    completed_at
) on public.build_n_stack_player_results to anon, authenticated;
grant select, delete on public.build_n_stack_player_results to authenticated;
grant select (player_name, score, completed_at)
    on public.build_n_stack_leaderboard to anon, authenticated;
grant select (user_id) on public.build_n_stack_admins to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
revoke all on schema private from public, anon, authenticated;

comment on table public.build_n_stack_player_results is
    'Private Build n Stack promotion submissions. Contact fields are never exposed to anonymous readers.';
comment on table public.build_n_stack_leaderboard is
    'Public best score per normalized player email. Only name, score and completion time are granted to browser roles.';
comment on table public.build_n_stack_admins is
    'Allow-list of Supabase Auth users permitted to read and delete private Build n Stack results.';
