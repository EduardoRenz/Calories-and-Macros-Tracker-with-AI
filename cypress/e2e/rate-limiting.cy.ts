const AUTH_HEADER = 'Bearer mock.jwt.token';

describe('Rate Limiting', () => {
    beforeEach(() => {
        cy.login();
        cy.upgradeSubscription();
        cy.visit('/dashboard');
        cy.acceptCookies();
    });

    it('should return 429 when chatbot rate limit is exceeded', () => {
        // Send 13 requests to exceed the chatbot limit (12/min)
        for (let i = 0; i < 13; i++) {
            cy.request({
                method: 'POST',
                url: '/api/assistant/chat',
                headers: { Authorization: AUTH_HEADER },
                body: {
                    messages: [{ role: 'user', content: `Test message ${i}` }],
                    context: {},
                },
                failOnStatusCode: false,
            });
        }

        // The last request (13th) should return 429
        cy.request({
            method: 'POST',
            url: '/api/assistant/chat',
            headers: { Authorization: AUTH_HEADER },
            body: { messages: [{ role: 'user', content: 'Over limit' }], context: {} },
            failOnStatusCode: false,
        }).its('status').should('eq', 429);
    });

    it('should return error message in 429 response body', () => {
        // Exhaust the limit
        for (let i = 0; i < 12; i++) {
            cy.request({
                method: 'POST',
                url: '/api/assistant/chat',
                headers: { Authorization: AUTH_HEADER },
                body: { messages: [{ role: 'user', content: `Fill ${i}` }], context: {} },
                failOnStatusCode: false,
            });
        }

        // Next request should be 429 with error message
        cy.request({
            method: 'POST',
            url: '/api/assistant/chat',
            headers: { Authorization: AUTH_HEADER },
            body: { messages: [{ role: 'user', content: 'Over limit' }], context: {} },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(429);
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.include('Rate limit exceeded');
        });
    });

    it('should include Retry-After header in 429 response', () => {
        // Exhaust the limit
        for (let i = 0; i < 12; i++) {
            cy.request({
                method: 'POST',
                url: '/api/assistant/chat',
                headers: { Authorization: AUTH_HEADER },
                body: { messages: [{ role: 'user', content: `Fill ${i}` }], context: {} },
                failOnStatusCode: false,
            });
        }

        cy.request({
            method: 'POST',
            url: '/api/assistant/chat',
            headers: { Authorization: AUTH_HEADER },
            body: { messages: [{ role: 'user', content: 'Over limit' }], context: {} },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(429);
            expect(response.headers).to.have.property('retry-after');
        });
    });

    it('should have independent rate limits per endpoint category', () => {
        // Exhaust chatbot limit (12/min)
        for (let i = 0; i < 12; i++) {
            cy.request({
                method: 'POST',
                url: '/api/assistant/chat',
                headers: { Authorization: AUTH_HEADER },
                body: { messages: [{ role: 'user', content: `Fill ${i}` }], context: {} },
                failOnStatusCode: false,
            });
        }

        // Chatbot should now be rate limited
        cy.request({
            method: 'POST',
            url: '/api/assistant/chat',
            headers: { Authorization: AUTH_HEADER },
            body: { messages: [{ role: 'user', content: 'Over limit' }], context: {} },
            failOnStatusCode: false,
        }).its('status').should('eq', 429);

        // Food analysis should still work (independent limit of 20/min)
        cy.request({
            method: 'POST',
            url: '/api/analyze-food',
            headers: { Authorization: AUTH_HEADER },
            body: { ingredients: [{ name: 'test', quantity: '100g' }] },
            failOnStatusCode: false,
        }).its('status').should('not.eq', 429);
    });
});
