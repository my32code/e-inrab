import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Leaf,
  Microscope,
  GraduationCap,
  Clock,
  ShoppingCart,
  FileText,
  Users,
  Building,
  CheckCircle
} from 'lucide-react';

const services = [
  { 
    title: 'Produits Agricoles', 
    icon: <Leaf className="w-8 h-8 text-green-600" />,
    description: 'Commandez des semences certifiées et plants de qualité pour votre exploitation'
  },
  { 
    title: 'Services d\'Expertise', 
    icon: <Microscope className="w-8 h-8 text-blue-600" />,
    description: 'Bénéficiez de diagnostics et analyses techniques pour vos cultures'
  },
  { 
    title: 'Formations', 
    icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
    description: 'Accédez à nos programmes de formation en techniques agricoles'
  },
  { 
    title: 'Partenariats', 
    icon: <Building className="w-8 h-8 text-orange-600" />,
    description: 'Collaborez avec l\'INRAB pour vos projets de recherche et développement'
  }
];

const slides = [
  {
    image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200",
    title: "Semences de Qualité Supérieure",
    description: "Découvrez notre nouvelle gamme de semences certifiées pour une agriculture performante"
  },
  {
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b1b?auto=format&fit=crop&w=1200",
    title: "Formations Agricoles",
    description: "Développez vos compétences avec nos programmes de formation spécialisés"
  },
  {
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200",
    title: "Expertise Scientifique",
    description: "Bénéficiez des conseils de nos experts pour optimiser votre production"
  }
];

export function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Carousel */}
      <div className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40">
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 animate-fade-in">
                  {slides[currentSlide].description}
                </p>
                <button className="bg-green-600 text-white px-8 py-3 rounded-md text-lg hover:bg-green-700 transition-colors transform hover:scale-105">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  {service.icon}
                  <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
                  <p className="mt-2 text-gray-600">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Commander des Produits</h3>
              <p className="text-gray-600 mb-6">
                Accédez à notre catalogue de semences et plants certifiés. Suivez vos commandes en temps réel.
              </p>
              <button 
                onClick={() => navigate('/catalogue')}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Voir le catalogue</span>
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Demander un Service</h3>
              <p className="text-gray-600 mb-6">
                Sollicitez nos services d'expertise et de diagnostic pour vos cultures et projets agricoles.
              </p>
              <button 
                onClick={() => navigate('/services')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                <span>Demander un service</span>
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Devenir Partenaire</h3>
              <p className="text-gray-600 mb-6">
                Rejoignez notre réseau de partenaires pour des collaborations fructueuses.
              </p>
              <button 
                onClick={() => navigate('/partenariats')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors transform hover:scale-105"
              >
                <Users className="w-5 h-5" />
                <span>En savoir plus</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Advertisement Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800"
                  alt="Innovation agricole"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">L'INRAB à Votre Service</h3>
                <p className="text-gray-600 mb-6">
                  L'Institut National des Recherches Agricoles du Bénin (INRAB) met à votre disposition 
                  son expertise et ses ressources pour le développement de l'agriculture béninoise. 
                  Que vous soyez agriculteur, chercheur ou partenaire, nous vous accompagnons dans 
                  vos projets avec des solutions innovantes et adaptées.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Semences et plants certifiés</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Services d'expertise et de diagnostic</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Formations techniques spécialisées</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Ressources Utiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">AGORA (FAO)</h3>
              <p className="text-gray-600 mb-4">Collection bibliographique sur l'alimentation, l'agriculture, et les sciences environnementales.</p>
              <a 
                href="http://www.fao.org/agora/fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Accéder à AGORA
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">SLIRE</h3>
              <p className="text-gray-600 mb-4">Base de références bibliographiques incluant des documents non publiés.</p>
              <a 
                href="http://www.sitre.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Accéder à SLIRE
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">INSAH (CILSS)</h3>
              <p className="text-gray-600 mb-4">Bases de données sur les pesticides, profils socio-économiques, et expertises en Afrique de l'Ouest.</p>
              <a 
                href="http://www.insah.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Accéder à INSAH
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">Cahiers Agricultures</h3>
              <p className="text-gray-600 mb-4">Revue scientifique francophone sur les agricultures mondiales.</p>
              <a 
                href="http://www.cahiersagricultures.fr/fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Accéder aux Cahiers Agricultures
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">RenWT (CIRAD)</h3>
              <p className="text-gray-600 mb-4">Revue sur l'élevage et la médecine vétérinaire en zones tropicales.</p>
              <a 
                href="http://renwt.clrad.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Accéder à RenWT
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">Économie Rurale</h3>
              <p className="text-gray-600 mb-4">Revue sur les évolutions économiques et sociales du monde agricole et rural.</p>
              <a 
                href="http://economierurale.revues.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Accéder à Économie Rurale
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}