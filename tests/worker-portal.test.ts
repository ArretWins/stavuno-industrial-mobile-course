import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("passwordless worker portal contract", () => {
  const source = readFileSync(
    "supabase/functions/worker-portal/index.ts",
    "utf8",
  );
  const staticSource = readFileSync("worker-portal/src/app.js", "utf8");
  const landing = readFileSync("worker-portal/src/download.html", "utf8");
  const landingScript = readFileSync("worker-portal/src/download.js", "utf8");
  const migration = readFileSync(
    "supabase/migrations/202607140001_receipts_workers_materials.sql",
    "utf8",
  );
  it("uses an anonymous persistent browser session and pending approval", () => {
    expect(staticSource).toContain("signInAnonymously");
    expect(staticSource).toContain('rpc("join_project_as_worker"');
    expect(staticSource).toContain('worker.status === "pending"');
    expect(migration).toContain("now() + interval '15 minutes'");
    expect(migration).toContain(
      "status in ('pending', 'active', 'rejected', 'revoked')",
    );
  });
  it("redirects old QR links to the independently hosted static portal", () => {
    expect(source).toMatch(
      /Deno\.env\.get\(["']WORKER_PORTAL_PUBLIC_URL["']\)/,
    );
    expect(source).toMatch(
      /destination\.searchParams\.set\(["']token["'],\s*token\)/,
    );
    expect(staticSource).toContain("signInAnonymously");
  });
  it("serves a public product page with a manifest-driven current APK", () => {
    const proxy = readFileSync("worker-portal/src/_worker.js", "utf8");
    expect(landing).toContain("Pre tím, ktorý riadi stavbu priamo v teréne");
    expect(landing).toContain("Stavuno");
    expect(landing).toContain("Stavba pod kontrolou.");
    expect(landing).toContain("id=\"download-button\"");
    expect(landing).toContain('class="project-board"');
    expect(landing).not.toContain('class="phone"');
    expect(landing).toContain("app-version.json");
    expect(landingScript).toContain('manifest.androidUrls?.["arm64-v8a"]');
    expect(landingScript).toContain('cache: "no-store"');
    expect(landing).toContain('data-lang="uk"');
    expect(landing).toContain('data-lang="ru"');
    expect(landingScript).toContain('locale: "uk-UA"');
    expect(landingScript).toContain('locale: "ru-RU"');
    expect(landingScript).toContain("stavba-site-language");
    const translationKeys = [
      ...landing.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g),
    ].map((match) => match[1]);
    for (const key of new Set(translationKeys)) {
      expect(landingScript.match(new RegExp(`\\b${key}:`, "g"))?.length).toBe(3);
    }
    expect(proxy).toContain("!url.searchParams.has('token')");
    expect(proxy).toContain("'/download'");
    expect(proxy).toContain("url.pathname === '/worker'");
    expect(proxy).toContain("'/worker/'");
    expect(proxy).toContain("env.SUPPLIER_QUOTE_URL");
    expect(proxy).not.toContain("const upstreamSupplierQuoteUrl");
  });
  it("creates material requests transactionally and only lists the current worker requests", () => {
    expect(staticSource).toContain('rpc("create_material_request"');
    expect(staticSource).toContain('.eq("worker_id", worker.id)');
    expect(migration).toContain("create_material_request");
    expect(migration).toContain("WORKER_ACCESS_DENIED");
    expect(migration).toContain("INVALID_MATERIAL_STATUS_TRANSITION");
  });
  it("lets only the approved worker start and end an attributable shift", () => {
    const shifts = readFileSync(
      "supabase/migrations/202608010005_work_shifts.sql",
      "utf8",
    );
    expect(staticSource).toContain('rpc("start_my_work_shift"');
    expect(staticSource).toContain('rpc("end_my_work_shift"');
    expect(staticSource).toContain('.eq("worker_id", worker.id)');
    expect(shifts).toContain("auth_user_id=uid and status='active'");
    expect(shifts).toContain("work_shifts_one_active_worker_idx");
    expect(shifts).toContain("WORK_SHIFT_EVENT_IMMUTABLE");
    expect(shifts).toContain("approve_work_shift");
    expect(shifts).toContain("reopen_work_shift");
  });
  it("requires an explicit personal confirmation for each published safety briefing", () => {
    const safety = readFileSync(
      "supabase/migrations/202608010006_safety_briefings.sql",
      "utf8",
    );
    expect(staticSource).toContain('.from("safety_briefing_recipients")');
    expect(staticSource).toContain('.eq("worker_id", worker.id)');
    expect(staticSource).toContain('rpc("acknowledge_my_safety_briefing"');
    expect(staticSource).toContain("p_confirmed: true");
    expect(safety).toContain("worker.auth_user_id=uid");
    expect(safety).toContain("briefing.content_hash=recipient.content_hash");
    expect(safety).toContain("SAFETY_BRIEFING_ACK_CONFIRMATION_REQUIRED");
  });
  it("shows only the current worker's qualification records", () => {
    const credentials = readFileSync(
      "supabase/migrations/202608010007_worker_credentials.sql",
      "utf8",
    );
    expect(staticSource).toContain('.from("worker_credentials")');
    expect(staticSource).toContain('.eq("worker_id", worker.id)');
    expect(staticSource).toContain("credentialHealth(item)");
    expect(credentials).toContain("worker_credentials_participant_select");
    expect(credentials).toContain("worker.auth_user_id=auth.uid()");
  });
  it("lets a worker report a confirmed incident and only lists their own reports", () => {
    const incidents = readFileSync(
      "supabase/migrations/202608080001_site_incidents.sql",
      "utf8",
    );
    expect(staticSource).toContain('rpc("report_my_site_incident"');
    expect(staticSource).toContain("p_confirmed: true");
    expect(staticSource).toContain('.from("site_incidents")');
    expect(staticSource).toContain('.eq("reporter_worker_id", worker.id)');
    expect(staticSource).toContain("window.confirm");
    expect(incidents).toContain("SITE_INCIDENT_REPORT_CONFIRMATION_REQUIRED");
  });
  it("lets a worker reconcile only their approved request delivery", () => {
    const deliveries = readFileSync(
      "supabase/migrations/202608080002_material_deliveries.sql",
      "utf8",
    );
    expect(staticSource).toContain('rpc("report_my_material_delivery"');
    expect(staticSource).toContain("p_confirmed: true");
    expect(staticSource).toContain('.from("material_deliveries")');
    expect(staticSource).toContain('.eq("receiver_worker_id", worker.id)');
    expect(staticSource).toContain("renderDeliveryLines");
    expect(deliveries).toContain("and worker_id=worker.id");
    expect(deliveries).toContain("DELIVERY_DECISION_MISMATCH");
  });
  it("lets a worker report only received material from their own request", () => {
    const stock = readFileSync(
      "supabase/migrations/202608080003_material_stock.sql",
      "utf8",
    );
    expect(staticSource).toContain('rpc("my_material_stock_options"');
    expect(staticSource).toContain('rpc("report_my_material_stock_movement"');
    expect(staticSource).toContain('.from("material_stock_movements")');
    expect(staticSource).toContain('.eq("worker_id", worker.id)');
    expect(staticSource).toContain("p_confirmed: true");
    expect(stock).toContain("p_movement_type not in('usage','waste','return')");
    expect(stock).toContain("MATERIAL_STOCK_CONFIRMATION_REQUIRED");
    expect(stock).toContain("status='reported'");
  });
  it("asks explicitly before registering standards-based web push", () => {
    expect(staticSource).toContain("Notification.requestPermission");
    expect(staticSource).toContain('navigator.serviceWorker.register("/sw.js")');
    expect(staticSource).toContain('channel: "web"');
  });
  it("refreshes manager workforce independently and polls for pending joins", () => {
    const appState = readFileSync("src/state/app.tsx", "utf8");
    const manager = readFileSync("src/screens/WorkforceScreen.tsx", "utf8");
    expect(appState).toContain("const refreshWorkforce = useCallback");
    expect(appState).toContain(
      "const workforce = await listProjectWorkforce(projectId)",
    );
    expect(manager).toContain("setInterval");
    expect(manager).toContain("5_000");
    expect(manager).toContain("http://localhost:8788");
    expect(manager).toContain("/worker/?token=");
  });
  it("proxies private supplier RFQ pages without exposing service credentials", () => {
    const proxy = readFileSync("worker-portal/src/_worker.js", "utf8");
    const rfq = readFileSync(
      "supabase/functions/supplier-quote/index.ts",
      "utf8",
    );
    const config = readFileSync("supabase/config.toml", "utf8");
    expect(proxy).toContain("/supplier-quote");
    expect(proxy).toContain("env.SUPPLIER_QUOTE_URL");
    expect(proxy).toContain("proxyPrivatePage");
    expect(rfq).toContain("resolve_material_supplier_quote_invite");
    expect(rfq).toContain("submit_material_supplier_quote");
    expect(rfq).toContain("escapeHtml");
    expect(rfq).toContain('name="website"');
    expect(rfq).toContain('form.get("website")');
    expect(rfq).toContain("crypto.randomUUID()");
    expect(rfq).toContain("no-store");
    expect(config).toContain("[functions.supplier-quote]");
    expect(config).toContain("verify_jwt = false");
  });
});
