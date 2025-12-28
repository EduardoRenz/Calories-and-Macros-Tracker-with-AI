
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
  env: {
    NEXT_PUBLIC_USE_MOCKS: true,
  },
});
