import { Request, Response } from "express";
import axios from "axios";
import { User } from "../models/User";
import { Revision } from "../models/Revision";
import { Activity } from "../models/Activity";
import { computeDivisionContext } from "../utils/divisionHelper";
import { parseTopicAndRatingMetrics } from "../utils/topicMetricsHelper";
import { calculateStreakAndActivity } from "../utils/activityTrackerHelper";
// 🚀 Import the fresh new helper tool instance
import { fetchAndParseContestMetrics } from "../utils/contestHelper";

export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const handle = (req.params.handle as string).trim();
    if (!handle) {
      res.status(400).json({ error: "Codeforces handle parameter is required." });
      return;
    }

    const lowerHandle = handle.toLowerCase();
    const existingUser = await User.findOne({ handle: lowerHandle });
    const CACHE_TTL_MS = 5 * 60 * 1000;

    if (existingUser && (Date.now() - new Date(existingUser.lastSynced).getTime() < CACHE_TTL_MS)) {
      const [revisions, activities] = await Promise.all([
        Revision.find({ handle: lowerHandle }),
        Activity.find({ handle: lowerHandle })
      ]);
      
      res.status(200).json({
        ...existingUser.toObject(),
        revisionBucket: revisions,
        dailySolves: activities
      });
      return;
    }

    const [statusResponse, infoResponse] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.status?handle=${handle}`),
      axios.get(`https://codeforces.com/api/user.info?handles=${handle}`)
    ]);

    if (statusResponse.data.status !== "OK" || infoResponse.data.status !== "OK") {
      res.status(400).json({ error: "Failed to fetch data from Codeforces endpoints." });
      return;
    }

    const submissions = statusResponse.data.result;
    const userInfo = infoResponse.data.result[0];
    const currentRating = userInfo.rating || 0;

    const { currentDivision, targetDivision } = computeDivisionContext(currentRating);

    const solvedProblemIds = new Set<string>();
    const failedProblemList: any[] = [];
    const ratingCounts: Record<number, number> = {};

    submissions.forEach((sub: any) => {
      const problem = sub.problem;
      if (!problem || !problem.contestId || !problem.index) return;
      const problemId = `${problem.contestId}-${problem.index}`;

      if (sub.verdict === "OK") {
        if (!solvedProblemIds.has(problemId)) {
          solvedProblemIds.add(problemId);
          if (problem.rating) ratingCounts[problem.rating] = (ratingCounts[problem.rating] || 0) + 1;
        }
      } else if (["WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR"].includes(sub.verdict)) {
        failedProblemList.push({
          handle: lowerHandle,
          problemId,
          name: problem.name,
          rating: problem.rating || 0,
          tag: problem.tags && problem.tags.length > 0 ? problem.tags[0] : "general",
          status: "failed"
        });
      }
    });

    const { finalWeak, finalStrong, ratingDistribution } = parseTopicAndRatingMetrics(
      submissions, currentDivision.relevantTags, solvedProblemIds, ratingCounts
    );

    const { dailySolvesList } = calculateStreakAndActivity(submissions, lowerHandle);

    // 🚀 Execute the new helper logic asynchronously
    const { contestHistory, divisionDistribution } = await fetchAndParseContestMetrics(handle, submissions);

    // Sync Revision Documents
    await Revision.deleteMany({ handle: lowerHandle, problemId: { $in: Array.from(solvedProblemIds) } });
    
    const activeRevisions = await Revision.find({ handle: lowerHandle });
    const existingRevIds = new Set(activeRevisions.map(r => r.problemId));
    
    const uniqueNewFailures = failedProblemList.filter(f => !solvedProblemIds.has(f.problemId) && !existingRevIds.has(f.problemId));
    if (uniqueNewFailures.length > 0) {
      const revisionOps = uniqueNewFailures.map(f => ({
        updateOne: {
          filter: { handle: f.handle, problemId: f.problemId },
          update: { $setOnInsert: f },
          upsert: true
        }
      }));
      await Revision.bulkWrite(revisionOps);
    }

    // Sync Activity Documents safely via atomic upserts
    if (dailySolvesList.length > 0) {
      const activityOps = dailySolvesList.map((act: any) => ({
        updateOne: {
          filter: { handle: lowerHandle, problemId: act.problemId },
          update: { $set: act },
          upsert: true
        }
      }));
      await Activity.bulkWrite(activityOps);
    }

    // Calculate streaks from freshly synced database state
    const finalActivities = await Activity.find({ handle: lowerHandle });
    const solveDatesMap: Record<string, boolean> = {};
    finalActivities.forEach(act => {
      if (act.solvedDate) solveDatesMap[act.solvedDate] = true;
    });

    let currentStreak = 0;
    let maxStreak = 0;
    const sortedUniqueDates = Object.keys(solveDatesMap).sort((a, b) => b.localeCompare(a));

    if (sortedUniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (sortedUniqueDates.includes(todayStr) || sortedUniqueDates.includes(yesterdayStr)) {
        let checkDate = sortedUniqueDates.includes(todayStr) ? new Date() : yesterday;
        let running = true;

        while (running) {
          const checkStr = checkDate.toISOString().split('T')[0];
          if (solveDatesMap[checkStr]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            running = false;
          }
        }
      }

      const chronicledDates = [...sortedUniqueDates].sort((a, b) => a.localeCompare(b));
      let tempStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < chronicledDates.length; i++) {
        const prev = new Date(chronicledDates[i - 1]);
        const curr = new Date(chronicledDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      }
    }

    const profilePayload = {
      handle: userInfo.handle,
      rating: currentRating,
      rank: userInfo.rank || "unrated",
      totalSubmissions: submissions.length,
      acceptedSubmissions: submissions.filter((sub: any) => sub.verdict === "OK").length,
      solvedCount: solvedProblemIds.size,
      strongTopics: finalStrong,
      weakTopics: finalWeak,
      ratingDistribution,
      currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      roadmap: {
        currentDivision: currentDivision.name,
        nextDivision: targetDivision.name,
        targetRating: targetDivision.minRating,
        requiredRatingPoints: Math.max(0, targetDivision.minRating - currentRating)
      },
      // 🚀 Injecting custom data properties into database collection models
      contestHistory,
      divisionDistribution,
      lastSynced: new Date()
    };

    const updatedUser = await User.findOneAndUpdate(
      { handle: lowerHandle },
      { $set: profilePayload },
      { new: true, upsert: true }
    );

    const finalRevisions = await Revision.find({ handle: lowerHandle });

    res.status(200).json({
      ...updatedUser.toObject(),
      revisionBucket: finalRevisions,
      dailySolves: finalActivities
    });
  } catch (error: any) {
  console.error("❌ FULL BACKEND CRASH LOG:", error); // This shows up in your terminal
  res.status(500).json({ error: error.message || "Failed to resolve connection bridge payload segments." });
}
};