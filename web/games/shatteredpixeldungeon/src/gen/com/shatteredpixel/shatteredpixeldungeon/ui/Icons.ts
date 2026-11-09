// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Icons.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum, JString } from '../../../../../jre/index.ts';

let Assets$Interfaces, Dungeon, HeroClass, Level$Feeling, PixelScene, ItemSprite, ItemSpriteSheet, Image;

export class Icons extends JEnum {
  static ENTER: Icons = null;
  static GOLD: Icons = null;
  static RANKINGS: Icons = null;
  static BADGES: Icons = null;
  static NEWS: Icons = null;
  static CHANGES: Icons = null;
  static PREFS: Icons = null;
  static SHPX: Icons = null;
  static JOURNAL: Icons = null;
  static EXIT: Icons = null;
  static DISPLAY: Icons = null;
  static DISPLAY_LAND: Icons = null;
  static DISPLAY_PORT: Icons = null;
  static DATA: Icons = null;
  static AUDIO: Icons = null;
  static LANGS: Icons = null;
  static CONTROLLER: Icons = null;
  static KEYBOARD: Icons = null;
  static STATS: Icons = null;
  static CHALLENGE_GREY: Icons = null;
  static SCROLL_GREY: Icons = null;
  static SEED: Icons = null;
  static LEFTARROW: Icons = null;
  static RIGHTARROW: Icons = null;
  static CALENDAR: Icons = null;
  static CHEVRON: Icons = null;
  static SHUFFLE: Icons = null;
  static TARGET: Icons = null;
  static INFO: Icons = null;
  static WARNING: Icons = null;
  static UNCHECKED: Icons = null;
  static CHECKED: Icons = null;
  static CLOSE: Icons = null;
  static PLUS: Icons = null;
  static REPEAT: Icons = null;
  static ARROW: Icons = null;
  static CHALLENGE_COLOR: Icons = null;
  static SCROLL_COLOR: Icons = null;
  static COPY: Icons = null;
  static PASTE: Icons = null;
  static BACKPACK_LRG: Icons = null;
  static TALENT: Icons = null;
  static MAGNIFY: Icons = null;
  static SNAKE: Icons = null;
  static BUFFS: Icons = null;
  static CATALOG: Icons = null;
  static ALCHEMY: Icons = null;
  static GRASS: Icons = null;
  static STAIRS: Icons = null;
  static STAIRS_CHASM: Icons = null;
  static STAIRS_WATER: Icons = null;
  static STAIRS_GRASS: Icons = null;
  static STAIRS_DARK: Icons = null;
  static STAIRS_LARGE: Icons = null;
  static STAIRS_TRAPS: Icons = null;
  static STAIRS_SECRETS: Icons = null;
  static WELL_HEALTH: Icons = null;
  static WELL_AWARENESS: Icons = null;
  static SACRIFICE_ALTAR: Icons = null;
  static DISTANT_WELL: Icons = null;
  static SKULL: Icons = null;
  static BUSY: Icons = null;
  static COMPASS: Icons = null;
  static SLEEP: Icons = null;
  static ALERT: Icons = null;
  static LOST: Icons = null;
  static INVESTIGATE: Icons = null;
  static DEPTH: Icons = null;
  static DEPTH_CHASM: Icons = null;
  static DEPTH_WATER: Icons = null;
  static DEPTH_GRASS: Icons = null;
  static DEPTH_DARK: Icons = null;
  static DEPTH_LARGE: Icons = null;
  static DEPTH_TRAPS: Icons = null;
  static DEPTH_SECRETS: Icons = null;
  static CHAL_COUNT: Icons = null;
  static COIN_SML: Icons = null;
  static ENERGY_SML: Icons = null;
  static BACKPACK: Icons = null;
  static SEED_POUCH: Icons = null;
  static SCROLL_HOLDER: Icons = null;
  static WAND_HOLSTER: Icons = null;
  static POTION_BANDOLIER: Icons = null;
  static LIBGDX: Icons = null;
  static ALEKS: Icons = null;
  static WATA: Icons = null;
  static PUMPKINVOLT: Icons = null;
  static CELESTI: Icons = null;
  static LUMINE: Icons = null;
  static CUBE_CODE: Icons = null;
  static PURIGRO: Icons = null;
  static ARCNOR: Icons = null;
  static ALASTAIR: Icons = null;
  static $VALUES: Icons[] = null;
  _Icons($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  get(): Image {
    return Icons.get$Icons(this);
  }
  static get$Icons(type$: Icons): Image {
    let icon = new Image()._Image$Object(Assets$Interfaces.ICONS);
    switch (type$) {
      case Icons.ENTER:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 0, 16, 16));
        break;
      case Icons.GOLD:
        icon.frame$RectF(icon.texture_.uvRectBySize(17, 0, 17, 16));
        break;
      case Icons.RANKINGS:
        icon.frame$RectF(icon.texture_.uvRectBySize(34, 0, 17, 16));
        break;
      case Icons.BADGES:
        icon.frame$RectF(icon.texture_.uvRectBySize(51, 0, 16, 16));
        break;
      case Icons.NEWS:
        icon.frame$RectF(icon.texture_.uvRectBySize(68, 0, 16, 15));
        break;
      case Icons.CHANGES:
        icon.frame$RectF(icon.texture_.uvRectBySize(85, 0, 15, 15));
        break;
      case Icons.PREFS:
        icon.frame$RectF(icon.texture_.uvRectBySize(102, 0, 14, 14));
        break;
      case Icons.SHPX:
        icon.frame$RectF(icon.texture_.uvRectBySize(119, 0, 16, 16));
        break;
      case Icons.JOURNAL:
        icon.frame$RectF(icon.texture_.uvRectBySize(136, 0, 17, 15));
        break;
      case Icons.EXIT:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 16, 15, 11));
        break;
      case Icons.DISPLAY:
        if (!PixelScene.landscape()) {
          return Icons.get$Icons(Icons.DISPLAY_PORT);
        } else {
          return Icons.get$Icons(Icons.DISPLAY_LAND);
        }
      case Icons.DISPLAY_PORT:
        icon.frame$RectF(icon.texture_.uvRectBySize(16, 16, 12, 16));
        break;
      case Icons.DISPLAY_LAND:
        icon.frame$RectF(icon.texture_.uvRectBySize(32, 16, 16, 12));
        break;
      case Icons.DATA:
        icon.frame$RectF(icon.texture_.uvRectBySize(48, 16, 14, 15));
        break;
      case Icons.AUDIO:
        icon.frame$RectF(icon.texture_.uvRectBySize(64, 16, 14, 14));
        break;
      case Icons.LANGS:
        icon.frame$RectF(icon.texture_.uvRectBySize(80, 16, 14, 11));
        break;
      case Icons.CONTROLLER:
        icon.frame$RectF(icon.texture_.uvRectBySize(96, 16, 16, 12));
        break;
      case Icons.KEYBOARD:
        icon.frame$RectF(icon.texture_.uvRectBySize(112, 16, 15, 12));
        break;
      case Icons.STATS:
        icon.frame$RectF(icon.texture_.uvRectBySize(128, 16, 16, 13));
        break;
      case Icons.CHALLENGE_GREY:
        icon.frame$RectF(icon.texture_.uvRectBySize(144, 16, 15, 12));
        break;
      case Icons.SCROLL_GREY:
        icon.frame$RectF(icon.texture_.uvRectBySize(160, 16, 15, 14));
        break;
      case Icons.SEED:
        icon.frame$RectF(icon.texture_.uvRectBySize(176, 16, 15, 10));
        break;
      case Icons.LEFTARROW:
        icon.frame$RectF(icon.texture_.uvRectBySize(192, 16, 14, 9));
        break;
      case Icons.RIGHTARROW:
        icon.frame$RectF(icon.texture_.uvRectBySize(208, 16, 14, 9));
        break;
      case Icons.CALENDAR:
        icon.frame$RectF(icon.texture_.uvRectBySize(224, 16, 15, 12));
        break;
      case Icons.CHEVRON:
        icon.frame$RectF(icon.texture_.uvRectBySize(240, 16, 13, 10));
        break;
      case Icons.SHUFFLE:
        icon.frame$RectF(icon.texture_.uvRectBySize(240, 32, 15, 12));
        break;
      case Icons.TARGET:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 32, 16, 16));
        break;
      case Icons.INFO:
        icon.frame$RectF(icon.texture_.uvRectBySize(16, 32, 14, 14));
        break;
      case Icons.WARNING:
        icon.frame$RectF(icon.texture_.uvRectBySize(32, 32, 14, 14));
        break;
      case Icons.UNCHECKED:
        icon.frame$RectF(icon.texture_.uvRectBySize(48, 32, 12, 12));
        break;
      case Icons.CHECKED:
        icon.frame$RectF(icon.texture_.uvRectBySize(64, 32, 12, 12));
        break;
      case Icons.CLOSE:
        icon.frame$RectF(icon.texture_.uvRectBySize(80, 32, 11, 11));
        break;
      case Icons.PLUS:
        icon.frame$RectF(icon.texture_.uvRectBySize(96, 32, 11, 11));
        break;
      case Icons.REPEAT:
        icon.frame$RectF(icon.texture_.uvRectBySize(112, 32, 11, 11));
        break;
      case Icons.ARROW:
        icon.frame$RectF(icon.texture_.uvRectBySize(128, 32, 11, 11));
        break;
      case Icons.CHALLENGE_COLOR:
        icon.frame$RectF(icon.texture_.uvRectBySize(144, 32, 15, 12));
        break;
      case Icons.SCROLL_COLOR:
        icon.frame$RectF(icon.texture_.uvRectBySize(160, 32, 15, 14));
        break;
      case Icons.COPY:
        icon.frame$RectF(icon.texture_.uvRectBySize(176, 32, 13, 13));
        break;
      case Icons.PASTE:
        icon.frame$RectF(icon.texture_.uvRectBySize(192, 32, 13, 13));
        break;
      case Icons.BACKPACK_LRG:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 48, 16, 16));
        break;
      case Icons.TALENT:
        icon.frame$RectF(icon.texture_.uvRectBySize(16, 48, 13, 13));
        break;
      case Icons.MAGNIFY:
        icon.frame$RectF(icon.texture_.uvRectBySize(32, 48, 14, 14));
        break;
      case Icons.SNAKE:
        icon.frame$RectF(icon.texture_.uvRectBySize(48, 48, 9, 13));
        break;
      case Icons.BUFFS:
        icon.frame$RectF(icon.texture_.uvRectBySize(64, 48, 16, 15));
        break;
      case Icons.CATALOG:
        icon.frame$RectF(icon.texture_.uvRectBySize(80, 48, 13, 16));
        break;
      case Icons.ALCHEMY:
        icon.frame$RectF(icon.texture_.uvRectBySize(96, 48, 16, 16));
        break;
      case Icons.GRASS:
        icon.frame$RectF(icon.texture_.uvRectBySize(112, 48, 16, 16));
        break;
      case Icons.STAIRS:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 64, 15, 16));
        break;
      case Icons.STAIRS_CHASM:
        icon.frame$RectF(icon.texture_.uvRectBySize(16, 64, 15, 16));
        break;
      case Icons.STAIRS_WATER:
        icon.frame$RectF(icon.texture_.uvRectBySize(32, 64, 15, 16));
        break;
      case Icons.STAIRS_GRASS:
        icon.frame$RectF(icon.texture_.uvRectBySize(48, 64, 15, 16));
        break;
      case Icons.STAIRS_DARK:
        icon.frame$RectF(icon.texture_.uvRectBySize(64, 64, 15, 16));
        break;
      case Icons.STAIRS_LARGE:
        icon.frame$RectF(icon.texture_.uvRectBySize(80, 64, 15, 16));
        break;
      case Icons.STAIRS_TRAPS:
        icon.frame$RectF(icon.texture_.uvRectBySize(96, 64, 15, 16));
        break;
      case Icons.STAIRS_SECRETS:
        icon.frame$RectF(icon.texture_.uvRectBySize(112, 64, 15, 16));
        break;
      case Icons.WELL_HEALTH:
        icon.frame$RectF(icon.texture_.uvRectBySize(128, 64, 16, 16));
        break;
      case Icons.WELL_AWARENESS:
        icon.frame$RectF(icon.texture_.uvRectBySize(144, 64, 16, 16));
        break;
      case Icons.SACRIFICE_ALTAR:
        icon.frame$RectF(icon.texture_.uvRectBySize(160, 64, 16, 16));
        break;
      case Icons.DISTANT_WELL:
        icon.frame$RectF(icon.texture_.uvRectBySize(176, 64, 16, 16));
        break;
      case Icons.SKULL:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 80, 8, 8));
        break;
      case Icons.BUSY:
        icon.frame$RectF(icon.texture_.uvRectBySize(8, 80, 8, 8));
        break;
      case Icons.COMPASS:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 88, 7, 5));
        break;
      case Icons.SLEEP:
        icon.frame$RectF(icon.texture_.uvRectBySize(7, 88, 9, 8));
        break;
      case Icons.ALERT:
        icon.frame$RectF(icon.texture_.uvRectBySize(16, 80, 8, 8));
        break;
      case Icons.LOST:
        icon.frame$RectF(icon.texture_.uvRectBySize(24, 80, 8, 8));
        break;
      case Icons.INVESTIGATE:
        icon.frame$RectF(icon.texture_.uvRectBySize(16, 88, 8, 8));
        break;
      case Icons.DEPTH:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((32 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 6, 7));
        break;
      case Icons.DEPTH_CHASM:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((40 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 7, 7));
        break;
      case Icons.DEPTH_WATER:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((48 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 7, 7));
        break;
      case Icons.DEPTH_GRASS:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((56 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 7, 7));
        break;
      case Icons.DEPTH_DARK:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((64 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 7, 7));
        break;
      case Icons.DEPTH_LARGE:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((72 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 7, 7));
        break;
      case Icons.DEPTH_TRAPS:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((80 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 7, 7));
        break;
      case Icons.DEPTH_SECRETS:
        icon.frame$RectF(icon.texture_.uvRectBySize(Math.fround((88 + Icons.runTypeOfsX()) | 0), Math.fround((80 + Icons.runTypeOfsY()) | 0), 7, 7));
        break;
      case Icons.CHAL_COUNT:
        icon.frame$RectF(icon.texture_.uvRectBySize(160, 80, 7, 7));
        break;
      case Icons.COIN_SML:
        icon.frame$RectF(icon.texture_.uvRectBySize(168, 80, 7, 7));
        break;
      case Icons.ENERGY_SML:
        icon.frame$RectF(icon.texture_.uvRectBySize(168, 88, 8, 7));
        break;
      case Icons.BACKPACK:
        icon.frame$RectF(icon.texture_.uvRectBySize(176, 80, 10, 10));
        break;
      case Icons.SCROLL_HOLDER:
        icon.frame$RectF(icon.texture_.uvRectBySize(186, 80, 10, 10));
        break;
      case Icons.SEED_POUCH:
        icon.frame$RectF(icon.texture_.uvRectBySize(196, 80, 10, 10));
        break;
      case Icons.WAND_HOLSTER:
        icon.frame$RectF(icon.texture_.uvRectBySize(206, 80, 10, 10));
        break;
      case Icons.POTION_BANDOLIER:
        icon.frame$RectF(icon.texture_.uvRectBySize(216, 80, 10, 10));
        break;
      case Icons.LIBGDX:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 96, 16, 13));
        break;
      case Icons.ALEKS:
        icon.frame$RectF(icon.texture_.uvRectBySize(16, 96, 16, 13));
        break;
      case Icons.WATA:
        icon.frame$RectF(icon.texture_.uvRectBySize(0, 112, 17, 12));
        break;
      case Icons.PUMPKINVOLT:
        icon.frame$RectF(icon.texture_.uvRectBySize(17, 112, 14, 15));
        break;
      case Icons.CELESTI:
        icon.frame$RectF(icon.texture_.uvRectBySize(32, 96, 32, 32));
        icon.scale_.set$float(PixelScene.align$float(Math.fround(0.49)));
        break;
      case Icons.LUMINE:
        icon.frame$RectF(icon.texture_.uvRectBySize(64, 96, 32, 32));
        icon.scale_.set$float(PixelScene.align$float(Math.fround(0.49)));
        break;
      case Icons.ARCNOR:
        icon.frame$RectF(icon.texture_.uvRectBySize(96, 96, 32, 32));
        icon.scale_.set$float(PixelScene.align$float(Math.fround(0.49)));
        break;
      case Icons.PURIGRO:
        icon.frame$RectF(icon.texture_.uvRectBySize(128, 96, 32, 32));
        icon.scale_.set$float(PixelScene.align$float(Math.fround(0.49)));
        break;
      case Icons.CUBE_CODE:
        icon.frame$RectF(icon.texture_.uvRectBySize(160, 96, 27, 30));
        icon.scale_.set$float(PixelScene.align$float(Math.fround(0.49)));
        break;
      case Icons.ALASTAIR:
        icon.frame$RectF(icon.texture_.uvRectBySize(192, 96, 32, 32));
        icon.scale_.set$float(PixelScene.align$float(Math.fround(0.49)));
        break;
    }
    return icon;
  }
  static runTypeOfsX(): number {
    return Dungeon.daily ? 64 : 0;
  }
  static runTypeOfsY(): number {
    if ((Dungeon.daily && Dungeon.dailyReplay) || (!Dungeon.daily && !(Dungeon.customSeedText.length === 0))) {
      return 8;
    } else {
      return 0;
    }
  }
  static get$HeroClass(cl: HeroClass): Image {
    {
      let result: Image, frame: RectF;
      switch (cl) {
        case HeroClass.WARRIOR:
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SEAL);
        case HeroClass.MAGE:
          result = new ItemSprite()._ItemSprite$int(ItemSpriteSheet.MAGES_STAFF);
          frame = result.frame$();
          frame.top_ = Math.fround(frame.top_ + Math.fround(frame.height() / 8));
          result.frame$RectF(frame);
          return result;
        case HeroClass.ROGUE:
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ARTIFACT_CLOAK);
        case HeroClass.HUNTRESS:
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SPIRIT_BOW);
        case HeroClass.DUELIST:
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.RAPIER);
        case HeroClass.CLERIC:
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ARTIFACT_TOME);
        default:
          return null;
      }
    }
  }
  static get$Feeling(feeling: Level$Feeling): Image {
    switch (feeling) {
      case Level$Feeling.NONE:
      default:
        return Icons.get$Icons(Icons.DEPTH);
      case Level$Feeling.CHASM:
        return Icons.get$Icons(Icons.DEPTH_CHASM);
      case Level$Feeling.WATER:
        return Icons.get$Icons(Icons.DEPTH_WATER);
      case Level$Feeling.GRASS:
        return Icons.get$Icons(Icons.DEPTH_GRASS);
      case Level$Feeling.DARK:
        return Icons.get$Icons(Icons.DEPTH_DARK);
      case Level$Feeling.LARGE:
        return Icons.get$Icons(Icons.DEPTH_LARGE);
      case Level$Feeling.TRAPS:
        return Icons.get$Icons(Icons.DEPTH_TRAPS);
      case Level$Feeling.SECRETS:
        return Icons.get$Icons(Icons.DEPTH_SECRETS);
    }
  }
  static getLarge(feeling: Level$Feeling): Image {
    switch (feeling) {
      case Level$Feeling.NONE:
      default:
        return Icons.get$Icons(Icons.STAIRS);
      case Level$Feeling.CHASM:
        return Icons.get$Icons(Icons.STAIRS_CHASM);
      case Level$Feeling.WATER:
        return Icons.get$Icons(Icons.STAIRS_WATER);
      case Level$Feeling.GRASS:
        return Icons.get$Icons(Icons.STAIRS_GRASS);
      case Level$Feeling.DARK:
        return Icons.get$Icons(Icons.STAIRS_DARK);
      case Level$Feeling.LARGE:
        return Icons.get$Icons(Icons.STAIRS_LARGE);
      case Level$Feeling.TRAPS:
        return Icons.get$Icons(Icons.STAIRS_TRAPS);
      case Level$Feeling.SECRETS:
        return Icons.get$Icons(Icons.STAIRS_SECRETS);
    }
  }
  static values(): Icons[] { return Icons.$VALUES.slice(); }
  static valueOf(name: string): Icons { return $J.enumValueOf(Icons, name); }
  static $clinit() {
    Icons.ENTER = new Icons()._Icons('ENTER', 0);
    Icons.GOLD = new Icons()._Icons('GOLD', 1);
    Icons.RANKINGS = new Icons()._Icons('RANKINGS', 2);
    Icons.BADGES = new Icons()._Icons('BADGES', 3);
    Icons.NEWS = new Icons()._Icons('NEWS', 4);
    Icons.CHANGES = new Icons()._Icons('CHANGES', 5);
    Icons.PREFS = new Icons()._Icons('PREFS', 6);
    Icons.SHPX = new Icons()._Icons('SHPX', 7);
    Icons.JOURNAL = new Icons()._Icons('JOURNAL', 8);
    Icons.EXIT = new Icons()._Icons('EXIT', 9);
    Icons.DISPLAY = new Icons()._Icons('DISPLAY', 10);
    Icons.DISPLAY_LAND = new Icons()._Icons('DISPLAY_LAND', 11);
    Icons.DISPLAY_PORT = new Icons()._Icons('DISPLAY_PORT', 12);
    Icons.DATA = new Icons()._Icons('DATA', 13);
    Icons.AUDIO = new Icons()._Icons('AUDIO', 14);
    Icons.LANGS = new Icons()._Icons('LANGS', 15);
    Icons.CONTROLLER = new Icons()._Icons('CONTROLLER', 16);
    Icons.KEYBOARD = new Icons()._Icons('KEYBOARD', 17);
    Icons.STATS = new Icons()._Icons('STATS', 18);
    Icons.CHALLENGE_GREY = new Icons()._Icons('CHALLENGE_GREY', 19);
    Icons.SCROLL_GREY = new Icons()._Icons('SCROLL_GREY', 20);
    Icons.SEED = new Icons()._Icons('SEED', 21);
    Icons.LEFTARROW = new Icons()._Icons('LEFTARROW', 22);
    Icons.RIGHTARROW = new Icons()._Icons('RIGHTARROW', 23);
    Icons.CALENDAR = new Icons()._Icons('CALENDAR', 24);
    Icons.CHEVRON = new Icons()._Icons('CHEVRON', 25);
    Icons.SHUFFLE = new Icons()._Icons('SHUFFLE', 26);
    Icons.TARGET = new Icons()._Icons('TARGET', 27);
    Icons.INFO = new Icons()._Icons('INFO', 28);
    Icons.WARNING = new Icons()._Icons('WARNING', 29);
    Icons.UNCHECKED = new Icons()._Icons('UNCHECKED', 30);
    Icons.CHECKED = new Icons()._Icons('CHECKED', 31);
    Icons.CLOSE = new Icons()._Icons('CLOSE', 32);
    Icons.PLUS = new Icons()._Icons('PLUS', 33);
    Icons.REPEAT = new Icons()._Icons('REPEAT', 34);
    Icons.ARROW = new Icons()._Icons('ARROW', 35);
    Icons.CHALLENGE_COLOR = new Icons()._Icons('CHALLENGE_COLOR', 36);
    Icons.SCROLL_COLOR = new Icons()._Icons('SCROLL_COLOR', 37);
    Icons.COPY = new Icons()._Icons('COPY', 38);
    Icons.PASTE = new Icons()._Icons('PASTE', 39);
    Icons.BACKPACK_LRG = new Icons()._Icons('BACKPACK_LRG', 40);
    Icons.TALENT = new Icons()._Icons('TALENT', 41);
    Icons.MAGNIFY = new Icons()._Icons('MAGNIFY', 42);
    Icons.SNAKE = new Icons()._Icons('SNAKE', 43);
    Icons.BUFFS = new Icons()._Icons('BUFFS', 44);
    Icons.CATALOG = new Icons()._Icons('CATALOG', 45);
    Icons.ALCHEMY = new Icons()._Icons('ALCHEMY', 46);
    Icons.GRASS = new Icons()._Icons('GRASS', 47);
    Icons.STAIRS = new Icons()._Icons('STAIRS', 48);
    Icons.STAIRS_CHASM = new Icons()._Icons('STAIRS_CHASM', 49);
    Icons.STAIRS_WATER = new Icons()._Icons('STAIRS_WATER', 50);
    Icons.STAIRS_GRASS = new Icons()._Icons('STAIRS_GRASS', 51);
    Icons.STAIRS_DARK = new Icons()._Icons('STAIRS_DARK', 52);
    Icons.STAIRS_LARGE = new Icons()._Icons('STAIRS_LARGE', 53);
    Icons.STAIRS_TRAPS = new Icons()._Icons('STAIRS_TRAPS', 54);
    Icons.STAIRS_SECRETS = new Icons()._Icons('STAIRS_SECRETS', 55);
    Icons.WELL_HEALTH = new Icons()._Icons('WELL_HEALTH', 56);
    Icons.WELL_AWARENESS = new Icons()._Icons('WELL_AWARENESS', 57);
    Icons.SACRIFICE_ALTAR = new Icons()._Icons('SACRIFICE_ALTAR', 58);
    Icons.DISTANT_WELL = new Icons()._Icons('DISTANT_WELL', 59);
    Icons.SKULL = new Icons()._Icons('SKULL', 60);
    Icons.BUSY = new Icons()._Icons('BUSY', 61);
    Icons.COMPASS = new Icons()._Icons('COMPASS', 62);
    Icons.SLEEP = new Icons()._Icons('SLEEP', 63);
    Icons.ALERT = new Icons()._Icons('ALERT', 64);
    Icons.LOST = new Icons()._Icons('LOST', 65);
    Icons.INVESTIGATE = new Icons()._Icons('INVESTIGATE', 66);
    Icons.DEPTH = new Icons()._Icons('DEPTH', 67);
    Icons.DEPTH_CHASM = new Icons()._Icons('DEPTH_CHASM', 68);
    Icons.DEPTH_WATER = new Icons()._Icons('DEPTH_WATER', 69);
    Icons.DEPTH_GRASS = new Icons()._Icons('DEPTH_GRASS', 70);
    Icons.DEPTH_DARK = new Icons()._Icons('DEPTH_DARK', 71);
    Icons.DEPTH_LARGE = new Icons()._Icons('DEPTH_LARGE', 72);
    Icons.DEPTH_TRAPS = new Icons()._Icons('DEPTH_TRAPS', 73);
    Icons.DEPTH_SECRETS = new Icons()._Icons('DEPTH_SECRETS', 74);
    Icons.CHAL_COUNT = new Icons()._Icons('CHAL_COUNT', 75);
    Icons.COIN_SML = new Icons()._Icons('COIN_SML', 76);
    Icons.ENERGY_SML = new Icons()._Icons('ENERGY_SML', 77);
    Icons.BACKPACK = new Icons()._Icons('BACKPACK', 78);
    Icons.SEED_POUCH = new Icons()._Icons('SEED_POUCH', 79);
    Icons.SCROLL_HOLDER = new Icons()._Icons('SCROLL_HOLDER', 80);
    Icons.WAND_HOLSTER = new Icons()._Icons('WAND_HOLSTER', 81);
    Icons.POTION_BANDOLIER = new Icons()._Icons('POTION_BANDOLIER', 82);
    Icons.LIBGDX = new Icons()._Icons('LIBGDX', 83);
    Icons.ALEKS = new Icons()._Icons('ALEKS', 84);
    Icons.WATA = new Icons()._Icons('WATA', 85);
    Icons.PUMPKINVOLT = new Icons()._Icons('PUMPKINVOLT', 86);
    Icons.CELESTI = new Icons()._Icons('CELESTI', 87);
    Icons.LUMINE = new Icons()._Icons('LUMINE', 88);
    Icons.CUBE_CODE = new Icons()._Icons('CUBE_CODE', 89);
    Icons.PURIGRO = new Icons()._Icons('PURIGRO', 90);
    Icons.ARCNOR = new Icons()._Icons('ARCNOR', 91);
    Icons.ALASTAIR = new Icons()._Icons('ALASTAIR', 92);
    Icons.$VALUES = [Icons.ENTER, Icons.GOLD, Icons.RANKINGS, Icons.BADGES, Icons.NEWS, Icons.CHANGES, Icons.PREFS, Icons.SHPX, Icons.JOURNAL, Icons.EXIT, Icons.DISPLAY, Icons.DISPLAY_LAND, Icons.DISPLAY_PORT, Icons.DATA, Icons.AUDIO, Icons.LANGS, Icons.CONTROLLER, Icons.KEYBOARD, Icons.STATS, Icons.CHALLENGE_GREY, Icons.SCROLL_GREY, Icons.SEED, Icons.LEFTARROW, Icons.RIGHTARROW, Icons.CALENDAR, Icons.CHEVRON, Icons.SHUFFLE, Icons.TARGET, Icons.INFO, Icons.WARNING, Icons.UNCHECKED, Icons.CHECKED, Icons.CLOSE, Icons.PLUS, Icons.REPEAT, Icons.ARROW, Icons.CHALLENGE_COLOR, Icons.SCROLL_COLOR, Icons.COPY, Icons.PASTE, Icons.BACKPACK_LRG, Icons.TALENT, Icons.MAGNIFY, Icons.SNAKE, Icons.BUFFS, Icons.CATALOG, Icons.ALCHEMY, Icons.GRASS, Icons.STAIRS, Icons.STAIRS_CHASM, Icons.STAIRS_WATER, Icons.STAIRS_GRASS, Icons.STAIRS_DARK, Icons.STAIRS_LARGE, Icons.STAIRS_TRAPS, Icons.STAIRS_SECRETS, Icons.WELL_HEALTH, Icons.WELL_AWARENESS, Icons.SACRIFICE_ALTAR, Icons.DISTANT_WELL, Icons.SKULL, Icons.BUSY, Icons.COMPASS, Icons.SLEEP, Icons.ALERT, Icons.LOST, Icons.INVESTIGATE, Icons.DEPTH, Icons.DEPTH_CHASM, Icons.DEPTH_WATER, Icons.DEPTH_GRASS, Icons.DEPTH_DARK, Icons.DEPTH_LARGE, Icons.DEPTH_TRAPS, Icons.DEPTH_SECRETS, Icons.CHAL_COUNT, Icons.COIN_SML, Icons.ENERGY_SML, Icons.BACKPACK, Icons.SEED_POUCH, Icons.SCROLL_HOLDER, Icons.WAND_HOLSTER, Icons.POTION_BANDOLIER, Icons.LIBGDX, Icons.ALEKS, Icons.WATA, Icons.PUMPKINVOLT, Icons.CELESTI, Icons.LUMINE, Icons.CUBE_CODE, Icons.PURIGRO, Icons.ARCNOR, Icons.ALASTAIR];
  }
}

$J.define(Icons, 'com.shatteredpixel.shatteredpixeldungeon.ui.Icons', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Icons' }, meths: { 'get(com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling)': 'get$Feeling', 'get(com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass)': 'get$HeroClass', 'get(com.shatteredpixel.shatteredpixeldungeon.ui.Icons)': 'get$Icons' }, clinit: true, lazy: ['$VALUES', 'ENTER', 'GOLD', 'RANKINGS', 'BADGES', 'NEWS', 'CHANGES', 'PREFS', 'SHPX', 'JOURNAL', 'EXIT', 'DISPLAY', 'DISPLAY_LAND', 'DISPLAY_PORT', 'DATA', 'AUDIO', 'LANGS', 'CONTROLLER', 'KEYBOARD', 'STATS', 'CHALLENGE_GREY', 'SCROLL_GREY', 'SEED', 'LEFTARROW', 'RIGHTARROW', 'CALENDAR', 'CHEVRON', 'SHUFFLE', 'TARGET', 'INFO', 'WARNING', 'UNCHECKED', 'CHECKED', 'CLOSE', 'PLUS', 'REPEAT', 'ARROW', 'CHALLENGE_COLOR', 'SCROLL_COLOR', 'COPY', 'PASTE', 'BACKPACK_LRG', 'TALENT', 'MAGNIFY', 'SNAKE', 'BUFFS', 'CATALOG', 'ALCHEMY', 'GRASS', 'STAIRS', 'STAIRS_CHASM', 'STAIRS_WATER', 'STAIRS_GRASS', 'STAIRS_DARK', 'STAIRS_LARGE', 'STAIRS_TRAPS', 'STAIRS_SECRETS', 'WELL_HEALTH', 'WELL_AWARENESS', 'SACRIFICE_ALTAR', 'DISTANT_WELL', 'SKULL', 'BUSY', 'COMPASS', 'SLEEP', 'ALERT', 'LOST', 'INVESTIGATE', 'DEPTH', 'DEPTH_CHASM', 'DEPTH_WATER', 'DEPTH_GRASS', 'DEPTH_DARK', 'DEPTH_LARGE', 'DEPTH_TRAPS', 'DEPTH_SECRETS', 'CHAL_COUNT', 'COIN_SML', 'ENERGY_SML', 'BACKPACK', 'SEED_POUCH', 'SCROLL_HOLDER', 'WAND_HOLSTER', 'POTION_BANDOLIER', 'LIBGDX', 'ALEKS', 'WATA', 'PUMPKINVOLT', 'CELESTI', 'LUMINE', 'CUBE_CODE', 'PURIGRO', 'ARCNOR', 'ALASTAIR'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Image = $J.load('com.watabou.noosa.Image');
});
