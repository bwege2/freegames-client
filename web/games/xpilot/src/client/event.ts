// event.c: what keys and pointer buttons do (the key bindings, the key vector the server gets,
// talking, pointer control, quit mode), and the key options (the default keys).
import { G } from './G.ts';
import {
  KEY_DUMMY, NUM_KEYS, KEY_SHIELD, KEY_FIRE_SHOT, KEY_FIRE_LASER, KEY_FIRE_MISSILE, KEY_FIRE_TORPEDO, KEY_FIRE_HEAT,
  KEY_DROP_MINE, KEY_DETACH_MINE, KEY_REFUEL, KEY_REPAIR, KEY_TANK_NEXT, KEY_TANK_PREV, KEY_SWAP_SETTINGS,
  KEY_SWAP_SCALEFACTOR, KEY_INCREASE_POWER, KEY_DECREASE_POWER, KEY_INCREASE_TURNSPEED, KEY_DECREASE_TURNSPEED, KEY_TALK,
  KEY_TOGGLE_OWNED_ITEMS, KEY_TOGGLE_MESSAGES, KEY_POINTER_CONTROL, KEY_TOGGLE_RECORD, KEY_TOGGLE_SOUND,
  KEY_TOGGLE_RADAR_SCORE, KEY_PRINT_MSGS_STDOUT, KEY_TOGGLE_FULLSCREEN, KEY_SELECT_ITEM, KEY_LOSE_ITEM, KEY_EXIT, KEY_YES,
  KEY_NO, KEY_ID_MODE, KEY_MSG_1, MAX_POINTER_BUTTONS, MAX_PLAYER_POWER, MIN_PLAYER_POWER, MAX_PLAYER_TURNSPEED,
  MIN_PLAYER_TURNSPEED, CONTROL_TIME, FUEL_NOTIFY_TIME, MSG_LEN, KEYBOARD_SIZE, KEY_TURN_LEFT, KEY_TURN_RIGHT, KEY_THRUST,
  KEY_LOCK_CLOSE, KEY_LOCK_NEXT_CLOSE, KEY_LOCK_NEXT, KEY_LOCK_PREV, KEY_CLOAK, KEY_ECM, KEY_SELF_DESTRUCT, KEY_PAUSE,
  KEY_CHANGE_HOME, KEY_CONNECTOR, KEY_DROP_BALL, KEY_TANK_DETACH, KEY_TRANSPORTER, KEY_DEFLECTOR, KEY_HYPERJUMP,
  KEY_PHASING, KEY_TOGGLE_NUCLEAR, KEY_TOGGLE_CLUSTER, KEY_TOGGLE_IMPLOSION, KEY_TOGGLE_VELOCITY, KEY_TOGGLE_MINI,
  KEY_TOGGLE_SPREAD, KEY_TOGGLE_POWER, KEY_TOGGLE_COMPASS, KEY_TOGGLE_AUTOPILOT, KEY_TOGGLE_LASER, KEY_EMERGENCY_THRUST,
  KEY_EMERGENCY_SHIELD, KEY_TRACTOR_BEAM, KEY_PRESSOR_BEAM, KEY_CLEAR_MODIFIERS, KEY_LOAD_MODIFIERS_1, KEY_LOAD_MODIFIERS_2,
  KEY_LOAD_MODIFIERS_3, KEY_LOAD_MODIFIERS_4, KEY_REPROGRAM, KEY_LOAD_LOCK_1, KEY_LOAD_LOCK_2, KEY_LOAD_LOCK_3,
  KEY_LOAD_LOCK_4, KEY_TALK_CURSOR_LEFT, KEY_TALK_CURSOR_RIGHT, KEY_TALK_CURSOR_UP, KEY_TALK_CURSOR_DOWN,
  KEY_DETONATE_MINES, XP_OPTFLAG_DEFAULT,
} from './consts.ts';
import { MAX, MIN, onReset, snprintf, strcasecmp, strncasecmp, strtokAll, atoi } from './cutil.ts';
import { Find_option, Generic_lookup_key, O, Option_value_to_string, STORE_OPTIONS, XP_KEY_OPTION, XP_STRING_OPTION, type xp_option_t } from './option.ts';
import { warn } from './error.ts';
import { Send_keyboard, Send_power, Send_turnspeed, Net_key_change } from './netclient.ts';
import { Add_alert_message, Add_newbie_message, Clear_alert_messages, Print_messages_to_stdout } from './messages.ts';
import { Platform_specific_pointer_control_set_state, Platform_specific_talk_set_state, Toggle_fullscreen, Toggle_radar_and_scorelist } from './xevent.ts';
import { Talk_macro } from './talkmacros.ts';
import { Config_redraw } from './configure.ts';
import { Set_altScaleFactor, Set_scaleFactor } from './xdefault.ts';
import { Client_exit } from './client.ts';
import { Record_toggle } from './record.ts';
import { SND } from './default.ts';

const MAX_BUTTON_DEFS = 10;

const E = {
  keyv: new Uint8Array(KEYBOARD_SIZE),
  keyv_new: new Uint8Array(NUM_KEYS),
  buttonDefs: Array.from({ length: MAX_POINTER_BUTTONS }, () => new Array<number>(MAX_BUTTON_DEFS + 1).fill(0)),
  numButtonDefs: new Array<number>(MAX_POINTER_BUTTONS).fill(0),
  pointerButtonBindings: new Array<string | null>(MAX_POINTER_BUTTONS).fill(null),
  quit_mode_exit_key: KEY_DUMMY,
};
onReset(() => Object.assign(E, {
  keyv: new Uint8Array(KEYBOARD_SIZE),
  keyv_new: new Uint8Array(NUM_KEYS),
  buttonDefs: Array.from({ length: MAX_POINTER_BUTTONS }, () => new Array<number>(MAX_BUTTON_DEFS + 1).fill(0)),
  numButtonDefs: new Array<number>(MAX_POINTER_BUTTONS).fill(0),
  pointerButtonBindings: new Array<string | null>(MAX_POINTER_BUTTONS).fill(null),
  quit_mode_exit_key: KEY_DUMMY,
}));

const BITV_SET = (k: number) => { E.keyv[k >> 3] |= 1 << (k & 7); };
const BITV_CLR = (k: number) => { E.keyv[k >> 3] &= ~(1 << (k & 7)); };
const BITV_ISSET = (k: number) => (E.keyv[k >> 3] & (1 << (k & 7))) !== 0;

export function Pointer_control_newbie_message(): void {
  if (!G.newbie) return;
  const opt = Find_option('keyExit');
  if (!opt) return;
  const val = Option_value_to_string(opt);
  if (val.length === 0) return;
  if (G.clData.pointerControl) Add_newbie_message(snprintf(MSG_LEN, 'Mouse steering enabled. Key(s) to disable it: %s.', val));
  else Add_newbie_message(snprintf(MSG_LEN, 'Mouse steering disabled. Click background with left mouse button to enable it.'));
}

export function Pointer_control_set_state(on: boolean): void {
  if (G.clData.pointerControl === on) return;
  Platform_specific_pointer_control_set_state(on);
  G.clData.pointerControl = on;
  if (!G.clData.restorePointerControl) Pointer_control_newbie_message();
}

export function Talk_set_state(on: boolean): void {
  if (G.clData.talking === on) return;
  if (on && G.clData.pointerControl) {
    G.clData.restorePointerControl = true;
    Pointer_control_set_state(false);
  }
  Platform_specific_talk_set_state(on);
  if (!on && G.clData.restorePointerControl) {
    Pointer_control_set_state(true);
    G.clData.restorePointerControl = false;
  }
  G.clData.talking = on;
}

export function Key_init(): number {
  E.keyv.fill(0);
  E.keyv_new.fill(0);
  BITV_SET(KEY_SHIELD);
  return 0;
}

export function Key_update(): number {
  return Send_keyboard(E.keyv);
}

function Key_get_count(key: number): number { return key >= NUM_KEYS ? -1 : E.keyv_new[key]; }
function Key_inc_count(key: number): boolean {
  if (key >= NUM_KEYS) return false;
  if (E.keyv_new[key] < 255) { ++E.keyv_new[key]; return true; }
  return false;
}
function Key_dec_count(key: number): boolean {
  if (key >= NUM_KEYS) return false;
  if (E.keyv_new[key] > 0) { --E.keyv_new[key]; return true; }
  return false;
}

export function Key_clear_counts(): void {
  let change = false;
  for (let i = 0; i < NUM_KEYS; i++) {
    if (E.keyv_new[i] > 0) {
      E.keyv_new[i] = 1;
      change = Key_release(i) || change;
    }
  }
  if (change) Net_key_change();
}

function Quit_mode_key_press(key: number): boolean {
  if (key === KEY_YES) Client_exit(0);
  if (key === KEY_NO || key === KEY_EXIT) {
    G.clData.quitMode = false;
    Clear_alert_messages();
    E.quit_mode_exit_key = key;
  }
  return false;
}

const FIRE_KEYS = [KEY_FIRE_SHOT, KEY_FIRE_LASER, KEY_FIRE_MISSILE, KEY_FIRE_TORPEDO, KEY_FIRE_HEAT, KEY_DROP_MINE, KEY_DETACH_MINE];

export function Key_press(key: number): boolean {
  if (G.clData.quitMode) return Quit_mode_key_press(key);
  const countchange = Key_inc_count(key);
  const keycount = Key_get_count(key);
  if (keycount !== -1 && (!countchange || keycount !== 1)) return true;
  if (key >= KEY_MSG_1 && key < KEY_MSG_1 + 20) Talk_macro(key - KEY_MSG_1);
  switch (key) {
    case KEY_ID_MODE:
      G.showUserName = !G.showUserName;
      G.scoresChanged = 1;
      return false;
    case KEY_FIRE_SHOT: case KEY_FIRE_LASER: case KEY_FIRE_MISSILE: case KEY_FIRE_TORPEDO: case KEY_FIRE_HEAT:
    case KEY_DROP_MINE: case KEY_DETACH_MINE:
      if (G.auto_shield && BITV_ISSET(KEY_SHIELD)) BITV_CLR(KEY_SHIELD);
      break;
    case KEY_SHIELD:
      if (G.toggle_shield) {
        G.shields = !G.shields;
        if (G.shields) BITV_SET(key); else BITV_CLR(key);
        return true;
      } else if (G.auto_shield) G.shields = true;
      break;
    case KEY_REFUEL: case KEY_REPAIR: case KEY_TANK_NEXT: case KEY_TANK_PREV:
      G.fuelTime = FUEL_NOTIFY_TIME;
      break;
    case KEY_SWAP_SETTINGS: {
      let tmp = G.power; G.power = G.power_s; G.power_s = tmp;
      tmp = G.turnspeed; G.turnspeed = G.turnspeed_s; G.turnspeed_s = tmp;
      tmp = G.turnresistance; G.turnresistance = G.turnresistance_s; G.turnresistance_s = tmp;
      G.controlTime = CONTROL_TIME;
      Config_redraw();
      break;
    }
    case KEY_SWAP_SCALEFACTOR: {
      const a = G.clData.altScaleFactor;
      Set_altScaleFactor(null, G.clData.scaleFactor);
      Set_scaleFactor(null, a);
      return false;
    }
    case KEY_INCREASE_POWER:
      G.power = MIN(G.power * 1.10, MAX_PLAYER_POWER);
      Send_power(G.power);
      Config_redraw();
      G.controlTime = CONTROL_TIME;
      return false;
    case KEY_DECREASE_POWER:
      G.power = MAX(G.power / 1.10, MIN_PLAYER_POWER);
      Send_power(G.power);
      Config_redraw();
      G.controlTime = CONTROL_TIME;
      return false;
    case KEY_INCREASE_TURNSPEED:
      G.turnspeed = MIN(G.turnspeed * 1.05, MAX_PLAYER_TURNSPEED);
      Send_turnspeed(G.turnspeed);
      Config_redraw();
      G.controlTime = CONTROL_TIME;
      return false;
    case KEY_DECREASE_TURNSPEED:
      G.turnspeed = MAX(G.turnspeed / 1.05, MIN_PLAYER_TURNSPEED);
      Send_turnspeed(G.turnspeed);
      Config_redraw();
      G.controlTime = CONTROL_TIME;
      return false;
    case KEY_TALK:
      if (G.clData.pointerControl) for (let i = 0; i < MAX_POINTER_BUTTONS; i++) Pointer_button_released(i);
      Talk_set_state(!G.clData.talking);
      return false;
    case KEY_TOGGLE_OWNED_ITEMS:
      G.instruments.showItems = !G.instruments.showItems;
      return false;
    case KEY_TOGGLE_MESSAGES:
      G.instruments.showMessages = !G.instruments.showMessages;
      return false;
    case KEY_POINTER_CONTROL:
      if (G.clData.pointerControl) for (let i = 0; i < MAX_POINTER_BUTTONS; i++) Pointer_button_released(i);
      Pointer_control_set_state(!G.clData.pointerControl);
      return false;
    case KEY_TOGGLE_RECORD:
      Record_toggle();
      return false;
    case KEY_TOGGLE_SOUND:
      SND.sound = !SND.sound;
      return false;
    case KEY_TOGGLE_RADAR_SCORE:
      Toggle_radar_and_scorelist();
      return false;
    case KEY_PRINT_MSGS_STDOUT:
      Print_messages_to_stdout();
      return false;
    case KEY_TOGGLE_FULLSCREEN:
      Toggle_fullscreen();
      return false;
    case KEY_SELECT_ITEM: case KEY_LOSE_ITEM:
      G.lose_item_active = G.lose_item_active === 1 ? 2 : 1;
      break;
    case KEY_EXIT:
      if (G.clData.pointerControl) {
        for (let i = 0; i < MAX_POINTER_BUTTONS; i++) Pointer_button_released(i);
        Pointer_control_set_state(false);
        return false;
      }
      G.clData.quitMode = true;
      Add_alert_message('Really Quit (y/n) ?', 0.0);
      return false;
    case KEY_YES: case KEY_NO:
      return false;
    default:
      break;
  }
  if (key < NUM_KEYS) BITV_SET(key);
  return true;
}

export function Key_release(key: number): boolean {
  if (key === E.quit_mode_exit_key) {
    E.quit_mode_exit_key = KEY_DUMMY;
    return false;
  }
  const countchange = Key_dec_count(key);
  const keycount = Key_get_count(key);
  if (keycount !== -1 && (!countchange || keycount !== 0)) return true;
  switch (key) {
    case KEY_ID_MODE: case KEY_TALK: case KEY_TOGGLE_OWNED_ITEMS: case KEY_TOGGLE_MESSAGES:
      return false;
    case KEY_FIRE_SHOT: case KEY_FIRE_LASER: case KEY_FIRE_MISSILE: case KEY_FIRE_TORPEDO: case KEY_FIRE_HEAT:
    case KEY_DROP_MINE: case KEY_DETACH_MINE:
      if (G.auto_shield && G.shields && !BITV_ISSET(KEY_SHIELD)) {
        BITV_CLR(key);
        if (!FIRE_KEYS.some(BITV_ISSET)) BITV_SET(KEY_SHIELD);
      }
      break;
    case KEY_SHIELD:
      if (G.toggle_shield) return false;
      else if (G.auto_shield) G.shields = false;
      break;
    case KEY_REFUEL: case KEY_REPAIR:
      G.fuelTime = FUEL_NOTIFY_TIME;
      break;
    case KEY_SELECT_ITEM: case KEY_LOSE_ITEM:
      if (G.lose_item_active === 2) G.lose_item_active = 1;
      else G.lose_item_active = -Math.trunc(G.clientFPS + 0.5);
      break;
    default:
      break;
  }
  if (key < NUM_KEYS) BITV_CLR(key);
  return true;
}

export function Reset_shields(): void {
  if (G.toggle_shield || G.auto_shield) {
    BITV_SET(KEY_SHIELD);
    G.shields = true;
    if (G.auto_shield && FIRE_KEYS.some(BITV_ISSET)) BITV_CLR(KEY_SHIELD);
    Net_key_change();
  }
}

export function Set_auto_shield(on: boolean): void {
  G.auto_shield = on;
}

export function Set_toggle_shield(on: boolean): void {
  G.toggle_shield = on;
  if (G.toggle_shield) G.shields = G.auto_shield ? true : BITV_ISSET(KEY_SHIELD);
}

export function Pointer_button_pressed(button: number): void {
  const b = button - 1;
  let key_change = false;
  if (button < 1 || button > MAX_POINTER_BUTTONS) return;
  for (let i = 0; i < E.numButtonDefs[b]; i++) key_change = Key_press(E.buttonDefs[b][i]) || key_change;
  if (key_change) Net_key_change();
}

export function Pointer_button_released(button: number): void {
  const b = button - 1;
  let key_change = false;
  if (button < 1 || button > MAX_POINTER_BUTTONS) return;
  for (let i = 0; i < E.numButtonDefs[b]; i++) key_change = Key_release(E.buttonDefs[b][i]) || key_change;
  if (key_change) Net_key_change();
}

export function Keyboard_button_pressed(ks: number): void {
  let change = false;
  for (let key = Generic_lookup_key(ks, true); key !== KEY_DUMMY; key = Generic_lookup_key(ks, false)) change = Key_press(key) || change;
  if (change) Net_key_change();
}

export function Keyboard_button_released(ks: number): void {
  let change = false;
  for (let key = Generic_lookup_key(ks, true); key !== KEY_DUMMY; key = Generic_lookup_key(ks, false)) change = Key_release(key) || change;
  if (change) Net_key_change();
}

function setPointerButtonBinding(opt: xp_option_t, value: string): boolean {
  const ind = atoi(opt.name.slice('pointerButton'.length)) - 1;
  E.pointerButtonBindings[ind] = value;
  E.numButtonDefs[ind] = 0;
  for (let ptr of strtokAll(value, ' \t\r\n')) {
    if (!strncasecmp(ptr, 'key', 3)) ptr = ptr.slice(3);
    let j: number;
    for (j = 0; j < O.options.length; j++) {
      const o = O.options[j];
      if (o.key !== KEY_DUMMY && !strcasecmp(ptr, o.name.slice(3))) {
        if (E.numButtonDefs[ind] === MAX_BUTTON_DEFS) warn(`Can only have ${MAX_BUTTON_DEFS} keys bound to pointerButton${ind + 1}.`);
        else E.buttonDefs[ind][E.numButtonDefs[ind]++] = o.key;
        break;
      }
    }
    if (j === O.options.length) warn(`Unknown key "${ptr}" for ${opt.name}.`);
  }
  return true;
}

function getPointerButtonBinding(opt: xp_option_t): string {
  return E.pointerButtonBindings[atoi(opt.name.slice('pointerButton'.length)) - 1] ?? '';
}

/** event.c key_options: the default keys */
export function Store_key_options(sound: boolean): void {
  const K = XP_KEY_OPTION;
  STORE_OPTIONS([
    K('keyTurnLeft', 'a', KEY_TURN_LEFT, 'Turn left (anti-clockwise).\n'),
    K('keyTurnRight', 's', KEY_TURN_RIGHT, 'Turn right (clockwise).\n'),
    K('keyThrust', 'Shift_R Shift_L', KEY_THRUST, 'Thrust.\n'),
    K('keyShield', 'space', KEY_SHIELD, 'Raise or toggle the shield.\n'),
    K('keyFireShot', 'Return Linefeed', KEY_FIRE_SHOT, 'Fire shot.\nNote that shields must be down to fire.\n'),
    K('keyFireMissile', 'backslash', KEY_FIRE_MISSILE, 'Fire smart missile.\n'),
    K('keyFireTorpedo', 'quoteright', KEY_FIRE_TORPEDO, 'Fire unguided torpedo.\n'),
    K('keyFireHeat', 'semicolon', KEY_FIRE_HEAT, 'Fire heatseeking missile.\n'),
    K('keyFireLaser', 'slash', KEY_FIRE_LASER, 'Activate laser beam.\n'),
    K('keyDropMine', 'Tab', KEY_DROP_MINE, 'Drop a stationary mine.\n'),
    K('keyDetachMine', 'bracketright', KEY_DETACH_MINE, 'Detach a moving mine.\n'),
    K('keyDetonateMines', 'equal', KEY_DETONATE_MINES, 'Detonate the closest mine you have dropped or thrown.\n'),
    K('keyLockClose', 'Up', KEY_LOCK_CLOSE, 'Lock on closest player.\n'),
    K('keyLockNextClose', 'Down', KEY_LOCK_NEXT_CLOSE, 'Lock on next closest player.\n'),
    K('keyLockNext', 'Next Right', KEY_LOCK_NEXT, 'Lock on next player.\n'),
    K('keyLockPrev', 'Prior Right', KEY_LOCK_PREV, 'Lock on previous player.\n'),
    K('keyRefuel', 'f Control_L Control_R', KEY_REFUEL, 'Refuel.\n'),
    K('keyRepair', 'f', KEY_REPAIR, 'Repair target.\n'),
    K('keyCloak', 'Delete BackSpace', KEY_CLOAK, 'Toggle cloakdevice.\n'),
    K('keyEcm', 'bracketleft', KEY_ECM, 'Use ECM.\n'),
    K('keySelfDestruct', 'End', KEY_SELF_DESTRUCT, 'Toggle self destruct.\n'),
    K('keyIdMode', 'u', KEY_ID_MODE, 'Toggle User mode (show real names).\n'),
    K('keyPause', 'Pause', KEY_PAUSE, 'Toggle pause mode.\nWhen the ship is stationary on its homebase.\n'),
    K('keySwapSettings', '', KEY_SWAP_SETTINGS, 'Swap to alternate control settings.\nThese are the power, turn speed and turn resistance settings.\n'),
    K('keySwapScaleFactor', '', KEY_SWAP_SCALEFACTOR, 'Swap scalefactor settings.\n'),
    K('keyChangeHome', 'Home h', KEY_CHANGE_HOME, 'Change home base.\nWhen the ship is close to a suitable base.\n'),
    K('keyConnector', 'f Control_L Control_R', KEY_CONNECTOR, 'Connect to a ball.\n'),
    K('keyDropBall', 'd', KEY_DROP_BALL, 'Drop a ball.\n'),
    K('keyTankNext', 'e', KEY_TANK_NEXT, 'Use the next tank.\n'),
    K('keyTankPrev', 'w', KEY_TANK_PREV, 'Use the the previous tank.\n'),
    K('keyTankDetach', 'r', KEY_TANK_DETACH, 'Detach the current tank.\n'),
    K('keyIncreasePower', 'KP_Multiply', KEY_INCREASE_POWER, 'Increase engine power.\n'),
    K('keyDecreasePower', 'KP_Divide', KEY_DECREASE_POWER, 'Decrease engine power.\n'),
    K('keyIncreaseTurnspeed', 'KP_Add', KEY_INCREASE_TURNSPEED, 'Increase turnspeed.\n'),
    K('keyDecreaseTurnspeed', 'KP_Subtract', KEY_DECREASE_TURNSPEED, 'Decrease turnspeed.\n'),
    K('keyTransporter', 't', KEY_TRANSPORTER, 'Use transporter to steal an item.\n'),
    K('keyDeflector', 'o', KEY_DEFLECTOR, 'Toggle deflector.\n'),
    K('keyHyperJump', 'q', KEY_HYPERJUMP, 'Teleport.\n'),
    K('keyPhasing', 'p', KEY_PHASING, 'Use phasing device.\n'),
    K('keyTalk', 'm', KEY_TALK, 'Toggle talk window.\n'),
    K('keyToggleNuclear', 'n', KEY_TOGGLE_NUCLEAR, 'Toggle nuclear weapon modifier.\n'),
    K('keyToggleCluster', 'c', KEY_TOGGLE_CLUSTER, 'Toggle cluster weapon modifier.\n'),
    K('keyToggleImplosion', 'i', KEY_TOGGLE_IMPLOSION, 'Toggle implosion weapon modifier.\n'),
    K('keyToggleVelocity', 'v', KEY_TOGGLE_VELOCITY, 'Toggle explosion velocity weapon modifier.\n'),
    K('keyToggleMini', 'x', KEY_TOGGLE_MINI, 'Toggle mini weapon modifier.\n'),
    K('keyToggleSpread', 'z', KEY_TOGGLE_SPREAD, 'Toggle spread weapon modifier.\n'),
    K('keyTogglePower', 'b', KEY_TOGGLE_POWER, 'Toggle power weapon modifier.\n'),
    K('keyToggleCompass', 'KP_7', KEY_TOGGLE_COMPASS, 'Toggle HUD/radar compass lock.\n'),
    K('keyToggleAutoPilot', 'h', KEY_TOGGLE_AUTOPILOT, 'Toggle automatic pilot mode.\n'),
    K('keyToggleLaser', 'l', KEY_TOGGLE_LASER, 'Toggle laser modifier.\n'),
    K('keyEmergencyThrust', 'j', KEY_EMERGENCY_THRUST, 'Pull emergency thrust handle.\n'),
    K('keyEmergencyShield', 'Caps_Lock', KEY_EMERGENCY_SHIELD, 'Toggle emergency shield power.\n'),
    K('keyTractorBeam', 'comma', KEY_TRACTOR_BEAM, 'Use tractor beam in attract mode.\n'),
    K('keyPressorBeam', 'period', KEY_PRESSOR_BEAM, 'Use tractor beam in repulse mode.\n'),
    K('keyClearModifiers', 'k', KEY_CLEAR_MODIFIERS, 'Clear current weapon modifiers.\n'),
    K('keyLoadModifiers1', '1', KEY_LOAD_MODIFIERS_1, 'Load the weapon modifiers from bank 1.\n'),
    K('keyLoadModifiers2', '2', KEY_LOAD_MODIFIERS_2, 'Load the weapon modifiers from bank 2.\n'),
    K('keyLoadModifiers3', '3', KEY_LOAD_MODIFIERS_3, 'Load the weapon modifiers from bank 3.\n'),
    K('keyLoadModifiers4', '4', KEY_LOAD_MODIFIERS_4, 'Load the weapon modifiers from bank 4.\n'),
    K('keyToggleOwnedItems', 'KP_8', KEY_TOGGLE_OWNED_ITEMS, 'Toggle list of owned items on HUD.\n'),
    K('keyToggleMessages', 'KP_9', KEY_TOGGLE_MESSAGES, 'Toggle showing of messages.\n'),
    K('keyReprogram', 'quoteleft', KEY_REPROGRAM, 'Reprogram modifier or lock bank.\n'),
    K('keyLoadLock1', '5', KEY_LOAD_LOCK_1, 'Load player lock from bank 1.\n'),
    K('keyLoadLock2', '6', KEY_LOAD_LOCK_2, 'Load player lock from bank 2.\n'),
    K('keyLoadLock3', '7', KEY_LOAD_LOCK_3, 'Load player lock from bank 3.\n'),
    K('keyLoadLock4', '8', KEY_LOAD_LOCK_4, 'Load player lock from bank 4.\n'),
    K('keyToggleRecord', 'KP_5', KEY_TOGGLE_RECORD, 'Toggle recording of session (see recordFile).\n'),
    ...(sound ? [K('keyToggleSound', '', KEY_TOGGLE_SOUND, "Toggle sound. Changes value of option 'sound'.\n")] : []),
    K('keyToggleRadarScore', 'F11', KEY_TOGGLE_RADAR_SCORE, 'Toggles the radar and score windows on and off.\n'),
    K('keyToggleFullScreen', 'F11', KEY_TOGGLE_FULLSCREEN, 'Toggles between fullscreen mode and window mode.\n'),
    K('keySelectItem', 'KP_0 KP_Insert', KEY_SELECT_ITEM, 'Select an item to lose.\n'),
    K('keyLoseItem', 'KP_Delete KP_Decimal', KEY_LOSE_ITEM, 'Lose the selected item.\n'),
    K('keyPrintMessagesStdout', 'Print', KEY_PRINT_MSGS_STDOUT, 'Print the current messages to stdout.\n'),
    K('keyTalkCursorLeft', 'Left', KEY_TALK_CURSOR_LEFT, 'Move Cursor to the left in the talk window.\n'),
    K('keyTalkCursorRight', 'Right', KEY_TALK_CURSOR_RIGHT, 'Move Cursor to the right in the talk window.\n'),
    K('keyTalkCursorUp', 'Up', KEY_TALK_CURSOR_UP, 'Browsing in the history of the talk window.\n'),
    K('keyTalkCursorDown', 'Down', KEY_TALK_CURSOR_DOWN, 'Browsing in the history of the talk window.\n'),
    K('keyPointerControl', 'KP_Enter', KEY_POINTER_CONTROL, 'Toggle pointer control.\n'),
    K('keyExit', 'Escape', KEY_EXIT, 'Generic exit key.\nUsed for example to exit mouse mode or quit the client.\n'),
    K('keyYes', 'y', KEY_YES, "Positive reply key.\nUsed to reply 'yes' to client questions.\n"),
    K('keyNo', 'n', KEY_NO, "Negative reply key.\nUsed to reply 'no' to client questions.\n"),
    ...Array.from({ length: 20 }, (_, i) => K(`keySendMsg${i + 1}`, i < 10 ? `F${i + 1}` : '', KEY_MSG_1 + i, `Sends the talkmessage stored in msg${i + 1}.\n`)),
    XP_STRING_OPTION('pointerButton1', 'keyFireShot', null, 0, setPointerButtonBinding, null, getPointerButtonBinding, XP_OPTFLAG_DEFAULT,
      'The keys to activate when pressing the first mouse button.\n'),
    XP_STRING_OPTION('pointerButton2', 'keyThrust', null, 0, setPointerButtonBinding, null, getPointerButtonBinding, XP_OPTFLAG_DEFAULT,
      'The keys to activate when pressing the second mouse button.\n'),
    XP_STRING_OPTION('pointerButton3', 'keyThrust', null, 0, setPointerButtonBinding, null, getPointerButtonBinding, XP_OPTFLAG_DEFAULT,
      'The keys to activate when pressing the third mouse button.\n'),
    XP_STRING_OPTION('pointerButton4', '', null, 0, setPointerButtonBinding, null, getPointerButtonBinding, XP_OPTFLAG_DEFAULT,
      'The keys to activate when pressing the fourth mouse button.\n'),
    XP_STRING_OPTION('pointerButton5', '', null, 0, setPointerButtonBinding, null, getPointerButtonBinding, XP_OPTFLAG_DEFAULT,
      'The keys to activate when pressing the fifth mouse button.\n'),
  ]);
}
