import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiRequestError } from '../../core/http/api-error.interceptor';
import { CampoOrdenacaoUnidade, PaginaUnidades, TIPOS_UNIDADE, TipoUnidade } from './unidade-organizacional.models';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';

type EstadoTela = 'carregando' | 'sucesso' | 'erro';

@Component({
  selector: 'app-unidades-organizacionais-lista',
  imports: [CommonModule, FormsModule],
  templateUrl: './unidades-organizacionais-lista.component.html',
  styleUrl: './unidades-organizacionais-lista.component.scss'
})
export class UnidadesOrganizacionaisListaComponent {
  readonly tipos = TIPOS_UNIDADE;
  readonly pagina = signal<PaginaUnidades | null>(null);
  readonly estado = signal<EstadoTela>('carregando');
  readonly mensagemErro = signal('');
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

  constructor() { this.carregar(); }

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

  rotuloTipo(tipo: TipoUnidade): string { return tipo.replaceAll('_', ' ').toLowerCase().replace(/(^| )\S/g, (letra) => letra.toUpperCase()); }
  rotuloOrdenacao(campo: CampoOrdenacaoUnidade): string {
    if (this.campoOrdenacao() !== campo) return 'Não ordenado';
    return this.direcaoDescendente() ? 'Ordem decrescente' : 'Ordem crescente';
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
        this.mensagemErro.set(error instanceof ApiRequestError ? error.message : 'Não foi possível carregar as unidades organizacionais. Tente novamente.');
        this.estado.set('erro');
      }
    });
  }
}
