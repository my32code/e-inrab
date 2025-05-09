import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ShoppingCart, Wrench, Download, Trash2 } from 'lucide-react';

interface Document {
  id: number;
  commande_id: number | null;
  demande_id: number | null;
  document_demande_id: number | null;
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
  document_demande?: {
    id: number;
    nom_fichier: string;
    chemin_fichier: string;
  };
}

interface DocumentDemande {
  id: number;
  nom_fichier: string;
  demande_id: number;
}

export function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsDemandes, setDocumentsDemandes] = useState<DocumentDemande[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<'commande' | 'service'>('commande');
  const [selectedReference, setSelectedReference] = useState('');
  const [selectedDocumentDemandeId, setSelectedDocumentDemandeId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchDocumentsDemandes();
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

      const data = await response.json();
      setDocuments(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentsDemandes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/documents-demandes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents de demande');
      }

      const data = await response.json();
      setDocumentsDemandes(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des documents de demande');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      let url = 'http://localhost:3000/api/admin/documents';
      
      if (selectedType === 'commande' && selectedReference) {
        formData.append('type', 'commande');
        formData.append('reference', selectedReference);
      } else if (selectedType === 'service' && selectedReference) {
        formData.append('type', 'service');
        formData.append('reference', selectedReference);
      } else if (selectedDocumentDemandeId) {
        url = `${url}?documentDemandeId=${selectedDocumentDemandeId}`;
      } else {
        toast.error('Veuillez sélectionner une référence valide');
        return;
      }

      const response = await fetch(url, {
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
      setSelectedDocumentDemandeId(null);
      fetchDocuments();
    } catch (error) {
      toast.error('Erreur lors de l\'upload du document');
      console.error('Erreur:', error);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/documents/${document.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.nom_fichier;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du téléchargement du document');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success('Document supprimé avec succès');
      fetchDocuments();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du document');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload de document</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de document</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'commande' | 'service')}
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="commande">Commande</option>
              <option value="service">Service</option>
            </select>
          </div>

          {selectedType === 'commande' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Référence de commande</label>
              <input
                type="text"
                value={selectedReference}
                onChange={(e) => setSelectedReference(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Entrez la référence de la commande"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Référence de demande</label>
                <input
                  type="text"
                  value={selectedReference}
                  onChange={(e) => setSelectedReference(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Entrez la référence de la demande"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Document de demande existant</label>
                <select
                  value={selectedDocumentDemandeId || ''}
                  onChange={(e) => setSelectedDocumentDemandeId(e.target.value || null)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sélectionner un document de demande existant</option>
                  {documentsDemandes.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nom_fichier} (Demande #{doc.demande_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Fichier</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
          </div>

          <button
            onClick={handleUpload}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Uploader
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Liste des documents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du fichier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.nom_fichier}
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
                      {doc.type_document === 'commande' 
                        ? 'Commande' 
                        : doc.demande_id
                          ? 'Service (direct)'
                          : 'Service (doc)'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.type_document === 'commande' 
                      ? doc.commande?.reference_paiement 
                      : doc.demande_id 
                        ? `Demande #${doc.demande?.id}` 
                        : doc.document_demande_id 
                          ? `Doc Demande #${doc.document_demande?.id}`
                          : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.utilisateur ? (
                      <div>
                        <div className="font-medium">{doc.utilisateur.nom}</div>
                        <div className="text-gray-400">{doc.utilisateur.email}</div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 