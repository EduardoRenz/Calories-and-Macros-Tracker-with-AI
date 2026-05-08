# AI Access Mode - Business Rules

## Overview

The `AI_ACCESS_MODE` feature flag controls who can use AI features in the application.

**Important Hierarchy:** Premium users ALWAYS have access to all AI features, regardless of the access mode.

## Access Modes

| Mode | Description | Frontend Behavior | Backend Behavior |
|------|-------------|-------------------|------------------|
| `disabled` | AI features completely disabled | Botão de AI escondido/bloqueado | 403 - "AI features are currently disabled" |
| `premium_only` | Only premium subscribers (default) | Botão visível, validação no backend | Passa para check de assinatura |
| `free_plan_api_keys_only` | Free users need own API keys (frontend-only), Premium bypasses | Free: botão oculto/desabilitado (sem chaves); Premium: sempre habilitado | **BLOCKS all free users** (cannot verify keys server-side) |
| `open` | Anyone can use AI | Botão habilitado para todos | Skip premium check, free users use system API |

## Feature Requirements (Granular Control)

**Precedence Rule:** Specific settings in `FEATURE_REQUIREMENTS` ALWAYS take precedence over the global `AI_ACCESS_MODE`.

Some features have additional restrictions beyond the global mode:

```typescript
FEATURE_REQUIREMENTS = {
  chatbot: {
    min_plan: 'premium'  // Only premium users (even in 'open' mode)
  },
  food_analysis: {
    min_plan: 'premium'   // Only premium users
  },
  quick_meal_photo: {
    min_plan: 'free_plan_api_keys'  // Free with keys OK, free without keys blocked
  },
  ingredient_search: {
    min_plan: 'open'  // Available to all users (including free without keys)
  }
}
```

### Feature Matrix

| Feature | Free (no keys) | Free (with keys) | Premium |
|---------|---------------|------------------|---------|
| Chatbot | ❌ | ❌ | ✅ |
| Food Analysis | ❌ | ❌ | ✅ |
| Quick Meal (photo) | ❌ | ✅ | ✅ |
| Ingredient Search | ✅ | ✅ | ✅ |
| Manual food log | ✅ | ✅ | ✅ |

## Firebase Remote Config Setup

### Parameters to Create

1. **ai_access_mode** (string)
   - Values: `disabled`, `premium_only`, `free_plan_api_keys_only`, `open`
   - Default: `premium_only`

2. **feature_requirements** (JSON)
   ```json
   {
     "chatbot": { "min_plan": "premium" },
     "food_analysis": { "min_plan": "premium" },
     "quick_meal_photo": { "min_plan": "free_plan_api_keys" },
     "ingredient_search": { "min_plan": "open" }
   }
   ```

### Example Configurations

**Production (default):**
```json
{
  "ai_access_mode": "premium_only",
  "feature_requirements": {
    "chatbot": { "min_plan": "premium" },
    "food_analysis": { "min_plan": "premium" },
    "quick_meal_photo": { "min_plan": "free_plan_api_keys" }
  }
}
```

**Open Beta (free users can use with their own keys):**
```json
{
  "ai_access_mode": "free_plan_api_keys_only",
  "feature_requirements": {
    "chatbot": { "min_plan": "premium" },
    "food_analysis": { "min_plan": "premium" },
    "quick_meal_photo": { "min_plan": "free_plan_api_keys" }
  }
}
```

> ⚠️ **Important:** In this mode, the backend **BLOCKS ALL FREE USERS** from server-side AI features because it cannot verify API keys (they are only in frontend localStorage). This mode is primarily for UX control - free users with their own API keys should use client-side features only.

**Maintenance (AI offline):**
```json
{
  "ai_access_mode": "disabled",
  "feature_requirements": {}
}
```

**Full Open (rare, for special promotions):**
```json
{
  "ai_access_mode": "open",
  "feature_requirements": {
    "chatbot": { "min_plan": "premium" },
    "food_analysis": { "min_plan": "premium" },
    "quick_meal_photo": { "min_plan": "free" },
    "ingredient_search": { "min_plan": "open" }
  }
}
```

## Security Architecture

### API Keys Storage

**Important:** User API keys are stored **ONLY in frontend localStorage**. There is NO server-side storage in Supabase.

**Why this design?**
- API keys are sensitive credentials - storing them server-side would require encryption and increase attack surface
- Users own their API keys (OpenAI, etc.) - they manage them locally
- Backend only uses server-side API keys for AI services

**Security Model:**

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                           │
│  ┌──────────────────┐      ┌──────────────────────────┐   │
│  │ localStorage     │      │ Feature Flag Check     │   │
│  │ - user_api_keys  │─────►│ - Mode: free_plan_api_  │   │
│  │                  │      │   keys_only            │   │
│  └──────────────────┘      │ - hasUserApiKeys()?     │   │
│                            │   (localStorage check)   │   │
│                            └───────────┬──────────────┘   │
│                                        │                   │
│                            ┌───────────▼──────────────┐   │
│                            │ Show/Hide UI Elements    │   │
│                            └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │ Request
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                             │
│  ┌──────────────────┐      ┌──────────────────────────┐   │
│  │ verifyAuth()     │─────►│ checkAiAccess(mode)     │   │
│  │ (Supabase)       │      │ - disabled: 403          │   │
│  └──────────────────┘      │ - premium_only: check    │   │
│                            │   subscription           │   │
│                            │ - free_plan_api_keys_:   │   │
│                            │   only: BLOCK FREE USERS │   │
│                            │   (cannot verify keys)   │   │
│                            │ - open: allow all        │   │
│                            └───────────┬──────────────┘   │
│                                        │                   │
│                            ┌───────────▼──────────────┐   │
│                            │ Process or Block         │   │
│                            └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Frontend controls UX (shows/hides buttons based on localStorage)
- Backend only trusts premium subscriptions (verified in Supabase)
- Free users are ALWAYS blocked from server-side AI (no way to verify their keys)
- If a hacker manipulates frontend to enable buttons, backend blocks the request
- Backend is the source of truth for security

## Implementation Details

### Backend Flow

```
Request → verifyAuth() → checkAiAccess(mode)
                          ↓
              ┌───────────┼───────────┐
              ↓           ↓           ↓
          disabled   checkUser()   open
              ↓           ↓
           403      premium? ──yes──► proceed
              ↓           ↓ no
              │        403 "Premium or API keys required"
              │        (Backend cannot verify API keys - they are
              │         only in frontend localStorage)
```

**Note:** In `free_plan_api_keys_only` mode, the backend **BLOCKS ALL FREE USERS** because it cannot verify if they have API keys (keys are only stored in frontend localStorage). The frontend controls UX visibility, but the backend is the security gatekeeper.

### Frontend Flow

```
Component → isFeatureEnabled(feature)
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    disabled     checkUser()   open
        ↓           ↓
    hide UI    premium? ──yes──► enable
        ↓           ↓ no
        │    hasApiKeys? ──yes──► enable (if feature allows)
        │           ↓ no
        │        disable UI / show upgrade prompt
```

## Migration from Old System

Old flags → New system:
- `enable_chatbot` → `feature_requirements.chatbot.min_plan`
- `enable_plans` → still used for checkout visibility
- `mandatory_users_api_keys` → replaced by `ai_access_mode: free_plan_api_keys_only`
- `premium_users_ai_list` → replaced by `feature_requirements`

## Error Messages

| Scenario | Error Message | Translation Key |
|----------|---------------|-----------------|
| AI disabled | "AI features are currently disabled" | `ai_errors.disabled` |
| Premium required | "Premium subscription required" | `ai_errors.premium_required` |
| API keys required (free user) | "Please add your API keys in settings to use this feature" | `ai_errors.api_keys_required` |
| Feature not available | "This feature is only available for premium users" | `ai_errors.feature_premium_only` |
