describe('Macros Validation', () => {
  const login = () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('mock_use_incomplete_profile', 'false');
      },
    });
    cy.url().should('include', '/login');
    cy.contains('Sign in with Google').click();
  };

  beforeEach(() => {
    // Login and navigate to dashboard
    login();
    cy.visit('/dashboard');
  });

  it('should not allow saving ingredient without filling macros', () => {
    // Wait for dashboard to load
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');

    // Expand breakfast section
    cy.get('[data-testid="meal-breakfast"]').click();

    // Click add ingredient for breakfast
    cy.get('[data-testid="add-ingredient-breakfast"]').click();

    // Wait for modal to open
    cy.get('[data-testid="add-ingredient-modal"]').should('be.visible');

    // Verify macro fields are empty initially
    cy.get('[data-testid="ingredient-protein-input"]').should('have.value', '');
    cy.get('[data-testid="ingredient-carbs-input"]').should('have.value', '');
    cy.get('[data-testid="ingredient-fats-input"]').should('have.value', '');

    // Fill ingredient name and quantity only (without macros)
    cy.get('[data-testid="ingredient-name-input"]').type('Apple');
    cy.get('[data-testid="ingredient-quantity-input"]').type('100g');

    // Try to save without filling macros
    cy.get('[data-testid="save-ingredient-button"]').click();

    // Should show error message about macros being required
    cy.get('p.text-red-400').should('contain', 'Please fill in protein, carbs, and fats');

    // Modal should still be open (ingredient not saved)
    cy.get('[data-testid="add-ingredient-modal"]').should('be.visible');
  });

  it('should not allow saving ingredient with empty protein', () => {
    cy.get('[data-testid="meal-lunch"]').click();
    cy.get('[data-testid="add-ingredient-lunch"]').click();

    cy.get('[data-testid="add-ingredient-modal"]').should('be.visible');

    // Fill ingredient with only carbs and fats (no protein)
    cy.get('[data-testid="ingredient-name-input"]').type('Rice');
    cy.get('[data-testid="ingredient-quantity-input"]').type('200g');
    cy.get('[data-testid="ingredient-carbs-input"]').type('45');
    cy.get('[data-testid="ingredient-fats-input"]').type('0.5');

    // Try to save
    cy.get('[data-testid="save-ingredient-button"]').click();

    // Should show error message
    cy.get('p.text-red-400').should('contain', 'Please fill in protein, carbs, and fats');

    // Modal should still be open
    cy.get('[data-testid="add-ingredient-modal"]').should('be.visible');
  });

  it('should allow saving ingredient when all macros are filled', () => {
    cy.get('[data-testid="meal-dinner"]').click();
    cy.get('[data-testid="add-ingredient-dinner"]').click();

    cy.get('[data-testid="add-ingredient-modal"]').should('be.visible');

    // Fill ingredient with all macros
    cy.get('[data-testid="ingredient-name-input"]').type('Chicken');
    cy.get('[data-testid="ingredient-quantity-input"]').type('150g');
    cy.get('[data-testid="ingredient-protein-input"]').type('31');
    cy.get('[data-testid="ingredient-carbs-input"]').type('0');
    cy.get('[data-testid="ingredient-fats-input"]').type('3.6');

    // Save should succeed
    cy.get('[data-testid="save-ingredient-button"]').click();

    // Modal should close
    cy.get('[data-testid="add-ingredient-modal"]').should('not.exist');

    // Verify ingredient was saved
    cy.get('[data-testid="dinner-ingredients"]').within(() => {
      cy.contains('Chicken').should('exist');
      cy.contains('150g').should('exist');
    });
  });

  it('should allow saving ingredient with zero values in macros (valid input)', () => {
    cy.get('[data-testid="meal-snacks"]').click();
    cy.get('[data-testid="add-ingredient-snacks"]').click();

    cy.get('[data-testid="add-ingredient-modal"]').should('be.visible');

    // Fill ingredient with zero macros (valid - some foods have 0 of certain macros)
    cy.get('[data-testid="ingredient-name-input"]').type('Water');
    cy.get('[data-testid="ingredient-quantity-input"]').type('250ml');
    cy.get('[data-testid="ingredient-protein-input"]').type('0');
    cy.get('[data-testid="ingredient-carbs-input"]').type('0');
    cy.get('[data-testid="ingredient-fats-input"]').type('0');

    // Save should succeed (0 is a valid value)
    cy.get('[data-testid="save-ingredient-button"]').click();

    // Modal should close
    cy.get('[data-testid="add-ingredient-modal"]').should('not.exist');
  });
});
