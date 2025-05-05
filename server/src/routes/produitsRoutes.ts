import express from 'express';
import { getProduits } from '../controllers/produitsController';

const router = express.Router();

router.get('/', getProduits);

export default router; 

