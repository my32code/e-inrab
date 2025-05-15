import React, { useState, useEffect } from 'react';
import { X, File, Upload, Download } from 'lucide-react';
import { toast } from 'react-toastify';

interface UserDocument {
  id: number;
  nom_fichier: string;
  chemin_fichier: string;
  type_document: 'commande' | 'service';
  categorie: string;
  created_at: string;
  produit_nom?: string;
  service_nom?: string;
}

interface DocumentDetailModalProps {
  document: UserDocument;
  isAdmin: boolean;
  onClose: () => void;
}

export function DocumentDetailModal({ document, isAdmin, onClose }: DocumentDetailModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedDocuments();
  }, [document]);

  const fetchRelatedDocuments = async () => {
    try {
      const paramName = document.type_document === 'commande' ? 'commandeId' : 'demandeId';
      const response = await fetch(`http://localhost:3000/api/documents/user?${paramName}=${document.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents associés');
      }

      const data = await response.json();
      setRelatedDocuments(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des documents associés');
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
    formData.append('type', document.type_document);
    
    // Récupérer l'ID de la commande ou de la demande associée
    try {
      const paramName = document.type_document === 'commande' ? 'commandeId' : 'demandeId';
      const response = await fetch(`http://localhost:3000/api/documents/user?${paramName}=${document.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations');
      }

      const data = await response.json();
      const relatedDoc = data.data.find((doc: any) => doc.id === document.id);
      
      if (!relatedDoc) {
        throw new Error('Document non trouvé');
      }

      // Utiliser l'ID de la commande ou de la demande associée
      if (document.type_document === 'commande') {
        formData.append('commandeId', relatedDoc.commande_id.toString());
      } else {
        formData.append('demandeId', relatedDoc.demande_id.toString());
      }
      
      formData.append('categorie', 'complementaire');

      // Upload du document
      const uploadResponse = await fetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload du document');
      }

      toast.success('Document uploadé avec succès');
      setSelectedFile(null);
      fetchRelatedDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload du document');
      console.error('Erreur:', error);
    }
  };

  const handleDownload = async (doc: UserDocument) => {
    try {
      const response = await fetch(`http://localhost:3000/api/documents/download/${doc.id}`, {
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
      a.download = doc.nom_fichier;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
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
            Détails du document
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Informations du document</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom du fichier</p>
                <p className="text-sm font-medium text-gray-900">{document.nom_fichier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {document.type_document === 'commande' ? 'Commande' : 'Service'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Référence</p>
                <p className="text-sm font-medium text-gray-900">
                  {document.type_document === 'commande' ? document.produit_nom : document.service_nom}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'ajout</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(document.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Ajouter un document complémentaire</h4>
            <div className="space-y-4">
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
              <button
                onClick={handleUploadSubmit}
                disabled={!selectedFile}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Uploader le document
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Documents associés</h4>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : relatedDocuments.length === 0 ? (
              <p className="text-center text-gray-500">Aucun document associé</p>
            ) : (
              <div className="space-y-4">
                {relatedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
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
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 