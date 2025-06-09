const handleDownload = async (document: UserDocument) => {
  try {
    // Si c'est un document de documents_demandes, utiliser document_demande_id et document_demande_nom
    const documentId = document.document_demande_id || document.id;
    const fileName = document.document_demande_nom || document.nom_fichier || 'document';

    console.log('Téléchargement du document:', {
      id: documentId,
      nom: fileName,
      type: document.type_document,
      source: document.document_demande_id ? 'documents_demandes' : 'documents'
    });

    const response = await fetch(`http://localhost:3000/api/documents/download/${documentId}`, {
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
    console.error('Erreur lors du téléchargement:', error);
    toast.error('Erreur lors du téléchargement du document');
  }
}; 