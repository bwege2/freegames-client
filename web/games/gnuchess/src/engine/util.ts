// Port of src/engine/util.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// The engine thread's process: the host (pipes, files, clock) is set by main_engine().

import type { EngineHost } from '../host.ts';
import { rand, srand, RAND_MAX, sprintf, strtoll, tolower, type Arg } from '../libc.ts';
import { now_cpu, now_real } from './posix.ts';

/** what the engine sees of the process (main_engine() sets it) */
export let host: EngineHost;
export function set_host(h: EngineHost): void {
  host = h;
}

/** my_fatal() ends the program (the engine sets the quit flag, the frontend's main loop then exits) */
export class EngineFatal extends Error {}

// util_init()
export function util_init(): void {
  // setvbuf() on the pipe streams: nothing to do here
}

// my_random_init()
export function my_random_init(): void {
  srand(host.clock.time());
}

// my_random()
export function my_random(n: number): number {
  const r = rand() / (RAND_MAX + 1.0);
  return Math.floor(r * n) | 0;
}

// my_atoll(): sscanf(string,"%lld",&n), as a number (node counts stay below 2^53)
export function my_atoll(string: string): number {
  return Number(strtoll(string).value);
}

// my_round()
export function my_round(x: number): number {
  return Math.floor(x + 0.5) | 0;
}

// my_fatal(): prints to stderr and sets the engine to quit; here it also unwinds (the original
// carries on into undefined behaviour until the frontend's main loop sees the quit flag)
export function my_fatal(format: string, ...args: Arg[]): never {
  host.stderr(sprintf(format, ...args));
  host.quit();
  throw new EngineFatal(sprintf(format, ...args));
}

// my_string_empty()
export function my_string_empty(string: string | null): boolean {
  return string === null || string.length === 0;
}

// my_string_equal(): case-insensitive (tolower), as in the original
export function my_string_equal(string_1: string, string_2: string): boolean {
  if (string_1.length !== string_2.length) return false;
  for (let i = 0; i < string_1.length; i++) {
    if (tolower(string_1[i]) !== tolower(string_2[i])) return false;
  }
  return true;
}

// my_timer_t
export class my_timer_t {
  start_real = 0.0;
  start_cpu = 0.0;
  elapsed_real = 0.0;
  elapsed_cpu = 0.0;
  running = false;
}

// my_timer_reset()
export function my_timer_reset(timer: my_timer_t): void {
  timer.start_real = 0.0;
  timer.start_cpu = 0.0;
  timer.elapsed_real = 0.0;
  timer.elapsed_cpu = 0.0;
  timer.running = false;
}

// my_timer_start()
export function my_timer_start(timer: my_timer_t): void {
  timer.running = true;
  timer.start_real = now_real();
  timer.start_cpu = now_cpu();
}

// my_timer_stop()
export function my_timer_stop(timer: my_timer_t): void {
  timer.elapsed_real += now_real() - timer.start_real;
  timer.elapsed_cpu += now_cpu() - timer.start_cpu;
  timer.start_real = 0.0;
  timer.start_cpu = 0.0;
  timer.running = false;
}

// my_timer_elapsed_real()
export function my_timer_elapsed_real(timer: my_timer_t): number {
  let elapsed = timer.elapsed_real;
  if (timer.running) elapsed += now_real() - timer.start_real;
  if (elapsed < 0.0) elapsed = 0.0;
  return elapsed;
}

// my_timer_elapsed_cpu()
export function my_timer_elapsed_cpu(timer: my_timer_t): number {
  let elapsed = timer.elapsed_cpu;
  if (timer.running) elapsed += now_cpu() - timer.start_cpu;
  if (elapsed < 0.0) elapsed = 0.0;
  return elapsed;
}

// my_timer_cpu_usage()
export function my_timer_cpu_usage(timer: my_timer_t): number {
  const real = my_timer_elapsed_real(timer);
  const cpu = my_timer_elapsed_cpu(timer);
  if (real <= 0.0 || cpu <= 0.0) return 0.0;
  let usage = cpu / real;
  if (usage >= 1.0) usage = 1.0;
  return usage;
}
