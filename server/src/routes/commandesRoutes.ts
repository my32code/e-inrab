import { Router } from 'express';
import { createCommande } from '../controllers/commandesController';

const router = Router();

router.post('/', createCommande);

export default router; 