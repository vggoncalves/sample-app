import { Routes } from '@angular/router';

export const UNIDADES_ORGANIZACIONAIS_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./unidades-organizacionais-lista.component').then((component) => component.UnidadesOrganizacionaisListaComponent)
}];
