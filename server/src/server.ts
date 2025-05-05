import express from 'express';
import cors from 'cors';
import { testConnection } from './services/db';
import authRoutes from './routes/authRoutes';
import servicesRoutes from './routes/servicesRoutes';
import serviceRequests from './routes/serviceRequests';
import produitsRoutes from './routes/produitsRoutes';
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-requests', serviceRequests);
app.use('/api/produits', produitsRoutes); 

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