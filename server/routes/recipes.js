import express from 'express';
import { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, importRecipe } from '../controllers/recipes.js';

const router = express.Router();

router.get('/', getAllRecipes);
router.post('/import', importRecipe);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;