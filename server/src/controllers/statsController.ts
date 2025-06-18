import { Request, Response } from 'express';
import { pool } from '../services/db';

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

export const getServiceStats = async (req: AuthenticatedRequest, res: Response) => {
  const { annee, mois } = req.query;
  const cra = getCRAFromAdminName(req.user.nom);
  
  try {
    // Statistiques des services les plus demandés
    let query = `
      SELECT 
        s.nom as serviceName,
        s.cra as service_cra,
        COUNT(d.id) as totalDemandes,
        SUM(CASE WHEN d.statut = 'validée' THEN 1 ELSE 0 END) as demandesValidees,
        SUM(CASE WHEN d.statut = 'en attente' THEN 1 ELSE 0 END) as demandesEnAttente,
        SUM(CASE WHEN d.statut = 'en cours' THEN 1 ELSE 0 END) as demandesEnCours,
        SUM(CASE WHEN d.statut = 'livrée' THEN 1 ELSE 0 END) as demandesLivrees,
        SUM(CASE WHEN d.statut = 'rejetée' THEN 1 ELSE 0 END) as demandesRejetees
      FROM demandes d
      JOIN services s ON d.service_id = s.id
      WHERE YEAR(d.date_demande) = ? 
      ${mois ? 'AND MONTH(d.date_demande) = ?' : ''}
    `;
    const params: any[] = mois ? [annee, mois] : [annee];

    // Si c'est un admin spécifique (pas le super admin), filtrer par CRA
    if (cra) {
      query += ' AND s.cra = ?';
      params.push(cra);
    }

    query += ' GROUP BY s.id, s.nom, s.cra ORDER BY totalDemandes DESC';

    const [servicesStats] = await pool.query(query, params);

    // Statistiques par période
    let periodQuery = `
      SELECT 
        MONTH(d.date_demande) as mois,
        COUNT(*) as totalDemandes,
        SUM(CASE WHEN d.statut = 'validée' THEN 1 ELSE 0 END) as demandesValidees,
        SUM(CASE WHEN d.statut = 'en attente' THEN 1 ELSE 0 END) as demandesEnAttente,
        SUM(CASE WHEN d.statut = 'en cours' THEN 1 ELSE 0 END) as demandesEnCours,
        SUM(CASE WHEN d.statut = 'livrée' THEN 1 ELSE 0 END) as demandesLivrees,
        SUM(CASE WHEN d.statut = 'rejetée' THEN 1 ELSE 0 END) as demandesRejetees
      FROM demandes d
      JOIN services s ON d.service_id = s.id
      WHERE YEAR(d.date_demande) = ?
    `;
    const periodParams: any[] = [annee];

    if (cra) {
      periodQuery += ' AND s.cra = ?';
      periodParams.push(cra);
    }

    periodQuery += ' GROUP BY MONTH(d.date_demande) ORDER BY mois';

    const [periodStats] = await pool.query(periodQuery, periodParams);

    res.json({
      status: 'success',
      data: {
        servicesStats,
        periodStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des services:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

export const getOrderStats = async (req: AuthenticatedRequest, res: Response) => {
  const { annee, mois } = req.query;
  const cra = getCRAFromAdminName(req.user.nom);
  
  try {
    // Statistiques des produits les plus commandés
    let query = `
      SELECT 
        p.nom as productName,
        p.cra as produit_cra,
        COUNT(c.id) as totalCommandes,
        SUM(c.quantite) as totalQuantite
      FROM commandes c
      JOIN produits p ON c.produit_id = p.id
      WHERE YEAR(c.created_at) = ? 
      ${mois ? 'AND MONTH(c.created_at) = ?' : ''}
    `;
    const params: any[] = mois ? [annee, mois] : [annee];

    // Si c'est un admin spécifique (pas le super admin), filtrer par CRA
    if (cra) {
      query += ' AND p.cra = ?';
      params.push(cra);
    }

    query += ' GROUP BY p.id, p.nom, p.cra ORDER BY totalQuantite DESC';

    const [productsStats] = await pool.query(query, params);

    // Statistiques par période
    let periodQuery = `
      SELECT 
        MONTH(c.created_at) as mois,
        COUNT(*) as totalCommandes,
        SUM(c.quantite) as totalQuantite
      FROM commandes c
      JOIN produits p ON c.produit_id = p.id
      WHERE YEAR(c.created_at) = ?
    `;
    const periodParams: any[] = [annee];

    if (cra) {
      periodQuery += ' AND p.cra = ?';
      periodParams.push(cra);
    }

    periodQuery += ' GROUP BY MONTH(c.created_at) ORDER BY mois';

    const [periodStats] = await pool.query(periodQuery, periodParams);

    res.json({
      status: 'success',
      data: {
        productsStats,
        periodStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des commandes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

export const getTransactionStats = async (req: AuthenticatedRequest, res: Response) => {
  const { annee, mois } = req.query;
  const cra = getCRAFromAdminName(req.user.nom);
  
  try {
    // Statistiques des transactions (factures)
    let query = `
      SELECT 
        MONTH(d.created_at) as mois,
        COUNT(*) as totalTransactions,
        SUM(c.quantite * c.prix_unitaire) as montantTotal
      FROM documents d
      JOIN commandes c ON d.commande_id = c.id
      JOIN produits p ON c.produit_id = p.id
      WHERE YEAR(d.created_at) = ?
      AND d.type_document = 'commande'
      AND d.categorie = 'facture'
      ${mois ? 'AND MONTH(d.created_at) = ?' : ''}
    `;
    const params: any[] = mois ? [annee, mois] : [annee];

    // Si c'est un admin spécifique (pas le super admin), filtrer par CRA
    if (cra) {
      query += ' AND p.cra = ?';
      params.push(cra);
    }

    query += ' GROUP BY MONTH(d.created_at) ORDER BY mois';

    const [transactionStats] = await pool.query(query, params);

    // Statistiques par type de document
    let docTypeQuery = `
      SELECT 
        d.categorie as type_document,
        COUNT(*) as totalDocuments,
        SUM(c.quantite * c.prix_unitaire) as montantTotal
      FROM documents d
      JOIN commandes c ON d.commande_id = c.id
      JOIN produits p ON c.produit_id = p.id
      WHERE YEAR(d.created_at) = ?
      AND d.type_document = 'commande'
      AND d.categorie = 'facture'
      ${mois ? 'AND MONTH(d.created_at) = ?' : ''}
    `;
    const docTypeParams: any[] = mois ? [annee, mois] : [annee];

    if (cra) {
      docTypeQuery += ' AND p.cra = ?';
      docTypeParams.push(cra);
    }

    docTypeQuery += ' GROUP BY d.categorie';

    const [documentTypeStats] = await pool.query(docTypeQuery, docTypeParams);

    res.json({
      status: 'success',
      data: {
        transactionStats,
        documentTypeStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
}; 