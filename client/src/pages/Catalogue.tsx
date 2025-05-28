import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';

interface Produit {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  prix: string;
  pieces_requises: string;
  delai_mise_disposition: string;
  prix_numerique: number;
}

// Images locales pour chaque type de produit
const produitImages = {
  "Graines germées de palmier à huile": "/images/palmier-huile.jpg",
  "Plants de palmier à huile": "/images/palmier-plants.jpg",
  "Régimes de palme": "/images/regimes-palme.jpg",
  "Tourteaux de noix de palme": "/images/tourteaux-palme.jpg",
  "Plants de cocotier hybrides et nains": "/images/cocotier-hybride.jpg",
  "Plants de cocotier GOA": "/images/cocotier-goa.jpg",
  "Noix de coco de bouche": "/images/noix-coco.jpg",
  "Semences polyclonales d'anacardier": "/images/anacardier.jpg",
  "Plants greffés d'anacardier": "/images/anacardier-plants.jpg",
  "Semenceaux de base d'igname": "/images/igname.jpg",
  "Boutures de manioc de base": "/images/manioc.jpg",
  "Semences de cultures maraîchères": "/images/maraicheres.jpg",
  "Semences de prébase de sorgho et mil": "/images/sorgho-mil.jpg",
  "Semences de prébase de fonio": "/images/fonio.jpg",
  "Semences de légumineuses à graines": "/images/legumineuses.jpg",
  "Rejets d'ananas pain de sucre": "/images/ananas.jpg",
  "Rejets d'ananas cayenne lisse": "/images/ananas.jpg",
  "Rejets de bananiers dessert et plantain": "/images/bananiers.jpg",
  "Semences et géniteurs d'animaux d'élevage": "/images/animaux-elevage.jpg",
  "Semences de prébase de poissons et crevettes": "/images/poissons-crevettes.jpg",
  "Semences fourragères": "/images/fourrages.jpg",
  // Image par défaut si aucun match
  "default": "/images/semence-default.jpg"
};


const categories = [
  "Toutes les catégories",
  "Céréales",
  "Légumineuses",
  "Tubercules",
  "Maraîchères"
];

export function Catalogue() {
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories");
  const [searchTerm, setSearchTerm] = useState("");
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommandeLoading, setIsCommandeLoading] = useState<number | null>(null);
  const [quantites, setQuantites] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchProduits();
  }, [selectedCategory, searchTerm]);

  const fetchProduits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "Toutes les catégories") {
        params.append('categorie', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:3000/api/produits?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
      }

      const data = await response.json();
      setProduits(data.produits);
      setError(null);
    } catch (error) {
      setError('Une erreur est survenue lors du chargement des produits');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

   // Fonction pour obtenir l'image d'un produit
   const getProduitImage = (nom: string) => {
    return produitImages[nom as keyof typeof produitImages] || produitImages.default;
  };

  const handleQuantiteChange = (produitId: number, newQuantite: number) => {
    if (newQuantite < 1) return;
    setQuantites(prev => ({
      ...prev,
      [produitId]: newQuantite
    }));
  };

  const handleQuantiteIncrement = (produitId: number) => {
    setQuantites(prev => ({
      ...prev,
      [produitId]: (prev[produitId] || 1) + 1
    }));
  };

  const handleQuantiteDecrement = (produitId: number) => {
    setQuantites(prev => ({
      ...prev,
      [produitId]: Math.max(1, (prev[produitId] || 1) - 1)
    }));
  };

  const handleCommande = async (produit: Produit) => {
    try {
      setIsCommandeLoading(produit.id);
      
      const quantite = quantites[produit.id] || 1;
      const prixUnitaire = typeof produit.prix_numerique === 'number' && !isNaN(produit.prix_numerique) 
        ? produit.prix_numerique 
        : parseFloat(produit.prix.replace(/[^0-9.-]+/g, ''));
      
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          console.log(`Tentative ${retryCount + 1} de création de la commande...`);
          const response = await fetch('http://localhost:3000/api/commandes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
            },
            body: JSON.stringify({
              produit_id: produit.id,
              quantite,
              prix_unitaire: prixUnitaire
            })
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data = await response.json();
          console.log('Commande créée avec succès:', data);
          toast.success('Commande effectuée avec succès');
          success = true;
        } catch (error) {
          retryCount++;
          console.log(`Tentative ${retryCount} échouée:`, error);
          
          if (retryCount === maxRetries) {
            throw error;
          }
          
          // Attendre avant de réessayer (temps d'attente croissant)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la commande');
    } finally {
      setIsCommandeLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Hero Section */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Catalogue des Semences</h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Découvrez notre sélection de semences certifiées pour optimiser vos cultures
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Rechercher des semences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chargement des produits...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : produits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Aucun produit ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {produits.map((produit) => {
              const quantite = quantites[produit.id] || 1;
              const prixUnitaire = typeof produit.prix_numerique === 'number' && !isNaN(produit.prix_numerique) 
              ? produit.prix_numerique 
              : (produit.prix ? parseFloat(produit.prix.replace(/[^0-9.-]+/g, '')) : 0);
              const total = !isNaN(prixUnitaire) ? quantite * prixUnitaire : 0;
              
              return (
              <div
                key={produit.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
              > 
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={getProduitImage(produit.nom)}
                    alt={produit.nom}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = produitImages.default;
                    }}
                  />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{produit.nom}</h3>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {produit.categorie}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{produit.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Pièces requises:</span> {produit.pieces_requises}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Délai de mise à disposition:</span> {produit.delai_mise_disposition}
                    </p>
                  </div>
                    
                    {/* Quantité et prix */}
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-green-600">
                          {produit.prix || 'Prix sur demande'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantiteDecrement(produit.id)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantite}
                            onChange={(e) => handleQuantiteChange(produit.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border rounded-md py-1"
                          />
                          <button
                            onClick={() => handleQuantiteIncrement(produit.id)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Total estimé:</span>
                          <span className="ml-2 text-lg font-semibold text-green-600">
                            {!isNaN(total) ? `${total.toLocaleString()} FCFA` : 'Prix sur demande'}
                          </span>
                        </div>
                    <button 
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleCommande(produit)}
                          disabled={isCommandeLoading === produit.id || isNaN(total) || total === 0}
                    >
                      {isCommandeLoading === produit.id ? 'En cours...' : 'Commander'}
                    </button>
                  </div>
                </div>
              </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}