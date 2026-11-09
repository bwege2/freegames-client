// Stage 2, package D1 (PORTING-STAGE2.md): the colour routines, the video parameters, calcparam, the queue and
// the SVG output of the pipeline (queue -> drawqueue -> dqi_*::draw -> svg::), checked against values worked out
// from the C++ and against the first lines of the drawing oracle's golden/draw-bare.txt.gz.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { G, videopar } from '../src/globals.ts';
// hyper-main first: it loads the modules in the order the game does (top-level code of D2's shape tables)
import { register_all } from '../src/hyper-main.ts';
import { gradient, darkena, align, part, set_part, darkened } from '../src/colors.ts';
import { svg_render } from '../src/screenshot.ts';
import { drawqueue, queuetable, POLY_ISSIDE } from '../src/drawing.ts';
import { PPR } from '../src/hyper.ts';
import { calcparam } from '../src/graph.ts';
import { draw_boundary } from '../src/hypgraph.ts';
import { glhr_makevertex } from '../src/glhr.ts';
import { shiftless_t, Id } from '../src/hyperpoint.ts';

const here = dirname(fileURLToPath(import.meta.url));
const bare = gunzipSync(readFileSync(join(here, 'golden', 'draw-bare.txt.gz'))).toString('utf8').split('\n');

test('d1: colors.cpp', () => {
  assert.equal(gradient(0x000000, 0xFFFFFF, 0, 0.5, 1), 0x7F7F7F);
  assert.equal(gradient(0x10203040, 0x10203040, 0, 0.3, 1), 0x10203040);
  assert.equal(darkena(0x123456, 1, 0xFF), 0x091A2BFF);
  assert.equal(align(0x11223344), 0x44332211);
  assert.equal(part(0x11223344, 0), 0x44);
  assert.equal(set_part(0x11223344, 3, 0x1FF), 0xFF223344);
  assert.equal(darkened(0xABCDEF), 0xABCDEF, 'no darkening by default');
});

test('d1: videopar is copied by value and restored in place', () => {
  const v = G.vid;
  const b = v.clone();
  assert.ok(b instanceof videopar);
  v.xres = 123; v.projection_config.alpha = 2;
  assert.equal(b.xres, 0);
  assert.equal(b.projection_config.alpha, 1);
  assert.equal(b.projection_config.ball(), v.projection_config.ball(), 'the pointers are shared, as a struct copy');
  v.assign(b);
  assert.equal(G.vid, v, 'the object stays (the config parameters point at it)');
  assert.equal(v.xres, 0);
  assert.equal(v.projection_config.alpha, 1);
});

test('d1: calcparam, draw_boundary and the SVG of the queue as the oracle prints them', () => {
  register_all();
  const v = G.vid.clone(), hq = G.inHighQual;
  try {
    // shot::take of `svg 640 480 map`: 640x480 at divby 10
    G.inHighQual = true;
    G.vid.xres = 6400; G.vid.yres = 4800;
    calcparam();
    // what models::configure (package D2) sets for the default projection
    G.models_model_straight = true; G.models_camera_straight = true;
    const cd = G.current_display;
    assert.equal(cd.xcenter, 3200);
    assert.equal(cd.ycenter, 2400);
    assert.equal(cd.radius, 2400);
    assert.equal(cd.scrsize, 2400);
    const svg = svg_render(() => {
      G.ptds.length = 0;
      draw_boundary(0);
      draw_boundary(1);
      drawqueue();
    });
    const i = bare.findIndex((l) => l.startsWith('<svg '));
    assert.deepEqual(svg.split('\n').slice(0, 2), bare.slice(i, i + 2));
    // a polygon through dqi_poly::draw (mdPixel: the screen coordinates of the vertices as they are)
    const tab = [glhr_makevertex(-100, -50, 1), glhr_makevertex(100.25, -50, 1), glhr_makevertex(0, 80.75, 1)];
    const svg2 = svg_render(() => {
      G.ptds.length = 0;
      const p = queuetable(shiftless_t(Id), tab, 3, 0x000000FF, 0x20203FFF, PPR.LINE);
      p.flags = POLY_ISSIDE;
      const m = G.vid.projection_config.model;
      G.vid.projection_config.model = 55; // mdPixel
      try { drawqueue(); } finally { G.vid.projection_config.model = m; }
    });
    assert.equal(svg2.split('\n')[1],
      '<path d="M 310.0 235.0 L 330.0 235.0 L 320.0 248.0" style="stroke:#000000;stroke-opacity:1.000;stroke-width:0.937500px;fill:#20203f;fill-opacity:1.000"/>');
  } finally { G.vid.assign(v); G.inHighQual = hq; G.ptds.length = 0; G.models_model_straight = false; G.models_camera_straight = false; }
});

