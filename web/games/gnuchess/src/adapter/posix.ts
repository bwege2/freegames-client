// Port of src/adapter/posix.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// The clock is the host's; input_available() polled PolyGlot's stdin, which the adapter of GNU Chess
// never reads (its input is the frontend's pipe), so it is never true.

import { H } from './util.ts';

// functions

// input_available()

export function input_available(): boolean {
   return false;
}

// now_real()

export function now_real(): number {
   return H.clock.real();
}

// now_cpu()

export function now_cpu(): number {
   return H.clock.cpu();
}
