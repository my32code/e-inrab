import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Users, ShoppingCart, FileText, Upload, Package, Wrench, BarChart2 } from 'lucide-react';
import { isAuthenticated, getCurrentUser } from '../services/auth';
import { toast } from 'react-toastify';
import { CommandesList } from '../components/admin/CommandesList';
import { ServiceRequestsList } from '../components/ServiceRequestsList';
import { StocksList } from '../components/StocksList';
import { DocumentsList } from '../components/admin/DocumentsList';
import { StatsDashboard } from '../components/admin/StatsDashboard';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

export function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('commandes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking admin authentication...');
      const authenticated = await isAuthenticated();
      console.log('Authentication result:', authenticated);

      if (!authenticated) {
        console.log('Not authenticated, redirecting to login...');
        navigate('/login');
        return;
      }

      const currentUser = getCurrentUser();
      console.log('Current user:', currentUser);

      if (!currentUser || currentUser.role !== 'admin') {
        console.log('Not an admin user, redirecting to home...');
        toast.error('Accès non autorisé');
        navigate('/');
        return;
      }

      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      console.error('Error in checkAuth:', error);
      setError('Une erreur est survenue lors de la vérification des droits d\'accès');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'commandes', label: 'Commandes', icon: ShoppingCart },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'stocks', label: 'Stocks', icon: Package },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'stats', label: 'Statistiques', icon: BarChart2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Bienvenue, {user.nom}
            </h1>
            <p className="text-sm text-gray-500">Panneau d'administration</p>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'commandes' && (
              <CommandesList />
            )}

            {activeTab === 'services' && (
              <ServiceRequestsList />
            )}

            {activeTab === 'stocks' && (
              <StocksList />
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Gestion des Documents</h2>
                <DocumentsList />
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tableau de bord statistiques</h2>
                <StatsDashboard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 