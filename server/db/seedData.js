const seedRecipes = [
  {
    title: 'Classic Spaghetti Aglio e Olio',
    category: 'Main',
    cook_time: '20 min',
    servings: '2-3 people',
    instructions:
      'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.\nWhile the pasta cooks, warm the olive oil in a pan over low heat and add the sliced garlic and red pepper flakes.\nCook until the garlic is golden, then toss in the drained pasta and parsley.\nServe immediately.',
    source_url: null,
    image_url: null,
    favorite: true,
    ingredients: [
      { name: 'Spaghetti', quantity: '200', unit: 'g' },
      { name: 'Garlic', quantity: '4', unit: 'cloves' },
      { name: 'Olive oil', quantity: '3', unit: 'tbsp' },
      { name: 'Red pepper flakes', quantity: '1', unit: 'tsp' },
      { name: 'Parsley', quantity: '2', unit: 'tbsp' },
    ],
  },
  {
    title: 'Loaded Nachos',
    category: 'Appetizer',
    cook_time: '15 min',
    servings: '4 people',
    instructions:
      'Preheat the oven to 400°F.\nSpread tortilla chips on a baking sheet and top with shredded cheese and black beans.\nBake until the cheese melts, then top with salsa and sour cream.',
    source_url: null,
    image_url: null,
    favorite: false,
    ingredients: [
      { name: 'Tortilla chips', quantity: '1', unit: 'bag' },
      { name: 'Shredded cheese', quantity: '2', unit: 'cups' },
      { name: 'Black beans', quantity: '1', unit: 'can' },
      { name: 'Salsa', quantity: '1/2', unit: 'cup' },
      { name: 'Sour cream', quantity: '1/4', unit: 'cup' },
    ],
  },
  {
    title: 'Chocolate Chip Cookies',
    category: 'Dessert',
    cook_time: '25 min',
    servings: '12 cookies',
    instructions:
      'Cream the butter and sugar together, then beat in the egg and vanilla.\nMix in the flour, baking soda, and salt, then fold in the chocolate chips.\nScoop onto a baking sheet and bake at 375°F for 10-12 minutes.',
    source_url: null,
    image_url: null,
    favorite: false,
    ingredients: [
      { name: 'Butter', quantity: '1', unit: 'cup' },
      { name: 'Sugar', quantity: '3/4', unit: 'cup' },
      { name: 'Egg', quantity: '1', unit: null },
      { name: 'Flour', quantity: '2.25', unit: 'cups' },
      { name: 'Chocolate chips', quantity: '2', unit: 'cups' },
    ],
  },
];

const seedCookingPlans = [
  {
    name: 'Weeknight Dinner',
    recipeTitles: ['Classic Spaghetti Aglio e Olio', 'Loaded Nachos'],
  },
];

export { seedRecipes, seedCookingPlans };
