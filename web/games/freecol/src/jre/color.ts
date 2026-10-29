// @ts-nocheck
// java.awt.color.ColorSpace: the colour spaces Java2D's colour models name (sRGB, linear RGB, grey), with
// the conversions the JDK's colour management (LittleCMS, native) does for them.
import { $J, JObject, defineLib, IllegalArgumentException } from './lang.ts';

const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const gam = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

export class ColorSpace extends JObject {
  static TYPE_XYZ = 0;
  static TYPE_RGB = 5;
  static TYPE_GRAY = 6;
  static CS_sRGB = 1000;
  static CS_LINEAR_RGB = 1004;
  static CS_CIEXYZ = 1001;
  static CS_PYCC = 1002;
  static CS_GRAY = 1003;
  static spaces = new Map<number, ColorSpace>();
  type: number;
  n: number;
  id: number;
  constructor(type?: number, n?: number, id = 0) {
    super();
    this.type = type;
    this.n = n;
    this.id = id;
  }
  _ColorSpace(type: number, n: number) {
    this.type = type;
    this.n = n;
    return this;
  }
  static getInstance(id: number) {
    let cs = ColorSpace.spaces.get(id);
    if (!cs) {
      switch (id) {
      case 1000: case 1004: case 1002: cs = new ColorSpace(5, 3, id); break;
      case 1003: cs = new ColorSpace(6, 1, id); break;
      case 1001: cs = new ColorSpace(0, 3, id); break;
      default: throw new IllegalArgumentException('Unknown color space');
      }
      ColorSpace.spaces.set(id, cs);
    }
    return cs;
  }
  isCS_sRGB() {
    return this.id === 1000;
  }
  getType() {
    return this.type;
  }
  getNumComponents() {
    return this.n;
  }
  getName(i: number) {
    return this.type === 6 ? 'Gray' : ['Red', 'Green', 'Blue'][i] ?? 'Unnamed color component(' + i + ')';
  }
  getMinValue(_i: number) {
    return 0;
  }
  getMaxValue(_i: number) {
    return 1;
  }
  toRGB(c: number[]) {
    switch (this.id) {
    case 1003: {
      const v = Math.fround(gam(c[0]));
      return [v, v, v];
    }
    case 1004: return [gam(c[0]), gam(c[1]), gam(c[2])].map(Math.fround);
    default: return [Math.fround(c[0]), Math.fround(c[1]), Math.fround(c[2])];
    }
  }
  fromRGB(rgb: number[]) {
    switch (this.id) {
    case 1003: return [Math.fround(0.2125 * lin(rgb[0]) + 0.7154 * lin(rgb[1]) + 0.0721 * lin(rgb[2]))];
    case 1004: return [lin(rgb[0]), lin(rgb[1]), lin(rgb[2])].map(Math.fround);
    default: return [Math.fround(rgb[0]), Math.fround(rgb[1]), Math.fround(rgb[2])];
    }
  }
  toCIEXYZ(c: number[]) {
    const [r, g, b] = this.toRGB(c).map(lin);
    return [0.4361 * r + 0.3851 * g + 0.1431 * b, 0.2225 * r + 0.7169 * g + 0.0606 * b, 0.0139 * r + 0.0971 * g + 0.7141 * b].map(Math.fround);
  }
  fromCIEXYZ(x: number[]) {
    const r = 3.1340 * x[0] - 1.6174 * x[1] - 0.4907 * x[2];
    const g = -0.9788 * x[0] + 1.9161 * x[1] + 0.0335 * x[2];
    const b = 0.0719 * x[0] - 0.2290 * x[1] + 1.4052 * x[2];
    return this.fromRGB([r, g, b].map((v) => gam(Math.max(0, Math.min(1, v)))));
  }
  equals(o: any) {
    return o === this;
  }
}
defineLib(ColorSpace, 'java.awt.color.ColorSpace');
export const ICC_ColorSpace = ColorSpace;
void $J;
