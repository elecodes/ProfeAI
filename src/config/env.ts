/* eslint-env node */
import { z } from 'zod';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  // Required variables
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  
  // Optional variables with defaults or specific formats
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional integrations
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

// Validate process.env
const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1); 
  }

  return result.data;
};

export const env = parseEnv();
