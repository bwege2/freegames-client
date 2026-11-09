// 3d-models.cpp of HyperRogue 13.1o: the 3D models of creatures and items (3D: stage 3). (C) Zeno Rogue,
// GPL-2.0-or-later; TypeScript port (stage 2, package D2).
//
// In 2D, prepare_shapes calls make_3d_models, which returns at once (GDIM == 2); everything else of the file
// (the humanoids, the shadows, the 3D animals, ...) is only reached in 3D and stays a STAGE2-STUB.
import { G } from './globals.ts';
import { NotPorted } from './hyper.ts';
import { GDIM } from './classes.ts';
import type { geometry_information, hpcshape } from './geometry.ts';

/** geometry_information::make_3d_models */
export function make_3d_models(this: geometry_information): void {
  if (GDIM() === 2 || G.noGUI) return;
  throw new NotPorted('make_3d_models (3D)'); // STAGE2-STUB (3D, stage 3)
}

/** geometry_information::make_shadow (3D only) */
export function make_shadow(this: geometry_information, _sh: hpcshape): void {
  throw new NotPorted('make_shadow (3D)'); // STAGE2-STUB (3D, stage 3)
}
