import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, Package, Upload, XCircle, File } from 'lucide-react';
import { toast } from 'react-toastify';
import { DocumentsList } from '../DocumentsList';

interface Commande {
  id: number;
  produit_id: number;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string;
  utilisateur_nom: string;
  utilisateur_email: string;
}

const statusInfo = {
  pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  paid: { label: 'Payee', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  shipped: { label: 'Expediee', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  cancelled: { label: 'Annulee', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' }
};

export function CommandesList() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    formData.append('commandeId', selectedCommande.id.toString());

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

  const filteredCommandes = commandes.filter((commande) => {
    const matchesSearch = commande.produit_nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || commande.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Gestion des Commandes</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="paid">Payee</option>
            <option value="shipped">Expediee</option>
            <option value="cancelled">Annulee</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCommandes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredCommandes.map((commande) => {
                  const status = statusInfo[commande.status] || statusInfo['pending'];
                  const StatusIcon = status.icon;

                  return (
                    <tr key={commande.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCommande(commande)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <p className="text-sm text-gray-900">{commande.utilisateur_nom}</p> 
                          <p className="text-sm text-gray-900">{commande.utilisateur_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{commande.produit_nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{commande.quantite}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <select
                            value={commande.status}
                            onChange={(e) => handleStatusChange(commande.id.toString(), e.target.value)}
                            className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="pending">En attente</option>
                            <option value="paid">Payee</option>
                            <option value="shipped">Expediee</option>
                            <option value="cancelled">Annulee</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCommande && (
        <DocumentsList
          type="commande"
          referenceId={selectedCommande.id}
          onClose={() => setSelectedCommande(null)}
        />
      )}

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