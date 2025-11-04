import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { requestPasswordReset, resetPassword } from '../services/auth';
import { ThemeToggle } from '../components/ThemeToggle';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
      setStep('reset'); // Passer directement à l'étape de réinitialisation
      console.log(`✅ Email pré-rempli depuis le lien: ${urlEmail}`);
    }
  }, [searchParams]);

  // Étape 1: Demande de réinitialisation
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await requestPasswordReset(email);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2: Réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }

      if (formData.newPassword.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      const response = await resetPassword(email, formData.newPassword, formData.confirmPassword);
      toast.success(response.message);
      
      // Rediriger vers la page de connexion
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step === 'request') {
      setEmail(e.target.value);
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  let content;
  
  if (step === 'request') {
    content = (
      <div>
        <h2 className="shine-text">Mot de passe oublié</h2>
        <p className="text-center text-gray-600 mb-6">
          Entrez votre adresse email pour recevoir les instructions de réinitialisation
        </p>
        <form onSubmit={handleRequestReset} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Adresse email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="auth-container input"
              placeholder="Adresse email"
              value={email}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`auth-container button pulse w-full ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Envoi en cours...' : 'Continuer'}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link to="/login" className="link">Retour à la connexion</Link>
        </div>
      </div>
    );
  }
  
  if (step === 'reset') {
    content = (
      <div>
        <h2 className="shine-text">Réinitialiser le mot de passe</h2>
        <p className="text-center text-gray-600 mb-6">
          Créez votre nouveau mot de passe pour <strong>{email}</strong>
        </p>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="sr-only">Nouveau mot de passe</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="auth-container input"
              placeholder="Nouveau mot de passe"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="auth-container input"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="auth-container button bg-gray-500 hover:bg-gray-600 flex-1"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`auth-container button pulse flex-1 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <Link to="/login" className="link">Retour à la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-background">
      <ThemeToggle />
      <div className="auth-container glass-effect card-3d">
        {content}
      </div>
    </div>
  );
}