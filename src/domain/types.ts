export type ProjectStatus = "active" | "archived";
export type SyncStatus = "pending" | "syncing" | "synced" | "failed";
export type WeatherStatus = "captured" | "pending" | "saved" | "failed";
export type EntityType =
  | "diary_entry"
  | "delay_event"
  | "worker_checkin"
  | "attachment"
  | "weather_snapshot"
  | "receipt_category"
  | "receipt"
  | "receipt_file"
  | "receipt_ocr"
  | "receipt_export"
  | "material_request"
  | "project_rfi"
  | "worker_credential"
  | "site_incident"
  | "material_delivery"
  | "material_stock_movement";

export interface Profile {
  id: string;
  email?: string;
  fullName?: string;
  locale: "sk-SK";
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  address?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GpsEvidence {
  latitude: number;
  longitude: number;
  capturedAt: string;
  status: "captured" | "pending" | "failed";
}

export interface WeatherSnapshot {
  id?: string;
  provider: "open-meteo" | "manual";
  requestUrl: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  rawJson: Record<string, unknown>;
  temperatureC?: number;
  precipitationMm?: number;
  windSpeedKmh?: number;
  weatherCode?: number;
  manualDescription?: string;
  status: WeatherStatus;
}

export interface Attachment {
  id: string;
  ownerId: string;
  projectId: string;
  relatedEntityType: EntityType;
  relatedEntityId?: string;
  localUri: string;
  storagePath?: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploadStatus: SyncStatus;
  thumbnailPath?: string;
  evidenceRole?: "before" | "after" | "general";
  createdByWorkerId?: string;
  captureSource?: "camera" | "library" | "worker_portal";
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
  contentSha256?: string;
  integrityVersion?: "sha256-v1";
  sourceFileName?: string;
  sourceMetadata?: Record<string, string | number>;
}

export interface EvidenceBundle {
  gps?: GpsEvidence;
  weather?: WeatherSnapshot;
  capturedAt: string;
  attachmentIds: string[];
}

export type DiaryTechnicalCategory =
  | "site_inspection"
  | "authority_supervision"
  | "contractual_fact"
  | "material_delivery"
  | "product_certificate"
  | "equipment_use"
  | "work_interruption"
  | "adverse_condition"
  | "schedule_impact"
  | "site_find"
  | "foundation_acceptance"
  | "test_measurement"
  | "quality_fact"
  | "technical_inspection"
  | "safety_instruction"
  | "injury"
  | "project_deviation"
  | "waste_management"
  | "consent_other";

export interface DiaryWorkforceRole {
  role: string;
  count: number;
}

export interface DiaryTechnicalRecord {
  id: string;
  category: DiaryTechnicalCategory;
  description: string;
  reference?: string;
}

export interface DiaryEntry {
  id: string;
  ownerId: string;
  projectId: string;
  logDate: string;
  workDescription: string;
  workerCount: number;
  workStartTime?: string;
  workEndTime?: string;
  workforceRoles?: DiaryWorkforceRole[];
  technicalRecords?: DiaryTechnicalRecord[];
  note?: string;
  evidence: EvidenceBundle;
  lockedAt?: string;
  lockedBy?: string;
  correctionOfId?: string;
  correctionReason?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DayClosureSnapshot {
  schemaVersion: 1 | 2 | 3;
  projectId: string;
  logDate: string;
  diaryEntries: Array<{
    id: string;
    workDescription: string;
    workerCount: number;
    workStartTime?: string;
    workEndTime?: string;
    workforceRoles?: DiaryWorkforceRole[];
    technicalRecords?: DiaryTechnicalRecord[];
    note?: string;
    correctionOfId?: string;
    correctionReason?: string;
    capturedAt: string;
    attachmentIds: string[];
    weatherCapturedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  workerCheckinIds: string[];
  attachmentIds: string[];
  incompleteReceiptIds: string[];
}

export interface DayClosureRecord {
  id: string;
  ownerId: string;
  projectId: string;
  logDate: string;
  version: number;
  supersedesClosureId?: string;
  correctionReason?: string;
  snapshot: DayClosureSnapshot;
  contentHash: string;
  confirmationVersion: "sk-v1";
  acknowledgedWarnings: DayClosureCheck[];
  confirmedAt: string;
  confirmedBy: string;
  syncStatus: SyncStatus;
  createdAt: string;
}

export type DiaryApprovalRole =
  | "technical_supervisor"
  | "investor"
  | "designer"
  | "contractor"
  | "other";

export type DiaryApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested"
  | "revoked";

export interface DiaryApprovalRequest {
  id: string;
  ownerId: string;
  projectId: string;
  closureId: string;
  closureHash: string;
  recipientName: string;
  reviewerRole: DiaryApprovalRole;
  status: DiaryApprovalStatus;
  expiresAt: string;
  openedAt?: string;
  viewCount: number;
  decidedAt?: string;
  decisionComment?: string;
  confirmationVersion?: "sk-v1";
  revokedAt?: string;
  createdAt: string;
}

export interface DiaryApprovalEvent {
  id: string;
  ownerId: string;
  projectId: string;
  requestId: string;
  closureId: string;
  eventType: "created" | "approved" | "changes_requested" | "revoked";
  actorName?: string;
  actorRole?: string;
  body?: string;
  closureHash: string;
  createdAt: string;
}

export interface CreatedDiaryApprovalRequest extends DiaryApprovalRequest {
  token: string;
  url: string;
}

export type DayClosureCheck =
  "diary" | "workforce" | "weather" | "photos" | "receipts";

export type DelayReason = "bad_weather" | "investor_waiting";

export interface DelayEvent {
  id: string;
  ownerId: string;
  projectId: string;
  eventDate: string;
  reason: DelayReason;
  note?: string;
  evidence: EvidenceBundle;
  lockedAt?: string;
  lockedBy?: string;
  correctionOfId?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerCheckin {
  id: string;
  projectId: string;
  workerName: string;
  checkedInAt: string;
  latitude?: number;
  longitude?: number;
}

export type WorkShiftStatus = "active" | "completed" | "approved";
export type WorkShiftSource = "worker" | "manual";

export interface WorkShift {
  id: string;
  ownerId: string;
  projectId: string;
  workerId: string;
  shiftDate: string;
  startedAt: string;
  endedAt?: string;
  breakMinutes: number;
  note?: string;
  source: WorkShiftSource;
  status: WorkShiftStatus;
  approvedAt?: string;
  approvedBy?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export type WorkShiftEventType =
  "started" | "ended" | "created" | "corrected" | "approved" | "reopened";

export interface WorkShiftEvent {
  id: string;
  ownerId: string;
  projectId: string;
  shiftId: string;
  workerId: string;
  eventType: WorkShiftEventType;
  body?: string;
  metadata: Record<string, unknown>;
  actorUserId?: string;
  createdAt: string;
}

export interface CheckinTokenPayload {
  projectId: string;
  ownerId: string;
  date: string;
  expiresAt: string;
  action: "checkin";
  nonce: string;
}

export interface ReportExport {
  id: string;
  ownerId: string;
  projectId: string;
  type: "diary" | "delay";
  sourceEntityId?: string;
  attachmentIds?: string[];
  locale: "sk-SK";
  storagePath?: string;
  createdAt: string;
  pageCount: number;
  status: SyncStatus;
}

export type ReceiptStatus = "draft" | "needs_review" | "ready";
export type OcrStatus =
  | "not_requested"
  | "pending"
  | "processing"
  | "needs_review"
  | "completed"
  | "failed";

export interface ReceiptCategory {
  id: string;
  ownerId: string;
  name: string;
  isDefault: boolean;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  ownerId: string;
  projectId: string;
  categoryId?: string;
  purchaseDate?: string;
  seller?: string;
  totalAmountCents?: number;
  currency: "EUR";
  note?: string;
  status: ReceiptStatus;
  ocrStatus: OcrStatus;
  ocrConfidence?: number;
  ocrError?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptFile {
  id: string;
  receiptId: string;
  ownerId: string;
  projectId: string;
  localUri: string;
  storagePath?: string;
  fileSize: number;
  mimeType: string;
  pageOrder: number;
  sha256?: string;
  perceptualHash?: string;
  uploadStatus: SyncStatus;
  createdAt: string;
}

export type WorkerStatus = "pending" | "active" | "rejected" | "revoked";

export interface ProjectWorker {
  id: string;
  ownerId: string;
  projectId: string;
  authUserId?: string;
  firstName: string;
  lastName: string;
  position: string;
  status: WorkerStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkerCredentialType =
  | "medical_exam"
  | "bozp_training"
  | "height_work"
  | "machinery_operator"
  | "electrician"
  | "welder"
  | "driver"
  | "other";

export interface WorkerCredential {
  id: string;
  ownerId: string;
  projectId: string;
  workerId: string;
  credentialType: WorkerCredentialType;
  title: string;
  documentNumber?: string;
  issuer?: string;
  issuedDate?: string;
  expiresAt?: string;
  note?: string;
  attachmentId?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export type WorkerCredentialEventType =
  "created" | "updated" | "revoked" | "restored";

export interface WorkerCredentialEvent {
  id: string;
  ownerId: string;
  projectId: string;
  credentialId: string;
  workerId: string;
  eventType: WorkerCredentialEventType;
  body?: string;
  metadata: Record<string, string | number | boolean | null>;
  actorUserId?: string;
  createdAt: string;
}

export type SiteIncidentType =
  | "near_miss"
  | "injury"
  | "property_damage"
  | "environmental"
  | "safety_observation";
export type SiteIncidentSeverity = "low" | "moderate" | "serious" | "critical";
export type SiteIncidentStatus = "reported" | "investigating" | "resolved";

export interface SiteIncident {
  id: string;
  ownerId: string;
  projectId: string;
  reporterWorkerId?: string;
  reporterName: string;
  incidentType: SiteIncidentType;
  severity: SiteIncidentSeverity;
  occurredAt: string;
  location: string;
  description: string;
  immediateAction?: string;
  peopleInvolved?: string;
  attachmentId?: string;
  status: SiteIncidentStatus;
  rootCause?: string;
  correctiveAction?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export type SiteIncidentEventType =
  "reported" | "updated" | "investigation_started" | "resolved" | "reopened";
export interface SiteIncidentEvent {
  id: string;
  ownerId: string;
  projectId: string;
  incidentId: string;
  eventType: SiteIncidentEventType;
  body?: string;
  metadata: Record<string, string | number | boolean | null>;
  actorUserId?: string;
  actorWorkerId?: string;
  createdAt: string;
}

export type MaterialRequestStatus =
  "new" | "approved" | "partially_purchased" | "purchased" | "rejected";

export interface MaterialRequest {
  id: string;
  ownerId: string;
  projectId: string;
  workerId: string;
  desiredDate?: string;
  comment?: string;
  status: MaterialRequestStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialRequestItem {
  id: string;
  requestId: string;
  name: string;
  quantity: number;
  unit: string;
  createdAt: string;
}

export interface ReceiptRequestLink {
  id: string;
  ownerId: string;
  receiptId: string;
  requestId: string;
  allocatedAmountCents?: number;
  createdAt: string;
}

export type MaterialSupplierQuoteStatus = "offered" | "selected" | "withdrawn";

export interface MaterialSupplierQuote {
  id: string;
  ownerId: string;
  projectId: string;
  requestId: string;
  supplierName: string;
  totalAmountCents: number;
  currency: "EUR";
  deliveryDate?: string;
  validUntil?: string;
  note?: string;
  status: MaterialSupplierQuoteStatus;
  selectedAt?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export type MaterialDeliveryStatus =
  "reported" | "accepted" | "discrepancy" | "resolved";
export interface MaterialDelivery {
  id: string;
  ownerId: string;
  projectId: string;
  requestId: string;
  quoteId?: string;
  supplierName: string;
  deliveryNoteNumber?: string;
  deliveredAt: string;
  receiverWorkerId?: string;
  receiverName: string;
  note?: string;
  attachmentId?: string;
  status: MaterialDeliveryStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}
export interface MaterialDeliveryLine {
  id: string;
  ownerId: string;
  projectId: string;
  deliveryId: string;
  requestItemId: string;
  itemName: string;
  unit: string;
  expectedQuantity: number;
  deliveredQuantity: number;
  damagedQuantity: number;
  createdAt: string;
}
export type MaterialDeliveryEventType =
  "reported" | "updated" | "accepted" | "discrepancy" | "resolved";
export interface MaterialDeliveryEvent {
  id: string;
  ownerId: string;
  projectId: string;
  deliveryId: string;
  eventType: MaterialDeliveryEventType;
  body?: string;
  metadata: Record<string, string | number | boolean | null>;
  actorUserId?: string;
  actorWorkerId?: string;
  createdAt: string;
}

export type MaterialStockMovementType =
  "usage" | "waste" | "return" | "adjustment_in" | "adjustment_out";
export type MaterialStockMovementStatus = "reported" | "confirmed" | "rejected";
export interface MaterialStockMovement {
  id: string;
  ownerId: string;
  projectId: string;
  requestId: string;
  requestItemId: string;
  materialName: string;
  unit: string;
  movementType: MaterialStockMovementType;
  quantity: number;
  occurredAt: string;
  workerId?: string;
  workerName?: string;
  note?: string;
  status: MaterialStockMovementStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  syncStatus: SyncStatus;
  createdAt: string;
}
export type MaterialStockMovementEventType =
  "reported" | "confirmed" | "rejected";
export interface MaterialStockMovementEvent {
  id: string;
  ownerId: string;
  projectId: string;
  movementId: string;
  eventType: MaterialStockMovementEventType;
  body?: string;
  actorUserId?: string;
  actorWorkerId?: string;
  createdAt: string;
}

export interface ReceiptExport {
  id: string;
  ownerId: string;
  projectId: string;
  dateFrom: string;
  dateTo: string;
  categoryIds: string[];
  receiptIds: string[];
  version: number;
  totalAmountCents: number;
  storagePath?: string;
  checksum?: string;
  pageCount: number;
  status: SyncStatus;
  createdAt: string;
}

export type ProjectRfiStatus = "draft" | "open" | "answered" | "closed";

export interface ProjectRfi {
  id: string;
  ownerId: string;
  projectId: string;
  rfiNumber: number;
  subject: string;
  question: string;
  recipientName: string;
  dueDate?: string;
  status: ProjectRfiStatus;
  answer?: string;
  answeredByName?: string;
  openedAt?: string;
  answeredAt?: string;
  closedAt?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectRfiEventType =
  "created" | "updated" | "opened" | "answered" | "closed" | "reopened";

export interface ProjectRfiEvent {
  id: string;
  ownerId: string;
  projectId: string;
  rfiId: string;
  eventType: ProjectRfiEventType;
  body?: string;
  metadata: Record<string, string | number | boolean | null>;
  actorUserId?: string;
  createdAt: string;
}

export type SafetyBriefingStatus = "draft" | "published" | "closed";
export type SafetyBriefingRecipientStatus =
  "pending" | "acknowledged" | "excused";

export interface SafetyBriefing {
  id: string;
  ownerId: string;
  projectId: string;
  title: string;
  body: string;
  briefingDate: string;
  status: SafetyBriefingStatus;
  contentHash?: string;
  publishedAt?: string;
  publishedBy?: string;
  closedAt?: string;
  closedBy?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyBriefingRecipient {
  id: string;
  ownerId: string;
  projectId: string;
  briefingId: string;
  workerId: string;
  workerName: string;
  position: string;
  status: SafetyBriefingRecipientStatus;
  contentHash: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  excusedAt?: string;
  excusedBy?: string;
  excuseReason?: string;
  createdAt: string;
}

export type SafetyBriefingEventType =
  "created" | "updated" | "published" | "acknowledged" | "excused" | "closed";
export interface SafetyBriefingEvent {
  id: string;
  ownerId: string;
  projectId: string;
  briefingId: string;
  eventType: SafetyBriefingEventType;
  workerId?: string;
  body?: string;
  metadata: Record<string, unknown>;
  actorUserId?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type:
    | "worker_join"
    | "material_request"
    | "request_status"
    | "supplier_quote"
    | "site_incident"
    | "material_delivery"
    | "material_stock"
    | "diary_approval";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export type PlanKey = "free" | "premium";
export interface FeatureEntitlement {
  featureKey: string;
  enabled: boolean;
  monthlyLimit?: number;
  resourceLimit?: number;
  used: number;
}
export interface PilotAccountStatus {
  plan: PlanKey;
  premiumUntil?: string;
  analyticsEnabled: boolean;
  entitlements: FeatureEntitlement[];
}

export interface OutboxItem<T = any> {
  id: string;
  type:
    | "diary_entry"
    | "day_closure"
    | "delay_event"
    | "attachment"
    | "worker_checkin"
    | "work_shift"
    | "work_shift_approve"
    | "work_shift_reopen"
    | "safety_briefing"
    | "safety_briefing_publish"
    | "safety_briefing_excuse"
    | "safety_briefing_close"
    | "worker_credential"
    | "worker_credential_revoke"
    | "worker_credential_restore"
    | "site_incident"
    | "site_incident_investigate"
    | "site_incident_resolve"
    | "site_incident_reopen"
    | "material_delivery"
    | "material_delivery_review"
    | "material_delivery_resolve"
    | "material_stock_movement"
    | "material_stock_review"
    | "weather_snapshot"
    | "receipt_category"
    | "receipt"
    | "receipt_file"
    | "receipt_ocr"
    | "receipt_export"
    | "material_request"
    | "material_supplier_quote"
    | "material_quote_selection"
    | "material_quote_withdrawal"
    | "project_rfi"
    | "project_rfi_open"
    | "project_rfi_answer"
    | "project_rfi_close"
    | "project_rfi_reopen";
  localId: string;
  remoteId?: string;
  payload: T;
  status: SyncStatus;
  attemptCount: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  activeUserId?: string;
  selectedProjectId?: string;
  projects: Project[];
  diaryEntries: DiaryEntry[];
  dayClosures: DayClosureRecord[];
  diaryApprovalRequests: DiaryApprovalRequest[];
  diaryApprovalEvents: DiaryApprovalEvent[];
  delayEvents: DelayEvent[];
  workerCheckins: WorkerCheckin[];
  workShifts: WorkShift[];
  workShiftEvents: WorkShiftEvent[];
  attachments: Attachment[];
  reports: ReportExport[];
  receiptCategories: ReceiptCategory[];
  receipts: Receipt[];
  receiptFiles: ReceiptFile[];
  receiptExports: ReceiptExport[];
  workers: ProjectWorker[];
  workerCredentials: WorkerCredential[];
  workerCredentialEvents: WorkerCredentialEvent[];
  siteIncidents: SiteIncident[];
  siteIncidentEvents: SiteIncidentEvent[];
  materialRequests: MaterialRequest[];
  materialRequestItems: MaterialRequestItem[];
  receiptRequestLinks: ReceiptRequestLink[];
  materialSupplierQuotes?: MaterialSupplierQuote[];
  materialDeliveries: MaterialDelivery[];
  materialDeliveryLines: MaterialDeliveryLine[];
  materialDeliveryEvents: MaterialDeliveryEvent[];
  materialStockMovements: MaterialStockMovement[];
  materialStockMovementEvents: MaterialStockMovementEvent[];
  projectRfis: ProjectRfi[];
  projectRfiEvents: ProjectRfiEvent[];
  safetyBriefings: SafetyBriefing[];
  safetyBriefingRecipients: SafetyBriefingRecipient[];
  safetyBriefingEvents: SafetyBriefingEvent[];
  notifications: AppNotification[];
  outbox: OutboxItem[];
}
