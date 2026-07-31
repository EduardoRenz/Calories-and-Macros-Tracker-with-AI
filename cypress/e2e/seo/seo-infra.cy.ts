const PUBLIC_PAGES = ['/', '/landing-page', '/plans', '/privacy-policy', '/terms-of-use', '/calculadora-macros'];

describe('IT-001: Heading hierarchy', () => {
  PUBLIC_PAGES.forEach((path) => {
    it(`has exactly one <h1> on ${path}`, () => {
      cy.visit(path);
      cy.get('h1').should('have.length', 1);
    });
  });
});

describe('IT-002: Metadata injection', () => {
  it('renders <title> on root page', () => {
    cy.visit('/');
    cy.title().should('not.be.empty');
  });

  it('renders <link rel="canonical"> on root page', () => {
    cy.visit('/');
    cy.get('link[rel="canonical"]')
      .should('have.attr', 'href')
      .and('include', 'levemente.ia.br');
  });
});

describe('IT-003: Sitemap & Robots endpoints', () => {
  it('/sitemap.xml returns HTTP 200 and valid XML', () => {
    cy.request('/sitemap.xml').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.include('xml');
      expect(response.body).to.include('<urlset');
    });
  });

  it('/robots.txt returns HTTP 200 with disallow directives', () => {
    cy.request('/robots.txt').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.include('Disallow: /dashboard');
      expect(response.body).to.include('Disallow: /historico');
      expect(response.body).to.include('Disallow: /settings');
      expect(response.body).to.include('Disallow: /checkout');
      expect(response.body).to.include('Sitemap: https://levemente.ia.br/sitemap.xml');
    });
  });
});

describe('IT-004: JSON-LD script', () => {
  it('renders SoftwareApplication JSON-LD on root page', () => {
    cy.visit('/');
    cy.get('script[type="application/ld+json"]').should('exist');
  });
});

describe('IT-005: Font CLS optimization', () => {
  it('loads Montserrat as body font', () => {
    cy.visit('/');
    cy.get('body').should('have.css', 'font-family').and('match', /Montserrat/i);
  });
});

describe('E2E-001: Crawler visit', () => {
  it('finds canonical link and 0 broken links on /', () => {
    cy.visit('/');
    cy.get('link[rel="canonical"]').should('have.attr', 'href');
    cy.get('a').each(($a) => {
      const href = $a.attr('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        cy.request({ url: href, failOnStatusCode: false }).its('status').should('not.eq', 404);
      }
    });
  });
});

describe('IT-007: Image alt attributes', () => {
  PUBLIC_PAGES.forEach((path) => {
    it(`all images on ${path} have non-empty alt text`, () => {
      cy.visit(path);
      cy.get('body').then(($body) => {
        const images = $body.find('img');
        if (images.length === 0) {
          return;
        }
        images.each((_, img) => {
          const alt = img.getAttribute('alt');
          expect(alt, `img src="${img.getAttribute('src')}"`).to.not.be.null;
          expect(alt?.trim(), `img src="${img.getAttribute('src')}"`).to.not.be.empty;
        });
      });
    });
  });
});
