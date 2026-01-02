const BASE_NOW = new Date();
const YESTERDAY = new Date(BASE_NOW);
YESTERDAY.setDate(YESTERDAY.getDate() - 1);

const visitWithFixedDate = (url: string) => {
  const now = YESTERDAY.getTime();
  cy.visit(url, {
    onBeforeLoad(win) {
      const OriginalDate = win.Date;
      function MockDate(this: any, ...args: any[]) {
        if (!(this instanceof OriginalDate)) {
          // @ts-ignore
          return OriginalDate.apply(this, args);
        }
        if (args.length === 0) {
          return new OriginalDate(now);
        }
        // @ts-ignore
        return new OriginalDate(...args);
      }

      MockDate.UTC = OriginalDate.UTC;
      MockDate.parse = OriginalDate.parse;
      MockDate.now = () => now;
      // @ts-ignore
      MockDate.prototype = OriginalDate.prototype;

      // @ts-ignore
      win.Date = MockDate;
    },
  });
};

const loginWithGoogle = () => {
  cy.session('history-login', () => {
    visitWithFixedDate('/');
    cy.url().should('include', '/login');
    cy.contains('Sign in with Google').click();
    cy.url().should('include', '/dashboard');
  });
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const daysAgo = (n: number) => {
  const d = new Date(YESTERDAY);
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

describe('History Page', () => {
  beforeEach(() => {
    loginWithGoogle();
  });

  it('should render and allow navigation to dashboard by clicking a history entry (mobile cards)', () => {
    cy.viewport(375, 667);

    const date = daysAgo(2);

    visitWithFixedDate('/historico');
    cy.url().should('include', '/historico');
    cy.get('h2').should('contain', 'History');

    cy.get(`[data-testid="history-entry-${date}"]`, { timeout: 15000 }).should('be.visible').click();
    cy.url().should('include', `/dashboard?date=${date}`);
  });

  it('should show calorie colors (over=red, under=green) in mobile cards', () => {
    cy.viewport(375, 667);

    const overDay = daysAgo(1);
    const underDay = daysAgo(2);
    const noEntryDay = daysAgo(3);

    visitWithFixedDate('/historico');

    cy.get(`[data-testid="history-entry-${noEntryDay}"]`, { timeout: 15000 }).should('not.exist');

    cy.get(`[data-testid="history-calories-${overDay}"]`, { timeout: 15000 })
      .should('have.attr', 'class')
      .and('include', 'text-red-400');

    cy.get(`[data-testid="history-calories-${underDay}"]`, { timeout: 15000 })
      .should('have.attr', 'class')
      .and('include', 'text-healthpal-green');
  });

  it('should filter by date range only after clicking Apply', () => {
    cy.viewport(375, 667);

    const d2 = daysAgo(2);
    const d6 = daysAgo(6);
    const d7 = daysAgo(7);

    visitWithFixedDate('/historico');

    // ensure an entry outside the future filter is visible first
    cy.get(`[data-testid="history-entry-${d2}"]`, { timeout: 15000 }).should('be.visible');

    cy.get('[data-testid="history-filter-start"]').clear().type(d6);
    cy.get('[data-testid="history-filter-end"]').clear().type(d6);

    // not applied yet, still should show day 2
    cy.get(`[data-testid="history-entry-${d2}"]`).should('be.visible');

    cy.get('[data-testid="history-filter-apply"]').click();

    // now it should narrow down
    cy.get(`[data-testid="history-entry-${d6}"]`, { timeout: 15000 }).should('be.visible');
    cy.get(`[data-testid="history-entry-${d2}"]`).should('not.exist');
    // day 7 exists in seeded data but should be filtered out by single-day range
    cy.get(`[data-testid="history-entry-${d7}"]`).should('not.exist');
  });

});
