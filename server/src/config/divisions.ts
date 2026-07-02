export interface DivisionConfig {
  name: string;
  minRating: number;
  maxRating: number;
  relevantTags: string[];
}

export const DIVISIONS: DivisionConfig[] = [
  {
    name: "Newbie",
    minRating: 0,
    maxRating: 1199,
    relevantTags: ["implementation", "greedy", "brute force", "math", "sortings", "strings"],
  },
  {
    name: "Pupil",
    minRating: 1200,
    maxRating: 1399,
    relevantTags: ["implementation", "greedy", "brute force", "math", "sortings", "constructive algorithms", "two pointers", "binary search", "strings", "bitmasks", "data structures"],
  },
  {
    name: "Specialist",
    minRating: 1400,
    maxRating: 1599,
    relevantTags: ["implementation", "greedy", "brute force", "math", "sortings", "constructive algorithms", "two pointers", "binary search", "strings", "bitmasks", "data structures", "dfs and similar", "graphs", "number theory", "dp", "combinatorics", "trees", "dsu"],
  },
  {
    name: "Expert",
    minRating: 1600,
    maxRating: 1899,
    relevantTags: ["implementation", "greedy", "math", "constructive algorithms", "two pointers", "binary search", "bitmasks", "data structures", "dfs and similar", "graphs", "number theory", "dp", "combinatorics", "trees", "dsu", "shortest paths", "divide and conquer", "hashing", "probabilities", "games", "geometry", "strings"],
  },
  {
    name: "Candidate Master / Master",
    minRating: 1900,
    maxRating: 2399,
    relevantTags: ["implementation", "greedy", "math", "constructive algorithms", "binary search", "bitmasks", "data structures", "dfs and similar", "graphs", "number theory", "dp", "combinatorics", "trees", "dsu", "shortest paths", "divide and conquer", "hashing", "probabilities", "games", "geometry", "strings", "string suffix structures", "fft", "flows", "graph matchings", "meet-in-the-middle", "matrices"],
  }
];