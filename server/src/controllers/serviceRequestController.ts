import { Request, Response } from 'express';
import { query } from '../services/db';
import path from 'path';
import fs from 'fs/promises';
import { sendEmailNotification } from '../controllers/notificationsController';

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
    'validée': 'paid',
    'en cours': 'preparing',
    'livrée': 'completed',
    'rejetée': 'cancelled'
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
          [demandeId, file.originalname, filePath]
        );
      }
    }

    const admins = await query('SELECT email FROM utilisateurs WHERE role = "admin"');
    const destinataires = (admins as any[]).map(admin => admin.email);

    await sendEmailNotification(
      destinataires, // tableau d'emails
      'Nouvelle demande de service',
      `
        <p>Un utilisateur a soumis une nouvelle demande de service.</p>
        <p><strong>Service ID :</strong> ${serviceId}</p>
        <p><strong>Description :</strong> ${description}</p>
      `
    );


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
        s.nom as serviceName,
        s.prix as servicePrice
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

export const deleteServiceRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Vérifier que la demande appartient à l'utilisateur et est en attente
    const [request] = await query(
      'SELECT * FROM demandes WHERE id = ? AND utilisateur_id = ? AND statut = "en attente"',
      [id, userId]
    ) as any[];

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Demande non trouvée ou ne peut pas être supprimée'
      });
    }

    // Récupérer les chemins des fichiers avant de les supprimer
    const documentsDemandes = await query(
      'SELECT chemin_fichier FROM documents_demandes WHERE demande_id = ?',
      [id]
    ) as any[];

    // Récupérer les chemins des documents associés
    const documents = await query(
      'SELECT chemin_fichier FROM documents WHERE demande_id = ?',
      [id]
    ) as any[];

    // Supprimer les fichiers physiques des documents_demandes
    for (const doc of documentsDemandes) {
      if (doc.chemin_fichier) {
        try {
          await fs.unlink(doc.chemin_fichier);
        } catch (error) {
          console.error('Erreur lors de la suppression du fichier documents_demandes:', error);
        }
      }
    }

    // Supprimer les fichiers physiques des documents
    for (const doc of documents) {
      if (doc.chemin_fichier) {
        try {
          await fs.unlink(doc.chemin_fichier);
        } catch (error) {
          console.error('Erreur lors de la suppression du fichier documents:', error);
        }
      }
    }

    // Supprimer les documents_demandes
    await query('DELETE FROM documents_demandes WHERE demande_id = ?', [id]);

    // Supprimer les documents associés
    await query('DELETE FROM documents WHERE demande_id = ?', [id]);

    // Supprimer la demande
    await query('DELETE FROM demandes WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Demande et documents associés supprimés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la demande:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de la demande'
    });
  }
};