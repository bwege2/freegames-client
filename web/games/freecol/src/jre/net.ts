// @ts-nocheck
// java.net sockets between the client's and the server's worker: FreeCol's Connection talks to the
// server over a socket, its messages one XML document per line; here each socket is a pipe whose bytes
// cross between the workers (the platform layer moves them: src/port/pipes.ts). The stream of bytes is
// the original's, so both sides' Connection, ReceivingThread and message classes run as translated.
import { $J, JObject, defineLib, exc, str, IOException } from './lang.ts';
import { SocketException } from './platform.ts';
import { InputStream, OutputStream } from './io.ts';
import { Stream } from './stream.ts';
import { Collections } from './util.ts';

/** What moves a pipe's bytes: set by the platform layer of each worker. */
export const net: any = {
  /** Client side: opens a pipe to the server worker's listening socket (host, port); returns a Pipe. */
  connect: null as any,
  /** Blocks the current thread until the pipe has input (the client's scheduler), or not at all. */
  waitInput: (_p: Pipe) => {},
};

/** One end of a socket: input arrives in chunks, output leaves on flush. */
export class Pipe {
  id: number;
  chunks: Uint8Array[] = [];
  /** Complete lines received and not yet taken by a reader (Connection reads one message per line). */
  lines = 0;
  closed = false;
  send: (bytes: Uint8Array) => void;
  onClose: () => void = () => {};
  constructor(id: number, send: (bytes: Uint8Array) => void) {
    this.id = id;
    this.send = send;
  }
  /** Bytes from the other side. */
  receive(bytes: Uint8Array) {
    this.chunks.push(bytes);
    for (const b of bytes) if (b === 10) this.lines++;
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.onClose();
  }
}

export class PipeInputStream extends InputStream {
  pipe: Pipe;
  $streaming = true;
  constructor(pipe: Pipe) {
    super();
    this.pipe = pipe;
  }
  /** The next chunk of input, waiting for it if needed; null at the end of the stream. */
  $nextChunk(): Uint8Array | null {
    while (!this.pipe.chunks.length) {
      if (this.pipe.closed) return null;
      net.waitInput(this.pipe);
      if (!this.pipe.chunks.length && !this.pipe.closed) throw new IOException('no input on ' + this.pipe.id);
    }
    return this.pipe.chunks.shift();
  }
  read(b?: any, off = 0, len?: number): number {
    if (this.pos >= this.data.length) {
      const c = this.$nextChunk();
      if (c == null) return -1;
      this.data = c;
      this.pos = 0;
    }
    return super.read(b, off, len);
  }
  available() {
    return this.data.length - this.pos + this.pipe.chunks.reduce((n, c) => n + c.length, 0);
  }
  readAllBytes(): Uint8Array {
    throw new IOException('readAllBytes on a socket');
  }
  close() {
    this.pipe.close();
  }
}
defineLib(PipeInputStream, 'java.net.SocketInputStream');

export class PipeOutputStream extends OutputStream {
  pipe: Pipe;
  pending: string = '';
  bytesPending: number[] = [];
  constructor(pipe: Pipe) {
    super();
    this.pipe = pipe;
  }
  write(b: any, off = 0, len?: number) {
    this.$flushText();
    if (typeof b === 'number') {
      this.bytesPending.push(b & 0xff);
      return;
    }
    if (len === undefined) len = b.length - off;
    for (let i = 0; i < len; i++) this.bytesPending.push(b[off + i] & 0xff);
  }
  $writeText(s: string) {
    this.pending += s;
  }
  $flushText() {
    if (this.pending) {
      for (const b of new TextEncoder().encode(this.pending)) this.bytesPending.push(b);
      this.pending = '';
    }
  }
  flush() {
    this.$flushText();
    if (!this.bytesPending.length) return;
    if (this.pipe.closed) throw new IOException('Socket closed');
    const bytes = Uint8Array.from(this.bytesPending);
    this.bytesPending = [];
    this.pipe.send(bytes);
  }
  close() {
    try {
      this.flush();
    } finally {
      this.pipe.close();
    }
  }
}
defineLib(PipeOutputStream, 'java.net.SocketOutputStream');

/** java.net.InetAddress: names only (nothing is resolved). */
export class InetAddress extends JObject {
  host: string;
  addr: string;
  constructor(host?: string, addr?: string) {
    super();
    this.host = host ?? 'localhost';
    this.addr = addr ?? '127.0.0.1';
  }
  static getByName(n: string) {
    return n == null || n === 'localhost' || n === '127.0.0.1' ? InetAddress.getLoopbackAddress() : new InetAddress(n, n);
  }
  static getLocalHost() {
    return new InetAddress('localhost', '127.0.0.1');
  }
  static getLoopbackAddress() {
    return new InetAddress('localhost', '127.0.0.1');
  }
  static getAllByName(n: string) {
    return [InetAddress.getByName(n)];
  }
  getHostAddress() {
    return this.addr;
  }
  getHostName() {
    return this.host;
  }
  isLoopbackAddress() {
    return this.addr === '127.0.0.1';
  }
  isAnyLocalAddress() {
    return this.addr === '0.0.0.0';
  }
  equals(o: any) {
    return o instanceof InetAddress && o.addr === this.addr;
  }
  hashCode() {
    return $J.hashCode(this.addr);
  }
  toString() {
    return this.host + '/' + this.addr;
  }
}
defineLib(InetAddress, 'java.net.InetAddress');
export const Inet4Address = InetAddress;

export class SocketAddress extends JObject {}
defineLib(SocketAddress, 'java.net.SocketAddress');

export class InetSocketAddress extends SocketAddress {
  host: any;
  port: number;
  constructor(a?: any, port?: number) {
    super();
    this.host = a;
    this.port = port ?? 0;
  }
  _InetSocketAddress(a: any, port: number) {
    this.host = a;
    this.port = port;
    return this;
  }
  getHostName() {
    return this.host instanceof InetAddress ? this.host.getHostName() : str(this.host);
  }
  getHostString() {
    return this.getHostName();
  }
  getAddress() {
    return this.host instanceof InetAddress ? this.host : InetAddress.getByName(this.host);
  }
  getPort() {
    return this.port;
  }
  toString() {
    return this.getHostName() + ':' + this.port;
  }
}
defineLib(InetSocketAddress, 'java.net.InetSocketAddress');

/** java.net.Socket over a pipe. */
export class Socket extends JObject {
  pipe: Pipe = null;
  inp: PipeInputStream = null;
  out: PipeOutputStream = null;
  remote: InetSocketAddress = null;
  constructor(a?: any, port?: number) {
    super();
    if (a !== undefined && port !== undefined) this.connect(new InetSocketAddress(a, port));
  }
  _Socket(a?: any, port?: number) {
    if (a !== undefined && port !== undefined) this.connect(new InetSocketAddress(a, port));
    return this;
  }
  /** A socket for an end of a pipe that is already open (the server's side of a connection). */
  static $ofPipe(pipe: Pipe, remote: InetSocketAddress) {
    const s = new Socket();
    s.$attach(pipe, remote);
    return s;
  }
  $attach(pipe: Pipe, remote: InetSocketAddress) {
    this.pipe = pipe;
    this.inp = new PipeInputStream(pipe);
    this.out = new PipeOutputStream(pipe);
    this.remote = remote;
  }
  connect(addr: any, _timeout?: number) {
    if (!net.connect) throw new $J.ConnectException('Connection refused');
    const pipe = net.connect(addr.getHostName(), addr.getPort());
    if (pipe == null) throw new $J.ConnectException('Connection refused (Connection refused)');
    this.$attach(pipe, addr);
  }
  getInputStream() {
    if (!this.inp) throw new IOException('Socket is not connected');
    return this.inp;
  }
  getOutputStream() {
    if (!this.out) throw new IOException('Socket is not connected');
    return this.out;
  }
  getInetAddress() {
    return this.remote ? this.remote.getAddress() : null;
  }
  getPort() {
    return this.remote ? this.remote.getPort() : 0;
  }
  getLocalPort() {
    return -1;
  }
  isConnected() {
    return this.pipe != null;
  }
  isClosed() {
    return this.pipe == null || this.pipe.closed;
  }
  setSoTimeout(_ms: number) {}
  setTcpNoDelay(_b: boolean) {}
  setKeepAlive(_b: boolean) {}
  shutdownInput() {}
  shutdownOutput() {}
  close() {
    if (this.pipe) this.pipe.close();
  }
  toString() {
    return 'Socket[addr=' + str(this.remote) + ']';
  }
}
defineLib(Socket, 'java.net.Socket', { ifaces: ['java.io.Closeable'] });

/** java.net.ServerSocket: the server worker listens on its pipes (src/port/pipes.ts), not through this. */
export class ServerSocket extends JObject {
  port: number;
  constructor(port?: number, ..._a: any[]) {
    super();
    this.port = port ?? 0;
  }
  getLocalPort() {
    return this.port;
  }
  accept() {
    throw new IOException('accept: connections arrive through the server worker');
  }
  close() {}
  isClosed() {
    return false;
  }
  setReuseAddress(_b: boolean) {}
}
defineLib(ServerSocket, 'java.net.ServerSocket', { ifaces: ['java.io.Closeable'] });
export const ConnectException = exc('ConnectException', SocketException, 'java.net.ConnectException');
($J as any).ConnectException = ConnectException;

/** java.net.NetworkInterface: the browser has one network interface, the loopback one. */
export class NetworkInterface extends JObject {
  static networkInterfaces() {
    return Stream.of(new NetworkInterface());
  }
  static getNetworkInterfaces() {
    return Collections.enumeration(Collections.singletonList(new NetworkInterface()));
  }
  getName() {
    return 'lo';
  }
  getDisplayName() {
    return 'lo';
  }
  isLoopback() {
    return true;
  }
  isUp() {
    return true;
  }
  inetAddresses() {
    return Stream.of(InetAddress.getLoopbackAddress());
  }
  getInetAddresses() {
    return Collections.enumeration(Collections.singletonList(InetAddress.getLoopbackAddress()));
  }
}
defineLib(NetworkInterface, 'java.net.NetworkInterface');
