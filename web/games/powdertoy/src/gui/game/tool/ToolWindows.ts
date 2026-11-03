// The UI halves of the tools whose simulation halves are in sim/tools.ts:
//   gui/game/tool/PropertyTool.cpp: PropertyWindow, PropertyTool::OpenWindow, the prefs part of
//     PropertyTool::SetConfiguration, and simulation/AccessPropertyParse.cpp (AccessProperty::Parse)
//   gui/game/tool/SignTool.cpp: SignWindow and SignTool::Click
//   gui/game/tool/GOLTool.cpp: GOLWindow and GOLTool::OpenWindow / Select
// InstallToolWindows(gameModel) connects them to the tools' hooks (PropertyTool.openWindow, SignTool.onClick,
// GOLTool.openWindow).
import { Window } from '../../interface/Engine.ts';
import { Button } from '../../interface/Button.ts';
import { Label, Textbox } from '../../interface/Label.ts';
import { DropDown } from '../../interface/Controls.ts';
import { AlignLeft, AlignMiddle, AlignTop, style } from '../../interface/Appearance.ts';
import { Colour, Red, Green, Blue, WithAlpha, NoAlpha, RGB, type Point } from '../../interface/Point.ts';
import { SDLK_UP, SDLK_DOWN } from '../../interface/Keys.ts';
import { ErrorMessage } from '../../dialogues/Dialogues.ts';
import { RenderTemperature, StringToTemperature, ToNumberFloat, fmtG } from '../../Format.ts';
import { GlobalPrefs } from '../../../game/Client.ts';
import { AccessProperty, PropertyTool, SignTool, GOLTool } from '../../../sim/tools.ts';
import { PARTICLE_PROPERTIES } from '../../../sim/particle.ts';
import { sd, ParseGOLString, SerialiseGOLRule, ValidateGOLName } from '../../../sim/simulationData.ts';
import { MAXSIGNS, PMAP, PT_NUM, XRES, YRES } from '../../../sim/config.ts';
import { PT_LIFE } from '../../../sim/numbers.ts';
import { RNG } from '../../../sim/cpp.ts';
import { sign_getDisplayText, SIGN_Left, SIGN_Middle, SIGN_Right, SIGN_None } from '../../../graphics/sign.ts';
import type { Simulation, Sign } from '../../../sim/simulation.ts';
import type { GameModel } from '../GameModel.ts';

const f = Math.fround;

/** common/tpt-rand.h: extern RNG interfaceRng (the GOL window's random colours) */
const interfaceRng = new RNG();

/**
 * Hooks for windows this file opens but that live elsewhere: gui/colourpicker/ColourPickerActivity (the GOL
 * window's colour buttons). Colours are RGBA, 0xAARRGGBB. While it is null the colour buttons do nothing.
 */
export const ToolWindowHooks: {
  ColourPickerActivity: ((initialColour: number, onPicked: (colour: number) => void) => void) | null;
} = { ColourPickerActivity: null };

// ---------------------------------------------------------------------------------------------------------------
// simulation/AccessPropertyParse.cpp

/** AccessProperty::ParseError */
export class ParseError extends Error {}

/** String::ToNumber<unsigned int>(Format::Hex()) / ToNumber<unsigned int>(): a stream extraction of the whole string */
function toNumberUnsigned(str: string, hex: boolean): number {
  const m = (hex ? /^\s*([+-]?)([0-9A-Fa-f]+)$/ : /^\s*([+-]?)([0-9]+)$/).exec(str);
  if (!m) throw new RangeError('Not a number');
  const v = BigInt((hex ? '0x' : '') + m[2]);
  if (v > 0xFFFFFFFFn) throw new RangeError('Not a number');
  return m[1] === '-' ? Number((-v) & 0xFFFFFFFFn) : Number(v);
}

/** String::ToNumber<int>() */
function toNumberInt(str: string): number {
  const m = /^\s*([+-]?[0-9]+)$/.exec(str);
  if (!m) throw new RangeError('Not a number');
  const v = Number(m[1]);
  if (v > 2147483647 || v < -2147483648) throw new RangeError('Not a number');
  return v;
}

/** std::stoi / std::stol (str, &converted, 2): returns [value, converted] */
function stoBinary(str: string, bits: 32 | 64): [number, number] {
  const m = /^(\s*[+-]?)([01]+)/.exec(str);
  if (!m) throw new RangeError('invalid_argument');
  let v = BigInt('0b' + m[2]);
  if (m[1].trim() === '-') v = -v;
  const lim = bits === 32 ? 2147483648n : 9223372036854775808n;
  if (v >= lim || v < -lim) throw new RangeError('out_of_range');
  // a long assigned to an unsigned int keeps the low 32 bits
  return [bits === 32 ? Number(v) : Number(BigInt.asUintN(32, v)), m[0].length];
}

/**
 * AccessProperty::Parse(int prop, String value). The temperature scale is GameController::Ref().GetTemperatureScale()
 * in the original, passed in here.
 */
export function AccessProperty_Parse(prop: number, value: string, temperatureScale: number): AccessProperty {
  const properties = PARTICLE_PROPERTIES;
  const elements = sd.elements;
  if (prop < 0 || prop >= properties.length || !value.length) {
    throw new ParseError('invalid property index');
  }
  value = value.toUpperCase();
  let propertyValue = 0;
  try {
    switch (properties[prop].kind) {
      case 'int': // StructProperty::Integer (life, tmp...) and ParticleType (ctype)
      case 'type': {
        let v: number;
        if (value.length > 2 && value.startsWith('0X')) {
          //0xC0FFEE
          v = toNumberUnsigned(value.substring(2), true) | 0;
        } else if (value.length > 1 && value.startsWith('#')) {
          //#C0FFEE
          v = toNumberUnsigned(value.substring(1), true) | 0;
        } else if (value.length > 2 && value.startsWith('0B')) {
          //0b1001100110
          const substr = value.substring(2);
          let converted: number;
          try {
            [v, converted] = stoBinary(substr, 32);
          } catch {
            throw new ParseError('invalid binary value');
          }
          if (converted !== substr.length)
            throw new ParseError('invalid binary value');
        } else {
          // Try to parse as particle name
          v = sd.GetParticleType(value);

          // Try to parse special GoL rules
          if (v === -1 && properties[prop].name === 'ctype') {
            if (value.length > 1 && value.startsWith('B') && value.includes('/')) {
              v = ParseGOLString(value);
              if (v === -1) {
                throw new Error('InvalidGOLString');
              }
            } else {
              v = sd.GetParticleType(value);
              const builtinGol = sd.builtinGol;
              const customGol = sd.GetCustomGol();
              if (v === -1) {
                for (let i = 0; i < builtinGol.length; ++i) {
                  if (builtinGol[i].name === value) {
                    v = PMAP(i, PT_LIFE);
                    break;
                  }
                }
              }
              if (v === -1) {
                for (let i = 0; i < customGol.length; ++i) {
                  if (customGol[i].nameString === value) {
                    v = PMAP(customGol[i].rule, PT_LIFE);
                    break;
                  }
                }
              }
            }
          }

          // Parse as plain number
          if (v === -1) {
            v = toNumberInt(value);
          }
        }

        if (properties[prop].name === 'type' && (v < 0 || v >= PT_NUM || !elements[v].Enabled)) {
          throw new ParseError('invalid element');
        }
        propertyValue = v;
        break;
      }
      case 'uint': {
        let v: number;
        if (value.length > 2 && value.startsWith('0X')) {
          //0xC0FFEE
          v = toNumberUnsigned(value.substring(2), true);
        } else if (value.length > 1 && value.startsWith('#')) {
          //#C0FFEE
          v = toNumberUnsigned(value.substring(1), true);
        } else if (value.length > 2 && value.startsWith('0B')) {
          //0b1001100110
          const substr = value.substring(2);
          let converted: number;
          [v, converted] = stoBinary(substr, 64);
          if (converted !== substr.length)
            throw new ParseError('invalid binary value');
        } else {
          v = toNumberUnsigned(value, false);
        }
        propertyValue = v >>> 0;
        break;
      }
      case 'float': {
        if (properties[prop].name === 'temp')
          propertyValue = StringToTemperature(value, temperatureScale);
        else
          propertyValue = ToNumberFloat(value);
        break;
      }
      default:
        throw new ParseError('invalid property value');
    }
  } catch {
    throw new ParseError('invalid property value');
  }
  return new AccessProperty(prop, propertyValue);
}

/** StructProperty::ToString(value) */
function StructProperty_ToString(prop: number, value: number): string {
  switch (PARTICLE_PROPERTIES[prop].kind) {
    case 'float':
      return fmtG(value);
    case 'type':
    case 'int':
      return String(value | 0);
    case 'uint':
      return String(value >>> 0);
  }
  return '';
}

// ---------------------------------------------------------------------------------------------------------------
// PropertyTool.cpp

type PropertyConfiguration = { changeProperty: AccessProperty; propertyValueStr: string };

class PropertyWindow extends Window {
  property: DropDown;
  textField: Textbox;
  tool: PropertyTool;
  sim: Simulation;
  configuration: PropertyConfiguration | null = null;
  private gameModel: GameModel;
  private okButton: Button;

  constructor(gameModel: GameModel, tool_: PropertyTool, sim_: Simulation, takePropertyFrom: number | null) {
    super({ X: -1, Y: -1 }, { X: 200, Y: 87 });
    this.gameModel = gameModel;
    this.tool = tool_;
    this.sim = sim_;

    const messageLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 14 }, 'Edit property');
    messageLabel.SetTextColour(style.Colour.InformationTitle);
    messageLabel.Appearance.HorizontalAlign = AlignLeft;
    messageLabel.Appearance.VerticalAlign = AlignTop;
    this.AddComponent(messageLabel);

    const okayButton = new Button({ X: 0, Y: this.Size.Y - 17 }, { X: this.Size.X, Y: 17 }, 'OK');
    this.okButton = okayButton;
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.BorderInactive = Colour(200, 200, 200);
    okayButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      this.SetProperty();
      this.SelfDestruct();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);

    this.property = new DropDown({ X: 8, Y: 25 }, { X: this.Size.X - 16, Y: 16 });
    this.property.SetActionCallback({ change: () => {
      this.HandlePropertyChange();
    } });
    this.AddComponent(this.property);
    const properties = PARTICLE_PROPERTIES;
    for (let i = 0; i < properties.length; i++) {
      this.property.AddOption([properties[i].name, i]);
    }

    this.textField = new Textbox({ X: 8, Y: 46 }, { X: this.Size.X - 16, Y: 16 }, '', '[value]');
    this.textField.Appearance.HorizontalAlign = AlignLeft;
    this.textField.Appearance.VerticalAlign = AlignMiddle;
    this.textField.SetActionCallback({ change: () => {
      this.Update();
    } });
    this.AddComponent(this.textField);

    {
      const prefs = GlobalPrefs();
      let propertyIndex = prefs.Get<number>('Prop.Type', 0);
      let valueString = prefs.Get<string>('Prop.Value', '');
      const taken = this.TakePropertyFrom(this.sim, takePropertyFrom);
      if (taken) {
        [propertyIndex, valueString] = taken;
      }
      this.property.SetOption(propertyIndex);
      this.textField.SetText(valueString);
    }

    this.FocusComponent(this.textField);
    this.Update();

    this.MakeActiveWindow();
  }

  private TakePropertyFrom(sim: Simulation, i: number | null): [number, string] | null {
    const toolConfiguration = this.tool.GetConfiguration();
    if (!toolConfiguration || i === null) {
      return null;
    }
    const value = toolConfiguration.changeProperty.Get(sim, i);
    const prop = PARTICLE_PROPERTIES[toolConfiguration.changeProperty.propertyIndex];
    let valueString: string;
    if (prop.name === 'temp') {
      valueString = RenderTemperature(value, this.gameModel.GetTemperatureScale());
    } else {
      valueString = StructProperty_ToString(toolConfiguration.changeProperty.propertyIndex, value);
    }
    return [toolConfiguration.changeProperty.propertyIndex, valueString];
  }

  private HandlePropertyChange(): void {
    this.FocusComponent(this.textField);
    this.Update();
  }

  Update(): void {
    this.configuration = null;
    try {
      this.configuration = {
        changeProperty: AccessProperty_Parse(this.property.GetOption()[1], this.textField.GetText(), this.gameModel.GetTemperatureScale()),
        propertyValueStr: this.textField.GetText(),
      };
    } catch (ex) {
      if (!(ex instanceof ParseError)) throw ex;
    }
    const haveConfiguration = !!this.configuration;
    this.okButton.Enabled = haveConfiguration;
    this.textField.SetTextColour(haveConfiguration ? Colour(255, 255, 255) : style.Colour.ErrorTitle);
  }

  SetProperty(): void {
    PropertyTool_SetConfiguration(this.tool, this.configuration);
  }

  protected override OnTryExit(_method: number): void {
    this.CloseActiveWindow();
    this.SelfDestruct();
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();

    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xC8C8C8);
  }

  protected override OnKeyPress(key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {
    if (key === SDLK_UP) {
      this.property.SetOption(this.property.GetOption()[1] - 1);
      this.HandlePropertyChange();
    } else if (key === SDLK_DOWN) {
      this.property.SetOption(this.property.GetOption()[1] + 1);
      this.HandlePropertyChange();
    }
  }
}

/** PropertyTool::SetConfiguration: tools.ts keeps the configuration, the prefs are written here */
export function PropertyTool_SetConfiguration(tool: PropertyTool, newConfiguration: PropertyConfiguration | null): void {
  tool.SetConfiguration(newConfiguration);
  const configuration = tool.GetConfiguration();
  if (configuration) {
    const prefs = GlobalPrefs();
    prefs.DeferWrite(() => {
      prefs.Set('Prop.Type', configuration.changeProperty.propertyIndex);
      prefs.Set('Prop.Value', configuration.propertyValueStr);
    });
  }
}

/** PropertyTool::OpenWindow(Simulation *sim, std::optional<int> takePropertyFrom) */
export function OpenPropertyWindow(gameModel: GameModel, sim: Simulation, takePropertyFrom: number | null): void {
  const tool = gameModel.GetToolFromIdentifier('DEFAULT_UI_PROPERTY');
  if (!(tool instanceof PropertyTool)) return;
  new PropertyWindow(gameModel, tool, sim, takePropertyFrom);
}

// ---------------------------------------------------------------------------------------------------------------
// SignTool.cpp

class SignWindow extends Window {
  justification: DropDown;
  textField: Textbox;
  gameModel: GameModel;
  movingSign: Sign | null;
  signMoving: boolean;
  sim: Simulation;
  signID: number;
  signPosition: Point;

  constructor(gameModel: GameModel, sim_: Simulation, signID_: number, position_: Point) {
    super({ X: -1, Y: -1 }, { X: 250, Y: 87 });
    this.gameModel = gameModel;
    this.movingSign = null;
    this.signMoving = false;
    this.sim = sim_;
    this.signID = signID_;
    this.signPosition = { X: position_.X, Y: position_.Y };

    const messageLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 15 }, 'New sign');
    messageLabel.SetTextColour(style.Colour.InformationTitle);
    messageLabel.Appearance.HorizontalAlign = AlignLeft;
    messageLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(messageLabel);

    const okayButton = new Button({ X: 0, Y: this.Size.Y - 16 }, { X: this.Size.X, Y: 16 }, 'OK');
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.BorderInactive = (Colour(200, 200, 200));
    okayButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      if (this.signID === -1 && this.textField.GetText().length) {
        this.sim.signs.push({ text: this.textField.GetText(), x: this.signPosition.X, y: this.signPosition.Y, ju: this.justification.GetOption()[1] });
      } else if (this.signID !== -1 && this.textField.GetText().length) {
        this.sim.signs[this.signID] = { text: this.textField.GetText(), x: this.signPosition.X, y: this.signPosition.Y, ju: this.justification.GetOption()[1] };
      }
      this.SelfDestruct();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);

    const tempLabel = new Label({ X: 8, Y: 48 }, { X: 40, Y: 15 }, 'Pointer:');
    // (sic) the original sets the okay button's alignment here
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(tempLabel);

    this.justification = new DropDown({ X: 52, Y: 48 }, { X: 55, Y: 16 });
    this.AddComponent(this.justification);
    this.justification.AddOption([String.fromCharCode(0xE020) + ' Left', SIGN_Left]);
    this.justification.AddOption([String.fromCharCode(0xE01E) + ' Middle', SIGN_Middle]);
    this.justification.AddOption([String.fromCharCode(0xE01F) + ' Right', SIGN_Right]);
    this.justification.AddOption([String.fromCharCode(0xE01D) + ' None', SIGN_None]);
    this.justification.SetOption(1);
    this.justification.Appearance.HorizontalAlign = AlignLeft;

    this.textField = new Textbox({ X: 8, Y: 25 }, { X: this.Size.X - 16, Y: 17 }, '', '[message]');
    this.textField.Appearance.HorizontalAlign = AlignLeft;
    this.textField.Appearance.VerticalAlign = AlignMiddle;
    this.textField.SetLimit(45);
    this.textField.SetActionCallback({ change: () => {
      if (this.signID !== -1) {
        this.sim.signs[this.signID].text = this.textField.GetText();
        this.sim.signs[this.signID].ju = this.justification.GetOption()[1];
      }
    } });
    this.AddComponent(this.textField);
    this.FocusComponent(this.textField);

    if (this.signID !== -1) {
      messageLabel.SetText('Edit sign');

      this.textField.SetText(this.sim.signs[this.signID].text);
      this.justification.SetOption(this.sim.signs[this.signID].ju);

      let position = { X: this.justification.Position.X + this.justification.Size.X + 3, Y: 48 };
      const moveButton = new Button(position, { X: (((this.Size.X - position.X - 8) / 2) | 0) - 2, Y: 16 }, 'Move');
      moveButton.SetActionCallback({ action: () => {
        if (this.signID !== -1) {
          this.movingSign = this.sim.signs[this.signID];
          this.sim.signs[this.signID].ju = this.justification.GetOption()[1];
          this.signMoving = true;
        }
      } });
      this.AddComponent(moveButton);

      position = { X: this.justification.Position.X + this.justification.Size.X + 3 + moveButton.Size.X + 3, Y: 48 };
      const deleteButton = new Button(position, { X: (this.Size.X - position.X - 8) - 1, Y: 16 }, 'Delete');
      //deleteButton->SetIcon(IconDelete);
      deleteButton.SetActionCallback({ action: () => {
        this.CloseActiveWindow();
        if (this.signID !== -1) {
          this.sim.signs.splice(this.signID, 1);
        }
        this.SelfDestruct();
      } });

      this.signPosition.X = this.sim.signs[this.signID].x;
      this.signPosition.Y = this.sim.signs[this.signID].y;

      this.AddComponent(deleteButton);
    }

    this.MakeActiveWindow();
  }

  override DoMouseUp(x: number, y: number, button: number): void {
    if (!this.signMoving)
      super.DoMouseUp(x, y, button);
  }
  override DoMouseWheel(x: number, y: number, d: number): void {
    if (!this.signMoving)
      super.DoMouseWheel(x, y, d);
  }
  override DoKeyPress(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (!this.signMoving)
      super.DoKeyPress(key, scan, repeat, shift, ctrl, alt);
  }
  override DoKeyRelease(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (!this.signMoving)
      super.DoKeyRelease(key, scan, repeat, shift, ctrl, alt);
  }

  protected override OnTryExit(_method: number): void {
    this.CloseActiveWindow();
    this.SelfDestruct();
  }

  override DoDraw(): void {
    for (const currentSign of this.sim.signs) {
      let x: number, y: number;
      const g = this.GetGraphics();

      const d = sign_getDisplayText(currentSign, this.sim);
      x = d.x;
      y = d.y;
      const w = d.w, h = d.h;
      g.DrawFilledRect(x + 1, y + 1, w, h - 1, 0x000000);
      g.DrawRect(x, y, w + 1, h, 0xC0C0C0);
      g.BlendText(x + 3, y + 4, d.text, WithAlpha(0xFFFFFF, 255));

      if (currentSign.ju !== SIGN_None) {
        x = currentSign.x;
        y = currentSign.y;
        const dx = 1 - currentSign.ju;
        const dy = (currentSign.y > 18) ? -1 : 1;
        for (let j = 0; j < 4; j++) {
          g.DrawPixel(x, y, 0xC0C0C0);
          x += dx;
          y += dy;
        }
      }
    }
    if (!this.signMoving) {
      super.DoDraw();
    }
  }

  override DoMouseMove(x: number, y: number, dx: number, dy: number): void {
    if (!this.signMoving)
      super.DoMouseMove(x, y, dx, dy);
    else {
      const pos = this.gameModel.AdjustZoomCoords({ X: x, Y: y });
      if (pos.X < XRES && pos.Y < YRES) {
        this.movingSign!.x = pos.X;
        this.movingSign!.y = pos.Y;
        this.signPosition.X = pos.X;
        this.signPosition.Y = pos.Y;
      }
    }
  }

  override DoMouseDown(x: number, y: number, button: number): void {
    if (!this.signMoving)
      super.DoMouseDown(x, y, button);
    else {
      this.signMoving = false;
    }
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();

    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xC8C8C8);
  }
}

/** SignTool::Click(Simulation *sim, Brush const &brush, ui::Point position) */
export function SignToolClick(gameModel: GameModel, sim: Simulation, position: Point): void {
  let signIndex = -1;
  for (let i = 0; i < sim.signs.length; i++) {
    const d = sign_getDisplayText(sim.signs[i], sim);
    const signX = d.x, signY = d.y, signW = d.w, signH = d.h;
    if (position.X > signX && position.X < signX + signW && position.Y > signY && position.Y < signY + signH) {
      signIndex = i;
      break;
    }
  }
  if (signIndex !== -1 || sim.signs.length < MAXSIGNS)
    new SignWindow(gameModel, sim, signIndex, position);
}

// ---------------------------------------------------------------------------------------------------------------
// GOLTool.cpp

class GOLWindow extends Window {
  private highColour: number;
  private lowColour: number;
  private highColourButton: Button;
  private lowColourButton: Button;
  private nameField: Textbox;
  private ruleField: Textbox;
  private gameModel: GameModel;
  private toolSelection: number;

  /** colour1, colour2: RGB */
  constructor(gameModel_: GameModel, toolSelection: number, rule: number, colour1: number, colour2: number) {
    super({ X: -1, Y: -1 }, { X: 200, Y: 108 });
    this.highColour = WithAlpha(colour1, 0xFF);
    this.lowColour = WithAlpha(colour2, 0xFF);
    this.gameModel = gameModel_;
    this.toolSelection = toolSelection;

    const messageLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 14 }, 'Edit custom GOL type');
    messageLabel.SetTextColour(style.Colour.InformationTitle);
    messageLabel.Appearance.HorizontalAlign = AlignLeft;
    messageLabel.Appearance.VerticalAlign = AlignTop;
    this.AddComponent(messageLabel);

    const okayButton = new Button({ X: 0, Y: this.Size.Y - 17 }, { X: this.Size.X, Y: 17 }, 'OK');
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.BorderInactive = Colour(200, 200, 200);
    okayButton.SetActionCallback({ action: () => {
      if (this.nameField.GetText().length && this.ruleField.GetText().length) {
        this.CloseActiveWindow();
        this.validate();
        this.SelfDestruct();
      }
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);

    this.nameField = new Textbox({ X: 8, Y: 25 }, { X: this.Size.X - 16, Y: 16 }, '', '[name]');
    this.nameField.Appearance.HorizontalAlign = AlignLeft;
    this.nameField.Appearance.VerticalAlign = AlignMiddle;
    this.nameField.SetLimit(7);
    this.AddComponent(this.nameField);
    this.FocusComponent(this.nameField);

    this.ruleField = new Textbox({ X: 8, Y: 46 }, { X: this.Size.X - 16, Y: 16 }, '', '[rule]');
    this.ruleField.Appearance.HorizontalAlign = AlignLeft;
    this.ruleField.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(this.ruleField);
    this.FocusComponent(this.ruleField);

    this.highColourButton = new Button({ X: 8, Y: 67 }, { X: 16, Y: 16 }, '');
    this.highColourButton.SetActionCallback({ action: () => {
      // new ColourPickerActivity(highColour, ...)
      ToolWindowHooks.ColourPickerActivity?.(this.highColour, (colour: number) => {
        this.highColour = colour;
        this.updateGradient();
      });
    } });
    this.AddComponent(this.highColourButton);

    this.lowColourButton = new Button({ X: this.Size.X - 24, Y: 67 }, { X: 16, Y: 16 }, '');
    this.lowColourButton.SetActionCallback({ action: () => {
      ToolWindowHooks.ColourPickerActivity?.(this.lowColour, (colour: number) => {
        this.lowColour = colour;
        this.updateGradient();
      });
    } });
    this.AddComponent(this.lowColourButton);

    if (rule) {
      this.ruleField.SetText(SerialiseGOLRule(rule));
      this.nameField.SetText('');
    } else {
      const prefs = GlobalPrefs();
      this.ruleField.SetText(prefs.Get<string>('CustomGOL.Rule', 'B3/S23'));
      this.nameField.SetText(prefs.Get<string>('CustomGOL.Name', 'CGOL'));
      const hr = interfaceRng.between(0x80, 0xFF);
      const hg = interfaceRng.between(0x80, 0xFF);
      const hb = interfaceRng.between(0x80, 0xFF);
      this.highColour = Colour(hr, hg, hb, 0xFF);
      const lr = interfaceRng.between(0x00, 0x7F);
      const lg = interfaceRng.between(0x00, 0x7F);
      const lb = interfaceRng.between(0x00, 0x7F);
      this.lowColour = Colour(lr, lg, lb, 0xFF);
    }
    this.updateGradient();

    this.MakeActiveWindow();
  }

  private updateGradient(): void {
    this.highColourButton.Appearance.BackgroundInactive = this.highColour;
    this.highColourButton.Appearance.BackgroundHover = this.highColour;
    this.lowColourButton.Appearance.BackgroundInactive = this.lowColour;
    this.lowColourButton.Appearance.BackgroundHover = this.lowColour;
  }

  private validate(): void {
    let nameString = this.nameField.GetText();
    let ruleString = this.ruleField.GetText();
    if (!ValidateGOLName(nameString)) {
      new ErrorMessage('Could not add GOL type', 'Invalid name provided');
      return;
    }
    nameString = nameString.toUpperCase();
    const rule = ParseGOLString(ruleString);
    if (rule === -1) {
      new ErrorMessage('Could not add GOL type', 'Invalid rule provided');
      return;
    }
    if (sd.GetCustomGOLByRule(rule)) {
      new ErrorMessage('Could not add GOL type', 'This Custom GoL rule already exists');
      return;
    }
    ruleString = SerialiseGOLRule(rule); // * Make it canonical.

    {
      const prefs = GlobalPrefs();
      prefs.DeferWrite(() => {
        prefs.Set('CustomGOL.Name', nameString);
        prefs.Set('CustomGOL.Rule', ruleString);
      });
    }

    if (!this.gameModel.AddCustomGol(ruleString, nameString, NoAlpha(this.highColour), NoAlpha(this.lowColour))) {
      new ErrorMessage('Could not add GOL type', 'Name already taken');
      return;
    }

    this.gameModel.SelectNextIdentifier = 'DEFAULT_PT_LIFECUST_' + nameString;
    this.gameModel.SelectNextTool = this.toolSelection;
  }

  protected override OnTryExit(_method: number): void {
    this.CloseActiveWindow();
    this.SelfDestruct();
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();

    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xC8C8C8);

    const width = this.Size.X - 60;
    const hc = this.highColour, lc = this.lowColour;
    for (let xx = 0; xx < width; ++xx) {
      const fr = f(xx / f(width));
      for (let yy = 0; yy < 16; ++yy) {
        const rr = Math.trunc(f(f(Red(hc) * f(1 - fr)) + f(Red(lc) * fr)));
        const gg = Math.trunc(f(f(Green(hc) * f(1 - fr)) + f(Green(lc) * fr)));
        const bb = Math.trunc(f(f(Blue(hc) * f(1 - fr)) + f(Blue(lc) * fr)));
        g.DrawPixel(this.Position.X + xx + 30, this.Position.Y + yy + 67, RGB(rr, gg, bb));
      }
    }
  }
}

/** GOLTool::OpenWindow(Simulation *sim, int toolSelection, int rule = 0, RGB colour1 = 0, RGB colour2 = 0) */
export function OpenGOLWindow(gameModel: GameModel, toolSelection: number, rule = 0, colour1 = 0x000000, colour2 = 0x000000): void {
  new GOLWindow(gameModel, toolSelection, rule, colour1, colour2);
}

// ---------------------------------------------------------------------------------------------------------------

/** connects the windows to the tools of gameModel (PropertyTool::Select, SignTool::Click, GOLTool::Select) */
export function InstallToolWindows(gameModel: GameModel): void {
  const propertyTool = gameModel.GetToolFromIdentifier('DEFAULT_UI_PROPERTY');
  if (propertyTool instanceof PropertyTool) {
    propertyTool.openWindow = (sim: Simulation | null, takePropertyFrom: number | null) => {
      OpenPropertyWindow(gameModel, sim ?? gameModel.GetSimulation(), takePropertyFrom);
    };
  }
  const signTool = gameModel.GetToolFromIdentifier('DEFAULT_UI_SIGN');
  if (signTool instanceof SignTool) {
    signTool.onClick = (sim: Simulation, position: Point) => {
      SignToolClick(gameModel, sim, position);
    };
  }
  const golTool = gameModel.GetToolFromIdentifier('DEFAULT_UI_ADDLIFE');
  if (golTool instanceof GOLTool) {
    golTool.openWindow = (toolSelection: number) => {
      OpenGOLWindow(gameModel, toolSelection);
    };
  }
}
