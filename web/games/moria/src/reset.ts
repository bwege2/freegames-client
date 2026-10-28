// A C program starts with its globals and statics as the source initializes them. The port's modules
// stay loaded between games (a second Play, the runs of a test), so every module with state registers
// how to put it back, and main() calls resetAll() before each start.

const resets: (() => void)[] = [];

/** Registers a function that puts a module's mutable state back to its initial values. */
export function onReset(fn: () => void): void {
  resets.push(fn);
}

/** Puts every module's state back as at the start of the program. */
export function resetAll(): void {
  for (const fn of resets) fn();
}
