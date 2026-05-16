
describe('Route Protection', () => {
  it('should redirect unauthenticated users to login from /dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
  });

  it('should redirect unauthenticated users to login from /historico', () => {
    cy.visit('/historico');
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

    cy.login();
    cy.visit('/dashboard'); // Test persistence across visit within same test
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');
  });

  it('should allow authenticated user to access /profile', () => {
    cy.login();
    cy.visit('/profile');
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');
  });

  it('should allow authenticated user to access /settings', () => {
    cy.login();
    cy.visit('/settings');
    cy.url().should('include', '/settings');
    cy.get('h2').contains('App Settings').should('be.visible');
  });
});

describe('URL Navigation', () => {
  it('should update URL when clicking navbar links', () => {
    cy.login();

    // Click History in navbar
    cy.get('[data-testid="desktop-nav"]').contains('History').click();
    cy.url().should('include', '/historico');
    cy.get('h2').contains('History').should('be.visible');

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
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');
  });

  it('should update URL when using mobile navigation', () => {
    cy.viewport(375, 667);
    cy.login();

    // Click Profile in avatar menu (Top Navbar)
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('[data-testid="profile-link"]').click();
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');

    // Click Dashboard in bottom navbar
    cy.get('[data-testid="mobile-bottom-nav"]').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');
  });
});

describe('Browser Navigation', () => {
  it('should work with browser back and forward buttons', () => {
    cy.login();

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
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');

    // Click browser forward button
    cy.go('forward');
    cy.url().should('include', '/profile');
    cy.get('h2').contains('My Profile').should('be.visible');
  });
});

describe('Logout Functionality', () => {
  it('should redirect to login when user clicks logout', () => {
    cy.login();

    // Verify user is on dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');

    // Click on user avatar to open dropdown menu
    cy.get('button[aria-label="User menu"]').click();

    // Click logout button
    cy.contains('Logout').click();

    // Should redirect to login page
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');

    // Verify no infinite loading - should see login form quickly
    cy.get('[data-testid="google-signin-button"]').should('not.be.disabled');
  });

  it('should clear user session after logout', () => {
    cy.login();

    // Navigate to a protected route
    cy.visit('/profile');
    cy.url().should('include', '/profile');

    // Logout
    cy.get('button[aria-label="User menu"]').click();
    cy.contains('Logout').click();

    // Try to access protected route again - should redirect to login
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
  });
});

describe('Root Path Redirect', () => {
  it('should redirect authenticated user from / to /dashboard', () => {
    cy.login();

    // Visit root again to test redirect when already authenticated
    cy.visit('/');

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');
  });

  it('should show login page for unauthenticated user at /', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.get('[data-testid="google-signin-button"]').should('be.visible');
  });
});

