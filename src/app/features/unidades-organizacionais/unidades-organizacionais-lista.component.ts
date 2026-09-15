import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiRequestError } from '../../core/http/api-error.interceptor';
import { CampoOrdenacaoUnidade, CapacidadesUnidade, PaginaUnidades, TIPOS_UNIDADE, TipoUnidade } from './unidade-organizacional.models';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';

type EstadoTela = 'carregando' | 'sucesso' | 'erro';

@Component({
  selector: 'app-unidades-organizacionais-lista',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './unidades-organizacionais-lista.component.html',
  styleUrl: './unidades-organizacionais-lista.component.scss'
})
export class UnidadesOrganizacionaisListaComponent {
  readonly tipos = TIPOS_UNIDADE;
  readonly pagina = signal<PaginaUnidades | null>(null);
  readonly estado = signal<EstadoTela>('carregando');
  readonly mensagemErro = signal('');
  readonly mensagemSucesso = signal('');
  readonly capacidades = signal<CapacidadesUnidade>({ podeCriar: false, podeAlterar: false, podeAlterarSituacao: false });
  readonly campoOrdenacao = signal<CampoOrdenacaoUnidade>('nome');
  readonly direcaoDescendente = signal(false);

  filtroNome = '';
  filtroCodigo = '';
  filtroSigla = '';
  filtroTipo = '' as TipoUnidade | '';
  filtroAtiva = '' as '' | 'true' | 'false';
  filtroRaiz = '' as '' | 'true' | 'false';

  private readonly service = inject(UnidadeOrganizacionalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.service.capacidades().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (capacidades) => this.capacidades.set(capacidades) });
    const sucesso = this.route.snapshot.queryParamMap.get('sucesso');
    if (sucesso) this.mensagemSucesso.set(sucesso === 'alterada' ? $localize`:@@unidades.lista.sucesso.alterada:Unidade organizacional alterada com sucesso.` : $localize`:@@unidades.lista.sucesso.criada:Unidade organizacional cadastrada com sucesso.`);
    this.carregar();
  }

  aplicarFiltros(): void { this.carregar(0); }

  limparFiltros(): void {
    this.filtroNome = ''; this.filtroCodigo = ''; this.filtroSigla = ''; this.filtroTipo = '';
    this.filtroAtiva = ''; this.filtroRaiz = ''; this.carregar(0);
  }

  ordenar(campo: CampoOrdenacaoUnidade): void {
    this.direcaoDescendente.set(this.campoOrdenacao() === campo ? !this.direcaoDescendente() : false);
    this.campoOrdenacao.set(campo);
    this.carregar(0);
  }

  irParaPagina(pn: number): void {
    if (pn >= 0 && (!this.pagina() || pn < this.pagina()!.totalPaginas)) this.carregar(pn);
  }

  rotuloTipo(tipo: TipoUnidade): string {
    const rotulos: Record<TipoUnidade, string> = {
      INSTITUICAO: $localize`:@@unidades.tipo.instituicao:Instituição`,
      DIRETORIA: $localize`:@@unidades.tipo.diretoria:Diretoria`,
      DEPARTAMENTO: $localize`:@@unidades.tipo.departamento:Departamento`,
      COORDENACAO: $localize`:@@unidades.tipo.coordenacao:Coordenação`,
      REGIONAL: $localize`:@@unidades.tipo.regional:Regional`,
      FILIAL: $localize`:@@unidades.tipo.filial:Filial`,
      UNIDADE_ATENDIMENTO: $localize`:@@unidades.tipo.unidadeAtendimento:Unidade de atendimento`,
      OUTRA: $localize`:@@unidades.tipo.outra:Outra`
    };
    return rotulos[tipo];
  }
  rotuloOrdenacao(campo: CampoOrdenacaoUnidade): string {
    if (this.campoOrdenacao() !== campo) return $localize`:@@unidades.lista.ordenacao.naoOrdenado:Não ordenado`;
    return this.direcaoDescendente()
      ? $localize`:@@unidades.lista.ordenacao.decrescente:Ordem decrescente`
      : $localize`:@@unidades.lista.ordenacao.crescente:Ordem crescente`;
  }

  rotuloAcaoOrdenar(campo: CampoOrdenacaoUnidade): string {
    return $localize`:@@unidades.lista.ordenar.aria:Ordenar por ${this.rotuloCampo(campo)}:campo:. ${this.rotuloOrdenacao(campo)}:ordenacao:.`;
  }

  rotuloSituacao(ativa: boolean): string {
    return ativa ? $localize`:@@unidades.lista.situacao.ativa:Ativa` : $localize`:@@unidades.lista.situacao.inativa:Inativa`;
  }

  private rotuloCampo(campo: CampoOrdenacaoUnidade): string {
    const rotulos: Partial<Record<CampoOrdenacaoUnidade, string>> = {
      codigo: $localize`:@@unidades.lista.campo.codigo:Código`,
      nome: $localize`:@@unidades.lista.campo.nome:Nome`,
      sigla: $localize`:@@unidades.lista.campo.sigla:Sigla`,
      tipo: $localize`:@@unidades.lista.campo.tipo:Tipo`,
      ativa: $localize`:@@unidades.lista.campo.situacao:Situação`
    };
    return rotulos[campo] ?? campo;
  }

  private carregar(pn = 0): void {
    this.estado.set('carregando'); this.mensagemErro.set('');
    const sort = `${this.direcaoDescendente() ? '-' : ''}${this.campoOrdenacao()},codigo`;
    this.service.listar({
      nome: this.filtroNome, codigo: this.filtroCodigo, sigla: this.filtroSigla, tipo: this.filtroTipo || undefined,
      ativa: this.filtroAtiva === '' ? undefined : this.filtroAtiva === 'true',
      raiz: this.filtroRaiz === '' ? undefined : this.filtroRaiz === 'true', pn, ps: 20, sort
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (pagina) => { this.pagina.set(pagina); this.estado.set('sucesso'); },
      error: (error: unknown) => {
        this.pagina.set(null);
        this.mensagemErro.set(error instanceof ApiRequestError ? error.message : $localize`:@@unidades.lista.erro.carregar:Não foi possível carregar as unidades organizacionais. Tente novamente.`);
        this.estado.set('erro');
      }
    });
  }
}
