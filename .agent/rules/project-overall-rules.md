---
trigger: always_on
---

### Overall Rules

- This project uses `yarn`
- When implementing repositories and service, use the tool ConcurrencyRequestManager to avoid multiple api calls
- Always make Small and Readable Components in pages to be easier to maintain and read
- Don´t use any, always define types
- When a fix or feature is created, bump version in package.json
- Remove unused variables and imports
- Always use const if the variable is not going to be reassigned
- The project uses l18n, always make a translation for every text. fallback to key if translation not exists to be visible the missing translation
- Every Page should have a Error handling, giving a feedback to user, and an option to retry. And always inform the user what happened

### Code legibility

- Use clear and descriptive variable and function names
- Avoid deeply nested code structures
- Use early returns to reduce nesting levels
- Keep functions small and focused on a single responsibility
- Use meaningful comments to explain complex logic
- Prefer array methods like map, filter, and reduce over for loops
- Use strategy pattern when are multiple conditions to evaluate


### Testing

- This project uses `Cypress`
- When testing the application, in the browser or cypress, use the `yarn dev:mock` wich you infer that is already running. To run test, use the command `yarn cy:run`
- Always create tests for new features pages and components.
- When a bug is found and fixed, also create a test to avoid regressions

### Reusable components

- Always try to create pure and reusable components wich receive data as props and callback, for example: QuickMealModal.tsx
- **Componentize UI sections** that can be reused or that make the page code cleaner and more maintainable. Avoid huge files with a lot of sections without split in small components.
- Extract navigation, headers, forms, and any repeating UI patterns into separate components
- Components should be small, focused on a single responsibility, and easy to test