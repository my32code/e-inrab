import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Tag, User } from 'lucide-react';

const news = [
  {
    id: 1,
    title: "Nouvelle variété de maïs résistante à la sécheresse",
    description: "Découvrez notre dernière innovation en matière de semences de maïs, spécialement développée pour résister aux conditions climatiques extrêmes.",
    image: "https://images.unsplash.com/photo-1576552665463-8c5bc6aba9a9?auto=format&fit=crop&w=800",
    date: "2024-03-15",
    author: "Dr. Kofi Mensah",
    category: "Innovation"
  },
  {
    id: 2,
    title: "Formation en agroécologie : inscriptions ouvertes",
    description: "Participez à notre programme de formation intensive en agroécologie. Places limitées, inscrivez-vous dès maintenant !",
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b1b?auto=format&fit=crop&w=800",
    date: "2024-03-20",
    author: "Marie Koffi",
    category: "Formation"
  },
  {
    id: 3,
    title: "Promotion sur les semences de saison",
    description: "Profitez de notre offre spéciale sur une sélection de semences certifiées pour la prochaine saison de culture.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800",
    date: "2024-03-25",
    author: "Aïcha Diallo",
    category: "Promotion"
  }
];

const highlights = [
  {
    id: 1,
    title: "Journées portes ouvertes",
    date: "30-31 Mars 2024",
    image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=800",
    link: "#"
  },
  {
    id: 2,
    title: "Salon de l'agriculture",
    date: "15-17 Avril 2024",
    image: "https://images.unsplash.com/photo-1595274459742-4a41d35784ee?auto=format&fit=crop&w=800",
    link: "#"
  }
];

export function News() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Hero Section */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Actualités et Événements</h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Restez informé des dernières nouvelles et innovations de l'INRAB
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Featured Events */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Événements à venir</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {highlights.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-xl shadow-lg group"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-white/80 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      {event.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* News Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  {article.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {article.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(article.date).toLocaleDateString()}
                  </div>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="mt-4 flex items-center text-green-600 hover:text-green-700"
                >
                  Lire la suite
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-green-50 rounded-xl p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Restez informé</h2>
            <p className="text-gray-600 mb-6">
              Abonnez-vous à notre newsletter pour recevoir les dernières actualités et offres spéciales
            </p>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                S'abonner
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}