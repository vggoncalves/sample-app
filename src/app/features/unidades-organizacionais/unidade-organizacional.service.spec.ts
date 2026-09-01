import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';

describe('UnidadeOrganizacionalService', () => {
  let service: UnidadeOrganizacionalService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UnidadeOrganizacionalService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('serializa filtros, paginação e ordenação para o contrato da API', () => {
    service.listar({ nome: 'Financeiro', ativa: true, pn: 2, ps: 10, sort: '-nome,codigo' }).subscribe();
    const request = http.expectOne((candidate) => candidate.url.endsWith('/unidadesOrganizacionais'));
    expect(request.request.params.get('nome')).toBe('Financeiro');
    expect(request.request.params.get('ativa')).toBe('true');
    expect(request.request.params.get('pn')).toBe('2');
    expect(request.request.params.get('ps')).toBe('10');
    expect(request.request.params.get('sort')).toBe('-nome,codigo');
    request.flush({ conteudo: [], pn: 2, ps: 10, totalElementos: 0, totalPaginas: 0 });
  });

  it('não envia filtros vazios', () => {
    service.listar({ nome: '', pn: 0 }).subscribe();
    const request = http.expectOne((candidate) => candidate.url.endsWith('/unidadesOrganizacionais'));
    expect(request.request.params.has('nome')).toBe(false);
    expect(request.request.params.get('pn')).toBe('0');
    request.flush({ conteudo: [], pn: 0, ps: 20, totalElementos: 0, totalPaginas: 0 });
  });
});
