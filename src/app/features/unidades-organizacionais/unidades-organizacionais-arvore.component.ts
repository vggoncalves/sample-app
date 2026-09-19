import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiRequestError } from '../../core/http/api-error.interceptor';
import { CapacidadesUnidade, NoArvoreUnidade, UnidadeOrganizacional } from './unidade-organizacional.models';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';

interface NoVisivel { no: NoArvoreUnidade; nivel: number; }
const SEM_CAPACIDADES: CapacidadesUnidade = { podeCriar: false, podeAlterar: false, podeAlterarSituacao: false };

@Component({
  selector: 'app-unidades-organizacionais-arvore',
  imports: [CommonModule, RouterLink],
  templateUrl: './unidades-organizacionais-arvore.component.html',
  styleUrl: './unidades-organizacionais-arvore.component.scss'
})
export class UnidadesOrganizacionaisArvoreComponent {
  readonly carregando = signal(true);
  readonly mensagemErro = signal('');
  readonly mensagemAviso = signal('');
  readonly nos = signal<NoArvoreUnidade[]>([]);
  readonly capacidades = signal<CapacidadesUnidade>(SEM_CAPACIDADES);
  readonly expandidos = signal(new Set<string>());
  readonly alterandoId = signal<string | null>(null);
  readonly filtroAtiva = signal<'todas' | 'ativas' | 'inativas'>('todas');

  private readonly service = inject(UnidadeOrganizacionalService);

  constructor() { this.carregar(); this.carregarCapacidades(); }

  get nosVisiveis(): NoVisivel[] { return this.achatar(this.nos()); }

  carregar(): void {
    this.carregando.set(true); this.mensagemErro.set(''); this.mensagemAviso.set('');
    const ativa = this.filtroAtiva() === 'todas' ? undefined : this.filtroAtiva() === 'ativas';
    this.service.arvore({ ativa, profundidade: 5 }).subscribe({
      next: (nos) => { this.nos.set(nos); this.expandidos.set(new Set(nos.map((no) => no.unidade.id))); this.carregando.set(false); },
      error: (error: unknown) => { this.mensagemErro.set(this.mensagem(error, 'Não foi possível carregar a árvore organizacional.')); this.carregando.set(false); }
    });
  }

  alternar(no: NoArvoreUnidade): void {
    if (!no.filhas.length) return;
    this.expandidos.update((atual) => { const proximo = new Set(atual); proximo.has(no.unidade.id) ? proximo.delete(no.unidade.id) : proximo.add(no.unidade.id); return proximo; });
  }

  alterarSituacao(unidade: UnidadeOrganizacional): void {
    this.mensagemAviso.set(''); this.mensagemErro.set('');
    const acao = unidade.ativa ? 'desativar' : 'reativar';
    if (!window.confirm(`${acao[0].toUpperCase() + acao.slice(1)} ${unidade.nome}? A unidade não será apagada.`)) return;
    this.alterandoId.set(unidade.id);
    this.service.alterarSituacao(unidade.id, { ativa: !unidade.ativa, versao: unidade.versao }).subscribe({
      next: (atualizada) => { this.substituirUnidade(atualizada); this.mensagemAviso.set(`Unidade ${atualizada.ativa ? 'reativada' : 'desativada'} com sucesso.`); this.alterandoId.set(null); },
      error: (error: unknown) => { this.mensagemAviso.set(this.mensagemSituacao(error, unidade)); this.alterandoId.set(null); }
    });
  }

  rotuloTipo(tipo: string): string { return ({ INSTITUICAO: $localize`:@@unidades.tipo.instituicao:Instituição`, DIRETORIA: $localize`:@@unidades.tipo.diretoria:Diretoria`, DEPARTAMENTO: $localize`:@@unidades.tipo.departamento:Departamento`, COORDENACAO: $localize`:@@unidades.tipo.coordenacao:Coordenação`, REGIONAL: $localize`:@@unidades.tipo.regional:Regional`, FILIAL: $localize`:@@unidades.tipo.filial:Filial`, UNIDADE_ATENDIMENTO: $localize`:@@unidades.tipo.unidadeAtendimento:Unidade de atendimento`, OUTRA: $localize`:@@unidades.tipo.outra:Outra` } as Record<string, string>)[tipo] ?? tipo; }
rotuloSituacao(ativa: boolean): string {    return ativa ? $localize`:@@unidades.arvore.situacao.ativa:Ativa` : $localize`:@@unidades.arvore.situacao.inativa:Inativa`;  }

  private carregarCapacidades(): void {
    this.service.capacidades().subscribe({ next: (capacidades) => this.capacidades.set(capacidades), error: () => this.capacidades.set(SEM_CAPACIDADES) });
  }

  private achatar(nos: NoArvoreUnidade[], nivel = 1, resultado: NoVisivel[] = []): NoVisivel[] {
    for (const no of nos) { resultado.push({ no, nivel }); if (this.expandidos().has(no.unidade.id)) this.achatar(no.filhas, nivel + 1, resultado); }
    return resultado;
  }

  private substituirUnidade(atualizada: UnidadeOrganizacional): void {
    const substituir = (nos: NoArvoreUnidade[]): NoArvoreUnidade[] => nos.map((no) => ({ unidade: no.unidade.id === atualizada.id ? atualizada : no.unidade, filhas: substituir(no.filhas) }));
    this.nos.update(substituir);
  }

  private mensagemSituacao(error: unknown, unidade: UnidadeOrganizacional): string {
    if (error instanceof ApiRequestError) {
      const codigo = error.errors[0]?.codigoErro;
      if (codigo === 'UNIDADE-0007') return `Não foi possível desativar ${unidade.nome}, pois existem unidades descendentes ativas. Desative ou reorganize as descendentes antes de tentar novamente.`;
      if (codigo === 'UNIDADE-0013') return `Não foi possível reativar ${unidade.nome}, pois sua unidade pai está inativa.`;
      if (codigo === 'UNIDADE-0009') return 'Esta unidade foi alterada por outra pessoa. Recarregue a árvore antes de tentar novamente.';
      return error.message;
    }
    return 'Não foi possível alterar a situação da unidade. Tente novamente.';
  }

  private mensagem(error: unknown, padrao: string): string { return error instanceof ApiRequestError ? error.message : padrao; }
}
