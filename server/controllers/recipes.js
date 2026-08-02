import pool from '../db/connection.js';
import { fetchAndExtractRecipe, isValidUrl } from '../utils/recipeParser.js';
import { generateGroceryListForPlan } from './groceryLists.js';

const getAllRecipes = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, category, cook_time, servings, image_url, favorite FROM recipes ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
}

const getRecipeById = async (req, res) => {
    const { id } = req.params;
    try {
        const recipeResult = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
        if (recipeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        const ingredientsResult = await pool.query(
        "SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC",
        [id]
        );


        const recipe = recipeResult.rows[0];

        res.json({ ...recipe, ingredients: ingredientsResult.rows });
    } catch (error) {
        console.error(`Error fetching recipe with ID ${id}:`, error);
        res.status(500).json({ error: 'Error fetching recipe' });
    }
}

const createRecipe = async (req, res) => {
    const {
        title,
        category,
        cook_time,
        servings,
        instructions,
        source_url,
        image_url,
        favorite = false,
        ingredients
    } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'At least one ingredient is required' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");
        const recipeResult = await client.query(
        `INSERT INTO recipes (title, category, cook_time, servings, instructions, source_url, image_url, favorite)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, category, cook_time, servings, instructions, source_url, image_url, favorite]
        );

        const recipe = recipeResult.rows[0];
        for (const ingredient of ingredients) {
            const { name, quantity, unit } = ingredient;

            if (!name) {
                throw new Error("Each ingredient must have a name");
            }

            await client.query(
                `INSERT INTO ingredients (recipe_id, name, quantity, unit)
                VALUES ($1, $2, $3, $4)`,
                [recipe.id, name, quantity, unit]
            );
        }

        await client.query("COMMIT");
        const ingredientsResult = await pool.query(
            "SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC",
            [recipe.id]
        );

        res.status(201).json({
        ...recipe,
        ingredients: ingredientsResult.rows,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        client.release();
    }
}

const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        category,
        cook_time,
        servings,
        instructions,
        source_url,
        image_url,
        favorite = false,
        ingredients,
    } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: "At least one ingredient is required" });
    }
    let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const recipeResult = await client.query(
      `UPDATE recipes
       SET title = $1,
           category = $2,
           cook_time = $3,
           servings = $4,
           instructions = $5,
           source_url = $6,
           image_url = $7,
           favorite = $8
       WHERE id = $9
       RETURNING *`,
      [title, category, cook_time, servings, instructions, source_url, image_url, favorite, id]
    );

    if (recipeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Recipe not found" });
    }

    await client.query("DELETE FROM ingredients WHERE recipe_id = $1", [id]);

    for (const ingredient of ingredients) {
      const { name, quantity, unit } = ingredient;

      if (!name) {
        throw new Error("Each ingredient must have a name");
      }

      await client.query(
        `INSERT INTO ingredients (recipe_id, name, quantity, unit)
         VALUES ($1, $2, $3, $4)`,
        [id, name, quantity, unit]
      );
    }

    const affectedPlansResult = await client.query(
      "SELECT plan_id FROM plan_recipes WHERE recipe_id = $1",
      [id]
    );

    for (const { plan_id } of affectedPlansResult.rows) {
      await generateGroceryListForPlan(client, plan_id);
    }

    await client.query("COMMIT");

    const ingredientsResult = await pool.query(
      "SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC",
      [id]
    );

    res.json({
      ...recipeResult.rows[0],
      ingredients: ingredientsResult.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Error updating recipe with ID ${id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
}

const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const affectedPlansResult = await client.query(
            'SELECT plan_id FROM plan_recipes WHERE recipe_id = $1',
            [id]
        );
        const affectedPlanIds = affectedPlansResult.rows.map((row) => row.plan_id);

        const result = await client.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Deleting the recipe cascades to remove it from any cooking plans (plan_recipes),
        // so affected plans' grocery lists must be regenerated to drop its ingredients.
        for (const planId of affectedPlanIds) {
            await generateGroceryListForPlan(client, planId);
        }

        await client.query('COMMIT');

        res.json({
            message: 'Recipe deleted successfully',
            ...(affectedPlanIds.length > 0 && {
                warning: `This recipe was removed from ${affectedPlanIds.length} cooking plan(s); their grocery lists have been updated.`,
                affected_plan_ids: affectedPlanIds,
            }),
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error(`Error deleting recipe with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) {
            client.release();
        }
    }
}

const importRecipe = async (req, res) => {
    const { source_url } = req.body;

    if (!source_url) {
        return res.status(400).json({ error: "source_url is required" });
    }

    if (!isValidUrl(source_url)) {
        return res.status(400).json({ error: "Invalid URL format" });
    }

    let client;
    try {
        const recipeData = await fetchAndExtractRecipe(source_url);

        client = await pool.connect();
        await client.query("BEGIN");
        const recipeResult = await client.query(
            `INSERT INTO recipes (title, category, cook_time, servings, instructions, source_url, image_url, favorite)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [recipeData.title, recipeData.category, recipeData.cook_time, recipeData.servings, recipeData.instructions, recipeData.source_url, recipeData.image_url, false]
        );

        const recipe = recipeResult.rows[0];
        for (const ingredient of recipeData.ingredients) {
            const { name, quantity, unit } = ingredient;

            if (!name) {
                throw new Error("Each ingredient must have a name");
            }

            await client.query(
                `INSERT INTO ingredients (recipe_id, name, quantity, unit)
                 VALUES ($1, $2, $3, $4)`,
                [recipe.id, name, quantity, unit]
            );
        }

        await client.query("COMMIT");
        const ingredientsResult = await pool.query(
            "SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC",
            [recipe.id]
        );

        res.status(201).json({
            ...recipe,
            ingredients: ingredientsResult.rows,
        });
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }
        console.error('Error importing recipe:', error);
        
        const errorMessage = error.message || 'Error extracting recipe data';
        
        if (errorMessage.includes('Failed to fetch page')) {
            return res.status(404).json({ error: `The page could not be accessed: ${errorMessage}` });
        } else if (errorMessage.includes('No valid recipe metadata') || errorMessage.includes('missing or empty')) {
            return res.status(422).json({ error: `Recipe data could not be extracted: ${errorMessage}` });
        } else {
            return res.status(500).json({ error: `Internal error importing recipe: ${errorMessage}` });
        }
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * PATCH /api/recipes/:id
 * Partially updates a recipe. Used by the frontend to mark/unmark a recipe as favorite
 * (e.g. { favorite: true } or { favorite: false }) without resending the entire recipe object.
 */
const patchRecipe = async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
    }

    const allowedFields = ['title', 'category', 'cook_time', 'servings', 'instructions', 'source_url', 'image_url', 'favorite'];
    
    const invalidFields = Object.keys(fieldsToUpdate).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
        return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const checkResult = await client.query('SELECT id FROM recipes WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Recipe not found" });
        }

        const queryParts = [];
        const queryValues = [];
        let index = 1;

        for (const [key, value] of Object.entries(fieldsToUpdate)) {
            queryParts.push(`${key} = $${index}`);
            queryValues.push(value);
            index++;
        }

        queryValues.push(id);
        const updateQuery = `
            UPDATE recipes
            SET ${queryParts.join(', ')}
            WHERE id = $${index}
            RETURNING *
        `;

        const recipeResult = await client.query(updateQuery, queryValues);
        
        await client.query("COMMIT");

        const ingredientsResult = await pool.query(
            "SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC",
            [id]
        );

        res.json({
            ...recipeResult.rows[0],
            ingredients: ingredientsResult.rows,
        });
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }
        console.error(`Error patching recipe with ID ${id}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (client) {
            client.release();
        }
    }
}

export { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, importRecipe, patchRecipe };
