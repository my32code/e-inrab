export interface Service {
    id: number;
    nom: string;
    description: string;
    categorie: string;
    prix: string;
    pieces_requises: string;
    delai_mise_disposition: string;
}

export const fetchServices = async (): Promise<Service[]> => {
    const response = await fetch('http://localhost:3000/api/services');

    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json(); // Suppression du .data
};
