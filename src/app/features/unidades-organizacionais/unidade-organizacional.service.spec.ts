import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CriarUnidadeRequest } from './unidade-organizacional.models';
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

  it('consulta unidade, capacidades e árvore pelos contratos da API', () => {
    service.consultar('id-1').subscribe();
    http.expectOne((candidate) => candidate.url.endsWith('/unidadesOrganizacionais/id-1')).flush({ id: 'id-1' });

    service.capacidades().subscribe();
    http.expectOne((candidate) => candidate.url.endsWith('/unidadesOrganizacionais/capacidades')).flush({ podeCriar: true, podeAlterar: false, podeAlterarSituacao: false });

    service.arvore({ ativa: true, profundidade: 3 }).subscribe();
    const request = http.expectOne((candidate) => candidate.url.endsWith('/unidadesOrganizacionais/arvore'));
    expect(request.request.params.get('ativa')).toBe('true');
    expect(request.request.params.get('profundidade')).toBe('3');
    request.flush([]);
  });

  it('obtém o token CSRF antes de criar uma unidade', () => {
    const unidade: CriarUnidadeRequest = { codigo: 'DIR-FIN', nome: 'Diretoria Financeira', sigla: 'DF', descricao: null, tipo: 'DIRETORIA', unidadePaiId: null, emailContato: 'financeiro@example.com', telefone: '+5511999999999' };
    service.criar(unidade).subscribe();
    http.expectOne('/csrf').flush({ headerName: 'X-CSRF-TOKEN', parameterName: '_csrf', token: 'token-de-teste' });
    const request = http.expectOne((candidate) => candidate.method === 'POST' && candidate.url.endsWith('/unidadesOrganizacionais'));
    expect(request.request.headers.get('X-CSRF-TOKEN')).toBe('token-de-teste');
    expect(request.request.body).toEqual(unidade);
    request.flush({ ...unidade, id: 'id-1', ativa: true, versao: 0 });
  });

  it('obtém o token CSRF antes de alterar uma unidade', () => {
    service.alterar('id-1', { nome: 'Financeiro', sigla: null, descricao: null, tipo: 'DIRETORIA', unidadePaiId: null, emailContato: null, telefone: null, versao: 2 }).subscribe();
    http.expectOne('/csrf').flush({ headerName: 'X-CSRF-TOKEN', parameterName: '_csrf', token: 'token-de-teste' });
    const request = http.expectOne((candidate) => candidate.method === 'PUT' && candidate.url.endsWith('/unidadesOrganizacionais/id-1'));
    expect(request.request.headers.get('X-CSRF-TOKEN')).toBe('token-de-teste');
    expect(request.request.body.versao).toBe(2);
    request.flush({});
  });

  it('obtém o token CSRF antes de alterar a situação da unidade', () => {
    service.alterarSituacao('id-1', { ativa: false, versao: 4 }).subscribe();
    http.expectOne('/csrf').flush({ headerName: 'X-CSRF-TOKEN', parameterName: '_csrf', token: 'token-de-teste' });
    const request = http.expectOne((candidate) => candidate.method === 'PATCH' && candidate.url.endsWith('/unidadesOrganizacionais/id-1'));
    expect(request.request.headers.get('X-CSRF-TOKEN')).toBe('token-de-teste');
    expect(request.request.body).toEqual({ ativa: false, versao: 4 });
    request.flush({});
  });

  it('não envia filtros vazios', () => {
    service.listar({ nome: '', pn: 0 }).subscribe();
    const request = http.expectOne((candidate) => candidate.url.endsWith('/unidadesOrganizacionais'));
    expect(request.request.params.has('nome')).toBe(false);
    expect(request.request.params.get('pn')).toBe('0');
    request.flush({ conteudo: [], pn: 0, ps: 20, totalElementos: 0, totalPaginas: 0 });
  });
});
