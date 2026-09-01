import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { ApiRequestError } from '../../core/http/api-error.interceptor';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';
import { UnidadesOrganizacionaisListaComponent } from './unidades-organizacionais-lista.component';

const pagina = { conteudo: [{ id: '1', codigo: 'DIR-FIN', nome: 'Diretoria Financeira', sigla: 'DF', descricao: null, tipo: 'DIRETORIA' as const, unidadePaiId: null, emailContato: null, telefone: null, ativa: true, criadoEm: '', criadoPor: '', atualizadoEm: '', atualizadoPor: '', versao: 0 }], pn: 0, ps: 20, totalElementos: 1, totalPaginas: 1 };

async function criarComponente(listar: UnidadeOrganizacionalService['listar']) {
  await TestBed.configureTestingModule({
    imports: [UnidadesOrganizacionaisListaComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      { provide: UnidadeOrganizacionalService, useValue: { listar } }
    ]
  }).compileComponents();
  const fixture = TestBed.createComponent(UnidadesOrganizacionaisListaComponent);
  fixture.detectChanges();
  return fixture;
}

describe('UnidadesOrganizacionaisListaComponent', () => {
  it('exibe unidades retornadas pela API', async () => {
    const fixture = await criarComponente(() => of(pagina));
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Diretoria Financeira');
  });

  it('anuncia carregamento usando o elemento output', async () => {
    const fixture = await criarComponente(() => NEVER);
    const output = (fixture.nativeElement as HTMLElement).querySelector('output.state');
    expect(output?.textContent).toContain('Carregando unidades organizacionais');
    expect(output?.getAttribute('aria-live')).toBe('polite');
  });

  it('apresenta o estado vazio', async () => {
    const fixture = await criarComponente(() => of({ ...pagina, conteudo: [], totalElementos: 0, totalPaginas: 0 }));
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nenhuma unidade encontrada');
  });

  it('apresenta uma mensagem compreensível em caso de falha', async () => {
    const fixture = await criarComponente(() => throwError(() => new Error('Falha simulada')));
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Não foi possível carregar as unidades organizacionais');
  });

  it('informa os três estados de ordenação', async () => {
    const fixture = await criarComponente(() => of(pagina));
    const component = fixture.componentInstance;
    expect(component.rotuloOrdenacao('codigo')).toBe('Não ordenado');
    component.campoOrdenacao.set('codigo');
    expect(component.rotuloOrdenacao('codigo')).toBe('Ordem crescente');
    component.direcaoDescendente.set(true);
    expect(component.rotuloOrdenacao('codigo')).toBe('Ordem decrescente');
  });

  it('aplica filtros, ordenação, paginação e limpeza', async () => {
    const consultas: unknown[] = [];
    const fixture = await criarComponente((consulta) => {
      consultas.push(consulta);
      return of({ ...pagina, totalPaginas: 2 });
    });
    const component = fixture.componentInstance;
    component.filtroNome = 'Financeiro';
    component.filtroAtiva = 'true';
    component.aplicarFiltros();
    expect(consultas.at(-1)).toMatchObject({ nome: 'Financeiro', ativa: true, pn: 0 });

    component.ordenar('codigo');
    expect(consultas.at(-1)).toMatchObject({ sort: 'codigo,codigo' });
    component.ordenar('codigo');
    expect(consultas.at(-1)).toMatchObject({ sort: '-codigo,codigo' });

    component.irParaPagina(-1);
    component.irParaPagina(1);
    expect(consultas.at(-1)).toMatchObject({ pn: 1 });

    component.limparFiltros();
    expect(component.filtroNome).toBe('');
    expect(component.filtroAtiva).toBe('');
  });

  it('preserva a mensagem de erro segura produzida pelo interceptor', async () => {
    const fixture = await criarComponente(() => throwError(() => new ApiRequestError('Sessão expirada', 401)));
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sessão expirada');
  });

  it('formata tipos compostos para exibição', async () => {
    const fixture = await criarComponente(() => of(pagina));
    expect(fixture.componentInstance.rotuloTipo('UNIDADE_ATENDIMENTO')).toBe('Unidade Atendimento');
  });
});
