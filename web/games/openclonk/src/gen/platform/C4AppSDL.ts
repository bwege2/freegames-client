// @ts-nocheck
// OpenClonk 36de799: src/platform/C4AppSDL.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';
import { sdl$SDL_GetModState, sdl$SDL_GetScancodeName } from '../../rt/sdl.ts';

function sdlToC4MCBtn(e, button, flags) {
  button.a[button.o] = 0;
  flags.a[flags.o] = sdl$SDL_GetModState() >>> 0;
  switch (e.button) {
    case 1:
      if (e.state === 1) {
        button.a[button.o] = e.clicks === 2 ? $.C4MC_Button_LeftDouble$C4MouseControl : $.C4MC_Button_LeftDown$C4MouseControl;
      } else {
        button.a[button.o] = 2;
      }
      break;
    case 3:
      if (e.state === 1) {
        button.a[button.o] = e.clicks === 2 ? $.C4MC_Button_RightDouble$C4MouseControl : $.C4MC_Button_RightDown$C4MouseControl;
      } else {
        button.a[button.o] = 4;
      }
      break;
    case 2:
      if (e.state === 1) {
        button.a[button.o] = e.clicks === 2 ? $.C4MC_Button_MiddleDouble$C4MouseControl : $.C4MC_Button_MiddleDown$C4MouseControl;
      } else {
        button.a[button.o] = 9;
      }
      break;
    case 4:
      if (e.state === 1) {
        button.a[button.o] = e.clicks === 2 ? $.C4MC_Button_X1Double$C4MouseControl : $.C4MC_Button_X1Down$C4MouseControl;
      } else {
        button.a[button.o] = 12;
      }
      break;
    case 5:
      if (e.state === 1) {
        button.a[button.o] = e.clicks === 2 ? $.C4MC_Button_X2Double$C4MouseControl : $.C4MC_Button_X2Down$C4MouseControl;
      } else {
        button.a[button.o] = 15;
      }
      break;
  }
}

function sdl_scancode_to_keycode(scancode) {
  switch (scancode) {
    case 225:
      return 42;
    case 229:
      return 54;
    case 224:
      return 29;
    case 228:
      return 97;
    case 226:
      return 56;
    case 230:
      return 100;
    case 58:
      return 59;
    case 59:
      return 60;
    case 60:
      return 61;
    case 61:
      return 62;
    case 62:
      return 63;
    case 63:
      return 64;
    case 64:
      return 65;
    case 65:
      return 66;
    case 66:
      return 67;
    case 67:
      return 68;
    case 68:
      return 87;
    case 69:
      return 88;
    case 87:
      return 78;
    case 86:
      return 74;
    case 85:
      return 55;
    case 41:
      return 1;
    case 72:
      return 119;
    case 43:
      return 15;
    case 40:
      return 28;
    case 76:
      return 111;
    case 73:
      return 110;
    case 42:
      return 14;
    case 44:
      return 57;
    case 82:
      return 103;
    case 81:
      return 108;
    case 80:
      return 105;
    case 79:
      return 106;
    case 74:
      return 102;
    case 77:
      return 107;
    case 71:
      return 70;
    case 118:
      return 127;
    case 75:
      return 104;
    case 78:
      return 109;
    case 30:
      return 2;
    case 31:
      return 3;
    case 32:
      return 4;
    case 33:
      return 5;
    case 34:
      return 6;
    case 35:
      return 7;
    case 36:
      return 8;
    case 37:
      return 9;
    case 38:
      return 10;
    case 39:
      return 11;
    case 4:
      return 30;
    case 5:
      return 48;
    case 6:
      return 46;
    case 7:
      return 32;
    case 8:
      return 18;
    case 9:
      return 33;
    case 10:
      return 34;
    case 11:
      return 35;
    case 12:
      return 23;
    case 13:
      return 36;
    case 14:
      return 37;
    case 15:
      return 38;
    case 16:
      return 50;
    case 17:
      return 49;
    case 18:
      return 24;
    case 19:
      return 25;
    case 20:
      return 16;
    case 21:
      return 19;
    case 22:
      return 31;
    case 23:
      return 20;
    case 24:
      return 22;
    case 25:
      return 47;
    case 26:
      return 17;
    case 27:
      return 45;
    case 28:
      return 21;
    case 29:
      return 44;
    case 45:
      return 12;
    case 46:
      return 13;
    case 47:
      return 26;
    case 48:
      return 27;
    case 51:
      return 39;
    case 52:
      return 40;
    case 53:
      return 41;
    case 49:
      return 43;
    case 54:
      return 51;
    case 55:
      return 52;
    case 56:
      return 53;
    case 57:
      return 58;
    case 83:
      return 69;
    case 95:
      return 71;
    case 96:
      return 72;
    case 97:
      return 73;
    case 92:
      return 75;
    case 93:
      return 76;
    case 94:
      return 77;
    case 89:
      return 79;
    case 90:
      return 80;
    case 91:
      return 81;
    case 98:
      return 82;
    case 99:
      return 83;
    case 100:
      return 86;
    case 88:
      return 96;
    case 84:
      return 98;
    case 227:
      return 125;
    case 231:
      return 126;
    case 70:
      return 99;
    default:
      return 0;
  }
}

export function KeycodeToString(code) {
  let scancode = 0;
  switch (code) {
    case 42:
      scancode = 225 /*SDL_SCANCODE_LSHIFT*/;
      break;
    case 54:
      scancode = 229 /*SDL_SCANCODE_RSHIFT*/;
      break;
    case 29:
      scancode = 224 /*SDL_SCANCODE_LCTRL*/;
      break;
    case 97:
      scancode = 228 /*SDL_SCANCODE_RCTRL*/;
      break;
    case 56:
      scancode = 226 /*SDL_SCANCODE_LALT*/;
      break;
    case 100:
      scancode = 230 /*SDL_SCANCODE_RALT*/;
      break;
    case 59:
      scancode = 58 /*SDL_SCANCODE_F1*/;
      break;
    case 60:
      scancode = 59 /*SDL_SCANCODE_F2*/;
      break;
    case 61:
      scancode = 60 /*SDL_SCANCODE_F3*/;
      break;
    case 62:
      scancode = 61 /*SDL_SCANCODE_F4*/;
      break;
    case 63:
      scancode = 62 /*SDL_SCANCODE_F5*/;
      break;
    case 64:
      scancode = 63 /*SDL_SCANCODE_F6*/;
      break;
    case 65:
      scancode = 64 /*SDL_SCANCODE_F7*/;
      break;
    case 66:
      scancode = 65 /*SDL_SCANCODE_F8*/;
      break;
    case 67:
      scancode = 66 /*SDL_SCANCODE_F9*/;
      break;
    case 68:
      scancode = 67 /*SDL_SCANCODE_F10*/;
      break;
    case 87:
      scancode = 68 /*SDL_SCANCODE_F11*/;
      break;
    case 88:
      scancode = 69 /*SDL_SCANCODE_F12*/;
      break;
    case 78:
      scancode = 87 /*SDL_SCANCODE_KP_PLUS*/;
      break;
    case 74:
      scancode = 86 /*SDL_SCANCODE_KP_MINUS*/;
      break;
    case 55:
      scancode = 85 /*SDL_SCANCODE_KP_MULTIPLY*/;
      break;
    case 1:
      scancode = 41 /*SDL_SCANCODE_ESCAPE*/;
      break;
    case 119:
      scancode = 72 /*SDL_SCANCODE_PAUSE*/;
      break;
    case 15:
      scancode = 43 /*SDL_SCANCODE_TAB*/;
      break;
    case 28:
      scancode = 40 /*SDL_SCANCODE_RETURN*/;
      break;
    case 111:
      scancode = 76 /*SDL_SCANCODE_DELETE*/;
      break;
    case 110:
      scancode = 73 /*SDL_SCANCODE_INSERT*/;
      break;
    case 14:
      scancode = 42 /*SDL_SCANCODE_BACKSPACE*/;
      break;
    case 57:
      scancode = 44 /*SDL_SCANCODE_SPACE*/;
      break;
    case 103:
      scancode = 82 /*SDL_SCANCODE_UP*/;
      break;
    case 108:
      scancode = 81 /*SDL_SCANCODE_DOWN*/;
      break;
    case 105:
      scancode = 80 /*SDL_SCANCODE_LEFT*/;
      break;
    case 106:
      scancode = 79 /*SDL_SCANCODE_RIGHT*/;
      break;
    case 102:
      scancode = 74 /*SDL_SCANCODE_HOME*/;
      break;
    case 107:
      scancode = 77 /*SDL_SCANCODE_END*/;
      break;
    case 70:
      scancode = 71 /*SDL_SCANCODE_SCROLLLOCK*/;
      break;
    case 127:
      scancode = 118 /*SDL_SCANCODE_MENU*/;
      break;
    case 104:
      scancode = 75 /*SDL_SCANCODE_PAGEUP*/;
      break;
    case 109:
      scancode = 78 /*SDL_SCANCODE_PAGEDOWN*/;
      break;
    case 2:
      scancode = 30 /*SDL_SCANCODE_1*/;
      break;
    case 3:
      scancode = 31 /*SDL_SCANCODE_2*/;
      break;
    case 4:
      scancode = 32 /*SDL_SCANCODE_3*/;
      break;
    case 5:
      scancode = 33 /*SDL_SCANCODE_4*/;
      break;
    case 6:
      scancode = 34 /*SDL_SCANCODE_5*/;
      break;
    case 7:
      scancode = 35 /*SDL_SCANCODE_6*/;
      break;
    case 8:
      scancode = 36 /*SDL_SCANCODE_7*/;
      break;
    case 9:
      scancode = 37 /*SDL_SCANCODE_8*/;
      break;
    case 10:
      scancode = 38 /*SDL_SCANCODE_9*/;
      break;
    case 11:
      scancode = 39 /*SDL_SCANCODE_0*/;
      break;
    case 30:
      scancode = 4 /*SDL_SCANCODE_A*/;
      break;
    case 48:
      scancode = 5 /*SDL_SCANCODE_B*/;
      break;
    case 46:
      scancode = 6 /*SDL_SCANCODE_C*/;
      break;
    case 32:
      scancode = 7 /*SDL_SCANCODE_D*/;
      break;
    case 18:
      scancode = 8 /*SDL_SCANCODE_E*/;
      break;
    case 33:
      scancode = 9 /*SDL_SCANCODE_F*/;
      break;
    case 34:
      scancode = 10 /*SDL_SCANCODE_G*/;
      break;
    case 35:
      scancode = 11 /*SDL_SCANCODE_H*/;
      break;
    case 23:
      scancode = 12 /*SDL_SCANCODE_I*/;
      break;
    case 36:
      scancode = 13 /*SDL_SCANCODE_J*/;
      break;
    case 37:
      scancode = 14 /*SDL_SCANCODE_K*/;
      break;
    case 38:
      scancode = 15 /*SDL_SCANCODE_L*/;
      break;
    case 50:
      scancode = 16 /*SDL_SCANCODE_M*/;
      break;
    case 49:
      scancode = 17 /*SDL_SCANCODE_N*/;
      break;
    case 24:
      scancode = 18 /*SDL_SCANCODE_O*/;
      break;
    case 25:
      scancode = 19 /*SDL_SCANCODE_P*/;
      break;
    case 16:
      scancode = 20 /*SDL_SCANCODE_Q*/;
      break;
    case 19:
      scancode = 21 /*SDL_SCANCODE_R*/;
      break;
    case 31:
      scancode = 22 /*SDL_SCANCODE_S*/;
      break;
    case 20:
      scancode = 23 /*SDL_SCANCODE_T*/;
      break;
    case 22:
      scancode = 24 /*SDL_SCANCODE_U*/;
      break;
    case 47:
      scancode = 25 /*SDL_SCANCODE_V*/;
      break;
    case 17:
      scancode = 26 /*SDL_SCANCODE_W*/;
      break;
    case 45:
      scancode = 27 /*SDL_SCANCODE_X*/;
      break;
    case 21:
      scancode = 28 /*SDL_SCANCODE_Y*/;
      break;
    case 44:
      scancode = 29 /*SDL_SCANCODE_Z*/;
      break;
    case 12:
      scancode = 45 /*SDL_SCANCODE_MINUS*/;
      break;
    case 13:
      scancode = 46 /*SDL_SCANCODE_EQUALS*/;
      break;
    case 26:
      scancode = 47 /*SDL_SCANCODE_LEFTBRACKET*/;
      break;
    case 27:
      scancode = 48 /*SDL_SCANCODE_RIGHTBRACKET*/;
      break;
    case 39:
      scancode = 51 /*SDL_SCANCODE_SEMICOLON*/;
      break;
    case 40:
      scancode = 52 /*SDL_SCANCODE_APOSTROPHE*/;
      break;
    case 41:
      scancode = 53 /*SDL_SCANCODE_GRAVE*/;
      break;
    case 43:
      scancode = 49 /*SDL_SCANCODE_BACKSLASH*/;
      break;
    case 51:
      scancode = 54 /*SDL_SCANCODE_COMMA*/;
      break;
    case 52:
      scancode = 55 /*SDL_SCANCODE_PERIOD*/;
      break;
    case 53:
      scancode = 56 /*SDL_SCANCODE_SLASH*/;
      break;
    case 58:
      scancode = 57 /*SDL_SCANCODE_CAPSLOCK*/;
      break;
    case 69:
      scancode = 83 /*SDL_SCANCODE_NUMLOCKCLEAR*/;
      break;
    case 71:
      scancode = 95 /*SDL_SCANCODE_KP_7*/;
      break;
    case 72:
      scancode = 96 /*SDL_SCANCODE_KP_8*/;
      break;
    case 73:
      scancode = 97 /*SDL_SCANCODE_KP_9*/;
      break;
    case 75:
      scancode = 92 /*SDL_SCANCODE_KP_4*/;
      break;
    case 76:
      scancode = 93 /*SDL_SCANCODE_KP_5*/;
      break;
    case 77:
      scancode = 94 /*SDL_SCANCODE_KP_6*/;
      break;
    case 79:
      scancode = 89 /*SDL_SCANCODE_KP_1*/;
      break;
    case 80:
      scancode = 90 /*SDL_SCANCODE_KP_2*/;
      break;
    case 81:
      scancode = 91 /*SDL_SCANCODE_KP_3*/;
      break;
    case 82:
      scancode = 98 /*SDL_SCANCODE_KP_0*/;
      break;
    case 83:
      scancode = 99 /*SDL_SCANCODE_KP_PERIOD*/;
      break;
    case 86:
      scancode = 100 /*SDL_SCANCODE_NONUSBACKSLASH*/;
      break;
    case 96:
      scancode = 88 /*SDL_SCANCODE_KP_ENTER*/;
      break;
    case 98:
      scancode = 84 /*SDL_SCANCODE_KP_DIVIDE*/;
      break;
    case 125:
      scancode = 227 /*SDL_SCANCODE_LGUI*/;
      break;
    case 126:
      scancode = 231 /*SDL_SCANCODE_RGUI*/;
      break;
    case 99:
      scancode = 70 /*SDL_SCANCODE_PRINTSCREEN*/;
      break;
    default:
      return null;
  }
  return sdl$SDL_GetScancodeName(scancode);
}


function bits_per_pixel(format) {
  let bbp = format >> 8 & 255;
  if (bbp === 24) {
    bbp = 32;
  }
  return bbp;
}

export function $init(): void {
  $.modeCount$C4AppSDL = 0;
}

Object.assign($, { KeycodeToString, bits_per_pixel, sdlToC4MCBtn, sdl_scancode_to_keycode });
