import { Routes } from '@angular/router';
import { ProduitList } from './produits/produit-list/produit-list';  // Note: "ProduitList" sans "Component"
import { ProduitDetail } from './produits/produit-detail/produit-detail';
import { ProduitAdd } from './produits/produit-add/produit-add';
import { ProduitEdit } from './produits/produit-edit/produit-edit';

export const routes: Routes = [
  { path: '', redirectTo: '/produits', pathMatch: 'full' },
  { path: 'produits', component: ProduitList },
  { path: 'produits/add', component: ProduitAdd },
  { path: 'produits/:id', component: ProduitDetail },
  { path: 'produits/edit/:id', component: ProduitEdit },
  { path: '**', redirectTo: '/produits' }
];
