import { Request, Response } from 'express';
import { query } from '../services/db';
import { sendEmailNotification } from '../controllers/notificationsController';
import fs from 'fs';
import path from 'path';

const COMMANDES_ATTENTE_PATH = path.resolve(__dirname, '../../data/commandes_attente.json');

// Assurer que le fichier existe
if (!fs.existsSync(COMMANDES_ATTENTE_PATH)) {
    fs.writeFileSync(COMMANDES_ATTENTE_PATH, '[]');
}

interface User {
  id: number;
  // Ajoutez d'autres propriétés de l'utilisateur si nécessaire
}

interface AuthenticatedRequest extends Request {
  user: User;
}

interface CommandeAttente {
    id: string;
    utilisateur_id: number;
    produit_id: number;
    quantite: number;
    prix_unitaire: number;
    statut: string;
    created_at: string;
}

const mapStatus = (dbStatus: string) => {
    const statusMap: { [key: string]: string } = {
        'en_attente': 'pending',
        'payee': 'paid',
        'expediee': 'shipped',
        'annulee': 'cancelled'
    };
    return statusMap[dbStatus] || dbStatus;
};

// Fonction pour lire les commandes en attente
const readCommandesAttente = (): CommandeAttente[] => {
    try {
        const data = fs.readFileSync(COMMANDES_ATTENTE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier commandes_attente.json:', error);
        return [];
    }
};

// Fonction pour écrire les commandes en attente
const writeCommandesAttente = (commandes: CommandeAttente[]) => {
    try {
        fs.writeFileSync(COMMANDES_ATTENTE_PATH, JSON.stringify(commandes, null, 2));
    } catch (error) {
        console.error('Erreur lors de l\'écriture dans commandes_attente.json:', error);
        throw error;
    }
};

export const createCommande = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { produit_id, quantite, prix_unitaire } = req.body;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
              success: false, 
              message: 'Utilisateur non authentifié' 
            });
          }
          
        if (!produit_id || !quantite || !prix_unitaire) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis (produit_id, quantite, prix_unitaire)'
            });
        }

        // Vérifier le stock disponible
        const [produit] = await query('SELECT stock FROM produits WHERE id = ?', [produit_id]) as any[];
        
        if (!produit) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        if (produit.stock < quantite) {
            return res.status(400).json({
                success: false,
                message: `Stock insuffisant. Quantité disponible : ${produit.stock}`,
                stock_disponible: produit.stock
            });
        }

        const utilisateur_id = req.user.id;
        const commandeId = Date.now().toString(); // Générer un ID unique

        // Créer l'objet commande
        const nouvelleCommande: CommandeAttente = {
            id: commandeId,
            utilisateur_id,
            produit_id,
            quantite,
            prix_unitaire,
            statut: 'en_attente',
            created_at: new Date().toISOString()
        };

        // Lire les commandes existantes
        const commandes = readCommandesAttente();
        
        // Ajouter la nouvelle commande
        commandes.push(nouvelleCommande);
        
        // Écrire dans le fichier et attendre que ce soit fait
        await new Promise((resolve, reject) => {
            try {
                fs.writeFileSync(COMMANDES_ATTENTE_PATH, JSON.stringify(commandes, null, 2));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });

        // 🔔 Envoi d'email aux admins concernés par le CRA
        const [produitInfo] = await query('SELECT cra FROM produits WHERE id = ?', [produit_id]) as any[];
        const cra = produitInfo.cra;

        // Récupérer les admins concernés par ce CRA
        const admins = await query(
          'SELECT email FROM utilisateurs WHERE role = "admin" AND (nom = "ADMIN" OR nom LIKE ?)',
          [`Admin ${cra}%`]
        );
        const destinataires = (admins as any[]).map(admin => admin.email);

        await sendEmailNotification(
            destinataires,
            'Nouvelle commande en attente',
            `
                <p>Un utilisateur a soumis une nouvelle commande.</p>
                <p><strong>Produit ID :</strong> ${produit_id}</p>
                <p><strong>Quantité :</strong> ${quantite}</p>
                <p><strong>Prix unitaire :</strong> ${prix_unitaire}</p>
                <p><strong>Utilisateur ID :</strong> ${utilisateur_id}</p>
                <p><strong>CRA :</strong> ${cra}</p>
            `
        );

        res.status(201).json({ 
            success: true, 
            message: 'Commande créée avec succès',
            commande: nouvelleCommande
        });
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création de la commande' 
        });
    }
};

// Nouvelle fonction pour transférer une commande vers la BDD
export const transfererCommandeVersBDD = async (commandeData: any) => {
    try {
        // Si on a déjà les données de la commande, les utiliser directement
        if (commandeData && commandeData.id) {
            console.log('Utilisation des données fournies:', commandeData);
            
            // Insérer dans la BDD
            const result = await query(
                'INSERT INTO commandes (utilisateur_id, produit_id, quantite, prix_unitaire, statut) VALUES (?, ?, ?, ?, ?)',
                [commandeData.utilisateur_id, commandeData.produit_id, commandeData.quantite, commandeData.prix_unitaire, 'en_attente']
            );

            // Vérifier que le résultat contient bien l'ID inséré
            if (!result || !('insertId' in result)) {
                throw new Error('Erreur lors de l\'insertion de la commande');
            }

            // Retirer du fichier JSON si la commande y existe
            try {
                const commandes = JSON.parse(fs.readFileSync(COMMANDES_ATTENTE_PATH, 'utf-8')) as CommandeAttente[];
                const nouvellesCommandes = commandes.filter((c: CommandeAttente) => c.id !== commandeData.id);
                fs.writeFileSync(COMMANDES_ATTENTE_PATH, JSON.stringify(nouvellesCommandes, null, 2));
            } catch (fileError) {
                console.error('Erreur lors de la mise à jour du fichier JSON:', fileError);
                // On continue même si la mise à jour du fichier échoue
            }

            return result.insertId;
        }

        // Si on n'a pas les données, chercher dans le fichier JSON
        const commandes = JSON.parse(fs.readFileSync(COMMANDES_ATTENTE_PATH, 'utf-8')) as CommandeAttente[];
        const commande = commandes.find((c: CommandeAttente) => c.id === commandeData);
        
        if (!commande) {
            console.error('Commande non trouvée dans le fichier:', commandeData);
            console.log('Commandes disponibles:', commandes);
            throw new Error('Commande non trouvée');
        }

        // Insérer dans la BDD
        const result = await query(
            'INSERT INTO commandes (utilisateur_id, produit_id, quantite, prix_unitaire, statut) VALUES (?, ?, ?, ?, ?)',
            [commande.utilisateur_id, commande.produit_id, commande.quantite, commande.prix_unitaire, 'en_attente']
        );

        // Vérifier que le résultat contient bien l'ID inséré
        if (!result || !('insertId' in result)) {
            throw new Error('Erreur lors de l\'insertion de la commande');
        }

        // Retirer du fichier JSON
        const nouvellesCommandes = commandes.filter((c: CommandeAttente) => c.id !== commandeData);
        fs.writeFileSync(COMMANDES_ATTENTE_PATH, JSON.stringify(nouvellesCommandes, null, 2));

        return result.insertId;
    } catch (error) {
        console.error('Erreur lors du transfert de la commande:', error);
        throw error;
    }
};

// Nouvelle fonction pour récupérer les commandes en attente
export const getCommandesAttente = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const commandes = readCommandesAttente();
        
        // Filtrer les commandes de l'utilisateur
        const userCommandes = commandes.filter(c => c.utilisateur_id === userId);

        // Récupérer les informations des produits
        const commandesWithProducts = await Promise.all(userCommandes.map(async (commande) => {
            const [produit] = await query('SELECT nom FROM produits WHERE id = ?', [commande.produit_id]) as any[];
            return {
                ...commande,
                produit_nom: produit?.nom,
                status: mapStatus(commande.statut)
            };
        }));

        res.json({
            status: 'success',
            data: commandesWithProducts
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes en attente:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des commandes en attente'
        });
    }
};

export const getUserCommandes = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;

    try {
        const commandes = await query(`
            SELECT 
                c.id,
                c.produit_id,
                p.nom as produit_nom,
                c.quantite,
                c.prix_unitaire,
                c.statut,
                c.created_at as createdAt
            FROM commandes c
            JOIN produits p ON c.produit_id = p.id
            WHERE c.utilisateur_id = ?
            ORDER BY c.created_at DESC
        `, [userId]);

        const commandesWithStatus = (commandes as any[]).map(commande => ({
            ...commande,
            status: mapStatus(commande.statut)
        }));

        res.json({
            status: 'success',
            data: commandesWithStatus
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des commandes'
        });
    }
};

export const getCommande = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [commande] = await query(`
            SELECT 
                c.*,
                p.nom as produit_nom
            FROM commandes c
            JOIN produits p ON c.produit_id = p.id
            WHERE c.id = ? AND c.utilisateur_id = ?
        `, [id, userId]) as any[];

        if (!commande) {
            return res.status(404).json({
                status: 'error',
                message: 'Commande non trouvée'
            });
        }

        res.json({
            status: 'success',
            data: {
                ...commande,
                status: mapStatus(commande.statut)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération de la commande'
        });
    }
};

// Fonction pour supprimer une commande
export const deleteCommande = async (commandeId: string) => {
    try {
        // D'abord, vérifier si la commande est dans le fichier JSON
        const commandes = readCommandesAttente();
        const commandeInJson = commandes.find(c => c.id === commandeId);

        if (commandeInJson) {
            // Si la commande est dans le JSON, la supprimer du fichier
            const nouvellesCommandes = commandes.filter(c => c.id !== commandeId);
            fs.writeFileSync(COMMANDES_ATTENTE_PATH, JSON.stringify(nouvellesCommandes, null, 2));
            return true;
        } else {
            // Si la commande n'est pas dans le JSON, vérifier dans la BDD
            const [commande] = await query('SELECT * FROM commandes WHERE id = ?', [commandeId]) as any[];
            
            if (!commande) {
                throw new Error('Commande non trouvée');
            }

            // Supprimer de la BDD
            await query('DELETE FROM commandes WHERE id = ?', [commandeId]);
            return true;
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
        throw error;
    }
}; 