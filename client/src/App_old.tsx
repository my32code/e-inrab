import React from 'react';
import { 
  Leaf, 
  FileText, 
  Users, 
  CreditCard, 
  BookOpen, 
  Handshake, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Check,
  Search,
  Calendar,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-green-700 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8" />
            <span className="text-2xl font-bold">e-INRAB</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#services" className="hover:text-green-200 transition">Services</a>
            <a href="#features" className="hover:text-green-200 transition">Fonctionnalités</a>
            <a href="#about" className="hover:text-green-200 transition">À propos</a>
            <a href="#contact" className="hover:text-green-200 transition">Contact</a>
          </div>
          <div className="flex space-x-4">
            <button className="bg-white text-green-700 px-4 py-2 rounded-md font-medium hover:bg-green-100 transition">
              Se connecter
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition">
              S'inscrire
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Transformez votre expérience agricole avec e-INRAB</h1>
            <p className="text-xl mb-8">
              Accédez aux services de l'Institut National des Recherches Agricoles du Bénin en ligne, 
              suivez vos demandes en temps réel et bénéficiez d'un accès simplifié aux connaissances agricoles.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-yellow-500 text-white px-6 py-3 rounded-md font-medium hover:bg-yellow-600 transition flex items-center justify-center">
                Découvrir nos services
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-green-700 transition flex items-center justify-center">
                Comment ça marche
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
              alt="Agriculture au Bénin" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les services numériques proposés par l'INRAB pour soutenir l'agriculture béninoise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Semences et Plants</h3>
              <p className="text-gray-600 mb-4">
                Commandez en ligne des semences certifiées et des plants de qualité pour améliorer vos rendements agricoles.
              </p>
              <a href="#" className="text-green-600 font-medium flex items-center hover:text-green-700">
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Service 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Analyses et Expertises</h3>
              <p className="text-gray-600 mb-4">
                Bénéficiez d'analyses de sols, de diagnostics de maladies et d'expertises techniques pour optimiser votre production.
              </p>
              <a href="#" className="text-green-600 font-medium flex items-center hover:text-green-700">
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Service 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Publications et Recherches</h3>
              <p className="text-gray-600 mb-4">
                Accédez à notre bibliothèque numérique de publications scientifiques, guides pratiques et résultats de recherche.
              </p>
              <a href="#" className="text-green-600 font-medium flex items-center hover:text-green-700">
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Service 4 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Formations et Encadrement</h3>
              <p className="text-gray-600 mb-4">
                Inscrivez-vous à nos formations et programmes d'encadrement pour renforcer vos compétences agricoles.
              </p>
              <a href="#" className="text-green-600 font-medium flex items-center hover:text-green-700">
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Service 5 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Handshake className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Partenariats et Collaborations</h3>
              <p className="text-gray-600 mb-4">
                Explorez les opportunités de collaboration avec l'INRAB et soumettez vos projets de recherche ou de développement.
              </p>
              <a href="#" className="text-green-600 font-medium flex items-center hover:text-green-700">
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Service 6 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="bg-orange-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Paiements Sécurisés</h3>
              <p className="text-gray-600 mb-4">
                Effectuez vos paiements en ligne en toute sécurité via mobile money ou carte bancaire et recevez vos factures électroniques.
              </p>
              <a href="#" className="text-green-600 font-medium flex items-center hover:text-green-700">
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Fonctionnalités Principales</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              e-INRAB offre une expérience utilisateur optimale avec des fonctionnalités innovantes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                alt="Fonctionnalités e-INRAB" 
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des utilisateurs</h3>
                    <p className="text-gray-600">
                      Création de comptes personnalisés pour agriculteurs, chercheurs, entreprises et partenaires avec authentification sécurisée.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                    <Search className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Catalogue interactif</h3>
                    <p className="text-gray-600">
                      Navigation intuitive dans le catalogue des services INRAB avec recherche avancée et filtres personnalisés.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Suivi en temps réel</h3>
                    <p className="text-gray-600">
                      Tableau de bord interactif pour suivre l'état de vos demandes avec notifications automatiques par email et SMS.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des contenus</h3>
                    <p className="text-gray-600">
                      Base de données des publications et innovations avec système de recherche avancée par mots-clés.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Sécurité renforcée</h3>
                    <p className="text-gray-600">
                      Chiffrement des données, protection contre les attaques et gestion des accès basée sur les rôles (RBAC).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-green-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">À propos du projet e-INRAB</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Une initiative de transformation numérique pour moderniser l'accès aux services agricoles au Bénin
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-600 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Contexte</h3>
              <p className="mb-4">
                L'Institut National des Recherches Agricoles du Bénin (INRAB) fournit divers services aux agriculteurs, 
                chercheurs et entrepreneurs. Le projet e-INRAB vise à numériser ces services pour améliorer leur accessibilité.
              </p>
              <p>
                Cette initiative s'inspire de la plateforme eservices.bj et s'inscrit dans la stratégie nationale de 
                transformation numérique du secteur agricole.
              </p>
            </div>
            
            <div className="bg-green-600 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Objectifs</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>Faciliter l'accès aux services de l'INRAB</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>Automatiser et optimiser le traitement des demandes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>Sécuriser les paiements et transactions</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>Offrir une meilleure accessibilité aux connaissances agricoles</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>Renforcer les collaborations avec des partenaires</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-600 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Déploiement</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold">Phase 1</h4>
                  <p>Développement MVP avec services clés et intégration minimale avec eservices.bj</p>
                </div>
                <div>
                  <h4 className="font-bold">Phase 2</h4>
                  <p>Ajout de fonctionnalités avancées (paiement en ligne, collaboration, automatisation)</p>
                </div>
                <div>
                  <h4 className="font-bold">Phase 3</h4>
                  <p>Optimisation, interconnexion complète avec eservices.bj et maintenance continue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Prêt à transformer votre expérience agricole ?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Rejoignez e-INRAB dès aujourd'hui et bénéficiez d'un accès simplifié aux services de l'Institut National 
            des Recherches Agricoles du Bénin.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-green-700 text-white px-8 py-4 rounded-md font-medium hover:bg-green-800 transition">
              Créer un compte
            </button>
            <button className="bg-white border-2 border-green-700 text-green-700 px-8 py-4 rounded-md font-medium hover:bg-green-50 transition">
              Découvrir les services
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Contactez-nous</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vous avez des questions sur e-INRAB ? Notre équipe est à votre disposition pour vous aider.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="votre.email@exemple.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Sujet de votre message"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Votre message"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-green-700 text-white px-6 py-3 rounded-md font-medium hover:bg-green-800 transition w-full"
                >
                  Envoyer le message
                </button>
              </form>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Informations de contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-green-600 mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-800">Adresse</h4>
                    <p className="text-gray-600">
                      Institut National des Recherches Agricoles du Bénin (INRAB)<br />
                      01 BP 884 Cotonou, Bénin
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-green-600 mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-800">Email</h4>
                    <p className="text-gray-600">contact@inrab.bj</p>
                    <p className="text-gray-600">support@e-inrab.bj</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-green-600 mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-800">Téléphone</h4>
                    <p className="text-gray-600">+229 21 30 02 64</p>
                    <p className="text-gray-600">+229 95 40 23 13</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Heures d'ouverture</h4>
                  <p className="text-gray-600">
                    Lundi - Vendredi: 8h00 - 17h00<br />
                    Samedi - Dimanche: Fermé
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Leaf className="h-8 w-8" />
                <span className="text-2xl font-bold">e-INRAB</span>
              </div>
              <p className="text-gray-400 mb-6">
                Plateforme numérique de l'Institut National des Recherches Agricoles du Bénin pour un accès simplifié aux services agricoles.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Services</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Semences et Plants</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Analyses et Expertises</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Publications et Recherches</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Formations et Encadrement</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Partenariats</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Liens utiles</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition">À propos de l'INRAB</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Actualités</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Conditions d'utilisation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Politique de confidentialité</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Newsletter</h3>
              <p className="text-gray-400 mb-4">
                Abonnez-vous à notre newsletter pour recevoir les dernières actualités et innovations agricoles.
              </p>
              <form className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Votre adresse email" 
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                />
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 py-3 rounded-md font-medium hover:bg-green-700 transition w-full"
                >
                  S'abonner
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 e-INRAB. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">Conditions d'utilisation</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Mentions légales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;