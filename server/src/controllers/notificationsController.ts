import { Request, Response } from 'express';
import { pool } from '../services/db';
// import nodemailer from 'nodemailer';
// import { Resend } from 'resend';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}

// Configuration de l'email
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });
// const resend = new Resend(process.env.RESEND_API_KEY);

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
export const sendEmailNotification = async (destinataires: string[], titre: string, messageHtml: string) => {
  try {
    console.log('📨 Envoi email via Mailjet à:', destinataires);
    console.log('Titre:', titre);
    console.log('Message:', messageHtml);


    // Préparer les destinataires pour Mailjet
    const toEmails = destinataires.map(email => ({
      Email: email,
      Name: email.split('@')[0] // Utilise le nom avant @ comme nom d'affichage
    }));

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.MJ_APIKEY_PUBLIC}:${process.env.MJ_APIKEY_PRIVATE}`
        ).toString('base64')
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL || 'princeadilehou@gmail.com',
              Name: 'INRAB',
            },
            To: toEmails,
            Subject: titre,
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2F855A;">${titre}</h2>
                <div style="color: #4A5568;">${messageHtml}</div>
                <div style="margin-top: 20px; padding: 15px; background-color: #F7FAFC; border-radius: 5px;">
                  <p style="margin: 0; color: #718096;">INRAB - Institut National de Recherche Agricole du Bénin</p>
                </div>
              </div>
            `,
            TextPart: `Notification INRAB: ${titre}\n\n${messageHtml.replace(/<[^>]*>/g, '')}`
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur Mailjet API:', errorData);
      throw new Error(`Mailjet API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Email envoyé via Mailjet avec succès:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de notification:', error);
    throw error;
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

// Envoyer un email de contact
export const sendContactEmail = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Envoyer l'email à l'admin
    await sendEmailNotification(
      ['princeadilehou@gmail.com'],
      `Nouveau message`,
      `
        <p><strong>De :</strong> ${firstName} ${lastName} (${email})</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `
    );

    // Envoyer une confirmation à l'expéditeur
    await sendEmailNotification(
      [email],
      'Confirmation de votre message - INRAB',
      `
        <p>Cher(e) ${firstName} ${lastName},</p>
        <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>Cordialement,<br>L'équipe INRAB</p>
      `
    );

    res.json({
      status: 'success',
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l\'envoi du message'
    });
  }
}; 
