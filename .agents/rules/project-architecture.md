---
trigger: always_on
---


### Architecture

The purpuse of this project is use Clean Architecture and SOLID principles.

The interfaces and pages `must` be `Agnostics` in relation of external services and API`s, should always call an getInstance of an abstraction.
Avoid calling services directly, always use the abstraction.

For example: Instead of calling Feature Flags direclty calling the Firebase Libs, use the FeatureFlagRepository. Especciali through the factory.

When a new page with new domains, repositories and services is created, also create mocked versions of it and configure in the factory.


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


##### Singleton Pattern

This project uses Singleton Pattern for repositories and services.
Usually the singleton is created in Factories, like in `ServiceFactory`, `RepositoryFactory`, etc.
Every repository and service should have a static instance property. and a method to getInstance.

---

##### Domains and Entities

Don't create anemic models, always make a domain with attributes and behaviors. 

For example

Wrong:

```typescript
interface User {
    name: string;
    email: string;
    password: string;
}
```

Right:

```typescript
class User {
    private name: string;
    private email: string;
    private password: string;

    constructor(name: string, email: string, password: string) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Behaviors
    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
    }

    public getPassword(): string {
        return this.password;
    }

    public create({ name, email, password }: { name: string; email: string; password: string }): User {
        // Business logic here
        return new User(name, email, password);
    }
}
```

---

#### Created reusable components and utils
- Modal component in `components/ui/Modal.tsx` when you need to create a new modal
- Use DataCacheManager when needs to use a cache sytem, do not recreate a cache system

---

#### Feature Flag system

- This projects uses Feature Flags to enable and disable some resources. The repository is FeatureFlagRepository
- Always check if the new feature should pass in a feature flag criterion before creating
- Check the useFeatureFlags context