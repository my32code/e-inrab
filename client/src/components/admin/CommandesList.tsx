import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, Package, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

interface Commande {
  id: string;
  produit_id: string;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  status: 'pending' | 'processing' | 'preparing' | 'completed' | 'rejected';
  createdAt: string;
  utilisateur_nom: string;
  utilisateur_email: string;
}

const statusInfo = {
  pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  processing: { label: 'En traitement', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  preparing: { label: 'En préparation', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  completed: { label: 'Terminée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  rejected: { label: 'Rejetée', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' }
};

export function CommandesList() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/commandes', {
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
      setError('Une erreur est survenue lors du chargement des commandes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commandeId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/commandes/${commandeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      toast.success('Statut mis à jour avec succès');
      fetchCommandes();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Erreur:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedCommande) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('commandeId', selectedCommande.id);

    try {
      const response = await fetch('http://localhost:3000/api/admin/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload du document');
      }

      toast.success('Document uploadé avec succès');
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedCommande(null);
    } catch (error) {
      toast.error('Erreur lors de l\'upload du document');
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
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
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {commande.produit_nom}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Client: {commande.utilisateur_nom} ({commande.utilisateur_email})
                  </p>
                </div>
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

              <div className="mt-6 flex justify-end space-x-4">
                <select
                  value={commande.status}
                  onChange={(e) => handleStatusChange(commande.id, e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="preparing">En préparation</option>
                  <option value="completed">Terminée</option>
                  <option value="rejected">Rejetée</option>
                </select>

                <button
                  onClick={() => {
                    setSelectedCommande(commande);
                    setShowUploadModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter un document
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal d'upload de document */}
      {showUploadModal && selectedCommande && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ajouter un document pour la commande {selectedCommande.produit_nom}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sélectionner un fichier
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setSelectedCommande(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  Uploader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 