// src/api/api.ts

export interface Service {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  prix: string;
  pieces_requises: string;
  delai_mise_disposition: string;
}

// ✅ Base URL dynamique selon l'environnement
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_HOST || 'http://localhost:3001';

// ✅ Fonction générique de récupération des services
export const fetchServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des services :', error);
    throw error;
  }
};
