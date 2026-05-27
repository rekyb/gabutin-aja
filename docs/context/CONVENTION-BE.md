# Backend Conventions — CONVENTION-BE.md

## 1. Database & Mongoose Conventions
- **Model Boundaries:** Never invoke raw collections directly — always go through models in `src/db/models/`.
- **Lean Reads:** Use `.lean()` for all read-only Mongoose queries. This returns plain objects instead of bloated Mongoose Documents.
- **Client Component Safe Props:** Use lean typed interfaces (`CardDoc`, `UserAchievementDoc`, `ThemeScoreDoc` from `src/types/index.ts`) in Client Component props. Never pass active Mongoose Document instances to client files.
- **Strict Validations:** Define schemas with required flags, and define database indexes in schema files, never ad-hoc.
- **Server-Only Checks:** No database connections or Mongoose models can be imported or used in client-side code files. React Server Components (RSC) read directly from Mongoose models using named Server Actions.

---

## 2. Server Action Contracts
All mutations go through named Server Actions. No default exports. The following signatures are frozen:

```ts
// src/app/actions/user.ts
export createUser(displayName: string, themes: ThemeName[], uniqueUserId: string): Promise<{ userId: string }>
export getUserByUniqueId(uniqueUserId: string): Promise<UserDoc | null>

// src/app/actions/answer.ts
export submitAnswer(userId: string, cardId: string, selectedIndex: number | null): Promise<SubmitAnswerResponse>

// src/app/actions/feed.ts
export getNextCard(userId: string): Promise<CardDoc | null>

// src/app/actions/achievements.ts
export pinBadge(userId: string, achievementKey: string): Promise<void>
export unpinBadge(userId: string, achievementKey: string): Promise<void>
export getUserAchievements(userId: string): Promise<UserAchievementDoc[]>

// src/app/actions/profile.ts
export getUserProfile(userId: string): Promise<UserProfile & { showcasedBadges: UserAchievementDoc[]; themeScores: ThemeScoreDoc[] }>
```

---

## 3. Environment Variables
All environment variables are validated at startup using Zod in `src/env.ts` (application crashes fast with descriptive logs on startup if any variables are missing).

| Variable | Scope | Description |
|---|---|---|
| `MONGODB_URI` | Private (Server) | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Private (Server) | Google Gemini API key for AI pipelines |
| `NEXT_PUBLIC_APP_URL` | Public (Client/Server) | Production deployment URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | Public (Client/Server) | PostHog API client token |
| `NEXT_PUBLIC_POSTHOG_HOST` | Public (Client/Server) | PostHog endpoint (`https://app.posthog.com`) |
