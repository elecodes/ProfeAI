import { Router } from "express";
import chatRoutes from "./chat.routes";
import grammarRoutes from "./grammar.routes";
import ttsRoutes from "./tts.routes";
import dialogueRoutes from "./dialogue.routes";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/grammar", grammarRoutes);
router.use("/tts", ttsRoutes);
router.use("/generate-dialogue", dialogueRoutes);

export default router;
