
// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Accept cookies by default in all tests to prevent banner interference
// beforeEach(() => {
    // cy.acceptCookies();
// });

// Prevent benign uncaught exceptions (like hydration mismatches under test locales) from crashing tests
Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});
