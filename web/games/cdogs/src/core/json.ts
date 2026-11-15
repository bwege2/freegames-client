// C-Dogs SDL 2.5.0, translated: json_utils.c (the Load* helpers over the original's JSON tree).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
//
// The original parses with its own json.c and reads numbers from their text: LoadInt is atoi (so 1.5 is 1),
// LoadFloat is strtof, LoadDouble atof, LoadFullInt atoi / 256.0f, LoadBool is "node is JSON true". JSON.parse
// gives the same values for the original's data files.
import { f32, toInt, StrColor, type Color, type Vec2, type Vec2i, type Rect2i } from './base.ts';

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
export type JsonObj = { [k: string]: Json };

export function isObj(n: Json | undefined): n is JsonObj {
  return typeof n === 'object' && n !== null && !Array.isArray(n);
}

export function has(node: Json | undefined, name: string): boolean {
  return isObj(node) && Object.prototype.hasOwnProperty.call(node, name);
}

function val(node: Json | undefined, name: string): Json | undefined {
  if (!isObj(node)) return undefined;
  if (!Object.prototype.hasOwnProperty.call(node, name)) return undefined;
  return node[name];
}

/** atoi of a node's text */
export function atoiNode(v: Json | undefined): number {
  if (typeof v === 'number') return toInt(v);
  if (typeof v === 'string') {
    const m = /^\s*[+-]?\d+/.exec(v);
    return m ? parseInt(m[0], 10) | 0 : 0;
  }
  if (v === true) return 0;
  return 0;
}
function atofNode(v: Json | undefined): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function LoadInt(node: Json | undefined, name: string, def: number): number {
  const v = val(node, name);
  if (v === undefined || v === null) return def;
  return atoiNode(v);
}
export function LoadFloat(node: Json | undefined, name: string, def: number): number {
  const v = val(node, name);
  if (v === undefined || v === null) return def;
  return f32(atofNode(v));
}
export function LoadDouble(node: Json | undefined, name: string, def: number): number {
  const v = val(node, name);
  if (v === undefined || v === null) return def;
  return atofNode(v);
}
/** LoadFullInt: atoi(text) / 256.0f */
export function LoadFullInt(node: Json | undefined, name: string, def: number): number {
  const v = val(node, name);
  if (v === undefined || v === null) return def;
  return f32(atoiNode(v) / 256);
}
export function LoadBool(node: Json | undefined, name: string, def: boolean): boolean {
  const v = val(node, name);
  if (v === undefined || v === null) return def;
  return v === true;
}
export function LoadStr(node: Json | undefined, name: string): string | null {
  const v = val(node, name);
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return null;
}
export function GetString(node: Json | undefined, name: string): string {
  return LoadStr(node, name) ?? '';
}
export function LoadVec2i(node: Json | undefined, name: string, def: Vec2i): Vec2i {
  const v = val(node, name);
  if (!Array.isArray(v)) return def;
  return { x: atoiNode(v[0]), y: atoiNode(v[1]) };
}
export function LoadVec2(node: Json | undefined, name: string, def: Vec2): Vec2 {
  const v = val(node, name);
  if (!Array.isArray(v)) return def;
  return { x: f32(atofNode(v[0])), y: f32(atofNode(v[1])) };
}
export function LoadRect2i(node: Json | undefined, name: string, def: Rect2i): Rect2i {
  const v = val(node, name);
  if (!Array.isArray(v)) return def;
  return { Pos: { x: atoiNode(v[0]), y: atoiNode(v[1]) }, Size: { x: atoiNode(v[2]), y: atoiNode(v[3]) } };
}
export function LoadIntArray(node: Json | undefined, name: string): number[] {
  const v = val(node, name);
  if (!Array.isArray(v)) return [];
  return v.map((x) => atoiNode(x));
}
export function LoadColor(node: Json | undefined, name: string, def: Color): Color {
  const v = val(node, name);
  if (v === undefined || v === null) return def;
  return StrColor(typeof v === 'string' ? v : String(v));
}
export function child(node: Json | undefined, name: string): Json | undefined {
  return val(node, name);
}
export function arr(node: Json | undefined, name: string): Json[] {
  const v = val(node, name);
  return Array.isArray(v) ? v : [];
}
