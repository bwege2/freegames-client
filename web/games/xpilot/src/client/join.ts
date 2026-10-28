// x11/join.c: joining a server (verify, setup, start play) and the client's main loop: wait for X
// input or server data (select), handle them, flush what is to be sent.
import { G } from './G.ts';
import { error, warn } from './error.ts';
import * as X from '../xlib/xlib.ts';
import { sys } from './sys.ts';
import { x_event } from './xevent.ts';
import { Net_cleanup, Net_flush, Net_init, Net_input, Net_key_change, Net_setup, Net_start, Net_verify } from './netclient.ts';
import { Client_check_pointer_move_interval, Client_cleanup, Client_init, Client_setup, Client_start } from './client.ts';
import { Record_cleanup } from './record.ts';
import { defaultCleanup } from './default.ts';
import { aboutCleanup } from './about.ts';
import { paintdataCleanup } from './paintdata.ts';

const Handle_input = (new_input: number): Promise<number> => x_event(new_input);

async function Input_loop(): Promise<void> {
  let result;
  if ((result = Net_input()) === -1) {
    error('Bad server input');
    return;
  }
  if ((await Handle_input(2)) === -1) return;
  if (Net_flush() === -1) return;
  Net_key_change();
  for (;;) {
    let timeout = 1_000_000;
    if (G.maxMouseTurnsPS > 0) timeout = Client_check_pointer_move_interval();
    const ready = await sys.select(true, true, timeout);
    if (!ready.x && !ready.net) {
      if (G.maxMouseTurnsPS > 0 && G.cumulativeMouseMovement !== 0) continue;
      if (result <= 1) {
        warn('No response from server');
        continue;
      }
    }
    if (ready.x) {
      if ((await Handle_input(1)) === -1) return;
      if (Net_flush() === -1) {
        error('Bad net flush after X input');
        return;
      }
    }
    if (ready.net || result > 1) {
      const tv1 = sys.nowUs();
      if ((result = Net_input()) === -1) {
        warn('Bad net input.  Have a nice day!');
        return;
      }
      if (result > 0) {
        if ((await Handle_input(1)) === -1) return;
        if (Net_flush() === -1) {
          error('Bad net flush before sync');
          return;
        }
        X.XSync(G.dpy, false);
        if ((await Handle_input(1)) === -1) return;
      }
      if (G.newSecond) G.clData.clientLag = 1e-3 * (sys.nowUs() - tv1);
    }
  }
}

export function xpilotShutdown(): void {
  Net_cleanup();
  Client_cleanup();
  Record_cleanup();
  defaultCleanup();
  aboutCleanup();
  paintdataCleanup();
}

export async function Join(): Promise<number> {
  const conpar = G.connectParam;
  if (Client_init(conpar.server_name, conpar.server_version) === -1) return -1;
  if (Net_init() === -1) {
    Client_cleanup();
    return -1;
  }
  if ((await Net_verify(conpar.user_name, conpar.nick_name, conpar.disp_name)) === -1) {
    Net_cleanup();
    Client_cleanup();
    return -1;
  }
  if ((await Net_setup()) === -1) {
    Net_cleanup();
    Client_cleanup();
    return -1;
  }
  if (Client_setup() === -1) {
    Net_cleanup();
    Client_cleanup();
    return -1;
  }
  if ((await Net_start()) === -1) {
    warn('Network start failed');
    Net_cleanup();
    Client_cleanup();
    return -1;
  }
  if (Client_start() === -1) {
    warn('Window init failed');
    Net_cleanup();
    Client_cleanup();
    return -1;
  }
  await Input_loop();
  xpilotShutdown();
  return 0;
}
