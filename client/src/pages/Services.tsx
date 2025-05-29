import React, { useEffect, useState } from 'react';
import { 
  Leaf, 
  Microscope, 
  GraduationCap, 
  Clock, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { fetchServices, Service } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

interface ServicesByCategory {
  [key: string]: Service[];
}

export function Services() {
  const [services, setServices] = useState<ServicesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await fetchServices();
        
        // Grouper les services par catégorie
        const groupedServices = servicesData.reduce((acc: ServicesByCategory, service: Service) => {
          if (!acc[service.categorie]) {
            acc[service.categorie] = [];
          }
          acc[service.categorie].push(service);
          return acc;
        }, {});

        setServices(groupedServices);
        setCategories(Object.keys(groupedServices));
      } catch (err) {
        setError('Erreur lors du chargement des services');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
  
    loadServices();
  }, []);
  

  const getCategoryIcon = (categorie: string) => {
    switch (categorie.toLowerCase()) {
      case 'semences':
        return <Leaf className="w-12 h-12 text-green-600" />;
      case 'recherche':
        return <Microscope className="w-12 h-12 text-blue-600" />;
      case 'formation':
        return <GraduationCap className="w-12 h-12 text-purple-600" />;
      default:
        return <Leaf className="w-12 h-12 text-green-600" />;
    }
  };

  const filterServices = (service: Service) => {
    // Ne pas afficher les services sans prix
    if (!service.prix) {
        return false;
    }

    const matchesSearch = service.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory) {
        return service.categorie === selectedCategory && matchesSearch;
    }
    
    return matchesSearch;
  };

  const handleServiceRequest = (serviceId: number) => {
    navigate(`/services/demande/${serviceId.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement des services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Hero Section */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos Services</h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Découvrez notre gamme complète de services dédiés au développement 
            et à l'innovation dans le secteur agricole.
          </p>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Filtre par catégorie */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tous les services</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {selectedCategory ? (
          Object.entries(services).map(([categorie, servicesList]) => {
            const filteredServices = servicesList.filter(filterServices);
            if (filteredServices.length === 0) return null;

            return (
              <div key={categorie} className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">{categorie}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredServices.map((service, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                          {getCategoryIcon(categorie)}
                </div>
                <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3">{service.nom}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                            <li className="flex items-center text-gray-700">
                              <ChevronRight className="w-4 h-4 text-green-600 mr-2" />
                              Prix: {service.prix} 
                            </li>
                            <li className="flex items-center text-gray-700">
                              <ChevronRight className="w-4 h-4 text-green-600 mr-2" />
                              Délai: {service.delai_mise_disposition}
                            </li>
                            {service.pieces_requises && (
                              <li className="flex items-center text-gray-700">
                        <ChevronRight className="w-4 h-4 text-green-600 mr-2" />
                                Pièces requises: {service.pieces_requises}
                      </li>
                            )}
                  </ul>
                          <button 
                            onClick={() => handleServiceRequest(service.id)}
                            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            Faire une demande
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.values(services)
              .flat()
              .filter(filterServices)
              .map((service, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {getCategoryIcon(service.categorie)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{service.nom}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-gray-700">
                          <ChevronRight className="w-4 h-4 text-green-600 mr-2" />
                          Prix: {service.prix}
                        </li>
                        <li className="flex items-center text-gray-700">
                          <ChevronRight className="w-4 h-4 text-green-600 mr-2" />
                          Délai: {service.delai_mise_disposition}
                        </li>
                        {service.pieces_requises && (
                          <li className="flex items-center text-gray-700">
                            <ChevronRight className="w-4 h-4 text-green-600 mr-2" />
                            Pièces requises: {service.pieces_requises}
                          </li>
                        )}
                      </ul>
                      <button 
                        onClick={() => handleServiceRequest(service.id)}
                        className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Faire une demande
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-green-50 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'aide pour choisir ?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Nos experts sont là pour vous guider vers les services les plus adaptés à vos besoins
          </p>
          <Link to="/Contact" className="text-green-600 hover:text-green-500">
          <button className="bg-green-600 text-white px-8 py-3 rounded-md text-lg hover:bg-green-700 transition-colors">
            Contactez-nous
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
}