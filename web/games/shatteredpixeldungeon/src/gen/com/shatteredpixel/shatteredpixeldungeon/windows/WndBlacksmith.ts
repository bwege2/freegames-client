// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndBlacksmith.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';
import { WndBag$ItemSelector } from './WndBag.ts';
import { WndInfoItem } from './WndInfoItem.ts';

let Assets$Sounds, Badges, Dungeon, Buff, Belongings$Backpack, Blacksmith$Quest, Gold, Item, Armor, ScrollOfUpgrade, Weapon, MissileWeapon, MissileWeapon$UpgradedSetTracker, Catalog, Notes, Notes$Landmark, Messages, GameScene, PixelScene, ItemButton, RedButton, GLog, IconTitle, WndOptions, WndSadGhost, Sample;

export class WndBlacksmith extends Window {
  static readonly WIDTH_P: number = 120;
  static readonly WIDTH_L: number = 180;
  static readonly GAP: number = 2;
  _WndBlacksmith(troll: Blacksmith, hero: Hero): this {
    this._Window$();
    let width = PixelScene.landscape() ? WndBlacksmith.WIDTH_L : WndBlacksmith.WIDTH_P;
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(troll.sprite());
    titlebar.label$String(Messages.titleCase(troll.name()));
    titlebar.setRect(0, 0, Math.fround(width), 0);
    this.add$Gizmo(titlebar);
    let message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'prompt', [Blacksmith$Quest.favor]), 6);
    message.maxWidth$int(width);
    message.setPos(0, Math.fround(titlebar.bottom() + WndBlacksmith.GAP));
    this.add$Gizmo(message);
    let buttons = new ArrayList();
    let pickaxeCost = Blacksmith$Quest.freePickaxe ? 0 : 250;
    let pickaxe = new (WndBlacksmith$1())().$o(this).$c(troll, pickaxeCost)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'pickaxe', [pickaxeCost]), 6);
    pickaxe.enable(Blacksmith$Quest.pickaxe != null && Blacksmith$Quest.favor >= pickaxeCost);
    buttons.add(pickaxe);
    let reforgecost = (500 + Math.imul(1000, Blacksmith$Quest.reforges)) | 0;
    let reforge = new (WndBlacksmith$2())().$o(this).$c(troll)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'reforge', [reforgecost]), 6);
    reforge.enable(Blacksmith$Quest.favor >= reforgecost);
    buttons.add(reforge);
    let hardenCost = (500 + Math.imul(1000, Blacksmith$Quest.hardens)) | 0;
    let harden = new (WndBlacksmith$3())().$o(this)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'harden', [hardenCost]), 6);
    harden.enable(Blacksmith$Quest.favor >= hardenCost);
    buttons.add(harden);
    let upgradeCost = (1000 + Math.imul(1000, Blacksmith$Quest.upgrades)) | 0;
    let upgrade = new (WndBlacksmith$4())().$o(this)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'upgrade', [upgradeCost]), 6);
    upgrade.enable(Blacksmith$Quest.favor >= upgradeCost);
    buttons.add(upgrade);
    let smith = new (WndBlacksmith$5())().$o(this).$c(troll, hero)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'smith', [2000]), 6);
    smith.enable(Blacksmith$Quest.favor >= 2000);
    buttons.add(smith);
    let cashOut = new (WndBlacksmith$6())().$o(this).$c(troll)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'cashout', []), 6);
    cashOut.enable(Blacksmith$Quest.favor > 0);
    buttons.add(cashOut);
    let pos = Math.fround(message.bottom() + Math.imul(3, WndBlacksmith.GAP));
    for (const $it0 = buttons.iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      b.leftJustify = true;
      b.multiline = true;
      b.setSize(Math.fround(width), b.reqHeight());
      b.setRect(0, pos, Math.fround(width), b.reqHeight());
      b.enable(b.active);
      this.add$Gizmo(b);
      pos = Math.fround(b.bottom() + WndBlacksmith.GAP);
    }
    this.resize(width, $J.d2i(pos));
    return this;
  }
}

export class WndBlacksmith$WndReforge extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_SIZE: number = 32;
  static readonly GAP: number = 2;
  static readonly BTN_GAP: number = 5;
  btnPressed: ItemButton = null;
  btnItem1: ItemButton = null;
  btnItem2: ItemButton = null;
  btnReforge: RedButton = null;
  itemSelector: WndBag$ItemSelector = null;
  _WndBlacksmith$WndReforge(troll: Blacksmith, wndParent: Window): this {
    this._Window$();
    this.itemSelector = new (WndBlacksmith$WndReforge$4())().$o(this)._WndBag$ItemSelector();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(troll.sprite());
    titlebar.label$String(Messages.titleCase(troll.name()));
    titlebar.setRect(0, 0, Math.fround(WndBlacksmith$WndReforge.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'message', []), 6);
    message.maxWidth$int(WndBlacksmith$WndReforge.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + WndBlacksmith$WndReforge.GAP));
    this.add$Gizmo(message);
    this.btnItem1 = new (WndBlacksmith$WndReforge$1())().$o(this)._ItemButton();
    this.btnItem1.setRect(Math.fround(Math.fround((Math.fround(WndBlacksmith$WndReforge.WIDTH - WndBlacksmith$WndReforge.BTN_GAP)) / 2) - WndBlacksmith$WndReforge.BTN_SIZE), Math.fround(Math.fround(message.top() + message.height()) + WndBlacksmith$WndReforge.BTN_GAP), Math.fround(WndBlacksmith$WndReforge.BTN_SIZE), Math.fround(WndBlacksmith$WndReforge.BTN_SIZE));
    this.add$Gizmo(this.btnItem1);
    this.btnItem2 = new (WndBlacksmith$WndReforge$2())().$o(this)._ItemButton();
    this.btnItem2.setRect(Math.fround(this.btnItem1.right() + WndBlacksmith$WndReforge.BTN_GAP), this.btnItem1.top(), Math.fround(WndBlacksmith$WndReforge.BTN_SIZE), Math.fround(WndBlacksmith$WndReforge.BTN_SIZE));
    this.add$Gizmo(this.btnItem2);
    this.btnReforge = new (WndBlacksmith$WndReforge$3())().$o(this).$c(wndParent)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'reforge', []));
    this.btnReforge.enable(false);
    this.btnReforge.setRect(0, Math.fround(this.btnItem1.bottom() + WndBlacksmith$WndReforge.BTN_GAP), Math.fround(WndBlacksmith$WndReforge.WIDTH), 20);
    this.add$Gizmo(this.btnReforge);
    this.resize(WndBlacksmith$WndReforge.WIDTH, $J.d2i(this.btnReforge.bottom()));
    return this;
  }
}

export class WndBlacksmith$HardenSelector extends WndBag$ItemSelector {
  _WndBlacksmith$HardenSelector(): this {
    this._WndBag$ItemSelector();
    return this;
  }
  textPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  preferredBag(): JClass<Bag> {
    return $J.cls(Belongings$Backpack);
  }
  itemSelectable(item: Item): boolean {
    return item.isUpgradable() && item.isIdentified() && !item.cursed && ((item instanceof Weapon && !(item).enchantHardened) || (item instanceof Armor && !(item).glyphHardened));
  }
  onSelect(item: Item): void {
    if (item != null) {
      if (item instanceof Weapon) {
        (item).enchantHardened = true;
      } else if (item instanceof Armor) {
        (item).glyphHardened = true;
      }
      Blacksmith$Quest.favor = (Blacksmith$Quest.favor - (500 + Math.imul(1000, Blacksmith$Quest.hardens))) | 0;
      Blacksmith$Quest.hardens++;
      this.$outer.hide();
      Sample.INSTANCE.play$Object(Assets$Sounds.EVOKE);
      Item.evoke(Dungeon.hero);
      if (!Blacksmith$Quest.rewardsAvailable()) {
        Notes.remove$Landmark(Notes$Landmark.TROLL);
      }
    }
  }
}

export class WndBlacksmith$UpgradeSelector extends WndBag$ItemSelector {
  _WndBlacksmith$UpgradeSelector(): this {
    this._WndBag$ItemSelector();
    return this;
  }
  textPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  preferredBag(): JClass<Bag> {
    return $J.cls(Belongings$Backpack);
  }
  itemSelectable(item: Item): boolean {
    return item.isUpgradable() && item.isIdentified() && !item.cursed && item.level$() < 2;
  }
  onSelect(item: Item): void {
    if (item != null) {
      item.upgrade$();
      let upgradeCost = (1000 + Math.imul(1000, Blacksmith$Quest.upgrades)) | 0;
      Blacksmith$Quest.favor = (Blacksmith$Quest.favor - upgradeCost) | 0;
      Blacksmith$Quest.upgrades++;
      this.$outer.hide();
      Sample.INSTANCE.play$Object(Assets$Sounds.EVOKE);
      ScrollOfUpgrade.upgrade(Dungeon.hero);
      Item.evoke(Dungeon.hero);
      Badges.validateItemLevelAquired(item);
      if (!Blacksmith$Quest.rewardsAvailable()) {
        Notes.remove$Landmark(Notes$Landmark.TROLL);
      }
      Catalog.countUse(item.getClass());
    }
  }
}

export class WndBlacksmith$WndSmith extends Window {
  static readonly WIDTH: number = 128;
  static readonly BTN_SIZE: number = 28;
  static readonly BTN_GAP: number = 4;
  static readonly GAP: number = 2;
  _WndBlacksmith$WndSmith(troll: Blacksmith, hero: Hero): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(troll.sprite());
    titlebar.label$String(Messages.titleCase(troll.name()));
    let message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'prompt', []), 6);
    titlebar.setRect(0, 0, Math.fround(WndBlacksmith$WndSmith.WIDTH), 0);
    this.add$Gizmo(titlebar);
    message.maxWidth$int(WndBlacksmith$WndSmith.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + WndBlacksmith$WndSmith.GAP));
    this.add$Gizmo(message);
    if (Blacksmith$Quest.smithRewards == null || Blacksmith$Quest.smithRewards.isEmpty()) {
      Blacksmith$Quest.generateRewards(false);
    }
    let count = 0;
    for (const $it1 = Blacksmith$Quest.smithRewards.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      count++;
      let btnReward = new (WndBlacksmith$WndSmith$1())().$o(this).$c(troll, hero)._ItemButton();
      btnReward.item$Item(i);
      btnReward.setRect(Math.fround(($J.idiv(Math.imul(count, ((WndBlacksmith$WndSmith.WIDTH - WndBlacksmith$WndSmith.BTN_GAP) | 0)), Blacksmith$Quest.smithRewards.size()) - WndBlacksmith$WndSmith.BTN_SIZE) | 0), Math.fround(Math.fround(message.top() + message.height()) + WndBlacksmith$WndSmith.BTN_GAP), Math.fround(WndBlacksmith$WndSmith.BTN_SIZE), Math.fround(WndBlacksmith$WndSmith.BTN_SIZE));
      this.add$Gizmo(btnReward);
    }
    this.resize(WndBlacksmith$WndSmith.WIDTH, ($J.d2i(message.bottom()) + Math.imul(2, WndBlacksmith$WndSmith.BTN_GAP) + WndBlacksmith$WndSmith.BTN_SIZE) | 0);
    return this;
  }
  onBackPressed(): void {
  }
}

export class WndBlacksmith$WndSmith$RewardWindow extends WndInfoItem {
  _WndBlacksmith$WndSmith$RewardWindow(troll: Blacksmith, hero: Hero, item: Item): this {
    this._WndInfoItem$Item(item);
    let btnConfirm = new (WndBlacksmith$WndSmith$RewardWindow$1())().$o(this).$c(item)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'confirm', []));
    btnConfirm.setRect(0, Math.fround((this.height_ + 2) | 0), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), 16);
    this.add$Gizmo(btnConfirm);
    let btnCancel = new (WndBlacksmith$WndSmith$RewardWindow$2())().$o(this)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'cancel', []));
    btnCancel.setRect(Math.fround(btnConfirm.right() + 2), Math.fround((this.height_ + 2) | 0), btnConfirm.width(), 16);
    this.add$Gizmo(btnCancel);
    this.resize(this.width_, $J.d2i(btnCancel.bottom()));
    return this;
  }
}

let $WndBlacksmith$1$1: any = null;
/** An anonymous class (WndBlacksmith.java:89). */
function WndBlacksmith$1$1(): any {
  return $WndBlacksmith$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        if (Blacksmith$Quest.pickaxe.doPickUp$Hero(Dungeon.hero)) {
          GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'you_now_have', [Blacksmith$Quest.pickaxe.name()])), []);
        } else {
          Dungeon.level.drop(Blacksmith$Quest.pickaxe, Dungeon.hero.pos).sprite_.drop$();
        }
        Blacksmith$Quest.favor = (Blacksmith$Quest.favor - this.$cv_pickaxeCost) | 0;
        Blacksmith$Quest.pickaxe = null;
        this.$outer.$outer.hide();
        if (!Blacksmith$Quest.rewardsAvailable()) {
          Notes.remove$Landmark(Notes$Landmark.TROLL);
        }
      }
    }
    $c($pickaxeCost): this {
      this.$cv_pickaxeCost = $pickaxeCost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$1$1', []);
}

let $WndBlacksmith$1: any = null;
/** An anonymous class (WndBlacksmith.java:80). */
function WndBlacksmith$1(): any {
  return $WndBlacksmith$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (WndBlacksmith$1$1())().$o(this).$c(this.$cv_pickaxeCost)._WndOptions$Image$String$String$StringArr(this.$cv_troll.sprite(), Messages.titleCase(this.$cv_troll.name()), Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'pickaxe_verify', []) + (this.$cv_pickaxeCost === 0 ? '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'pickaxe_free', []) : ''), [Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'pickaxe_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'pickaxe_no', [])]));
    }
    $c($troll, $pickaxeCost): this {
      this.$cv_troll = $troll; this.$cv_pickaxeCost = $pickaxeCost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$1', []);
}

let $WndBlacksmith$2: any = null;
/** An anonymous class (WndBlacksmith.java:114). */
function WndBlacksmith$2(): any {
  return $WndBlacksmith$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new WndBlacksmith$WndReforge()._WndBlacksmith$WndReforge(this.$cv_troll, this.$outer));
    }
    $c($troll): this {
      this.$cv_troll = $troll;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$2', []);
}

let $WndBlacksmith$3: any = null;
/** An anonymous class (WndBlacksmith.java:124). */
function WndBlacksmith$3(): any {
  return $WndBlacksmith$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.selectItem(new WndBlacksmith$HardenSelector().$o(this.$outer)._WndBlacksmith$HardenSelector());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$3', []);
}

let $WndBlacksmith$4: any = null;
/** An anonymous class (WndBlacksmith.java:134). */
function WndBlacksmith$4(): any {
  return $WndBlacksmith$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.selectItem(new WndBlacksmith$UpgradeSelector().$o(this.$outer)._WndBlacksmith$UpgradeSelector());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$4', []);
}

let $WndBlacksmith$5$1: any = null;
/** An anonymous class (WndBlacksmith.java:152). */
function WndBlacksmith$5$1(): any {
  return $WndBlacksmith$5$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Blacksmith$Quest.favor = (Blacksmith$Quest.favor - 2000) | 0;
        Blacksmith$Quest.smiths++;
        this.$outer.$outer.hide();
        GameScene.show(new WndBlacksmith$WndSmith()._WndBlacksmith$WndSmith(this.$cv_troll, this.$cv_hero));
      }
    }
    $c($troll, $hero): this {
      this.$cv_troll = $troll; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$5$1', []);
}

let $WndBlacksmith$5: any = null;
/** An anonymous class (WndBlacksmith.java:143). */
function WndBlacksmith$5(): any {
  return $WndBlacksmith$5 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (WndBlacksmith$5$1())().$o(this).$c(this.$cv_troll, this.$cv_hero)._WndOptions$Image$String$String$StringArr(this.$cv_troll.sprite(), Messages.titleCase(this.$cv_troll.name()), Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'smith_verify', []), [Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'smith_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'smith_no', [])]));
    }
    $c($troll, $hero): this {
      this.$cv_troll = $troll; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$5', []);
}

let $WndBlacksmith$6$1: any = null;
/** An anonymous class (WndBlacksmith.java:177). */
function WndBlacksmith$6$1(): any {
  return $WndBlacksmith$6$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        new Gold()._Gold$int(Blacksmith$Quest.favor).doPickUp$Hero$int(Dungeon.hero, Dungeon.hero.pos);
        Blacksmith$Quest.favor = 0;
        this.$outer.$outer.hide();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$6$1', []);
}

let $WndBlacksmith$6: any = null;
/** An anonymous class (WndBlacksmith.java:168). */
function WndBlacksmith$6(): any {
  return $WndBlacksmith$6 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (WndBlacksmith$6$1())().$o(this)._WndOptions$Image$String$String$StringArr(this.$cv_troll.sprite(), Messages.titleCase(this.$cv_troll.name()), Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'cashout_verify', [Blacksmith$Quest.favor]), [Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'cashout_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith), 'cashout_no', [])]));
    }
    $c($troll): this {
      this.$cv_troll = $troll;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$6', []);
}

let $WndBlacksmith$WndReforge$4: any = null;
/** An anonymous class (WndBlacksmith.java:319). */
function WndBlacksmith$WndReforge$4(): any {
  return $WndBlacksmith$WndReforge$4 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndBlacksmith$WndReforge), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(Belongings$Backpack);
    }
    itemSelectable(item: Item): boolean {
      return item.isIdentified() && !item.cursed && item.isUpgradable();
    }
    onSelect(item: Item): void {
      if (item != null && this.$outer.btnPressed.parent != null) {
        this.$outer.btnPressed.item$Item(item);
        let item1 = this.$outer.btnItem1.item$();
        let item2 = this.$outer.btnItem2.item$();
        if (item1 == null || item2 == null) {
          this.$outer.btnReforge.enable(false);
        } else if (item1.getClass() !== item2.getClass()) {
          this.$outer.btnReforge.enable(false);
        } else if (item1 === item2) {
          this.$outer.btnReforge.enable(false);
        } else {
          this.$outer.btnReforge.enable(true);
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndReforge$4', []);
}

let $WndBlacksmith$WndReforge$1: any = null;
/** An anonymous class (WndBlacksmith.java:235). */
function WndBlacksmith$WndReforge$1(): any {
  return $WndBlacksmith$WndReforge$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      this.$outer.btnPressed = this.$outer.btnItem1;
      GameScene.selectItem(this.$outer.itemSelector);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndReforge$1', []);
}

let $WndBlacksmith$WndReforge$2: any = null;
/** An anonymous class (WndBlacksmith.java:245). */
function WndBlacksmith$WndReforge$2(): any {
  return $WndBlacksmith$WndReforge$2 ??= $J.local(class extends ItemButton {
    onClick(): void {
      this.$outer.btnPressed = this.$outer.btnItem2;
      GameScene.selectItem(this.$outer.itemSelector);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndReforge$2', []);
}

let $WndBlacksmith$WndReforge$3: any = null;
/** An anonymous class (WndBlacksmith.java:255). */
function WndBlacksmith$WndReforge$3(): any {
  return $WndBlacksmith$WndReforge$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      let first: Item;
      let second: Item;
      if (this.$outer.btnItem1.item$().trueLevel() >= this.$outer.btnItem2.item$().trueLevel()) {
        first = this.$outer.btnItem1.item$();
        second = this.$outer.btnItem2.item$();
      } else {
        first = this.$outer.btnItem2.item$();
        second = this.$outer.btnItem1.item$();
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.EVOKE);
      ScrollOfUpgrade.upgrade(Dungeon.hero);
      Item.evoke(Dungeon.hero);
      if (second.isEquipped(Dungeon.hero)) {
        (second).doUnequip$Hero$boolean(Dungeon.hero, false);
      }
      second.detachAll(Dungeon.hero.belongings.backpack);
      if (second instanceof Armor) {
        let seal = (second).checkSeal();
        if (seal != null) {
          Dungeon.level.drop(seal, Dungeon.hero.pos);
        }
      } else if (second instanceof MissileWeapon) {
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds.put((second).setID, 2147483647);
      }
      if (first instanceof Weapon && (first).hasGoodEnchant()) {
        (first).upgrade$boolean(true);
      } else if (first instanceof Armor && (first).hasGoodGlyph()) {
        (first).upgrade$boolean(true);
      } else {
        first.upgrade$();
      }
      Badges.validateItemLevelAquired(first);
      Item.updateQuickslot();
      Blacksmith$Quest.favor = (Blacksmith$Quest.favor - (500 + Math.imul(1000, Blacksmith$Quest.reforges))) | 0;
      Blacksmith$Quest.reforges++;
      if (!Blacksmith$Quest.rewardsAvailable()) {
        Notes.remove$Landmark(Notes$Landmark.TROLL);
      }
      this.$outer.hide();
      if (this.$cv_wndParent != null) {
        this.$cv_wndParent.hide();
      }
    }
    $c($wndParent): this {
      this.$cv_wndParent = $wndParent;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndReforge$3', []);
}

let $WndBlacksmith$WndSmith$1: any = null;
/** An anonymous class (WndBlacksmith.java:484). */
function WndBlacksmith$WndSmith$1(): any {
  return $WndBlacksmith$WndSmith$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      GameScene.show(new WndBlacksmith$WndSmith$RewardWindow().$o(this.$outer)._WndBlacksmith$WndSmith$RewardWindow(this.$cv_troll, this.$cv_hero, this.item$()));
    }
    $c($troll, $hero): this {
      this.$cv_troll = $troll; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndSmith$1', []);
}

let $WndBlacksmith$WndSmith$RewardWindow$1: any = null;
/** An anonymous class (WndBlacksmith.java:512). */
function WndBlacksmith$WndSmith$RewardWindow$1(): any {
  return $WndBlacksmith$WndSmith$RewardWindow$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      if (this.$cv_item instanceof Weapon && Blacksmith$Quest.smithEnchant != null) {
        (this.$cv_item).enchant$Enchantment(Blacksmith$Quest.smithEnchant);
      } else if (this.$cv_item instanceof Armor && Blacksmith$Quest.smithGlyph != null) {
        (this.$cv_item).inscribe$Glyph(Blacksmith$Quest.smithGlyph);
      }
      this.$cv_item.identify$boolean(false);
      Sample.INSTANCE.play$Object(Assets$Sounds.EVOKE);
      Item.evoke(Dungeon.hero);
      if (this.$cv_item.doPickUp$Hero(Dungeon.hero)) {
        GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'you_now_have', [this.$cv_item.name()])), []);
      } else {
        Dungeon.level.drop(this.$cv_item, Dungeon.hero.pos).sprite_.drop$();
      }
      this.$outer.$outer.hide();
      Blacksmith$Quest.smithRewards = null;
      if (!Blacksmith$Quest.rewardsAvailable()) {
        Notes.remove$Landmark(Notes$Landmark.TROLL);
      }
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndSmith$RewardWindow$1', []);
}

let $WndBlacksmith$WndSmith$RewardWindow$2: any = null;
/** An anonymous class (WndBlacksmith.java:542). */
function WndBlacksmith$WndSmith$RewardWindow$2(): any {
  return $WndBlacksmith$WndSmith$RewardWindow$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndSmith$RewardWindow$2', []);
}

$J.define(WndBlacksmith, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero': '_WndBlacksmith' } });
$J.define(WndBlacksmith$WndReforge, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndReforge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith,com.shatteredpixel.shatteredpixeldungeon.ui.Window': '_WndBlacksmith$WndReforge' } });
$J.define(WndBlacksmith$HardenSelector, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$HardenSelector', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector', ctors: { '': '_WndBlacksmith$HardenSelector' }, inner: true });
$J.define(WndBlacksmith$UpgradeSelector, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$UpgradeSelector', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector', ctors: { '': '_WndBlacksmith$UpgradeSelector' }, inner: true });
$J.define(WndBlacksmith$WndSmith, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndSmith', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero': '_WndBlacksmith$WndSmith' } });
$J.define(WndBlacksmith$WndSmith$RewardWindow, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndSmith$RewardWindow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndBlacksmith$WndSmith$RewardWindow' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  MissileWeapon$UpgradedSetTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$UpgradedSetTracker');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndSadGhost = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
