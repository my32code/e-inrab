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

// Fonction pour extraire le CRA du nom de l'admin
const getCRAFromAdminName = (adminName: string): string | null => {
  if (adminName === 'ADMIN') return null; // Super admin voit tout
  const match = adminName.match(/Admin\s+(.+)/);
  return match ? match[1] : null;
};

export const getAllProduits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cra = getCRAFromAdminName(req.user.nom);
    let query = `
      SELECT id, nom, description, categorie, stock, prix_numerique, pieces_requise, delai_mise_disposition, cra
      FROM produits
    `;
    const params: any[] = [];

    // Si c'est un admin spécifique (pas le super admin), filtrer par CRA
    if (cra) {
      query += ' WHERE cra = ?';
      params.push(cra);
    }

    query += ' ORDER BY nom ASC';

    const [rows] = await pool.query(query, params);

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
    // Vérifier si l'admin a le droit de modifier ce produit
    const adminCRA = getCRAFromAdminName(req.user.nom);
    if (adminCRA) {
      const [produit] = await pool.query('SELECT cra FROM produits WHERE id = ?', [id]) as any[];
      if (!produit || produit.cra !== adminCRA) {
        return res.status(403).json({
          status: 'error',
          message: 'Vous n\'avez pas les droits pour modifier ce produit'
        });
      }
    }

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