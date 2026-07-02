import { Request, Response } from "express";
import axios from "axios";

export const getTopicRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const topic = req.query.topic as string;
    const rating = parseInt(req.query.rating as string, 10) || 1200;

    if (!topic) {
      res.status(400).json({ error: "Topic query parameter is required." });
      return;
    }

    const response = await axios.get(`https://codeforces.com/api/problemset.problems?tags=${encodeURIComponent(topic)}`);
    if (response.data.status !== "OK") {
      res.status(400).json({ error: "Failed to pull problem matrix from Codeforces endpoint." });
      return;
    }

    const allProblems = response.data.result.problems;
    const recommended = allProblems.filter((prob: any) => prob.rating === rating);

    const finalSelection = recommended
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((p: any) => ({
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
      }));

    res.status(200).json({ problems: finalSelection });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to resolve recommendations." });
  }
};