// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfBlastWave.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { DamageWand } from './DamageWand.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';
import { Image } from '../../../../watabou/noosa/Image.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Char, Char$Alignment, Char$Property, Buff, Paralysis, Hero, Effects, Effects$Type, MagicMissile, Pushing, Item, Wand, Weapon$Enchantment, Terrain, Door, TenguDartTrap, Ballistica, Messages, GameScene, ItemSpriteSheet, DungeonTilemap, GLog, Game, Sample, PathFinder, PointF, Random;

export class WandOfBlastWave extends DamageWand {
  _WandOfBlastWave(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_BLAST_WAVE;
    this.collisionProperties_ = Ballistica.PROJECTILE;
    return this;
  }
  min$int(lvl: number): number {
    return (1 + lvl) | 0;
  }
  max$int(lvl: number): number {
    return (3 + Math.imul(3, lvl)) | 0;
  }
  onZap(bolt: Ballistica): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
    WandOfBlastWave$BlastWave.blast$int(bolt.collisionPos);
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.traps.get((bolt.collisionPos + i) | 0) instanceof TenguDartTrap)) {
        Dungeon.level.pressCell$int((bolt.collisionPos + i) | 0);
      }
    }
    for (let i of PathFinder.NEIGHBOURS8) {
      let ch = Actor.findChar((bolt.collisionPos + i) | 0);
      if (ch != null) {
        this.wandProc(ch, this.chargesPerCast());
        if (ch.alignment !== Char$Alignment.ALLY) {
          ch.damage(this.damageRoll$(), this);
        }
        if ((ch.isAlive() || ch.flying || !Dungeon.level.pit[ch.pos]) && ch.pos === ((bolt.collisionPos + i) | 0)) {
          let trajectory = new Ballistica()._Ballistica(ch.pos, (ch.pos + i) | 0, Ballistica.MAGIC_BOLT);
          let strength = $J.roundf(Math.fround(1.5 + Math.fround(this.buffedLvl() / 2)));
          WandOfBlastWave.throwChar(ch, trajectory, strength, false, true, this);
        }
      }
    }
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch != null) {
      this.wandProc(ch, this.chargesPerCast());
      ch.damage(this.damageRoll$(), this);
      if ((ch.isAlive() || ch.flying || !Dungeon.level.pit[ch.pos]) && bolt.path.size() > ((bolt.dist + 1) | 0) && ch.pos === bolt.collisionPos) {
        let trajectory = new Ballistica()._Ballistica(ch.pos, bolt.path.get((bolt.dist + 1) | 0), Ballistica.MAGIC_BOLT);
        let strength = (this.buffedLvl() + 3) | 0;
        WandOfBlastWave.throwChar(ch, trajectory, strength, false, true, this);
      }
    }
  }
  static throwChar(ch: Char, trajectory: Ballistica, power: number, closeDoors: boolean, collideDmg: boolean, cause: any): void {
    if (ch.properties().contains(Char$Property.BOSS)) {
      power = $J.idiv(((power + 1) | 0), 2);
    }
    let dist = Math.min(trajectory.dist, power);
    let collided = dist === trajectory.dist;
    if (dist <= 0 || ch.rooted || ch.properties().contains(Char$Property.IMMOVABLE)) {
      return;
    }
    if (Char.hasProp(ch, Char$Property.LARGE)) {
      for (let i = 1; i <= dist; i++) {
        if (!Dungeon.level.openSpace[trajectory.path.get(i)]) {
          dist = (i - 1) | 0;
          collided = true;
          break;
        }
      }
    }
    if (Actor.findChar(trajectory.path.get(dist)) != null) {
      dist--;
      collided = true;
    }
    if (dist < 0) {
      return;
    }
    let newPos = trajectory.path.get(dist);
    if (newPos === ch.pos) {
      return;
    }
    let finalDist = dist;
    let finalCollided = collided && collideDmg;
    let initialpos = ch.pos;
    Actor.add$Actor(new Pushing()._Pushing$Char$int$int$Callback(ch, ch.pos, newPos, new (WandOfBlastWave$1())().$c(initialpos, ch, newPos, finalCollided, finalDist, cause, closeDoors)));
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    if (defender.buff($J.cls(Paralysis)) != null && defender.buff($J.cls(WandOfBlastWave$BWaveOnHitTracker)) == null) {
      defender.buff($J.cls(Paralysis)).detach();
      let dmg = Hero.heroDamageIntRange((8 + Math.imul(2, this.buffedLvl())) | 0, (12 + Math.imul(3, this.buffedLvl())) | 0);
      defender.damage($J.roundf(Math.fround(Wand.procChanceMultiplier(attacker) * dmg)), this);
      WandOfBlastWave$BlastWave.blast$int(defender.pos);
      Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
      Buff.prolong(defender, $J.cls(WandOfBlastWave$BWaveOnHitTracker), 3);
    }
  }
  upgradeStat2(level: number): string {
    return String((3 + level) | 0);
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.FORCE, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(6702114);
    particle.am = Math.fround(0.6);
    particle.setLifespan(3);
    particle.speed_.polar(Random.Float$float(PointF.PI2), Math.fround(0.3));
    particle.setSize(1, 2);
    particle.radiateXY(2.5);
  }
}

export class WandOfBlastWave$Knockback extends JObject {
  _WandOfBlastWave$Knockback(): this {
    return this;
  }
}

export class WandOfBlastWave$BWaveOnHitTracker extends FlavourBuff {
  _WandOfBlastWave$BWaveOnHitTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class WandOfBlastWave$BlastWave extends Image {
  static readonly TIME_TO_FADE: number = Math.fround(0.2);
  time: number = 0;
  size_: number = 0;
  _WandOfBlastWave$BlastWave(): this {
    this._Image$Image(Effects.get(Effects$Type.RIPPLE));
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ / 2));
    return this;
  }
  reset(pos: number, size: number): void {
    this.revive();
    this.x = Math.fround(Math.imul((pos % Dungeon.level.width()), DungeonTilemap.SIZE) + Math.fround((Math.fround(DungeonTilemap.SIZE - this.width_)) / 2));
    this.y = Math.fround(Math.imul(($J.idiv(pos, Dungeon.level.width())), DungeonTilemap.SIZE) + Math.fround((Math.fround(DungeonTilemap.SIZE - this.height_)) / 2));
    this.resetColor();
    this.scale_.set$float(0);
    this.time = WandOfBlastWave$BlastWave.TIME_TO_FADE;
    this.size_ = size;
  }
  update(): void {
    super.update();
    if ((this.time = Math.fround(this.time - Game.elapsed)) <= Math.fround(0)) {
      this.kill();
    } else {
      let p = Math.fround(this.time / WandOfBlastWave$BlastWave.TIME_TO_FADE);
      this.alpha$float(p);
      this.scale_.y = this.scale_.x = Math.fround((Math.fround(1 - p)) * this.size_);
    }
  }
  static blast$int(pos: number): void {
    WandOfBlastWave$BlastWave.blast$int$float(pos, 3);
  }
  static blast$int$float(pos: number, radius: number): void {
    WandOfBlastWave$BlastWave.blast$int$float$int(pos, radius, -1);
  }
  static blast$int$float$int(pos: number, radius: number, hardLight: number): void {
    let parent = Dungeon.hero.sprite_.parent;
    let b = parent.recycle($J.cls(WandOfBlastWave$BlastWave));
    parent.bringToFront(b);
    b.reset(pos, radius);
    if (hardLight !== -1) {
      b.hardlight$int(hardLight);
    }
  }
}

let $WandOfBlastWave$1: any = null;
/** An anonymous class (WandOfBlastWave.java:160). */
function WandOfBlastWave$1(): any {
  return $WandOfBlastWave$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$cv_initialpos !== this.$cv_ch.pos || Actor.findChar(this.$cv_newPos) != null) {
        this.$cv_ch.sprite_.place(this.$cv_ch.pos);
        return;
      }
      let oldPos = this.$cv_ch.pos;
      this.$cv_ch.pos = this.$cv_newPos;
      if (this.$cv_finalCollided && this.$cv_ch.isActive()) {
        this.$cv_ch.damage(Random.NormalIntRange(this.$cv_finalDist, Math.imul(2, this.$cv_finalDist)), new WandOfBlastWave$Knockback()._WandOfBlastWave$Knockback());
        if (this.$cv_ch.isActive()) {
          Buff.prolong(this.$cv_ch, $J.cls(Paralysis), Math.fround(1 + Math.fround(this.$cv_finalDist / 2)));
        } else if (this.$cv_ch === Dungeon.hero) {
          if (this.$cv_cause instanceof Wand || this.$cv_cause instanceof Weapon$Enchantment) {
            Badges.validateDeathFromFriendlyMagic();
          }
          GLog.n(Messages.get$Class$String$ObjectArr($J.cls(WandOfBlastWave), 'knockback_ondeath', []), []);
          Dungeon.fail(this.$cv_cause);
        }
      }
      if (this.$cv_closeDoors && Dungeon.level.map_[oldPos] === Terrain.OPEN_DOOR) {
        Door.leave(oldPos);
      }
      Dungeon.level.occupyCell(this.$cv_ch);
      if (this.$cv_ch === Dungeon.hero) {
        Dungeon.observe$();
        GameScene.updateFog$();
      } else if (Dungeon.level.heroFOV[this.$cv_initialpos] !== Dungeon.level.heroFOV[this.$cv_newPos]) {
        Dungeon.observe$();
      }
    }
    $c($initialpos, $ch, $newPos, $finalCollided, $finalDist, $cause, $closeDoors): this {
      this.$cv_initialpos = $initialpos; this.$cv_ch = $ch; this.$cv_newPos = $newPos; this.$cv_finalCollided = $finalCollided; this.$cv_finalDist = $finalDist; this.$cv_cause = $cause; this.$cv_closeDoors = $closeDoors;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$1', ['com.watabou.utils.Callback']);
}

$J.define(WandOfBlastWave, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfBlastWave' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.define(WandOfBlastWave$Knockback, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$Knockback', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_WandOfBlastWave$Knockback' } });
$J.define(WandOfBlastWave$BWaveOnHitTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$BWaveOnHitTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_WandOfBlastWave$BWaveOnHitTracker' } });
$J.define(WandOfBlastWave$BlastWave, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$BlastWave', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { '': '_WandOfBlastWave$BlastWave' }, meths: { 'blast(int,float,int)': 'blast$int$float$int', 'blast(int,float)': 'blast$int$float', 'blast(int)': 'blast$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects');
  Effects$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Door');
  TenguDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TenguDartTrap');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
