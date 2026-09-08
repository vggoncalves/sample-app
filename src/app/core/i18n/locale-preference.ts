export const LOCALES_SUPORTADOS = ['pt-BR', 'en', 'es', 'fr', 'ar', 'hi', 'zh-Hans'] as const;

export type LocaleSuportado = typeof LOCALES_SUPORTADOS[number];

export const CHAVE_PREFERENCIA_LOCALE = 'sample.locale';

export function resolverLocale(preferencia: string | null | undefined, idiomas: readonly string[]): LocaleSuportado {
  const candidatoPersistido = localeSuportado(preferencia);
  if (candidatoPersistido) {
    return candidatoPersistido;
  }
  for (const idioma of idiomas) {
    const candidato = localeSuportado(idioma);
    if (candidato) {
      return candidato;
    }
  }
  return 'pt-BR';
}

export function localeSuportado(valor: string | null | undefined): LocaleSuportado | undefined {
  if (!valor) {
    return undefined;
  }
  const normalizado = valor.replace('_', '-').toLowerCase();
  return LOCALES_SUPORTADOS.find((locale) => locale.toLowerCase() === normalizado
    || locale.split('-')[0] === normalizado.split('-')[0]);
}

export function rotaDoLocale(locale: LocaleSuportado, caminho: string, busca = '', hash = ''): string {
  const semLocale = caminho.replace(/^\/(pt-BR|en|es|fr|ar|hi|zh-Hans)(?=\/|$)/, '') || '/';
  return `/${locale}${semLocale}${busca}${hash}`;
}
