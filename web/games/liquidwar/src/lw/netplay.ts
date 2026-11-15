// lw/netplay.ts: src/netplay.c's netplay_sequence and src/netgame.c's network_game, on the website's rooms:
// the server address, port and password, the connection and the waiting room are the website's lobby
// (`enter`); after it, the messages, the exchange with the server and the errors are the original's
// (connect_on_server_continue, connect_on_server_finish), then the battle (play_sequence_ex) with the
// keys exchanged through the server (page/netplay.ts).

import { lw_config_set_current_rules_to_default } from './config.ts';
import { display_center_message } from './dialog.ts';
import { error_bad_config_range, error_cant_receive_map, error_network_problem, error_server_full } from './error.ts';
import { gameHooks } from './game.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { lw_network_attribute_colors, lw_network_attribute_parts } from './network.ts';
import { play_sequence_ex, playHooks } from './play.ts';
import { G } from './state.ts';
import { applySetup, type Clock, NetPlay, type NetRooms } from '../page/netplay.ts';

/** the running network game's client, for the page's status line */
export const netplayState = { current: null as NetPlay | null };

/**
 * netplay_sequence: `enter` puts this client into a started round (the lobby; false when the player
 * cancelled), then the teams, rules and map go to the server and the battle runs.
 */
export async function netplay_sequence(enter: () => Promise<boolean>, rooms: NetRooms, clock?: Clock): Promise<number> {
  let result = 0;
  lw_config_set_current_rules_to_default();
  if (!(await enter())) return result;
  const np = new NetPlay(rooms, clock);
  netplayState.current = np;
  gameHooks.keyexch = (checksum) => np.keyexch(checksum);
  playHooks.closeNetwork = () => np.close();
  try {
    await display_center_message(lw_lang_string(L.NETPLAY_RESERVETEAMS));
    await display_center_message(lw_lang_string(L.NETPLAY_SENDCONFIG));
    await display_center_message(lw_lang_string(L.NETPLAY_SENDMAP));
    np.join();
    await display_center_message(lw_lang_string(L.NETPLAY_WAITING));
    const setup = await np.setup();
    if (!setup) {
      await error_network_problem();
    } else if (setup.full) {
      // the original asks for the free teams before it reserves any (lw_protocol_ask_free_teams)
      await error_server_full();
    } else {
      await display_center_message(lw_lang_string(L.NETPLAY_WHOPLAYS));
      await display_center_message(lw_lang_string(L.NETPLAY_RECVCONFIG));
      await display_center_message(lw_lang_string(L.NETPLAY_RECVMAP));
      const bad = applySetup(setup);
      if (bad === 'config') await error_bad_config_range();
      else if (bad === 'map') await error_cant_receive_map();
      else {
        await display_center_message(lw_lang_string(L.NETPLAY_WAITING));
        G.LW_NETWORK_ON = 1;
        lw_network_attribute_colors();
        lw_network_attribute_parts();
        result = await play_sequence_ex();
      }
    }
  } finally {
    np.close();
    gameHooks.keyexch = null;
    playHooks.closeNetwork = null;
  }
  return result;
}

/** netgame.c network_game: "Net game" in the main menu; its dialog (address, port, password, search) is the lobby */
export async function network_game(enter: () => Promise<boolean>, rooms: NetRooms, clock?: Clock): Promise<number> {
  G.LW_NETWORK_ON = 1;
  let retour = await netplay_sequence(enter, rooms, clock);
  if (retour > 0) retour--;
  return retour;
}
