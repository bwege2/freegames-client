// gui/interface/Appearance.h / Appearance.cpp and gui/Style.cpp
import { Border, Colour } from './Point.ts';
import { NoIcon } from '../../graphics/icons.ts';
import type { VideoBuffer } from '../../graphics/raster.ts';

export const AlignLeft = 0, AlignCentre = 1, AlignRight = 2;
export const AlignTop = 0, AlignMiddle = 1, AlignBottom = 2;

export class Appearance {
  private texture: VideoBuffer | null = null;
  static readonly AlignLeft = AlignLeft;
  static readonly AlignCentre = AlignCentre;
  static readonly AlignRight = AlignRight;
  static readonly AlignTop = AlignTop;
  static readonly AlignMiddle = AlignMiddle;
  static readonly AlignBottom = AlignBottom;

  VerticalAlign = AlignMiddle;
  HorizontalAlign = AlignCentre;
  BackgroundHover = Colour(0x14, 0x14, 0x14);
  BackgroundInactive = Colour(0, 0, 0);
  BackgroundActive = Colour(0xFF, 0xFF, 0xFF);
  BackgroundDisabled = Colour(0x0A, 0x0A, 0x0A);
  BackgroundPulse = false;
  TextHover = Colour(0xFF, 0xFF, 0xFF);
  TextInactive = Colour(0xFF, 0xFF, 0xFF);
  TextActive = Colour(0, 0, 0);
  TextDisabled = Colour(0x64, 0x64, 0x64);
  BorderHover = Colour(0xFF, 0xFF, 0xFF);
  BorderInactive = Colour(0xC8, 0xC8, 0xC8);
  BorderActive = Colour(0xEB, 0xEB, 0xEB);
  BorderFavorite = Colour(0xFF, 0xFF, 0x00);
  BorderDisabled = Colour(0x64, 0x64, 0x64);
  Margin = new Border(1, 4);
  Border = new Border(1);
  icon = NoIcon;

  GetTexture(): VideoBuffer | null {
    return this.texture;
  }
  SetTexture(texture: VideoBuffer | null): void {
    this.texture = texture;
  }
  /** the copy assignment `a->Appearance = b` */
  clone(): Appearance {
    const a = new Appearance();
    Object.assign(a, this);
    a.Margin = this.Margin.clone();
    a.Border = this.Border.clone();
    return a;
  }
}

/** gui/Style.cpp */
export const style = {
  Colour: {
    InformationTitle: Colour(140, 140, 255),
    WarningTitle: Colour(255, 216, 32),
    ErrorTitle: Colour(255, 64, 32),
    ConfirmButton: Colour(255, 255, 50),
    ActiveBorder: Colour(255, 255, 255),
    InactiveBorder: Colour(100, 100, 100),
    ActiveBackground: Colour(50, 50, 50),
    InactiveBackground: Colour(0, 0, 0),
  },
};
