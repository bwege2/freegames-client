// COW's network as the client oracle gives it: one TCP connection to its server (the platform's Conn),
// whatever address COW connects to (client/cowwrap.c hands the connection to the coordinator), and its UDP
// socket (the platform's Datagrams), which binds and connects as the oracle's virtual ones do (ls/udp.c):
// any port COW asks for, every datagram to and from its server. No metaserver.
import { Ptr, memStore, memBytes } from './ptr.ts';
import { cstr, jstr } from './cstring.ts';
import { R, newFd, fdSpecial, type Special } from './fs.ts';
import { platform, type Conn, type Datagrams } from './platform.ts';
import { overrun } from './overrun.ts';
import { G } from '../cow/globals.ts';

const EBADF = 9, EAGAIN = 11, ECONNREFUSED = 111, EAFNOSUPPORT = 97, ENOTCONN = 107, EDESTADDRREQ = 89;
const AF_INET = 2, SOCK_STREAM = 1, SOCK_DGRAM = 2;

/** a read into socket.c's buffer: past its 1024 bytes into the globals after it, as in the original */
function intoBuf(buf: any, b: Uint8Array): void {
  memStore(buf, b, b.length);
  if (buf instanceof Ptr && buf.a === G.buf && buf.o + b.length > 1024) {
    const from = Math.max(0, buf.o - 1024);
    overrun(from, b.subarray(Math.max(0, 1024 - buf.o)));
  }
}

class Sock implements Special {
  special = true as const;
  conn: Conn | null = null;
  eofSeen = false;
  read(buf: any, n: number): number {
    if (!this.conn) {
      R.errno = ENOTCONN;
      return -1;
    }
    const b = this.conn.read(n);
    if (b === null) return 0;
    if (b.length === 0) {
      R.errno = EAGAIN;
      return -1;
    }
    intoBuf(buf, b);
    return b.length;
  }
  write(bytes: Uint8Array): number {
    if (!this.conn) {
      R.errno = ENOTCONN;
      return -1;
    }
    this.conn.write(bytes);
    return bytes.length;
  }
  close(): void {
    if (this.conn) this.conn.close();
    this.conn = null;
  }
  readable(): boolean {
    return !!this.conn && this.conn.readable();
  }
}

/** COW's UDP socket: its port (bound or 0), the port it is connected to (0: none) */
class Udp implements Special {
  special = true as const;
  port = 0;
  peer = 0;
  link: Datagrams;
  constructor() {
    this.link = platform().datagrams();
    this.link.open();
  }
  /** read()/recv(): one datagram, cut to n; EAGAIN when none is there */
  read(buf: any, n: number): number {
    const d = this.link.recv();
    if (!d) {
      R.errno = EAGAIN;
      return -1;
    }
    const b = d.length > n ? d.subarray(0, n) : d;
    intoBuf(buf, b);
    return b.length;
  }
  write(bytes: Uint8Array): number {
    if (!this.peer) {
      R.errno = EDESTADDRREQ;
      return -1;
    }
    this.link.send(bytes.slice());
    return bytes.length;
  }
  close(): void {
    this.link.close();
  }
  readable(): boolean {
    return this.link.readable();
  }
}

/** the port of a sockaddr_in COW passes (a struct sockaddr_in, or a view of its bytes) */
function portOf(a: any): number {
  if (!a) return 0;
  if ('sin_port' in a) return ntohs(a.sin_port & 0xffff);
  if ('sa_data' in a) return ((a.sa_data[0] & 255) << 8) | (a.sa_data[1] & 255);
  return 0;
}

export function socket(domain: number, type: number, _proto: number): number {
  if (domain === AF_INET && (type & 15) === SOCK_DGRAM) return newFd(new Udp());
  if (domain !== AF_INET || (type & 15) !== SOCK_STREAM) {
    R.errno = EAFNOSUPPORT;
    return -1;
  }
  return newFd(new Sock());
}

export function connect(fd: number, addr: any, _len: number): number {
  const s = fdSpecial(fd);
  if (s instanceof Udp) {
    // as the oracle's coordinator: an unbound socket gets a port; the peer is the server's port
    if (!s.port) s.port = 32768;
    s.peer = portOf(addr);
    return 0;
  }
  if (!(s instanceof Sock)) {
    R.errno = EBADF;
    return -1;
  }
  const c = platform().connect();
  if (!c) {
    R.errno = ECONNREFUSED;
    return -1;
  }
  s.conn = c;
  return 0;
}

export function shutdown(fd: number, _how: number): number {
  return fdSpecial(fd) ? 0 : -1;
}

export function setsockopt(..._a: any[]): number { return 0; }
/** the connection's ends: the server is 127.0.0.1 (in the oracle the coordinator, on a port of its own,
 * which COW does not use: reserved.c mixes only the address into its answer) */
function sockaddr(a: any, port: number): void {
  if (!a) return;
  if ('sin_family' in a) {
    a.sin_family = AF_INET;
    a.sin_port = htons(port);
    a.sin_addr.s_addr = 0x0100007f;
  } else if ('sa_data' in a) {
    a.sa_family = AF_INET;
    a.sa_data[0] = (port >> 8) << 24 >> 24;
    a.sa_data[1] = (port & 255) << 24 >> 24;
    a.sa_data[2] = 127;
    a.sa_data[3] = 0;
    a.sa_data[4] = 0;
    a.sa_data[5] = 1;
  }
}
export function getsockname(fd: number, a: any, _len: any): number {
  const s = fdSpecial(fd);
  sockaddr(a, s instanceof Udp ? s.port : 40000);
  return 0;
}
export function getpeername(fd: number, a: any, _len: any): number {
  const s = fdSpecial(fd);
  if (s instanceof Udp && !s.peer) {
    R.errno = ENOTCONN;
    return -1;
  }
  sockaddr(a, s instanceof Udp ? s.peer : 2592);
  return 0;
}
/** bind(): COW's UDP socket takes the port it asks for (the oracle's coordinator gives it, as it is free) */
export function bind(fd: number, addr: any, _len: number): number {
  const s = fdSpecial(fd);
  if (!(s instanceof Udp)) {
    R.errno = EAFNOSUPPORT;
    return -1;
  }
  s.port = portOf(addr) || 32768;
  return 0;
}
export function listen(..._a: any[]): number { R.errno = EAFNOSUPPORT; return -1; }
export function accept(..._a: any[]): number { R.errno = EAFNOSUPPORT; return -1; }
export function sendto(fd: number, buf: any, n: number, _flags: number, addr: any, _len: number): number {
  const s = fdSpecial(fd);
  if (!(s instanceof Udp)) {
    R.errno = EAFNOSUPPORT;
    return -1;
  }
  if (!s.peer && !addr) {
    R.errno = EDESTADDRREQ;
    return -1;
  }
  s.link.send(memBytes(buf, n));
  return n;
}
/** recvfrom(): a datagram from the server (127.0.0.1; its port: the one connected to, else 2592) */
export function recvfrom(fd: number, buf: any, n: number, _flags: number, from: any, _len: any): number {
  const s = fdSpecial(fd);
  if (!(s instanceof Udp)) {
    R.errno = EAFNOSUPPORT;
    return -1;
  }
  const k = s.read(buf, n);
  if (k >= 0) sockaddr(from, s.peer || 2592);
  return k;
}

/** getprotobyname(): every Linux /etc/protocols' tcp (client/cowwrap.c) */
const tcpEnt: any = { p_name: cstr('tcp'), p_aliases: new Ptr([cstr('TCP'), null], 0), p_proto: 6 };
export function getprotobyname(name: Ptr): any {
  return jstr(name).toLowerCase() === 'tcp' ? tcpEnt : null;
}

/** inet_addr(): a dotted quad in network order (as the little-endian number C sees), else -1 */
export function inet_addr(p: Ptr): number {
  const m = jstr(p).match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return 4294967295;
  const b = m.slice(1).map(Number);
  if (b.some((x) => x > 255)) return 4294967295;
  return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
}

let ntoaBuf: Ptr | null = null;
export function inet_ntoa(a: any): Ptr {
  const v = a.s_addr >>> 0;
  ntoaBuf = cstr(`${v & 255}.${(v >> 8) & 255}.${(v >> 16) & 255}.${v >>> 24}`);
  return ntoaBuf;
}

/** gethostbyname(): every name is the server (127.0.0.1) */
export function gethostbyname(name: Ptr): any {
  const addr = new Int8Array([127, 0, 0, 1]);
  return { h_name: cstr(jstr(name)), h_aliases: new Ptr([null], 0), h_addrtype: AF_INET, h_length: 4, h_addr_list: new Ptr([new Ptr(addr, 0), null], 0) };
}

export function gethostbyaddr(..._a: any[]): any { return null; }

export const htons = (v: number) => ((v & 255) << 8) | ((v >> 8) & 255);
export const ntohs = htons;
export const htonl = (v: number) => (((v & 255) << 24) | ((v & 0xff00) << 8) | ((v >>> 8) & 0xff00) | ((v >>> 24) & 255)) >>> 0;
export const ntohl = htonl;
