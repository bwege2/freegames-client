// The page's side of the two workers (src/index.ts) in node: the client worker and the server worker as node
// worker threads, wired as the page wires them (shared memory rings, a message channel), with the files of
// web/games/freecol/assets. Tests send input and read the client's component tree.
import { Worker, MessageChannel } from 'node:worker_threads';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Ring, json } from '../src/port/ring.ts';
import { P_INPUT } from '../src/port/protocol.ts';
import type { FileIndex } from '../src/port/web/files.ts';

const assets = path.join(import.meta.dirname, '..', 'assets');

export function assetIndex(): FileIndex {
  const index: FileIndex = {};
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else index['/' + path.relative(assets, f).split(path.sep).join('/')] = pathToFileURL(f).href;
    }
  };
  walk(assets);
  return index;
}

/** A component of a tree dump (src/port/web/tree.ts) with its place on the screen. */
export type TreeNode = { cls: string; x: number; y: number; w: number; h: number; hidden: boolean; text: string | null; depth: number; line: string };

/** The tree's components with screen coordinates (windows are at the screen's origin plus their bounds). */
export function parseTree(tree: string): TreeNode[] {
  const out: TreeNode[] = [];
  const stack: TreeNode[] = [];
  for (const line of tree.split('\n')) {
    const m = /^( *)(\S+) (-?\d+),(-?\d+) (\d+)x(\d+)( hidden)?.*?(?: "(.*)")?$/.exec(line);
    if (!m) continue;
    const depth = m[1].length / 2;
    stack.length = depth;
    const parent = depth > 0 ? stack[depth - 1] : null;
    const n: TreeNode = { cls: m[2], x: (parent?.x ?? 0) + +m[3], y: (parent?.y ?? 0) + +m[4], w: +m[5], h: +m[6],
      hidden: !!m[7] || !!parent?.hidden, text: m[8] ?? null, depth, line };
    stack[depth] = n;
    out.push(n);
  }
  return out;
}

/** Clicks the middle of a component (left button). */
export function click(w: TwoWorkers, n: TreeNode) {
  const x = n.x + (n.w >> 1), y = n.y + (n.h >> 1);
  const base = { x, y, shift: false, ctrl: false, alt: false, meta: false, time: Date.now() };
  w.send({ kind: 'move', ...base, button: 0, buttons: 0 });
  w.send({ kind: 'down', ...base, button: 0, buttons: 1 });
  w.send({ kind: 'up', ...base, button: 0, buttons: 0 });
}

/** Waits until the tree has a visible component that matches; the tree and that component. */
export async function waitFor(w: TwoWorkers, pred: (n: TreeNode) => boolean, ms = 60000): Promise<{ tree: string; node: TreeNode }> {
  const end = Date.now() + ms;
  let tree = '';
  while (Date.now() < end) {
    tree = await Promise.race([w.tree(), new Promise<string>((r) => setTimeout(() => r(''), 10000))]);
    const node = parseTree(tree).find((n) => !n.hidden && pred(n));
    if (node) return { tree, node };
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('not on the screen in time; the tree:\n' + tree + '\nerrors: ' + w.errors.join('\n'));
}

export type TwoWorkers = {
  send: (e: any) => void;
  tree: () => Promise<string>;
  frames: () => number;
  exited: () => boolean;
  /** The files the client stored (storage name -> bytes, null when deleted), as the page keeps them. */
  stored: Map<string, Uint8Array | null>;
  /** The keyboard's focus owner and focused window. */
  focus: () => Promise<string>;
  /** A key pressed and released (a KeyboardEvent.code, with Java's key code). */
  key: (code: number, char?: string, mods?: { ctrl?: boolean; shift?: boolean }) => void;
  errors: string[];
  /** online: a message to the server worker (an entry, liveFrom) */
  toServer: (m: unknown) => void;
  stop: () => Promise<void>;
};

/** Online play (src/online.ts): the round's server and client, and what the server worker sends out. */
export type OnlineWorkers = { server: unknown; client: { port: number; name: string }; out: (m: any) => void };

export async function startWorkers(width = 1280, height = 800, locale = 'en_US', userFiles: [string, Uint8Array][] = [], online?: OnlineWorkers): Promise<TwoWorkers> {
  const stored = new Map<string, Uint8Array | null>(userFiles);
  const files = assetIndex();
  const toClient = Ring.create();
  const fromPage = Ring.create(1 << 20);
  const bell = Ring.createBell();
  const toServer = Ring.create();
  const serverBell = Ring.createBell();
  const input = new Ring(fromPage, bell);
  const channel = new MessageChannel();
  const errors: string[] = [];
  const server = new Worker(path.join(import.meta.dirname, 'workers', 'server.ts'));
  const client = new Worker(path.join(import.meta.dirname, 'workers', 'client.ts'), { stdout: false });
  for (const w of [server, client]) w.on('error', (e) => errors.push(String(e?.stack ?? e)));
  const ready = new Promise((r) => server.once('message', r));
  server.on('message', (m: any) => {
    if (m.t === 'net') online?.out(m.m);
  });
  server.postMessage({ init: { files, locale, toClient, bell, fromClient: toServer, serverBell, online: online?.server }, client: channel.port1 }, [channel.port1]);
  await ready;
  let frames = 0;
  let exited = false;
  const trees: ((t: string) => void)[] = [];
  client.on('message', (m: any) => {
    if (m.t === 'frame') frames = m.n;
    else if (m.t === 'exit') exited = true;
    else if (m.t === 'tree') trees.shift()?.(m.text);
    else if (m.t === 'store') stored.set(m.name, m.data);
  });
  client.postMessage({ init: { files, width, height, locale, sound: !!process.env.FREECOL_SOUND, fromServer: toClient, fromPage, bell, toServer, serverBell, userFiles, online: online?.client }, server: channel.port2 }, [channel.port2]);
  const send = (e: any) => {
    if (!input.write(P_INPUT, json.encode(e))) throw new Error('input ring full');
  };
  return {
    send,
    tree: () => new Promise<string>((resolve) => {
      trees.push(resolve);
      send({ kind: 'tree' });
    }),
    frames: () => frames,
    stored,
    focus: () => new Promise<string>((resolve) => {
      trees.push(resolve);
      send({ kind: 'focus' });
    }),
    key: (code: number, char = '', mods = {}) => {
      const base = { kind: 'key', code, char, location: 1, shift: !!mods.shift, ctrl: !!mods.ctrl, alt: false, meta: false, buttons: 0, time: Date.now() };
      send({ ...base, type: 'down' });
      send({ ...base, type: 'up' });
    },
    exited: () => exited,
    errors,
    toServer: (m) => server.postMessage(m),
    stop: async () => {
      await client.terminate();
      await server.terminate();
    },
  };
}
