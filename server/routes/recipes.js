import express from 'express';
import { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, importRecipe, patchRecipe } from '../controllers/recipes.js';

const router = express.Router();

router.get('/', getAllRecipes);
router.post('/import', importRecipe);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
// PATCH /api/recipes/:id - Partial update of a recipe (used for toggling favorite status)
router.patch('/:id', patchRecipe);
router.delete('/:id', deleteRecipe);

export default router;