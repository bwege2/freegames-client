// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/PixelScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, JObject } from '../../../../../jre/index.ts';
import { Scene } from '../../../watabou/noosa/Scene.ts';
import { ColorBlock } from '../../../watabou/noosa/ColorBlock.ts';
import { Camera } from '../../../watabou/noosa/Camera.ts';

let Assets$Fonts, Badges$BadgeType, SPDSettings, BadgeBanner, Languages, Messages, GameScene, InterlevelScene, RenderedTextBlock, TitleBackground, Tooltip, Window, Holiday, WndJournal, WndJournal$BadgesTab, TextureCache, Blending, ControllerHandler, KeyEvent, PointerEvent, BitmapText$Font, Game, Image, Cursor, Cursor$Type, DeviceCompat, GameMath, PlatformSupport, PointF, Reflection;

export class PixelScene extends Scene {
  static readonly MIN_WIDTH_P: number = 135;
  static readonly MIN_HEIGHT_P: number = 225;
  static readonly MIN_WIDTH_L: number = 240;
  static readonly MIN_HEIGHT_L: number = 160;
  static readonly MIN_WIDTH_FULL: number = 360;
  static readonly MIN_HEIGHT_FULL: number = 200;
  static defaultZoom: number = 0;
  static maxDefaultZoom: number = 0;
  static minZoom: number = 0;
  static maxZoom: number = 0;
  static uiCamera: Camera = null;
  static pixelFont: BitmapText$Font = null;
  inGameScene: boolean = false;
  fullscreenListener: Signal$Listener<KeyEvent> = null;
  cursor: Image = null;
  static savedWindows: ArrayList<JClass<Window>> = null;
  static savedClass: JClass<PixelScene> = null;
  static noFade: boolean = false;
  _PixelScene(): this {
    this._Scene();
    this.inGameScene = false;
    this.cursor = null;
    return this;
  }
  create(): void {
    super.create();
    GameScene.scene = null;
    if (!this.inGameScene && InterlevelScene.lastRegion !== -1) {
      InterlevelScene.lastRegion = -1;
      TextureCache.clear();
      TitleBackground.reset();
      Holiday.clearCachedHoliday();
    }
    let minWidth: number;
    let minHeight: number;
    let scaleFactor: number;
    if (SPDSettings.interfaceSize$() > 0) {
      minWidth = PixelScene.MIN_WIDTH_FULL;
      minHeight = PixelScene.MIN_HEIGHT_FULL;
      scaleFactor = 3.75;
    } else if (PixelScene.landscape()) {
      minWidth = PixelScene.MIN_WIDTH_L;
      minHeight = PixelScene.MIN_HEIGHT_L;
      scaleFactor = 2.5;
    } else {
      minWidth = PixelScene.MIN_WIDTH_P;
      minHeight = PixelScene.MIN_HEIGHT_P;
      scaleFactor = 2.5;
    }
    let insets = Game.platform.getSafeInsets(PlatformSupport.INSET_ALL);
    let w = Math.fround(Math.fround(Game.width - insets.left_) - insets.right_);
    let h = Math.fround(Math.fround(Game.height - insets.top_) - insets.bottom_);
    PixelScene.maxDefaultZoom = $J.d2i(Math.min(Math.fround(w / minWidth), Math.fround(h / minHeight)));
    PixelScene.maxDefaultZoom = Math.max(2, PixelScene.maxDefaultZoom);
    PixelScene.defaultZoom = SPDSettings.scale$();
    if (PixelScene.defaultZoom < Math.ceil(Math.fround(Game.density * 2)) || PixelScene.defaultZoom > PixelScene.maxDefaultZoom) {
      PixelScene.defaultZoom = $J.d2i(GameMath.gate(2, Math.fround($J.d2i(Math.ceil(Math.fround(Game.density * scaleFactor)))), Math.fround(PixelScene.maxDefaultZoom)));
      if (SPDSettings.interfaceSize$() > 0 && PixelScene.defaultZoom < $J.idiv(((PixelScene.maxDefaultZoom + 1) | 0), 2)) {
        PixelScene.defaultZoom = $J.idiv(((PixelScene.maxDefaultZoom + 1) | 0), 2);
      }
    }
    PixelScene.minZoom = 1;
    PixelScene.maxZoom = Math.fround(Math.imul(PixelScene.defaultZoom, 2));
    Camera.reset$Camera(new PixelScene$PixelCamera()._PixelScene$PixelCamera(Math.fround(PixelScene.defaultZoom)));
    let uiZoom = Math.fround(PixelScene.defaultZoom);
    PixelScene.uiCamera = Camera.createFullscreen(uiZoom);
    Camera.add(PixelScene.uiCamera);
    PixelScene.pixelFont = BitmapText$Font.colorMarked$SmartTexture$int$String(TextureCache.get(Assets$Fonts.PIXELFONT), 0, BitmapText$Font.LATIN_FULL);
    PixelScene.pixelFont.baseLine_ = 6;
    PixelScene.pixelFont.tracking = -1;
    let renderedTextPageSize: number;
    if (PixelScene.defaultZoom <= 3) {
      renderedTextPageSize = 256;
    } else if (PixelScene.defaultZoom <= 8) {
      renderedTextPageSize = 512;
    } else {
      renderedTextPageSize = 1024;
    }
    if (Messages.lang() === Languages.CHI_SMPL || Messages.lang() === Languages.CHI_TRAD || Messages.lang() === Languages.KOREAN || Messages.lang() === Languages.JAPANESE) {
      renderedTextPageSize = Math.imul(renderedTextPageSize, 2);
    }
    Game.platform.setupFontGenerators(renderedTextPageSize, SPDSettings.systemFont$());
    Tooltip.resetLastUsedTime();
    Cursor.setCustomCursor(Cursor$Type.DEFAULT, PixelScene.defaultZoom);
  }
  update(): void {
    if (DeviceCompat.isDesktop() && this.fullscreenListener == null) {
      KeyEvent.addKeyListener(this.fullscreenListener = new (PixelScene$1())().$o(this));
    }
    super.update();
    if (!Cursor.isCursorCaptured()) {
      if (Math.fround(Math.abs(ControllerHandler.rightStickPosition.x)) >= Math.fround(0.2) || Math.fround(Math.abs(ControllerHandler.rightStickPosition.y)) >= Math.fround(0.2)) {
        if (!ControllerHandler.controllerPointerActive()) {
          ControllerHandler.setControllerPointer(true);
        }
        let sensitivity = Math.imul(SPDSettings.controllerPointerSensitivity$(), 100);
        let xMove = Math.fround($J.pow(Math.fround(Math.abs(ControllerHandler.rightStickPosition.x)), 1.5));
        if (ControllerHandler.rightStickPosition.x < Math.fround(0)) {
          xMove = Math.fround(-xMove);
        }
        let yMove = Math.fround($J.pow(Math.fround(Math.abs(ControllerHandler.rightStickPosition.y)), 1.5));
        if (ControllerHandler.rightStickPosition.y < Math.fround(0)) {
          yMove = Math.fround(-yMove);
        }
        let virtualCursorPos = ControllerHandler.getControllerPointerPos();
        virtualCursorPos.x = Math.fround(virtualCursorPos.x + Math.fround(Math.fround(Math.imul(PixelScene.defaultZoom, sensitivity) * Game.elapsed) * xMove));
        virtualCursorPos.y = Math.fround(virtualCursorPos.y + Math.fround(Math.fround(Math.imul(PixelScene.defaultZoom, sensitivity) * Game.elapsed) * yMove));
        let cameraShift = new PointF()._PointF$();
        if (virtualCursorPos.x < Math.fround(0)) {
          cameraShift.x = virtualCursorPos.x;
          virtualCursorPos.x = 0;
        } else if (virtualCursorPos.x > Camera.main.screenWidth()) {
          cameraShift.x = (Math.fround(virtualCursorPos.x - Camera.main.screenWidth()));
          virtualCursorPos.x = Camera.main.screenWidth();
        }
        if (virtualCursorPos.y < Math.fround(0)) {
          cameraShift.y = virtualCursorPos.y;
          virtualCursorPos.y = 0;
        } else if (virtualCursorPos.y > Camera.main.screenHeight()) {
          cameraShift.y = (Math.fround(virtualCursorPos.y - Camera.main.screenHeight()));
          virtualCursorPos.y = Camera.main.screenHeight();
        }
        cameraShift.invScale(Camera.main.zoom_);
        cameraShift.x = Math.fround(cameraShift.x * Camera.main.edgeScroll.x);
        cameraShift.y = Math.fround(cameraShift.y * Camera.main.edgeScroll.y);
        if (cameraShift.length() > Math.fround(0)) {
          Camera.main.shift(cameraShift);
        }
        ControllerHandler.updateControllerPointer(virtualCursorPos, true);
      }
    }
  }
  draw(): void {
    super.draw();
    if (ControllerHandler.controllerPointerActive()) {
      if (this.cursor == null) {
        this.cursor = new Image()._Image$Object(Cursor$Type.CONTROLLER.file);
      }
      let virtualCursorPos = ControllerHandler.getControllerPointerPos();
      this.cursor.x = Math.fround((Math.fround(virtualCursorPos.x / PixelScene.defaultZoom)) - Math.fround(this.cursor.width() / 2));
      this.cursor.y = Math.fround((Math.fround(virtualCursorPos.y / PixelScene.defaultZoom)) - Math.fround(this.cursor.height() / 2));
      this.cursor.camera_ = PixelScene.uiCamera;
      PixelScene.align$Visual(this.cursor);
      this.cursor.draw();
    }
  }
  saveWindows(): void {
    if (this.members == null) {
      return;
    }
    PixelScene.savedWindows.clear();
    PixelScene.savedClass = $J.getClass(this);
    for (let g of $J.toArrayInto(this.members.toArray(), $J.newArray(0, null))) {
      if (g instanceof Window) {
        PixelScene.savedWindows.add(g.getClass());
      }
    }
  }
  restoreWindows(): void {
    if ($J.equals($J.getClass(this), PixelScene.savedClass)) {
      for (const $it0 = PixelScene.savedWindows.iterator(); $it0.hasNext(); ) {
        let w = $it0.next();
        try {
          this.add$Gizmo(Reflection.newInstanceUnhandled(w));
        } catch ($e1) {
          if ($J.isa($e1, Exception)) {
            let e = $J.exc($e1);
          } else {
            throw $e1;
          }
        }
      }
    }
    PixelScene.savedWindows.clear();
  }
  destroy(): void {
    super.destroy();
    PointerEvent.clearListeners();
    if (this.fullscreenListener != null) {
      KeyEvent.removeKeyListener(this.fullscreenListener);
    }
    if (this.cursor != null) {
      this.cursor.destroy();
    }
  }
  static landscape(): boolean {
    return SPDSettings.interfaceSize$() > 0 || Game.width > Game.height;
  }
  static renderTextBlock$int(size: number): RenderedTextBlock {
    return PixelScene.renderTextBlock$String$int('', size);
  }
  static renderTextBlock$String$int(text: string, size: number): RenderedTextBlock {
    let scale = DeviceCompat.getRealPixelScaleX();
    let result = new RenderedTextBlock()._RenderedTextBlock$String$int(text, Math.imul(size, $J.roundf(Math.fround(PixelScene.defaultZoom * scale))));
    result.zoom(Math.fround(1 / Math.fround($J.roundf(Math.fround(PixelScene.defaultZoom * scale)))));
    return result;
  }
  /**
   * These methods align UI elements to device pixels.
   * e.g. if we have a scale of 3x then valid positions are #.0, #.33, #.67
   */
  static align$float(pos: number): number {
    return Math.fround($J.roundf(Math.fround(pos * PixelScene.defaultZoom)) / Math.fround(PixelScene.defaultZoom));
  }
  static align$Camera$float(camera: Camera, pos: number): number {
    return Math.fround($J.roundf(Math.fround(pos * camera.zoom_)) / camera.zoom_);
  }
  static align$Visual(v: Visual): void {
    v.x = PixelScene.align$float(v.x);
    v.y = PixelScene.align$float(v.y);
  }
  static align$Component(c: Component): void {
    c.setPos(PixelScene.align$float(c.left()), PixelScene.align$float(c.top()));
  }
  fadeIn$(): void {
    if (PixelScene.noFade) {
      PixelScene.noFade = false;
    } else {
      this.fadeIn$int$boolean(-16777216, false);
    }
  }
  fadeIn$int$boolean(color: number, light: boolean): void {
    this.add$Gizmo(new PixelScene$Fader()._PixelScene$Fader(color, light));
  }
  static showBadge(badge: Badges$Badge): void {
    Game.runOnRenderThread(new (PixelScene$2())().$c(badge));
  }
  static shake(magnitude: number, duration: number): void {
    magnitude = Math.fround(magnitude * SPDSettings.screenShake$());
    Camera.main.shake(magnitude, duration);
  }
  getCommonInsets(): RectF {
    let all = Game.platform.getSafeInsets(PlatformSupport.INSET_ALL);
    let blocking = Game.platform.getSafeInsets(PlatformSupport.INSET_BLK);
    all.left_ = blocking.left_;
    all.right_ = blocking.right_;
    return all.scale(Math.fround(1 / PixelScene.defaultZoom));
  }
  static $clinit() {
    PixelScene.defaultZoom = 0;
    PixelScene.maxDefaultZoom = 0;
    PixelScene.savedWindows = new ArrayList();
    PixelScene.savedClass = null;
    PixelScene.noFade = false;
  }
}

export class PixelScene$Fader extends ColorBlock {
  static FADE_TIME: number = 0;
  light: boolean = false;
  time: number = 0;
  static INSTANCE: PixelScene$Fader = null;
  _PixelScene$Fader(color: number, light: boolean): this {
    this._ColorBlock(Math.fround(PixelScene.uiCamera.width_), Math.fround(PixelScene.uiCamera.height_), color);
    this.light = light;
    this.camera_ = PixelScene.uiCamera;
    this.alpha$float(1);
    this.time = PixelScene$Fader.FADE_TIME;
    if (PixelScene$Fader.INSTANCE != null) {
      PixelScene$Fader.INSTANCE.killAndErase();
    }
    PixelScene$Fader.INSTANCE = this;
    return this;
  }
  update(): void {
    super.update();
    if ((this.time = Math.fround(this.time - Game.elapsed)) <= Math.fround(0)) {
      this.alpha$float(0);
      this.parent.remove$Gizmo(this);
      this.destroy();
      if (PixelScene$Fader.INSTANCE === this) {
        PixelScene$Fader.INSTANCE = null;
      }
    } else {
      this.alpha$float(Math.fround(this.time / PixelScene$Fader.FADE_TIME));
    }
  }
  draw(): void {
    if (this.light) {
      Blending.setLightMode();
      super.draw();
      Blending.setNormalMode();
    } else {
      super.draw();
    }
  }
  static $clinit() {
    PixelScene$Fader.FADE_TIME = 1;
  }
}

export class PixelScene$PixelCamera extends Camera {
  _PixelScene$PixelCamera(zoom: number): this {
    this._Camera($J.idiv($J.d2i((Game.width - Math.ceil(Math.fround(Game.width / zoom)) * zoom)), 2), $J.idiv($J.d2i((Game.height - Math.ceil(Math.fround(Game.height / zoom)) * zoom)), 2), $J.d2i(Math.ceil(Math.fround(Game.width / zoom))), $J.d2i(Math.ceil(Math.fround(Game.height / zoom))), zoom);
    this.fullScreen = true;
    return this;
  }
  updateMatrix(): void {
    let sx = PixelScene.align$Camera$float(this, Math.fround(this.scroll_.x + this.shakeX));
    let sy = PixelScene.align$Camera$float(this, Math.fround(this.scroll_.y + this.shakeY));
    this.matrix[0] = Math.fround(+this.zoom_ * Camera.invW2);
    this.matrix[5] = Math.fround(Math.fround(-this.zoom_) * Camera.invH2);
    this.matrix[12] = Math.fround(Math.fround(-1 + Math.fround(this.x * Camera.invW2)) - Math.fround(sx * this.matrix[0]));
    this.matrix[13] = Math.fround(Math.fround(+1 - Math.fround(this.y * Camera.invH2)) - Math.fround(sy * this.matrix[5]));
  }
}

let $PixelScene$1: any = null;
/** An anonymous class (PixelScene.java:185). */
function PixelScene$1(): any {
  return $PixelScene$1 ??= $J.local(class extends JObject {
    alt: boolean = false;
    enter: boolean = false;
    onSignal(keyEvent: KeyEvent): boolean {
      if (keyEvent.code_ === 58) {
        this.alt = keyEvent.pressed;
      } else if (keyEvent.code_ === 66) {
        this.enter = keyEvent.pressed;
      }
      if (this.alt && this.enter) {
        SPDSettings.fullscreen$boolean(!SPDSettings.fullscreen$());
        return true;
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene$1', ['com.watabou.utils.Signal$Listener']);
}

let $PixelScene$2: any = null;
/** An anonymous class (PixelScene.java:379). */
function PixelScene$2(): any {
  return $PixelScene$2 ??= $J.local(class extends JObject {
    call(): void {
      let s = Game.scene();
      if (s != null) {
        let banner = BadgeBanner.show(this.$cv_badge.image_);
        s.add$Gizmo(banner);
        let offset = Camera.main.centerOffset.y;
        let left = ($J.idiv(PixelScene.uiCamera.width_, 2) - $J.idiv(BadgeBanner.SIZE, 2)) | 0;
        left = $J.d2i(Math.fround(left - Math.fround((Math.fround(Math.fround(BadgeBanner.SIZE * BadgeBanner.DEFAULT_SCALE) * ((BadgeBanner.showing.size() - 1) | 0))) / 2)));
        for (let i = 0; i < BadgeBanner.showing.size(); i++) {
          banner = BadgeBanner.showing.get(i);
          banner.camera_ = PixelScene.uiCamera;
          banner.x = PixelScene.align$Camera$float(banner.camera_, Math.fround(left));
          banner.y = PixelScene.align$Camera$float(PixelScene.uiCamera, Math.fround(Math.fround(Math.fround(Math.fround((Math.fround(PixelScene.uiCamera.height_ - banner.height_)) / 2) - Math.fround(banner.height_ / 2)) - 16) - offset));
          left = $J.d2i(Math.fround(left + Math.fround(BadgeBanner.SIZE * BadgeBanner.DEFAULT_SCALE)));
        }
        WndJournal.last_index = 4;
        WndJournal$BadgesTab.global = this.$cv_badge.type_ !== Badges$BadgeType.LOCAL;
      }
    }
    $c($badge): this {
      this.$cv_badge = $badge;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene$2', ['com.watabou.utils.Callback']);
}

$J.define(PixelScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', { kind: 'class', sup: 'com.watabou.noosa.Scene', ctors: { '': '_PixelScene' }, meths: { 'fadeIn(int,boolean)': 'fadeIn$int$boolean', 'fadeIn()': 'fadeIn$', 'align(com.watabou.noosa.ui.Component)': 'align$Component', 'align(com.watabou.noosa.Visual)': 'align$Visual', 'align(com.watabou.noosa.Camera,float)': 'align$Camera$float', 'align(float)': 'align$float', 'renderTextBlock(java.lang.String,int)': 'renderTextBlock$String$int', 'renderTextBlock(int)': 'renderTextBlock$int' }, clinit: true, lazy: ['defaultZoom', 'maxDefaultZoom', 'minZoom', 'maxZoom', 'uiCamera', 'pixelFont', 'savedWindows', 'savedClass', 'noFade'] });
$J.define(PixelScene$Fader, 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene$Fader', { kind: 'class', sup: 'com.watabou.noosa.ColorBlock', ctors: { 'int,boolean': '_PixelScene$Fader' }, clinit: true, lazy: ['FADE_TIME', 'INSTANCE'] });
$J.define(PixelScene$PixelCamera, 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene$PixelCamera', { kind: 'class', sup: 'com.watabou.noosa.Camera', ctors: { 'float': '_PixelScene$PixelCamera' } });
$J.module(() => {
  Assets$Fonts = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Fonts');
  Badges$BadgeType = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$BadgeType');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  BadgeBanner = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  Tooltip = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Tooltip');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  Holiday = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.Holiday');
  WndJournal = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal');
  WndJournal$BadgesTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$BadgesTab');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Blending = $J.load('com.watabou.glwrap.Blending');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  BitmapText$Font = $J.load('com.watabou.noosa.BitmapText$Font');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Cursor = $J.load('com.watabou.noosa.ui.Cursor');
  Cursor$Type = $J.load('com.watabou.noosa.ui.Cursor$Type');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PlatformSupport = $J.load('com.watabou.utils.PlatformSupport');
  PointF = $J.load('com.watabou.utils.PointF');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
