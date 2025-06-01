import React, { useState, useEffect } from 'react';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface Document {
  id: number;
  commande_id?: number;
  demande_id?: number;
  service_id?: number;
  nom_fichier: string;
  chemin_fichier: string;
  type_document: 'commande' | 'service';
  created_at: string;
  produit_nom?: string;
  service_nom?: string;
  document_demande_id?: number;
  document_demande_nom?: string;
  document_demande_chemin?: string;
  document_demande_date?: string;
}

interface DocumentsListProps {
  type: 'commande' | 'service';
  referenceId: number;
  onClose: () => void;
}

export function DocumentsList({ type, referenceId, onClose }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categorie, setCategorie] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [type, referenceId]);

  const fetchDocuments = async () => {
    try {
      const paramName = type === 'commande' ? 'commandeId' : 'demandeId';
      const response = await fetch(`http://localhost:3000/api/admin/documents/get?${paramName}=${referenceId}`, {
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
      toast.error('Erreur lors du chargement des documents');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('categorie', categorie);
    formData.append('type', type);
    
    if (type === 'commande') {
      formData.append('commandeId', referenceId.toString());
    } else if (type === 'service') {
      formData.append('demandeId', referenceId.toString());
    }

    try {
      console.log('Envoi des données:', {
        type,
        categorie,
        referenceId,
        fileName: selectedFile.name
      });

      const response = await fetch('http://localhost:3000/api/admin/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload du document');
      }

      toast.success('Document uploadé avec succès');
      setSelectedFile(null);
      setCategorie('');
      fetchDocuments();
    } catch (error) {
      console.error('Erreur complète:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload du document');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const documentId = doc.document_demande_id || doc.id;
      
      const response = await fetch(`http://localhost:3000/api/admin/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.document_demande_nom || doc.nom_fichier;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Erreur lors du téléchargement du document');
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Documents - {type === 'commande' ? 'Commande' : 'Demande de service'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Catégorie du document
              </label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="facture">Facture</option>
                <option value="preuve">Preuve</option>
                <option value="contrat">Contrat</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sélectionner un fichier
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="mt-1 block w-full"
              />
            </div>
          </div>
          <button
            onClick={handleUploadSubmit}
            disabled={!selectedFile || !categorie}
            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Uploader le document
          </button>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Documents existants</h4>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-center text-gray-500">Aucun document</p>
          ) : (
            <div className="space-y-4">
              {/* Documents de documents_demandes (uniquement une fois) */}
              {documents.find(doc => doc.document_demande_id && doc.document_demande_nom && doc.document_demande_chemin && doc.document_demande_date) && (
                <div key={`demande-${documents[0].document_demande_id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <File className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{documents[0].document_demande_nom}</p>
                      <p className="text-xs text-gray-500">
                        Ajouté le {documents[0].document_demande_date ? new Date(documents[0].document_demande_date).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload({
                      ...documents[0],
                      nom_fichier: documents[0].document_demande_nom as string,
                      chemin_fichier: documents[0].document_demande_chemin as string
                    })}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Télécharger
                  </button>
                </div>
              )}

              {/* Documents de la table documents */}
              {documents.filter(doc => doc.id).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <File className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.nom_fichier}</p>
                      <p className="text-xs text-gray-500">
                        Ajouté le {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 