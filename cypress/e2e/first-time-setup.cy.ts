describe('First Time Profile Setup', () => {
    it('should display first-time setup form when profile is completely empty', () => {
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

        // Save button should be enabled but show error when clicked with empty form
        cy.contains('button', 'Save and Continue').should('not.be.disabled');

        // Click save without filling - should show error with missing fields
        cy.contains('button', 'Save and Continue').click();
        cy.contains('Please fill in all required fields', { timeout: 5000 }).should('be.visible');
    });

    it('should display first-time setup with partial data and allow completion', () => {
        // Set partial profile (age, weight, height filled; gender, goals null)
        cy.window().then((win) => {
            win.sessionStorage.setItem('mock_use_incomplete_profile', 'partial');
        });

        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();

        // Should show first-time setup (profile incomplete)
        cy.contains('Welcome to HealthPal!', { timeout: 10000 }).should('be.visible');

        // Verify partial data is pre-filled
        cy.get('input[name="age"]').should('have.value', '28');
        cy.get('input[name="height"]').should('have.value', '175');
        cy.get('input[name="weight"]').should('have.value', '70');
        cy.get('select[name="gender"]').should('have.value', ''); // not filled

        // Fitness goals should be empty
        cy.get('input[name="targetWeight"]').should('have.value', '');
        cy.get('select[name="activityLevel"]').should('have.value', '');

        // Save button is enabled but shows error when clicked with incomplete data
        cy.contains('button', 'Save and Continue').should('not.be.disabled');
        cy.contains('button', 'Save and Continue').click();
        cy.contains('Please fill in all required fields', { timeout: 5000 }).should('be.visible');

        // Fill remaining required fields
        cy.get('select[name="gender"]').select('female');
        cy.contains('button', 'Lose Weight').click();
        cy.get('input[name="targetWeight"]').type('65');
        cy.get('select[name="activityLevel"]').select('lightly');

        // Save should now work
        cy.contains('button', 'Save and Continue').click();

        // Should redirect to dashboard
        cy.get('h2').contains('Dashboard', { timeout: 10000 }).should('be.visible');
    });

    it('should redirect to dashboard when profile is complete', () => {
        // Set complete profile flag
        cy.window().then((win) => {
            win.sessionStorage.setItem('mock_use_incomplete_profile', 'false');
        });

        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();

        // Should NOT show first-time setup, go directly to dashboard
        cy.get('h2').contains('Dashboard', { timeout: 10000 }).should('be.visible');

        // Verify dashboard elements are present
        cy.contains('button', 'Breakfast').should('be.visible');
        cy.contains('button', 'Lunch').should('be.visible');
        cy.contains('button', 'Dinner').should('be.visible');
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

    it('should show validation error when clicking save with incomplete profile', () => {
        // Set incomplete profile flag
        cy.window().then((win) => {
            win.sessionStorage.setItem('mock_use_incomplete_profile', 'true');
        });

        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();

        // Wait for first-time setup screen
        cy.contains('Welcome to HealthPal!', { timeout: 10000 }).should('be.visible');

        // Verify save button is enabled but shows error with missing fields when clicked
        cy.contains('button', 'Save and Continue').should('not.be.disabled');
        cy.contains('button', 'Save and Continue').click();
        cy.contains('Please fill in all required fields', { timeout: 5000 }).should('be.visible');
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
