import { Request, Response } from 'express';
import { pool } from '../../services/db';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { sendEmailNotification } from './notificationsController';
import mime from 'mime-types';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../../uploads/documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limite de 5MB
  }
});

// Récupérer les documents liés à une commande ou une demande
export const getDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commandeId, demandeId } = req.query;
    console.log('Récupération documents avec params:', { commandeId, demandeId });
    let query = '';
    let params: any[] = [];

    if (commandeId) {
      query = `
        SELECT d.*, p.nom as produit_nom 
        FROM documents d 
        LEFT JOIN commandes c ON d.commande_id = c.id 
        LEFT JOIN produits p ON c.produit_id = p.id 
        WHERE d.commande_id = ?  AND d.type_document = 'commande'
      `;
      params = [commandeId];
    } else if (demandeId) {
      query = `
        SELECT DISTINCT d.*, s.nom as service_nom,
               dd.id as document_demande_id,
               dd.nom_fichier as document_demande_nom,
               dd.chemin_fichier as document_demande_chemin,
               dd.date_upload as document_demande_date
        FROM demandes de
        LEFT JOIN documents d ON de.id = d.demande_id AND d.type_document = 'service'
        LEFT JOIN services s ON de.service_id = s.id 
        LEFT JOIN documents_demandes dd ON de.id = dd.demande_id
        WHERE de.id = ?
        ORDER BY COALESCE(d.created_at, dd.date_upload) DESC
      `;
      params = [demandeId];
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'ID de commande ou de demande requis'
      });
    }

    const [rows] = await pool.query(query, params);
    console.log('Documents trouvés:', rows);
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
    let emailUtilisateur = '';

    // Déterminer qui a uploadé le document
    const uploadedBy = req.user.role === 'admin' ? 'admin' : 'client';

    // Chemin relatif pour la base de données
    const relativePath = `uploads/documents/${file.filename}`;

    if (type === 'commande' && commandeId) {
      // Récupérer l'email de l'utilisateur lié à la commande
      const [commandeRows] = await pool.query(
        `SELECT u.email FROM commandes c 
         JOIN utilisateurs u ON c.utilisateur_id = u.id 
         WHERE c.id = ?`,
        [commandeId]
      );
      emailUtilisateur = (commandeRows as any[])[0]?.email;

      query = `
        INSERT INTO documents (commande_id, nom_fichier, chemin_fichier, type_document, categorie, uploaded_by)
        VALUES (?, ?, ?, 'commande', ?, ?)
      `;
      params = [commandeId, file.originalname, relativePath, categorie, uploadedBy];

    } else if (type === 'service' && demandeId) {
      // Récupérer le service_id et l'email de l'utilisateur lié à la demande
      const [demandeRows] = await pool.query(
        `SELECT de.service_id, u.email 
         FROM demandes de 
         JOIN utilisateurs u ON de.utilisateur_id = u.id 
         WHERE de.id = ?`,
        [demandeId]
      );
      const serviceId = (demandeRows as any[])[0]?.service_id;
      emailUtilisateur = (demandeRows as any[])[0]?.email;

      query = `
        INSERT INTO documents (demande_id, service_id, nom_fichier, chemin_fichier, type_document, categorie, uploaded_by)
        VALUES (?, ?, ?, ?, 'service', ?, ?)
      `;
      params = [demandeId, serviceId, file.originalname, relativePath, categorie, uploadedBy];

    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Type et ID requis'
      });
    }

    // Insertion du document
    const [result] = await pool.query(query, params);

    // Envoi de l'email de notification
    if (emailUtilisateur) {
      await sendEmailNotification(
        [emailUtilisateur],
        'Nouveau document disponible',
        `Un nouveau document a été ajouté à votre espace. Veuillez le consulter.`
      );
    }

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
    console.log('Tentative de téléchargement du document ID:', id);
    
    // 1. D'abord vérifier si c'est un document_demande avec LEFT JOIN
    let [rows] = await pool.query(
      'SELECT dd.*, de.id as demande_id FROM documents_demandes dd LEFT JOIN demandes de ON dd.demande_id = de.id WHERE dd.id = ?',
      [id]
    );

    let document;
    let isDocumentDemande = false;

    // 2. Si non trouvé, chercher dans documents
    if (!rows || (rows as any[]).length === 0) {
      console.log('Document non trouvé dans documents_demandes, recherche dans documents');
      [rows] = await pool.query(
        'SELECT d.*, de.id as demande_id FROM documents d LEFT JOIN demandes de ON d.demande_id = de.id WHERE d.id = ?',
        [id]
      );
    } else {
      isDocumentDemande = true;
    }

    if (!rows || (rows as any[]).length === 0) {
      console.log('Document non trouvé dans aucune table');
      return res.status(404).json({
        status: 'error',
        message: 'Document non trouvé'
      });
    }

    document = (rows as any[])[0];
    console.log('Document trouvé:', {
      id: document.id,
      nom_fichier: document.nom_fichier,
      chemin_fichier: document.chemin_fichier,
      demande_id: document.demande_id,
      source: isDocumentDemande ? 'documents_demandes' : 'documents'
    });

    const filePath = document.chemin_fichier;
    const fileName = document.nom_fichier;

    if (!filePath) {
      console.log('Chemin du fichier non trouvé dans le document');
      return res.status(404).json({
        status: 'error',
        message: 'Chemin du fichier non trouvé'
      });
    }

    // Gestion unifiée du chemin de fichier
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(__dirname, '../../../', filePath);
    
    console.log('Chemin du fichier:', filePath);
    console.log('Chemin absolu du fichier:', absolutePath);

    if (!fs.existsSync(absolutePath)) {
      console.error('Fichier non trouvé au chemin:', absolutePath);
      return res.status(404).json({
        status: 'error',
        message: 'Fichier non trouvé'
      });
    }

    const mimeType = mime.lookup(absolutePath) || 'application/octet-stream';
    const stats = fs.statSync(absolutePath);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size);

    res.sendFile(absolutePath);
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

// Récupérer tous les documents
export const getAllDocuments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const query = `
            SELECT * FROM (
                (
                    -- Documents de commandes (tous utilisateurs)
                    SELECT 
                        d.id,
                        d.commande_id,
                        d.demande_id,
                        d.service_id,
                        d.nom_fichier,
                        d.chemin_fichier,
                        d.type_document,
                        d.categorie,
                        d.created_at,
                        p.nom as produit_nom,
                        s.nom as service_nom,
                        NULL as document_demande_id,
                        NULL as document_demande_nom,
                        NULL as document_demande_chemin,
                        NULL as document_demande_date,
                        c.utilisateur_id as utilisateur_id,
                        'document_commande' as source_type
                    FROM documents d
                    LEFT JOIN commandes c ON d.commande_id = c.id
                    LEFT JOIN produits p ON c.produit_id = p.id
                    LEFT JOIN demandes de ON d.demande_id = de.id
                    LEFT JOIN services s ON de.service_id = s.id
                    WHERE d.commande_id IS NOT NULL
                )
                UNION ALL
                (
                    -- Documents de demandes (tous utilisateurs)
                    SELECT 
                        d.id,
                        d.commande_id,
                        d.demande_id,
                        d.service_id,
                        d.nom_fichier,
                        d.chemin_fichier,
                        d.type_document,
                        d.categorie,
                        d.created_at,
                        NULL as produit_nom,
                        s.nom as service_nom,
                        NULL as document_demande_id,
                        NULL as document_demande_nom,
                        NULL as document_demande_chemin,
                        NULL as document_demande_date,
                        de.utilisateur_id as utilisateur_id,
                        'document_demande' as source_type
                    FROM documents d
                    LEFT JOIN demandes de ON d.demande_id = de.id
                    LEFT JOIN services s ON de.service_id = s.id
                    WHERE d.demande_id IS NOT NULL
                    AND d.commande_id IS NULL  -- Exclure les docs déjà pris en compte par la première requête
                )
                UNION ALL
                (
                    -- Documents de documents_demandes (tous utilisateurs)
                    SELECT 
                        NULL as id,
                        NULL as commande_id,
                        dd.demande_id,
                        de.service_id,
                        dd.nom_fichier,
                        dd.chemin_fichier,
                        'service' as type_document,
                        'piece_complementaire' as categorie,
                        dd.date_upload as created_at,
                        NULL as produit_nom,
                        s.nom as service_nom,
                        dd.id as document_demande_id,
                        dd.nom_fichier as document_demande_nom,
                        dd.chemin_fichier as document_demande_chemin,
                        dd.date_upload as document_demande_date,
                        de.utilisateur_id as utilisateur_id,
                        'document_demande_upload' as source_type
                    FROM documents_demandes dd
                    JOIN demandes de ON dd.demande_id = de.id
                    LEFT JOIN services s ON de.service_id = s.id
                    WHERE NOT EXISTS (
                        SELECT 1 FROM documents d 
                        WHERE d.demande_id = dd.demande_id 
                        AND d.nom_fichier = dd.nom_fichier
                    )  -- Exclure les fichiers déjà présents dans la table documents
                )
            ) AS combined_data
            GROUP BY 
                CASE 
                    WHEN id IS NOT NULL THEN CONCAT('doc_', id)
                    ELSE CONCAT('doc_dem_', document_demande_id)
                END  -- Regroupement par identifiant unique
            ORDER BY created_at DESC
        `;

        const [rows] = await pool.query(query);
        
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

// Supprimer un document
export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Récupérer le chemin du fichier avant de le supprimer
        const [document] = await pool.query(
            'SELECT chemin_fichier FROM documents WHERE id = ?',
            [id]
        ) as any[];

        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Document non trouvé'
            });
        }

        // Supprimer le fichier physique
        const filePath = path.join(__dirname, '../../../', document.chemin_fichier);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer l'enregistrement de la base de données
        await pool.query('DELETE FROM documents WHERE id = ?', [id]);

        res.json({
            status: 'success',
            message: 'Document supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la suppression du document'
        });
    }
};

 