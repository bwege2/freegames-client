// The client's network and snapshot code (CClient: CNetClient, chunks, snapshot reassembly, delta, crc; the game
// messages) against the server oracle's scripted clients, which use the original's own classes: for every
// scenario and every client, the datagrams the original server sent that client are fed, iteration by
// iteration and with the oracle's clock, to the TypeScript CClient, and every snapshot it completes (tick, delta
// tick, crc, every item) and every game message it receives (the chunk's bytes and the fields
// CNetObjHandler::SecureUnpackMsg decodes) must be the original's, in order.
//
// The port's client sends its own messages (it loads the official maps instead of downloading them), so the
// acks the server's packets carry refer to the oracle client's vital chunks: before each iteration the test
// sets the connection's sequence to the oracle client's (read from its datagrams), and its connection token
// to the oracle client's, so that CNetConnection::Feed accepts the server's packets as the original's did.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadScenario, scenarios, hex, tohex, officialMaps, GOLDEN } from './golden.ts';
import { existsSync, readFileSync } from 'node:fs';

const SCN = GOLDEN + '../oracle/scenarios/';
import { CClient, type IGameClient } from '../src/client/engine/client.ts';
import { NETADDR, CNetChunk, CNetChunkHeader, NET_PACKETFLAG_CONTROL, NET_PACKETFLAG_COMPRESSION, NET_CHUNKFLAG_VITAL, NET_CHUNKFLAG_RESEND, type NetHost } from '../src/engine/shared/network.ts';
import { huffman } from '../src/engine/shared/huffman.ts';
import { CUnpacker } from '../src/engine/shared/packer.ts';
import { CNetObjHandler, g_apMsgNames, g_aObjSizes, NETMSGTYPE_SV_READYTOENTER } from '../src/generated/protocol.ts';
import { defaultConfig } from '../src/generated/config.ts';
import { GAME_NETVERSION, CLIENT_VERSION } from '../src/engine/shared/protocol.ts';
import { utf8Decode } from '../src/base/system.ts';

/** the token of a token request, and the newest vital sequence number of a client datagram */
function parseClientPacket(d: Uint8Array): { token?: number; seq?: number } {
  const flags = (d[0] & 0xfc) >> 2;
  if (flags & NET_PACKETFLAG_CONTROL) {
    if (d[7] === 5 && d.length >= 12) return { token: ((d[8] << 24) | (d[9] << 16) | (d[10] << 8) | d[11]) >>> 0 };
    return {};
  }
  let data = d.subarray(7);
  if (flags & NET_PACKETFLAG_COMPRESSION) {
    const out = new Uint8Array(2048);
    const n = huffman.Decompress(d, 7, d.length - 7, out, out.length);
    data = out.subarray(0, n);
  }
  const num = d[2];
  const h = new CNetChunkHeader();
  let p = 0;
  let seq: number | undefined;
  for (let i = 0; i < num && p < data.length; i++) {
    p = h.Unpack(data, p);
    if (h.m_Flags & NET_CHUNKFLAG_VITAL && !(h.m_Flags & NET_CHUNKFLAG_RESEND)) seq = h.m_Sequence;
    p += h.m_Size;
  }
  return { seq };
}

const maps = officialMaps();

for (const name of scenarios()) {
  const sc = loadScenario(name);
  for (const k of sc.clients) {
    test(`${name} client ${k}: the port decodes every snapshot and game message as the original`, async () => {
      let now = 0;
      let queue: Uint8Array[] = [];
      let nextToken = 0;
      const host: NetHost = {
        send: () => {},
        recv: () => {
          const d = queue.shift();
          return d ? { addr: NETADDR.ipv4(10, 0, 0, 254, 8303), data: d } : null;
        },
        time_get: () => now,
        secure_random_fill: (b) => b.fill(7),
        random_int: () => nextToken,
      };
      const got: string[] = [];
      const handler = new CNetObjHandler();
      const client: CClient = new CClient(() => now);
      const game: IGameClient = {
        OnStateChange: () => {},
        OnConnected: () => {},
        OnMessage: (id: number, u: CUnpacker) => {
          const m = handler.SecureUnpackMsg(id, u) as Record<string, unknown> | null;
          if (id === NETMSGTYPE_SV_READYTOENTER && m) client.EnterGame();
          let fields = '';
          if (m) {
            const flat: Record<string, unknown> = { t: g_apMsgNames[id] };
            for (const [key, v] of Object.entries(m)) {
              if (Array.isArray(v)) v.forEach((x, i) => { flat[`${key}_${i}`] = typeof x === 'string' ? utf8Decode(x) : x; });
              else flat[key] = typeof v === 'string' ? utf8Decode(v) : v;
            }
            fields = JSON.stringify(flat);
          } else fields = JSON.stringify({ t: id, failed: true });
          got.push(`msg ${lastRaw} ${fields}`);
        },
        OnNewSnapshot: () => {},
        OnPredict: () => {},
        OnSnapInput: () => 0,
        OnUpdate: () => {},
        OnRender: () => {},
        OnRconLine: () => {},
        NetVersion: () => GAME_NETVERSION,
        ClientVersion: () => CLIENT_VERSION,
      };
      let lastRaw = '';
      const orig = client.ProcessServerPacket.bind(client);
      client.ProcessServerPacket = (p: CNetChunk) => {
        lastRaw = tohex(p.m_pData.subarray(0, p.m_DataSize));
        orig(p);
      };
      client.onSnapshotDecoded = (tick, delta, snap) => {
        const items: unknown[] = [];
        for (let i = 0; i < snap.NumItems(); i++) items.push([snap.ItemType(i), snap.ItemID(i), Array.from(snap.ItemDataView(i))]);
        got.push(`snap ${tick} ${delta} ${snap.Crc()} ${JSON.stringify(items)}`);
      };
      for (const m of maps) await client.maps.add(m.name, m.bytes);
      client.Init(host, game, defaultConfig(), null);
      // CGameClient::OnInit: the static sizes of the first 23 object types
      for (let i = 0; i < 23; i++) client.SnapSetStaticsize(i, g_aObjSizes[i]);
      const conn = client.m_NetClient.m_Connection;
      let seq = 0;
      let silent = false;
      // the scenario's disconnect and silent commands run after the client read the iteration's datagrams
      const scn = existsSync(SCN + name + '.scn') ? readFileSync(SCN + name + '.scn', 'utf8') : '';
      const cmds = new Map<number, string>();
      for (const l of scn.split('\n')) {
        const m = /^at (\d+) (\d+) (disconnect|silent|connect)/.exec(l.trim());
        if (m && Number(m[2]) === k) cmds.set(Number(m[1]), m[3]);
      }
      for (const it of sc.iterations) {
        // the client's datagrams delivered in this iteration: its connection token, its vital sequence
        for (const [c, h] of it.c2s) {
          if (c !== k) continue;
          const pc = parseClientPacket(hex(h));
          if (pc.token !== undefined && (conn.State() === 0 || pc.token !== conn.m_Token)) {
            if (conn.m_PeerToken === 0xffffffff || conn.State() === 0 || pc.token !== conn.m_Token) {
              nextToken = pc.token;
              if (pc.token !== conn.m_Token) {
                now = it.t;
                client.Connect(NETADDR.ipv4(10, 0, 0, 254, 8303), '10.0.0.254:8303');
                seq = 0;
              }
            }
          }
          if (pc.seq !== undefined) seq = pc.seq;
        }
        conn.m_Sequence = seq;
        // the server's datagrams to the client, read when the client runs (10 ms into the iteration)
        now = it.t + 10000;
        queue = it.s2c.filter(([c]) => c === k).map(([, h]) => hex(h));
        if (!silent && (queue.length || client.State() !== 0)) client.PumpNetwork();
        const cmd = cmds.get(it.it);
        if (cmd === 'disconnect') client.Disconnect();
        else if (cmd === 'silent') silent = true;
        else if (cmd === 'connect') silent = false;
      }
      const want: string[] = [];
      for (const r of sc.snaps) {
        if (r.c !== k) continue;
        if ('snap' in r) want.push(`snap ${r.snap} ${r.delta} ${r.crc} ${JSON.stringify(r.items)}`);
        else if ('msg' in r) {
          const m = r.msg as Record<string, unknown>;
          want.push(`msg ${r.raw} ${JSON.stringify('failed' in m ? { t: m.t, failed: true } : m)}`);
        }
      }
      assert.ok(want.length > 10, 'the golden has records');
      for (let i = 0; i < Math.max(want.length, got.length); i++) {
        if (got[i] !== want[i]) assert.fail(`record ${i} of ${want.length}:\n  port:     ${(got[i] ?? '(none)').slice(0, 400)}\n  original: ${(want[i] ?? '(none)').slice(0, 400)}`);
      }
    });
  }
}
