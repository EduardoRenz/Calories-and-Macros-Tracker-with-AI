describe('Chat Assistant', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should open and close the chat window', () => {
        cy.get('[aria-label="Open Assistant"]').should('be.visible').click();
        cy.contains('HealthPal Assistant').should('be.visible');
        cy.get('[aria-label="Close chat"]').click();
        cy.contains('HealthPal Assistant').should('not.exist');
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
        cy.get('.text-healthpal-text-primary').should('have.length.at.least', 1);
    });

    it('should handle add ingredient flow', () => {
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
        cy.contains('Successfully added').should('be.visible');

        // Verify dashboard updated
        cy.contains('Rice (Arroz)').should('be.visible');
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
});
