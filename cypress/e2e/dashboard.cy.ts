
describe('Dashboard Meal Management', () => {
  const MOCK_USER = {
    uid: 'mock-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  };

  beforeEach(() => {
    // Login and navigate to dashboard
    cy.visit('/', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('mock_use_incomplete_profile', 'false');
      },
    });
    cy.contains('Sign in with Google').click();

    // Verify we're on the dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');
  });

  it('should add a meal to lunch section', () => {
    const ingredientName = 'Grilled Chicken';
    const quantity = '100g';
    const calories = 165;
    const protein = 31;
    const carbs = 0;
    const fats = 3.6;

    // 1. Expand lunch section OR click '+' if it's empty
    // In our new UI, if empty, it's a '+' button that opens the modal directly.
    // If it has items, we first expand then click add.

    cy.get('body').then(($body) => {
      const mealLunch = $body.find('[data-testid="meal-lunch"]');
      const addIngredientBtn = $body.find('[data-testid="add-ingredient-lunch"]');

      // If the add button is visible in the meal lunch container (empty state), click it
      if (addIngredientBtn.is(':visible')) {
        cy.wrap(addIngredientBtn).click();
      } else {
        // Otherwise, expand first then click the internal add button
        cy.wrap(mealLunch).click();
        cy.get('[data-testid="add-ingredient-lunch"]').click();
      }
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
    // First, ensure lunch is expanded (it might be closed if we just added and it was previously empty)
    cy.get('body').then(($body) => {
        const details = $body.find('#meal-details-lunch');
        if (!details.is(':visible')) {
            cy.get('[data-testid="meal-lunch"]').click();
        }
    });

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
        cy.get('[data-testid="calorie-goal"]').parent().should('have.class', 'text-brand-green');
      });
    });
  });

  it('should never show zero goals when profile is available', () => {
    // Wait for profile to load and goals to be calculated
    cy.get('[data-testid="calorie-display-card"]', { timeout: 10000 }).should('be.visible');

    // Check that macro goals are not zero
    ['calories', 'protein', 'carbs', 'fats'].forEach((macro) => {
      cy.get(`[data-testid="macro-goal-${macro}"]`).invoke('text').then((text) => {
        const goalValue = parseInt(text);
        expect(goalValue).to.be.greaterThan(0);
      });
    });
  });
});
