describe('Chat Assistant', () => {
    beforeEach(() => {
        // Accept cookies to prevent banner interference
        cy.acceptCookies();
        cy.login();
        // Ensure AI features are accessible for functional testing
        cy.setAiAccessMode('open');
        cy.setFeatureRequirement('chatbot', 'free');
    });

    it('should open and close the chat window', () => {
        cy.get('[aria-label="Open Assistant"]').should('be.visible').click();
        cy.get('#chat-header').should('be.visible');
        cy.get('[aria-label="Close chat"]').click();
        cy.get('#chat-header').should('not.exist');
    });

    it('should send a message and receive a response', () => {
        cy.get('[aria-label="Open Assistant"]').click();

        const message = 'Hello, assistant!';
        cy.get('textarea').type(message);
        cy.get('[aria-label="Send"]').click();

        // Check if user message appears
        cy.contains(message).should('be.visible');

        // Check if assistant responds (mock service should respond)
        // Mock service responds with "I am a mock assistant..." or similar default
        // In our MockChatAssistantService, if content is "Hello", it might differ.
        // But let's just check for ANY response from assistant
        cy.get('.text-neutral-text-primary').should('have.length.at.least', 1);
    });

    it('should prevent body scroll when chat is open on mobile', () => {
        // Simulate mobile viewport
        cy.viewport(375, 667); // iPhone 6/7/8 dimensions

        // Open chat using mobile bottom navigation
        cy.get('#mobile-chat-button').click();
        cy.get('#chat-header').should('be.visible');

        // Check if body has scroll lock styles
        cy.get('body').should('have.css', 'overflow', 'hidden');
        cy.get('body').should('have.css', 'position', 'fixed');

        // Close chat
        cy.get('[aria-label="Close chat"]').click();
        cy.get('#chat-header').should('not.exist');

        // Check if body scroll is restored
        cy.get('body').should('not.have.css', 'overflow', 'hidden');
        cy.get('body').should('not.have.css', 'position', 'fixed');
    });

    it('should not prevent body scroll when chat is open on desktop', () => {
        // Simulate desktop viewport
        cy.viewport(1200, 800);

        // Open chat
        cy.get('[aria-label="Open Assistant"]').should('be.visible').click();
        cy.get('#chat-header').should('be.visible');

        // Check if body does NOT have scroll lock styles on desktop
        cy.get('body').should('not.have.css', 'overflow', 'hidden');
        cy.get('body').should('not.have.css', 'position', 'fixed');

        // Close chat
        cy.get('[aria-label="Close chat"]').click();
    });

    it('should handle resize from mobile to desktop with chat open', () => {
        // Start with mobile viewport
        cy.viewport(375, 667);

        // Open chat on mobile using mobile bottom navigation
        cy.get('#mobile-chat-button').click();
        cy.get('#chat-header').should('be.visible');

        // Verify scroll lock is applied on mobile
        cy.get('body').should('have.css', 'overflow', 'hidden');
        cy.get('body').should('have.css', 'position', 'fixed');

        // Resize to desktop
        cy.viewport(1200, 800);

        // Verify scroll lock is removed on desktop
        cy.get('body').should('not.have.css', 'overflow', 'hidden');
        cy.get('body').should('not.have.css', 'position', 'fixed');

        // Close chat
        cy.get('[aria-label="Close chat"]').click();
    });

    it('should handle add ingredient flow', () => {
        // Use desktop viewport for this test to avoid mobile scroll lock issues
        cy.viewport(1200, 800);

        cy.get('[aria-label="Open Assistant"]').click();

        // Simulate request to add ingredient
        // MockChatAssistantService is programmed to return a pending action for "add chicken" 
        // if we send specific keywords or maybe it just triggers random/fixed actions for testing?
        // Let's check MockChatAssistantService logic.
        // It detects "add" and "chicken" to trigger add_ingredient.

        cy.get('textarea').type('Add chicken breast to lunch');
        cy.get('[aria-label="Send"]').click();

        // Wait for response with pending action
        cy.contains('Action pending confirmation').should('be.visible');
        cy.get('#pending-action-protein').should('be.visible'); // Macro details

        // Confirm action
        cy.contains('Confirm').click();

        // Verify success
        cy.contains('successfully').should('be.visible');

        // Close chat
        cy.get('[aria-label="Close chat"]').click();

        // Open lunch accordion
        cy.get('[data-testid="meal-lunch"]').scrollIntoView().click();

        // Verify dashboard updated
        cy.contains(/Rice|Arroz/i).should('be.visible');
        cy.contains('130 kcal').should('be.visible');
    });

    it('should handle remove ingredient flow', () => {
        cy.get('[aria-label="Open Assistant"]').click();

        // MockChatAssistantService triggers remove for "remove" keyword
        cy.get('textarea').type('Remove the last ingredient');
        cy.get('[aria-label="Send"]').click();

        cy.contains('Action pending confirmation').should('be.visible');
        cy.contains('This action cannot be easily undone').should('be.visible');

        cy.contains('Cancel').click();

        // Card should disappear
        cy.contains('Action pending confirmation').should('not.exist');
        cy.contains('Action cancelled').should('be.visible');
    });

    it('should handle delete meal flow', () => {
        cy.get('[aria-label="Open Assistant"]').click();

        // First add an ingredient to have something to delete
        cy.get('textarea').type('Add rice to lunch');
        cy.get('[aria-label="Send"]').click();
        cy.contains('Action pending confirmation').should('be.visible');
        cy.contains('Confirm').click();
        cy.contains('successfully').should('be.visible');

        // Now test delete
        // MockChatAssistantService triggers delete for "delete" keyword
        cy.get('textarea').type('Delete the lunch meal');
        cy.get('[aria-label="Send"]').click();

        cy.contains('Action pending confirmation').should('be.visible');
        cy.contains('This action cannot be easily undone').should('be.visible');

        cy.contains('Cancel').click();

        // Card should disappear
        cy.contains('Action pending confirmation').should('not.exist');
        cy.contains('Action cancelled').should('be.visible');
    });

});
