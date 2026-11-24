// The OpenGL layer for the translated renderer (src/rt/gl.ts), without a browser: every GL, libepoxy and SDL-GL
// function the original's sources call is there under the name the translator will call it by, the list for the
// translator (re/openclonk/tools/gl.txt) says the same, and the structs the original uploads become the bytes
// C++ lays out. (test/shaders.test.ts runs the layer on WebGL2 in headless Chromium.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re } from './oracle.ts';
import * as GLM from '../src/rt/gl.ts';
import { GL_FUNCTIONS, STRUCT_LAYOUTS, structBytes, bytesOf } from '../src/rt/gl.ts';
import { Ptr } from '../src/rt/ptr.ts';

const src = path.join(re, 'orig/openclonk/src');

test('gl.txt lists the functions gl.ts provides, each as gl$<name>', () => {
  const listed = fs.readFileSync(path.join(re, 'tools/gl.txt'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#'));
  assert.deepEqual(listed, [...GL_FUNCTIONS]);
  for (const n of GL_FUNCTIONS) assert.equal(typeof (GLM as Record<string, unknown>)['gl$' + n], 'function', `gl$${n}`);
  const exported = Object.keys(GLM).filter((k) => k.startsWith('gl$')).map((k) => k.slice(3)).sort();
  assert.deepEqual(exported, [...GL_FUNCTIONS].sort(), 'no gl$ function outside the list');
});

test('every OpenGL, libepoxy and SDL GL call of the original\'s renderer is provided', { skip: fs.existsSync(src) ? false : 'no reference source (re/openclonk/fetch.sh)' }, () => {
  const called = new Set<string>();
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(cpp|h)$/.test(e.name)) {
        const text = fs.readFileSync(p, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const m of text.matchAll(/\b(gl[A-Z]\w*|epoxy_[a-z_]+|SDL_GL_[A-Za-z]+)\s*\(/g)) called.add(m[1]);
      }
    }
  };
  // the parts of the engine the game build compiles (editor/ is the Qt editor, left out of the port)
  for (const d of ['graphics', 'landscape', 'object', 'lib', 'game', 'gui', 'platform', 'control', 'player', 'script']) walk(path.join(src, d));
  // Windows only (USE_WGL in C4DrawGLCtx.cpp)
  called.delete('epoxy_has_wgl_extension');
  const missing = [...called].filter((n) => !GL_FUNCTIONS.includes(n)).sort();
  assert.deepEqual(missing, [], 'called by the original but not in gl.ts');
  assert.ok(called.size >= 100, `${called.size} functions`);
});

test('the uploaded structs have the C++ layout (sizes as sizeof in the original)', () => {
  // sizes by the C++ rules for the declarations named in gl.ts (all fields 4-byte floats except as noted)
  const sizes: Record<string, number> = {
    C4BltVertex: 24, // float tx, ty; unsigned char color[4]; float ftx, fty, ftz
    StdMeshVertex: 96, // 8 floats, float bone_weight[8], uint16_t bone_index[8], char _padding[16]; static_assert(% 32 == 0)
    StdMeshFace: 12,
    PretransformedMeshVertex: 24,
    C4Particle$DrawingData$Vertex: 32,
    C4FoWDrawLightTextureStrategy$Vertex: 56,
    C4FoWDrawWireframeStrategy$Vertex: 24,
  };
  assert.deepEqual(Object.keys(STRUCT_LAYOUTS).sort(), Object.keys(sizes).sort());
  for (const [n, s] of Object.entries(sizes)) assert.equal(STRUCT_LAYOUTS[n].size, s, n);
  assert.equal(STRUCT_LAYOUTS.StdMeshVertex.size % 32, 0);
  const off = (n: string, f: string) => STRUCT_LAYOUTS[n].fields.find((x) => x.name === f)!.offset;
  // the offsets glVertexAttribPointer gets (offsetof in C4DrawGL.cpp, C4DrawMeshGL.cpp)
  assert.equal(off('C4BltVertex', 'color'), 8);
  assert.equal(off('C4BltVertex', 'ftx'), 12);
  assert.equal(off('StdMeshVertex', 'x'), 20);
  assert.equal(off('StdMeshVertex', 'bone_weight'), 32);
  assert.equal(off('StdMeshVertex', 'bone_index'), 64);
});

test('struct objects become their bytes: the translated StdMeshVertex and an array of C4BltVertex-shaped objects', async () => {
  const { StdMeshVertex } = await import('../src/sim/lib/StdMeshMath.ts');
  const v = new StdMeshVertex().init();
  for (const f of STRUCT_LAYOUTS.StdMeshVertex.fields) assert.ok(f.name in v, `the translated StdMeshVertex has ${f.name}`);
  v.u = 0.5; v.x = 2; v.bone_weight[1] = 0.25; v.bone_index[2] = 7;
  const b = structBytes(v, 96);
  const view = new DataView(b.buffer);
  assert.equal(view.getFloat32(0, true), 0.5);
  assert.equal(view.getFloat32(20, true), 2);
  assert.equal(view.getFloat32(36, true), 0.25);
  assert.equal(view.getUint16(68, true), 7);

  class C4BltVertex { tx = 0; ty = 0; color = new Uint8Array(4); ftx = 0; fty = 0; ftz = 0; }
  const arr = [new C4BltVertex(), new C4BltVertex()];
  arr[1].ftx = 10; arr[1].color.set([1, 2, 3, 4]);
  const bytes = bytesOf(new Ptr(arr, 0), 48)!;
  assert.equal(new DataView(bytes.buffer).getFloat32(24 + 12, true), 10);
  assert.deepEqual([...bytes.subarray(24 + 8, 24 + 12)], [1, 2, 3, 4]);
  // a pointer into a typed array: the bytes themselves
  const f = new Float32Array([1, 2, 3, 4]);
  assert.deepEqual([...new Float32Array(bytesOf(new Ptr(f, 1), 8)!.slice().buffer)], [2, 3]);
});
