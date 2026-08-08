
import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  expose: {
    NEXT_PUBLIC_BACKEND_PROVIDER: 'mock',
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
});
