import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { findUserBySessionId } from '../models/User';
import { pool } from '../services/db';
import { generateFacture } from '../controllers/facturesController';
import { transfererCommandeVersBDD } from '../controllers/commandesController';
import { sendEmailNotification } from '../controllers/notificationsController';

const router = express.Router();

interface User {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}


// Middleware d'authentification
const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers.authorization?.split(' ')[1];

    if (!sessionId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await findUserBySessionId(sessionId);

    if (!user) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Appliquer l'authentification à toutes les routes
router.use((req, res, next) => {
  // Exclure la route /webhook de l'authentification
  if (req.path === '/webhook' && req.method === 'POST') {
    return next();
  }
  authenticateRequest(req, res, next);
});


const handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Webhook FedaPay reçu:', req.body);
    
    // Vérifier la signature
    const signature = req.headers['x-fedapay-signature'];
    if (!signature) {
      console.error('Signature manquante');
      res.status(400).json({ error: 'Signature manquante' });
      return;
    }

    // Vérifier que c'est bien un événement de transaction approuvée
    if (req.body.name !== 'transaction.approved') {
      console.log('Événement ignoré:', req.body.name);
      res.status(200).json({ message: 'Événement ignoré' });
      return;
    }

    const transaction = req.body.data || req.body.entity;
    const commandeId = transaction.custom_metadata?.commande_id;
    const localStorageData = transaction.custom_metadata?.localStorageData;
    const clientInfo = transaction.metadata?.paid_customer;

    console.log('ID commande:', commandeId);
    console.log('Données localStorage:', localStorageData);
    console.log('Informations client:', clientInfo);

    if (!commandeId) {
      console.error('ID commande manquant');
      res.status(400).json({ error: 'ID commande manquant' });
      return;
    }

    if (!clientInfo) {
      console.error('Informations client manquantes');
      res.status(400).json({ error: 'Informations client manquantes' });
      return;
    }

    let commandeData;
    // Utiliser les données du localStorage si disponibles
    if (localStorageData && String(localStorageData.id) === String(commandeId)) {
      console.log('Utilisation des données du localStorage');
      commandeData = localStorageData;
    } else {
      // Si pas de données localStorage, faire la recherche hybride
      const commandeResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/commandes/pending/${commandeId}`
      );
      
      const responseData = await commandeResponse.json();
      console.log('Réponse recherche commande:', responseData);

      if (!responseData.success) {
        console.error('Commande introuvable');
        res.status(400).json({ error: 'Commande introuvable' });
        return;
      }
      commandeData = responseData.data;
    }

    // Transférer vers la BDD
    const newCommandeId = await transfererCommandeVersBDD(commandeData);
    console.log('Transfert réussi, nouvel ID:', newCommandeId);

    // Générer facture avec les bonnes données
    try {
      // Créer un objet request factice avec les données nécessaires
      const factureReq = {
        ...req,
        body: {
          type: 'commande',
          id: newCommandeId,
          isFinal: true,
          commande: JSON.stringify(commandeData)
        }
      } as AuthenticatedRequest;

      // Ajouter l'utilisateur à la requête
      (factureReq as any).user = {
        id: commandeData.utilisateur_id,
        nom: `${clientInfo.firstname} ${clientInfo.lastname}`,
        email: clientInfo.email,
        telephone: commandeData.client_telephone || '',
        role: 'client'
      };

      // La fonction generateFacture gère sa propre réponse
      await generateFacture(factureReq, res);
      console.log('Facture générée avec succès');

      // Envoyer l'email de confirmation au client
      try {
        await sendEmailNotification(
          [clientInfo.email],
          `[INRAB] Confirmation de paiement - Commande ${newCommandeId}`,
          `
            <p>Bonjour ${clientInfo.firstname} ${clientInfo.lastname},</p>
            <p>Nous accusons réception de votre paiement pour la commande N° ${newCommandeId}.</p>
            <p>Votre facture a été générée et est disponible dans votre espace documents.</p>
            <p>Pour toute question, vous pouvez nous contacter au +229 64 28 37 02.</p>
            <p>Nous vous remercions pour votre confiance et restons à votre disposition pour toute information complémentaire.</p>
          `
        );
        console.log('Email de confirmation envoyé au client');
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
        // On continue même si l'email échoue
      }

      return; // On s'arrête ici car generateFacture a déjà envoyé la réponse
    } catch (factureError: unknown) {
      console.error('Erreur lors de la génération de la facture:', factureError);
      // En cas d'erreur de génération de facture, on continue avec la réponse de succès du webhook
    }

    // Si on arrive ici, c'est qu'il y a eu une erreur de génération de facture
    // ou que generateFacture n'a pas envoyé de réponse
    res.status(200).json({ 
      message: 'Webhook traité avec succès',
      commandeId: newCommandeId
    });

  } catch (error: unknown) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ 
      error: 'Erreur lors du traitement du webhook',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

router.post('/webhook', handleWebhook as RequestHandler);

// Simplifier le callback pour ne faire que la redirection
router.get('/callback', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    console.log('=== CALLBACK FEDAPAY REÇU ===');
    console.log('Query params:', req.query);
    
    const { status } = req.query;
    console.log('Statut du callback:', status);

    if (status === 'approved') {
      res.redirect('https://client-production-afb0.up.railway.app//mon-compte?payment=success');
    } else {
      res.redirect('https://client-production-afb0.up.railway.app//mon-compte?payment=error');
    }
  } catch (error) {
    console.error('Erreur lors du traitement du callback:', error);
    res.redirect('https://client-production-afb0.up.railway.app//mon-compte?payment=error');
  }
});

export default router; 
