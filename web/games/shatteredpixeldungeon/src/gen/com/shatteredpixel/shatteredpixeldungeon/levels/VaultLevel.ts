// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/VaultLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, Collections, HashSet, JObject } from '../../../../../jre/index.ts';
import { CityLevel } from './CityLevel.ts';
import { Trap } from './traps/Trap.ts';

let Assets$Music, Challenges, Dungeon, Blob, VaultFlameTraps, Imp$Quest, VaultDM100, VaultDM200, VaultElemental, VaultGhoul, VaultGolem, VaultShaman, VaultSkeleton, Generator, Generator$Category, Heap$Type, Torch, LeatherArmor, MailArmor, PlateArmor, ScaleArmor, PotionOfExperience, PotionOfFrost, PotionOfHealing, PotionOfInvisibility, PotionOfLevitation, PotionOfLiquidFlame, PotionOfMindVision, PotionOfParalyticGas, PotionOfToxicGas, Ring, RingOfForce, RingOfMight, RingOfWealth, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfMirrorImage, ScrollOfRecharging, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfTerror, ScrollOfTransmutation, StoneOfAggression, StoneOfAugmentation, StoneOfBlast, StoneOfBlink, StoneOfClairvoyance, StoneOfDeepSleep, StoneOfEnchantment, StoneOfFear, StoneOfFlock, StoneOfShock, WandOfCorruption, WandOfRegrowth, WandOfTransfusion, Dart, Level, Terrain, GridBuilder, LevelTransition, LevelTransition$Type, CityPainter, Painter, VaultEntranceRoom, VaultFinalRoom, VaultRoom, VaultSimpleEnemyTreasureRoom, VaultTokensRoom, VaultTreasureRoom, Messages, Blindweed$Seed, Earthroot$Seed, Firebloom$Seed, Icecap$Seed, Mageroyal$Seed, Sorrowmoss$Seed, Starflower$Seed, Stormvine$Seed, Sungrass$Seed, Swiftthistle$Seed, InterlevelScene, InterlevelScene$Mode, Game, Music, Random, Reflection;

export class VaultLevel extends CityLevel {
  equipmentLoot: Item[][] = null;
  higherTierIdx: number = 0;
  lowerTierIdx: number = 0;
  generatedClasses: HashSet<JClass<Item>> = null;
  consumableLoot: ArrayList<ArrayList<Item>> = null;
  static T3SolveItems: JClass<Item>[] = null;
  static T2SolveItems: JClass<Item>[] = null;
  static T1Mobs: JClass<Mob>[] = null;
  static T2Mobs: JClass<Mob>[] = null;
  static T3Mobs: JClass<Mob>[] = null;
  mobsToSpawn$VaultLevel: ArrayList<JClass<Mob>> = null;
  _VaultLevel(): this {
    this._CityLevel();
    this.equipmentLoot = $J.newArray(4, null);
    this.higherTierIdx = 0;
    this.lowerTierIdx = 0;
    this.generatedClasses = new HashSet();
    this.consumableLoot = new ArrayList();
    this.mobsToSpawn$VaultLevel = new ArrayList();
    return this;
  }
  playLevelMusic(): void {
    Music.INSTANCE.play$String$boolean(Assets$Music.CITY_TENSE, true);
  }
  build(): boolean {
    this.itemsToSpawn.clear();
    for (let i = 0; i < 4; i++) {
      this.addItemToSpawn(this.createEquipment(0));
    }
    this.addItemToSpawn(new Dart()._Dart());
    for (let i = 0; i < 5; i++) {
      this.addItemToSpawn(this.createConsumabe(0));
    }
    this.addItemToSpawn(Generator.randomUsingDefaults$Category(Generator$Category.FOOD));
    this.addItemToSpawn(Generator.randomUsingDefaults$Category(Generator$Category.FOOD));
    this.addItemToSpawn(Generator.randomUsingDefaults$Category(Generator$Category.FOOD));
    return super.build();
  }
  initRooms(): ArrayList<Room> {
    let initRooms = new ArrayList();
    initRooms.add(this.roomEntrance = new VaultEntranceRoom()._VaultEntranceRoom());
    VaultRoom.setupChances();
    let i = 0;
    while (i < 9) {
      let r = VaultRoom.createRoom();
      i = (i + r.sizeFactor()) | 0;
      initRooms.add(r);
    }
    initRooms.add(new VaultTokensRoom()._VaultTokensRoom());
    initRooms.add(new VaultSimpleEnemyTreasureRoom()._VaultSimpleEnemyTreasureRoom());
    VaultTreasureRoom.generateRoomList();
    for (i = 0; i < 7; i++) {
      initRooms.add(VaultTreasureRoom.nextRoom());
    }
    initRooms.add(new VaultFinalRoom()._VaultFinalRoom());
    return initRooms;
  }
  levelExplorePercent(depth: number): number {
    let seen = 0;
    let total = 0;
    for (let i = 0; i < this.length_; i++) {
      if (this.discoverable[i]) {
        total++;
      }
      if (this.visited[i]) {
        seen++;
      }
    }
    return Math.min(1, Math.fround((Math.fround(seen * 1.25)) / total));
  }
  builder(): Builder {
    return new GridBuilder()._GridBuilder();
  }
  painter(): Painter {
    return new (VaultLevel$1())().$o(this)._CityPainter().setWater(Math.fround(0.15), 12).setGrass(Math.fround(0.3), 3).setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }
  nTraps(): number {
    return 0;
  }
  activateTransition(hero: Hero, transition: LevelTransition): boolean {
    return false;
  }
  setupEquipment(): void {
    for (let i = 0; i < this.equipmentLoot.length; i++) {
      let empty = true;
      if (this.equipmentLoot[i] != null) {
        for (let j = 0; j < this.equipmentLoot[i].length; j++) {
          if (this.equipmentLoot[i][j] != null) {
            empty = false;
          }
        }
      }
      if (empty) {
        this.setupEquipmentAtTier(i);
      }
    }
  }
  setupEquipmentAtTier(lootTier: number): void {
    let lootList = new ArrayList();
    let loot: Item;
    do {
      switch (lootTier) {
        default:
        case 0:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T2);
          break;
        case 1:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T2);
          break;
        case 2:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T3);
          break;
        case 3:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T4);
          break;
      }
    } while (lootTier > 1 && this.generatedClasses.contains(loot.getClass()));
    this.generatedClasses.add(loot.getClass());
    if (lootTier === 0) {
      loot.level$int(lootTier);
    } else {
      loot.level$int((lootTier + 1) | 0);
    }
    if (Random.Int$int(3) >= lootTier) {
      (loot).enchant$Enchantment(null);
    } else {
      (loot).enchant$();
    }
    lootList.add(loot);
    do {
      switch (lootTier) {
        default:
        case 0:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T2);
          break;
        case 1:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T3);
          break;
        case 2:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T4);
          break;
        case 3:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T5);
          break;
      }
    } while (lootTier > 0 && this.generatedClasses.contains(loot.getClass()));
    this.generatedClasses.add(loot.getClass());
    loot.level$int(lootTier);
    if (Random.Int$int(3) >= lootTier) {
      (loot).enchant$Enchantment(null);
    } else {
      (loot).enchant$();
    }
    lootList.add(loot);
    do {
      switch (lootTier) {
        default:
        case 0:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.MIS_T2);
          break;
        case 1:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.MIS_T3);
          break;
        case 2:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.MIS_T4);
          break;
        case 3:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.MIS_T5);
          break;
      }
    } while (this.generatedClasses.contains(loot.getClass()));
    this.generatedClasses.add(loot.getClass());
    loot.level$int(lootTier);
    if (Random.Int$int(3) >= lootTier) {
      (loot).enchant$Enchantment(null);
    } else {
      (loot).enchant$();
    }
    lootList.add(loot);
    switch (lootTier) {
      default:
      case 0:
        loot = new LeatherArmor()._LeatherArmor();
        break;
      case 1:
        loot = new MailArmor()._MailArmor();
        break;
      case 2:
        loot = new ScaleArmor()._ScaleArmor();
        break;
      case 3:
        loot = new PlateArmor()._PlateArmor();
        break;
    }
    this.generatedClasses.add(loot.getClass());
    loot.level$int(lootTier);
    if (Random.Int$int(3) >= lootTier) {
      (loot).inscribe$Glyph(null);
    } else {
      (loot).inscribe$();
    }
    lootList.add(loot);
    do {
      loot = Generator.randomUsingDefaults$Category(Generator$Category.WAND);
    } while (this.generatedClasses.contains(loot.getClass()) || loot instanceof WandOfRegrowth || loot instanceof WandOfTransfusion || loot instanceof WandOfCorruption);
    this.generatedClasses.add(loot.getClass());
    loot.level$int(lootTier);
    (loot).curCharges = (loot).maxCharges;
    lootList.add(loot);
    do {
      loot = Generator.randomUsingDefaults$Category(Generator$Category.RING);
    } while (this.generatedClasses.contains(loot.getClass()) || loot instanceof RingOfWealth || loot instanceof RingOfMight || loot instanceof RingOfForce);
    this.generatedClasses.add(loot.getClass());
    loot.level$int(lootTier);
    lootList.add(loot);
    this.equipmentLoot[lootTier] = $J.toArrayInto(lootList.toArray(), $J.newArray(0, null));
  }
  createEquipment(lootTier: number): Item {
    this.setupEquipment();
    let idx: number;
    if (lootTier >= 2) {
      idx = this.higherTierIdx;
      if (idx >= this.equipmentLoot[lootTier].length) {
        idx = 0;
        this.higherTierIdx = 0;
      } else {
        this.higherTierIdx++;
      }
    } else {
      idx = this.lowerTierIdx;
      if (idx >= this.equipmentLoot[lootTier].length) {
        idx = 0;
        this.lowerTierIdx = 0;
      } else {
        this.lowerTierIdx++;
      }
    }
    while (this.equipmentLoot[lootTier][idx] == null) {
      idx++;
      if (idx >= this.equipmentLoot[lootTier].length) {
        idx = 0;
      }
    }
    let loot = this.equipmentLoot[lootTier][idx];
    this.equipmentLoot[lootTier][idx] = null;
    loot.cursed = false;
    if (loot instanceof Ring) {
      loot.levelKnown = loot.cursedKnown = true;
    } else {
      loot.identify$boolean(false);
    }
    return loot;
  }
  setupConsumables(): void {
    if (this.consumableLoot.isEmpty()) {
      this.consumableLoot.add(new ArrayList());
      this.consumableLoot.add(new ArrayList());
      this.consumableLoot.add(new ArrayList());
      this.consumableLoot.add(new ArrayList());
    }
    if (this.consumableLoot.get(0).isEmpty()) {
      this.consumableLoot.get(0).addAll(Arrays.asList(Reflection.newInstance(Random.oneOf([$J.cls(PotionOfFrost), $J.cls(PotionOfLevitation)])), Reflection.newInstance(Random.oneOf([$J.cls(Mageroyal$Seed), $J.cls(Icecap$Seed), $J.cls(Stormvine$Seed)])), Reflection.newInstance(Random.oneOf([$J.cls(ScrollOfMirrorImage), $J.cls(ScrollOfTeleportation)])), Reflection.newInstance(Random.oneOf([$J.cls(StoneOfFlock), $J.cls(StoneOfShock), $J.cls(StoneOfFear)]))));
      Collections.shuffle(this.consumableLoot.get(0));
      this.consumableLoot.get(0).add(0, new PotionOfHealing()._PotionOfHealing());
    }
    if (this.consumableLoot.get(1).isEmpty()) {
      this.consumableLoot.get(1).addAll(Arrays.asList(Reflection.newInstance(Random.oneOf([$J.cls(PotionOfToxicGas), $J.cls(PotionOfParalyticGas)])), Reflection.newInstance(Random.oneOf([$J.cls(Firebloom$Seed), $J.cls(Sorrowmoss$Seed), $J.cls(Blindweed$Seed)])), Reflection.newInstance(Random.oneOf([$J.cls(ScrollOfRecharging), $J.cls(ScrollOfTerror)])), Reflection.newInstance(Random.oneOf([$J.cls(StoneOfDeepSleep), $J.cls(StoneOfClairvoyance), $J.cls(StoneOfAggression)]))));
      Collections.shuffle(this.consumableLoot.get(1));
      this.consumableLoot.get(1).add(0, new PotionOfHealing()._PotionOfHealing());
    }
    if (this.consumableLoot.get(2).isEmpty()) {
      this.consumableLoot.get(2).addAll(Arrays.asList(Reflection.newInstance(Random.oneOf([$J.cls(PotionOfMindVision), $J.cls(PotionOfLiquidFlame)])), Reflection.newInstance(Random.oneOf([$J.cls(Swiftthistle$Seed), $J.cls(Sungrass$Seed)])), Reflection.newInstance(Random.oneOf([$J.cls(ScrollOfLullaby), $J.cls(ScrollOfMagicMapping)])), Reflection.newInstance(Random.oneOf([$J.cls(StoneOfBlast), $J.cls(StoneOfBlink)]))));
      Collections.shuffle(this.consumableLoot.get(2));
      this.consumableLoot.get(2).add(0, new PotionOfHealing()._PotionOfHealing());
    }
    if (this.consumableLoot.get(3).isEmpty()) {
      this.consumableLoot.get(3).addAll(Arrays.asList(Reflection.newInstance(Random.oneOf([$J.cls(PotionOfExperience), $J.cls(PotionOfInvisibility)])), Reflection.newInstance(Random.oneOf([$J.cls(Earthroot$Seed), $J.cls(Starflower$Seed)])), Reflection.newInstance(Random.oneOf([$J.cls(ScrollOfRetribution), $J.cls(ScrollOfTransmutation)])), Reflection.newInstance(Random.oneOf([$J.cls(StoneOfEnchantment), $J.cls(StoneOfAugmentation)])), new PotionOfHealing()._PotionOfHealing()));
      Collections.shuffle(this.consumableLoot.get(3));
    }
  }
  createConsumabe(tier: number): Item {
    if (this.consumableLoot.isEmpty() || this.consumableLoot.get(tier).isEmpty()) {
      this.setupConsumables();
    }
    let result = this.consumableLoot.get(tier).removeAt(0);
    return result;
  }
  findT3SolveItem(): Item {
    Random.shuffle$ObjectArr(VaultLevel.T3SolveItems);
    let result = null;
    for (let itemCls of VaultLevel.T3SolveItems) {
      result = this.findPrizeItem$Class(itemCls);
      if (result != null) {
        return result;
      }
    }
    return null;
  }
  findT2SolveItem(): Item {
    Random.shuffle$ObjectArr(VaultLevel.T2SolveItems);
    let result = null;
    for (let itemCls of VaultLevel.T2SolveItems) {
      result = this.findPrizeItem$Class(itemCls);
      if (result != null) {
        return result;
      }
    }
    return this.findT3SolveItem();
  }
  createMob(): Mob {
    if (this.mobsToSpawn$VaultLevel.isEmpty()) {
      Collections.addAll(this.mobsToSpawn$VaultLevel, ...VaultLevel.T1Mobs);
      this.mobsToSpawn$VaultLevel.add(Random.oneOf(VaultLevel.T1Mobs));
      Collections.addAll(this.mobsToSpawn$VaultLevel, ...VaultLevel.T2Mobs);
      Collections.addAll(this.mobsToSpawn$VaultLevel, ...VaultLevel.T3Mobs);
      this.mobsToSpawn$VaultLevel.add(Random.oneOf(VaultLevel.T3Mobs));
      Random.shuffle$List(this.mobsToSpawn$VaultLevel);
    }
    let cls = this.mobsToSpawn$VaultLevel.removeAt(0);
    if (cls === $J.cls(VaultElemental)) {
      cls = VaultElemental.random();
    }
    return Reflection.newInstance(cls);
  }
  returnMob(cls: JClass<Mob>): void {
    this.mobsToSpawn$VaultLevel.add(0, cls);
  }
  createMobs(): void {
  }
  occupyCell(ch: Char): void {
    super.occupyCell(ch);
    if (ch === Dungeon.hero && (Imp$Quest.isCompleted() && !Imp$Quest.isOld())) {
      Level.beforeTransition();
      InterlevelScene.curTransition = new LevelTransition()._LevelTransition$Level$int$Type$int$int$Type(Dungeon.level, Dungeon.hero.pos, LevelTransition$Type.BRANCH_ENTRANCE, Dungeon.depth, 0, LevelTransition$Type.BRANCH_EXIT);
      InterlevelScene.mode = InterlevelScene$Mode.ASCEND;
      Game.switchScene$Class($J.cls(InterlevelScene));
    } else if (ch === Dungeon.hero) {
      let r = this.room$int(ch.pos);
      if (r instanceof VaultFinalRoom) {
        (r).processHeroStep(ch);
      }
    }
  }
  addRespawner(): Actor {
    return null;
  }
  createItems(): void {
    for (const $it0 = this.itemsToSpawn.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      let cell = this.randomDropCell$();
      this.drop(item, cell).type_ = Heap$Type.HEAP;
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
    }
    if (Dungeon.isChallenged(Challenges.DARKNESS)) {
      Random.pushGenerator$long(Random.Long$());
      for (let i = 0; i < 2; i++) {
        let cell = this.randomDropCell$();
        this.drop(new Torch()._Torch(), cell).type_ = Heap$Type.HEAP;
        if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
          this.map_[cell] = Terrain.GRASS;
          this.losBlocking[cell] = false;
        }
      }
      Random.popGenerator();
    }
    let tries = 1000;
    let cell: number;
    let r: Room;
    do {
      cell = this.randomDropCell$();
      r = this.room$int(cell);
      tries--;
    } while (!r.connected_.containsKey(this.roomEntrance) && tries > 0);
    this.drop(new PotionOfHealing()._PotionOfHealing(), cell).type_ = Heap$Type.HEAP;
    if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
      this.map_[cell] = Terrain.GRASS;
      this.losBlocking[cell] = false;
    }
  }
  seal(): void {
    if (!this.locked) {
      this.locked = true;
    }
  }
  unseal(): void {
    super.unseal();
    for (const $it1 = this.rooms_.iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      if (r instanceof VaultFinalRoom) {
        (r).unlock();
      }
    }
    Game.runOnRenderThread(new (VaultLevel$2())().$o(this));
  }
  static $clinit() {
    VaultLevel.T3SolveItems = [$J.cls(StoneOfBlink), $J.cls(PotionOfInvisibility)];
    VaultLevel.T2SolveItems = [$J.cls(StoneOfBlink), $J.cls(PotionOfInvisibility)];
    VaultLevel.T1Mobs = [$J.cls(VaultSkeleton), $J.cls(VaultDM100)];
    VaultLevel.T2Mobs = [$J.cls(VaultShaman), $J.cls(VaultDM200), $J.cls(VaultGhoul)];
    VaultLevel.T3Mobs = [$J.cls(VaultElemental), $J.cls(VaultGolem)];
  }
}

export class VaultLevel$VaultFlameTrap extends Trap {
  _VaultLevel$VaultFlameTrap(): this {
    this._Trap();
    this.color_ = Trap.BLACK;
    this.shape = Trap.DOTS;
    this.canBeHidden = false;
    this.active = false;
    return this;
  }
  activate(): void {
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  static setupTrap(level: Level, cell: number, initialCD: number, afterTriggerCD: number, triggers: number): void {
    let traps = Blob.seed$int$int$Class$Level(0, 0, $J.cls(VaultFlameTraps), level);
    traps.curCooldowns[cell] = initialCD;
    traps.afterTriggerCooldowns[cell] = afterTriggerCD;
    traps.triggersAfterCooldown[cell] = triggers;
    level.setTrap(new VaultLevel$VaultFlameTrap()._VaultLevel$VaultFlameTrap().reveal(), cell);
    Painter.set$Level$int$int(level, cell, Terrain.INACTIVE_TRAP);
  }
}

let $VaultLevel$1: any = null;
/** An anonymous class (VaultLevel.java:191). */
function VaultLevel$1(): any {
  return $VaultLevel$1 ??= $J.local(class extends CityPainter {
    hiddenDoorChance(l: Level): number {
      return 0;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel$1', []);
}

let $VaultLevel$2$1: any = null;
/** An anonymous class (VaultLevel.java:664). */
function VaultLevel$2$1(): any {
  return $VaultLevel$2$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.end();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel$2$1', ['com.watabou.utils.Callback']);
}

let $VaultLevel$2: any = null;
/** An anonymous class (VaultLevel.java:661). */
function VaultLevel$2(): any {
  return $VaultLevel$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (VaultLevel$2$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel$2', ['com.watabou.utils.Callback']);
}

$J.define(VaultLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel', ctors: { '': '_VaultLevel' }, clinit: true, lazy: ['T3SolveItems', 'T2SolveItems', 'T1Mobs', 'T2Mobs', 'T3Mobs'] });
$J.define(VaultLevel$VaultFlameTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel$VaultFlameTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_VaultLevel$VaultFlameTrap' } });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  VaultFlameTraps = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.VaultFlameTraps');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  VaultDM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM100');
  VaultDM200 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM200');
  VaultElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental');
  VaultGhoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultGhoul');
  VaultGolem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultGolem');
  VaultShaman = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultShaman');
  VaultSkeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultSkeleton');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Torch');
  LeatherArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.LeatherArmor');
  MailArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.MailArmor');
  PlateArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.PlateArmor');
  ScaleArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ScaleArmor');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  PotionOfMindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfMindVision');
  PotionOfParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfParalyticGas');
  PotionOfToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfToxicGas');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  RingOfForce = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce');
  RingOfMight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfMight');
  RingOfWealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfTerror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  StoneOfAggression = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAggression');
  StoneOfAugmentation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation');
  StoneOfBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlast');
  StoneOfBlink = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlink');
  StoneOfClairvoyance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfClairvoyance');
  StoneOfDeepSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfDeepSleep');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  StoneOfFear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfFear');
  StoneOfFlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfFlock');
  StoneOfShock = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfShock');
  WandOfCorruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorruption');
  WandOfRegrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth');
  WandOfTransfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfTransfusion');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GridBuilder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.GridBuilder');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  CityPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.CityPainter');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  VaultEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultEntranceRoom');
  VaultFinalRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom');
  VaultRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom');
  VaultSimpleEnemyTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultSimpleEnemyTreasureRoom');
  VaultTokensRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultTokensRoom');
  VaultTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Blindweed$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed$Seed');
  Earthroot$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Seed');
  Firebloom$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed');
  Icecap$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap$Seed');
  Mageroyal$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal$Seed');
  Sorrowmoss$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss$Seed');
  Starflower$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed');
  Stormvine$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine$Seed');
  Sungrass$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Seed');
  Swiftthistle$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$Seed');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
