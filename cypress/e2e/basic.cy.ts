
describe('Basic Application Flow', () => {
  it('should show login page when not authenticated', () => {
    cy.visit('/');
    // Should be on login page
    cy.url().should('include', '/login');
    cy.contains('Sign in with Google');
  });

  it('should allow login with mock credentials', () => {
    cy.visit('/');
    
    // Click the "Sign in with Google" button
    cy.contains('Sign in with Google').click();

    // The app should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Check for Dashboard elements
    cy.contains('Dashboard'); 
    cy.contains('Calories');
    
    // Verify user avatar is present (Mock user has photoURL)
    cy.get('[data-testid="avatar"]').should('be.visible');
  });

  it('should navigate to different pages and update URL', () => {
    cy.visit('/');
    cy.contains('Sign in with Google').click();
    
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
