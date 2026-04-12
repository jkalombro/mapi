import { Routes } from '@angular/router';

export const actionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./actions.component').then((m) => m.ActionsComponent),
  },
];
