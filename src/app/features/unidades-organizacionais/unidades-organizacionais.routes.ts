import { CanDeactivateFn, Routes } from '@angular/router';
import { UnidadesOrganizacionaisFormularioComponent } from './unidades-organizacionais-formulario.component';

const confirmarSaidaFormulario: CanDeactivateFn<UnidadesOrganizacionaisFormularioComponent> = (component) => component.confirmarSaida();
const formulario = () => import('./unidades-organizacionais-formulario.component').then((component) => component.UnidadesOrganizacionaisFormularioComponent);

export const UNIDADES_ORGANIZACIONAIS_ROUTES: Routes = [
  { path: 'nova', loadComponent: formulario, canDeactivate: [confirmarSaidaFormulario] },
  { path: ':id/editar', loadComponent: formulario, canDeactivate: [confirmarSaidaFormulario] },
  { path: '', loadComponent: () => import('./unidades-organizacionais-lista.component').then((component) => component.UnidadesOrganizacionaisListaComponent) }
];
