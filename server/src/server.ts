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

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // URL du client Vite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  next();
});

app.use(express.json());

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
// Healthcheck
app.get('/healthcheck', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'up',
        database: dbConnected ? 'connected' : 'disconnected'
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testConnection();
});