import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="col-span-1">
            <div className="mb-4">
              <img 
                src="/images/logo_long_blanc.png" 
                alt="INRAB Logo" 
                className="max-w-full h-auto"
              />
            </div>
            <p className="text-gray-300 mb-4">
              L'INRAB est un établissement public à caractère scientifique ayant pour mission la mise en œuvre de la politique du Gouvernement dans le domaine de la recherche agricole à travers la production de l'information et des technologies appropriées.
            </p>
            <Link 
              to="/a-propos/presentation" 
              className="inline-block px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-gray-800 transition-colors"
            >
              En savoir plus !
            </Link>
          </div>

          {/* Liens Utiles */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="https://www.gouv.bj/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Gouvernement Béninois</a></li>
              <li><a href="https://agriculture.gouv.bj/" target="_blank" rel="noopener noreferrer" className="hover:text-white">MAEP</a></li>
              <li><a href="https://www.africarice.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Africa Rice</a></li>
              <li><a href="https://www.coraf.org/fr/" target="_blank" rel="noopener noreferrer" className="hover:text-white">CORAF/WECARD</a></li>
              <li><a href="https://www.procad.org/ppaao/" target="_blank" rel="noopener noreferrer" className="hover:text-white">PPAAO</a></li>
              <li><a href="https://www.fao.org/countryprofiles/index/fr/?iso3=BEN" target="_blank" rel="noopener noreferrer" className="hover:text-white">FAO</a></li>
              <li><a href="https://faraafrica.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">FARA</a></li>
              <li><a href="https://www.oecd.org/fr/pays/benin/" target="_blank" rel="noopener noreferrer" className="hover:text-white">OCDE</a></li>
              <li><a href="https://bj.ambafrance.org/Service-de-cooperation-et-d-action-culturelle-SCAC" target="_blank" rel="noopener noreferrer" className="hover:text-white">Coopération Française</a></li>
              <li><a href="https://www.helvetas.ch/fr/nos_activites/pays_d_engagement/benin.cfm" target="_blank" rel="noopener noreferrer" className="hover:text-white">HELVETAS</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Abomey-calavi, Agonkanmey, 01 BP 884 Cotonou</li>
              <li>Téléphone: 229 64 28 37 02</li>
              <li>Fax: (229) 21 30 04 10</li>
              <li>Email: <a href="mailto:contact@inrab.org" className="hover:text-white">contact@inrab.org</a></li>
            </ul>
            <div className="mt-4">
              <span className="text-gray-300">Réseaux : </span>
              <div className="flex space-x-4 mt-2">
                <a href="https://www.facebook.com/Institut-National-des-Recherches-Agricoles-du-B%C3%A9nin-105825674729379" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Facebook className="w-6 h-6" />
              </a>
                <a href="https://www.linkedin.com/in/inrab-inrab-143839201/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  <Linkedin className="w-6 h-6" />
              </a>
                <a href="https://www.flickr.com/photos/191048538@N06" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Instagram className="w-6 h-6" />
              </a>
                <a href="https://twitter.com/inrabdg" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  <Youtube className="w-6 h-6" />
              </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col items-center space-y-4">
            <img 
              src="/images/footer-logo-MAEP.png" 
              alt="MAEP Logo" 
              className="w-4/5 max-w-md"
            />
            <img 
              src="/images/drapeau.png" 
              alt="Drapeau" 
              className="w-4/5 max-w-md"
            />
            <p className="text-gray-300 text-center">
              Copyright © 2025 | INRAB | Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}