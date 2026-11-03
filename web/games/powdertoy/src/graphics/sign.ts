// simulation/Sign.cpp: sign::getDisplayText and sign::split (the text a sign shows and its box), used by
// Renderer.DrawSigns and the UI (sign tool, clicking on link signs).
import { CELL, ID, XRES, YRES } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import { sd } from '../sim/simulationData.ts';
import type { Particle } from '../sim/particle.ts';
import type { Simulation, Sign } from '../sim/simulation.ts';
import { TextSize } from './raster.ts';

/** sign::Justification */
export const SIGN_Left = 0, SIGN_Middle = 1, SIGN_Right = 2, SIGN_None = 3, SIGN_Max = 4;
/** sign::Type */
export const SIGN_Normal = 0, SIGN_Save = 1, SIGN_Thread = 2, SIGN_Button = 3, SIGN_Search = 4;

/**
 * std::ostream << float with Format::Precision(Format::ShowPoint(v), 2): printf("%#.2g") (classic locale)
 */
export function formatShowPointPrecision(v: number, precision: number): string {
  if (Number.isNaN(v)) return v < 0 ? '-nan' : 'nan';
  if (!Number.isFinite(v)) return v < 0 ? '-inf' : 'inf';
  const p = precision === 0 ? 1 : precision;
  const exp = v.toExponential(p - 1); // d.ddde+X, rounded as printf rounds (round half to even on the binary value)
  const X = parseInt(exp.slice(exp.indexOf('e') + 1), 10);
  if (X < -4 || X >= p) {
    let mant = exp.slice(0, exp.indexOf('e'));
    if (!mant.includes('.')) mant += '.';
    const ax = Math.abs(X);
    return mant + 'e' + (X < 0 ? '-' : '+') + (ax < 10 ? '0' : '') + ax;
  }
  let s = v.toFixed(p - 1 - X);
  if (!s.includes('.')) s += '.';
  return s;
}

/** sign::split */
export function sign_split(text: string): [number, number] {
  let pipe = 0;
  if (text.length >= 4 && text[0] === '{' && text[text.length - 1] === '}') {
    switch (text[1]) {
      case 'c':
      case 't':
        if (text[2] === ':' && (pipe = text.indexOf('|', 4)) !== -1) {
          for (let i = 3; i < pipe; ++i) {
            if (text[i] < '0' || text[i] > '9') return [0, SIGN_Normal];
          }
          return [pipe, text[1] === 'c' ? SIGN_Save : SIGN_Thread];
        }
        break;
      case 'b':
        if (text[2] === '|') return [2, SIGN_Button];
        break;
      case 's':
        if (text[2] === ':' && (pipe = text.indexOf('|', 3)) !== -1) return [pipe, SIGN_Search];
        break;
    }
  }
  return [0, SIGN_Normal];
}

export interface SignDisplay {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** *v95 */
  v95: boolean;
}

/** sign::getDisplayText(sim, x0, y0, w, h, colorize, v95): the out-parameters are the result's fields */
export function sign_getDisplayText(sign: Sign, sim: Simulation | null, colorize = true): SignDisplay {
  const text = sign.text;
  const x = sign.x, y = sign.y;
  let v95 = false;
  let drawable_text: string;
  let si: [number, number] = [0, SIGN_Normal];
  if (text.indexOf('{') === -1) {
    drawable_text = text;
  } else {
    si = sign_split(text);
    if (si[0]) {
      drawable_text = text.substring(si[0] + 1, text.length - 1);
    } else {
      let part: Particle | null = null;
      let pressure = 0.0;
      let aheat = 0.0;
      if (sim && x >= 0 && x < XRES && y >= 0 && y < YRES) {
        if (sim.photons[y][x]) part = sim.parts[ID(sim.photons[y][x])];
        else if (sim.pmap[y][x]) part = sim.parts[ID(sim.pmap[y][x])];
        pressure = sim.pv[(y / CELL) | 0][(x / CELL) | 0];
        aheat = f(sim.hv[(y / CELL) | 0][(x / CELL) | 0] - f(273.15));
      }

      let remaining_text = text;
      let formatted_text = '';
      for (;;) {
        const l = remaining_text.indexOf('{');
        if (l === -1) break;
        const after_left_curly = remaining_text.substring(l + 1);
        const r = after_left_curly.indexOf('}');
        if (r === -1) break;
        formatted_text += remaining_text.substring(0, l);
        remaining_text = after_left_curly.substring(r + 1);
        const between_curlies = after_left_curly.substring(0, r);
        if (between_curlies === 't' || between_curlies === 'temp') {
          formatted_text += formatShowPointPrecision(part ? f(part.temp - f(273.15)) : 0.0, 2);
          v95 = true;
        } else if (between_curlies === 'p' || between_curlies === 'pres') {
          formatted_text += formatShowPointPrecision(pressure, 2);
          v95 = true;
        } else if (between_curlies === 'a' || between_curlies === 'aheat') {
          formatted_text += formatShowPointPrecision(aheat, 2);
          v95 = true;
        } else if (between_curlies === 'type') {
          formatted_text += part ? sd.BasicParticleInfo(part) : (formatted_text.length ? 'empty' : 'Empty');
          v95 = true;
        } else if (between_curlies === 'ctype') {
          formatted_text += part
            ? (sd.IsElementOrNone(part.ctype) ? sd.ElementResolve(part.ctype, -1) : String(part.ctype))
            : (formatted_text.length ? 'empty' : 'Empty');
          v95 = true;
        } else if (between_curlies === 'life') {
          formatted_text += String(part ? part.life : 0);
          v95 = true;
        } else if (between_curlies === 'tmp') {
          formatted_text += String(part ? part.tmp : 0);
          v95 = true;
        } else if (between_curlies === 'tmp2') {
          formatted_text += String(part ? part.tmp2 : 0);
          v95 = true;
        } else {
          formatted_text += '{' + between_curlies + '}';
        }
      }
      formatted_text += remaining_text;
      drawable_text = formatted_text;
    }
  }

  if (colorize) {
    switch (si[1]) {
      case SIGN_Normal: break;
      case SIGN_Save: drawable_text = '\bt' + drawable_text; break;
      case SIGN_Thread: drawable_text = '\bl' + drawable_text; break;
      case SIGN_Button: drawable_text = '\bo' + drawable_text; break;
      case SIGN_Search: drawable_text = '\bu' + drawable_text; break;
    }
  }

  const w = TextSize(drawable_text).X + 4;
  const h = 15;
  const x0 = (sign.ju === SIGN_Right) ? x - w : (sign.ju === SIGN_Left) ? x : x - ((w / 2) | 0);
  const y0 = (y > 18) ? y - 18 : y + 4;
  return { text: drawable_text, x: x0, y: y0, w, h, v95 };
}
