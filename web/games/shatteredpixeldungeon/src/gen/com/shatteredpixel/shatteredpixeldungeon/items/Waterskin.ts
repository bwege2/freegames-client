// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Waterskin.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from './Item.ts';

let Assets$Sounds, Barrier, Talent, Dewdrop, VialOfBlood, Catalog, Messages, ItemSpriteSheet, GLog, Sample, GameMath;

export class Waterskin extends Item {
  static readonly MAX_VOLUME: number = 20;
  static readonly AC_DRINK: string = 'DRINK';
  static readonly TIME_TO_DRINK: number = 1;
  static readonly TXT_STATUS: string = '%d/%d';
  volume_: number = 0;
  static readonly VOLUME: string = 'volume';
  _Waterskin(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.WATERSKIN;
    this.defaultAction_ = Waterskin.AC_DRINK;
    this.unique = true;
    this.volume_ = 0;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Waterskin.VOLUME, this.volume_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.volume_ = bundle.getInt(Waterskin.VOLUME);
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.volume_ > 0) {
      actions.add(Waterskin.AC_DRINK);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Waterskin.AC_DRINK)) {
      if (this.volume_ > 0) {
        let missingHealthPercent = Math.fround(1 - (Math.fround(hero.HP / Math.fround(hero.HT))));
        let dropsNeeded = Math.fround(missingHealthPercent / Math.fround(0.05));
        if (dropsNeeded > Math.fround(1.01) && VialOfBlood.delayBurstHealing()) {
          dropsNeeded = Math.fround(dropsNeeded / VialOfBlood.totalHealMultiplier$());
        }
        let curShield = 0;
        if (hero.buff($J.cls(Barrier)) != null) {
          curShield = hero.buff($J.cls(Barrier)).shielding();
        }
        let maxShield = $J.roundf(Math.fround(Math.fround(hero.HT * Math.fround(0.2)) * hero.pointsInTalent(Talent.SHIELDING_DEW)));
        if (hero.hasTalent(Talent.SHIELDING_DEW)) {
          let missingShieldPercent = Math.fround(1 - (Math.fround(curShield / Math.fround(maxShield))));
          missingShieldPercent = Math.fround(missingShieldPercent * Math.fround(Math.fround(0.2) * hero.pointsInTalent(Talent.SHIELDING_DEW)));
          if (missingShieldPercent > Math.fround(0)) {
            dropsNeeded = Math.fround(dropsNeeded + Math.fround(missingShieldPercent / Math.fround(0.05)));
          }
        }
        let dropsToConsume = $J.d2i(Math.ceil(Math.fround(dropsNeeded - Math.fround(0.01))));
        dropsToConsume = $J.d2i(GameMath.gate(1, Math.fround(dropsToConsume), Math.fround(this.volume_)));
        if (Dewdrop.consumeDew(dropsToConsume, hero, true)) {
          this.volume_ = (this.volume_ - dropsToConsume) | 0;
          Catalog.countUses($J.cls(Dewdrop), dropsToConsume);
          hero.spend(Waterskin.TIME_TO_DRINK);
          hero.busy();
          Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
          hero.sprite_.operate$int(hero.pos);
          Item.updateQuickslot();
        }
      } else {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'empty', []), []);
      }
    }
  }
  info(): string {
    let info = super.info();
    if (this.volume_ === 0) {
      info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_water', []);
    } else {
      info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_heal', []);
    }
    if (this.isFull()) {
      info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_full', []);
    }
    return info;
  }
  empty(): void {
    this.volume_ = 0;
    Item.updateQuickslot();
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  isFull(): boolean {
    return this.volume_ >= Waterskin.MAX_VOLUME;
  }
  collectDew(dew: Dewdrop): void {
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'collected', []), []);
    this.volume_ = (this.volume_ + dew.quantity) | 0;
    if (this.volume_ >= Waterskin.MAX_VOLUME) {
      this.volume_ = Waterskin.MAX_VOLUME;
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'full', []), []);
    }
    Item.updateQuickslot();
  }
  fill(): void {
    this.volume_ = Waterskin.MAX_VOLUME;
    Item.updateQuickslot();
  }
  status(): string {
    return Messages.format(Waterskin.TXT_STATUS, [this.volume_, Waterskin.MAX_VOLUME]);
  }
}

$J.define(Waterskin, 'com.shatteredpixel.shatteredpixeldungeon.items.Waterskin', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Waterskin' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
  VialOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.VialOfBlood');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
