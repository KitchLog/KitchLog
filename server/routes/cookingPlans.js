import express from 'express';
import {
    getAllCookingPlans,
    getCookingPlanById,
    createCookingPlan,
    updateCookingPlan,
    deleteCookingPlan
} from '../controllers/cookingPlans.js';

const router = express.Router();

router.get('/', getAllCookingPlans);
router.get('/:id', getCookingPlanById);
router.post('/', createCookingPlan);
router.put('/:id', updateCookingPlan);
router.delete('/:id', deleteCookingPlan);

export default router;
