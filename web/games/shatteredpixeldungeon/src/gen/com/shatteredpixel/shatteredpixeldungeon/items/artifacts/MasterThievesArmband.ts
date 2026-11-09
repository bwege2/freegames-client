// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/MasterThievesArmband.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { CounterBuff } from '../../actors/buffs/CounterBuff.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Challenges, Dungeon, Actor, Char$Alignment, Blindness, Buff, Cripple, Invisibility, MagicImmune, Talent, Mimic, Mob, Shopkeeper, Surprise, Item, RingOfEnergy, Catalog, Messages, CellSelector$Listener, GameScene, ItemSpriteSheet, GLog, Sample, Random;

export class MasterThievesArmband extends Artifact {
  static readonly AC_STEAL: string = 'STEAL';
  targeter: CellSelector$Listener = null;
  _MasterThievesArmband(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_ARMBAND;
    this.levelCap = 10;
    this.charge_ = 0;
    this.partialCharge = 0;
    this.chargeCap_ = (5 + $J.idiv(this.level$(), 2)) | 0;
    this.defaultAction_ = MasterThievesArmband.AC_STEAL;
    this.targeter = new (MasterThievesArmband$1())().$o(this)._CellSelector$Listener();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && this.charge_ > 0 && hero.buff($J.cls(MagicImmune)) == null && !this.cursed) {
      actions.add(MasterThievesArmband.AC_STEAL);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, MasterThievesArmband.AC_STEAL)) {
      Item.curUser = hero;
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
        this.usesTargeting_ = false;
      } else if (this.charge_ < 1) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
        this.usesTargeting_ = false;
      } else if (this.cursed) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
        this.usesTargeting_ = false;
      } else {
        this.usesTargeting_ = true;
        GameScene.selectCell(this.targeter);
      }
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new MasterThievesArmband$Thievery().$o(this)._MasterThievesArmband$Thievery();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.charge_ < this.chargeCap_) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(Math.fround(0.1) * amount));
      while (this.partialCharge >= 1) {
        this.charge_++;
        this.partialCharge--;
      }
      if (this.charge_ >= this.chargeCap_) {
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'full', []), []);
        this.partialCharge = 0;
        this.charge_ = this.chargeCap_;
      }
      Item.updateQuickslot();
    }
  }
  upgrade$(): Item {
    this.chargeCap_ = (5 + $J.idiv(((this.level$() + 1) | 0), 2)) | 0;
    return super.upgrade$();
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      if (this.cursed) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      } else {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_worn', []);
      }
    }
    return desc;
  }
}

export class MasterThievesArmband$StolenTracker extends CounterBuff {
  _MasterThievesArmband$StolenTracker(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
  setItemStolen(stolen: boolean): void {
    if (stolen) {
      this.countUp(1);
    }
  }
  itemWasStolen(): boolean {
    return this.count() > Math.fround(0);
  }
}

export class MasterThievesArmband$Thievery extends Artifact$ArtifactBuff {
  _MasterThievesArmband$Thievery(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.cursed && Dungeon.gold > 0 && Random.Int$int(5) === 0) {
      Dungeon.gold--;
      Item.updateQuickslot();
    }
    this.spend(Actor.TICK);
    return true;
  }
  gainCharge(levelPortion: number): void {
    if (this.$outer.cursed || this.target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.$outer.charge_ < this.$outer.chargeCap_) {
      let chargeGain = Math.fround((Math.fround(3 + Math.fround(Math.fround(0.15) * this.$outer.level$()))) * levelPortion);
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
      while (this.$outer.partialCharge > 1) {
        this.$outer.partialCharge--;
        this.$outer.charge_++;
        Item.updateQuickslot();
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'full', []), []);
          this.$outer.partialCharge = 0;
        }
      }
    } else {
      this.$outer.partialCharge = 0;
    }
  }
  steal(item: Item): boolean {
    let chargesUsed = this.chargesToUse(item);
    let stealChance = this.stealChance(item);
    if (Random.Float$() > stealChance) {
      return false;
    } else {
      this.$outer.charge_ = (this.$outer.charge_ - chargesUsed) | 0;
      this.$outer.exp = (this.$outer.exp + Math.imul(4, chargesUsed)) | 0;
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'stole_item', [item.name()]), []);
      Talent.onArtifactUsed(Dungeon.hero);
      while (this.$outer.exp >= ((10 + $J.roundf(Math.fround(Math.fround(3.33) * this.$outer.level$()))) | 0) && this.$outer.level$() < this.$outer.levelCap) {
        this.$outer.exp = (this.$outer.exp - (10 + $J.roundf(Math.fround(Math.fround(3.33) * this.$outer.level$())))) | 0;
        Catalog.countUse($J.cls(MasterThievesArmband));
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'level_up', []), []);
        this.$outer.upgrade$();
      }
      Item.updateQuickslot();
      return true;
    }
  }
  stealChance(item: Item): number {
    let chargesUsed = this.chargesToUse(item);
    let val = Math.fround(chargesUsed * (Math.fround(10 + Math.fround(this.$outer.level$() / 2))));
    return Math.min(1, Math.fround(val / item.value()));
  }
  chargesToUse(item: Item): number {
    let value = item.value();
    let valUsing = 0;
    let chargesUsed = 0;
    while (valUsing < Math.fround(value) && chargesUsed < this.$outer.charge_) {
      valUsing = Math.fround(valUsing + Math.fround(10 + Math.fround(this.$outer.level$() / 2)));
      chargesUsed++;
    }
    return chargesUsed;
  }
}

let $MasterThievesArmband$1$1: any = null;
/** An anonymous class (MasterThievesArmband.java:131). */
function MasterThievesArmband$1$1(): any {
  return $MasterThievesArmband$1$1 ??= $J.local(class extends JObject {
    call(): void {
      Sample.INSTANCE.play$Object(Assets$Sounds.HIT);
      let surprised = (this.$cv_ch).surprisedBy$Char$boolean(Item.curUser, false);
      let lootMultiplier = Math.fround(1 + Math.fround(Math.fround(0.1) * this.$outer.$outer.level$()));
      let debuffDuration = (3 + $J.idiv(this.$outer.$outer.level$(), 2)) | 0;
      Invisibility.dispel$Char(Item.curUser);
      if (surprised) {
        lootMultiplier = Math.fround(lootMultiplier + 0.5);
        Surprise.hit$Char(this.$cv_ch);
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        debuffDuration = (debuffDuration + 2) | 0;
        this.$outer.$outer.exp = (this.$outer.$outer.exp + 2) | 0;
      }
      let lootChance = Math.fround((this.$cv_ch).lootChance() * lootMultiplier);
      if (Dungeon.hero.lvl > (((this.$cv_ch).maxLvl + 2) | 0)) {
        lootChance = 0;
      } else if (this.$cv_ch.buff($J.cls(MasterThievesArmband$StolenTracker)) != null) {
        lootChance = 0;
      }
      if (lootChance === Math.fround(0)) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'no_steal', []), []);
      } else if (Random.Float$() <= lootChance) {
        let loot = (this.$cv_ch).createLoot();
        if (Challenges.isItemBlocked(loot)) {
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'failed_steal', []), []);
          Buff.affect$Char$Class(this.$cv_ch, $J.cls(MasterThievesArmband$StolenTracker)).setItemStolen(false);
        } else {
          if (loot.doPickUp$Hero(Item.curUser)) {
            Item.curUser.spend(Math.fround(-loot.pickupDelay()));
          } else {
            Dungeon.level.drop(loot, Item.curUser.pos).sprite_.drop$();
          }
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'stole_item', [loot.name()]), []);
          Buff.affect$Char$Class(this.$cv_ch, $J.cls(MasterThievesArmband$StolenTracker)).setItemStolen(true);
        }
      } else {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'failed_steal', []), []);
        Buff.affect$Char$Class(this.$cv_ch, $J.cls(MasterThievesArmband$StolenTracker)).setItemStolen(false);
      }
      Buff.prolong(this.$cv_ch, $J.cls(Blindness), Math.fround(debuffDuration));
      Buff.prolong(this.$cv_ch, $J.cls(Cripple), Math.fround(debuffDuration));
      Artifact.artifactProc(this.$cv_ch, this.$outer.$outer.visiblyUpgraded(), 1);
      this.$outer.$outer.charge_--;
      this.$outer.$outer.exp = (this.$outer.$outer.exp + 3) | 0;
      Talent.onArtifactUsed(Dungeon.hero);
      while (this.$outer.$outer.exp >= ((10 + $J.roundf(Math.fround(Math.fround(3.33) * this.$outer.$outer.level$()))) | 0) && this.$outer.$outer.level$() < this.$outer.$outer.levelCap) {
        this.$outer.$outer.exp = (this.$outer.$outer.exp - (10 + $J.roundf(Math.fround(Math.fround(3.33) * this.$outer.$outer.level$())))) | 0;
        Catalog.countUse($J.cls(MasterThievesArmband));
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'level_up', []), []);
        this.$outer.$outer.upgrade$();
      }
      Item.updateQuickslot();
      Item.curUser.next();
    }
    $c($ch): this {
      this.$cv_ch = $ch;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband$1$1', ['com.watabou.utils.Callback']);
}

let $MasterThievesArmband$1: any = null;
/** An anonymous class (MasterThievesArmband.java:113). */
function MasterThievesArmband$1(): any {
  return $MasterThievesArmband$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target == null) {
        return;
      } else if (!Dungeon.level.adjacent(Item.curUser.pos, target) || Actor.findChar(target) == null) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'no_target', []), []);
      } else {
        let ch = Actor.findChar(target);
        if (ch instanceof Shopkeeper) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'steal_shopkeeper', []), []);
        } else if (ch.alignment !== Char$Alignment.ENEMY && !(ch instanceof Mimic && ch.alignment === Char$Alignment.NEUTRAL)) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'no_target', []), []);
        } else if (ch instanceof Mob) {
          Item.curUser.busy();
          Item.curUser.sprite_.attack$int$Callback(target, new (MasterThievesArmband$1$1())().$o(this).$c(ch));
        }
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband$1', []);
}

$J.define(MasterThievesArmband, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_MasterThievesArmband' }, meths: { 'upgrade()': 'upgrade$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(MasterThievesArmband$StolenTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband$StolenTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_MasterThievesArmband$StolenTracker' } });
$J.define(MasterThievesArmband$Thievery, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband$Thievery', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_MasterThievesArmband$Thievery' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  Surprise = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Surprise');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
