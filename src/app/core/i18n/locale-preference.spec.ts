import { describe, expect, it } from 'vitest';

import { resolverLocale, rotaDoLocale } from './locale-preference';

describe('preferência de locale', () => {
  it('prioriza preferência persistida sobre idiomas do navegador', () => {
    expect(resolverLocale('fr', ['es-ES', 'pt-BR'])).toBe('fr');
  });

  it('seleciona o primeiro idioma de navegador suportado e recua para pt-BR', () => {
    expect(resolverLocale(null, ['ar-EG', 'en-US'])).toBe('ar');
    expect(resolverLocale(null, ['de-DE'])).toBe('pt-BR');
  });

  it('troca o prefixo do locale preservando rota, busca e hash', () => {
    expect(rotaDoLocale('es', '/pt-BR/administracao/unidades', '?pn=0', '#lista'))
      .toBe('/es/administracao/unidades?pn=0#lista');
  });
});
