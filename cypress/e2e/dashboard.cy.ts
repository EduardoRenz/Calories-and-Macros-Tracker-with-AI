
describe('Dashboard Meal Management', () => {
  const MOCK_USER = {
    uid: 'mock-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  };

  beforeEach(() => {
    // Ensure complete profile is used (not first-time setup)
    cy.window().then((win) => {
      win.sessionStorage.setItem('mock_use_incomplete_profile', 'false');
    });

    // Login and navigate to dashboard
    cy.visit('/');
    cy.contains('Sign in with Google').click();

    // Verify we're on the dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should add a meal to lunch section', () => {
    const ingredientName = 'Grilled Chicken';
    const quantity = '100g';
    const calories = 165;
    const protein = 31;
    const carbs = 0;
    const fats = 3.6;

    // 1. Expand "Lunch" section
    // Finding the button associated with "Lunch" text
    cy.contains('button', 'Lunch').click();

    // 2. Click "Add Ingredient" button for Lunch
    // We need to target the specific "Add Ingredient" button within the Lunch section.
    // Since "Add Ingredient" text is repeated for each meal, we scope it.
    // The Lunch section has id="meal-details-lunch" after expansion.
    cy.get('#meal-details-lunch').within(() => {
      cy.contains('button', 'Add Ingredient').click();
    });

    // 3. Fill in Ingredient Modal
    cy.contains('h3', 'Add Ingredient to Lunch').should('be.visible');

    // Calorie calculation: (31 * 4) + (0 * 4) + (3.6 * 9) = 124 + 32.4 = 156.4 -> 156
    const expectedCalories = 156;

    // Explicitly target inputs by name attribute as seen in AddIngredientModal code
    cy.get('input[name="name"]').type(ingredientName);
    cy.get('input[name="quantity"]').type(quantity);
    cy.get('input[name="fiber"]').should('have.attr', 'readonly');
    cy.get('input[name="fiber"]').should('have.value', '');
    // Calories is read-only now, so we don't type it.
    // cy.get('input[name="calories"]').type(calories.toString());
    cy.get('input[name="protein"]').type(protein.toString());
    cy.get('input[name="carbs"]').type(carbs.toString());
    cy.get('input[name="fats"]').type(fats.toString());

    // Verify calories are auto-calculated
    cy.get('input[name="calories"]').should('have.value', expectedCalories.toString());

    // 4. Save
    cy.get('[data-testid="save-ingredient-button"]').click();

    // 5. Verify Modal Closed
    cy.contains('h3', 'Add Ingredient to Lunch').should('not.exist');

    // 6. Verify Ingredient Added to List
    cy.get('#meal-details-lunch').within(() => {
      cy.contains(ingredientName).should('be.visible');
      cy.contains(quantity).should('be.visible');
      cy.contains(expectedCalories.toString()).should('be.visible');
      cy.contains('0g').should('be.visible');
    });

    // 7. Verify calories are still under daily goal and remaining calories are green
    cy.get('[data-testid="calorie-display-card"]').within(() => {
      cy.get('[data-testid="calorie-goal"]').invoke('text').then((text) => {
        const remainingCalories = parseInt(text);
        // Should be positive (under goal)
        expect(remainingCalories).to.be.greaterThan(0);
        // Should be green (under limit) - check parent paragraph element
        cy.get('[data-testid="calorie-goal"]').parent().should('have.class', 'text-healthpal-green');
      });
    });
  });

  it('should never show zero goals when profile is available', () => {
    // Wait for profile to load and goals to be calculated
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');

    // Check that calorie goal is not zero by checking the macro progress cards
    cy.contains('h3', 'Calories').parent().within(() => {
      cy.get('[data-testid="macro-goal-calories"]').invoke('text').then((text) => {
        const goalValue = parseInt(text);
        expect(goalValue).to.be.greaterThan(0);
      });
    });

    // Check that macro goals are not zero
    cy.contains('h3', 'Protein').parent().within(() => {
      cy.get('[data-testid="macro-goal-protein"]').invoke('text').then((text) => {
        const goalValue = parseInt(text);
        expect(goalValue).to.be.greaterThan(0);
      });
    });

    cy.contains('h3', 'Carbs').parent().within(() => {
      cy.get('[data-testid="macro-goal-carbs"]').invoke('text').then((text) => {
        const goalValue = parseInt(text);
        expect(goalValue).to.be.greaterThan(0);
      });
    });

    cy.contains('h3', 'Fats').parent().within(() => {
      cy.get('[data-testid="macro-goal-fats"]').invoke('text').then((text) => {
        const goalValue = parseInt(text);
        expect(goalValue).to.be.greaterThan(0);
      });
    });
  });
});
