
describe('Food Analysis Page', () => {
    beforeEach(() => {
        // Login and navigate
        cy.visit('/');
        cy.contains('Sign in with Google').click();
        cy.url().should('include', '/dashboard');
    });

    it('should navigate to Food Analysis page via Profile submenu', () => {
        // Go to Profile page
        cy.visit('/profile');
        cy.url().should('include', '/profile');

        // Click on Food Analysis tab
        cy.contains('a', 'Food Analysis').click();
        cy.url().should('include', '/food-analysis');

        // Verify page title is visible
        cy.contains('h1', 'Food Analysis').should('be.visible');
    });

    it('should display generate report button on initial load', () => {
        cy.visit('/food-analysis');

        // Verify generate button is visible
        cy.get('#generate-report-btn').should('be.visible');
        cy.get('#generate-report-btn').should('contain', 'Generate Report');
    });

    it('should show date range selector buttons', () => {
        cy.visit('/food-analysis');

        // Verify date range options
        cy.contains('button', 'Last 7 Days').should('be.visible');
        cy.contains('button', 'This Month').should('be.visible');
        cy.contains('button', 'Last 3 Months').should('be.visible');
    });

    it('should generate report and display all sections', () => {
        cy.visit('/food-analysis');

        // Click generate report
        cy.get('#generate-report-btn').click();

        // Wait for progress bar to appear
        cy.get('#progress-container').should('be.visible');
        cy.get('#progress-bar').should('exist');

        // Wait for report to be generated (mock service has 1.5s delay)
        cy.get('#common-foods-section', { timeout: 10000 }).should('be.visible');
        cy.get('#vitamins-section').should('be.visible');
        cy.get('#attention-points-section').should('be.visible');
        cy.get('#suggestions-section').should('be.visible');
    });

    it('should display common foods with meal cards', () => {
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn').click();

        // Wait for common foods section
        cy.get('#common-foods-section', { timeout: 10000 }).within(() => {
            // Verify meal cards exist
            cy.contains('Breakfast').should('be.visible');
            cy.contains('Lunch').should('be.visible');
            cy.contains('Dinner').should('be.visible');
            cy.contains('Snacks').should('be.visible');

            // Verify consistency percentage is shown
            cy.contains('Consistency').should('be.visible');
        });
    });

    it('should display vitamin status indicators', () => {
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn').click();

        cy.get('#vitamins-section', { timeout: 10000 }).within(() => {
            // Verify sufficient & moderate group vitamins exist
            cy.contains('Vit A').should('be.visible');
            cy.contains('Vit C').should('be.visible');
            cy.contains('Vitamin D').should('be.visible');

            // Verify group headers exist (new grouped layout)
            cy.contains('Sufficient').should('be.visible');
            cy.contains('Deficient').should('be.visible');

            // Verify recommendations appear for deficient vitamin
            cy.contains('Recommendations').should('be.visible');
        });
    });

    it('should display attention points', () => {
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn').click();

        cy.get('#attention-points-section', { timeout: 10000 }).within(() => {
            // Verify attention point cards exist with mock data
            cy.contains('Sodium').should('be.visible');
            cy.contains('Fiber').should('be.visible');
        });
    });

    it('should display macro suggestions with recommendations', () => {
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn').click();

        cy.get('#suggestions-section', { timeout: 10000 }).within(() => {
            // Verify macro suggestion with goal
            cy.contains('Protein').should('be.visible');

            // Verify recommended additions
            cy.contains('Recommended Additions').should('be.visible');
        });
    });

    it('should cache report and load from cache on page refresh', () => {
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn').click();

        // Wait for report to be generated
        cy.get('#common-foods-section', { timeout: 10000 }).should('be.visible');

        // Refresh the page
        cy.reload();

        // Report should load immediately from cache (no generate button)
        cy.get('#generate-report-btn').should('not.exist');
        cy.get('#common-foods-section').should('be.visible');
    });

    it('should allow regenerating report by clearing cache', () => {
        cy.visit('/food-analysis');
        cy.get('#generate-report-btn').click();

        // Wait for report
        cy.get('#common-foods-section', { timeout: 10000 }).should('be.visible');

        // Click regenerate link
        cy.contains('Clear cache and regenerate').click();

        // Generate button should appear again
        cy.get('#generate-report-btn').should('be.visible');
    });

    it('should navigate back to profile page', () => {
        cy.visit('/food-analysis');

        // Click back to profile link
        cy.contains('Back to Profile').click();
        cy.url().should('include', '/profile');
    });
});
