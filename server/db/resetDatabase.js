import schema from './schema.js';
import { seedRecipes, seedCookingPlans } from './seedData.js';
import { generateGroceryListForPlan } from '../controllers/groceryLists.js';

const resetDatabaseToDefault = async (pool) => {
  await pool.query(schema);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const recipeIdByTitle = new Map();

    for (const recipe of seedRecipes) {
      const recipeResult = await client.query(
        `INSERT INTO recipes (title, category, cook_time, servings, instructions, source_url, image_url, favorite)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          recipe.title,
          recipe.category,
          recipe.cook_time,
          recipe.servings,
          recipe.instructions,
          recipe.source_url,
          recipe.image_url,
          recipe.favorite || false,
        ],
      );
      const recipeId = recipeResult.rows[0].id;
      recipeIdByTitle.set(recipe.title, recipeId);

      for (const ingredient of recipe.ingredients) {
        await client.query(
          `INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4)`,
          [recipeId, ingredient.name, ingredient.quantity, ingredient.unit],
        );
      }
    }

    for (const plan of seedCookingPlans) {
      const planResult = await client.query(
        'INSERT INTO cooking_plans (name) VALUES ($1) RETURNING id',
        [plan.name],
      );
      const planId = planResult.rows[0].id;

      for (const title of plan.recipeTitles) {
        const recipeId = recipeIdByTitle.get(title);
        if (recipeId) {
          await client.query(
            'INSERT INTO plan_recipes (plan_id, recipe_id) VALUES ($1, $2)',
            [planId, recipeId],
          );
        }
      }

      await generateGroceryListForPlan(client, planId);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export { resetDatabaseToDefault };
