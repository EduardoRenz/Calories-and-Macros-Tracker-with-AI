---
trigger: always_on
---

- When testing the application, in the browser or cypress, use the `yarn dev:mock` command to start the app in mock mode
- Do not use VITE_ prefix in new envs or similar
- When a new page with new domains, repositories and services is created, also create mocked versions of it and configure in the factory.
- When a new page is created, also make a new test in cypress for this page.
- To run test, use the command `yarn cy:run`
