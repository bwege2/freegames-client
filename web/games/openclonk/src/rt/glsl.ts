// OpenClonk in the browser: the original's shaders on WebGL2. C4Shader (graphics/C4Shader.cpp) builds every program
// from slices with `#version 150` (GLSL 1.50, OpenGL 3.2 core); WebGL2 compiles GLSL ES 3.00, which has the same
// `in`/`out`, `texture()` and fragment outputs but differs in a few points. `toGlslEs` is the one place the
// sources are changed, just before glShaderSource hands them to WebGL2 (rt/gl.ts); everything else of the
// original's text stays as it is. test/shaders.test.ts compiles and links every program the original builds, with
// and without this rewrite, in headless Chromium.
//
// The changes, and why:
//  1. `#version 150` -> `#version 300 es`: the version WebGL2 accepts.
//  2. default precisions after it: GLSL ES has no default float precision in fragment shaders, and none at all
//     for sampler2DArray (the landscape's material textures); highp everywhere is what desktop GLSL computes with.
//  3. `sampler1D` -> `sampler2D`, and texture(s, x) on such a sampler -> texture(s, vec2(x, 0.5)): GLSL ES has no
//     1D textures. rt/gl.ts stores a 1D texture (glTexImage1D, C4LandscapeRender's material map) as a 2D
//     texture of height 1, so the lookup at the middle row reads the same texel.
//  4. implicit int-to-float conversions -> explicit: GLSL 1.50 converts an int to float where a float is needed
//     (GLSL 1.20 on), GLSL ES 3.00 never does. The original's shaders rely on it in a few places
//     (LandscapeShader.glsl: `float materialIx = int(...)`, `materialDepth - 1`; the Psycho ambience shader:
//     `scalerPx.r < 1`). An integer literal next to a float operand becomes a float literal, and an int(...)
//     initialising or assigned to a float becomes float(int(...)), which is what the implicit conversion does.
//     (An int vector's component next to an integer literal would be taken for a float: the original's shaders have
//     none; the test lists every line the rewrite changes.)
// The precision statements add lines before the first `#line` of C4Shader::Build, which sets the numbers the
// compiler reports anyway, so its messages keep naming the original's files and lines.

/** the GLSL ES precision statements the rewrite puts after the version line */
export const PRECISION = 'precision highp float;\nprecision highp int;\nprecision highp sampler2D;\nprecision highp sampler2DArray;\n';

/** which of the changes above to make (all by default; the test switches single ones off to show they are needed) */
export interface GlslEsSteps { version?: boolean; sampler1D?: boolean; floats?: boolean }

/** the original's source as GLSL ES 3.00 for WebGL2 (see above) */
export function toGlslEs(source: string, steps: GlslEsSteps = {}): string {
  let out = source;
  // 1, 2: the version line (C4Shader::Build writes it first) and the precisions
  if (steps.version !== false) {
    const version = /^[ \t]*#version[ \t]+\d+(?:[ \t]+\w+)?[ \t]*(?:\r?\n|$)/;
    out = version.test(out) ? out.replace(version, `#version 300 es\n${PRECISION}`) : `#version 300 es\n${PRECISION}${out}`;
  }
  // 3: 1D samplers
  if (steps.sampler1D !== false) out = rewrite1D(out);
  // 4: implicit int-to-float conversions
  if (steps.floats !== false) out = explicitFloats(out);
  return out;
}

/** the index after the bracket that closes the one at `open` (round brackets), or -1 */
function closing(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0) return i + 1;
  }
  return -1;
}

/** splits the arguments between the brackets at [open, close) at top-level commas */
function args(s: string, open: number, close: number): string[] {
  const out: string[] = [];
  let depth = 0, start = open + 1;
  for (let i = open + 1; i < close - 1; i++) {
    if (s[i] === '(' || s[i] === '[') depth++;
    else if (s[i] === ')' || s[i] === ']') depth--;
    else if (s[i] === ',' && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start, close - 1));
  return out;
}

function rewrite1D(src: string): string {
  const names = [...src.matchAll(/\buniform\s+sampler1D\s+(\w+)/g)].map((m) => m[1]);
  if (!names.length) return src;
  let out = src.replace(/\bsampler1D\b/g, 'sampler2D');
  for (const name of names) {
    const call = new RegExp(`\\btexture\\s*\\(\\s*${name}\\b`, 'g');
    let m: RegExpExecArray | null;
    while ((m = call.exec(out))) {
      const open = out.indexOf('(', m.index);
      const close = closing(out, open);
      if (close < 0) break;
      const [sampler, coord, ...rest] = args(out, open, close);
      const replaced = `texture(${sampler.trim()}, vec2(${coord.trim()}, 0.5)${rest.length ? ', ' + rest.join(',').trim() : ''})`;
      out = out.slice(0, m.index) + replaced + out.slice(close);
      call.lastIndex = m.index + replaced.length;
    }
  }
  return out;
}

/** the names declared as float scalars (uniforms, inputs, locals, constants, parameters) */
function floatNames(src: string): Set<string> {
  const names = new Set<string>();
  for (const m of src.matchAll(/\bfloat\s+(\w+)\s*(?=[=;,)\[])/g)) names.add(m[1]);
  // further names of a declaration list: float a = ..., b = ...;
  for (const m of src.matchAll(/\bfloat\s+\w+[^;(){}]*;/g)) {
    for (const n of m[0].matchAll(/,\s*(\w+)\s*(?==|,|;)/g)) names.add(n[1]);
  }
  return names;
}

/** a float operand: a float name, a float literal, a component of a vector (.r, .xy is not), a float() call */
function isFloatOperand(op: string, floats: Set<string>): boolean {
  const t = op.trim();
  if (/^[0-9]*\.[0-9]+(?:[eE][+-]?\d+)?f?$|^[0-9]+\.(?:[eE][+-]?\d+)?f?$|^[0-9]+[eE][+-]?\d+f?$/.test(t)) return true;
  if (/^\w+\.[xyzwrgbastpq]$/.test(t)) return true;
  if (/^float\s*\(/.test(t)) return true;
  return floats.has(t);
}

function explicitFloats(src: string): string {
  const floats = floatNames(src);
  let out = src;
  // an int(...) that initialises a float (`float x = int(...)`) or is assigned to one (`x = int(...)`): float(int(...))
  const wraps: [number, number][] = [];
  for (const m of out.matchAll(/\b(?:float\s+(\w+)|(\w+))\s*=\s*int\s*\(/g)) {
    if (m[2] !== undefined && !floats.has(m[2])) continue;
    const close = closing(out, m.index + m[0].length - 1);
    if (close > 0) wraps.push([m.index + m[0].lastIndexOf('int'), close]);
  }
  for (const [a, b] of wraps.reverse()) out = `${out.slice(0, a)}float(${out.slice(a, b)})${out.slice(b)}`;
  // an integer literal as the other operand of a float in + - * / < > <= >= == !=: a float literal
  const operand = String.raw`(?:\w+\.[xyzwrgbastpq]|[A-Za-z_]\w*|[0-9]*\.[0-9]+f?)`;
  const left = new RegExp(String.raw`(${operand})(\s*(?:[-+*/]|[<>]=?|[!=]=)\s*)(\d+)(?![\w.])`, 'g');
  const right = new RegExp(String.raw`(?<![\w.])(\d+)(\s*(?:[-+*/]|[<>]=?|[!=]=)\s*)(${operand})(?![\w(])`, 'g');
  const isIndexContext = (s: string, at: number) => s.lastIndexOf('[', at) > s.lastIndexOf(']', at);
  out = out.replace(left, (all, a: string, op: string, n: string, offset: number, whole: string) =>
    isFloatOperand(a, floats) && !isIndexContext(whole, offset) && !/^\s*#/.test(lineAt(whole, offset)) ? `${a}${op}${n}.0` : all);
  out = out.replace(right, (all, n: string, op: string, b: string, offset: number, whole: string) =>
    isFloatOperand(b, floats) && !isIndexContext(whole, offset) && !/^\s*#/.test(lineAt(whole, offset)) ? `${n}.0${op}${b}` : all);
  return out;
}

function lineAt(s: string, at: number): string {
  const start = s.lastIndexOf('\n', at) + 1;
  const end = s.indexOf('\n', at);
  return s.slice(start, end < 0 ? s.length : end);
}
