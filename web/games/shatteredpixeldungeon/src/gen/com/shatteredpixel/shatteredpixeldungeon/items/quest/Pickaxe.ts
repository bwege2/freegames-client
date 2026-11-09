// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/quest/Pickaxe.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MeleeWeapon } from '../weapon/melee/MeleeWeapon.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Buff, Invisibility, Vulnerable, Bee, Crab, Scorpio, Spinner, Swarm, Item, MiningLevel, Messages, ItemSpriteSheet, AttackIndicator, GLog, Sample;

export class Pickaxe extends MeleeWeapon {
  _Pickaxe(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.PICKAXE;
    this.levelKnown = true;
    this.unique = true;
    this.bones = false;
    this.tier_ = 2;
    return this;
  }
  STRReq$int(lvl: number): number {
    return (super.STRReq$int(lvl) + 2) | 0;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (Dungeon.level instanceof MiningLevel) {
      actions.remove(Item.AC_DROP);
      actions.remove(Item.AC_THROW);
    }
    return actions;
  }
  keptThroughLostInventory(): boolean {
    return super.keptThroughLostInventory() || Dungeon.level instanceof MiningLevel;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_no_target', []), []);
      return;
    }
    hero.belongings.abilityWeapon = this;
    if (!hero.canAttack(enemy)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_target_range', []), []);
      hero.belongings.abilityWeapon = null;
      return;
    }
    hero.belongings.abilityWeapon = null;
    hero.sprite_.attack$int$Callback(enemy.pos, new (Pickaxe$1())().$o(this).$c(enemy, hero));
  }
  abilityInfo(): string {
    let dmgBoost = (8 + Math.imul(2, this.buffedLvl())) | 0;
    return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int((this.min$() + dmgBoost) | 0), this.augment.damageFactor$int((this.max$() + dmgBoost) | 0)]);
  }
  upgradeAbilityStat(level: number): string {
    let dmgBoost = (8 + Math.imul(2, level)) | 0;
    return this.augment.damageFactor$int((this.min$int(level) + dmgBoost) | 0) + '-' + this.augment.damageFactor$int((this.max$int(level) + dmgBoost) | 0);
  }
}

let $Pickaxe$1: any = null;
/** An anonymous class (Pickaxe.java:106). */
function Pickaxe$1(): any {
  return $Pickaxe$1 ??= $J.local(class extends JObject {
    call(): void {
      let damageBoost = 0;
      if (Char.hasProp(this.$cv_enemy, Char$Property.INORGANIC) || this.$cv_enemy instanceof Swarm || this.$cv_enemy instanceof Bee || this.$cv_enemy instanceof Crab || this.$cv_enemy instanceof Spinner || this.$cv_enemy instanceof Scorpio) {
        damageBoost = this.$outer.augment.damageFactor$int((8 + Math.imul(2, this.$outer.buffedLvl())) | 0);
      }
      this.$outer.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, 1, Math.fround(damageBoost), Math.fround(Char.INFINITE_ACCURACY))) {
        if (this.$cv_enemy.isAlive()) {
          Buff.affect$Char$Class$float(this.$cv_enemy, $J.cls(Vulnerable), 3);
        } else {
          MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$outer.afterAbilityUsed(this.$cv_hero);
    }
    $c($enemy, $hero): this {
      this.$cv_enemy = $enemy; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe$1', ['com.watabou.utils.Callback']);
}

$J.define(Pickaxe, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Pickaxe' }, meths: { 'STRReq(int)': 'STRReq$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  Crab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab');
  Scorpio = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Scorpio');
  Spinner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner');
  Swarm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
