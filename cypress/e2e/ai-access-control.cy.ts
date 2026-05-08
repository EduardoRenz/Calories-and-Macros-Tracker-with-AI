describe('AI Access Control', () => {
    beforeEach(() => {
        // Reset state before each test
        cy.window().then((win) => {
            win.localStorage.clear();
            win.localStorage.setItem('calories-tracker-language', 'pt');
        });
        cy.login();
    });

    it('should block a free user from chat when mode is premium_only', () => {
        cy.get('#floating-chat-button').should('be.visible').click();
        cy.get('textarea').type('Oi Lumi');
        cy.get('[aria-label="Enviar"]').click();
        
        // When clicked, it should show premium requirement error in the chat
        cy.contains('funcionalidade é exclusiva para membros Premium').should('be.visible');
    });

    it('should allow access to chat after upgrading to premium', () => {
        // Initially should be visible
        cy.get('#floating-chat-button').should('be.visible');
        
        // Simulate premium upgrade
        cy.upgradeSubscription();
        cy.reload(); // Reload to refresh context
        
        // Now should be able to open chat and send message
        cy.get('#floating-chat-button').click();
        cy.get('#chat-header').should('be.visible');
        
        cy.get('textarea').type('Hello Lumi');
        cy.get('[aria-label="Enviar"]').click(); // 'Send' is 'Enviar' in pt
        cy.contains('Hello Lumi').should('be.visible');
    });

    it('should block food analysis for free users and allow for premium', () => {
        cy.visit('/food-analysis');
        
        // Button should be visible
        cy.get('#generate-report-btn').should('be.visible').click();
        
        // Should show premium required message (using the PT string from locales)
        cy.contains('funcionalidade é exclusiva para membros Premium').should('be.visible');
        
        // Upgrade
        cy.upgradeSubscription();
        cy.visit('/food-analysis'); // Re-visit instead of reload for cleaner state
        
        // Should now be able to generate
        cy.get('#generate-report-btn', { timeout: 10000 }).should('be.visible').click();
        cy.get('#progress-bar', { timeout: 10000 }).should('be.visible');
    });

    it('should allow free users to use AI features in "open" mode when requirements are met', () => {
        cy.setAiAccessMode('open');
        cy.setFeatureRequirement('chatbot', 'free');
        cy.setFeatureRequirement('food_analysis', 'free');
        
        cy.visit('/dashboard');
        
        // Chat should be accessible
        cy.get('#floating-chat-button').should('be.visible').click();
        cy.get('#chat-header').should('be.visible');
        
        // Food analysis should show generate button and work for free users
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn', { timeout: 10000 }).should('be.visible').click();
        cy.get('#progress-bar', { timeout: 10000 }).should('be.visible');
    });
    
    it('should block all AI features when mode is "disabled"', () => {
        cy.setAiAccessMode('disabled');
        
        cy.visit('/dashboard');
        
        // Chat button should be hidden
        cy.get('#floating-chat-button').should('not.exist');
        
        // Food analysis should show disabled message instead of generate button
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn').should('not.exist');
        cy.contains('recursos de IA estão desativados').should('be.visible');
    });
});
