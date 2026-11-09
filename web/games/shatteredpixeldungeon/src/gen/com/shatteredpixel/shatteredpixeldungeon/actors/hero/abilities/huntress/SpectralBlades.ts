// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/huntress/SpectralBlades.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashSet, JObject } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';

let Dungeon, Actor, Char$Alignment, Buff, Invisibility, Talent, Talent$SpiritBladesTracker, Item, Shuriken, Ballistica, ConeAOE, Messages, MissileSprite, HeroIcon, GLog;

export class SpectralBlades extends ArmorAbility {
  _SpectralBlades(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 25;
    return this;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (Actor.findChar(target) === hero) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'self_target', []), []);
      return;
    }
    let b = new Ballistica()._Ballistica(hero.pos, target, Ballistica.WONT_STOP);
    let targets = new HashSet();
    let enemy = this.findChar(b, hero, Math.imul(2, hero.pointsInTalent(Talent.PROJECTING_BLADES)), targets);
    if (enemy == null || !hero.fieldOfView[enemy.pos]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    }
    targets.add(enemy);
    if (hero.hasTalent(Talent.FAN_OF_BLADES)) {
      let cone = new ConeAOE()._ConeAOE$Ballistica$float(b, Math.fround(Math.imul(30, hero.pointsInTalent(Talent.FAN_OF_BLADES))));
      for (const $it0 = cone.rays.iterator(); $it0.hasNext(); ) {
        let ray = $it0.next();
        let toAdd = this.findChar(ray, hero, Math.imul(2, hero.pointsInTalent(Talent.PROJECTING_BLADES)), targets);
        if (toAdd != null && hero.fieldOfView[toAdd.pos]) {
          targets.add(toAdd);
        }
      }
      while (targets.size() > ((1 + hero.pointsInTalent(Talent.FAN_OF_BLADES)) | 0)) {
        let furthest = null;
        for (const $it1 = targets.iterator(); $it1.hasNext(); ) {
          let ch = $it1.next();
          if (furthest == null) {
            furthest = ch;
          } else if (Dungeon.level.trueDistance(enemy.pos, ch.pos) > Dungeon.level.trueDistance(enemy.pos, furthest.pos)) {
            furthest = ch;
          }
        }
        targets.remove(furthest);
      }
    }
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    let proto = new Shuriken()._Shuriken();
    let callbacks = new HashSet();
    for (const $it2 = targets.iterator(); $it2.hasNext(); ) {
      let ch = $it2.next();
      let callback = new (SpectralBlades$1())().$o(this).$c(ch, enemy, hero, callbacks);
      let m = (hero.sprite_.parent.recycle($J.cls(MissileSprite)));
      m.reset$Visual$int$Item$Callback(hero.sprite_, ch.pos, proto, callback);
      m.hardlight$float$float$float(Math.fround(0.6), 1, 1);
      m.alpha$float(Math.fround(0.8));
      callbacks.add(callback);
    }
    hero.sprite_.zap$int(enemy.pos);
    hero.busy();
  }
  findChar(path: Ballistica, hero: Hero, wallPenetration: number, existingTargets: HashSet<Char>): Char {
    for (const $it3 = path.path.iterator(); $it3.hasNext(); ) {
      let cell = $it3.next();
      let ch = Actor.findChar(cell);
      if (ch != null) {
        if (ch === hero || existingTargets.contains(ch) || ch.alignment === Char$Alignment.ALLY) {
          continue;
        } else {
          return ch;
        }
      }
      if (Dungeon.level.solid[cell]) {
        wallPenetration--;
        if (wallPenetration < 0) {
          return null;
        }
      }
    }
    return null;
  }
  icon(): number {
    return HeroIcon.SPECTRAL_BLADES;
  }
  talents(): Talent[] {
    return [Talent.FAN_OF_BLADES, Talent.PROJECTING_BLADES, Talent.SPIRIT_BLADES, Talent.HEROIC_ENERGY];
  }
}

let $SpectralBlades$1: any = null;
/** An anonymous class (SpectralBlades.java:109). */
function SpectralBlades$1(): any {
  return $SpectralBlades$1 ??= $J.local(class extends JObject {
    call(): void {
      let dmgMulti = this.$cv_ch === this.$cv_enemy ? 1 : 0.5;
      let accmulti = Math.fround(1 + Math.fround(0.25 * this.$cv_hero.pointsInTalent(Talent.PROJECTING_BLADES)));
      if (this.$cv_hero.hasTalent(Talent.SPIRIT_BLADES)) {
        Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(Talent$SpiritBladesTracker), 0);
      }
      this.$cv_hero.attack$Char$float$float$float(this.$cv_ch, dmgMulti, 0, accmulti);
      this.$cv_callbacks.remove(this);
      if (this.$cv_callbacks.isEmpty()) {
        Invisibility.dispel$();
        this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      }
    }
    $c($ch, $enemy, $hero, $callbacks): this {
      this.$cv_ch = $ch; this.$cv_enemy = $enemy; this.$cv_hero = $hero; this.$cv_callbacks = $callbacks;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpectralBlades$1', ['com.watabou.utils.Callback']);
}

$J.define(SpectralBlades, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpectralBlades', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_SpectralBlades' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$SpiritBladesTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SpiritBladesTracker');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Shuriken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Shuriken');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
