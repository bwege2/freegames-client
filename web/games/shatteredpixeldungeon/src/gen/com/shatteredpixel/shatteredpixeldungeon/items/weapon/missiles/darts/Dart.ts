// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/Dart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { MissileWeapon } from '../MissileWeapon.ts';

let Assets$Sounds, Dungeon, Actor, Char, MagicImmune, Item, VelvetPouch, Crossbow, Crossbow$ChargedShot, MeleeWeapon, TippedDart, Messages, Plant$Seed, GameScene, ItemSprite, ItemSpriteSheet, WndBag$ItemSelector, WndOptions, Sample, PathFinder, Random;

export class Dart extends MissileWeapon {
  static readonly AC_TIP: string = 'TIP';
  static bow: Crossbow = null;
  processingChargedShot: boolean = false;
  chargedShotPos: number = 0;
  itemSelector: WndBag$ItemSelector = null;
  _Dart(): this {
    this._MissileWeapon();
    this.levelKnown = true;
    this.image_ = ItemSpriteSheet.DART;
    this.hitSound_ = Assets$Sounds.HIT_ARROW;
    this.hitSoundPitch = Math.fround(1.3);
    this.tier_ = 1;
    this.baseUses = 1000;
    this.setID = 0n;
    this.processingChargedShot = false;
    this.itemSelector = new (Dart$2())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Dart.AC_TIP);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Dart.AC_TIP)) {
      GameScene.selectItem(this.itemSelector);
    }
  }
  min$int(lvl: number): number {
    if (Dart.bow != null) {
      if (!(this instanceof TippedDart) && Dungeon.hero.buff($J.cls(Crossbow$ChargedShot)) != null) {
        return (Dart.bow.dartMin$() + 4 + Dart.bow.buffedLvl() + lvl) | 0;
      } else {
        return (Dart.bow.dartMin$() + lvl) | 0;
      }
    } else {
      return (1 + lvl) | 0;
    }
  }
  max$int(lvl: number): number {
    if (Dart.bow != null) {
      if (!(this instanceof TippedDart) && Dungeon.hero.buff($J.cls(Crossbow$ChargedShot)) != null) {
        return (Dart.bow.dartMax$() + 4 + Dart.bow.buffedLvl() + Math.imul(2, lvl)) | 0;
      } else {
        return (Dart.bow.dartMax$() + Math.imul(2, lvl)) | 0;
      }
    } else {
      return (2 + Math.imul(2, lvl)) | 0;
    }
  }
  updateCrossbow(): void {
    if (Dungeon.hero == null) {
      Dart.bow = null;
    } else if (Dungeon.hero.belongings.weapon() instanceof Crossbow) {
      Dart.bow = Dungeon.hero.belongings.weapon();
    } else if (Dungeon.hero.belongings.secondWep() instanceof Crossbow) {
      Dart.bow = Dungeon.hero.belongings.secondWep();
    } else {
      Dart.bow = null;
    }
  }
  crossbowHasEnchant(owner: Char): boolean {
    return Dart.bow != null && Dart.bow.enchantment != null && owner.buff($J.cls(MagicImmune)) == null;
  }
  hasEnchant(type$: JClass<Weapon$Enchantment>, owner: Char): boolean {
    if (Dart.bow != null && Dart.bow.hasEnchant(type$, owner)) {
      return true;
    } else {
      return super.hasEnchant(type$, owner);
    }
  }
  accuracyFactor(owner: Char, target: Char): number {
    if (Dart.bow != null && owner.buff($J.cls(Crossbow$ChargedShot)) != null) {
      return Math.fround(Char.INFINITE_ACCURACY);
    } else {
      return super.accuracyFactor(owner, target);
    }
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (Dart.bow != null && !this.processingChargedShot) {
      damage = Dart.bow.proc(attacker, defender, damage);
    }
    let dmg = super.proc(attacker, defender, damage);
    if (!this.processingChargedShot) {
      this.processChargedShot(defender, damage);
    }
    return dmg;
  }
  throwPos(user: Hero, dst: number): number {
    this.updateCrossbow();
    return super.throwPos(user, dst);
  }
  onThrow(cell: number): void {
    this.updateCrossbow();
    this.chargedShotPos = cell;
    super.onThrow(cell);
  }
  processChargedShot(target: Char, dmg: number): void {
    this.processingChargedShot = true;
    if (this.chargedShotPos !== -1 && Dart.bow != null && Dungeon.hero.buff($J.cls(Crossbow$ChargedShot)) != null) {
      PathFinder.buildDistanceMap$int$booleanArr$int(this.chargedShotPos, Dungeon.level.passable, 3);
      let distance = PathFinder.distance.slice();
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch === target) {
          Actor.add$Actor(new (Dart$1())().$o(this).$c(ch)._Actor().$init_anon());
        } else if (distance[ch.pos] !== 2147483647) {
          this.proc(Dungeon.hero, ch, dmg);
        }
      }
    }
    this.chargedShotPos = -1;
    this.processingChargedShot = false;
  }
  decrementDurability(): void {
    super.decrementDurability();
    if (Dungeon.hero.buff($J.cls(Crossbow$ChargedShot)) != null) {
      Dungeon.hero.buff($J.cls(Crossbow$ChargedShot)).detach();
    }
  }
  throwSound(): void {
    this.updateCrossbow();
    if (Dart.bow != null) {
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.ATK_CROSSBOW, 1, Random.Float$float$float(Math.fround(0.87), Math.fround(1.15)));
    } else {
      super.throwSound();
    }
  }
  info(): string {
    this.updateCrossbow();
    if (Dart.bow != null && !Dart.bow.isIdentified()) {
      let realBow = Dart.bow;
      Dart.bow = new Crossbow()._Crossbow();
      let info = super.info();
      Dart.bow = realBow;
      return info;
    } else {
      return super.info();
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  defaultQuantity(): number {
    return 2;
  }
  value(): number {
    return $J.roundf(Math.fround(super.value() / 2));
  }
}

let $Dart$2$1: any = null;
/** An anonymous class (Dart.java:319). */
function Dart$2$1(): any {
  return $Dart$2$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0 && this.$cv_options.length === 3) {
        if (this.$cv_item.quantity$() <= this.$cv_maxSeedsToUse) {
          this.$cv_item.detachAll(Item.curUser.belongings.backpack);
        } else {
          this.$cv_item.quantity$int((this.$cv_item.quantity$() - this.$cv_maxSeedsToUse) | 0);
        }
        if (this.$cv_maxToTip < Item.curItem.quantity$()) {
          Item.curItem.quantity$int((Item.curItem.quantity$() - this.$cv_maxToTip) | 0);
        } else {
          Item.curItem.detachAll(Item.curUser.belongings.backpack);
        }
        let newDart = TippedDart.getTipped(this.$cv_item, this.$cv_maxToTip);
        if (!newDart.collect$()) {
          Dungeon.level.drop(newDart, Item.curUser.pos).sprite_.drop$();
        }
        Item.curUser.spend(1);
        Item.curUser.busy();
        Item.curUser.sprite_.operate$int(Item.curUser.pos);
      } else if ((index === 1 && this.$cv_options.length === 3) || (index === 0 && this.$cv_options.length === 2)) {
        this.$cv_item.detach(Item.curUser.belongings.backpack);
        if (Item.curItem.quantity$() <= this.$cv_singleSeedDarts) {
          Item.curItem.detachAll(Item.curUser.belongings.backpack);
        } else {
          Item.curItem.quantity$int((Item.curItem.quantity$() - this.$cv_singleSeedDarts) | 0);
        }
        let newDart = TippedDart.getTipped(this.$cv_item, this.$cv_singleSeedDarts);
        if (!newDart.collect$()) {
          Dungeon.level.drop(newDart, Item.curUser.pos).sprite_.drop$();
        }
        Item.curUser.spend(1);
        Item.curUser.busy();
        Item.curUser.sprite_.operate$int(Item.curUser.pos);
      }
    }
    $c($options, $item, $maxSeedsToUse, $maxToTip, $singleSeedDarts): this {
      this.$cv_options = $options; this.$cv_item = $item; this.$cv_maxSeedsToUse = $maxSeedsToUse; this.$cv_maxToTip = $maxToTip; this.$cv_singleSeedDarts = $singleSeedDarts;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart$2$1', []);
}

let $Dart$2: any = null;
/** An anonymous class (Dart.java:266). */
function Dart$2(): any {
  return $Dart$2 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Dart), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(VelvetPouch);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Plant$Seed;
    }
    onSelect(item: Item): void {
      if (item == null) {
        return;
      }
      let maxToTip = Math.min(Item.curItem.quantity$(), Math.imul(item.quantity$(), 2));
      let maxSeedsToUse = $J.idiv(((maxToTip + 1) | 0), 2);
      let singleSeedDarts: number;
      let options: string[];
      if (Item.curItem.quantity$() === 1) {
        singleSeedDarts = 1;
        options = [Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_one', []), Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_cancel', [])];
      } else {
        singleSeedDarts = 2;
        if (maxToTip <= 2) {
          options = [Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_two', []), Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_cancel', [])];
        } else {
          options = [Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_all', [maxToTip, maxSeedsToUse]), Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_two', []), Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_cancel', [])];
        }
      }
      let tipResult = TippedDart.getTipped(item, 1);
      GameScene.show(new (Dart$2$1())().$o(this).$c(options, item, maxSeedsToUse, maxToTip, singleSeedDarts)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(item), Messages.titleCase(item.name()), Messages.get$Class$String$ObjectArr($J.cls(Dart), 'tip_desc', [tipResult.name()]) + '\n\n' + tipResult.desc(), options));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart$2', []);
}

let $Dart$1: any = null;
/** An anonymous class (Dart.java:193). */
function Dart$1(): any {
  return $Dart$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      if (!this.$cv_ch.isAlive()) {
        MeleeWeapon.onAbilityKill(Dungeon.hero, this.$cv_ch);
      }
      Actor.remove(this);
      return true;
    }
    $c($ch): this {
      this.$cv_ch = $ch;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart$1', []);
}

$J.define(Dart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_Dart' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  Crossbow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow');
  Crossbow$ChargedShot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow$ChargedShot');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
