// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The menus: home, the duel's setup, the course of a layout, the ratings, the layouts and the help.
import type { GameContext } from '../../../src/sdk/index.ts';
import { unpackGame } from '../../../src/sdk/index.ts';
import { HelperKeyboard } from './keyboard.ts';
import { LAYOUTS, differingKeys, layoutById, untypeable, type Layout } from './layouts.ts';
import { courseOf, type Lesson } from './lessons.ts';
import { MODES, modeName, playOnline } from './match.ts';
import { runLesson, runSwitchTrainer } from './practice.ts';
import { lessonDone, loadProfile, ratingOf, saveProfile, type Profile } from './profile.ts';
import { Mode, Rating } from './proto/typingwarriors.ts';
import type { Env } from './screen.ts';
import { CSS } from './style.ts';
import { Sounds, button, el, fmtPercent, setUiLang, t } from './ui.ts';
import { wordsOf } from './words.ts';

const BOT_BANDS = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400];
const SECTION_NAMES: Record<Lesson['section'], () => string> = {
  home: () => t('Home row', 'Grundreihe'),
  top: () => t('Upper row', 'Obere Reihe'),
  bottom: () => t('Lower row', 'Untere Reihe'),
  more: () => t('More letters', 'Weitere Buchstaben'),
  shift: () => t('Capitals (Shift)', 'Großbuchstaben (Shift)'),
  symbols: () => t('Punctuation', 'Satzzeichen'),
  digits: () => t('Digits', 'Ziffern'),
  level3: () => t('Level 3 (Mod3)', 'Ebene 3 (Mod3)'),
  level4: () => t('Level 4 (Mod4)', 'Ebene 4 (Mod4)'),
  words: () => t('Words', 'Wörter'),
};

export class App {
  private readonly env: Env;
  private readonly ctx: GameContext;
  private readonly root: HTMLElement;
  private profile!: Profile;
  // the duel's setup, kept between rounds
  private mode: Mode = Mode.RACE;
  private bots: number[] = [1000];

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    host.append(el('style', { textContent: CSS }));
    this.root = el('div', 'tw');
    host.append(this.root);
    this.env = { ctx, root: this.root, profile: undefined as unknown as Profile, sounds: new Sounds(ctx.audio), save: () => saveProfile(ctx, this.profile) };
    this.root.append(el('div', 'tw-screen', el('p', 'tw-muted tw-center', 'Typing Warriors…')));
    void this.boot();
  }

  private async boot(): Promise<void> {
    this.profile = this.env.profile = await loadProfile(this.ctx);
    if (this.ctx.signal.aborted) return;
    this.applySettings();
    this.home();
  }

  private applySettings(): void {
    const p = this.profile;
    setUiLang(p.uiLang || ((navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en'));
    this.env.sounds.on = p.sound;
  }

  private get layout(): Layout {
    return layoutById(this.profile.layout) ?? LAYOUTS[0];
  }

  private screen(title: string, back: (() => void) | null, ...kids: (Node | string | null)[]): void {
    this.root.replaceChildren(el('div', 'tw-screen',
      el('div', 'tw-head', back ? button('←', back, 'tw-quiet tw-back') : null, el('h2', 'tw-title', title)),
      el('div', 'tw-main', ...kids)));
  }

  private layoutSelect(value: string, onChange: (id: string) => void, without = ''): HTMLSelectElement {
    const s = el('select', 'tw-select');
    for (const [family, label] of [['standard', t('Common layouts', 'Verbreitete Layouts')], ['neo', t('Neo family (neo-layout.org)', 'Neo-Familie (neo-layout.org)')]] as const) {
      const g = el('optgroup', { label });
      for (const l of LAYOUTS) if (l.family === family && l.id !== without) g.append(el('option', { value: l.id, textContent: l.name, selected: l.id === value }));
      s.append(g);
    }
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }

  // ------------------------------------------------------------------ home

  home(note = ''): void {
    const p = this.profile;
    const r = ratingOf(p, p.layout);
    const course = courseOf(this.layout);
    const stars = course.reduce((n, l) => n + (lessonDone(p, p.layout, l.index)?.stars ?? 0), 0);
    const tile = (title: string, text: string, go: () => void, cls = '') => {
      const b = el('button', { className: `tw-tile ${cls}`, type: 'button' }, el('b', {}, title), el('span', {}, text));
      b.addEventListener('click', go);
      return b;
    };
    this.root.replaceChildren(el('div', 'tw-screen tw-home',
      el('div', 'tw-hero',
        el('h1', {}, 'Typing ', el('span', {}, 'Warriors')),
        el('p', {}, t('Type against others. In your layout.', 'Tippe gegen andere. In deinem Layout.'))),
      note ? el('p', 'tw-error', note) : null,
      el('div', 'tw-card tw-me',
        el('label', {}, t('Your layout', 'Dein Layout'), this.layoutSelect(p.layout, (id) => {
          p.layout = id;
          if (p.layout2 === id) p.layout2 = LAYOUTS.find((l) => l.id !== id)!.id;
          this.env.save();
          this.home();
        })),
        el('div', 'tw-me-stats',
          el('span', 'tw-chip', el('b', {}, String(r?.elo ?? 1000)), ' ELO'),
          el('span', 'tw-chip', el('b', {}, String(r?.games ?? 0)), t(' rated rounds', ' gewertete Runden')),
          el('span', 'tw-chip', el('b', {}, `${stars}/${course.length * 5}`), ' ★'))),
      el('div', 'tw-tiles',
        tile(t('Duel', 'Duell'), t('Five modes, against players and bots, with ELO', 'Fünf Modi, gegen Spieler und Bots, mit ELO'), () => this.play(), 'tw-tile-main'),
        tile(t('Course', 'Kurs'), t(`${course.length} lessons for ${this.layout.name}, from the home row up`, `${course.length} Lektionen für ${this.layout.name}, ab der Grundreihe`), () => this.course()),
        tile(t('Switch trainer', 'Wechseltraining'), t('Practise changing between two layouts', 'Den Wechsel zwischen zwei Layouts üben'), () => this.switchSetup()),
        tile(t('Ratings', 'Ranglisten'), t('The best of every layout, your last rounds', 'Die Besten jedes Layouts, deine letzten Runden'), () => void this.ratings(p.layout)),
        tile(t('Layouts & help', 'Layouts & Hilfe'), t('All layouts on the helper keyboard, how it works', 'Alle Layouts auf der Hilfstastatur, wie alles funktioniert'), () => this.help(p.layout)),
        tile(t('Settings', 'Einstellungen'), t('Language, words, sound, layout check', 'Sprache, Wörter, Ton, Layout-Prüfung'), () => this.settings())),
      el('div', 'tw-row tw-center', button(t('Quit', 'Beenden'), () => this.ctx.exit(), 'tw-quiet'))));
  }

  // ------------------------------------------------------------------ the duel's setup

  private play(): void {
    const p = this.profile;
    const modes = el('div', 'tw-modes', ...MODES.map((m) => {
      const b = el('button', { className: `tw-mode${m.mode === this.mode ? ' tw-on' : ''}`, type: 'button' }, el('b', {}, m.name()), el('span', {}, m.rules()));
      b.addEventListener('click', () => { this.mode = m.mode; this.play(); });
      return b;
    }));
    const botRow = el('div', 'tw-bots', ...this.bots.map((elo, i) => {
      const s = el('select', 'tw-select');
      for (const b of BOT_BANDS) s.append(el('option', { value: String(b), textContent: `Bot ${b}`, selected: b === elo }));
      s.addEventListener('change', () => { this.bots[i] = Number(s.value); });
      return el('span', 'tw-bot', s, button('×', () => { this.bots.splice(i, 1); this.play(); }, 'tw-quiet'));
    }), this.bots.length < 5 ? button(t('+ bot', '+ Bot'), () => { this.bots.push(Math.min(2400, (this.bots[this.bots.length - 1] ?? 800) + 200)); this.play(); }, 'tw-quiet') : null);
    const langSel = el('select', 'tw-select',
      el('option', { value: 'en', textContent: t('English words (a to z)', 'Englische Wörter (a bis z)'), selected: p.lang === 'en' }),
      el('option', { value: 'de', textContent: t('German words (with ä ö ü ß)', 'Deutsche Wörter (mit ä ö ü ß)'), selected: p.lang === 'de' }));
    langSel.addEventListener('change', () => { p.lang = langSel.value as 'en' | 'de'; this.env.save(); this.play(); });

    const switching = this.mode === Mode.SWITCH_WARS;
    const second = layoutById(p.layout2) ?? LAYOUTS[1];
    const used = switching ? [this.layout, second] : [this.layout];
    // what the chosen layout cannot type of the chosen words
    const missing = new Set<string>();
    for (const l of used) for (const c of untypeable(l, wordsOf(p.lang).join(''))) missing.add(c);
    const warn = missing.size
      ? el('p', 'tw-error', t(`${used.map((l) => l.name).join(' / ')} cannot type ${[...missing].join(' ')}: pick the English words.`,
        `${used.map((l) => l.name).join(' / ')} kann ${[...missing].join(' ')} nicht tippen: nimm die englischen Wörter.`))
      : null;
    const go = (quick: boolean) => {
      void playOnline(this.env, { mode: this.mode, lang: p.lang, bots: [...this.bots], quick }).then((note) => {
        if (!this.ctx.signal.aborted) this.home(note);
      });
    };
    this.screen(t('Duel', 'Duell'), () => this.home(),
      el('h3', {}, t('Mode', 'Modus')), modes,
      el('div', 'tw-card',
        el('label', {}, t('Your layout', 'Dein Layout'), this.layoutSelect(p.layout, (id) => {
          p.layout = id;
          if (p.layout2 === id) p.layout2 = LAYOUTS.find((l) => l.id !== id)!.id;
          this.env.save();
          this.play();
        })),
        switching ? el('label', {}, t('Second layout', 'Zweites Layout'), this.layoutSelect(p.layout2, (id) => { p.layout2 = id; this.env.save(); this.play(); }, p.layout)) : null,
        switching ? el('p', 'tw-muted', this.switchNote(this.layout, second)) : null,
        el('label', {}, t('Words', 'Wörter'), langSel),
        warn,
        el('label', {}, t('Bots', 'Bots')), botRow,
        el('p', 'tw-muted', t('Bots type like players of their rating: 800 about 22 words a minute with many typos, 2400 about 150 with hardly any. Their ratings never change; yours does when you play them.',
          'Bots tippen wie Spieler ihrer Wertung: 800 etwa 22 Wörter pro Minute mit vielen Fehlern, 2400 etwa 150 fast ohne. Ihre Wertung ändert sich nie; deine schon, wenn du gegen sie spielst.'))),
      el('div', 'tw-row',
        button(this.bots.length ? t('Play the bots now', 'Jetzt gegen die Bots') : t('Play alone (unrated)', 'Allein spielen (ohne Wertung)'), () => go(true)),
        button(t('Online room (players, plus these bots)', 'Online-Raum (Spieler, dazu diese Bots)'), () => go(false), 'tw-quiet')),
      el('p', 'tw-muted', t(`Your rating counts per layout: this round is rated for ${switching ? 'Switch Wars' : this.layout.name}.`,
        `Deine Wertung zählt pro Layout: diese Runde zählt für ${switching ? 'Switch Wars' : this.layout.name}.`)));
  }

  /** what the game can and cannot see of a switch between two layouts */
  private switchNote(a: Layout, b: Layout): string {
    if (this.profile.trustLayout) {
      return t('Layout check off: the game tells you when to switch and trusts you to do it.', 'Layout-Prüfung aus: das Spiel sagt dir, wann du wechselst, und vertraut dir.');
    }
    const n = differingKeys(a, b);
    return t(`${a.name} and ${b.name} type ${n} of the 33 letter-row keys differently. Each of those keys shows the game which layout is active; a key typed with the wrong one does not count. Keys both type the same, and keyboards without key codes (phones), cannot be checked: there you are trusted to switch when told.`,
      `${a.name} und ${b.name} belegen ${n} der 33 Tasten der Buchstabenreihen verschieden. Jede dieser Tasten zeigt dem Spiel, welches Layout aktiv ist; eine Taste mit dem falschen zählt nicht. Tasten, die in beiden gleich sind, und Tastaturen ohne Tastencodes (Handys) sind nicht prüfbar: dort wird dir vertraut, dass du auf Ansage wechselst.`);
  }

  // ------------------------------------------------------------------ the course

  private course(): void {
    const p = this.profile, l = this.layout;
    const lessons = courseOf(l);
    const title = (x: Lesson) => `${x.index + 1}. ${x.fresh.length ? x.fresh.join(' ') : x.kind === 'review' ? t('Review', 'Wiederholung') : t('Words', 'Wörter')}`;
    const run = async (x: Lesson) => {
      const next = lessons[x.index + 1];
      const what = await runLesson(this.env, l, x, `${l.name}: ${title(x)}`, !!next);
      if (this.ctx.signal.aborted) return;
      if (what === 'again') void run(x);
      else if (what === 'next' && next) void run(next);
      else this.course();
    };
    const kids: Node[] = [];
    let section = '';
    let grid: HTMLElement | null = null;
    for (const x of lessons) {
      if (x.section !== section) {
        section = x.section;
        grid = el('div', 'tw-lessons');
        kids.push(el('h3', {}, SECTION_NAMES[x.section]()), grid);
      }
      const d = lessonDone(p, l.id, x.index);
      const b = el('button', { className: `tw-lesson${d ? ' tw-lesson-done' : ''}`, type: 'button' },
        el('span', 'tw-lesson-no', String(x.index + 1)),
        el('span', 'tw-lesson-keys', x.fresh.length ? x.fresh.slice(0, 10).join(' ') : x.kind === 'review' ? t('Review', 'Wiederholung') : t('Words', 'Wörter')),
        el('span', 'tw-lesson-stars', '★'.repeat(d?.stars ?? 0), el('i', {}, '★'.repeat(5 - (d?.stars ?? 0)))),
        d ? el('span', 'tw-lesson-best', `${d.wpm} ${t('wpm', 'WpM')} · ${fmtPercent(d.accuracy / 1000)}`) : null);
      b.addEventListener('click', () => void run(x));
      grid!.append(b);
    }
    const first = lessons.find((x) => !lessonDone(p, l.id, x.index)) ?? lessons[0];
    this.screen(t(`Course: ${l.name}`, `Kurs: ${l.name}`), () => this.home(),
      el('div', 'tw-card',
        el('label', {}, t('Layout', 'Layout'), this.layoutSelect(p.layout, (id) => { p.layout = id; this.env.save(); this.course(); })),
        el('p', 'tw-muted', t('Each lesson adds a few keys: first the home row, from the index fingers outwards, then the rows above and below, capitals, punctuation and digits. The helper keyboard lights the next key in the colour of its finger. A wrong key waits for the right one.',
          'Jede Lektion bringt ein paar Tasten dazu: erst die Grundreihe, von den Zeigefingern nach außen, dann die Reihen darüber und darunter, Großbuchstaben, Satzzeichen und Ziffern. Die Hilfstastatur beleuchtet die nächste Taste in der Farbe ihres Fingers. Eine falsche Taste wartet auf die richtige.')),
        button(t(`Go on: lesson ${first.index + 1}`, `Weiter: Lektion ${first.index + 1}`), () => void run(first))),
      ...kids);
  }

  // ------------------------------------------------------------------ the switch trainer

  private switchSetup(): void {
    const p = this.profile;
    const a = this.layout, b = layoutById(p.layout2) ?? LAYOUTS[1];
    const stats = p.switchStats.filter((s) => (s.from === a.id && s.to === b.id) || (s.from === b.id && s.to === a.id));
    this.screen(t('Switch trainer', 'Wechseltraining'), () => this.home(),
      el('div', 'tw-card',
        el('label', {}, t('First layout', 'Erstes Layout'), this.layoutSelect(p.layout, (id) => {
          p.layout = id;
          if (p.layout2 === id) p.layout2 = LAYOUTS.find((l) => l.id !== id)!.id;
          this.env.save();
          this.switchSetup();
        })),
        el('label', {}, t('Second layout', 'Zweites Layout'), this.layoutSelect(p.layout2, (id) => { p.layout2 = id; this.env.save(); this.switchSetup(); }, p.layout)),
        el('p', {}, t('A text in coloured segments. Each segment is typed with the other layout: when the colour changes, switch your keyboard (the way your system does it: a key combination, the layout menu) and go on. The helper keyboard shows the layout that is due.',
          'Ein Text in farbigen Abschnitten. Jeder Abschnitt wird mit dem anderen Layout getippt: wechselt die Farbe, schalte deine Tastatur um (so wie dein System es macht: Tastenkombination, Layout-Menü) und tippe weiter. Die Hilfstastatur zeigt das Layout, das dran ist.')),
        el('p', 'tw-muted', this.switchNote(a, b)),
        stats.length ? el('p', 'tw-muted', ...stats.map((s) => el('div', {},
          `${layoutById(s.from)?.name} → ${layoutById(s.to)?.name}: ${s.switches} ${t('switches', 'Wechsel')}, ⌀ ${(s.totalMs / s.switches / 1000).toFixed(1)} s, ${t('best', 'beste')} ${(s.bestMs / 1000).toFixed(1)} s`))) : null,
        button(t('Start', 'Start'), () => void runSwitchTrainer(this.env).then(() => { if (!this.ctx.signal.aborted) this.switchSetup(); }))));
  }

  // ------------------------------------------------------------------ ratings

  private async ratings(layoutId: string): Promise<void> {
    const p = this.profile;
    const list = el('div', 'tw-card', el('p', 'tw-muted', t('Loading…', 'Lade…')));
    const sel = el('select', 'tw-select');
    for (const l of LAYOUTS) sel.append(el('option', { value: l.id, textContent: l.name, selected: l.id === layoutId }));
    sel.append(el('option', { value: 'switch', textContent: 'Switch Wars', selected: layoutId === 'switch' }));
    sel.addEventListener('change', () => void this.ratings(sel.value));
    const history = p.history.length
      ? el('table', 'tw-table', el('tbody', {}, ...p.history.slice(0, 15).map((h) => el('tr', {},
        el('td', {}, new Date(h.time).toLocaleDateString()), el('td', {}, modeName(h.mode)), el('td', {}, layoutById(h.layout)?.name ?? '–'),
        el('td', {}, `${h.place}/${h.players}`), el('td', {}, `${h.wpm} ${t('wpm', 'WpM')}`), el('td', {}, fmtPercent(h.accuracy / 1000)),
        el('td', {}, h.eloAfter === h.eloBefore ? '–' : `${h.eloAfter} (${h.eloAfter > h.eloBefore ? '+' : ''}${h.eloAfter - h.eloBefore})`)))))
      : el('p', 'tw-muted', t('No rounds yet.', 'Noch keine Runden.'));
    this.screen(t('Ratings', 'Ranglisten'), () => this.home(),
      el('label', 'tw-inline', t('Layout', 'Layout'), sel), list,
      el('h3', {}, t('Your last rounds', 'Deine letzten Runden')), el('div', 'tw-card', history));
    try {
      const entries = await this.ctx.scores.get(`elo-${layoutId}`, 25);
      if (this.ctx.signal.aborted || !list.isConnected) return;
      const me = this.ctx.net.accountId;
      list.replaceChildren(entries.length
        ? el('table', 'tw-table',
          el('thead', {}, el('tr', {}, ...['#', t('Player', 'Spieler'), 'ELO', t('Rounds', 'Runden'), t('Wins', 'Siege')].map((h) => el('th', {}, h)))),
          el('tbody', {}, ...entries.map((e) => {
            let games = 0, wins = 0;
            try { if (e.detail.length) { const r = unpackGame(Rating, e.detail); games = r.games; wins = r.wins; } } catch { /* no detail */ }
            return el('tr', e.accountId === me ? 'tw-row-me' : '', el('td', {}, `${e.rank}.`), el('td', {}, e.name), el('td', {}, String(e.score)), el('td', {}, String(games)), el('td', {}, String(wins)));
          })))
        : el('p', 'tw-muted', t('Nobody is rated here yet. Be the first.', 'Hier hat noch niemand eine Wertung. Sei die oder der Erste.')));
    } catch {
      if (list.isConnected) list.replaceChildren(el('p', 'tw-error', t('The server cannot be reached.', 'Der Server ist nicht erreichbar.')));
    }
  }

  // ------------------------------------------------------------------ layouts and help

  private help(layoutId: string): void {
    const l = layoutById(layoutId) ?? LAYOUTS[0];
    const kb = new HelperKeyboard(l);
    const h = (en: string, de: string) => el('h3', {}, t(en, de));
    const para = (en: string, de: string) => el('p', {}, t(en, de));
    this.screen(t('Layouts & help', 'Layouts & Hilfe'), () => this.home(),
      el('div', 'tw-card',
        el('label', {}, t('Show layout', 'Layout zeigen'), this.layoutSelect(l.id, (id) => this.help(id))),
        el('p', 'tw-muted', `${t(l.about, l.about)} ${t('Source of the key map', 'Quelle der Belegung')}: ${l.source}.`),
        el('div', 'tw-kbwrap', kb.root)),
      h('The helper keyboard', 'Die Hilfstastatur'),
      para('It shows your layout on a keyboard: the character every key types. The key to press next is lit; keys to hold with it (Shift, Mod3, Mod4, AltGr) are outlined. The colours are the fingers of ten-finger typing: each finger has its column, the index fingers two.',
        'Sie zeigt dein Layout auf einer Tastatur: das Zeichen, das jede Taste tippt. Die nächste Taste leuchtet; Tasten, die du dazu hältst (Shift, Mod3, Mod4, AltGr), sind umrandet. Die Farben sind die Finger des Zehnfingersystems: jeder Finger hat seine Spalte, die Zeigefinger zwei.'),
      para('The buttons above it choose the level: plain, Shift, and the third and fourth level (Mod3 and Mod4 in the Neo family, AltGr elsewhere). While you type, the keyboard shows the level of the next character by itself; a click on a level pins it, a second click lets it follow again. "Keyboard" in the top bar hides it: the aim is to not need it.',
        'Die Knöpfe darüber wählen die Ebene: ohne, Shift, und die dritte und vierte Ebene (Mod3 und Mod4 in der Neo-Familie, sonst AltGr). Beim Tippen zeigt die Tastatur von selbst die Ebene des nächsten Zeichens; ein Klick auf eine Ebene hält sie fest, ein zweiter lässt sie wieder folgen. „Tastatur“ in der oberen Leiste blendet sie aus: Ziel ist, sie nicht zu brauchen.'),
      para('M3 and M4 are the Neo family\'s modifier keys: Mod3 on Caps Lock and the key left of Enter, Mod4 on the key right of left Shift and on AltGr (Mine and Noted move the right Mod3 one key to the left; 3l uses the keys right of the home row and of the lower row). A dotted circle marks a dead key: it adds its accent to the next letter.',
        'M3 und M4 sind die Modifikatoren der Neo-Familie: Mod3 auf der Feststelltaste und der Taste links neben Enter, Mod4 auf der Taste rechts neben der linken Shift-Taste und auf AltGr (Mine und Noted rücken das rechte Mod3 eine Taste nach links; 3l nimmt die Tasten rechts der Grundreihe und der unteren Reihe). Ein gepunkteter Kreis markiert eine Tottaste: sie setzt ihren Akzent auf den nächsten Buchstaben.'),
      para('The game does not change your keyboard. Choose here the layout your system is set to (or the one you want to learn, and set your system to it). The levels 3 and 4 are drawn as Linux (xkeyboard-config) defines them; Windows and macOS drivers of the same layout can differ there in rare characters.',
        'Das Spiel stellt deine Tastatur nicht um. Wähle hier das Layout, auf das dein System eingestellt ist (oder das du lernen willst, und stelle dein System darauf ein). Die Ebenen 3 und 4 sind gezeichnet, wie Linux (xkeyboard-config) sie festlegt; Windows- und macOS-Treiber desselben Layouts können dort bei seltenen Zeichen abweichen.'),
      h('What the game sees of your layout', 'Was das Spiel von deinem Layout sieht'),
      para('A browser does not tell a page which layout is active. It tells, for every key press, which physical key it was and which character came out. From that pair the game knows whether a key fits a layout. Under the helper keyboard it says so: "your keys fit …", or which layouts they look like instead.',
        'Ein Browser verrät einer Seite nicht, welches Layout aktiv ist. Er meldet zu jedem Tastendruck, welche Taste es war und welches Zeichen herauskam. Aus diesem Paar weiß das Spiel, ob eine Taste zu einem Layout passt. Unter der Hilfstastatur steht es: „deine Tasten passen zu …“, oder nach welchen Layouts sie stattdessen aussehen.'),
      para('In Switch Wars and in the switch trainer this decides whether a key counts: a key typed with the layout that is not due is refused. What cannot be seen: keys both layouts type the same; a phone\'s on-screen keyboard and input methods (they send no key codes); a keyboard that maps the layout in its own firmware (the system then reports the layout it is set to, not the one you type). In all these cases the game says when to switch, shows the other layout on the helper keyboard, and trusts you. For a firmware keyboard turn the layout check off in the settings.',
        'In Switch Wars und im Wechseltraining entscheidet das, ob eine Taste zählt: eine Taste mit dem Layout, das nicht dran ist, wird abgelehnt. Nicht zu sehen ist: Tasten, die in beiden Layouts gleich sind; die Bildschirmtastatur eines Handys und Eingabemethoden (sie melden keine Tastencodes); eine Tastatur, die das Layout in ihrer Firmware umsetzt (das System meldet dann das eingestellte Layout, nicht das getippte). In all diesen Fällen sagt das Spiel, wann du wechselst, zeigt das andere Layout auf der Hilfstastatur und vertraut dir. Für eine Firmware-Tastatur schalte die Layout-Prüfung in den Einstellungen aus.'),
      h('The duels', 'Die Duelle'),
      ...MODES.map((m) => el('p', {}, el('b', {}, `${m.name()}: `), m.rules())),
      para('In every mode a wrong key counts as a typo and the cursor waits for the right one; there is nothing to delete. The server sends the words, checks every key and decides the places.',
        'In jedem Modus zählt eine falsche Taste als Tippfehler, und der Cursor wartet auf die richtige; es gibt nichts zu löschen. Der Server schickt die Wörter, prüft jede Taste und entscheidet die Plätze.'),
      h('ELO', 'ELO'),
      para('You have one rating per layout, and one for Switch Wars; everybody starts at 1000. A round counts as a game against each opponent (won, drawn or lost by place), averaged. Bots have fixed ratings from 800 to 2400. A round alone is not rated. The server keeps the ratings.',
        'Du hast eine Wertung pro Layout und eine für Switch Wars; alle beginnen bei 1000. Eine Runde zählt als Partie gegen jeden Gegner (gewonnen, unentschieden oder verloren nach Platz), gemittelt. Bots haben feste Wertungen von 800 bis 2400. Eine Runde allein wird nicht gewertet. Der Server führt die Wertungen.'));
  }

  // ------------------------------------------------------------------ settings

  private settings(): void {
    const p = this.profile;
    const check = (label: string, value: boolean, set: (v: boolean) => void, note = '') => {
      const c = el('input', { type: 'checkbox', checked: value });
      c.addEventListener('change', () => { set(c.checked); this.env.save(); this.applySettings(); });
      return el('div', {}, el('label', 'tw-check', c, label), note ? el('p', 'tw-muted', note) : null);
    };
    const ui = el('select', 'tw-select',
      el('option', { value: '', textContent: t('The browser\'s', 'Wie der Browser'), selected: p.uiLang === '' }),
      el('option', { value: 'en', textContent: 'English', selected: p.uiLang === 'en' }),
      el('option', { value: 'de', textContent: 'Deutsch', selected: p.uiLang === 'de' }));
    ui.addEventListener('change', () => { p.uiLang = ui.value as Profile['uiLang']; this.env.save(); this.applySettings(); this.settings(); });
    const words = el('select', 'tw-select',
      el('option', { value: 'en', textContent: 'English', selected: p.lang === 'en' }),
      el('option', { value: 'de', textContent: 'Deutsch', selected: p.lang === 'de' }));
    words.addEventListener('change', () => { p.lang = words.value as 'en' | 'de'; this.env.save(); });
    this.screen(t('Settings', 'Einstellungen'), () => this.home(),
      el('div', 'tw-card',
        el('label', {}, t('Language of the menus', 'Sprache der Menüs'), ui),
        el('label', {}, t('Words of the course and the duels', 'Wörter im Kurs und in den Duellen'), words),
        check(t('Show the helper keyboard', 'Hilfstastatur zeigen'), p.helper, (v) => { p.helper = v; }),
        check(t('Sound', 'Ton'), p.sound, (v) => { p.sound = v; }),
        check(t('Turn the layout check off', 'Layout-Prüfung ausschalten'), p.trustLayout, (v) => { p.trustLayout = v; },
          t('For keyboards that map the layout themselves (firmware), where the system\'s layout is not the one you type. Switch Wars and the switch trainer then trust you to switch when told.',
            'Für Tastaturen, die das Layout selbst umsetzen (Firmware), bei denen das Layout des Systems nicht das getippte ist. Switch Wars und das Wechseltraining vertrauen dir dann, dass du auf Ansage wechselst.'))),
      el('p', 'tw-muted', t('Your profile (layouts, stars, last rounds) is kept in your account on the server.', 'Dein Profil (Layouts, Sterne, letzte Runden) liegt in deinem Konto auf dem Server.')));
  }
}
