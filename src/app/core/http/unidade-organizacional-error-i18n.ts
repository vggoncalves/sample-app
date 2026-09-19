import type { ApiFieldError } from './api-error.interceptor';

const MENSAGENS_POR_CODIGO: Record<string, string> = {
  'UNIDADE-0001': $localize`:@@unidades.erro.0001:Já existe uma unidade organizacional com este código.`,
  'UNIDADE-0002': $localize`:@@unidades.erro.0002:Verifique o valor informado.`,
  'UNIDADE-0003': $localize`:@@unidades.erro.0003:Unidade organizacional não encontrada.`,
  'UNIDADE-0004': $localize`:@@unidades.erro.0004:A hierarquia não pode conter ciclos.`,
  'UNIDADE-0005': $localize`:@@unidades.erro.0005:A unidade pai informada não existe.`,
  'UNIDADE-0006': $localize`:@@unidades.erro.0006:Uma unidade ativa não pode ter uma unidade pai inativa.`,
  'UNIDADE-0007': $localize`:@@unidades.erro.0007:Não é possível desativar uma unidade com descendentes ativos.`,
  'UNIDADE-0008': $localize`:@@unidades.erro.0008:Os parâmetros da consulta são inválidos.`,
  'UNIDADE-0009': $localize`:@@unidades.erro.0009:Esta unidade foi alterada por outra pessoa. Atualize os dados e tente novamente.`,
  'UNIDADE-0013': $localize`:@@unidades.erro.0013:Não é possível reativar uma unidade sob uma unidade pai inativa.`,
  'UNIDADE-0014': $localize`:@@unidades.erro.0014:A profundidade da árvore informada é inválida.`,
  'UNIDADE-0015': $localize`:@@unidades.erro.0015:A árvore excede o limite permitido para consulta.`
};

const MENSAGENS_POR_CAMPO: Record<string, string> = {
  'UNIDADE-0002:codigo': $localize`:@@unidades.erro.0002.codigo:Informe um código válido.`,
  'UNIDADE-0002:nome': $localize`:@@unidades.erro.0002.nome:Informe um nome válido.`,
  'UNIDADE-0002:sigla': $localize`:@@unidades.erro.0002.sigla:Informe uma sigla válida.`,
  'UNIDADE-0002:descricao': $localize`:@@unidades.erro.0002.descricao:Informe uma descrição válida.`,
  'UNIDADE-0002:tipo': $localize`:@@unidades.erro.0002.tipo:Selecione um tipo válido.`,
  'UNIDADE-0002:unidadePaiId': $localize`:@@unidades.erro.0002.unidadePaiId:Selecione uma unidade pai válida.`,
  'UNIDADE-0002:emailContato': $localize`:@@unidades.erro.0002.emailContato:Informe um e-mail de contato válido.`,
  'UNIDADE-0002:telefone': $localize`:@@unidades.erro.0002.telefone:Informe um telefone válido.`
};

export function mensagemErroUnidade(erro: ApiFieldError | undefined, padrao: string): string {
  if (!erro?.codigoErro) return padrao;
  return MENSAGENS_POR_CAMPO[`${erro.codigoErro}:${erro.campo ?? ''}`] ?? MENSAGENS_POR_CODIGO[erro.codigoErro] ?? padrao;
}

export function mensagemRequisicaoUnidade(
  error: { message: string; correlationId?: string; errors: ApiFieldError[] }, padrao: string
): string {
  const mensagem = mensagemErroUnidade(error.errors[0], error.message || padrao);
  return error.correlationId
    ? $localize`:@@unidades.erro.correlationId:${mensagem}:mensagem:. Código de atendimento: ${error.correlationId}:correlationId:.`
    : mensagem;
}
