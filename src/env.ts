import { z } from 'zod'

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
})

export const env = envSchema.parse(process.env)
