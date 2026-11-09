// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfDivineInspiration.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ExoticPotion } from './ExoticPotion.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Buff$buffType, Talent, Flare, Item, Catalog, Messages, GameScene, ItemSprite, ItemSpriteSheet$Icons, StatusPane, TalentsPane, GLog, WndHero, WndOptions, Sample, Random;

export class PotionOfDivineInspiration extends ExoticPotion {
  static identifiedByUse: boolean = false;
  _PotionOfDivineInspiration(): this {
    this._ExoticPotion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_DIVINE;
    this.talentFactor = 2;
    return this;
  }
  drink(hero: Hero): void {
    if (!this.isKnown()) {
      this.identify$();
      Item.curItem = this.detach(hero.belongings.backpack);
      PotionOfDivineInspiration.identifiedByUse = true;
    } else {
      PotionOfDivineInspiration.identifiedByUse = false;
    }
    let enabled = $J.newArray(5, false);
    enabled[1] = enabled[2] = enabled[3] = enabled[4] = true;
    let tracker = hero.buff($J.cls(PotionOfDivineInspiration$DivineInspirationTracker));
    if (tracker != null) {
      let allBoosted = true;
      for (let i = 1; i <= 4; i++) {
        if (tracker.isBoosted(i)) {
          enabled[i] = false;
        } else {
          allBoosted = false;
        }
      }
      if (allBoosted) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_more_points', []), []);
        return;
      }
    }
    GameScene.show(new (PotionOfDivineInspiration$1())().$o(this).$c(enabled)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.trueName()), Messages.get$Class$String$ObjectArr($J.cls(PotionOfDivineInspiration), 'select_tier', []), [Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'tier', [1])), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'tier', [2])), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'tier', [3])), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'tier', [4]))]));
  }
  static $clinit() {
    PotionOfDivineInspiration.identifiedByUse = false;
  }
}

export class PotionOfDivineInspiration$DivineInspirationTracker extends Buff {
  boostedTiers: boolean[] = null;
  static readonly BOOSTED_TIERS: string = 'boosted_tiers';
  _PotionOfDivineInspiration$DivineInspirationTracker(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.revivePersists = true;
    this.boostedTiers = $J.newArray(5, false);
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$booleanArr(PotionOfDivineInspiration$DivineInspirationTracker.BOOSTED_TIERS, this.boostedTiers);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.boostedTiers = bundle.getBooleanArray(PotionOfDivineInspiration$DivineInspirationTracker.BOOSTED_TIERS);
  }
  setBoosted(tier: number): void {
    this.boostedTiers[tier] = true;
  }
  isBoosted(tier: number): boolean {
    return this.boostedTiers[tier];
  }
}

let $PotionOfDivineInspiration$1: any = null;
/** An anonymous class (PotionOfDivineInspiration.java:95). */
function PotionOfDivineInspiration$1(): any {
  return $PotionOfDivineInspiration$1 ??= $J.local(class extends WndOptions {
    enabled(index: number): boolean {
      return this.$cv_enabled[(index + 1) | 0];
    }
    onSelect(index: number): void {
      super.onSelect(index);
      if (index !== -1) {
        Buff.affect$Char$Class(Item.curUser, $J.cls(PotionOfDivineInspiration$DivineInspirationTracker)).setBoosted((index + 1) | 0);
        if (!PotionOfDivineInspiration.identifiedByUse) {
          Item.curItem.detach(Item.curUser.belongings.backpack);
        }
        PotionOfDivineInspiration.identifiedByUse = false;
        Item.curUser.busy();
        Item.curUser.sprite_.operate$int(Item.curUser.pos);
        Item.curUser.spendAndNext(1);
        let unspentTalents = false;
        for (let i = 1; i <= Dungeon.hero.talents_.size(); i++) {
          if (Dungeon.hero.talentPointsAvailable(i) > 0) {
            unspentTalents = true;
            break;
          }
        }
        if (unspentTalents) {
          StatusPane.talentBlink = 10;
          WndHero.lastIdx = 1;
        }
        GameScene.showlevelUpStars();
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        Sample.INSTANCE.playDelayed$Object$float$float$float(Assets$Sounds.LEVELUP, Math.fround(0.3), Math.fround(0.7), Math.fround(1.2));
        Sample.INSTANCE.playDelayed$Object$float$float$float(Assets$Sounds.LEVELUP, Math.fround(0.6), Math.fround(0.7), Math.fround(1.2));
        new Flare()._Flare(6, 32).color$int$boolean(16776960, true).show$Visual$float(Item.curUser.sprite_, 2);
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(PotionOfDivineInspiration), 'bonus', []), []);
        if (!this.$outer.anonymous) {
          Catalog.countUse($J.cls(PotionOfDivineInspiration));
          if (Random.Float$() < this.$outer.talentChance) {
            Talent.onPotionUsed(Item.curUser, Item.curUser.pos, this.$outer.talentFactor);
          }
        }
      }
    }
    onBackPressed(): void {
      if (!PotionOfDivineInspiration.identifiedByUse) {
        super.onBackPressed();
      }
    }
    $c($enabled): this {
      this.$cv_enabled = $enabled;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration$1', []);
}

$J.define(PotionOfDivineInspiration, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion', ctors: { '': '_PotionOfDivineInspiration' }, clinit: true, lazy: ['identifiedByUse'] });
$J.define(PotionOfDivineInspiration$DivineInspirationTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration$DivineInspirationTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_PotionOfDivineInspiration$DivineInspirationTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  StatusPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane');
  TalentsPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHero');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
