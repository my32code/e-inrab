import fs from 'fs/promises';
import path from 'path';

const PENDING_ORDERS_FILE = path.join(__dirname, '../../data/pending_orders.json');

// Assurer que le dossier data existe
(async () => {
  try {
    await fs.access(path.dirname(PENDING_ORDERS_FILE));
    console.log('Dossier data existe déjà');
  } catch {
    console.log('Création du dossier data...');
    await fs.mkdir(path.dirname(PENDING_ORDERS_FILE), { recursive: true });
    console.log('Dossier data créé avec succès');
  }
})();

interface PendingOrder {
  id: string;
  utilisateur_id: number;
  produit_id: number;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  createdAt: string;
}

export const getPendingOrders = async (): Promise<PendingOrder[]> => {
  try {
    console.log('Lecture des commandes en attente...');
    const data = await fs.readFile(PENDING_ORDERS_FILE, 'utf-8');
    const orders = JSON.parse(data);
    console.log(`${orders.length} commandes en attente trouvées`);
    return orders;
  } catch (error) {
    console.log('Aucune commande en attente trouvée ou erreur de lecture');
    return [];
  }
};

export const savePendingOrder = async (order: PendingOrder): Promise<void> => {
  console.log('Sauvegarde d\'une nouvelle commande en attente:', order);
  const orders = await getPendingOrders();
  orders.push(order);
  await fs.writeFile(PENDING_ORDERS_FILE, JSON.stringify(orders, null, 2));
  console.log('Commande en attente sauvegardée avec succès');
};

export const removePendingOrder = async (orderId: string): Promise<void> => {
  console.log('Suppression de la commande en attente:', orderId);
  const orders = await getPendingOrders();
  const filteredOrders = orders.filter(order => order.id !== orderId);
  await fs.writeFile(PENDING_ORDERS_FILE, JSON.stringify(filteredOrders, null, 2));
  console.log('Commande en attente supprimée avec succès');
};

export const getPendingOrder = async (orderId: string): Promise<PendingOrder | null> => {
  console.log('Recherche de la commande en attente:', orderId);
  const orders = await getPendingOrders();
  const order = orders.find(order => order.id === orderId) || null;
  console.log('Commande trouvée:', order ? 'oui' : 'non');
  return order;
};

export const getUserPendingOrders = async (userId: number): Promise<PendingOrder[]> => {
  console.log('Récupération des commandes en attente pour l\'utilisateur:', userId);
  const orders = await getPendingOrders();
  const userOrders = orders.filter(order => order.utilisateur_id === userId);
  console.log(`${userOrders.length} commandes en attente trouvées pour l'utilisateur`);
  return userOrders;
}; 