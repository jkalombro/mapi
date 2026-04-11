import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then((m) => m.LandingComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
    canActivate: [guestGuard],
  },
  {
    path: 'items',
    loadChildren: () => import('./items/items.routes').then((m) => m.itemsRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'triggers',
    loadChildren: () => import('./triggers/triggers.routes').then((m) => m.triggersRoutes),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
