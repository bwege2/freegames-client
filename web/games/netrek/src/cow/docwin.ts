// @ts-nocheck
// COW 3.3.3 docwin.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { findfile, getdefault } from './defaults.ts';
import { W_ClearWindow, W_IsMapped, W_MakeWindow, W_MapWindow, W_WriteText } from './x11window.ts';
import { struct_list } from './structs.ts';
import { $u64, G, P, S, fclose, fgets, fopen, printf, snprintf, strcpy, strlen } from '../rt/index.ts';
import { BOLD, ITALIC, NORMAL } from './consts.ts';

let docdata: struct_list | null;
let xtrekrcdata: struct_list | null;

export function showdocs(atline: number): void {
  let i = 0;
  let length = 0;
  let top = 0;
  let center = 0;
  let data = null;
  let count = 0;
  let buf = new Int8Array(128);
  let font = null;
  if (!G.docwin) {
    G.docwin = W_MakeWindow(S("DocWin"), 0, 181, 500, 500, null, 2, G.foreColor);
  }
  W_ClearWindow(G.docwin);
  if (!W_IsMapped(G.docwin)) {
    W_MapWindow(G.docwin);
  }
  snprintf(P(buf), 128, S("---  %s  ---"), S("COW 3.3"));
  length = strlen(P(buf)) | 0;
  center = ((G.small_screen ? 400 : 500) / 2 | 0) - (Math.imul(length, G.W_Textwidth) / 2 | 0);
  W_WriteText(G.docwin, center, G.W_Textheight, G.textColor, P(buf), length, G.W_HighlightFont);
  snprintf(P(buf), 128, S("feedback to: quozl@us.netrek.org"));
  length = strlen(P(buf)) | 0;
  center = ((G.small_screen ? 400 : 500) / 2 | 0) - (Math.imul(length, G.W_Textwidth) / 2 | 0);
  W_WriteText(G.docwin, center, 3 * G.W_Textheight, G.textColor, P(buf), length, G.W_RegularFont);
  if (!docdata) {
    loaddocs();
  }
  top = 10;
  if (atline > G.maxdoclines) {
    atline = G.maxdoclines - 28;
  }
  data = docdata;
  for (i = 0; i < atline; ++i) {
    if (!data) {
      atline = 0;
      data = docdata;
      break;
    }
    data = data.next;
  }
  count = 28;
  for (i = top; i < 50; ++i) {
    if (!data) {
      break;
    }
    if (!data.data) {
      continue;
    }
    switch (data.face) {
    case 1:
      font = G.W_HighlightFont;
      break;
    case 2:
      font = G.W_UnderlineFont;
      break;
    case 0:
      font = G.W_RegularFont;
      break;
    }
    W_WriteText(G.docwin, 20, Math.imul(i, G.W_Textheight), G.textColor, data.data, strlen(data.data) | 0, font);
    data = data.next;
    --count;
    if (count <= 0) {
      break;
    }
  }
}

export function loaddocs(): void {
  let fptr = null;
  let temp = null;
  let fl = null;
  let line = new Int8Array(80);
  let filename = null;
  let i = 0;
  filename = getdefault(S("documentation"));
  if (filename) {
    if (!(fptr = fopen(filename, S("r")))) {
      return;
    }
  } else if (!(fptr = fopen(S("BRM.DOC"), S("r")))) {
    return;
  }
  temp = new struct_list();
  if (!temp) {
    fclose(fptr);
    printf(S("%s"), G.malloc_fail);
    return;
  }
  while (!!fgets(P(line), 80, fptr)) {
    if (!fl) {
      fl = temp;
    }
    if (line[strlen(P(line)) - 1] === 10) {
      line[strlen(P(line)) - 1] = 0;
    }
    temp.face = NORMAL;
    if (line[0] === 12) {
      line[0] = 32;
    }
    if (line[0] === 27) {
      switch (line[1]) {
      case 98:
        temp.face = BOLD;
        break;
      case 105:
        temp.face = ITALIC;
        break;
      }
      line[0] = line[1] = 32;
    }
    for (i = 0; $u64(i) < strlen(P(line)); ++i) {
      if (line[i] === 9) {
        line[i] = 32;
      }
    }
    temp.data = P(new Int8Array((strlen(P(line)) + 1)));
    strcpy(temp.data, P(line));
    temp.next = new struct_list();
    if (!temp.next) {
      fclose(fptr);
      printf(S("%s"), G.malloc_fail);
      return;
    }
    ++G.maxdoclines;
    temp = temp.next;
    temp.data = null;
    temp.next = null;
  }
  temp.next = null;
  docdata = fl;
  fclose(fptr);
}

export function showxtrekrc(atline: number): void {
  let i = 0;
  let length = 0;
  let top = 0;
  let center = 0;
  let data = null;
  let count = 0;
  let buf = new Int8Array(128);
  let font = null;
  if (!G.xtrekrcwin) {
    G.xtrekrcwin = W_MakeWindow(S("xtrekrcWin"), 0, 200, 500, 500, null, 2, G.foreColor);
  }
  W_ClearWindow(G.xtrekrcwin);
  if (!W_IsMapped(G.xtrekrcwin)) {
    W_MapWindow(G.xtrekrcwin);
  }
  snprintf(P(buf), 128, S("---  %s  ---"), S("COW 3.3"));
  length = strlen(P(buf)) | 0;
  center = ((G.small_screen ? 400 : 500) / 2 | 0) - (Math.imul(length, G.W_Textwidth) / 2 | 0);
  W_WriteText(G.xtrekrcwin, center, G.W_Textheight, G.textColor, P(buf), length, G.W_HighlightFont);
  snprintf(P(buf), 128, S("feedback to: quozl@us.netrek.org"));
  length = strlen(P(buf)) | 0;
  center = ((G.small_screen ? 400 : 500) / 2 | 0) - (Math.imul(length, G.W_Textwidth) / 2 | 0);
  W_WriteText(G.xtrekrcwin, center, 3 * G.W_Textheight, G.textColor, P(buf), length, G.W_RegularFont);
  if (!xtrekrcdata) {
    loadxtrekrc();
  }
  top = 10;
  if (atline > G.maxxtrekrclines) {
    atline = G.maxxtrekrclines - 28;
  }
  data = xtrekrcdata;
  for (i = 0; i < atline; ++i) {
    if (!data) {
      atline = 0;
      data = xtrekrcdata;
      break;
    }
    data = data.next;
  }
  count = 28;
  for (i = top; i < 50; ++i) {
    if (!data) {
      break;
    }
    if (!data.data) {
      continue;
    }
    switch (data.face) {
    case 1:
      font = G.W_HighlightFont;
      break;
    case 2:
      font = G.W_UnderlineFont;
      break;
    case 0:
      font = G.W_RegularFont;
      break;
    }
    W_WriteText(G.xtrekrcwin, 20, Math.imul(i, G.W_Textheight), G.textColor, data.data, strlen(data.data) | 0, font);
    data = data.next;
    --count;
    if (count <= 0) {
      break;
    }
  }
}

export function loadxtrekrc(): void {
  let fptr = null;
  let temp = null;
  let fl = null;
  let line = new Int8Array(80);
  let filename = new Int8Array(256);
  let i = 0;
  filename[0] = 0;
  if (!findfile(S(".netrekrc"), P(filename)) && !findfile(S(".xtrekrc"), P(filename))) {
    return;
  }
  if (!(fptr = fopen(P(filename), S("r")))) {
    return;
  }
  temp = new struct_list();
  if (!temp) {
    fclose(fptr);
    printf(S("%s"), G.malloc_fail);
    return;
  }
  while (!!fgets(P(line), 80, fptr)) {
    if (!fl) {
      fl = temp;
    }
    if (line[strlen(P(line)) - 1] === 10) {
      line[strlen(P(line)) - 1] = 0;
    }
    temp.face = NORMAL;
    if (line[0] === 12) {
      line[0] = 32;
    }
    if (line[0] === 35) {
      temp.face = ITALIC;
    }
    for (i = 0; $u64(i) < strlen(P(line)); ++i) {
      if (line[i] === 9) {
        line[i] = 32;
      }
    }
    temp.data = P(new Int8Array((strlen(P(line)) + 1)));
    strcpy(temp.data, P(line));
    temp.next = new struct_list();
    if (!temp.next) {
      fclose(fptr);
      printf(S("%s"), G.malloc_fail);
      return;
    }
    ++G.maxxtrekrclines;
    temp = temp.next;
    temp.data = null;
    temp.next = null;
  }
  temp.next = null;
  xtrekrcdata = fl;
  fclose(fptr);
}

export function $init(): void {
  docdata = null;
  xtrekrcdata = null;
  G.malloc_fail = S("Warning: couldn't malloc space for a new doc line!\n");
}
