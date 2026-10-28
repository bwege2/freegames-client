// x11/xpilot.c main(): the options, then the welcome screen (or, with server names on the command
// line, the contact stage of textinterface.c), then joining the game.
import { G, resetG } from './G.ts';
import { resetAll } from './cutil.ts';
import { sys, ClientExit } from './sys.ts';
import { xpprintf } from './error.ts';
import { seedMT } from './xpmath.ts';
import { Store_default_options } from './default.ts';
import { Store_X_options, Handle_X_options } from './xdefault.ts';
import { Store_hud_options } from './painthud.ts';
import { Store_paintradar_options } from './paintradar.ts';
import { Store_xpaint_options } from './xpaint.ts';
import { Store_guimap_options } from './guimap.ts';
import { Store_guiobject_options } from './guiobjects.ts';
import { Store_talk_macro_options } from './talkmacros.ts';
import { Store_key_options } from './event.ts';
import { Store_record_options } from './record.ts';
import { Store_color_options } from './colors.ts';
import { Parse_options } from './option.ts';
import { Config_init } from './configure.ts';
import { Init_saved_scores, Print_saved_scores } from './clientrank.ts';
import { Welcome_screen } from './welcome.ts';
import { Join } from './join.ts';

const POLYGON_VERSION = 0x4f15;

/** Contact_servers() of textinterface.c with -join: the platform does the contact stage */
async function Contact_servers(servers: string[]): Promise<number> {
  const ok = await sys.contact();
  if (!ok) return 0;
  G.connectParam.server_name = servers[0] ?? '';
  G.connectParam.server_addr = servers[0] ?? '';
  G.connectParam.server_version = POLYGON_VERSION;
  return 1;
}

/** the client's main(); argv without the program name. Returns the exit status. */
export async function xpilot_main(argv: string[]): Promise<number> {
  resetAll();
  resetG();
  let retval = 1;
  try {
    xpprintf('  Copyright \xa9 1991-2005 by Bj\xf8rn Stabell, Ken Ronny Schouten, Bert Gijsbers, Dick Balaska, Kristian S\xf6derblom and others.\n'
      + '  XPilot NG 4.7.2 comes with ABSOLUTELY NO WARRANTY; for details see the\n  provided COPYING file.\n\n');
    seedMT(((sys.time() >>> 0) ^ sys.pid) >>> 0);
    Store_default_options();
    Store_X_options();
    Store_hud_options();
    Store_paintradar_options();
    Store_xpaint_options();
    Store_guimap_options();
    Store_guiobject_options();
    Store_talk_macro_options();
    Store_key_options(sys.sound);
    Store_record_options();
    Store_color_options();
    const servers = await Parse_options(argv);
    Config_init();
    Handle_X_options();
    await Init_saved_scores();
    if (G.xpArgs.list_servers) G.xpArgs.auto_connect = true;
    if (G.xpArgs.shutdown_reason !== '') G.xpArgs.auto_connect = true;
    let result;
    if (G.xpArgs.text || G.xpArgs.auto_connect || servers.length) result = await Contact_servers(servers);
    else result = await Welcome_screen();
    if (result === 1) retval = await Join();
    if (G.instruments.clientRanker) await Print_saved_scores();
  } catch (e) {
    if (e instanceof ClientExit) return e.status;
    throw e;
  }
  return retval;
}
