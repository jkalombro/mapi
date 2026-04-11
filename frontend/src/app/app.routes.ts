import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'items',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'items',
    loadChildren: () => import('./items/items.routes').then((m) => m.itemsRoutes),
  },
  {
    path: 'triggers',
    loadChildren: () => import('./triggers/triggers.routes').then((m) => m.triggersRoutes),
  },
  {
    path: '**',
    redirectTo: 'items',
  },
];
