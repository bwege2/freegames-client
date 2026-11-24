// Test helper: every GLSL program the original's renderer builds, composed as the original composes them.
// C4Shader (src/graphics/C4Shader.cpp) is not translated yet (it waits for the renderer's translation profile), so
// its slice parser (AddSlices, ParsePosition) and its Build are followed here line by line; the callers' defines,
// slice files and names are those of CStdGL::InitShaders/PrepareSpriteShader (graphics/C4DrawGL.cpp), C4Sky::Init
// (landscape/C4Sky.cpp), C4LandscapeRenderGL::LoadShaders (landscape/C4LandscapeRender.cpp), C4FoW's framebuffer
// and render shaders (landscape/fow/C4FoW.cpp), and the mesh programs of StdMeshMaterialProgram::Compile
// (lib/StdMeshMaterial.cpp) with the code CStdGL::PrepareMaterial generates for a pass (graphics/C4DrawMeshGL.cpp).
// The particles draw with a sprite shader (C4ParticleSystem::DrawGlobalParticles: GetSpriteShader(true, false, false)).
import fs from 'node:fs';
import path from 'node:path';

// C4Shader.h
const C4Shader_Version = 150;
const C4Shader_LastPosition = 256;
// C4SH_PosNames in order: the vertex names come after the fragment names, so a lookup of "normal" finds 80 and
// "color" finds 120; the vertex positions are then only reachable as "texcoord" (50) and "position" (80)
const POS_NAMES: [string, number][] = [
  ['init', 0], ['coordinate', 20], ['texture', 40], ['material', 60], ['normal', 80], ['light', 100], ['color', 120], ['finish', 140],
  ['texcoord', 50], ['normal', 60], ['color', 70], ['position', 80],
];

// C4Draw.h
export const C4SSC_MOD2 = 1, C4SSC_BASE = 2, C4SSC_OVERLAY = 4, C4SSC_LIGHT = 8, C4SSC_NORMAL = 16;

interface Slice { position: number; text: string; source: string; line: number }

const isspace = (c: string | undefined) => c === ' ' || c === '\t' || c === '\n' || c === '\v' || c === '\f' || c === '\r';
const isalnum = (c: string | undefined) => !!c && /[A-Za-z0-9]/.test(c);

/** SGetLine: 1 + the newlines before `pos` */
function sGetLine(text: string, pos: number): number {
  let n = 1;
  for (let i = 0; i < pos && i < text.length; i++) if (text[i] === '\n') n++;
  return n;
}

export class Shader {
  vertex: Slice[] = [];
  fragment: Slice[] = [];
  sourceFiles: string[] = [];
  categories: string[] = [];
  log: string[] = [];

  groups: (file: string) => { text: string; source: string } | null;
  constructor(groups: (file: string) => { text: string; source: string } | null) {
    this.groups = groups;
  }

  addDefine(name: string): void {
    this.vertex.push({ position: -1, text: `#define ${name}`, source: '', line: 0 });
    this.fragment.push({ position: -1, text: `#define ${name}`, source: '', line: 0 });
  }

  addVertexSlices(what: string, text: string, source = ''): void { this.addSlices(this.vertex, what, text, source); }
  addFragmentSlices(what: string, text: string, source = ''): void { this.addSlices(this.fragment, what, text, source); }

  loadVertexSlices(file: string): boolean { return this.loadSlices(this.vertex, file); }
  loadFragmentSlices(file: string): boolean { return this.loadSlices(this.fragment, file); }

  private loadSlices(slices: Slice[], file: string): boolean {
    const found = this.groups(file);
    if (!found) return false;
    this.addSlices(slices, `file ${found.source}`, found.text, found.source);
    return true;
  }

  /** C4Shader::ParsePosition; returns [position, new index] or null */
  private parsePosition(what: string, s: string, p: number): [number, number] | null {
    while (isspace(s[p])) p++;
    const start = p;
    while (isalnum(s[p])) p++;
    const name = s.slice(start, p);
    const hit = POS_NAMES.find(([n]) => n === name);
    if (!hit) { this.log.push(`  gl: Unknown slice position in ${what}: ${name}`); return null; }
    let pos = hit[1];
    while (isspace(s[p])) p++;
    // `+ n` then `- n`, each read with sscanf("%d%n") (which skips white space and takes a sign)
    for (const sign of ['+', '-']) {
      if (s[p] !== sign) continue;
      const mod = /^\s*([+-]?\d+)/.exec(s.slice(p + 1));
      if (!mod) { this.log.push(`  gl: Invalid slice modifier in ${what}`); return null; }
      pos += (sign === '+' ? 1 : -1) * parseInt(mod[1], 10);
      p += 1 + mod[0].length;
    }
    return [pos, p];
  }

  /** C4Shader::AddSlices */
  private addSlices(slices: Slice[], what: string, s: string, source: string): void {
    if (!this.sourceFiles.includes(source)) this.sourceFiles.push(source);
    let start = 0, p = 0, depth = -1, position = -1, gotContent = false;
    const add = (pos: number, text: string, at: number) => slices.push({ position: pos, text, source, line: sGetLine(s, at) });
    while (p < s.length) {
      if (s[p] === '/' && s[p + 1] === '/') { p += 2; while (p < s.length && s[p] !== '\n') p++; continue; }
      if (s[p] === '/' && s[p + 1] === '*') {
        p += 2;
        while (p < s.length && (s[p] !== '*' || s[p + 1] !== '/')) p++;
        if (p < s.length) p += 2;
        continue;
      }
      if (s[p] === '{') { depth++; p++; continue; }
      if (s[p] === '}') {
        if (position !== -1 && !depth) {
          if (gotContent) add(position, s.slice(start, p), start);
          position = -1;
          start = p + 1;
          gotContent = false;
        }
        if (depth >= 0) depth--;
        p++;
        continue;
      }
      if (s[p] === '\n') {
        if (s.startsWith('slice', p + 1) && !isalnum(s[p + 6])) {
          const sliceEnd = p;
          p += 6;
          while (isspace(s[p])) p++;
          if (s[p] !== '(') { p++; continue; }
          p++;
          const parsed = this.parsePosition(what, s, p);
          if (parsed) {
            position = parsed[0];
            p = parsed[1];
            while (isspace(s[p])) p++;
            if (s[p] !== ')') { p++; continue; }
            p++;
            while (isspace(s[p])) p++;
            if (s[p] === '{') {
              if (gotContent) add(-1, s.slice(start, sliceEnd), sliceEnd);
              depth = 0;
              start = p + 1;
              gotContent = false;
            } else {
              this.log.push(`  gl: Missing opening brace in ${what}!`);
            }
            p++;
            continue;
          }
          position = -1;
        }
      }
      if (!isspace(s[p])) gotContent = true;
      p++;
    }
    if (gotContent) add(position, s.slice(start), start);
  }

  /** C4Shader::Build(Slices, fDebug = true) with the GL limits of the context */
  build(slices: Slice[], maxFrag: number, maxVert: number): string {
    let buf = `#version ${C4Shader_Version}\n#define MAX_FRAGMENT_UNIFORM_COMPONENTS ${maxFrag}\n#define MAX_VERTEX_UNIFORM_COMPONENTS ${maxVert}\n`;
    let pos = -1, next = -1;
    do {
      pos = next;
      next = C4Shader_LastPosition + 1;
      if (pos > 0) buf += `\t// Position ${pos}:\n`;
      for (const slice of slices) {
        if (slice.position < pos) continue;
        if (slice.position > pos) { next = Math.min(next, slice.position); continue; }
        if (slice.source.length) {
          buf += `\t// Slice from ${slice.source}:\n#line ${slice.line - (C4Shader_Version < 330 ? 1 : 0)} ${this.sourceFiles.indexOf(slice.source) + 1}\n`;
        } else {
          buf += '\t// Built-in slice:\n#line 1 0\n';
        }
        buf += slice.text;
        if (!buf.endsWith('\n')) buf += '\n';
      }
      if (pos === -1) buf += 'void main() {\n';
    } while (next <= C4Shader_LastPosition);
    buf += '}\n';
    buf += '// File number to name mapping:\n//\t  0: <built-in shader code>\n';
    this.sourceFiles.forEach((f, i) => { buf += `//\t${String(i + 1).padStart(3)}: ${f}\n`; });
    return buf;
  }
}

/** a script shader (C4ScriptShader::Add): category and code; the slice parser needs the leading newline */
export interface ScriptShader { category: string; code: string }

/** the two of planet/ (Objects.ocd/Environment.ocd/Ambience.ocd/Script.c, CommonShaders) */
export const AMBIENCE_SHADERS: Record<string, ScriptShader> = {
  Grayscale: { category: 'Common', code: 'slice(finish + 20) { fragColor = vec4(vec3(0.299*fragColor.r + 0.587*fragColor.g + 0.114*fragColor.b), fragColor.a); }' },
  Psycho: { category: 'Landscape', code: 'slice(color + 1) { fragColor = scalerPx.r < 1 ? materialPx : vec4(vec3(0), materialPx.a); }' },
};

export interface Program { name: string; vertex: string; fragment: string; uniforms: string[]; attributes: string[] }

/** C4Shader::Init's part before the GL calls: script slices of its categories (and its own name), then Build */
function finish(sh: Shader, name: string, scripts: ScriptShader[], limits: Limits, uniforms: string[], attributes: string[]): Program {
  const cats = [...sh.categories, name];
  scripts.forEach((s, id) => {
    if (cats.includes(s.category)) sh.addFragmentSlices(name, '\n' + s.code, `[script ${id}]`);
  });
  return { name, vertex: sh.build(sh.vertex, limits.maxFrag, limits.maxVert), fragment: sh.build(sh.fragment, limits.maxFrag, limits.maxVert), uniforms, attributes };
}

export interface Limits { maxFrag: number; maxVert: number }

const SPRITE_UNIFORMS = ['projectionMatrix', 'modelviewMatrix', 'normalMatrix', 'clrMod', 'gamma', 'resolution', 'baseTex', 'overlayTex',
  'overlayClr', 'lightTex', 'lightTransform', 'normalTex', 'ambientTex', 'ambientTransform', 'ambientBrightness', 'materialAmbient',
  'materialDiffuse', 'materialSpecular', 'materialEmission', 'materialShininess', 'bones', 'cullMode', 'frameCounter'];
const ATTRIBUTES = ['oc_Position', 'oc_Normal', 'oc_TexCoord', 'oc_Color', 'oc_BoneIndices0', 'oc_BoneIndices1', 'oc_BoneWeights0', 'oc_BoneWeights1'];
const LANDSCAPE_UNIFORMS = ['projectionMatrix', 'landscapeTex', 'scalerTex', 'materialTex', 'lightTex', 'ambientTex', 'gamma', 'resolution',
  'center', 'matMapTex', 'materialDepth', 'materialSize', 'ambientBrightness', 'ambientTransform', 'clrMod', 'frameCounter', 'time'];

/** the planet/ text files the shaders load (C4GroupSet::FindEntry over Graphics.ocg and a definition's group) */
export function planetFiles(planet: string): (file: string) => { text: string; source: string } | null {
  const dirs = ['Graphics.ocg', 'Objects.ocd'];
  return (file) => {
    for (const d of dirs) {
      const p = path.join(planet, d, file);
      if (fs.existsSync(p)) return { text: fs.readFileSync(p, 'utf8'), source: `planet/${d}/${file}` };
    }
    return null;
  };
}

/** CStdGL::PrepareSpriteShader */
function spriteShader(files: ReturnType<typeof planetFiles>, name: string, ssc: number, extraDefines: string[], scripts: ScriptShader[], limits: Limits): Program {
  const sh = new Shader(files);
  sh.addDefine('OPENCLONK');
  sh.addDefine('OC_SPRITE');
  if (ssc & C4SSC_MOD2) sh.addDefine('OC_CLRMOD_MOD2');
  if (ssc & C4SSC_NORMAL) sh.addDefine('OC_WITH_NORMALMAP');
  if (ssc & C4SSC_LIGHT) sh.addDefine('OC_DYNAMIC_LIGHT');
  if (ssc & C4SSC_BASE) sh.addDefine('OC_HAVE_BASE');
  if (ssc & C4SSC_OVERLAY) sh.addDefine('OC_HAVE_OVERLAY');
  for (const d of extraDefines) sh.addDefine(d);
  sh.loadVertexSlices('SpriteVertexShader.glsl');
  sh.loadFragmentSlices('CommonShader.glsl');
  sh.loadFragmentSlices('ObjectShader.glsl');
  sh.categories = ['Common', 'Object'];
  return finish(sh, name, scripts, limits, SPRITE_UNIFORMS, ATTRIBUTES.slice(0, 4));
}

/** CStdGL::InitShaders: the 16 sprite shaders */
const SPRITES: [string, number][] = [
  ['sprite', 0], ['spriteMod2', C4SSC_MOD2], ['spriteBase', C4SSC_BASE], ['spriteBaseMod2', C4SSC_MOD2 | C4SSC_BASE],
  ['spriteBaseOverlay', C4SSC_BASE | C4SSC_OVERLAY], ['spriteBaseOverlayMod2', C4SSC_MOD2 | C4SSC_BASE | C4SSC_OVERLAY],
  ['spriteLight', C4SSC_LIGHT], ['spriteLightMod2', C4SSC_LIGHT | C4SSC_MOD2], ['spriteLightBase', C4SSC_LIGHT | C4SSC_BASE],
  ['spriteLightBaseMod2', C4SSC_LIGHT | C4SSC_BASE | C4SSC_MOD2], ['spriteLightBaseOverlay', C4SSC_LIGHT | C4SSC_BASE | C4SSC_OVERLAY],
  ['spriteLightBaseOverlayMod2', C4SSC_LIGHT | C4SSC_BASE | C4SSC_OVERLAY | C4SSC_MOD2],
  ['spriteLightBaseNormal', C4SSC_LIGHT | C4SSC_BASE | C4SSC_NORMAL], ['spriteLightBaseNormalMod2', C4SSC_LIGHT | C4SSC_BASE | C4SSC_NORMAL | C4SSC_MOD2],
  ['spriteLightBaseNormalOverlay', C4SSC_LIGHT | C4SSC_BASE | C4SSC_OVERLAY | C4SSC_NORMAL],
  ['spriteLightBaseNormalOverlayMod2', C4SSC_LIGHT | C4SSC_BASE | C4SSC_OVERLAY | C4SSC_NORMAL | C4SSC_MOD2],
];

/** C4LandscapeRenderGL::LoadShader */
function landscapeShader(files: ReturnType<typeof planetFiles>, name: string, ssc: number, scripts: ScriptShader[], limits: Limits): Program {
  const sh = new Shader(files);
  sh.addDefine('OPENCLONK');
  sh.addDefine('OC_LANDSCAPE');
  if (ssc & C4SSC_LIGHT) sh.addDefine('OC_DYNAMIC_LIGHT');
  sh.loadVertexSlices('LandscapeVertexShader.glsl');
  sh.loadFragmentSlices('CommonShader.glsl');
  sh.loadFragmentSlices('LandscapeShader.glsl');
  sh.categories = ['Common', 'Landscape'];
  return finish(sh, name, scripts, limits, LANDSCAPE_UNIFORMS, ['oc_Position', 'oc_LandscapeTexCoord', 'oc_LightTexCoord']);
}

/** C4FoW::GetFramebufShader, GetRenderShader */
function fowShaders(scripts: ScriptShader[], limits: Limits): Program[] {
  const fb = new Shader(() => null);
  fb.addVertexSlices('built-in FoW framebuf shader', 'in vec2 oc_Position;\nin vec2 oc_TexCoord;\nout vec2 texcoord;\nuniform mat4 projectionMatrix;\n\nslice(position)\n{\n  gl_Position = projectionMatrix * vec4(oc_Position, 0.0, 1.0);\n}\n\nslice(texcoord)\n{\n  texcoord = oc_TexCoord;\n}');
  fb.addFragmentSlices('built-in FoW framebuf shader', 'in vec2 texcoord;\nuniform sampler2D tex;\nout vec4 fragColor;\n\nslice(color)\n{\n  fragColor = texture(tex, texcoord);\n}');
  const render = new Shader(() => null);
  render.addVertexSlices('built-in FoW render shader', 'in vec2 oc_Position;\nin vec4 oc_Color;\nout vec4 vtxColor;\nuniform mat4 projectionMatrix;\nuniform vec2 vertexOffset;\n\nslice(position)\n{\n  gl_Position = projectionMatrix * vec4(oc_Position + vertexOffset, 0.0, 1.0);\n}\n\nslice(color)\n{\n  vtxColor = oc_Color;\n}');
  render.addFragmentSlices('built-in FoW render shader', 'in vec4 vtxColor;\nout vec4 fragColor;\n\nslice(color)\n{\n  fragColor = vtxColor;\n}');
  return [
    finish(fb, 'framebuf', scripts, limits, ['projectionMatrix', 'tex'], ['oc_Position', 'oc_TexCoord']),
    finish(render, 'fowRender', scripts, limits, ['projectionMatrix', 'vertexOffset'], ['oc_Position', 'oc_Color']),
  ];
}

// ---- meshes: CStdGL::PrepareMaterial's generated code (graphics/C4DrawMeshGL.cpp)

/** StdMeshMaterialTextureUnit's blend sources and operations, as the generator names them */
export type Source = 'current' | 'texture' | 'diffuse' | 'specular' | 'player_colour' | 'manual';
export type Blend = 'source1' | 'source2' | 'modulate' | 'modulate_x2' | 'modulate_x4' | 'add' | 'add_signed' | 'add_smooth' | 'subtract'
  | 'blend_diffuse_alpha' | 'blend_texture_alpha' | 'blend_current_alpha' | 'blend_manual' | 'dotproduct' | 'blend_diffuse_colour';
export const BLENDS: Blend[] = ['source1', 'source2', 'modulate', 'modulate_x2', 'modulate_x4', 'add', 'add_signed', 'add_smooth', 'subtract',
  'blend_diffuse_alpha', 'blend_texture_alpha', 'blend_current_alpha', 'blend_manual', 'dotproduct', 'blend_diffuse_colour'];
export const SOURCES: Source[] = ['current', 'texture', 'diffuse', 'specular', 'player_colour', 'manual'];

export interface TexUnit {
  texture: boolean; anim: boolean;
  colorOp: Blend; colorSrc: [Source, Source]; alphaOp: Blend; alphaSrc: [Source, Source];
}
export type AlphaReject = 'always_pass' | 'always_fail' | 'less' | 'less_equal' | 'equal' | 'not_equal' | 'greater' | 'greater_equal';
export interface Pass { units: TexUnit[]; alphaReject: AlphaReject; alphaValue: number }

/** C's %f */
const f = (x: number) => x.toFixed(6);

function tex2D(i: number, anim: boolean): string {
  return anim ? `texture(oc_Texture${i}, (oc_TextureMatrix${i} * vec4(texcoord, 0.0, 1.0)).xy)` : `texture(oc_Texture${i}, texcoord)`;
}
function sourceCode(i: number, s: Source, anim: boolean): string {
  switch (s) {
    case 'current': return 'currentColor';
    case 'texture': return tex2D(i, anim);
    case 'diffuse': case 'specular': return 'diffuse';
    case 'player_colour': return 'vec4(oc_PlayerColor, 1.0)';
    case 'manual': return `vec4(${f(0.5)}, ${f(0.25)}, ${f(0.75)}, ${f(1)})`;
  }
}
function blendCode(i: number, b: Blend, s1: string, s2: string, anim: boolean): string {
  const m = 0.5;
  switch (b) {
    case 'source1': return s1;
    case 'source2': return s2;
    case 'modulate': return `${s1} * ${s2}`;
    case 'modulate_x2': return `2.0 * ${s1} * ${s2}`;
    case 'modulate_x4': return `4.0 * ${s1} * ${s2}`;
    case 'add': return `${s1} + ${s2}`;
    case 'add_signed': return `${s1} + ${s2} - 0.5`;
    case 'add_smooth': return `${s1} + ${s2} - ${s1}*${s2}`;
    case 'subtract': return `${s1} - ${s2}`;
    case 'blend_diffuse_alpha': return `diffuse.a * ${s1} + (1.0 - diffuse.a) * ${s2}`;
    case 'blend_texture_alpha': return `${tex2D(i, anim)}.a * ${s1} + (1.0 - ${tex2D(i, anim)}.a) * ${s2}`;
    case 'blend_current_alpha': return `currentColor.a * ${s1} + (1.0 - currentColor.a) * ${s2}`;
    case 'blend_manual': return `${f(m)} * ${s1} + (1.0 - ${f(m)}) * ${s2}`;
    case 'dotproduct': return `vec3(4.0 * dot(${s1} - 0.5, ${s2} - 0.5), 4.0 * dot(${s1} - 0.5, ${s2} - 0.5), 4.0 * dot(${s1} - 0.5, ${s2} - 0.5))`;
    case 'blend_diffuse_colour': return `diffuse.rgb * ${s1} + (1.0 - diffuse.rgb) * ${s2}`;
  }
}
/** TextureUnitToCode */
function unitCode(i: number, u: TexUnit): string {
  const c1 = `${sourceCode(i, u.colorSrc[0], u.anim)}.rgb`, c2 = `${sourceCode(i, u.colorSrc[1], u.anim)}.rgb`;
  const a1 = `${sourceCode(i, u.alphaSrc[0], u.anim)}.a`, a2 = `${sourceCode(i, u.alphaSrc[1], u.anim)}.a`;
  return `currentColor = vec4(${blendCode(i, u.colorOp, c1, c2, u.anim)}, ${blendCode(i, u.alphaOp, a1, a2, u.anim)});\n`;
}
/** AlphaTestToCode */
function alphaTest(p: Pass): string {
  const v = f(p.alphaValue);
  switch (p.alphaReject) {
    case 'always_pass': return '';
    case 'always_fail': return 'discard;';
    case 'less': return `if (!(fragColor.a < ${v})) discard;`;
    case 'less_equal': return `if (!(fragColor.a <= ${v})) discard;`;
    case 'equal': return `if (!(fragColor.a == ${v})) discard;`;
    case 'not_equal': return `if (!(fragColor.a != ${v})) discard;`;
    case 'greater': return `if (!(fragColor.a > ${v})) discard;`;
    case 'greater_equal': return `if (!(fragColor.a >= ${v})) discard;`;
  }
}
/** GetFragmentShaderCodeForPass */
export function meshFragmentCode(p: Pass): { code: string; params: string[] } {
  let texIndex = 0, units = '', decls = '';
  const params: string[] = [];
  for (const u of p.units) {
    units += unitCode(texIndex, u);
    if (u.texture) {
      decls += `uniform sampler2D oc_Texture${texIndex};\n`;
      params.push(`oc_Texture${texIndex}`);
      if (u.anim) { decls += `uniform mat4 oc_TextureMatrix${texIndex};\n`; params.push(`oc_TextureMatrix${texIndex}`); }
      texIndex++;
    }
  }
  const code = `${decls}\nuniform vec3 oc_PlayerColor;\n\nslice(texture)\n{\n  vec4 diffuse = fragColor;\n  vec4 currentColor = diffuse;\n  ${units}\n  fragColor = currentColor;\n}\n\nslice(finish)\n{\n  ${alphaTest(p)}\n}\n`;
  return { code, params };
}

/** StdMeshMaterialProgram::CompileShader for one ssc of a pass's program */
function meshProgram(files: ReturnType<typeof planetFiles>, name: string, vertexCode: string, vertexFile: string, fragmentCode: string, fragmentFile: string,
  params: string[], ssc: number, scripts: ScriptShader[], limits: Limits): Program {
  const sh = new Shader(files);
  // C4DefAdditionalResourcesLoader::AddShaderSlices
  sh.addDefine('OPENCLONK');
  sh.addDefine('OC_MESH');
  if (ssc & C4SSC_MOD2) sh.addDefine('OC_CLRMOD_MOD2');
  if (ssc & C4SSC_LIGHT) sh.addDefine('OC_DYNAMIC_LIGHT');
  sh.loadFragmentSlices('CommonShader.glsl');
  sh.loadFragmentSlices('ObjectShader.glsl');
  sh.categories = ['Common', 'Object'];
  sh.addVertexSlices(vertexFile, vertexCode, vertexFile);
  sh.addFragmentSlices(fragmentFile, fragmentCode, fragmentFile);
  let full = name;
  if (ssc !== 0) full += ':';
  if (ssc & C4SSC_LIGHT) full += 'Light';
  if (ssc & C4SSC_MOD2) full += 'Mod2';
  const uniforms = [...SPRITE_UNIFORMS];
  uniforms[8] = 'oc_PlayerColor';
  return finish(sh, full, scripts, limits, [...uniforms, ...params], ATTRIBUTES);
}

const MESH_SSC = [0, C4SSC_MOD2, C4SSC_LIGHT, C4SSC_LIGHT | C4SSC_MOD2];

/**
 * The passes whose generated code covers every construct GetFragmentShaderCodeForPass can write: each blend
 * operation for colour and alpha, each source, texture animation on and off, each alpha test. (The planet's 186
 * material scripts use a subset; StdMeshMaterial's parser is not translated yet, so the set is not read from them.)
 */
export function generatorPasses(): { label: string; pass: Pass }[] {
  const out: { label: string; pass: Pass }[] = [];
  const unit = (over: Partial<TexUnit> = {}): TexUnit => ({ texture: true, anim: false, colorOp: 'modulate', colorSrc: ['texture', 'current'], alphaOp: 'modulate', alphaSrc: ['texture', 'current'], ...over });
  out.push({ label: 'plain', pass: { units: [unit()], alphaReject: 'always_pass', alphaValue: 0 } });
  out.push({ label: 'no texture unit', pass: { units: [], alphaReject: 'always_pass', alphaValue: 0 } });
  out.push({ label: 'animated texture', pass: { units: [unit({ anim: true })], alphaReject: 'always_pass', alphaValue: 0 } });
  for (const b of BLENDS) {
    // the colour operation on rgb; the alpha operation on a. dotproduct gives a vec3: on the alpha side it is not a
    // float (a TODO of the original, the program fails to compile there as well), so it is tried on the colour side
    out.push({ label: `colour ${b}`, pass: { units: [unit({ colorOp: b, colorSrc: ['texture', 'diffuse'] })], alphaReject: 'always_pass', alphaValue: 0 } });
    if (b !== 'dotproduct') out.push({ label: `alpha ${b}`, pass: { units: [unit({ alphaOp: b, alphaSrc: ['texture', 'diffuse'] })], alphaReject: 'always_pass', alphaValue: 0 } });
  }
  for (const s of SOURCES) {
    out.push({ label: `source ${s}`, pass: { units: [unit({ colorOp: 'source1', colorSrc: [s, 'current'], alphaOp: 'source1', alphaSrc: [s, 'current'] })], alphaReject: 'always_pass', alphaValue: 0 } });
  }
  for (const a of ['always_fail', 'less', 'less_equal', 'equal', 'not_equal', 'greater', 'greater_equal'] as AlphaReject[]) {
    out.push({ label: `alpha_rejection ${a}`, pass: { units: [unit()], alphaReject: a, alphaValue: 0.5 } });
  }
  out.push({ label: 'two units, player colour', pass: { units: [unit(), unit({ colorOp: 'blend_current_alpha', colorSrc: ['player_colour', 'current'], alphaOp: 'source2' })], alphaReject: 'greater_equal', alphaValue: 0.5 } });
  return out;
}

/** every program of the original's renderer; `scripts`: active script shaders (C4ScriptShader) */
export function originalPrograms(planet: string, limits: Limits, scripts: ScriptShader[] = []): Program[] {
  const files = planetFiles(planet);
  const out: Program[] = [];
  for (const [name, ssc] of SPRITES) out.push(spriteShader(files, name, ssc, [], scripts, limits));
  // C4Sky::Init: BASE when the scenario has a sky surface
  for (const base of [true, false]) {
    out.push({ ...spriteShader(files, 'Sky', base ? C4SSC_BASE : 0, ['OC_SKY'], scripts, limits), name: `Sky${base ? '' : ' (no surface)'}` });
    out.push({ ...spriteShader(files, 'SkyLight', (base ? C4SSC_BASE : 0) | C4SSC_LIGHT, ['OC_SKY'], scripts, limits), name: `SkyLight${base ? '' : ' (no surface)'}` });
  }
  out.push(landscapeShader(files, 'landscape', 0, scripts, limits));
  out.push(landscapeShader(files, 'landscapeLight', C4SSC_LIGHT, scripts, limits));
  out.push(...fowShaders(scripts, limits));
  // meshes: the auto-generated vertex shader (MeshVertexShader.glsl, GetVertexShaderCodeForPass) with every pass
  const meshVertex = files('MeshVertexShader.glsl');
  if (!meshVertex) throw new Error('MeshVertexShader.glsl missing');
  for (const { label, pass } of generatorPasses()) {
    const { code, params } = meshFragmentCode(pass);
    for (const ssc of MESH_SSC) {
      out.push(meshProgram(files, `mesh ${label}`, meshVertex.text, 'auto-generated vertex shader', code, 'auto-generated fragment shader', params, ssc, scripts, limits));
    }
  }
  // GetVertexShaderCodeForPass's two workarounds: software transform (Workarounds.ForceSoftwareTransform) and the
  // transposed bones CStdGL::PrepareMaterial retries with when a program does not link (LowMaxVertexUniformCount)
  {
    const { code, params } = meshFragmentCode(generatorPasses()[0].pass);
    out.push(meshProgram(files, 'mesh plain (software transform)', '#define OC_WA_FORCE_SOFTWARE_TRANSFORM\n' + meshVertex.text, 'auto-generated vertex shader', code, 'auto-generated fragment shader', params, 0, scripts, limits));
    out.push(meshProgram(files, 'mesh plain (low vertex uniforms)', '#define OC_WA_LOW_MAX_VERTEX_UNIFORM_COMPONENTS\n' + meshVertex.text, 'auto-generated vertex shader', code, 'auto-generated fragment shader', params, 0, scripts, limits));
  }
  // the one custom program of planet/: Objects.ocd/normal_map.material (normal_map_vertex/fragment.glsl)
  const nv = files('normal_map_vertex.glsl'), nf = files('normal_map_fragment.glsl');
  if (!nv || !nf) throw new Error('normal_map shaders missing');
  for (const ssc of MESH_SSC) {
    out.push(meshProgram(files, 'NormalMap:0:0', nv.text, 'normal_map_vertex.glsl', nf.text, 'normal_map_fragment.glsl', ['basemap', 'normalTex'], ssc, scripts, limits));
  }
  return out;
}
