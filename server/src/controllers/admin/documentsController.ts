import { Request, Response } from 'express';
import { pool } from '../../config/database';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}

export const getAllDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.commande_id,
        d.nom_fichier,
        d.chemin_fichier,
        d.type_document,
        d.created_at,
        u.nom as utilisateur_nom,
        u.email as utilisateur_email,
        c.reference_paiement,
        dm.id as demande_id,
        dm.description as demande_description
      FROM documents d
      LEFT JOIN commandes c ON d.commande_id = c.id
      LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
      LEFT JOIN demandes dm ON d.demande_id = dm.id
      ORDER BY d.created_at DESC
    `;

    const [rows] = await pool.query(query);
    
    const documents = (rows as any[]).map(row => ({
      id: row.id,
      commande_id: row.commande_id,
      nom_fichier: row.nom_fichier,
      chemin_fichier: row.chemin_fichier,
      type_document: row.type_document,
      created_at: row.created_at,
      utilisateur: row.utilisateur_nom ? {
        nom: row.utilisateur_nom,
        email: row.utilisateur_email
      } : null,
      commande: row.reference_paiement ? {
        id: row.commande_id,
        reference_paiement: row.reference_paiement
      } : null,
      demande: row.demande_id ? {
        id: row.demande_id,
        description: row.demande_description
      } : null
    }));

    res.json({ data: documents });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
};

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier n\'a été uploadé' });
    }

    const { type, reference } = req.body;
    if (!type || !reference) {
      return res.status(400).json({ error: 'Type et référence requis' });
    }

    // Vérifier si la commande ou la demande existe
    let query;
    let params;
    let documentType;

    if (type === 'commande') {
      query = 'SELECT id, utilisateur_id FROM commandes WHERE reference_paiement = ?';
      params = [reference];
      documentType = 'commande';
    } else {
      query = 'SELECT id, utilisateur_id FROM demandes WHERE id = ?';
      params = [reference];
      documentType = 'service';
    }

    const [rows] = await pool.query(query, params);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'Commande ou demande non trouvée' });
    }

    const record = rows[0] as any;
    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const filePath = path.join('uploads', fileName);

    // Déplacer le fichier
    fs.renameSync(req.file.path, filePath);

    // Enregistrer dans la base de données
    const insertQuery = `
      INSERT INTO documents (
        commande_id,
        nom_fichier,
        chemin_fichier,
        type_document,
        created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `;

    await pool.query(insertQuery, [
      documentType === 'commande' ? record.id : null,
      req.file.originalname,
      fileName,
      documentType
    ]);

    res.json({ message: 'Document uploadé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du document' });
  }
};

export const getDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        d.*,
        c.utilisateur_id as commande_utilisateur_id,
        dm.utilisateur_id as demande_utilisateur_id
      FROM documents d
      LEFT JOIN commandes c ON d.commande_id = c.id
      LEFT JOIN demandes dm ON d.demande_id = dm.id
      WHERE d.id = ?
    `;

    const [rows] = await pool.query(query, [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const document = rows[0] as any;
    const userId = document.commande_utilisateur_id || document.demande_utilisateur_id;

    // Vérifier si l'utilisateur a le droit d'accéder au document
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const filePath = path.join('uploads', document.chemin_fichier);
    res.download(filePath, document.nom_fichier);
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du document' });
  }
}; 