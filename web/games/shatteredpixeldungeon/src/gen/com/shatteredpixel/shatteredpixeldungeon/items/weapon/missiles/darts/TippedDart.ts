// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/TippedDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, LinkedHashMap } from '../../../../../../../../jre/index.ts';
import { Dart } from './Dart.ts';

let Dungeon, Actor, Char$Alignment, Buff, PinCushion, Talent, Generator, Generator$Category, Item, WandOfRegrowth$Lotus, Crossbow$ChargedShot, MissileWeapon, AdrenalineDart, BlindingDart, ChillingDart, CleansingDart, DisplacingDart, HealingDart, HolyDart, IncendiaryDart, ParalyticDart, PoisonDart, RotDart, ShockingDart, Catalog, Messages, Blindweed$Seed, Earthroot$Seed, Fadeleaf$Seed, Firebloom$Seed, Icecap$Seed, Mageroyal$Seed, Rotberry$Seed, Sorrowmoss$Seed, Starflower$Seed, Stormvine$Seed, Sungrass$Seed, Swiftthistle$Seed, GameScene, ItemSprite, WndOptions, Reflection;

export class TippedDart extends Dart {
  static readonly AC_CLEAN: string = 'CLEAN';
  static lostDarts: number = 0;
  static targetPos: number = 0;
  static types: LinkedHashMap<JClass<Plant$Seed>, JClass<TippedDart>> = null;
  _TippedDart(): this {
    this._Dart();
    this.tier_ = 2;
    this.baseUses = 1;
    this.useRoundingInDurabilityCalc = false;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.remove(Dart.AC_TIP);
    actions.add(TippedDart.AC_CLEAN);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, TippedDart.AC_CLEAN)) {
      let options: string[];
      if (this.quantity$() > 1) {
        options = [Messages.get$Object$String$ObjectArr(this, 'clean_all', []), Messages.get$Object$String$ObjectArr(this, 'clean_one', []), Messages.get$Object$String$ObjectArr(this, 'cancel', [])];
      } else {
        options = [Messages.get$Object$String$ObjectArr(this, 'clean_one', []), Messages.get$Object$String$ObjectArr(this, 'cancel', [])];
      }
      GameScene.show(new (TippedDart$1())().$o(this).$c(hero)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.name()), Messages.get$Object$String$ObjectArr(this, 'clean_desc', []), options));
    }
  }
  rangedHit(enemy: Char, cell: number): void {
    TippedDart.targetPos = cell;
    super.rangedHit(enemy, cell);
    if (this.durability <= Math.fround(0) && !this.spawnedForEffect) {
      let d = new Dart()._Dart();
      d.quantity$int(1);
      Catalog.countUse($J.getClass(this));
      if (this.sticky && enemy != null && enemy.isAlive() && enemy.alignment !== Char$Alignment.ALLY) {
        let p = Buff.affect$Char$Class(enemy, $J.cls(PinCushion));
        if (p.target === enemy) {
          p.stick(d);
          return;
        }
      }
      Dungeon.level.drop(d, enemy.pos).sprite_.drop$();
    }
  }
  merge(other: Item): Item {
    let total = (this.quantity$() + other.quantity$()) | 0;
    super.merge(other);
    let extra = (total - this.quantity$()) | 0;
    if (extra > 0) {
      TippedDart.lostDarts = (TippedDart.lostDarts + extra) | 0;
    }
    return this;
  }
  durabilityPerUse$int(level: number): number {
    let use = super.durabilityPerUse$int(level);
    if (Dungeon.hero != null) {
      use = Math.fround(use / ((1 + Dungeon.hero.pointsInTalent(Talent.DURABLE_TIPS)) | 0));
      let lotusPreserve = 0;
      if (TippedDart.targetPos !== -1) {
        for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
          let ch = $it0.next();
          if (ch instanceof WandOfRegrowth$Lotus) {
            let l = ch;
            if (l.inRange(TippedDart.targetPos)) {
              lotusPreserve = Math.max(lotusPreserve, l.seedPreservation());
            }
          }
        }
        TippedDart.targetPos = -1;
      }
      let p = Item.curUser == null ? Dungeon.hero.pos : Item.curUser.pos;
      for (const $it1 = Actor.chars().iterator(); $it1.hasNext(); ) {
        let ch = $it1.next();
        if (ch instanceof WandOfRegrowth$Lotus) {
          let l = ch;
          if (l.inRange(p)) {
            lotusPreserve = Math.max(lotusPreserve, l.seedPreservation());
          }
        }
      }
      use = Math.fround(use * (Math.fround(1 - lotusPreserve)));
    }
    let usages = Math.fround($J.roundf(Math.fround(MissileWeapon.MAX_DURABILITY / use)));
    if (Dart.bow != null && Dungeon.hero != null && Dungeon.hero.buff($J.cls(Crossbow$ChargedShot)) != null) {
      usages = Math.fround(usages + ((3 + Dart.bow.buffedLvl()) | 0));
    }
    if (usages >= 100) {
      return 0;
    }
    return Math.fround((Math.fround(MissileWeapon.MAX_DURABILITY / usages)) + Math.fround(0.001));
  }
  value(): number {
    return $J.roundf(Math.fround(7.5 * this.quantity));
  }
  static getTipped(s: Plant$Seed, quantity: number): TippedDart {
    return Reflection.newInstance(TippedDart.types.get(s.getClass())).quantity$int(quantity);
  }
  static randomTipped(quantity: number): TippedDart {
    let s: Plant$Seed;
    do {
      s = Generator.randomUsingDefaults$Category(Generator$Category.SEED);
    } while (!TippedDart.types.containsKey(s.getClass()));
    return TippedDart.getTipped(s, quantity);
  }
  static $clinit() {
    TippedDart.lostDarts = 0;
    TippedDart.targetPos = -1;
    TippedDart.types = new LinkedHashMap();
    TippedDart.types.put($J.cls(Rotberry$Seed), $J.cls(RotDart));
    TippedDart.types.put($J.cls(Sungrass$Seed), $J.cls(HealingDart));
    TippedDart.types.put($J.cls(Fadeleaf$Seed), $J.cls(DisplacingDart));
    TippedDart.types.put($J.cls(Icecap$Seed), $J.cls(ChillingDart));
    TippedDart.types.put($J.cls(Firebloom$Seed), $J.cls(IncendiaryDart));
    TippedDart.types.put($J.cls(Sorrowmoss$Seed), $J.cls(PoisonDart));
    TippedDart.types.put($J.cls(Swiftthistle$Seed), $J.cls(AdrenalineDart));
    TippedDart.types.put($J.cls(Blindweed$Seed), $J.cls(BlindingDart));
    TippedDart.types.put($J.cls(Stormvine$Seed), $J.cls(ShockingDart));
    TippedDart.types.put($J.cls(Earthroot$Seed), $J.cls(ParalyticDart));
    TippedDart.types.put($J.cls(Mageroyal$Seed), $J.cls(CleansingDart));
    TippedDart.types.put($J.cls(Starflower$Seed), $J.cls(HolyDart));
  }
}

let $TippedDart$1: any = null;
/** An anonymous class (TippedDart.java:98). */
function TippedDart$1(): any {
  return $TippedDart$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.detachAll(this.$cv_hero.belongings.backpack);
        new Dart()._Dart().quantity$int(this.$outer.quantity).collect$();
        this.$cv_hero.spend(1);
        this.$cv_hero.busy();
        this.$cv_hero.sprite_.operate$int(this.$cv_hero.pos);
      } else if (index === 1 && this.$outer.quantity$() > 1) {
        this.$outer.detach(this.$cv_hero.belongings.backpack);
        if (!new Dart()._Dart().quantity$int(1).collect$()) {
          Dungeon.level.drop(new Dart()._Dart().quantity$int(1), this.$cv_hero.pos).sprite_.drop$();
        }
        this.$outer.durability = MissileWeapon.MAX_DURABILITY;
        this.$cv_hero.spend(1);
        this.$cv_hero.busy();
        this.$cv_hero.sprite_.operate$int(this.$cv_hero.pos);
      }
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart$1', []);
}

$J.define(TippedDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart', ctors: { '': '_TippedDart' }, meths: { 'durabilityPerUse(int)': 'durabilityPerUse$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['lostDarts', 'targetPos', 'types'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  WandOfRegrowth$Lotus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus');
  Crossbow$ChargedShot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow$ChargedShot');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  AdrenalineDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.AdrenalineDart');
  BlindingDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.BlindingDart');
  ChillingDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.ChillingDart');
  CleansingDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.CleansingDart');
  DisplacingDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.DisplacingDart');
  HealingDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.HealingDart');
  HolyDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.HolyDart');
  IncendiaryDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.IncendiaryDart');
  ParalyticDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.ParalyticDart');
  PoisonDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.PoisonDart');
  RotDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.RotDart');
  ShockingDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.ShockingDart');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Blindweed$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed$Seed');
  Earthroot$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Seed');
  Fadeleaf$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf$Seed');
  Firebloom$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed');
  Icecap$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap$Seed');
  Mageroyal$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal$Seed');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  Sorrowmoss$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss$Seed');
  Starflower$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed');
  Stormvine$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine$Seed');
  Sungrass$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Seed');
  Swiftthistle$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
