// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The practice area, without the server: a lesson of a layout's course, and the switch trainer (two
// layouts in turn). Both use the rule of the duels: a wrong key counts as a typo and the cursor waits.
import { FINGER_NAMES_DE, FINGER_NAMES_EN, fingerOf, layoutById, strokeFor, whichOf, type Key, type Layout } from './layouts.ts';
import { lessonResult, linesOf, type Lesson } from './lessons.ts';
import { recordLesson, recordSwitch } from './profile.ts';
import { TextPad, TypeScreen, wpmOf, type Env } from './screen.ts';
import { button, el, fmtPercent, t, uiLang } from './ui.ts';
import { someWords, wordsOf } from './words.ts';

const fingerName = (code: string): string => (uiLang() === 'de' ? FINGER_NAMES_DE : FINGER_NAMES_EN)[fingerOf(code)];

/** the characters missed most, for the result card */
function worst(misses: Map<string, number>): string {
  return [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) => `${c === ' ' ? '␣' : c} ×${n}`).join('   ');
}

export type LessonEnd = 'back' | 'again' | 'next';

/** Runs one lesson; resolves with what the player wants next. */
export function runLesson(env: Env, layout: Layout, lesson: Lesson, title: string, hasNext: boolean): Promise<LessonEnd> {
  return new Promise((resolve) => {
    const text = linesOf(lesson, env.profile.lang).filter(Boolean).join(' ');
    const scr = new TypeScreen(env, title, layout, () => end('back'));
    const pad = new TextPad(text, [], 4);
    const hint = el('p', 'tw-hint');
    const fresh = lesson.fresh.length
      ? el('p', 'tw-fresh', t('New keys: ', 'Neue Tasten: '), ...lesson.fresh.map((c) => el('kbd', {}, c)))
      : el('p', 'tw-fresh', lesson.kind === 'review' ? t('Review: everything so far', 'Wiederholung: alles bisher') : t('Words', 'Wörter'));
    scr.body.append(fresh, pad.root, hint);
    let pos = 0, errors = 0, startedAt = 0, done = false;
    const misses = new Map<string, number>();

    const end = (what: LessonEnd) => {
      scr.close();
      resolve(what);
    };
    const show = () => {
      const ms = startedAt ? performance.now() - startedAt : 0;
      scr.setStats([
        [t('wpm', 'WpM'), String(Math.round(wpmOf(pos, ms)))],
        [t('accuracy', 'Genauigkeit'), pos + errors ? fmtPercent(pos / (pos + errors)) : '–'],
        [t('done', 'geschafft'), fmtPercent(pos / text.length)],
      ]);
      const c = text[pos];
      scr.kb.hint(c ?? null);
      const s = c === undefined ? null : strokeFor(layout, c);
      hint.textContent = !s ? '' : s.code === 'Space' ? t('Space: a thumb', 'Leertaste: ein Daumen')
        : `${c}: ${fingerName(s.code)}${s.hold.length ? t(`, holding ${layout.levels[s.level]}`, `, mit ${layout.levels[s.level]}`) : ''}`;
    };
    const finish = () => {
      done = true;
      const ms = performance.now() - startedAt;
      const { wpm, accuracy, stars } = lessonResult(pos, errors, ms);
      recordLesson(env.profile, layout.id, lesson.index, stars, wpm, accuracy);
      env.save();
      env.sounds.win();
      scr.kb.hint(null);
      const card = el('div', 'tw-card tw-result',
        el('div', 'tw-stars', '★'.repeat(stars), el('span', 'tw-stars-off', '★'.repeat(5 - stars))),
        el('div', 'tw-result-grid',
          el('div', {}, el('b', {}, String(Math.round(wpm))), t('words a minute', 'Wörter pro Minute')),
          el('div', {}, el('b', {}, fmtPercent(accuracy)), t('accuracy', 'Genauigkeit')),
          el('div', {}, el('b', {}, `${Math.round(ms / 1000)} s`), t('time', 'Zeit'))),
        misses.size ? el('p', 'tw-muted', t('Missed most: ', 'Am häufigsten verfehlt: '), worst(misses)) : el('p', 'tw-muted', t('Not one typo.', 'Kein einziger Tippfehler.')),
        el('p', 'tw-muted', stars < 5 ? t('Five stars: 98 % accuracy at 20 words a minute or more.', 'Fünf Sterne: 98 % Genauigkeit bei mindestens 20 Wörtern pro Minute.') : ''),
        el('div', 'tw-row',
          hasNext ? button(t('Next lesson', 'Nächste Lektion'), () => end('next')) : null,
          button(t('Again', 'Nochmal'), () => end('again'), hasNext ? 'tw-quiet' : ''),
          button(t('Course', 'Kurs'), () => end('back'), 'tw-quiet')));
      scr.body.replaceChildren(card);
    };
    scr.input.onKey = (k: Key) => {
      if (done) return;
      scr.note.add(k);
      if (!startedAt) startedAt = performance.now();
      const want = text[pos];
      if (k.char === want) {
        pos++;
        if (k.code) scr.kb.flash(k.code, 'ok');
        pad.setPos(pos);
        if (want === ' ') env.sounds.word();
        if (pos === text.length) return finish();
      } else {
        errors++;
        misses.set(want, (misses.get(want) ?? 0) + 1);
        if (k.code) scr.kb.flash(k.code, 'bad');
        pad.miss();
        env.sounds.typo();
      }
      show();
    };
    scr.input.onSpecial = (name) => {
      if (name === 'Escape') end('back');
      else if (name === 'Enter' && done) end(hasNext ? 'next' : 'again');
    };
    show();
  });
}

/**
 * The switch trainer: a text in segments, typed with two layouts in turn. At every boundary the game
 * says "switch now" and the helper keyboard shows the other layout.
 *
 * What it can see: every key that comes with its key code and that the two layouts type differently
 * tells which one is active. A key typed with the layout that is not due is refused ("wrong layout")
 * and does not count as a typo. A key both layouts type the same says nothing and is accepted.
 * What it cannot see: without key codes (a phone's keyboard), with a keyboard that maps the layout
 * itself, or with the check turned off in the settings, the player is trusted to switch when told.
 */
export function runSwitchTrainer(env: Env): Promise<void> {
  return new Promise((resolve) => {
    const a = layoutById(env.profile.layout)!, b = layoutById(env.profile.layout2)!;
    const both = [a, b];
    // words both layouts can type
    const list = wordsOf(env.profile.lang).filter((w) => [...w].every((c) => a.where.has(c) && b.where.has(c)));
    const words = someWords(list, 36);
    const segments: number[] = [];
    let text = '';
    let until = 3 + Math.floor(Math.random() * 3);
    words.forEach((w, i) => {
      if (i === until) {
        segments.push(text.length + 1);
        until += 3 + Math.floor(Math.random() * 4);
      }
      text += (i ? ' ' : '') + w;
    });
    const segmentOf = (p: number) => segments.filter((s) => p >= s).length;

    const scr = new TypeScreen(env, t('Switch trainer', 'Wechseltraining'), a, () => end());
    const pad = new TextPad(text, segments, 4);
    const banner = el('div', 'tw-banner');
    const seen = el('p', 'tw-hint');
    scr.body.append(banner, pad.root, seen);
    let pos = 0, errors = 0, wrongLayout = 0, startedAt = 0, done = false;
    let seg = 0;
    /** when the current segment's switch was ordered (0: none pending) */
    let orderedAt = 0;
    const times: number[] = [];
    let trusted = 0, checked = 0;

    const end = () => {
      scr.close();
      resolve();
    };
    const show = () => {
      const l = both[seg % 2];
      scr.setLayout(l);
      banner.className = `tw-banner tw-seg${seg % 2}${orderedAt ? ' tw-banner-now' : ''}`;
      banner.textContent = orderedAt
        ? t(`Switch to ${l.name} now!`, `Jetzt auf ${l.name} umschalten!`)
        : t(`Type with ${l.name}`, `Tippe mit ${l.name}`);
      const ms = startedAt ? performance.now() - startedAt : 0;
      scr.setStats([
        [t('wpm', 'WpM'), String(Math.round(wpmOf(pos, ms)))],
        [t('typos', 'Fehler'), String(errors)],
        [t('wrong layout', 'falsches Layout'), String(wrongLayout)],
        [t('switches', 'Wechsel'), `${times.length}/${segments.length}`],
      ]);
      scr.kb.hint(text[pos] ?? null);
    };
    const finish = () => {
      done = true;
      env.save();
      env.sounds.win();
      const ms = performance.now() - startedAt;
      const mean = times.length ? times.reduce((x, y) => x + y, 0) / times.length : 0;
      scr.kb.hint(null);
      scr.body.replaceChildren(el('div', 'tw-card tw-result',
        el('h3', {}, `${a.name} ⇄ ${b.name}`),
        el('div', 'tw-result-grid',
          el('div', {}, el('b', {}, times.length ? `${(mean / 1000).toFixed(1)} s` : '–'), t('mean switching time', 'mittlere Wechselzeit')),
          el('div', {}, el('b', {}, times.length ? `${(Math.min(...times) / 1000).toFixed(1)} s` : '–'), t('fastest switch', 'schnellster Wechsel')),
          el('div', {}, el('b', {}, String(Math.round(wpmOf(pos, ms)))), t('words a minute', 'Wörter pro Minute')),
          el('div', {}, el('b', {}, fmtPercent(pos / (pos + errors))), t('accuracy', 'Genauigkeit')),
          el('div', {}, el('b', {}, String(wrongLayout)), t('keys with the wrong layout', 'Tasten mit dem falschen Layout'))),
        el('p', 'tw-muted', checked
          ? t(`${checked} of your keys showed which layout was active; ${trusted} said nothing (both layouts type them the same, or they came without a key code).`,
            `${checked} deiner Tasten haben gezeigt, welches Layout aktiv war; ${trusted} sagten nichts (in beiden Layouts gleich, oder ohne Tastencode).`)
          : t('None of your keys showed which layout was active (no key codes, or the check is off): the game trusted you to switch when told.',
            'Keine deiner Tasten hat gezeigt, welches Layout aktiv war (keine Tastencodes, oder Prüfung aus): das Spiel hat dir vertraut, dass du auf Ansage umschaltest.')),
        el('div', 'tw-row', button(t('Again', 'Nochmal'), () => { scr.close(); void runSwitchTrainer(env).then(resolve); }), button(t('Back', 'Zurück'), end, 'tw-quiet'))));
    };
    scr.input.onKey = (k: Key) => {
      if (done) return;
      if (!startedAt) startedAt = performance.now();
      const due = both[seg % 2], other = both[(seg + 1) % 2];
      const w = env.profile.trustLayout ? 'unknown' : whichOf(due, other, k);
      // 'a' = the layout that is due
      if (w === 'a') checked++; else if (w === 'both' || w === 'unknown') trusted++;
      seen.textContent = w === 'a' ? t(`✓ that key was ${due.name}`, `✓ diese Taste war ${due.name}`)
        : w === 'b' ? t(`✗ that key was ${other.name}: switch your keyboard to ${due.name}`, `✗ diese Taste war ${other.name}: stelle deine Tastatur auf ${due.name}`)
          : w === 'neither' ? t('✗ that key fits neither layout: is a third one active?', '✗ diese Taste passt zu keinem der beiden Layouts: ist ein drittes aktiv?')
            : w === 'both' ? t('that key is the same in both layouts', 'diese Taste ist in beiden Layouts gleich')
              : env.profile.trustLayout ? t('layout check off: you are trusted to switch', 'Layout-Prüfung aus: dir wird vertraut')
                : t('no key code: you are trusted to switch', 'kein Tastencode: dir wird vertraut');
      if (w === 'b' || w === 'neither') {
        wrongLayout++;
        if (k.code) scr.kb.flash(k.code, 'bad');
        env.sounds.typo();
        show();
        return;
      }
      if (k.char === text[pos]) {
        if (orderedAt) {
          const ms = performance.now() - orderedAt;
          times.push(ms);
          recordSwitch(env.profile, other.id, due.id, ms);
          orderedAt = 0;
        }
        pos++;
        pad.setPos(pos);
        if (pos === text.length) return finish();
        const s = segmentOf(pos);
        if (s !== seg) {
          seg = s;
          orderedAt = performance.now();
          env.sounds.switchNow();
        }
      } else {
        errors++;
        pad.miss();
        env.sounds.typo();
      }
      show();
    };
    scr.input.onSpecial = (name) => { if (name === 'Escape') end(); };
    show();
  });
}
