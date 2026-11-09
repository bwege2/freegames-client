// The font probe of re/shatteredpixeldungeon/oracle/probe/FontProbe.java, on the port: the same fonts, sizes,
// parameters, characters and texts, through the translated libGDX (FreeTypeFontGenerator, BitmapFont,
// GlyphLayout, PixmapPacker) on the port's FreeType (src/gdx/freetype), printed as Java prints them. Fields
// that collide with a method of the program are renamed by the translator: Glyph.id_, width_, height_,
// GlyphLayout.width_, height_, FreeTypeFontParameter.size_, flip_, color_.
const CJK = '你好世界的一是不了人我在有他这中大来上国个到说们为子和你地出道也时年得就那要下以生会自着去之过家学对可里后小么心多天而能好都然没日于起还发成事只作当想看文无开手十用主行方又如前所本见经头面公同三已老从动两长知民样现战';
const TEXTS = ['Shattered Pixel Dungeon', 'You descend to floor 1 of the dungeon.', 'The quick brown fox jumps over the lazy dog!',
  '_Highlighted_ text, 12345 67890', 'Ångström éàü ß ÆØÅ ¿¡', 'Привет, мир'];
let LATIN = '';
for (let c = 32; c < 127; c++) LATIN += String.fromCharCode(c);
for (let c = 160; c < 256; c++) LATIN += String.fromCharCode(c);
for (let c = 0x400; c < 0x460; c++) LATIN += String.fromCharCode(c);
LATIN += '’“”…•€�';

export const PROBES: [string, string, number[]][] = [
  ['pixel_font', LATIN, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 24, 27, 28, 30, 32, 36, 40, 45, 48]],
  ['droid_sans', LATIN.substring(0, 95) + CJK, [6, 9, 12, 16, 18, 24, 32]],
];

/** What FontProbe prints for one font (the runtime booted, the game's assets as internal files). */
export function probeFont(rt: any, font: string, chars: string, sizes: number[], out: string[]) {
  const J = rt.$J;
  const G = 'com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator';
  const gen = J.make(G, 'com.badlogic.gdx.files.FileHandle', rt.Gdx.files.internal('fonts/' + font + '.ttf'));
  const Param = J.load(G + '$FreeTypeFontParameter');
  const Hinting = J.load(G + '$Hinting');
  const generateFont = J.m(G, 'generateFont(' + G + '$FreeTypeFontParameter)');
  const f = (x: number) => J.fstr(x);
  for (const size of sizes) {
    const packer = J.make('com.badlogic.gdx.graphics.g2d.PixmapPacker', 'int,int,com.badlogic.gdx.graphics.Pixmap$Format,int,boolean',
      1024, 1024, rt.Pixmap_Format.RGBA8888, 1, false);
    const p = J.make(G + '$FreeTypeFontParameter', '');
    void Param;
    p.size_ = size;
    p.flip_ = true;
    p.borderWidth = Math.fround(p.size_ / Math.fround(10));
    p.renderCount = size >= 20 ? 2 : 3;
    p.hinting = Hinting.None;
    p.spaceX = -J.d2i(p.borderWidth);
    p.incremental = true;
    p.characters = '�';
    p.packer = packer;
    const bf = gen[generateFont](p);
    const d = bf.getData();
    d.missingGlyph = d.getGlyph(0xfffd);
    out.push('font ' + font + ' ' + size + ' lineHeight=' + f(d.lineHeight) + ' capHeight=' + f(d.capHeight) + ' xHeight=' + f(d.xHeight)
      + ' ascent=' + f(d.ascent) + ' descent=' + f(d.descent) + ' down=' + f(d.down) + ' spaceXadvance=' + f(d.spaceXadvance)
      + ' pad=' + f(d.padTop) + ',' + f(d.padLeft) + ',' + f(d.padBottom) + ',' + f(d.padRight) + ' missing=' + (d.missingGlyph == null ? -1 : d.missingGlyph.id_));
    for (let i = 0; i < chars.length; i++) {
      const c = chars.charCodeAt(i);
      const g = d.getGlyph(c);
      if (g == null) { out.push('  ' + c + ' -'); continue; }
      out.push('  ' + c + ' id=' + g.id_ + ' w=' + g.width_ + ' h=' + g.height_ + ' xo=' + g.xoffset + ' yo=' + g.yoffset + ' xa=' + g.xadvance
        + ' src=' + g.srcX + ',' + g.srcY + ' page=' + g.page + ' uv=' + f(g.u) + ',' + f(g.v) + ',' + f(g.u2) + ',' + f(g.v2));
    }
    for (const t of TEXTS) {
      const l = J.make('com.badlogic.gdx.graphics.g2d.GlyphLayout', 'com.badlogic.gdx.graphics.g2d.BitmapFont,java.lang.CharSequence', bf, t);
      out.push('  layout w=' + f(l.width_) + ' h=' + f(l.height_) + ' ' + t);
    }
  }
}
