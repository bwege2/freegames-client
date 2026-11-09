// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Game.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Controllers, Gdx, JObject, PrintWriter, StringWriter, TimeUtils } from '../../../../jre/index.ts';

let Script, TextureCache, Blending, Vertexbuffer, ControllerHandler, InputHandler, Camera, NoosaScript, NoosaScriptNoLighting, Music, Sample, DeviceCompat, Reflection;

export class Game extends JObject {
  static instance: Game = null;
  static width: number = 0;
  static height: number = 0;
  static density: number = 0;
  static version: string = null;
  static versionCode: number = 0;
  scene: Scene = null;
  requestedScene: Scene = null;
  requestedReset: boolean = false;
  onChange_: Game$SceneChangeCallback = null;
  static sceneClass: JClass<Scene> = null;
  static timeScale: number = 0;
  static elapsed: number = 0;
  static timeTotal: number = 0;
  static realTime: bigint = 0n;
  static inputHandler: InputHandler = null;
  static platform: PlatformSupport = null;
  versionContextRef: GLVersion = null;
  justResumed: boolean = false;
  _Game(c: JClass<Scene>, platform: PlatformSupport): this {
    this.requestedReset = true;
    this.justResumed = true;
    Game.sceneClass = c;
    Game.instance = this;
    Game.platform = platform;
    return this;
  }
  create(): void {
    Game.density = Gdx.graphics.getDensity();
    if (Game.density === Infinity) {
      Game.density = Math.fround(100 / 160);
    } else if (DeviceCompat.isDesktop()) {
      let dispWidth = Gdx.graphics.getDisplayMode().width;
      let dispHeight = Gdx.graphics.getDisplayMode().height;
      let reportedWidth = Math.fround(dispWidth / Gdx.graphics.getPpiX());
      let reportedHeight = Math.fround(dispHeight / Gdx.graphics.getPpiY());
      if (dispWidth > dispHeight !== reportedWidth > reportedHeight) {
        let realPpiX = Math.fround(dispWidth / reportedHeight);
        Game.density = Math.fround(realPpiX / 160);
      }
    }
    Game.inputHandler = new InputHandler()._InputHandler(Gdx.input);
    if (ControllerHandler.controllersSupported()) {
      Controllers.addListener(new ControllerHandler()._ControllerHandler());
    }
    this.versionContextRef = Gdx.graphics.getGLVersion();
    Blending.useDefault();
    TextureCache.reload();
    Vertexbuffer.reload();
  }
  resize(width: number, height: number): void {
    if (width === 0 || height === 0) {
      return;
    }
    if (this.versionContextRef !== Gdx.graphics.getGLVersion()) {
      this.versionContextRef = Gdx.graphics.getGLVersion();
      Blending.useDefault();
      TextureCache.reload();
      Vertexbuffer.reload();
    }
    if (height !== Game.height || width !== Game.width) {
      Game.width = width;
      Game.height = height;
      Game.resetScene();
    }
  }
  render(): void {
    if (Game.instance !== this) {
      this.finish();
      return;
    }
    if (this.justResumed) {
      this.justResumed = false;
      if (DeviceCompat.isAndroid()) {
        return;
      }
    }
    NoosaScript.get().resetCamera();
    NoosaScriptNoLighting.get().resetCamera();
    Gdx.gl.glDisable(3089);
    Gdx.gl.glClear(16384);
    this.draw();
    Gdx.gl.glDisable(3089);
    this.step();
  }
  pause(): void {
    if (this.scene != null) {
      this.scene.onPause();
    }
    Script.reset();
  }
  resume(): void {
    this.justResumed = true;
  }
  finish(): void {
    Gdx.app.exit();
  }
  destroy(): void {
    if (this.scene != null) {
      this.scene.destroy();
      this.scene = null;
    }
    Game.sceneClass = null;
    Music.INSTANCE.reset();
    Sample.INSTANCE.reset();
  }
  dispose(): void {
    this.destroy();
  }
  static resetScene(): void {
    Game.switchScene$Class(Game.sceneClass);
  }
  static switchScene$Class(c: JClass<Scene>): void {
    Game.switchScene$Class$SceneChangeCallback(c, null);
  }
  static switchScene$Class$SceneChangeCallback(c: JClass<Scene>, callback: Game$SceneChangeCallback): void {
    Game.sceneClass = c;
    Game.instance.requestedReset = true;
    Game.instance.onChange_ = callback;
  }
  static scene(): Scene {
    return Game.instance.scene;
  }
  static switchingScene(): boolean {
    return Game.instance.requestedReset;
  }
  step(): void {
    if (this.requestedReset) {
      this.requestedReset = false;
      this.requestedScene = Reflection.newInstance(Game.sceneClass);
      if (this.requestedScene != null) {
        this.switchScene();
      }
    }
    this.update();
  }
  draw(): void {
    if (this.scene != null) {
      this.scene.draw();
    }
  }
  switchScene(): void {
    Camera.reset$();
    if (this.scene != null) {
      this.scene.destroy();
    }
    Vertexbuffer.clear();
    this.scene = this.requestedScene;
    if (this.onChange_ != null) {
      this.onChange_.beforeCreate();
    }
    this.scene.create();
    if (this.onChange_ != null) {
      this.onChange_.afterCreate();
    }
    this.onChange_ = null;
    Game.elapsed = 0;
    Game.timeScale = 1;
    Game.timeTotal = 0;
  }
  update(): void {
    let frameDelta = Math.min(Math.fround(0.2), Gdx.graphics.getDeltaTime());
    Game.elapsed = Math.fround(Game.timeScale * frameDelta);
    Game.timeTotal = Math.fround(Game.timeTotal + Game.elapsed);
    Game.realTime = TimeUtils.millis();
    Game.inputHandler.processAllEvents();
    Music.INSTANCE.update();
    Sample.INSTANCE.update();
    this.scene.update();
    Camera.updateAll();
  }
  static reportException(tr: Throwable): void {
    if (Game.instance != null && Gdx.app != null) {
      Game.instance.logException(tr);
    } else {
      let sw = new StringWriter();
      let pw = new PrintWriter(sw);
      tr.printStackTrace(pw);
      pw.flush();
      $J.err.println(sw.toString());
    }
  }
  logException(tr: Throwable): void {
    let sw = new StringWriter();
    let pw = new PrintWriter(sw);
    tr.printStackTrace(pw);
    pw.flush();
    Gdx.app.error('GAME', sw.toString());
  }
  static runOnRenderThread(c: Callback): void {
    Gdx.app.postRunnable(() => {
      c.call();
    });
  }
  static vibrate(milliseconds: number): void {
    if (Game.platform.supportsVibration()) {
      Game.platform.vibrate(milliseconds);
    }
  }
  static $clinit() {
    Game.density = 1;
    Game.timeScale = 1;
    Game.elapsed = 0;
    Game.timeTotal = 0;
    Game.realTime = 0n;
  }
}

export class Game$SceneChangeCallback {
}

$J.define(Game, 'com.watabou.noosa.Game', { kind: 'class', ifaces: ['com.badlogic.gdx.ApplicationListener'], sup: 'java.lang.Object', ctors: { 'java.lang.Class,com.watabou.utils.PlatformSupport': '_Game' }, meths: { 'switchScene(java.lang.Class,com.watabou.noosa.Game$SceneChangeCallback)': 'switchScene$Class$SceneChangeCallback', 'switchScene(java.lang.Class)': 'switchScene$Class' }, clinit: true, lazy: ['instance', 'width', 'height', 'density', 'version', 'versionCode', 'sceneClass', 'timeScale', 'elapsed', 'timeTotal', 'realTime', 'inputHandler', 'platform'] });
$J.define(Game$SceneChangeCallback, 'com.watabou.noosa.Game$SceneChangeCallback', { kind: 'interface' });
$J.module(() => {
  Script = $J.load('com.watabou.glscripts.Script');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  InputHandler = $J.load('com.watabou.input.InputHandler');
  Camera = $J.load('com.watabou.noosa.Camera');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
  NoosaScriptNoLighting = $J.load('com.watabou.noosa.NoosaScriptNoLighting');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
