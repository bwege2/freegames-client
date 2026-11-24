// @ts-nocheck
// OpenClonk 36de799: src/graphics/Bitmap256.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $own, $rd, $reinterp, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class tagBITMAPFILEHEADER {
  static $layout = [["bfType", 0, "u16", 0], ["bfSize", 2, "u32", 0], ["bfReserved1", 6, "u16", 0], ["bfReserved2", 8, "u16", 0], ["bfOffBits", 10, "u32", 0]];
  static $size = 14;
  bfType = 0;
  bfSize = 0;
  bfReserved1 = 0;
  bfReserved2 = 0;
  bfOffBits = 0;

  $clone() { return new tagBITMAPFILEHEADER().$assign(this); }
  $assign(o) {
    this.bfType = o.bfType;
    this.bfSize = o.bfSize;
    this.bfReserved1 = o.bfReserved1;
    this.bfReserved2 = o.bfReserved2;
    this.bfOffBits = o.bfOffBits;
    return this;
  }
}

export class tagBITMAPINFOHEADER {
  static $layout = [["biSize", 0, "u32", 0], ["biWidth", 4, "i32", 0], ["biHeight", 8, "i32", 0], ["biPlanes", 12, "u16", 0], ["biBitCount", 14, "u16", 0], ["biCompression", 16, "u32", 0], ["biSizeImage", 20, "u32", 0], ["biXPelsPerMeter", 24, "i32", 0], ["biYPelsPerMeter", 28, "i32", 0], ["biClrUsed", 32, "u32", 0], ["biClrImportant", 36, "u32", 0]];
  static $size = 40;
  biSize = 0;
  biWidth = 0;
  biHeight = 0;
  biPlanes = 0;
  biBitCount = 0;
  biCompression = 0;
  biSizeImage = 0;
  biXPelsPerMeter = 0;
  biYPelsPerMeter = 0;
  biClrUsed = 0;
  biClrImportant = 0;

  $clone() { return new tagBITMAPINFOHEADER().$assign(this); }
  $assign(o) {
    this.biSize = o.biSize;
    this.biWidth = o.biWidth;
    this.biHeight = o.biHeight;
    this.biPlanes = o.biPlanes;
    this.biBitCount = o.biBitCount;
    this.biCompression = o.biCompression;
    this.biSizeImage = o.biSizeImage;
    this.biXPelsPerMeter = o.biXPelsPerMeter;
    this.biYPelsPerMeter = o.biYPelsPerMeter;
    this.biClrUsed = o.biClrUsed;
    this.biClrImportant = o.biClrImportant;
    return this;
  }
}

export class tagRGBQUAD {
  static $layout = [["rgbBlue", 0, "u8", 0], ["rgbGreen", 1, "u8", 0], ["rgbRed", 2, "u8", 0], ["rgbReserved", 3, "u8", 0]];
  static $size = 4;
  rgbBlue = 0;
  rgbGreen = 0;
  rgbRed = 0;
  rgbReserved = 0;

  $clone() { return new tagRGBQUAD().$assign(this); }
  $assign(o) {
    this.rgbBlue = o.rgbBlue;
    this.rgbGreen = o.rgbGreen;
    this.rgbRed = o.rgbRed;
    this.rgbReserved = o.rgbReserved;
    return this;
  }
}

export class C4BMPInfo {
  static $layout = [["Head.bfType", 0, "u16", 0], ["Head.bfSize", 2, "u32", 0], ["Head.bfReserved1", 6, "u16", 0], ["Head.bfReserved2", 8, "u16", 0], ["Head.bfOffBits", 10, "u32", 0], ["Info.biSize", 14, "u32", 0], ["Info.biWidth", 18, "i32", 0], ["Info.biHeight", 22, "i32", 0], ["Info.biPlanes", 26, "u16", 0], ["Info.biBitCount", 28, "u16", 0], ["Info.biCompression", 30, "u32", 0], ["Info.biSizeImage", 34, "u32", 0], ["Info.biXPelsPerMeter", 38, "i32", 0], ["Info.biYPelsPerMeter", 42, "i32", 0], ["Info.biClrUsed", 46, "u32", 0], ["Info.biClrImportant", 50, "u32", 0]];
  static $size = 54;
  Head = new tagBITMAPFILEHEADER();
  Info = new tagBITMAPINFOHEADER();

  Default() {
    $.InplaceReconstruct$pC4BMPInfo(this);
  }

  Set$i32$i32$i32(iWdt, iHgt, iBitDepth) {
    C4BMPInfo.prototype.Default.call(this);
    this.Head.bfType = $rd($reinterp(S("BM"), "u16"));
    this.Head.bfSize = 54 + $u64n(Math.imul($.DWordAligned(iWdt), iHgt)) >>> 0;
    this.Head.bfOffBits = 54;
    this.Info.biSize = 40;
    this.Info.biWidth = iWdt;
    this.Info.biHeight = iHgt;
    this.Info.biPlanes = 1;
    this.Info.biBitCount = iBitDepth & 0xffff;
    this.Info.biCompression = 0;
    this.Info.biSizeImage = Math.imul(iWdt, iHgt) >>> 0;
    this.Info.biClrUsed = this.Info.biClrImportant = 0;
  }

  FileBitsOffset() {
    return this.Head.bfOffBits - 54 | 0;
  }

  $clone() { return new C4BMPInfo().$assign(this); }
  $assign(o) {
    this.Head.$assign(o.Head);
    this.Info.$assign(o.Info);
    return this;
  }
}

export class C4BMP256Info extends C4BMPInfo {
  Colors = $own([
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
  new tagRGBQUAD(),
]);

  Default() {
    $.InplaceReconstruct$pC4BMP256Info(this);
  }

  Set$i32$i32$pCStdPalette(iWdt, iHgt, Palette) {
    this.Default();
    this.Head.bfType = $rd($reinterp(S("BM"), "u16"));
    this.Head.bfSize = 1078 + $u64n(Math.imul($.DWordAligned(iWdt), iHgt)) >>> 0;
    this.Head.bfOffBits = 1078;
    this.Info.biSize = 40;
    this.Info.biWidth = iWdt;
    this.Info.biHeight = iHgt;
    this.Info.biPlanes = 1;
    this.Info.biBitCount = 8;
    this.Info.biCompression = 0;
    this.Info.biSizeImage = Math.imul(iWdt, iHgt) >>> 0;
    this.Info.biClrUsed = this.Info.biClrImportant = 256;
    for (let cnt = 0; cnt < 256; cnt = cnt + 1 | 0) {
      this.Colors[cnt].rgbRed = Palette.Colors[cnt] >>> 16 & 0xff;
      this.Colors[cnt].rgbGreen = (Palette.Colors[cnt] & 0xffff) >> 8 & 0xff;
      this.Colors[cnt].rgbBlue = Palette.Colors[cnt] & 0xff;
    }
  }

  Valid() {
    if (this.Head.bfType !== $rd($reinterp(S("BM"), "u16"))) {
      return false;
    }
    if (this.Info.biBitCount !== 8 || this.Info.biCompression !== 0) {
      return false;
    }
    return true;
  }

  FileBitsOffset() {
    return this.Head.bfOffBits - 1078 | 0;
  }

  $clone() { return new C4BMP256Info().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Colors = $own(o.Colors.map(($e0) => $e0.$clone()));
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4BMP256Info, C4BMPInfo, tagBITMAPFILEHEADER, tagBITMAPINFOHEADER, tagRGBQUAD });
