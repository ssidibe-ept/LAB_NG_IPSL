import { Produit } from '../models/produit.model';

export const PRODUITS: Produit[] = [
  { id: 1, nom: 'Ordinateur Portable', prix: 1200, quantite: 10 },
  { id: 2, nom: 'Souris sans fil', prix: 25, quantite: 50 },
  { id: 3, nom: 'Clavier mécanique', prix: 80, quantite: 30 },
  { id: 4, nom: 'Écran 24 pouces', prix: 300, quantite: 15 },
  { id: 5, nom: 'Casque Audio', prix: 150, quantite: 20 }
];

// Vérifie que tous ont un ID
console.log('Tous les produits ont un ID:', PRODUITS.every(p => p.id !== undefined));
