import { Schema, model } from "mongoose";

export interface IActivity {
  handle: string;
  problemId: string;
  name: string;
  rating: number;
  tag: string;
  solvedDate: string; // Stored as "YYYY-MM-DD"
  timestamp: Date;
}

const ActivitySchema = new Schema<IActivity>({
  handle: { type: String, required: true, lowercase: true, index: true },
  problemId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  tag: { type: String, default: "general" },
  solvedDate: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true }
});

ActivitySchema.index({ handle: 1, problemId: 1 }, { unique: true });

export const Activity = model<IActivity>("Activity", ActivitySchema);