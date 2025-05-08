import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

interface Commande {
  id: number;
  utilisateur_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  statut: 'en_attente' | 'payee' | 'expediee' | 'annulee';
  reference_paiement: string | null;
  createdAt: string;
  createdAtFormatted: string;
  utilisateur: {
    nom: string;
    email: string;
  };
  produit: {
    nom: string;
  };
}

const statusInfo = {
  en_attente: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  payee: { label: 'Payée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  expediee: { label: 'Expédiée', icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  annulee: { label: 'Annulée', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' }
};

export function CommandesList() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

      const responseData = await response.json();
      console.log('Données reçues:', responseData);

      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('Structure de données invalide:', responseData);
        setCommandes([]);
        return;
      }

      const formattedCommandes = responseData.data.map((commande: any) => {
        const date = new Date(commande.createdAt);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return {
          ...commande,
          createdAtFormatted: formattedDate,
          utilisateur: {
            nom: commande.utilisateur_nom || commande.user_nom || commande.utilisateur?.nom || 'N/A',
            email: commande.utilisateur_email || commande.user_email || commande.utilisateur?.email || 'N/A'
          },
          produit: {
            nom: commande.produit_nom || commande.produit?.nom || 'N/A'
          }
        };
      });

      setCommandes(formattedCommandes);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError('Une erreur est survenue lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const updateCommandeStatus = async (commandeId: number, newStatus: string) => {
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

  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = 
      commande.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.produit.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? commande.statut === statusFilter : true;

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
    <div>
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
            <option value="en_attente">En attente</option>
            <option value="payee">Payée</option>
            <option value="expediee">Expédiée</option>
            <option value="annulee">Annulée</option>
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
                  Total
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
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredCommandes.map((commande) => {
                  const status = statusInfo[commande.statut];
                  const StatusIcon = status.icon;

                  return (
                    <tr key={commande.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{commande.utilisateur.nom}</div>
                        <div className="text-sm text-gray-500">{commande.utilisateur.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{commande.produit.nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {commande.quantite}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(commande.quantite * commande.prix_unitaire).toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {commande.createdAtFormatted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={commande.statut}
                          onChange={(e) => updateCommandeStatus(commande.id, e.target.value)}
                          className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="en_attente">En attente</option>
                          <option value="payee">Payée</option>
                          <option value="expediee">Expédiée</option>
                          <option value="annulee">Annulée</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 