import { Component, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { CHAVE_PREFERENCIA_LOCALE, LOCALES_SUPORTADOS, LocaleSuportado, localeSuportado, rotaDoLocale } from './locale-preference';

const NOMES_NATIVOS: Record<LocaleSuportado, string> = {
  'pt-BR': 'Português (Brasil)', en: 'English', es: 'Español', fr: 'Français',
  ar: 'العربية', hi: 'हिन्दी', 'zh-Hans': '简体中文'
};

@Component({
  selector: 'app-locale-selector',
  template: `
    <label class="locale-label">Idioma
      <select [value]="localeAtual()" (change)="alterar($event)">
        @for (locale of locales; track locale) { <option [value]="locale">{{ nomesNativos[locale] }}</option> }
      </select>
    </label>
    <span class="visually-hidden">A alteração recarrega a interface no idioma selecionado.</span>
  `,
  styleUrl: './locale-selector.component.scss'
})
export class LocaleSelectorComponent {
  readonly locales = LOCALES_SUPORTADOS;
  readonly nomesNativos = NOMES_NATIVOS;
  readonly localeAtual = signal<LocaleSuportado>(localeSuportado(inject(DOCUMENT).documentElement.lang) ?? 'pt-BR');

  alterar(evento: Event): void {
    const locale = (evento.target as HTMLSelectElement).value as LocaleSuportado;
    if (!LOCALES_SUPORTADOS.includes(locale)) {
      return;
    }
    localStorage.setItem(CHAVE_PREFERENCIA_LOCALE, locale);
    window.location.assign(rotaDoLocale(locale, window.location.pathname, window.location.search, window.location.hash));
  }
}
