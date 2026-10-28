// The connection to the server, over WebTransport (HTTP/3 over QUIC: one reliable stream +
// unreliable datagrams) or WebSocket (everything reliable). Every message is one packed Cap'n Proto
// Envelope (protocol/freegames.capnp). Taken over unchanged from Valkyrie Sky (Need for Slop II SE).

export interface LinkEvents {
  open(): void;
  message(data: Uint8Array): void;
  /** the connection ended; `code` is the server's close code when the transport tells it */
  close(code?: number): void;
}

export interface Link {
  readonly kind: 'ws' | 'wt';
  /** reliable, ordered */
  send(b: Uint8Array): void;
  /** may be lost or overtaken (entity states): a datagram over WebTransport, reliable over WebSocket */
  sendUnreliable(b: Uint8Array): void;
  close(): void;
}

/** What the server announces at /wt-info. */
export interface WtInfo { port: number; path: string; certHash: string | null }

export function openWs(url: string, ev: LinkEvents): Link {
  const ws = new WebSocket(url);
  ws.binaryType = 'arraybuffer';
  let closed = false;
  ws.onopen = () => ev.open();
  ws.onmessage = (m) => { if (m.data instanceof ArrayBuffer) ev.message(new Uint8Array(m.data)); };
  ws.onclose = (e) => {
    if (e.code !== 1000) console.warn(`WebSocket closed: ${e.code} ${e.reason}`);
    if (!closed) { closed = true; ev.close(e.code); }
  };
  ws.onerror = () => { /* onclose follows */ };
  const send = (b: Uint8Array) => { if (ws.readyState === WebSocket.OPEN) ws.send(b); };
  return { kind: 'ws', send, sendUnreliable: send, close: () => ws.close() };
}

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/**
 * Opens a WebTransport session; resolves once the session and its control stream are up (then
 * `open` has fired), rejects if that fails (the caller falls back to WebSocket).
 */
export async function openWt(url: string, info: WtInfo, ev: LinkEvents, timeoutMs = 4000): Promise<Link> {
  const opts: WebTransportOptions = info.certHash
    ? { serverCertificateHashes: [{ algorithm: 'sha-256', value: b64(info.certHash) }] }
    : {};
  const t = new WebTransport(url, opts);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      t.ready,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('WebTransport timeout')), timeoutMs); }),
    ]);
  } catch (e) {
    try { t.close(); } catch { /* not open */ }
    throw e;
  } finally {
    clearTimeout(timer);
  }
  const stream = await t.createBidirectionalStream();
  const writer = stream.writable.getWriter();
  const dgWriter = t.datagrams.writable.getWriter();
  let closed = false;
  const finish = (code?: number) => { if (!closed) { closed = true; ev.close(code); } };
  t.closed.then((i) => finish((i as { closeCode?: number } | undefined)?.closeCode), () => finish());

  const send = (b: Uint8Array) => {
    if (closed) return;
    const f = new Uint8Array(4 + b.length);
    new DataView(f.buffer).setUint32(0, b.length);
    f.set(b, 4);
    writer.write(f).catch(() => { /* closed: finish() reports it */ });
  };
  const link: Link = {
    kind: 'wt',
    send,
    sendUnreliable: (b) => {
      const max = (t.datagrams as { maxDatagramSize?: number }).maxDatagramSize ?? 1024;
      if (closed) return;
      if (b.length > max) { send(b); return; }
      dgWriter.write(b).catch(() => { /* dropped */ });
    },
    // ends the stream after what was written (a LeaveRoom just before): the server reads it all, then closes
    // the session; closing the session here at once could drop what was still on its way. If the server
    // does not close it within a second, the client does.
    close: () => {
      finish();
      const end = () => { try { t.close(); } catch { /* already closed */ } };
      const timer = setTimeout(end, 1000);
      t.closed.then(() => clearTimeout(timer), () => clearTimeout(timer));
      writer.close().catch(end);
    },
  };
  ev.open();
  // reliable messages: 4-byte big-endian length + Envelope, possibly split over chunks
  void (async () => {
    const reader = stream.readable.getReader();
    let buf = new Uint8Array(0);
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const nb = new Uint8Array(buf.length + value.length);
        nb.set(buf); nb.set(value, buf.length);
        buf = nb;
        let off = 0;
        while (buf.length - off >= 4) {
          const len = new DataView(buf.buffer, buf.byteOffset + off).getUint32(0);
          if (buf.length - off - 4 < len) break;
          ev.message(buf.slice(off + 4, off + 4 + len));
          off += 4 + len;
        }
        if (off) buf = buf.slice(off);
      }
    } catch { /* closed */ }
    link.close();
  })();
  // datagrams (entity states)
  void (async () => {
    const reader = t.datagrams.readable.getReader();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        ev.message(value);
      }
    } catch { /* closed */ }
  })();
  return link;
}

/** /wt-info of the server behind a ws(s):// URL; null if it has none or does not answer. */
export async function fetchWtInfo(wsUrl: string, timeoutMs = 2000): Promise<WtInfo | null> {
  try {
    const u = new URL(wsUrl);
    const origin = `${u.protocol === 'wss:' ? 'https:' : 'http:'}//${u.host}`;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    const r = await fetch(`${origin}/wt-info`, { signal: ctl.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!r.ok) return null;
    const j = await r.json() as WtInfo;
    return typeof j.port === 'number' && typeof j.path === 'string' ? j : null;
  } catch {
    return null;
  }
}
