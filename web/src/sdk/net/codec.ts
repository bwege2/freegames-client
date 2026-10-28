// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Cap'n Proto framing: one packed message (root = Envelope) per transport message, see
// protocol/freegames.capnp (generated bindings in ../proto/freegames.ts, tools/gen-protocol.sh).
// A game's own messages are one packed message of its own schema (protocol/games/<id>.capnp), carried
// as Data: packGame / unpackGame.
import * as $ from 'capnp-es';
import { Envelope, Envelope_Which, ErrorCode } from '../proto/freegames.ts';

export * as P from '../proto/freegames.ts';
export { Envelope_Which as Which };

/** Must equal Hub.PROTOCOL_VERSION on the server. */
export const PROTOCOL_VERSION = 1;

/** Builds one frame: `fill` initialises the envelope's union member. */
export function encode(fill: (e: Envelope) => void): Uint8Array {
  const m = new $.Message();
  fill(m.initRoot(Envelope));
  return new Uint8Array(m.toPackedArrayBuffer());
}

/** Parses one frame. The returned reader is only valid while `data` is alive. */
export function decode(data: ArrayBuffer | Uint8Array): Envelope {
  return new $.Message(data instanceof Uint8Array ? data : new Uint8Array(data), true).getRoot(Envelope);
}

/** Envelope union tag -> name (for logging). */
export function which(e: Envelope): string {
  const tag = e.which();
  for (const [k, v] of Object.entries(Envelope_Which)) if (v === tag) return k;
  return String(tag);
}

/** ErrorCode number -> name ("full", "forbidden", ...). */
export function errorName(code: number): string {
  for (const [k, v] of Object.entries(ErrorCode)) if (v === code) return k.toLowerCase().replace(/_(\w)/g, (_, c: string) => c.toUpperCase());
  return String(code);
}

/** One packed message of a game's schema (Relay data, room options, results, score details). */
export function packGame<T extends $.Struct>(type: $.StructCtor<T>, fill: (m: T) => void): Uint8Array {
  const m = new $.Message();
  fill(m.initRoot(type));
  return new Uint8Array(m.toPackedArrayBuffer());
}

/** Reads a packed game message (throws on malformed data: catch it, a peer may send garbage). */
export function unpackGame<T extends $.Struct>(type: $.StructCtor<T>, data: Uint8Array): T {
  return new $.Message(data, true).getRoot(type);
}

/** Sets a Data field: `setData((n) => r._initData(n), bytes)`. */
export function setData(init: (length: number) => $.Data, bytes: Uint8Array): void {
  if (bytes.length) init(bytes.length).copyBuffer(bytes);
}

/** A Data field as its own copy (readers die with their message). */
export function bytes(d: $.Data): Uint8Array {
  return d.toUint8Array().slice();
}
