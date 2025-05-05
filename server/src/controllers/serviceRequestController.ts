import { Request, Response } from 'express';
import { query } from '../services/db';
import path from 'path';
import fs from 'fs/promises';

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

const UPLOAD_DIR = path.join(__dirname, '../../uploads/documents');

// Assurer que le dossier d'upload existe
(async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
})();

const mapStatus = (dbStatus: string) => {
  const statusMap: { [key: string]: string } = {
    'en attente': 'pending',
    'validée': 'processing',
    'en cours': 'preparing',
    'livrée': 'completed',
    'rejetée': 'rejected'
  };
  return statusMap[dbStatus] || dbStatus;
};

export const createServiceRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { serviceId, description } = req.body;
  const files = req.files as Express.Multer.File[];
  const userId = req.user?.id;

  try {
    // Insérer la demande
    const result = await query(
      'INSERT INTO demandes (utilisateur_id, service_id, quantite, description) VALUES (?, ?, ?, ?)',
      [userId, serviceId, 1, description]
    );

    const demandeId = (result as any).insertId;

    // Traiter les fichiers
    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        await fs.writeFile(filePath, file.buffer);
        
        await query(
          'INSERT INTO documents_demandes (demande_id, nom_fichier, chemin_fichier) VALUES (?, ?, ?)',
          [demandeId, file.originalname, fileName]
        );
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Demande créée avec succès',
      data: { id: demandeId }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création de la demande'
    });
  }
};

export const getUserServiceRequests = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const requests = await query(`
      SELECT 
        d.id,
        d.service_id as serviceId,
        s.nom as serviceName,
        d.statut,
        d.quantite,
        d.description,
        d.date_demande as createdAt,
        d.montant_proforma as proformaAmount
      FROM demandes d
      JOIN services s ON d.service_id = s.id
      WHERE d.utilisateur_id = ?
      ORDER BY d.date_demande DESC
    `, [userId]);

    // Récupérer les documents pour chaque demande
    const requestsWithDocs = await Promise.all((requests as any[]).map(async (request) => {
      const documents = await query(`
        SELECT chemin_fichier
        FROM documents_demandes
        WHERE demande_id = ?
      `, [request.id]);

      return {
        ...request,
        status: mapStatus(request.statut),
        documents: (documents as any[]).map(doc => `/uploads/documents/${doc.chemin_fichier}`)
      };
    }));

    res.json({
      status: 'success',
      data: requestsWithDocs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des demandes'
    });
  }
};

export const getServiceRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const [request] = await query(`
      SELECT 
        d.*,
        s.nom as serviceName
      FROM demandes d
      JOIN services s ON d.service_id = s.id
      WHERE d.id = ? AND d.utilisateur_id = ?
    `, [id, userId]) as any[];

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Demande non trouvée'
      });
    }

    const documents = await query(
      'SELECT chemin_fichier FROM documents_demandes WHERE demande_id = ?',
      [id]
    );

    res.json({
      status: 'success',
      data: {
        ...request,
        status: mapStatus(request.statut),
        documents: (documents as any[]).map(doc => `/uploads/documents/${doc.chemin_fichier}`)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération de la demande'
    });
  }
}; 