import { Schema, model } from "mongoose";

export interface IContestHistoryItem {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  solvedCount: number;
  problemsAvailable: number;
  division: 'Div. 1' | 'Div. 2' | 'Div. 3' | 'Div. 4' | 'Educational' | 'Global' | 'Other';
}

export interface IUser {
  handle: string;
  rating: number;
  rank: string;
  totalSubmissions: number;
  acceptedSubmissions: number;
  solvedCount: number;
  weakTopics: { tag: string; count: number; required: number }[];
  strongTopics: { tag: string; count: number; required: number }[];
  ratingDistribution: { rating: number; count: number }[];
  currentStreak: number;
  maxStreak: number;
  lastSynced: Date;
  roadmap: {
    currentDivision: string;
    nextDivision: string;
    targetRating: number;
    requiredRatingPoints: number;
  };
  // 🚀 New properties added for analytics tabs
  contestHistory: IContestHistoryItem[];
  divisionDistribution: Record<string, number>;
}

const UserSchema = new Schema<IUser>({
  handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
  rating: { type: Number, default: 0 },
  rank: { type: String, default: "unrated" },
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  solvedCount: { type: Number, default: 0 },
  weakTopics: [{ tag: String, count: Number, required: Number }],
  strongTopics: [{ tag: String, count: Number, required: Number }],
  ratingDistribution: [{ rating: Number, count: Number }],
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  roadmap: {
    currentDivision: { type: String, default: "" },
    nextDivision: { type: String, default: "" },
    targetRating: { type: Number, default: 0 },
    requiredRatingPoints: { type: Number, default: 0 }
  },
  contestHistory: [{
  contestId: Number,
  contestName: String,
  rank: Number,
  oldRating: Number,
  newRating: Number,
  solvedCount: Number,
  problemsAvailable: Number,
  division: String,
  // 🚀 CRITICAL FIX: Add this so Mongoose permits saving and sending it!
  dateStr: String
  }],
  // 🚀 FIX: Change type from Map to Schema.Types.Mixed
  divisionDistribution: { type: Schema.Types.Mixed, default: {} },
  lastSynced: { type: Date, default: Date.now }
});

export const User = model<IUser>("User", UserSchema);