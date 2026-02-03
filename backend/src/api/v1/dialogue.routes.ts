import { Router, Request, Response } from "express";
import DialogueGenerator from "../../services/DialogueGenerator";
import { validate } from "../../middleware/validate";
import { generateDialogueSchema } from "../../schemas/api";

const router = Router();

// POST /api/generate-dialogue
router.post("/", validate(generateDialogueSchema), async (req: Request, res: Response) => {
  try {
    const { topic, level } = req.body;
    console.log(`✨ Generating dialogue: "${topic}" (${level})`);
    const dialogue = await DialogueGenerator.generate(topic, level);
    res.json(dialogue);
  } catch (error: any) {
    console.error("Generation error:", error);
    res.status(500).json({ error: "Failed to generate dialogue" });
  }
});

export default router;
