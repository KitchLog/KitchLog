import pool from '../db/connection.js';

const normalizeIngredientName = (name) => name.trim().toLowerCase();

const normalizeUnit = (unit) => (unit || '').trim().toLowerCase();

const parseQuantity = (quantity) => {
    if (!quantity) return null;

    const trimmedQuantity = String(quantity).trim();

    if (/^\d+(\.\d+)?$/.test(trimmedQuantity)) {
        return Number(trimmedQuantity);
    }

    const fractionMatch = trimmedQuantity.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
        const numerator = Number(fractionMatch[1]);
        const denominator = Number(fractionMatch[2]);
        return denominator === 0 ? null : numerator / denominator;
    }

    return null;
}

const formatQuantity = (quantity) => {
    if (quantity === null || quantity === undefined) return null;

    return Number.isInteger(quantity)
        ? String(quantity)
        : String(Number(quantity.toFixed(2)));
}

const buildGroceryItems = (ingredients) => {
    const mergedItems = new Map();
    const separateItems = [];

    for (const ingredient of ingredients) {
        const name = ingredient.name?.trim();
        if (!name) continue;

        const unit = ingredient.unit?.trim() || null;
        const quantity = ingredient.quantity?.trim() || null;
        const parsedQuantity = parseQuantity(quantity);
        const mergeKey = `${normalizeIngredientName(name)}|${normalizeUnit(unit)}`;

        if (parsedQuantity === null) {
            separateItems.push({ name, quantity, unit });
            continue;
        }

        const existingItem = mergedItems.get(mergeKey);

        if (existingItem) {
            existingItem.quantityValue += parsedQuantity;
        } else {
            mergedItems.set(mergeKey, {
                name,
                quantityValue: parsedQuantity,
                unit,
            });
        }
    }

    return [
        ...Array.from(mergedItems.values()).map((item) => ({
            name: item.name,
            quantity: formatQuantity(item.quantityValue),
            unit: item.unit,
        })),
        ...separateItems,
    ];
}

const fetchGroceryItems = async (database, planId) => {
    const result = await database.query(
        `SELECT id, plan_id, name, quantity, unit, checked
         FROM grocery_items
         WHERE plan_id = $1
         ORDER BY id ASC`,
        [planId]
    );

    return result.rows;
}

const generateGroceryListForPlan = async (database, planId) => {
    const planResult = await database.query(
        'SELECT id, name FROM cooking_plans WHERE id = $1',
        [planId]
    );

    if (planResult.rows.length === 0) {
        return null;
    }

    const ingredientsResult = await database.query(
        `SELECT i.name, i.quantity, i.unit
         FROM plan_recipes pr
         JOIN ingredients i ON pr.recipe_id = i.recipe_id
         WHERE pr.plan_id = $1
         ORDER BY i.id ASC`,
        [planId]
    );

    const groceryItems = buildGroceryItems(ingredientsResult.rows);

    await database.query('DELETE FROM grocery_items WHERE plan_id = $1', [planId]);

    if (groceryItems.length > 0) {
        const values = [];
        const placeholders = groceryItems.map((item, index) => {
            const offset = index * 4;
            values.push(planId, item.name, item.quantity, item.unit);
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, false)`;
        });

        await database.query(
            `INSERT INTO grocery_items (plan_id, name, quantity, unit, checked)
             VALUES ${placeholders.join(', ')}`,
            values
        );
    }

    return {
        plan: planResult.rows[0],
        grocery_items: await fetchGroceryItems(database, planId),
    };
}

const getGroceryList = async (req, res) => {
    const { id } = req.params;

    try {
        const planResult = await pool.query(
            'SELECT id, name FROM cooking_plans WHERE id = $1',
            [id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cooking plan not found' });
        }

        const groceryItems = await fetchGroceryItems(pool, id);

        res.json({
            plan: planResult.rows[0],
            grocery_items: groceryItems,
        });
    } catch (error) {
        console.error(`Error fetching grocery list for cooking plan ${id}:`, error);
        res.status(500).json({ error: 'Error fetching grocery list' });
    }
}

const generateGroceryList = async (req, res) => {
    const { id } = req.params;

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const groceryList = await generateGroceryListForPlan(client, id);

        if (!groceryList) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Cooking plan not found' });
        }

        await client.query('COMMIT');
        res.status(201).json(groceryList);
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error(`Error generating grocery list for cooking plan ${id}:`, error);
        res.status(500).json({ error: 'Error generating grocery list' });
    } finally {
        if (client) {
            client.release();
        }
    }
}

const updateGroceryItem = async (req, res) => {
    const { id, itemId } = req.params;
    const { checked } = req.body;

    if (typeof checked !== 'boolean') {
        return res.status(400).json({ error: 'checked must be a boolean' });
    }

    try {
        const result = await pool.query(
            `UPDATE grocery_items
             SET checked = $1
             WHERE id = $2 AND plan_id = $3
             RETURNING id, plan_id, name, quantity, unit, checked`,
            [checked, itemId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Grocery item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error updating grocery item ${itemId} for cooking plan ${id}:`, error);
        res.status(500).json({ error: 'Error updating grocery item' });
    }
}

export {
    generateGroceryListForPlan,
    getGroceryList,
    generateGroceryList,
    updateGroceryItem,
};
