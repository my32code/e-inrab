import { Router } from 'express';
import { testConnection, query } from '../services/db';


const router = Router();

// Nouvelle route dédiée au test de connexion DB
router.get('/db-test', async (req, res) => {
    const isConnected = await testConnection();
    
    if (isConnected) {
        res.status(200).json({ 
            status: 'success',
            message: 'Connexion à la base de données réussie' 
        });
    } else {
        res.status(500).json({ 
            status: 'error',
            message: 'Échec de la connexion à la base de données' 
        });
    }
});



export default router;
