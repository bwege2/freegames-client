// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/duelist/Feint.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { Mob } from '../../../mobs/Mob.ts';
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';
import { MirrorSprite } from '../../../../sprites/MirrorSprite.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Char$Property, BlobImmunity, Buff, Haste, Invisibility, Vulnerable, Weakness, Talent, Talent$CounterAbilityTacker, Item, Terrain, Door, Messages, GameScene, PixelScene, HeroIcon, TargetHealthIndicator, GLog, Sample, AlphaTweener, Delayer;

export class Feint extends ArmorAbility {
  _Feint(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  icon(): number {
    return HeroIcon.FEINT;
  }
  useTargeting(): boolean {
    return false;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  targetedPos(user: Char, dst: number): number {
    return dst;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (!Dungeon.level.adjacent(hero.pos, target)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'too_far', []), []);
      return;
    }
    if (Dungeon.hero.rooted) {
      PixelScene.shake(1, 1);
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'bad_location', []), []);
      return;
    }
    if (Dungeon.level.solid[target] || Actor.findChar(target) != null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'bad_location', []), []);
      return;
    }
    hero.busy();
    Sample.INSTANCE.play$Object(Assets$Sounds.MISS);
    hero.sprite_.jump$int$int$float$float$Callback(hero.pos, target, 0, Math.fround(0.1), new (Feint$1())().$o(this).$c(hero, target));
    hero.spend(1);
    let image = new Feint$AfterImage()._Feint$AfterImage();
    image.pos = hero.pos;
    GameScene.add$Mob(image);
    image.syncToHero(hero);
    let imageAttackPos: number;
    let enemyTarget = TargetHealthIndicator.instance.target$();
    if (enemyTarget != null && enemyTarget.alignment === Char$Alignment.ENEMY) {
      imageAttackPos = enemyTarget.pos;
    } else {
      imageAttackPos = (image.pos + (image.pos - target)) | 0;
    }
    hero.sprite_.parent.add$Gizmo(new (Feint$2())().$o(this).$c(image, imageAttackPos)._Delayer$float(0));
    for (let m of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if ((m.isTargeting(hero) && m.state_ === m.HUNTING) || (m.alignment === Char$Alignment.ENEMY && m.state_ !== m.PASSIVE && m.state_ !== m.SLEEPING && Dungeon.level.distance(m.pos, image.pos) <= 2)) {
        m.aggro(image);
      }
    }
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
  }
  talents(): Talent[] {
    return [Talent.FEIGNED_RETREAT, Talent.EXPOSE_WEAKNESS, Talent.COUNTER_ABILITY, Talent.HEROIC_ENERGY];
  }
}

export class Feint$AfterImage extends Mob {
  _Feint$AfterImage(): this {
    this._Mob();
    this.spriteClass = $J.cls(Feint$AfterImage$AfterImageSprite);
    this.defenseSkill_ = 0;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.alignment = Char$Alignment.ALLY;
    this.state_ = this.PASSIVE;
    this.HP = this.HT = 1;
    this.actPriority = (Actor.HERO_PRIO + 1) | 0;
    this.immunities_.addAll(new BlobImmunity()._BlobImmunity().immunities());
    return this;
  }
  name(): string {
    return '';
  }
  description(): string {
    return '';
  }
  canInteract(c: Char): boolean {
    return false;
  }
  act(): boolean {
    this.destroy();
    this.sprite_.die();
    return true;
  }
  syncToHero(hero: Hero): void {
    if (this.cooldown() !== hero.cooldown()) {
      this.spendConstant(Math.fround(hero.cooldown() - this.cooldown()));
    }
  }
  damage(dmg: number, src: any): void {
  }
  defenseSkill(enemy: Char): number {
    if (enemy.alignment === Char$Alignment.ENEMY) {
      if (enemy instanceof Mob) {
        (enemy).clearEnemy();
      }
      Buff.affect$Char$Class$float(enemy, $J.cls(Feint$AfterImage$FeintConfusion), 1);
      if (enemy.sprite_ != null) {
        enemy.sprite_.showLost();
      }
      if (Dungeon.hero.hasTalent(Talent.FEIGNED_RETREAT)) {
        Buff.prolong(Dungeon.hero, $J.cls(Haste), Math.fround(2 * Dungeon.hero.pointsInTalent(Talent.FEIGNED_RETREAT)));
      }
      if (Dungeon.hero.hasTalent(Talent.EXPOSE_WEAKNESS)) {
        Buff.prolong(enemy, $J.cls(Vulnerable), Math.fround(2 * Dungeon.hero.pointsInTalent(Talent.EXPOSE_WEAKNESS)));
        Buff.prolong(enemy, $J.cls(Weakness), Math.fround(2 * Dungeon.hero.pointsInTalent(Talent.EXPOSE_WEAKNESS)));
      }
      if (Dungeon.hero.hasTalent(Talent.COUNTER_ABILITY)) {
        Buff.prolong(Dungeon.hero, $J.cls(Talent$CounterAbilityTacker), 3);
      }
    }
    return 0;
  }
  add(buff: Buff): boolean {
    return false;
  }
  sprite(): CharSprite {
    let s = super.sprite();
    (s).updateArmor$();
    return s;
  }
}

export class Feint$AfterImage$FeintConfusion extends FlavourBuff {
  _Feint$AfterImage$FeintConfusion(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Feint$AfterImage$AfterImageSprite extends MirrorSprite {
  _Feint$AfterImage$AfterImageSprite(): this {
    this._MirrorSprite();
    return this;
  }
  updateArmor$(): void {
    this.updateArmor$int(6);
  }
  resetColor(): void {
    super.resetColor();
    this.alpha$float(Math.fround(0.6));
  }
  die(): void {
    if (this.parent != null) {
      this.parent.add$Gizmo(new (Feint$AfterImage$AfterImageSprite$1())().$o(this)._AlphaTweener(this, 0, 3));
    }
  }
}

let $Feint$1: any = null;
/** An anonymous class (Feint.java:105). */
function Feint$1(): any {
  return $Feint$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level.map_[this.$cv_hero.pos] === Terrain.OPEN_DOOR) {
        Door.leave(this.$cv_hero.pos);
      }
      this.$cv_hero.pos = this.$cv_target;
      Dungeon.level.occupyCell(this.$cv_hero);
      Invisibility.dispel$();
      this.$cv_hero.next();
    }
    $c($hero, $target): this {
      this.$cv_hero = $hero; this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$1', ['com.watabou.utils.Callback']);
}

let $Feint$2$1: any = null;
/** An anonymous class (Feint.java:135). */
function Feint$2$1(): any {
  return $Feint$2$1 ??= $J.local(class extends JObject {
    call(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$2$1', ['com.watabou.utils.Callback']);
}

let $Feint$2: any = null;
/** An anonymous class (Feint.java:132). */
function Feint$2(): any {
  return $Feint$2 ??= $J.local(class extends Delayer {
    onComplete(): void {
      this.$cv_image.sprite_.attack$int$Callback(this.$cv_imageAttackPos, new (Feint$2$1())().$o(this));
    }
    $c($image, $imageAttackPos): this {
      this.$cv_image = $image; this.$cv_imageAttackPos = $imageAttackPos;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$2', []);
}

let $Feint$AfterImage$AfterImageSprite$1: any = null;
/** An anonymous class (Feint.java:269). */
function Feint$AfterImage$AfterImageSprite$1(): any {
  return $Feint$AfterImage$AfterImageSprite$1 ??= $J.local(class extends AlphaTweener {
    onComplete(): void {
      this.$outer.killAndErase();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$AfterImage$AfterImageSprite$1', []);
}

$J.define(Feint, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_Feint' } });
$J.define(Feint$AfterImage, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$AfterImage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Feint$AfterImage' } });
$J.define(Feint$AfterImage$FeintConfusion, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$AfterImage$FeintConfusion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Feint$AfterImage$FeintConfusion' } });
$J.define(Feint$AfterImage$AfterImageSprite, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$AfterImage$AfterImageSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MirrorSprite', ctors: { '': '_Feint$AfterImage$AfterImageSprite' }, meths: { 'updateArmor()': 'updateArmor$' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  BlobImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Haste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Haste');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$CounterAbilityTacker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CounterAbilityTacker');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Door');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  Delayer = $J.load('com.watabou.noosa.tweeners.Delayer');
});
