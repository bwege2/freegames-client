// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Plant.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { Item } from '../items/Item.ts';

let Assets$Sounds, Challenges, Dungeon, Actor, Barkskin, Hero, HeroSubClass, Talent, CellEmitter, LeafParticle, WandOfRegrowth$Lotus, Bestiary, Catalog, Level, Terrain, Messages, Rotberry$Seed, GameScene, ItemSpriteSheet, Sample, PathFinder, Random, Reflection;

export class Plant extends JObject {
  image_: number = 0;
  pos: number = 0;
  seedClass: JClass<Plant$Seed> = null;
  static readonly POS: string = 'pos';
  _Plant(): this {
    return this;
  }
  trigger(): void {
    let ch = Actor.findChar(this.pos);
    if (ch instanceof Hero) {
      (ch).interrupt();
      if ((ch).hasTalent(Talent.BARKSKIN)) {
        Barkskin.conditionallyAppend(ch, $J.idiv((Math.imul((ch).lvl, (ch).pointsInTalent(Talent.BARKSKIN))), 3), 1);
      }
    }
    if (Dungeon.level.heroFOV[this.pos] && Dungeon.hero.hasTalent(Talent.NATURES_AID)) {
      Barkskin.conditionallyAppend(Dungeon.hero, 2, (1 + Math.imul(2, (Dungeon.hero.pointsInTalent(Talent.NATURES_AID)))) | 0);
    }
    this.wither();
    this.activate(ch);
    Bestiary.setSeen($J.getClass(this));
    Bestiary.countEncounter($J.getClass(this));
  }
  wither(): void {
    Dungeon.level.uproot(this.pos);
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).burst(LeafParticle.GENERAL, 6);
    }
    let seedChance = 0;
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (c instanceof WandOfRegrowth$Lotus) {
        let l = c;
        if (l.inRange(this.pos)) {
          seedChance = Math.max(seedChance, l.seedPreservation());
        }
      }
    }
    if (Random.Float$() < seedChance) {
      if (this.seedClass != null && this.seedClass !== $J.cls(Rotberry$Seed)) {
        Dungeon.level.drop(Reflection.newInstance(this.seedClass), this.pos).sprite_.drop$();
      }
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    this.pos = bundle.getInt(Plant.POS);
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Plant.POS, this.pos);
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (Dungeon.hero != null && Dungeon.hero.subClass === HeroSubClass.WARDEN) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'warden_desc', []);
    }
    return desc;
  }
}

export class Plant$Seed extends Item {
  static readonly AC_PLANT: string = 'PLANT';
  static readonly TIME_TO_PLANT: number = 1;
  plantClass: JClass<Plant> = null;
  _Plant$Seed(): this {
    this._Item();
    this.stackable = true;
    this.defaultAction_ = Item.AC_THROW;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Plant$Seed.AC_PLANT);
    return actions;
  }
  onThrow(cell: number): void {
    if (Dungeon.level.map_[cell] === Terrain.ALCHEMY || Dungeon.level.pit[cell] || Dungeon.level.traps.get(cell) != null || Dungeon.isChallenged(Challenges.NO_HERBALISM)) {
      super.onThrow(cell);
    } else {
      Catalog.countUse($J.getClass(this));
      Dungeon.level.plant(this, cell);
      if (Dungeon.hero.subClass === HeroSubClass.WARDEN) {
        for (let i of PathFinder.NEIGHBOURS8) {
          let c = Dungeon.level.map_[(cell + i) | 0];
          if (c === Terrain.EMPTY || c === Terrain.EMPTY_DECO || c === Terrain.EMBERS || c === Terrain.GRASS) {
            Level.set$int$int((cell + i) | 0, Terrain.FURROWED_GRASS);
            GameScene.updateMap$int((cell + i) | 0);
            (CellEmitter.get((cell + i) | 0)).burst(LeafParticle.LEVEL_SPECIFIC, 4);
          }
        }
      }
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Plant$Seed.AC_PLANT)) {
      hero.busy();
      (this.detach(hero.belongings.backpack)).onThrow(hero.pos);
      hero.spend(Plant$Seed.TIME_TO_PLANT);
      hero.sprite_.operate$int(hero.pos);
    }
  }
  couch(pos: number, level: Level): Plant {
    if (level != null && level.heroFOV != null && level.heroFOV[pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.PLANT);
    }
    let plant = Reflection.newInstance(this.plantClass);
    plant.pos = pos;
    return plant;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(10, this.quantity);
  }
  energyVal(): number {
    return Math.imul(2, this.quantity);
  }
  desc(): string {
    let desc = Messages.get$Class$String$ObjectArr(this.plantClass, 'desc', []);
    if (Dungeon.hero != null && Dungeon.hero.subClass === HeroSubClass.WARDEN) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr(this.plantClass, 'warden_desc', []);
    }
    return desc;
  }
  info(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(Plant$Seed), 'info', [super.info()]);
  }
}

export class Plant$Seed$PlaceHolder extends Plant$Seed {
  _Plant$Seed$PlaceHolder(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_HOLDER;
    return this;
  }
  isSimilar(item: Item): boolean {
    return item instanceof Plant$Seed;
  }
  info(): string {
    return '';
  }
}

$J.define(Plant, 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Plant' } });
$J.define(Plant$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Plant$Seed' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(Plant$Seed$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Plant$Seed$PlaceHolder' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Barkskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  WandOfRegrowth$Lotus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
