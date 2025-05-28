import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { register } from '../services/auth';

// 1. Schéma de validation avec Zod
const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  role: z.enum(['agriculteur', 'chercheur', 'entreprise', 'partenaire', 'admin']),
  mot_de_passe: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  telephone: z.string().regex(/^\+?[0-9\s\-\(\)]{8,15}$/, 'Numéro de téléphone invalide'),
}).refine((data) => data.mot_de_passe === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { 
    register: formregister, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'agriculteur' // Valeur par défaut
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: data.nom,
          email: data.email,
          mot_de_passe: data.mot_de_passe,
          role: data.role,
          telephone: data.telephone
        })
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      toast.success('Inscription réussie !');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px space-y-4">
            {/* Champ Nom */}
            <div>
              <label htmlFor="nom" className="sr-only">Nom complet</label>
              <input
                {...formregister('nom')}
                type="text"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Nom complet"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>

            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                {...formregister('email')}
                type="email"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Champ Téléphone */}
            <div>
              <label htmlFor="telephone" className="sr-only">Numéro de téléphone</label>
              <input
                {...formregister('telephone')}
                type="tel"
                placeholder="Numéro de téléphone (ex: +229 64 28 37 02)"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                pattern="^\+?[0-9\s\-\(\)]{8,15}$"
                title="Format: +XXX XX XX XX XX (ex: +229 64 28 37 02)"
              />
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="mot_de_passe" className="sr-only">Mot de passe</label>
              <input
                {...formregister('mot_de_passe')}
                type="password"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
              {errors.mot_de_passe && (
                <p className="mt-1 text-sm text-red-600">{errors.mot_de_passe.message}</p>
              )}
            </div>

            {/* Champ Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirmer le mot de passe</label>
              <input
                {...formregister('confirmPassword')}
                type="password"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Confirmer le mot de passe"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSubmitting ? 'Inscription...' : "S'inscrire"}
            </motion.button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-green-600 hover:text-green-500">
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}