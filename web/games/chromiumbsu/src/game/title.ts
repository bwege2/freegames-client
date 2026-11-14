// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/textGeometryChromium.cpp and
// src/textGeometryBSU.cpp, the menu's 3D title letters. Their tables are assets/title.bin
// (re/chromiumbsu/tools/title-geometry.py): per title five sections (front face, front bevel, back
// face, back bevel, side) of vertex + normal. The thin version (when the frame rate is low) has only
// the front face and bevel.
import { GL_TRIANGLES, type GL } from '../gl.ts';

let titles: Float32Array[][] | null = null;

/** reads assets/title.bin */
export function setTitleGeometry(bin: ArrayBuffer): void {
  const view = new DataView(bin);
  let at = 0;
  const out: Float32Array[][] = [];
  for (let t = 0; t < 2; t++) {
    const counts: number[] = [];
    for (let s = 0; s < 5; s++) { counts.push(view.getUint32(at, true)); at += 4; }
    const sections: Float32Array[] = [];
    for (const n of counts) {
      const a = new Float32Array(n * 6);
      for (let k = 0; k < n * 6; k++) { a[k] = view.getFloat32(at, true); at += 4; }
      sections.push(a);
    }
    out.push(sections);
  }
  titles = out;
}

function draw(gl: GL, title: number, full: boolean): void {
  gl.begin(GL_TRIANGLES);
  if (titles) {
    const sections = titles[title];
    for (let s = 0; s < 5; s++) {
      if (!full && s >= 2) break;
      const a = sections[s];
      for (let k = 0; k < a.length; k += 6) {
        gl.normal3f(a[k + 3], a[k + 4], a[k + 5]);
        gl.vertex3f(a[k], a[k + 1], a[k + 2]);
      }
    }
  }
  gl.end();
}

export function textGeometryChromium(gl: GL, full = true): void { draw(gl, 0, full); }
export function textGeometryBSU(gl: GL, full = true): void { draw(gl, 1, full); }
