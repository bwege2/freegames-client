import { get_login } from './view.ts';
// netcfg.h: the network configuration. The original's dialog (net_configuration::input, server name,
// port) is replaced by the website's lobby (online.ts); what the rest of the game reads of it is here.
export class net_configuration {
  static readonly SINGLE_PLAYER = 0;
  static readonly SERVER = 1;
  static readonly CLIENT = 2;
  static readonly RESTART_SERVER = 3;
  static readonly RESTART_CLIENT = 4;
  static readonly RESTART_SINGLE = 5;
  state = net_configuration.SINGLE_PLAYER;
  name = get_login();
  server_name = 'My Netgame';
  min_players = 2;
  max_players = 8;
  kills = 25;

  restart_state(): number {
    const s = this.state;
    return s === net_configuration.RESTART_SERVER || s === net_configuration.RESTART_CLIENT ||
      s === net_configuration.RESTART_SINGLE ? 1 : 0;
  }
}

/** prot: a network protocol is there (net_init found one); the port's is the website's rooms */
export const NETP = { prot: false };

export let main_net_cfg: net_configuration | null = null;
export function set_main_net_cfg(c: net_configuration | null): void { main_net_cfg = c; }
/** state is SERVER or CLIENT */
export function net_game(): boolean {
  return main_net_cfg !== null && (main_net_cfg.state === net_configuration.SERVER || main_net_cfg.state === net_configuration.CLIENT);
}
