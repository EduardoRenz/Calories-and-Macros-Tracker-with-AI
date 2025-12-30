describe('Terms of Use Page', () => {
    it('should have a link on the login page', () => {
        cy.visit('/login');
        cy.contains('a', 'Termos de Uso')
            .should('have.attr', 'href', '/terms-of-use')
            .should('have.attr', 'target', '_blank');
    });

    it('should be accessible and display the correct title', () => {
        cy.visit('/terms-of-use');
        cy.contains('h1', 'Termos de Uso').should('be.visible');
        cy.contains('p', 'Todo o conteúdo, incluindo cálculos de calorias, análise de macronutrientes e recomendações, é gerado e analisado por Inteligência Artificial.').should('be.visible');
    });
});
