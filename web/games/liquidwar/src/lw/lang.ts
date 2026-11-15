// lw/lang.ts: src/lang.c: the strings in the chosen language (Automatic: from the LANG variable, which the
// page sets from the browser's language).

import { LANG_STRINGS } from './langdata.ts';
import { G } from './state.ts';

export const LW_LANG_LANGUAGE_AUTO = -1;
export const LW_LANG_LANGUAGE_ENGLISH = 0;
export const LW_LANG_LANGUAGE_FRANCAIS = 1;
export const LW_LANG_LANGUAGE_DEUTSCH = 2;
export const LW_LANG_LANGUAGE_DANSK = 3;
export const LW_LANG_LANGUAGE_POLSKI = 4;
export const LW_LANG_NB_LANGUAGES = 5;

/** getenv("LANG") */
export const env = { LANG: 'C' };

export function lw_lang_auto(): number {
  let language = LW_LANG_LANGUAGE_ENGLISH;
  const l = env.LANG;
  const p = l.slice(0, 2);
  if (p === 'DE' || p === 'de') language = LW_LANG_LANGUAGE_DEUTSCH;
  if (p === 'DK' || p === 'dk') language = LW_LANG_LANGUAGE_DANSK;
  if (p === 'FR' || p === 'fr') language = LW_LANG_LANGUAGE_FRANCAIS;
  if (p === 'PL' || p === 'pl') language = LW_LANG_LANGUAGE_POLSKI;
  return language;
}

export function lw_lang_string(id: number): string {
  const language = G.CONFIG_LANGUAGE === LW_LANG_LANGUAGE_AUTO ? lw_lang_auto() : G.CONFIG_LANGUAGE;
  return LANG_STRINGS[language]?.[id] ?? '???';
}

export function lw_lang_language(lang: number): string {
  return LANG_STRINGS[lang]?.[0] ?? '???';
}
