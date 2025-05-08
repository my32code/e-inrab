import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Minus, Package } from 'lucide-react';
import { toast } from 'react-toastify';

interface Produit {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  stock: number;
  prix_numerique: number;
  pieces_requise: string;
  delai_mise_disposition: string;
}

export function StocksList() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/produits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
      }

      const responseData = await response.json();
      console.log('Données reçues:', responseData);

      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('Structure de données invalide:', responseData);
        setProduits([]);
        return;
      }

      setProduits(responseData.data);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError('Une erreur est survenue lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (produitId: number, newStock: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/produits/${produitId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du stock');
      }

      toast.success('Stock mis à jour avec succès');
      fetchProduits();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du stock');
      console.error('Erreur:', error);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Rupture', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (stock <= 5) return { label: 'Alerte', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: 'En stock', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const filteredProduits = produits.filter(produit => {
    const matchesSearch = 
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategorie = categorieFilter ? produit.categorie === categorieFilter : true;
    
    const matchesStock = stockFilter ? getStockStatus(produit.stock).label.toLowerCase() === stockFilter.toLowerCase() : true;

    return matchesSearch && matchesCategorie && matchesStock;
  });

  const categories = [...new Set(produits.map(p => p.categorie))];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des produits...</p>
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
        <h2 className="text-lg font-medium text-gray-900">Gestion des Stocks</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={categorieFilter}
            onChange={(e) => setCategorieFilter(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(categorie => (
              <option key={categorie} value={categorie}>{categorie}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les statuts</option>
            <option value="en stock">En stock</option>
            <option value="alerte">Alerte</option>
            <option value="rupture">Rupture</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProduits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filteredProduits.map((produit) => {
                  const stockStatus = getStockStatus(produit.stock);

                  return (
                    <tr key={produit.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                        <div className="text-sm text-gray-500">{produit.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produit.categorie}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produit.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                          <Package className="w-4 h-4 mr-2" />
                          {stockStatus.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produit.prix_numerique?.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateStock(produit.id, produit.stock + 1)}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => updateStock(produit.id, Math.max(0, produit.stock - 1))}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Minus className="w-5 h-5" />
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
    </div>
  );
} 