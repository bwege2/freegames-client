// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/binds.h and binds.cpp of Teeworlds 0.7.5 in TypeScript.
import { str_comp, str_find, str_format, str_toint, Localize } from './common.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import * as K from '../../engine/keys.ts';
import { FLAG_PRESS, FLAG_RELEASE, type CEvent, type CInput } from '../../engine/input.ts';
import { OUTPUT_LEVEL_STANDARD } from '../../engine/console.ts';
import { CComponent } from '../component.ts';

export const MODIFIER_NONE = 0, MODIFIER_SHIFT = 1, MODIFIER_CTRL = 2, MODIFIER_ALT = 3, MODIFIER_COUNT = 4;

const s_aaDefaultBindKeys: [number, number][] = [
  [K.KEY_F1, 0], [K.KEY_F2, 0], [K.KEY_TAB, 0], [101, 0], [117, 0], [K.KEY_F10, 0], [115, MODIFIER_CTRL],
  [97, 0], [100, 0],
  [K.KEY_SPACE, 0], [K.KEY_MOUSE_1, 0], [K.KEY_MOUSE_2, 0], [K.KEY_LSHIFT, 0], [K.KEY_RSHIFT, 0], [K.KEY_RIGHT, 0], [K.KEY_LEFT, 0],
  [49, 0], [50, 0], [51, 0], [52, 0], [53, 0],
  [K.KEY_MOUSE_WHEEL_UP, 0], [K.KEY_MOUSE_WHEEL_DOWN, 0],
  [116, 0], [121, 0], [120, 0],
  [K.KEY_F3, 0], [K.KEY_F4, 0],
  [114, 0],
];
const s_aaDefaultBindValues = [
  'toggle_local_console', 'toggle_remote_console', '+scoreboard', '+stats', '+show_chat', 'screenshot', 'snd_toggle',
  '+left', '+right',
  '+jump', '+fire', '+hook', '+emote', '+spectate', 'spectate_next', 'spectate_previous',
  '+weapon1', '+weapon2', '+weapon3', '+weapon4', '+weapon5',
  '+prevweapon', '+nextweapon',
  'chat all', 'chat team', 'chat whisper',
  'vote yes', 'vote no',
  'ready_change',
];

export class CSpecialBinds extends CComponent {
  m_pBinds!: CBinds;
  override OnInput(Event: CEvent): boolean {
    const Mask = CBinds.GetModifierMask(this.Input());
    if (!(Event.m_Key >= K.KEY_F1 && Event.m_Key <= K.KEY_F12) && !(Event.m_Key >= K.KEY_F13 && Event.m_Key <= K.KEY_F24)) return false;
    let rtn = false;
    for (let m = 0; m < MODIFIER_COUNT; m++) {
      const b = this.m_pBinds.m_aaaKeyBindings[Event.m_Key][m];
      if (Mask & (1 << m) && b) {
        if (Event.m_Flags & FLAG_PRESS) this.Console().ExecuteLineStroked(1, b);
        if (Event.m_Flags & FLAG_RELEASE) this.Console().ExecuteLineStroked(0, b);
        rtn = true;
      }
    }
    return rtn;
  }
}

export class CBinds extends CComponent {
  m_SpecialBinds = new CSpecialBinds();
  m_aaaKeyBindings: string[][] = Array.from({ length: K.KEY_LAST }, () => new Array(MODIFIER_COUNT).fill(''));

  constructor() {
    super();
    this.m_SpecialBinds.m_pBinds = this;
  }

  Bind(KeyID: number, Modifier: number, pStr: string): void {
    if (KeyID < 0 || KeyID >= K.KEY_LAST) return;
    this.m_aaaKeyBindings[KeyID][Modifier] = pStr.slice(0, 127);
    const b = this.m_aaaKeyBindings[KeyID][Modifier];
    if (!b) this.Console().Print(OUTPUT_LEVEL_STANDARD, 'binds', str_format(256, 'unbound %s%s (%d)', CBinds.GetModifierName(Modifier), this.Input().KeyName(KeyID), KeyID));
    else this.Console().Print(OUTPUT_LEVEL_STANDARD, 'binds', str_format(256, 'bound %s%s (%d) = %s', CBinds.GetModifierName(Modifier), this.Input().KeyName(KeyID), KeyID, b));
  }

  static GetModifierMask(i: CInput): number {
    let Mask = 0;
    Mask |= (i.KeyIsPressed(K.KEY_LSHIFT) ? 1 : 0) << MODIFIER_SHIFT;
    Mask |= (i.KeyIsPressed(K.KEY_RSHIFT) ? 1 : 0) << MODIFIER_SHIFT;
    Mask |= (i.KeyIsPressed(K.KEY_LCTRL) ? 1 : 0) << MODIFIER_CTRL;
    Mask |= (i.KeyIsPressed(K.KEY_RCTRL) ? 1 : 0) << MODIFIER_CTRL;
    Mask |= (i.KeyIsPressed(K.KEY_LALT) ? 1 : 0) << MODIFIER_ALT;
    return Mask === 0 ? 1 : Mask;
  }

  static GetModifierMaskOfKey(Key: number): number {
    switch (Key) {
      case K.KEY_LSHIFT: case K.KEY_RSHIFT: return 1 << MODIFIER_SHIFT;
      case K.KEY_LCTRL: case K.KEY_RCTRL: return 1 << MODIFIER_CTRL;
      case K.KEY_LALT: return 1 << MODIFIER_ALT;
      default: return 0;
    }
  }

  static ModifierMatchesKey(Modifier: number, Key: number): boolean {
    switch (Modifier) {
      case MODIFIER_SHIFT: return Key === K.KEY_LSHIFT || Key === K.KEY_RSHIFT;
      case MODIFIER_CTRL: return Key === K.KEY_LCTRL || Key === K.KEY_RCTRL;
      case MODIFIER_ALT: return Key === K.KEY_LALT;
      default: return false;
    }
  }

  override OnInput(Event: CEvent): boolean {
    if (Event.m_Key <= 0 || Event.m_Key >= K.KEY_LAST) return false;
    let Mask = CBinds.GetModifierMask(this.Input());
    const KeyModifierMask = CBinds.GetModifierMaskOfKey(Event.m_Key);
    if (KeyModifierMask) {
      Mask -= KeyModifierMask;
      if (!Mask) Mask = 1 << MODIFIER_NONE;
    }
    const kb = this.m_aaaKeyBindings;
    let rtn = false;
    if (Event.m_Flags & FLAG_PRESS) {
      for (let m = 0; m < MODIFIER_COUNT; m++) {
        if (m === 0 && kb[Event.m_Key][0][0] === '+') {
          if (!KeyModifierMask) {
            let GotComposedBind = false;
            for (let ModCheck = 1; ModCheck < MODIFIER_COUNT; ++ModCheck) if (Mask & (1 << ModCheck) && kb[Event.m_Key][ModCheck]) GotComposedBind = true;
            let GotModifierBind = false;
            if (Mask & (1 << MODIFIER_SHIFT) && (kb[K.KEY_LSHIFT][0] || kb[K.KEY_RSHIFT][0])) GotModifierBind = true;
            if (Mask & (1 << MODIFIER_CTRL) && (kb[K.KEY_LCTRL][0] || kb[K.KEY_RCTRL][0])) GotModifierBind = true;
            if (Mask & (1 << MODIFIER_ALT) && (kb[K.KEY_LALT][0] || kb[K.KEY_RALT][0])) GotModifierBind = true;
            if (!GotModifierBind && GotComposedBind) continue;
          }
          this.Console().ExecuteLineStroked(1, kb[Event.m_Key][m]);
          rtn = true;
          break;
        }
        if (Mask & (1 << m) && kb[Event.m_Key][m]) {
          this.Console().ExecuteLineStroked(1, kb[Event.m_Key][m]);
          rtn = true;
        }
      }
    }
    if (Event.m_Flags & FLAG_RELEASE) {
      for (let m = 0; m < MODIFIER_COUNT; ++m) {
        if (kb[Event.m_Key][m]) {
          this.Console().ExecuteLineStroked(0, kb[Event.m_Key][m]);
          rtn = true;
        }
      }
    }
    return rtn;
  }

  UnbindAll(): void {
    for (const k of this.m_aaaKeyBindings) k.fill('');
  }

  Get(KeyID: number, Modifier: number): string {
    if (KeyID > 0 && KeyID < K.KEY_LAST) return this.m_aaaKeyBindings[KeyID][Modifier];
    return '';
  }

  GetKeyID(pBindStr: string): { KeyID: number; Modifier: number } {
    let KeyID = K.KEY_LAST, Modifier = MODIFIER_COUNT;
    for (let LocalKeyID = 0; LocalKeyID < K.KEY_LAST; LocalKeyID++) {
      for (let LocalModifier = 0; LocalModifier < MODIFIER_COUNT; LocalModifier++) {
        const pBind = this.Get(LocalKeyID, LocalModifier);
        if (!pBind) continue;
        if (str_comp(pBind, pBindStr) === 0) return { KeyID: LocalKeyID, Modifier: LocalModifier };
        if (str_find(pBind, pBindStr) >= 0) {
          KeyID = LocalKeyID;
          Modifier = LocalModifier;
        }
      }
    }
    return { KeyID, Modifier };
  }

  GetKey(pBindStr: string, KeyID?: number, Modifier?: number): string {
    if (KeyID === undefined) ({ KeyID, Modifier } = this.GetKeyID(pBindStr));
    if (KeyID < K.KEY_LAST) return str_format(64, '%s%s', CBinds.GetModifierName(Modifier!), this.Input().KeyName(KeyID));
    return Localize('key not found');
  }

  SetDefaults(): void {
    this.UnbindAll();
    for (let i = 0; i < s_aaDefaultBindKeys.length; i++) this.Bind(s_aaDefaultBindKeys[i][0], s_aaDefaultBindKeys[i][1], s_aaDefaultBindValues[i]);
  }

  override OnConsoleInit(): void {
    const C = this.Console();
    C.Register('bind', 's[key] r[command]', CFGFLAG_CLIENT, (r) => {
      const d = this.DecodeBindString(r.GetString(0));
      if (!d.KeyID) return C.Print(OUTPUT_LEVEL_STANDARD, 'binds', str_format(256, 'key %s not found', r.GetString(0)));
      this.Bind(d.KeyID, d.Modifier, r.GetString(1));
    }, this, 'Bind key to execute the command');
    C.Register('unbind', 's[key]', CFGFLAG_CLIENT, (r) => {
      const d = this.DecodeBindString(r.GetString(0));
      if (!d.KeyID) return C.Print(OUTPUT_LEVEL_STANDARD, 'binds', str_format(256, 'key %s not found', r.GetString(0)));
      this.Bind(d.KeyID, d.Modifier, '');
    }, this, 'Unbind key');
    C.Register('unbindall', '', CFGFLAG_CLIENT, () => this.UnbindAll(), this, 'Unbind all keys');
    C.Register('binds', '', CFGFLAG_CLIENT, () => {
      for (let i = 0; i < K.KEY_LAST; i++)
        for (let m = 0; m < MODIFIER_COUNT; m++) {
          const b = this.m_aaaKeyBindings[i][m];
          if (!b) continue;
          C.Print(OUTPUT_LEVEL_STANDARD, 'binds', str_format(1024, '%s%s (%d) = %s', CBinds.GetModifierName(m), this.Input().KeyName(i), i, b));
        }
    }, this, 'Show list of key bindings');
    this.SetDefaults();
  }

  private DecodeBindString(pKeyName: string): { KeyID: number; Modifier: number } {
    let Modifier = 0;
    const aBuf = pKeyName.slice(0, 63);
    const plus = aBuf.indexOf('+');
    if (plus >= 0 && plus + 1 < aBuf.length) {
      const pModifierStr = aBuf.slice(0, plus);
      if (str_comp(pModifierStr, 'shift') === 0) Modifier = MODIFIER_SHIFT;
      else if (str_comp(pModifierStr, 'ctrl') === 0) Modifier = MODIFIER_CTRL;
      else if (str_comp(pModifierStr, 'alt') === 0) Modifier = MODIFIER_ALT;
      else return { KeyID: 0, Modifier };
      pKeyName = aBuf.slice(plus + 1);
    }
    if (pKeyName[0] === '&') {
      const i = str_toint(pKeyName.slice(1));
      if (i > 0 && i < K.KEY_LAST) return { KeyID: i, Modifier };
    }
    for (let i = 0; i < K.KEY_LAST; i++) if (str_comp(pKeyName, this.Input().KeyName(i)) === 0) return { KeyID: i, Modifier };
    return { KeyID: 0, Modifier };
  }

  static GetModifierName(m: number): string {
    switch (m) {
      case MODIFIER_SHIFT: return 'shift+';
      case MODIFIER_CTRL: return 'ctrl+';
      case MODIFIER_ALT: return 'alt+';
      default: return '';
    }
  }

  /** ConfigSaveCallback: the bind lines of settings.cfg */
  ConfigSave(WriteLine: (s: string) => void): void {
    for (let i = 0; i < K.KEY_LAST; i++)
      for (let m = 0; m < MODIFIER_COUNT; m++) {
        const b = this.m_aaaKeyBindings[i][m];
        if (!b) continue;
        WriteLine(`bind ${CBinds.GetModifierName(m)}${this.Input().KeyName(i)} "${b.replace(/["\\]/g, (c) => '\\' + c)}"`);
      }
    for (const [Key, Modifier] of s_aaDefaultBindKeys)
      if (!this.m_aaaKeyBindings[Key][Modifier]) WriteLine(`unbind ${CBinds.GetModifierName(Modifier)}${this.Input().KeyName(Key)} `);
  }
}
