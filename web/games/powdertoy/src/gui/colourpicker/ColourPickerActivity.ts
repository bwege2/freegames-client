// gui/colourpicker/ColourPickerActivity.h / ColourPickerActivity.cpp (and Activity.h's WindowActivity, whose
// Show/Hide/Exit are written out here). Colours are ui::Colour packed 0xAARRGGBB.
import { Window } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Label, Textbox, ValidInput } from '../interface/Label.ts';
import { Slider } from '../interface/Controls.ts';
import { Colour, Red, Green, Blue, Alpha, WithAlpha, RGBA } from '../interface/Point.ts';
import { SDLK_TAB } from '../interface/Keys.ts';
import { ToNumberInt } from '../Format.ts';
import { HSV_to_RGB, RGB_to_HSV, clamp_flt, f } from '../../sim/cpp.ts';

function hex2(v: number): string {
  // Format::Hex(), Format::Uppercase(), Format::Width(2) (fill '0')
  const s = (v >>> 0).toString(16).toUpperCase();
  return s.length < 2 ? '0'.repeat(2 - s.length) + s : s;
}

export class ColourPickerActivity extends Window {
  private currentHue = 0;
  private currentSaturation = 0;
  private currentValue = 0;
  private currentAlpha = 0;

  private mouseDown = false;

  private hSlider: Slider;
  private sSlider: Slider;
  private vSlider: Slider;

  private rValue: Textbox;
  private gValue: Textbox;
  private bValue: Textbox;
  private aValue: Textbox;
  private hexValue: Label;

  private onPicked: ((colour: number) => void) | null;

  constructor(initialColour: number, onPicked_: ((colour: number) => void) | null = null) {
    super({ X: -1, Y: -1 }, { X: 266, Y: 215 });
    this.Show();
    this.onPicked = onPicked_;

    const colourChange = () => {
      let r = ToNumberInt(this.rValue.GetText(), true);
      let g = ToNumberInt(this.gValue.GetText(), true);
      let b = ToNumberInt(this.bValue.GetText(), true);
      let alpha = ToNumberInt(this.aValue.GetText(), true);
      if (r > 255)
        r = 255;
      if (g > 255)
        g = 255;
      if (b > 255)
        b = 255;
      if (alpha > 255)
        alpha = 255;

      [this.currentHue, this.currentSaturation, this.currentValue] = RGB_to_HSV(r, g, b);
      this.currentAlpha = alpha;
      this.UpdateTextboxes(r, g, b, alpha);
      this.UpdateSliders();
    };

    const colourChangeSlider = () => {
      this.currentHue = this.hSlider.GetValue();
      this.currentSaturation = this.sSlider.GetValue();
      this.currentValue = this.vSlider.GetValue();

      const [r, g, b] = HSV_to_RGB(this.currentHue, this.currentSaturation, this.currentValue);
      this.UpdateTextboxes(r, g, b, this.currentAlpha);
      this.UpdateSliders();
    };

    this.hSlider = new Slider({ X: 0, Y: 134 }, { X: this.Size.X, Y: 17 }, 359);
    this.hSlider.SetActionCallback({ change: colourChangeSlider });
    this.AddComponent(this.hSlider);

    this.sSlider = new Slider({ X: 0, Y: 134 + 17 }, { X: this.Size.X, Y: 17 }, 255);
    this.sSlider.SetActionCallback({ change: colourChangeSlider });
    this.AddComponent(this.sSlider);

    this.vSlider = new Slider({ X: 0, Y: 134 + 34 }, { X: this.Size.X, Y: 17 }, 255);
    this.vSlider.SetActionCallback({ change: colourChangeSlider });
    this.AddComponent(this.vSlider);

    this.rValue = new Textbox({ X: 5, Y: this.Size.Y - 23 }, { X: 30, Y: 17 }, '255');
    this.rValue.SetActionCallback({ change: colourChange });
    this.rValue.SetLimit(3);
    this.rValue.SetInputType(ValidInput.Number);
    this.AddComponent(this.rValue);

    this.gValue = new Textbox({ X: 40, Y: this.Size.Y - 23 }, { X: 30, Y: 17 }, '255');
    this.gValue.SetActionCallback({ change: colourChange });
    this.gValue.SetLimit(3);
    this.gValue.SetInputType(ValidInput.Number);
    this.AddComponent(this.gValue);

    this.bValue = new Textbox({ X: 75, Y: this.Size.Y - 23 }, { X: 30, Y: 17 }, '255');
    this.bValue.SetActionCallback({ change: colourChange });
    this.bValue.SetLimit(3);
    this.bValue.SetInputType(ValidInput.Number);
    this.AddComponent(this.bValue);

    this.aValue = new Textbox({ X: 110, Y: this.Size.Y - 23 }, { X: 30, Y: 17 }, '255');
    this.aValue.SetActionCallback({ change: colourChange });
    this.aValue.SetLimit(3);
    this.aValue.SetInputType(ValidInput.Number);
    this.AddComponent(this.aValue);

    this.hexValue = new Label({ X: 150, Y: this.Size.Y - 23 }, { X: 53, Y: 17 }, '0xFFFFFFFF');
    this.AddComponent(this.hexValue);

    const doneButton = new Button({ X: this.Size.X - 45, Y: this.Size.Y - 23 }, { X: 40, Y: 17 }, 'Done');
    doneButton.SetActionCallback({ action: () => {
      const red = ToNumberInt(this.rValue.GetText(), true);
      const green = ToNumberInt(this.gValue.GetText(), true);
      const blue = ToNumberInt(this.bValue.GetText(), true);
      const col = Colour(red, green, blue, this.currentAlpha);
      if (this.onPicked)
        this.onPicked(col);
      this.Exit();
    } });
    this.AddComponent(doneButton);
    this.SetOkayButton(doneButton);

    [this.currentHue, this.currentSaturation, this.currentValue] = RGB_to_HSV(Red(initialColour), Green(initialColour), Blue(initialColour));
    this.currentAlpha = Alpha(initialColour);
    this.UpdateTextboxes(Red(initialColour), Green(initialColour), Blue(initialColour), Alpha(initialColour));
    this.UpdateSliders();
  }

  // ---- WindowActivity ----
  Exit(): void {
    this.Hide();
    this.SelfDestruct();
  }
  Show(): void {
    this.MakeActiveWindow();
  }
  Hide(): void {
    this.CloseActiveWindow();
  }

  private UpdateTextboxes(r: number, g: number, b: number, a: number): void {
    this.rValue.SetText(String(r));
    this.gValue.SetText(String(g));
    this.bValue.SetText(String(b));
    this.aValue.SetText(String(a));
    this.hexValue.SetText(hex2(a) + hex2(r) + hex2(g) + hex2(b));
  }

  private UpdateSliders(): void {
    this.hSlider.SetValue(this.currentHue);
    this.sSlider.SetValue(this.currentSaturation);
    this.vSlider.SetValue(this.currentValue);

    let r: number, g: number, b: number;

    //Value gradient
    [r, g, b] = HSV_to_RGB(this.currentHue, this.currentSaturation, 255);
    this.vSlider.SetColour(Colour(0, 0, 0), Colour(r, g, b));

    //Saturation gradient
    if (this.currentValue !== 0) {
      [r, g, b] = HSV_to_RGB(this.currentHue, 255, this.currentValue);
      this.sSlider.SetColour(Colour(this.currentValue, this.currentValue, this.currentValue), Colour(r, g, b));
    }
  }

  protected override OnTryExit(_method: number): void {
    this.Exit();
  }

  /** currentHue = int((float(x)/float(255))*359.0f) and the clamps shared by the mouse handlers */
  private pickFromPosition(x: number, y: number): void {
    this.currentHue = Math.trunc(f(f(f(x) / f(255)) * f(359.0)));
    this.currentSaturation = 255 - (y * 2);

    if (this.currentSaturation > 255)
      this.currentSaturation = 255;
    if (this.currentSaturation < 0)
      this.currentSaturation = 0;
    if (this.currentHue > 359)
      this.currentHue = 359;
    if (this.currentHue < 0)
      this.currentHue = 0;
  }

  protected override OnMouseMove(x: number, y: number, _dx: number, _dy: number): void {
    if (this.mouseDown) {
      x -= this.Position.X + 5;
      y -= this.Position.Y + 5;
      this.pickFromPosition(x, y);
    }

    if (this.mouseDown) {
      const [cr, cg, cb] = HSV_to_RGB(this.currentHue, this.currentSaturation, this.currentValue);
      this.UpdateTextboxes(cr, cg, cb, this.currentAlpha);
      this.UpdateSliders();
    }
  }

  protected override OnMouseDown(x: number, y: number, _button: number): void {
    x -= this.Position.X + 5;
    y -= this.Position.Y + 5;
    if (x >= 0 && x < 256 && y >= 0 && y <= 128) {
      this.mouseDown = true;
      this.pickFromPosition(x, y);
    }

    if (this.mouseDown) {
      const [cr, cg, cb] = HSV_to_RGB(this.currentHue, this.currentSaturation, this.currentValue);
      this.UpdateTextboxes(cr, cg, cb, this.currentAlpha);
      this.UpdateSliders();
    }
  }

  protected override OnMouseUp(x: number, y: number, _button: number): void {
    if (this.mouseDown) {
      const [cr, cg, cb] = HSV_to_RGB(this.currentHue, this.currentSaturation, this.currentValue);
      this.UpdateTextboxes(cr, cg, cb, this.currentAlpha);
      this.UpdateSliders();
    }

    if (this.mouseDown) {
      this.mouseDown = false;
      x -= this.Position.X + 5;
      y -= this.Position.Y + 5;
      this.pickFromPosition(x, y);
    }
  }

  protected override OnKeyPress(key: number, _scan: number, repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {
    if (repeat)
      return;
    if (key === SDLK_TAB) {
      if (this.rValue.IsFocused())
        this.gValue.TabFocus();
      else if (this.gValue.IsFocused())
        this.bValue.TabFocus();
      else if (this.bValue.IsFocused())
        this.aValue.TabFocus();
      else if (this.aValue.IsFocused())
        this.rValue.TabFocus();
    }
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();
    const P = this.Position, S = this.Size;
    g.BlendFilledRect(P.X - 1, P.Y - 1, S.X + 2, S.Y + 2, WithAlpha(0x000000, this.currentAlpha));
    g.DrawRect(P.X, P.Y, S.X, S.Y, 0xFFFFFF);

    g.DrawRect(P.X + 4, P.Y + 4, 258, 130, 0xB4B4B4);

    const offset = { X: P.X + 5, Y: P.Y + 5 };

    //draw color square
    let lastx = -1, currx = 0;
    for (let saturation = 0; saturation <= 255; saturation += 2) {
      for (let hue = 0; hue <= 359; hue++) {
        currx = clamp_flt(f(hue), 0, 359) + offset.X;
        if (currx === lastx)
          continue;
        lastx = currx;
        const [cr, cg, cb] = HSV_to_RGB(hue, 255 - saturation, this.currentValue);
        g.BlendPixel(currx, ((saturation / 2) | 0) + offset.Y, RGBA(cr, cg, cb, this.currentAlpha));
      }
    }

    //Draw hue bar gradient
    const gradientWidth = this.hSlider.Size.X - 10;
    for (let rx = 0; rx < gradientWidth; rx++) {
      const hue = (rx * 360 / gradientWidth) | 0;
      const [red, green, blue] = HSV_to_RGB(hue, this.currentSaturation, this.currentValue);
      for (let ry = 0; ry < ((this.hSlider.Size.Y / 2) | 0) - 1; ry++) {
        g.BlendPixel(
          offset.X + this.hSlider.Position.X + rx, offset.Y + this.hSlider.Position.Y + ry,
          RGBA(red, green, blue, this.currentAlpha),
        );
      }
    }

    //draw color square pointer
    const currentHueX = clamp_flt(f(this.currentHue), 0, 359);
    const currentSaturationY = ((255 - this.currentSaturation) / 2) | 0;
    g.XorLine(offset.X + currentHueX, offset.Y + currentSaturationY - 5, offset.X + currentHueX, offset.Y + currentSaturationY - 1);
    g.XorLine(offset.X + currentHueX, offset.Y + currentSaturationY + 1, offset.X + currentHueX, offset.Y + currentSaturationY + 5);
    g.XorLine(offset.X + currentHueX - 5, offset.Y + currentSaturationY, offset.X + currentHueX - 1, offset.Y + currentSaturationY);
    g.XorLine(offset.X + currentHueX + 1, offset.Y + currentSaturationY, offset.X + currentHueX + 5, offset.Y + currentSaturationY);
  }
}
