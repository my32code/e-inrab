import nodemailer from 'nodemailer';

// Configuration du transporteur d'e-mails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction pour envoyer un e-mail de notification (utilisable dans tous les contrôleurs admin)
export const sendEmailNotification = async (
  destinataires: string[],
  titre: string,
  message: string
) => {
  try {
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

    console.log('Email admin envoyé avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail admin :", error);
  }
};
