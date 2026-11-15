// Leaving the page and the files on the way to the server, without a browser: the platform (src/host.ts) on a
// minimal page saves the game (opts.quit, quitImmediately in index.ts) whenever the page is left while a game
// runs, and a file the server refuses does not hold back the others (src/files.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameFiles } from '../src/files.ts';
import { BrowserPlatform } from '../src/host.ts';
import type { BrogueEvent } from '../src/rt/platform.ts';

/** just enough of a page for the platform: a host element, a canvas, ResizeObserver, window */
function fakePage(): { host: HTMLElement; listeners: Map<string, unknown>; restore: () => void } {
  const g = globalThis as Record<string, unknown>;
  const saved = { document: g.document, window: g.window, ResizeObserver: g.ResizeObserver };
  const listeners = new Map<string, unknown>();
  const el = (name: string) => ({
    tabIndex: -1,
    style: {},
    clientWidth: 0,
    clientHeight: 0,
    getContext: () => ({}),
    appendChild: () => {},
    focus: () => {},
    addEventListener: (type: string, fn: unknown) => listeners.set(`${name}:${type}`, fn),
  });
  g.document = { createElement: () => el('canvas') };
  g.window = { devicePixelRatio: 1, addEventListener: (type: string, fn: unknown) => listeners.set(`window:${type}`, fn) };
  g.ResizeObserver = class { observe() {} disconnect() {} };
  return {
    host: el('host') as unknown as HTMLElement,
    listeners,
    restore: () => Object.assign(g, saved),
  };
}

function platform(page: { host: HTMLElement }, signal: AbortSignal, saves: string[]): BrowserPlatform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = new BrowserPlatform(page.host, {} as any, signal, { fileChanged: () => {}, quit: () => saves.push('saved') });
  // no screen to draw on (updateScreen paints nothing before the first resize)
  (p as unknown as { resized: boolean }).resized = false;
  return p;
}

test('leaving the page saves the game, wherever the program is', async () => {
  const page = fakePage();
  try {
    // waiting for a key
    {
      const ac = new AbortController();
      const saves: string[] = [];
      const p = platform(page, ac.signal, saves);
      const waiting = p.nextKeyOrMouseEvent({} as BrogueEvent, false, false);
      await new Promise((r) => setTimeout(r, 5));
      ac.abort();
      await assert.rejects(waiting, /stopped/);
      assert.deepEqual(saves, ['saved'], 'waiting for a key');
    }
    // in delayUpTo's yield (setTimeout 0: the time was already used up)
    {
      const ac = new AbortController();
      const saves: string[] = [];
      const p = platform(page, ac.signal, saves);
      const pause = p.pauseForMilliseconds(0, false);
      ac.abort();
      await assert.rejects(pause, /stopped/, 'the program ends after the save');
      assert.deepEqual(saves, ['saved'], 'in the yield');
    }
    // between two of the program's own awaits: it saves when it next comes to the platform
    for (const next of ['pause', 'key', 'pause 0'] as const) {
      const ac = new AbortController();
      const saves: string[] = [];
      const p = platform(page, ac.signal, saves);
      ac.abort();
      assert.deepEqual(saves, [], 'not in the middle of a move');
      const call = next === 'key' ? p.nextKeyOrMouseEvent({} as BrogueEvent, false, false)
        : p.pauseForMilliseconds(next === 'pause' ? 50 : 0, false);
      await assert.rejects(call, /stopped/);
      assert.deepEqual(saves, ['saved'], `then ${next}`);
      await assert.rejects(p.pauseForMilliseconds(10, false), /stopped/);
      assert.deepEqual(saves, ['saved'], 'once');
    }
    // the keys are the game area's, not the whole window's
    assert.ok(page.listeners.has('host:keydown') && page.listeners.has('host:keyup'));
    assert.ok(!page.listeners.has('window:keydown') && !page.listeners.has('window:keyup'));
  } finally {
    page.restore();
  }
});

test('a file the server refuses does not hold back the others, and is reported', async () => {
  const stored = new Map<string, Uint8Array>();
  const errors: string[] = [];
  const ctx = {
    signal: new AbortController().signal,
    storage: {
      list: async () => [],
      get: async () => null,
      put: async (n: string, d: Uint8Array) => {
        if (n.startsWith('Saved')) throw new Error('quota');
        stored.set(n, d);
      },
      delete: async (n: string) => void stored.delete(n),
    },
    scores: { get: async () => [], submit: async () => ({ rank: 1, entries: [] }) },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  const files = new GameFiles(ctx);
  files.onError = (m) => errors.push(m);
  files.changed('BrogueRunHistory.txt', new Uint8Array([1]));
  files.changed('Saved #1.broguesave', new Uint8Array([2]));
  files.changed('LastGame.broguesave', new Uint8Array([3]));
  files.changed('CE 1.15.1 #7.broguerec', new Uint8Array([4]));
  await files.flush();
  assert.deepEqual([...stored.keys()].sort(), ['BrogueRunHistory.txt', 'CE-201.15.1-20-237.broguerec', 'LastGame.broguesave']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Saved #1\.broguesave/);
  assert.match(errors[0], /quota/);
});
