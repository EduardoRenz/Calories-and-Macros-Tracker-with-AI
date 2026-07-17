describe('Feature Flags', () => {
    const login = () => {
        // Accept cookies to prevent banner interference
        cy.acceptCookies();
        cy.visit('/');
        // Landing Page is rendered at '/' for unauthenticated users.
        cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
        cy.get('a[href="/login"]').first().click();
        cy.url().should('include', 'login');
        cy.contains('Sign in with Google').click();
    };

    describe('ENABLE_PLANS', () => {
        it('should redirect from /plans to /dashboard when enable_plans is false', () => {
            cy.visit('/plans', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('feature_flag_enable_plans', 'false');
                },
            });
            // Wait for feature flags to load and redirect to complete
            cy.url().should('include', '/dashboard');
        });

        it('should redirect from /checkout to /dashboard when enable_plans is false', () => {
            login();
            cy.visit('/checkout?planId=plano_anual', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('feature_flag_enable_plans', 'false');
                },
            });
            // Wait for feature flags to load and redirect to complete
            cy.url().should('include', '/dashboard');
        });

        it('should hide SubscriptionCard and BillingHistory in settings when enable_plans is false', () => {
            login();
            cy.visit('/settings', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('feature_flag_enable_plans', 'false');
                },
            });
            // Wait for page to load and feature flags to be applied
            cy.contains('Settings').should('be.visible');
            cy.contains('Subscription').should('not.exist');
            cy.contains('Billing History').should('not.exist');
        });

        it('should hide LoginPlansCard in login when enable_plans is false', () => {
            cy.visit('/login', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('feature_flag_enable_plans', 'false');
                },
            });
            // Wait for page to load and feature flags to be applied
            cy.contains('Sign in with Google').should('be.visible');
            cy.contains('View Plans').should('not.exist');
        });

        it('should show /plans when enable_plans is true', () => {
            cy.visit('/plans', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('feature_flag_enable_plans', 'true');
                },
            });
            // Wait for page to load and feature flags to be applied
            cy.url().should('include', '/plans');
            cy.contains('Choose your plan').should('be.visible');
        });
    });
});
