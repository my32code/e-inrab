import { Request, Response } from 'express';
import { pool } from '../../services/db';
import fs from 'fs';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}


// Récupérer les documents liés à une commande ou une demande
export const getDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commandeId, demandeId } = req.query;
    let query = '';
    let params: any[] = [];

    if (commandeId) {
      query = `
        SELECT d.*, p.nom as produit_nom 
        FROM documents d 
        LEFT JOIN commandes c ON d.commande_id = c.id 
        LEFT JOIN produits p ON c.produit_id = p.id 
        WHERE d.commande_id = ?
      `;
      params = [commandeId];
    } else if (demandeId) {
      query = `
        SELECT d.*, s.nom as service_nom 
        FROM documents d 
        LEFT JOIN demandes de ON d.demande_id = de.id 
        LEFT JOIN services s ON de.service_id = s.id 
        WHERE d.demande_id = ?
      `;
      params = [demandeId];
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'ID de commande ou de demande requis'
      });
    }

    const [rows] = await pool.query(query, params);
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des documents'
    });
  }
};

// Upload d'un nouveau document
export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'Aucun fichier fourni'
      });
    }

    const { type, commandeId, demandeId, categorie } = req.body;
    let query = '';
    let params: any[] = [];

    if (type === 'commande' && commandeId) {
      query = `
        INSERT INTO documents (commande_id, nom_fichier, chemin_fichier, type_document, categorie)
        VALUES (?, ?, ?, 'commande', ?)
      `;
      params = [commandeId, file.originalname, file.path, categorie];
    } else if (type === 'service' && demandeId) {
      query = `
        INSERT INTO documents (demande_id, nom_fichier, chemin_fichier, type_document, categorie)
        VALUES (?, ?, ?, 'service', ?)
      `;
      params = [demandeId, file.originalname, file.path, categorie];
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Type et ID requis'
      });
    }

    const [result] = await pool.query(query, params);
    res.json({
      status: 'success',
      message: 'Document uploadé avec succès',
      data: { id: (result as any).insertId }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l\'upload du document'
    });
  }
};

// Télécharger un document
export const downloadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (!rows || (rows as any[]).length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document non trouvé'
      });
    }

    const document = (rows as any[])[0];
    const filePath = document.chemin_fichier;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Fichier non trouvé'
      });
    }

    res.download(filePath, document.nom_fichier);
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors du téléchargement du document'
    });
  }
};

// Récupérer tous les documents de l'utilisateur connecté
export const getUserDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT d.*, 
             p.nom as produit_nom,
             s.nom as service_nom
      FROM documents d
      LEFT JOIN commandes c ON d.commande_id = c.id
      LEFT JOIN demandes de ON d.demande_id = de.id
      LEFT JOIN produits p ON c.produit_id = p.id
      LEFT JOIN services s ON de.service_id = s.id
      WHERE c.utilisateur_id = ? OR de.utilisateur_id = ?
      ORDER BY d.created_at DESC
    `;

    const [rows] = await pool.query(query, [userId, userId]);
    
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des documents'
    });
  }
};

 