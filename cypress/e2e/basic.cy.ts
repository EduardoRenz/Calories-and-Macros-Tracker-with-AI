
describe('Basic Application Flow', () => {
  const loginFromLanding = () => {
    cy.visit('/');
    // Landing Page is rendered at '/' for unauthenticated users.
    cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
    // Follow a CTA to reach /login.
    cy.get('a[href="/login"]').first().click();
    cy.url().should('include', '/login');
    cy.contains('Sign in with Google').click();
  };

  it('should show landing page when not authenticated', () => {
    cy.visit('/');
    // Should be on landing page, not /login.
    cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
  });

  it('should allow login with mock credentials', () => {
    loginFromLanding();

    // The app should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Check for Dashboard elements
    cy.contains('Dashboard'); 
    cy.contains('Calories');
    
    // Verify user avatar is present (Mock user has photoURL)
    cy.get('[data-testid="avatar"]').should('be.visible');
  });

  it('should navigate to different pages and update URL', () => {
    loginFromLanding();
    
    // Should be at dashboard
    cy.url().should('include', '/dashboard');
    
    // Navigate to profile
    cy.get('nav').contains('Profile').click();
    cy.url().should('include', '/profile');
    
    // Navigate to settings
    cy.get('nav').contains('Settings').click();
    cy.url().should('include', '/settings');
  });
});
