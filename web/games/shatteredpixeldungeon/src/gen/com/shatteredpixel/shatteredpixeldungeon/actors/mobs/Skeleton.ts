// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Skeleton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Assets$Sounds, Dungeon, Dungeon$LimitedDrops, Actor, Char$Property, AscensionChallenge, MagicImmune, HeroClass, HeroSubClass, Talent, HolyWard$HolyArmBuff, ShieldOfLight$ShieldOfLightTracker, Generator$Category, WandOfLivingEarth$RockArmor, Chasm, Messages, Earthroot$Armor, SkeletonSprite, TargetHealthIndicator, GLog, Sample, PathFinder, Random;

export class Skeleton extends Mob {
  _Skeleton(): this {
    this._Mob();
    this.spriteClass = $J.cls(SkeletonSprite);
    this.HP = this.HT = 25;
    this.defenseSkill_ = 9;
    this.EXP = 5;
    this.maxLvl = 10;
    this.loot = Generator$Category.WEAPON;
    this.lootChance_ = Math.fround(0.1667);
    this.properties_.add(Char$Property.UNDEAD);
    this.properties_.add(Char$Property.INORGANIC);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(2, 10);
  }
  die(cause: any): void {
    super.die(cause);
    if (cause === $J.cls(Chasm)) {
      return;
    }
    let heroKilled = false;
    for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
      let ch = Actor.findChar((this.pos + PathFinder.NEIGHBOURS8[i]) | 0);
      if (ch != null && ch.isAlive()) {
        let damage = $J.roundf(Math.fround(Random.NormalIntRange(6, 12)));
        damage = $J.roundf(Math.fround(damage * AscensionChallenge.statModifier(this)));
        let rockArmor = ch.buff($J.cls(WandOfLivingEarth$RockArmor));
        if (rockArmor != null) {
          let preDmg = damage;
          damage = rockArmor.absorb(damage);
          damage = Math.imul(damage, $J.roundf(Math.fround(damage / Math.fround(preDmg))));
        }
        let armor = ch.buff($J.cls(Earthroot$Armor));
        if (damage > 0 && armor != null) {
          let preDmg = damage;
          damage = armor.absorb(damage);
          damage = (damage - (preDmg - damage)) | 0;
        }
        if (ch.buff($J.cls(MagicImmune)) == null) {
          let shield = ch.buff($J.cls(ShieldOfLight$ShieldOfLightTracker));
          if (shield != null && shield.object === this.id()) {
            let min = (1 + Dungeon.hero.pointsInTalent(Talent.SHIELD_OF_LIGHT)) | 0;
            damage = (damage - Random.NormalIntRange(min, Math.imul(2, min))) | 0;
            damage = (damage - Random.NormalIntRange(min, Math.imul(2, min))) | 0;
            damage = Math.max(damage, 0);
          } else if (ch === Dungeon.hero && Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.SHIELD_OF_LIGHT) && TargetHealthIndicator.instance.target$() === this) {
            if (Random.Int$int(6) < ((1 + Dungeon.hero.pointsInTalent(Talent.SHIELD_OF_LIGHT)) | 0)) {
              damage = (damage - 2) | 0;
            }
          }
          if (ch.buff($J.cls(HolyWard$HolyArmBuff)) != null) {
            damage = (damage - (Dungeon.hero.subClass === HeroSubClass.PALADIN ? 6 : 2)) | 0;
          }
        }
        damage = Math.max(0, (damage - (ch.drRoll() + ch.drRoll())) | 0);
        ch.damage(damage, this);
        if (ch === Dungeon.hero && !ch.isAlive()) {
          heroKilled = true;
        }
      }
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.BONES);
    }
    if (heroKilled) {
      Dungeon.fail(this);
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'explo_kill', []), []);
    }
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * Math.fround($J.pow(Math.fround(1 / 3), Dungeon$LimitedDrops.SKELE_WEP.count_)));
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.SKELE_WEP.count_++;
    return super.createLoot();
  }
  attackSkill(target: Char): number {
    return 12;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 5)) | 0;
  }
}

$J.define(Skeleton, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Skeleton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Skeleton' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  HolyWard$HolyArmBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard$HolyArmBuff');
  ShieldOfLight$ShieldOfLightTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ShieldOfLight$ShieldOfLightTracker');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  WandOfLivingEarth$RockArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$RockArmor');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Earthroot$Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Armor');
  SkeletonSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SkeletonSprite');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
