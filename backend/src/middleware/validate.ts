import { z, ZodTypeAny, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      console.log("🔍 ZodError detected:", JSON.stringify(error, null, 2));
      const issues = error.issues;
      
      if (!issues || issues.length === 0) {
        console.error("❌ ZodError has no issues property or is empty:", error);
        return res.status(400).json({ error: "Validation Error" });
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
