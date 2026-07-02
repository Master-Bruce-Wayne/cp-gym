import { Schema, model } from "mongoose";

export interface IRevision {
  handle: string; 
  problemId: string;
  name: string;
  rating: number;
  tag: string;
  status: "failed" | "bookmark";
  addedAt: Date;
}

const RevisionSchema = new Schema<IRevision>({
  handle: { type: String, required: true, lowercase: true, index: true },
  problemId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  tag: { type: String, default: "general" },
  status: { type: String, enum: ["failed", "bookmark"], required: true },
  addedAt: { type: Date, default: Date.now }
});

RevisionSchema.index({ handle: 1, problemId: 1 }, { unique: true });

export const Revision = model<IRevision>("Revision", RevisionSchema);