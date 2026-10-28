// sdlport/setup.cpp: the save directory (~/.abuse/, here the player's storage /save/), the abuserc
// file (key bindings, data directory) and the command line
import { keys } from './event.ts';
import { key_value } from '../imlib/keys.ts';
import { set_filename_prefix, set_save_filename_prefix, get_save_filename_prefix, latin1 } from '../imlib/specs.ts';
import { DATA_PREFIX, SAVE_PREFIX, normalize, vfsGet, vfsPut, vfsSaved } from '../rt/vfs.ts';
import { S } from './sound.ts';
import { G } from '../globals.ts';
import { stdout_printf } from '../imlib/dprint.ts';

function createRCFile(rcfile: string): void {
  const text = '; Abuse-SDL Configuration file\n\n' +
    '; Startup fullscreen\nfullscreen=0\n\n' +
    '; Use DoubleBuffering\ndoublebuf=0\n\n' +
    '; Use OpenGL\ngl=0\n\n' +
    `; Location of the datafiles\ndatadir=${DATA_PREFIX}\n\n` +
    '; Use mono audio only\nmono=0\n\n' +
    '; Grab the mouse to the window\ngrabmouse=0\n\n' +
    '; Set the scale factor\nscale=2\n\n' +
    '; Use anti-aliasing (with gl=1 only)\nantialias=1\n\n' +
    '; Disable the SDL parachute in the case of a crash\nnosdlparachute=0\n\n' +
    '; Key mappings\n' +
    'left=LEFT\nright=RIGHT\nup=UP\ndown=DOWN\n' +
    'fire=SPACE\nweapprev=CTRL_R\nweapnext=INSERT\n';
  const path = normalize(rcfile);
  vfsPut(path, Uint8Array.from(text, (c) => c.charCodeAt(0)));
  vfsSaved(path);
}

function readRCFile(): void {
  const rcfile = `${get_save_filename_prefix()}/abuserc`;
  const d = vfsGet(normalize(rcfile));
  if (!d) {
    createRCFile(rcfile);
    return;
  }
  const lines = latin1(d).split(/(?<=\n)/);
  for (const line of lines) {
    // fgets with a 255-byte buffer: longer lines come in pieces; abuserc's lines are short
    const eq = line.indexOf('=');
    const result = (eq >= 0 ? line.slice(0, eq) : line).toLowerCase();
    const rest = eq >= 0 ? line.slice(eq + 1).replace(/\n.*$/s, '') : '';
    switch (result) {
      case 'mono': S.mono = (parseInt(rest, 10) | 0) !== 0; break;
      case 'datadir': set_filename_prefix(rest); break;
      case 'left': keys.left = key_value(rest); break;
      case 'right': keys.right = key_value(rest); break;
      case 'up': keys.up = key_value(rest); break;
      case 'down': keys.down = key_value(rest); break;
      case 'fire': keys.b2 = key_value(rest); break;
      case 'special': keys.b1 = key_value(rest); break;
      case 'weapprev': keys.b3 = key_value(rest); break;
      case 'weapnext': keys.b4 = key_value(rest); break;
      // fullscreen, doublebuf, grabmouse, scale, gl, antialias, nosdlparachute: the window is the page's
    }
  }
}

function parseCommandLine(argv: string[]): void {
  for (let ii = 1; ii < argv.length; ii++) {
    const a = argv[ii].toLowerCase();
    if (a === '-nosound') S.nosound = true;
    else if (a === '-mono') S.mono = true;
    else if (a === '-datadir') {
      if (ii + 1 < argv.length) set_filename_prefix(argv[++ii]);
    } else if (a === '-scale' || a === '-size') {
      // the window is the page's; -size is refused later (dev_init) as by the original without -edit
      ii++;
      if (a === '-size') ii++;
    }
  }
}

export function setup(argv: string[]): void {
  G.xres = 320;
  G.yres = 200;
  keys.up = key_value('UP');
  keys.down = key_value('DOWN');
  keys.left = key_value('LEFT');
  keys.right = key_value('RIGHT');
  keys.b3 = key_value('CTRL_R');
  keys.b4 = key_value('INSERT');
  stdout_printf('Abuse 0.8\n');
  set_save_filename_prefix(SAVE_PREFIX);
  set_filename_prefix(DATA_PREFIX);
  readRCFile();
  parseCommandLine(argv);
}
