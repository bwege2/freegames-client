// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Crystal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Weapon$Enchantment } from '../Weapon.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Regeneration, Hero, Splash, Item, DriedRose, DriedRose$GhostHero, Weapon, MeleeWeapon, MissileWeapon, Messages, ItemSprite$Glowing, GLog, Sample, GameMath, Random;

export class Crystal extends Weapon$Enchantment {
  static LIGHT_BLUE: ItemSprite$Glowing = null;
  static FLAW: ItemSprite$Glowing = null;
  static CRACK: ItemSprite$Glowing = null;
  durability: number = 0;
  visualDurability: number = 0;
  thrownWeapon: boolean = false;
  static readonly DURABILITY: string = 'durability';
  static readonly VISUAL_DUR: string = 'visual_dur';
  static readonly THROWN_WEP: string = 'thrown_wep';
  _Crystal(): this {
    this._Weapon$Enchantment();
    this.durability = 100;
    this.visualDurability = 100;
    this.thrownWeapon = false;
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    if (attacker === Dungeon.hero || attacker instanceof DriedRose$GhostHero) {
      if (weapon instanceof MissileWeapon) {
        this.setThrownWep();
      } else {
        this.thrownWeapon = false;
        let avgUses = 50;
        if (weapon instanceof MeleeWeapon) {
          avgUses = Math.fround(avgUses - Math.min(20, Math.fround(Math.imul(20, weapon.buffedLvl()) / 6)));
        }
        this.durability = Math.fround(this.durability - Math.fround(Math.fround(Random.NormalFloat(0.5, 1.5) * (Math.fround(1 / avgUses))) * weapon.delayFactor(attacker)));
        let prevHeuristicDur = this.visualDurability;
        this.visualDurability = GameMath.gate(Math.fround(this.durability - 10), this.visualDurability, this.durability);
        if (prevHeuristicDur > Math.fround(50) && this.visualDurability <= Math.fround(50)) {
          if (attacker instanceof Hero) {
            GLog.w(Messages.get$Object$String$ObjectArr(this, 'alert_flawed', []), []);
          } else if (attacker instanceof DriedRose$GhostHero) {
            GLog.w(Messages.get$Object$String$ObjectArr(this, 'alert_flawed_ghost', []), []);
          }
        } else if (prevHeuristicDur > Math.fround(10) && this.visualDurability <= Math.fround(10)) {
          this.durability = Math.max(this.durability, 1);
          this.visualDurability = Math.max(this.visualDurability, 1);
          Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
          if (attacker instanceof Hero) {
            GLog.n(Messages.get$Object$String$ObjectArr(this, 'alert_cracked', []), []);
          } else if (attacker instanceof DriedRose$GhostHero) {
            GLog.n(Messages.get$Object$String$ObjectArr(this, 'alert_cracked_ghost', []), []);
          }
        } else if (this.visualDurability <= Math.fround(0)) {
          Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
          Splash.at$int$int$int(attacker.pos, 35071, 15);
          if (attacker instanceof Hero) {
            if (weapon.isEquipped(attacker)) {
              weapon.doUnequip$Hero$boolean(attacker, false);
            } else {
              weapon.detachAll((attacker).belongings.backpack);
            }
            GLog.n(Messages.get$Object$String$ObjectArr(this, 'alert_shattered', []), []);
          } else if (attacker instanceof DriedRose$GhostHero) {
            (attacker).clearWeapon();
            GLog.n(Messages.get$Object$String$ObjectArr(this, 'alert_shattered_ghost', []), []);
          }
        }
      }
    }
    if (attacker instanceof Hero) {
      Buff.affect$Char$Class(attacker, $J.cls(Crystal$CrystalRepair));
    } else if (attacker instanceof DriedRose$GhostHero) {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(Crystal$CrystalRepair));
    }
    let magicDmg = $J.d2i(Math.ceil(Math.fround(Math.fround(damage * Math.fround(0.33)) * Weapon$Enchantment.genericProcChanceMultiplier(attacker))));
    defender.damage(magicDmg, this);
    return damage;
  }
  setThrownWep(): void {
    this.thrownWeapon = true;
  }
  setDurability(amount: number): void {
    this.durability = this.visualDurability = amount;
  }
  repair(w: Weapon, inRose: boolean, amount: number): void {
    if (w instanceof MissileWeapon) {
      amount = Math.fround(amount / 2);
      if ((w).durabilityLeft() < Math.fround(100)) {
        (w).repair(amount);
        if ((w).durabilityLeft() === Math.fround(100)) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'alert_fixed', []), []);
        }
      }
    } else {
      this.durability = Math.min(100, Math.fround(this.durability + amount));
      let prevHeuristicDur = this.visualDurability;
      this.visualDurability = Math.max(this.visualDurability, Math.fround(this.durability - 10));
      if (this.durability === Math.fround(100)) {
        if (this.visualDurability === Math.fround(90)) {
          if (!inRose) {
            GLog.p(Messages.get$Object$String$ObjectArr(this, 'alert_fixed', []), []);
          } else {
            GLog.p(Messages.get$Object$String$ObjectArr(this, 'alert_fixed_ghost', []), []);
          }
        }
        this.visualDurability = 100;
      } else if (prevHeuristicDur < Math.fround(50) && this.visualDurability >= Math.fround(50)) {
        if (!inRose) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'alert_noflaw', []), []);
        } else {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'alert_noflaw_ghost', []), []);
        }
      } else if (prevHeuristicDur < Math.fround(10) && this.visualDurability >= Math.fround(10)) {
        if (!inRose) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'alert_nocrack', []), []);
        } else {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'alert_nocrack_ghost', []), []);
        }
      }
    }
    Item.updateQuickslot();
  }
  glowing(): ItemSprite$Glowing {
    if (this.visualDurability > Math.fround(50) || this.thrownWeapon) {
      return Crystal.LIGHT_BLUE;
    } else if (this.visualDurability > Math.fround(10)) {
      return Crystal.FLAW;
    } else {
      return Crystal.CRACK;
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.thrownWeapon) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_thrown', []);
    } else if (this.visualDurability === Math.fround(100)) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_perfect', []);
    } else if (this.visualDurability > Math.fround(50)) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_fine', []);
    } else if (this.visualDurability > Math.fround(10)) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_flawed', []);
    } else {
      desc += ' _' + Messages.get$Object$String$ObjectArr(this, 'desc_cracked', []) + '_';
    }
    return desc;
  }
  restoreFromBundle(bundle: Bundle): void {
    this.durability = bundle.getFloat(Crystal.DURABILITY);
    this.visualDurability = bundle.getFloat(Crystal.VISUAL_DUR);
    this.thrownWeapon = bundle.getBoolean(Crystal.THROWN_WEP);
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$float(Crystal.DURABILITY, this.durability);
    bundle.put$String$float(Crystal.VISUAL_DUR, this.visualDurability);
    bundle.put$String$boolean(Crystal.THROWN_WEP, this.thrownWeapon);
  }
  static $clinit() {
    Crystal.LIGHT_BLUE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(35071);
    Crystal.FLAW = new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(35071, 0.5);
    Crystal.CRACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(35071, 0.25);
  }
}

export class Crystal$CrystalRepair extends Buff {
  _Crystal$CrystalRepair(): this {
    this._Buff();
    this.revivePersists = true;
    return this;
  }
  act(): boolean {
    if (Regeneration.regenOn()) {
      if (this.target instanceof Hero) {
        for (const $it0 = (this.target).belongings.getAllItems($J.cls(Weapon)).iterator(); $it0.hasNext(); ) {
          let w = $it0.next();
          if (w.enchantment instanceof Crystal) {
            (w.enchantment).repair(w, false, Math.fround(0.2));
          }
        }
        let rose = (this.target).belongings.getItem($J.cls(DriedRose));
        if (rose != null && rose.ghostWeapon() != null && rose.ghostWeapon().enchantment instanceof Crystal) {
          (rose.ghostWeapon().enchantment).repair(rose.ghostWeapon(), true, Math.fround(0.2));
        }
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
}

$J.define(Crystal, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Crystal' }, clinit: true, lazy: ['LIGHT_BLUE', 'FLAW', 'CRACK'] });
$J.define(Crystal$CrystalRepair, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal$CrystalRepair', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Crystal$CrystalRepair' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  DriedRose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Random = $J.load('com.watabou.utils.Random');
});
