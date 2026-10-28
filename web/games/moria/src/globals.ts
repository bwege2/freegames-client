// Umoria's global variables (the `extern` ones of its headers), defined in one place, with the values
// C gives them at the start of the program. Scalars are fields of `globals` (an ES module cannot assign
// an imported variable); struct and array globals are objects that are changed in place, never
// replaced. The data tables (data_*.ts) and the module-private statics are in their own modules.
import {
  MAX_DUNGEON_OBJECTS, MAX_STORES, MESSAGE_HISTORY_SIZE, MON_MAX_CREATURES, MON_MAX_LEVELS, MON_TOTAL_ALLOCATIONS,
  OBJECT_IDENT_SIZE, TREASURE_MAX_LEVELS,
} from './constants.ts';
import { onReset } from './reset.ts';
import { Dungeon_t, Game_t, Monster_t, Player_t, Recall_t, Store_t } from './structs.ts';

class Globals {
  /** ui.cpp: Let inventoryExecuteCommand() know something has changed. */
  screen_has_changed = false;
  /** ui.cpp: Set with first message */
  message_ready_to_print = false;
  private _last_message_id = 0;
  /** ui.cpp: Index of last message held in saved messages array (int16_t) */
  get last_message_id(): number { return this._last_message_id; }
  set last_message_id(v: number) { this._last_message_id = (v << 16) >> 16; }
  /** ui_io.cpp: Is used to signal EOF/HANGUP condition (int) */
  eof_flag = 0;
  /** ui_io.cpp: True if playing from a panic save */
  panic_save = false;
  /** monster.cpp (int) */
  hack_monptr = -1;
  private _next_free_monster_id = 0;
  /** monster_manager.cpp: ID for the next available monster ptr (int16_t) */
  get next_free_monster_id(): number { return this._next_free_monster_id; }
  set next_free_monster_id(v: number) { this._next_free_monster_id = (v << 16) >> 16; }
  private _monster_multiply_total = 0;
  /** monster_manager.cpp: Total number of reproduction's of creatures (int16_t) */
  get monster_multiply_total(): number { return this._monster_multiply_total; }
  set monster_multiply_total(v: number) { this._monster_multiply_total = (v << 16) >> 16; }
  private _missiles_counter = 0;
  /** treasure.cpp (int16_t) */
  get missiles_counter(): number { return this._missiles_counter; }
  set missiles_counter(v: number) { this._missiles_counter = (v << 16) >> 16; }
}

/** The scalar globals: globals.eof_flag, globals.message_ready_to_print, ... */
export const globals = new Globals();

/** player.cpp: Player_t py */
export const py = new Player_t();
/** dungeon.cpp: Dungeon_t dg = Dungeon_t{0, 0, {}, -1, 0, true, {}} */
export const dg = new Dungeon_t();
/** game.cpp: Game_t game */
export const game = new Game_t();

/** monster_manager.cpp */
export const monsters: readonly Monster_t[] = Array.from({ length: MON_TOTAL_ALLOCATIONS }, () => new Monster_t());
/** monster_manager.cpp: Monster_t blank_monster = {0, 0, 0, 0, Coord_t{0, 0}, 0, false, 0, 0} */
export const blank_monster = new Monster_t();
/** monster_manager.cpp: int16_t monster_levels[MON_MAX_LEVELS + 1] */
export const monster_levels = new Int16Array(MON_MAX_LEVELS + 1);

/** game_objects.cpp */
export const sorted_objects = new Int16Array(MAX_DUNGEON_OBJECTS);
/** game_objects.cpp */
export const treasure_levels = new Int16Array(TREASURE_MAX_LEVELS + 1);

/** identification.cpp */
export const objects_identified = new Uint8Array(OBJECT_IDENT_SIZE);

/** store_inventory.cpp */
export const stores: readonly Store_t[] = Array.from({ length: MAX_STORES }, () => new Store_t());

/** recall.cpp: Monster memories. -CJS- */
export const creature_recall: readonly Recall_t[] = Array.from({ length: MON_MAX_CREATURES }, () => new Recall_t());

/** ui.cpp: Saved message history -CJS- (vtype_t messages[MESSAGE_HISTORY_SIZE]) */
export const messages: string[] = new Array<string>(MESSAGE_HISTORY_SIZE).fill('');

function reset(): void {
  globals.screen_has_changed = false;
  globals.message_ready_to_print = false;
  globals.last_message_id = 0;
  globals.eof_flag = 0;
  globals.panic_save = false;
  globals.hack_monptr = -1;
  globals.next_free_monster_id = 0;
  globals.monster_multiply_total = 0;
  globals.missiles_counter = 0;
  py.assign(new Player_t());
  dg.assign(new Dungeon_t());
  dg.game_turn = -1;
  dg.generate_new_level = true;
  game.assign(new Game_t());
  const blank = new Monster_t();
  for (const m of monsters) m.assign(blank);
  blank_monster.assign(blank);
  monster_levels.fill(0);
  sorted_objects.fill(0);
  treasure_levels.fill(0);
  objects_identified.fill(0);
  const store = new Store_t();
  for (const s of stores) s.assign(store);
  const recall = new Recall_t();
  for (const r of creature_recall) r.assign(recall);
  messages.fill('');
}

reset();
onReset(reset);
