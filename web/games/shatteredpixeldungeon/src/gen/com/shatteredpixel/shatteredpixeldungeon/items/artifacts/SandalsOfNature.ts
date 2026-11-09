// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/SandalsOfNature.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Dungeon, Actor, Invisibility, MagicImmune, Talent, CellEmitter, Splash, LeafParticle, Item, VelvetPouch, RingOfEnergy, Catalog, Ballistica, Messages, Blindweed$Seed, Earthroot$Seed, Fadeleaf$Seed, Firebloom$Seed, Icecap$Seed, Mageroyal$Seed, Plant$Seed, Rotberry$Seed, Sorrowmoss$Seed, Starflower$Seed, Stormvine$Seed, Sungrass$Seed, Swiftthistle$Seed, CellSelector$Listener, GameScene, ItemSprite$Glowing, ItemSpriteSheet, DungeonTilemap, GLog, WndBag$ItemSelector, Sample, PointF, Random, Reflection;

export class SandalsOfNature extends Artifact {
  static readonly AC_FEED: string = 'FEED';
  static readonly AC_ROOT: string = 'ROOT';
  seeds: ArrayList<JClass> = null;
  curSeedEffect: JClass = null;
  static seedColors: HashMap<JClass<Plant$Seed>, number> = null;
  static seedChargeReqs: HashMap<JClass<Plant$Seed>, number> = null;
  static readonly SEEDS: string = 'seeds';
  static readonly CUR_SEED_EFFECT: string = 'cur_seed_effect';
  itemSelector: WndBag$ItemSelector = null;
  cellSelector: CellSelector$Listener = null;
  _SandalsOfNature(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_SANDALS;
    this.levelCap = 3;
    this.charge_ = 0;
    this.chargeCap_ = 100;
    this.defaultAction_ = SandalsOfNature.AC_ROOT;
    this.seeds = new ArrayList();
    this.curSeedEffect = null;
    this.itemSelector = new (SandalsOfNature$1())().$o(this)._WndBag$ItemSelector();
    this.cellSelector = new (SandalsOfNature$2())().$o(this)._CellSelector$Listener();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return actions;
    }
    if (this.isEquipped(hero) && !this.cursed) {
      actions.add(SandalsOfNature.AC_FEED);
    }
    if (this.isEquipped(hero) && !this.cursed && this.curSeedEffect != null && this.charge_ >= SandalsOfNature.seedChargeReqs.get(this.curSeedEffect)) {
      actions.add(SandalsOfNature.AC_ROOT);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, SandalsOfNature.AC_FEED)) {
      GameScene.selectItem(this.itemSelector);
    } else if ($J.equals(action, SandalsOfNature.AC_ROOT) && !this.cursed) {
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.curSeedEffect == null) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_effect', []), []);
      } else if (this.charge_ < SandalsOfNature.seedChargeReqs.get(this.curSeedEffect)) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'low_charge', []), []);
      } else {
        GameScene.selectCell(this.cellSelector);
      }
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new SandalsOfNature$Naturalism().$o(this)._SandalsOfNature$Naturalism();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.charge_ < this.chargeCap_) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(2 * amount));
      while (this.partialCharge >= 1) {
        this.charge_++;
        this.partialCharge--;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.charge_ = this.chargeCap_;
        this.partialCharge = 0;
      }
      Item.updateQuickslot();
    }
  }
  glowing(): ItemSprite$Glowing {
    if (this.curSeedEffect != null) {
      return new ItemSprite$Glowing()._ItemSprite$Glowing$int(SandalsOfNature.seedColors.get(this.curSeedEffect));
    }
    return null;
  }
  name(): string {
    if (this.level$() === 0) {
      return super.name();
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'name_' + this.level$(), []);
    }
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc_' + ((this.level$() + 1) | 0), []);
    if (this.isEquipped(Dungeon.hero)) {
      desc += '\n\n';
      if (!this.cursed) {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_hint', []);
      } else {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      }
    }
    if (this.curSeedEffect != null) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_ability', [Messages.titleCase(Messages.get$Class$String$ObjectArr(this.curSeedEffect, 'name', [])), SandalsOfNature.seedChargeReqs.get(this.curSeedEffect)]);
    }
    if (!this.seeds.isEmpty()) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_seeds', [this.seeds.size()]);
    }
    return desc;
  }
  upgrade$(): Item {
    if (this.level$() < 0) {
      this.image_ = ItemSpriteSheet.ARTIFACT_SANDALS;
    } else if (this.level$() === 0) {
      this.image_ = ItemSpriteSheet.ARTIFACT_SHOES;
    } else if (this.level$() === 1) {
      this.image_ = ItemSpriteSheet.ARTIFACT_BOOTS;
    } else if (this.level$() >= 2) {
      this.image_ = ItemSpriteSheet.ARTIFACT_GREAVES;
    }
    return super.upgrade$();
  }
  canUseSeed(item: Item): boolean {
    return item instanceof Plant$Seed && !this.seeds.contains(item.getClass()) && (this.level$() < 3 || this.curSeedEffect !== item.getClass());
  }
  resetForTrinity(visibleLevel: number): void {
    super.reset();
    this.curSeedEffect = null;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$ClassArr(SandalsOfNature.SEEDS, $J.toArrayInto(this.seeds.toArray(), $J.newArray(0, null)));
    bundle.put$String$Class(SandalsOfNature.CUR_SEED_EFFECT, this.curSeedEffect);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.seeds.clear();
    if (bundle.contains(SandalsOfNature.SEEDS) && bundle.getClassArray(SandalsOfNature.SEEDS) != null) {
      for (let seed of bundle.getClassArray(SandalsOfNature.SEEDS)) {
        if (seed != null) {
          this.seeds.add(seed);
        }
      }
    }
    this.curSeedEffect = bundle.getClass$String(SandalsOfNature.CUR_SEED_EFFECT);
    if (this.level$() === 1) {
      this.image_ = ItemSpriteSheet.ARTIFACT_SHOES;
    } else if (this.level$() === 2) {
      this.image_ = ItemSpriteSheet.ARTIFACT_BOOTS;
    } else if (this.level$() >= 3) {
      this.image_ = ItemSpriteSheet.ARTIFACT_GREAVES;
    }
  }
  static $clinit() {
    SandalsOfNature.seedColors = new HashMap();
    SandalsOfNature.seedColors.put($J.cls(Rotberry$Seed), 13369378);
    SandalsOfNature.seedColors.put($J.cls(Firebloom$Seed), 16744192);
    SandalsOfNature.seedColors.put($J.cls(Swiftthistle$Seed), 13417216);
    SandalsOfNature.seedColors.put($J.cls(Sungrass$Seed), 3073582);
    SandalsOfNature.seedColors.put($J.cls(Icecap$Seed), 6730751);
    SandalsOfNature.seedColors.put($J.cls(Stormvine$Seed), 1662336);
    SandalsOfNature.seedColors.put($J.cls(Sorrowmoss$Seed), 10575077);
    SandalsOfNature.seedColors.put($J.cls(Mageroyal$Seed), 16731346);
    SandalsOfNature.seedColors.put($J.cls(Earthroot$Seed), 6772797);
    SandalsOfNature.seedColors.put($J.cls(Starflower$Seed), 4210752);
    SandalsOfNature.seedColors.put($J.cls(Fadeleaf$Seed), 9542041);
    SandalsOfNature.seedColors.put($J.cls(Blindweed$Seed), 14277081);
    SandalsOfNature.seedChargeReqs = new HashMap();
    SandalsOfNature.seedChargeReqs.put($J.cls(Rotberry$Seed), 8);
    SandalsOfNature.seedChargeReqs.put($J.cls(Firebloom$Seed), 20);
    SandalsOfNature.seedChargeReqs.put($J.cls(Swiftthistle$Seed), 20);
    SandalsOfNature.seedChargeReqs.put($J.cls(Sungrass$Seed), 80);
    SandalsOfNature.seedChargeReqs.put($J.cls(Icecap$Seed), 20);
    SandalsOfNature.seedChargeReqs.put($J.cls(Stormvine$Seed), 20);
    SandalsOfNature.seedChargeReqs.put($J.cls(Sorrowmoss$Seed), 20);
    SandalsOfNature.seedChargeReqs.put($J.cls(Mageroyal$Seed), 12);
    SandalsOfNature.seedChargeReqs.put($J.cls(Earthroot$Seed), 40);
    SandalsOfNature.seedChargeReqs.put($J.cls(Starflower$Seed), 40);
    SandalsOfNature.seedChargeReqs.put($J.cls(Fadeleaf$Seed), 12);
    SandalsOfNature.seedChargeReqs.put($J.cls(Blindweed$Seed), 12);
  }
}

export class SandalsOfNature$Naturalism extends Artifact$ArtifactBuff {
  _SandalsOfNature$Naturalism(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  charge$(): void {
    if (this.$outer.cursed || this.target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.$outer.charge_ < this.$outer.chargeCap_) {
      let chargeGain = Math.fround((Math.fround(3 + Math.imul(2, this.$outer.level$()))) / 6);
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + Math.max(0, chargeGain));
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.charge_++;
        this.$outer.partialCharge--;
      }
      this.$outer.charge_ = Math.min(this.$outer.charge_, this.$outer.chargeCap_);
      Item.updateQuickslot();
    }
  }
}

let $SandalsOfNature$1: any = null;
/** An anonymous class (SandalsOfNature.java:289). */
function SandalsOfNature$1(): any {
  return $SandalsOfNature$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(SandalsOfNature), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(VelvetPouch);
    }
    itemSelectable(item: Item): boolean {
      return this.$outer.canUseSeed(item);
    }
    onSelect(item: Item): void {
      if (item != null && item instanceof Plant$Seed) {
        if (this.$outer.level$() < 3) {
          this.$outer.seeds.add(0, item.getClass());
        }
        this.$outer.curSeedEffect = item.getClass();
        let hero = Dungeon.hero;
        hero.sprite_.operate$int(hero.pos);
        Sample.INSTANCE.play$Object(Assets$Sounds.PLANT);
        hero.busy();
        hero.spend(Actor.TICK);
        if (this.$outer.seeds.size() >= ((3 + (Math.imul(this.$outer.level$(), 3))) | 0)) {
          this.$outer.seeds.clear();
          this.$outer.upgrade$();
          Catalog.countUses($J.cls(SandalsOfNature), this.$outer.level$() === 3 ? 4 : 3);
          if (this.$outer.level$() >= 1 && this.$outer.level$() <= 3) {
            GLog.p(Messages.get$Class$String$ObjectArr($J.cls(SandalsOfNature), 'levelup', []), []);
          }
        } else {
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SandalsOfNature), 'absorb_seed', []), []);
        }
        item.detach(hero.belongings.backpack);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature$1', []);
}

let $SandalsOfNature$2: any = null;
/** An anonymous class (SandalsOfNature.java:333). */
function SandalsOfNature$2(): any {
  return $SandalsOfNature$2 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (cell != null) {
        if (!Dungeon.level.heroFOV[cell] || Dungeon.level.distance(Item.curUser.pos, cell) > 3) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SandalsOfNature), 'out_of_range', []), []);
        } else {
          let aim = new Ballistica()._Ballistica(Item.curUser.pos, cell, Ballistica.STOP_TARGET);
          for (const $it0 = aim.subPath(0, aim.dist).iterator(); $it0.hasNext(); ) {
            let c = $it0.next();
            CellEmitter.get(c).burst(LeafParticle.GENERAL, 6);
          }
          Splash.at$PointF$float$float$int$int(DungeonTilemap.tileCenterToWorld(cell), Math.fround(Math.fround(-PointF.PI) / 2), Math.fround(PointF.PI / 2), SandalsOfNature.seedColors.get(this.$outer.curSeedEffect), 6);
          Invisibility.dispel$Char(Item.curUser);
          let plant = (Reflection.newInstance(this.$outer.curSeedEffect)).couch(cell, null);
          plant.activate(Actor.findChar(cell));
          Sample.INSTANCE.play$Object(Assets$Sounds.PLANT);
          Sample.INSTANCE.playDelayed$Object$float$float$float(Assets$Sounds.TRAMPLE, 0.25, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
          if (Actor.findChar(cell) != null) {
            Artifact.artifactProc(Actor.findChar(cell), this.$outer.visiblyUpgraded(), SandalsOfNature.seedChargeReqs.get(this.$outer.curSeedEffect));
          }
          this.$outer.charge_ = (this.$outer.charge_ - SandalsOfNature.seedChargeReqs.get(this.$outer.curSeedEffect)) | 0;
          Talent.onArtifactUsed(Dungeon.hero);
          Item.updateQuickslot();
          Item.curUser.spendAndNext(1);
        }
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(SandalsOfNature), 'prompt_target', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature$2', []);
}

$J.define(SandalsOfNature, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_SandalsOfNature' }, meths: { 'upgrade()': 'upgrade$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['seedColors', 'seedChargeReqs'] });
$J.define(SandalsOfNature$Naturalism, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature$Naturalism', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_SandalsOfNature$Naturalism' }, meths: { 'charge()': 'charge$' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Blindweed$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed$Seed');
  Earthroot$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Seed');
  Fadeleaf$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf$Seed');
  Firebloom$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed');
  Icecap$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap$Seed');
  Mageroyal$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal$Seed');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  Sorrowmoss$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss$Seed');
  Starflower$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed');
  Stormvine$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine$Seed');
  Sungrass$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Seed');
  Swiftthistle$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$Seed');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
