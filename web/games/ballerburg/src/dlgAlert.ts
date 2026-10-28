// dlgAlert.c: AES-like alert boxes (Petr Stehlik, Thomas Huth): up to four centred lines and one or two buttons.
import { SDLGui_CenterDlg, SDLGui_DoDialog, SDLGui_SetScreen } from './sdlgui.ts';
import { obj, end, SGBOX, SGTEXT, SGBUTTON, SG_DEFAULT, SG_CANCEL, type SGOBJ } from './sdlgui.h.ts';
import { scr_update, surf } from './screen.ts';

const MAX_LINES = 4;
const DLGALERT_OK = 5;
const DLGALERT_CANCEL = 6;

/* The "Alert"-dialog: */
export const alertdlg: SGOBJ[] = [
  obj(SGBOX, 0, 0, 0, 0, 52, 8, null),
  obj(SGTEXT, 0, 0, 1, 1, 50, 1, ''),
  obj(SGTEXT, 0, 0, 1, 2, 50, 1, ''),
  obj(SGTEXT, 0, 0, 1, 3, 50, 1, ''),
  obj(SGTEXT, 0, 0, 1, 4, 50, 1, ''),
  obj(SGBUTTON, SG_DEFAULT, 0, 5, 6, 8, 1, 'OK'),
  obj(SGBUTTON, SG_CANCEL, 0, 24, 6, 8, 1, 'Cancel'),
  end(),
];

export function alertReset(): void {
  Object.assign(alertdlg[DLGALERT_OK], { type: SGBUTTON, x: 5, y: 6, w: 8, h: 1, txt: 'OK' });
  Object.assign(alertdlg[DLGALERT_CANCEL], { type: SGBUTTON, x: 24, y: 6, w: 8, h: 1, txt: 'Cancel' });
  for (let i = 1; i <= MAX_LINES; i++) alertdlg[i].txt = '';
}

/**
 * Breaks long string to several strings of max_width, divided by '\0', sets text_width to the longest
 * line width and returns the number of lines you need to display the strings. (On char codes, as in C.)
 */
function DlgAlert_FormatTextToBox(text: number[], max_width: number): { lines: number; width: number } {
  let columns = 0;
  let lines = 1;
  const txtlen = text.indexOf(0);
  let p = 0, q = 0, llb = -1;
  const txtend = txtlen;
  if (txtlen <= max_width && !text.slice(0, txtlen).includes(10)) return { lines, width: txtlen };

  const brk = new Set([32, 9, 47, 92, 10]); // " \t/\\\n"
  while (q < txtend) {
    let r = q;
    while (text[r] !== 0 && !brk.has(text[r])) r++; /* strpbrk */
    if (text[r] === 0) r = txtend;
    if (r - p <= max_width && text[r] !== 10) {
      llb = r;
      q++;
      if (r - p > columns) columns = r - p;
      continue;
    }
    if (r - p > max_width) {
      if (p > llb) llb = p + max_width;
    } else {
      llb = r;
    }
    text[llb] = 0; /* BREAK */
    if (llb - p > columns) columns = llb - p;
    p = q = llb + 1;
    lines++;
  }
  return { lines, width: columns };
}

/** Show the "alert" dialog. Return true if user pressed "OK". */
async function DlgAlert_ShowDlg(text: string): Promise<number> {
  const maxlen = 50;
  const t = [...text].map((c) => c.charCodeAt(0) & 255);
  t.push(0);
  const { lines, width: len } = DlgAlert_FormatTextToBox(t, maxlen);
  const offset = Math.trunc((maxlen - len) / 2);

  let p = 0;
  for (let i = 0; i < MAX_LINES; i++) {
    if (i < lines) {
      let e = p;
      while (t[e] !== 0) e++;
      alertdlg[1 + i].txt = ' '.repeat(Math.max(0, offset)) + String.fromCharCode(...t.slice(p, e));
      p = e + 1;
    } else {
      alertdlg[1 + i].txt = '';
    }
  }

  if (SDLGui_SetScreen(surf)) return 0;
  SDLGui_CenterDlg(alertdlg);

  const i = await SDLGui_DoDialog(alertdlg);

  scr_update(0, 0, 0, 0);

  return i === DLGALERT_OK ? 1 : 0;
}

/** Show a "notice" dialog: (only one button) */
export async function DlgAlert_Notice(text: string, button: string): Promise<number> {
  /* First "OK" button: */
  alertdlg[DLGALERT_OK].txt = button;
  alertdlg[DLGALERT_OK].w = button.length + 2;

  /* Hide "cancel" button: */
  alertdlg[DLGALERT_CANCEL].type = SGTEXT;
  alertdlg[DLGALERT_CANCEL].txt = '';
  alertdlg[DLGALERT_CANCEL].w = 0;
  alertdlg[DLGALERT_CANCEL].h = 0;

  /* Adjust button position: */
  alertdlg[DLGALERT_OK].x = Math.trunc((alertdlg[0].w - alertdlg[DLGALERT_OK].w) / 2);

  return DlgAlert_ShowDlg(text);
}

/** Show a "query" dialog: (two buttons), return true for OK */
export async function DlgAlert_Query(text: string, button1: string, button2: string): Promise<number> {
  alertdlg[DLGALERT_OK].txt = button1;
  alertdlg[DLGALERT_OK].w = button1.length + 2;

  alertdlg[DLGALERT_CANCEL].type = SGBUTTON;
  alertdlg[DLGALERT_CANCEL].txt = button2;
  alertdlg[DLGALERT_CANCEL].w = button2.length + 2;
  alertdlg[DLGALERT_CANCEL].h = 1;

  alertdlg[DLGALERT_OK].x = Math.trunc((alertdlg[0].w - alertdlg[DLGALERT_OK].w - alertdlg[DLGALERT_CANCEL].w) / 3);
  alertdlg[DLGALERT_CANCEL].x = alertdlg[DLGALERT_OK].x * 2 + alertdlg[DLGALERT_OK].w;

  return DlgAlert_ShowDlg(text);
}
