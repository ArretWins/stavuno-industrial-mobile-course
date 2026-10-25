import type { OutboxItem } from "./types";

export type SyncItemCategory =
  | "diary"
  | "photo"
  | "receipt"
  | "workforce"
  | "procurement"
  | "project";

export type SyncErrorKind =
  "offline" | "authentication" | "conflict" | "file" | "server";

export function syncItemCategory(type: OutboxItem["type"]): SyncItemCategory {
  if (
    ["diary_entry", "day_closure", "delay_event", "weather_snapshot"].includes(
      type,
    )
  )
    return "diary";
  if (type === "attachment") return "photo";
  if (
    [
      "receipt_category",
      "receipt",
      "receipt_file",
      "receipt_ocr",
      "receipt_export",
    ].includes(type)
  )
    return "receipt";
  if (
    ["worker_checkin", "material_request"].includes(type) ||
    type.startsWith("work_shift") ||
    type.startsWith("worker_credential")
  )
    return "workforce";
  if (
    [
      "material_supplier_quote",
      "material_quote_selection",
      "material_quote_withdrawal",
    ].includes(type) ||
    type.startsWith("material_delivery") ||
    type.startsWith("material_stock")
  )
    return "procurement";
  if (type.startsWith("project_rfi")) return "project";
  if (
    type.startsWith("safety_briefing") ||
    type.startsWith("site_incident")
  )
    return "workforce";
  return "project";
}

export function syncErrorKind(error?: string): SyncErrorKind {
  const value = (error ?? "").toLowerCase();
  if (/file|upload|storage|uri|image|document|bucket|_read_failed/.test(value))
    return "file";
  if (/network|fetch|offline|internet|timeout|timed out/.test(value))
    return "offline";
  if (/auth|jwt|session|permission|unauthorized|forbidden/.test(value))
    return "authentication";
  if (/conflict|locked|immutable|already|duplicate/.test(value))
    return "conflict";
  return "server";
}

export function activeSyncItems(items: OutboxItem[]): OutboxItem[] {
  const priority = { failed: 0, syncing: 1, pending: 2, synced: 3 } as const;
  return items
    .filter((item) => item.status !== "synced")
    .sort(
      (a, b) =>
        priority[a.status] - priority[b.status] ||
        a.createdAt.localeCompare(b.createdAt),
    );
}
