// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfCorrosion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Wand } from './Wand.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Blob, CorrosiveGas, Buff, Ooze, DwarfKing, CellEmitter, MagicMissile, Speck, CorrosionParticle, Item, Ballistica, Messages, GameScene, ItemSpriteSheet, Sample, ColorMath, PathFinder, Random;

export class WandOfCorrosion extends Wand {
  _WandOfCorrosion(): this {
    this._Wand();
    this.image_ = ItemSpriteSheet.WAND_CORROSION;
    this.collisionProperties_ = Ballistica.STOP_TARGET | Ballistica.STOP_SOLID;
    return this;
  }
  onZap(bolt: Ballistica): void {
    let gas = Blob.seed$int$int$Class(bolt.collisionPos, (50 + Math.imul(10, this.buffedLvl())) | 0, $J.cls(CorrosiveGas));
    CellEmitter.get(bolt.collisionPos).burst(Speck.factory$int(Speck.CORROSION), 10);
    gas.setStrength$int$Class((2 + this.buffedLvl()) | 0, $J.getClass(this));
    GameScene.add$Blob(gas);
    Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
    for (let i of PathFinder.NEIGHBOURS9) {
      let ch = Actor.findChar((bolt.collisionPos + i) | 0);
      if (ch != null) {
        this.wandProc(ch, this.chargesPerCast());
        if (i === 0 && ch instanceof DwarfKing) {
          Statistics.qualifiedForBossChallengeBadge = false;
        }
      }
    }
    if (Actor.findChar(bolt.collisionPos) == null) {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.CORROSION, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let level = Math.max(0, this.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 3))) * Wand.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      Buff.affect$Char$Class(defender, $J.cls(Ooze)).set(Math.fround(Ooze.DURATION * powerMulti));
      CellEmitter.center(defender.pos).burst(CorrosionParticle.SPLASH, 5);
    }
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(ColorMath.random(11184810, 16746496));
    particle.am = Math.fround(0.6);
    particle.setLifespan(1);
    particle.acc.set$float$float(0, 20);
    particle.setSize(0.5, 3);
    particle.shuffleXY(1);
  }
  statsDesc(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [(2 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [2]);
    }
  }
  upgradeStat1(level: number): string {
    return String((level + 2) | 0);
  }
  upgradeStat2(level: number): string {
    return Messages.decimalFormat('#.##x', Math.fround(1 + Math.fround(Math.fround(0.2) * level)));
  }
}

$J.define(WandOfCorrosion, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorrosion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand', ctors: { '': '_WandOfCorrosion' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  CorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  CorrosionParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.CorrosionParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
