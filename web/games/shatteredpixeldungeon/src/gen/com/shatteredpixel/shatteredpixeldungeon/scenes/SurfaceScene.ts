// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/SurfaceScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, Calendar } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';
import { Visual } from '../../../watabou/noosa/Visual.ts';
import { Image } from '../../../watabou/noosa/Image.ts';
import { RatSprite } from '../sprites/RatSprite.ts';

let Assets$Interfaces, Assets$Music, Assets$Sprites, Dungeon, Ratmogrify, DriedRose, RemainsItem, WandOfLivingEarth, WandOfWarding, MagesStaff, Messages, RankingsScene, CharSprite$State, EarthGuardianSprite, GhostSprite, WardSprite, RedButton, TitleBackground, TextureCache, Matrix, Quad, Camera, ColorBlock, Game, Group, NoosaScript, PointerArea, TextureFilm, Music, PointF, Random;

export class SurfaceScene extends PixelScene {
  static readonly FRAME_WIDTH: number = 88;
  static readonly FRAME_HEIGHT: number = 125;
  static readonly FRAME_MARGIN_TOP: number = 9;
  static readonly FRAME_MARGIN_X: number = 4;
  static readonly BUTTON_HEIGHT: number = 20;
  static readonly SKY_WIDTH: number = 80;
  static readonly SKY_HEIGHT: number = 112;
  static readonly NSTARS: number = 100;
  static readonly NCLOUDS: number = 5;
  rats: SurfaceScene$Pet[] = null;
  viewport: Camera = null;
  ratJumpTimer: number = 0;
  _SurfaceScene(): this {
    this._PixelScene();
    this.ratJumpTimer = Math.fround(0.02);
    return this;
  }
  create(): void {
    super.create();
    Music.INSTANCE.playTracks([Assets$Music.THEME_2, Assets$Music.THEME_1], [1, 1], false);
    PixelScene.uiCamera.visible_ = false;
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    this.add$Gizmo(BG);
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let vx = PixelScene.align$float(Math.fround(insets.left_ + Math.fround(((w - SurfaceScene.SKY_WIDTH) | 0) / 2)));
    let vy = PixelScene.align$float(Math.fround(insets.top_ + Math.fround(((h - SurfaceScene.SKY_HEIGHT - SurfaceScene.BUTTON_HEIGHT) | 0) / 2)));
    let s = Camera.main.cameraToScreen(vx, vy);
    this.viewport = new Camera()._Camera(s.x, s.y, SurfaceScene.SKY_WIDTH, SurfaceScene.SKY_HEIGHT, Math.fround(PixelScene.defaultZoom));
    Camera.add(this.viewport);
    let window = new Group()._Group();
    window.camera_ = this.viewport;
    this.add$Gizmo(window);
    let cal = Calendar.getInstance();
    let dayTime = cal.get(11) >= 8 && cal.get(11) <= 19;
    let sky = new SurfaceScene$Sky()._SurfaceScene$Sky(dayTime);
    sky.scale_.set$float$float(Math.fround(SurfaceScene.SKY_WIDTH), Math.fround(SurfaceScene.SKY_HEIGHT));
    window.add$Gizmo(sky);
    if (!dayTime) {
      for (let i = 0; i < SurfaceScene.NSTARS; i++) {
        let size = Random.Float$();
        let star = new ColorBlock()._ColorBlock(size, size, -1);
        star.x = Math.fround(Random.Float$float(Math.fround(SurfaceScene.SKY_WIDTH)) - Math.fround(size / 2));
        star.y = Math.fround(Random.Float$float(Math.fround(SurfaceScene.SKY_HEIGHT)) - Math.fround(size / 2));
        star.am = Math.fround(size * (Math.fround(1 - Math.fround(star.y / SurfaceScene.SKY_HEIGHT))));
        window.add$Gizmo(star);
      }
    }
    let range = Math.fround($J.idiv(Math.imul(SurfaceScene.SKY_HEIGHT, 2), 3));
    for (let i = 0; i < SurfaceScene.NCLOUDS; i++) {
      let cloud = new SurfaceScene$Cloud()._SurfaceScene$Cloud(Math.fround(Math.fround(((SurfaceScene.NCLOUDS - 1 - i) | 0) * (Math.fround(range / SurfaceScene.NCLOUDS))) + Random.Float$float(Math.fround(range / SurfaceScene.NCLOUDS))), dayTime);
      window.add$Gizmo(cloud);
    }
    let nPatches = $J.d2i((Math.fround(Math.fround(sky.width() / SurfaceScene$GrassPatch.WIDTH) + 1)));
    for (let i = 0; i < Math.imul(nPatches, 4); i++) {
      let patch = new SurfaceScene$GrassPatch()._SurfaceScene$GrassPatch(Math.fround(Math.fround((Math.fround(i - 0.75)) * SurfaceScene$GrassPatch.WIDTH) / 4), Math.fround((SurfaceScene.SKY_HEIGHT + 1) | 0), dayTime);
      patch.brightness(dayTime ? Math.fround(0.7) : Math.fround(0.4));
      window.add$Gizmo(patch);
    }
    let a = new SurfaceScene$Avatar()._SurfaceScene$Avatar(Dungeon.hero.heroClass);
    a.am = 2;
    a.aa = -1;
    a.x = Math.fround((Math.fround(SurfaceScene.SKY_WIDTH - a.width_)) / 2);
    a.y = Math.fround(SurfaceScene.SKY_HEIGHT - a.height_);
    PixelScene.align$Visual(a);
    if (Dungeon.hero.armorAbility instanceof Ratmogrify) {
      this.rats = $J.newArray(30, null);
      for (let i = 0; i < this.rats.length; i++) {
        let pet = new SurfaceScene$Pet()._SurfaceScene$Pet();
        pet.rm = pet.gm = pet.bm = Math.fround(1.2);
        pet.x = Math.fround((Random.Int$int(SurfaceScene.SKY_WIDTH) - 10) | 0);
        pet.y = Math.fround(SurfaceScene.SKY_HEIGHT - pet.height_);
        window.add$Gizmo(pet);
        this.rats[i] = pet;
        if (dayTime) {
          pet.brightness(Math.fround(1.2));
        }
      }
    }
    let pet = new SurfaceScene$Pet()._SurfaceScene$Pet();
    pet.rm = pet.gm = pet.bm = Math.fround(1.2);
    pet.x = Math.fround(($J.idiv(SurfaceScene.SKY_WIDTH, 2) + 2) | 0);
    pet.y = Math.fround(SurfaceScene.SKY_HEIGHT - pet.height_);
    PixelScene.align$Visual(pet);
    let allySprite = null;
    let roseLevel = 0;
    let rose = Dungeon.hero.belongings.getItem($J.cls(DriedRose));
    if (rose != null) {
      roseLevel = $J.idiv(rose.level$(), 2);
      if (rose.ghostWeapon() != null) {
        roseLevel = Math.max(roseLevel, rose.ghostWeapon().level$());
      }
      if (rose.ghostArmor() != null) {
        roseLevel = Math.max(roseLevel, rose.ghostArmor().level$());
      }
    }
    let earthLevel = Dungeon.hero.belongings.getItem($J.cls(WandOfLivingEarth)) == null ? 0 : Dungeon.hero.belongings.getItem($J.cls(WandOfLivingEarth)).level$();
    let wardLevel = Dungeon.hero.belongings.getItem($J.cls(WandOfWarding)) == null ? 0 : Dungeon.hero.belongings.getItem($J.cls(WandOfWarding)).level$();
    let staff = Dungeon.hero.belongings.getItem($J.cls(MagesStaff));
    if (staff != null) {
      if (staff.wandClass() === $J.cls(WandOfLivingEarth)) {
        earthLevel = Math.max(earthLevel, staff.level$());
      } else if (staff.wandClass() === $J.cls(WandOfWarding)) {
        wardLevel = Math.max(wardLevel, staff.level$());
      }
    }
    if (roseLevel >= 3 && roseLevel >= earthLevel && roseLevel >= wardLevel) {
      allySprite = new GhostSprite()._GhostSprite();
      if (dayTime) {
        allySprite.alpha$float(Math.fround(0.4));
      }
    } else if (earthLevel >= 3 && earthLevel >= wardLevel) {
      allySprite = new EarthGuardianSprite()._EarthGuardianSprite();
    } else if (wardLevel >= 3) {
      allySprite = new WardSprite()._WardSprite();
      (allySprite).updateTier(Math.min((wardLevel + 2) | 0, 6));
    }
    if (allySprite != null) {
      allySprite.add(CharSprite$State.PARALYSED);
      allySprite.scale_ = new PointF()._PointF$float$float(2, 2);
      allySprite.x = Math.fround(a.x - Math.fround(allySprite.width() * 0.75));
      allySprite.y = Math.fround(SurfaceScene.SKY_HEIGHT - allySprite.height());
      PixelScene.align$Visual(allySprite);
      window.add$Gizmo(allySprite);
    }
    if (Dungeon.hero.belongings.getItem($J.cls(RemainsItem)) != null) {
      let grave = new Image()._Image$Object$int$int$int$int(Assets$Interfaces.SURFACE, 88, 74, 16, 22);
      grave.x = Math.fround(Math.fround(a.x + a.width()) + 10);
      grave.y = Math.fround(Math.fround(a.y + a.height()) - grave.height());
      window.add$Gizmo(grave);
    }
    window.add$Gizmo(a);
    window.add$Gizmo(pet);
    window.add$Gizmo(new (SurfaceScene$1())().$o(this).$c(pet)._PointerArea$Visual(sky));
    for (let i = 0; i < nPatches; i++) {
      let patch = new SurfaceScene$GrassPatch()._SurfaceScene$GrassPatch(Math.fround((Math.fround(i - 0.5)) * SurfaceScene$GrassPatch.WIDTH), Math.fround(SurfaceScene.SKY_HEIGHT), dayTime);
      patch.brightness(dayTime ? 1 : Math.fround(0.8));
      window.add$Gizmo(patch);
    }
    let frame = new Image()._Image$Object(Assets$Interfaces.SURFACE);
    frame.frame$int$int$int$int(0, 0, SurfaceScene.FRAME_WIDTH, SurfaceScene.FRAME_HEIGHT);
    frame.x = Math.fround(vx - SurfaceScene.FRAME_MARGIN_X);
    frame.y = Math.fround(vy - SurfaceScene.FRAME_MARGIN_TOP);
    this.add$Gizmo(frame);
    if (dayTime) {
      a.brightness(Math.fround(1.2));
      pet.brightness(Math.fround(1.2));
    } else {
      frame.hardlight$int(14544639);
    }
    let gameOver = new (SurfaceScene$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'exit', []));
    gameOver.setSize(Math.fround((SurfaceScene.SKY_WIDTH - Math.imul(SurfaceScene.FRAME_MARGIN_X, 2)) | 0), Math.fround(SurfaceScene.BUTTON_HEIGHT));
    gameOver.setPos(Math.fround(frame.x + Math.imul(SurfaceScene.FRAME_MARGIN_X, 2)), Math.fround(Math.fround(frame.y + frame.height_) + 4));
    this.add$Gizmo(gameOver);
    this.fadeIn$();
  }
  update(): void {
    if (this.rats != null) {
      this.ratJumpTimer = Math.fround(this.ratJumpTimer - Game.elapsed);
      while (this.ratJumpTimer <= 0) {
        this.ratJumpTimer = Math.fround(this.ratJumpTimer + Math.fround(0.02));
        Random.element$ObjectArr(this.rats).jump$();
      }
    }
    super.update();
  }
  destroy(): void {
    Camera.remove(this.viewport);
    super.destroy();
  }
  onBackPressed(): void {
  }
}

export class SurfaceScene$Sky extends Visual {
  static day: number[] = null;
  static night: number[] = null;
  texture_: SmartTexture = null;
  verticesBuffer: FloatBuffer = null;
  _SurfaceScene$Sky(dayTime: boolean): this {
    this._Visual(0, 0, 1, 1);
    this.texture_ = TextureCache.createGradient(dayTime ? SurfaceScene$Sky.day : SurfaceScene$Sky.night);
    let vertices = $J.newArray(16, 0);
    this.verticesBuffer = Quad.create();
    vertices[2] = 0.25;
    vertices[6] = 0.25;
    vertices[10] = 0.75;
    vertices[14] = 0.75;
    vertices[3] = 0;
    vertices[7] = 1;
    vertices[11] = 1;
    vertices[15] = 0;
    vertices[0] = 0;
    vertices[1] = 0;
    vertices[4] = 1;
    vertices[5] = 0;
    vertices[8] = 1;
    vertices[9] = 1;
    vertices[12] = 0;
    vertices[13] = 1;
    (this.verticesBuffer).position(0);
    this.verticesBuffer.put(vertices);
    return this;
  }
  draw(): void {
    super.draw();
    let script = NoosaScript.get();
    this.texture_.bind();
    script.camera(this.camera());
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.drawQuad$FloatBuffer(this.verticesBuffer);
  }
  static $clinit() {
    SurfaceScene$Sky.day = [-12285697, -3346689];
    SurfaceScene$Sky.night = [-16772779, -13411968];
  }
}

export class SurfaceScene$Cloud extends Image {
  static lastIndex: number = 0;
  _SurfaceScene$Cloud(y: number, dayTime: boolean): this {
    this._Image$Object(Assets$Interfaces.SURFACE);
    let index: number;
    do {
      index = Random.Int$int(3);
    } while (index === SurfaceScene$Cloud.lastIndex);
    switch (index) {
      case 0:
        this.frame$int$int$int$int(88, 0, 49, 20);
        break;
      case 1:
        this.frame$int$int$int$int(88, 20, 49, 22);
        break;
      case 2:
        this.frame$int$int$int$int(88, 42, 50, 18);
        break;
    }
    SurfaceScene$Cloud.lastIndex = index;
    this.y = y;
    this.scale_.set$float(Math.fround(1 - Math.fround(y / SurfaceScene.SKY_HEIGHT)));
    this.x = Math.fround(Random.Float$float(Math.fround(SurfaceScene.SKY_WIDTH + this.width())) - this.width());
    this.speed_.x = Math.fround(this.scale_.x * (dayTime ? +8 : -8));
    if (dayTime) {
      this.tint$int$float(13430527, Math.fround(1 - this.scale_.y));
    } else {
      this.rm = this.gm = this.bm = +3;
      this.ra = this.ga = this.ba = Math.fround(-Math.fround(2.1));
    }
    return this;
  }
  update(): void {
    super.update();
    if (this.speed_.x > Math.fround(0) && this.x > Math.fround(SurfaceScene.SKY_WIDTH)) {
      this.x = Math.fround(-this.width());
    } else if (this.speed_.x < Math.fround(0) && this.x < Math.fround(-this.width())) {
      this.x = Math.fround(SurfaceScene.SKY_WIDTH);
    }
  }
  static $clinit() {
    SurfaceScene$Cloud.lastIndex = -1;
  }
}

export class SurfaceScene$Avatar extends Image {
  static readonly WIDTH: number = 24;
  static readonly HEIGHT: number = 32;
  _SurfaceScene$Avatar(cl: HeroClass): this {
    this._Image$Object(Assets$Sprites.AVATARS);
    this.frame$RectF(new TextureFilm()._TextureFilm$Object$int$int(this.texture_, SurfaceScene$Avatar.WIDTH, SurfaceScene$Avatar.HEIGHT).get$Object(cl.ordinal()));
    return this;
  }
}

export class SurfaceScene$Pet extends RatSprite {
  _SurfaceScene$Pet(): this {
    this._RatSprite();
    return this;
  }
  jump$(): void {
    this.play$Animation(this.run_);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.run_) {
      this.idle();
    }
  }
}

export class SurfaceScene$GrassPatch extends Image {
  static readonly WIDTH: number = 16;
  static readonly HEIGHT: number = 14;
  tx: number = 0;
  ty: number = 0;
  a: number = 0;
  angle$SurfaceScene_GrassPatch: number = 0;
  forward: boolean = false;
  _SurfaceScene$GrassPatch(tx: number, ty: number, forward: boolean): this {
    this._Image$Object(Assets$Interfaces.SURFACE);
    this.a = Random.Float$float(5);
    this.frame$int$int$int$int((88 + Math.imul(Random.Int$int(4), SurfaceScene$GrassPatch.WIDTH)) | 0, 60, SurfaceScene$GrassPatch.WIDTH, SurfaceScene$GrassPatch.HEIGHT);
    this.tx = tx;
    this.ty = ty;
    this.forward = forward;
    return this;
  }
  update(): void {
    super.update();
    this.a += Random.Float$float(Math.fround(Game.elapsed * 5));
    this.angle$SurfaceScene_GrassPatch = (2 + Math.cos(this.a)) * (this.forward ? +0.2 : -0.2);
    this.scale_.y = Math.fround(Math.cos(this.angle$SurfaceScene_GrassPatch));
    this.x = Math.fround(this.tx + Math.fround(Math.fround(Math.tan(this.angle$SurfaceScene_GrassPatch)) * this.width_));
    this.y = Math.fround(this.ty - Math.fround(this.scale_.y * this.height_));
  }
  updateMatrix(): void {
    super.updateMatrix();
    Matrix.skewX(this.matrix, Math.fround((this.angle$SurfaceScene_GrassPatch / Matrix.G2RAD)));
  }
}

let $SurfaceScene$1: any = null;
/** An anonymous class (SurfaceScene.java:236). */
function SurfaceScene$1(): any {
  return $SurfaceScene$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      this.$cv_pet.jump$();
    }
    $c($pet): this {
      this.$cv_pet = $pet;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$1', []);
}

let $SurfaceScene$2: any = null;
/** An anonymous class (SurfaceScene.java:262). */
function SurfaceScene$2(): any {
  return $SurfaceScene$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      Game.switchScene$Class($J.cls(RankingsScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$2', []);
}

$J.define(SurfaceScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_SurfaceScene' } });
$J.define(SurfaceScene$Sky, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$Sky', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'boolean': '_SurfaceScene$Sky' }, clinit: true, lazy: ['day', 'night'] });
$J.define(SurfaceScene$Cloud, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$Cloud', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'float,boolean': '_SurfaceScene$Cloud' }, clinit: true, lazy: ['lastIndex'] });
$J.define(SurfaceScene$Avatar, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$Avatar', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass': '_SurfaceScene$Avatar' } });
$J.define(SurfaceScene$Pet, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$Pet', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.RatSprite', ctors: { '': '_SurfaceScene$Pet' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'jump()': 'jump$' } });
$J.define(SurfaceScene$GrassPatch, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$GrassPatch', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'float,float,boolean': '_SurfaceScene$GrassPatch' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  DriedRose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose');
  RemainsItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem');
  WandOfLivingEarth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth');
  WandOfWarding = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  RankingsScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  EarthGuardianSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.EarthGuardianSprite');
  GhostSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GhostSprite');
  WardSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.WardSprite');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Matrix = $J.load('com.watabou.glwrap.Matrix');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Camera = $J.load('com.watabou.noosa.Camera');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Group = $J.load('com.watabou.noosa.Group');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Music = $J.load('com.watabou.noosa.audio.Music');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
