// The memory the page and the worker share: control words, the event queue, the pixmap and the palette.
export const CTL = {
  /** events written by the page (the worker counts the ones it has read) */
  WRITE: 0,
  /** the pointer in window coordinates */
  PX: 1, PY: 2,
  /** bumped when the worker has drawn */
  FRAME: 3,
  /** the pixmap's size */
  W: 4, H: 5,
  /** events read by the worker (WRITE - READ events wait in the queue) */
  READ: 6,
} as const;
/** ints per event: type, keysym, ch, state, button, width, height, (spare) */
export const EV_INTS = 8;
export const EV_CAP = 1024;
/** the largest window the page asks for */
export const MAX_W = 2048, MAX_H = 1536;

/**
 * the page queues an event (type, keysym, ch, state, button, width, height). The queue is a ring of EV_CAP
 * events; when EV_CAP events wait unread (the program is busy and the player keeps pressing), the newest
 * is dropped (false): an unread event is never overwritten, and the page's thread cannot wait.
 */
export function pushEvent(ctl: Int32Array, ev: Int32Array, fields: number[]): boolean {
  const write = Atomics.load(ctl, CTL.WRITE);
  if (((write - Atomics.load(ctl, CTL.READ)) | 0) >= EV_CAP) return false;
  const o = (write % EV_CAP + EV_CAP) % EV_CAP * EV_INTS;
  for (let k = 0; k < EV_INTS; k++) ev[o + k] = fields[k] ?? 0;
  Atomics.store(ctl, CTL.WRITE, (write + 1) | 0);
  Atomics.notify(ctl, CTL.WRITE);
  return true;
}

/** is an event waiting? */
export const eventWaiting = (ctl: Int32Array): boolean => Atomics.load(ctl, CTL.WRITE) !== Atomics.load(ctl, CTL.READ);

/** the worker takes the oldest event (null: none waits); its slot is free once READ moved past it */
export function takeEvent(ctl: Int32Array, ev: Int32Array): number[] | null {
  const read = Atomics.load(ctl, CTL.READ);
  if (Atomics.load(ctl, CTL.WRITE) === read) return null;
  const o = (read % EV_CAP + EV_CAP) % EV_CAP * EV_INTS;
  const out = Array.from(ev.subarray(o, o + EV_INTS));
  Atomics.store(ctl, CTL.READ, (read + 1) | 0);
  return out;
}

export interface Shared { ctl: SharedArrayBuffer; events: SharedArrayBuffer; pixels: SharedArrayBuffer; palette: SharedArrayBuffer }

export function makeShared(): Shared {
  return {
    ctl: new SharedArrayBuffer(16 * 4),
    events: new SharedArrayBuffer(EV_CAP * EV_INTS * 4),
    pixels: new SharedArrayBuffer(MAX_W * MAX_H),
    palette: new SharedArrayBuffer(768),
  };
}
