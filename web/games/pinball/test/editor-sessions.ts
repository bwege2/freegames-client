// The construction set sessions of the editor golden test: what a player does with the joystick,
// in the original's screen coordinates (the parts box and the tools as EDIT.S places them: BOXLO,
// TOOLB's icons, MCMDB's buttons, WIRE.S's and DISK.S's rectangles).
import type { Session } from './editor.ts';
import type { Act } from './robot.ts';

const drag = (from: [number, number], to: [number, number]): Act[] => [{ to: from }, { press: 0 }, { to }, { release: 0 }];
const click = (at: [number, number]): Act[] => [{ to: at }, { press: 0 }, { polls: 30 }, { release: 0 }];
/** a tool of EDIT.S's column (x 252..279): HAND, POINTER, SCISSOR, HAMMER, BRUSH, colours, ... */
const TOOL = { hand: 7, pointer: 19, scissors: 31, hammer: 45, brush: 57, white: 68, green: 78, red: 88, violet: 98, blue: 108, play: 120, magnifier: 135, world: 149, wire: 163, disk: 177 };
const tool = (t: keyof typeof TOOL) => click([262, TOOL[t]]);
const type = (s: string): Act[] => [...s].map((c) => ({ key: c }));

export const SESSIONS: Session[] = [
  {
    // the hand: parts out of the box onto the table, moved, one dragged off (deleted)
    name: 'parts',
    acts: [
      ...drag([174, 54], [60, 80]),
      ...drag([210, 9], [45, 160]),
      ...drag([230, 9], [90, 160]),
      ...drag([247, 7], [70, 30]),
      ...drag([215, 78], [30, 120]),
      ...drag([52, 80], [100, 60]),
      ...drag([27, 120], [200, 140]),
      ...drag([233, 102], [120, 100]),
      ...drag([195, 161], [40, 60]),
      ...drag([197, 101], [80, 120]),
      { waits: 10 },
    ],
  },
  {
    // the arrow drags corners, the scissors cut one, the hammer adds one
    name: 'corners',
    acts: [
      ...drag([173, 34], [100, 120]),
      ...tool('pointer'),
      ...drag([143, 20], [137, 27]),
      ...drag([100, 113], [110, 105]),
      ...tool('scissors'),
      ...click([85, 128]),
      ...click([22, 80]),
      ...tool('hammer'),
      ...drag([7, 130], [14, 130]),
      ...drag([100, 121], [96, 130]),
      ...tool('hand'),
      { waits: 10 },
    ],
  },
  {
    // the brush in green, red and blue: a polygon, the outline, a polygon back to black
    name: 'paint',
    acts: [
      ...drag([173, 34], [100, 120]),
      ...drag([173, 34], [50, 60]),
      ...tool('green'),
      ...tool('brush'),
      ...click([92, 120]),
      ...tool('red'),
      ...click([92, 120]),
      ...click([92, 120]),
      ...click([60, 100]),
      ...tool('blue'),
      ...click([42, 60]),
      ...tool('violet'),
      ...click([42, 60]),
      ...tool('white'),
      ...click([60, 100]),
      ...tool('hand'),
      { waits: 10 },
    ],
  },
  {
    // the world: the four sliders, Quit
    name: 'world',
    acts: [
      ...tool('world'),
      ...drag([186, 20], [186, 40]),
      ...click([244, 16]),
      ...drag([186, 100], [186, 84]),
      ...drag([244, 90], [244, 104]),
      ...click([195, 180]),
      { waits: 10 },
    ],
  },
  {
    // the magnifier: pixels in colour and black and white, the grid, the sliders, the viewer, Quit
    name: 'magnifier',
    acts: [
      ...tool('magnifier'),
      ...click([180, 80]),
      ...drag([190, 90], [230, 90]),
      ...click([228, 180]),
      ...drag([200, 120], [200, 150]),
      ...click([200, 120]),
      ...click([158, 180]),
      ...drag([180, 100], [240, 110]),
      ...click([172, 180]),
      { to: [157, 100] }, { press: 0 }, { waits: 20 }, { release: 0 },
      { to: [276, 100] }, { press: 0 }, { waits: 30 }, { release: 0 },
      { to: [200, 66] }, { press: 0 }, { waits: 10 }, { release: 0 },
      { to: [200, 172] }, { press: 0 }, { waits: 30 }, { release: 0 },
      ...drag([40, 40], [80, 100]),
      ...click([195, 180]),
      { waits: 10 },
    ],
  },
  {
    // the test play: a bumper and a ball, Play, a while, Esc
    name: 'play',
    acts: [
      ...drag([174, 54], [70, 100]),
      ...drag([247, 7], [62, 30]),
      ...tool('play'),
      { waits: 400 },
      { key: 0x9b },
      { waits: 20 },
    ],
  },
  {
    // the wiring kit: a part's score and note, a gate's bonus, multiplier and note, wires, a cut, Quit
    name: 'wiring',
    acts: [
      ...drag([174, 54], [60, 80]),
      ...drag([195, 161], [30, 40]),
      ...drag([171, 162], [100, 140]),
      ...tool('wire'),
      ...click([52, 80]),
      ...click([220, 36]),
      ...click([175, 125]),
      ...click([170, 5]),
      ...click([215, 172]),
      ...click([220, 56]),
      ...click([175, 150]),
      ...click([262, 44]),
      ...click([52, 80]),
      ...click([27, 40]),
      ...click([96, 140]),
      ...click([262, 25]),
      ...click([52, 80]),
      ...click([262, 7]),
      ...click([170, 20]),
      ...click([262, 58]),
      { waits: 10 },
    ],
  },
  {
    // the disk menu: Save, Load (a name typed, a mistake taken back), a missing file, Make Game, Play
    // Game, Quit
    name: 'disk',
    acts: [
      ...drag([174, 54], [70, 100]),
      ...drag([247, 7], [62, 30]),
      ...tool('disk'),
      ...click([170, 90]),
      ...type('TABLX'), { key: 0x88 }, ...type('E 1'), { key: 0x8d },
      { waits: 10 },
      ...click([170, 80]),
      ...type('TABLE 1'), { key: 0x8d },
      { waits: 10 },
      ...click([170, 80]),
      ...type('NONE'), { key: 0x8d },
      { polls: 50 }, { key: 0xa0 },
      { waits: 10 },
      // Make Game: the game file written, then back to the construction set (RELOAD)
      ...click([170, 120]),
      ...type('GAME'), { key: 0x8d },
      { waits: 30 },
      ...tool('disk'),
      ...click([170, 155]),
      { polls: 40 }, { press: 0 }, { polls: 60 }, { release: 0 },
      { waits: 600 },
      { key: 0x9b },
      { waits: 20 },
      ...tool('disk'),
      ...click([170, 100]),
      { waits: 10 },
    ],
  },
];
