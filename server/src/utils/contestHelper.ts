import axios from "axios";
import { IContestHistoryItem } from "../models/User";

export const fetchAndParseContestMetrics = async (handle: string, submissions: any[]): Promise<{
  contestHistory: IContestHistoryItem[];
  divisionDistribution: Record<string, number>;
}> => {
  try {
    const contestSolveMap: Record<number, Set<string>> = {};
    submissions.forEach((sub) => {
      if (sub.verdict === "OK" && sub.problem && sub.problem.contestId) {
        if (!contestSolveMap[sub.problem.contestId]) {
          contestSolveMap[sub.problem.contestId] = new Set();
        }
        contestSolveMap[sub.problem.contestId].add(sub.problem.index);
      }
    });

    // 🚀 FIX: Initialize ALL possible keys to prevent undefined property checks
    const divisionDistribution: Record<string, number> = {
  "Div. 1": 0,
  "Div. 2": 0,
  "Div. 3": 0,
  "Div. 4": 0,
  "Educational": 0,
  "Global": 0,
  "Other": 0
};

    let ratingsList: any[] = [];
    
    // Isolated try/catch block specifically for Codeforces API network resilience
    try {
      const ratingResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
      if (ratingResponse.data && ratingResponse.data.status === "OK") {
        ratingsList = ratingResponse.data.result || [];
      }
    } catch (apiErr) {
      console.warn(`⚠️ Codeforces user.rating fetch skipped or failed for handle: ${handle}`);
    }

    const contestHistory: IContestHistoryItem[] = ratingsList.map((c: any) => {
      const name = c.contestName || "";
      let division: IContestHistoryItem['division'] = "Other";

      if (name.includes("Div. 1")) { division = "Div. 1"; }
      else if (name.includes("Div. 2")) { division = "Div. 2"; }
      else if (name.includes("Div. 3")) { division = "Div. 3"; }
      else if (name.includes("Div. 4")) { division = "Div. 4"; }
      else if (name.toLowerCase().includes("educational")) { division = "Educational"; }
      else if (name.toLowerCase().includes("global")) { division = "Global"; }

      const solvedCount = contestSolveMap[c.contestId] ? contestSolveMap[c.contestId].size : 0;

      if (divisionDistribution[division] !== undefined) {
        divisionDistribution[division] += solvedCount;
      }

      const formattedDate = new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('default', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

return {
  contestId: c.contestId,
  contestName: name,
  rank: c.rank,
  oldRating: c.oldRating,
  newRating: c.newRating,
  solvedCount,
  problemsAvailable: 6,
  division,
  // 🚀 Pass this new parameter down to the dashboard frontend views
  dateStr: formattedDate 
};
    });

    return { contestHistory, divisionDistribution };
  } catch (err) {
    console.error("Error building contest logs:", err);
    return { contestHistory: [], divisionDistribution: {} };
  }
};