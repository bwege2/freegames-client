// Port of src/engine/posix.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// select() on the pipe from the adapter, gettimeofday() and getrusage(): the host's.

import { host } from './util.ts';

// input_available()
export function input_available(): boolean {
  return host.inputAvailable();
}

// now_real()
export function now_real(): number {
  return host.clock.real();
}

// now_cpu()
export function now_cpu(): number {
  return host.clock.cpu();
}
