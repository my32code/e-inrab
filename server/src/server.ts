import express from 'express';
import cors from 'cors';
import { testConnection } from './services/db';
import authRoutes from './routes/authRoutes';
import servicesRoutes from './routes/servicesRoutes';
import serviceRequests from './routes/serviceRequests';
import produitsRoutes from './routes/produitsRoutes';
import commandesRoutes from './routes/commandesRoutes';
import adminRoutes from './routes/adminRoutes';
import documentsRoutes from './routes/documentsRoutes';
import factureRoutes from './routes/factureRoutes';
import notificationsRouter from './routes/notifications';
import path from 'path';
import statsRoutes from './routes/stats';
import paymentRoutes from './routes/paymentRoutes';

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Dev local
  'https://client-production-afb0.up.railway.app', // Ton client en production Railway
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('❌ CORS bloqué pour :', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  next();
});

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-requests', serviceRequests);
app.use('/api/produits', produitsRoutes); 
app.use('/api/commandes', commandesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/stats', statsRoutes);
app.use('/api/payment', paymentRoutes);

// Healthcheck
app.get('/healthcheck', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({
            status: 'up',
            database: dbConnected ? 'connected' : 'disconnected'
        });
    } catch (err) {
        console.error('Healthcheck DB error:', err);
        res.status(500).json({ status: 'error', message: 'Database error' });
    }
});

// PORT dynamique pour Railway
const PORT: number = Number(process.env.PORT) || 8080;

// Lancement serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

// Gestion des promesses non catchées
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
