// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// A round against others, online. The server module has the round (protocol/games/typingwarriors.capnp):
// it sends the words, checks every key, plays the bots and decides the places and ratings. This screen
// sends each key as it is typed and shows its own copy of the same rules at once, so typing feels
// immediate; where the copy and the server differ, the server's `sync` puts it right.
import { SERVER_SEAT, packGame, playerName, unpackGame, type RoundStart } from '../../../src/sdk/index.ts';
import { layoutById, whichOf, type Key, type Layout } from './layouts.ts';
import { ratingOf, recordSwitch, setRating } from './profile.ts';
import { EventKind, Lang, Mode, Msg, Msg_Which, Options, Power, Results, type PState, type Setup } from './proto/typingwarriors.ts';
import { TextPad, TypeScreen, type Env } from './screen.ts';
import { button, el, fmtPercent, fmtTime, t } from './ui.ts';

export interface MatchOptions {
  mode: Mode;
  lang: 'en' | 'de';
  /** the bots' ratings */
  bots: number[];
  /** true: a room of one seat, started at once (against the bots); false: the lobby */
  quick: boolean;
}

export const MODES: { mode: Mode; name: () => string; rules: () => string }[] = [
  { mode: Mode.RACE, name: () => t('Race', 'Wettrennen'),
    rules: () => t('One text for all, 35 words. Whoever is through first wins.', 'Ein Text für alle, 35 Wörter. Wer zuerst durch ist, gewinnt.') },
  { mode: Mode.SURVIVAL, name: () => t('Last One Typing', 'Wer zuletzt tippt'),
    rules: () => t('One word per wave, less time every wave. Too slow costs a life; three lives. The last one standing wins.',
      'Ein Wort pro Welle, jede Welle weniger Zeit. Zu langsam kostet ein Leben; drei Leben. Wer übrig bleibt, gewinnt.') },
  { mode: Mode.LOOT, name: () => t('Word Loot', 'Wortbeute'),
    rules: () => t('Ten words on the table for everybody. The first to finish a word takes it. Some carry a power-up: freeze, double points, steal, shuffle. 75 seconds.',
      'Zehn Wörter für alle auf dem Tisch. Wer ein Wort zuerst fertig tippt, bekommt es. Manche tragen ein Extra: Einfrieren, doppelte Punkte, Klauen, Mischen. 75 Sekunden.') },
  { mode: Mode.SPRINT, name: () => t('Combo Sprint', 'Combo-Sprint'),
    rules: () => t('60 seconds. A word brings its letters times the combo; three clean words raise the combo (up to ×5), a typo resets it.',
      '60 Sekunden. Ein Wort bringt seine Buchstaben mal Combo; drei saubere Wörter erhöhen die Combo (bis ×5), ein Tippfehler setzt sie zurück.') },
  { mode: Mode.SWITCH_WARS, name: () => t('Switch Wars', 'Switch Wars'),
    rules: () => t('A race with two layouts: every few words the text changes colour and must be typed with the other layout. Keys typed with the wrong one do not count.',
      'Ein Rennen mit zwei Layouts: alle paar Wörter wechselt der Text die Farbe und muss mit dem anderen Layout getippt werden. Tasten mit dem falschen zählen nicht.') },
];
export const modeName = (m: Mode): string => MODES.find((x) => x.mode === m)?.name() ?? '';

const F_DONE = 1, F_OUT = 2, F_FROZEN = 4, F_DOUBLE = 8, F_GONE = 16;
const POWER_LABEL: Record<number, string> = { [Power.FREEZE]: 'FREEZE', [Power.DOUBLE]: '×2', [Power.STEAL]: 'STEAL', [Power.SHUFFLE]: 'SHUFFLE' };

interface PlayerView { id: number; name: string; bot: boolean; elo: number; games: number; layout: string }
interface PView { pos: number; errors: number; score: number; lives: number; streak: number; flags: number; wpm: number; word: number; chars: number }
interface SlotView { id: number; word: string; power: Power }

const comboOf = (streak: number): number => 1 + Math.min(4, Math.floor(streak / 3));

/** Plays online until the player goes back to the menu. Resolves with a message to show there ("" = none). */
export async function playOnline(env: Env, o: MatchOptions): Promise<string> {
  const { ctx } = env;
  const options = () => packGame(Options, (m) => {
    m.mode = o.mode;
    m.lang = o.lang === 'de' ? Lang.DE : Lang.EN;
    const b = m._initBots(o.bots.length);
    o.bots.forEach((elo, i) => b.set(i, elo));
  });
  const lobby = () => ctx.lobby(env.root, { title: `Typing Warriors: ${modeName(o.mode)}`, seats: { min: 1, max: 6, default: 2 }, options });
  let round: RoundStart;
  try {
    if (o.quick) {
      env.root.replaceChildren(el('div', 'tw-screen', el('p', 'tw-muted tw-center', t('Connecting…', 'Verbinde…'))));
      await ctx.rooms.create({ name: `${playerName() || 'Typist'} vs bots`, maxSeats: 1, options: options() });
      round = await ctx.rooms.start();
    } else {
      round = await lobby();
    }
    for (;;) {
      const next = await runRound(env, round, o);
      if (next.what === 'menu') {
        ctx.rooms.leave();
        return next.note;
      }
      round = o.quick ? await ctx.rooms.start() : await lobby();
    }
  } catch (e) {
    ctx.rooms.leave();
    if (ctx.signal.aborted) return '';
    const msg = e instanceof Error ? e.message : String(e);
    return msg === 'cancelled' ? '' : t(`Online play failed: ${msg}`, `Online-Spiel fehlgeschlagen: ${msg}`);
  }
}

function runRound(env: Env, round: RoundStart, o: MatchOptions): Promise<{ what: 'again' | 'menu'; note: string }> {
  return new Promise((resolve) => {
    const { ctx, profile } = env;
    const me = round.you;
    const layouts: Layout[] = [layoutById(profile.layout)!, layoutById(profile.layout2)!];
    // the room's mode (a guest's own choice in the menu does not count)
    let roomMode: Mode = o.mode;
    try { if (round.options.length) roomMode = unpackGame(Options, round.options).mode; } catch { /* the defaults */ }
    const scr = new TypeScreen(env, modeName(roomMode), layouts[0], () => leave(''));
    const lanes = el('div', 'tw-lanes');
    const feed = el('div', 'tw-feed');
    const stage = el('div', 'tw-stage', el('p', 'tw-muted tw-center', t('Waiting for the server…', 'Warte auf den Server…')));
    const overlay = el('div', 'tw-count tw-hidden');
    scr.body.append(lanes, feed, stage, overlay);

    let setup: { mode: Mode; players: PlayerView[]; durationMs: number; text: string; switchAt: number[]; rated: boolean; lives: number } | null = null;
    /** performance.now() at the round's start */
    let t0 = 0;
    let over = false;
    const states = new Map<number, PView>();
    const mine: PView & { wordClean: boolean } = { pos: 0, errors: 0, score: 0, lives: 0, streak: 0, flags: 0, wpm: 0, word: 0, chars: 0, wordClean: true };
    let pad: TextPad | null = null;
    // survival
    let wave: { number: number; word: string; startT: number; limitMs: number } | null = null;
    let waveView: { chars: HTMLElement[]; bar: HTMLElement; label: HTMLElement } | null = null;
    // loot
    const pool: (SlotView | null)[] = [];
    let cards: HTMLElement[] = [];
    let frozenUntil = 0, doubleUntil = 0;
    // switch wars
    let seg = 0, orderedAt = 0, fouls = 0;
    let banner: HTMLElement | null = null;
    let lastCount = -1;

    const off: (() => void)[] = [];
    const done = (what: 'again' | 'menu', note = '') => {
      for (const f of off.splice(0)) f();
      scr.close();
      resolve({ what, note });
    };
    const leave = (note: string) => done('menu', note);
    const now = () => performance.now() - t0;
    const send = (chars: string, pos: number, word = 0, layout = 0) => {
      ctx.rooms.send(packGame(Msg, (m) => {
        const k = m._initKeys();
        k.chars = chars;
        k.pos = pos;
        k.word = word;
        k.layout = layout;
      }), 'server');
    };
    const segmentOf = (p: number) => (setup ? setup.switchAt.filter((s) => p >= s).length : 0);
    const player = (id: number) => setup?.players.find((p) => p.id === id);
    const nameOf = (id: number) => (id === me ? t('You', 'Du') : player(id)?.name ?? '?');
    const say = (text: string) => {
      const line = el('div', 'tw-feed-line', text);
      feed.prepend(line);
      while (feed.children.length > 3) feed.lastChild!.remove();
      setTimeout(() => line.remove(), 5000);
    };

    // ------------------------------------------------------------ building the views

    function build(): void {
      const s = setup!;
      lanes.replaceChildren(...s.players.map((p) => {
        const row = el('div', `tw-lane${p.id === me ? ' tw-lane-me' : ''}`);
        row.dataset.id = String(p.id);
        row.append(el('span', 'tw-lane-name', p.id === me ? t('You', 'Du') : p.name, el('small', {}, ` ${p.elo}`)),
          el('span', 'tw-lane-bar', el('i')), el('span', 'tw-lane-val'));
        return row;
      }));
      pad = null;
      waveView = null;
      banner = null;
      if (s.mode === Mode.RACE || s.mode === Mode.SPRINT || s.mode === Mode.SWITCH_WARS) {
        pad = new TextPad(s.text, s.switchAt, 3);
        if (s.mode === Mode.SWITCH_WARS) {
          banner = el('div', 'tw-banner');
          stage.replaceChildren(banner, pad.root);
        } else stage.replaceChildren(pad.root);
        pad.setPos(mine.pos);
      } else if (s.mode === Mode.SURVIVAL) {
        stage.replaceChildren(el('p', 'tw-muted tw-center', t('Get ready…', 'Mach dich bereit…')));
      } else {
        cards = [];
        const grid = el('div', 'tw-pool');
        for (let i = 0; i < 10; i++) {
          const c = el('div', 'tw-slot');
          cards.push(c);
          grid.append(c);
        }
        stage.replaceChildren(grid, el('p', 'tw-muted tw-center', t('Type a word\'s first letter to go for it. Esc or ⌫ lets it go.', 'Tippe den ersten Buchstaben eines Worts, um es anzugehen. Esc oder ⌫ lässt es los.')));
        drawPool();
      }
      hint();
    }

    function drawPool(): void {
      cards.forEach((c, i) => {
        const w = pool[i];
        if (!w) {
          c.replaceChildren();
          return;
        }
        const target = mine.word === w.id;
        c.className = `tw-slot${target ? ' tw-slot-mine' : ''}${w.power !== Power.NONE ? ' tw-slot-power' : ''}`;
        const typed = target ? mine.pos : 0;
        const rivals = [...states.entries()].filter(([id, s]) => id !== me && s.word === w.id);
        c.replaceChildren(el('span', 'tw-slot-word', el('b', {}, w.word.slice(0, typed)), w.word.slice(typed)));
        if (w.power !== Power.NONE) c.append(el('span', 'tw-slot-badge', POWER_LABEL[w.power]));
        if (rivals.length) c.append(el('span', 'tw-slot-rivals', rivals.map(([id, s]) => `${(player(id)?.name ?? '?').slice(0, 6)} ${s.pos}/${w.word.length}`).join(', ')));
      });
    }

    function drawWave(): void {
      if (!wave) return;
      const chars = [...wave.word].map((c) => el('span', 'tw-ch', c));
      const bar = el('i');
      const label = el('p', 'tw-muted tw-center', t(`Wave ${wave.number}`, `Welle ${wave.number}`));
      waveView = { chars, bar, label };
      stage.replaceChildren(label, el('div', 'tw-wave', ...chars), el('div', 'tw-timebar', bar));
      markWave();
    }

    function markWave(): void {
      if (!waveView) return;
      waveView.chars.forEach((c, i) => {
        c.classList.toggle('tw-done', i < mine.pos);
        c.classList.toggle('tw-cur', i === mine.pos && !(mine.flags & F_DONE));
      });
      stage.classList.toggle('tw-safe', !!(mine.flags & F_DONE));
    }

    /** the helper keyboard's hint and the banner of Switch Wars */
    function hint(): void {
      const s = setup;
      if (!s) return;
      let next: string | null = null;
      if (pad) next = s.text[mine.pos] ?? null;
      else if (s.mode === Mode.SURVIVAL) next = wave && !(mine.flags & (F_DONE | F_OUT)) ? wave.word[mine.pos] ?? null : null;
      else {
        const w = pool.find((x) => x && x.id === mine.word);
        next = w ? w.word[mine.pos] ?? null : null;
      }
      if (s.mode === Mode.SWITCH_WARS) {
        const l = layouts[seg % 2];
        scr.setLayout(l);
        if (banner) {
          banner.className = `tw-banner tw-seg${seg % 2}${orderedAt ? ' tw-banner-now' : ''}`;
          banner.textContent = orderedAt ? t(`Switch to ${l.name} now!`, `Jetzt auf ${l.name} umschalten!`) : t(`Type with ${l.name}`, `Tippe mit ${l.name}`);
        }
      }
      scr.kb.hint(over || now() < 0 ? null : next);
    }

    function drawLanes(): void {
      const s = setup;
      if (!s) return;
      const top = Math.max(1, ...[...states.values()].map((x) => x.score));
      for (const row of lanes.children as HTMLCollectionOf<HTMLElement>) {
        const id = Number(row.dataset.id);
        const st = id === me ? { ...(states.get(id) ?? mine), pos: mine.pos, errors: mine.errors } : states.get(id);
        if (!st) continue;
        const bar = row.children[1].firstChild as HTMLElement, val = row.children[2] as HTMLElement;
        let share = 0, text = '';
        const score = id === me && s.mode === Mode.SPRINT ? mine.score : st.score;
        switch (s.mode) {
          case Mode.RACE: case Mode.SWITCH_WARS:
            share = st.pos / Math.max(1, s.text.length);
            text = st.flags & F_DONE ? `✓ ${st.wpm} ${t('wpm', 'WpM')}` : `${Math.round(share * 100)} %`;
            break;
          case Mode.SPRINT:
            share = score / Math.max(top, score, 1);
            text = `${score}  ×${comboOf(id === me ? mine.streak : st.streak)}`;
            break;
          case Mode.LOOT:
            share = st.score / top;
            text = `${st.score}${st.flags & F_DOUBLE ? ' ×2' : ''}${st.flags & F_FROZEN ? ` ${t('frozen', 'eingefroren')}` : ''}`;
            break;
          default:
            share = st.lives / Math.max(1, s.lives);
            text = st.flags & F_OUT ? t('out', 'raus') : `${'♥'.repeat(st.lives)}${st.flags & F_DONE ? ' ✓' : ''}`;
        }
        bar.style.width = `${Math.round(Math.min(1, share) * 100)}%`;
        val.textContent = text;
        row.classList.toggle('tw-lane-out', !!(st.flags & (F_OUT | F_GONE)));
      }
    }

    function header(): void {
      const s = setup;
      if (!s) return;
      const tt = now();
      const st = states.get(me);
      const items: [string, string][] = [
        [t('wpm', 'WpM'), String(st?.wpm ?? 0)],
        [t('typos', 'Fehler'), String(mine.errors)],
      ];
      if (s.mode === Mode.SWITCH_WARS) items.push([t('wrong layout', 'falsches Layout'), String(fouls)]);
      if (s.mode === Mode.SPRINT || s.mode === Mode.LOOT) items.push([t('left', 'übrig'), fmtTime(s.durationMs - Math.max(0, tt))]);
      else if (s.mode !== Mode.SURVIVAL) items.push([t('time', 'Zeit'), fmtTime(Math.max(0, tt))]);
      scr.setStats(items);
    }

    // ------------------------------------------------------------ the clock

    ctx.frame(() => {
      if (!setup || over) return;
      const tt = now();
      const count = tt < 0 ? Math.ceil(-tt / 1000) : 0;
      if (count !== lastCount) {
        lastCount = count;
        overlay.classList.toggle('tw-hidden', count === 0);
        overlay.textContent = String(count);
        if (count > 0) env.sounds.tick(); else { env.sounds.go(); hint(); }
      }
      if (wave && waveView) {
        const left = Math.max(0, 1 - (tt - wave.startT) / wave.limitMs);
        waveView.bar.style.width = `${left * 100}%`;
        waveView.bar.classList.toggle('tw-low', left < 0.3);
      }
      stage.classList.toggle('tw-frozen', tt < frozenUntil);
      stage.classList.toggle('tw-double', tt < doubleUntil);
    }, scr.signal);
    const clock = setInterval(header, 250);
    off.push(() => clearInterval(clock));

    // ------------------------------------------------------------ typing

    scr.input.onKey = (k: Key) => {
      const s = setup;
      if (!s || over || now() < 0 || mine.flags & F_OUT) return;
      scr.note.add(k);
      const bad = () => {
        mine.errors++;
        if (k.code) scr.kb.flash(k.code, 'bad');
        env.sounds.typo();
      };
      if (pad) {
        if (mine.pos >= s.text.length) return;
        let layout = 0;
        let wrongLayout = false;
        if (s.mode === Mode.SWITCH_WARS) {
          const due = seg % 2;
          // which of the two layouts typed this key; nothing to go by: the one that is due
          const w = profile.trustLayout ? 'unknown' : whichOf(layouts[due], layouts[1 - due], k);
          wrongLayout = w === 'b' || w === 'neither';
          layout = wrongLayout ? 1 - due : due;
        }
        send(k.char, mine.pos, 0, layout);
        if (s.text[mine.pos] !== k.char || wrongLayout) {
          bad();
          if (wrongLayout) {
            fouls++;
            say(t(`That key was not ${layouts[seg % 2].name}: switch your keyboard`, `Diese Taste war nicht ${layouts[seg % 2].name}: Tastatur umschalten`));
          }
          mine.streak = 0;
          mine.wordClean = false;
          pad.miss();
        } else {
          if (orderedAt) {
            recordSwitch(profile, layouts[(seg + 1) % 2].id, layouts[seg % 2].id, performance.now() - orderedAt);
            orderedAt = 0;
          }
          mine.pos++;
          mine.chars++;
          const wordEnd = mine.pos === s.text.length || s.text[mine.pos - 1] === ' ';
          if (wordEnd) env.sounds.word();
          if (s.mode === Mode.SPRINT && wordEnd) {
            const end = mine.pos === s.text.length ? mine.pos : mine.pos - 1;
            const start = s.text.lastIndexOf(' ', end - 1) + 1;
            if (mine.wordClean) mine.streak++;
            mine.score += (end - start) * comboOf(mine.streak);
            mine.wordClean = true;
          }
          pad.setPos(mine.pos);
          if (s.mode === Mode.SWITCH_WARS && segmentOf(mine.pos) !== seg && mine.pos < s.text.length) {
            seg = segmentOf(mine.pos);
            orderedAt = performance.now();
            env.sounds.switchNow();
          }
        }
      } else if (s.mode === Mode.SURVIVAL) {
        if (!wave || mine.flags & F_DONE) return;
        send(k.char, mine.pos, wave.number);
        if (wave.word[mine.pos] !== k.char) bad();
        else {
          mine.pos++;
          mine.chars++;
          if (mine.pos === wave.word.length) {
            mine.flags |= F_DONE;
            env.sounds.word();
          }
        }
        markWave();
      } else {
        if (now() < frozenUntil) return;
        let w = pool.find((x) => x && x.id === mine.word) ?? null;
        if (!w) {
          w = pool.find((x) => x && x.word[0] === k.char) ?? null;
          if (!w) {
            if (k.code) scr.kb.flash(k.code, 'bad');
            return;
          }
          mine.word = w.id;
          mine.pos = 0;
        }
        send(k.char, mine.pos, w.id);
        if (w.word[mine.pos] !== k.char) bad();
        else {
          mine.pos++;
          mine.chars++;
          if (mine.pos === w.word.length) {
            // the server says who got it: the pool message replaces the word
            mine.word = 0;
            mine.pos = 0;
            env.sounds.word();
          }
        }
        drawPool();
      }
      hint();
      drawLanes();
    };
    scr.input.onSpecial = (name) => {
      if (setup?.mode === Mode.LOOT && (name === 'Escape' || name === 'Backspace')) {
        mine.word = 0;
        mine.pos = 0;
        drawPool();
        hint();
      }
    };

    // ------------------------------------------------------------ the server's messages

    const view = (p: PState): PView => ({ pos: p.pos, errors: p.errors, score: p.score, lives: p.lives, streak: p.streak, flags: p.flags, wpm: p.wpm, word: p.word, chars: p.chars });

    function onSetup(s: Setup): void {
      const players: PlayerView[] = [];
      for (let i = 0; i < s.players.length; i++) {
        const p = s.players.get(i);
        players.push({ id: p.id, name: p.name, bot: p.bot, elo: p.elo, games: p.games, layout: p.layout });
      }
      const switchAt: number[] = [];
      for (let i = 0; i < s.switchAt.length; i++) switchAt.push(s.switchAt.get(i));
      setup = { mode: s.mode, players, durationMs: s.durationMs, text: s.text, switchAt, rated: s.rated, lives: s.lives };
      t0 = performance.now() + s.startsInMs;
      lastCount = -1;
      mine.lives = s.lives;
      build();
      header();
      drawLanes();
    }

    function onSync(p: PState): void {
      const s = setup;
      if (!s) return;
      Object.assign(mine, view(p));
      mine.wordClean = true;
      if (s.mode === Mode.LOOT && !pool.some((x) => x && x.id === mine.word)) {
        mine.word = 0;
        mine.pos = 0;
      }
      if (s.mode === Mode.SWITCH_WARS) {
        seg = segmentOf(mine.pos);
        orderedAt = 0;
      }
      pad?.setPos(mine.pos);
      markWave();
      if (s.mode === Mode.LOOT) drawPool();
      hint();
      drawLanes();
    }

    off.push(ctx.rooms.on('message', ({ from, data }) => {
      if (from !== SERVER_SEAT || over) return;
      let m: Msg;
      try { m = unpackGame(Msg, data); } catch { return; }
      switch (m.which()) {
        case Msg_Which.SETUP:
          onSetup(m.setup);
          break;
        case Msg_Which.STATE: {
          if (!setup) break;
          const st = m.state;
          // the round's clock: the earliest estimate of its start is the best one
          t0 = Math.min(t0, performance.now() - st.t);
          for (let i = 0; i < st.players.length; i++) {
            const p = st.players.get(i);
            states.set(p.id, view(p));
          }
          const own = states.get(me);
          if (own) {
            mine.lives = own.lives;
            if (setup.mode === Mode.LOOT) mine.score = own.score;
            if (own.flags & F_OUT) mine.flags |= F_OUT;
          }
          if (setup.mode === Mode.LOOT) drawPool();
          drawLanes();
          break;
        }
        case Msg_Which.WAVE: {
          const w = m.wave;
          wave = { number: w.number, word: w.word, startT: w.startT, limitMs: w.limitMs };
          mine.pos = 0;
          mine.flags &= ~F_DONE;
          drawWave();
          hint();
          break;
        }
        case Msg_Which.POOL: {
          const l = m.pool;
          for (let i = 0; i < l.length; i++) {
            const x = l.get(i);
            if (x.takenBy !== 255 && x.takenBy === me) say(t(`+${x.points} for you`, `+${x.points} für dich`));
            pool[x.index] = { id: x.id, word: x.word, power: x.power };
          }
          if (mine.word && !pool.some((x) => x && x.id === mine.word)) {
            mine.word = 0;
            mine.pos = 0;
          }
          if (setup) drawPool();
          hint();
          break;
        }
        case Msg_Which.EVENT: {
          const e = m.event;
          const who = nameOf(e.id);
          switch (e.kind) {
            case EventKind.FINISHED:
              say(t(`${who}: place ${e.value}`, `${who}: Platz ${e.value}`));
              break;
            case EventKind.LIFE_LOST:
              if (e.id === me) env.sounds.lost();
              say(t(`${who} lost a life`, `${who} verliert ein Leben`));
              break;
            case EventKind.OUT:
              if (e.id === me) {
                env.sounds.lost();
                mine.flags |= F_OUT;
                stage.replaceChildren(el('p', 'tw-center', t(`Out in wave ${e.value}. Watching the others…`, `Raus in Welle ${e.value}. Die anderen spielen noch…`)));
                waveView = null;
              }
              say(t(`${who} is out`, `${who} ist raus`));
              break;
            case EventKind.FREEZE:
              env.sounds.power();
              if (e.id !== me) frozenUntil = e.t + e.value;
              say(t(`${who} froze everybody else`, `${who} friert alle anderen ein`));
              break;
            case EventKind.DOUBLE:
              env.sounds.power();
              if (e.id === me) doubleUntil = e.t + e.value;
              say(t(`${who}: double points`, `${who}: doppelte Punkte`));
              break;
            case EventKind.STEAL:
              env.sounds.power();
              say(t(`${who} stole ${e.value & 0xffff} points from ${nameOf(e.value >> 16)}`, `${who} klaut ${nameOf(e.value >> 16)} ${e.value & 0xffff} Punkte`));
              break;
            case EventKind.SHUFFLE:
              env.sounds.power();
              say(t(`${who} shuffled the words`, `${who} mischt die Wörter`));
              break;
            default:
          }
          break;
        }
        case Msg_Which.SYNC:
          onSync(m.sync);
          break;
        default:
      }
    }));

    off.push(ctx.rooms.on('finished', (f) => {
      if (over) return;
      over = true;
      scr.kb.hint(null);
      overlay.classList.add('tw-hidden');
      if (f.stopped) return leave(t(`The server stopped the round: ${f.stopped}`, `Der Server hat die Runde beendet: ${f.stopped}`));
      let r: Results;
      try { r = unpackGame(Results, f.results); } catch { return leave(t('The round ended without results.', 'Die Runde endete ohne Ergebnis.')); }
      results(r);
    }));
    off.push(ctx.rooms.on('closed', (c) => { if (!over) leave(t(`The room was closed: ${c.reason}`, `Der Raum wurde geschlossen: ${c.reason}`)); }));

    function results(r: Results): void {
      const rows: HTMLElement[] = [];
      let own: { place: number; before: number; after: number } | null = null;
      for (let i = 0; i < r.players.length; i++) {
        const p = r.players.get(i);
        const delta = p.eloAfter - p.eloBefore;
        if (p.id === me) {
          own = { place: p.place, before: p.eloBefore, after: p.eloAfter };
          const table = r.mode === Mode.SWITCH_WARS ? 'switch' : p.layout;
          if (r.rated && p.layout) setRating(profile, table, p.eloAfter, (ratingOf(profile, table)?.games ?? 0) + 1);
          profile.history.unshift({ time: Date.now(), mode: r.mode, layout: p.layout, place: p.place, players: r.players.length, wpm: p.wpm,
            accuracy: p.accuracy, eloBefore: p.eloBefore, eloAfter: p.eloAfter });
          profile.history.length = Math.min(profile.history.length, 50);
          env.save();
        }
        const result = r.mode === Mode.RACE || r.mode === Mode.SWITCH_WARS ? (p.timeMs ? `${(p.timeMs / 1000).toFixed(1)} s` : '–')
          : r.mode === Mode.SURVIVAL ? t(`wave ${p.score}`, `Welle ${p.score}`) : String(p.score);
        rows.push(el('tr', p.id === me ? 'tw-row-me' : '',
          el('td', {}, `${p.place}.`), el('td', {}, p.id === me ? t('You', 'Du') : p.name), el('td', {}, result),
          el('td', {}, String(p.wpm)), el('td', {}, fmtPercent(p.accuracy / 1000)),
          el('td', {}, p.bot ? String(p.eloBefore) : r.rated && p.layout ? `${p.eloAfter} (${delta >= 0 ? '+' : ''}${delta})` : '–')));
      }
      if (own?.place === 1 && r.players.length > 1) env.sounds.win();
      const head = !own ? '' : r.players.length === 1 ? t('Done', 'Geschafft')
        : own.place === 1 ? t('You win!', 'Gewonnen!') : t(`Place ${own.place} of ${r.players.length}`, `Platz ${own.place} von ${r.players.length}`);
      const myLayout = r.mode === Mode.SWITCH_WARS ? `${layouts[0].name} ⇄ ${layouts[1].name}` : layouts[0].name;
      scr.body.replaceChildren(el('div', 'tw-card tw-result',
        el('h3', {}, head),
        own && r.rated && own.after !== own.before
          ? el('p', 'tw-elo', `${myLayout}: ${own.before} → `, el('b', {}, String(own.after)))
          : el('p', 'tw-muted', r.rated ? '' : t('Unrated: a rating needs an opponent (a bot counts).', 'Ohne Wertung: für eine Wertung braucht es einen Gegner (ein Bot zählt).')),
        el('table', 'tw-table',
          el('thead', {}, el('tr', {}, ...['#', t('Player', 'Spieler'), t('Result', 'Ergebnis'), t('wpm', 'WpM'), t('Acc.', 'Gen.'), 'ELO'].map((h) => el('th', {}, h)))),
          el('tbody', {}, ...rows)),
        el('div', 'tw-row',
          button(o.quick ? t('Again', 'Nochmal') : t('Back to the room', 'Zurück in den Raum'), () => done('again')),
          button(t('Menu', 'Menü'), () => leave(''), 'tw-quiet'))));
    }

    // tell the server the layout this seat plays with (it is rated under it)
    ctx.rooms.send(packGame(Msg, (m) => {
      const j = m._initJoin();
      j.layout = profile.layout;
      j.layout2 = roomMode === Mode.SWITCH_WARS ? profile.layout2 : '';
    }), 'server');
  });
}
