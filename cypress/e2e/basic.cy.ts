
describe('Basic Application Flow', () => {
  it('should show login page when not authenticated', () => {
    cy.visit('/');
    // The app does not redirect URL, but renders Login component
    cy.contains('Sign in with Google');
  });

  it('should allow login with mock credentials', () => {
    cy.visit('/');
    
    // Click the "Sign in with Google" button
    cy.contains('Sign in with Google').click();

    // The app should render Dashboard now (conditional rendering)
    // Check for Dashboard elements
    cy.contains('Dashboard'); 
    cy.contains('Calories');
    
    // Verify user avatar is present (Mock user has photoURL)
    cy.get('img[alt="User"]').should('be.visible');
  });
});
