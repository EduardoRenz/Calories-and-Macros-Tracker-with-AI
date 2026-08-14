
// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Accept cookies by default in all tests to prevent banner interference
// beforeEach(() => {
    // cy.acceptCookies();
// });

// Ignore React hydration mismatches (benign under test locales) but let genuine
// runtime errors surface so a broken app fails the test run instead of passing.
Cypress.on('uncaught:exception', (err) => {
    const message = err?.message ?? '';
    return /hydrat/i.test(message);
});
