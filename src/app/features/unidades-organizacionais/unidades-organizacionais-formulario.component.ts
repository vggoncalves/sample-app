import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiRequestError } from '../../core/http/api-error.interceptor';
import { AlterarUnidadeRequest, CriarUnidadeRequest, TIPOS_UNIDADE, TipoUnidade, UnidadeOrganizacional } from './unidade-organizacional.models';
import { UnidadeOrganizacionalService } from './unidade-organizacional.service';

const CODIGO_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,49}$/;
const TELEFONE_PATTERN = /^\+[1-9]\d{7,14}$/;

@Component({
  selector: 'app-unidades-organizacionais-formulario',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './unidades-organizacionais-formulario.component.html',
  styleUrl: './unidades-organizacionais-formulario.component.scss'
})
export class UnidadesOrganizacionaisFormularioComponent {
  readonly tipos = TIPOS_UNIDADE;
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly mensagemErro = signal('');
  readonly unidadesPai = signal<UnidadeOrganizacional[]>([]);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly modoEdicao = this.id !== null;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UnidadeOrganizacionalService);
  private readonly router = inject(Router);
  private versao: number | null = null;

  readonly formulario = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(CODIGO_PATTERN)]],
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    sigla: ['', [Validators.maxLength(30)]],
    descricao: ['', [Validators.maxLength(500)]],
    tipo: ['', [Validators.required]],
    unidadePaiId: [''],
    emailContato: ['', [Validators.email, Validators.maxLength(254)]],
    telefone: ['', [Validators.pattern(TELEFONE_PATTERN), Validators.maxLength(32)]]
  });

  constructor() { this.inicializar(); }

  salvar(): void {
    this.mensagemErro.set('');
    if (this.formulario.invalid || this.salvando()) { this.formulario.markAllAsTouched(); return; }
    const dados = this.formulario.getRawValue();
    if (this.id && dados.unidadePaiId === this.id) {
      this.formulario.controls.unidadePaiId.setErrors({ propriaUnidade: true });
      return;
    }
    this.salvando.set(true);
    const requisicao = this.modoEdicao
      ? this.service.alterar(this.id!, this.paraAlteracao(dados))
      : this.service.criar(this.paraCriacao(dados));
    requisicao.subscribe({
      next: () => {
        this.formulario.markAsPristine();
        this.router.navigate(['/administracao/unidades'], { queryParams: { sucesso: this.modoEdicao ? 'alterada' : 'criada' } });
      },
      error: (error: unknown) => { this.aplicarErro(error); this.salvando.set(false); }
    });
  }

  confirmarSaida(): boolean {
    return !this.formulario.dirty || this.salvando() || window.confirm('Há alterações não salvas. Deseja sair desta tela?');
  }

  @HostListener('window:beforeunload', ['$event'])
  protegerSaida(event: BeforeUnloadEvent): void {
    if (this.formulario.dirty && !this.salvando()) event.preventDefault();
  }

  mensagemCampo(campo: string): string | null {
    const controle = this.formulario.controls[campo as keyof typeof this.formulario.controls];
    if (!controle.touched || !controle.errors) return null;
    if (controle.errors['required']) return 'Este campo é obrigatório.';
    if (controle.errors['minlength']) return `Informe ao menos ${controle.errors['minlength'].requiredLength} caracteres.`;
    if (controle.errors['maxlength']) return `Informe no máximo ${controle.errors['maxlength'].requiredLength} caracteres.`;
    if (controle.errors['email']) return 'Informe um e-mail válido.';
    if (controle.errors['pattern']) return campo === 'telefone' ? 'Use o formato internacional, por exemplo +5511999999999.' : 'Use letras, números, ponto, hífen ou sublinhado.';
    if (controle.errors['propriaUnidade']) return 'Uma unidade não pode ser sua própria unidade pai.';
    return controle.errors['api'] ?? null;
  }

  rotuloTipo(tipo: TipoUnidade): string { return tipo.replaceAll('_', ' ').toLowerCase().replace(/(^| )\S/g, (letra) => letra.toUpperCase()); }

  private inicializar(): void {
    this.service.listar({ ativa: true, ps: 100, sort: 'nome,codigo' }).subscribe({
      next: (pagina) => this.unidadesPai.set(pagina.conteudo.filter((unidade) => unidade.id !== this.id)),
      error: () => this.mensagemErro.set('Não foi possível carregar as opções de unidade pai. Tente novamente.')
    });
    if (!this.id) { this.carregando.set(false); return; }
    this.service.consultar(this.id).subscribe({
      next: (unidade) => {
        this.versao = unidade.versao;
        this.formulario.patchValue({
          codigo: unidade.codigo, nome: unidade.nome, sigla: unidade.sigla ?? '', descricao: unidade.descricao ?? '', tipo: unidade.tipo,
          unidadePaiId: unidade.unidadePaiId ?? '', emailContato: unidade.emailContato ?? '', telefone: unidade.telefone ?? ''
        });
        this.formulario.controls.codigo.disable();
        this.formulario.markAsPristine(); this.carregando.set(false);
      },
      error: (error: unknown) => { this.aplicarErro(error); this.carregando.set(false); }
    });
  }

  private paraCriacao(dados: ReturnType<typeof this.formulario.getRawValue>): CriarUnidadeRequest {
    return { codigo: dados.codigo.trim(), ...this.dadosBasicos(dados) };
  }

  private paraAlteracao(dados: ReturnType<typeof this.formulario.getRawValue>): AlterarUnidadeRequest {
    return { ...this.dadosBasicos(dados), versao: this.versao! };
  }

  private dadosBasicos(dados: ReturnType<typeof this.formulario.getRawValue>): Omit<CriarUnidadeRequest, 'codigo'> {
    return {
      nome: dados.nome.trim(), sigla: this.nuloSeVazio(dados.sigla), descricao: this.nuloSeVazio(dados.descricao),
      tipo: dados.tipo as TipoUnidade, unidadePaiId: this.nuloSeVazio(dados.unidadePaiId),
      emailContato: this.nuloSeVazio(dados.emailContato), telefone: this.nuloSeVazio(dados.telefone)
    };
  }

  private nuloSeVazio(valor: string): string | null { const normalizado = valor.trim(); return normalizado || null; }

  private aplicarErro(error: unknown): void {
    const mensagemPadrao = 'Não foi possível salvar a unidade organizacional. Tente novamente.';
    if (!(error instanceof ApiRequestError)) { this.mensagemErro.set(mensagemPadrao); return; }
    let erroDeCampo = false;
    for (const erro of error.errors) {
      const campo = erro.campo as keyof typeof this.formulario.controls | undefined;
      const controle = campo && this.formulario.controls[campo];
      if (controle && erro.erro) { controle.setErrors({ ...controle.errors, api: erro.erro }); controle.markAsTouched(); erroDeCampo = true; }
    }
    this.mensagemErro.set(erroDeCampo ? 'Revise os campos destacados.' : error.message);
  }
}
