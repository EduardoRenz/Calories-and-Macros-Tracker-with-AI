import { CalorieCalculationService } from '../../../domain/services/CalorieCalculationService';

describe('UT-006: CalorieCalculationService.calculateGoals', () => {
  it('returns correct values for a male losing weight', () => {
    const result = CalorieCalculationService.calculateGoals({
      name: '',
      email: '',
      personalInfo: { age: 30, weight: 80, height: 175, gender: 'male' },
      fitnessGoals: { primaryGoal: 'lose', targetWeight: 70, activityLevel: 'moderately' },
      weightHistory: [],
      healthConditions: { selected: [] },
    });

    expect(result).to.not.be.null;
    if (!result) return;

    expect(result.calories).to.be.greaterThan(0);
    expect(result.protein).to.be.greaterThan(0);
    expect(result.carbs).to.be.greaterThan(0);
    expect(result.fats).to.be.greaterThan(0);

    const proteinCals = result.protein * 4;
    const fatsCals = result.fats * 9;
    const carbsCals = result.carbs * 4;
    const totalCals = proteinCals + fatsCals + carbsCals;

    expect(Math.abs(totalCals - result.calories)).to.be.lessThan(50);
  });

  it('returns higher calories for gain goal vs lose goal', () => {
    const profile = {
      name: '',
      email: '',
      personalInfo: { age: 25, weight: 70, height: 170, gender: 'male' },
      fitnessGoals: { primaryGoal: 'lose' as const, targetWeight: 65, activityLevel: 'lightly' as const },
      weightHistory: [] as { date: string; weight: number }[],
      healthConditions: { selected: [] as string[] },
    };

    const loseResult = CalorieCalculationService.calculateGoals(profile);
    profile.fitnessGoals.primaryGoal = 'gain';
    const gainResult = CalorieCalculationService.calculateGoals(profile);

    expect(loseResult).to.not.be.null;
    expect(gainResult).to.not.be.null;
    if (!loseResult || !gainResult) return;

    expect(gainResult.calories).to.be.greaterThan(loseResult.calories);
  });

  it('returns null for incomplete profile', () => {
    const result = CalorieCalculationService.calculateGoals({
      name: '',
      email: '',
      personalInfo: { age: null, weight: null, height: null, gender: null },
      fitnessGoals: { primaryGoal: null, targetWeight: null, activityLevel: null },
      weightHistory: [],
      healthConditions: { selected: [] },
    });
    expect(result).to.be.null;
  });
});

describe('E2E-005: Macro calculator flow', () => {
  beforeEach(() => {
    cy.acceptCookies();
  });

  it('fills form, calculates macros and sees CTA', () => {
    cy.visit('/calculadora-macros');
    cy.get('h1').should('contain.text', 'Macro Calculator');

    cy.get('input[placeholder="30"]').type('28');
    cy.get('input[placeholder="70"]').type('75');
    cy.get('input[placeholder="170"]').type('172');

    cy.get('select').eq(0).select('male');
    cy.get('select').eq(1).select('moderately');
    cy.get('select').eq(2).select('lose');

    cy.contains('button', 'Calculate Macros').click();

    cy.contains('Your Daily Goals').should('be.visible');
    cy.get('a[href="/login"]').should('contain.text', 'Save diet');
  });
});

describe('E2E-005b: Per-field validation', () => {
  beforeEach(() => {
    cy.acceptCookies();
  });

  it('shows per-field error messages when submitting empty form', () => {
    cy.visit('/calculadora-macros');
    cy.contains('button', 'Calculate Macros').click();

    cy.contains('Enter your age').should('be.visible');
    cy.contains('Enter your weight').should('be.visible');
    cy.contains('Enter your height').should('be.visible');
    cy.contains('Select your gender').should('be.visible');
    cy.contains('Select your activity level').should('be.visible');
    cy.contains('Select your goal').should('be.visible');
  });

  it('focuses on the first empty field', () => {
    cy.visit('/calculadora-macros');
    cy.contains('button', 'Calculate Macros').click();

    cy.get('input[placeholder="30"]').should('have.focus');
  });

  it('clears field error when user fills the field', () => {
    cy.visit('/calculadora-macros');
    cy.contains('button', 'Calculate Macros').click();

    cy.contains('Enter your age').should('be.visible');
    cy.get('input[placeholder="30"]').type('28');
    cy.contains('Enter your age').should('not.exist');
  });
});

describe('E2E-005c: Login redirect via sessionStorage', () => {
  beforeEach(() => {
    cy.acceptCookies();
  });

  it('sets login_redirect=/profile and calculator_form_data when CTA is clicked', () => {
    cy.visit('/calculadora-macros');

    cy.get('input[placeholder="30"]').type('28');
    cy.get('input[placeholder="70"]').type('75');
    cy.get('input[placeholder="170"]').type('172');
    cy.get('select').eq(0).select('male');
    cy.get('select').eq(1).select('moderately');
    cy.get('select').eq(2).select('lose');

    cy.contains('button', 'Calculate Macros').click();
    cy.contains('Your Daily Goals').should('be.visible');

    cy.get('a[href="/login"]').contains('Save diet').scrollIntoView().click({ force: true });

    cy.window().then((win) => {
      const redirect = win.sessionStorage.getItem('login_redirect');
      const formData = win.sessionStorage.getItem('calculator_form_data');
      expect(redirect).to.eq('/profile');
      expect(formData).to.not.be.null;
      const parsed = JSON.parse(formData!);
      expect(parsed.age).to.eq('28');
      expect(parsed.weight).to.eq('75');
      expect(parsed.height).to.eq('172');
      expect(parsed.gender).to.eq('male');
      expect(parsed.activityLevel).to.eq('moderately');
      expect(parsed.goal).to.eq('lose');
    });
  });
});

describe('E2E-005d: Full calculator → login → profile flow', () => {
  beforeEach(() => {
    cy.acceptCookies();
  });

  it('fills calculator, signs in via mock Google, lands on profile with pre-filled data', () => {
    cy.visit('/calculadora-macros');

    cy.get('input[placeholder="30"]').type('32');
    cy.get('input[placeholder="70"]').type('82');
    cy.get('input[placeholder="170"]').type('178');
    cy.get('select').eq(0).select('male');
    cy.get('select').eq(1).select('very');
    cy.get('select').eq(2).select('gain');

    cy.contains('button', 'Calculate Macros').click();
    cy.contains('Your Daily Goals').should('be.visible');

    cy.get('a[href="/login"]').contains('Save diet').scrollIntoView().click({ force: true });

    cy.url({ timeout: 10000 }).should('include', '/login');

    cy.get('[data-testid="google-signin-button"]').click();

    cy.url({ timeout: 10000 }).should('include', '/profile');

    cy.get('input[name="age"]').should('have.value', '32');
    cy.get('input[name="weight"]').should('have.value', '82');
    cy.get('input[name="height"]').should('have.value', '178');
    cy.get('select[name="gender"]').should('have.value', 'male');
    cy.get('select[name="activityLevel"]').should('have.value', 'very');
  });
});
