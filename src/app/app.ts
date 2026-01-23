import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,  CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'LAB_NG_IPSL';
  currentYear: number = new Date().getFullYear();

  // Menu de navigation
  navItems = [
    { path: '/produits', label: 'Produits', icon: 'bi-grid' },
    { path: '/produits/add', label: 'Ajouter', icon: 'bi-plus-lg' }
  ];
}
