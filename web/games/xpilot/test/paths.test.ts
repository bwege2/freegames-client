// What the scenarios do not reach, driven on duel's recorded stream with more input (no golden: the
// run must not fail, and the windows and texts must appear): the about window's pages with the item
// list, the key reference viewer, the COLORS menu, typing and editing in the talk window, the MOTD
// request. XPILOT_DEEP=1 rasterizes it too.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runClient } from './harness.ts';

const DEEP = process.env.XPILOT_DEEP === '1';

test('xpilot client: about pages, key viewer, colors menu, talk editing, motd request', async () => {
  const ev: { tick: number; what: string; arg1?: string; arg2?: string }[] = [];
  const click = (t: number, x: number, y: number) => {
    ev.push({ tick: t, what: 'move', arg1: String(x), arg2: String(y) });
    ev.push({ tick: t + 1, what: 'button', arg1: 'press', arg2: '1' });
    ev.push({ tick: t + 2, what: 'button', arg1: 'release', arg2: '1' });
  };
  const menu = (t: number, y: number) => {
    ev.push({ tick: t, what: 'move', arg1: '210', arg2: '266' });
    ev.push({ tick: t + 1, what: 'button', arg1: 'press', arg2: '1' });
    ev.push({ tick: t + 3, what: 'move', arg1: '210', arg2: String(y) });
    ev.push({ tick: t + 5, what: 'button', arg1: 'release', arg2: '1' });
  };
  const key = (t: number, k: string) => {
    ev.push({ tick: t, what: 'key', arg1: 'press', arg2: k });
    ev.push({ tick: t, what: 'key', arg1: 'release', arg2: k });
  };
  click(600, 126, 266);                                     // ABOUT
  for (let i = 0; i < 4; i++) click(610 + 10 * i, 431, 542); // NEXT, to the item pages
  click(660, 159, 542);                                     // PREV
  click(670, -113, 542);                                    // CLOSE
  menu(700, 288);                                           // MENU > KEYS
  click(725, 655, 780);                                     // the viewer's CLOSE
  menu(740, 332);                                           // MENU > COLORS
  key(780, 'm');                                            // talk: "hello world", 2 x Left, BackSpace, x
  for (const k of ['h', 'e', 'l', 'l', 'o', 'space', 'w', 'o', 'r', 'l', 'd']) key(781, k);
  key(783, 'Left');
  key(783, 'Left');
  key(784, 'BackSpace');
  key(785, 'x');
  key(792, 'Escape');
  menu(800, 398);                                           // MENU > MOTD
  const all: string[] = [];
  const run = await runClient('duel', 'Alice', { extraEvents: ev, render: DEEP, keep: () => true, lastTick: 900,
    onSection: (s) => {
      for (const l of s.lines ?? []) if (l.startsWith('XDrawString')) all.push(l);
    } });
  const text = all.join('');
  if (process.env.XPILOT_PRINT) (await import('node:fs')).writeFileSync(process.env.XPILOT_PRINT, text);
  assert.equal(run.lastTick, 900);
  assert.match(text, /"BONUS"/, 'the item pages');
  assert.match(text, /"energy\/fuel"/);
  assert.match(text, /Turn left \(anti-clockwise\)\."/, 'the key reference');
  assert.match(text, /"hudColor"/, 'the colors menu');
  assert.match(text, / "rld"\n.* "ld"\n/, 'BackSpace in the talk window');
  assert.match(text, / "xld"\n/, 'inserting in the talk window');
  const packets = run.sent.flatMap((m) => (m.msg.which === 'client' ? m.msg.packets.map(([name, v]) => [name, v] as const) : []));
  assert.ok(packets.some(([name]) => name === 'motd'), 'the MOTD request went out');
  const talks = packets.filter(([name]) => name === 'talk');
  assert.equal(talks.length, 0, 'Escape cancels the talk line');
});

test('xpilot client: the welcome screen lists our rooms, shows a room, makes a room', async () => {
  const created: [string, [string, string][]][] = [];
  const rooms = {
    list: async () => [
      { id: 7, name: 'Bob: tourmination', users: 2, maxUsers: 16, map: 'tourmination', players: ['Bob=web', 'Carol=web'],
        options: [['map', 'tourmination.xp2']] as [string, string][] },
      { id: 9, name: 'Eve: pacman', users: 0, maxUsers: 16, map: 'pacman', players: [], options: [] },
    ],
    maps: async () => ['tourmination.xp2', 'blood-music.xp2', 'pacman.xp2'],
    create: async (map: string, options: [string, string][]) => {
      created.push([map, options]);
      return false;
    },
    join: async () => false,
  };
  const ev: { tick: number; what: string; arg1?: string; arg2?: string }[] = [];
  const click = (t: number, x: number, y: number) => {
    ev.push({ tick: t, what: 'move', arg1: String(x), arg2: String(y) });
    ev.push({ tick: t + 1, what: 'button', arg1: 'press', arg2: '1' });
    ev.push({ tick: t + 2, what: 'button', arg1: 'release', arg2: '1' });
  };
  // set.scn clicks Internet at 100..103; then (top window coordinates) the first row's Status
  // button, Back to List, Create Room, the second map, Create Room
  click(120, 884, 59);
  click(140, 586, 63);
  click(160, 180, 752);
  click(180, 325, 101);
  click(200, 175, 221);
  const all: string[] = [];
  const run = await runClient('set', 'Dave', { rooms, extraEvents: ev, render: DEEP, keep: () => true, lastTick: 260,
    onSection: (s) => {
      for (const l of s.lines ?? []) if (l.startsWith('XDrawString')) all.push(l);
    } });
  const text = all.join('');
  if (process.env.XPILOT_PRINT) (await import('node:fs')).writeFileSync(`${process.env.XPILOT_PRINT}.rooms`, text);
  assert.equal(run.lastTick, 260);
  assert.ok(!text.includes('Could not establish'), 'the room list came');
  assert.match(text, /"Bob: tourmination"/, 'a row of the list');
  assert.match(text, /"Map Name"/);
  assert.match(text, /"Join This Server"/, 'the status page of a room');
  assert.match(text, /"Bob"/, 'its players');
  assert.match(text, /"Create a new room on this server"/, 'the room page');
  assert.match(text, /"Map: blood-music.xp2"/, 'a map picked');
  assert.deepEqual(created, [['blood-music.xp2', [['teamPlay', 'false'], ['limitedLives', 'false'], ['maxRobots', '0']]]]);
  assert.match(text, /"Could not create the room\."/);
});
