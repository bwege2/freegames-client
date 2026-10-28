// sdlgui.c: the tiny dialog GUI of Hatari and Ballerburg SDL (Thomas Huth): boxes, texts, buttons, radio
// buttons, check boxes, edit fields and user-drawn objects in an 8x16 font grid, centred on the screen,
// driven by SDL's mouse and keyboard events.
import {
  SDL_BlitSurface, SDL_CreateSurface, SDL_DestroySurface, SDL_Delay, SDL_FillSurfaceRect, SDL_MapSurfaceRGB, SDL_PollEvent,
  SDL_SetSurfaceColorKey, SDL_StartTextInput, SDL_StopTextInput, SDL_WaitEvent, SDL_PIXELFORMAT_INDEX8,
  SDL_EVENT_QUIT, SDL_EVENT_MOUSE_BUTTON_DOWN, SDL_EVENT_MOUSE_BUTTON_UP, SDL_EVENT_MOUSE_MOTION, SDL_EVENT_TEXT_INPUT,
  SDL_EVENT_KEY_DOWN, SDL_EVENT_WINDOW_EXPOSED, SDL_EVENT_WINDOW_RESTORED, SDL_BUTTON_LEFT,
  SDLK_RETURN, SDLK_KP_ENTER, SDLK_ESCAPE, SDLK_LEFT, SDLK_RIGHT, SDLK_BACKSPACE, SDLK_DELETE,
  type SDL_Event, type SDL_Rect, type SDL_Surface,
} from './sdl.ts';
import { scr_update, scr_update_rects } from './screen.ts';
import { g } from './baller1.ts';
import { assets } from './assets.ts';

export * from './sdlgui.h.ts';
import {
  CStr, SGBOX, SGTEXT, SGEDITFIELD, SGBUTTON, SGRADIOBUT, SGCHECKBOX, SGPOPUP, SGUSER, SG_EXIT, SG_DEFAULT, SG_CANCEL,
  SG_SELECTED, SGRADIOBUTTON_NORMAL, SGRADIOBUTTON_SELECTED, SGCHECKBOX_NORMAL, SGCHECKBOX_SELECTED, SDLGUI_ERROR, SDLGUI_QUIT,
  type SGOBJ, type UserFn,
} from './sdlgui.h.ts';

function str(t: SGOBJ['txt']): string {
  return t instanceof CStr ? t.s : typeof t === 'string' ? t : '';
}

export let sdlgui_fontwidth = 0;
export let sdlgui_fontheight = 0;

let pSdlGuiScrn: SDL_Surface;
let pFontGfx: SDL_Surface | null = null;

/** the dialogs being run (innermost last): what a scripted player looks at */
export const activeDialogs: SGOBJ[][] = [];

export function sdlguiReset(): void {
  pFontGfx = null;
  activeDialogs.length = 0;
}

/** Load an 1 plane XBM into a 8 planes SDL_Surface. */
function SDLGui_LoadXBM(w: number, h: number, bits: Uint8Array): SDL_Surface {
  const bitmap = SDL_CreateSurface(w, h, SDL_PIXELFORMAT_INDEX8);
  const dst = bitmap.pixels as Uint8Array;
  const srcpitch = (w + 7) >> 3;
  let mask = 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      dst[y * w + x] = bits[y * srcpitch + (x >> 3)] & mask ? 1 : 0;
      mask <<= 1;
      mask |= mask >> 8;
      mask &= 0xff;
    }
  }
  return bitmap;
}

export function SDLGui_Init(): number {
  if (pFontGfx) return 0;
  pFontGfx = SDLGui_LoadXBM(128, 256, assets.font);
  pFontGfx.palette = [{ r: 255, g: 255, b: 255, a: 0 }, { r: 0, g: 0, b: 0, a: 0 }];
  SDL_SetSurfaceColorKey(pFontGfx, true, 0);
  return 0;
}

export function SDLGui_UnInit(): number {
  if (pFontGfx) {
    SDL_DestroySurface(pFontGfx);
    pFontGfx = null;
  }
  return 0;
}

export function SDLGui_SetScreen(pScrn: SDL_Surface): number {
  pSdlGuiScrn = pScrn;
  if (!pFontGfx) return -1;
  sdlgui_fontwidth = (pFontGfx.w / 16) | 0;
  sdlgui_fontheight = (pFontGfx.h / 16) | 0;
  return 0;
}

export function SDLGui_GetFontSize(): { w: number; h: number } {
  return { w: sdlgui_fontwidth, h: sdlgui_fontheight };
}

/** Center a dialog so that it appears in the middle of the screen. */
export function SDLGui_CenterDlg(dlg: SGOBJ[]): void {
  dlg[0].x = Math.trunc((Math.trunc(pSdlGuiScrn.w / sdlgui_fontwidth) - dlg[0].w) / 2);
  dlg[0].y = Math.trunc((Math.trunc(pSdlGuiScrn.h / sdlgui_fontheight) - dlg[0].h) / 2);
}

/** Draw a text string (one byte, one glyph: no UTF-8 locale, as the oracle runs it). */
export function SDLGui_Text(x: number, y: number, txt: string): void {
  const sr: SDL_Rect = { x: 0, y: 0, w: sdlgui_fontwidth, h: sdlgui_fontheight };
  const dr: SDL_Rect = { x: 0, y: 0, w: sdlgui_fontwidth, h: sdlgui_fontheight };
  for (let p = 0; p < txt.length; p++) {
    const c = txt.charCodeAt(p) & 255;
    sr.x = sdlgui_fontwidth * (c % 16);
    sr.y = sdlgui_fontheight * ((c / 16) | 0);
    dr.x = x + p * sdlgui_fontwidth;
    dr.y = y;
    SDL_BlitSurface(pFontGfx!, sr, pSdlGuiScrn, dr);
  }
}

function SDLGui_DrawText(tdlg: SGOBJ[], objnum: number): void {
  const x = (tdlg[0].x + tdlg[objnum].x) * sdlgui_fontwidth;
  const y = (tdlg[0].y + tdlg[objnum].y) * sdlgui_fontheight;
  SDLGui_Text(x, y, str(tdlg[objnum].txt));
}

function SDLGui_DrawEditField(edlg: SGOBJ[], objnum: number): void {
  const x = (edlg[0].x + edlg[objnum].x) * sdlgui_fontwidth;
  const y = (edlg[0].y + edlg[objnum].y) * sdlgui_fontheight;
  SDLGui_Text(x, y, str(edlg[objnum].txt));
  const rect = { x, y: y + edlg[objnum].h * sdlgui_fontheight, w: edlg[objnum].w * sdlgui_fontwidth, h: 1 };
  SDL_FillSurfaceRect(pSdlGuiScrn, rect, SDL_MapSurfaceRGB(pSdlGuiScrn, 160, 160, 160));
}

function SDLGui_DrawBox(bdlg: SGOBJ[], objnum: number): void {
  const grey = SDL_MapSurfaceRGB(pSdlGuiScrn, 192, 192, 192);
  let x = bdlg[objnum].x * sdlgui_fontwidth;
  let y = bdlg[objnum].y * sdlgui_fontheight;
  if (objnum > 0) {
    x += bdlg[0].x * sdlgui_fontwidth;
    y += bdlg[0].y * sdlgui_fontheight;
  }
  const w = bdlg[objnum].w * sdlgui_fontwidth;
  const h = bdlg[objnum].h * sdlgui_fontheight;
  let upleftc: number, downrightc: number;
  if (bdlg[objnum].state & SG_SELECTED) {
    upleftc = SDL_MapSurfaceRGB(pSdlGuiScrn, 128, 128, 128);
    downrightc = SDL_MapSurfaceRGB(pSdlGuiScrn, 255, 255, 255);
  } else {
    upleftc = SDL_MapSurfaceRGB(pSdlGuiScrn, 255, 255, 255);
    downrightc = SDL_MapSurfaceRGB(pSdlGuiScrn, 128, 128, 128);
  }
  /* The root box should be bigger than the screen, so we disable the offset there: */
  const offset = objnum !== 0 ? 1 : 0;
  SDL_FillSurfaceRect(pSdlGuiScrn, { x, y, w, h }, grey);
  SDL_FillSurfaceRect(pSdlGuiScrn, { x, y: y - offset, w, h: 1 }, upleftc);
  SDL_FillSurfaceRect(pSdlGuiScrn, { x: x - offset, y, w: 1, h }, upleftc);
  SDL_FillSurfaceRect(pSdlGuiScrn, { x, y: y + h - 1 + offset, w, h: 1 }, downrightc);
  SDL_FillSurfaceRect(pSdlGuiScrn, { x: x + w - 1 + offset, y, w: 1, h }, downrightc);
}

export function SDLGui_DrawButton(bdlg: SGOBJ[], objnum: number): void {
  const txt = str(bdlg[objnum].txt);
  SDLGui_DrawBox(bdlg, objnum);
  let x = (bdlg[0].x + bdlg[objnum].x) * sdlgui_fontwidth + Math.trunc((bdlg[objnum].w - txt.length) * sdlgui_fontwidth / 2);
  let y = (bdlg[0].y + bdlg[objnum].y + Math.trunc((bdlg[objnum].h - 1) / 2)) * sdlgui_fontheight;
  if (bdlg[objnum].state & SG_SELECTED) {
    x += 1;
    y += 1;
  }
  SDLGui_Text(x, y, txt);
}

function SDLGui_DrawRadioButton(rdlg: SGOBJ[], objnum: number): void {
  const x = (rdlg[0].x + rdlg[objnum].x) * sdlgui_fontwidth;
  const y = (rdlg[0].y + rdlg[objnum].y) * sdlgui_fontheight;
  const c = rdlg[objnum].state & SG_SELECTED ? SGRADIOBUTTON_SELECTED : SGRADIOBUTTON_NORMAL;
  SDLGui_Text(x, y, String.fromCharCode(c) + ' ' + str(rdlg[objnum].txt));
}

function SDLGui_DrawCheckBox(cdlg: SGOBJ[], objnum: number): void {
  const x = (cdlg[0].x + cdlg[objnum].x) * sdlgui_fontwidth;
  const y = (cdlg[0].y + cdlg[objnum].y) * sdlgui_fontheight;
  const c = cdlg[objnum].state & SG_SELECTED ? SGCHECKBOX_SELECTED : SGCHECKBOX_NORMAL;
  SDLGui_Text(x, y, String.fromCharCode(c) + ' ' + str(cdlg[objnum].txt));
}

function SDLGui_DrawPopupButton(pdlg: SGOBJ[], objnum: number): void {
  SDLGui_DrawBox(pdlg, objnum);
  const x = (pdlg[0].x + pdlg[objnum].x) * sdlgui_fontwidth;
  const y = (pdlg[0].y + pdlg[objnum].y) * sdlgui_fontheight;
  const w = pdlg[objnum].w * sdlgui_fontwidth;
  SDLGui_Text(x, y, str(pdlg[objnum].txt));
  SDLGui_Text(x + w - sdlgui_fontwidth, y, '\x02');
}

/** Let the user insert text into an edit field object (a CStr, at most w characters). */
async function SDLGui_EditField(dlg: SGOBJ[], objnum: number): Promise<void> {
  let blinkState = 0;
  let bStopEditing = false;
  const grey = SDL_MapSurfaceRGB(pSdlGuiScrn, 192, 192, 192);
  const cursorCol = SDL_MapSurfaceRGB(pSdlGuiScrn, 128, 128, 128);
  const rect: SDL_Rect = {
    x: (dlg[0].x + dlg[objnum].x) * sdlgui_fontwidth,
    y: (dlg[0].y + dlg[objnum].y) * sdlgui_fontheight,
    w: (dlg[objnum].w + 1) * sdlgui_fontwidth - 1,
    h: dlg[objnum].h * sdlgui_fontheight,
  };
  const txt = dlg[objnum].txt as CStr;
  let cursorPos = txt.s.length;

  SDL_StartTextInput();
  do {
    let event = SDL_PollEvent();
    if (!event) {
      /* No event: Wait some time for cursor blinking */
      await SDL_Delay(250);
      blinkState ^= 1;
    } else {
      do {
        switch (event.type) {
          case SDL_EVENT_QUIT:
            bStopEditing = true;
            break;
          case SDL_EVENT_MOUSE_BUTTON_DOWN:
            bStopEditing = true;
            break;
          case SDL_EVENT_TEXT_INPUT:
            if (txt.s.length < dlg[objnum].w) {
              txt.s = txt.s.slice(0, cursorPos) + String.fromCharCode(event.text) + txt.s.slice(cursorPos);
              cursorPos += 1;
            }
            break;
          case SDL_EVENT_KEY_DOWN:
            switch (event.key) {
              case SDLK_RETURN:
              case SDLK_KP_ENTER:
                bStopEditing = true;
                break;
              case SDLK_LEFT:
                if (cursorPos > 0) cursorPos -= 1;
                break;
              case SDLK_RIGHT:
                if (cursorPos < txt.s.length) cursorPos += 1;
                break;
              case SDLK_BACKSPACE:
                if (cursorPos > 0) {
                  txt.s = txt.s.slice(0, cursorPos - 1) + txt.s.slice(cursorPos);
                  cursorPos -= 1;
                }
                break;
              case SDLK_DELETE:
                if (cursorPos < txt.s.length) txt.s = txt.s.slice(0, cursorPos) + txt.s.slice(cursorPos + 1);
                break;
              default:
                break;
            }
            break;
        }
        event = SDL_PollEvent();
      } while (event);
      blinkState = 1;
    }

    /* Redraw the text field: */
    SDL_FillSurfaceRect(pSdlGuiScrn, rect, grey);
    if (blinkState && !bStopEditing) {
      const cursorrect = { x: rect.x + cursorPos * sdlgui_fontwidth, y: rect.y, w: sdlgui_fontwidth, h: rect.h };
      SDL_FillSurfaceRect(pSdlGuiScrn, cursorrect, cursorCol);
    }
    SDLGui_Text(rect.x, rect.y, txt.s);
    scr_update_rects(pSdlGuiScrn, 1, rect);
  } while (!bStopEditing);

  SDL_StopTextInput();
}

function SDLGui_DrawUserObj(bdlg: SGOBJ[], objnum: number): void {
  const x = bdlg[objnum].x * sdlgui_fontwidth + bdlg[0].x * sdlgui_fontwidth;
  const y = bdlg[objnum].y * sdlgui_fontheight + bdlg[0].y * sdlgui_fontheight;
  const w = bdlg[objnum].w * sdlgui_fontwidth;
  const h = bdlg[objnum].h * sdlgui_fontheight;
  (bdlg[objnum].txt as UserFn)(x, y, w, h);
}

export function SDLGui_DrawDialog(dlg: SGOBJ[]): void {
  for (let i = 0; dlg[i].type !== -1; i++) {
    switch (dlg[i].type) {
      case SGBOX: SDLGui_DrawBox(dlg, i); break;
      case SGTEXT: SDLGui_DrawText(dlg, i); break;
      case SGEDITFIELD: SDLGui_DrawEditField(dlg, i); break;
      case SGBUTTON: SDLGui_DrawButton(dlg, i); break;
      case SGRADIOBUT: SDLGui_DrawRadioButton(dlg, i); break;
      case SGCHECKBOX: SDLGui_DrawCheckBox(dlg, i); break;
      case SGPOPUP: SDLGui_DrawPopupButton(dlg, i); break;
      case SGUSER: SDLGui_DrawUserObj(dlg, i); break;
    }
  }
  scr_update(0, 0, 0, 0);
}

/** Search an object at a certain position. */
function SDLGui_FindObj(dlg: SGOBJ[], fx: number, fy: number): number {
  let len = 0;
  while (dlg[len].type !== -1) len++;
  const xpos = Math.trunc(fx / sdlgui_fontwidth);
  const ypos = Math.trunc(fy / sdlgui_fontheight);
  for (let i = len; i >= 0; i--) {
    if (xpos >= dlg[0].x + dlg[i].x && ypos >= dlg[0].y + dlg[i].y
      && xpos < dlg[0].x + dlg[i].x + dlg[i].w && ypos < dlg[0].y + dlg[i].y + dlg[i].h) {
      return i;
    }
  }
  return -1;
}

function SDLGui_SearchFlaggedButton(dlg: SGOBJ[], flag: number): number {
  for (let i = 0; dlg[i].type !== -1; i++) if (dlg[i].flags & flag) return i;
  return 0;
}

function buttonRect(dlg: SGOBJ[], obj: number): SDL_Rect {
  return {
    x: (dlg[0].x + dlg[obj].x) * sdlgui_fontwidth - 2,
    y: (dlg[0].y + dlg[obj].y) * sdlgui_fontheight - 2,
    w: dlg[obj].w * sdlgui_fontwidth + 4,
    h: dlg[obj].h * sdlgui_fontheight + 4,
  };
}

function charRect(dlg: SGOBJ[], i: number): SDL_Rect {
  return { x: (dlg[0].x + dlg[i].x) * sdlgui_fontwidth, y: (dlg[0].y + dlg[i].y) * sdlgui_fontheight, w: sdlgui_fontwidth, h: sdlgui_fontheight };
}

/**
 * Show and process a dialog. Returns the button number that has been pressed (no caller of Ballerburg asks
 * for unknown events, so SDLGUI_UNKNOWNEVENT never comes back).
 */
export async function SDLGui_DoDialog(dlg: SGOBJ[]): Promise<number> {
  let obj = 0;
  let oldbutton = 0;
  let retbutton = 0;

  if (Math.trunc(pSdlGuiScrn.h / sdlgui_fontheight) < dlg[0].h) return SDLGUI_ERROR;

  const grey = SDL_MapSurfaceRGB(pSdlGuiScrn, 192, 192, 192);
  const dlgrect: SDL_Rect = {
    x: dlg[0].x * sdlgui_fontwidth, y: dlg[0].y * sdlgui_fontheight,
    w: dlg[0].w * sdlgui_fontwidth, h: dlg[0].h * sdlgui_fontheight,
  };
  const bgrect: SDL_Rect = { x: 0, y: 0, w: dlgrect.w, h: dlgrect.h };

  /* Save background */
  const pBgSurface = SDL_CreateSurface(dlgrect.w, dlgrect.h, pSdlGuiScrn.format);
  SDL_BlitSurface(pSdlGuiScrn, dlgrect, pBgSurface, bgrect);

  SDLGui_DrawDialog(dlg);
  activeDialogs.push(dlg);
  try {
    while (retbutton === 0) {
      const sdlEvent: SDL_Event = await SDL_WaitEvent();
      switch (sdlEvent.type) {
        case SDL_EVENT_QUIT:
          retbutton = SDLGUI_QUIT;
          break;

        case SDL_EVENT_MOUSE_BUTTON_DOWN:
          if (sdlEvent.button !== SDL_BUTTON_LEFT) break;
          obj = SDLGui_FindObj(dlg, sdlEvent.x, sdlEvent.y);
          if (obj > 0) {
            if (dlg[obj].type === SGBUTTON) {
              dlg[obj].state |= SG_SELECTED;
              SDLGui_DrawButton(dlg, obj);
              scr_update_rects(pSdlGuiScrn, 1, buttonRect(dlg, obj));
              oldbutton = obj;
            }
          }
          break;

        case SDL_EVENT_MOUSE_BUTTON_UP:
          if (sdlEvent.button !== SDL_BUTTON_LEFT) break;
          obj = SDLGui_FindObj(dlg, sdlEvent.x, sdlEvent.y);
          if (obj > 0) {
            switch (dlg[obj].type) {
              case SGBUTTON:
                if (oldbutton === obj) retbutton = obj;
                break;
              case SGEDITFIELD:
                await SDLGui_EditField(dlg, obj);
                break;
              case SGRADIOBUT: {
                for (let i = obj - 1; i > 0 && dlg[i].type === SGRADIOBUT; i--) {
                  dlg[i].state &= ~SG_SELECTED;
                  const rct = charRect(dlg, i);
                  SDL_FillSurfaceRect(pSdlGuiScrn, rct, grey);
                  SDLGui_DrawRadioButton(dlg, i);
                  scr_update_rects(pSdlGuiScrn, 1, rct);
                }
                for (let i = obj + 1; dlg[i].type === SGRADIOBUT; i++) {
                  dlg[i].state &= ~SG_SELECTED;
                  const rct = charRect(dlg, i);
                  SDL_FillSurfaceRect(pSdlGuiScrn, rct, grey);
                  SDLGui_DrawRadioButton(dlg, i);
                  scr_update_rects(pSdlGuiScrn, 1, rct);
                }
                dlg[obj].state |= SG_SELECTED;
                const rct = charRect(dlg, obj);
                SDL_FillSurfaceRect(pSdlGuiScrn, rct, grey);
                SDLGui_DrawRadioButton(dlg, obj);
                scr_update_rects(pSdlGuiScrn, 1, rct);
                break;
              }
              case SGCHECKBOX: {
                dlg[obj].state ^= SG_SELECTED;
                const rct = charRect(dlg, obj);
                SDL_FillSurfaceRect(pSdlGuiScrn, rct, grey);
                SDLGui_DrawCheckBox(dlg, obj);
                scr_update_rects(pSdlGuiScrn, 1, rct);
                break;
              }
              case SGPOPUP:
                dlg[obj].state |= SG_SELECTED;
                SDLGui_DrawPopupButton(dlg, obj);
                scr_update_rects(pSdlGuiScrn, 1, buttonRect(dlg, obj));
                retbutton = obj;
                break;
            }
          }
          if (oldbutton > 0 && dlg[oldbutton].type === SGBUTTON) {
            dlg[oldbutton].state &= ~SG_SELECTED;
            SDLGui_DrawButton(dlg, oldbutton);
            scr_update_rects(pSdlGuiScrn, 1, buttonRect(dlg, oldbutton));
            oldbutton = 0;
          }
          if (obj >= 0 && (dlg[obj].flags & SG_EXIT)) retbutton = obj;
          break;

        case SDL_EVENT_MOUSE_MOTION:
          break;

        case SDL_EVENT_KEY_DOWN:
          if (sdlEvent.key === SDLK_RETURN || sdlEvent.key === SDLK_KP_ENTER) retbutton = SDLGui_SearchFlaggedButton(dlg, SG_DEFAULT);
          else if (sdlEvent.key === SDLK_ESCAPE) retbutton = SDLGui_SearchFlaggedButton(dlg, SG_CANCEL);
          break;

        case SDL_EVENT_WINDOW_RESTORED:
        case SDL_EVENT_WINDOW_EXPOSED:
          scr_update(0, 0, 0, 0);
          break;

        default:
          break;
      }
    }
  } finally {
    activeDialogs.pop();
  }

  /* Restore background */
  SDL_BlitSurface(pBgSurface, bgrect, pSdlGuiScrn, dlgrect);
  SDL_DestroySurface(pBgSurface);

  g.bt = 0; // FIXME: Hack

  return retbutton;
}
