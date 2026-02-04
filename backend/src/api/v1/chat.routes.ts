import { Router, Request, Response } from "express";
import ConversationService from "../../services/ConversationService";

const router = Router();

// GET /api/v1/chat/health
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// POST /api/v1/chat/start
router.post("/start", async (req: Request, res: Response) => {
  try {
    const { topic, level, sessionId, uid } = req.body;
    console.log(`📩 Chat Start Request: topic="${topic}", level="${level}", sessionId="${sessionId}", uid="${uid}"`);
    
    if (!topic || !level || !sessionId || !uid) {
      return res.status(400).json({ error: "Missing topic, level, sessionId, or uid" });
    }

    const reply = await ConversationService.startConversation(uid, sessionId, topic, level);

    const safeReply = typeof reply === "string" ? { text: reply } : reply || { text: "" };
    const finalResponse = { ...safeReply, gender: "male" };

    res.json({ message: finalResponse });
  } catch (error: any) {
    console.error("🔥 ERROR DETALLADO:", error);
    
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ error: "Quota exceeded", code: "rate_limit_exceeded" });
    }

    res.status(500).json({ error: "Failed to start conversation", details: error.message });
  }
});

// POST /api/v1/chat/message
router.post("/message", async (req: Request, res: Response) => {
  try {
    const { message, sessionId, topic, level, uid } = req.body;
    if (!message || !sessionId || !uid) {
      return res.status(400).json({ error: "Missing message, sessionId, or uid" });
    }

    const reply = await ConversationService.sendMessage(uid, sessionId, message, topic, level);

    const safeReply = typeof reply === "string" ? { text: reply } : reply || { text: "" };
    const finalResponse = { ...safeReply, gender: "male" };

    res.json({ message: finalResponse });
  } catch (error: any) {
    console.error("Error sending message:", error);

    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ error: "Quota exceeded", code: "rate_limit_exceeded" });
    }

    res.status(500).json({ error: "Failed to process message" });
  }
});

export default router;
