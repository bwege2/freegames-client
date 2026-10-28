// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/network.{h,cpp}, network_conn.cpp, network_client.cpp and network_token.cpp of
// Teeworlds 0.7.5 in TypeScript; the UDP socket, the clock and the random source are the host's (NetHost).
import { huffman } from './huffman.ts';
import { md5 } from '../../base/md5.ts';
import { str_copy, str_sanitize_strong, strOf } from '../../base/system.ts';

export const NETFLAG_ALLOWSTATELESS = 1;
export const NETSENDFLAG_VITAL = 1, NETSENDFLAG_CONNLESS = 2, NETSENDFLAG_FLUSH = 4;
export const NETSTATE_OFFLINE = 0, NETSTATE_CONNECTING = 1, NETSTATE_ONLINE = 2;
export const NET_MAX_CHUNKHEADERSIZE = 3;
export const NET_PACKETHEADERSIZE = 7;
export const NET_PACKETHEADERSIZE_CONNLESS = NET_PACKETHEADERSIZE + 2;
export const NET_MAX_PACKETHEADERSIZE = NET_PACKETHEADERSIZE_CONNLESS;
export const NET_MAX_PACKETSIZE = 1400;
export const NET_MAX_PAYLOAD = NET_MAX_PACKETSIZE - NET_MAX_PACKETHEADERSIZE;
export const NET_PACKETVERSION = 1;
export const NET_PACKETFLAG_CONTROL = 1, NET_PACKETFLAG_RESEND = 2, NET_PACKETFLAG_COMPRESSION = 4, NET_PACKETFLAG_CONNLESS = 8;
export const NET_MAX_PACKET_CHUNKS = 256;
export const NET_SEEDTIME = 16;
export const NET_TOKENCACHE_SIZE = 64, NET_TOKENCACHE_ADDRESSEXPIRY = NET_SEEDTIME, NET_TOKENCACHE_PACKETEXPIRY = 5;
/** tokens are unsigned 32-bit (numbers 0..2^32-1 here) */
export const NET_TOKEN_MAX = 0xffffffff, NET_TOKEN_NONE = NET_TOKEN_MAX, NET_TOKEN_MASK = NET_TOKEN_MAX;
export const NET_TOKENFLAG_ALLOWBROADCAST = 1, NET_TOKENFLAG_RESPONSEONLY = 2;
export const NET_TOKENREQUEST_DATASIZE = 512;
export const NET_MAX_CLIENTS = 64;
export const NET_MAX_SEQUENCE = 1 << 10, NET_SEQUENCE_MASK = NET_MAX_SEQUENCE - 1;
export const NET_CONNSTATE_OFFLINE = 0, NET_CONNSTATE_TOKEN = 1, NET_CONNSTATE_CONNECT = 2, NET_CONNSTATE_PENDING = 3,
  NET_CONNSTATE_ONLINE = 4, NET_CONNSTATE_ERROR = 5;
export const NET_CHUNKFLAG_VITAL = 1, NET_CHUNKFLAG_RESEND = 2;
export const NET_CTRLMSG_KEEPALIVE = 0, NET_CTRLMSG_CONNECT = 1, NET_CTRLMSG_ACCEPT = 2, NET_CTRLMSG_CLOSE = 4, NET_CTRLMSG_TOKEN = 5;
export const NET_CONN_BUFFERSIZE = 1024 * 32;
export const NETTYPE_INVALID = 0, NETTYPE_IPV4 = 1, NETTYPE_IPV6 = 2, NETTYPE_LINK_BROADCAST = 4, NETTYPE_ALL = 3;

/** time_freq(): microseconds */
export const TIME_FREQ = 1000000;

/** NETADDR: type, ip[16], port (24 bytes with 2 zero padding bytes) */
export class NETADDR {
  type = 0;
  ip = new Uint8Array(16);
  port = 0;
  static ipv4(a: number, b: number, c: number, d: number, port: number): NETADDR {
    const n = new NETADDR();
    n.type = NETTYPE_IPV4;
    n.ip.set([a, b, c, d]);
    n.port = port & 0xffff;
    return n;
  }
  copy(): NETADDR {
    const n = new NETADDR();
    n.type = this.type;
    n.ip.set(this.ip);
    n.port = this.port;
    return n;
  }
  bytes(): Uint8Array {
    const b = new Uint8Array(24);
    const dv = new DataView(b.buffer);
    dv.setUint32(0, this.type >>> 0, true);
    b.set(this.ip, 4);
    dv.setUint16(20, this.port, true);
    return b;
  }
  equals(o: NETADDR): boolean {
    if (o.type !== this.type || o.port !== this.port) return false;
    for (let i = 0; i < 16; i++) if (o.ip[i] !== this.ip[i]) return false;
    return true;
  }
}

export function net_addr_comp(a: NETADDR, b: NETADDR): number { return a.equals(b) ? 0 : 1; }

/** what the original takes from the system */
export interface NetHost {
  /** net_udp_send */
  send(addr: NETADDR, data: Uint8Array): void;
  /** net_udp_recv: the next datagram and its source, or null */
  recv(): { addr: NETADDR; data: Uint8Array } | null;
  /** time_get() in microseconds */
  time_get(): number;
  /** secure_random_fill */
  secure_random_fill(b: Uint8Array): void;
  /** random_int() (base/math.h rand-based) for the client's connection token */
  random_int(): number;
}

export class CNetChunk {
  m_ClientID = 0;
  m_Address = new NETADDR();
  m_Flags = 0;
  m_DataSize = 0;
  m_pData: Uint8Array = new Uint8Array(0);
}

export class CNetChunkHeader {
  m_Flags = 0;
  m_Size = 0;
  m_Sequence = 0;
  Pack(d: Uint8Array, p: number): number {
    d[p] = ((this.m_Flags & 0x03) << 6) | ((this.m_Size >> 6) & 0x3F);
    d[p + 1] = this.m_Size & 0x3F;
    if (this.m_Flags & NET_CHUNKFLAG_VITAL) {
      d[p + 1] |= (this.m_Sequence >> 2) & 0xC0;
      d[p + 2] = this.m_Sequence & 0xFF;
      return p + 3;
    }
    return p + 2;
  }
  Unpack(d: Uint8Array, p: number): number {
    this.m_Flags = (d[p] >> 6) & 0x03;
    this.m_Size = ((d[p] & 0x3F) << 6) | (d[p + 1] & 0x3F);
    this.m_Sequence = -1;
    if (this.m_Flags & NET_CHUNKFLAG_VITAL) {
      this.m_Sequence = ((d[p + 1] & 0xC0) << 2) | d[p + 2];
      return p + 3;
    }
    return p + 2;
  }
}

interface CNetChunkResend {
  m_Flags: number;
  m_DataSize: number;
  m_pData: Uint8Array;
  m_Sequence: number;
  m_LastSendTime: number;
  m_FirstSendTime: number;
}

export class CNetPacketConstruct {
  m_Token = 0;
  m_ResponseToken = 0;
  m_Flags = 0;
  m_Ack = 0;
  m_NumChunks = 0;
  m_DataSize = 0;
  readonly m_aChunkData = new Uint8Array(NET_MAX_PAYLOAD + 8);
  clear(): void {
    this.m_Token = 0;
    this.m_ResponseToken = 0;
    this.m_Flags = 0;
    this.m_Ack = 0;
    this.m_NumChunks = 0;
    this.m_DataSize = 0;
    this.m_aChunkData.fill(0);
  }
}

const be32 = (b: Uint8Array, o: number): number => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;

export class CNetBase {
  host!: NetHost;
  readonly m_aRequestTokenBuf = new Uint8Array(NET_TOKENREQUEST_DATASIZE);
  /** bytes and packets sent and received (NETSTATS-like, for the e2e test) */
  stats = { sentPackets: 0, sentBytes: 0, recvPackets: 0, recvBytes: 0 };

  Init(host: NetHost): void {
    this.host = host;
    this.m_aRequestTokenBuf.fill(0);
  }

  time_get(): number { return this.host.time_get(); }

  private out(addr: NETADDR, b: Uint8Array, size: number): void {
    this.stats.sentPackets++;
    this.stats.sentBytes += size;
    this.host.send(addr, b.slice(0, size));
  }

  SendPacketConnless(addr: NETADDR, Token: number, ResponseToken: number, pData: Uint8Array, DataSize: number): void {
    const b = new Uint8Array(NET_MAX_PACKETSIZE);
    let i = 0;
    b[i++] = ((NET_PACKETFLAG_CONNLESS << 2) & 0xfc) | (NET_PACKETVERSION & 0x03);
    b[i++] = (Token >>> 24) & 0xff;
    b[i++] = (Token >>> 16) & 0xff;
    b[i++] = (Token >>> 8) & 0xff;
    b[i++] = Token & 0xff;
    b[i++] = (ResponseToken >>> 24) & 0xff;
    b[i++] = (ResponseToken >>> 16) & 0xff;
    b[i++] = (ResponseToken >>> 8) & 0xff;
    b[i++] = ResponseToken & 0xff;
    b.set(pData.subarray(0, DataSize), i);
    this.out(addr, b, i + DataSize);
  }

  SendPacket(addr: NETADDR, p: CNetPacketConstruct): void {
    const b = new Uint8Array(NET_MAX_PACKETSIZE);
    let CompressedSize = -1;
    let FinalSize: number;
    if (!(p.m_Flags & NET_PACKETFLAG_CONTROL))
      CompressedSize = huffman.Compress(p.m_aChunkData, p.m_DataSize, b, NET_PACKETHEADERSIZE, NET_MAX_PAYLOAD);
    if (CompressedSize > 0 && CompressedSize < p.m_DataSize) {
      FinalSize = CompressedSize;
      p.m_Flags |= NET_PACKETFLAG_COMPRESSION;
    } else {
      FinalSize = p.m_DataSize;
      b.set(p.m_aChunkData.subarray(0, p.m_DataSize), NET_PACKETHEADERSIZE);
      p.m_Flags &= ~NET_PACKETFLAG_COMPRESSION;
    }
    if (FinalSize >= 0) {
      FinalSize += NET_PACKETHEADERSIZE;
      let i = 0;
      b[i++] = ((p.m_Flags << 2) & 0xfc) | ((p.m_Ack >> 8) & 0x03);
      b[i++] = p.m_Ack & 0xff;
      b[i++] = p.m_NumChunks & 0xff;
      b[i++] = (p.m_Token >>> 24) & 0xff;
      b[i++] = (p.m_Token >>> 16) & 0xff;
      b[i++] = (p.m_Token >>> 8) & 0xff;
      b[i++] = p.m_Token & 0xff;
      this.out(addr, b, FinalSize);
    }
  }

  /** 1: no more packets, -1: a bad one, 0: p holds one from addr */
  UnpackPacket(addr: NETADDR, p: CNetPacketConstruct): number {
    const d = this.host.recv();
    if (!d || d.data.length <= 0) return 1;
    const pBuffer = d.data;
    const src = d.addr;
    addr.type = src.type;
    addr.ip.set(src.ip);
    addr.port = src.port;
    const Size = pBuffer.length;
    this.stats.recvPackets++;
    this.stats.recvBytes += Size;
    if (Size < NET_PACKETHEADERSIZE || Size > NET_MAX_PACKETSIZE) return -1;
    p.m_Flags = (pBuffer[0] & 0xfc) >> 2;
    if (p.m_Flags & NET_PACKETFLAG_CONNLESS) {
      if (Size < NET_PACKETHEADERSIZE_CONNLESS) return -1;
      p.m_Flags = NET_PACKETFLAG_CONNLESS;
      p.m_Ack = 0;
      p.m_NumChunks = 0;
      if ((pBuffer[0] & 0x3) !== NET_PACKETVERSION) return -1;
      p.m_DataSize = Size - NET_PACKETHEADERSIZE_CONNLESS;
      p.m_Token = be32(pBuffer, 1);
      p.m_ResponseToken = be32(pBuffer, 5);
      p.m_aChunkData.set(pBuffer.subarray(NET_PACKETHEADERSIZE_CONNLESS, Size));
    } else {
      if (Size - NET_PACKETHEADERSIZE > NET_MAX_PAYLOAD) return -1;
      p.m_Ack = ((pBuffer[0] & 0x3) << 8) | pBuffer[1];
      p.m_NumChunks = pBuffer[2];
      p.m_DataSize = Size - NET_PACKETHEADERSIZE;
      p.m_Token = be32(pBuffer, 3);
      p.m_ResponseToken = NET_TOKEN_NONE;
      if (p.m_Flags & NET_PACKETFLAG_COMPRESSION)
        p.m_DataSize = huffman.Decompress(pBuffer, NET_PACKETHEADERSIZE, p.m_DataSize, p.m_aChunkData, NET_MAX_PAYLOAD);
      else p.m_aChunkData.set(pBuffer.subarray(NET_PACKETHEADERSIZE, Size));
    }
    if (p.m_DataSize < 0) return -1;
    if (p.m_Flags & NET_PACKETFLAG_CONTROL) {
      if (p.m_DataSize >= 5) {
        const c = p.m_aChunkData[0];
        if (c === NET_CTRLMSG_CONNECT || c === NET_CTRLMSG_TOKEN) p.m_ResponseToken = be32(p.m_aChunkData, 1);
      }
    }
    return 0;
  }

  SendControlMsg(addr: NETADDR, Token: number, Ack: number, ControlMsg: number, pExtra: Uint8Array | null, ExtraSize: number): void {
    const c = new CNetPacketConstruct();
    c.m_Token = Token;
    c.m_Flags = NET_PACKETFLAG_CONTROL;
    c.m_Ack = Ack;
    c.m_NumChunks = 0;
    c.m_DataSize = 1 + ExtraSize;
    c.m_aChunkData[0] = ControlMsg;
    if (pExtra && ExtraSize > 0) c.m_aChunkData.set(pExtra.subarray(0, ExtraSize), 1);
    this.SendPacket(addr, c);
  }

  SendControlMsgWithToken(addr: NETADDR, Token: number, _Ack: number, ControlMsg: number, MyToken: number, Extended: boolean): void {
    const t = this.m_aRequestTokenBuf;
    t[0] = (MyToken >>> 24) & 0xff;
    t[1] = (MyToken >>> 16) & 0xff;
    t[2] = (MyToken >>> 8) & 0xff;
    t[3] = MyToken & 0xff;
    this.SendControlMsg(addr, Token, 0, ControlMsg, t, Extended ? t.length : 4);
  }
}

// ---------------------------------------------------------------- tokens

export function tokenHash(data: Uint8Array): number {
  const d = md5(data);
  let r = 0;
  for (let i = 0; i < 4; i++) r ^= be32(d, i * 4);
  return r >>> 0;
}

export class CNetTokenManager {
  private base!: CNetBase;
  private seed = new Uint8Array(8);
  private prevSeed = new Uint8Array(8);
  private globalToken = 0;
  private prevGlobalToken = 0;
  private seedTime = NET_SEEDTIME;
  private nextSeedTime = 0;

  Init(base: CNetBase, SeedTime = NET_SEEDTIME): void {
    this.base = base;
    this.seedTime = SeedTime;
    this.GenerateSeed();
  }
  Update(): void {
    if (this.base.time_get() > this.nextSeedTime) this.GenerateSeed();
  }
  GenerateSeed(): void {
    this.prevSeed = this.seed;
    this.seed = new Uint8Array(8);
    this.base.host.secure_random_fill(this.seed);
    this.prevGlobalToken = this.globalToken;
    this.globalToken = CNetTokenManager.GenerateTokenSeed(new NETADDR(), this.seed);
    this.nextSeedTime = this.base.time_get() + TIME_FREQ * this.seedTime;
  }
  GenerateToken(addr: NETADDR): number { return CNetTokenManager.GenerateTokenSeed(addr, this.seed); }
  static GenerateTokenSeed(addr: NETADDR, seed: Uint8Array): number {
    if (addr.type & NETTYPE_LINK_BROADCAST) return CNetTokenManager.GenerateTokenSeed(new NETADDR(), seed);
    const a = addr.copy();
    a.port = 0;
    const buf = new Uint8Array(32);
    buf.set(a.bytes());
    buf.set(seed, 24);
    let r = tokenHash(buf);
    if (r === NET_TOKEN_NONE) r--;
    return r;
  }
  CheckToken(addr: NETADDR, Token: number, out: { broadcast: boolean }): boolean {
    if (CNetTokenManager.GenerateTokenSeed(addr, this.seed) === Token) return true;
    if (CNetTokenManager.GenerateTokenSeed(addr, this.prevSeed) === Token) return true;
    if (Token === this.globalToken || Token === this.prevGlobalToken) {
      out.broadcast = true;
      return true;
    }
    return false;
  }
  ProcessMessage(addr: NETADDR, p: CNetPacketConstruct): number {
    const br = { broadcast: false };
    if (p.m_Token !== NET_TOKEN_NONE && !this.CheckToken(addr, p.m_Token, br)) return 0;
    const Verified = p.m_Token !== NET_TOKEN_NONE;
    const TokenMessage = !!(p.m_Flags & NET_PACKETFLAG_CONTROL) && p.m_aChunkData[0] === NET_CTRLMSG_TOKEN;
    if (p.m_Flags & NET_PACKETFLAG_CONNLESS) return Verified && !br.broadcast ? 1 : 0;
    if (!TokenMessage) return Verified && !br.broadcast ? 1 : 0;
    if (Verified && TokenMessage) return br.broadcast ? -1 : 1;
    if (p.m_DataSize >= NET_TOKENREQUEST_DATASIZE)
      this.base.SendControlMsgWithToken(addr, p.m_ResponseToken, 0, NET_CTRLMSG_TOKEN, this.GenerateToken(addr), false);
    return 0;
  }
}

// ---------------------------------------------------------------- CNetConnection

export class CNetConnection {
  m_Sequence = 0;
  m_Ack = 0;
  m_PeerAck = 0;
  m_State = NET_CONNSTATE_OFFLINE;
  m_RemoteClosed = 0;
  m_BlockCloseMsg = false;
  readonly m_Buffer: CNetChunkResend[] = [];
  private bufferBytes = 0;
  m_LastUpdateTime = 0;
  m_LastRecvTime = 0;
  m_LastSendTime = 0;
  m_ErrorString = '';
  readonly m_Construct = new CNetPacketConstruct();
  m_Token = NET_TOKEN_NONE;
  m_PeerToken = NET_TOKEN_NONE;
  m_PeerAddr = new NETADDR();
  base!: CNetBase;

  private static blockSize(n: number): number { return Math.floor((n + 40 + 24 + 23) / 24) * 24; }

  Reset(): void {
    this.m_Sequence = 0;
    this.m_Ack = 0;
    this.m_PeerAck = 0;
    this.m_RemoteClosed = 0;
    this.m_State = NET_CONNSTATE_OFFLINE;
    this.m_LastSendTime = 0;
    this.m_LastRecvTime = 0;
    this.m_LastUpdateTime = 0;
    this.m_Token = NET_TOKEN_NONE;
    this.m_PeerToken = NET_TOKEN_NONE;
    this.m_PeerAddr = new NETADDR();
    this.m_Buffer.length = 0;
    this.bufferBytes = 0;
    this.m_Construct.clear();
  }

  SetToken(Token: number): void {
    if (this.m_State !== NET_CONNSTATE_OFFLINE) return;
    this.m_Token = Token;
  }

  Init(base: CNetBase, BlockCloseMsg: boolean): void {
    this.Reset();
    this.base = base;
    this.m_BlockCloseMsg = BlockCloseMsg;
    this.m_ErrorString = '';
  }

  private AckChunks(Ack: number): void {
    while (this.m_Buffer.length) {
      const r = this.m_Buffer[0];
      if (CNetConnection.IsSeqInBackroom(r.m_Sequence, Ack)) {
        this.m_Buffer.shift();
        this.bufferBytes -= CNetConnection.blockSize(r.m_DataSize);
      } else break;
    }
  }

  SignalResend(): void { this.m_Construct.m_Flags |= NET_PACKETFLAG_RESEND; }

  Flush(): number {
    const n = this.m_Construct.m_NumChunks;
    if (!n && !this.m_Construct.m_Flags) return 0;
    this.m_Construct.m_Ack = this.m_Ack;
    this.m_Construct.m_Token = this.m_PeerToken;
    this.base.SendPacket(this.m_PeerAddr, this.m_Construct);
    this.m_LastSendTime = this.base.time_get();
    this.m_Construct.clear();
    return n;
  }

  private QueueChunkEx(Flags: number, DataSize: number, pData: Uint8Array, Sequence: number): number {
    const c = this.m_Construct;
    if (c.m_DataSize + DataSize + NET_MAX_CHUNKHEADERSIZE > NET_MAX_PAYLOAD || c.m_NumChunks === NET_MAX_PACKET_CHUNKS) this.Flush();
    const h = new CNetChunkHeader();
    h.m_Flags = Flags;
    h.m_Size = DataSize;
    h.m_Sequence = Sequence;
    let p = h.Pack(c.m_aChunkData, c.m_DataSize);
    c.m_aChunkData.set(pData.subarray(0, DataSize), p);
    p += DataSize;
    c.m_NumChunks++;
    c.m_DataSize = p;
    if (Flags & NET_CHUNKFLAG_VITAL && !(Flags & NET_CHUNKFLAG_RESEND)) {
      const need = CNetConnection.blockSize(DataSize);
      if (this.bufferBytes + need <= Math.floor(NET_CONN_BUFFERSIZE / 24) * 24) {
        const now = this.base.time_get();
        this.m_Buffer.push({ m_Sequence: Sequence, m_Flags: Flags, m_DataSize: DataSize, m_pData: pData.slice(0, DataSize), m_FirstSendTime: now, m_LastSendTime: now });
        this.bufferBytes += need;
      } else {
        this.Disconnect('too weak connection (out of buffer)');
        return -1;
      }
    }
    return 0;
  }

  QueueChunk(Flags: number, DataSize: number, pData: Uint8Array): number {
    if (Flags & NET_CHUNKFLAG_VITAL) this.m_Sequence = (this.m_Sequence + 1) % NET_MAX_SEQUENCE;
    return this.QueueChunkEx(Flags, DataSize, pData, this.m_Sequence);
  }

  private SendControl(ControlMsg: number, pExtra: Uint8Array | null, ExtraSize: number): void {
    this.m_LastSendTime = this.base.time_get();
    this.base.SendControlMsg(this.m_PeerAddr, this.m_PeerToken, this.m_Ack, ControlMsg, pExtra, ExtraSize);
  }

  SendPacketConnless(pData: Uint8Array, DataSize: number): void {
    this.base.SendPacketConnless(this.m_PeerAddr, this.m_PeerToken, this.m_Token, pData, DataSize);
  }

  private SendControlWithToken(ControlMsg: number): void {
    this.m_LastSendTime = this.base.time_get();
    this.base.SendControlMsgWithToken(this.m_PeerAddr, this.m_PeerToken, 0, ControlMsg, this.m_Token, true);
  }

  private ResendChunk(r: CNetChunkResend): void {
    this.QueueChunkEx(r.m_Flags | NET_CHUNKFLAG_RESEND, r.m_DataSize, r.m_pData, r.m_Sequence);
    r.m_LastSendTime = this.base.time_get();
  }

  private Resend(): void {
    for (const r of this.m_Buffer.slice()) this.ResendChunk(r);
  }

  Connect(addr: NETADDR): number {
    if (this.m_State !== NET_CONNSTATE_OFFLINE) return -1;
    this.Reset();
    this.m_LastRecvTime = this.base.time_get();
    this.m_PeerAddr = addr.copy();
    this.m_PeerToken = NET_TOKEN_NONE;
    this.SetToken((this.base.host.random_int() & NET_TOKEN_MASK) >>> 0);
    this.m_ErrorString = '';
    this.m_State = NET_CONNSTATE_TOKEN;
    this.SendControlWithToken(NET_CTRLMSG_TOKEN);
    return 0;
  }

  Disconnect(pReason: string | null): void {
    if (this.m_State === NET_CONNSTATE_OFFLINE) return;
    if (this.m_RemoteClosed === 0) {
      if (pReason !== null) {
        const r = pReason + '\0';
        const b = new Uint8Array(r.length);
        for (let i = 0; i < r.length; i++) b[i] = r.charCodeAt(i);
        this.SendControl(NET_CTRLMSG_CLOSE, b, b.length);
      } else this.SendControl(NET_CTRLMSG_CLOSE, null, 0);
      if (pReason !== this.m_ErrorString) this.m_ErrorString = pReason !== null ? str_copy(pReason, 256) : '';
    }
    this.Reset();
  }

  Feed(p: CNetPacketConstruct, addr: NETADDR): number {
    if (this.m_Sequence >= this.m_PeerAck) {
      if (p.m_Ack < this.m_PeerAck || p.m_Ack > this.m_Sequence) return 0;
    } else {
      if (p.m_Ack < this.m_PeerAck && p.m_Ack > this.m_Sequence) return 0;
    }
    this.m_PeerAck = p.m_Ack;
    const Now = this.base.time_get();
    if (p.m_Token === NET_TOKEN_NONE || p.m_Token !== this.m_Token) return 0;
    if (p.m_Flags & NET_PACKETFLAG_RESEND) this.Resend();
    if (p.m_Flags & NET_PACKETFLAG_CONNLESS) return 1;
    if (p.m_Flags & NET_PACKETFLAG_CONTROL) {
      const CtrlMsg = p.m_aChunkData[0];
      if (CtrlMsg === NET_CTRLMSG_CLOSE) {
        if (net_addr_comp(this.m_PeerAddr, addr) === 0) {
          this.m_State = NET_CONNSTATE_ERROR;
          this.m_RemoteClosed = 1;
          let s = '';
          if (p.m_DataSize > 1) {
            const n = p.m_DataSize < 128 ? p.m_DataSize : 128;
            s = str_copy(strOf(p.m_aChunkData, 1, n - 1), n);
            s = str_sanitize_strong(s);
          }
          if (!this.m_BlockCloseMsg) this.m_ErrorString = str_copy(s, 256);
        }
        return 0;
      } else if (CtrlMsg === NET_CTRLMSG_TOKEN) {
        this.m_PeerToken = p.m_ResponseToken;
        if (this.m_State === NET_CONNSTATE_TOKEN) {
          this.m_LastRecvTime = Now;
          this.m_State = NET_CONNSTATE_CONNECT;
          this.SendControlWithToken(NET_CTRLMSG_CONNECT);
        }
      } else if (this.m_State === NET_CONNSTATE_OFFLINE) {
        if (CtrlMsg === NET_CTRLMSG_CONNECT) {
          const Token = this.m_Token;
          this.Reset();
          this.m_ErrorString = '';
          this.m_State = NET_CONNSTATE_PENDING;
          this.m_PeerAddr = addr.copy();
          this.m_PeerToken = p.m_ResponseToken;
          this.m_Token = Token;
          this.m_LastSendTime = Now;
          this.m_LastRecvTime = Now;
          this.m_LastUpdateTime = Now;
          this.SendControl(NET_CTRLMSG_ACCEPT, null, 0);
        }
      } else if (this.m_State === NET_CONNSTATE_CONNECT) {
        if (CtrlMsg === NET_CTRLMSG_ACCEPT) {
          this.m_LastRecvTime = Now;
          this.m_State = NET_CONNSTATE_ONLINE;
        }
      }
    } else if (this.m_State === NET_CONNSTATE_PENDING) {
      this.m_LastRecvTime = Now;
      this.m_State = NET_CONNSTATE_ONLINE;
    }
    if (this.m_State === NET_CONNSTATE_ONLINE) {
      this.m_LastRecvTime = Now;
      this.AckChunks(p.m_Ack);
    }
    return 1;
  }

  Update(): number {
    const Now = this.base.time_get();
    const st = this.m_State;
    if (st === NET_CONNSTATE_OFFLINE || st === NET_CONNSTATE_ERROR) return 0;
    if (st !== NET_CONNSTATE_TOKEN && Now - this.m_LastRecvTime > TIME_FREQ * 10) {
      this.m_State = NET_CONNSTATE_ERROR;
      this.m_ErrorString = 'Timeout';
    } else if (st === NET_CONNSTATE_TOKEN && Now - this.m_LastRecvTime > TIME_FREQ * 5) {
      this.m_State = NET_CONNSTATE_ERROR;
      this.m_ErrorString = 'Unable to connect to the server';
    }
    if (this.m_Buffer.length) {
      const r = this.m_Buffer[0];
      if (Now - r.m_FirstSendTime > TIME_FREQ * 10) {
        this.m_State = NET_CONNSTATE_ERROR;
        this.m_ErrorString = 'Too weak connection (not acked for 10 seconds)';
      } else if (Now - r.m_LastSendTime > TIME_FREQ) this.ResendChunk(r);
    }
    const t = (): number => this.base.time_get();
    if (this.m_State === NET_CONNSTATE_ONLINE) {
      if (t() - this.m_LastSendTime > TIME_FREQ / 2) this.Flush();
      if (t() - this.m_LastSendTime > TIME_FREQ) this.SendControl(NET_CTRLMSG_KEEPALIVE, null, 0);
    } else if (this.m_State === NET_CONNSTATE_TOKEN) {
      if (t() - this.m_LastSendTime > TIME_FREQ / 2) this.SendControlWithToken(NET_CTRLMSG_TOKEN);
    } else if (this.m_State === NET_CONNSTATE_CONNECT) {
      if (t() - this.m_LastSendTime > TIME_FREQ / 2) this.SendControlWithToken(NET_CTRLMSG_CONNECT);
    } else if (this.m_State === NET_CONNSTATE_PENDING) {
      if (t() - this.m_LastSendTime > TIME_FREQ / 2) this.SendControl(NET_CTRLMSG_ACCEPT, null, 0);
    }
    return 0;
  }

  static IsSeqInBackroom(Seq: number, Ack: number): boolean {
    const Bottom = Ack - NET_MAX_SEQUENCE / 2;
    if (Bottom < 0) {
      if (Seq <= Ack) return true;
      if (Seq >= Bottom + NET_MAX_SEQUENCE) return true;
    } else if (Seq <= Ack && Seq >= Bottom) return true;
    return false;
  }

  State(): number { return this.m_State; }
  PeerAddress(): NETADDR { return this.m_PeerAddr; }
  ErrorString(): string { return this.m_ErrorString; }
  ResetErrorString(): void { this.m_ErrorString = ''; }
  LastRecvTime(): number { return this.m_LastRecvTime; }
  AckSequence(): number { return this.m_Ack; }
}

// ---------------------------------------------------------------- CNetRecvUnpacker

export class CNetRecvUnpacker {
  m_Valid = false;
  m_Addr = new NETADDR();
  m_pConnection: CNetConnection | null = null;
  m_CurrentChunk = 0;
  m_ClientID = 0;
  readonly m_Data = new CNetPacketConstruct();

  Clear(): void { this.m_Valid = false; }
  Start(addr: NETADDR, conn: CNetConnection | null, ClientID: number): void {
    this.m_Addr = addr.copy();
    this.m_pConnection = conn;
    this.m_ClientID = ClientID;
    this.m_CurrentChunk = 0;
    this.m_Valid = true;
  }

  FetchChunk(pChunk: CNetChunk): number {
    if (this.m_pConnection && this.m_pConnection.State() !== NET_CONNSTATE_ONLINE) {
      this.Clear();
      return 0;
    }
    const h = new CNetChunkHeader();
    const pEnd = this.m_Data.m_DataSize;
    for (;;) {
      let p = 0;
      if (!this.m_Valid || this.m_CurrentChunk >= this.m_Data.m_NumChunks) {
        this.Clear();
        return 0;
      }
      for (let i = 0; i < this.m_CurrentChunk; i++) {
        p = h.Unpack(this.m_Data.m_aChunkData, p);
        p += h.m_Size;
        if (p > NET_MAX_PAYLOAD) {
          this.Clear();
          return 0;
        }
      }
      p = h.Unpack(this.m_Data.m_aChunkData, p);
      this.m_CurrentChunk++;
      if (p + h.m_Size > pEnd) {
        this.Clear();
        return 0;
      }
      const c = this.m_pConnection;
      if (c && h.m_Flags & NET_CHUNKFLAG_VITAL) {
        if (h.m_Sequence === (c.m_Ack + 1) % NET_MAX_SEQUENCE) {
          c.m_Ack = (c.m_Ack + 1) % NET_MAX_SEQUENCE;
        } else {
          if (CNetConnection.IsSeqInBackroom(h.m_Sequence, c.m_Ack)) continue;
          c.SignalResend();
          continue;
        }
      }
      pChunk.m_ClientID = this.m_ClientID;
      pChunk.m_Address = this.m_Addr;
      pChunk.m_Flags = h.m_Flags & NET_CHUNKFLAG_VITAL ? NETSENDFLAG_VITAL : 0;
      pChunk.m_DataSize = h.m_Size;
      pChunk.m_pData = this.m_Data.m_aChunkData.slice(p, p + h.m_Size);
      return 1;
    }
  }
}

// ---------------------------------------------------------------- CNetClient (network_client.cpp)

export class CNetClient extends CNetBase {
  readonly m_Connection = new CNetConnection();
  readonly m_RecvUnpacker = new CNetRecvUnpacker();
  readonly m_TokenManager = new CNetTokenManager();
  m_Flags = 0;

  Open(host: NetHost, Flags = 0): boolean {
    this.Init(host);
    this.m_Connection.Init(this, false);
    this.m_TokenManager.Init(this);
    this.m_Flags = Flags;
    return true;
  }

  Close(): void {
    if (this.m_Connection.State() !== NET_CONNSTATE_OFFLINE) this.m_Connection.Disconnect('Client shutdown');
  }

  Disconnect(pReason: string | null): number {
    this.m_Connection.Disconnect(pReason);
    return 0;
  }

  Update(): number {
    this.m_Connection.Update();
    if (this.m_Connection.State() === NET_CONNSTATE_ERROR) this.Disconnect(this.m_Connection.ErrorString());
    this.m_TokenManager.Update();
    return 0;
  }

  Connect(addr: NETADDR): number {
    this.m_Connection.Connect(addr);
    return 0;
  }

  ResetErrorString(): number {
    this.m_Connection.ResetErrorString();
    return 0;
  }

  Recv(pChunk: CNetChunk): number {
    for (;;) {
      if (this.m_RecvUnpacker.FetchChunk(pChunk)) return 1;
      const Addr = new NETADDR();
      const r = this.UnpackPacket(Addr, this.m_RecvUnpacker.m_Data);
      if (r > 0) break;
      if (r === 0) {
        const st = this.m_Connection.State();
        if (st !== NET_CONNSTATE_OFFLINE && st !== NET_CONNSTATE_ERROR && net_addr_comp(this.m_Connection.PeerAddress(), Addr) === 0) {
          if (this.m_Connection.Feed(this.m_RecvUnpacker.m_Data, Addr)) {
            if (!(this.m_RecvUnpacker.m_Data.m_Flags & NET_PACKETFLAG_CONNLESS)) this.m_RecvUnpacker.Start(Addr, this.m_Connection, 0);
          }
        } else {
          // connless packets (the server browser) are not used: the room list replaces it
          this.m_TokenManager.ProcessMessage(Addr, this.m_RecvUnpacker.m_Data);
        }
      }
    }
    return 0;
  }

  Send(pChunk: CNetChunk): number {
    if (pChunk.m_Flags & NETSENDFLAG_CONNLESS) {
      if (pChunk.m_DataSize >= NET_MAX_PAYLOAD) return -1;
      this.m_Connection.SendPacketConnless(pChunk.m_pData, pChunk.m_DataSize);
    } else {
      if (pChunk.m_DataSize + NET_MAX_CHUNKHEADERSIZE >= NET_MAX_PAYLOAD) return -1;
      const Flags = pChunk.m_Flags & NETSENDFLAG_VITAL ? NET_CHUNKFLAG_VITAL : 0;
      this.m_Connection.QueueChunk(Flags, pChunk.m_DataSize, pChunk.m_pData);
      if (pChunk.m_Flags & NETSENDFLAG_FLUSH) this.m_Connection.Flush();
    }
    return 0;
  }

  State(): number {
    const s = this.m_Connection.State();
    if (s === NET_CONNSTATE_ONLINE) return NETSTATE_ONLINE;
    if (s === NET_CONNSTATE_OFFLINE) return NETSTATE_OFFLINE;
    return NETSTATE_CONNECTING;
  }

  Flush(): number { return this.m_Connection.Flush(); }

  GotProblems(): boolean { return this.time_get() - this.m_Connection.LastRecvTime() > TIME_FREQ; }

  ErrorString(): string { return this.m_Connection.ErrorString(); }
}

