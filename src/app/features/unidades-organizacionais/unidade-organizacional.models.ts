export const TIPOS_UNIDADE = [
  'INSTITUICAO', 'DIRETORIA', 'DEPARTAMENTO', 'COORDENACAO', 'REGIONAL', 'FILIAL',
  'UNIDADE_ATENDIMENTO', 'OUTRA'
] as const;

export type TipoUnidade = typeof TIPOS_UNIDADE[number];
export type CampoOrdenacaoUnidade = 'codigo' | 'nome' | 'sigla' | 'tipo' | 'ativa' | 'criadoEm' | 'atualizadoEm';

export interface UnidadeOrganizacional {
  id: string; codigo: string; nome: string; sigla: string | null; descricao: string | null;
  tipo: TipoUnidade; unidadePaiId: string | null; emailContato: string | null; telefone: string | null;
  ativa: boolean; criadoEm: string; criadoPor: string; atualizadoEm: string; atualizadoPor: string; versao: number;
}

export interface PaginaUnidades {
  conteudo: UnidadeOrganizacional[]; pn: number; ps: number; totalElementos: number; totalPaginas: number;
}

export interface ConsultaUnidades {
  codigo?: string; nome?: string; sigla?: string; tipo?: TipoUnidade; ativa?: boolean; raiz?: boolean;
  pn?: number; ps?: number; sort?: string;
}

export interface CriarUnidadeRequest {
  codigo: string; nome: string; sigla: string | null; descricao: string | null; tipo: TipoUnidade;
  unidadePaiId: string | null; emailContato: string | null; telefone: string | null;
}

export interface AlterarUnidadeRequest extends Omit<CriarUnidadeRequest, 'codigo'> { versao: number; }

export interface TokenCsrf { headerName: string; parameterName: string; token: string; }

export interface NoArvoreUnidade { unidade: UnidadeOrganizacional; filhas: NoArvoreUnidade[]; }

export interface ConsultaArvoreUnidades { raizId?: string; ativa?: boolean; profundidade?: number; }

export interface CapacidadesUnidade { podeCriar: boolean; podeAlterar: boolean; podeAlterarSituacao: boolean; }

export interface AlterarSituacaoRequest { ativa: boolean; versao: number; }
