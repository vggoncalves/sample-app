import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsultaUnidades, PaginaUnidades } from './unidade-organizacional.models';

const UNIDADES_API_URL = '/api/unidadesOrganizacionais/v1.0.0/unidadesOrganizacionais';

@Injectable({ providedIn: 'root' })
export class UnidadeOrganizacionalService {
  private readonly http = inject(HttpClient);

  listar(consulta: ConsultaUnidades = {}): Observable<PaginaUnidades> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(consulta)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return this.http.get<PaginaUnidades>(UNIDADES_API_URL, { params });
  }
}
