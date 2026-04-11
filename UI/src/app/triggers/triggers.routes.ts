import { Routes } from '@angular/router';

export const triggersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./triggers.component').then((m) => m.TriggersComponent),
  },
];
