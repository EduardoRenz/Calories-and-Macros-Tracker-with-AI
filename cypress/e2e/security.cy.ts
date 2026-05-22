describe('Security - Open Redirect', () => {
  beforeEach(() => {
    // Clear session storage to ensure a clean state for the callback processing key
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('should block external redirects and fall back to dashboard', () => {
    const maliciousUrl = 'https://google.com';
    cy.login();
    cy.window().then((win) => {
      win.sessionStorage.removeItem('auth_callback_processing');
    });
    cy.visit(`/auth/callback?code=mock-code&next=${encodeURIComponent(maliciousUrl)}`);
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', 'google.com');
  });

  it('should block protocol-relative redirects', () => {
    const maliciousUrl = '//evil.com';
    cy.login();
    cy.window().then((win) => {
      win.sessionStorage.removeItem('auth_callback_processing');
    });
    cy.visit(`/auth/callback?code=mock-code&next=${encodeURIComponent(maliciousUrl)}`);
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', 'evil.com');
  });

  it('should block multiple slash redirects', () => {
    const maliciousUrl = '/\\evil.com';
    cy.login();
    cy.window().then((win) => {
      win.sessionStorage.removeItem('auth_callback_processing');
    });
    cy.visit(`/auth/callback?code=mock-code&next=${encodeURIComponent(maliciousUrl)}`);
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', 'evil.com');
  });
});
