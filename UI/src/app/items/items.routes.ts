import { Routes } from '@angular/router';

export const itemsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./items.component').then((m) => m.ItemsComponent),
  },
];
