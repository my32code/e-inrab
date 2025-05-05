import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-green-700' : 'text-gray-700';
  };

  const menuItems = [
    { path: '/', label: 'Accueil' },
    { path: '/services', label: 'Services' },
    { path: '/catalogue', label: 'Catalogue' },
    { path: '/actualites', label: 'Actualités' },
    { path: '/contact', label: 'Contact' },
  ];

  const renderAuthButton = () => {
    if (isLoggedIn) {
      return (
        <div className="flex items-center space-x-4">
          <Link to="/mon-compte" className="flex items-center text-gray-700 hover:text-green-700">
            <User className="h-5 w-5 mr-1" />
            <span>Mon compte</span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-1" />
            Déconnexion
          </motion.button>
        </div>
      );
    }

    return (
      <Link to="/login">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Connexion
        </motion.button>
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/logo.png" 
              alt="INRAB Logo" 
              className="h-16 w-auto"
            />
            <Link to="/" className="text-2xl font-bold text-green-700">e-INRAB</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} hover:text-green-700 transition-colors`}
              >
                {item.label}
              </Link>
            ))}
            {renderAuthButton()}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${isActive(item.path)} block px-3 py-2 rounded-md text-base font-medium hover:text-green-700 hover:bg-green-50 transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/mon-compte" 
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-green-700 hover:bg-green-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-1" />
                    Mon compte
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-2 flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="block w-full mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}