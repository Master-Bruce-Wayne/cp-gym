import { Router } from "express";
import { getUserAnalytics } from "../controllers/analyticsController";
import { getTopicRecommendations } from "../controllers/recommendationController";
import { addManualBookmark, removeManualBookmark } from "../controllers/bookmarkController";

const router = Router();

router.get("/:handle", getUserAnalytics);
router.get("/recommendations/tracks", getTopicRecommendations);
router.post("/bookmark", addManualBookmark);
router.post("/unbookmark", removeManualBookmark);

export default router;