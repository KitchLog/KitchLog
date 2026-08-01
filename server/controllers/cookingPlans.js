import pool from '../db/connection.js';
import { generateGroceryListForPlan } from './groceryLists.js';

const normalizeRecipeIds = (ids) =>
    [...new Set((ids || []).map((recipeId) => Number(recipeId)))].sort((a, b) => a - b);

const recipeIdsChanged = (currentIds, nextIds) => {
    const normalizedCurrentIds = normalizeRecipeIds(currentIds);
    const normalizedNextIds = normalizeRecipeIds(nextIds);

    if (normalizedCurrentIds.length !== normalizedNextIds.length) {
        return true;
    }

    return normalizedCurrentIds.some((recipeId, index) => recipeId !== normalizedNextIds[index]);
}

const getAllCookingPlans = async (req, res) => {
    try {
        const query = `
            SELECT 
                cp.id, 
                cp.name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', r.id,
                            'title', r.title,
                            'category', r.category,
                            'cook_time', r.cook_time,
                            'instructions', r.instructions,
                            'source_url', r.source_url,
                            'favorite', r.favorite
                        )
                    ) FILTER (WHERE r.id IS NOT NULL),
                    '[]'
                ) as recipes
            FROM cooking_plans cp
            LEFT JOIN plan_recipes pr ON cp.id = pr.plan_id
            LEFT JOIN recipes r ON pr.recipe_id = r.id
            GROUP BY cp.id, cp.name
            ORDER BY cp.id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cooking plans:', error);
        res.status(500).json({ error: 'Error fetching cooking plans' });
    }
}

const getCookingPlanById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                cp.id, 
                cp.name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', r.id,
                            'title', r.title,
                            'category', r.category,
                            'cook_time', r.cook_time,
                            'instructions', r.instructions,
                            'source_url', r.source_url,
                            'favorite', r.favorite
                        )
                    ) FILTER (WHERE r.id IS NOT NULL),
                    '[]'
                ) as recipes
            FROM cooking_plans cp
            LEFT JOIN plan_recipes pr ON cp.id = pr.plan_id
            LEFT JOIN recipes r ON pr.recipe_id = r.id
            WHERE cp.id = $1
            GROUP BY cp.id, cp.name
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cooking plan not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching cooking plan with ID ${id}:`, error);
        res.status(500).json({ error: 'Error fetching cooking plan' });
    }
}

const createCookingPlan = async (req, res) => {
    const { name, recipeIds } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    let ids = recipeIds;
    if (!ids && req.body.recipes) {
        if (Array.isArray(req.body.recipes)) {
            ids = req.body.recipes.map(r => typeof r === 'object' && r !== null ? r.id : r);
        }
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const planResult = await client.query(
            'INSERT INTO cooking_plans (name) VALUES ($1) RETURNING *',
            [name]
        );
        const plan = planResult.rows[0];

        if (ids && Array.isArray(ids) && ids.length > 0) {
            for (const recipeId of normalizeRecipeIds(ids)) {
                await client.query(
                    'INSERT INTO plan_recipes (plan_id, recipe_id) VALUES ($1, $2)',
                    [plan.id, recipeId]
                );
            }
        }

        await generateGroceryListForPlan(client, plan.id);

        await client.query('COMMIT');

        // Fetch the created plan with aggregated recipes
        const fullPlanQuery = `
            SELECT 
                cp.id, 
                cp.name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', r.id,
                            'title', r.title,
                            'category', r.category,
                            'cook_time', r.cook_time,
                            'instructions', r.instructions,
                            'source_url', r.source_url,
                            'favorite', r.favorite
                        )
                    ) FILTER (WHERE r.id IS NOT NULL),
                    '[]'
                ) as recipes
            FROM cooking_plans cp
            LEFT JOIN plan_recipes pr ON cp.id = pr.plan_id
            LEFT JOIN recipes r ON pr.recipe_id = r.id
            WHERE cp.id = $1
            GROUP BY cp.id, cp.name
        `;
        const fullPlanResult = await pool.query(fullPlanQuery, [plan.id]);
        
        res.status(201).json(fullPlanResult.rows[0]);
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Error creating cooking plan:', error);
        if (error.code === '23503') {
            return res.status(400).json({ error: 'One or more recipe IDs do not exist' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) {
            client.release();
        }
    }
}

const updateCookingPlan = async (req, res) => {
    const { id } = req.params;
    const { name, recipeIds } = req.body;

    let ids = recipeIds;
    if (!ids && req.body.recipes) {
        if (Array.isArray(req.body.recipes)) {
            ids = req.body.recipes.map(r => typeof r === 'object' && r !== null ? r.id : r);
        }
    }

    if (!name && ids === undefined) {
        return res.status(400).json({ error: 'Provide name or recipeIds to update' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Check if plan exists
        const checkResult = await client.query('SELECT * FROM cooking_plans WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Cooking plan not found' });
        }

        // Update name if provided
        if (name) {
            await client.query('UPDATE cooking_plans SET name = $1 WHERE id = $2', [name, id]);
        }

        // Update recipes if provided
        if (ids !== undefined) {
            const currentRecipesResult = await client.query(
                'SELECT recipe_id FROM plan_recipes WHERE plan_id = $1 ORDER BY recipe_id ASC',
                [id]
            );
            const currentIds = currentRecipesResult.rows.map((recipe) => recipe.recipe_id);
            const nextIds = Array.isArray(ids) ? ids : [];

            if (recipeIdsChanged(currentIds, nextIds)) {
                // Clear existing plan_recipes
                await client.query('DELETE FROM plan_recipes WHERE plan_id = $1', [id]);

                const dedupedNextIds = normalizeRecipeIds(nextIds);

                if (dedupedNextIds.length > 0) {
                    for (const recipeId of dedupedNextIds) {
                        await client.query(
                            'INSERT INTO plan_recipes (plan_id, recipe_id) VALUES ($1, $2)',
                            [id, recipeId]
                        );
                    }
                }

                await generateGroceryListForPlan(client, id);
            }
        }

        await client.query('COMMIT');

        // Fetch the updated plan with aggregated recipes
        const fullPlanQuery = `
            SELECT 
                cp.id, 
                cp.name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', r.id,
                            'title', r.title,
                            'category', r.category,
                            'cook_time', r.cook_time,
                            'instructions', r.instructions,
                            'source_url', r.source_url,
                            'favorite', r.favorite
                        )
                    ) FILTER (WHERE r.id IS NOT NULL),
                    '[]'
                ) as recipes
            FROM cooking_plans cp
            LEFT JOIN plan_recipes pr ON cp.id = pr.plan_id
            LEFT JOIN recipes r ON pr.recipe_id = r.id
            WHERE cp.id = $1
            GROUP BY cp.id, cp.name
        `;
        const fullPlanResult = await pool.query(fullPlanQuery, [id]);
        
        res.json(fullPlanResult.rows[0]);
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error(`Error updating cooking plan with ID ${id}:`, error);
        if (error.code === '23503') {
            return res.status(400).json({ error: 'One or more recipe IDs do not exist' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) {
            client.release();
        }
    }
}

const deleteCookingPlan = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM cooking_plans WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cooking plan not found' });
        }
        res.json({ message: 'Cooking plan deleted successfully' });
    } catch (error) {
        console.error(`Error deleting cooking plan with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export {
    getAllCookingPlans,
    getCookingPlanById,
    createCookingPlan,
    updateCookingPlan,
    deleteCookingPlan
};
