// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfFrost.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DamageWand } from './DamageWand.ts';

let Assets$Sounds, Dungeon, Actor, Fire, Buff, Chill, FlavourBuff, Frost, MagicMissile, Item, Wand, MagicalFireRoom$EternalFire, ItemSpriteSheet, Sample, PointF, Random;

export class WandOfFrost extends DamageWand {
  _WandOfFrost(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_FROST;
    return this;
  }
  min$int(lvl: number): number {
    return (2 + lvl) | 0;
  }
  max$int(lvl: number): number {
    return (8 + Math.imul(5, lvl)) | 0;
  }
  onZap(bolt: Ballistica): void {
    let heap = Dungeon.level.heaps.get(bolt.collisionPos);
    if (heap != null) {
      heap.freeze();
    }
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    if (fire != null && fire.volume_ > 0) {
      fire.clear(bolt.collisionPos);
    }
    let eternalFire = Dungeon.level.blobs.get($J.cls(MagicalFireRoom$EternalFire));
    if (eternalFire != null && eternalFire.volume_ > 0) {
      eternalFire.clear(bolt.collisionPos);
      if (bolt.path.size() > ((bolt.dist + 1) | 0)) {
        eternalFire.clear(bolt.path.get((bolt.dist + 1) | 0));
      }
    }
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch != null) {
      let damage = this.damageRoll$();
      if (ch.buff($J.cls(Frost)) != null) {
        return;
      }
      if (ch.buff($J.cls(Chill)) != null) {
        let chillturns = Math.min(10, ch.buff($J.cls(Chill)).cooldown());
        damage = $J.l2i($J.lround(damage * $J.pow(Math.fround(0.9333), chillturns)));
      } else {
        ch.sprite_.burst(-6697729, ($J.idiv(this.buffedLvl(), 2) + 2) | 0);
      }
      this.wandProc(ch, this.chargesPerCast());
      ch.damage(damage, this);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Math.fround(Math.fround(1.1) * Random.Float$float$float(Math.fround(0.87), Math.fround(1.15))));
      if (ch.isAlive()) {
        if (Dungeon.level.water[ch.pos]) {
          Buff.affect$Char$Class$float(ch, $J.cls(Chill), Math.fround((4 + this.buffedLvl()) | 0));
        } else {
          Buff.affect$Char$Class$float(ch, $J.cls(Chill), Math.fround((2 + this.buffedLvl()) | 0));
        }
      }
    } else {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
  }
  upgradeStat2(level: number): string {
    return String((2 + level) | 0);
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.FROST, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let chill = defender.buff($J.cls(Chill));
    if (chill != null) {
      let procChance = Math.fround((($J.d2i(Math.floor(chill.cooldown())) - 1) | 0) / 9);
      procChance = Math.fround(procChance * Wand.procChanceMultiplier(attacker));
      if (Random.Float$() < procChance) {
        let powerMulti = Math.max(1, procChance);
        new (WandOfFrost$1())().$o(this).$c(powerMulti)._FlavourBuff().$init_anon().attachTo(defender);
      }
    }
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(8965375);
    particle.am = Math.fround(0.6);
    particle.setLifespan(2);
    let angle = Random.Float$float(PointF.PI2);
    particle.speed_.polar(angle, 2);
    particle.acc.set$float$float(0, 1);
    particle.setSize(0, 1.5);
    particle.radiateXY(Random.Float$float(1));
  }
}

let $WandOfFrost$1: any = null;
/** An anonymous class (WandOfFrost.java:142). */
function WandOfFrost$1(): any {
  return $WandOfFrost$1 ??= $J.local(class extends FlavourBuff {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Buff.affect$Char$Class$float(this.target, $J.cls(Frost), Math.fround($J.roundf(Math.fround(Frost.DURATION * this.$cv_powerMulti))));
      return super.act();
    }
    $c($powerMulti): this {
      this.$cv_powerMulti = $powerMulti;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFrost$1', []);
}

$J.define(WandOfFrost, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFrost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfFrost' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  FlavourBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MagicalFireRoom$EternalFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom$EternalFire');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
