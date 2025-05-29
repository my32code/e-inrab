import { Request, Response } from "express";
import { pool } from "../services/db";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { sendEmailNotification } from '../controllers/notificationsController';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    nom: string;
    email: string;
    telephone: string;
    role: string;
  };
}

// Génère l'image en base64
const logoPath = path.join(__dirname, "../../public/logo.png");
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
const logoDataUri = `data:image/png;base64,${logoBase64}`;

// Fonction pour générer un numéro de facture unique
const generateFactureNumber = async () => {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM documents WHERE type_document = ? AND YEAR(created_at) = ?",
    ["facture", year]
  );
  const count = (rows as any[])[0].count;
  return `FAC-${year}-${String(count + 1).padStart(4, "0")}`;
};

// Fonction pour générer le HTML de la facture proforma
const generateFactureHTML = (data: any) => {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
        .facture-info {
          margin-bottom: 30px;
        }
        .client-info {
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
        }
        .total {
          text-align: right;
          font-weight: bold;
          margin-top: 20px;
        }
        .valid-until {
          margin-top: 30px;
          text-align: center;
          color: #666;
        }
        .pay-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoDataUri}" alt="Logo INRAB" class="logo">
        <div class="header-text">
          <h1>Facture Proforma</h1>
        </div>
      </div>

      <div class="facture-info">
        <p><strong>Numéro de facture:</strong> ${data.factureNumber}</p>
        <p><strong>Date:</strong> ${format(new Date(), "dd MMMM yyyy", {
          locale: fr,
        })}</p>
      </div>

      <div class="client-info">
        <h3>Client</h3>
        <p><strong>Nom:</strong> ${data.client.nom}</p>
        <p><strong>Email:</strong> ${data.client.email}</p>
        <p><strong>Téléphone:</strong> ${data.client.telephone}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items
            .map(
              (item: any) => `
            <tr>
              <td>${item.nom}</td>
              <td>${item.quantite}</td>
              <td>${item.prix_unitaire.toFixed(2)} FCFA</td>
              <td>${(item.quantite * item.prix_unitaire).toFixed(2)} FCFA</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="total">
        <p>Total TTC: ${data.total.toFixed(2)} FCFA</p>
      </div>

      <div class="valid-until">
        <p>Valable jusqu'au: ${format(validUntil, "dd MMMM yyyy", {
          locale: fr,
        })}</p>
        <a href="#" class="pay-button">Payer maintenant</a>
      </div>

      <div class="footer">
        <p>INRAB - Institut National de Recherche Agronomique du Bénin</p>
        <p>Email: contact@inrab.org | Tél: +229 64 28 37 02</p>
      </div>
    </body>
    </html>
  `;
};

// Fonction pour générer le HTML de la facture finale
const generateFinalFactureHTML = (data: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
        .facture-info {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
        }
        .client-info {
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
        }
        .total {
          text-align: right;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .legal {
          margin-top: 30px;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoDataUri}" alt="Logo INRAB" class="logo">
        <div class="header-text">
          <h1>FACTURE</h1>
          <p class="text-sm text-gray-500">Facture n°: ${data.factureNumber}</p>
        </div>
      </div>

      <div class="facture-info">
        <div>
          <p><strong>Date d'émission:</strong> ${format(new Date(), "dd MMMM yyyy", { locale: fr })}</p>
          <p><strong>Date de paiement:</strong> ${format(new Date(), "dd MMMM yyyy", { locale: fr })}</p>
        </div>
      </div>

      <div class="client-info">
        <h3>Client</h3>
        <p><strong>Nom:</strong> ${data.client.nom}</p>
        <p><strong>Email:</strong> ${data.client.email}</p>
        <p><strong>Téléphone:</strong> ${data.client.telephone}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items
            .map(
              (item: any) => `
            <tr>
              <td>${item.nom}</td>
              <td>${item.quantite}</td>
              <td>${item.prix_unitaire.toLocaleString()} FCFA</td>
              <td>${(item.quantite * item.prix_unitaire).toLocaleString()} FCFA</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="total">
        <p>Total a payer: ${data.total.toLocaleString()} FCFA</p>
        <p class="text-sm text-gray-600">Montant payé le ${format(new Date(), "dd/MM/yyyy")}</p>
      </div>

      <div class="footer">
        <p>INRAB - Institut National de Recherche Agronomique du Bénin</p>
        <p>Email: contact@inrab.org | Tél: +229 64 28 37 02</p>
        <p>N° RCCM: XXXXX | IFU: XXXXX | Statut: Établissement public</p>
      </div>

      <div class="legal">
        <p class="text-xs text-gray-500">
          Facture électronique valable sans signature conformément à la loi n°XXXX.
        </p>
      </div>
    </body>
    </html>
  `;
};

// Fonction pour générer le template HTML de l'email de paiement
const generatePaymentEmailTemplate = (params: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  amount: number;
  invoiceNumber: string;
  details: string;
  isAdmin: boolean;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 10px; text-align: center; }
        .content { margin: 20px 0; }
        .footer { margin-top: 20px; font-size: 0.8em; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>INRAB - Confirmation de Paiement</h2>
        </div>
        
        <div class="content">
          <p>Bonjour ${params.isAdmin ? 'Administrateur' : params.clientName},</p>
          
          ${params.isAdmin 
            ? `<p>Un paiement a été effectué par ${params.clientName} (${params.clientEmail}).</p>
               <p>Téléphone: ${params.clientPhone}</p>
               <p>Montant: ${params.amount} FCFA</p>
               <p>Facture N°: ${params.invoiceNumber}</p>
               ${params.details}`
            : `<p>Nous accusons réception de votre déclaration de paiement de ${params.amount} FCFA.</p>
              <p>Votre facture N° ${params.invoiceNumber} a bien été enregistrée et est disponible dans votre espace documents.</p>
              <p>Pour toute question, vous pouvez nous contacter au +229 64 28 37 02.</p>
              <p>Nous vous remercions pour votre confiance et restons à votre disposition pour toute information complémentaire.</p>`}
        </div>
        
        <div class="footer">
          <p>Cet email est envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} INRAB - Tous droits réservés</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Contrôleur pour générer une facture
export const generateFacture = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { type, id, isFinal, commande } = req.body;
    console.log("Génération de facture pour:", { type, id, commande });

    let data;
    let query = "";
    let params: any[] = [];

    // Si c'est une commande, utiliser directement les données envoyées
    if (type === "commande") {
      if (!commande) {
        return res.status(400).json({
          status: "error",
          message: "Données de la commande manquantes",
        });
      }
      try {
        data = JSON.parse(commande);
      } catch (error) {
        console.error("Erreur lors du parsing de la commande:", error);
        return res.status(400).json({
          status: "error",
          message: "Format de commande invalide",
        });
      }
    } else if (type === "service") {
      // Pour les services, continuer avec la logique existante
      query = `
        SELECT d.*, u.nom as client_nom, u.email as client_email, u.telephone as client_telephone, s.nom as service_nom, s.prix
        FROM demandes d
        JOIN utilisateurs u ON d.utilisateur_id = u.id
        JOIN services s ON d.service_id = s.id
        WHERE d.id = ?
      `;
      params = [id];
      const [rows] = await pool.query(query, params);
      
      if (!rows || (rows as any[]).length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Demande de service non trouvée",
        });
      }
      data = (rows as any[])[0];
    } else {
      return res.status(400).json({
        status: "error",
        message: 'Type invalide. Doit être "commande" ou "service"',
      });
    }

    console.log("Données récupérées:", data);

    const factureNumber = await generateFactureNumber();
    console.log("Numéro de facture généré:", factureNumber);

    // Préparer les données pour le template
    const templateData = {
      factureNumber,
      client: {
        nom: type === "commande" ? req.user.nom : data.client_nom,
        email: type === "commande" ? req.user.email : data.client_email,
        telephone: type === "commande" ? req.user.telephone : data.client_telephone
      },
      items: [
        {
          nom: type === "commande" ? data.produit_nom : data.service_nom,
          quantite: type === "commande" ? parseInt(data.quantite) : 1,
          prix_unitaire: type === "commande" 
              ? parseFloat(data.prix_unitaire)
            : parseFloat(data.prix.replace(/[^0-9]/g, '')),
        },
      ],
      total: type === "commande"
          ? parseInt(data.quantite) * parseFloat(data.prix_unitaire)
        : parseFloat(data.prix.replace(/[^0-9]/g, '')),
    };

    console.log("Données du template:", templateData);

    const filename = isFinal 
      ? `facture_finale_${id}.pdf` 
      : `facture_proforma_${id}.pdf`;

    // Générer le HTML
    const html = isFinal ? generateFinalFactureHTML(templateData) : generateFactureHTML(templateData);

    // Créer le dossier factures s'il n'existe pas
    const facturesDir = path.join(__dirname, "../../uploads/factures");
    if (!fs.existsSync(facturesDir)) {
      console.log("Création du dossier factures:", facturesDir);
      fs.mkdirSync(facturesDir, { recursive: true });
    }

    // Générer le PDF avec Puppeteer
    console.log("Démarrage de Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfPath = path.join(facturesDir, filename);
    console.log("Génération du PDF:", pdfPath);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
    });
    await browser.close();
    console.log("PDF généré avec succès");

    // Enregistrer le document dans la base de données
    console.log("Enregistrement dans la base de données...");
    const [result] = await pool.query(
      "INSERT INTO documents (commande_id, demande_id, nom_fichier, chemin_fichier, type_document, categorie, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        type === "commande" ? id : null,
        type === "service" ? id : null,
        filename,
        `uploads/factures/${filename}`,
        type,
        "facture",
        req.user.role.toLowerCase() === 'admin' ? 'admin' : 'client'
      ]
    );

    if (isFinal) {
      try {
        const [admins] = await pool.query('SELECT email FROM utilisateurs WHERE role = "admin"');
        const adminEmails = (admins as any[]).map(admin => admin.email);
        const allAdminEmails = [...adminEmails, 'princeadilehou@gmail.com'];
        
        const details = type === "commande" 
          ? `<p>Produit: ${data.produit_nom} (x${data.quantite})</p>`
          : `<p>Service: ${data.service_nom}</p>`;

        // Email aux admins
        await sendEmailNotification(
          allAdminEmails,
          `[INRAB] Paiement reçu - Facture ${factureNumber}`,
          generatePaymentEmailTemplate({
            clientName: templateData.client.nom,
            clientEmail: templateData.client.email,
            clientPhone: templateData.client.telephone,
            amount: templateData.total,
            invoiceNumber: factureNumber,
            details,
            isAdmin: true
          })
        );

        // Email au client
        await sendEmailNotification(
          [templateData.client.email],
          `[INRAB] Confirmation de paiement - Facture ${factureNumber}`,
          generatePaymentEmailTemplate({
            clientName: templateData.client.nom,
            clientEmail: templateData.client.email,
            clientPhone: templateData.client.telephone,
            amount: templateData.total,
            invoiceNumber: factureNumber,
            details: '',
            isAdmin: false
          })
        );

        console.log('Emails de confirmation envoyés avec succès');
      } catch (emailError) {
        console.error("Erreur lors de l'envoi des emails:", emailError);
        // Ne pas bloquer la réponse même si l'email échoue
      }
    }

    console.log("Document enregistré avec succès");
    res.json({
      status: "success",
      message: "Facture générée avec succès",
      data: {
        documentId: (result as any).insertId,
        factureNumber,
      },
    });
  } catch (error) {
    console.error(
      "Erreur détaillée lors de la génération de la facture:",
      error
    );
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la génération de la facture",
      details: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

export const getFacture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, id, commande } = req.body;

    // Si c'est une commande, utiliser directement les données envoyées
    if (type === "commande") {
      const commandeData = JSON.parse(commande);
      const factureNumber = await generateFactureNumber();

      const templateData = {
        factureNumber,
        client: {
          nom: req.user.nom,
          email: req.user.email,
          telephone: req.user.telephone
        },
        items: [
          {
            nom: commandeData.produit_nom,
            quantite: parseInt(commandeData.quantite),
            prix_unitaire: parseFloat(commandeData.prix_unitaire),
          },
        ],
        total: parseInt(commandeData.quantite) * parseFloat(commandeData.prix_unitaire),
      };

      res.json({
        status: "success",
        factureNumber,
        meta: templateData,
        commande: commandeData,
      });
      return;
    }

    // Pour les services, continuer avec la logique existante
    if (type === "service") {
      const query = `
        SELECT d.*, u.nom as client_nom, u.email as client_email, u.telephone as client_telephone, s.nom as service_nom, s.prix
        FROM demandes d
        JOIN utilisateurs u ON d.utilisateur_id = u.id
        JOIN services s ON d.service_id = s.id
        WHERE d.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      
      if (!rows || (rows as any[]).length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Demande de service non trouvée",
        });
      }

      const data = (rows as any[])[0];
      const factureNumber = await generateFactureNumber();

      const templateData = {
        factureNumber,
        client: {
          nom: data.client_nom,
          email: data.client_email,
          telephone: data.client_telephone
        },
        items: [
          {
            nom: data.service_nom,
            quantite: 1,
            prix_unitaire: parseFloat(data.prix),
          },
        ],
        total: parseFloat(data.prix),
      };

      res.json({
        status: "success",
        factureNumber,
        meta: templateData,
        commande: data,
      });
      return;
    }

    res.status(400).json({
      status: "error",
      message: 'Type invalide. Doit être "commande" ou "service"',
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de la facture:",
      error
    );
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération des données de la facture",
      details: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};
