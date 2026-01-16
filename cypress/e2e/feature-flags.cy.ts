describe('Feature Flags', () => {
    beforeEach(() => {
        // We use the mock repositories
        cy.visit('/dashboard');
        // Wait for potential loading
        cy.wait(500);
    });

    it('should show Profile in bottom nav when enable_chatbot is false', () => {
        cy.get('[data-testid="mobile-bottom-nav"]').within(() => {
            cy.contains('Perfil').should('be.visible');
            cy.get('a[href="/profile"]').should('exist');
            cy.contains('Assistente').should('not.exist');
        });
    });

    // Note: To test the 'false' case, we would need a way to inject the repository state 
    // or use a different mock. Since we're in a real browser, we might need to 
    // expose a back-door for testing or just rely on manual verification for the 'false' toggle 
    // if the mock is hardcoded. 
    // HOWEVER, we can try to intercept or use the LocalFeatureFlagRepository if we can access it.
});
