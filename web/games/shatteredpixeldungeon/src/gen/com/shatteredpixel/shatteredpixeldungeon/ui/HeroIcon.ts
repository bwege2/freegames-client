// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/HeroIcon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Image } from '../../../watabou/noosa/Image.ts';

let Assets$Interfaces, TextureFilm;

export class HeroIcon extends Image {
  static film: TextureFilm = null;
  static readonly SIZE: number = 16;
  static readonly NONE: number = 127;
  static readonly BERSERKER: number = 0;
  static readonly GLADIATOR: number = 1;
  static readonly BATTLEMAGE: number = 2;
  static readonly WARLOCK: number = 3;
  static readonly ASSASSIN: number = 4;
  static readonly FREERUNNER: number = 5;
  static readonly SNIPER: number = 6;
  static readonly WARDEN: number = 7;
  static readonly CHAMPION: number = 8;
  static readonly MONK: number = 9;
  static readonly PRIEST: number = 10;
  static readonly PALADIN: number = 11;
  static readonly HEROIC_LEAP: number = 16;
  static readonly SHOCKWAVE: number = 17;
  static readonly ENDURE: number = 18;
  static readonly ELEMENTAL_BLAST: number = 19;
  static readonly WILD_MAGIC: number = 20;
  static readonly WARP_BEACON: number = 21;
  static readonly SMOKE_BOMB: number = 22;
  static readonly DEATH_MARK: number = 23;
  static readonly SHADOW_CLONE: number = 24;
  static readonly SPECTRAL_BLADES: number = 25;
  static readonly NATURES_POWER: number = 26;
  static readonly SPIRIT_HAWK: number = 27;
  static readonly CHALLENGE: number = 28;
  static readonly ELEMENTAL_STRIKE: number = 29;
  static readonly FEINT: number = 30;
  static readonly ASCENDED_FORM: number = 31;
  static readonly TRINITY: number = 32;
  static readonly POWER_OF_MANY: number = 33;
  static readonly RATMOGRIFY: number = 34;
  static readonly GUIDING_LIGHT: number = 40;
  static readonly HOLY_WEAPON: number = 41;
  static readonly HOLY_WARD: number = 42;
  static readonly HOLY_INTUITION: number = 43;
  static readonly SHIELD_OF_LIGHT: number = 44;
  static readonly RECALL_GLYPH: number = 45;
  static readonly SUNRAY: number = 46;
  static readonly DIVINE_SENSE: number = 47;
  static readonly BLESS: number = 48;
  static readonly CLEANSE: number = 49;
  static readonly RADIANCE: number = 50;
  static readonly HOLY_LANCE: number = 51;
  static readonly HALLOWED_GROUND: number = 52;
  static readonly MNEMONIC_PRAYER: number = 53;
  static readonly SMITE: number = 54;
  static readonly LAY_ON_HANDS: number = 55;
  static readonly AURA_OF_PROTECTION: number = 56;
  static readonly WALL_OF_LIGHT: number = 57;
  static readonly DIVINE_INTERVENTION: number = 58;
  static readonly JUDGEMENT: number = 59;
  static readonly FLASH: number = 60;
  static readonly BODY_FORM: number = 61;
  static readonly MIND_FORM: number = 62;
  static readonly SPIRIT_FORM: number = 63;
  static readonly BEAMING_RAY: number = 64;
  static readonly LIFE_LINK: number = 65;
  static readonly STASIS: number = 66;
  static readonly SPELL_ACTION_OFFSET: number = 32;
  static readonly BERSERK: number = 104;
  static readonly COMBO: number = 105;
  static readonly PREPARATION: number = 106;
  static readonly MOMENTUM: number = 107;
  static readonly SNIPERS_MARK: number = 108;
  static readonly WEAPON_SWAP: number = 109;
  static readonly MONK_ABILITIES: number = 110;
  _HeroIcon$HeroSubClass(subCls: HeroSubClass): this {
    this._Image$Object(Assets$Interfaces.HERO_ICONS);
    if (HeroIcon.film == null) {
      HeroIcon.film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, HeroIcon.SIZE, HeroIcon.SIZE);
    }
    this.frame$RectF(HeroIcon.film.get$Object(subCls.icon()));
    return this;
  }
  _HeroIcon$ArmorAbility(abil: ArmorAbility): this {
    this._Image$Object(Assets$Interfaces.HERO_ICONS);
    if (HeroIcon.film == null) {
      HeroIcon.film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, HeroIcon.SIZE, HeroIcon.SIZE);
    }
    this.frame$RectF(HeroIcon.film.get$Object(abil.icon()));
    return this;
  }
  _HeroIcon$Action(action: ActionIndicator$Action): this {
    this._Image$Object(Assets$Interfaces.HERO_ICONS);
    if (HeroIcon.film == null) {
      HeroIcon.film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, HeroIcon.SIZE, HeroIcon.SIZE);
    }
    this.frame$RectF(HeroIcon.film.get$Object(action.actionIcon()));
    return this;
  }
  _HeroIcon$ClericSpell(spell: ClericSpell): this {
    this._Image$Object(Assets$Interfaces.HERO_ICONS);
    if (HeroIcon.film == null) {
      HeroIcon.film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, HeroIcon.SIZE, HeroIcon.SIZE);
    }
    this.frame$RectF(HeroIcon.film.get$Object(spell.icon()));
    return this;
  }
}

$J.define(HeroIcon, 'com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell': '_HeroIcon$ClericSpell', 'com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action': '_HeroIcon$Action', 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility': '_HeroIcon$ArmorAbility', 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass': '_HeroIcon$HeroSubClass' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
