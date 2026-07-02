export interface ITopicMetrics {
  finalWeak: { tag: string; count: number; required: number }[];
  finalStrong: { tag: string; count: number; required: number }[];
  ratingDistribution: { rating: number; count: number }[];
}

export function parseTopicAndRatingMetrics(
  submissions: any[],
  activeBlueprintTags: string[],
  solvedProblemIds: Set<string>,
  ratingCounts: Record<number, number>
): ITopicMetrics {
  const topicCounts: Record<string, number> = {};
  activeBlueprintTags.forEach(tag => { topicCounts[tag] = 0; });

  submissions.forEach((sub: any) => {
    const problem = sub.problem;
    if (sub.verdict === "OK" && problem && problem.tags && Array.isArray(problem.tags)) {
      problem.tags.forEach((tag: string) => {
        const lowTag = tag.toLowerCase();
        if (topicCounts[lowTag] !== undefined) topicCounts[lowTag]++;
      });
    }
  });

  const structuredTopics = Object.keys(topicCounts).map(tag => {
    const currentCount = topicCounts[tag];
    const dynamicRequired = currentCount > 0 ? (Math.floor(currentCount / 10) * 10) + 20 : 10;
    return { tag, count: currentCount, required: dynamicRequired };
  });

  const finalWeak = [...structuredTopics].sort((a, b) => a.count - b.count).slice(0, 5);
  const finalStrong = [...structuredTopics].sort((a, b) => b.count - a.count).slice(0, 5);
  
  const ratingDistribution = Object.keys(ratingCounts)
    .map(r => ({ rating: Number(r), count: ratingCounts[Number(r)] }))
    .sort((a, b) => a.rating - b.rating);

  return { finalWeak, finalStrong, ratingDistribution };
}