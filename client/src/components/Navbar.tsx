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

  const menuItems = user?.role === 'admin' 
    ? [
        { path: '/admin', label: 'Tableau de bord' },
        { path: '/mon-compte', label: 'Mon compte' }
      ]
    : [
    { path: '/', label: 'Accueil' },
    { path: '/services', label: 'Services' },
    { path: '/catalogue', label: 'Catalogue' },
    { path: '/contact', label: 'Contact' },
    { path: '/mon-compte', label: 'Mon compte' }
  ];

  const renderAuthButton = () => {
    if (isLoggedIn) {
      return (
        <div className="flex items-center space-x-4">
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-green-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center space-x-2">
              <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-green-600">E-Services INRAB</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} hover:text-green-600 transition-colors duration-200 font-medium`}
              >
                {item.label}
              </Link>
            ))}
            {renderAuthButton()}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect border-t border-green-200/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} block px-3 py-2 hover:text-green-600 transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
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
            )}
          </div>
        </div>
      )}
    </nav>
  );
}