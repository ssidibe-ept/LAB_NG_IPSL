import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProduitService } from '../../services/produit-service.service';
import { Produit } from '../../models/produit.model';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produit-detail.html',
  styleUrls: ['./produit-detail.scss']
})
export class ProduitDetail implements OnInit, OnDestroy {
  produit: Produit | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  productId: number | null = null;

  private routeSub!: Subscription;
  private productSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    console.log('🔍 ProduitDetail Component initialisé');

    // S'abonner aux changements de route
    this.routeSub = this.route.params.subscribe(params => {
      const id = +params['id'];

      if (isNaN(id) || id <= 0) {
        this.errorMessage = 'ID de produit invalide';
        this.isLoading = false;
        return;
      }

      this.productId = id;
      this.loadProduit(id);
    });
  }

  loadProduit(id: number): void {
    console.log(`📥 Chargement du produit ID: ${id}`);
    this.isLoading = true;
    this.errorMessage = '';

    this.productSub = this.produitService.getById(id).subscribe({
      next: (produit) => {
        if (!produit) {
          this.errorMessage = 'Produit non trouvé';
          console.warn(`❌ Produit ${id} non trouvé`);
        } else {
          console.log('✅ Produit chargé:', produit);
          this.produit = produit;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`❌ Erreur lors du chargement du produit ${id}:`, error);
        this.errorMessage = `Erreur de chargement: ${error.message || 'Erreur inconnue'}`;
        this.isLoading = false;
      }
    });
  }

  // Calculer la valeur totale de ce produit en stock
  getTotalValue(): number {
    if (!this.produit) return 0;
    return this.produit.prix * this.produit.quantite;
  }

  // Obtenir la classe CSS pour le statut du stock
  getStockStatusClass(quantite: number): string {
    if (quantite === 0) return 'status-out';
    if (quantite < 5) return 'status-low';
    if (quantite < 10) return 'status-medium';
    return 'status-good';
  }

  // Obtenir le texte du statut
  getStockStatusText(quantite: number): string {
    if (quantite === 0) return 'En rupture';
    if (quantite < 5) return 'Stock critique';
    if (quantite < 10) return 'Stock faible';
    if (quantite < 20) return 'Stock moyen';
    return 'Stock bon';
  }

  // Obtenir l'icône correspondant au statut
  getStockIcon(quantite: number): string {
    if (quantite === 0) return 'bi-exclamation-triangle';
    if (quantite < 5) return 'bi-exclamation-circle';
    if (quantite < 10) return 'bi-info-circle';
    return 'bi-check-circle';
  }

  // Obtenir la couleur du statut
  getStockColor(quantite: number): string {
    if (quantite === 0) return '#ef476f';
    if (quantite < 5) return '#ffd166';
    if (quantite < 10) return '#06d6a0';
    return '#118ab2';
  }

  // Supprimer le produit
  deleteProduit(): void {
    if (!this.productId) return;

    const produitName = this.produit?.nom || 'ce produit';

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${produitName}" ? Cette action est irréversible.`)) {
      console.log(`🗑️ Suppression du produit ID: ${this.productId}`);

      this.produitService.delete(this.productId).subscribe({
        next: () => {
          console.log(`✅ Produit ${this.productId} supprimé avec succès`);
          alert('Produit supprimé avec succès !');
          this.router.navigate(['/produits']);
        },
        error: (error) => {
          console.error(`❌ Erreur lors de la suppression:`, error);
          alert(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
        }
      });
    }
  }

  // Retour à la liste
  goBack(): void {
    this.router.navigate(['/produits']);
  }

  // Éditer ce produit
  editProduit(): void {
    if (this.productId) {
      this.router.navigate(['/produits/edit', this.productId]);
    }
  }


// Méthode pour calculer le niveau de stock (0-100%)
  getStockLevel(quantite: number): string {
    const max = 50; // On considère 50 comme stock maximum pour la visualisation
    const level = Math.min((quantite / max) * 100, 100);
    return `${level}%`;
  }

// Méthode pour estimer les jours de stock
  getStockDays(quantite: number): number {
    const dailyUsage = 2; // Estimation: 2 unités vendues par jour
    return Math.floor(quantite / dailyUsage);
  }

// Méthode pour obtenir l'heure actuelle formatée
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 Nettoyage des abonnements ProduitDetail');
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.productSub) {
      this.productSub.unsubscribe();
    }
  }
}
