import React from 'react';
import { 
  Calendar, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Leaf,
  Microscope,
  GraduationCap,
  Clock,
  FileText,
  ShoppingCart,
  Upload,
  CheckCircle,
  Package,
  Settings,
  ArrowRight,
  Phone
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
    title: "Services Agricoles Professionnels",
    description: "Accédez à nos services d'expertise et de conseil en agriculture"
  },
  {
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b1b?auto=format&fit=crop&w=1200",
    title: "Produits de Qualité",
    description: "Découvrez notre gamme de produits agricoles certifiés"
  },
  {
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200",
    title: "Support Expert",
    description: "Bénéficiez de l'expertise de nos spécialistes"
  }
];

const processCards = [
  {
    title: "Demande de Service",
    description: "Soumettez votre demande de service en ligne",
    steps: [
      "Rendez-vous sur la page Services",
      "Cliquez sur 'Faire une demande'",
      "Remplissez le formulaire de demande",
      "Joignez les documents requis",
      "Soumettez votre demande"
    ],
    icon: <FileText className="w-8 h-8 text-green-600" />,
    buttonText: "Faire une demande",
    buttonLink: "/services"
  },
  {
    title: "Commande de Produits",
    description: "Commandez nos produits en quelques clics",
    steps: [
      "Consultez notre catalogue de produits",
      "Sélectionnez les produits souhaités",
      "Ajoutez-les à votre panier",
      "Validez votre commande",
      "Effectuez le paiement"
    ],
    icon: <ShoppingCart className="w-8 h-8 text-blue-600" />,
    buttonText: "Voir le catalogue",
    buttonLink: "/catalogue"
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
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40">
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 animate-fade-in">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-lg md:text-xl mb-6 animate-fade-in">
                  {slides[currentSlide].description}
                </p>
                <a 
                  href="/services"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded-md text-base hover:bg-green-700 transition-colors transform hover:scale-105"
                >
                  Découvrir nos services
                </a>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Process Cards Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {processCards.map((card, index) => (
                  <div 
                    key={index} 
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                <div className="flex items-center mb-6">
                  {card.icon}
                  <h3 className="text-2xl font-bold ml-4">{card.title}</h3>
                </div>
                <p className="text-gray-600 mb-8">{card.description}</p>
                <div className="relative mb-8">
                  <div className="flex overflow-x-auto pb-4 space-x-4">
                    {card.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex-shrink-0 w-64">
                        <div className="bg-gray-50 p-4 rounded-lg h-full">
                      <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <span className="text-green-600 font-semibold">{stepIndex + 1}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-700">Étape {stepIndex + 1}</h4>
                          </div>
                          <p className="text-gray-600 text-sm">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <a 
                  href={card.buttonLink}
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors transform hover:scale-105"
                >
                  <span>{card.buttonText}</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800"
                  alt="Contactez-nous"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">Besoin d'aide ?</h3>
                <p className="text-gray-600 mb-6">
                  Notre équipe est à votre disposition pour répondre à toutes vos questions
                  et vous accompagner dans vos démarches. N'hésitez pas à nous contacter.
                </p>
                <a 
                  href="/contact"
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors transform hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  <span>Contactez-nous</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}