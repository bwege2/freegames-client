// @ts-nocheck
// COW 3.3.3 censor.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { struct_profanity } from './structs.ts';
import { $cs, $rd, $sarrOf, $u64, $wr, P, __ctype_b_loc, strlen, tolower, toupper } from '../rt/index.ts';
import { NOT_FOUND, NUM_CURSES, REPLACE_STR_LEN, _ISalpha } from './consts.ts';

let curseWords: any;
let replacementChars: any;

export function initSkipArray(word: Ptr | null, skip: Ptr | null): void {
  let i = 0;
  let wordLen = strlen(word) | 0;
  for (i = 0; i < 128; ++i) {
    skip.a[skip.o + i] = wordLen;
  }
  for (i = 0; i < wordLen; ++i) {
    skip.a[skip.o + word.a[word.o + i]] = wordLen - i - 1;
    if ((toupper(word.a[word.o + i]) & ~127) === 0) {
      skip.a[skip.o + toupper(word.a[word.o + i])] = skip.a[skip.o + word.a[word.o + i]];
    }
  }
}

export function initCensoring(): void {
  let i = 0;
  for (i = 0; i < NUM_CURSES; ++i) {
    initSkipArray(P(curseWords[i].badWord), P(curseWords[i].skip));
  }
}

function search(word: Ptr | null, text: Ptr | null, skip: Ptr | null): number {
  let i = 0;
  let j = 0;
  let wordLen = strlen(word) | 0;
  let textLen = strlen(text) | 0;
  for (i = j = wordLen - 1; j >= 0; --i, --j) {
    while (tolower(text.a[text.o + i]) !== word.a[word.o + j]) {
      let t = skip.a[skip.o + text.a[text.o + i]];
      i += wordLen - j > t ? wordLen - j : t;
      if (i >= textLen) {
        return NOT_FOUND;
      }
      j = wordLen - 1;
    }
  }
  return i + 1;
}

export function censor(text: Ptr | null): Ptr | null {
  let i = 0;
  let j = 0;
  let t = strlen(text) - 1 | 0;
  let str = text;
  for (i = 0; i < NUM_CURSES; ++i) {
    text = str;
    while ((j = search(P(curseWords[i].badWord), text, P(curseWords[i].skip))) !== NOT_FOUND) {
      let k = 0;
      let l = 0;
      let wordBegin = 0;
      let wordEnd = 0;
      for (wordBegin = j; wordBegin > 0; --wordBegin) {
        if (!($rd($rd(__ctype_b_loc()), text.a[text.o + (wordBegin - 1)]) & _ISalpha)) {
          break;
        }
      }
      for (wordEnd = $u64(j) + strlen(P(curseWords[i].badWord)) - 1 | 0; wordEnd < t; ++wordEnd) {
        if (!($rd($rd(__ctype_b_loc()), text.a[text.o + (wordEnd + 1)]) & _ISalpha)) {
          break;
        }
      }
      if (!curseWords[i].beginningOnly || wordBegin === j) {
        for (k = wordBegin, l = 0; k <= wordEnd; ++k) {
          text.a[text.o + k] = replacementChars[l];
          if (++l >= REPLACE_STR_LEN) {
            l = 0;
          }
        }
      }
      text = text.add(wordEnd);
    }
  }
  return str;
}

export function $init(): void {
  curseWords = $sarrOf([struct_profanity.$of($cs("damn", 10), 0, new Int32Array(128)),
struct_profanity.$of($cs("fuck", 10), 0, new Int32Array(128)),
struct_profanity.$of($cs("bastard", 10), 0, new Int32Array(128)),
struct_profanity.$of($cs("shit", 10), 0, new Int32Array(128)),
struct_profanity.$of($cs("bitch", 10), 0, new Int32Array(128)),
struct_profanity.$of($cs("twat", 10), 1, new Int32Array(128)),
struct_profanity.$of($cs("cunt", 10), 0, new Int32Array(128)),
struct_profanity.$of($cs("dammit", 10), 0, new Int32Array(128))]);
  replacementChars = $cs("@#$%^&*%#$%@#$*&@%$%", 21);
}
