/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//


export {}

declare global {
  namespace Cypress {
    interface Chainable {
      login(profileState?: 'false' | 'true' | 'partial'): Chainable
    }
  }
}

Cypress.Commands.add('login', (profileState = 'false') => {
    cy.visit('/', {
        onBeforeLoad(win) {
            win.sessionStorage.setItem('mock_use_incomplete_profile', profileState);
        },
    });
    cy.url().should('include', 'login');
    cy.contains('Sign in with Google').click();
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
