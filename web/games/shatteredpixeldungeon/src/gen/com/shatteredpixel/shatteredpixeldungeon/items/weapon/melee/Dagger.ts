// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Dagger.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MeleeWeapon } from './MeleeWeapon.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Invisibility, Hero, Mob, CellEmitter, Speck, Messages, GameScene, PixelScene, ItemSpriteSheet, GLog, Sample, BArray, PathFinder;

export class Dagger extends MeleeWeapon {
  _Dagger(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.DAGGER;
    this.hitSound_ = Assets$Sounds.HIT_STAB;
    this.hitSoundPitch = Math.fround(1.1);
    this.tier_ = 1;
    this.bones = false;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, ((this.tier_ + 1) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  damageRoll(owner: Char): number {
    if (owner instanceof Hero) {
      let hero = owner;
      let enemy = hero.attackTarget();
      if (enemy instanceof Mob && (enemy).surprisedBy$Char(hero)) {
        let diff = (this.max$() - this.min$()) | 0;
        let damage = this.augment.damageFactor$int(Hero.heroDamageIntRange((this.min$() + $J.roundf(Math.fround(diff * 0.75))) | 0, this.max$()));
        let exStr = (hero.STR() - this.STRReq$()) | 0;
        if (exStr > 0) {
          damage = (damage + Hero.heroDamageIntRange(0, exStr)) | 0;
        }
        return damage;
      }
    }
    return super.damageRoll(owner);
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  useTargeting(): boolean {
    return false;
  }
  duelistAbility(hero: Hero, target: number): void {
    Dagger.sneakAbility(hero, target, 5, (2 + this.buffedLvl()) | 0, this);
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(2 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [2]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String((2 + level) | 0);
  }
  static sneakAbility(hero: Hero, target: number, maxDist: number, invisTurns: number, wep: MeleeWeapon): void {
    if (target == null) {
      return;
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(Dungeon.hero.pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null), maxDist);
    if (PathFinder.distance[target] === 2147483647 || !Dungeon.level.heroFOV[target] || hero.rooted) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_target_range', []), []);
      if (Dungeon.hero.rooted) {
        PixelScene.shake(1, 1);
      }
      return;
    }
    if (Actor.findChar(target) != null) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_occupied', []), []);
      return;
    }
    wep.beforeAbilityUsed(hero, null);
    Buff.prolong(hero, $J.cls(Invisibility), Math.fround((invisTurns - 1) | 0));
    Dungeon.hero.sprite_.turnTo(Dungeon.hero.pos, target);
    Dungeon.hero.pos = target;
    Dungeon.level.occupyCell(Dungeon.hero);
    Dungeon.observe$();
    GameScene.updateFog$();
    Dungeon.hero.checkVisibleMobs();
    Dungeon.hero.sprite_.place(Dungeon.hero.pos);
    CellEmitter.get(Dungeon.hero.pos).burst(Speck.factory$int(Speck.WOOL), 6);
    Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
    hero.next();
    wep.afterAbilityUsed(hero);
  }
}

$J.define(Dagger, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Dagger', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Dagger' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
