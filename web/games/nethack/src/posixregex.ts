// @ts-nocheck
// NetHack 3.6.7 ../sys/share/posixregex.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { struct_nhregex } from './structs.ts';
import { $cs, G, P, free, regcomp, regerror, regexec, regfree } from './rt/index.ts';
import { BUFSZ, FALSE, REG_EXTENDED, REG_NOSUB, TRUE, _REG_NOMATCH } from './consts.ts';

let regex_error_desc$buf: any;

export async function regex_init(): Promise<struct_nhregex | null> {
  return new struct_nhregex();
}

export function regex_compile(s: Ptr | null, re: struct_nhregex | null): number {
  if (!re) {
    return FALSE;
  }
  if (re.err = regcomp(re.re, s, REG_EXTENDED | REG_NOSUB)) {
    return FALSE;
  }
  return TRUE;
}

export function regex_error_desc(re: struct_nhregex | null): Ptr | null {
  if (!re || !re.err) {
    return null;
  }
  regerror(re.err, re.re, P(regex_error_desc$buf), BUFSZ);
  return P(regex_error_desc$buf);
}

export function regex_match(s: Ptr | null, re: struct_nhregex | null): number {
  let result = 0;
  if (!re || !s) {
    return FALSE;
  }
  if (result = regexec(re.re, s, 0, null, 0)) {
    if (result !== _REG_NOMATCH) {
      re.err = result;
    }
    return FALSE;
  }
  return TRUE;
}

export function regex_free(re: struct_nhregex | null): void {
  regfree(re.re);
  free(re);
}

export function $init(): void {
  G.regex_id = $cs("posixregex", 11);
  regex_error_desc$buf = new Int8Array(256);
}
