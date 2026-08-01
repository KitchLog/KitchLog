import express from 'express';
import {
    getAllCookingPlans,
    getCookingPlanById,
    createCookingPlan,
    updateCookingPlan,
    deleteCookingPlan
} from '../controllers/cookingPlans.js';
import {
    getGroceryList,
    generateGroceryList,
    updateGroceryItem
} from '../controllers/groceryLists.js';

const router = express.Router();

router.get('/', getAllCookingPlans);
router.get('/:id/grocery-list', getGroceryList);
router.post('/:id/grocery-list/generate', generateGroceryList);
router.patch('/:id/grocery-list/:itemId', updateGroceryItem);
router.get('/:id', getCookingPlanById);
router.post('/', createCookingPlan);
router.put('/:id', updateCookingPlan);
router.delete('/:id', deleteCookingPlan);

export default router;
