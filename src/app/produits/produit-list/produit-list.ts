import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProduitService } from '../../services/produit-service.service';
import { Produit } from '../../models/produit.model';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produit-list.html',
  styleUrls: ['./produit-list.scss']
})
export class ProduitList implements OnInit, OnDestroy {
  produits: Produit[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  totalValue: number = 0;
  averagePrice: number = 0;
  totalStock: number = 0;

  private subscriptions: Subscription = new Subscription();

  constructor(private produitService: ProduitService) {
    console.log('🔧 ProduitList Component créé');
    console.log('📦 Service injecté:', this.produitService);
  }

  ngOnInit(): void {
    console.log('🔄 ngOnInit() appelé');
    this.loadProduits();
  }

  loadProduits(): void {
    console.log('📥 loadProduits() appelé');
    this.isLoading = true;
    this.errorMessage = '';

    const loadSubscription = this.produitService.getAll().subscribe({
      next: (produits) => {
        console.log('✅ Produits reçus du service:', produits);
        console.log('📊 Nombre de produits:', produits?.length || 0);

        // Vérification des données
        if (!produits || !Array.isArray(produits)) {
          console.error('❌ Données invalides reçues:', produits);
          this.produits = [];
          this.errorMessage = 'Format de données invalide';
        } else {
          // Filtrer les produits valides
          this.produits = produits.filter(p => {
            const isValid = p && p.id !== undefined && p.nom && p.prix !== undefined;
            if (!isValid) {
              console.warn('⚠️ Produit invalide filtré:', p);
            }
            return isValid;
          });

          console.log('🎯 Produits après filtrage:', this.produits.length);

          // Calculer les statistiques
          this.calculateStatistics();
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des produits:', error);
        this.errorMessage = `Erreur de chargement: ${error.message || 'Erreur inconnue'}`;
        this.isLoading = false;

        // Charger des données de test en cas d'erreur
        this.loadFallbackData();
      }
    });

    this.subscriptions.add(loadSubscription);
  }

  // Fonction pour garantir un ID valide
  getProduitId(produit: Produit): number {
    if (!produit || produit.id === undefined || produit.id === null) {
      console.error('🚨 Produit sans ID:', produit);
      return -1;
    }
    return produit.id;
  }

  // Calculer toutes les statistiques
  calculateStatistics(): void {
    this.totalValue = this.calculateTotalValue();
    this.averagePrice = this.calculateAveragePrice();
    this.totalStock = this.calculateTotalStock();

    console.log('📈 Statistiques calculées:', {
      totalValue: this.totalValue,
      averagePrice: this.averagePrice,
      totalStock: this.totalStock
    });
  }

  // Calculer la valeur totale du stock
  calculateTotalValue(): number {
    if (!this.produits.length) return 0;
    return this.produits.reduce((total, produit) => {
      return total + (produit.prix * produit.quantite);
    }, 0);
  }

  // Calculer le prix moyen
  calculateAveragePrice(): number {
    if (this.produits.length === 0) return 0;
    const total = this.produits.reduce((sum, produit) => sum + produit.prix, 0);
    return total / this.produits.length;
  }

  // Calculer le stock total
  calculateTotalStock(): number {
    if (!this.produits.length) return 0;
    return this.produits.reduce((total, produit) => total + produit.quantite, 0);
  }

  // Supprimer un produit
  deleteProduit(id: number): void {
    if (!id || id <= 0) {
      console.error('ID invalide pour suppression:', id);
      return;
    }

    const produitName = this.produits.find(p => p.id === id)?.nom || 'ce produit';

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${produitName}" ? Cette action est irréversible.`)) {
      console.log(`🗑️ Suppression du produit ID: ${id}`);

      const deleteSubscription = this.produitService.delete(id).subscribe({
        next: () => {
          console.log(`✅ Produit ${id} supprimé avec succès`);

          // Animation visuelle de suppression
          const deletedRow = document.querySelector(`tr[data-product-id="${id}"]`);
          if (deletedRow) {
            deletedRow.classList.add('deleting');
            setTimeout(() => {
              this.loadProduits();
            }, 300);
          } else {
            this.loadProduits();
          }
        },
        error: (error) => {
          console.error(`❌ Erreur lors de la suppression du produit ${id}:`, error);
          alert(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
        }
      });

      this.subscriptions.add(deleteSubscription);
    }
  }

  // Obtenir la classe CSS pour le statut du stock
  getStockStatusClass(quantite: number): string {
    if (quantite === 0) return 'status-rupture';
    if (quantite < 5) return 'status-faible';
    if (quantite < 10) return 'status-moyen';
    return 'status-bon';
  }

  // Obtenir le texte du statut du stock
  getStockStatusText(quantite: number): string {
    if (quantite === 0) return 'Rupture';
    if (quantite < 5) return 'Très faible';
    if (quantite < 10) return 'Faible';
    if (quantite < 20) return 'Moyen';
    return 'Bon';
  }

  // Données de fallback en cas d'erreur
  private loadFallbackData(): void {
    console.log('🔄 Chargement des données de secours...');
    this.produits = [
      { id: 1, nom: 'Ordinateur Portable', prix: 1200, quantite: 10 },
      { id: 2, nom: 'Souris sans fil', prix: 25, quantite: 50 },
      { id: 3, nom: 'Clavier mécanique', prix: 80, quantite: 30 },
      { id: 4, nom: 'Écran 24 pouces', prix: 300, quantite: 15 },
      { id: 5, nom: 'Casque Audio', prix: 150, quantite: 20 }
    ];
    this.calculateStatistics();
    this.errorMessage = 'Données de démonstration chargées';
  }

  // Rafraîchir manuellement
  refreshList(): void {
    console.log('🔄 Rafraîchissement manuel');
    this.loadProduits();
  }

  // Nettoyer les abonnements
  ngOnDestroy(): void {
    console.log('🧹 Nettoyage des abonnements');
    this.subscriptions.unsubscribe();
  }
}
