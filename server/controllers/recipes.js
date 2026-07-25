import pool from '../db/connection.js'

const getAllRecipes = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, category, cook_time, favorite FROM recipes ORDER BY id ASC');
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
    const { title, category, cook_time, instructions, source_url, favorite, ingredients } = req.body;
    
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
        `INSERT INTO recipes (title, category, cook_time, instructions, source_url, favorite)
        VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, category, cook_time, instructions, source_url, favorite]
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
        instructions,
        source_url,
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
           instructions = $4,
           source_url = $5,
           favorite = $6
       WHERE id = $7
       RETURNING *`,
      [title, category, cook_time, instructions, source_url, favorite, id]
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
    try {
        const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error(`Error deleting recipe with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };