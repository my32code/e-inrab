import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, History, Bell, Clock, CheckCircle, AlertTriangle, FileText, DollarSign, ShoppingCart, Package, File, Loader2, Truck, XCircle } from 'lucide-react';
import { isAuthenticated, getCurrentUser } from '../services/auth';
import { toast } from 'react-toastify';
import { DocumentDetailModal } from '../components/DocumentDetailModal';
import { useKKiaPay } from "kkiapay-react";
import MyModal from "../components/MyModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'paid' | 'preparing' | 'completed' | 'cancelled';
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
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string;
}

interface Document {
  id: number;
  commande_id?: number;
  demande_id?: number;
  service_id?: number;
  nom_fichier: string;
  chemin_fichier: string;
  type_document: 'commande' | 'service';
  categorie: string;
  created_at: string;
  produit_nom?: string;
  service_nom?: string;
}

interface Item {
  nom: string;
  quantite: number;
  prix_unitaire: number;
}

interface Client {
  nom: string;
  email: string;
}

interface BillData {
  factureNumber: string;
  client: Client;
  items: Item[];
  total: number;
}

interface Notification {
  id: number;
  type: 'commande' | 'service' | 'document';
  titre: string;
  message: string;
  lien: string;
  lu: boolean;
  created_at: string;
}

const commandeStatusInfo: { [key: string]: { label: string; color: string; bgColor: string; icon: any } } = {
  pending: {
    label: 'En attente',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: Clock
  },
  paid: {
    label: 'Payée',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: CheckCircle
  },
  shipped: {
    label: 'Expédiée',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: Truck
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: XCircle
  }
};

const serviceStatusInfo = {
  pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  paid: { label: 'validée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  preparing: { label: 'En cours', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  completed: { label: 'Livrée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { label: 'Rejetée', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' }
};

export function MonCompte() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();
  const [isOpen, setIsOpen] = useState(false);
  const [billCommande, setBillCommande] = useState<Commande | null>(null);
  const [billService, setBillService] = useState<ServiceRequest | null>(null);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
    

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
    if (activeTab === 'services') {
      fetchRequests();
      } else if (activeTab === 'commandes') {
        fetchCommandes();
      } else if (activeTab === 'documents') {
        fetchDocuments();
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user && activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, user]);

  const checkAuth = async () => {
    try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      navigate('/login');
      return;
    }
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        if (activeTab === 'services') {
          fetchRequests();
        } else if (activeTab === 'commandes') {
          fetchCommandes();
        } else if (activeTab === 'documents') {
          fetchDocuments();
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      navigate('/login');
    }
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

  const fetchDocuments = async () => {
    try {
      console.log('Début de la récupération des documents...');
      const response = await fetch('http://localhost:3000/api/documents/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        console.error('Erreur HTTP:', response.status, response.statusText);
        throw new Error('Erreur lors de la récupération des documents');
      }

      const data = await response.json();
      console.log('Documents récupérés:', data.data);
      setDocuments(data.data);
    } catch (error) {
      console.error('Erreur complète lors de la récupération des documents:', error);
      toast.error('Erreur lors de la récupération des documents');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }

      const data = await response.json();
      setNotifications(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des notifications');
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

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`http://localhost:3000/api/documents/download/${doc.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nom_fichier;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Erreur lors du téléchargement du document');
      console.error('Erreur:', error);
    }
  };

  const handlePayment = async (commandeId: string, amount: number) => {
    // On ouvre d'abord le modal de facture
    const commande = commandes.find(c => c.id === commandeId);
    if (commande) {
      await handleGetFacture(commande);
    }
  };

    // Fonction pour ouvrir le modal de facture
  const handleGetFacture = async (commande: Commande) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/factures/get",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
          },
          body: JSON.stringify({
            type: "commande",
            id: commande?.id,
            commande: JSON.stringify(commande),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la génération de la facture");
      }

      const data = await response.json();

      setBillData(data?.meta);
      setBillCommande(data?.commande);
      setIsOpen(true);

      toast.success("Facture affichée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la récupération de la facture");
      console.error("Erreur:", error);
    }
  };

  // Fonction pour ouvrir le widget de paiement
  const openPaymentWidget = (commande: Commande) => {
    setBillCommande(commande);
    openKkiapayWidget({
      amount: commande.quantite * commande.prix_unitaire,
      api_key: "79429420652011efbf02478c5adba4b8", // Remplacez par votre clé API
      sandbox: true, // Mettez à false en production
      name: user.nom,
      email: user.email,
      phone: "97000000", // Numéro de test
    });
  };

  const successHandler = async (response: any) => {
    try {
      if (billService) {
        // Utilisez votre endpoint existant avec isFinal: true
        const res = await fetch("http://localhost:3000/api/factures/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
          },
          body: JSON.stringify({
            type: "service",
            id: billService.id,
            isFinal: true, // Ce flag déclenchera generateFinalFactureHTML
          }),
        });
  
        if (!res.ok) throw new Error("Erreur génération facture");
        
        toast.success("Paiement confirmé ! Facture disponible dans vos documents");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la confirmation du paiement");
    }
  };

  // Gestionnaire d'échec de paiement
  const failureHandler = (error: any) => {
    console.error("Échec du paiement :", error);
    toast.error("Échec du paiement");
  };

  // Ajoutez les listeners KkiaPay
  useEffect(() => {
    addKkiapayListener("success", successHandler);
    addKkiapayListener("failed", failureHandler);

    return () => {
      removeKkiapayListener("success", successHandler);
      removeKkiapayListener("failed", failureHandler);
    };
  }, [addKkiapayListener, removeKkiapayListener, billCommande]);

  const markNotificationAsRead = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la notification');
      }

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, lu: true } : notif
        )
      );
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la notification');
      }

      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast.success('Notification supprimée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression de la notification');
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
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm relative`}
              >
                <Bell className="h-5 w-5 inline-block mr-2" />
                Notifications
                {notifications.some(n => !n.lu) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
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
              <button
                    onClick={() => setActiveTab('documents')}
                className={`${
                      activeTab === 'documents'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                    <File className="h-5 w-5 inline-block mr-2" />
                    Mes Documents
              </button>
                </>
              )}
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
                      const status = serviceStatusInfo[request.status];
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
                      console.log('Commande status:', commande.status);
                      const status = commandeStatusInfo[commande.status];
                      if (!status) {
                        console.error('Status not found:', commande.status);
                        return null;
                      }
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
                            {commande.status === 'pending' && (
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => handlePayment(commande.id, commande.quantite * commande.prix_unitaire)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  Payer {(commande.quantite * commande.prix_unitaire).toLocaleString()} FCFA
                                </button>
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

            {activeTab === 'documents' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mes Documents</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600">Chargement de vos documents...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <p className="mt-2 text-xl text-red-600">{error}</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vous n'avez pas encore de documents.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => {
                      
                      return (
                        <div
                          key={doc.id}
                          className="bg-white shadow rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            console.log('Document sélectionné:', doc);
                            setSelectedDocument(doc);
                          }}
                        >
                          <div className="flex items-center">
                            <File className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.nom_fichier}</p>
                              <p className="text-xs text-gray-500">
                                {doc.type_document === 'commande' ? doc.produit_nom : doc.service_nom} - 
                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-4">
                            {doc.categorie === 'facture' && doc.type_document === 'service' && doc.nom_fichier.includes('proforma') && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const response = await fetch(`http://localhost:3000/api/service-requests/${doc.demande_id}`, {
                                      headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
                                      }
                                    });
                                    
                                    if (!response.ok) {
                                      throw new Error('Erreur lors de la récupération des détails de la demande');
                                    }

                                    const requestData = await response.json();
                                    
                                    // Extraction du prix numérique du format "15 000 FCFA/echantillon" ou "15000fcfa/echantillon"
                                    const prixString = requestData.data.servicePrice;
                                    console.log('Prix brut:', prixString); // Pour le débogage

                                    // Nouvelle expression régulière qui capture tous les chiffres avant "fcfa" ou "FCFA", en ignorant les espaces
                                    const prixMatch = prixString.match(/(\d[\d\s]*)fcfa/i);
                                    const prix = prixMatch ? parseInt(prixMatch[1].replace(/\s/g, '')) : 0;

                                    console.log('Prix extrait:', prix); // Pour le débogage

                                    if (prix === 0) {
                                      throw new Error('Prix invalide');
                                    }

                                    // Stocker d'abord les informations de la demande
                                    setBillService({
                                      id: doc.demande_id?.toString() || '',
                                      serviceId: doc.service_id?.toString() || '',
                                      serviceName: doc.service_nom || '',
                                      status: 'pending',
                                      quantite: 1,
                                      description: requestData.data.description || '',
                                      createdAt: requestData.data.date_demande,
                                      documents: []
                                    });

                                    // Attendre que l'état soit mis à jour
                                    await new Promise(resolve => setTimeout(resolve, 100));

                                    // Ouvrir le widget KkiaPay
                                    openKkiapayWidget({
                                      amount: prix,
                                      api_key: "79429420652011efbf02478c5adba4b8",
                                      sandbox: true,
                                      name: user.nom,
                                      email: user.email,
                                      phone: "97000000",
                                    });

                                  } catch (error) {
                                    console.error('Erreur:', error);
                                    toast.error('Erreur lors du traitement du paiement');
                                  }
                                }}
                                className="text-sm text-green-600 hover:text-green-700"
                              >
                                Payer
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Téléchargement du document:', doc);
                                handleDownload(doc);
                              }}
                              className="text-sm text-green-600 hover:text-green-700"
                            >
                              Télécharger
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedDocument && (
                  <DocumentDetailModal
                    document={selectedDocument}
                    isAdmin={user?.role === 'admin'}
                    onClose={() => setSelectedDocument(null)}
                  />
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vous n'avez pas encore de notifications.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`bg-white shadow rounded-lg p-4 ${
                          !notification.lu ? 'border-l-4 border-green-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {notification.titre}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-gray-400">
                              {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            {!notification.lu && (
                              <button
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="text-sm text-green-600 hover:text-green-700"
                              >
                                Marquer comme lu
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                )}
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

            {/* Modal de facture */}
            <div className=" flex items-center justify-center bg-gray-100">
              {isOpen && billData && (
                <MyModal isOpen={isOpen} setIsOpen={setIsOpen}>
                  <div className="text-center mb-8">
                    <img
                      src="/images/logo.png"
                      alt="Logo INRAB"
                      className="max-w-[200px] mb-5"
                    />
                    <div>
                      <h1 className="text-3xl font-semibold">Facture Proforma</h1>
                    </div>
                  </div>

                  <div className="mb-8">
                    <p>
                      <strong>Numéro de facture:</strong> {billData.factureNumber}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {format(new Date(), "dd MMMM yyyy", { locale: fr })}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-medium">Client</h3>
                    <p>
                      <strong>Nom:</strong> {billData.client.nom}
                    </p>
                    <p>
                      <strong>Email:</strong> {billData.client.email}
                    </p>
                  </div>

                  <table className="w-full border-collapse mb-8">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b text-left bg-gray-100">
                          Description
                        </th>
                        <th className="px-4 py-2 border-b text-left bg-gray-100">
                          Quantité
                        </th>
                        <th className="px-4 py-2 border-b text-left bg-gray-100">
                          Prix unitaire
                        </th>
                        <th className="px-4 py-2 border-b text-left bg-gray-100">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billData.items.map((item) => (
                        <tr key={item.nom}>
                          <td className="px-4 py-2 border-b">{item.nom}</td>
                          <td className="px-4 py-2 border-b">{item.quantite}</td>
                          <td className="px-4 py-2 border-b">
                            {item.prix_unitaire.toFixed(2)} FCFA
                          </td>
                          <td className="px-4 py-2 border-b">
                            {(item.quantite * item.prix_unitaire).toFixed(2)} FCFA
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-right font-bold mt-4">
                    <p>Total TTC: {billData.total.toFixed(2)} FCFA</p>
                  </div>

                  <div className="mt-8 text-center text-gray-600">
                    <p>
                      Valable jusqu'au:{" "}
                      {format(new Date(new Date().setDate(new Date().getDate() + 7)), "dd MMMM yyyy", { locale: fr })}
                    </p>
                    <button
                      onClick={() => openPaymentWidget(billCommande!)}
                      className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg mt-5"
                    >
                      Payer maintenant
                    </button>
                  </div>

                  <div className="mt-12 text-center text-sm text-gray-600">
                    <p>INRAB - Institut National de Recherche Agronomique du Bénin</p>
                    <p>Email: contact@inrab.org | Tél: +229 64 28 37 02</p>
                  </div>
                </MyModal>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 