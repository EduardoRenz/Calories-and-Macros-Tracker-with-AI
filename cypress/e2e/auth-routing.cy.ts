
const login = () => {
  cy.visit('/');
  cy.url().should('include', '/login');
  cy.contains('Sign in with Google').click();
};


describe('Route Protection', () => {
  it('should redirect unauthenticated users to login from /dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
  });

  it('should redirect unauthenticated users to login from /profile', () => {
    cy.visit('/profile');
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
  });

  it('should redirect unauthenticated users to login from /settings', () => {
    cy.visit('/settings');
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
  });
});

describe('Authenticated User Access', () => {

  it('should allow authenticated user to access /dashboard', () => {

    login();
    cy.visit('/dashboard'); // Test persistence across visit within same test
    cy.url().should('include', '/dashboard');
    cy.get('h2').contains('Dashboard').should('be.visible');
  });

  it('should allow authenticated user to access /profile', () => {
    login();
    cy.visit('/profile');
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');
  });

  it('should allow authenticated user to access /settings', () => {
    login();
    cy.visit('/settings');
    cy.url().should('include', '/settings');
    cy.get('h2').contains('App Settings').should('be.visible');
  });
});

describe('URL Navigation', () => {
  it('should update URL when clicking navbar links', () => {
    login();

    // Click Profile in navbar
    cy.get('[data-testid="desktop-nav"]').contains('Profile').click();
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');

    // Click Settings in navbar
    cy.get('[data-testid="desktop-nav"]').contains('Settings').click();
    cy.url().should('include', '/settings');
    cy.get('h2').contains('App Settings').should('be.visible');

    // Click Dashboard in navbar
    cy.get('[data-testid="desktop-nav"]').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    cy.get('h2').contains('Dashboard').should('be.visible');
  });

  it('should update URL when using mobile bottom navbar', () => {
    cy.viewport(375, 667);
    login();

    // Click Profile in bottom navbar
    cy.get('[data-testid="mobile-nav"]').contains('Profile').click();
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');

    // Click Dashboard in bottom navbar
    cy.get('[data-testid="mobile-nav"]').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    cy.get('h2').contains('Dashboard').should('be.visible');
  });
});

describe('Browser Navigation', () => {
  it('should work with browser back and forward buttons', () => {
    login();

    // Navigate to profile
    cy.get('[data-testid="desktop-nav"]').contains('Profile').click();
    cy.url().should('include', '/profile');

    // Navigate to settings
    cy.get('[data-testid="desktop-nav"]').contains('Settings').click();
    cy.url().should('include', '/settings');

    // Click browser back button
    cy.go('back');
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');

    // Click browser back button again
    cy.go('back');
    cy.url().should('include', '/dashboard');
    cy.get('h2').contains('Dashboard').should('be.visible');

    // Click browser forward button
    cy.go('forward');
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');
  });
});

describe('Root Path Redirect', () => {
  it('should redirect authenticated user from / to /dashboard', () => {
    login();

    // Visit root again to test redirect when already authenticated
    cy.visit('/');

    cy.url().should('include', '/dashboard');
    cy.get('h2').contains('Dashboard').should('be.visible');
  });

  it('should show login page for unauthenticated user at /', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
  });
});

