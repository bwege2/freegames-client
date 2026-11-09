// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/SPDSettings.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString, Locale } from '../../../../jre/index.ts';
import { GameSettings } from '../../watabou/utils/GameSettings.ts';

let Challenges, ShatteredPixelDungeon, Languages, GameScene, PixelScene, Game, Music, Sample, DeviceCompat, Point;

export class SPDSettings extends GameSettings {
  static readonly KEY_VERSION: string = 'version';
  static readonly KEY_FULLSCREEN: string = 'fullscreen';
  static readonly KEY_LANDSCAPE: string = 'force_landscape';
  static readonly KEY_ZOOM: string = 'zoom';
  static readonly KEY_BRIGHTNESS: string = 'brightness';
  static readonly KEY_GRID: string = 'visual_grid';
  static readonly KEY_CAMERA_FOLLOW: string = 'camera_follow';
  static readonly KEY_SCREEN_SHAKE: string = 'screen_shake';
  static readonly KEY_UI_SIZE: string = 'full_ui';
  static readonly KEY_SCALE: string = 'scale';
  static readonly KEY_QUICK_SWAP: string = 'quickslot_swapper';
  static readonly KEY_FLIPTOOLBAR: string = 'flipped_ui';
  static readonly KEY_FLIPTAGS: string = 'flip_tags';
  static readonly KEY_BARMODE: string = 'toolbar_mode';
  static readonly KEY_SLOTWATERSKIN: string = 'quickslot_waterskin';
  static readonly KEY_SYSTEMFONT: string = 'system_font';
  static readonly KEY_VIBRATION: string = 'vibration';
  static readonly KEY_GAMES_SORT: string = 'games_sort';
  static readonly KEY_LAST_CLASS: string = 'last_class';
  static readonly KEY_CHALLENGES: string = 'challenges';
  static readonly KEY_CUSTOM_SEED: string = 'custom_seed';
  static readonly KEY_LAST_DAILY: string = 'last_daily';
  static readonly KEY_INTRO: string = 'intro';
  static readonly KEY_SUPPORT_NAGGED: string = 'support_nagged';
  static readonly KEY_VICTORY_NAGGED: string = 'victory_nagged';
  static readonly KEY_VAULT_INJURE_WARNS: string = 'vault_injure_warns';
  static readonly KEY_CONTROLLER_SENS: string = 'controller_sens';
  static readonly KEY_MOVE_SENS: string = 'move_sens';
  static readonly KEY_NEWS: string = 'news';
  static readonly KEY_UPDATES: string = 'updates';
  static readonly KEY_BETAS: string = 'betas';
  static readonly KEY_WIFI: string = 'wifi';
  static readonly KEY_NEWS_LAST_READ: string = 'news_last_read';
  static newsDefault: boolean = false;
  static readonly KEY_MUSIC: string = 'music';
  static readonly KEY_MUSIC_VOL: string = 'music_vol';
  static readonly KEY_SOUND_FX: string = 'soundfx';
  static readonly KEY_SFX_VOL: string = 'sfx_vol';
  static readonly KEY_IGNORE_SILENT: string = 'ignore_silent';
  static readonly KEY_MUSIC_BG: string = 'music_bg';
  static readonly KEY_LANG: string = 'language';
  static readonly KEY_WINDOW_WIDTH: string = 'window_width';
  static readonly KEY_WINDOW_HEIGHT: string = 'window_height';
  static readonly KEY_WINDOW_MAXIMIZED: string = 'window_maximized';
  static readonly KEY_FULLSCREEN_MONITOR: string = 'fullscreen_monitor';
  _SPDSettings(): this {
    this._GameSettings();
    return this;
  }
  static version$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_VERSION, value);
  }
  static version$(): number {
    return GameSettings.getInt$String$int(SPDSettings.KEY_VERSION, 0);
  }
  static fullscreen$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_FULLSCREEN, value);
    ShatteredPixelDungeon.updateSystemUI();
  }
  static fullscreen$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_FULLSCREEN, true);
  }
  static landscape$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_LANDSCAPE, value);
    (Game.instance).updateDisplaySize();
  }
  static landscape$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_LANDSCAPE, false);
  }
  static zoom$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_ZOOM, value);
  }
  static zoom$(): number {
    return GameSettings.getInt$String$int(SPDSettings.KEY_ZOOM, 0);
  }
  static brightness$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_BRIGHTNESS, value);
    GameScene.updateFog$();
  }
  static brightness$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_BRIGHTNESS, 0, -1, 1);
  }
  static visualGrid$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_GRID, value);
    GameScene.updateMap$();
  }
  static visualGrid$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_GRID, 0, -1, 2);
  }
  static cameraFollow$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_CAMERA_FOLLOW, value);
  }
  static cameraFollow$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_CAMERA_FOLLOW, 4, 1, 4);
  }
  static screenShake$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_SCREEN_SHAKE, value);
  }
  static screenShake$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_SCREEN_SHAKE, 2, 0, 4);
  }
  static interfaceSize$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_UI_SIZE, value);
  }
  static interfaceSize$(): number {
    let size = GameSettings.getInt$String$int(SPDSettings.KEY_UI_SIZE, DeviceCompat.isDesktop() ? 2 : 0);
    if (size > 0) {
      let wMin = Math.fround(Game.width / PixelScene.MIN_WIDTH_FULL);
      let hMin = Math.fround(Game.height / PixelScene.MIN_HEIGHT_FULL);
      if (Math.min(wMin, hMin) < Math.fround(2 * Game.density)) {
        size = 0;
      }
    }
    return size;
  }
  static scale$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_SCALE, value);
  }
  static scale$(): number {
    return GameSettings.getInt$String$int(SPDSettings.KEY_SCALE, 0);
  }
  static quickSwapper$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_QUICK_SWAP, value);
  }
  static quickSwapper$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_QUICK_SWAP, true);
  }
  static flipToolbar$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_FLIPTOOLBAR, value);
  }
  static flipToolbar$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_FLIPTOOLBAR, false);
  }
  static flipTags$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_FLIPTAGS, value);
  }
  static flipTags$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_FLIPTAGS, false);
  }
  static toolbarMode$String(value: string): void {
    GameSettings.put$String$String(SPDSettings.KEY_BARMODE, value);
  }
  static toolbarMode$(): string {
    return GameSettings.getString$String$String(SPDSettings.KEY_BARMODE, PixelScene.landscape() ? 'GROUP' : 'SPLIT');
  }
  static quickslotWaterskin$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_SLOTWATERSKIN, value);
  }
  static quickslotWaterskin$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_SLOTWATERSKIN, true);
  }
  static systemFont$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_SYSTEMFONT, value);
  }
  static systemFont$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_SYSTEMFONT, (SPDSettings.language$() === Languages.CHI_SMPL || SPDSettings.language$() === Languages.CHI_TRAD || SPDSettings.language$() === Languages.KOREAN || SPDSettings.language$() === Languages.JAPANESE));
  }
  static vibration$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_VIBRATION, value);
  }
  static vibration$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_VIBRATION, true);
  }
  static gamesInProgressSort$(): string {
    return GameSettings.getString$String$String(SPDSettings.KEY_GAMES_SORT, 'level');
  }
  static gamesInProgressSort$String(value: string): void {
    GameSettings.put$String$String(SPDSettings.KEY_GAMES_SORT, value);
  }
  static intro$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_INTRO, value);
  }
  static intro$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_INTRO, true);
  }
  static lastClass$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_LAST_CLASS, value);
  }
  static lastClass$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_LAST_CLASS, 0, 0, 3);
  }
  static challenges$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_CHALLENGES, value);
  }
  static challenges$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_CHALLENGES, 0, 0, Challenges.MAX_VALUE);
  }
  static customSeed$String(value: string): void {
    GameSettings.put$String$String(SPDSettings.KEY_CUSTOM_SEED, value);
  }
  static customSeed$(): string {
    return GameSettings.getString$String$String$int(SPDSettings.KEY_CUSTOM_SEED, '', 20);
  }
  static lastDaily$long(value: bigint): void {
    GameSettings.put$String$long(SPDSettings.KEY_LAST_DAILY, value);
  }
  static lastDaily$(): bigint {
    return GameSettings.getLong$String$long(SPDSettings.KEY_LAST_DAILY, 0n);
  }
  static supportNagged$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_SUPPORT_NAGGED, value);
  }
  static supportNagged$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_SUPPORT_NAGGED, false);
  }
  static victoryNagged$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_VICTORY_NAGGED, value);
  }
  static victoryNagged$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_VICTORY_NAGGED, false);
  }
  static vaultInjureWarns$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_VAULT_INJURE_WARNS, value);
  }
  static vaultInjureWarns$(): number {
    return GameSettings.getInt$String$int(SPDSettings.KEY_VAULT_INJURE_WARNS, 0);
  }
  static controllerPointerSensitivity$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_CONTROLLER_SENS, value);
  }
  static controllerPointerSensitivity$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_CONTROLLER_SENS, 5, 1, 10);
  }
  static movementHoldSensitivity$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_MOVE_SENS, value);
  }
  static movementHoldSensitivity$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_MOVE_SENS, 3, 0, 4);
  }
  static news$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_NEWS, value);
  }
  static news$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_NEWS, SPDSettings.newsDefault);
  }
  static updates$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_UPDATES, value);
  }
  static updates$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_UPDATES, true);
  }
  static betas$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_BETAS, value);
  }
  static betas$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_BETAS, Game.version.includes('BETA') || Game.version.includes('RC'));
  }
  static WiFi$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_WIFI, value);
  }
  static WiFi$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_WIFI, true);
  }
  static newsLastRead$long(lastRead: bigint): void {
    GameSettings.put$String$long(SPDSettings.KEY_NEWS_LAST_READ, lastRead);
  }
  static newsLastRead$(): bigint {
    return GameSettings.getLong$String$long(SPDSettings.KEY_NEWS_LAST_READ, 0n);
  }
  static music$boolean(value: boolean): void {
    Music.INSTANCE.enable(value);
    GameSettings.put$String$boolean(SPDSettings.KEY_MUSIC, value);
  }
  static music$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_MUSIC, true);
  }
  static musicVol$int(value: number): void {
    Music.INSTANCE.volume(Math.fround(Math.imul(value, value) / 100));
    GameSettings.put$String$int(SPDSettings.KEY_MUSIC_VOL, value);
  }
  static musicVol$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_MUSIC_VOL, 10, 0, 10);
  }
  static soundFx$boolean(value: boolean): void {
    Sample.INSTANCE.enable(value);
    GameSettings.put$String$boolean(SPDSettings.KEY_SOUND_FX, value);
  }
  static soundFx$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_SOUND_FX, true);
  }
  static SFXVol$int(value: number): void {
    Sample.INSTANCE.volume(Math.fround(Math.imul(value, value) / 100));
    GameSettings.put$String$int(SPDSettings.KEY_SFX_VOL, value);
  }
  static SFXVol$(): number {
    return GameSettings.getInt$String$int$int$int(SPDSettings.KEY_SFX_VOL, 10, 0, 10);
  }
  static ignoreSilentMode$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_IGNORE_SILENT, value);
    Game.platform.setHonorSilentSwitch(!value);
  }
  static ignoreSilentMode$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_IGNORE_SILENT, false);
  }
  static playMusicInBackground$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_MUSIC_BG, value);
  }
  static playMusicInBackground$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_MUSIC_BG, true);
  }
  static language$Languages(lang: Languages): void {
    GameSettings.put$String$String(SPDSettings.KEY_LANG, lang.code());
  }
  static language$(): Languages {
    let code = GameSettings.getString$String$String(SPDSettings.KEY_LANG, null);
    if (code == null) {
      return Languages.matchLocale(Locale.getDefault());
    } else {
      return Languages.matchCode(code);
    }
  }
  static windowResolution$Point(p: Point): void {
    GameSettings.put$String$int(SPDSettings.KEY_WINDOW_WIDTH, p.x);
    GameSettings.put$String$int(SPDSettings.KEY_WINDOW_HEIGHT, p.y);
  }
  static windowResolution$(): Point {
    return new Point()._Point$int$int(GameSettings.getInt$String$int$int$int(SPDSettings.KEY_WINDOW_WIDTH, 800, 720, 2147483647), GameSettings.getInt$String$int$int$int(SPDSettings.KEY_WINDOW_HEIGHT, 600, 400, 2147483647));
  }
  static windowMaximized$boolean(value: boolean): void {
    GameSettings.put$String$boolean(SPDSettings.KEY_WINDOW_MAXIMIZED, value);
  }
  static windowMaximized$(): boolean {
    return GameSettings.getBoolean(SPDSettings.KEY_WINDOW_MAXIMIZED, false);
  }
  static fulLScreenMonitor$int(value: number): void {
    GameSettings.put$String$int(SPDSettings.KEY_FULLSCREEN_MONITOR, value);
  }
  static fulLScreenMonitor$(): number {
    return GameSettings.getInt$String$int(SPDSettings.KEY_FULLSCREEN_MONITOR, 0);
  }
  static $clinit() {
    SPDSettings.newsDefault = true;
  }
}

$J.define(SPDSettings, 'com.shatteredpixel.shatteredpixeldungeon.SPDSettings', { kind: 'class', sup: 'com.watabou.utils.GameSettings', ctors: { '': '_SPDSettings' }, meths: { 'fulLScreenMonitor()': 'fulLScreenMonitor$', 'fulLScreenMonitor(int)': 'fulLScreenMonitor$int', 'windowMaximized()': 'windowMaximized$', 'windowMaximized(boolean)': 'windowMaximized$boolean', 'windowResolution()': 'windowResolution$', 'windowResolution(com.watabou.utils.Point)': 'windowResolution$Point', 'language()': 'language$', 'language(com.shatteredpixel.shatteredpixeldungeon.messages.Languages)': 'language$Languages', 'playMusicInBackground()': 'playMusicInBackground$', 'playMusicInBackground(boolean)': 'playMusicInBackground$boolean', 'ignoreSilentMode()': 'ignoreSilentMode$', 'ignoreSilentMode(boolean)': 'ignoreSilentMode$boolean', 'SFXVol()': 'SFXVol$', 'SFXVol(int)': 'SFXVol$int', 'soundFx()': 'soundFx$', 'soundFx(boolean)': 'soundFx$boolean', 'musicVol()': 'musicVol$', 'musicVol(int)': 'musicVol$int', 'music()': 'music$', 'music(boolean)': 'music$boolean', 'newsLastRead()': 'newsLastRead$', 'newsLastRead(long)': 'newsLastRead$long', 'WiFi()': 'WiFi$', 'WiFi(boolean)': 'WiFi$boolean', 'betas()': 'betas$', 'betas(boolean)': 'betas$boolean', 'updates()': 'updates$', 'updates(boolean)': 'updates$boolean', 'news()': 'news$', 'news(boolean)': 'news$boolean', 'movementHoldSensitivity()': 'movementHoldSensitivity$', 'movementHoldSensitivity(int)': 'movementHoldSensitivity$int', 'controllerPointerSensitivity()': 'controllerPointerSensitivity$', 'controllerPointerSensitivity(int)': 'controllerPointerSensitivity$int', 'vaultInjureWarns()': 'vaultInjureWarns$', 'vaultInjureWarns(int)': 'vaultInjureWarns$int', 'victoryNagged()': 'victoryNagged$', 'victoryNagged(boolean)': 'victoryNagged$boolean', 'supportNagged()': 'supportNagged$', 'supportNagged(boolean)': 'supportNagged$boolean', 'lastDaily()': 'lastDaily$', 'lastDaily(long)': 'lastDaily$long', 'customSeed()': 'customSeed$', 'customSeed(java.lang.String)': 'customSeed$String', 'challenges()': 'challenges$', 'challenges(int)': 'challenges$int', 'lastClass()': 'lastClass$', 'lastClass(int)': 'lastClass$int', 'intro()': 'intro$', 'intro(boolean)': 'intro$boolean', 'gamesInProgressSort(java.lang.String)': 'gamesInProgressSort$String', 'gamesInProgressSort()': 'gamesInProgressSort$', 'vibration()': 'vibration$', 'vibration(boolean)': 'vibration$boolean', 'systemFont()': 'systemFont$', 'systemFont(boolean)': 'systemFont$boolean', 'quickslotWaterskin()': 'quickslotWaterskin$', 'quickslotWaterskin(boolean)': 'quickslotWaterskin$boolean', 'toolbarMode()': 'toolbarMode$', 'toolbarMode(java.lang.String)': 'toolbarMode$String', 'flipTags()': 'flipTags$', 'flipTags(boolean)': 'flipTags$boolean', 'flipToolbar()': 'flipToolbar$', 'flipToolbar(boolean)': 'flipToolbar$boolean', 'quickSwapper()': 'quickSwapper$', 'quickSwapper(boolean)': 'quickSwapper$boolean', 'scale()': 'scale$', 'scale(int)': 'scale$int', 'interfaceSize()': 'interfaceSize$', 'interfaceSize(int)': 'interfaceSize$int', 'screenShake()': 'screenShake$', 'screenShake(int)': 'screenShake$int', 'cameraFollow()': 'cameraFollow$', 'cameraFollow(int)': 'cameraFollow$int', 'visualGrid()': 'visualGrid$', 'visualGrid(int)': 'visualGrid$int', 'brightness()': 'brightness$', 'brightness(int)': 'brightness$int', 'zoom()': 'zoom$', 'zoom(int)': 'zoom$int', 'landscape()': 'landscape$', 'landscape(boolean)': 'landscape$boolean', 'fullscreen()': 'fullscreen$', 'fullscreen(boolean)': 'fullscreen$boolean', 'version()': 'version$', 'version(int)': 'version$int' }, clinit: true, lazy: ['newsDefault'] });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  Point = $J.load('com.watabou.utils.Point');
});
