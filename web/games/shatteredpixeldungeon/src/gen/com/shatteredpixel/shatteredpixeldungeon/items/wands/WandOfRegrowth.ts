// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfRegrowth.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Wand } from './Wand.ts';
import { Plant } from '../../plants/Plant.ts';
import { Plant$Seed } from '../../plants/Plant.ts';
import { NPC } from '../../actors/mobs/npcs/NPC.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, Buff, Doom, Roots, WildMagic$WildMagicTracker, DwarfKing, MagicMissile, Dewdrop, Generator, Generator$Category, Item, Level, Terrain, Ballistica, ConeAOE, Messages, Sungrass$Health, GameScene, ItemSpriteSheet, LotusSprite, Sample, ColorMath, GameMath, PathFinder, Random;

export class WandOfRegrowth extends Wand {
  totChrgUsed: number = 0;
  chargesOverLimit: number = 0;
  cone: ConeAOE = null;
  target: number = 0;
  static readonly TOTAL: string = 'totChrgUsed';
  static readonly OVER: string = 'chargesOverLimit';
  _WandOfRegrowth(): this {
    this._Wand();
    this.image_ = ItemSpriteSheet.WAND_REGROWTH;
    this.collisionProperties_ = Ballistica.WONT_STOP;
    this.totChrgUsed = 0;
    this.chargesOverLimit = 0;
    return this;
  }
  tryToZap(owner: Hero, target: number): boolean {
    if (super.tryToZap(owner, target)) {
      this.target = target;
      return true;
    } else {
      return false;
    }
  }
  onZap(bolt: Ballistica): void {
    let cells = new ArrayList(this.cone.cells);
    let furrowedChance = 0;
    if (this.totChrgUsed >= this.chargeLimit$int$WandOfRegrowth(Dungeon.hero.lvl)) {
      furrowedChance = Math.fround(((this.chargesOverLimit + 1) | 0) / 5);
    }
    let chrgUsed = this.chargesPerCast();
    let grassToPlace = $J.roundf(Math.fround((Math.fround(Math.fround(3.67) + Math.fround(this.buffedLvl() / 3))) * chrgUsed));
    for (let i = cells.iterator(); i.hasNext(); ) {
      let cell = i.next();
      let terr = Dungeon.level.map_[cell];
      if (!(terr === Terrain.EMPTY || terr === Terrain.EMBERS || terr === Terrain.EMPTY_DECO || terr === Terrain.GRASS || terr === Terrain.HIGH_GRASS || terr === Terrain.FURROWED_GRASS)) {
        i.remove();
      } else if (Char.hasProp(Actor.findChar(cell), Char$Property.IMMOVABLE)) {
        i.remove();
      } else if (Dungeon.level.plants.get(cell) != null) {
        i.remove();
      } else {
        if (terr !== Terrain.HIGH_GRASS && terr !== Terrain.FURROWED_GRASS) {
          Level.set$int$int(cell, Terrain.GRASS);
          GameScene.updateMap$int(cell);
        }
        let ch = Actor.findChar(cell);
        if (ch != null) {
          if (ch instanceof DwarfKing) {
            Statistics.qualifiedForBossChallengeBadge = false;
          }
          this.wandProc(ch, this.chargesPerCast());
          Buff.prolong(ch, $J.cls(Roots), Math.fround(4 * chrgUsed));
        }
      }
    }
    Random.shuffle$List(cells);
    if (this.chargesPerCast() >= 3) {
      let l = new WandOfRegrowth$Lotus()._WandOfRegrowth$Lotus();
      l.setLevel(this.buffedLvl());
      if (cells.contains(this.target) && Actor.findChar(this.target) == null) {
        cells.remove(this.target);
        l.pos = this.target;
        GameScene.add$Mob(l);
      } else {
        for (let i = (bolt.path.size() - 1) | 0; i >= 0; i--) {
          let c = bolt.path.get(i);
          if (cells.contains(c) && Actor.findChar(c) == null) {
            cells.remove(c);
            l.pos = c;
            GameScene.add$Mob(l);
            break;
          }
        }
      }
    }
    for (const $it0 = bolt.path.iterator(); $it0.hasNext(); ) {
      let cell = $it0.next();
      if (grassToPlace > 0 && cells.contains(cell)) {
        if (Random.Float$() > furrowedChance) {
          Level.set$int$int(cell, Terrain.HIGH_GRASS);
        } else {
          Level.set$int$int(cell, Terrain.FURROWED_GRASS);
        }
        GameScene.updateMap$int(cell);
        grassToPlace--;
        cells.remove(cell);
        cells.add(cell);
      }
    }
    if (!cells.isEmpty() && Random.Float$() > furrowedChance && (Random.Int$int(6) < chrgUsed)) {
      let cell = cells.removeAt(0);
      Dungeon.level.plant(Random.Int$int(2) === 0 ? new WandOfRegrowth$Seedpod$Seed()._WandOfRegrowth$Seedpod$Seed() : new WandOfRegrowth$Dewcatcher$Seed()._WandOfRegrowth$Dewcatcher$Seed(), cell);
    }
    if (!cells.isEmpty() && Random.Float$() > furrowedChance && (Random.Int$int(3) < chrgUsed)) {
      let cell = cells.removeAt(0);
      Dungeon.level.plant(Generator.randomUsingDefaults$Category(Generator$Category.SEED), cell);
    }
    for (const $it1 = cells.iterator(); $it1.hasNext(); ) {
      let cell = $it1.next();
      if (grassToPlace <= 0 || bolt.path.contains(cell)) {
        break;
      }
      if (Dungeon.level.map_[cell] === Terrain.HIGH_GRASS) {
        continue;
      }
      if (Random.Float$() > furrowedChance) {
        Level.set$int$int(cell, Terrain.HIGH_GRASS);
      } else {
        Level.set$int$int(cell, Terrain.FURROWED_GRASS);
      }
      GameScene.updateMap$int(cell);
      grassToPlace--;
    }
    if (this.totChrgUsed < this.chargeLimit$int$WandOfRegrowth(Dungeon.hero.lvl)) {
      this.chargesOverLimit = 0;
      this.totChrgUsed = (this.totChrgUsed + chrgUsed) | 0;
      if (this.totChrgUsed > this.chargeLimit$int$WandOfRegrowth(Dungeon.hero.lvl)) {
        this.chargesOverLimit = (this.totChrgUsed - this.chargeLimit$int$WandOfRegrowth(Dungeon.hero.lvl)) | 0;
        this.totChrgUsed = this.chargeLimit$int$WandOfRegrowth(Dungeon.hero.lvl);
      }
    } else {
      this.chargesOverLimit = (this.chargesOverLimit + chrgUsed) | 0;
    }
  }
  chargeLimit$int$WandOfRegrowth(heroLvl: number): number {
    return this.chargeLimit$int$int$WandOfRegrowth(heroLvl, this.level$());
  }
  chargeLimit$int$int$WandOfRegrowth(heroLvl: number, wndLvl: number): number {
    if (wndLvl >= 10) {
      return 2147483647;
    } else {
      return $J.roundf(Math.fround(20 + Math.fround(Math.imul(heroLvl, ((2 + wndLvl) | 0)) * (Math.fround(1 + ($J.idiv(wndLvl, ((50 - Math.imul(5, wndLvl)) | 0))))))));
    }
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let grass = false;
    let terr = Dungeon.level.map_[attacker.pos];
    if (terr === Terrain.GRASS || terr === Terrain.HIGH_GRASS || terr === Terrain.FURROWED_GRASS) {
      grass = true;
    }
    terr = Dungeon.level.map_[defender.pos];
    if (terr === Terrain.GRASS || terr === Terrain.HIGH_GRASS || terr === Terrain.FURROWED_GRASS) {
      grass = true;
    }
    if (grass) {
      let level = Math.max(0, staff.buffedLvl());
      let healing = $J.roundf(Math.fround(Math.fround(Math.fround(damage * (Math.fround(level + 2))) / (Math.fround(level + 6))) / 2));
      healing = $J.roundf(Math.fround(healing * Wand.procChanceMultiplier(attacker)));
      Buff.affect$Char$Class(attacker, $J.cls(Sungrass$Health)).boost(healing);
    }
  }
  fx(bolt: Ballistica, callback: Callback): void {
    let maxDist = (2 + Math.imul(2, this.chargesPerCast())) | 0;
    this.cone = new ConeAOE()._ConeAOE$Ballistica$float$float$int(bolt, Math.fround(maxDist), Math.fround((20 + Math.imul(10, this.chargesPerCast())) | 0), Ballistica.STOP_SOLID | Ballistica.STOP_TARGET);
    let longestRay = null;
    for (const $it2 = this.cone.outerRays.iterator(); $it2.hasNext(); ) {
      let ray = $it2.next();
      if (longestRay == null || ray.dist > longestRay.dist) {
        longestRay = ray;
      }
      (Item.curUser.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(MagicMissile.FOLIAGE_CONE, Item.curUser.sprite_, ray.path.get(ray.dist), null);
    }
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.FOLIAGE_CONE, Item.curUser.sprite_, longestRay.path.get($J.idiv(longestRay.dist, 2)), callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  chargesPerCast(): number {
    if (this.cursed || (this.charger != null && this.charger.target != null && this.charger.target.buff($J.cls(WildMagic$WildMagicTracker)) != null)) {
      return 1;
    }
    return $J.d2i(GameMath.gate(1, Math.fround($J.d2i(Math.ceil(Math.fround(this.curCharges * Math.fround(0.3))))), 3));
  }
  statsDesc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'stats_desc', [this.chargesPerCast()]);
    if (this.isIdentified()) {
      let chargeLeft = (this.chargeLimit$int$WandOfRegrowth(Dungeon.hero.lvl) - this.totChrgUsed) | 0;
      if (chargeLeft < 10000) {
        desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'degradation', [Math.max(chargeLeft, 0)]);
      }
    }
    return desc;
  }
  upgradeStat1(level: number): string {
    return Messages.decimalFormat('#.##', Math.fround(3 + Math.fround(((2 + level) | 0) / 3)));
  }
  upgradeStat2(level: number): string {
    if (level >= 10) {
      return '∞';
    } else {
      return String(this.chargeLimit$int$int$WandOfRegrowth(Dungeon.hero.lvl, level));
    }
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(ColorMath.random(17408, 8965188));
    particle.am = 1;
    particle.setLifespan(1);
    particle.setSize(1, 1.5);
    particle.shuffleXY(0.5);
    let dst = Random.Float$float(11);
    particle.x = Math.fround(particle.x - dst);
    particle.y = Math.fround(particle.y + dst);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WandOfRegrowth.TOTAL, this.totChrgUsed);
    bundle.put$String$int(WandOfRegrowth.OVER, this.chargesOverLimit);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.totChrgUsed = bundle.getInt(WandOfRegrowth.TOTAL);
    this.chargesOverLimit = bundle.getInt(WandOfRegrowth.OVER);
  }
}

export class WandOfRegrowth$Dewcatcher extends Plant {
  _WandOfRegrowth$Dewcatcher(): this {
    this._Plant();
    this.image_ = 13;
    return this;
  }
  activate(ch: Char): void {
    let nDrops = Random.NormalIntRange(3, 6);
    let candidates = new ArrayList();
    for (let i of PathFinder.NEIGHBOURS8) {
      if (Dungeon.level.passable[(this.pos + i) | 0] && ((this.pos + i) | 0) !== Dungeon.level.entrance() && ((this.pos + i) | 0) !== Dungeon.level.exit()) {
        candidates.add((this.pos + i) | 0);
      }
    }
    for (let i = 0; i < nDrops && !candidates.isEmpty(); i++) {
      let c = Random.element$Collection(candidates);
      if (Dungeon.level.heaps.get(c) == null) {
        Dungeon.level.drop(new Dewdrop()._Dewdrop(), c).sprite_.drop$int(this.pos);
      } else {
        Dungeon.level.drop(new Dewdrop()._Dewdrop(), c).sprite_.drop$int(c);
      }
      candidates.remove(c);
    }
  }
}

export class WandOfRegrowth$Dewcatcher$Seed extends Plant$Seed {
  _WandOfRegrowth$Dewcatcher$Seed(): this {
    this._Plant$Seed();
    this.plantClass = $J.cls(WandOfRegrowth$Dewcatcher);
    return this;
  }
}

export class WandOfRegrowth$Seedpod extends Plant {
  _WandOfRegrowth$Seedpod(): this {
    this._Plant();
    this.image_ = 14;
    return this;
  }
  activate(ch: Char): void {
    let nSeeds = Random.NormalIntRange(2, 4);
    let candidates = new ArrayList();
    for (let i of PathFinder.NEIGHBOURS8) {
      if (Dungeon.level.passable[(this.pos + i) | 0] && ((this.pos + i) | 0) !== Dungeon.level.entrance() && ((this.pos + i) | 0) !== Dungeon.level.exit()) {
        candidates.add((this.pos + i) | 0);
      }
    }
    for (let i = 0; i < nSeeds && !candidates.isEmpty(); i++) {
      let c = Random.element$Collection(candidates);
      Dungeon.level.drop(Generator.randomUsingDefaults$Category(Generator$Category.SEED), c).sprite_.drop$int(this.pos);
      candidates.remove(c);
    }
  }
}

export class WandOfRegrowth$Seedpod$Seed extends Plant$Seed {
  _WandOfRegrowth$Seedpod$Seed(): this {
    this._Plant$Seed();
    this.plantClass = $J.cls(WandOfRegrowth$Seedpod);
    return this;
  }
}

export class WandOfRegrowth$Lotus extends NPC {
  wandLvl: number = 0;
  static readonly WAND_LVL: string = 'wand_lvl';
  _WandOfRegrowth$Lotus(): this {
    this._NPC();
    this.alignment = Char$Alignment.NEUTRAL;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.STATIC);
    this.spriteClass = $J.cls(LotusSprite);
    this.viewDistance = 1;
    this.wandLvl = 0;
    this.immunities_.add($J.cls(Doom));
    return this;
  }
  setLevel(lvl: number): void {
    this.wandLvl = lvl;
    this.HP = this.HT = (25 + Math.imul(3, lvl)) | 0;
  }
  inRange(pos: number): boolean {
    return Dungeon.level.trueDistance(this.pos, pos) <= Math.fround(this.wandLvl);
  }
  seedPreservation(): number {
    return Math.min(1, Math.fround(Math.fround(0.4) + Math.fround(Math.fround(0.04) * this.wandLvl)));
  }
  canInteract(c: Char): boolean {
    return false;
  }
  act(): boolean {
    super.act();
    if (--this.HP <= 0) {
      this.destroy();
      this.sprite_.die();
    }
    return true;
  }
  damage(dmg: number, src: any): void {
  }
  add(buff: Buff): boolean {
    return false;
  }
  destroy(): void {
    super.destroy();
    Dungeon.observe$();
    GameScene.updateFog$int$int(this.pos, (this.viewDistance + 1) | 0);
  }
  isInvulnerable(effect: JClass): boolean {
    return true;
  }
  description(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (Actor.chars().contains(this)) {
      let preservation = $J.roundf(Math.fround(this.seedPreservation() * 100));
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'wand_info', [this.wandLvl, preservation, preservation]);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WandOfRegrowth$Lotus.WAND_LVL, this.wandLvl);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.wandLvl = bundle.getInt(WandOfRegrowth$Lotus.WAND_LVL);
  }
}

$J.define(WandOfRegrowth, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand', ctors: { '': '_WandOfRegrowth' }, meths: { 'chargeLimit(int,int)': 'chargeLimit$int$int$WandOfRegrowth', 'chargeLimit(int)': 'chargeLimit$int$WandOfRegrowth' } });
$J.define(WandOfRegrowth$Dewcatcher, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Dewcatcher', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_WandOfRegrowth$Dewcatcher' } });
$J.define(WandOfRegrowth$Dewcatcher$Seed, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Dewcatcher$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_WandOfRegrowth$Dewcatcher$Seed' } });
$J.define(WandOfRegrowth$Seedpod, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Seedpod', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_WandOfRegrowth$Seedpod' } });
$J.define(WandOfRegrowth$Seedpod$Seed, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Seedpod$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_WandOfRegrowth$Seedpod$Seed' } });
$J.define(WandOfRegrowth$Lotus, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_WandOfRegrowth$Lotus' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  WildMagic$WildMagicTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$WildMagicTracker');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Sungrass$Health = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Health');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  LotusSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.LotusSprite');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
