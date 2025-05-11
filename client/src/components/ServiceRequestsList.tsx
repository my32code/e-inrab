import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, File } from 'lucide-react';
import { toast } from 'react-toastify';
import { DocumentsList } from './DocumentsList';

interface ServiceRequest {
  id: number;
  utilisateur_id: number;
  service_id: number;
  description: string;
  statut: 'en attente' | 'validée' | 'en cours' | 'livrée' | 'rejetée';
  created_at: string;
  createdAtFormatted: string;
  utilisateur: {
    nom: string;
    email: string;
  };
  service: {
    nom: string;
  };
}

const statusInfo = {
  'en attente': { label: 'En attente', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  'validée': { label: 'Validée', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'en cours': { label: 'En cours', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'livrée': { label: 'Livrée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  'rejetée': { label: 'Rejetée', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' }
};

export function ServiceRequestsList() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/service-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes de services');
      }

      const responseData = await response.json();
      console.log('Données reçues:', responseData);

      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('Structure de données invalide:', responseData);
        setRequests([]);
        return;
      }

      const formattedRequests = responseData.data.map((request: any) => {
        const date = new Date(request.created_at);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return {
          ...request,
          createdAtFormatted: formattedDate,
          utilisateur: {
            nom: request.utilisateur_nom || request.user_nom || request.utilisateur?.nom || 'N/A',
            email: request.utilisateur_email || request.user_email || request.utilisateur?.email || 'N/A'
          },
          service: {
            nom: request.service_nom || request.service?.nom || 'N/A'
          }
        };
      });

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError('Une erreur est survenue lors du chargement des demandes de services');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/service-requests/${requestId}/status`, {
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
      fetchRequests();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Erreur:', error);
    }
  };

  const handleGenerateFacture = async (requestId: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/factures/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({
          type: 'service',
          id: requestId
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la facture');
      }

      const data = await response.json();
      toast.success('Facture générée avec succès');
      fetchRequests(); // Rafraîchir la liste pour afficher le nouveau document
    } catch (error) {
      toast.error('Erreur lors de la génération de la facture');
      console.error('Erreur:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? request.statut === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des demandes de services...</p>
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
        <h2 className="text-lg font-medium text-gray-900">Gestion des Demandes de Services</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Rechercher une demande..."
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
            <option value="en attente">En attente</option>
            <option value="validée">Validée</option>
            <option value="en cours">En cours</option>
            <option value="livrée">Livrée</option>
            <option value="rejetée">Rejetée</option>
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
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucune demande de service trouvée
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const status = statusInfo[request.statut] || statusInfo['en attente'];
                  const StatusIcon = status.icon;

                  return (
                    <tr key={request.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.utilisateur.nom}</div>
                        <div className="text-sm text-gray-500">{request.utilisateur.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.service.nom}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">{request.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.createdAtFormatted}
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
                            value={request.statut}
                            onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                            className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="en attente">En attente</option>
                            <option value="validée">Validée</option>
                            <option value="en cours">En cours</option>
                            <option value="livrée">Livrée</option>
                            <option value="rejetée">Rejetée</option>
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateFacture(request.id);
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Générer facture
                          </button>
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

      {selectedRequest && (
        <DocumentsList
          type="service"
          referenceId={selectedRequest.id}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
} 