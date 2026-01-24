import { delay, Observable, of } from "rxjs";
import { PRODUITS } from "../data/produit.data";
import { Produit } from "../models/produit.model";
import { Injectable } from "@angular/core";
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  private produits: Produit[] = PRODUITS;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Produit[]> {
    const url = `http://localhost:8080/api/produits`;
    return this.httpClient.get<Produit[]>(url);
  }

  getById(id: number): Observable<Produit | undefined> {
    return of(this.produits.find(p => p.id === id)).pipe(delay(500));
  }

  add(produit: Produit): Observable<Produit> {
    produit.id = Date.now();
    this.produits.push(produit);
    return of(produit).pipe(delay(500));
  }

  update(produit: Produit): Observable<Produit> {
    const index = this.produits.findIndex(p => p.id === produit.id);
    this.produits[index] = produit;
    return of(produit).pipe(delay(500));
  }

  delete(id: number): Observable<boolean> {
    this.produits = this.produits.filter(p => p.id !== id);
    return of(true).pipe(delay(500));
  }
}
