import React from 'react';
import { 
  Calendar, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Leaf,
  Microscope,
  GraduationCap,
  Clock
} from 'lucide-react';

const services = [
  { 
    title: 'Semences', 
    icon: <Leaf className="w-8 h-8 text-green-600" />,
    description: 'Catalogue complet de semences certifiées pour une agriculture durable'
  },
  { 
    title: 'Recherche', 
    icon: <Microscope className="w-8 h-8 text-blue-600" />,
    description: 'Expertise scientifique et consultation personnalisée'
  },
  { 
    title: 'Formation', 
    icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
    description: 'Programmes de formation agricole adaptés à vos besoins'
  },
  { 
    title: 'Rendez-vous', 
    icon: <Clock className="w-8 h-8 text-orange-600" />,
    description: 'Consultation directe avec nos experts qualifiés'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Prendre un rendez-vous</h3>
              <p className="text-gray-600 mb-6">
                Consultez nos experts pour des conseils personnalisés sur vos projets agricoles
              </p>
              <button className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors transform hover:scale-105">
                <Calendar className="w-5 h-5" />
                <span>Réserver maintenant</span>
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">FAQ Interactive</h3>
              <p className="text-gray-600 mb-6">
                Trouvez rapidement des réponses à vos questions sur nos services
              </p>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors transform hover:scale-105">
                <HelpCircle className="w-5 h-5" />
                <span>Consulter la FAQ</span>
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
                <h3 className="text-2xl font-bold mb-4">Innovations Agricoles</h3>
                <p className="text-gray-600 mb-6">
                  Découvrez nos dernières innovations technologiques pour améliorer vos rendements
                  et la qualité de vos cultures. Nos solutions sont adaptées aux besoins locaux.
                </p>
                <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors transform hover:scale-105">
                  Découvrir nos innovations
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}