## Code Review Guide Lines

You will check the current branch and compare with the main branch.

## Initial checks

1. Check for all changed files, and make a summary of the changes.
2. Understand and make a resume of the purpuse of this branch, what do you understand about the branch goal?

## Linting and testing

1. Run linting to see if any issues are found.
2. After detecting the file changes, run only tests related to these changes.

## Are the branch following the rules?

Check the project rules and guidelines and verify if this PR is following them.

Some reinforment to check:

- **DRY**: Don't repeat yourself
- **KISS**: Keep it simple, stupid
- **YAGNI**: You aren't gonna need it
- **SOLID**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **Scalability**: Ensure the code is scalable and performant. Are we saving requests to the backend?

## Suggestionts for manual test

1. Suggest me some manual testing.
  - Which pages and flows should be tested manually?
  - Suggest me Monkey Patchs to be used in the manual testing. To reproduce some expected behaviors

## Important Notes

- Don't make any code changes without ask me. Suggest me and only make after my confirmation
