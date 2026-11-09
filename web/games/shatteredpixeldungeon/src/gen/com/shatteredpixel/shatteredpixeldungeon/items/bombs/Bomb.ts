// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/Bomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, LinkedHashMap } from '../../../../../../jre/index.ts';
import { Item } from '../Item.ts';
import { Actor } from '../../actors/Actor.ts';
import { Recipe } from '../Recipe.ts';

let Assets$Sounds, Badges, Dungeon, SPDSettings, CellEmitter, BlastParticle, SmokeParticle, ArcaneBomb, Firebomb, FlashBangBomb, FrostBomb, HolyBomb, Noisemaker, RegrowthBomb, ShrapnelBomb, SmokeBomb, WoollyBomb, PotionOfFrost, PotionOfHealing, PotionOfInvisibility, PotionOfLiquidFlame, GooBlob, MetalShard, ScrollOfMirrorImage, ScrollOfRage, ScrollOfRecharging, ScrollOfRemoveCurse, Catalog, Languages, Messages, GameScene, CharSprite, ItemSprite$Glowing, ItemSpriteSheet, GLog, Sample, BArray, PathFinder, Random, Reflection;

export class Bomb extends Item {
  fuse: Bomb$Fuse = null;
  static lightingFuse: boolean = false;
  static readonly AC_LIGHTTHROW: string = 'LIGHTTHROW';
  static readonly FUSE: string = 'fuse';
  _Bomb(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.BOMB;
    this.defaultAction_ = Bomb.AC_LIGHTTHROW;
    this.usesTargeting_ = true;
    this.stackable = true;
    return this;
  }
  isSimilar(item: Item): boolean {
    return super.isSimilar(item) && this.fuse === (item).fuse;
  }
  explodesDestructively(): boolean {
    return true;
  }
  explosionRange(): number {
    return 1;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Bomb.AC_LIGHTTHROW);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    if ($J.equals(action, Bomb.AC_LIGHTTHROW)) {
      Bomb.lightingFuse = true;
      action = Item.AC_THROW;
    } else {
      Bomb.lightingFuse = false;
    }
    super.execute$Hero$String(hero, action);
  }
  createFuse(): Bomb$Fuse {
    return new Bomb$Fuse()._Bomb$Fuse();
  }
  onThrow(cell: number): void {
    if (!Dungeon.level.pit[cell] && Bomb.lightingFuse) {
      Actor.addDelayed(this.fuse = this.createFuse().ignite(this), 2);
    }
    super.onThrow(cell);
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (this.fuse != null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'snuff_fuse', []), []);
      this.fuse.snuff();
      this.fuse = null;
    }
    return super.doPickUp$Hero$int(hero, pos);
  }
  explode(cell: number): void {
    if (this.fuse != null) {
      this.fuse.snuff();
      this.fuse = null;
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
    if (this.explodesDestructively()) {
      let affectedCells = new ArrayList();
      let affectedChars = new ArrayList();
      if (Dungeon.level.heroFOV[cell]) {
        CellEmitter.center(cell).burst(BlastParticle.FACTORY, 30);
      }
      let terrainAffected = false;
      let explodable = $J.newArray(Dungeon.level.length(), false);
      BArray.not(Dungeon.level.solid, explodable);
      BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.flamable, explodable, explodable);
      PathFinder.buildDistanceMap$int$booleanArr$int(cell, explodable, this.explosionRange());
      for (let i = 0; i < PathFinder.distance.length; i++) {
        if (PathFinder.distance[i] !== 2147483647) {
          affectedCells.add(i);
          let ch = Actor.findChar(i);
          if (ch != null) {
            affectedChars.add(ch);
          }
        }
      }
      for (const $it0 = affectedCells.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        if (Dungeon.level.heroFOV[i]) {
          CellEmitter.get(i).burst(SmokeParticle.FACTORY, 4);
        }
        if (Dungeon.level.flamable[i]) {
          Dungeon.level.destroy(i);
          GameScene.updateMap$int(i);
          terrainAffected = true;
        }
        let heap = Dungeon.level.heaps.get(i);
        if (heap != null) {
          heap.explode();
        }
      }
      for (const $it1 = affectedChars.iterator(); $it1.hasNext(); ) {
        let ch = $it1.next();
        if (!ch.isAlive()) {
          continue;
        }
        let dmg = Random.NormalIntRange((4 + Dungeon.scalingDepth()) | 0, (12 + Math.imul(3, Dungeon.scalingDepth())) | 0);
        dmg = (dmg - ch.drRoll()) | 0;
        if (dmg > 0) {
          ch.damage(dmg, this);
        }
        if (ch === Dungeon.hero && !ch.isAlive()) {
          if (this instanceof Bomb$ConjuredBomb) {
            Badges.validateDeathFromFriendlyMagic();
          }
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
          Dungeon.fail(this);
        }
      }
      if (terrainAffected) {
        Dungeon.observe$();
      }
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  random(): Item {
    switch (Random.Int$int(4)) {
      case 0:
        return new Bomb$DoubleBomb()._Bomb$DoubleBomb();
      default:
        return this;
    }
  }
  glowing(): ItemSprite$Glowing {
    return this.fuse != null ? new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(16711680, Math.fround(0.6)) : null;
  }
  value(): number {
    return Math.imul(15, this.quantity);
  }
  desc(): string {
    let depth = Dungeon.hero == null ? 1 : Dungeon.scalingDepth();
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', [(4 + depth) | 0, (12 + Math.imul(3, depth)) | 0]);
    if (this.fuse == null) {
      return desc + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_fuse', []);
    } else {
      return desc + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_burning', []);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Bomb.FUSE, this.fuse);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Bomb.FUSE)) {
      Actor.add$Actor(this.fuse = (bundle.get$String(Bomb.FUSE)).ignite(this));
    }
  }
  static $clinit() {
    Bomb.lightingFuse = false;
  }
}

export class Bomb$ConjuredBomb extends Bomb {
  _Bomb$ConjuredBomb(): this {
    this._Bomb();
    return this;
  }
}

export class Bomb$Fuse extends Actor {
  bomb: Bomb = null;
  _Bomb$Fuse(): this {
    this._Actor();
    this.actPriority = (Actor.BLOB_PRIO + 1) | 0;
    return this;
  }
  ignite(bomb: Bomb): Bomb$Fuse {
    this.bomb = bomb;
    return this;
  }
  act(): boolean {
    if (this.bomb.fuse !== this) {
      this.snuff();
      return true;
    }
    for (const $it2 = Dungeon.level.heaps.valueList().iterator(); $it2.hasNext(); ) {
      let heap = $it2.next();
      if (heap.items_.contains(this.bomb)) {
        this.trigger(heap);
        return true;
      }
    }
    this.bomb.fuse = null;
    this.snuff();
    return true;
  }
  trigger(heap: Heap): void {
    heap.remove(this.bomb);
    Catalog.countUse(this.bomb.getClass());
    this.bomb.explode(heap.pos);
    this.snuff();
  }
  freeze(): boolean {
    this.bomb.fuse = null;
    this.snuff();
    return true;
  }
  snuff(): void {
    Actor.remove(this);
  }
}

export class Bomb$DoubleBomb extends Bomb {
  _Bomb$DoubleBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.DBL_BOMB;
    this.stackable = false;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    let bomb = new Bomb()._Bomb();
    bomb.quantity$int(2);
    if (bomb.doPickUp$Hero$int(hero, pos)) {
      if (SPDSettings.language$() === Languages.ENGLISH) {
        hero.sprite_.showStatus(CharSprite.NEUTRAL, '1+1 free!', []);
      }
      return true;
    }
    return false;
  }
}

export class Bomb$EnhanceBomb extends Recipe {
  static validIngredients: LinkedHashMap<JClass<Item>, JClass<Bomb>> = null;
  static bombCosts: HashMap<JClass<Bomb>, number> = null;
  _Bomb$EnhanceBomb(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    let bomb = false;
    let ingredient = false;
    for (const $it3 = ingredients.iterator(); $it3.hasNext(); ) {
      let i = $it3.next();
      if (!i.isIdentified()) {
        return false;
      }
      if ($J.equals(i.getClass(), $J.cls(Bomb))) {
        bomb = true;
      } else if (Bomb$EnhanceBomb.validIngredients.containsKey(i.getClass())) {
        ingredient = true;
      }
    }
    return bomb && ingredient;
  }
  cost(ingredients: ArrayList<Item>): number {
    for (const $it4 = ingredients.iterator(); $it4.hasNext(); ) {
      let i = $it4.next();
      if (Bomb$EnhanceBomb.validIngredients.containsKey(i.getClass())) {
        return (Bomb$EnhanceBomb.bombCosts.get(Bomb$EnhanceBomb.validIngredients.get(i.getClass())));
      }
    }
    return 0;
  }
  brew(ingredients: ArrayList<Item>): Item {
    let result = null;
    for (const $it5 = ingredients.iterator(); $it5.hasNext(); ) {
      let i = $it5.next();
      i.quantity$int((i.quantity$() - 1) | 0);
      if (Bomb$EnhanceBomb.validIngredients.containsKey(i.getClass())) {
        result = Reflection.newInstance(Bomb$EnhanceBomb.validIngredients.get(i.getClass()));
      }
    }
    if (result instanceof ArcaneBomb) {
      Catalog.countUse($J.cls(GooBlob));
    } else if (result instanceof ShrapnelBomb) {
      Catalog.countUse($J.cls(MetalShard));
    }
    return result;
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    for (const $it6 = ingredients.iterator(); $it6.hasNext(); ) {
      let i = $it6.next();
      if (Bomb$EnhanceBomb.validIngredients.containsKey(i.getClass())) {
        return Reflection.newInstance(Bomb$EnhanceBomb.validIngredients.get(i.getClass()));
      }
    }
    return null;
  }
  static $clinit() {
    Bomb$EnhanceBomb.validIngredients = new LinkedHashMap();
    Bomb$EnhanceBomb.validIngredients.put($J.cls(PotionOfFrost), $J.cls(FrostBomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(ScrollOfMirrorImage), $J.cls(WoollyBomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(PotionOfLiquidFlame), $J.cls(Firebomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(ScrollOfRage), $J.cls(Noisemaker));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(PotionOfInvisibility), $J.cls(SmokeBomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(ScrollOfRecharging), $J.cls(FlashBangBomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(PotionOfHealing), $J.cls(RegrowthBomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(ScrollOfRemoveCurse), $J.cls(HolyBomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(GooBlob), $J.cls(ArcaneBomb));
    Bomb$EnhanceBomb.validIngredients.put($J.cls(MetalShard), $J.cls(ShrapnelBomb));
    Bomb$EnhanceBomb.bombCosts = new HashMap();
    Bomb$EnhanceBomb.bombCosts.put($J.cls(FrostBomb), 0);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(WoollyBomb), 0);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(Firebomb), 1);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(Noisemaker), 1);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(SmokeBomb), 2);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(FlashBangBomb), 2);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(RegrowthBomb), 3);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(HolyBomb), 3);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(ArcaneBomb), 6);
    Bomb$EnhanceBomb.bombCosts.put($J.cls(ShrapnelBomb), 6);
  }
}

$J.define(Bomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Bomb' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['lightingFuse'] });
$J.define(Bomb$ConjuredBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$ConjuredBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_Bomb$ConjuredBomb' } });
$J.define(Bomb$Fuse, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$Fuse', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', ctors: { '': '_Bomb$Fuse' } });
$J.define(Bomb$DoubleBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$DoubleBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_Bomb$DoubleBomb' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.define(Bomb$EnhanceBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$EnhanceBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_Bomb$EnhanceBomb' }, clinit: true, lazy: ['validIngredients', 'bombCosts'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  SmokeParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle');
  ArcaneBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.ArcaneBomb');
  Firebomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Firebomb');
  FlashBangBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.FlashBangBomb');
  FrostBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.FrostBomb');
  HolyBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.HolyBomb');
  Noisemaker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Noisemaker');
  RegrowthBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.RegrowthBomb');
  ShrapnelBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.ShrapnelBomb');
  SmokeBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.SmokeBomb');
  WoollyBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.WoollyBomb');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
