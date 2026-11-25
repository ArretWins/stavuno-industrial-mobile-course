import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { expect, it } from "vitest";

const [owner, otherOwner, workerA, workerB, project] = [1, 2, 3, 4, 5].map(
  (n) => `00000000-0000-4000-8000-00000000000${n}`,
);

it("runs the MVP migrations and enforces QR lifecycle and project/worker isolation (AC-04, AC-13–17)", async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    // Emulate only the Supabase objects and default client grants needed here.
    await db.exec(`
      create role authenticated;
      create role anon;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      create schema storage;
      create table storage.buckets(id text primary key, name text, public boolean);
      create table storage.objects(bucket_id text, name text);
      alter table storage.objects enable row level security;
      create function storage.foldername(name text) returns text[]
        language sql immutable as $$ select string_to_array(name, '/') $$;
      grant usage on schema auth to authenticated;
    `);
    for (const migration of [
      "202607110001_initial_schema",
      "202607140001_receipts_workers_materials",
      "202607140003_pilot_plans_quotas_analytics",
      "202607160001_supabase_extension_search_path",
      "202611250001_single_use_worker_invites",
    ]) {
      await db.exec(readFileSync(`supabase/migrations/${migration}.sql`, "utf8"));
    }
    await db.exec("grant select, insert, update on all tables in schema public to authenticated");
    for (const id of [owner, otherOwner, workerA, workerB]) {
      await db.query("insert into auth.users(id) values ($1)", [id]);
    }
    const asUser = async (id: string) => {
      await db.exec("set role authenticated");
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    };
    await asUser(owner);
    await db.query("insert into projects(id, owner_id, name, location) values ($1,$2,'Test','Bratislava')", [project, owner]);
    await db.query("insert into receipts(id, owner_id, project_id) values ('receipt-a',$1,$2)", [owner, project]);
    await db.query("insert into receipt_export_batches(owner_id,project_id,date_from,date_to,version) values ($1,$2,'2026-11-01','2026-11-25',1)", [owner, project]);
    const invite = async () =>
      (await db.query<{ token: string }>("select create_worker_invite($1) as token", [project])).rows[0].token;
    const first = await invite();
    const second = await invite();
    const expired = await invite();
    await db.exec("reset role");
    await db.query("update project_worker_invites set expires_at=now()-interval '1 minute' where token_hash=encode(digest($1::text,'sha256'),'hex')", [expired]);

    await asUser(otherOwner);
    expect((await db.query("select id from projects")).rows).toEqual([]);
    await expect(invite()).rejects.toThrow("PROJECT_SCOPE");

    const join = async (token: string) =>
      (await db.query<{ id: string }>("select join_project_as_worker($1,'Eva','Test','Murár') as id", [token])).rows[0].id;
    const request = async (id: string) =>
      (await db.query<{ id: string }>(
        "select create_material_request($1,null,null,$2::jsonb) as id",
        [id, JSON.stringify([{ name: "Cement", quantity: 2, unit: "kg" }])],
      )).rows[0].id;

    await asUser(workerA);
    await expect(join(expired)).rejects.toThrow("INVALID_OR_EXPIRED_INVITE");
    const a = await join(first);
    expect((await db.query("select status from project_workers")).rows).toEqual([{ status: "pending" }]);
    await expect(request(a)).rejects.toThrow("WORKER_ACCESS_DENIED");
    await asUser(workerB);
    await expect(join(first)).rejects.toThrow("INVALID_OR_EXPIRED_INVITE");
    const b = await join(second);
    await asUser(owner);
    await db.query("update project_workers set status='active' where id in ($1,$2)", [a,b]);

    await asUser(workerA);
    const requestA = await request(a);
    await asUser(workerB);
    const requestB = await request(b);
    expect((await db.query("select id from material_requests")).rows).toEqual([{ id: requestB }]);
    await asUser(workerA);
    expect((await db.query("select id from material_requests")).rows).toEqual([{ id: requestA }]);
    expect((await db.query("select id from receipts")).rows).toEqual([]);
    expect((await db.query("select id from receipt_export_batches")).rows).toEqual([]);
    await asUser(owner);
    expect((await db.query("select id from material_requests")).rows).toHaveLength(2);
    expect((await db.query("select id from receipts")).rows).toHaveLength(1);
    expect((await db.query("select id from receipt_export_batches")).rows).toHaveLength(1);
  } finally {
    await db.close();
  }
}, 20_000);
