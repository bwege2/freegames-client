// Fonts::init (fonts.cpp): the chalk fonts and pingus-small; pingus_small_fixnum, courier_small and lcd are
// pingus-small too. (verdana11 is the editor's.)
import { Font } from './gfx.ts';

export const Fonts = {} as {
  chalkLarge: Font; chalkNormal: Font; chalkSmall: Font; pingusSmall: Font; pingusSmallFixnum: Font; courierSmall: Font;
};

export function initFonts() {
  Fonts.chalkLarge = new Font('images/fonts/chalk-40px.font');
  Fonts.chalkNormal = new Font('images/fonts/chalk-20px.font');
  Fonts.chalkSmall = new Font('images/fonts/chalk-16px.font');
  Fonts.pingusSmall = new Font('images/fonts/pingus-small-20px.font');
  Fonts.pingusSmallFixnum = Fonts.pingusSmall;
  Fonts.courierSmall = Fonts.pingusSmall;
}

/** StringFormat::break_line: breaks at spaces (and CJK characters) so that lines fit `width` */
export function breakLine(text: string, width: number, font: Font): string {
  const chars = [...text];
  let out = '', lineWidth = 0, beg = 0;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i], u = c.codePointAt(0)!;
    if (u === 32 || u >= 0x3400) {
      const word = chars.slice(beg, i + 1).join('');
      const w = font.width(word);
      if (lineWidth + w > width) { out += '\n' + word; lineWidth = w; }
      else { out += word; lineWidth += w; }
      beg = i + 1;
    } else if (c === '\n') {
      lineWidth = 0;
    }
  }
  const word = chars.slice(beg).join('');
  const w = font.width(word);
  out += lineWidth + w > width ? '\n' + word : word;
  return out;
}

/** GameTime::ticks_to_realtime_string: "%2d:%02d" of ticks * 20 ms */
export function ticksToRealtime(ticks: number): string {
  if (ticks === -1) return 'unlimited';
  const total = Math.trunc(ticks * 20 / 1000);
  let seconds = total % 60;
  const minutes = Math.trunc(total / 60);
  if (seconds < 0) seconds = 0;
  return `${String(minutes).padStart(2, ' ')}:${String(seconds).padStart(2, '0')}`;
}
