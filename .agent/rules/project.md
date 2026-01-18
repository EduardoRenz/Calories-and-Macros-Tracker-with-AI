---
trigger: always_on
---

### Overall Rules

- This project uses yarn
- When a new page with new domains, repositories and services is created, also create mocked versions of it and configure in the factory.
- When a new page is created, also make a new test in cypress for this page.
- When implementing repositories and service, use the tool ConcurrencyRequestManager to avoid multiple api calls
- Always make Small and Readable Components in pages to be easier to maintain and read
- Don´t use any, always define types
- When a fix or feature is created, bump version in package.json
- Remove unused variables and imports
- Always use const if the variable is not going to be reassigned
- The project uses l18n, always make a translation for every text. fallback to key if translation not exists to be visible the missing translation
- Every Page should have a Error handling, giving a feedback to user, and an option to retry. And always inform the user what happened


### Testing

- When testing the application, in the browser or cypress, use the `yarn dev:mock` command to start the app in mock mode, To run test, use the command `yarn cy:run`

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

---

### Reusable components

- Always try to create pure and resuable components wich receive data as props and callback, for example: QuickMealModal.tsx
- **Always componentize UI sections** that can be reused or that make the page code cleaner and more maintainable
- Extract navigation, headers, forms, and any repeating UI patterns into separate components
- Components should be small, focused on a single responsibility, and easy to test

#### Example: Navigation Componentization

Instead of having inline navigation JSX in a page:

```typescript
// ❌ BAD - Inline navigation in page
<section className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
    <div>
        <h2 className="text-3xl font-bold">{t('dashboard.title')}</h2>
        <p className="text-healthpal-text-secondary mt-1">{displayDate}</p>
    </div>
    <div className="flex items-center gap-2">
        {!isToday && (
            <button onClick={handleGoToToday} className="bg-healthpal-card text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all">
                {t('dashboard.today')}
            </button>
        )}
        <button onClick={() => handleDateChange(-1)} className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
            <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button onClick={() => handleDateChange(1)} className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
            <ChevronRightIcon className="h-5 w-5" />
        </button>
    </div>
</section>
```

Create a reusable component:

```typescript
// ✅ GOOD - Componentized navigation
interface DashboardNavigationProps {
    currentDate: Date;
    isToday: boolean;
    displayDate: string;
    onDateChange: (days: number) => void;
    onGoToToday: () => void;
    todayLabel: string;
    title: string;
}

export default function DashboardNavigation({
    currentDate,
    isToday,
    displayDate,
    onDateChange,
    onGoToToday,
    todayLabel,
    title,
}: DashboardNavigationProps) {
    return (
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold">{title}</h2>
                <p className="text-healthpal-text-secondary mt-1">{displayDate}</p>
            </div>
            <div className="flex items-center gap-2">
                {!isToday && (
                    <button onClick={onGoToToday} className="bg-healthpal-card text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all">
                        {todayLabel}
                    </button>
                )}
                <button onClick={() => onDateChange(-1)} className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDateChange(1)} className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
        </section>
    );
}

// Usage in page:
<DashboardNavigation
    currentDate={currentDate}
    isToday={isToday}
    displayDate={displayDate}
    onDateChange={handleDateChange}
    onGoToToday={handleGoToToday}
    todayLabel={t('dashboard.today')}
    title={t('dashboard.title')}
/>

---

```
#### Created reusable components and utils
- Modal component in `components/ui/Modal.tsx` when you need to create a new modal
- Use DataCacheManager when needs to use a cache sytem, do not recreate a cache system

---

#### Feature Flag system

- This projects uses Feature Flags to enable and disable some resources. The repository is FeatureFlagRepository
- Always check if the new feature should pass in a feature flag criterion before creating
- Check the useFeatureFlags context