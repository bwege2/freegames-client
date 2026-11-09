// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/WallOfLight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { TargetedClericSpell } from './TargetedClericSpell.ts';
import { Blob } from '../../blobs/Blob.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Paralysis, Talent, MagicMissile$WhiteParticle, WandOfBlastWave, Ballistica, Messages, GameScene, HeroIcon, GLog, Sample, PathFinder;

export class WallOfLight extends TargetedClericSpell {
  static INSTANCE: WallOfLight = null;
  _WallOfLight(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.WALL_OF_LIGHT;
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [(1 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.WALL_OF_LIGHT))) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  targetingFlags(): number {
    return -1;
  }
  chargeUse(hero: Hero): number {
    if (Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)) != null && Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)).volume_ > 0) {
      return 0;
    }
    return 3;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.WALL_OF_LIGHT);
  }
  onCast(tome: HolyTome, hero: Hero): void {
    if (Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)) != null && Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)).volume_ > 0) {
      Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)).fullyClear();
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'early_end', []), []);
      return;
    }
    super.onCast(tome, hero);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (target === hero.pos) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'invalid_target', []), []);
      return;
    }
    let closest = hero.pos;
    let closestIdx = -1;
    for (let i = 0; i < PathFinder.CIRCLE8.length; i++) {
      let ofs = PathFinder.CIRCLE8[i];
      if (Dungeon.level.trueDistance(target, (hero.pos + ofs) | 0) < Dungeon.level.trueDistance(target, closest)) {
        closest = (hero.pos + ofs) | 0;
        closestIdx = i;
      }
    }
    let leftDirX = 0;
    let leftDirY = 0;
    let rightDirX = 0;
    let rightDirY = 0;
    let steps = Dungeon.hero.pointsInTalent(Talent.WALL_OF_LIGHT);
    switch (closestIdx) {
      case 0:
        leftDirX = -1;
        leftDirY = 1;
        rightDirX = 1;
        rightDirY = -1;
        break;
      case 1:
        leftDirX = -1;
        rightDirX = 1;
        leftDirY = rightDirY = 0;
        break;
      case 2:
        leftDirX = 1;
        leftDirY = 1;
        rightDirX = -1;
        rightDirY = -1;
        break;
      case 3:
        leftDirY = -1;
        rightDirY = 1;
        leftDirX = rightDirX = 0;
        break;
      case 4:
        leftDirX = 1;
        leftDirY = -1;
        rightDirX = -1;
        rightDirY = 1;
        break;
      case 5:
        leftDirX = 1;
        rightDirX = -1;
        leftDirY = rightDirY = 0;
        break;
      case 6:
        leftDirX = -1;
        leftDirY = -1;
        rightDirX = 1;
        rightDirY = 1;
        break;
      case 7:
        leftDirY = -1;
        rightDirY = 1;
        leftDirX = rightDirX = 0;
        break;
    }
    if (Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)) != null) {
      Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)).fullyClear();
    }
    let placedWall = false;
    let knockBackDir = PathFinder.CIRCLE8[closestIdx];
    if (Dungeon.level.solid[closest] && Dungeon.level.solid[(hero.pos + PathFinder.CIRCLE8[((closestIdx + 1) | 0) % 8]) | 0] && Dungeon.level.solid[(hero.pos + PathFinder.CIRCLE8[((closestIdx + 7) | 0) % 8]) | 0]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'invalid_target', []), []);
      return;
    }
    this.onSpellCast(tome, hero);
    this.placeWall(closest, knockBackDir);
    let leftPos = closest;
    let rightPos = closest;
    for (let i = 0; i < steps; i++) {
      if (leftDirY !== 0) {
        leftPos = (leftPos + Math.imul(leftDirY, Dungeon.level.width())) | 0;
        if (!Dungeon.level.insideMap(leftPos)) {
          break;
        }
        this.placeWall(leftPos, knockBackDir);
      }
      if (leftDirX !== 0) {
        leftPos = (leftPos + leftDirX) | 0;
        if (!Dungeon.level.insideMap(leftPos)) {
          break;
        }
        this.placeWall(leftPos, knockBackDir);
      }
    }
    for (let i = 0; i < steps; i++) {
      if (rightDirX !== 0) {
        rightPos = (rightPos + rightDirX) | 0;
        if (!Dungeon.level.insideMap(rightPos)) {
          break;
        }
        this.placeWall(rightPos, knockBackDir);
      }
      if (rightDirY !== 0) {
        rightPos = (rightPos + Math.imul(rightDirY, Dungeon.level.width())) | 0;
        if (!Dungeon.level.insideMap(rightPos)) {
          break;
        }
        this.placeWall(rightPos, knockBackDir);
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    hero.sprite_.zap$int(closest);
    Dungeon.hero.spendAndNext(1);
  }
  placeWall(pos: number, knockbackDIR: number): void {
    if (!Dungeon.level.solid[pos]) {
      GameScene.add$Blob(Blob.seed$int$int$Class(pos, 20, $J.cls(WallOfLight$LightWall)));
      let ch = Actor.findChar(pos);
      if (ch != null && ch.alignment === Char$Alignment.ENEMY) {
        WandOfBlastWave.throwChar(ch, new Ballistica()._Ballistica(pos, (pos + knockbackDIR) | 0, Ballistica.PROJECTILE), 1, false, false, WallOfLight.INSTANCE);
        Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), ch.cooldown());
      }
    }
  }
  static $clinit() {
    WallOfLight.INSTANCE = new WallOfLight()._WallOfLight();
  }
}

export class WallOfLight$LightWall extends Blob {
  _WallOfLight$LightWall(): this {
    this._Blob();
    this.alwaysVisible = true;
    return this;
  }
  evolve(): void {
    let cell: number;
    let l = Dungeon.level;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, l.width())) | 0;
        this.off[cell] = this.cur[cell] > 0 ? (this.cur[cell] - 1) | 0 : 0;
        this.volume_ = (this.volume_ + this.off[cell]) | 0;
        if (this.off[cell] === 0 && this.cur[cell] > 0) {
          this.cellsToFlagUpdate.add(cell);
        }
      }
    }
  }
  seed(level: Level, cell: number, amount: number): void {
    super.seed(level, cell, amount);
    level.updateCellFlags(cell);
  }
  clear(cell: number): void {
    super.clear(cell);
    if (this.cur == null) {
      return;
    }
    Dungeon.level.updateCellFlags(cell);
  }
  fullyClear(): void {
    super.fullyClear();
    Dungeon.level.buildFlagMaps();
  }
  onBuildFlagMaps(l: Level): void {
    if (this.volume_ > 0) {
      for (let i = 0; i < l.length(); i++) {
        this.onUpdateCellFlags(l, i);
      }
    }
  }
  onUpdateCellFlags(l: Level, cell: number): void {
    if (this.volume_ > 0 && this.cur[cell] > 0) {
      l.solid[cell] = true;
      l.passable[cell] = false;
      l.avoid[cell] = false;
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(MagicMissile$WhiteParticle.WALL, Math.fround(0.02));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(WallOfLight, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.WallOfLight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_WallOfLight' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(WallOfLight$LightWall, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.WallOfLight$LightWall', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_WallOfLight$LightWall' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  MagicMissile$WhiteParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WhiteParticle');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
