
describe('Landing Page', () => {
  beforeEach(() => {
    cy.acceptCookies();
  });

  describe('Section rendering', () => {
    it('should render the sticky navbar with brand and navigation links', () => {
      cy.visit('/');
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
      cy.get('nav').should('exist');
      cy.contains('Levemente').should('be.visible');
    });

    it('should render the hero section with badge, headline, CTAs, phone mockup, and glass card', () => {
      cy.visit('/');
      cy.contains('AI NUTRITION').should('be.visible');
      cy.contains('Smart Nutrition in').should('be.visible');
      cy.contains('Start Now').should('be.visible');
      cy.contains('See How It Works').should('be.visible');
      cy.get('span.material-symbols-outlined').contains('restaurant_menu').should('be.visible');
    });

    it('should render the benefits section with id="benefits" and 3 bento cards', () => {
      cy.visit('/');
      cy.get('section#benefits').should('be.visible');
      cy.contains('60 Seconds').should('be.visible');
      cy.contains('Zero Spreadsheets').should('be.visible');
      cy.contains('Direct Insights').should('be.visible');
    });

    it('should render the AI features section with id="how-it-works", brain, and 2 sub-features', () => {
      cy.visit('/');
      cy.get('section#how-it-works').should('be.visible');
      cy.contains('Intelligence Engine').should('be.visible');
      cy.contains('Natural Input').should('be.visible');
      cy.contains('Instant Calculation').should('be.visible');
    });

    it('should render the clinical focus section with badge and condition cards', () => {
      cy.visit('/');
      cy.contains('Clinical Health').should('be.visible');
      cy.contains('Focus on Medical Conditions').should('be.visible');
      cy.contains('Diabetes').should('be.visible');
      cy.contains('Intolerances').should('be.visible');
    });

    it('should render the features gallery section with id="features" and demo cards', () => {
      cy.visit('/');
      cy.get('section#features').should('be.visible');
      cy.contains('Daily Dashboard').should('be.visible');
      cy.contains('Simple Logging').should('be.visible');
    });

    it('should render the pricing section with id="pricing" and plan cards', () => {
      cy.visit('/');
      cy.get('section#pricing', { timeout: 15000 }).should('be.visible');
      cy.contains('Simple and Transparent Plans').should('be.visible');
    });

    it('should render the bottom CTA section with id="login" and a single button to /login', () => {
      cy.visit('/');
      cy.get('section#login').should('be.visible');
      cy.contains('Ready to transform your routine?').should('be.visible');
      cy.get('section#login a[href="/login"]').should('have.length', 1);
    });

    it('should render the footer with copyright and legal links', () => {
      cy.visit('/');
      cy.contains('© 2024 Levemente. All rights reserved.').should('be.visible');
      cy.contains('Privacy Policy').should('be.visible');
      cy.contains('Terms of Service').should('be.visible');
    });
  });

  describe('Anchor link scrolling', () => {
    it('should scroll to #features when clicking the features navbar anchor', () => {
      cy.visit('/');
      cy.get('nav').contains('Features').click();
      cy.get('section#features').should('be.visible');
    });

    it('should scroll to #benefits when clicking the benefits navbar anchor', () => {
      cy.visit('/');
      cy.get('nav').contains('Benefits').click();
      cy.get('section#benefits').should('be.visible');
    });

    it('should scroll to #pricing when clicking the pricing navbar anchor', () => {
      cy.visit('/');
      cy.get('nav').contains('Pricing').click();
      cy.wait(500);
      cy.get('section#pricing', { timeout: 10000 }).should('be.visible');
    });

    it('should scroll to #how-it-works when clicking the hero secondary CTA', () => {
      cy.visit('/');
      cy.contains('See How It Works').click();
      cy.get('section#how-it-works').should('be.visible');
    });
  });

  describe('CTA button redirects', () => {
    it('should navigate to /login when clicking the Navbar Login link', () => {
      cy.visit('/');
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
      cy.get('nav').contains('Login').click();
      cy.url().should('include', '/login');
      cy.get('[data-testid="google-signin-button"]').should('be.visible');
    });

    it('should navigate to /login when clicking the Navbar Get Started button', () => {
      cy.visit('/');
      cy.get('nav').contains('Get Started').click();
      cy.url().should('include', '/login');
      cy.get('[data-testid="google-signin-button"]').should('be.visible');
    });

    it('should navigate to /login when clicking the Hero Start Now button', () => {
      cy.visit('/');
      cy.get('a[href="/login"]').contains('Start Now').click();
      cy.url().should('include', '/login');
      cy.get('[data-testid="google-signin-button"]').should('be.visible');
    });

    it('should navigate to /login when clicking the Bottom CTA Start Now button', () => {
      cy.visit('/');
      cy.get('section#login a[href="/login"]').click();
      cy.url().should('include', '/login');
      cy.get('[data-testid="google-signin-button"]').should('be.visible');
    });
  });

  describe('Routing', () => {
    it('should render the landing page at / when unauthenticated', () => {
      cy.visit('/');
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
    });

    it('should redirect authenticated user from / to /dashboard', () => {
      cy.login();
      cy.visit('/');
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');
    });

    it('should render the landing page at /landing-page for all users', () => {
      cy.visit('/landing-page');
      cy.contains('Levemente').should('be.visible');
      cy.contains('Smart Nutrition in').should('be.visible');
    });
  });

  describe('Pricing feature flag', () => {
    it('should hide the pricing section when ENABLE_PLANS is false', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('feature_flag_enable_plans', 'false');
        },
      });
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
      cy.get('section#pricing').should('not.exist');
    });

    it('should show the pricing section when ENABLE_PLANS is true', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('feature_flag_enable_plans', 'true');
        },
      });
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
      cy.get('section#pricing', { timeout: 15000 }).should('be.visible');
    });
  });

  describe('Theme switching', () => {
    it('should toggle to dark mode and persist', () => {
      cy.visit('/');
      cy.get('button[title="Dark"]').click();
      cy.get('html').should('have.class', 'dark');
    });

    it('should toggle back to light mode', () => {
      cy.visit('/');
      cy.get('button[title="Dark"]').click();
      cy.get('html').should('have.class', 'dark');
      cy.get('button[title="Light"]').click();
      cy.get('html').should('not.have.class', 'dark');
    });
  });

  describe('Language switching', () => {
    it('should switch to English and update landing strings', () => {
      cy.visit('/');
      cy.contains('EN').click();
      cy.contains('Features').should('be.visible');
      cy.contains('Benefits').should('be.visible');
      cy.contains('Pricing').should('be.visible');
    });

    it('should switch to Spanish and update landing strings', () => {
      cy.visit('/');
      cy.contains('ES').click();
      cy.contains('Características').should('be.visible');
      cy.contains('Beneficios').should('be.visible');
      cy.contains('Precios').should('be.visible');
    });

    it('should switch to Portuguese and update landing strings', () => {
      cy.visit('/');
      cy.contains('PT').click();
      cy.contains('Recursos').should('be.visible');
      cy.contains('Benefícios').should('be.visible');
      cy.contains('Preços').should('be.visible');
    });
  });

  describe('Responsive layout', () => {
    it('should render without horizontal overflow on mobile (375px)', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
      cy.document().then((doc) => {
        const width = doc.documentElement.scrollWidth;
        expect(width).to.be.at.most(376);
      });
    });

    it('should render without horizontal overflow on tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.visit('/');
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
      cy.document().then((doc) => {
        const width = doc.documentElement.scrollWidth;
        expect(width).to.be.at.most(769);
      });
    });

    it('should render without horizontal overflow on desktop (1024px)', () => {
      cy.viewport(1024, 768);
      cy.visit('/');
      cy.get('[data-testid="landing-page"]', { timeout: 10000 }).should('be.visible');
      cy.document().then((doc) => {
        const width = doc.documentElement.scrollWidth;
        expect(width).to.be.at.most(1025);
      });
    });

    it('should have a sticky navbar on all viewports', () => {
      cy.viewport(1024, 768);
      cy.visit('/');
      cy.get('nav').should('have.css', 'position').and('match', /fixed|sticky/);
    });
  });
});
