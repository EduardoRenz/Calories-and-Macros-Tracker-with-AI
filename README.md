# CalorieCounter


## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15Gzoaml2qCGeO2C4AHEczXPfqg5grOm4

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


## Roadmap

[ ] Possibility to add custom api keys
[ ] 

