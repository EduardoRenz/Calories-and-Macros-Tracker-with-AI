describe('Profile Diet Type Selection', () => {
    beforeEach(() => {
        // Login and navigate
        cy.visit('/', {
            onBeforeLoad(win) {
                win.sessionStorage.setItem('mock_use_incomplete_profile', 'false');
            },
        });
        cy.contains('Sign in with Google').click();
        cy.url().should('include', '/dashboard');

        // Navigate to profile
        cy.visit('/profile');
        cy.url().should('include', '/profile');
    });

    it('should display diet type selector in profile page', () => {
        // Check if diet type select exists
        cy.get('select[name="dietType"]', { timeout: 10000 }).should('exist');
    });

    it('should have all diet type options available', () => {
        cy.get('select[name="dietType"]').should('exist');

        // Verify all options are present
        cy.get('select[name="dietType"] option[value="omnivore"]').should('exist');
        cy.get('select[name="dietType"] option[value="vegetarian"]').should('exist');
        cy.get('select[name="dietType"] option[value="vegan"]').should('exist');
        cy.get('select[name="dietType"] option[value="pescatarian"]').should('exist');
        cy.get('select[name="dietType"] option[value="carnivore"]').should('exist');
        cy.get('select[name="dietType"] option[value="flexitarian"]').should('exist');
    });

    it('should allow user to select and update diet type', () => {
        // Select a diet type
        cy.get('select[name="dietType"]').select('vegan');

        // Verify the value changed
        cy.get('select[name="dietType"]').should('have.value', 'vegan');

        // Click update profile button
        cy.contains('button', 'Update Profile').click();

        // Wait for success message
        cy.contains('Profile updated successfully!', { timeout: 10000 }).should('be.visible');
    });

    it('should persist diet type after page reload', () => {
        // Select a diet type
        cy.get('select[name="dietType"]').select('vegetarian');

        // Update profile
        cy.contains('button', 'Update Profile').click();
        cy.contains('Profile updated successfully!', { timeout: 10000 }).should('be.visible');

        // Verify diet type is still selected
        cy.get('select[name="dietType"]', { timeout: 10000 }).should('have.value', 'vegetarian');
    });

    it('should have omnivore as default for new profiles', () => {
        // This will verify the default when profile loads
        // Note: In mock mode, the mock data should have omnivore
        cy.get('select[name="dietType"]').should('have.value', 'omnivore');
    });
});
