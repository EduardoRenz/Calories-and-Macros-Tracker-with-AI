
describe('Dashboard Meal Management', () => {
  const MOCK_USER = {
    uid: 'mock-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  };

  beforeEach(() => {
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
    cy.contains('h2', 'Add Ingredient to Lunch').should('be.visible');

    // Calorie calculation: (31 * 4) + (0 * 4) + (3.6 * 9) = 124 + 32.4 = 156.4 -> 156
    const expectedCalories = 156;

    // Explicitly target inputs by name attribute as seen in AddIngredientModal code
    cy.get('input[name="name"]').type(ingredientName);
    cy.get('input[name="quantity"]').type(quantity);
    // Calories is read-only now, so we don't type it.
    // cy.get('input[name="calories"]').type(calories.toString());
    cy.get('input[name="protein"]').type(protein.toString());
    cy.get('input[name="carbs"]').type(carbs.toString());
    cy.get('input[name="fats"]').type(fats.toString());

    // Verify calories are auto-calculated
    cy.get('input[name="calories"]').should('have.value', expectedCalories.toString());

    // 4. Save
    cy.contains('button', 'Add Ingredient').click();

    // 5. Verify Modal Closed
    cy.contains('h2', 'Add Ingredient to Lunch').should('not.exist');

    // 6. Verify Ingredient Added to List
    cy.get('#meal-details-lunch').within(() => {
      cy.contains(ingredientName).should('be.visible');
      cy.contains(quantity).should('be.visible');
      cy.contains(expectedCalories.toString()).should('be.visible');
    });
  });
});
