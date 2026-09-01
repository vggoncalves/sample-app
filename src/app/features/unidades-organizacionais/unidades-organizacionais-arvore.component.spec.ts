import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApiRequestError } from '../../core/http/api-error.interceptor';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';
import { UnidadesOrganizacionaisArvoreComponent } from './unidades-organizacionais-arvore.component';

const unidade = { id: 'raiz', codigo: 'RAIZ', nome: 'Instituição', sigla: null, descricao: null, tipo: 'INSTITUICAO' as const, unidadePaiId: null, emailContato: null, telefone: null, ativa: true, criadoEm: '', criadoPor: '', atualizadoEm: '', atualizadoPor: '', versao: 2 };
const arvore = [{ unidade, filhas: [{ unidade: { ...unidade, id: 'filha', codigo: 'FILHA', nome: 'Filha', unidadePaiId: 'raiz' }, filhas: [] }] }];

describe('UnidadesOrganizacionaisArvoreComponent', () => {
  async function criar(capacidades = { podeCriar: true, podeAlterar: true, podeAlterarSituacao: true }) {
    const service = { arvore: vi.fn(() => of(arvore)), capacidades: vi.fn(() => of(capacidades)), alterarSituacao: vi.fn() };
    await TestBed.configureTestingModule({ imports: [UnidadesOrganizacionaisArvoreComponent], providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } }, { provide: UnidadeOrganizacionalService, useValue: service }] }).compileComponents();
    const fixture = TestBed.createComponent(UnidadesOrganizacionaisArvoreComponent); fixture.detectChanges();
    return { fixture, service };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('exibe a hierarquia e permite recolher um ramo', async () => {
    const { fixture } = await criar();
    expect(fixture.nativeElement.textContent).toContain('Filha');
    fixture.componentInstance.alternar(arvore[0]); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('FILHA');
  });

  it('não mostra ações protegidas sem a capacidade correspondente', async () => {
    const { fixture } = await criar({ podeCriar: false, podeAlterar: false, podeAlterarSituacao: false });
    expect(fixture.nativeElement.textContent).not.toContain('Editar');
    expect(fixture.nativeElement.textContent).not.toContain('Desativar');
  });

  it('mantém um aviso acessível quando a desativação é bloqueada por descendente ativo', async () => {
    const { fixture, service } = await criar();
    service.alterarSituacao.mockReturnValue(throwError(() => new ApiRequestError('Bloqueada', 409, undefined, [{ codigoErro: 'UNIDADE-0007', campo: 'ativa', erro: 'Bloqueada' }])));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.alterarSituacao(unidade); fixture.detectChanges();
    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta?.textContent).toContain('unidades descendentes ativas');
  });
});
