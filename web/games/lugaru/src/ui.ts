// The port's menus and dialogue, drawn as a DOM overlay over the WebGL canvas. The original's
// menus are its own bitmap-font screens; this follows their structure (Start Game, Challenge,
// Controls, Quit; campaign map; pause) with the original's title and world map artwork.
import { assetUrl } from './assets.ts';
import type { Campaign } from './data/campaign.ts';

const CSS = `
.lugaru-overlay { position:absolute; inset:0; z-index:10; overflow:hidden; font-family: "Trebuchet MS", "DejaVu Sans", sans-serif; color:#f2ead8; user-select:none; pointer-events:none; }
.lugaru-overlay * { box-sizing:border-box; }
.lugaru-panel { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:auto; background:rgba(8,9,12,.72); }
.lugaru-menu { min-width:280px; padding:26px 34px 30px; background:linear-gradient(#2a2119ee,#14100cee); border:1px solid #8d7046; box-shadow:0 12px 40px #000a, inset 0 0 40px #0006; text-align:center; }
.lugaru-menu h1 { margin:0 0 4px; font-size:30px; letter-spacing:.22em; font-weight:600; color:#e8d3a4; text-transform:uppercase; }
.lugaru-menu h2 { margin:0 0 20px; font-size:13px; letter-spacing:.28em; color:#a98a58; font-weight:400; text-transform:uppercase; }
.lugaru-menu button { display:block; width:100%; margin:7px 0; padding:9px 14px; font:inherit; font-size:15px; color:#efe3ca; background:#241b13cc; border:1px solid #6b5432; cursor:pointer; text-align:left; letter-spacing:.06em; }
.lugaru-menu button:hover { background:#4a3520; border-color:#c19a5c; color:#fff4dc; }
.lugaru-menu button:disabled { opacity:.35; cursor:default; }
.lugaru-menu .small { font-size:12px; color:#a08c6d; margin-top:14px; }
.lugaru-menu .logo { width:260px; max-width:60vw; margin:0 auto 12px; display:block; image-rendering:auto; mix-blend-mode:screen; }
.lugaru-loading { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#12100d; pointer-events:auto; z-index:20; }
.lugaru-loading .box { width:min(420px,80vw); text-align:center; }
.lugaru-loading .bar { height:6px; background:#2c2419; border:1px solid #6b5432; margin-top:14px; }
.lugaru-loading .fill { height:100%; background:#c19a5c; width:0; transition:width .12s; }
.lugaru-dialogue { position:absolute; left:8%; right:8%; bottom:5%; padding:14px 20px 16px; background:#0b0a08dd; border:1px solid #6b5432; pointer-events:none; }
.lugaru-dialogue .name { font-size:13px; letter-spacing:.18em; color:#c19a5c; text-transform:uppercase; margin-bottom:6px; }
.lugaru-dialogue .text { font-size:clamp(15px,2.1vw,21px); line-height:1.35; white-space:pre-wrap; }
.lugaru-dialogue .more { margin-top:8px; font-size:11px; color:#7e6b50; text-align:right; }
.lugaru-map { position:absolute; inset:0; pointer-events:auto; background:#1a1712; }
.lugaru-map .bg { position:absolute; inset:0; background-size:cover; background-position:center; filter:saturate(.8) brightness(.75); }
.lugaru-map .shade { position:absolute; inset:0; background:radial-gradient(circle at 50% 45%, #0000 20%, #000a 100%); }
.lugaru-map .node { position:absolute; width:22px; height:22px; margin:-11px 0 0 -11px; border-radius:50%; background:#c9a15a; border:2px solid #2a1c10; box-shadow:0 0 0 2px #c9a15a55; cursor:pointer; }
.lugaru-map .node.done { background:#6f8f5a; box-shadow:0 0 0 2px #6f8f5a55; }
.lugaru-map .node.locked { background:#4a4032; cursor:default; box-shadow:none; }
.lugaru-map .node:hover:not(.locked) { background:#f0c977; }
.lugaru-map .label { position:absolute; transform:translate(-50%,18px); font-size:11px; color:#e8d3a4; text-shadow:0 1px 2px #000; white-space:nowrap; pointer-events:none; }
.lugaru-map .head { position:absolute; top:18px; left:24px; right:24px; display:flex; justify-content:space-between; align-items:center; pointer-events:none; }
.lugaru-map .head h2 { margin:0; font-size:18px; letter-spacing:.2em; text-transform:uppercase; color:#e8d3a4; font-weight:500; text-shadow:0 2px 4px #000; }
.lugaru-map .head button { pointer-events:auto; }
.lugaru-map .foot { position:absolute; left:24px; right:24px; bottom:18px; font-size:12px; color:#a08c6d; text-shadow:0 1px 2px #000; pointer-events:none; }
.lugaru-end { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#0b0a08cc; pointer-events:auto; }
.lugaru-end .box { max-width:520px; padding:26px 32px; background:#1b1611ee; border:1px solid #6b5432; text-align:center; }
.lugaru-end h2 { margin:0 0 10px; color:#e8d3a4; letter-spacing:.16em; text-transform:uppercase; font-weight:500; }
.lugaru-end p { white-space:pre-wrap; line-height:1.45; color:#d8c9b0; }
.lugaru-end button { margin:16px 6px 0; padding:8px 18px; font:inherit; color:#efe3ca; background:#3a2a19; border:1px solid #8d7046; cursor:pointer; }
`;

export interface MenuCallbacks {
  onStart: () => void;
  onContinue: () => void;
  onChallenge: () => void;
  onControls: () => void;
  onQuit: () => void;
}

export class LugaruUI {
  readonly root: HTMLDivElement;
  private readonly screen: HTMLDivElement;
  private readonly dialogueEl: HTMLDivElement;
  private readonly loadingEl: HTMLDivElement;
  private readonly loadingText: HTMLDivElement;
  private readonly loadingFill: HTMLDivElement;

  constructor(host: HTMLElement) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.root = document.createElement('div');
    this.root.className = 'lugaru-overlay';
    this.root.innerHTML = '<div class="lugaru-panel"></div><div class="lugaru-dialogue" style="display:none"><div class="name"></div><div class="text"></div><div class="more">click or space</div></div><div class="lugaru-loading" style="display:none"><div class="box"><div class="loadtext">Loading…</div><div class="bar"><div class="fill"></div></div></div></div>';
    host.appendChild(this.root);
    this.screen = this.root.querySelector('.lugaru-panel') as HTMLDivElement;
    this.dialogueEl = this.root.querySelector('.lugaru-dialogue') as HTMLDivElement;
    this.loadingEl = this.root.querySelector('.lugaru-loading') as HTMLDivElement;
    this.loadingText = this.root.querySelector('.loadtext') as HTMLDivElement;
    this.loadingFill = this.root.querySelector('.lugaru-loading .fill') as HTMLDivElement;
  }

  private clear(): void {
    this.screen.innerHTML = '';
    this.screen.style.display = 'flex';
    this.dialogueEl.style.display = 'none';
  }

  private button(label: string, onClick: () => void, disabled = false): HTMLButtonElement {
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled = disabled;
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return b;
  }

  menu(c: MenuCallbacks, canContinue: boolean): void {
    this.clear();
    const menu = document.createElement('div');
    menu.className = 'lugaru-menu';
    const logo = document.createElement('img');
    logo.className = 'logo';
    logo.src = assetUrl('Textures/Lugaru.png');
    logo.alt = 'Lugaru';
    menu.appendChild(logo);
    const h1 = document.createElement('h1');
    h1.textContent = 'Lugaru';
    const h2 = document.createElement('h2');
    h2.textContent = "The Rabbit's Foot";
    menu.append(h1, h2);
    if (canContinue) menu.appendChild(this.button('Continue', c.onContinue));
    menu.append(
      this.button('Start Game', c.onStart),
      this.button('Challenge', c.onChallenge),
      this.button('Controls', c.onControls),
      this.button('Quit', c.onQuit),
    );
    const small = document.createElement('div');
    small.className = 'small';
    small.textContent = 'Wolfire Games, 2005 · open-source port, 2026';
    menu.appendChild(small);
    this.screen.appendChild(menu);
  }

  campaign(campaign: Campaign, unlocked: number, completed: number[], onPlay: (index: number) => void, onBack: () => void): void {
    this.clear();
    const map = document.createElement('div');
    map.className = 'lugaru-map';
    const bg = document.createElement('div');
    bg.className = 'bg';
    bg.style.backgroundImage = `url(${assetUrl('Textures/World.png')})`;
    const shade = document.createElement('div');
    shade.className = 'shade';
    map.append(bg, shade);
    const head = document.createElement('div');
    head.className = 'head';
    const h2 = document.createElement('h2');
    h2.textContent = 'The island of Lugaru';
    const back = this.button('Back', onBack);
    head.append(h2, back);
    map.appendChild(head);
    const minX = 220, maxX = 380, minY = 150, maxY = 330;
    campaign.levels.forEach((level, i) => {
      const node = document.createElement('div');
      node.className = `node ${completed.includes(i) ? 'done' : i <= unlocked ? '' : 'locked'}`;
      node.style.left = `${((level.locationX - minX) / (maxX - minX)) * 86 + 7}%`;
      node.style.top = `${((level.locationY - minY) / (maxY - minY)) * 76 + 14}%`;
      node.title = `${i + 1}. ${level.description.replace(/_/g, ' ')}`;
      if (i <= unlocked) node.addEventListener('click', (e) => { e.stopPropagation(); onPlay(i); });
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = `${i + 1}. ${level.description.replace(/_/g, ' ')}`;
      label.style.left = node.style.left;
      label.style.top = node.style.top;
      label.style.display = i <= unlocked || completed.includes(i) ? '' : 'none';
      map.append(node, label);
    });
    const foot = document.createElement('div');
    foot.className = 'foot';
    foot.textContent = `${completed.length} / ${campaign.levels.length} levels complete · click a golden or green node`;
    map.appendChild(foot);
    this.screen.appendChild(map);
  }

  controls(onBack: () => void): void {
    this.clear();
    const menu = document.createElement('div');
    menu.className = 'lugaru-menu';
    const h1 = document.createElement('h1');
    h1.textContent = 'Controls';
    menu.appendChild(h1);
    const lines = [
      ['W A S D', 'run (the original also accepts the arrow keys)'],
      ['Mouse', 'look; click the game once to capture the pointer'],
      ['Left mouse', 'attack: punch, kick, knife, sword or staff'],
      ['Space', 'jump; hold it to jump higher'],
      ['Shift', 'crouch / sneak; crouch under a high attack to reverse it'],
      ['E', 'draw the next weapon'],
      ['Q', 'throw the current weapon'],
      ['Esc', 'pause; from the pause menu back to the site'],
    ];
    for (const [k, v] of lines) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:14px;text-align:left;margin:6px 0;font-size:14px;';
      const key = document.createElement('b');
      key.style.cssText = 'min-width:92px;color:#e8d3a4;';
      key.textContent = k;
      const val = document.createElement('span');
      val.textContent = v;
      row.append(key, val);
      menu.appendChild(row);
    }
    menu.appendChild(this.button('Back', onBack));
    this.screen.appendChild(menu);
  }

  pause(onResume: () => void, onRestart: () => void, onMenu: () => void, onQuit: () => void): void {
    this.clear();
    const menu = document.createElement('div');
    menu.className = 'lugaru-menu';
    const h1 = document.createElement('h1');
    h1.textContent = 'Paused';
    menu.append(h1, this.button('Resume', onResume), this.button('Restart level', onRestart), this.button('Main menu', onMenu), this.button('Quit to the site', onQuit));
    this.screen.appendChild(menu);
  }

  end(title: string, text: string, buttons: { label: string; onClick: () => void }[]): void {
    this.clear();
    const end = document.createElement('div');
    end.className = 'lugaru-end';
    const box = document.createElement('div');
    box.className = 'box';
    const h2 = document.createElement('h2');
    h2.textContent = title;
    const p = document.createElement('p');
    p.textContent = text;
    box.append(h2, p);
    for (const b of buttons) box.appendChild(this.button(b.label, b.onClick));
    end.appendChild(box);
    this.screen.appendChild(end);
  }

  showDialogue(name: string, text: string): void {
    this.screen.style.display = 'none';
    this.dialogueEl.style.display = 'block';
    (this.dialogueEl.querySelector('.name') as HTMLDivElement).textContent = name.replace(/#/g, '').trim();
    (this.dialogueEl.querySelector('.text') as HTMLDivElement).textContent = text.replace(/#/g, '').replace(/\r/g, '\n');
  }

  hideDialogue(): void {
    this.dialogueEl.style.display = 'none';
  }

  loading(text = 'Loading…', progress = -1): void {
    this.loadingEl.style.display = 'flex';
    this.loadingText.textContent = text;
    this.loadingFill.style.width = progress < 0 ? '35%' : `${Math.round(progress * 100)}%`;
  }

  hideLoading(): void {
    this.loadingEl.style.display = 'none';
  }

  hideAll(): void {
    this.screen.style.display = 'none';
    this.dialogueEl.style.display = 'none';
  }

  destroy(): void {
    this.root.remove();
  }
}
