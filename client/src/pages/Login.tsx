import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
      console.log('Login response:', response);
      console.log('User role:', response.user.role);
      
      authLogin(response.user);
      
      // Redirection basée sur le rôle
      if (response.user.role === 'admin') {
        console.log('Redirecting to admin page...');
        navigate('/admin', { replace: true });
      } else {
        // Pour les autres rôles, rediriger vers la page demandée ou la page d'accueil
        const from = searchParams.get('from') || '/';
        console.log('Redirecting to:', from);
        navigate(from, { replace: true });
      }
      
      toast.success('Connexion réussie !');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <ThemeToggle />
      <div className="auth-container glass-effect card-3d">
        <h2 className="shine-text">Connexion à votre compte</h2>
        <p className="text-center text-gray-600 mb-6">
          Ou{' '}
          <Link to="/register" className="link">
            créez un compte
          </Link>
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="auth-container input"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="mot_de_passe" className="sr-only">
              Mot de passe
            </label>
            <input
              id="mot_de_passe"
              name="mot_de_passe"
              type="password"
              required
              className="auth-container input"
              placeholder="Mot de passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`auth-container button pulse ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}