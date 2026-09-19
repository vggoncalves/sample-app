import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApiRequestError } from '../../core/http/api-error.interceptor';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';
import { UnidadesOrganizacionaisFormularioComponent } from './unidades-organizacionais-formulario.component';

const unidadeEdicao = { id: 'id-1', codigo: 'DIR', nome: 'Diretoria', sigla: null, descricao: null, tipo: 'DIRETORIA' as const, unidadePaiId: null, emailContato: null, telefone: null, ativa: true, criadoEm: '', criadoPor: '', atualizadoEm: '', atualizadoPor: '', versao: 3 };

describe('UnidadesOrganizacionaisFormularioComponent', () => {
  let fixture: ComponentFixture<UnidadesOrganizacionaisFormularioComponent>;
  let component: UnidadesOrganizacionaisFormularioComponent;
  let service: { listar: ReturnType<typeof vi.fn>; consultar: ReturnType<typeof vi.fn>; criar: ReturnType<typeof vi.fn>; alterar: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  async function configurar(id: string | null = null): Promise<void> {
    service = { listar: vi.fn(() => of({ conteudo: id ? [unidadeEdicao] : [], pn: 0, ps: 100, totalElementos: id ? 1 : 0, totalPaginas: id ? 1 : 0 })), consultar: vi.fn(() => of(unidadeEdicao)), criar: vi.fn(), alterar: vi.fn() };
    router = { navigate: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [UnidadesOrganizacionaisFormularioComponent],
      providers: [
        { provide: UnidadeOrganizacionalService, useValue: service },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (nome: string) => nome === 'id' ? id : null } } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(UnidadesOrganizacionaisFormularioComponent);
    component = fixture.componentInstance; fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('valida os campos obrigatórios antes de salvar', async () => {
    await configurar(); component.salvar();
    expect(component.formulario.controls.codigo.touched).toBe(true);
    expect(service.criar).not.toHaveBeenCalled();
  });

  it('cria uma unidade com campos opcionais normalizados', async () => {
    await configurar(); service.criar.mockReturnValue(of({}));
    component.formulario.setValue({ codigo: 'DIR-FIN', nome: 'Diretoria Financeira', sigla: ' DF ', descricao: '', tipo: 'DIRETORIA', unidadePaiId: '', emailContato: 'financeiro@example.com', telefone: '+5511999999999' });
    component.salvar();
    expect(service.criar).toHaveBeenCalledWith(expect.objectContaining({ codigo: 'DIR-FIN', sigla: 'DF', descricao: null, emailContato: 'financeiro@example.com' }));
    expect(router.navigate).toHaveBeenCalledWith(['/administracao/unidades'], { queryParams: { sucesso: 'criada' } });
  });

  it('exibe no campo a regra de negócio devolvida pela API', async () => {
    await configurar(); service.criar.mockReturnValue(throwError(() => new ApiRequestError('Código já utilizado.', 409, undefined, [{ campo: 'codigo', codigoErro: 'UNIDADE-0001', erro: 'Código já utilizado.' }])));
    component.formulario.setValue({ codigo: 'DIR-FIN', nome: 'Diretoria Financeira', sigla: '', descricao: '', tipo: 'DIRETORIA', unidadePaiId: '', emailContato: '', telefone: '' });
    component.salvar();
    expect(component.mensagemCampo('codigo')).toBe('Já existe uma unidade organizacional com este código.');
    expect(component.mensagemErro()).toBe('Revise os campos destacados.');
  });

  it('remove a própria unidade das opções de unidade pai na edição', async () => {
    await configurar('id-1');
    expect(component.formulario.controls.codigo.disabled).toBe(true);
    expect(component.unidadesPai()).not.toContainEqual(unidadeEdicao);
  });
});
