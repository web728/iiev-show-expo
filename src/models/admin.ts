import { Schema, type InferSchemaType } from "mongoose";
import { defineModel } from "./_helpers";
import { ROLES } from "@/lib/auth/rbac";

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, required: true, default: "analyst" },
    passwordHash: { type: String },
    active: { type: Boolean, default: true, index: true },
    // TOTP MFA (RFC 6238). Secret stored encrypted with APP_ENCRYPTION_KEY.
    mfaEnabled: { type: Boolean, default: false },
    mfaSecretEnc: { type: String, select: false },
    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    // One-time invite/reset tokens are stored as SHA-256 hashes only.
    inviteTokenHash: { type: String, select: false, index: true, sparse: true },
    inviteExpires: { type: Date },
    resetTokenHash: { type: String, select: false, index: true, sparse: true },
    resetExpires: { type: Date },
    invitedBy: { type: String },
  },
  { timestamps: true },
);
export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema> & { _id: string };
export const AdminUser = defineModel("AdminUser", AdminUserSchema);

const AdminSessionSchema = new Schema(
  {
    sid: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true, index: true },
    ip: String,
    userAgent: String,
    mfaPassed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: true },
);
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AdminSession = defineModel("AdminSession", AdminSessionSchema);

const AuditEventSchema = new Schema(
  {
    actorId: { type: String, index: true },
    actorEmail: String,
    actorRole: String,
    action: { type: String, required: true, index: true },
    entity: { type: String, index: true },
    entityId: { type: String, index: true },
    summary: String,
    // Field-level before/after for versioned records. PII is redacted before storing.
    diff: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
AuditEventSchema.index({ createdAt: -1 });
export const AuditEvent = defineModel("AuditEvent", AuditEventSchema);

const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = defineModel("RateLimit", RateLimitSchema);
