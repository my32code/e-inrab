// client/src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, checkAuth } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth();
        setAuthChecked(true);
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (!authChecked) {
      verifyAuth();
    }
  }, [checkAuth, authChecked]);

  // Afficher le loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Vérification de l'authentification...</div>
      </div>
    );
  }

  // Rediriger vers login uniquement après la vérification complète
  if (!isLoggedIn && authChecked) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Afficher le contenu protégé uniquement si authentifié
  return isLoggedIn ? <>{children}</> : null;
}