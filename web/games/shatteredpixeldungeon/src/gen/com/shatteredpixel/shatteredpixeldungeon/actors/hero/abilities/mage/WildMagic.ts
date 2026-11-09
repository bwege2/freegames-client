// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/mage/WildMagic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';

let Dungeon, Actor, Buff, Invisibility, Talent, Item, WondrousResin, CursedWand, Wand, Ballistica, Messages, HeroIcon, GLog, Game, Delayer, Random;

export class WildMagic extends ArmorAbility {
  wildMagicActor: Actor = null;
  _WildMagic(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 25;
    this.wildMagicActor = null;
    return this;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (target === hero.pos) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'self_target', []), []);
      return;
    }
    let wands = hero.belongings.getAllItems($J.cls(Wand));
    Random.shuffle$List(wands);
    let chargeUsePerShot = Math.fround(0.5 * Math.fround($J.pow(Math.fround(0.67), hero.pointsInTalent(Talent.CONSERVED_MAGIC))));
    for (let w of $J.toArrayInto(wands.toArray(), $J.newArray(0, null))) {
      if (w.curCharges < 1 && w.partialCharge < chargeUsePerShot) {
        wands.remove(w);
      }
    }
    let maxWands = (4 + Dungeon.hero.pointsInTalent(Talent.FIRE_EVERYTHING)) | 0;
    if (wands.size() < maxWands) {
      let seconds = new ArrayList(wands);
      let thirds = new ArrayList(wands);
      for (const $it0 = wands.iterator(); $it0.hasNext(); ) {
        let w = $it0.next();
        let totalCharge = Math.fround(w.curCharges + w.partialCharge);
        if (totalCharge < Math.fround(2 * chargeUsePerShot)) {
          seconds.remove(w);
        }
        if (totalCharge < Math.fround(3 * chargeUsePerShot) || Random.Int$int(4) >= Dungeon.hero.pointsInTalent(Talent.FIRE_EVERYTHING)) {
          thirds.remove(w);
        }
      }
      Random.shuffle$List(seconds);
      while (!seconds.isEmpty() && wands.size() < maxWands) {
        wands.add(seconds.removeAt(0));
      }
      Random.shuffle$List(thirds);
      while (!thirds.isEmpty() && wands.size() < maxWands) {
        wands.add(thirds.removeAt(0));
      }
    } else {
      while (wands.size() > maxWands) {
        wands.removeAt(0);
      }
    }
    if (wands.size() === 0) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_wands', []), []);
      return;
    }
    hero.busy();
    Random.shuffle$List(wands);
    Buff.affect$Char$Class$float(hero, $J.cls(WildMagic$WildMagicTracker), 0);
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    this.zapWand(wands, hero, target);
  }
  zapWand(wands: ArrayList<Wand>, hero: Hero, cell: number): void {
    let cur = wands.removeAt(0);
    let aim = new Ballistica()._Ballistica(hero.pos, cell, cur.collisionProperties(cell));
    hero.sprite_.zap$int(cell);
    let startTime = Game.timeTotal;
    if (cur.tryToZap(hero, cell)) {
      if (!cur.cursed) {
        cur.fx(aim, new (WildMagic$1())().$o(this).$c(cur, aim, startTime, hero, cell, wands));
      } else {
        CursedWand.cursedZap(cur, hero, new Ballistica()._Ballistica(hero.pos, cell, Ballistica.MAGIC_BOLT), new (WildMagic$2())().$o(this).$c(startTime, hero, cur, wands, cell));
      }
    } else {
      this.afterZap(cur, wands, hero, cell);
    }
  }
  afterZap(cur: Wand, wands: ArrayList<Wand>, hero: Hero, target: number): void {
    cur.partialCharge = Math.fround(cur.partialCharge - Math.fround(0.5 * Math.fround($J.pow(Math.fround(0.67), hero.pointsInTalent(Talent.CONSERVED_MAGIC)))));
    if (cur.partialCharge < Math.fround(0)) {
      cur.partialCharge++;
      cur.curCharges--;
    }
    if (this.wildMagicActor != null) {
      this.wildMagicActor.next();
      this.wildMagicActor = null;
    }
    let ch = Actor.findChar(target);
    if (!wands.isEmpty() && hero.isAlive()) {
      Actor.add$Actor(new (WildMagic$3())().$o(this).$c(wands, hero, ch, target)._Actor().$init_anon());
      hero.next();
    } else {
      if (hero.buff($J.cls(WildMagic$WildMagicTracker)) != null) {
        hero.buff($J.cls(WildMagic$WildMagicTracker)).detach();
      }
      Item.updateQuickslot();
      Invisibility.dispel$();
      if (Random.Int$int(4) >= hero.pointsInTalent(Talent.CONSERVED_MAGIC)) {
        hero.spendAndNext(Actor.TICK);
      } else {
        hero.next();
      }
    }
  }
  icon(): number {
    return HeroIcon.WILD_MAGIC;
  }
  talents(): Talent[] {
    return [Talent.WILD_POWER, Talent.FIRE_EVERYTHING, Talent.CONSERVED_MAGIC, Talent.HEROIC_ENERGY];
  }
}

export class WildMagic$WildMagicTracker extends FlavourBuff {
  _WildMagic$WildMagicTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

let $WildMagic$1$1$1: any = null;
/** An anonymous class (WildMagic.java:161). */
function WildMagic$1$1$1(): any {
  return $WildMagic$1$1$1 ??= $J.local(class extends JObject {
    call(): void {
      WondrousResin.forcePositive = false;
      this.$outer.$outer.$outer.afterZap(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell);
    }
    $c($cur, $wands, $hero, $cell): this {
      this.$cv_cur = $cur; this.$cv_wands = $wands; this.$cv_hero = $hero; this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$1$1$1', ['com.watabou.utils.Callback']);
}

let $WildMagic$1$1: any = null;
/** An anonymous class (WildMagic.java:153). */
function WildMagic$1$1(): any {
  return $WildMagic$1$1 ??= $J.local(class extends Delayer {
    onComplete(): void {
      if (this.$cv_alsoCursedZap) {
        WondrousResin.forcePositive = true;
        CursedWand.cursedZap(this.$cv_cur, this.$cv_hero, new Ballistica()._Ballistica(this.$cv_hero.pos, this.$cv_cell, Ballistica.MAGIC_BOLT), new (WildMagic$1$1$1())().$o(this).$c(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell));
      } else {
        this.$outer.$outer.afterZap(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell);
      }
    }
    $c($alsoCursedZap, $cur, $hero, $cell, $wands): this {
      this.$cv_alsoCursedZap = $alsoCursedZap; this.$cv_cur = $cur; this.$cv_hero = $hero; this.$cv_cell = $cell; this.$cv_wands = $wands;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$1$1', []);
}

let $WildMagic$1$2: any = null;
/** An anonymous class (WildMagic.java:179). */
function WildMagic$1$2(): any {
  return $WildMagic$1$2 ??= $J.local(class extends JObject {
    call(): void {
      WondrousResin.forcePositive = false;
      this.$outer.$outer.afterZap(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell);
    }
    $c($cur, $wands, $hero, $cell): this {
      this.$cv_cur = $cur; this.$cv_wands = $wands; this.$cv_hero = $hero; this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$1$2', ['com.watabou.utils.Callback']);
}

let $WildMagic$1: any = null;
/** An anonymous class (WildMagic.java:147). */
function WildMagic$1(): any {
  return $WildMagic$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_cur.onZap(this.$cv_aim);
      let alsoCursedZap = Random.Float$() < WondrousResin.extraCurseEffectChance$();
      if (Math.fround(Game.timeTotal - this.$cv_startTime) < Math.fround(0.33)) {
        this.$cv_hero.sprite_.parent.add$Gizmo(new (WildMagic$1$1())().$o(this).$c(alsoCursedZap, this.$cv_cur, this.$cv_hero, this.$cv_cell, this.$cv_wands)._Delayer$float(Math.fround(Math.fround(0.33) - (Math.fround(Game.timeTotal - this.$cv_startTime)))));
      } else {
        if (alsoCursedZap) {
          WondrousResin.forcePositive = true;
          CursedWand.cursedZap(this.$cv_cur, this.$cv_hero, new Ballistica()._Ballistica(this.$cv_hero.pos, this.$cv_cell, Ballistica.MAGIC_BOLT), new (WildMagic$1$2())().$o(this).$c(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell));
        } else {
          this.$outer.afterZap(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell);
        }
      }
    }
    $c($cur, $aim, $startTime, $hero, $cell, $wands): this {
      this.$cv_cur = $cur; this.$cv_aim = $aim; this.$cv_startTime = $startTime; this.$cv_hero = $hero; this.$cv_cell = $cell; this.$cv_wands = $wands;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$1', ['com.watabou.utils.Callback']);
}

let $WildMagic$2$1: any = null;
/** An anonymous class (WildMagic.java:201). */
function WildMagic$2$1(): any {
  return $WildMagic$2$1 ??= $J.local(class extends Delayer {
    onComplete(): void {
      this.$outer.$outer.afterZap(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell);
    }
    $c($cur, $wands, $hero, $cell): this {
      this.$cv_cur = $cur; this.$cv_wands = $wands; this.$cv_hero = $hero; this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$2$1', []);
}

let $WildMagic$2: any = null;
/** An anonymous class (WildMagic.java:197). */
function WildMagic$2(): any {
  return $WildMagic$2 ??= $J.local(class extends JObject {
    call(): void {
      if (Math.fround(Game.timeTotal - this.$cv_startTime) < Math.fround(0.33)) {
        this.$cv_hero.sprite_.parent.add$Gizmo(new (WildMagic$2$1())().$o(this).$c(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell)._Delayer$float(Math.fround(Math.fround(0.33) - (Math.fround(Game.timeTotal - this.$cv_startTime)))));
      } else {
        this.$outer.afterZap(this.$cv_cur, this.$cv_wands, this.$cv_hero, this.$cv_cell);
      }
    }
    $c($startTime, $hero, $cur, $wands, $cell): this {
      this.$cv_startTime = $startTime; this.$cv_hero = $hero; this.$cv_cur = $cur; this.$cv_wands = $wands; this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$2', ['com.watabou.utils.Callback']);
}

let $WildMagic$3: any = null;
/** An anonymous class (WildMagic.java:231). */
function WildMagic$3(): any {
  return $WildMagic$3 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = (Actor.VFX_PRIO - 1) | 0;
      return this;
    }
    act(): boolean {
      this.$outer.wildMagicActor = this;
      this.$outer.zapWand(this.$cv_wands, this.$cv_hero, this.$cv_ch == null ? this.$cv_target : this.$cv_ch.pos);
      Actor.remove(this);
      return false;
    }
    $c($wands, $hero, $ch, $target): this {
      this.$cv_wands = $wands; this.$cv_hero = $hero; this.$cv_ch = $ch; this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$3', []);
}

$J.define(WildMagic, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_WildMagic' } });
$J.define(WildMagic$WildMagicTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$WildMagicTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_WildMagic$WildMagicTracker' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  WondrousResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Delayer = $J.load('com.watabou.noosa.tweeners.Delayer');
  Random = $J.load('com.watabou.utils.Random');
});
