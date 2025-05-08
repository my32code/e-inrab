import React, { useState, useEffect } from 'react';
import { AlertTriangle, Upload, FileText, ShoppingCart, Wrench } from 'lucide-react';
import { toast } from 'react-toastify';

interface Document {
  id: number;
  commande_id: number | null;
  nom_fichier: string;
  chemin_fichier: string;
  type_document: 'commande' | 'service';
  created_at: string;
  utilisateur?: {
    nom: string;
    email: string;
  };
  commande?: {
    id: number;
    reference_paiement: string;
  };
  demande?: {
    id: number;
    description: string;
  };
}

export function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'commande' | 'service' | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<'commande' | 'service'>('commande');
  const [selectedReference, setSelectedReference] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }

      const responseData = await response.json();
      console.log('Données reçues:', responseData);

      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('Structure de données invalide:', responseData);
        setDocuments([]);
        return;
      }

      setDocuments(responseData.data);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError('Une erreur est survenue lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType || !selectedReference) {
      toast.error('Veuillez sélectionner un fichier, un type et une référence');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', selectedType);
    formData.append('reference', selectedReference);

    try {
      const response = await fetch('http://localhost:3000/api/admin/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload du document');
      }

      toast.success('Document uploadé avec succès');
      setSelectedFile(null);
      setSelectedReference('');
      fetchDocuments();
    } catch (error) {
      toast.error('Erreur lors de l\'upload du document');
      console.error('Erreur:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.nom_fichier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.utilisateur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.utilisateur?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter ? doc.type_document === typeFilter : true;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Gestion des Documents</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'commande' | 'service' | '')}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les types</option>
            <option value="commande">Commandes</option>
            <option value="service">Services</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploader un document</h3>
          <div className="flex space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'commande' | 'service')}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="commande">Commande</option>
              <option value="service">Service</option>
            </select>
            <input
              type="text"
              placeholder="Référence de la commande/demande"
              value={selectedReference}
              onChange={(e) => setSelectedReference(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Upload className="w-5 h-5 inline-block mr-2" />
              Uploader
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun document trouvé
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{doc.nom_fichier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        doc.type_document === 'commande' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-purple-50 text-purple-600'
                      }`}>
                        {doc.type_document === 'commande' ? (
                          <ShoppingCart className="w-4 h-4 mr-2" />
                        ) : (
                          <Wrench className="w-4 h-4 mr-2" />
                        )}
                        {doc.type_document === 'commande' ? 'Commande' : 'Service'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.utilisateur?.nom}</div>
                      <div className="text-sm text-gray-500">{doc.utilisateur?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.type_document === 'commande' 
                        ? doc.commande?.reference_paiement 
                        : `Demande #${doc.demande?.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`http://localhost:3000/uploads/${doc.chemin_fichier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        <FileText className="w-5 h-5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 