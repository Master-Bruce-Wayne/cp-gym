import { Request, Response } from "express";
import { Revision } from "../models/Revision";

export const addManualBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { handle, problemId, name, rating, tag } = req.body;

    if (!handle || !problemId || !name) {
      res.status(400).json({ error: "Required fields (handle, problemId, name) are missing." });
      return;
    }

    const lowerHandle = handle.toLowerCase();

    // 🚀 Upsert directly into the separate Revision collection
    const updatedBookmark = await Revision.findOneAndUpdate(
      { handle: lowerHandle, problemId },
      {
        $setOnInsert: {
          handle: lowerHandle,
          problemId,
          name,
          rating: rating || 0,
          tag: tag || "general",
          status: "bookmark",
          addedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, bookmark: updatedBookmark });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to register manual bookmark." });
  }
};

// 🚀 Added: Logic to safely pull the bookmark out of your Mongo collection
export const removeManualBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { handle, problemId } = req.body;

    if (!handle || !problemId) {
      res.status(400).json({ error: "Required fields (handle, problemId) are missing." });
      return;
    }

    const lowerHandle = handle.toLowerCase();

    // Delete the entry matching the specific user handle and problem ID context
    const deletedResult = await Revision.findOneAndDelete({ 
      handle: lowerHandle, 
      problemId 
    });

    if (!deletedResult) {
      res.status(404).json({ error: "Target problem bookmark not found in records." });
      return;
    }

    res.status(200).json({ success: true, message: "Target cleared successfully from collection." });
  } catch (error: any) {
    res.status(500).json({ error: "Backend failed to remove target from collection." });
  }
};