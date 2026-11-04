import mongoose, { Schema, type Model } from "mongoose";

/** Reuse compiled models across hot reloads. */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const PUBLISH_STATUSES = ["draft", "review", "published", "archived"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const publishFields = {
  status: { type: String, enum: PUBLISH_STATUSES, default: "draft", index: true },
  publishedAt: { type: Date },
  scheduledFor: { type: Date },
  updatedBy: { type: String },
};

export const seoFields = {
  metaTitle: { type: String, maxlength: 70 },
  metaDescription: { type: String, maxlength: 170 },
  ogImage: { type: String },
  noindex: { type: Boolean, default: false },
};
