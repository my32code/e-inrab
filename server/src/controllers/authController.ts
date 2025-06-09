import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, updateUserSession, findUserBySessionId, clearUserSession, updateUserProfile, updateUserPassword } from '../models/User';
import { v4 as uuidv4 } from 'uuid';


export const register = async (req: Request, res: Response) => {
  try {
    const { nom, email, mot_de_passe, telephone } = req.body;
    
    if (!nom || !email || !mot_de_passe || !telephone) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Validation du format du numéro de téléphone
    const phoneRegex = /^\+?[0-9\s\-\(\)]{8,15}$/;
    if (!phoneRegex.test(telephone)) {
      return res.status(400).json({ error: 'Format de numéro de téléphone invalide' });
    }

    // Log pour le débogage du hachage
    console.log('Hachage du mot de passe:');
    console.log('Mot de passe original:', mot_de_passe);

    const hashedPassword = await bcrypt.hash(mot_de_passe, 12);
    console.log('Mot de passe hashé:', hashedPassword);
    
    await createUser({ 
      nom,
      email,
      mot_de_passe: hashedPassword,
      role: 'agriculteur', // Rôle par défaut
      telephone,
      date_inscription: new Date(),
    });
    
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error: any) {
    console.error('Erreur détaillée d\'inscription:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    res.status(500).json({ error: 'Échec de l\'inscription' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    // Ajout de logs pour le débogage
    console.log('Tentative de connexion pour:', email);

    const user = await findUserByEmail(email);
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
    
    if (!user) {
      console.log('Échec de l\'authentification: utilisateur non trouvé');
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Ajout de logs pour le débogage du mot de passe
    console.log('Comparaison des mots de passe:');
    console.log('Mot de passe fourni:', mot_de_passe);
    console.log('Hash stocké:', user.mot_de_passe);
    
    const passwordMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    console.log('Résultat de la comparaison:', passwordMatch);

    if (!passwordMatch) {
      console.log('Échec de l\'authentification: mot de passe incorrect');
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    if (!user.id) {
      console.log('Erreur critique: ID utilisateur manquant');
      return res.status(500).json({ error: 'Erreur : ID utilisateur manquant' });
    }

    const sessionId = uuidv4();
    console.log('Nouveau sessionId généré:', sessionId);
    
    await updateUserSession(user.id, sessionId);
    console.log('Session mise à jour dans la base de données');

    res.json({ 
      sessionId,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        telephone: user.telephone
      }
    });

  } catch (error) {
    console.error('Erreur détaillée de connexion:', error);
    res.status(500).json({ error: 'Erreur de connexion' });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
      console.log('Vérification de session: Aucun sessionId fourni');
      return res.status(401).json({ error: 'Non authentifié' });
    }

    console.log('Vérification de session pour sessionId:', sessionId);
    const user = await findUserBySessionId(sessionId);

    if (!user) {
      console.log('Vérification de session: Utilisateur non trouvé pour ce sessionId');
      return res.status(401).json({ error: 'Session invalide' });
    }

    console.log('Vérification de session réussie pour:', user.email);
    (req as any).user = user;
    
    res.status(200).json({ 
      message: 'Authentifié',
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error);
    res.status(401).json({ error: 'Non authentifié' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers.authorization?.split(' ')[1];
    if (sessionId) {
      await clearUserSession(sessionId);
    }
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { nom, email } = req.body;
    const sessionId = req.headers.authorization?.split(' ')[1];

    if (!sessionId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!nom || !email) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    const user = await findUserBySessionId(sessionId);
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    const updatedUser = await updateUserProfile(user.id, nom, email);
    res.status(200).json({ user: updatedUser });
  } catch (error: any) {
    if (error.message === 'Email déjà utilisé') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const sessionId = req.headers.authorization?.split(' ')[1];

    if (!sessionId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const user = await findUserBySessionId(sessionId);
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    await updateUserPassword(user.id, currentPassword, newPassword);
    await clearUserSession(sessionId); // Invalide la session côté serveur

    // Indique au client de se déconnecter
    res.status(200).json({ 
      message: 'Mot de passe mis à jour avec succès',
      shouldLogout: true // Nouveau flag
    });
  } catch (error: any) {
    if (error.message === 'Mot de passe actuel incorrect') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};