// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GoldenMimic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mimic } from './Mimic.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, CellEmitter, Speck, EquipableItem, Heap, Armor, Artifact, MimicTooth, Wand, Weapon, Messages, MimicSprite$Golden, GLog, Sample, Random;

export class GoldenMimic extends Mimic {
  _GoldenMimic(): this {
    this._Mimic();
    this.spriteClass = $J.cls(MimicSprite$Golden);
    return this;
  }
  name(): string {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'locked_chest', []);
    } else {
      return super.name();
    }
  }
  description(): string {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      if (MimicTooth.stealthyMimics()) {
        return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'locked_chest_desc', []);
      } else {
        return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'locked_chest_desc', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'hidden_hint', []);
      }
    } else {
      return super.description();
    }
  }
  stopHiding(): void {
    this.state_ = this.HUNTING;
    if (this.sprite_ != null) {
      this.sprite_.idle();
    }
    if (Actor.chars().contains(this) && Dungeon.level.heroFOV[this.pos]) {
      this.enemy = Dungeon.hero;
      this.target = Dungeon.hero.pos;
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'reveal', []), []);
      CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.STAR), 10);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.MIMIC, 1, Math.fround(0.85));
    }
  }
  setLevel(level: number): void {
    super.setLevel($J.roundf(Math.fround(level * Math.fround(1.33))));
  }
  generatePrize(useDecks: boolean): void {
    super.generatePrize(useDecks);
    for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof EquipableItem || i instanceof Wand) {
        i.cursed = false;
        i.cursedKnown = true;
        if (i instanceof Weapon && (i).hasCurseEnchant()) {
          (i).enchant$Enchantment(null);
        }
        if (i instanceof Armor && (i).hasCurseGlyph()) {
          (i).inscribe$Glyph(null);
        }
        if (!(i instanceof Artifact) && i.level$() === 0 && Random.Int$int(2) === 0) {
          i.upgrade$();
        }
      }
    }
  }
}

$J.define(GoldenMimic, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GoldenMimic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic', ctors: { '': '_GoldenMimic' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  MimicSprite$Golden = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite$Golden');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
