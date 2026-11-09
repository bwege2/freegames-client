// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfLightning.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DamageWand } from './DamageWand.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Actor, Buff, Buff$buffType, DwarfKing, CellEmitter, Lightning, Lightning$Arc, SparkParticle, Item, Wand, Messages, PixelScene, ItemSpriteSheet, DungeonTilemap, BuffIndicator, GLog, Sample, BArray, PathFinder, Random;

export class WandOfLightning extends DamageWand {
  affected: ArrayList<Char> = null;
  arcs: ArrayList<Lightning$Arc> = null;
  _WandOfLightning(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_LIGHTNING;
    this.affected = new ArrayList();
    this.arcs = new ArrayList();
    return this;
  }
  min$int(lvl: number): number {
    return (5 + lvl) | 0;
  }
  max$int(lvl: number): number {
    return (10 + Math.imul(5, lvl)) | 0;
  }
  onZap(bolt: Ballistica): void {
    for (let ch of $J.toArrayInto(this.affected.toArray(), $J.newArray(0, null))) {
      if (ch !== Item.curUser && ch.alignment === Item.curUser.alignment && ch.pos !== bolt.collisionPos) {
        this.affected.remove(ch);
      } else if (ch.buff($J.cls(WandOfLightning$LightningCharge)) != null) {
        this.affected.remove(ch);
      }
    }
    let multiplier = Math.fround(Math.fround(0.4) + (Math.fround(Math.fround(0.6) / this.affected.size())));
    if (Dungeon.level.water[bolt.collisionPos]) {
      multiplier = 1;
    }
    for (const $it0 = this.affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch === Dungeon.hero) {
        PixelScene.shake(2, Math.fround(0.3));
      }
      ch.sprite_.centerEmitter().burst(SparkParticle.FACTORY, 3);
      ch.sprite_.flash();
      this.wandProc(ch, this.chargesPerCast());
      if (ch === Item.curUser && ch.isAlive()) {
        ch.damage($J.roundf(Math.fround(Math.fround(this.damageRoll$() * multiplier) * 0.5)), this);
        if (!Item.curUser.isAlive()) {
          Badges.validateDeathFromFriendlyMagic();
          Dungeon.fail(this);
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
        }
      } else {
        ch.damage($J.roundf(Math.fround(this.damageRoll$() * multiplier)), this);
      }
    }
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let procChance = Math.fround(Math.fround((Math.fround(this.buffedLvl() + 1)) / (Math.fround(this.buffedLvl() + 4))) * Wand.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      Buff.prolong(attacker, $J.cls(WandOfLightning$LightningCharge), Math.fround(powerMulti * WandOfLightning$LightningCharge.DURATION));
      attacker.sprite_.centerEmitter().burst(SparkParticle.FACTORY, 10);
      attacker.sprite_.flash();
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    }
  }
  arc(ch: Char): void {
    let dist = Dungeon.level.water[ch.pos] ? 2 : 1;
    if (Item.curUser.buff($J.cls(WandOfLightning$LightningCharge)) != null) {
      dist++;
    }
    let hitThisArc = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(ch.pos, BArray.not(Dungeon.level.solid, null), dist);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        let n = Actor.findChar(i);
        if (n === Dungeon.hero && PathFinder.distance[i] > 1) {
          continue;
        } else if (n != null && !this.affected.contains(n)) {
          hitThisArc.add(n);
        }
      }
    }
    this.affected.addAll(hitThisArc);
    for (const $it1 = hitThisArc.iterator(); $it1.hasNext(); ) {
      let hit = $it1.next();
      this.arcs.add(new Lightning$Arc()._Lightning$Arc$PointF$PointF(ch.sprite_.center$(), hit.sprite_.center$()));
      this.arc(hit);
    }
  }
  fx(bolt: Ballistica, callback: Callback): void {
    this.affected.clear();
    this.arcs.clear();
    let cell = bolt.collisionPos;
    let ch = Actor.findChar(cell);
    if (ch != null) {
      if (ch instanceof DwarfKing) {
        Statistics.qualifiedForBossChallengeBadge = false;
      }
      this.affected.add(ch);
      this.arcs.add(new Lightning$Arc()._Lightning$Arc$PointF$PointF(Item.curUser.sprite_.center$(), ch.sprite_.center$()));
      this.arc(ch);
    } else {
      this.arcs.add(new Lightning$Arc()._Lightning$Arc$PointF$PointF(Item.curUser.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(bolt.collisionPos)));
      CellEmitter.center(cell).burst(SparkParticle.FACTORY, 3);
    }
    Item.curUser.sprite_.parent.addToFront(new Lightning()._Lightning$List$Callback(this.arcs, null));
    Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    callback.call();
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(16777215);
    particle.am = Math.fround(0.6);
    particle.setLifespan(Math.fround(0.6));
    particle.acc.set$float$float(0, Math.fround(+10));
    particle.speed_.polar(Math.fround(-Random.Float$float(Math.fround(3.1415925))), 6);
    particle.setSize(0, 1.5);
    particle.sizeJitter = 1;
    particle.shuffleXY(1);
    let dst = Random.Float$float(1);
    particle.x = Math.fround(particle.x - dst);
    particle.y = Math.fround(particle.y + dst);
  }
}

export class WandOfLightning$LightningCharge extends FlavourBuff {
  static DURATION: number = 0;
  _WandOfLightning$LightningCharge(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.IMBUE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 1, 0);
  }
  static $clinit() {
    WandOfLightning$LightningCharge.DURATION = 10;
  }
}

$J.define(WandOfLightning, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfLightning' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.define(WandOfLightning$LightningCharge, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning$LightningCharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_WandOfLightning$LightningCharge' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Lightning$Arc = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning$Arc');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
