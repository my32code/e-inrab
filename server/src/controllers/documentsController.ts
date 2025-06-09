import { Request, Response } from 'express';
import { pool } from '../services/db';
import fs from 'fs';
import { sendEmailNotification } from '../controllers/notificationsController';
import path from 'path';
import mime from 'mime-types';

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
    console.log('Récupération documents avec params:', { commandeId, demandeId });
    let query = '';
    let params: any[] = [];

    if (commandeId) {
      query = `
        SELECT d.*, p.nom as produit_nom 
        FROM documents d 
        LEFT JOIN commandes c ON d.commande_id = c.id 
        LEFT JOIN produits p ON c.produit_id = p.id 
        WHERE d.commande_id = ? AND d.type_document = 'commande'
        ORDER BY d.created_at DESC
      `;
      params = [commandeId];
      console.log('Requête commande:', { query, params });
    } else if (demandeId) {
      query = `
        SELECT 
            d.id, 
            d.nom_fichier, 
            d.chemin_fichier, 
            d.type_document, 
            NULL AS document_demande_id, 
            NULL AS document_demande_nom,
            NULL AS document_demande_chemin, 
            NULL AS document_demande_date
        FROM documents d
        WHERE d.demande_id = ?

        UNION

        SELECT 
            dd.id, 
            dd.nom_fichier, 
            dd.chemin_fichier, 
            'service' AS type_document,  
            dd.id AS document_demande_id, 
            dd.nom_fichier AS document_demande_nom,
            dd.chemin_fichier AS document_demande_chemin, 
            dd.date_upload AS document_demande_date
        FROM documents_demandes dd
        WHERE dd.demande_id = ?;





      `;
      params = [demandeId, demandeId];
      console.log('Requête service:', { query, params });
    } else {
      console.log('Paramètres manquants');
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
    let docContextInfo = '';
    // Déterminer qui a uploadé le document
    const uploadedBy = req.user.role === 'admin' ? 'admin' : 'client';

    // Vérifier l'existence de la commande ou de la demande
    if (type === 'commande' && commandeId) {
      // Vérifier si la commande existe
      const [commandeRows] = await pool.query(
        'SELECT id FROM commandes WHERE id = ?',
        [commandeId]
      );
      
      if (!commandeRows || (commandeRows as any[]).length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Commande non trouvée'
        });
      }

      const commande = (commandeRows as any[])[0];
      docContextInfo = `Commande ID : ${commande.id} (Produit : ${commande.produit_nom})`;


      query = `
        INSERT INTO documents (commande_id, nom_fichier, chemin_fichier, type_document, categorie, uploaded_by)
        VALUES (?, ?, ?, 'commande', ?, ?)
      `;
      params = [commandeId, file.originalname, file.path, categorie, uploadedBy];
    } else if (type === 'service' && demandeId) {
      // Vérifier si la demande existe
      const [demandeRows] = await pool.query(
        'SELECT id FROM demandes WHERE id = ?',
        [demandeId]
      );
      
      if (!demandeRows || (demandeRows as any[]).length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Demande de service non trouvée'
        });
      }

      const demande = (demandeRows as any[])[0];
      docContextInfo = `Demande ID : ${demande.id} (Service : ${demande.service_nom})`;


      query = `
        INSERT INTO documents (demande_id, nom_fichier, chemin_fichier, type_document, categorie, uploaded_by)
        VALUES (?, ?, ?, 'service', ?, ?)
      `;
      params = [demandeId, file.originalname, file.path, categorie, uploadedBy];
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Type et ID requis'
      });
    }

    const [result] = await pool.query(query, params);

     // ✅ ENVOYER NOTIFICATION PAR EMAIL AUX ADMINS
     const [admins] = await pool.query('SELECT email FROM utilisateurs WHERE role = "admin"');
     const destinataires = (admins as any[]).map(admin => admin.email);
 
     await sendEmailNotification(
       destinataires,
       'Nouveau document uploadé',
       `
         <p>Un document a été uploadé par <strong>${req.user.nom}</strong> (${req.user.email})</p>
         ${docContextInfo}
         <p><strong>Fichier :</strong> ${file.originalname}</p>
         <p><strong>Catégorie :</strong> ${categorie}</p>
       `
     );

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
      : path.join(__dirname, '../../', filePath);
    
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
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors du téléchargement'
    });
  }
};


// Récupérer tous les documents de l'utilisateur connecté
export const getUserDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const query = `
      (
        -- Documents de commandes
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
          NULL as document_demande_date
        FROM documents d
        LEFT JOIN commandes c ON d.commande_id = c.id
        LEFT JOIN demandes de ON d.demande_id = de.id
        LEFT JOIN produits p ON c.produit_id = p.id
        LEFT JOIN services s ON de.service_id = s.id
        WHERE c.utilisateur_id = ?
      )
      UNION ALL
      (
        -- Documents de demandes
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
          NULL as document_demande_date
        FROM documents d
        LEFT JOIN demandes de ON d.demande_id = de.id
        LEFT JOIN services s ON de.service_id = s.id
        WHERE de.utilisateur_id = ?
      )
      UNION ALL
      (
        -- Documents de documents_demandes
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
          dd.date_upload as document_demande_date
        FROM documents_demandes dd
        JOIN demandes de ON dd.demande_id = de.id
        LEFT JOIN services s ON de.service_id = s.id
        WHERE de.utilisateur_id = ?
      )
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(query, [userId, userId, userId]);
    
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

 