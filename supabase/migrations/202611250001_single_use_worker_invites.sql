-- Course contract: a worker invitation is usable once. Preserve audit counts
-- for older invitations; the join RPC already checks use_count < max_uses.
alter table public.project_worker_invites
  alter column max_uses set default 1;

update public.project_worker_invites
set max_uses = 1
where max_uses <> 1;

alter table public.project_worker_invites
  add constraint project_worker_invites_single_use check (max_uses = 1);
