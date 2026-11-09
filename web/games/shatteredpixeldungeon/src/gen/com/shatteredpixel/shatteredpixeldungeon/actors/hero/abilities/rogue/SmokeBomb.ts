// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/rogue/SmokeBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { NPC } from '../../../mobs/npcs/NPC.ts';
import { MobSprite } from '../../../../sprites/MobSprite.ts';

let Assets$Sounds, Assets$Sprites, Dungeon, Actor, Char$Alignment, Char$Property, AllyBuff, Amok, Blindness, Buff, Charm, Dread, Haste, Invisibility, Sleep, Terror, Talent, CellEmitter, Speck, Item, ScrollOfTeleportation, Messages, GameScene, PixelScene, HeroIcon, GLog, MovieClip$Animation, TextureFilm, Sample, BArray, PathFinder, Random;

export class SmokeBomb extends ArmorAbility {
  _SmokeBomb(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 50;
    return this;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  useTargeting(): boolean {
    return false;
  }
  chargeUse(hero: Hero): number {
    if (!hero.hasTalent(Talent.SHADOW_STEP) || hero.invisible <= 0) {
      return super.chargeUse(hero);
    } else {
      return Math.fround((super.chargeUse(hero) * $J.pow(0.84, hero.pointsInTalent(Talent.SHADOW_STEP))));
    }
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target != null) {
      if (target !== hero.pos && hero.rooted) {
        PixelScene.shake(1, 1);
        return;
      }
      PathFinder.buildDistanceMap$int$booleanArr$int(hero.pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null), 6);
      if (PathFinder.distance[target] === 2147483647 || !Dungeon.level.heroFOV[target] || (target !== hero.pos && Actor.findChar(target) != null)) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'fov', []), []);
        return;
      }
      armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
      Item.updateQuickslot();
      let shadowStepping = hero.invisible > 0 && hero.hasTalent(Talent.SHADOW_STEP);
      if (!shadowStepping) {
        for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
          if (Dungeon.level.adjacent(mob.pos, hero.pos) && mob.alignment !== Char$Alignment.ALLY) {
            Buff.prolong(mob, $J.cls(Blindness), Math.fround(Blindness.DURATION / 2));
            if (mob.state_ === mob.HUNTING) {
              mob.state_ = mob.WANDERING;
            }
            mob.sprite_.emitter().burst(Speck.factory$int(Speck.LIGHT), 4);
          }
        }
        if (hero.hasTalent(Talent.BODY_REPLACEMENT)) {
          for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
            let ch = $it0.next();
            if (ch instanceof SmokeBomb$NinjaLog) {
              ch.die(null);
            }
          }
          let n = new SmokeBomb$NinjaLog()._SmokeBomb$NinjaLog();
          n.pos = hero.pos;
          GameScene.add$Mob(n);
          Dungeon.level.occupyCell(n);
        }
        if (hero.hasTalent(Talent.HASTY_RETREAT)) {
          let duration = Math.fround(Math.fround(0.67) + hero.pointsInTalent(Talent.HASTY_RETREAT));
          Buff.affect$Char$Class$float(hero, $J.cls(Haste), duration);
          Buff.affect$Char$Class$float(hero, $J.cls(Invisibility), duration);
        }
      }
      CellEmitter.get(hero.pos).burst(Speck.factory$int(Speck.WOOL), 10);
      ScrollOfTeleportation.appear(hero, target);
      Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
      Dungeon.level.occupyCell(hero);
      Dungeon.observe$();
      GameScene.updateFog$();
      if (!shadowStepping) {
        hero.spendAndNext(Actor.TICK);
      } else {
        hero.next();
      }
    }
  }
  icon(): number {
    return HeroIcon.SMOKE_BOMB;
  }
  talents(): Talent[] {
    return [Talent.HASTY_RETREAT, Talent.BODY_REPLACEMENT, Talent.SHADOW_STEP, Talent.HEROIC_ENERGY];
  }
}

export class SmokeBomb$NinjaLog extends NPC {
  _SmokeBomb$NinjaLog(): this {
    this._NPC();
    this.spriteClass = $J.cls(SmokeBomb$NinjaLogSprite);
    this.defenseSkill_ = 0;
    this.properties_.add(Char$Property.INORGANIC);
    this.alignment = Char$Alignment.ALLY;
    this.HT = 20;
    if (Dungeon.hero != null) {
      this.HT = Math.imul(this.HT, Dungeon.hero.pointsInTalent(Talent.BODY_REPLACEMENT));
    }
    this.HP = this.HT;
    this.immunities_.add($J.cls(Dread));
    this.immunities_.add($J.cls(Terror));
    this.immunities_.add($J.cls(Amok));
    this.immunities_.add($J.cls(Charm));
    this.immunities_.add($J.cls(Sleep));
    this.immunities_.add($J.cls(AllyBuff));
    return this;
  }
  drRoll(): number {
    let dr = super.drRoll();
    dr = (dr + Random.NormalIntRange(Dungeon.hero.pointsInTalent(Talent.BODY_REPLACEMENT), Math.imul(3, Dungeon.hero.pointsInTalent(Talent.BODY_REPLACEMENT)))) | 0;
    return dr;
  }
}

export class SmokeBomb$NinjaLogSprite extends MobSprite {
  _SmokeBomb$NinjaLogSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.NINJA_LOG);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 11, 12);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(0, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [1, 2, 3, 4]);
    this.play$Animation(this.idle_);
    return this;
  }
  showAlert(): void {
  }
  blood(): number {
    return -6921216;
  }
}

$J.define(SmokeBomb, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.SmokeBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_SmokeBomb' } });
$J.define(SmokeBomb$NinjaLog, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.SmokeBomb$NinjaLog', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_SmokeBomb$NinjaLog' } });
$J.define(SmokeBomb$NinjaLogSprite, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.SmokeBomb$NinjaLogSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_SmokeBomb$NinjaLogSprite' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  Haste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Haste');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
