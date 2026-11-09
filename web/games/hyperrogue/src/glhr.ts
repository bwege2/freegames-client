// glhr.cpp of HyperRogue 13.1o: only the vertex conversions the non-GL drawing uses (stage 2, package D1; the
// GL renderer itself is not ported, PORTING-STAGE2.md section 2). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript
// port. Names: glhr::pointtogl -> glhr_pointtogl.
//
// glvertex = array<GLfloat, 4> (SHDIM 4): a Float32Array(4), so every store rounds to float as in C++.
import type { glvertex } from './geometry.ts';
import type { hyperpoint } from './hyperpoint.ts';
import { MDIM } from './classes.ts';

/** glvertex pointtogl(const hyperpoint& t) */
export function glhr_pointtogl(t: hyperpoint): glvertex {
  const h = new Float32Array(4);
  h[0] = t[0]; h[1] = t[1]; h[2] = t[2];
  // SHDIM == 4
  h[3] = (MDIM() === 4) ? t[3] : 1;
  return h;
}

/** hyperpoint gltopoint(const glvertex& t) (SHDIM == 4 && MAXMDIM == 4: all four) */
export function glhr_gltopoint(t: ArrayLike<number>): hyperpoint {
  return [t[0], t[1], t[2], t[3]];
}

/** glvertex makevertex(GLfloat x, GLfloat y, GLfloat z) (SHDIM 4: w = 1) */
export function glhr_makevertex(x: number, y: number, z: number): glvertex {
  const h = new Float32Array(4);
  h[0] = x; h[1] = y; h[2] = z; h[3] = 1;
  return h;
}
