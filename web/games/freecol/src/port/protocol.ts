// What the page, the client's worker and the server's worker send each other (src/port/README in
// re/freecol/NOTES.md, "The client").
//
// client -> server (Ring, shared memory, so that the server receives its clients' replies while it waits for
// them, as the original's server threads do; plus { t: 'ping' } on a MessagePort, which wakes the server
// worker when it is idle):
export const C_DATA = 20; //  [pipe u32][bytes]: bytes on a socket
export const C_CLOSE = 21; // [pipe u32]: the client closed a socket
export const C_CALL = 22; //  JSON { id, op, args }: a request to the server worker (connect, start a server, save, ...)
// server -> client (Ring, shared memory, so that a blocked client receives it):
export const S_DATA = 1; //   [pipe u32][bytes]
export const S_CLOSE = 2; //  [pipe u32]
export const S_REPLY = 3; //  JSON { id, ok, value | error }
// page -> client (Ring):
export const P_INPUT = 10; // JSON: an input event (see client/input.ts)
export const P_REPLY = 11; // JSON { id, ok, value | error }: the page's answer to a client request

export function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n);
  return b;
}

export function withId(id: number, bytes: Uint8Array): Uint8Array {
  const b = new Uint8Array(4 + bytes.length);
  new DataView(b.buffer).setUint32(0, id);
  b.set(bytes, 4);
  return b;
}

export function idOf(b: Uint8Array): number {
  return new DataView(b.buffer, b.byteOffset, 4).getUint32(0);
}
