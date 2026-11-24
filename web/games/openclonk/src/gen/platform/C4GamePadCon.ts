// @ts-nocheck
// OpenClonk 36de799: src/platform/C4GamePadCon.cpp, src/platform/C4GamePadCon.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { sdl$SDL_GameControllerClose, sdl$SDL_GameControllerEventState, sdl$SDL_GameControllerGetAttached, sdl$SDL_GameControllerGetJoystick, sdl$SDL_GameControllerOpen, sdl$SDL_GetError, sdl$SDL_HapticClose, sdl$SDL_HapticOpenFromJoystick, sdl$SDL_HapticRumbleInit, sdl$SDL_HapticRumblePlay, sdl$SDL_HapticRumbleStop, sdl$SDL_HapticRumbleSupported, sdl$SDL_InitSubSystem, sdl$SDL_IsGameController, sdl$SDL_JoystickInstanceID, sdl$SDL_JoystickName, sdl$SDL_JoystickNameForIndex, sdl$SDL_NumJoysticks, sdl$SDL_PollEvent, sdl$SDL_QuitSubSystem, sdl$SDL_SetHint } from '../../rt/sdl.ts';
import { StdMap, StdSet } from '../../rt/std.ts';

export class C4GamePadControl {
  static MaxStrength;
  PressedAxis = new StdSet();
  AxisEvents = new StdMap();
  Gamepads = new StdMap();

  FeedEvent(event, feed) {
    switch (event.type) {
      case 1616:
        {
          let minCode = $.KEY_Gamepad($.KEY_CONTROLLER_Axis(event.caxis.axis, false));
          let maxCode = $.KEY_Gamepad($.KEY_CONTROLLER_Axis(event.caxis.axis, true));
          let value = abs_strength(event.caxis.value);
          let which = event.caxis.which & 0xff;
          let keyCode = event.caxis.value >= 0 ? maxCode : minCode;
          let doInput = ((event$2, strength) => {
  $.Game.DoKeyboardInput$C4KeyCodeEx$i32$pDialog$b$i32(new $.C4KeyCodeEx().init($.KEY_Gamepad(keyCode & 0xff), 0, false, which), event$2, null, false, strength);
});
          if ((feed & 1) !== 0) {
            if (this.PressedAxis.count(keyCode) !== 0 && value <= 16000) {
              this.PressedAxis.erase(keyCode);
              doInput(2 /*KEYEV_Up*/, -1);
            } else if (!(this.PressedAxis.count(keyCode) !== 0) && value > 16000) {
              this.PressedAxis.insert(keyCode);
              doInput(1 /*KEYEV_Down*/, -1);
            }
          }
          if ((feed & 2) !== 0) {
            doInput(4 /*KEYEV_Moved*/, value);
          }
          this.AxisEvents.entry(keyCode, () => {}).second = ({ ...event });
          break;
        }
      case 1617:
        if ((feed & 1) !== 0) {
          $.Game.DoKeyboardInput$C4KeyCodeEx$i32$pDialog$b$i32(new $.C4KeyCodeEx().init($.KEY_Gamepad($.KEY_CONTROLLER_Button(event.cbutton.button)), 0, false, event.cbutton.which), 1 /*KEYEV_Down*/);
        }
        break;
      case 1618:
        if ((feed & 1) !== 0) {
          $.Game.DoKeyboardInput$C4KeyCodeEx$i32$pDialog$b$i32(new $.C4KeyCodeEx().init($.KEY_Gamepad($.KEY_CONTROLLER_Button(event.cbutton.button)), 0, false, event.cbutton.which), 2 /*KEYEV_Up*/);
        }
        break;
    }
  }

  CheckGamePad(e) {
    switch (e.type) {
      case 1541:
        if (!(sdl$SDL_IsGameController(e.jdevice.which) !== 0)) {
          $.LogF(S("Gamepad %s isn't supported."), sdl$SDL_JoystickNameForIndex(e.jdevice.which));
        }
        break;
      case 1619:
        {
          let device = new C4GamePadOpener().init(e.cdevice.which);
          this.Gamepads.entry(device.GetID(), () => null).second = device;
          $.LogF(S("Gamepad #%d connected: %s"), device.GetID(), sdl$SDL_JoystickNameForIndex(e.cdevice.which));
          break;
        }
      case 1620:
        $.LogF(S("Gamepad #%d disconnected."), e.cdevice.which);
        this.Gamepads.erase(e.cdevice.which);
        break;
    }
  }

  init() {
    this.PressedAxis = new StdSet();
    this.AxisEvents = new StdMap();
    this.Gamepads = new StdMap();
    sdl$SDL_SetHint(S("SDL_JOYSTICK_ALLOW_BACKGROUND_EVENTS"), S("1"));
    if (sdl$SDL_InitSubSystem(28672) !== 0) {
      $.LogF(S("SDL_InitSubSystem(SDL_INIT_GAMECONTROLLER): %s"), sdl$SDL_GetError());
    }
    sdl$SDL_GameControllerEventState(1);
    if (!(C4GamePadControl.prototype.GetGamePadCount.call(this) !== 0)) {
      $.Log(S("No Gamepad found"));
    }
    return this;
  }

  $dtor() {
    this.Gamepads.clear();
    sdl$SDL_QuitSubSystem(24576);
  }

  GetGamePadCount() {
    let count = 0;
    for (let i = 0; i < sdl$SDL_NumJoysticks(); i = i + 1 | 0) {
      if (sdl$SDL_IsGameController(i) !== 0) {
        count = count + 1 | 0;
      }
    }
    return count;
  }

  Execute() {
    if ($.Application.isEditor === 0) {
      return;
    }
    let event = {};
    while (sdl$SDL_PollEvent(event) !== 0) {
      switch (event.type) {
        case 1616:
        case 1617:
        case 1618:
          this.FeedEvent(event, 1);
          break;
        case 1541:
        case 1619:
        case 1620:
          this.CheckGamePad(event);
          break;
      }
    }
  }

  DoAxisInput() {
    for (const e of this.AxisEvents) {
      this.FeedEvent(e.second, 2);
    }
    this.AxisEvents.clear();
  }

  GetGamePad(gamepad) {
    let $t1;
    if (gamepad >= 0) {
      for (const p of this.Gamepads) {
        if (($t1 = gamepad, gamepad = gamepad - 1 | 0, $t1) === 0) {
          return p.second;
        }
      }
    }
    return null;
  }

  GetGamePadByID(id) {
    let it = this.Gamepads.find(id);
    if (!it.eq(this.Gamepads.end())) {
      return it.v.second;
    }
    return null;
  }

  GetAvailableGamePad() {
    for (const p of this.Gamepads) {
      if (p.second.GetPlayer() < 0) {
        return p.second;
      }
    }
    return null;
  }

  $clone() { return new C4GamePadControl().$assign(this); }
  $assign(o) {
    this.PressedAxis = o.PressedAxis.$clone();
    this.AxisEvents = o.AxisEvents.$clone();
    this.Gamepads = o.Gamepads.$clone();
    return this;
  }
}

export class C4GamePadOpener {
  player = -1;
  controller = null;
  haptic = null;

  init(iGamepad) {
    this.player = -1;
    let $t1;
    let n = iGamepad;
    for (let i = 0; i < sdl$SDL_NumJoysticks(); i = i + 1 | 0) {
      if (sdl$SDL_IsGameController(i) !== 0 && ($t1 = n, n = n - 1 | 0, $t1) === 0) {
        this.controller = sdl$SDL_GameControllerOpen(i);
        if (this.controller == null) {
          $.LogF(S("SDL: %s"), sdl$SDL_GetError());
        }
        let joystick = sdl$SDL_GameControllerGetJoystick(this.controller);
        this.haptic = sdl$SDL_HapticOpenFromJoystick(joystick);
        if (this.haptic != null && sdl$SDL_HapticRumbleSupported(this.haptic) !== 0) {
          sdl$SDL_HapticRumbleInit(this.haptic);
        } else {
          $.LogF(S("Gamepad #%d %s does not support rumbling."), sdl$SDL_JoystickInstanceID(joystick), sdl$SDL_JoystickName(joystick));
        }
        break;
      }
    }
    if (this.controller == null) {
      $.LogF(S("Gamepad %d not available"), iGamepad);
    }
    return this;
  }

  $dtor() {
    if (this.haptic != null) {
      sdl$SDL_HapticClose(this.haptic);
    }
    if (this.controller != null) {
      sdl$SDL_GameControllerClose(this.controller);
    }
  }

  GetPlayer() {
    return this.player;
  }

  SetPlayer(plr) {
    this.player = plr;
  }

  GetID() {
    return sdl$SDL_JoystickInstanceID(sdl$SDL_GameControllerGetJoystick(this.controller));
  }

  IsAttached() {
    return !!(sdl$SDL_GameControllerGetAttached(this.controller) !== 0);
  }

  PlayRumble(strength, length) {
    if (sdl$SDL_HapticRumbleSupported(this.haptic) !== 0) {
      sdl$SDL_HapticRumblePlay(this.haptic, strength, length);
    }
  }

  StopRumble() {
    if (sdl$SDL_HapticRumbleSupported(this.haptic) !== 0) {
      sdl$SDL_HapticRumbleStop(this.haptic);
    }
  }

  $clone() { return new C4GamePadOpener().$assign(this); }
  $assign(o) {
    this.player = o.player;
    this.controller = o.controller;
    this.haptic = o.haptic;
    return this;
  }
}


export function abs_strength(strength) {
  return strength >= 0 ? strength : -(strength + 1 | 0) | 0;
}

export function $init(): void {
  C4GamePadControl.MaxStrength = 32767;
  $.deadZone = 16000;
}

Object.assign($, { C4GamePadControl, C4GamePadOpener, abs_strength });
