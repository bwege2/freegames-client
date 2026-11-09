// The online start: the site's lobby must not take Sopwith's screen with it. openLobby
// (web/src/sdk/lobby.ts) does host.replaceChildren(box) and, when the round starts, box.remove();
// handed the game's host, it left an empty host and the round ran on a black page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inLobbyLayer } from '../src/lobby-layer.ts';

/** just the parts of an element that the lobby and the layer use */
class FakeElement {
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  style = { cssText: '' };
  readonly tag: string;
  constructor(tag: string) { this.tag = tag; }
  append(...els: FakeElement[]): void {
    for (const e of els) { e.remove(); e.parent = this; this.children.push(e); }
  }
  replaceChildren(...els: FakeElement[]): void {
    for (const c of [...this.children]) c.remove();
    this.append(...els);
  }
  remove(): void {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  contains(e: FakeElement): boolean {
    for (let p: FakeElement | null = e; p; p = p.parent) if (p === this) return true;
    return false;
  }
}

(globalThis as unknown as { document: unknown }).document = { createElement: (tag: string) => new FakeElement(tag) };

/** what openLobby does to the element it is given, from opening to the round's start or a cancel */
function sdkLobby(el: FakeElement, outcome: 'start' | 'cancel'): Promise<string> {
  const box = new FakeElement('div');
  el.replaceChildren(box);
  return new Promise((resolve, reject) => setTimeout(() => {
    box.remove();
    if (outcome === 'start') resolve('round'); else reject(new Error('cancelled'));
  }, 0));
}

function gameHost(): { host: FakeElement; canvas: FakeElement } {
  // SopwithApp: host > root > pane1 > PixelScreen box > canvas
  const host = new FakeElement('div');
  const root = new FakeElement('div');
  const pane = new FakeElement('div');
  const box = new FakeElement('div');
  const canvas = new FakeElement('canvas');
  box.append(canvas); pane.append(box); root.append(pane); host.append(root);
  return { host, canvas };
}

test('the game screen is still in the page when the online round starts', async () => {
  const { host, canvas } = gameHost();
  const round = await inLobbyLayer(host as unknown as HTMLElement, (layer) => sdkLobby(layer as unknown as FakeElement, 'start'));
  assert.equal(round, 'round');
  assert.ok(host.contains(canvas), 'the canvas is in the host');
  assert.equal(host.children.length, 1, 'the lobby layer is gone');
});

test('the lobby is shown over the game while it is open, and a cancel brings the screen back', async () => {
  const { host, canvas } = gameHost();
  let during = false;
  await assert.rejects(inLobbyLayer(host as unknown as HTMLElement, (layer) => {
    const p = sdkLobby(layer as unknown as FakeElement, 'cancel');
    during = host.contains(canvas) && host.children.length === 2 && host.children[1] === (layer as unknown as FakeElement);
    return p;
  }), /cancelled/);
  assert.ok(during, 'the lobby is a layer next to the game screen, over it');
  assert.ok(host.contains(canvas), 'the canvas is in the host after a cancel');
  assert.equal(host.children.length, 1);
});
