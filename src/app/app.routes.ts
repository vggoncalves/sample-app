import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'administracao/unidades', loadChildren: () => import('./features/unidades-organizacionais/unidades-organizacionais.routes').then((module) => module.UNIDADES_ORGANIZACIONAIS_ROUTES) },
  { path: '', pathMatch: 'full', redirectTo: 'administracao/unidades' },
  { path: '**', redirectTo: 'administracao/unidades' }
];
