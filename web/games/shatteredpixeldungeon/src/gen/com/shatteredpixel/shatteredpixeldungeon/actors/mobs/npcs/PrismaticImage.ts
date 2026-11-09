// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/PrismaticImage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { NPC } from './NPC.ts';
import { Mob$Wandering } from '../Mob.ts';

let Assets$Sounds, Actor, Char$Alignment, CorrosiveGas, ToxicGas, AllyBuff, Buff, Burning, PrismaticGuard, Mob, CellEmitter, Speck, RingOfAccuracy, RingOfEvasion, Chasm, CharSprite$State, PrismaticSprite, Sample, Random;

export class PrismaticImage extends NPC {
  hero: Hero = null;
  heroID: number = 0;
  armTier: number = 0;
  deathTimer: number = 0;
  static readonly HEROID: string = 'hero_id';
  static readonly TIMER: string = 'timer';
  _PrismaticImage(): this {
    this._NPC();
    this.spriteClass = $J.cls(PrismaticSprite);
    this.HP = this.HT = 10;
    this.defenseSkill_ = 1;
    this.alignment = Char$Alignment.ALLY;
    this.intelligentAlly = true;
    this.state_ = this.HUNTING;
    this.WANDERING = new PrismaticImage$Wandering().$o(this)._PrismaticImage$Wandering();
    this.actPriority = (Actor.MOB_PRIO + 1) | 0;
    this.deathTimer = -1;
    this.immunities_.add($J.cls(ToxicGas));
    this.immunities_.add($J.cls(CorrosiveGas));
    this.immunities_.add($J.cls(Burning));
    this.immunities_.add($J.cls(AllyBuff));
    return this;
  }
  act(): boolean {
    if (!this.isAlive()) {
      this.deathTimer--;
      if (this.deathTimer > 0) {
        this.sprite_.alpha$float(Math.fround(((this.deathTimer + 3) | 0) / 8));
        this.spend(Actor.TICK);
      } else {
        this.destroy();
        this.sprite_.die();
      }
      return true;
    }
    if (this.deathTimer !== -1) {
      if (this.paralysed === 0) {
        this.sprite_.remove$State(CharSprite$State.PARALYSED);
      }
      this.deathTimer = -1;
      this.sprite_.resetColor();
    }
    if (this.hero == null) {
      this.hero = Actor.findById(this.heroID);
      if (this.hero == null) {
        this.destroy();
        this.sprite_.die();
        return true;
      }
    }
    if (this.hero.tier() !== this.armTier) {
      this.armTier = this.hero.tier();
      (this.sprite_).updateArmor$int(this.armTier);
    }
    return super.act();
  }
  die(cause: any): void {
    if (this.deathTimer === -1) {
      if (cause === $J.cls(Chasm)) {
        super.die(cause);
      } else {
        this.deathTimer = 5;
        this.sprite_.add(CharSprite$State.PARALYSED);
      }
    }
  }
  isActive(): boolean {
    return this.isAlive() || this.deathTimer > 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(PrismaticImage.HEROID, this.heroID);
    bundle.put$String$int(PrismaticImage.TIMER, this.deathTimer);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.heroID = bundle.getInt(PrismaticImage.HEROID);
    this.deathTimer = bundle.getInt(PrismaticImage.TIMER);
  }
  duplicate(hero: Hero, HP: number): void {
    this.hero = hero;
    this.heroID = this.hero.id();
    this.HP = HP;
    this.HT = PrismaticGuard.maxHP(hero);
  }
  damageRoll(): number {
    if (this.hero != null) {
      return Random.NormalIntRange((2 + $J.idiv(this.hero.lvl, 4)) | 0, (4 + $J.idiv(this.hero.lvl, 2)) | 0);
    } else {
      return Random.NormalIntRange(2, 4);
    }
  }
  attackSkill(target: Char): number {
    if (this.hero != null) {
      return $J.d2i((Math.fround(((9 + this.hero.lvl) | 0) * RingOfAccuracy.accuracyMultiplier(this.hero))));
    } else {
      return 0;
    }
  }
  defenseSkill(enemy: Char): number {
    if (this.hero != null) {
      let baseEvasion = (4 + this.hero.lvl) | 0;
      let heroEvasion = $J.d2i((Math.fround(((4 + this.hero.lvl) | 0) * RingOfEvasion.evasionMultiplier(this.hero))));
      if (this.hero.belongings.armor() != null) {
        heroEvasion = $J.d2i(this.hero.belongings.armor().evasionFactor(this, Math.fround(heroEvasion)));
      }
      return $J.idiv(Math.imul(super.defenseSkill(enemy), ((baseEvasion + heroEvasion) | 0)), 2);
    } else {
      return 0;
    }
  }
  drRoll(): number {
    let dr = super.drRoll();
    if (this.hero != null) {
      return (dr + this.hero.drRoll()) | 0;
    } else {
      return dr;
    }
  }
  defenseProc(enemy: Char, damage: number): number {
    if (this.hero != null && this.hero.belongings.armor() != null) {
      damage = this.hero.belongings.armor().proc(enemy, this, damage);
    }
    return super.defenseProc(enemy, damage);
  }
  glyphLevel(cls: JClass<Armor$Glyph>): number {
    if (this.hero != null) {
      return Math.max(super.glyphLevel(cls), this.hero.glyphLevel(cls));
    } else {
      return super.glyphLevel(cls);
    }
  }
  attackProc(enemy: Char, damage: number): number {
    if (enemy instanceof Mob) {
      (enemy).aggro(this);
    }
    return super.attackProc(enemy, damage);
  }
  sprite(): CharSprite {
    let s = super.sprite();
    this.hero = Actor.findById(this.heroID);
    if (this.hero != null) {
      this.armTier = this.hero.tier();
    } else {
      this.armTier = 1;
    }
    (s).updateArmor$int(this.armTier);
    return s;
  }
}

export class PrismaticImage$Wandering extends Mob$Wandering {
  _PrismaticImage$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (!enemyInFOV) {
      Buff.affect$Char$Class(this.$outer.hero, $J.cls(PrismaticGuard)).set$PrismaticImage(this.$outer);
      this.$outer.destroy();
      CellEmitter.get(this.$outer.pos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
      this.$outer.sprite_.die();
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
      return true;
    } else {
      return super.act(enemyInFOV, justAlerted);
    }
  }
}

$J.define(PrismaticImage, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_PrismaticImage' } });
$J.define(PrismaticImage$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_PrismaticImage$Wandering' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  CorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  PrismaticGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PrismaticGuard');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  RingOfAccuracy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfAccuracy');
  RingOfEvasion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  PrismaticSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.PrismaticSprite');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
