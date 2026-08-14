describe('Telemetry isolation in mock mode', () => {
  it('does not load external Google Analytics scripts', () => {
    cy.visit('/');
    cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');

    // The layout must skip third-party analytics when running in mock mode so
    // that e2e runs never pollute production analytics with test events.
    cy.window().then((win) => {
      const gaScripts = Array.from(win.document.scripts).filter((script) =>
        script.src.includes('googletagmanager.com/gtag/js')
      );
      expect(gaScripts.length).to.equal(0);
    });
  });
});
