// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalMimic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Mimic } from './Mimic.ts';
import { Mob$Fleeing } from './Mob.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Haste, CellEmitter, Speck, Heap, Honeypot, Honeypot$ShatteredPot, Item, Artifact, Ring, ScrollOfTeleportation, MimicTooth, Wand, Messages, MimicSprite$Crystal, GLog, Sample, PathFinder, Random;

export class CrystalMimic extends Mimic {
  _CrystalMimic(): this {
    this._Mimic();
    this.spriteClass = $J.cls(MimicSprite$Crystal);
    this.FLEEING = new CrystalMimic$Fleeing().$o(this)._CrystalMimic$Fleeing();
    return this;
  }
  name(): string {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'crystal_chest', []);
    } else {
      return super.name();
    }
  }
  description(): string {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      let desc = null;
      for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        if (i instanceof Artifact) {
          desc = Messages.get$Class$String$ObjectArr($J.cls(Heap), 'crystal_chest_desc', [Messages.get$Class$String$ObjectArr($J.cls(Heap), 'artifact', [])]);
          break;
        } else if (i instanceof Ring) {
          desc = Messages.get$Class$String$ObjectArr($J.cls(Heap), 'crystal_chest_desc', [Messages.get$Class$String$ObjectArr($J.cls(Heap), 'ring', [])]);
          break;
        } else if (i instanceof Wand) {
          desc = Messages.get$Class$String$ObjectArr($J.cls(Heap), 'crystal_chest_desc', [Messages.get$Class$String$ObjectArr($J.cls(Heap), 'wand', [])]);
          break;
        }
      }
      if (desc == null) {
        desc = Messages.get$Class$String$ObjectArr($J.cls(Heap), 'locked_chest_desc', []);
      }
      if (!MimicTooth.stealthyMimics()) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'hidden_hint', []);
      }
      return desc;
    } else {
      return super.description();
    }
  }
  damageRoll(): number {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      this.alignment = Char$Alignment.ENEMY;
      let dmg = super.damageRoll();
      this.alignment = Char$Alignment.NEUTRAL;
      return dmg;
    } else {
      return super.damageRoll();
    }
  }
  stopHiding(): void {
    this.state_ = this.FLEEING;
    if (this.sprite_ != null) {
      this.sprite_.idle();
    }
    if (this.alignment === Char$Alignment.NEUTRAL) {
      Buff.affect$Char$Class$float(this, $J.cls(Haste), 2);
    } else {
      Buff.affect$Char$Class$float(this, $J.cls(Haste), 1);
    }
    if (Actor.chars().contains(this) && Dungeon.level.heroFOV[this.pos]) {
      this.enemy = Dungeon.hero;
      this.target = Dungeon.hero.pos;
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'reveal', []), []);
      CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.STAR), 10);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.MIMIC, 1, 1.25);
    }
  }
  attackProc(enemy: Char, damage: number): number {
    if (this.alignment === Char$Alignment.NEUTRAL && enemy === Dungeon.hero) {
      this.steal(Dungeon.hero);
    } else {
      let candidates = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        if (Dungeon.level.passable[(this.pos + i) | 0] && (Actor.findChar((this.pos + i) | 0)) == null) {
          candidates.add((this.pos + i) | 0);
        }
      }
      if (!candidates.isEmpty()) {
        ScrollOfTeleportation.appear(enemy, Random.element$Collection(candidates));
      }
      if (this.alignment === Char$Alignment.ENEMY) {
        this.state_ = this.FLEEING;
      }
    }
    return super.attackProc(enemy, damage);
  }
  steal(hero: Hero): void {
    let tries = 10;
    let item: Item;
    do {
      item = hero.belongings.randomUnequipped();
    } while (tries-- > 0 && (item == null || item.unique || item.level$() > 0));
    if (item != null && !item.unique && item.level$() < 1) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ate', [item.name()]), []);
      if (!item.stackable) {
        Dungeon.quickslot.convertToPlaceholder(item);
      }
      Item.updateQuickslot();
      if (item instanceof Honeypot) {
        this.items_.add((item).shatter(this, this.pos));
        item.detach(hero.belongings.backpack);
      } else {
        this.items_.add(item.detach(hero.belongings.backpack));
        if (item instanceof Honeypot$ShatteredPot) {
          (item).pickupPot(this);
        }
      }
    }
  }
  generatePrize(useDecks: boolean): void {
    for (const $it1 = this.items_.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      i.cursed = false;
      i.cursedKnown = true;
    }
  }
}

export class CrystalMimic$Fleeing extends Mob$Fleeing {
  _CrystalMimic$Fleeing(): this {
    this._Mob$Fleeing();
    return this;
  }
  escaped(): void {
    if (!Dungeon.level.heroFOV[this.$outer.pos] && Dungeon.level.distance(Dungeon.hero.pos, this.$outer.pos) >= 6) {
      GLog.n(Messages.get$Class$String$ObjectArr($J.cls(CrystalMimic), 'escaped', []), []);
      this.$outer.destroy();
      this.$outer.sprite_.killAndErase();
    } else {
      this.$outer.state_ = this.$outer.WANDERING;
    }
  }
  nowhereToRun(): void {
    super.nowhereToRun();
    if (this.$outer.state_ === this.$outer.HUNTING) {
      this.$outer.spend(Math.fround(-Actor.TICK));
    }
  }
}

$J.define(CrystalMimic, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalMimic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic', ctors: { '': '_CrystalMimic' } });
$J.define(CrystalMimic$Fleeing, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalMimic$Fleeing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Fleeing', ctors: { '': '_CrystalMimic$Fleeing' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Haste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Haste');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  Honeypot$ShatteredPot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  MimicSprite$Crystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite$Crystal');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
