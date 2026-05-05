export const FOOD_CATEGORIES = {
    VEGETABLES: 'vegetables',
    MEATS: 'meats',
    EGGS: 'eggs',
    FRUITS: 'fruits',
    CEREALS: 'cereals',
    PASTA: 'pasta',
    CANDIES: 'candies',
    MILK: 'milk',
    SEASONINGS: 'seasonings',
    OTHERS: 'others',
} as const;

export type FoodCategory = typeof FOOD_CATEGORIES[keyof typeof FOOD_CATEGORIES];

export const FOOD_CATEGORIES_LIST = Object.values(FOOD_CATEGORIES);

export const FOOD_CATEGORY_DESCRIPTIONS: Record<FoodCategory, string> = {
    [FOOD_CATEGORIES.VEGETABLES]: 'All vegetables (peppers/pimentão, tomatoes/tomate, broccoli, carrots, spinach, lettuce, beans, lentils, chickpeas, peas, etc.)',
    [FOOD_CATEGORIES.MEATS]: 'Meat, poultry, fish, seafood (but NOT eggs)',
    [FOOD_CATEGORIES.EGGS]: 'Eggs (whole eggs, egg whites, egg yolks) - DO NOT use "meats" for eggs',
    [FOOD_CATEGORIES.FRUITS]: 'Fresh fruits, dried fruits, fruit juices',
    [FOOD_CATEGORIES.CEREALS]: 'Rice, wheat, oats, corn, quinoa, bread, breakfast cereals',
    [FOOD_CATEGORIES.PASTA]: 'Pasta, noodles, ramen, spaghetti',
    [FOOD_CATEGORIES.CANDIES]: 'Desserts, sweets, chocolates, candy, cakes, cookies, ice cream',
    [FOOD_CATEGORIES.MILK]: 'Milk, yogurt, chocolate milk/achocolatado, cheese, dairy products',
    [FOOD_CATEGORIES.SEASONINGS]: 'Seasonings, herbs, spices, peppers (as spice), green seasoning/tempero verde, salt, pepper',
    [FOOD_CATEGORIES.OTHERS]: 'Foods that don\'t fit in other categories (nuts, oils, sauces, etc.)',
};

export const getFoodCategoriesPromptText = (): string => {
    const categories = FOOD_CATEGORIES_LIST.join('", "');
    const guidelines = FOOD_CATEGORIES_LIST.map(
        cat => `- "${cat}": ${FOOD_CATEGORY_DESCRIPTIONS[cat]}`
    ).join('\n        ');

    return `Categories MUST be one of: "${categories}".
        
        Category guidelines:
        ${guidelines}`;
};
