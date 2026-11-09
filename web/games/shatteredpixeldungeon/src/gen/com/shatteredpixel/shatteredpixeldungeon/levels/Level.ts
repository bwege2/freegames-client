// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/Level.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, HashMap, HashSet, JEnum, JObject, RuntimeException } from '../../../../../jre/index.ts';

let Assets$Sounds, Challenges, Dungeon, Dungeon$LimitedDrops, ShatteredPixelDungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, Blob, SacrificialFire, SacrificialFire$Marked, SmokeScreen, Web, WellWater, Awareness, Blindness, Buff, Burning, ChampionEnemy, LockedFloor, MagicalSight, MindVision, Ooze, PinCushion, Regeneration, RevealedArea, Shadows, Hero, HeroClass, HeroSubClass, Talent, Talent$RejuvenatingStepsCooldown, Talent$RejuvenatingStepsFurrow, Talent$WarriorFoodImmunity, PowerOfMany, PowerOfMany$PowerBuff, SpiritHawk$HawkAlly, DivineSense$DivineSenseTracker, Stasis, Stasis$StasisBuff, GnollGeomancer, Mimic, Mob, MobSpawner, Piranha, YogFist$SoiledFist, Blacksmith$Quest, Sheep, CellEmitter, TargetedCell, FlowParticle$Flow, SacrificialParticle, WindParticle$Wind, Generator, Generator$Category, Heap, Heap$Type, Stylus, TalismanOfForesight$CharAwareness, TalismanOfForesight$HeapAwareness, TimekeepersHourglass$timeFreeze, Bomb, PotionOfStrength, ScrollOfUpgrade, ScrollOfChallenge$ChallengeArena, StoneOfEnchantment, StoneOfIntuition, DimensionalSundial, EyeOfNewt, MossyClump, TrapMechanism, TrinketCatalyst, WandOfRegrowth$Lotus, WandOfWarding$Ward, HeavyBoomerang$CircleBack, MiningLevel, SewerLevel, Terrain, Chasm, Door, HighGrass, LevelTransition$Type, Painter, ShadowCaster, Messages, Swiftthistle$TimeBubble, GameScene, InterlevelScene, InterlevelScene$Mode, ItemSprite, GLog, Game, Group, Sample, BArray, GameMath, PathFinder, Point, Random, Reflection, SparseArray;

export class Level extends JObject {
  width_: number = 0;
  height_: number = 0;
  length_: number = 0;
  static readonly TIME_TO_RESPAWN: number = 50;
  version: number = 0;
  map_: number[] = null;
  visited: boolean[] = null;
  mapped: boolean[] = null;
  discoverable: boolean[] = null;
  viewDistance: number = 0;
  heroFOV: boolean[] = null;
  passable: boolean[] = null;
  losBlocking: boolean[] = null;
  flamable: boolean[] = null;
  secret: boolean[] = null;
  solid: boolean[] = null;
  avoid: boolean[] = null;
  water: boolean[] = null;
  pit: boolean[] = null;
  openSpace: boolean[] = null;
  feeling: Level$Feeling = null;
  entrance_: number = 0;
  exit_: number = 0;
  transitions: ArrayList<LevelTransition> = null;
  locked: boolean = false;
  mobs: HashSet<Mob> = null;
  heaps: SparseArray<Heap> = null;
  blobs: HashMap<JClass<Blob>, Blob> = null;
  plants: SparseArray<Plant> = null;
  traps: SparseArray<Trap> = null;
  customTiles: ArrayList<CustomTilemap> = null;
  customTerrain: ArrayList<CustomTilemap> = null;
  customWalls: ArrayList<CustomTilemap> = null;
  itemsToSpawn: ArrayList<Item> = null;
  visuals: Group = null;
  wallVisuals: Group = null;
  color1: number = 0;
  color2: number = 0;
  static readonly VERSION: string = 'version';
  static readonly WIDTH: string = 'width';
  static readonly HEIGHT: string = 'height';
  static readonly MAP: string = 'map';
  static readonly VISITED: string = 'visited';
  static readonly MAPPED: string = 'mapped';
  static readonly TRANSITIONS: string = 'transitions';
  static readonly LOCKED: string = 'locked';
  static readonly HEAPS: string = 'heaps';
  static readonly PLANTS: string = 'plants';
  static readonly TRAPS: string = 'traps';
  static readonly CUSTOM_TILES: string = 'customTiles';
  static readonly CUSTOM_TERRAIN: string = 'customTerrain';
  static readonly CUSTOM_WALLS: string = 'customWalls';
  static readonly MOBS: string = 'mobs';
  static readonly BLOBS: string = 'blobs';
  static readonly FEELING: string = 'feeling';
  mobsToSpawn: ArrayList<JClass<Mob>> = null;
  respawner: MobSpawner = null;
  static heroMindFov: boolean[] = null;
  static modifiableBlocking: boolean[] = null;
  _Level(): this {
    this.viewDistance = Dungeon.isChallenged(Challenges.DARKNESS) ? 2 : 8;
    this.feeling = Level$Feeling.NONE;
    this.locked = false;
    this.itemsToSpawn = new ArrayList();
    this.color1 = 17408;
    this.color2 = 8965188;
    this.mobsToSpawn = new ArrayList();
    return this;
  }
  create(): void {
    TargetedCell.cells.clear();
    Random.pushGenerator$long(Dungeon.seedCurDepth());
    if (!Dungeon.bossLevel$() && Dungeon.branch === 0) {
      this.addItemToSpawn(Generator.random$Category(Generator$Category.FOOD));
      if (Dungeon.posNeeded()) {
        Dungeon$LimitedDrops.STRENGTH_POTIONS.count_++;
        this.addItemToSpawn(new PotionOfStrength()._PotionOfStrength());
      }
      if (Dungeon.souNeeded()) {
        Dungeon$LimitedDrops.UPGRADE_SCROLLS.count_++;
        if (!Dungeon.isChallenged(Challenges.NO_SCROLLS) || Dungeon$LimitedDrops.UPGRADE_SCROLLS.count_ % 2 !== 0) {
          this.addItemToSpawn(new ScrollOfUpgrade()._ScrollOfUpgrade());
        }
      }
      if (Dungeon.asNeeded()) {
        Dungeon$LimitedDrops.ARCANE_STYLI.count_++;
        this.addItemToSpawn(new Stylus()._Stylus());
      }
      if (Dungeon.enchStoneNeeded()) {
        Dungeon$LimitedDrops.ENCH_STONE.drop();
        this.addItemToSpawn(new StoneOfEnchantment()._StoneOfEnchantment());
      }
      if (Dungeon.intStoneNeeded()) {
        Dungeon$LimitedDrops.INT_STONE.drop();
        this.addItemToSpawn(new StoneOfIntuition()._StoneOfIntuition());
      }
      if (Dungeon.trinketCataNeeded()) {
        Dungeon$LimitedDrops.TRINKET_CATA.drop();
        this.addItemToSpawn(new TrinketCatalyst()._TrinketCatalyst());
      }
      if (Dungeon.depth > 1) {
        {
          let mossyChance: number, trapMechChance: number;
          switch (Random.Int$int(14)) {
            case 0:
              this.feeling = Level$Feeling.CHASM;
              break;
            case 1:
              this.feeling = Level$Feeling.WATER;
              break;
            case 2:
              this.feeling = Level$Feeling.GRASS;
              break;
            case 3:
              this.feeling = Level$Feeling.DARK;
              this.viewDistance = $J.roundf(Math.fround(Math.imul(5, this.viewDistance) / 8));
              break;
            case 4:
              this.feeling = Level$Feeling.LARGE;
              this.addItemToSpawn(Generator.random$Category(Generator$Category.FOOD));
              break;
            case 5:
              this.feeling = Level$Feeling.TRAPS;
              break;
            case 6:
              this.feeling = Level$Feeling.SECRETS;
              break;
            default:
              mossyChance = Random.Float$();
              trapMechChance = Random.Float$();
              if (mossyChance < MossyClump.overrideNormalLevelChance$()) {
                this.feeling = MossyClump.getNextFeeling();
              } else if (trapMechChance < TrapMechanism.overrideNormalLevelChance$()) {
                this.feeling = TrapMechanism.getNextFeeling();
              } else {
                this.feeling = Level$Feeling.NONE;
              }
          }
        }
      }
    }
    do {
      this.width_ = this.height_ = this.length_ = 0;
      this.transitions = new ArrayList();
      this.mobs = new HashSet();
      this.heaps = new SparseArray()._SparseArray();
      this.blobs = new HashMap();
      this.plants = new SparseArray()._SparseArray();
      this.traps = new SparseArray()._SparseArray();
      this.customTiles = new ArrayList();
      this.customTerrain = new ArrayList();
      this.customWalls = new ArrayList();
    } while (!this.build());
    this.buildFlagMaps();
    this.cleanWalls();
    this.createMobs();
    this.createItems();
    Random.popGenerator();
  }
  setSize(w: number, h: number): void {
    this.width_ = w;
    this.height_ = h;
    this.length_ = Math.imul(w, h);
    this.map_ = $J.newArray(this.length_, 0);
    Arrays.fill(this.map_, this.feeling === Level$Feeling.CHASM ? Terrain.CHASM : Terrain.WALL);
    this.visited = $J.newArray(this.length_, false);
    this.mapped = $J.newArray(this.length_, false);
    this.heroFOV = $J.newArray(this.length_, false);
    this.passable = $J.newArray(this.length_, false);
    this.losBlocking = $J.newArray(this.length_, false);
    this.flamable = $J.newArray(this.length_, false);
    this.secret = $J.newArray(this.length_, false);
    this.solid = $J.newArray(this.length_, false);
    this.avoid = $J.newArray(this.length_, false);
    this.water = $J.newArray(this.length_, false);
    this.pit = $J.newArray(this.length_, false);
    this.openSpace = $J.newArray(this.length_, false);
    PathFinder.setMapSize(w, h);
  }
  reset(): void {
    for (let mob of $J.toArrayInto(this.mobs.toArray(), $J.newArray(0, null))) {
      if (!mob.reset()) {
        this.mobs.remove(mob);
      }
    }
    this.createMobs();
  }
  playLevelMusic(): void {
  }
  restoreFromBundle(bundle: Bundle): void {
    this.version = bundle.getInt(Level.VERSION);
    if (this.version < ShatteredPixelDungeon.v3_1_1) {
      throw new RuntimeException('old save');
    }
    this.setSize(bundle.getInt(Level.WIDTH), bundle.getInt(Level.HEIGHT));
    this.mobs = new HashSet();
    this.heaps = new SparseArray()._SparseArray();
    this.blobs = new HashMap();
    this.plants = new SparseArray()._SparseArray();
    this.traps = new SparseArray()._SparseArray();
    this.customTiles = new ArrayList();
    this.customTerrain = new ArrayList();
    this.customWalls = new ArrayList();
    this.map_ = bundle.getIntArray(Level.MAP);
    this.visited = bundle.getBooleanArray(Level.VISITED);
    this.mapped = bundle.getBooleanArray(Level.MAPPED);
    this.transitions = new ArrayList();
    for (const $it0 = bundle.getCollection(Level.TRANSITIONS).iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      this.transitions.add(b);
    }
    this.locked = bundle.getBoolean(Level.LOCKED);
    let collection = bundle.getCollection(Level.HEAPS);
    for (const $it1 = collection.iterator(); $it1.hasNext(); ) {
      let h = $it1.next();
      let heap = h;
      if (!heap.isEmpty()) {
        this.heaps.put(heap.pos, heap);
      }
    }
    collection = bundle.getCollection(Level.PLANTS);
    for (const $it2 = collection.iterator(); $it2.hasNext(); ) {
      let p = $it2.next();
      let plant = p;
      this.plants.put(plant.pos, plant);
    }
    collection = bundle.getCollection(Level.TRAPS);
    for (const $it3 = collection.iterator(); $it3.hasNext(); ) {
      let p = $it3.next();
      let trap = p;
      this.traps.put(trap.pos, trap);
    }
    collection = bundle.getCollection(Level.CUSTOM_TILES);
    for (const $it4 = collection.iterator(); $it4.hasNext(); ) {
      let p = $it4.next();
      let vis = p;
      this.customTiles.add(vis);
    }
    collection = bundle.getCollection(Level.CUSTOM_TERRAIN);
    for (const $it5 = collection.iterator(); $it5.hasNext(); ) {
      let p = $it5.next();
      let vis = p;
      this.customTerrain.add(vis);
    }
    collection = bundle.getCollection(Level.CUSTOM_WALLS);
    for (const $it6 = collection.iterator(); $it6.hasNext(); ) {
      let p = $it6.next();
      let vis = p;
      this.customWalls.add(vis);
    }
    collection = bundle.getCollection(Level.MOBS);
    for (const $it7 = collection.iterator(); $it7.hasNext(); ) {
      let m = $it7.next();
      let mob = m;
      if (mob != null) {
        this.mobs.add(mob);
      }
    }
    collection = bundle.getCollection(Level.BLOBS);
    for (const $it8 = collection.iterator(); $it8.hasNext(); ) {
      let b = $it8.next();
      let blob = b;
      this.blobs.put(blob.getClass(), blob);
    }
    this.feeling = bundle.getEnum(Level.FEELING, $J.cls(Level$Feeling));
    if (this.feeling === Level$Feeling.DARK) {
      this.viewDistance = $J.roundf(Math.fround(Math.imul(5, this.viewDistance) / 8));
    }
    if (bundle.contains('mobs_to_spawn')) {
      for (let mob of bundle.getClassArray('mobs_to_spawn')) {
        if (mob != null) {
          this.mobsToSpawn.add(mob);
        }
      }
    }
    if (bundle.contains('respawner')) {
      this.respawner = bundle.get$String('respawner');
    }
    TargetedCell.cells.clear();
    if (bundle.contains('targeted_cells')) {
      collection = bundle.getCollection('targeted_cells');
      for (const $it9 = collection.iterator(); $it9.hasNext(); ) {
        let c = $it9.next();
        let cell = c;
        if (cell != null) {
          TargetedCell.cells.put(cell.pos, cell);
        }
      }
    }
    this.buildFlagMaps();
    this.cleanWalls();
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Level.VERSION, Game.versionCode);
    bundle.put$String$int(Level.WIDTH, this.width_);
    bundle.put$String$int(Level.HEIGHT, this.height_);
    bundle.put$String$intArr(Level.MAP, this.map_);
    bundle.put$String$booleanArr(Level.VISITED, this.visited);
    bundle.put$String$booleanArr(Level.MAPPED, this.mapped);
    bundle.put$String$Collection(Level.TRANSITIONS, this.transitions);
    bundle.put$String$boolean(Level.LOCKED, this.locked);
    bundle.put$String$Collection(Level.HEAPS, this.heaps.valueList());
    bundle.put$String$Collection(Level.PLANTS, this.plants.valueList());
    bundle.put$String$Collection(Level.TRAPS, this.traps.valueList());
    bundle.put$String$Collection(Level.CUSTOM_TILES, this.customTiles);
    bundle.put$String$Collection(Level.CUSTOM_TERRAIN, this.customTerrain);
    bundle.put$String$Collection(Level.CUSTOM_WALLS, this.customWalls);
    bundle.put$String$Collection(Level.MOBS, this.mobs);
    bundle.put$String$Collection(Level.BLOBS, this.blobs.values());
    bundle.put$String$Enum(Level.FEELING, this.feeling);
    bundle.put$String$ClassArr('mobs_to_spawn', $J.toArrayInto(this.mobsToSpawn.toArray(), $J.newArray(0, null)));
    bundle.put$String$Bundlable('respawner', this.respawner);
    bundle.put$String$Collection('targeted_cells', TargetedCell.cells.valueList());
  }
  tunnelTile(): number {
    return this.feeling === Level$Feeling.CHASM ? Terrain.EMPTY_SP : Terrain.EMPTY;
  }
  width(): number {
    return this.width_;
  }
  height(): number {
    return this.height_;
  }
  length(): number {
    return this.length_;
  }
  tilesTex(): string {
    return null;
  }
  waterTex(): string {
    return null;
  }
  createMob(): Mob {
    if (this.mobsToSpawn == null || this.mobsToSpawn.isEmpty()) {
      this.mobsToSpawn = MobSpawner.getMobRotation(Dungeon.depth);
    }
    let m = Reflection.newInstance(this.mobsToSpawn.removeAt(0));
    ChampionEnemy.rollForChampion(m);
    return m;
  }
  entrance(): number {
    let l = this.getTransition$Type(null);
    if (l != null) {
      return l.cell();
    }
    return 0;
  }
  exit(): number {
    let l = this.getTransition$Type(LevelTransition$Type.REGULAR_EXIT);
    if (l != null) {
      return l.cell();
    }
    return 0;
  }
  getTransition$Type(type$: LevelTransition$Type): LevelTransition {
    if (this.transitions.isEmpty()) {
      return null;
    }
    for (const $it10 = this.transitions.iterator(); $it10.hasNext(); ) {
      let transition = $it10.next();
      if (type$ == null && (transition.type_ === LevelTransition$Type.REGULAR_ENTRANCE || transition.type_ === LevelTransition$Type.BRANCH_ENTRANCE || transition.type_ === LevelTransition$Type.SURFACE)) {
        return transition;
      } else if (transition.type_ === type$) {
        return transition;
      }
    }
    return type$ != null ? this.getTransition$Type(null) : this.transitions.get(0);
  }
  getTransition$int(cell: number): LevelTransition {
    for (const $it11 = this.transitions.iterator(); $it11.hasNext(); ) {
      let transition = $it11.next();
      if (transition.inside$int(cell)) {
        return transition;
      }
    }
    return null;
  }
  activateTransition(hero: Hero, transition: LevelTransition): boolean {
    if (this.locked) {
      return false;
    }
    Level.beforeTransition();
    InterlevelScene.curTransition = transition;
    if (transition.type_ === LevelTransition$Type.REGULAR_EXIT || transition.type_ === LevelTransition$Type.BRANCH_EXIT) {
      InterlevelScene.mode = InterlevelScene$Mode.DESCEND;
    } else {
      InterlevelScene.mode = InterlevelScene$Mode.ASCEND;
    }
    Game.switchScene$Class($J.cls(InterlevelScene));
    return true;
  }
  static beforeTransition(): void {
    let timeFreeze = Dungeon.hero.buff($J.cls(TimekeepersHourglass$timeFreeze));
    if (timeFreeze != null) {
      timeFreeze.disarmPresses();
    }
    let timeBubble = Dungeon.hero.buff($J.cls(Swiftthistle$TimeBubble));
    if (timeBubble != null) {
      timeBubble.disarmPresses();
    }
    let foodImmune = Dungeon.hero.buff($J.cls(Talent$WarriorFoodImmunity));
    if (foodImmune != null) {
      foodImmune.detach();
    }
    let arena = Dungeon.hero.buff($J.cls(ScrollOfChallenge$ChallengeArena));
    if (arena != null) {
      arena.detach();
    }
    let awareness = Dungeon.hero.buff($J.cls(Awareness));
    if (awareness != null) {
      awareness.detach();
    }
    let ally = Stasis.getStasisAlly();
    if (Char.hasProp(ally, Char$Property.IMMOVABLE)) {
      Dungeon.hero.buff($J.cls(Stasis$StasisBuff)).act();
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Stasis$StasisBuff), 'left_behind', []), []);
    }
    Dungeon.hero.spendToWhole();
    for (const $it12 = Actor.all().iterator(); $it12.hasNext(); ) {
      let a = $it12.next();
      if (a.cooldown() < Dungeon.hero.cooldown()) {
        a.spendToWhole();
      }
    }
  }
  seal(): void {
    if (!this.locked) {
      this.locked = true;
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(LockedFloor));
    }
  }
  unseal(): void {
    if (this.locked) {
      this.locked = false;
      if (Dungeon.hero.buff($J.cls(LockedFloor)) != null) {
        Dungeon.hero.buff($J.cls(LockedFloor)).detach();
      }
    }
  }
  getItemsToPreserveFromSealedResurrect(): ArrayList<Item> {
    let items = new ArrayList();
    for (const $it13 = this.heaps.valueList().iterator(); $it13.hasNext(); ) {
      let h = $it13.next();
      if (h.type_ === Heap$Type.HEAP) {
        for (const $it14 = h.items_.iterator(); $it14.hasNext(); ) {
          let i = $it14.next();
          if (i instanceof Bomb) {
            (i).fuse = null;
          }
          items.add(i);
        }
      }
    }
    for (const $it15 = this.mobs.iterator(); $it15.hasNext(); ) {
      let m = $it15.next();
      for (const $it16 = m.buffs$Class($J.cls(PinCushion)).iterator(); $it16.hasNext(); ) {
        let b = $it16.next();
        items.addAll(b.getStuckItems());
      }
    }
    for (const $it17 = Dungeon.hero.buffs$Class($J.cls(HeavyBoomerang$CircleBack)).iterator(); $it17.hasNext(); ) {
      let b = $it17.next();
      if (b.activeDepth() === Dungeon.depth) {
        items.add(b.cancel());
      }
    }
    return items;
  }
  addVisuals(): Group {
    if (this.visuals == null || this.visuals.parent == null) {
      this.visuals = new Group()._Group();
    } else {
      this.visuals.clear();
      this.visuals.camera_ = null;
    }
    for (let i = 0; i < this.length(); i++) {
      if (this.pit[i]) {
        this.visuals.add$Gizmo(new WindParticle$Wind()._WindParticle$Wind(i));
        if (i >= this.width() && this.water[(i - this.width()) | 0]) {
          this.visuals.add$Gizmo(new FlowParticle$Flow()._FlowParticle$Flow((i - this.width()) | 0));
        }
      }
    }
    return this.visuals;
  }
  addWallVisuals(): Group {
    if (this.wallVisuals == null || this.wallVisuals.parent == null) {
      this.wallVisuals = new Group()._Group();
    } else {
      this.wallVisuals.clear();
      this.wallVisuals.camera_ = null;
    }
    return this.wallVisuals;
  }
  mobLimit(): number {
    return 0;
  }
  mobCount(): number {
    let count = 0;
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (mob.alignment === Char$Alignment.ENEMY && !mob.properties().contains(Char$Property.MINIBOSS)) {
        count = Math.fround(count + mob.spawningWeight());
      }
    }
    return $J.roundf(count);
  }
  findMob(pos: number): Mob {
    for (const $it18 = this.mobs.iterator(); $it18.hasNext(); ) {
      let mob = $it18.next();
      if (mob.pos === pos) {
        return mob;
      }
    }
    return null;
  }
  addRespawner(): Actor {
    if (this.respawner == null) {
      this.respawner = new MobSpawner()._MobSpawner();
      Actor.addDelayed(this.respawner, this.respawnCooldown());
    } else {
      Actor.add$Actor(this.respawner);
      if (this.respawner.cooldown() > this.respawnCooldown()) {
        this.respawner.resetCooldown();
      }
    }
    return this.respawner;
  }
  respawnCooldown(): number {
    let cooldown: number;
    if (Statistics.amuletObtained) {
      if (Dungeon.depth === 1) {
        cooldown = Math.fround((Dungeon.level.mobCount()) * (Math.fround(Level.TIME_TO_RESPAWN / 25)));
      } else {
        cooldown = Math.fround($J.roundf(GameMath.gate(Math.fround(Level.TIME_TO_RESPAWN / 10), Math.fround(Dungeon.level.mobCount() * (Math.fround(Level.TIME_TO_RESPAWN / 10))), Math.fround(Level.TIME_TO_RESPAWN / 2))));
      }
    } else if (Dungeon.level.feeling === Level$Feeling.DARK) {
      cooldown = Math.fround(Math.fround(2 * Level.TIME_TO_RESPAWN) / 3);
    } else {
      cooldown = Level.TIME_TO_RESPAWN;
    }
    return Math.fround(cooldown / DimensionalSundial.spawnMultiplierAtCurrentTime());
  }
  spawnMob(disLimit: number): boolean {
    PathFinder.buildDistanceMap$int$booleanArr(Dungeon.hero.pos, BArray.or$booleanArr$booleanArr$booleanArr(this.passable, this.avoid, null));
    let mob = this.createMob();
    if (mob.state_ !== mob.PASSIVE) {
      mob.state_ = mob.WANDERING;
    }
    let tries = 30;
    do {
      mob.pos = this.randomRespawnCell(mob);
      tries--;
    } while ((mob.pos === -1 || PathFinder.distance[mob.pos] < disLimit) && tries > 0);
    if (Dungeon.hero.isAlive() && mob.pos !== -1 && PathFinder.distance[mob.pos] >= disLimit) {
      GameScene.add$Mob(mob);
      if (!mob.buffs$Class($J.cls(ChampionEnemy)).isEmpty()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ChampionEnemy), 'warn', []), []);
      }
      return true;
    } else {
      return false;
    }
  }
  randomRespawnCell(ch: Char): number {
    let cell: number;
    let count = 0;
    do {
      if (++count > 30) {
        return -1;
      }
      cell = Random.Int$int(this.length());
    } while ((Dungeon.level === this && this.heroFOV[cell]) || !this.passable[cell] || (Char.hasProp(ch, Char$Property.LARGE) && !this.openSpace[cell]) || Actor.findChar(cell) != null);
    return cell;
  }
  randomDestination(ch: Char): number {
    let cell: number;
    do {
      cell = Random.Int$int(this.length());
    } while (!this.passable[cell] || (Char.hasProp(ch, Char$Property.LARGE) && !this.openSpace[cell]));
    return cell;
  }
  addItemToSpawn(item: Item): void {
    if (item != null) {
      this.itemsToSpawn.add(item);
    }
  }
  findPrizeItem$(): Item {
    return this.findPrizeItem$Class(null);
  }
  findPrizeItem$Class(match: JClass<Item>): Item {
    if (this.itemsToSpawn.size() === 0) {
      return null;
    }
    if (match == null) {
      for (const $it19 = this.itemsToSpawn.iterator(); $it19.hasNext(); ) {
        let item = $it19.next();
        if (item instanceof TrinketCatalyst) {
          this.itemsToSpawn.remove(item);
          return item;
        }
      }
      let item = Random.element$Collection(this.itemsToSpawn);
      this.itemsToSpawn.remove(item);
      return item;
    }
    for (const $it20 = this.itemsToSpawn.iterator(); $it20.hasNext(); ) {
      let item = $it20.next();
      if (match.isInstance(item)) {
        this.itemsToSpawn.remove(item);
        return item;
      }
    }
    return null;
  }
  buildFlagMaps(): void {
    for (let i = 0; i < this.length(); i++) {
      let flags = Terrain.flags[this.map_[i]];
      this.passable[i] = (flags & Terrain.PASSABLE) !== 0;
      this.losBlocking[i] = (flags & Terrain.LOS_BLOCKING) !== 0;
      this.flamable[i] = (flags & Terrain.FLAMABLE) !== 0;
      this.secret[i] = (flags & Terrain.SECRET) !== 0;
      this.solid[i] = (flags & Terrain.SOLID) !== 0;
      this.avoid[i] = (flags & Terrain.AVOID) !== 0;
      this.water[i] = (flags & Terrain.LIQUID) !== 0;
      this.pit[i] = (flags & Terrain.PIT) !== 0;
    }
    for (const $it21 = this.blobs.values().iterator(); $it21.hasNext(); ) {
      let b = $it21.next();
      b.onBuildFlagMaps(this);
    }
    let lastRow = (this.length() - this.width()) | 0;
    for (let i = 0; i < this.width(); i++) {
      this.passable[i] = this.avoid[i] = false;
      this.losBlocking[i] = this.solid[i] = true;
      (this.passable[(lastRow + i) | 0]) = (this.avoid[(lastRow + i) | 0]) = false;
      (this.losBlocking[(lastRow + i) | 0]) = (this.solid[(lastRow + i) | 0]) = true;
    }
    for (let i = this.width(); i < lastRow; i = (i + this.width()) | 0) {
      this.passable[i] = this.avoid[i] = false;
      this.losBlocking[i] = this.solid[i] = true;
      (this.passable[(i + this.width() - 1) | 0]) = (this.avoid[(i + this.width() - 1) | 0]) = false;
      (this.losBlocking[(i + this.width() - 1) | 0]) = (this.solid[(i + this.width() - 1) | 0]) = true;
    }
    for (let i = 0; i < this.length(); i++) {
      if (this.solid[i]) {
        this.openSpace[i] = false;
      } else {
        for (let j = 1; j < PathFinder.CIRCLE8.length; j = (j + 2) | 0) {
          if (this.solid[(i + PathFinder.CIRCLE8[j]) | 0]) {
            this.openSpace[i] = false;
          } else if (!(this.solid[(i + PathFinder.CIRCLE8[((j + 1) | 0) % 8]) | 0]) && !(this.solid[(i + PathFinder.CIRCLE8[((j + 2) | 0) % 8]) | 0])) {
            this.openSpace[i] = true;
            break;
          }
        }
      }
    }
  }
  updateOpenSpace(cell: number): void {
    for (let i of PathFinder.NEIGHBOURS9) {
      if (this.insideMap((cell + i) | 0)) {
        if (this.solid[(cell + i) | 0]) {
          (this.openSpace[(cell + i) | 0]) = false;
        } else {
          for (let j = 1; j < PathFinder.CIRCLE8.length; j = (j + 2) | 0) {
            if (this.solid[(cell + i + PathFinder.CIRCLE8[j]) | 0]) {
              (this.openSpace[(cell + i) | 0]) = false;
            } else if (!(this.solid[(cell + i + PathFinder.CIRCLE8[((j + 1) | 0) % 8]) | 0]) && !(this.solid[(cell + i + PathFinder.CIRCLE8[((j + 2) | 0) % 8]) | 0])) {
              (this.openSpace[(cell + i) | 0]) = true;
              break;
            }
          }
        }
      }
    }
  }
  destroy(pos: number): void {
    let terr = this.map_[pos];
    if (terr === Terrain.EMPTY || terr === Terrain.EMPTY_DECO || (Terrain.flags[this.map_[pos]] & Terrain.FLAMABLE) !== 0) {
      Level.set$int$int(pos, Terrain.EMBERS);
    }
    let web = this.blobs.get($J.cls(Web));
    if (web != null) {
      web.clear(pos);
    }
  }
  cleanWalls(): void {
    if (this.discoverable == null || this.discoverable.length !== this.length_) {
      this.discoverable = $J.newArray(this.length(), false);
    }
    for (let i = 0; i < this.length(); i++) {
      let d = false;
      for (let j = 0; j < PathFinder.NEIGHBOURS9.length; j++) {
        let n = (i + PathFinder.NEIGHBOURS9[j]) | 0;
        if (n >= 0 && n < this.length() && this.map_[n] !== Terrain.WALL && this.map_[n] !== Terrain.WALL_DECO) {
          d = true;
          break;
        }
      }
      this.discoverable[i] = d;
    }
  }
  static set$int$int(cell: number, terrain: number): void {
    Level.set$int$int$Level(cell, terrain, Dungeon.level);
  }
  static set$int$int$Level(cell: number, terrain: number, level: Level): void {
    Painter.set$Level$int$int(level, cell, terrain);
    if (terrain !== Terrain.TRAP && terrain !== Terrain.SECRET_TRAP && terrain !== Terrain.INACTIVE_TRAP) {
      level.traps.remove(cell);
    }
    level.updateCellFlags(cell);
  }
  updateCellFlags(cell: number): void {
    let terrain = this.map_[cell];
    let flags = Terrain.flags[terrain];
    this.passable[cell] = (flags & Terrain.PASSABLE) !== 0;
    this.losBlocking[cell] = (flags & Terrain.LOS_BLOCKING) !== 0;
    this.flamable[cell] = (flags & Terrain.FLAMABLE) !== 0;
    this.secret[cell] = (flags & Terrain.SECRET) !== 0;
    this.solid[cell] = (flags & Terrain.SOLID) !== 0;
    this.avoid[cell] = (flags & Terrain.AVOID) !== 0;
    this.pit[cell] = (flags & Terrain.PIT) !== 0;
    this.water[cell] = terrain === Terrain.WATER;
    if (this instanceof SewerLevel) {
      if (this.map_[cell] === Terrain.REGION_DECO || this.map_[cell] === Terrain.REGION_DECO_ALT) {
        this.flamable[cell] = true;
      }
    }
    for (const $it22 = this.blobs.values().iterator(); $it22.hasNext(); ) {
      let b = $it22.next();
      b.onUpdateCellFlags(this, cell);
    }
    this.updateOpenSpace(cell);
  }
  drop(item: Item, cell: number): Heap {
    if (item == null || Challenges.isItemBlocked(item)) {
      let heap = new Heap()._Heap();
      let sprite = heap.sprite_ = new ItemSprite()._ItemSprite$();
      sprite.link$Heap(heap);
      return heap;
    }
    let heap = this.heaps.get(cell);
    if (heap == null) {
      heap = new Heap()._Heap();
      heap.seen = Dungeon.level === this && this.heroFOV[cell];
      heap.pos = cell;
      heap.drop(item);
      if (this.map_[cell] === Terrain.CHASM || (Dungeon.level != null && this.pit[cell])) {
        Dungeon.dropToChasm(item);
        GameScene.discard(heap);
      } else {
        this.heaps.put(cell, heap);
        GameScene.add$Heap(heap);
      }
    } else if (heap.type_ === Heap$Type.LOCKED_CHEST || heap.type_ === Heap$Type.CRYSTAL_CHEST) {
      let n: number;
      do {
        n = (cell + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
      } while (!this.passable[n] && !this.avoid[n]);
      return this.drop(item, n);
    } else {
      heap.drop(item);
    }
    if (Dungeon.level != null && Game.scene() instanceof GameScene) {
      this.pressCell$int(cell);
    }
    return heap;
  }
  plant(seed: Plant$Seed, pos: number): Plant {
    let plant = this.plants.get(pos);
    if (plant != null) {
      plant.wither();
    }
    if (this.map_[pos] === Terrain.HIGH_GRASS || this.map_[pos] === Terrain.FURROWED_GRASS || this.map_[pos] === Terrain.EMPTY || this.map_[pos] === Terrain.EMBERS || this.map_[pos] === Terrain.EMPTY_DECO) {
      Level.set$int$int$Level(pos, Terrain.GRASS, this);
      GameScene.updateMap$int(pos);
    }
    if (Dungeon.isChallenged(Challenges.NO_HERBALISM)) {
      return null;
    }
    plant = seed.couch(pos, this);
    this.plants.put(pos, plant);
    GameScene.plantSeed(pos);
    for (const $it23 = Actor.chars().iterator(); $it23.hasNext(); ) {
      let ch = $it23.next();
      if (ch instanceof WandOfRegrowth$Lotus && (ch).inRange(pos) && Actor.findChar(pos) != null) {
        plant.trigger();
        return null;
      }
    }
    return plant;
  }
  uproot(pos: number): void {
    this.plants.remove(pos);
    GameScene.updateMap$int(pos);
  }
  setTrap(trap: Trap, pos: number): Trap {
    let existingTrap = this.traps.get(pos);
    if (existingTrap != null) {
      this.traps.remove(pos);
    }
    trap.set(pos);
    this.traps.put(pos, trap);
    GameScene.updateMap$int(pos);
    return trap;
  }
  disarmTrap(pos: number): void {
    Level.set$int$int(pos, Terrain.INACTIVE_TRAP);
    GameScene.updateMap$int(pos);
  }
  discover(cell: number): void {
    Level.set$int$int(cell, Terrain.discover(this.map_[cell]));
    let trap = this.traps.get(cell);
    if (trap != null) {
      trap.reveal();
    }
    GameScene.updateMap$int(cell);
  }
  setCellToWater(includeTraps: boolean, cell: number): boolean {
    let p = this.cellToPoint(cell);
    for (const $it24 = this.customTiles.iterator(); $it24.hasNext(); ) {
      let cust = $it24.next();
      let custPoint = new Point()._Point$Point(p);
      custPoint.x = (custPoint.x - cust.tileX) | 0;
      custPoint.y = (custPoint.y - cust.tileY) | 0;
      if (custPoint.x >= 0 && custPoint.y >= 0 && custPoint.x < cust.tileW && custPoint.y < cust.tileH) {
        if (!cust.allowWater(custPoint.x, custPoint.y)) {
          return false;
        }
      }
    }
    let terr = this.map_[cell];
    if (terr === Terrain.EMPTY || terr === Terrain.GRASS || terr === Terrain.EMBERS || terr === Terrain.EMPTY_SP || terr === Terrain.HIGH_GRASS || terr === Terrain.FURROWED_GRASS || terr === Terrain.EMPTY_DECO) {
      Level.set$int$int(cell, Terrain.WATER);
      GameScene.updateMap$int(cell);
      return true;
    } else if (includeTraps && (terr === Terrain.SECRET_TRAP || terr === Terrain.TRAP || terr === Terrain.INACTIVE_TRAP)) {
      Level.set$int$int(cell, Terrain.WATER);
      Dungeon.level.traps.remove(cell);
      GameScene.updateMap$int(cell);
      return true;
    }
    return false;
  }
  fallCell(fallIntoPit: boolean): number {
    let result: number;
    do {
      result = this.randomRespawnCell(null);
      if (result === -1) {
        return -1;
      }
    } while (this.traps.get(result) != null || this.findMob(result) != null);
    return result;
  }
  occupyCell(ch: Char): void {
    if (!ch.isImmune($J.cls(Web)) && Blob.volumeAt(ch.pos, $J.cls(Web)) > 0) {
      this.blobs.get($J.cls(Web)).clear(ch.pos);
      Web.affectChar(ch);
    }
    if (Blob.volumeAt(ch.pos, $J.cls(SacrificialFire)) > 0 && ch.buff($J.cls(SacrificialFire$Marked)) == null) {
      if (Dungeon.level.heroFOV[ch.pos]) {
        CellEmitter.get(ch.pos).burst(SacrificialParticle.FACTORY, 5);
      }
      Buff.prolong(ch, $J.cls(SacrificialFire$Marked), SacrificialFire$Marked.DURATION);
    }
    if (!ch.flying) {
      if (this.map_[ch.pos] === Terrain.WATER) {
        if (ch.buff($J.cls(Burning)) != null) {
          ch.buff($J.cls(Burning)).act();
        }
        if (ch.buff($J.cls(Ooze)) != null) {
          ch.buff($J.cls(Ooze)).act();
        }
      }
      if ((this.map_[ch.pos] === Terrain.GRASS || this.map_[ch.pos] === Terrain.EMBERS) && ch === Dungeon.hero && Dungeon.hero.hasTalent(Talent.REJUVENATING_STEPS) && ch.buff($J.cls(Talent$RejuvenatingStepsCooldown)) == null) {
        if (!Regeneration.regenOn()) {
          Level.set$int$int(ch.pos, Terrain.FURROWED_GRASS);
        } else if (ch.buff($J.cls(Talent$RejuvenatingStepsFurrow)) != null && ch.buff($J.cls(Talent$RejuvenatingStepsFurrow)).count() >= Math.fround(200)) {
          Level.set$int$int(ch.pos, Terrain.FURROWED_GRASS);
        } else {
          Level.set$int$int(ch.pos, Terrain.HIGH_GRASS);
          Buff.count(ch, $J.cls(Talent$RejuvenatingStepsFurrow), Math.fround((3 - Dungeon.hero.pointsInTalent(Talent.REJUVENATING_STEPS)) | 0));
        }
        GameScene.updateMap$int(ch.pos);
        Buff.affect$Char$Class$float(ch, $J.cls(Talent$RejuvenatingStepsCooldown), Math.fround(15 - Math.fround(5 * Dungeon.hero.pointsInTalent(Talent.REJUVENATING_STEPS))));
      }
      if (this.pit[ch.pos]) {
        if (ch === Dungeon.hero) {
          Chasm.heroFall(ch.pos);
        } else if (ch instanceof Mob) {
          Chasm.mobFall(ch);
        }
        return;
      }
      this.pressCell$int$boolean$Level(ch.pos, ch instanceof Hero || ch instanceof Sheep);
    } else {
      if (this.map_[ch.pos] === Terrain.DOOR) {
        Door.enter(ch.pos);
      }
    }
    if (ch.isAlive() && ch instanceof Piranha && !this.water[ch.pos]) {
      (ch).dieOnLand();
    }
  }
  pressCell$int(cell: number): void {
    this.pressCell$int$boolean$Level(cell, true);
  }
  pressCell$int$boolean$Level(cell: number, hard: boolean): void {
    let trap = null;
    switch (this.map_[cell]) {
      case Terrain.SECRET_TRAP:
        if (hard) {
          trap = this.traps.get(cell);
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Level), 'hidden_trap', [trap.name()]), []);
        }
        break;
      case Terrain.TRAP:
        trap = this.traps.get(cell);
        break;
      case Terrain.HIGH_GRASS:
      case Terrain.FURROWED_GRASS:
        HighGrass.trample(this, cell);
        break;
      case Terrain.WELL:
        WellWater.affectCell(cell);
        break;
      case Terrain.DOOR:
        Door.enter(cell);
        break;
    }
    let timeFreeze = Dungeon.hero.buff($J.cls(TimekeepersHourglass$timeFreeze));
    let bubble = Dungeon.hero.buff($J.cls(Swiftthistle$TimeBubble));
    if (trap != null) {
      if (bubble != null) {
        Sample.INSTANCE.play$Object(Assets$Sounds.TRAP);
        this.discover(cell);
        bubble.setDelayedPress(cell);
      } else if (timeFreeze != null) {
        Sample.INSTANCE.play$Object(Assets$Sounds.TRAP);
        this.discover(cell);
        timeFreeze.setDelayedPress(cell);
      } else {
        if (Dungeon.hero.pos === cell) {
          Dungeon.hero.interrupt();
        }
        trap.trigger();
      }
    }
    let plant = this.plants.get(cell);
    if (plant != null) {
      if (bubble != null) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.TRAMPLE, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
        bubble.setDelayedPress(cell);
      } else if (timeFreeze != null) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.TRAMPLE, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
        timeFreeze.setDelayedPress(cell);
      } else {
        plant.trigger();
      }
    }
    if (hard && Blob.volumeAt(cell, $J.cls(Web)) > 0) {
      this.blobs.get($J.cls(Web)).clear(cell);
    }
  }
  updateFieldOfView(c: Char, fieldOfView: boolean[]): void {
    let cx = c.pos % this.width();
    let cy = $J.idiv(c.pos, this.width());
    let sighted = c.buff($J.cls(Blindness)) == null && c.buff($J.cls(Shadows)) == null && c.isAlive();
    if (sighted) {
      let blocking = null;
      if (Level.modifiableBlocking == null || Level.modifiableBlocking.length !== Dungeon.level.losBlocking.length) {
        Level.modifiableBlocking = $J.newArray(Dungeon.level.losBlocking.length, false);
      }
      if (!(Dungeon.level instanceof MiningLevel) || Blacksmith$Quest.Type() !== Blacksmith$Quest.FUNGI) {
        if ((c instanceof Hero && (c).subClass === HeroSubClass.WARDEN) || c instanceof YogFist$SoiledFist || c instanceof GnollGeomancer) {
          if (blocking == null) {
            $J.system_arraycopy(Dungeon.level.losBlocking, 0, Level.modifiableBlocking, 0, Level.modifiableBlocking.length);
            blocking = Level.modifiableBlocking;
          }
          for (let i = 0; i < blocking.length; i++) {
            if (blocking[i] && (Dungeon.level.map_[i] === Terrain.HIGH_GRASS || Dungeon.level.map_[i] === Terrain.FURROWED_GRASS)) {
              blocking[i] = false;
            }
          }
        }
      }
      if ((c.alignment !== Char$Alignment.ALLY && !(c instanceof GnollGeomancer)) && Dungeon.level.blobs.containsKey($J.cls(SmokeScreen)) && Dungeon.level.blobs.get($J.cls(SmokeScreen)).volume_ > 0) {
        if (blocking == null) {
          $J.system_arraycopy(Dungeon.level.losBlocking, 0, Level.modifiableBlocking, 0, Level.modifiableBlocking.length);
          blocking = Level.modifiableBlocking;
        }
        let s = Dungeon.level.blobs.get($J.cls(SmokeScreen));
        for (let i = 0; i < blocking.length; i++) {
          if (!blocking[i] && s.cur[i] > 0) {
            blocking[i] = true;
          }
        }
      }
      if (blocking == null) {
        blocking = Dungeon.level.losBlocking;
      }
      let viewDist = Math.fround(c.viewDistance);
      if (c instanceof Hero) {
        viewDist = Math.fround(viewDist * Math.fround(1 + Math.fround(0.25 * (c).pointsInTalent(Talent.FARSIGHT))));
        viewDist = Math.fround(viewDist * EyeOfNewt.visionRangeMultiplier$());
      }
      ShadowCaster.castShadow(cx, cy, this.width(), fieldOfView, blocking, $J.roundf(viewDist));
    } else {
      BArray.setFalse(fieldOfView);
    }
    let sense = 1;
    if (c.isAlive() && c === Dungeon.hero) {
      for (const $it25 = c.buffs$Class($J.cls(MindVision)).iterator(); $it25.hasNext(); ) {
        let b = $it25.next();
        sense = Math.max((b).distance_, sense);
      }
      if (c.buff($J.cls(MagicalSight)) != null) {
        sense = Math.max(MagicalSight.DISTANCE, sense);
      }
    }
    if (!sighted || sense > 1) {
      let rounding = ShadowCaster.rounding;
      let left: number;
      let right: number;
      let pos: number;
      for (let y = Math.max(0, (cy - sense) | 0); y <= (Math.min((this.height() - 1) | 0, (cy + sense) | 0)); y++) {
        if ((rounding[sense][Math.abs((cy - y) | 0)]) < (Math.abs((cy - y) | 0))) {
          left = (cx - (rounding[sense][Math.abs((cy - y) | 0)])) | 0;
        } else {
          left = sense;
          while (rounding[sense][left] < (rounding[sense][Math.abs((cy - y) | 0)])) {
            left--;
          }
          left = (cx - left) | 0;
        }
        right = Math.min((this.width() - 1) | 0, (cx + cx - left) | 0);
        left = Math.max(0, left);
        pos = (left + Math.imul(y, this.width())) | 0;
        $J.system_arraycopy(this.discoverable, pos, fieldOfView, pos, (right - left + 1) | 0);
      }
    }
    if (c instanceof SpiritHawk$HawkAlly && Dungeon.hero.pointsInTalent(Talent.EAGLE_EYE) >= 3) {
      let range = (1 + (Dungeon.hero.pointsInTalent(Talent.EAGLE_EYE) - 2)) | 0;
      for (const $it26 = this.mobs.iterator(); $it26.hasNext(); ) {
        let mob = $it26.next();
        let p = mob.pos;
        if (!fieldOfView[p] && this.distance(c.pos, p) <= range) {
          for (let i of PathFinder.NEIGHBOURS9) {
            (fieldOfView[(mob.pos + i) | 0]) = true;
          }
        }
      }
    }
    if (c.isAlive() && c === Dungeon.hero) {
      if (Level.heroMindFov == null || Level.heroMindFov.length !== this.length()) {
        Level.heroMindFov = $J.newArray(this.length_, false);
      } else {
        BArray.setFalse(Level.heroMindFov);
      }
      Dungeon.hero.mindVisionEnemies.clear();
      let mindVisRange = 0;
      if (c.buff($J.cls(MindVision)) != null) {
        mindVisRange = 2147483647;
      } else {
        if ((c).hasTalent(Talent.HEIGHTENED_SENSES)) {
          mindVisRange = (1 + (c).pointsInTalent(Talent.HEIGHTENED_SENSES)) | 0;
        }
        if (c.buff($J.cls(DivineSense$DivineSenseTracker)) != null) {
          if ((c).heroClass === HeroClass.CLERIC) {
            mindVisRange = (4 + Math.imul(4, (c).pointsInTalent(Talent.DIVINE_SENSE))) | 0;
          } else {
            mindVisRange = (1 + Math.imul(2, (c).pointsInTalent(Talent.DIVINE_SENSE))) | 0;
          }
        }
        mindVisRange = Math.max(mindVisRange, EyeOfNewt.mindVisionRange$());
      }
      if (mindVisRange >= 1) {
        let ally = PowerOfMany.getPoweredAlly();
        if (ally != null && ally.buff($J.cls(DivineSense$DivineSenseTracker)) == null) {
          ally = null;
        }
        for (const $it27 = this.mobs.iterator(); $it27.hasNext(); ) {
          let mob = $it27.next();
          if ((mob instanceof Mimic && mob.alignment === Char$Alignment.NEUTRAL && (mob).stealthy()) || Char.hasProp(mob, Char$Property.OBJECT)) {
            continue;
          }
          let p = mob.pos;
          if (!fieldOfView[p] && (this.distance(c.pos, p) <= mindVisRange || (ally != null && this.distance(ally.pos, p) <= mindVisRange))) {
            for (let i of PathFinder.NEIGHBOURS9) {
              (Level.heroMindFov[(mob.pos + i) | 0]) = true;
            }
          }
        }
      }
      if (c.buff($J.cls(Awareness)) != null) {
        for (const $it28 = this.heaps.valueList().iterator(); $it28.hasNext(); ) {
          let heap = $it28.next();
          let p = heap.pos;
          for (let i of PathFinder.NEIGHBOURS9) {
            (Level.heroMindFov[(p + i) | 0]) = true;
          }
        }
      }
      for (const $it29 = c.buffs$Class($J.cls(TalismanOfForesight$CharAwareness)).iterator(); $it29.hasNext(); ) {
        let a = $it29.next();
        let ch = Actor.findById(a.charID);
        if (ch == null || !ch.isAlive() || Char.hasProp(ch, Char$Property.OBJECT)) {
          continue;
        }
        let p = ch.pos;
        for (let i of PathFinder.NEIGHBOURS9) {
          (Level.heroMindFov[(p + i) | 0]) = true;
        }
      }
      for (const $it30 = c.buffs$Class($J.cls(TalismanOfForesight$HeapAwareness)).iterator(); $it30.hasNext(); ) {
        let h = $it30.next();
        if (Dungeon.depth !== h.depth_ || Dungeon.branch !== h.branch) {
          continue;
        }
        for (let i of PathFinder.NEIGHBOURS9) {
          (Level.heroMindFov[(h.pos + i) | 0]) = true;
        }
      }
      for (const $it31 = this.mobs.iterator(); $it31.hasNext(); ) {
        let m = $it31.next();
        if (m instanceof WandOfWarding$Ward || m instanceof WandOfRegrowth$Lotus || m instanceof SpiritHawk$HawkAlly || m.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
          if (m.fieldOfView == null || m.fieldOfView.length !== this.length()) {
            m.fieldOfView = $J.newArray(this.length(), false);
            Dungeon.level.updateFieldOfView(m, m.fieldOfView);
          }
          BArray.or$booleanArr$booleanArr$booleanArr(Level.heroMindFov, m.fieldOfView, Level.heroMindFov);
        }
      }
      for (const $it32 = c.buffs$Class($J.cls(RevealedArea)).iterator(); $it32.hasNext(); ) {
        let a = $it32.next();
        if (Dungeon.depth !== a.depth_ || Dungeon.branch !== a.branch) {
          continue;
        }
        for (let i of PathFinder.NEIGHBOURS9) {
          (Level.heroMindFov[(a.pos + i) | 0]) = true;
        }
      }
      for (const $it33 = this.mobs.iterator(); $it33.hasNext(); ) {
        let mob = $it33.next();
        if (Level.heroMindFov[mob.pos] && !fieldOfView[mob.pos]) {
          Dungeon.hero.mindVisionEnemies.add(mob);
        }
      }
      BArray.or$booleanArr$booleanArr$booleanArr(Level.heroMindFov, fieldOfView, fieldOfView);
    }
    if (c === Dungeon.hero) {
      for (const $it34 = this.heaps.valueList().iterator(); $it34.hasNext(); ) {
        let heap = $it34.next();
        if (!heap.seen && fieldOfView[heap.pos]) {
          heap.seen = true;
        }
      }
    }
  }
  levelExplorePercent(depth: number): number {
    return 0;
  }
  distance(a: number, b: number): number {
    let ax = a % this.width();
    let ay = $J.idiv(a, this.width());
    let bx = b % this.width();
    let by = $J.idiv(b, this.width());
    return Math.max(Math.abs((ax - bx) | 0), Math.abs((ay - by) | 0));
  }
  adjacent(a: number, b: number): boolean {
    return this.distance(a, b) === 1;
  }
  trueDistance(a: number, b: number): number {
    let ax = a % this.width();
    let ay = $J.idiv(a, this.width());
    let bx = b % this.width();
    let by = $J.idiv(b, this.width());
    return Math.fround(Math.sqrt($J.pow(Math.abs((ax - bx) | 0), 2) + $J.pow(Math.abs((ay - by) | 0), 2)));
  }
  invalidHeroPos(tile: number): boolean {
    let flags = Terrain.flags[this.map_[tile]];
    return (flags & Terrain.PASSABLE) !== 0 && (flags & Terrain.AVOID) !== 0;
  }
  insideMap(tile: number): boolean {
    return !((tile < this.width_ || tile >= ((this.length_ - this.width_) | 0)) || (tile % this.width_ === 0 || tile % this.width_ === ((this.width_ - 1) | 0)));
  }
  cellToPoint(cell: number): Point {
    return new Point()._Point$int$int(cell % this.width(), $J.idiv(cell, this.width()));
  }
  pointToCell(p: Point): number {
    return (p.x + Math.imul(p.y, this.width())) | 0;
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.CHASM:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'chasm_name', []);
      case Terrain.EMPTY:
      case Terrain.EMPTY_SP:
      case Terrain.EMPTY_DECO:
      case Terrain.CUSTOM_DECO_EMPTY:
      case Terrain.SECRET_TRAP:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'floor_name', []);
      case Terrain.GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'grass_name', []);
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'water_name', []);
      case Terrain.WALL:
      case Terrain.WALL_DECO:
      case Terrain.SECRET_DOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'wall_name', []);
      case Terrain.DOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'closed_door_name', []);
      case Terrain.OPEN_DOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'open_door_name', []);
      case Terrain.ENTRANCE:
      case Terrain.ENTRANCE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'entrace_name', []);
      case Terrain.EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'exit_name', []);
      case Terrain.EMBERS:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'embers_name', []);
      case Terrain.FURROWED_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'furrowed_grass_name', []);
      case Terrain.LOCKED_DOOR:
      case Terrain.HERO_LKD_DR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'locked_door_name', []);
      case Terrain.CRYSTAL_DOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'crystal_door_name', []);
      case Terrain.PEDESTAL:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'pedestal_name', []);
      case Terrain.BARRICADE:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'barricade_name', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'high_grass_name', []);
      case Terrain.LOCKED_EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'locked_exit_name', []);
      case Terrain.UNLOCKED_EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'unlocked_exit_name', []);
      case Terrain.WELL:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'well_name', []);
      case Terrain.EMPTY_WELL:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'empty_well_name', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'statue_name', []);
      case Terrain.INACTIVE_TRAP:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'inactive_trap_name', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'bookshelf_name', []);
      case Terrain.ALCHEMY:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'alchemy_name', []);
      default:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'default_name', []);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.CHASM:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'chasm_desc', []);
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'water_desc', []);
      case Terrain.ENTRANCE:
      case Terrain.ENTRANCE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'entrance_desc', []);
      case Terrain.EXIT:
      case Terrain.UNLOCKED_EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'exit_desc', []);
      case Terrain.EMBERS:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'embers_desc', []);
      case Terrain.HIGH_GRASS:
      case Terrain.FURROWED_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'high_grass_desc', []);
      case Terrain.LOCKED_DOOR:
      case Terrain.HERO_LKD_DR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'locked_door_desc', []);
      case Terrain.CRYSTAL_DOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'crystal_door_desc', []);
      case Terrain.LOCKED_EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'locked_exit_desc', []);
      case Terrain.BARRICADE:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'barricade_desc', []);
      case Terrain.INACTIVE_TRAP:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'inactive_trap_desc', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'statue_desc', []);
      case Terrain.ALCHEMY:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'alchemy_desc', []);
      case Terrain.EMPTY_WELL:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'empty_well_desc', []);
      default:
        return '';
    }
  }
}

export class Level$Feeling extends JEnum {
  static NONE: Level$Feeling = null;
  static CHASM: Level$Feeling = null;
  static WATER: Level$Feeling = null;
  static GRASS: Level$Feeling = null;
  static DARK: Level$Feeling = null;
  static LARGE: Level$Feeling = null;
  static TRAPS: Level$Feeling = null;
  static SECRETS: Level$Feeling = null;
  static $VALUES: Level$Feeling[] = null;
  _Level$Feeling($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  title(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '_title', []);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '_desc', []);
  }
  static values(): Level$Feeling[] { return Level$Feeling.$VALUES.slice(); }
  static valueOf(name: string): Level$Feeling { return $J.enumValueOf(Level$Feeling, name); }
  static $clinit() {
    Level$Feeling.NONE = new Level$Feeling()._Level$Feeling('NONE', 0);
    Level$Feeling.CHASM = new Level$Feeling()._Level$Feeling('CHASM', 1);
    Level$Feeling.WATER = new Level$Feeling()._Level$Feeling('WATER', 2);
    Level$Feeling.GRASS = new Level$Feeling()._Level$Feeling('GRASS', 3);
    Level$Feeling.DARK = new Level$Feeling()._Level$Feeling('DARK', 4);
    Level$Feeling.LARGE = new Level$Feeling()._Level$Feeling('LARGE', 5);
    Level$Feeling.TRAPS = new Level$Feeling()._Level$Feeling('TRAPS', 6);
    Level$Feeling.SECRETS = new Level$Feeling()._Level$Feeling('SECRETS', 7);
    Level$Feeling.$VALUES = [Level$Feeling.NONE, Level$Feeling.CHASM, Level$Feeling.WATER, Level$Feeling.GRASS, Level$Feeling.DARK, Level$Feeling.LARGE, Level$Feeling.TRAPS, Level$Feeling.SECRETS];
  }
}

$J.define(Level, 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Level' }, meths: { 'pressCell(int,boolean)': 'pressCell$int$boolean$Level', 'pressCell(int)': 'pressCell$int', 'set(int,int,com.shatteredpixel.shatteredpixeldungeon.levels.Level)': 'set$int$int$Level', 'set(int,int)': 'set$int$int', 'findPrizeItem(java.lang.Class)': 'findPrizeItem$Class', 'findPrizeItem()': 'findPrizeItem$', 'getTransition(int)': 'getTransition$int', 'getTransition(com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type)': 'getTransition$Type' } });
$J.define(Level$Feeling, 'com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Level$Feeling' }, clinit: true, lazy: ['$VALUES', 'NONE', 'CHASM', 'WATER', 'GRASS', 'DARK', 'LARGE', 'TRAPS', 'SECRETS'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  SacrificialFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire');
  SacrificialFire$Marked = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire$Marked');
  SmokeScreen = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SmokeScreen');
  Web = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Web');
  WellWater = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WellWater');
  Awareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Awareness');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  ChampionEnemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  MagicalSight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSight');
  MindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MindVision');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  RevealedArea = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.RevealedArea');
  Shadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Shadows');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$RejuvenatingStepsCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$RejuvenatingStepsCooldown');
  Talent$RejuvenatingStepsFurrow = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$RejuvenatingStepsFurrow');
  Talent$WarriorFoodImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$WarriorFoodImmunity');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  PowerOfMany$PowerBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff');
  SpiritHawk$HawkAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk$HawkAlly');
  DivineSense$DivineSenseTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense$DivineSenseTracker');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Stasis$StasisBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis$StasisBuff');
  GnollGeomancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  MobSpawner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.MobSpawner');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  YogFist$SoiledFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$SoiledFist');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Sheep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  TargetedCell = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.TargetedCell');
  FlowParticle$Flow = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlowParticle$Flow');
  SacrificialParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SacrificialParticle');
  WindParticle$Wind = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.WindParticle$Wind');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Stylus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Stylus');
  TalismanOfForesight$CharAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$CharAwareness');
  TalismanOfForesight$HeapAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$HeapAwareness');
  TimekeepersHourglass$timeFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  ScrollOfChallenge$ChallengeArena = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge$ChallengeArena');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  StoneOfIntuition = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition');
  DimensionalSundial = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.DimensionalSundial');
  EyeOfNewt = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.EyeOfNewt');
  MossyClump = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MossyClump');
  TrapMechanism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrapMechanism');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  WandOfRegrowth$Lotus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus');
  WandOfWarding$Ward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward');
  HeavyBoomerang$CircleBack = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.HeavyBoomerang$CircleBack');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  SewerLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Door');
  HighGrass = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.HighGrass');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Swiftthistle$TimeBubble = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Group = $J.load('com.watabou.noosa.Group');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
