// import nodemailer from 'nodemailer';

// // Configuration du transporteur d'e-mails
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// // Fonction pour envoyer un e-mail de notification (utilisable dans tous les contrôleurs admin)
// export const sendEmailNotification = async (
//   destinataires: string[],
//   titre: string,
//   message: string
// ) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: destinataires,
//       subject: titre,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2F855A;">${titre}</h2>
//           <p style="color: #4A5568;">${message}</p>
//           <div style="margin-top: 20px; padding: 15px; background-color: #F7FAFC; border-radius: 5px;">
//             <p style="margin: 0; color: #718096;">INRAB - Institut National de Recherche Agricole du Bénin</p>
//           </div>
//         </div>
//       `
//     });

//     console.log('Email admin envoyé avec succès');
//   } catch (error) {
//     console.error("Erreur lors de l'envoi de l'e-mail admin :", error);
//   }
// };


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