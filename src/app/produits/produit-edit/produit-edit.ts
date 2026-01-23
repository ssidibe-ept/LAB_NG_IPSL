import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProduitService } from '../../services/produit-service.service';
import { Produit } from '../../models/produit.model';

@Component({
  selector: 'app-produit-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './produit-edit.html',
  styleUrls: ['./produit-edit.scss']
})
export class ProduitEdit implements OnInit, OnDestroy {
  produitForm!: FormGroup;
  produit: Produit | null = null;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  productId: number | null = null;

  private routeSub!: Subscription;
  private productSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    console.log('✏️ ProduitEdit Component initialisé');

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

  initForm(): void {
    this.produitForm = this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      prix: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99)
      ]],
      quantite: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(999999)
      ]]
    });
  }

  loadProduit(id: number): void {
    console.log(`📥 Chargement du produit ${id} pour édition`);
    this.isLoading = true;
    this.errorMessage = '';

    this.productSub = this.produitService.getById(id).subscribe({
      next: (produit) => {
        if (!produit) {
          this.errorMessage = 'Produit non trouvé';
          console.warn(`❌ Produit ${id} non trouvé`);
        } else {
          console.log('✅ Produit chargé pour édition:', produit);
          this.produit = produit;
          this.populateForm(produit);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`❌ Erreur lors du chargement:`, error);
        this.errorMessage = `Erreur de chargement: ${error.message || 'Erreur inconnue'}`;
        this.isLoading = false;
      }
    });
  }

  populateForm(produit: Produit): void {
    this.produitForm.patchValue({
      nom: produit.nom,
      prix: produit.prix,
      quantite: produit.quantite
    });
  }

  // Getters pour les contrôles du formulaire
  get f() { return this.produitForm.controls; }

  // Vérifie si un champ est invalide
  isFieldInvalid(fieldName: string): boolean {
    const field = this.produitForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  // Retour au détail
  goBack(): void {
    if (this.productId) {
      this.router.navigate(['/produits', this.productId]);
    } else {
      this.router.navigate(['/produits']);
    }
  }

  // Annuler les modifications
  cancelEdit(): void {
    if (this.produitForm.dirty) {
      if (confirm('Vous avez des modifications non enregistrées. Annuler quand même ?')) {
        this.goBack();
      }
    } else {
      this.goBack();
    }
  }

  // Soumettre le formulaire
  onSubmit(): void {
    console.log('📤 Soumission du formulaire d\'édition');

    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.produitForm.markAllAsTouched();

    // Vérifier la validité du formulaire
    if (this.produitForm.invalid) {
      console.warn('⚠️ Formulaire invalide');
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    if (!this.productId || !this.produit) {
      this.errorMessage = 'Produit non chargé correctement';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données
    const updatedProduit: Produit = {
      id: this.productId,
      ...this.produitForm.value
    };

    console.log('📝 Données à mettre à jour:', updatedProduit);

    // Appeler le service
    this.produitService.update(updatedProduit).subscribe({
      next: (response) => {
        console.log('✅ Produit mis à jour avec succès:', response);
        this.successMessage = 'Produit mis à jour avec succès !';
        this.produitForm.markAsPristine();

        // Redirection après succès
        setTimeout(() => {
          this.router.navigate(['/produits', this.productId]);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        this.errorMessage = `Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue'}`;
        this.isSubmitting = false;
      }
    });
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    if (this.produit) {
      this.populateForm(this.produit);
      this.produitForm.markAsPristine();
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  // Calculer la valeur totale
  calculateTotalValue(): number {
    const prix = this.produitForm.get('prix')?.value || 0;
    const quantite = this.produitForm.get('quantite')?.value || 0;
    return prix * quantite;
  }

  // Vérifier les changements
  hasChanges(): boolean {
    return this.produitForm.dirty;
  }

  // Obtenir la classe pour les champs
  getFieldClass(fieldName: string): string {
    if (this.isFieldInvalid(fieldName)) {
      return 'field-error';
    }
    if (this.produitForm.get(fieldName)?.valid) {
      return 'field-success';
    }
    return '';
  }

  ngOnDestroy(): void {
    console.log('🧹 Nettoyage des abonnements ProduitEdit');
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.productSub) {
      this.productSub.unsubscribe();
    }
  }
}
