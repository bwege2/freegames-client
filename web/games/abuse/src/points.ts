// points.cpp: lists of (x, y) byte pairs
import type { bFILE } from './imlib/specs.ts';

export const scaling = { scale_mult: 1, scale_div: 1 };

export class point_list {
  tot: number;
  data: Uint8Array;

  constructor(how_many = 0, Data: Uint8Array | null = null) {
    this.tot = how_many & 0xff;
    this.data = this.tot && Data ? Data.slice(0, this.tot * 2) : new Uint8Array(0);
  }

  static load(fp: bFILE): point_list {
    const p = new point_list();
    p.tot = fp.read_uint8();
    if (p.tot) {
      p.data = new Uint8Array(p.tot * 2);
      fp.read(p.data, p.tot * 2);
      for (let i = 0; i < p.tot * 2; i++) p.data[i] = ((p.data[i] * scaling.scale_mult) / scaling.scale_div) | 0;
    }
    return p;
  }

  save(fp: bFILE): void {
    fp.write([this.tot], 1);
    if (this.tot) fp.write(this.data, this.tot * 2);
  }

  size(): number { return 1 + 2 * this.tot; }
  copy(): point_list { return new point_list(this.tot, this.data); }
}
