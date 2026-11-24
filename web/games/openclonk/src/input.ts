// OpenClonk in the browser: a key press or release on its way into the engine, as the original's SDL build sends it
// (src/keys.ts): Game.DoKeyboardInput(code, KEYEV_Down/KEYEV_Up, alt, ctrl, shift, repeat, nullptr).
//
// Not all of that path is translated yet. C4Game::DoKeyboardInput asks the GUI whether a dialog has the keyboard
// focus (pGUI, gui/C4Gui*, milestone 2), and C4KeyboardInput::DoInput reaches the player's controls through
// C4KeyBinding callbacks that hold C++ member-function pointers (C4KeyCBExPassKey<C4PlayerControl, C4KeyCodeEx>),
// which the translator leaves as empty shells (src/rt/headless.ts). Until both are translated, `keyEvent` does the
// part of that path a running game without an open dialog goes through: C4KeyboardInput::DoInput's last-key data
// (strength 100 for a press, 0 for a release; no position), then C4PlayerControl::ProcessKeyDown/ProcessKeyUp of the
// local players with a keyboard control set, which is where the player's C4KeyBinding leads. With the translated
// GUI and callbacks in place it calls Game.DoKeyboardInput itself (`translatedPath`).
import { S } from './rt/ptr.ts';
import { KEYEV_Down, KEYEV_Up, engineKeyCode } from './keys.ts';

/** C4KeyEventData::KeyPos_None (gui/C4KeyboardInput.h) */
const KeyPos_None = 0x7fffff;

/** whether the engine has the whole original path (GUI focus test and the key-binding callbacks) */
export function translatedPath($: any): boolean {
  const cb = $.C4KeyCBExPassKey$C4PlayerControl$C4KeyCodeEx?.prototype;
  return !!$.pGUI && !!cb && typeof cb.OnKeyEvent === 'function';
}

/** C4KeyCodeEx::String2KeyCode on a key name; null for KEY_Undefined */
export function keyCodeByName($: any, name: string): number | null {
  const code = $.C4KeyCodeEx.String2KeyCode(new $.StdStrBuf().init$pi8$b(S(name), true));
  return code === $.KEY_Undefined$C4KeyboardInput || code === undefined ? null : Number(code);
}

/**
 * One key event of the browser (KeyboardEvent.code and its modifiers) into the engine `$`. Returns whether a
 * control of a local player took it (the original's DoKeyboardInput result).
 */
export function keyEvent($: any, code: string, down: boolean, alt: boolean, ctrl: boolean, shift: boolean, repeat: boolean): boolean {
  const keyCode = engineKeyCode(code, (name) => keyCodeByName($, name));
  if (keyCode === null) return false;
  const ev = down ? KEYEV_Down : KEYEV_Up;
  if (translatedPath($)) {
    return !!$.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(keyCode, ev, alt, ctrl, shift, down && repeat, null);
  }
  // C4Game::DoKeyboardInput's key: C4KeyCodeEx(vk_code, KEYS_Alt*alt + KEYS_Control*ctrl + KEYS_Shift*shift, repeated)
  const key = new $.C4KeyCodeEx().init(keyCode, ((alt ? 1 : 0) + (ctrl ? 2 : 0) + (shift ? 4 : 0)) >>> 0, down && repeat);
  key.FixShiftKeys();
  // C4KeyboardInput::DoInput: the last-key data the controls read
  const extra = $.Game.KeyboardInput.GetLastKeyExtraData();
  extra.iStrength = down ? 100 : 0;
  extra.game_x = extra.game_y = extra.vp_x = extra.vp_y = KeyPos_None;
  for (let plr = $.Players.First; plr; plr = plr.Next) {
    if (!plr.LocalControl || !plr.Control?.pControlSet) continue;
    const handled = down ? plr.Control.ProcessKeyDown(key, key.$clone()) : plr.Control.ProcessKeyUp(key, key.$clone());
    if (handled) return true;
  }
  return false;
}
