describe('Cookie Consent Banner', () => {
    beforeEach(() => {
        // Clear localStorage to remove any existing consent
        cy.window().then((win) => {
            win.localStorage.clear();
            win.localStorage.setItem('calories-tracker-language', 'pt');
        });
        cy.login();
        // Clear cookie consent after login to test banner behavior
        cy.window().then((win) => {
            win.localStorage.removeItem('levemente-cookie-consent');
        });
    });

    it('should show cookie consent banner when no consent is given', () => {
        // Banner should be visible
        cy.contains('Uso de Cookies').should('be.visible');
        cy.contains('Aceitar Todos').should('be.visible');
        cy.contains('Recusar Todos').should('be.visible');
    });

    it('should hide banner after accepting cookies', () => {
        // Banner should be visible initially
        cy.contains('Uso de Cookies').should('be.visible');

        // Click accept (this triggers page reload)
        cy.contains('Aceitar Todos').click();

        // Wait for reload to complete
        cy.url().should('include', '/dashboard');

        // Banner should be hidden after reload
        cy.contains('Uso de Cookies').should('not.exist');
    });

    it('should hide banner after declining cookies', () => {
        // Banner should be visible initially
        cy.contains('Uso de Cookies').should('be.visible');

        // Click decline
        cy.contains('Recusar Todos').click();

        // Banner should be hidden
        cy.contains('Uso de Cookies').should('not.exist');
    });

    it('should not show banner when cookies are already accepted', () => {
        // Accept cookies before visiting
        cy.setCookieConsent('accepted');

        // Reload to apply the consent
        cy.reload();

        // Banner should not be visible
        cy.contains('Uso de Cookies').should('not.exist');
    });

    it('should not show banner when cookies are already declined', () => {
        // Decline cookies before visiting
        cy.setCookieConsent('declined');

        // Reload to apply the consent
        cy.reload();

        // Banner should not be visible
        cy.contains('Uso de Cookies').should('not.exist');
    });

    it('should show alert in settings page when cookies are declined', () => {
        // Decline cookies
        cy.setCookieConsent('declined');

        // Visit settings page
        cy.visit('/settings');

        // Alert should be visible
        cy.contains('O consentimento de cookies é necessário para salvar chaves de API').should('be.visible');

        // Add token button should be disabled
        cy.contains('Adicionar Token').should('be.disabled');
    });

    it('should not show alert in settings page when cookies are accepted', () => {
        // Accept cookies
        cy.setCookieConsent('accepted');

        // Visit settings page
        cy.visit('/settings');

        // Alert should not be visible
        cy.contains('O consentimento de cookies é necessário para salvar chaves de API').should('not.exist');

        // Add token button should be enabled
        cy.contains('Adicionar Token').should('not.be.disabled');
    });

    it('should re-show banner when show-cookie-consent event is dispatched', () => {
        // Banner should be visible initially (beforeEach removed consent)
        cy.contains('Uso de Cookies').should('be.visible');

        // Accept cookies to hide banner
        cy.contains('Aceitar Todos').click();

        // Wait for reload to complete
        cy.url().should('include', '/dashboard');

        // Banner should be hidden after accepting
        cy.contains('Uso de Cookies').should('not.exist');

        // Dispatch event to show banner
        cy.window().then((win) => {
            win.dispatchEvent(new Event('show-cookie-consent'));
        });

        // Banner should be visible again with proper timeout
        cy.contains('Uso de Cookies', { timeout: 5000 }).should('be.visible');
    });
});
