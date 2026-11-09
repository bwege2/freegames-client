// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/CapeOfThorns.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Dungeon, Actor, Item, Catalog, Messages, ItemSpriteSheet, BuffIndicator, GLog, Random;

export class CapeOfThorns extends Artifact {
  _CapeOfThorns(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_CAPE;
    this.levelCap = 10;
    this.charge_ = 0;
    this.chargeCap_ = 100;
    this.cooldown_ = 0;
    this.defaultAction_ = 'NONE';
    return this;
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new CapeOfThorns$Thorns().$o(this)._CapeOfThorns$Thorns();
  }
  charge(target: Hero, amount: number): void {
    if (this.cooldown_ === 0) {
      this.charge_ = (this.charge_ + $J.roundf(Math.fround(4 * amount))) | 0;
      Item.updateQuickslot();
    }
    if (this.charge_ >= this.chargeCap_) {
      target.buff($J.cls(CapeOfThorns$Thorns)).proc(0, null, null);
    }
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (this.isEquipped(Dungeon.hero)) {
      desc += '\n\n';
      if (this.cooldown_ === 0) {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_inactive', []);
      } else {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_active', []);
      }
    }
    return desc;
  }
}

export class CapeOfThorns$Thorns extends Artifact$ArtifactBuff {
  _CapeOfThorns$Thorns(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.cooldown_ > 0) {
      this.$outer.cooldown_--;
      if (this.$outer.cooldown_ === 0) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'inert', []), []);
      }
      Item.updateQuickslot();
    }
    this.spend(Actor.TICK);
    return true;
  }
  proc(damage: number, attacker: Char, defender: Char): number {
    if (this.$outer.cooldown_ === 0) {
      this.$outer.charge_ = $J.d2i(this.$outer.charge_ + damage * (0.5 + this.$outer.level$() * 0.05));
      if (this.$outer.charge_ >= this.$outer.chargeCap_) {
        this.$outer.charge_ = 0;
        this.$outer.cooldown_ = (10 + this.$outer.level$()) | 0;
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'radiating', []), []);
      }
    }
    if (this.$outer.cooldown_ !== 0) {
      let deflected = Random.NormalIntRange(0, damage);
      damage = (damage - deflected) | 0;
      if (attacker != null && Dungeon.level.adjacent(attacker.pos, defender.pos)) {
        attacker.damage(deflected, this);
      }
      this.$outer.exp = (this.$outer.exp + deflected) | 0;
      if (this.$outer.exp >= Math.imul(((this.$outer.level$() + 1) | 0), 5) && this.$outer.level$() < this.$outer.levelCap) {
        this.$outer.exp = (this.$outer.exp - Math.imul(((this.$outer.level$() + 1) | 0), 5)) | 0;
        this.$outer.upgrade$();
        Catalog.countUse($J.cls(CapeOfThorns));
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
      }
    }
    Item.updateQuickslot();
    return damage;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(Math.fround(this.$outer.cooldown_))]);
  }
  icon(): number {
    if (this.$outer.cooldown_ === 0) {
      return BuffIndicator.NONE;
    } else {
      return BuffIndicator.THORNS;
    }
  }
  detach(): void {
    this.$outer.cooldown_ = 0;
    this.$outer.charge_ = 0;
    super.detach();
  }
}

$J.define(CapeOfThorns, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CapeOfThorns', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_CapeOfThorns' } });
$J.define(CapeOfThorns$Thorns, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CapeOfThorns$Thorns', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_CapeOfThorns$Thorns' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
