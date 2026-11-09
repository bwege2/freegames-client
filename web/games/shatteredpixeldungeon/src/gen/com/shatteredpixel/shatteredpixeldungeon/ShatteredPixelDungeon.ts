// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ShatteredPixelDungeon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { Game } from '../../watabou/noosa/Game.ts';

let Assets$Sounds, SPDAction, SPDSettings, WornKey, GameScene, PixelScene, TitleScene, WelcomeScene, Music, Sample, Bundle, DeviceCompat;

export class ShatteredPixelDungeon extends Game {
  static readonly v1_2_3: number = 628;
  static readonly v3_1_1: number = 850;
  static readonly v3_2_1: number = 861;
  static readonly v3_2_5: number = 877;
  static readonly v3_3_0: number = 883;
  static readonly v4_0_0: number = 911;
  _ShatteredPixelDungeon(platform: PlatformSupport): this {
    this._Game(Game.sceneClass == null ? $J.cls(WelcomeScene) : Game.sceneClass, platform);
    Bundle.addAlias($J.cls(WornKey), 'com.shatteredpixel.shatteredpixeldungeon.items.keys.SkeletonKey');
    return this;
  }
  create(): void {
    super.create();
    ShatteredPixelDungeon.updateSystemUI();
    SPDAction.loadBindings();
    Music.INSTANCE.enable(SPDSettings.music$());
    Music.INSTANCE.volume(Math.fround(Math.imul(SPDSettings.musicVol$(), SPDSettings.musicVol$()) / 100));
    Sample.INSTANCE.enable(SPDSettings.soundFx$());
    Sample.INSTANCE.volume(Math.fround(Math.imul(SPDSettings.SFXVol$(), SPDSettings.SFXVol$()) / 100));
    Sample.INSTANCE.load$StringArr(Assets$Sounds.all);
  }
  finish(): void {
    if (!DeviceCompat.isiOS()) {
      super.finish();
    } else {
      Game.switchScene$Class($J.cls(TitleScene));
    }
  }
  static switchNoFade$Class(c: JClass<PixelScene>): void {
    ShatteredPixelDungeon.switchNoFade$Class$SceneChangeCallback(c, null);
  }
  static switchNoFade$Class$SceneChangeCallback(c: JClass<PixelScene>, callback: Game$SceneChangeCallback): void {
    PixelScene.noFade = true;
    Game.switchScene$Class$SceneChangeCallback(c, callback);
  }
  static seamlessResetScene$SceneChangeCallback(callback: Game$SceneChangeCallback): void {
    if (Game.scene() instanceof PixelScene) {
      (Game.scene()).saveWindows();
      ShatteredPixelDungeon.switchNoFade$Class$SceneChangeCallback(Game.sceneClass, callback);
    } else {
      Game.resetScene();
    }
  }
  static seamlessResetScene$(): void {
    ShatteredPixelDungeon.seamlessResetScene$SceneChangeCallback(null);
  }
  switchScene(): void {
    super.switchScene();
    if (this.scene instanceof PixelScene) {
      (this.scene).restoreWindows();
    }
  }
  resize(width: number, height: number): void {
    if (width === 0 || height === 0) {
      return;
    }
    if (this.scene instanceof PixelScene && (height !== Game.height || width !== Game.width)) {
      PixelScene.noFade = true;
      (this.scene).saveWindows();
    }
    super.resize(width, height);
    this.updateDisplaySize();
  }
  destroy(): void {
    super.destroy();
    GameScene.endActorThread();
  }
  updateDisplaySize(): void {
    Game.platform.updateDisplaySize();
  }
  static updateSystemUI(): void {
    Game.platform.updateSystemUI();
  }
}

$J.define(ShatteredPixelDungeon, 'com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon', { kind: 'class', sup: 'com.watabou.noosa.Game', ctors: { 'com.watabou.utils.PlatformSupport': '_ShatteredPixelDungeon' }, meths: { 'seamlessResetScene()': 'seamlessResetScene$', 'seamlessResetScene(com.watabou.noosa.Game$SceneChangeCallback)': 'seamlessResetScene$SceneChangeCallback', 'switchNoFade(java.lang.Class,com.watabou.noosa.Game$SceneChangeCallback)': 'switchNoFade$Class$SceneChangeCallback', 'switchNoFade(java.lang.Class)': 'switchNoFade$Class' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  WornKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.WornKey');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  WelcomeScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Bundle = $J.load('com.watabou.utils.Bundle');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
