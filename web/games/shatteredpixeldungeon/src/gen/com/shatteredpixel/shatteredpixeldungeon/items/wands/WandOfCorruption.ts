// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfCorruption.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../../jre/index.ts';
import { Wand } from './Wand.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, AllyBuff, Amok, AscensionChallenge, Bleeding, Blindness, Buff, Buff$buffType, Burning, Charm, Chill, Corrosion, Corruption, Cripple, Daze, Doom, Dread, Drowsy, Frost, Hex, MagicalSleep, Ooze, Paralysis, Poison, Roots, Slow, SoulMark, Terror, Vertigo, Vulnerable, Weakness, Bee, DwarfKing, Mimic, Mob, Piranha, Statue, Swarm, Wraith, MagicMissile, Item, Messages, ItemSpriteSheet, GLog, Sample, Random;

export class WandOfCorruption extends Wand {
  static readonly MINOR_DEBUFF_WEAKEN: number = 0.25;
  static MINOR_DEBUFFS: HashMap<JClass<Buff>, number> = null;
  static readonly MAJOR_DEBUFF_WEAKEN: number = 0.5;
  static MAJOR_DEBUFFS: HashMap<JClass<Buff>, number> = null;
  _WandOfCorruption(): this {
    this._Wand();
    this.image_ = ItemSpriteSheet.WAND_CORRUPTION;
    return this;
  }
  onZap(bolt: Ballistica): void {
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch != null) {
      if (!(ch instanceof Mob)) {
        return;
      }
      let enemy = ch;
      if (enemy instanceof DwarfKing) {
        Statistics.qualifiedForBossChallengeBadge = false;
      }
      let corruptingPower = Math.fround(3 + Math.fround(this.buffedLvl() / 3));
      let enemyResist: number;
      if (ch instanceof Mimic || ch instanceof Statue) {
        enemyResist = Math.fround((1 + Dungeon.depth) | 0);
      } else if (ch instanceof Piranha || ch instanceof Bee) {
        enemyResist = Math.fround(1 + Math.fround(Dungeon.depth / 2));
      } else if (ch instanceof Wraith) {
        enemyResist = Math.fround((Math.fround(1 + Math.fround(Dungeon.scalingDepth() / 4))) / 5);
      } else if (ch instanceof Swarm) {
        enemyResist = Math.fround((1 + AscensionChallenge.AscensionCorruptResist(enemy)) | 0);
        if (enemyResist === Math.fround(1)) {
          enemyResist = Math.fround((1 + 3) | 0);
        }
      } else {
        enemyResist = Math.fround((1 + AscensionChallenge.AscensionCorruptResist(enemy)) | 0);
      }
      enemyResist = Math.fround(enemyResist * (1 + 4 * $J.pow(Math.fround(enemy.HP / Math.fround(enemy.HT)), 2)));
      for (const $it0 = enemy.buffs$().iterator(); $it0.hasNext(); ) {
        let buff = $it0.next();
        if (WandOfCorruption.MAJOR_DEBUFFS.containsKey(buff.getClass())) {
          enemyResist = Math.fround(enemyResist * (Math.fround(1 - WandOfCorruption.MAJOR_DEBUFF_WEAKEN)));
        } else if (WandOfCorruption.MINOR_DEBUFFS.containsKey(buff.getClass())) {
          enemyResist = Math.fround(enemyResist * (Math.fround(1 - WandOfCorruption.MINOR_DEBUFF_WEAKEN)));
        } else if (buff.type_ === Buff$buffType.NEGATIVE) {
          enemyResist = Math.fround(enemyResist * (Math.fround(1 - WandOfCorruption.MINOR_DEBUFF_WEAKEN)));
        }
      }
      if (enemy.buff($J.cls(Corruption)) != null || enemy.buff($J.cls(Doom)) != null) {
        corruptingPower = Math.fround(enemyResist - Math.fround(0.001));
      }
      if (corruptingPower > enemyResist) {
        this.corruptEnemy(enemy);
      } else {
        let debuffChance = Math.fround(corruptingPower / enemyResist);
        if (Random.Float$() < debuffChance) {
          this.debuffEnemy(enemy, WandOfCorruption.MAJOR_DEBUFFS);
        } else {
          this.debuffEnemy(enemy, WandOfCorruption.MINOR_DEBUFFS);
        }
      }
      this.wandProc(ch, this.chargesPerCast());
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Math.fround(Math.fround(0.8) * Random.Float$float$float(Math.fround(0.87), Math.fround(1.15))));
    } else {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
  }
  debuffEnemy(enemy: Mob, category: HashMap<JClass<Buff>, number>): void {
    let debuffs = new HashMap(category);
    for (const $it1 = enemy.buffs$().iterator(); $it1.hasNext(); ) {
      let existing = $it1.next();
      if (debuffs.containsKey(existing.getClass())) {
        $J.boxF(debuffs.put(existing.getClass(), $J.boxF(0)));
      }
    }
    for (const $it2 = debuffs.keySet().iterator(); $it2.hasNext(); ) {
      let toAssign = $it2.next();
      if (+$J.boxF(debuffs.get(toAssign)) > Math.fround(0) && enemy.isImmune(toAssign)) {
        $J.boxF(debuffs.put(toAssign, $J.boxF(0)));
      }
    }
    let debuffCls = Random.chances$HashMap(debuffs);
    if (debuffCls != null) {
      Buff.append$Char$Class$float(enemy, debuffCls, Math.fround((6 + Math.imul(this.buffedLvl(), 3)) | 0));
    } else {
      if (category === WandOfCorruption.MINOR_DEBUFFS) {
        this.debuffEnemy(enemy, WandOfCorruption.MAJOR_DEBUFFS);
      } else if (category === WandOfCorruption.MAJOR_DEBUFFS) {
        this.corruptEnemy(enemy);
      }
    }
  }
  corruptEnemy(enemy: Mob): void {
    if (enemy.buff($J.cls(Corruption)) != null || enemy.buff($J.cls(Doom)) != null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'already_corrupted', []), []);
      return;
    }
    if (!enemy.isImmune($J.cls(Corruption))) {
      Corruption.corruptionHeal(enemy);
      AllyBuff.affectAndLoot(enemy, Item.curUser, $J.cls(Corruption));
    } else {
      Buff.affect$Char$Class(enemy, $J.cls(Doom));
    }
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let level = Math.max(0, this.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 6))) * Wand.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      Buff.prolong(defender, $J.cls(Amok), Math.fround($J.roundf(Math.fround(((4 + Math.imul(level, 2)) | 0) * powerMulti))));
    }
  }
  upgradeStat1(level: number): string {
    return Messages.decimalFormat('#.##', Math.fround(3 + Math.fround(level / 3)));
  }
  upgradeStat2(level: number): string {
    return String((6 + Math.imul(3, level)) | 0);
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.SHADOW, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(0);
    particle.am = Math.fround(0.6);
    particle.setLifespan(2);
    particle.speed_.set$float$float(0, 5);
    particle.setSize(0.5, 2);
    particle.shuffleXY(1);
  }
  static $clinit() {
    WandOfCorruption.MINOR_DEBUFFS = new HashMap();
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Weakness), $J.boxF(2)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Vulnerable), $J.boxF(2)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Cripple), $J.boxF(1)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Blindness), $J.boxF(1)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Terror), $J.boxF(1)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Chill), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Ooze), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Roots), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Vertigo), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Drowsy), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Bleeding), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Burning), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MINOR_DEBUFFS.put($J.cls(Poison), $J.boxF(0)));
    WandOfCorruption.MAJOR_DEBUFFS = new HashMap();
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Amok), $J.boxF(3)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Slow), $J.boxF(2)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Hex), $J.boxF(2)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Paralysis), $J.boxF(1)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Daze), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Dread), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Charm), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(MagicalSleep), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(SoulMark), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Corrosion), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Frost), $J.boxF(0)));
    $J.boxF(WandOfCorruption.MAJOR_DEBUFFS.put($J.cls(Doom), $J.boxF(0)));
  }
}

$J.define(WandOfCorruption, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorruption', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand', ctors: { '': '_WandOfCorruption' }, clinit: true, lazy: ['MINOR_DEBUFFS', 'MAJOR_DEBUFFS'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Daze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Daze');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  Drowsy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Drowsy');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  MagicalSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSleep');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Slow = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Slow');
  SoulMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SoulMark');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  Swarm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
