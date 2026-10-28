// ui/volumewindow.cpp: the main menu's volume window (sound effects and music, up and down)
import { Jwindow } from './imlib/jwindow.ts';
import { image } from './imlib/image.ts';
import { info_field } from './imlib/input.ts';
import { SPEC_IMAGE } from './imlib/specs.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { S } from './sdlport/sound.ts';
import { ico_button } from './gui.ts';
import { PR } from './property.ts';
import { symbol_str } from './clisp.ts';
import { ID_MUSIC_DOWN, ID_MUSIC_UP, ID_SFX_DOWN, ID_SFX_UP } from './id.ts';

export class VolumeWindow extends Jwindow {
  slider!: number;
  u_u!: number;
  u_d!: number;
  u_ua!: number;
  u_da!: number;
  d_u!: number;
  d_d!: number;
  d_ua!: number;
  d_da!: number;
  bg!: number;

  /** new VolumeWindow(): Jwindow("Volume") (a hidden window without fields), then the body below.
   *  Jwindow's constructor of the port builds a whole framed window, so the object is made the way
   *  Jwindow.named makes one. */
  static create(): VolumeWindow {
    const w = Object.create(VolumeWindow.prototype) as VolumeWindow;
    (w as unknown as { init_named(name: string | null): void }).init_named('Volume');
    w.init();
    return w;
  }

  private init(): void {
    const ff = 'art/frame.spe';
    this.u_u = cache.reg(ff, 'u_u', SPEC_IMAGE, 1);
    this.u_d = cache.reg(ff, 'u_u', SPEC_IMAGE, 1);
    this.u_ua = cache.reg(ff, 'u_ua', SPEC_IMAGE, 1);
    this.u_da = cache.reg(ff, 'u_da', SPEC_IMAGE, 1);
    this.d_u = cache.reg(ff, 'd_u', SPEC_IMAGE, 1);
    this.d_d = cache.reg(ff, 'd_u', SPEC_IMAGE, 1);
    this.d_ua = cache.reg(ff, 'd_ua', SPEC_IMAGE, 1);
    this.d_da = cache.reg(ff, 'd_da', SPEC_IMAGE, 1);
    this.slider = cache.reg(ff, 'volume_slide', SPEC_IMAGE, 1);
    this.x = PR.prop!.getd('volume_x', ((G.xres / 2) | 0) - 20);
    this.y = PR.prop!.getd('volume_y', ((G.yres / 2) | 0) - 50);
    // clang evaluates the arguments left to right: symbol_str("SFXv") before the fields after it
    const sfx_text = symbol_str('SFXv');
    const music_text = symbol_str('MUSICv');
    const music = new info_field(10, 86, 0, music_text, null);
    const music_up = new ico_button(21, 72, ID_MUSIC_UP, this.u_u, this.u_d, this.u_ua, this.u_da, music);
    const music_down = new ico_button(10, 72, ID_MUSIC_DOWN, this.d_u, this.d_d, this.d_ua, this.d_da, music_up);
    const sfx = new info_field(15, 42, 0, sfx_text, music_down);
    const sfx_up = new ico_button(21, 27, ID_SFX_UP, this.u_u, this.u_d, this.u_ua, this.u_da, sfx);
    this.inm.add(new ico_button(10, 27, ID_SFX_DOWN, this.d_u, this.d_d, this.d_ua, this.d_da, sfx_up));

    //reconfigure();
    this.bg = cache.reg(ff, 'vcontrol', SPEC_IMAGE, 1);
    this.l = cache.img(this.bg).Size().x;
    this.h = cache.img(this.bg).Size().y;
    const sz = cache.img(this.bg).Size();
    this.screen = new image(sz.x, sz.y, null, 2);
    this.redraw();
  }

  redraw(): void {
    cache.img(this.bg).put_image(this.screen, 0, 0);
    this.draw_music_vol();
    this.draw_sfx_vol();
    this.inm.redraw();
  }

  draw_vol(x1: number, y1: number, x2: number, y2: number, t: number, max: number, _c1: number, c2: number): void {
    let dx = x1 + ((Math.imul(t, x2 - x1) / max) | 0);
    if (t !== 0) {
      cache.img(this.slider).put_image(this.screen, x1, y1);
      // screen->bar(x1,y1,dx,y2,c1);
    } else dx--;

    if (dx < x2) this.screen.bar(dx + 1, y1, x2, y2, c2);
  }

  draw_sfx_vol(): void {
    this.draw_vol(6, 16, 34, 22, S.sfx_volume, 127, G.pal.find_closest(200, 75, 19), G.pal.find_closest(40, 0, 0));
  }

  draw_music_vol(): void {
    this.draw_vol(6, 61, 34, 67, S.music_volume, 127, G.pal.find_closest(255, 0, 0), G.pal.find_closest(40, 0, 0));
  }
}
