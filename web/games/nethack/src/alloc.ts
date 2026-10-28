// @ts-nocheck
// NetHack 3.6.7 alloc.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { panic } from './end.ts';
import { $arr, P, S, sprintf, strcpy, strlen } from './rt/index.ts';
import { PTRBUFCNT } from './consts.ts';

let ptrbuf: any;
let ptrbufidx: number;

export async function alloc(lth: number): Promise<Ptr | null> {
  let ptr = null;
  ptr = P(new Int8Array(lth));
  if (!ptr) {
    await panic(S("Memory allocation failure; cannot get %u bytes"), lth);
  }
  return ptr;
}

export function fmt_ptr(ptr: any): Ptr | null {
  let buf = null;
  buf = P(ptrbuf[ptrbufidx]);
  if (++ptrbufidx >= PTRBUFCNT) {
    ptrbufidx = 0;
  }
  sprintf(buf, S("%06lx"), ptr);
  return buf;
}

export async function dupstr(string: Ptr | null): Promise<Ptr | null> {
  return strcpy(P(new Int8Array((strlen(string) + 1 >>> 0))), string);
}

export function $init(): void {
  ptrbuf = $arr(4, () => new Int8Array(32));
  ptrbufidx = 0;
}
