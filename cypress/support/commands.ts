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


export { }

declare global {
  namespace Cypress {
    interface Chainable {
      login(profileState?: 'false' | 'true' | 'partial'): Chainable
      upgradeSubscription(): Chainable
      setAiAccessMode(mode: 'disabled' | 'premium_only' | 'free_plan_api_keys_only' | 'open'): Chainable
      setFeatureRequirement(feature: string, minPlan: 'free' | 'free_plan_api_keys' | 'premium'): Chainable
      acceptCookies(): Chainable
      declineCookies(): Chainable
      setCookieConsent(consent: 'accepted' | 'declined' | 'none'): Chainable
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

Cypress.Commands.add('upgradeSubscription', () => {
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  const subscription = {
    id: 'premium',
    userId: 'mock-user-id',
    planId: 'premium',
    planCode: 'premium_monthly',
    status: 'active',
    accessStatus: 'premium',
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: oneMonthLater.toISOString(),
    cancelAtPeriodEnd: false,
    isTrial: false,
  };

  cy.window().then((win) => {
    win.localStorage.setItem('mock_subscription_upgraded', JSON.stringify(subscription));
  });
});

Cypress.Commands.add('setAiAccessMode', (mode) => {
  cy.window().then((win) => {
    win.localStorage.setItem('feature_flag_ai_access_mode', `"${mode}"`);
  });
});

Cypress.Commands.add('setFeatureRequirement', (feature, minPlan) => {
  cy.window().then((win) => {
    const current = JSON.parse(win.localStorage.getItem('feature_flag_feature_requirements') || '{}');
    current[feature] = { min_plan: minPlan };
    win.localStorage.setItem('feature_flag_feature_requirements', JSON.stringify(current));
  });
});

Cypress.Commands.add('setCookieConsent', (consent) => {
  cy.window().then((win) => {
    if (consent === 'none') {
      win.localStorage.removeItem('levemente-cookie-consent');
    } else {
      win.localStorage.setItem('levemente-cookie-consent', consent);
    }
  });
});

Cypress.Commands.add('acceptCookies', () => {
  cy.setCookieConsent('accepted');
});

Cypress.Commands.add('declineCookies', () => {
  cy.setCookieConsent('declined');
});
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
