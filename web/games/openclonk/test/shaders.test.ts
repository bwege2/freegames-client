// The original's shaders and OpenGL calls on WebGL2, in headless Chromium (puppeteer-core; Chromium as
// web/scripts/e2e.mjs finds it, or $CHROME). Every program the original's renderer builds (test/shaders.ts: the 16
// sprite shaders, the sky's, the landscape's, the fog of war's two, the meshes' generated and custom programs, each
// with and without light, and with planet's two script shaders) compiles and links after src/rt/glsl.ts's rewrite;
// each step of the rewrite is shown to be needed by the programs that fail without it; the rewrite changes exactly
// the lines listed here. Then src/rt/gl.ts draws with the original's sprite shader through the gl$ functions the
// translated code will call: C4BltVertex objects as vertex data, a BGRA texture, row-major matrices, a base-vertex
// draw, and reads the pixels back as BGRA.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planet } from './oracle.ts';
import { originalPrograms, AMBIENCE_SHADERS, type Program } from './shaders.ts';
import { toGlslEs, PRECISION, type GlslEsSteps } from '../src/rt/glsl.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const skip = !fs.existsSync(planet) ? 'no reference source (re/openclonk/fetch.sh)' : !chrome ? 'no Chromium (set CHROME)' : false;

interface Result { name: string; ok: boolean; log: string }

/** compiles and links each program on the page's WebGL2 context */
async function compileAll(page: any, programs: { name: string; vertex: string; fragment: string }[]): Promise<Result[]> {
  return page.evaluate((list: { name: string; vertex: string; fragment: string }[]) => {
    const gl = (document.getElementById('c') as HTMLCanvasElement).getContext('webgl2')!;
    return list.map((p) => {
      const compile = (type: number, text: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, text);
        gl.compileShader(s);
        return { s, ok: !!gl.getShaderParameter(s, gl.COMPILE_STATUS), log: gl.getShaderInfoLog(s) ?? '' };
      };
      const v = compile(gl.VERTEX_SHADER, p.vertex), f = compile(gl.FRAGMENT_SHADER, p.fragment);
      let ok = false, log = v.log + f.log;
      if (v.ok && f.ok) {
        const prog = gl.createProgram()!;
        gl.attachShader(prog, v.s);
        gl.attachShader(prog, f.s);
        gl.linkProgram(prog);
        ok = !!gl.getProgramParameter(prog, gl.LINK_STATUS);
        log += gl.getProgramInfoLog(prog) ?? '';
        gl.deleteProgram(prog);
      }
      gl.deleteShader(v.s);
      gl.deleteShader(f.s);
      return { name: p.name, ok, log };
    });
  }, programs);
}

test('the original\'s programs compile and link on WebGL2 after the rewrite, and each step of it is needed', { skip, timeout: 300_000 }, async () => {
  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage();
    await page.setContent('<canvas id="c" width="16" height="16"></canvas>');
    const limits = await page.evaluate(() => {
      const gl = (document.getElementById('c') as HTMLCanvasElement).getContext('webgl2')!;
      return { maxFrag: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS) as number, maxVert: gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS) as number };
    });
    const plain = originalPrograms(planet, limits);
    const withScripts = originalPrograms(planet, limits, Object.values(AMBIENCE_SHADERS)).map((p) => ({ ...p, name: `${p.name} +ambience` }));
    const all: Program[] = [...plain, ...withScripts];
    assert.ok(plain.length >= 200, `${plain.length} programs`);
    for (const kind of ['sprite', 'Sky', 'landscape', 'landscapeLight', 'framebuf', 'fowRender', 'mesh plain:Light', 'NormalMap:0:0:LightMod2']) {
      assert.ok(plain.some((p) => p.name === kind || p.name.startsWith(kind + ' ')), `${kind} is among them`);
    }
    const run = (steps: GlslEsSteps) => compileAll(page, all.map((p) => ({ name: p.name, vertex: toGlslEs(p.vertex, steps), fragment: toGlslEs(p.fragment, steps) })));

    const full = await run({});
    const failed = full.filter((r) => !r.ok);
    assert.deepEqual(failed.map((r) => `${r.name}: ${r.log.split('\n')[0]}`), [], 'every program links');
    console.log(`# ${full.length} programs (${plain.length} without script shaders) compile and link on ${await page.evaluate(() => {
      const gl = (document.getElementById('c') as HTMLCanvasElement).getContext('webgl2')!;
      return String(gl.getParameter(gl.VERSION));
    })}`);

    // without each step: who fails, and the compiler's reason
    const fails = async (steps: GlslEsSteps) => (await run(steps)).filter((r) => !r.ok);
    const noVersion = await fails({ version: false });
    assert.equal(noVersion.length, all.length, 'without #version 300 es and the precisions nothing compiles');
    assert.match(noVersion[0].log, /version|precision/i);
    const no1D = await fails({ sampler1D: false });
    assert.deepEqual([...new Set(no1D.map((r) => r.name))].sort(), ['landscape', 'landscape +ambience', 'landscapeLight', 'landscapeLight +ambience']);
    assert.match(no1D[0].log, /sampler1D/);
    const noFloats = await fails({ floats: false });
    assert.deepEqual([...new Set(noFloats.map((r) => r.name))].sort(), ['landscape', 'landscape +ambience', 'landscapeLight', 'landscapeLight +ambience']);
    assert.match(noFloats[0].log, /float|conver/i);
    // the Psycho script shader alone also needs the float step (scalerPx.r < 1)
    const psycho = originalPrograms(planet, limits, [AMBIENCE_SHADERS.Psycho]).filter((p) => p.name === 'landscape');
    const psychoOnly = (await compileAll(page, psycho.map((p) => ({ name: p.name, vertex: toGlslEs(p.vertex), fragment: toGlslEs(p.fragment).replace('scalerPx.r < 1.0', 'scalerPx.r < 1') }))))[0];
    assert.equal(psychoOnly.ok, false, 'scalerPx.r < 1 does not compile in GLSL ES');
  } finally {
    await browser.close();
  }
});

test('the rewrite changes exactly these lines of the original\'s programs', { skip: fs.existsSync(planet) ? false : 'no reference source' }, () => {
  const limits = { maxFrag: 16384, maxVert: 16384 };
  const programs = [...originalPrograms(planet, limits), ...originalPrograms(planet, limits, Object.values(AMBIENCE_SHADERS))];
  const changed = new Set<string>();
  const extra = PRECISION.split('\n').length - 1;
  for (const p of programs) {
    for (const source of [p.vertex, p.fragment]) {
      const before = source.split('\n'), after = toGlslEs(source).split('\n');
      assert.equal(after[0], '#version 300 es');
      assert.equal(after.length, before.length + extra);
      for (let i = 1; i < before.length; i++) if (before[i] !== after[i + extra]) changed.add(`${before[i].trim()} => ${after[i + extra].trim()}`);
    }
  }
  assert.deepEqual([...changed].sort(), [
    'float materialIx = int(matMap.a * (materialDepth - 1) + 0.5); => float materialIx = float(int(matMap.a * (materialDepth - 1.0) + 0.5));',
    'float materialIx2 = int(matMap2.a * (materialDepth - 1) + 0.5); => float materialIx2 = float(int(matMap2.a * (materialDepth - 1.0) + 0.5));',
    'fragColor = scalerPx.r < 1 ? materialPx : vec4(vec3(0), materialPx.a); => fragColor = scalerPx.r < 1.0 ? materialPx : vec4(vec3(0), materialPx.a);',
    'return texture(matMapTex, float(pix) / 2.0 / 256.0 + 0.5 / 2.0 / 256.0); => return texture(matMapTex, vec2(float(pix) / 2.0 / 256.0 + 0.5 / 2.0 / 256.0, 0.5));',
    'uniform sampler1D matMapTex; => uniform sampler2D matMapTex;',
  ]);
});

test('gl.ts draws with the original\'s sprite shader: struct vertices, BGRA texture, matrices, base vertex, BGRA read-back', { skip, timeout: 120_000 }, async () => {
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/gl-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
  const code = bundle.outputFiles[0].text;
  const limits = { maxFrag: 1024, maxVert: 1024 };
  const sprite = originalPrograms(planet, limits).find((p) => p.name === 'spriteBase')!;
  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage();
    await page.setContent('<canvas id="c" width="8" height="8"></canvas>');
    await page.addScriptTag({ content: code });
    const out = await page.evaluate((program: { vertex: string; fragment: string }) => {
      const o = (globalThis as any).ocgl;
      const gl = (document.getElementById('c') as HTMLCanvasElement).getContext('webgl2', { antialias: false })!;
      o.glMakeCurrent(gl);
      const P = (a: any, i = 0) => new o.Ptr(a, i);
      const GL_VERTEX_SHADER = 0x8b31, GL_FRAGMENT_SHADER = 0x8b30, GL_COMPILE_STATUS = 0x8b81, GL_LINK_STATUS = 0x8b82;
      // C4Shader::Create / Init
      const make = (type: number, text: string) => {
        const sh = o.gl$glCreateShader(type);
        o.gl$glShaderSource(sh, 1, P([o.S(text)]), null);
        o.gl$glCompileShader(sh);
        const st = new Int32Array(1);
        o.gl$glGetShaderiv(sh, GL_COMPILE_STATUS, P(st));
        return { sh, ok: st[0] };
      };
      const v = make(GL_VERTEX_SHADER, program.vertex), f = make(GL_FRAGMENT_SHADER, program.fragment);
      const prog = o.gl$glCreateProgram();
      o.gl$glAttachShader(prog, v.sh);
      o.gl$glAttachShader(prog, f.sh);
      o.gl$glLinkProgram(prog);
      const linked = new Int32Array(1);
      o.gl$glGetProgramiv(prog, GL_LINK_STATUS, P(linked));
      o.gl$glUseProgram(prog);
      const u = (n: string) => o.gl$glGetUniformLocation(prog, o.S(n));
      // row-major identity matrices with GL_TRUE, as C4ShaderCall::SetUniformMatrix4x4 passes them
      const id4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      o.gl$glUniformMatrix4fv(u('projectionMatrix'), 1, 1, P(id4));
      o.gl$glUniformMatrix4fv(u('modelviewMatrix'), 1, 1, P(id4));
      o.gl$glUniform4f(u('clrMod'), 1, 1, 1, 1);
      o.gl$glUniform3f(u('gamma'), 1, 1, 1);
      // a 1x1 texture of the original's DWORD 0xFF336699 (A R G B), uploaded as GL_BGRA / GL_UNSIGNED_INT_8_8_8_8_REV
      const tex = new Uint32Array(1);
      o.gl$glGenTextures(1, P(tex));
      o.gl$glActiveTexture(0x84c0);
      o.gl$glBindTexture(0x0de1, tex[0]);
      o.gl$glTexParameteri(0x0de1, 0x2801, 0x2600);
      o.gl$glTexParameteri(0x0de1, 0x2800, 0x2600);
      o.gl$glTexImage2D(0x0de1, 0, 0x1908, 1, 1, 0, 0x80e1, 0x8367, P(new Uint32Array([0xff336699])));
      o.gl$glUniform1i(u('baseTex'), 0);
      // vertices: three far away, then one triangle over the whole viewport; drawn with base vertex 3
      class C4BltVertex { tx = 0; ty = 0; color = new Uint8Array([255, 255, 255, 255]); ftx = 0; fty = 0; ftz = 0; }
      const verts = [0, 1, 2, 3, 4, 5].map(() => new C4BltVertex());
      for (let i = 0; i < 3; i++) { verts[i].ftx = 5; verts[i].fty = 5; }
      [[-1, -1], [3, -1], [-1, 3]].forEach(([x, y], i) => { verts[3 + i].ftx = x; verts[3 + i].fty = y; verts[3 + i].tx = 0.5; verts[3 + i].ty = 0.5; });
      const ids = new Uint32Array(3);
      o.gl$glGenVertexArrays(1, P(ids, 0));
      o.gl$glBindVertexArray(ids[0]);
      o.gl$glGenBuffers(2, P(ids, 1));
      o.gl$glBindBuffer(0x8892, ids[1]);
      o.gl$glBufferData(0x8892, 6 * 24, P(verts, 0), 0x88e0); // &vertices[0]: a pointer into the array of structs
      const loc = (n: string) => o.gl$glGetAttribLocation(prog, o.S(n));
      // C4DrawGL.cpp: offsetof(C4BltVertex, ftx) = 12, color = 8, tx = 0
      o.gl$glEnableVertexAttribArray(loc('oc_Position'));
      o.gl$glVertexAttribPointer(loc('oc_Position'), 2, 0x1406, 0, 24, 12);
      o.gl$glEnableVertexAttribArray(loc('oc_Color'));
      o.gl$glVertexAttribPointer(loc('oc_Color'), 4, 0x1401, 1, 24, 8);
      o.gl$glEnableVertexAttribArray(loc('oc_TexCoord'));
      o.gl$glVertexAttribPointer(loc('oc_TexCoord'), 2, 0x1406, 0, 24, 0);
      o.gl$glBindBuffer(0x8893, ids[2]);
      o.gl$glBufferData(0x8893, 12, P(new Uint32Array([0, 1, 2])), 0x88e4);
      o.gl$glViewport(0, 0, 8, 8);
      o.gl$glClearColor(0, 0, 0, 1);
      o.gl$glClear(0x4000);
      o.gl$glDrawElementsBaseVertex(0x0004, 3, 0x1405, 0, 3);
      const px = new Uint32Array(64);
      o.gl$glReadPixels(0, 0, 8, 8, 0x80e1, 0x8367, P(px));
      // the same draw without the base vertex hits nothing
      o.gl$glClear(0x4000);
      o.gl$glDrawElements(0x0004, 3, 0x1405, 0);
      const px0 = new Uint32Array(64);
      o.gl$glReadPixels(0, 0, 8, 8, 0x80e1, 0x8367, P(px0));
      const err = o.gl$glGetError();
      return { compiled: [v.ok, f.ok, linked[0]], pixel: px[27].toString(16), all: [...px].every((p) => p === px[0]), empty: px0[27].toString(16), err };
    }, { vertex: sprite.vertex, fragment: sprite.fragment });
    assert.deepEqual(out.compiled, [1, 1, 1], 'the sprite shader compiles and links through glShaderSource');
    assert.equal(out.pixel, 'ff336699', 'the texel comes back as the DWORD it was uploaded as');
    assert.ok(out.all, 'the whole viewport is covered');
    assert.equal(out.empty, 'ff000000', 'without the base vertex the triangle is off screen');
    assert.equal(out.err, 0, 'no GL error');
  } finally {
    await browser.close();
  }
});
