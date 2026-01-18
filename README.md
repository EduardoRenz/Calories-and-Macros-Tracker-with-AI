# CalorieCounter
<img width="650" height="573" alt="image" src="https://github.com/user-attachments/assets/4b1cb8c9-8001-4f29-b247-c7854799970e" />


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `yarn install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `yarn dev`

For test enviroment without real database, run `yarn dev:mock`

## Testing

To run tests, run the project with `yarn dev:mock` and then run `yarn cy:run`


## Backend Providers

The application supports multiple backend providers:

- **Firebase** (current): Firestore for data persistence and Firebase Authentication
- **Supabase** (migrating): PostgreSQL with Row Level Security (RLS) and Supabase Auth

### Provider Configuration

The provider is defined by the `BACKEND_PROVIDER` variable in the `.env.local` file:
- `BACKEND_PROVIDER=firebase` (default)
- `BACKEND_PROVIDER=supabase` (after migration)

**Important**: The provider is defined at build/server time and cannot be changed at runtime in the browser.

### Data Structure

- **Profiles**: user data (age, height, weight, gender, goals, weight history)
- **Dashboard Data**: daily data with meals and macros by date
- **Weight History**: user's progressive weight history


## Roadmap

- [ ] Add payment methods



