// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Monk.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../buffs/Buff.ts';

let Assets$Sounds, Char, Char$Property, Buff$buffType, Imp$Quest, Food, Messages, MonkSprite, BuffIndicator, Sample, Random;

export class Monk extends Mob {
  focusCooldown: number = 0;
  static FOCUS_COOLDOWN: string = null;
  _Monk(): this {
    this._Mob();
    this.spriteClass = $J.cls(MonkSprite);
    this.HP = this.HT = 70;
    this.defenseSkill_ = 30;
    this.EXP = 11;
    this.maxLvl = 21;
    this.loot = $J.cls(Food);
    this.lootChance_ = Math.fround(0.083);
    this.properties_.add(Char$Property.UNDEAD);
    this.focusCooldown = 0;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(12, 25);
  }
  attackSkill(target: Char): number {
    return 30;
  }
  attackDelay(): number {
    return Math.fround(super.attackDelay() * 0.5);
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 2)) | 0;
  }
  rollToDropLoot(): void {
    Imp$Quest.oldProcess(this);
    super.rollToDropLoot();
  }
  act(): boolean {
    let result = super.act();
    if (this.buff($J.cls(Monk$Focus)) == null && this.state_ === this.HUNTING && this.focusCooldown <= Math.fround(0)) {
      Buff.affect$Char$Class(this, $J.cls(Monk$Focus));
    }
    return result;
  }
  spend(time: number): void {
    this.focusCooldown = Math.fround(this.focusCooldown - time);
    super.spend(time);
  }
  move$int$boolean(step: number, travelling: boolean): void {
    if (travelling) {
      this.focusCooldown = Math.fround(this.focusCooldown - Math.fround(0.67));
    }
    super.move$int$boolean(step, travelling);
  }
  defenseSkill(enemy: Char): number {
    if (this.buff($J.cls(Monk$Focus)) != null && this.paralysed === 0 && this.state_ !== this.SLEEPING) {
      return Char.INFINITE_EVASION;
    }
    return super.defenseSkill(enemy);
  }
  defenseVerb(): string {
    let f = this.buff($J.cls(Monk$Focus));
    if (f == null) {
      return super.defenseVerb();
    } else {
      f.detach();
      if (this.sprite_ != null && this.sprite_.visible_) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_PARRY, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
      }
      this.focusCooldown = Random.NormalFloat(6, 7);
      return Messages.get$Object$String$ObjectArr(this, 'parried', []);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Monk.FOCUS_COOLDOWN, this.focusCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.focusCooldown = Math.fround(bundle.getInt(Monk.FOCUS_COOLDOWN));
  }
  static $clinit() {
    Monk.FOCUS_COOLDOWN = 'focus_cooldown';
  }
}

export class Monk$Focus extends Buff {
  _Monk$Focus(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.MIND_VISION;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0.25, 1.5, 1);
  }
}

$J.define(Monk, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Monk' }, meths: { 'move(int,boolean)': 'move$int$boolean' }, clinit: true, lazy: ['FOCUS_COOLDOWN'] });
$J.define(Monk$Focus, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk$Focus', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Monk$Focus' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Food = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Food');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  MonkSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MonkSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
