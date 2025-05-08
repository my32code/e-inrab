import { Request, Response } from 'express';
import { pool } from '../../services/db';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

export const getAllProduits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nom, description, categorie, stock, prix_numerique, pieces_requise, delai_mise_disposition 
       FROM produits 
       ORDER BY nom ASC`
    );

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des produits'
    });
  }
};

export const updateProduitStock = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Le stock doit être un nombre positif'
    });
  }

  try {
    const [result] = await pool.query(
      'UPDATE produits SET stock = ? WHERE id = ?',
      [stock, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Produit non trouvé'
      });
    }

    res.json({
      status: 'success',
      message: 'Stock mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du stock'
    });
  }
}; 