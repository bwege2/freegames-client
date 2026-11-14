// Chromium B.S.U. port: the test's side of re/chromiumbsu/oracle. The port runs a script with
// recorders for GL, text and OpenAL that write exactly the lines the oracle's stubs write
// (re/chromiumbsu/oracle/stub/), dumps the same state bytes (driver.cpp dumpState) and plays the
// same bot, so its trace must equal the original's, line by line.
import type { GL, Images, Text, Texture } from '../src/gl.ts';
import type { AudioBackend } from '../src/game/audio.ts';
import { Global, type Files } from '../src/game/global.ts';
import { MainLoop, type InputEvent, type Key } from '../src/game/loop.ts';
import { HeroDead, Game } from '../src/game/global.ts';

const fr = Math.fround;

class Hash {
  h = 2166136261;
  verbose: string[] | null = null;
  line(s: string): void {
    for (let i = 0; i < s.length; i++) this.h = Math.imul(this.h ^ s.charCodeAt(i), 16777619) >>> 0;
    this.h = Math.imul(this.h ^ 10, 16777619) >>> 0;
    if (this.verbose) this.verbose.push(`  ${s}`);
  }
}

/** floor(x*1024+0.5) of the float the C function received */
function q(x: number): string {
  return String(Math.floor(fr(x) * 1024.0 + 0.5));
}

class RecGL implements GL {
  compiling = false;
  private lists = 0;
  private readonly out: Hash;
  constructor(out: Hash) { this.out = out; }
  private r(s: string): void { if (!this.compiling) this.out.line(s); }
  begin(mode: number): void { this.r(`B ${mode}`); }
  end(): void { this.r('E'); }
  vertex3f(x: number, y: number, z: number): void { this.r(`V ${q(x)} ${q(y)} ${q(z)}`); }
  texCoord2f(s: number, t: number): void { this.r(`T ${q(s)} ${q(t)}`); }
  color4f(r: number, g: number, b: number, a: number): void { this.r(`C ${q(r)} ${q(g)} ${q(b)} ${q(a)}`); }
  normal3f(x: number, y: number, z: number): void { this.r(`N ${q(x)} ${q(y)} ${q(z)}`); }
  translatef(x: number, y: number, z: number): void { this.r(`t ${q(x)} ${q(y)} ${q(z)}`); }
  rotatef(a: number, x: number, y: number, z: number): void { this.r(`r ${q(a)} ${q(x)} ${q(y)} ${q(z)}`); }
  scalef(x: number, y: number, z: number): void { this.r(`s ${q(x)} ${q(y)} ${q(z)}`); }
  pushMatrix(): void { this.r('('); }
  popMatrix(): void { this.r(')'); }
  loadIdentity(): void { this.r('I'); }
  matrixMode(m: number): void { this.r(`M ${m}`); }
  bindTexture(t: Texture | null): void { this.r(`X ${t ? t.name : '-'}`); }
  blendFunc(s: number, d: number): void { this.r(`F ${s} ${d}`); }
  enable(c: number): void { this.r(`+ ${c}`); }
  disable(c: number): void { this.r(`- ${c}`); }
  clear(): void { this.r('K'); }
  clearColor(r: number, g: number, b: number, a: number): void { this.r(`k ${q(r)} ${q(g)} ${q(b)} ${q(a)}`); }
  depthFunc(fn: number): void { this.r(`Z ${fn}`); }
  depthMask(on: boolean): void { this.r(`D ${on ? 1 : 0}`); }
  viewport(x: number, y: number, w: number, h: number): void { this.r(`W ${x} ${y} ${w} ${h}`); }
  texBorderColor(r: number, g: number, b: number, a: number): void { this.r(`b ${q(r)} ${q(g)} ${q(b)} ${q(a)}`); }
  genLists(n: number): number { const r = this.lists + 1; this.lists += n; return r; }
  newList(): void { this.compiling = true; }
  endList(): void { this.compiling = false; }
  callList(l: number): void { this.r(`L ${l}`); }
  perspective(fovy: number, aspect: number, near: number, far: number): void { this.r(`P ${q(fovy)} ${q(aspect)} ${q(near)} ${q(far)}`); }
}

/** the oracle's TextGLC: records the text, measures 11.5 per character, 23 per line */
class RecText implements Text {
  private readonly out: Hash;
  constructor(out: Hash) { this.out = out; }
  private n(s: string, len?: number): number { return len === undefined || len === -1 ? s.length : Math.min(len, s.length); }
  render(s: string, len?: number): void { this.out.line(`S ${s.slice(0, this.n(s, len))}`); }
  advance(s: string, len?: number): number { return fr(11.5 * this.n(s, len)); }
  lineHeight(): number { return 23.0; }
}

class RecAudio implements AudioBackend {
  private next = 1;
  private readonly out: Hash;
  constructor(out: Hash) { this.out = out; }
  genSources(n: number): number[] { const r: number[] = []; for (let i = 0; i < n; i++) r.push(this.next++); return r; }
  buffer(): void {}
  position(s: number, x: number, y: number, z: number): void { this.out.line(`AP ${s} ${q(x)} ${q(y)} ${q(z)}`); }
  looping(s: number, on: boolean): void { this.out.line(`AL ${s} ${on ? 1 : 0}`); }
  gain(s: number, v: number): void { this.out.line(`AG ${s} ${q(v)}`); }
  play(s: number): void { this.out.line(`A+ ${s}`); }
  stop(s: number): void { this.out.line(`A- ${s}`); }
  pause(s: number): void { this.out.line(`A| ${s}`); }
}

const images: Images = { load: (file: string) => ({ name: file }) };

// ---- the state, as driver.cpp dumpState writes it ----
const scratch = new DataView(new ArrayBuffer(8));

/** the state bytes, hashed as they come (FNV-1a), and as hex words when verbose */
class Dump {
  hash = 2166136261;
  text = '';
  readonly verbose: boolean;
  constructor(verbose: boolean) { this.verbose = verbose; }
  label(l: string): void { if (this.verbose) this.text += `\n ${l}`; }
  private push(n: number): void {
    let h = this.hash;
    for (let k = 0; k < n; k++) h = Math.imul(h ^ scratch.getUint8(k), 16777619) >>> 0;
    this.hash = h;
    if (this.verbose) {
      if (n === 4) this.text += ' ' + scratch.getUint32(0, true).toString(16).padStart(8, '0');
      else this.text += ' ' + scratch.getBigUint64(0, true).toString(16).padStart(16, '0');
    }
  }
  i(v: number | boolean): void { scratch.setInt32(0, Number(v), true); this.push(4); }
  f(v: number): void { scratch.setFloat32(0, v, true); this.push(4); }
  d(v: number): void { scratch.setFloat64(0, v, true); this.push(8); }
  s(str: string): void { this.i(str.length); for (const c of str) this.i(c.charCodeAt(0)); }
}

function dumpState(g: Global, loop: MainLoop, w: Dump): void {
  const c = g.config;
  w.label('global');
  w.i(g.gameMode); w.i(g.gameFrame); w.i(g.frame); w.i(g.rand.randIndex); w.f(g.gameSkill);
  w.i(g.gameLevel); w.f(g.speedAdj); w.f(g.fps); w.i(g.gamePause); w.i(g.heroDeath);
  w.i(g.heroSuccess); w.i(g.tipShipPast); w.i(g.tipSuperShield); w.f(g.scrollSpeed); w.f(g.gameSpeed);
  w.label('config');
  w.f(c.gameSkillBase()); w.i(c.gfxLevel()); w.i(c.maxLevel()); w.f(c.movementSpeed());
  w.f(c.volSound()); w.f(c.volMusic()); w.i(c.screenW()); w.i(c.screenH()); w.i(c.fullScreen());
  w.label('input');
  w.f(loop.keySpeedX); w.f(loop.keySpeedY); w.i(loop.mouseToggle);
  const h = g.hero;
  w.label('hero');
  for (let k = 0; k < 3; k++) w.f(h.pos[k]);
  w.f(h.score); w.i(h.lives); w.f(h.damage); w.f(h.shields); w.i(h.dontShow); w.i(h.superBomb);
  w.f(h.scoreTarget);
  for (let k = 0; k < 3; k++) { w.f(h.ammoStock[k]); w.f(h.gunPause[k]); w.i(h.gunActive[k]); w.f(h.gunFlash0[k]); w.f(h.gunFlash1[k]); }
  w.i(h.gunSwap); w.i(h.gunTrigger); w.f(h.useItemArmed); w.i(h.currentItemIndex);
  w.f(h.secondaryMove[0]); w.f(h.secondaryMove[1]);
  const fleet = g.enemyFleet.ships;
  w.label('fleet');
  w.i(fleet.length);
  for (const e of fleet) {
    w.label('enemy');
    w.i(e.type);
    for (let k = 0; k < 3; k++) w.f(e.pos[k]);
    for (let k = 0; k < 3; k++) w.f(e.vel[k]);
    w.f(e.damage); w.f(e.baseDamage); w.i(e.age); w.i(e.shootInterval); w.i(e.shootSwap);
    w.f(e.preFire); w.f(e.randMoveX); w.f(e.lastMoveX); w.f(e.lastMoveY);
    w.f(e.secondaryMove[0]); w.f(e.secondaryMove[1]);
    let t = -2;
    if (e.target === g.hero) t = -1;
    else for (let k = 0; k < fleet.length; k++) if (e.target === fleet[k]) t = k;
    w.i(t);
  }
  w.label('items');
  w.i(g.itemAdd.items.length);
  for (const it of g.itemAdd.items) {
    w.i(it.releaseTime); w.i(it.item.itemType);
    for (let k = 0; k < 3; k++) w.f(it.item.pos[k]);
    w.i((it.item as unknown as { type: number }).type);
  }
  w.label('deadpool');
  for (const pool of g.itemAdd.deadPool) w.i(pool.length);
  w.label('heroammo');
  for (const list of g.heroAmmo.roots) {
    w.i(list.length);
    for (const a of list) for (let j = 0; j < 3; j++) w.f(a.pos[j]);
  }
  w.label('enemyammo');
  for (const list of g.enemyAmmo.roots) {
    w.i(list.length);
    for (const a of list) { for (let j = 0; j < 3; j++) w.f(a.pos[j]); for (let j = 0; j < 3; j++) w.f(a.vel[j]); }
  }
  w.label('explosions');
  const x = g.explosions;
  for (let k = 0; k < x.roots.length; k++) {
    w.f(x.exploPause[k][0]); w.f(x.exploPause[k][1]); w.f(x.exploPause[k][2]);
    w.i(x.roots[k].length);
    for (const e of x.roots[k]) {
      for (let j = 0; j < 3; j++) w.f(e.pos[j]);
      for (let j = 0; j < 3; j++) w.f(e.vel[j]);
      for (let j = 0; j < 4; j++) w.f(e.clr[j]);
      w.i(e.age); w.f(e.size);
    }
  }
  w.label('powerups');
  w.i(g.powerUps.list.length);
  for (const p of g.powerUps.list) {
    w.i(p.type);
    for (let j = 0; j < 3; j++) w.f(p.pos[j]);
    for (let j = 0; j < 3; j++) w.f(p.vel[j]);
    w.i(p.age); w.f(p.power);
  }
  w.label('ground');
  w.i(g.ground.variation);
  for (const s of g.ground.segments()) w.d(s.pos[1]);
  w.label('status');
  const st = g.statusDisplay;
  w.f(st.ammoAlpha); w.f(st.damageAlpha); w.f(st.shieldAlpha); w.f(st.enemyWarn); w.i(st.blink);
  w.i(st.tipShipShow); w.i(st.tipSuperShow);
  w.label('menu');
  const m = g.menu;
  w.i(m.curSel); w.f(m.textAngle); w.i(m.textCount); w.f(m.elecOffX); w.f(m.elecOffY);
  w.f(m.mssgAlpha); w.i(m.mssgIndex); w.i(m.mssgCount); w.f(m.titleTilt); w.i(m.thickText);
  w.i(m.mssgHelpOverride); w.s(m.mssgText);
  w.label('hiscore');
  for (let k = 0; k < 5; k++) w.d(g.hiScore.getScore(c.intSkill(), k));
  w.label('audio');
  const a = g.audio;
  w.i(a.explosionIndex); w.i(a.exploPopIndex);
  w.i(a.soundQueue.length);
  for (const s of a.soundQueue) { w.i(s.type); for (let j = 0; j < 3; j++) w.f(s.pos[j]); w.i(s.age); }
}

function fnv(h: number, bytes: ArrayLike<number>): number {
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619) >>> 0;
  return h;
}

const KEYS = new Set(['RETURN', 'SPACE', 'ESCAPE', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'KP_ENTER', 'KP_PLUS', 'QUOTE',
  'KP1', 'KP2', 'KP3', 'KP4', 'KP5', 'KP6', 'KP7', 'KP8', 'KP9', 'PAUSE', 'p', 'q', 'n', 'g', 'a', '0', '9']);
const HELD = new Set(['UP', 'DOWN', 'LEFT', 'RIGHT', 'KP1', 'KP2', 'KP3', 'KP4', 'KP5', 'KP6', 'KP7', 'KP8', 'KP9']);
function key(name: string): Key {
  if (!KEYS.has(name)) throw new Error(`unknown key ${name}`);
  return (name === 'a' ? 'other' : name) as Key;
}

/** runs a script as driver.cpp does; returns the trace lines (and the files at the end), every frame in detail from verboseFrom on */
export function runScript(script: string, verboseFrom = -1): string[] {
  let verbose = verboseFrom === 0;
  const lines = script.split('\n');
  let seed = 1;
  let cfg = '';
  for (const l of lines) {
    const [cmd, ...rest] = l.trim().split(/\s+/);
    if (cmd === 'seed') seed = Number(rest[0]);
    if (cmd === 'config') cfg += l.trim().slice(7) + '\n';
  }
  const store = new Map<string, string>();
  if (cfg) store.set('.chromium-bsu', cfg);
  const files: Files = { read: (n) => store.get(n) ?? null, write: (n, t) => { store.set(n, t); } };
  const out = new Hash();
  const gl = new RecGL(out);
  const audio = new RecAudio(out);
  let loop: MainLoop | null = null;
  const g = new Global({
    gl, images, audio, files, user: 'player',
    makeText: () => new RecText(out),
    now: () => 1700000000 + Math.floor((loop ? loop.ticks : 0) / 1000),
  }, seed);
  loop = new MainLoop(g, { setVideoMode: () => true, grabMouse: () => {} });
  const trace: string[] = [];
  let events: InputEvent[] = [];
  let pos = 0, waiting = 0, botFrames = 0, quitSent = false, frameNo = 0, god = false;
  let chain = 2166136261;
  const keyEvent = (name: string, down: boolean) => {
    const k = key(name);
    events.push({ type: down ? 'keydown' : 'keyup', key: k });
    if (HELD.has(name)) { if (down) loop!.held.add(k); else loop!.held.delete(k); }
  };
  const botHeld: Record<string, boolean> = {};
  const hold = (k: string, want: boolean) => {
    if (!!botHeld[k] !== want) { keyEvent(k, want); botHeld[k] = want; }
  };
  const bot = () => {
    const h = g.hero;
    if (god) h.shields = 1000.0;
    if (g.gameMode === Game) {
      hold('SPACE', true);
      let tx = 0.0, low = 100.0, any = false;
      for (const e of g.enemyFleet.ships) if (e.pos[1] < low && e.pos[1] > h.pos[1]) { low = e.pos[1]; tx = e.pos[0]; any = true; }
      // no enemy close: fetch the newest power-up
      let ty = fr(-7.0);
      if ((!any || low > 3.0) && g.powerUps.list.length) {
        const p = g.powerUps.list[0];
        tx = p.pos[0];
        any = true;
        ty = p.pos[1];
        if (ty < fr(-7.5)) ty = fr(-7.5);
        if (ty > fr(-2.0)) ty = fr(-2.0);
      }
      let dx = any ? fr(tx - h.pos[0]) : -h.pos[0];
      // without god mode: away from the nearest shot coming down on the ship
      let near = 100.0;
      if (!god) {
        for (const list of g.enemyAmmo.roots) {
          for (const a of list) {
            const ax = fr(a.pos[0] - h.pos[0]), ay = fr(a.pos[1] - h.pos[1]);
            if (Math.abs(ax) < 0.8 && ay > -0.5 && ay < 2.5 && ay < near) { near = ay; dx = ax > 0 ? -1.0 : 1.0; }
          }
        }
      }
      // the mouse: up to 20 pixels a frame towards the target
      const clamp = (v: number) => Math.max(-20, Math.min(20, Math.trunc(v)));
      const mx = clamp(dx / 0.03), my = clamp(fr(h.pos[1] - ty) / 0.03);
      if (mx || my) events.push({ type: 'motion', dx: mx, dy: my });
    } else {
      hold('SPACE', false);
      if (g.gameMode === HeroDead && g.heroDeath === -100) { keyEvent('a', true); keyEvent('a', false); }
    }
  };
  const advance = () => {
    if (botFrames > 0) { botFrames--; bot(); return; }
    if (waiting > 0) { waiting--; return; }
    while (pos < lines.length) {
      const [cmd, ...a] = lines[pos++].trim().split(/\s+/);
      if (!cmd || cmd.startsWith('#') || cmd === 'seed' || cmd === 'config') continue;
      if (cmd === 'wait') { waiting = Number(a[0]) - 1; return; }
      if (cmd === 'bot' || cmd === 'god') { god = cmd === 'god'; botFrames = Number(a[0]) - 1; bot(); return; }
      if (cmd === 'press') { keyEvent(a[0], true); keyEvent(a[0], false); continue; }
      if (cmd === 'down') { keyEvent(a[0], true); continue; }
      if (cmd === 'up') { keyEvent(a[0], false); continue; }
      if (cmd === 'move') { events.push({ type: 'motion', dx: Number(a[0]), dy: Number(a[1]) }); continue; }
      if (cmd === 'click' || cmd === 'unclick') {
        events.push({ type: cmd === 'click' ? 'buttondown' : 'buttonup', button: Number(a[0]), x: Number(a[1]), y: Number(a[2]) });
        continue;
      }
      throw new Error(`bad script line ${lines[pos - 1]}`);
    }
    if (!quitSent) { events.push({ type: 'quit' }); quitSent = true; }
  };
  if (verbose) out.verbose = [];
  for (;;) {
    loop.draw();
    const w = new Dump(verbose);
    dumpState(g, loop, w);
    const sh = w.hash;
    const pair = new Uint8Array(8);
    new DataView(pair.buffer).setUint32(0, sh, true);
    new DataView(pair.buffer).setUint32(4, out.h, true);
    chain = fnv(chain, pair);
    if (verbose) {
      trace.push(...out.verbose!);
      out.verbose = [];
      trace.push(`frame ${frameNo} state ${sh.toString(16).padStart(8, '0')} calls ${out.h.toString(16).padStart(8, '0')}${w.text}`);
    }
    if (frameNo % 10 === 0) {
      trace.push(`${frameNo} ${g.gameMode} ${g.gameFrame} ${g.rand.randIndex} ${Math.trunc(g.hero.getScore())} ${g.hero.getLives()} ${chain.toString(16).padStart(8, '0')}`);
    }
    out.h = 2166136261;
    frameNo++;
    if (verboseFrom >= 0 && frameNo >= verboseFrom && !verbose) { verbose = true; out.verbose = []; }
    advance();
    const ev = events;
    events = [];
    if (loop.endFrame(ev)) break;
  }
  // the end of main(): HiScore and Config are destroyed; the Config destructor writes the file
  g.config.saveFile();
  for (const name of ['.chromium-bsu-score', '.chromium-bsu']) {
    const t = store.get(name);
    if (t !== undefined) for (const l of t.replace(/\n$/, '').split('\n')) trace.push(`FILE ${name} ${l}`);
  }
  return trace;
}
