import React, { useState, useEffect } from 'react';
import { File, Download, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Document {
    id: number;
    nom_fichier: string;
    type_document: 'commande' | 'service';
    categorie: string;
    created_at: string;
    produit_nom?: string;
    service_nom?: string;
    document_demande_id?: number;
    document_demande_nom?: string;
    document_demande_chemin?: string;
    document_demande_date?: string;
}

export function DocumentsList() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            setError('Une erreur est survenue lors du chargement des documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDownload = async (doc: Document) => {
        try {
            const documentId = doc.id;
            const fileName = doc.nom_fichier || 'document';

            console.log('Téléchargement du document:', {
                id: documentId,
                nom: fileName,
                type: doc.type_document,
                source: 'documents'
            });

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
            const a = window.document.createElement('a') as HTMLAnchorElement;
            a.href = url;
            a.download = fileName;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
        } catch (error) {
            toast.error('Erreur lors du téléchargement du document');
            console.error('Erreur:', error);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            return;
        }

        try {
            const documentId = doc.document_demande_id || doc.id;
            const response = await fetch(`http://localhost:3000/api/admin/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            toast.success('Document supprimé avec succès');
            fetchDocuments(); // Rafraîchir la liste
        } catch (error) {
            toast.error('Erreur lors de la suppression du document');
            console.error('Erreur:', error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-gray-600">Chargement des documents...</p>
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

    if (documents.length === 0) {
        return (
            <div className="text-center py-12">
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Aucun document n'a été trouvé.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {documents.map((doc) => (
                <div
                    key={doc.document_demande_id || doc.id}
                    className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <File className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {doc.document_demande_nom || doc.nom_fichier}
                            </p>
                            <p className="text-xs text-gray-500">
                                {doc.type_document === 'commande' ? doc.produit_nom : doc.service_nom} - 
                                {format(new Date(doc.document_demande_date || doc.created_at), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleDownload(doc)}
                            className="text-sm text-green-600 hover:text-green-700 flex items-center"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                        </button>
                        <button
                            onClick={() => handleDelete(doc)}
                            className="text-sm text-red-600 hover:text-red-700 flex items-center"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
} 