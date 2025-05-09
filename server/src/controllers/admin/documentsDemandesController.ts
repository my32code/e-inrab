import { Request, Response } from 'express';
import { pool } from '../../services/db';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}

export const getAllDocumentsDemandes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = `
      SELECT 
        dd.id,
        dd.demande_id,
        dd.nom_fichier,
        dd.chemin_fichier,
        dd.date_upload,
        d.description as demande_description,
        u.nom as utilisateur_nom,
        u.email as utilisateur_email
      FROM documents_demandes dd
      LEFT JOIN demandes d ON dd.demande_id = d.id
      LEFT JOIN utilisateurs u ON d.utilisateur_id = u.id
      ORDER BY dd.date_upload DESC
    `;

    const [rows] = await pool.query(query);
    
    const documents = (rows as any[]).map(row => ({
      id: row.id,
      demande_id: row.demande_id,
      nom_fichier: row.nom_fichier,
      chemin_fichier: row.chemin_fichier,
      date_upload: row.date_upload,
      demande_description: row.demande_description,
      utilisateur: row.utilisateur_nom ? {
        nom: row.utilisateur_nom,
        email: row.utilisateur_email
      } : null
    }));

    res.json({ data: documents });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents de demande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents de demande' });
  }
}; 