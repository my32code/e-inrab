import { Request, Response } from 'express';
import { pool } from '../services/db';
import { RowDataPacket } from 'mysql2/promise';

export interface Produit {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  prix: string;
  pieces_requises: string;
  delai_mise_disposition: string;
}

export const getProduits = async (req: Request, res: Response) => {
  try {
    const { categorie, search } = req.query;
    let query = 'SELECT * FROM produits WHERE 1=1';
    const params: any[] = [];

    if (categorie) {
      query += ' AND categorie = ?';
      params.push(categorie);
    }

    if (search) {
      query += ' AND (nom LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    
    res.status(200).json({
      produits: rows.map(row => ({
        id: row.id,
        nom: row.nom,
        description: row.description,
        categorie: row.categorie,
        prix: row.prix,
        pieces_requises: row.pieces_requises,
        delai_mise_disposition: row.delai_mise_disposition
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 