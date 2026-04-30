describe('Payment Flow (Mock Mode)', () => {
    // Use mock mode to avoid external calls and use MockPaymentGateway
    // We assume USE_MOCKS=true logic or that we can force it, 
    // but here we are testing the UI flow which should work regardless if logic handles it.
    // Actually, the app reads env vars. 
    // We can visit the page and check elements.

    beforeEach(() => {
        // Clear any existing auth state
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();
        // Ensure we are logged out or clean state for some tests?
        // Or just start.
    });

    it('should display plans on the public plans page', () => {
        cy.visit('/plans');

        // Check if plans are loaded
        cy.contains('Choose your plan').should('be.visible');

        // Check for "Free Plan"
        cy.contains('Free').should('be.visible');

        // Check for pricing (mock default is USD)
        cy.contains('$0').should('be.visible');
        cy.contains('Monthly').should('be.visible');
        cy.contains('Annual').should('be.visible');
    });

    it('should toggle currency based on language', () => {
        // We need to simulate language change. 
        // The app likely uses logic to detect language or we can set it via localStorage if possible.
        // The `LanguageContext` reads from localStorage 'calories-tracker-language'.

        cy.visit('/plans', {
            onBeforeLoad(win) {
                win.localStorage.setItem('calories-tracker-language', 'pt');
            },
        });

        cy.contains('Gratuito').should('be.visible'); // Free Plan in PT
        cy.contains('R$').should('be.visible'); // Currency BRL
    });

    it('should redirect unauthenticated user to login when clicking upgrade', () => {
        cy.visit('/plans');
        // Click on a paid plan button (not free)
        // Use .first() to pick one if multiple match, or target specific text
        cy.contains('Monthly Plan').parents('div').contains('button', 'Upgrade to Member').click();

        // Expect redirect to login
        cy.url().should('include', '/login');
    });

    it('should allow authenticated user to proceed to checkout', () => {
        // Mock login
        cy.visit('/login');
        // Login page only has Google Sign In in this app version
        cy.contains('Sign in with Google').click();

        // Wait for dashboard
        cy.url().should('include', '/dashboard');

        // Go to Plans with annual billing
        cy.visit('/plans?billing=year');

        // Verify we are still logged in by checking we're not on login page
        cy.url().should('include', '/plans');

        // Click Upgrade
        // "Annual Plan" (plano_anual) is the yearly billing option
        cy.contains('Annual Plan').parents('div').contains('button', 'Upgrade to Member').click();

        // Should go to checkout
        cy.url().should('include', '/checkout');
        cy.contains('Checkout').should('be.visible');
        cy.contains('Total due').should('be.visible');
    });

    it('should proceed to hosted checkout and show redirect notice', () => {
        // Re-login
        cy.visit('/login');
        cy.contains('Sign in with Google').click();
        cy.url().should('include', '/dashboard');

        // Visit checkout directly with a planId
        cy.visit('/checkout?planId=plano_anual');


        // Click Confirm and Pay
        cy.contains('Confirm and Pay').click();

        // In Mock Mode, MockPaymentGateway returns the successUrl as the checkoutUrl
        // So we expect a redirect back to dashboard with success param
        cy.url().should('include', '/dashboard');
        cy.url().should('include', 'payment_success=true');
    });
});
