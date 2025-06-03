import { Request, Response } from 'express';
import { query } from '../services/db';

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

export const getServiceStats = async (req: AuthenticatedRequest, res: Response) => {
  const { annee, mois } = req.query;
  
  try {
    // Statistiques des services les plus demandés
    const servicesStats = await query(`
      SELECT 
        s.nom as serviceName,
        COUNT(d.id) as totalDemandes,
        SUM(CASE WHEN d.statut = 'validée' THEN 1 ELSE 0 END) as demandesValidees,
        SUM(CASE WHEN d.statut = 'en attente' THEN 1 ELSE 0 END) as demandesEnAttente
      FROM demandes d
      JOIN services s ON d.service_id = s.id
      WHERE YEAR(d.date_demande) = ? 
      ${mois ? 'AND MONTH(d.date_demande) = ?' : ''}
      GROUP BY s.id, s.nom
      ORDER BY totalDemandes DESC
    `, mois ? [annee, mois] : [annee]);

    // Statistiques par période
    const periodStats = await query(`
      SELECT 
        MONTH(date_demande) as mois,
        COUNT(*) as totalDemandes,
        SUM(CASE WHEN statut = 'validée' THEN 1 ELSE 0 END) as demandesValidees
      FROM demandes
      WHERE YEAR(date_demande) = ?
      GROUP BY MONTH(date_demande)
      ORDER BY mois
    `, [annee]);

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
  
  try {
    // Statistiques des produits les plus commandés
    const productsStats = await query(`
      SELECT 
        p.nom as productName,
        COUNT(c.id) as totalCommandes,
        SUM(c.quantite) as totalQuantite
      FROM commandes c
      JOIN produits p ON c.produit_id = p.id
      WHERE YEAR(c.created_at) = ? 
      ${mois ? 'AND MONTH(c.created_at) = ?' : ''}
      GROUP BY p.id, p.nom
      ORDER BY totalQuantite DESC
    `, mois ? [annee, mois] : [annee]);

    // Statistiques par période
    const periodStats = await query(`
      SELECT 
        MONTH(created_at) as mois,
        COUNT(*) as totalCommandes,
        SUM(quantite) as totalQuantite
      FROM commandes
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      ORDER BY mois
    `, [annee]);

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
  
  try {
    // Statistiques des transactions (factures)
    const transactionStats = await query(`
      SELECT 
        MONTH(d.created_at) as mois,
        COUNT(*) as totalTransactions,
        SUM(c.quantite * c.prix_unitaire) as montantTotal
      FROM documents d
      JOIN commandes c ON d.commande_id = c.id
      WHERE YEAR(d.created_at) = ?
      AND d.type_document = 'commande'
      AND d.categorie = 'facture'
      ${mois ? 'AND MONTH(d.created_at) = ?' : ''}
      GROUP BY MONTH(d.created_at)
      ORDER BY mois
    `, mois ? [annee, mois] : [annee]);

    // Statistiques par type de document
    const documentTypeStats = await query(`
      SELECT 
        d.categorie as type_document,
        COUNT(*) as totalDocuments,
        SUM(c.quantite * c.prix_unitaire) as montantTotal
      FROM documents d
      JOIN commandes c ON d.commande_id = c.id
      WHERE YEAR(d.created_at) = ?
      AND d.type_document = 'commande'
      AND d.categorie = 'facture'
      ${mois ? 'AND MONTH(d.created_at) = ?' : ''}
      GROUP BY d.categorie
    `, mois ? [annee, mois] : [annee]);

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