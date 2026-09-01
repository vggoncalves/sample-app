import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { AlterarSituacaoRequest, AlterarUnidadeRequest, CapacidadesUnidade, ConsultaArvoreUnidades, ConsultaUnidades, CriarUnidadeRequest, NoArvoreUnidade, PaginaUnidades, TokenCsrf, UnidadeOrganizacional } from './unidade-organizacional.models';

const UNIDADES_API_URL = '/api/unidadesOrganizacionais/v1.0.0/unidadesOrganizacionais';
const CSRF_URL = '/csrf';

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

  consultar(id: string): Observable<UnidadeOrganizacional> { return this.http.get<UnidadeOrganizacional>(`${UNIDADES_API_URL}/${id}`); }

  capacidades(): Observable<CapacidadesUnidade> { return this.http.get<CapacidadesUnidade>(`${UNIDADES_API_URL}/capacidades`); }

  arvore(consulta: ConsultaArvoreUnidades = {}): Observable<NoArvoreUnidade[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(consulta)) if (value !== undefined && value !== null) params = params.set(key, String(value));
    return this.http.get<NoArvoreUnidade[]>(`${UNIDADES_API_URL}/arvore`, { params });
  }

  alterarSituacao(id: string, request: AlterarSituacaoRequest): Observable<UnidadeOrganizacional> {
    return this.comTokenCsrf((headers) => this.http.patch<UnidadeOrganizacional>(`${UNIDADES_API_URL}/${id}`, request, { headers }));
  }

  criar(request: CriarUnidadeRequest): Observable<UnidadeOrganizacional> {
    return this.comTokenCsrf((headers) => this.http.post<UnidadeOrganizacional>(UNIDADES_API_URL, request, { headers }));
  }

  alterar(id: string, request: AlterarUnidadeRequest): Observable<UnidadeOrganizacional> {
    return this.comTokenCsrf((headers) => this.http.put<UnidadeOrganizacional>(`${UNIDADES_API_URL}/${id}`, request, { headers }));
  }

  private comTokenCsrf<T>(requisicao: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return this.http.get<TokenCsrf>(CSRF_URL).pipe(switchMap((csrf) => requisicao(new HttpHeaders({ [csrf.headerName]: csrf.token }))));
  }
}
