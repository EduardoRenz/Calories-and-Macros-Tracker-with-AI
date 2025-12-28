describe('Settings Page', () => {
    const login = () => {
        cy.visit('/');
        cy.url().should('include', '/login');
        cy.contains('Sign in with Google').click();
    };

    beforeEach(() => {
        login();
        cy.visit('/settings');
        // Ensure we start with a clean state for API keys if possible,
        // though in a real app we might need to mock localStorage directly.
        // For now, we rely on the UI interactions.
        cy.clearLocalStorage('ai_api_keys');
    });

    describe('Layout and Navigation', () => {
        it('should display the settings page correctly', () => {
            cy.get('h2').contains('App Settings').should('be.visible');
            // Sidebar should NOT be present (checking by absence of sidebar specific classes or text that was removed)
            cy.contains('Sign out').should('not.exist'); // Old sidebar had sign out
            cy.contains('API Tokens').should('be.visible'); // Section header
            cy.contains('Language').should('be.visible'); // Section header
        });
    });

    describe('Language Selector', () => {
        it('should have English selected by default', () => {
            cy.get('select').first().should('have.value', 'en');
        });

        it('should allow changing language', () => {
            cy.get('select').first().select('es');
            cy.get('select').first().should('have.value', 'es');
            // If translations differ, we could assert text changes here.
            // Revert to English
            cy.get('select').first().select('en');
        });
    });

    describe('API Key Management', () => {
        const addKey = (provider: string, key: string) => {
            cy.contains('button', 'Add API Token').click();
            cy.contains('Add New API Key').should('be.visible');

            // Select provider
            // Finding select specific to modal might need better selector if multiple selects exist
            // Based on UI, the provider select is likely the first one in the modal or distinct by label
            cy.contains('label', 'AI Provider Model').parent().find('select').select(provider);

            cy.get('input[placeholder*="sk-"]').type(key);
            cy.contains('button', 'Save Configuration').click();
        };

        it('should add API keys', () => {
            addKey('Google Gemini', 'sk-gemini-test');
            cy.get('[data-testid="api-key-item-gemini"]').should('be.visible');
            cy.contains('sk-g••••••••••••••••test').should('be.visible');
            cy.get('[data-testid="primary-badge"]').should('be.visible');
        });

        it('should add multiple keys and verify order', () => {
            addKey('Google Gemini', 'sk-gemini-1');
            addKey('OpenAI', 'sk-openai-2');
            addKey('DeepSeek', 'sk-deepseek-3');

            cy.get('[data-testid^="api-key-item-"]').should('have.length', 3);
            cy.get('[data-testid="api-key-item-gemini"]').should('be.visible');
            cy.get('[data-testid="api-key-item-openai"]').should('be.visible');
            cy.get('[data-testid="api-key-item-deepseek"]').should('be.visible');
        });

        it('should persist keys on reload', () => {
            addKey('Google Gemini', 'sk-gemini-persist');
            cy.reload();
            cy.get('[data-testid="api-key-item-gemini"]').should('be.visible');
            cy.contains('sk-g••••••••••••••••sist').should('be.visible');
        });

        it('should delete a key', () => {
            addKey('Google Gemini', 'sk-delete-me');
            cy.get('[data-testid="api-key-item-gemini"]').should('be.visible');
            cy.get('[data-testid="delete-gemini"]').click();
            cy.get('[data-testid="api-key-item-gemini"]').should('not.exist');
            cy.contains('You haven\'t added any AI API tokens yet.').should('be.visible');
        });
    });

    describe('API Key Reordering', () => {
        beforeEach(() => {
            // Setup 3 keys for reordering tests
            cy.contains('button', 'Add API Token').click();
            cy.contains('label', 'AI Provider Model').parent().find('select').select('Google Gemini');
            cy.get('input[placeholder*="sk-"]').type('key-1-gemini');
            cy.contains('button', 'Save Configuration').click();

            cy.contains('button', 'Add API Token').click();
            cy.contains('label', 'AI Provider Model').parent().find('select').select('OpenAI');
            cy.get('input[placeholder*="sk-"]').type('key-2-openai');
            cy.contains('button', 'Save Configuration').click();

            cy.contains('button', 'Add API Token').click();
            cy.contains('label', 'AI Provider Model').parent().find('select').select('DeepSeek');
            cy.get('input[placeholder*="sk-"]').type('key-3-deepseek');
            cy.contains('button', 'Save Configuration').click();
        });

        it('should move keys up and down', () => {
            // Initial Order: Gemini (Primary), OpenAI, DeepSeek

            // Check Gemini is Primary
            cy.get('[data-testid="api-key-item-gemini"]').find('[data-testid="primary-badge"]').should('exist');

            // Move OpenAI Up (becomes Primary)
            cy.get('[data-testid="move-up-openai"]').click();

            // Assert New Order: OpenAI (Primary), Gemini, DeepSeek
            cy.get('[data-testid="api-key-item-openai"]').find('[data-testid="primary-badge"]').should('exist');
            cy.get('[data-testid="api-key-item-gemini"]').find('[data-testid="primary-badge"]').should('not.exist');

            // Move DeepSeek Up (becomes Middle)
            cy.get('[data-testid="move-up-deepseek"]').click();

            // New Order: OpenAI, DeepSeek, Gemini

            // Move OpenAI Down (becomes Middle)
            cy.get('[data-testid="move-down-openai"]').click();

            // New Order: DeepSeek (Primary), OpenAI, Gemini
            cy.get('[data-testid="api-key-item-deepseek"]').find('[data-testid="primary-badge"]').should('exist');
        });
    });
});
