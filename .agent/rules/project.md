---
trigger: always_on
---

- This project uses yarn
- When testing the application, in the browser or cypress, use the `yarn dev:mock` command to start the app in mock mode
- When a new page with new domains, repositories and services is created, also create mocked versions of it and configure in the factory.
- When a new page is created, also make a new test in cypress for this page.
- To run test, use the command `yarn cy:run`
- When implementing repositories and service, use the tool ConcurrencyRequestManager to avoid multiple api calls
- Always make Small and Readable Components in pages to be easier to maintain and read
- Don´t use any, always define types
- When a fix or feature is created, bump version in package.json
- Remove unused variables and imports
- Always use const if the variable is not going to be reassigned

### Architecture


##### Repository Pattern

- Use Repository Pattern to separate data access from business logic
- Repositories should only fetch/persist data (without calling other repositories nor applying business rules).
- The name of the interface should be Repository itself and the name of the implementation should be the specification. For example: 

```typescript
interface UserRepository {}

class FirebaseUserRepository implements UserRepository {
    static instance: FirebaseUserRepository;
    // Remaining code...
}

class LocalUserRepository implements UserRepository {
    static instance: LocalUserRepository;
    // Remaining code...
}
```

- Don't use the "I" prefix in the interface name. And don't use the "Impl" suffix in the implementation name.
- A repositry never should call another repository. Make a service or a Use case.
- A repository should always have a static property to be used as a singleton.

##### Domains and Entities

Don't create anemic models, always make a domain wit*Wh attributes and behaviors. 


### Reusable components

- Always try to create pure and resuable components wich receive data as props and callback, for example: QuickMealModal.tsx

#### Created reusable components
- Modal component in `components/ui/Modal.tsx` when you need to create a new modal



