import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, History, Bell, Clock, CheckCircle, AlertTriangle, FileText, DollarSign, ShoppingCart } from 'lucide-react';
import { isAuthenticated, getCurrentUser } from '../services/auth';
import { toast } from 'react-toastify';

interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'awaiting_payment' | 'paid' | 'preparing' | 'completed';
  quantite: number;
  description: string;
  createdAt: string;
  proformaAmount?: number;
  documents: string[];
}

interface Commande {
  id: string;
  produit_id: string;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  status: 'pending' | 'processing' | 'preparing' | 'completed' | 'rejected';
  createdAt: string;
}

const statusInfo = {
  pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  processing: { label: 'En traitement', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  awaiting_payment: { label: 'En attente de paiement', icon: DollarSign, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  paid: { label: 'Payé', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  preparing: { label: 'En préparation', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  completed: { label: 'Terminé', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  rejected: { label: 'Rejetée', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' }
};

export function MonCompte() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin' && activeTab === 'services') {
      fetchRequests();
    } else if (user?.role !== 'admin' && activeTab === 'commandes') {
      fetchCommandes();
    }
  }, [activeTab, user]);

  const checkAuth = async () => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      navigate('/login');
      return;
    }
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/service-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      setRequests(data.data);
    } catch (error) {
      setError('Une erreur est survenue lors du chargement de vos demandes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommandes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/commandes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes');
      }

      const data = await response.json();
      setCommandes(data.data);
    } catch (error) {
      setError('Une erreur est survenue lors du chargement de vos commandes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({
          nom: formData.nom || user.nom,
          email: formData.email || user.email
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error('Erreur:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de mot de passe');
      }

      const data = await response.json();
      toast.success(data.message);
      
      if (data.shouldLogout) {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        navigate('/login');
      }

      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
      console.error('Erreur:', error);
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                <User className="h-5 w-5 inline-block mr-2" />
                Profil
              </button>
              {user?.role !== 'admin' && (
                <>
              <button
                onClick={() => setActiveTab('services')}
                className={`${
                  activeTab === 'services'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                <History className="h-5 w-5 inline-block mr-2" />
                    Services Demandés
                  </button>
                  <button
                    onClick={() => setActiveTab('commandes')}
                    className={`${
                      activeTab === 'commandes'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                  >
                    <ShoppingCart className="h-5 w-5 inline-block mr-2" />
                    Mes Commandes
              </button>
                </>
              )}
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                <Bell className="h-5 w-5 inline-block mr-2" />
                Notifications
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      id="nom"
                      type="text"
                      value={formData.nom || user.nom}
                      onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-0 focus:border-gray-400" ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email || user.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-0 focus:border-gray-400" ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleProfileUpdate();
                      } else {
                        setIsEditing(true);
                        setFormData({
                          ...formData,
                          nom: user.nom,
                          email: user.email
                        });
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {isEditing ? 'Valider' : 'Mettre à jour'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mes Services Demandés</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600">Chargement de vos demandes...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <p className="mt-2 text-xl text-red-600">{error}</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vous n'avez pas encore fait de demande de service.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {requests.map((request) => {
                      const status = statusInfo[request.status];
                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={request.id}
                          className="bg-white shadow rounded-lg overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <h2 className="text-xl font-semibold text-gray-900">
                                {request.serviceName}
                              </h2>
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                                <StatusIcon className="w-4 h-4 mr-2" />
                                {status.label}
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-sm text-gray-500">Quantité</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{request.quantite}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date de la demande</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-sm text-gray-500">Description</p>
                              <p className="mt-1 text-sm text-gray-900">{request.description}</p>
                            </div>

                            {request.proformaAmount && (
                              <div className="mt-4 p-4 bg-orange-50 rounded-md">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <DollarSign className="h-5 w-5 text-orange-400" />
                                  </div>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-orange-800">
                                      Paiement requis
                                    </h3>
                                    <div className="mt-2 text-sm text-orange-700">
                                      <p>Montant à payer : {request.proformaAmount} FCFA</p>
                                    </div>
                                    <div className="mt-4">
                                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                                        Procéder au paiement
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'commandes' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mes Commandes</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600">Chargement de vos commandes...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <p className="mt-2 text-xl text-red-600">{error}</p>
                  </div>
                ) : commandes.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vous n'avez pas encore passé de commande.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {commandes.map((commande) => {
                      const status = statusInfo[commande.status];
                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={commande.id}
                          className="bg-white shadow rounded-lg overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <h2 className="text-xl font-semibold text-gray-900">
                                {commande.produit_nom}
                              </h2>
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                                <StatusIcon className="w-4 h-4 mr-2" />
                                {status.label}
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Quantité</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{commande.quantite}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Prix unitaire</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{commande.prix_unitaire} FCFA</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {(commande.quantite * commande.prix_unitaire).toLocaleString()} FCFA
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date de la commande</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500">Aucune notification pour le moment.</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Paramètres du compte</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 