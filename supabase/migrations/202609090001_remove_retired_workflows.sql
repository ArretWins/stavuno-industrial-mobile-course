-- Remove workflows retired from Stavuno while preserving diary and accounting records.

create or replace function public.confirm_day_closure(
  p_id text,
  p_project_id uuid,
  p_log_date date,
  p_supersedes_closure_id text default null,
  p_correction_reason text default null,
  p_acknowledged_warnings text[] default '{}',
  p_confirmed boolean default false
) returns public.day_closures
language plpgsql security definer set search_path=public,auth,extensions as $$
declare
  uid uuid:=auth.uid();
  latest public.day_closures;
  result public.day_closures;
  next_version integer;
  snapshot jsonb;
  allowed_warnings constant text[]:=array[
    'diary','workforce','weather','photos','receipts'
  ];
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_confirmed is not true then
    raise exception 'DAY_CLOSURE_CONFIRMATION_REQUIRED';
  end if;
  if not public.owns_project(p_project_id,uid) then
    raise exception 'PROJECT_ACCESS_DENIED';
  end if;
  if p_id is null or char_length(p_id) not between 3 and 160 then
    raise exception 'INVALID_DAY_CLOSURE_ID';
  end if;
  if p_log_date is null or p_log_date>current_date+1 then
    raise exception 'INVALID_DAY_CLOSURE_DATE';
  end if;
  if exists(
    select 1 from unnest(coalesce(p_acknowledged_warnings,'{}')) warning
    where not(warning=any(allowed_warnings))
  ) then raise exception 'INVALID_DAY_CLOSURE_WARNING'; end if;

  select item.* into result from public.day_closures item where item.id=p_id;
  if result.id is not null then
    if result.owner_id<>uid or result.project_id<>p_project_id
      or result.log_date<>p_log_date
    then raise exception 'DAY_CLOSURE_ID_CONFLICT'; end if;
    return result;
  end if;

  select item.* into latest from public.day_closures item
  where item.project_id=p_project_id and item.log_date=p_log_date
  order by item.version desc limit 1 for update;
  if latest.id is null then
    if p_supersedes_closure_id is not null or p_correction_reason is not null
    then raise exception 'INVALID_FIRST_DAY_CLOSURE'; end if;
    next_version:=1;
  else
    if p_supersedes_closure_id is distinct from latest.id
    then raise exception 'STALE_DAY_CLOSURE_VERSION'; end if;
    if p_correction_reason is null
      or char_length(trim(p_correction_reason)) not between 3 and 300
    then raise exception 'DAY_CLOSURE_CORRECTION_REASON_REQUIRED'; end if;
    next_version:=latest.version+1;
  end if;
  if not exists(
    select 1 from public.diary_entries entry
    where entry.project_id=p_project_id and entry.owner_id=uid
      and entry.log_date=p_log_date
  ) then raise exception 'DAY_CLOSURE_DIARY_REQUIRED'; end if;

  snapshot:=jsonb_build_object(
    'schemaVersion',3,'projectId',p_project_id,'logDate',p_log_date,
    'diaryEntries',coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id',entry.id,'workDescription',trim(entry.work_description),
        'workerCount',entry.worker_count,
        'workStartTime',case when entry.work_start_time is null then null
          else to_char(entry.work_start_time,'HH24:MI') end,
        'workEndTime',case when entry.work_end_time is null then null
          else to_char(entry.work_end_time,'HH24:MI') end,
        'workforceRoles',entry.workforce_json,
        'technicalRecords',entry.technical_records_json,
        'note',nullif(trim(entry.note),''),
        'correctionOfId',entry.correction_of_id,
        'correctionReason',entry.correction_reason,
        'capturedAt',entry.evidence_json->>'capturedAt',
        'attachmentIds',coalesce(entry.evidence_json->'attachmentIds','[]'::jsonb),
        'weatherCapturedAt',entry.evidence_json->'weather'->>'capturedAt',
        'createdAt',entry.created_at,'updatedAt',entry.updated_at
      )) order by entry.created_at,entry.id)
      from public.diary_entries entry
      where entry.project_id=p_project_id and entry.owner_id=uid
        and entry.log_date=p_log_date
    ),'[]'::jsonb),
    'workerCheckinIds',coalesce((select jsonb_agg(item.id order by item.id)
      from public.worker_checkins item where item.project_id=p_project_id
        and item.checked_in_at::date=p_log_date),'[]'::jsonb),
    'attachmentIds',coalesce((select jsonb_agg(item.id order by item.id)
      from public.attachments item where item.project_id=p_project_id
        and item.owner_id=uid and item.created_at::date=p_log_date),'[]'::jsonb),
    'incompleteReceiptIds',coalesce((select jsonb_agg(item.id order by item.id)
      from public.receipts item where item.project_id=p_project_id
        and item.owner_id=uid and item.status<>'ready'
        and item.created_at::date=p_log_date),'[]'::jsonb)
  );

  insert into public.day_closures(
    id,owner_id,project_id,log_date,version,supersedes_closure_id,
    correction_reason,snapshot_json,content_hash,confirmation_version,
    acknowledged_warnings,confirmed_at,confirmed_by
  ) values(
    p_id,uid,p_project_id,p_log_date,next_version,latest.id,
    nullif(trim(p_correction_reason),''),snapshot,
    encode(digest(convert_to(snapshot::text,'UTF8'),'sha256'),'hex'),
    'sk-v1',coalesce(p_acknowledged_warnings,'{}'),now(),uid
  ) returning * into result;
  update public.diary_entries
    set locked_at=coalesce(locked_at,result.confirmed_at),
      locked_by=coalesce(locked_by,uid)
    where project_id=p_project_id and owner_id=uid and log_date=p_log_date
      and locked_at is null;
  return result;
end;
$$;

drop function if exists public.save_project_rfi(
  text,uuid,text,text,text,date,text,integer,double precision,double precision
);
drop function if exists public.validate_rfi_plan_pin(
  uuid,uuid,text,integer,double precision,double precision
);
drop index if exists public.project_rfis_plan_pin_idx;
alter table public.project_rfis
  drop column if exists plan_id,
  drop column if exists page_number,
  drop column if exists x_ratio,
  drop column if exists y_ratio;

create or replace function public.save_project_rfi(
  p_id text,
  p_project_id uuid,
  p_subject text,
  p_question text,
  p_recipient_name text,
  p_due_date date default null
) returns public.project_rfis
language plpgsql security definer set search_path=public,auth as $$
declare
  uid uuid:=auth.uid();
  existing public.project_rfis%rowtype;
  result public.project_rfis%rowtype;
  next_number integer;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.owns_project(p_project_id,uid) then
    raise exception 'PROJECT_ACCESS_DENIED';
  end if;
  if nullif(trim(p_id),'') is null
    or char_length(trim(p_subject)) not between 3 and 160
    or char_length(trim(p_question)) not between 10 and 4000
    or char_length(trim(p_recipient_name)) not between 2 and 160
    or (p_due_date is not null and p_due_date<current_date)
  then raise exception 'INVALID_PROJECT_RFI'; end if;

  select * into existing from public.project_rfis where id=p_id for update;
  if existing.id is not null and (
    existing.owner_id<>uid or existing.project_id<>p_project_id
  ) then raise exception 'PROJECT_RFI_SCOPE'; end if;
  if existing.id is not null and existing.status<>'draft' then
    raise exception 'OPEN_PROJECT_RFI_IMMUTABLE';
  end if;

  perform set_config('app.project_rfi_rpc','1',true);
  if existing.id is null then
    perform pg_advisory_xact_lock(hashtext(p_project_id::text||':rfi'));
    select coalesce(max(rfi_number),0)+1 into next_number
      from public.project_rfis where project_id=p_project_id;
    insert into public.project_rfis(
      id,owner_id,project_id,rfi_number,subject,question,recipient_name,due_date
    ) values(
      p_id,uid,p_project_id,next_number,trim(p_subject),trim(p_question),
      trim(p_recipient_name),p_due_date
    ) returning * into result;
    insert into public.project_rfi_events(
      owner_id,project_id,rfi_id,event_type,actor_user_id
    ) values(uid,p_project_id,p_id,'created',uid);
  else
    update public.project_rfis set
      subject=trim(p_subject),question=trim(p_question),
      recipient_name=trim(p_recipient_name),due_date=p_due_date,updated_at=now()
    where id=p_id returning * into result;
    insert into public.project_rfi_events(
      owner_id,project_id,rfi_id,event_type,actor_user_id
    ) values(uid,p_project_id,p_id,'updated',uid);
  end if;
  return result;
end;
$$;
revoke execute on function public.save_project_rfi(
  text,uuid,text,text,text,date
) from public,anon;
grant execute on function public.save_project_rfi(
  text,uuid,text,text,text,date
) to authenticated;

delete from public.notifications where notification_type in(
  'site_task','task_review','task_assignment','task_comment',
  'client_decision','change_order_decision'
);
alter table public.notifications drop constraint if exists notifications_notification_type_check;
alter table public.notifications add constraint notifications_notification_type_check
  check(notification_type in(
    'worker_join','material_request','request_status','supplier_quote',
    'site_incident','material_delivery','material_stock','diary_approval'
  ));

delete from public.attachments where related_entity_type='site_task';
alter table public.attachments drop constraint if exists attachments_related_entity_type_check;
alter table public.attachments add constraint attachments_related_entity_type_check
  check(related_entity_type in(
    'diary_entry','delay_event','worker_checkin','attachment',
    'weather_snapshot','project_rfi','worker_credential','site_incident',
    'material_delivery'
  ));

delete from public.report_exports
where report_type::text in('weekly','tool_inventory','evidence_pack');

drop table if exists public.task_tool_requirements cascade;
drop table if exists public.task_material_requirements cascade;
drop table if exists public.client_task_decisions cascade;
drop table if exists public.site_task_events cascade;
drop table if exists public.project_checklists cascade;
drop table if exists public.change_order_events cascade;
drop table if exists public.change_orders cascade;
drop table if exists public.weekly_reports cascade;
drop table if exists public.daily_control_actions cascade;
drop table if exists public.project_tool_events cascade;
drop table if exists public.project_tools cascade;
drop table if exists public.project_budgets cascade;
drop table if exists public.project_schedules cascade;
drop table if exists public.project_share_links cascade;
drop table if exists public.site_tasks cascade;
drop table if exists public.project_plans cascade;

do $$
declare signature text;
begin
  for signature in
    select p.oid::regprocedure::text
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'export_my_data%'
  loop
    execute 'drop function if exists '||signature||' cascade';
  end loop;
end;
$$;

create function public.export_owned_rows(
  p_table regclass,p_column text,p_user uuid
) returns jsonb language plpgsql stable security definer
set search_path=public,auth as $$
declare result jsonb;
begin
  execute format(
    'select coalesce(jsonb_agg(to_jsonb(item)),''[]''::jsonb) from %s item where %I=$1',
    p_table,p_column
  ) into result using p_user;
  return result;
end;
$$;
revoke execute on function public.export_owned_rows(regclass,text,uuid)
  from public,anon,authenticated;

create function public.export_my_data() returns jsonb
language sql stable security definer set search_path=public,auth as $$
  select case when auth.uid() is null then null else jsonb_build_object(
    'schemaVersion',31,
    'profile',(select to_jsonb(x) from public.profiles x where x.id=auth.uid()),
    'projects',public.export_owned_rows('public.projects','owner_id',auth.uid()),
    'diaryEntries',public.export_owned_rows('public.diary_entries','owner_id',auth.uid()),
    'dayClosures',public.export_owned_rows('public.day_closures','owner_id',auth.uid()),
    'diaryApprovalRequests',public.export_owned_rows('public.diary_approval_requests','owner_id',auth.uid()),
    'diaryApprovalEvents',public.export_owned_rows('public.diary_approval_events','owner_id',auth.uid()),
    'delayEvents',public.export_owned_rows('public.delay_events','owner_id',auth.uid()),
    'weatherSnapshots',public.export_owned_rows('public.weather_snapshots','owner_id',auth.uid()),
    'attachments',public.export_owned_rows('public.attachments','owner_id',auth.uid()),
    'reports',public.export_owned_rows('public.report_exports','owner_id',auth.uid()),
    'receiptCategories',public.export_owned_rows('public.expense_categories','owner_id',auth.uid()),
    'receipts',public.export_owned_rows('public.receipts','owner_id',auth.uid()),
    'receiptFiles',public.export_owned_rows('public.receipt_files','owner_id',auth.uid()),
    'receiptExports',public.export_owned_rows('public.receipt_export_batches','owner_id',auth.uid()),
    'receiptExportItems',public.export_owned_rows('public.receipt_export_items','owner_id',auth.uid()),
    'workers',public.export_owned_rows('public.project_workers','owner_id',auth.uid()),
    'workerCredentials',public.export_owned_rows('public.worker_credentials','owner_id',auth.uid()),
    'workerCredentialEvents',public.export_owned_rows('public.worker_credential_events','owner_id',auth.uid()),
    'materialRequests',public.export_owned_rows('public.material_requests','owner_id',auth.uid()),
    'materialRequestItems',coalesce((select jsonb_agg(to_jsonb(item))
      from public.material_request_items item join public.material_requests request
        on request.id=item.request_id where request.owner_id=auth.uid()),'[]'::jsonb),
    'receiptRequestLinks',public.export_owned_rows('public.receipt_request_links','owner_id',auth.uid()),
    'materialSupplierQuotes',public.export_owned_rows('public.material_supplier_quotes','owner_id',auth.uid()),
    'materialSupplierQuoteDecisions',public.export_owned_rows('public.material_supplier_quote_decisions','owner_id',auth.uid()),
    'materialSupplierQuoteInvites',public.export_owned_rows('public.material_supplier_quote_invites','owner_id',auth.uid()),
    'materialSupplierQuoteSubmissions',public.export_owned_rows('public.material_supplier_quote_submissions','owner_id',auth.uid()),
    'materialDeliveries',public.export_owned_rows('public.material_deliveries','owner_id',auth.uid()),
    'materialDeliveryLines',public.export_owned_rows('public.material_delivery_lines','owner_id',auth.uid()),
    'materialDeliveryEvents',public.export_owned_rows('public.material_delivery_events','owner_id',auth.uid()),
    'materialStockMovements',public.export_owned_rows('public.material_stock_movements','owner_id',auth.uid()),
    'materialStockMovementEvents',public.export_owned_rows('public.material_stock_movement_events','owner_id',auth.uid()),
    'projectRfis',public.export_owned_rows('public.project_rfis','owner_id',auth.uid()),
    'projectRfiEvents',public.export_owned_rows('public.project_rfi_events','owner_id',auth.uid()),
    'workShifts',public.export_owned_rows('public.work_shifts','owner_id',auth.uid()),
    'workShiftEvents',public.export_owned_rows('public.work_shift_events','owner_id',auth.uid()),
    'safetyBriefings',public.export_owned_rows('public.safety_briefings','owner_id',auth.uid()),
    'safetyBriefingRecipients',public.export_owned_rows('public.safety_briefing_recipients','owner_id',auth.uid()),
    'safetyBriefingEvents',public.export_owned_rows('public.safety_briefing_events','owner_id',auth.uid()),
    'siteIncidents',public.export_owned_rows('public.site_incidents','owner_id',auth.uid()),
    'siteIncidentEvents',public.export_owned_rows('public.site_incident_events','owner_id',auth.uid()),
    'notifications',public.export_owned_rows('public.notifications','recipient_user_id',auth.uid()),
    'analyticsPreferences',public.export_owned_rows('public.analytics_preferences','user_id',auth.uid()),
    'analyticsEvents',public.export_owned_rows('public.analytics_events','user_id',auth.uid()),
    'clientErrorEvents',public.export_owned_rows('public.client_error_events','user_id',auth.uid()),
    'syncRuns',public.export_owned_rows('public.sync_runs','user_id',auth.uid()),
    'supportReports',public.export_owned_rows('public.support_reports','user_id',auth.uid()),
    'subscriptionPlan',public.export_owned_rows('public.subscription_plans','user_id',auth.uid()),
    'featureUsage',public.export_owned_rows('public.feature_usage_monthly','user_id',auth.uid()),
    'pushSubscriptions',public.export_owned_rows('public.push_subscriptions','auth_user_id',auth.uid()),
    'workerCheckins',coalesce((select jsonb_agg(to_jsonb(item))
      from public.worker_checkins item join public.projects project
        on project.id=item.project_id where project.owner_id=auth.uid()),'[]'::jsonb),
    'auditEvents',public.export_owned_rows('public.audit_events','actor_id',auth.uid())
  ) end
$$;
revoke execute on function public.export_my_data() from public,anon;
grant execute on function public.export_my_data() to authenticated;
