# CalorieCounter
<img width="1656" height="927" alt="image" src="https://github.com/user-attachments/assets/aafef09a-0ba4-4e5b-b48b-78162cb2a4ab" />




## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `pnpm`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `pnpm dev`

For test enviroment without real database, run `pnpm dev:mock`

## Testing

To run tests, run the project with `pnpm dev:mock` and then run `pnpm cy:run`


## Backend Providers

The application supports multiple backend providers:

- **Firebase** (current): Firestore for data persistence and Firebase Authentication
- **Supabase** (migrating): PostgreSQL with Row Level Security (RLS) and Supabase Auth

### Provider Configuration

The provider is defined by the `NEXT_PUBLIC_BACKEND_PROVIDER` variable in the `.env.local` file:
- `NEXT_PUBLIC_BACKEND_PROVIDER=firebase` (default)
- `NEXT_PUBLIC_BACKEND_PROVIDER=supabase` (after migration)

**Important**: The provider is defined at build/server time and cannot be changed at runtime in the browser.

### Data Structure

- **Profiles**: user data (age, height, weight, gender, goals, weight history)
- **Dashboard Data**: daily data with meals and macros by date
- **Weight History**: user's progressive weight history


## AI Service Configuration

The application supports multiple AI providers with automatic fallback:

### Server-Side (API Routes)

When no user-provided API keys are set, the server uses environment variables with the following priority:

1. **OpenRouter** (primary) — if `OPENROUTER_API_KEY` is set
2. **Gemini** (fallback) — if `GEMINI_API_KEY` is set
3. **Mock** — if neither is available

If OpenRouter fails for any reason, the request automatically falls back to Gemini.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key (server-side) |
| `OPENROUTER_API_KEY` | No | OpenRouter API key (optional, enables OpenRouter as primary provider) |
| `OPENROUTER_DEFAULT_MODEL` | No | Default model for OpenRouter (default: `openrouter/auto`) |

### Client-Side (Browser)

Users can add their own API keys (Gemini, OpenAI, DeepSeek, OpenRouter) in the app settings. These take priority over server-side keys. If no user keys are set, requests are routed through the server API.
