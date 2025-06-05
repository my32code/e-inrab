import { Request, Response } from 'express';
import { pool } from '../services/db';
import nodemailer from 'nodemailer';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}

// Configuration de l'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Récupérer les notifications de l'utilisateur
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Récupération des notifications pour utilisateur:', req.user.id);
    
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    console.log('Notifications trouvées:', rows);

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des notifications'
    });
  }
};

// Marquer une notification comme lue
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Marquage comme lu de la notification:', id, 'pour utilisateur:', req.user.id);
    
    const [result] = await pool.query(
      'UPDATE notifications SET lu = 1 WHERE id = ? AND utilisateur_id = ?',
      [id, req.user.id]
    );

    console.log('Résultat de la mise à jour:', result);

    res.json({
      status: 'success',
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de la notification'
    });
  }
};

// Envoyer une notification par email
export const sendEmailNotification = async (destinataires: string[], titre: string, message: string) => {
  try {
    console.log('Envoi d\'email de notification à:', destinataires);
    console.log('Titre:', titre);
    console.log('Message:', message);

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: destinataires,
      subject: titre,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2F855A;">${titre}</h2>
          <p style="color: #4A5568;">${message}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #F7FAFC; border-radius: 5px;">
            <p style="margin: 0; color: #718096;">INRAB - Institut National de Recherche Agricole du Bénin</p>
          </div>
        </div>
      `
    });

    console.log('Email de notification envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de notification:', error);
  }
};

// Supprimer une notification
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Suppression de la notification:', id, 'pour utilisateur:', req.user.id);
    
    const [result] = await pool.query(
      'DELETE FROM notifications WHERE id = ? AND utilisateur_id = ?',
      [id, req.user.id]
    );

    console.log('Résultat de la suppression:', result);

    res.json({
      status: 'success',
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de la notification'
    });
  }
}; 