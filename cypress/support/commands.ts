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
      login(profileState?: "false" | "true" | "partial"): Chainable
      upgradeSubscription(): Chainable
      setAiAccessMode(mode: "disabled" | "premium_only" | "free_plan_api_keys_only" | "open"): Chainable
      setFeatureRequirement(feature: string, minPlan: "free" | "free_plan_api_keys" | "premium"): Chainable
      acceptCookies(): Chainable
      declineCookies(): Chainable
      setCookieConsent(consent: "accepted" | "declined" | "none"): Chainable
    }
  }
}

// Force the app UI to English for deterministic tests. The app auto-detects the
// browser language (contexts/LanguageContext.tsx), so tests asserting English
// strings would break on non-English machines unless we pin the language before
// the app initializes. We set the stored language AND override navigator.language
// so even the auto-detect fallback resolves to English regardless of machine locale.
Cypress.Commands.overwrite("visit", (originalFn, url, options) => {
  // Append a unique query param so every visit forces a GENUINE page load.
  // Cypress's test-isolation can pre-load the AUT at the exact target URL
  // WITHOUT running onBeforeLoad; a same-URL visit is then a no-op and the app
  // initializes without our language injection (empty storage + pt-BR system
  // locale -> renders Portuguese). A unique URL guarantees onBeforeLoad runs.
  const appendUniqueParam = (target: string): string => {
    const hashIdx = target.indexOf("#")
    const base = hashIdx >= 0 ? target.slice(0, hashIdx) : target
    const hash = hashIdx >= 0 ? target.slice(hashIdx) : ""
    const separator = base.includes("?") ? "&" : "?"
    return `${base}${separator}cypress_v=${Date.now()}${hash}`
  }
  const opts = {
    ...options,
    onBeforeLoad(win: Cypress.AUTWindow) {
      try {
        Object.defineProperty(win.navigator, "language", {
          value: "en-US",
          configurable: true,
        })
      } catch {
        // Fallback: if navigator.language is not overridable, rely on the stored key.
      }
      win.localStorage.setItem("calories-tracker-language", "en")
      if (options?.onBeforeLoad) {
        return options.onBeforeLoad(win)
      }
    },
  }
  return originalFn(typeof url === "string" ? appendUniqueParam(url) : url, opts)
})

// Best-effort: also pin the language on app-initiated navigations, which do not
// go through cy.visit's onBeforeLoad. (Note: this does NOT fire on reloads in
// this Cypress/Electron setup, so cy.login() forces a unique-URL navigation
// instead of relying on reloads.)
Cypress.on("window:before:load", (win) => {
  try {
    Object.defineProperty(win.navigator, "language", {
      value: "en-US",
      configurable: true,
    })
  } catch {
    // Some environments make navigator.language non-configurable.
  }
  try {
    win.localStorage.setItem("calories-tracker-language", "en")
  } catch {
    // e.g. about:blank has no localStorage.
  }
})

Cypress.Commands.add("login", (profileState = "false") => {
  cy.visit("/", {
    onBeforeLoad(win) {
      win.sessionStorage.setItem("mock_use_incomplete_profile", profileState)
    },
  })
  // Landing Page is rendered at '/' for unauthenticated users.
  // Follow the first available "Login" link/button to reach the /login route.
  cy.get('a[href="/login"]', { timeout: 10000 }).first().click({ force: true })
  cy.url().should("include", "/login")
  cy.contains("Sign in with Google").click()
  // Wait for the post-login navigation to complete before returning, so tests
  // interact with the settled dashboard/setup page instead of a mid-transition
  // or unauthenticated view (which caused flaky "content not found" timeouts).
  cy.url().should("not.include", "/login", { timeout: 15000 })
})

Cypress.Commands.add("upgradeSubscription", () => {
  const now = new Date()
  const oneMonthLater = new Date()
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)

  const subscription = {
    id: "premium",
    userId: "mock-user-id",
    planId: "premium",
    planCode: "premium_monthly",
    status: "active",
    accessStatus: "premium",
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: oneMonthLater.toISOString(),
    cancelAtPeriodEnd: false,
    isTrial: false,
  }

  cy.window().then((win) => {
    win.localStorage.setItem("mock_subscription_upgraded", JSON.stringify(subscription))
  })
})

Cypress.Commands.add("setAiAccessMode", (mode) => {
  cy.window().then((win) => {
    win.localStorage.setItem("feature_flag_ai_access_mode", `"${mode}"`)
  })
})

Cypress.Commands.add("setFeatureRequirement", (feature, minPlan) => {
  cy.window().then((win) => {
    const current = JSON.parse(win.localStorage.getItem("feature_flag_feature_requirements") || "{}")
    current[feature] = { min_plan: minPlan }
    win.localStorage.setItem("feature_flag_feature_requirements", JSON.stringify(current))
  })
})

Cypress.Commands.add("setCookieConsent", (consent) => {
  cy.window().then((win) => {
    if (consent === "none") {
      win.localStorage.removeItem("levemente-cookie-consent")
    } else {
      win.localStorage.setItem("levemente-cookie-consent", consent)
    }
  })
})

Cypress.Commands.add("acceptCookies", () => {
  cy.setCookieConsent("accepted")
})

Cypress.Commands.add("declineCookies", () => {
  cy.setCookieConsent("declined")
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
