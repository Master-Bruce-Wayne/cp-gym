export interface IActivityTrackOutput {
  dailySolvesList: { handle: string; problemId: string; name: string; rating: number; tag: string; solvedDate: string; timestamp: Date }[];
}

export function calculateStreakAndActivity(submissions: any[], handle: string): IActivityTrackOutput {
  const solveDatesMap: Record<string, Set<string>> = {};
  const dailySolvesList: any[] = [];

  submissions.forEach((sub: any) => {
    const problem = sub.problem;
    if (sub.verdict === "OK" && problem && problem.contestId && problem.index && sub.creationTimeSeconds) {
      const problemId = `${problem.contestId}-${problem.index}`;
      const ts = new Date(sub.creationTimeSeconds * 1000);
      const dateStr = ts.toISOString().split('T')[0];

      if (!solveDatesMap[dateStr]) solveDatesMap[dateStr] = new Set();
      
      if (!solveDatesMap[dateStr].has(problemId)) {
        solveDatesMap[dateStr].add(problemId);
        dailySolvesList.push({
          handle: handle.toLowerCase(),
          problemId,
          name: problem.name,
          rating: problem.rating || 0,
          tag: problem.tags && problem.tags.length > 0 ? problem.tags[0] : "general",
          solvedDate: dateStr,
          timestamp: ts
        });
      }
    }
  });

  return { dailySolvesList };
}