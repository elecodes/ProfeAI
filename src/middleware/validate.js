import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // Replace body with parsed (and potentially stripped/transformed) data
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("🔍 ZodError detected:", JSON.stringify(error, null, 2));
      // Try to access issues if errors is undefined
      const issues = error.errors || error.issues;
      
      if (!issues) {
        console.error("❌ ZodError has no 'errors' or 'issues' property:", error);
        return res.status(500).json({ error: "Internal Validation Error" });
      }

      return res.status(400).json({
        error: "Validation Error",
        details: issues.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }
    next(error);
  }
};
