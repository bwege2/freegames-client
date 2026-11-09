// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/RecallInscription.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { ClericSpell } from './ClericSpell.ts';
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Dungeon, Buff$buffType, Talent, Enchanting, Scroll, ScrollOfTransmutation, ExoticScroll, ScrollOfEnchantment, ScrollOfMetamorphosis, InventoryStone, Runestone, StoneOfAugmentation, StoneOfEnchantment, Messages, BuffIndicator, HeroIcon, Game, Reflection;

export class RecallInscription extends ClericSpell {
  static INSTANCE: RecallInscription = null;
  _RecallInscription(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.RECALL_GLYPH;
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [Dungeon.hero.pointsInTalent(Talent.RECALL_INSCRIPTION) === 2 ? 300 : 10])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  onCast(tome: HolyTome, hero: Hero): void {
    if (hero.buff($J.cls(RecallInscription$UsedItemTracker)) == null) {
      return;
    }
    let item = Reflection.newInstance(hero.buff($J.cls(RecallInscription$UsedItemTracker)).item_);
    item.setCurrent(hero);
    hero.sprite_.operate$int(hero.pos);
    Enchanting.show(hero, item);
    if (item instanceof Scroll) {
      (item).anonymize();
      (item).talentChance = 0;
      (item).doRead();
    } else if (item instanceof Runestone) {
      (item).anonymize();
      if (item instanceof InventoryStone) {
        (item).directActivate();
      } else {
        Game.runOnRenderThread(new (RecallInscription$1())().$o(this).$c(item, hero));
      }
    }
    this.onSpellCast(tome, hero);
    if (hero.buff($J.cls(RecallInscription$UsedItemTracker)) != null) {
      hero.buff($J.cls(RecallInscription$UsedItemTracker)).detach();
    }
  }
  chargeUse(hero: Hero): number {
    if (hero.buff($J.cls(RecallInscription$UsedItemTracker)) != null) {
      let item = hero.buff($J.cls(RecallInscription$UsedItemTracker)).item_;
      if ($J.cls(ExoticScroll).isAssignableFrom(item)) {
        if (item === $J.cls(ScrollOfMetamorphosis) || item === $J.cls(ScrollOfEnchantment)) {
          return 8;
        } else {
          return 4;
        }
      } else if ($J.cls(Scroll).isAssignableFrom(item)) {
        if (item === $J.cls(ScrollOfTransmutation)) {
          return 6;
        } else {
          return 3;
        }
      } else if ($J.cls(Runestone).isAssignableFrom(item)) {
        if (item === $J.cls(StoneOfAugmentation) || item === $J.cls(StoneOfEnchantment)) {
          return 4;
        } else {
          return 2;
        }
      }
    }
    return 0;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.RECALL_INSCRIPTION) && hero.buff($J.cls(RecallInscription$UsedItemTracker)) != null;
  }
  static $clinit() {
    RecallInscription.INSTANCE = new RecallInscription()._RecallInscription();
  }
}

export class RecallInscription$UsedItemTracker extends FlavourBuff {
  item_: JClass<Item> = null;
  static ITEM: string = null;
  _RecallInscription$UsedItemTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.GLYPH_RECALL;
  }
  iconFadePercent(): number {
    let duration = Math.fround(Dungeon.hero.pointsInTalent(Talent.RECALL_INSCRIPTION) === 2 ? 300 : 10);
    return Math.max(0, Math.fround((Math.fround(duration - this.visualcooldown())) / duration));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [Messages.titleCase(Reflection.newInstance(this.item_).name()), this.dispTurns$()]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Class(RecallInscription$UsedItemTracker.ITEM, this.item_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.item_ = bundle.getClass$String(RecallInscription$UsedItemTracker.ITEM);
  }
  static $clinit() {
    RecallInscription$UsedItemTracker.ITEM = 'item';
  }
}

let $RecallInscription$1: any = null;
/** An anonymous class (RecallInscription.java:87). */
function RecallInscription$1(): any {
  return $RecallInscription$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_item.doThrow(this.$cv_hero);
    }
    $c($item, $hero): this {
      this.$cv_item = $item; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.RecallInscription$1', ['com.watabou.utils.Callback']);
}

$J.define(RecallInscription, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.RecallInscription', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_RecallInscription' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(RecallInscription$UsedItemTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.RecallInscription$UsedItemTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_RecallInscription$UsedItemTracker' }, clinit: true, lazy: ['ITEM'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Enchanting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  ScrollOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment');
  ScrollOfMetamorphosis = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis');
  InventoryStone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  StoneOfAugmentation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Game = $J.load('com.watabou.noosa.Game');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
