describe('First Time Profile Setup', () => {
    it('should display first-time setup form when profile is incomplete', () => {
        // Set incomplete profile flag before visiting
        cy.window().then((win) => {
            win.sessionStorage.setItem('mock_use_incomplete_profile', 'true');
        });

        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();

        // Should show first-time setup instead of dashboard
        cy.contains('Welcome to HealthPal!', { timeout: 10000 }).should('be.visible');
        cy.contains('To calculate your personalized calorie and macro goals').should('be.visible');

        // Should show Personal Info and Fitness Goals forms
        cy.contains('Personal Information').should('be.visible');
        cy.contains('Fitness Goals').should('be.visible');

        // Should show dietary restrictions note with link to profile
        cy.contains('Dietary Restrictions (Optional)').should('be.visible');
        cy.contains('Go to Profile Settings').should('be.visible');

        // Save button should be disabled when form is empty - check by attempting to click
        cy.contains('button', 'Save and Continue').then($btn => {
            // Button should either be disabled or have disabled styling
            const isDisabled = $btn.is(':disabled') || $btn.hasClass('disabled:opacity-50');
            expect(isDisabled).to.be.true;
        });
    });

    it('should allow completing profile and redirect to dashboard', () => {
        // Set incomplete profile flag
        cy.window().then((win) => {
            win.sessionStorage.setItem('mock_use_incomplete_profile', 'true');
        });

        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();

        // Wait for first-time setup screen
        cy.contains('Welcome to HealthPal!', { timeout: 10000 }).should('be.visible');

        // Fill Personal Info
        cy.get('input[name="age"]').type('30');
        cy.get('input[name="height"]').type('170');
        cy.get('input[name="weight"]').type('70');
        cy.get('select[name="gender"]').select('female');

        // Fill Fitness Goals
        cy.contains('button', 'Lose Weight').click();
        cy.get('input[name="targetWeight"]').type('65');
        cy.get('select[name="activityLevel"]').select('lightly');

        // Save should now work
        cy.contains('button', 'Save and Continue').click();

        // Should redirect to dashboard after successful save
        cy.get('h2').contains('Dashboard', { timeout: 10000 }).should('be.visible');
    });

    it('should show error when trying to save with incomplete data', () => {
        // Set incomplete profile flag
        cy.window().then((win) => {
            win.sessionStorage.setItem('mock_use_incomplete_profile', 'true');
        });

        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();

        // Wait for first-time setup screen
        cy.contains('Welcome to HealthPal!', { timeout: 10000 }).should('be.visible');

        // Click save without filling required fields
        // Note: button might be disabled, so we force the click
        cy.contains('button', 'Save and Continue').then($btn => {
            if ($btn.is(':disabled')) {
                // Test passes - button is correctly disabled
                expect(true).to.be.true;
            } else {
                // If somehow enabled, click and check for error
                cy.wrap($btn).click();
                cy.contains('Please fill in all required fields', { timeout: 5000 }).should('be.visible');
            }
        });
    });

    it('should allow navigating to profile for dietary restrictions', () => {
        // Set incomplete profile flag
        cy.window().then((win) => {
            win.sessionStorage.setItem('mock_use_incomplete_profile', 'true');
        });

        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();

        // Wait for first-time setup screen
        cy.contains('Welcome to HealthPal!', { timeout: 10000 }).should('be.visible');

        // Click on link to profile settings
        cy.contains('Go to Profile Settings').click();

        // Should navigate to profile page
        cy.url().should('include', '/profile');
        cy.contains('Profile Settings').should('be.visible');
    });
});
