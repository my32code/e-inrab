import { pool } from '../services/db';
import * as bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2/promise';

export interface User {
  id?: number;
  nom: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  role: string;
  date_inscription: Date;
  session_id?: string;
}

export const createUser = async (user: User): Promise<void> => {
  const [result] = await pool.execute(
    'INSERT INTO utilisateurs (nom, email, telephone, mot_de_passe, role, date_inscription) VALUES (?, ?, ?, ?, ?, NOW())',
    [
      user.nom,
      user.email,
      user.telephone,
      user.mot_de_passe, // Champ conforme à votre table
      user.role || 'agriculteur', // Valeur par défaut si non spécifié
      // date_inscription est géré automatiquement par NOW()
    ]
  );
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM utilisateurs WHERE email = ?', 
    [email]
  );//
  
  return rows.length > 0 ? {
    id: rows[0].id,
    nom: rows[0].nom,
    email: rows[0].email,
    telephone: rows[0].telephone,
    mot_de_passe: rows[0].mot_de_passe,
    role: rows[0].role,
    date_inscription: rows[0].date_inscription
  } : null;
};

export const updateUserSession = async (userId: number, sessionId: string): Promise<void> => {
  await pool.execute(
    'UPDATE utilisateurs SET session_id = ? WHERE id = ?',
    [sessionId, userId]
  );
};

export const findUserBySessionId = async (sessionId: string): Promise<User | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM utilisateurs WHERE session_id = ?',
    [sessionId]
  );
  
  return rows.length > 0 ? {
    id: rows[0].id,
    nom: rows[0].nom,
    email: rows[0].email,
    telephone: rows[0].telephone,
    mot_de_passe: rows[0].mot_de_passe,
    role: rows[0].role,
    date_inscription: rows[0].date_inscription,
    session_id: rows[0].session_id
  } : null;
};

export const updateUserPassword = async (userId: number, currentPassword: string, newPassword: string): Promise<void> => {
  try {
    // Récupérer le mot de passe actuel
    const [user] = await pool.execute<RowDataPacket[]>(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = ?',
      [userId]
    );
    
    if (!user[0]) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user[0].mot_de_passe);
    if (!isValidPassword) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe et invalider la session
    await pool.execute(
      'UPDATE utilisateurs SET mot_de_passe = ?, session_id = NULL WHERE id = ?',
      [hashedPassword, userId]
    );
  } catch (error) {
    throw error;
  }
};

export const clearUserSession = async (sessionId: string): Promise<void> => {
  await pool.execute(
    'UPDATE utilisateurs SET session_id = NULL WHERE session_id = ?',
    [sessionId]
  );
};

export const updateUserProfile = async (userId: number, nom: string, email: string): Promise<User> => {
  try {
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const [existingUser] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM utilisateurs WHERE email = ? AND id != ?',
      [email, userId]
    );
    if (existingUser.length > 0) {
      throw new Error('Email déjà utilisé');
    }

    await pool.execute(
      'UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ?',
      [nom, email, userId]
    );
    
    const [updatedUser] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nom, email, role FROM utilisateurs WHERE id = ?',
      [userId]
    );
    
    return {
      id: updatedUser[0].id,
      nom: updatedUser[0].nom,
      email: updatedUser[0].email,
      mot_de_passe: '', // Non requis pour le retour
      role: updatedUser[0].role,
      date_inscription: new Date() // Valeur par défaut
    } as User;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Email déjà utilisé');
    }
    throw error;
  }
};