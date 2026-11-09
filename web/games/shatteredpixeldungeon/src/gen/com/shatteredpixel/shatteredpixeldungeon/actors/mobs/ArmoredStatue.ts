// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/ArmoredStatue.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Statue } from './Statue.ts';

let Dungeon, Generator, Armor$Glyph, Corrupting$CorruptingTracker, Messages, StatueSprite, Random;

export class ArmoredStatue extends Statue {
  armor_: Armor = null;
  static readonly ARMOR: string = 'armor';
  _ArmoredStatue(): this {
    this._Statue();
    this.spriteClass = $J.cls(StatueSprite);
    this.HP = this.HT = (30 + Math.imul(Dungeon.depth, 10)) | 0;
    return this;
  }
  createWeapon(useDecks: boolean): void {
    super.createWeapon(useDecks);
    this.armor_ = Generator.randomArmor$();
    this.armor_.cursed = false;
    this.armor_.inscribe$Glyph(Armor$Glyph.random([]));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(ArmoredStatue.ARMOR, this.armor_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.armor_ = bundle.get$String(ArmoredStatue.ARMOR);
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(this.armor_.DRMin$(), this.armor_.DRMax$())) | 0;
  }
  armor(): Armor {
    return this.armor_;
  }
  defenseProc(enemy: Char, damage: number): number {
    damage = this.armor_.proc(enemy, this, damage);
    return super.defenseProc(enemy, damage);
  }
  glyphLevel(cls: JClass<Armor$Glyph>): number {
    if (this.armor_ != null && this.armor_.hasGlyph(cls, this)) {
      return Math.max(super.glyphLevel(cls), this.armor_.buffedLvl());
    } else {
      return super.glyphLevel(cls);
    }
  }
  sprite(): CharSprite {
    let sprite = super.sprite();
    if (this.armor_ != null) {
      (sprite).setArmor(this.armor_.tier_);
    } else {
      (sprite).setArmor(3);
    }
    return sprite;
  }
  defenseSkill(enemy: Char): number {
    return $J.roundf(this.armor_.evasionFactor(this, Math.fround(super.defenseSkill(enemy))));
  }
  die(cause: any): void {
    if (this.buff($J.cls(Corrupting$CorruptingTracker)) == null) {
      this.armor_.identify$boolean(false);
      Dungeon.level.drop(this.armor_, this.pos).sprite_.drop$();
    }
    super.die(cause);
  }
  description(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (this.weapon_ != null && this.armor_ != null) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_arm_wep', [this.weapon_.name(), this.armor_.name()]);
    }
    return desc;
  }
}

$J.define(ArmoredStatue, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredStatue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue', ctors: { '': '_ArmoredStatue' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  Corrupting$CorruptingTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting$CorruptingTracker');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  StatueSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.StatueSprite');
  Random = $J.load('com.watabou.utils.Random');
});
