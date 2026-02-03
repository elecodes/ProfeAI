import { Router, Request, Response } from "express";
import GrammarService from "../../services/GrammarService";
import { validate } from "../../middleware/validate";
import { grammarAnalysisSchema } from "../../schemas/api";

const router = Router();

// POST /api/v1/grammar/analyze
router.post("/analyze", validate(grammarAnalysisSchema), async (req: Request, res: Response) => {
  try {
    const { text, context } = req.body;
    const report = await GrammarService.analyze(text, context);
    res.json(report);
  } catch (error: any) {
    console.error("Error analyzing grammar:", error);
    res.status(500).json({ error: "Failed to analyze grammar" });
  }
});

export default router;
