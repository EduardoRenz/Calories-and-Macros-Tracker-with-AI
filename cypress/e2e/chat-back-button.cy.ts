describe('Chat Back Button Behavior', () => {
    beforeEach(() => {
        // Accept cookies to prevent banner interference
        cy.acceptCookies();
        cy.session('login', () => {
            cy.login();
        });
        cy.visit('/dashboard')
        // Wait for app to load
        cy.get('#floating-chat-button, #mobile-chat-button', { timeout: 10000 }).should('be.visible');
    });

    it('should close chat when browser back button is pressed on mobile', () => {
        // Open chat
        cy.get('body').then($body => {
            if ($body.find('#floating-chat-button').length > 0) {
                cy.get('#floating-chat-button').click();
            } else {
                cy.get('#mobile-chat-button').click();
            }
        });

        // Wait for chat to open
        cy.get('#chat-input').should('be.visible');

        // Simulate browser back button
        cy.go('back');

        // Chat should be closed
        cy.get('#chat-input').should('not.exist');

        // Chat button should be visible again
        cy.get('#floating-chat-button, #mobile-chat-button').should('be.visible');
    });

    it('should not affect navigation when chat is closed and back button is pressed', () => {
        // Ensure chat is closed initially
        cy.get('#chat-input').should('not.exist');

        // Go to dashboard first
        cy.url().should('include', '/dashboard');

        // Press back button - should go to previous page or stay (depending on history)
        cy.go('back');

        // Should not open chat accidentally
        cy.get('#chat-input').should('not.exist');
    });

});
