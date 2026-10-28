// imlib/fonts.cpp: bitmap fonts cut from a 32x8 grid of letters
import { image } from './image.ts';
import { TransImage } from './transimage.ts';

export class JCFont {
  tl: number;
  th: number;
  let: TransImage[] = [];

  constructor(letters: image) {
    this.tl = ((letters.w + 1) / 32) | 0;
    this.th = ((letters.h + 1) / 8) | 0;
    const tmp = new image(this.tl, this.th);
    for (let ch = 0; ch < 256; ch++) {
      tmp.clear();
      letters.put_part(tmp, 0, 0, (ch % 32) * this.tl, ((ch / 32) | 0) * this.th, (ch % 32) * this.tl + this.tl - 1,
        ((ch / 32) | 0) * this.th + this.th - 1, 1);
      this.let[ch] = new TransImage(tmp, 'JCfont');
    }
  }

  put_char(screen: image, x: number, y: number, ch: number, color = -1): void {
    const l = this.let[ch & 0xff];
    if (l) {
      if (color >= 0) l.PutColor(screen, x, y, color);
      else l.PutImage(screen, x, y);
    }
  }

  put_string(screen: image, x: number, y: number, st: string, color = -1): void {
    for (let i = 0; i < st.length && st.charCodeAt(i) !== 0; i++) {
      this.put_char(screen, x, y, st.charCodeAt(i), color);
      x += this.tl;
    }
  }

  height(): number { return this.th; }
  length(): number { return this.tl; }
  width(): number { return this.tl; }
}
