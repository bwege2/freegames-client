// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfPrismaticLight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { DamageWand } from './DamageWand.ts';

let Assets$Sounds, Challenges, Dungeon, Actor, Char$Property, Blindness, Buff, Cripple, Light, Beam$LightRay, CellEmitter, Speck, RainbowParticle, ShadowParticle, Item, ScrollOfMagicMapping, Wand, Terrain, Ballistica, Messages, GameScene, ItemSpriteSheet, DungeonTilemap, Sample, PathFinder, PointF, Random;

export class WandOfPrismaticLight extends DamageWand {
  _WandOfPrismaticLight(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_PRISMATIC_LIGHT;
    this.collisionProperties_ = Ballistica.MAGIC_BOLT;
    return this;
  }
  min$int(lvl: number): number {
    return (1 + lvl) | 0;
  }
  max$int(lvl: number): number {
    return (5 + Math.imul(3, lvl)) | 0;
  }
  onZap(beam: Ballistica): void {
    this.affectMap(beam);
    if (Dungeon.level.viewDistance < 6) {
      if (Dungeon.isChallenged(Challenges.DARKNESS)) {
        Buff.prolong(Item.curUser, $J.cls(Light), Math.fround(2 + this.buffedLvl()));
      } else {
        Buff.prolong(Item.curUser, $J.cls(Light), Math.fround(10 + Math.imul(this.buffedLvl(), 5)));
      }
    }
    let ch = Actor.findChar(beam.collisionPos);
    if (ch != null) {
      this.wandProc(ch, this.chargesPerCast());
      this.affectTarget(ch);
    }
  }
  affectTarget(ch: Char): void {
    let dmg = this.damageRoll$();
    if ((Random.Int$int((5 + this.buffedLvl()) | 0)) >= 3) {
      Buff.prolong(ch, $J.cls(Blindness), Math.fround(2 + (Math.fround(this.buffedLvl() * Math.fround(0.333)))));
      ch.sprite_.emitter().burst(Speck.factory$int(Speck.LIGHT), 6);
    }
    if (ch.properties().contains(Char$Property.DEMONIC) || ch.properties().contains(Char$Property.UNDEAD)) {
      ch.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), (10 + this.buffedLvl()) | 0);
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      ch.damage($J.roundf(Math.fround(dmg * Math.fround(1.333))), this);
    } else {
      ch.sprite_.centerEmitter().burst(RainbowParticle.BURST, (10 + this.buffedLvl()) | 0);
      ch.damage(dmg, this);
    }
  }
  affectMap(beam: Ballistica): void {
    let noticed = false;
    for (const $it0 = beam.subPath(0, beam.dist).iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (!Dungeon.level.insideMap(c)) {
        continue;
      }
      for (let n of PathFinder.NEIGHBOURS9) {
        let cell = (c + n) | 0;
        if (Dungeon.level.discoverable[cell]) {
          Dungeon.level.mapped[cell] = true;
        }
        let terr = Dungeon.level.map_[cell];
        if ((Terrain.flags[terr] & Terrain.SECRET) !== 0) {
          Dungeon.level.discover(cell);
          GameScene.discoverTile(cell, terr);
          ScrollOfMagicMapping.discover(cell);
          noticed = true;
        }
      }
      CellEmitter.center(c).burst(RainbowParticle.BURST, Random.IntRange(1, 2));
    }
    if (noticed) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SECRET);
    }
    GameScene.updateFog$();
  }
  upgradeStat2(level: number): string {
    return Messages.decimalFormat('#', Math.fround(100 * (Math.fround(1 - (Math.fround(3 / Math.fround(((5 + level) | 0)))))))) + '%';
  }
  upgradeStat3(level: number): string {
    if (Dungeon.isChallenged(Challenges.DARKNESS)) {
      return String((2 + level) | 0);
    } else {
      return String((10 + Math.imul(5, level)) | 0);
    }
  }
  fx(beam: Ballistica, callback: Callback): void {
    Item.curUser.sprite_.parent.add$Gizmo(new Beam$LightRay()._Beam$LightRay(Item.curUser.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(beam.collisionPos)));
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    callback.call();
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    Buff.prolong(defender, $J.cls(Cripple), Math.fround($J.roundf(Math.fround(((1 + staff.buffedLvl()) | 0) * Wand.procChanceMultiplier(attacker)))));
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(Random.Int$int(16777216));
    particle.am = 0.5;
    particle.setLifespan(1);
    particle.speed_.polar(Random.Float$float(PointF.PI2), 2);
    particle.setSize(1, 2);
    particle.radiateXY(0.5);
  }
}

$J.define(WandOfPrismaticLight, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfPrismaticLight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfPrismaticLight' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  Beam$LightRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$LightRay');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  RainbowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
