import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProduitService } from '../../services/produit-service.service';
import { Produit } from '../../models/produit.model';

@Component({
  selector: 'app-produit-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './produit-add.html',
  styleUrls: ['./produit-add.scss']
})
export class ProduitAdd implements OnInit, OnDestroy {
  produitForm!: FormGroup;
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  existingProducts: Produit[] = [];

  private productsSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private produitService: ProduitService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    console.log('➕ ProduitAdd Component initialisé');
    this.loadExistingProducts();
  }

  initForm(): void {
    this.produitForm = this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.uniqueNameValidator.bind(this)
      ]],
      prix: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99),
        this.positivePriceValidator
      ]],
      quantite: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(999999),
        this.nonNegativeQuantityValidator
      ]]
    });
  }

  loadExistingProducts(): void {
    this.productsSub = this.produitService.getAll().subscribe({
      next: (produits) => {
        this.existingProducts = produits;
        console.log('📦 Produits existants chargés:', produits.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des produits:', error);
      }
    });
  }

  // Validateur personnalisé pour le nom unique
  uniqueNameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.existingProducts.length) {
      return null;
    }

    const nameExists = this.existingProducts.some(
      produit => produit.nom.toLowerCase() === control.value.toLowerCase().trim()
    );

    return nameExists ? { nameExists: true } : null;
  }

  // Validateur personnalisé pour le prix positif
  positivePriceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === '') return null;

    const numValue = parseFloat(value);
    return numValue > 0 ? null : { positivePrice: true };
  }

  // Validateur personnalisé pour la quantité non négative
  nonNegativeQuantityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === '') return null;

    const numValue = parseInt(value);
    return numValue >= 0 ? null : { nonNegative: true };
  }

  // Getters pour les contrôles du formulaire
  get f() { return this.produitForm.controls; }

  // Vérifie si un champ est invalide
  isFieldInvalid(fieldName: string): boolean {
    const field = this.produitForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  // Obtenir les messages d'erreur pour un champ
  getFieldErrors(fieldName: string): string[] {
    const field = this.produitForm.get(fieldName);
    const errors: string[] = [];

    if (!field || !field.errors) return errors;

    const errorMap: { [key: string]: string } = {
      'required': 'Ce champ est obligatoire',
      'minlength': 'Trop court (minimum 2 caractères)',
      'maxlength': 'Trop long (maximum 100 caractères)',
      'nameExists': 'Ce nom de produit existe déjà',
      'min': 'Valeur trop petite',
      'max': 'Valeur trop grande',
      'positivePrice': 'Le prix doit être supérieur à 0',
      'nonNegative': 'La quantité ne peut pas être négative'
    };

    Object.keys(field.errors).forEach(key => {
      if (errorMap[key]) {
        errors.push(errorMap[key]);
      }
    });

    return errors;
  }

  // Calculer la valeur totale du stock
  calculateTotalValue(): number {
    const prix = this.produitForm.get('prix')?.value || 0;
    const quantite = this.produitForm.get('quantite')?.value || 0;
    return prix * quantite;
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.produitForm.reset();
    this.produitForm.markAsPristine();
    this.produitForm.markAsUntouched();
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Annuler et retourner à la liste
  cancel(): void {
    if (this.produitForm.dirty) {
      if (confirm('Vous avez des modifications non enregistrées. Annuler quand même ?')) {
        this.router.navigate(['/produits']);
      }
    } else {
      this.router.navigate(['/produits']);
    }
  }

  // Soumettre le formulaire
  onSubmit(): void {
    console.log('📤 Soumission du formulaire d\'ajout');

    // Marquer tous les champs comme touchés
    this.produitForm.markAllAsTouched();

    // Vérifier la validité du formulaire
    if (this.produitForm.invalid) {
      console.warn('⚠️ Formulaire invalide');
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      this.scrollToFirstError();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données
    const nouveauProduit: Produit = {
      id: 0, // L'ID sera généré par le service
      ...this.produitForm.value
    };

    console.log('🆕 Nouveau produit à créer:', nouveauProduit);

    // Appeler le service
    this.produitService.add(nouveauProduit).subscribe({
      next: (response) => {
        console.log('✅ Produit créé avec succès:', response);
        this.successMessage = 'Produit créé avec succès !';
        this.isSubmitting = false;

        // Réinitialiser le formulaire
        setTimeout(() => {
          this.resetForm();

          // Optionnel: Redirection après succès
          if (confirm('Produit créé avec succès ! Voulez-vous voir la liste des produits ?')) {
            this.router.navigate(['/produits']);
          }
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        this.errorMessage = `Erreur lors de la création: ${error.message || 'Erreur inconnue'}`;
        this.isSubmitting = false;
      }
    });
  }

  // Faire défiler jusqu'au premier champ en erreur
  private scrollToFirstError(): void {
    const firstError = document.querySelector('.field-error');
    if (firstError) {
      firstError.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  // Obtenir la classe CSS pour un champ
  getFieldClass(fieldName: string): string {
    if (this.isFieldInvalid(fieldName)) {
      return 'field-error';
    }
    if (this.produitForm.get(fieldName)?.valid && this.produitForm.get(fieldName)?.dirty) {
      return 'field-success';
    }
    return '';
  }

  // Vérifier si le formulaire a des modifications
  hasChanges(): boolean {
    return this.produitForm.dirty;
  }

  ngOnDestroy(): void {
    console.log('🧹 Nettoyage des abonnements ProduitAdd');
    if (this.productsSub) {
      this.productsSub.unsubscribe();
    }
  }
}
