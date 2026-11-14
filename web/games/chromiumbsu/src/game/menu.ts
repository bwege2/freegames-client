// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/MenuGL.cpp, the main menu with the
// chrome title, the options, the high scores, the credits and the help messages.
import { cos } from '../libm.ts';
import {
  GL_CLAMP, GL_DEPTH_TEST, GL_LEQUAL, GL_LINEAR, GL_LINEAR_MIPMAP_NEAREST, GL_MODELVIEW, GL_ONE, GL_ONE_MINUS_SRC_ALPHA,
  GL_QUADS, GL_REPEAT, GL_SRC_ALPHA, GL_TEXTURE, GL_TEXTURE_GEN_S, GL_TEXTURE_GEN_T, GL_TRIANGLE_STRIP,
  IMG_BLEND3, IMG_BUILDMIPMAPS, IMG_NOMIPMAPS, IMG_SOLID, type Texture,
} from '../gl.ts';
import * as A from './audio.ts';
import { textGeometryBSU, textGeometryChromium } from './title.ts';
import { Game, HI_SCORE_HIST, MAX_SCREEN_SIZE, type Global } from './global.ts';

const f = Math.fround;

export const NewGame = 0, GameLevel = 1, SkillLevel = 2, Graphics = 3, FullScreen = 4, ScreenSize = 5,
  Sound = 6, Music = 7, MovementSpeed = 8, Quit = 9, NumSelections = 10;
export const KeyEnter = 0, KeySpace = 1, KeyTab = 2, KeyEscape = 3, KeyUp = 4, KeyDown = 5, KeyLeft = 6, KeyRight = 7;
export const ButtonLeft = 0, ButtonMiddle = 1, ButtonRight = 2;

const mssgHelpText = [
  '  d o   n o t   a l l o w  -a n y-   e n e m i e s   g e t   p a s t   y o u !',
  '  e v e r y   e n e m y   t h a t   g e t s   b y   c o s t s   y o u   a   l i f e !',
  '  a l l o w   p o w e r - u p s   t o   p a s s   b y   f o r   b i g   p o i n t s !',
  '  c r a s h   i n t o   e n e m i e s   t o   d e s t r o y   t h e m !',
  '  r i g h t   c l i c k   t w i c e   t o   s e l f - d e s t r u c t !',
  '  s e l f - d e s t r u c t   t o   p r e s e r v e   y o u r   a m m u n i t i o n !',
  '  d o w n l o a d   C h r o m i u m   B. S. U.   a t   http://chromium-bsu.sf.net/',
];

function skillString(i: number): string {
  switch (i) {
    case 2: return 'fish in a barrel';
    case 3: return 'wimp';
    case 4: return 'easy';
    case 5: return 'normal';
    case 6: return 'experienced';
    case 7: return 'fun';
    case 8: return 'insane';
    case 9: return 'impossible';
    default: return '-';
  }
}

export class MenuGL {
  curSel = NewGame;
  menuText: string[] = [];
  listChrom = 0;
  listBSU = 0;
  envTex: Texture | null = null;
  csrTex: Texture | null = null;
  backTex: Texture | null = null;
  elecTex: Texture | null = null;
  updwnTex: Texture | null = null;
  elecOffX = 0;
  elecOffY = 0;
  elecStretch = f(10.0);
  textAngle = 0;
  textCount = 0;
  txtHeight = f(0.5);
  butHeight = f(0.5);
  butWidth = f(2.0);
  butOffset = f(3.05);
  thickText = true;
  titleTilt = f(-10.0);
  mssgAlpha = 0;
  mssgText = ' ';
  mssgIndex = 0;
  mssgCount = 0;
  mssgHelpOverride = false;
  // the static variables of drawGL (credits), drawTitle and drawTitleBack
  private credits = 0;
  private tiltCount = 600;
  private ta0 = f(-60.0);
  private ta1 = f(-90.0);
  private amt = 0;
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    const tr = game.tr;
    this.butWidth = f(this.butHeight * 4.0);
    this.menuText[NewGame] = tr('n e w    g a m e');
    this.menuText[GameLevel] = tr('l e v e l');
    this.menuText[SkillLevel] = tr('s k i l l');
    this.menuText[Graphics] = tr('g f x    d e t a i l');
    this.menuText[FullScreen] = tr('f u l l s c r e e n');
    this.menuText[ScreenSize] = tr('s c r e e n    s i z e');
    this.menuText[Sound] = tr('s o u n d    f x    v o l u m e');
    this.menuText[Music] = tr('m u s i c    v o l u m e');
    this.menuText[MovementSpeed] = tr('m o v e m e n t   s p e e d');
    this.menuText[Quit] = tr('q u i t');
    this.loadTextures();
    this.thickText = true;
    this.mssgAlpha = 0.0;
    this.mssgText = ' ';
    this.mssgIndex = 0;
    this.mssgCount = 0;
    this.mssgHelpOverride = false;
    this.startMenu();
  }

  loadTextures(): void {
    const img = this.game.images;
    const gl = this.game.gl;
    this.elecTex = img.load('electric.png', IMG_NOMIPMAPS, IMG_BLEND3, GL_CLAMP, GL_LINEAR, GL_LINEAR);
    this.backTex = img.load('menu_back.png', IMG_NOMIPMAPS, IMG_SOLID, GL_REPEAT, GL_LINEAR, GL_LINEAR);
    this.csrTex = img.load('heroAmmoFlash00.png');
    this.updwnTex = img.load('menu_updown.png');
    // environment map (sphere mapping)
    this.envTex = img.load('reflect.png', IMG_BUILDMIPMAPS, IMG_SOLID, GL_CLAMP, GL_LINEAR_MIPMAP_NEAREST, GL_LINEAR);
    this.listChrom = gl.genLists(1);
    this.listBSU = gl.genLists(1);
    this.createLists((this.thickText = true));
  }

  private createLists(thick: boolean): void {
    const gl = this.game.gl;
    this.titleTilt = f(-10.0);
    gl.newList(this.listChrom);
    textGeometryChromium(gl, thick);
    gl.endList();
    gl.newList(this.listBSU);
    textGeometryBSU(gl, thick);
    gl.endList();
  }

  startMenu(): void {
    this.elecOffX = 0.0;
    this.textAngle = 90.0;
    this.textCount = 500;
    this.createLists((this.thickText = true));
    this.game.cursorPos[0] = 0.0;
    this.game.cursorPos[1] = 0.0;
  }

  drawGL(): void {
    const g = this.game;
    const gl = g.gl;
    const config = g.config;
    const hiScore = g.hiScore;
    const text = g.text;
    if (--this.textCount < 0) this.textCount = 500;
    if (this.textAngle > 0.0) this.textAngle = f(this.textAngle - 5.0);
    else this.textAngle = 0.0;
    gl.clear();
    gl.loadIdentity();
    gl.translatef(0.0, 0.0, config.zTrans());
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    gl.color4f(1.0, 1.0, 1.0, 1.0);
    g.ground.drawGL();
    g.audio.update();
    let szx = f(9.0);
    let szy = f(4.5);
    const top = f(1.0);
    const left = f(-8.0);
    const inc = f(-this.txtHeight * 2.5);
    // credits texture
    gl.pushMatrix();
    gl.bindTexture(this.backTex);
    gl.texCoord2f(1.0, 0.0);
    // darken
    gl.begin(GL_QUADS);
    gl.color4f(0.0, 0.0, 0.0, 0.8);
    gl.vertex3f(szx, szy + 0.25 - 3.0, 10.0);
    gl.vertex3f(-szx, szy + 0.25 - 3.0, 10.0);
    gl.color4f(0.0, 0.0, 0.0, 0.4);
    gl.vertex3f(-szx, -13.0, 10.0);
    gl.vertex3f(szx, -13.0, 10.0);
    gl.end();
    gl.begin(GL_QUADS);
    gl.color4f(0.0, 0.0, 0.0, this.mssgAlpha);
    gl.vertex3f(16.0, -10.7, 10.0);
    gl.vertex3f(-16.0, -10.7, 10.0);
    gl.color4f(0.0, 0.0, 0.0, this.mssgAlpha);
    gl.vertex3f(-16.0, -11.9, 10.0);
    gl.vertex3f(16.0, -11.9, 10.0);
    gl.end();
    szx = f(12.0);
    szy = f(this.txtHeight * 0.5);
    gl.pushMatrix();
    gl.translatef(left, f(top + f(inc * this.curSel)), 10.0);
    gl.begin(GL_QUADS);
    gl.color4f(0.5, 0.5, 1.0, 1.0);
    gl.vertex3f(-szx, szy * 3.0, 0.0);
    gl.vertex3f(-szx, -szy, 0.0);
    gl.color4f(0.2, 0.2, 1.0, 0.0);
    gl.vertex3f(szx, -szy, 0.0);
    gl.vertex3f(szx, szy * 3.0, 0.0);
    gl.end();
    this.drawIndicator();
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    this.drawElectric();
    gl.popMatrix();
    gl.color4f(1.0, 1.0, 1.0, 0.9);
    let sc = f(0.035);
    for (let i = 0; i < NumSelections; i++) {
      gl.pushMatrix();
      gl.translatef(left, f(top + f(inc * i)), 10.0);
      gl.rotatef(this.textAngle, 1.0, 0.0, 0.0);
      gl.scalef(sc, sc * 0.75, 1.0);
      text.render(this.menuText[i]);
      gl.popMatrix();
    }
    {
      let fr = f(-g.frame);
      let r = f(cos(fr * 0.02));
      gl.pushMatrix();
      gl.color4f(1.0, 1.0, 1.0, 0.6 + 0.2 * r);
      gl.translatef(-18.75, -8.5, 0.0);
      gl.scalef(sc, sc * 0.75, 1.0);
      text.render(g.tr('high scores'));
      gl.translatef(-100.0, -30.0, 0.0);
      const nowTime = g.now();
      const l = config.intSkill();
      let recentHiScore = -1;
      let mostRecent = 0;
      for (let i = 0; i < HI_SCORE_HIST; i++) {
        // highlight a score for 5 minutes
        if (hiScore.getDate(l, i) > nowTime - 300 && hiScore.getDate(l, i) > mostRecent) {
          recentHiScore = i;
          mostRecent = hiScore.getDate(l, i);
        }
      }
      for (let i = 0; i < HI_SCORE_HIST; i++) {
        fr = f(fr + 30.0);
        r = f(cos(fr * 0.02));
        if (i === recentHiScore) gl.color4f(1.5, 0.5, 0.5, 0.6 + 0.1 * r);
        else gl.color4f(1.0, 1.0, 1.0, 0.2 + 0.2 * r);
        const buf = String(Math.trunc(hiScore.getScore(config.intSkill(), i)));
        const trans = f(80.0 + text.advance(g.tr('high scores')) - text.advance(buf));
        gl.translatef(trans, 0.0, 0.0);
        text.render(buf);
        gl.translatef(-trans, -30.0, 0.0);
      }
      gl.popMatrix();
    }
    // credits
    {
      let n = 0;
      let alpha: number;
      if (this.credits > 75.0) this.credits = 0.0;
      this.credits += 0.2;
      const c = this.credits;
      gl.pushMatrix();
      if (c > 25) alpha = f((0.4 * (75.0 - c)) / 50.0);
      else alpha = f(0.4);
      gl.color4f(1.0, 1.0, 1.0, alpha);
      sc = f(0.03);
      gl.translatef(14.0, -11.5, 0.0);
      gl.scalef(sc, sc, 1.0);
      gl.translatef(-c * 1.5, c, 0.0);
      if (c < 3) n = Math.trunc(c);
      else n = 3;
      if (n > 0) text.render(g.tr('the'), n);
      gl.translatef(c, -38 + c, 0.0);
      if (c < 10) n = Math.trunc(c - 3);
      else n = 7;
      if (n > 0) text.render(g.tr('reptile'), n);
      gl.translatef(c, -38 + c, 0.0);
      if (c < 16) n = Math.trunc(c) - 10;
      else n = 6;
      if (n > 0) text.render(g.tr('labour'), n);
      gl.translatef(c, -38 + c, 0.0);
      if (c < 23) n = Math.trunc(c - 16);
      else n = 7;
      if (n > 0) text.render(g.tr('project'), n);
      gl.popMatrix();
    }
    // help message
    if (this.mssgAlpha > 0.0) {
      if (this.mssgHelpOverride) gl.color4f(1.3, this.mssgAlpha, this.mssgAlpha, this.mssgAlpha);
      else gl.color4f(0.5, 0.5, 0.9, 0.2 + this.mssgAlpha);
      sc = f(0.042);
      gl.translatef(-19.5, -14.0, 0.0);
      gl.scalef(sc, sc * 0.75, 1.0);
      const len = this.mssgText.length;
      let ti = Math.trunc(112.0 * this.mssgAlpha) >>> 0;
      if (ti > len) ti = len;
      if (ti) text.render(this.mssgText, ti);
      this.mssgAlpha = f(this.mssgAlpha - 0.004);
      gl.color4f(1.0, 1.0, 1.0, 1.0);
    }
    gl.popMatrix();
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    gl.pushMatrix();
    gl.translatef(0.0, 4.75, 25.0);
    gl.color4f(1.0, 1.0, 1.0, 1.0);
    gl.depthMask(false);
    this.drawTitleBack();
    gl.depthMask(true);
    this.drawTitle();
    gl.popMatrix();
    if (this.thickText && g.fps < 30) this.createLists((this.thickText = false));
    if (!this.thickText && g.fps > 40) this.createLists((this.thickText = true));
    // help messages
    if (this.mssgHelpOverride && this.mssgAlpha < 0.05) {
      this.mssgHelpOverride = false;
      this.mssgCount = 0;
    }
    if (!this.mssgHelpOverride) {
      const interval = this.mssgCount++ % 500;
      if (!interval) {
        this.mssgText = g.tr(mssgHelpText[this.mssgIndex % mssgHelpText.length]);
        this.mssgIndex++;
      }
      if (interval < 150) this.mssgAlpha = f(interval / 150.0);
    }
  }

  private drawIndicator(): void {
    const g = this.game;
    const gl = g.gl;
    const config = g.config;
    let buf = '';
    const szx = f(10.0);
    const szy = this.txtHeight;
    let level = 0.0;
    const sc = f(0.025);
    switch (this.curSel) {
      case GameLevel:
        level = f(g.gameLevel / 9.0);
        buf = String(g.gameLevel);
        break;
      case SkillLevel: {
        level = config.gameSkillBase();
        const tmp = Math.trunc((level + 0.05) * 10.0);
        buf = skillString(tmp);
        break;
      }
      case Graphics:
        level = f(config.gfxLevel() / 2.0);
        buf = ['low', 'med', 'high'][config.gfxLevel()];
        break;
      case ScreenSize:
        level = f(config.approxScreenSize() / MAX_SCREEN_SIZE);
        buf = `${config.screenW()}x${config.screenH()}`;
        break;
      case FullScreen:
        level = config.fullScreen() ? 1 : 0;
        buf = config.fullScreen() ? 'true' : 'false';
        break;
      case Sound:
        level = config.volSound();
        buf = String(Math.trunc((level + 0.05) * 10.0));
        break;
      case Music:
        level = config.volMusic();
        buf = String(Math.trunc((level + 0.05) * 10.0));
        break;
      case MovementSpeed:
        level = f(config.movementSpeed() * 10.0);
        buf = String(Math.trunc((level + 0.005) * 100.0));
        break;
      default:
        level = -5.0;
        break;
    }
    gl.pushMatrix();
    gl.translatef(0.0, -this.txtHeight, 0.0);
    gl.begin(GL_QUADS);
    gl.color4f(1.0, 1.0, 1.0, 0.3);
    gl.vertex3f(f(szx + szy), szy, 0.0);
    gl.vertex3f(-szx, szy, 0.0);
    gl.color4f(1.0, 1.0, 1.0, 0.15);
    gl.vertex3f(-szx, 0.0, 0.0);
    gl.vertex3f(szx, 0.0, 0.0);
    gl.end();
    gl.pushMatrix();
    if (level > -1.0) {
      gl.begin(GL_QUADS);
      gl.color4f(1.0, 0.0, 0.0, 1.0);
      gl.vertex3f(f(szy + f(szx * level)), szy, 0.0);
      gl.vertex3f(0.0, szy, 0.0);
      gl.color4f(0.0, 0.0, 0.0, 0.0);
      gl.vertex3f(0.0, 0.0, 0.0);
      gl.vertex3f(f(szx * level), 0.0, 0.0);
      gl.end();
      // +/- buttons
      const bx = this.butWidth, by = this.butHeight, bo = this.butOffset;
      gl.bindTexture(this.updwnTex);
      gl.begin(GL_QUADS);
      gl.color4f(1.0, 1.0, 1.0, 0.6);
      gl.texCoord2f(1.0, 0.0); gl.vertex3f(f(bx - bo), by, 0.0);
      gl.texCoord2f(0.0, 0.0); gl.vertex3f(0.0 - bo, by, 0.0);
      gl.texCoord2f(0.0, 1.0); gl.vertex3f(0.0 - bo, 0.0, 0.0);
      gl.texCoord2f(1.0, 1.0); gl.vertex3f(f(bx - bo), 0.0, 0.0);
      gl.end();
      gl.color4f(1.0, 1.0, 1.0, 0.5);
      gl.translatef(11.0, 0.0, 0.0);
      gl.scalef(sc, sc, 1.0);
      g.text.render(buf);
    }
    gl.popMatrix();
    gl.popMatrix();
  }

  private drawElectric(): void {
    const g = this.game;
    const gl = g.gl;
    const es = this.elecStretch;
    this.elecOffY = f(g.rand.F * 0.7);
    if ((this.elecOffX = f(this.elecOffX + 0.175)) > es) this.elecOffX = -5.0;
    const szx = f(30.0);
    const szy = this.txtHeight;
    gl.bindTexture(this.elecTex);
    gl.pushMatrix();
    gl.translatef(0.0, this.txtHeight * 0.5, 0.0);
    gl.begin(GL_QUADS);
    gl.color4f(1.0, 1.0, 1.0, 1.0);
    gl.texCoord2f(this.elecOffX, this.elecOffY + 0.3); gl.vertex3f(-8.0, szy, 0.0);
    gl.texCoord2f(this.elecOffX, this.elecOffY); gl.vertex3f(-8.0, -szy, 0.0);
    gl.color4f(0.0, 0.0, 0.1, 1.0);
    gl.texCoord2f(f(this.elecOffX - es), this.elecOffY); gl.vertex3f(szx, -szy, 0.0);
    gl.texCoord2f(f(this.elecOffX - es), this.elecOffY + 0.3); gl.vertex3f(szx, szy, 0.0);
    gl.end();
    gl.popMatrix();
  }

  private drawTitleBack(): void {
    const gl = this.game.gl;
    const cc = [1.0, 1.0, 1.0, 0.0];
    const cw = [1.0, 1.0, 1.0, 1.0];
    const w = f(9.0), a = f(2.0), h = f(1.4), z = f(0.5);
    const as = f(a / f(w + a));
    const at = f(a / f(h + a));
    const s1 = f(1.0 - as), t1 = f(1.0 - at);
    gl.bindTexture(this.backTex);
    gl.matrixMode(GL_TEXTURE);
    gl.pushMatrix();
    gl.translatef(this.amt * 0.1, this.amt * 0.5, 0.0);
    gl.rotatef(-this.amt * 100.0, 0.0, 1.0, 1.0);
    this.amt = f(this.amt - 0.01);
    const v = (s: number, t: number, c: number[], x: number, y: number, zz: number) => {
      gl.texCoord2f(s, t);
      gl.color4f(c[0], c[1], c[2], c[3]);
      gl.vertex3f(x, y, zz);
    };
    const wa = f(w + a), ha = f(h + a);
    // top right
    gl.begin(GL_TRIANGLE_STRIP);
    v(1.0, t1, cc, wa, h, 0.0); v(1.0, 1.0, cc, wa, ha, 0.0); v(s1, t1, cw, w, h, 0.0);
    v(s1, 1.0, cc, w, ha, 0.0); v(0.0, t1, cw, 0.0, h, 0.0); v(0.0, 1.0, cc, 0.0, ha, 0.0);
    gl.end();
    gl.begin(GL_TRIANGLE_STRIP);
    v(1.0, 0.0, cc, wa, 0.0, z); v(1.0, t1, cc, wa, h, 0.0); v(s1, 0.0, cw, w, 0.0, z);
    v(s1, t1, cw, w, h, 0.0); v(0.0, 0.0, cw, 0.0, 0.0, z); v(0.0, t1, cw, 0.0, h, 0.0);
    gl.end();
    // top left
    gl.begin(GL_TRIANGLE_STRIP);
    v(0.0, t1, cw, 0.0, h, 0.0); v(0.0, 1.0, cc, 0.0, ha, 0.0); v(s1, t1, cw, -w, h, 0.0);
    v(s1, 1.0, cc, -w, ha, 0.0); v(1.0, t1, cc, -wa, h, 0.0); v(1.0, 1.0, cc, -wa, ha, 0.0);
    gl.end();
    gl.begin(GL_TRIANGLE_STRIP);
    v(0.0, 0.0, cw, 0.0, 0.0, z); v(0.0, t1, cw, 0.0, h, 0.0); v(s1, 0.0, cw, -w, 0.0, z);
    v(s1, t1, cw, -w, h, 0.0); v(1.0, 0.0, cc, -wa, 0.0, z); v(1.0, t1, cc, -wa, h, 0.0);
    gl.end();
    // bottom right
    gl.begin(GL_TRIANGLE_STRIP);
    v(1.0, t1, cc, wa, -h, 0.0); v(1.0, 0.0, cc, wa, 0.0, z); v(s1, t1, cw, w, -h, 0.0);
    v(s1, 0.0, cw, w, 0.0, z); v(0.0, t1, cw, 0.0, -h, 0.0); v(0.0, 0.0, cw, 0.0, 0.0, z);
    gl.end();
    gl.begin(GL_TRIANGLE_STRIP);
    v(1.0, 1.0, cc, wa, -ha, 0.0); v(1.0, t1, cc, wa, -h, 0.0); v(s1, 1.0, cc, w, -ha, 0.0);
    v(s1, t1, cw, w, -h, 0.0); v(0.0, 1.0, cc, 0.0, -ha, 0.0); v(0.0, t1, cw, 0.0, -h, 0.0);
    gl.end();
    // bottom left
    gl.begin(GL_TRIANGLE_STRIP);
    v(0.0, t1, cw, 0.0, -h, 0.0); v(0.0, 0.0, cw, 0.0, 0.0, z); v(s1, t1, cw, -w, -h, 0.0);
    v(s1, 0.0, cw, -w, 0.0, z); v(1.0, t1, cc, -wa, -h, 0.0); v(1.0, 0.0, cc, -wa, 0.0, z);
    gl.end();
    gl.begin(GL_TRIANGLE_STRIP);
    v(0.0, 1.0, cc, 0.0, -ha, 0.0); v(0.0, t1, cw, 0.0, -h, 0.0); v(s1, 1.0, cc, -w, -ha, 0.0);
    v(s1, t1, cw, -w, -h, 0.0); v(1.0, 1.0, cc, -wa, -ha, 0.0); v(1.0, t1, cc, -wa, -h, 0.0);
    gl.end();
    gl.popMatrix();
    gl.matrixMode(GL_MODELVIEW);
  }

  private drawTitle(): void {
    const gl = this.game.gl;
    if (this.ta0 < 90.0) this.ta0 = f(this.ta0 + 0.7);
    else if (!this.thickText) this.ta0 = f(this.ta0 + 180.0);
    else this.ta0 = f(this.ta0 + 5.0);
    if (this.ta0 > 270.0) this.ta0 = f(this.ta0 - 360.0);
    if (this.ta1 < 90.0) this.ta1 = f(this.ta1 + 0.55);
    else if (!this.thickText) this.ta1 = f(this.ta1 + 180.0);
    else this.ta1 = f(this.ta1 + 8.0);
    if (this.ta1 > 270.0) this.ta1 = f(this.ta1 - 360.0);
    if (this.thickText) {
      this.tiltCount--;
      if (this.tiltCount === 0) this.titleTilt = f(360.0 + this.titleTilt);
      else if (this.tiltCount < 0) {
        this.titleTilt = f(this.titleTilt - 1.0);
        if (this.titleTilt < -10.0) {
          this.tiltCount = 1500;
          this.titleTilt = -10.0;
        }
      } else this.titleTilt = f(this.titleTilt - 0.01);
    }
    gl.enable(GL_DEPTH_TEST);
    gl.depthFunc(GL_LEQUAL);
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    gl.color4f(1.0, 1.0, 1.0, 1.0);
    gl.pushMatrix();
    gl.enable(GL_TEXTURE_GEN_S);
    gl.enable(GL_TEXTURE_GEN_T);
    gl.bindTexture(this.envTex);
    gl.pushMatrix();
    gl.translatef(0.0, 1.0, 0.0);
    gl.rotatef(this.titleTilt, 1.0, 0.0, 0.0);
    gl.rotatef(this.ta0, 0.0, 1.0, 0.0);
    gl.callList(this.listChrom);
    gl.popMatrix();
    gl.pushMatrix();
    gl.translatef(0.0, -1.0, 0.0);
    gl.rotatef(this.titleTilt, 1.0, 0.0, 0.0);
    gl.rotatef(this.ta1, 0.0, 1.0, 0.0);
    gl.callList(this.listBSU);
    gl.popMatrix();
    gl.disable(GL_TEXTURE_GEN_S);
    gl.disable(GL_TEXTURE_GEN_T);
    gl.popMatrix();
    gl.disable(GL_DEPTH_TEST);
  }

  keyHit(key: number): void {
    switch (key) {
      case KeyUp:
        if (this.curSel === 0) this.curSel = NumSelections - 1;
        else this.curSel = this.curSel - 1;
        this.elecOffX = 0.0;
        break;
      case KeyDown:
        this.curSel = (this.curSel + 1) % NumSelections;
        this.elecOffX = 0.0;
        break;
      case KeyLeft: this.decItem(); break;
      case KeyRight: this.incItem(); break;
      case KeyEnter: this.activateItem(); break;
      default: break;
    }
  }

  private message(text: string): void {
    this.mssgHelpOverride = true;
    this.mssgAlpha = f(1.1);
    this.mssgText = text;
  }

  private activateItem(): void {
    const g = this.game;
    const config = g.config;
    switch (this.curSel) {
      case NewGame:
        g.gameMode = Game;
        g.newGame();
        g.toolkit.grabMouse(true);
        g.audio.setMusicMode(A.MusicGame);
        break;
      case FullScreen:
        config.setFullScreen(!config.fullScreen());
        g.deleteTextures();
        if (!g.toolkit.setVideoMode()) {
          this.message(config.fullScreen() ? '---- error setting full screen mode ----' : '---- error setting window mode ----');
          config.setFullScreen(!config.fullScreen());
        }
        g.loadTextures();
        break;
      case Quit:
        g.gameQuit = true;
        break;
      default:
        break;
    }
  }

  private incItem(): void {
    const g = this.game;
    const config = g.config;
    const pos = new Float32Array([0.0, 0.0, 25.0]);
    switch (this.curSel) {
      case NewGame:
        this.activateItem();
        break;
      case SkillLevel:
        config.setGameSkillBase(config.gameSkillBase() + 0.1);
        g.newGame();
        break;
      case GameLevel:
        g.gameLevel++;
        if (g.gameLevel > config.maxLevel()) {
          this.message(`---- you must complete level ${config.maxLevel()} before you can select level ${g.gameLevel} ----`);
          g.gameLevel = config.maxLevel();
        } else g.newGame();
        break;
      case Graphics:
        config.setGfxLevel(config.gfxLevel() + 1);
        break;
      case ScreenSize:
        config.setScreenSize(config.approxScreenSize() + 1);
        g.deleteTextures();
        if (!g.toolkit.setVideoMode()) {
          this.message('---- error setting screen size ----');
          config.setScreenSize(config.approxScreenSize() - 1);
        }
        g.loadTextures();
        break;
      case FullScreen:
        if (!config.fullScreen()) {
          config.setFullScreen(true);
          g.deleteTextures();
          if (!g.toolkit.setVideoMode()) {
            this.message('---- error setting full screen mode ----');
            config.setFullScreen(false);
          }
          g.loadTextures();
        }
        break;
      case Sound:
        config.setVolSound(config.volSound() + 0.05);
        g.audio.setSoundVolume(config.volSound());
        g.audio.playSound(A.Explosion, pos);
        break;
      case Music:
        config.setVolMusic(config.volMusic() + 0.05);
        g.audio.setMusicVolume(config.volMusic());
        break;
      case MovementSpeed:
        config.setMovementSpeed(config.movementSpeed() + 0.005);
        break;
      case Quit:
        this.activateItem();
        break;
      default:
        break;
    }
  }

  private decItem(): void {
    const g = this.game;
    const config = g.config;
    const pos = new Float32Array([0.0, 0.0, 25.0]);
    switch (this.curSel) {
      case SkillLevel:
        config.setGameSkillBase(config.gameSkillBase() - 0.1);
        g.newGame();
        break;
      case GameLevel:
        g.gameLevel -= 1;
        if (g.gameLevel < 1) g.gameLevel = 1;
        g.newGame();
        break;
      case Graphics:
        config.setGfxLevel(config.gfxLevel() - 1);
        break;
      case ScreenSize:
        config.setScreenSize(config.approxScreenSize() - 1);
        g.deleteTextures();
        if (!g.toolkit.setVideoMode()) {
          this.message('---- error setting screen size ----');
          config.setScreenSize(config.approxScreenSize() + 1);
        }
        g.loadTextures();
        break;
      case FullScreen:
        if (config.fullScreen()) {
          config.setFullScreen(false);
          g.deleteTextures();
          if (!g.toolkit.setVideoMode()) {
            this.message('---- error setting full screen mode ----');
            config.setFullScreen(true);
          }
          g.loadTextures();
        }
        break;
      case Sound:
        config.setVolSound(config.volSound() - 0.05);
        g.audio.setSoundVolume(config.volSound());
        g.audio.playSound(A.Explosion, pos);
        break;
      case Music:
        config.setVolMusic(config.volMusic() - 0.05);
        g.audio.setMusicVolume(config.volMusic());
        break;
      case MovementSpeed:
        config.setMovementSpeed(config.movementSpeed() - 0.005);
        break;
      default:
        break;
    }
  }

  /** "horrible, hacky, but quick to implement...." (the original's words) */
  mousePress(but: number, xi: number, yi: number): void {
    if (but !== ButtonLeft) return;
    const config = this.game.config;
    const x = f(-2.0 * (0.5 - f(f(xi) / config.screenW())) * 16.60);
    const y = f(2.0 * (0.5 - f(f(yi) / config.screenH())) * 12.45);
    let p = f(-y + (1.0 + this.txtHeight * 1.5));
    const s = f(this.txtHeight * 2.5);
    let mSel = -1;
    if (p > 0.0) {
      this.elecOffX = 0.0;
      p = f(p / s);
      mSel = Math.floor(p);
      if (mSel >= 0 && mSel < NumSelections) {
        if (mSel !== this.curSel) {
          this.curSel = mSel;
          this.elecOffX = 0.0;
          mSel = -1;
        }
      }
    }
    const l = f(-8.0 - this.butOffset);
    const hw = f(this.butWidth * 0.5);
    if (mSel >= 0) {
      if (x > l && x < f(l + hw)) this.decItem();
      else if (x > f(l + hw) && x < f(l + this.butWidth)) this.incItem();
      else this.activateItem();
    }
  }
}
