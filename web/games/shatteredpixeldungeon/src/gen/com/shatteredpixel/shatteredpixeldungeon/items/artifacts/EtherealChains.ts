// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/EtherealChains.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Buff, Cripple, Invisibility, MagicImmune, Regeneration, Talent, Chains, Effects$Type, Pushing, Item, RingOfEnergy, Catalog, MiningLevel, Ballistica, Messages, CellSelector$Listener, GameScene, PixelScene, ItemSpriteSheet, DungeonTilemap, GLog, Sample, BArray, PathFinder, Random;

export class EtherealChains extends Artifact {
  static readonly AC_CAST: string = 'CAST';
  caster: CellSelector$Listener = null;
  _EtherealChains(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_CHAINS;
    this.levelCap = 5;
    this.exp = 0;
    this.charge_ = 5;
    this.defaultAction_ = EtherealChains.AC_CAST;
    this.usesTargeting_ = true;
    this.caster = new (EtherealChains$1())().$o(this)._CellSelector$Listener();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && this.charge_ > 0 && !this.cursed && hero.buff($J.cls(MagicImmune)) == null) {
      actions.add(EtherealChains.AC_CAST);
    }
    return actions;
  }
  targetingPos(user: Hero, dst: number): number {
    return dst;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, EtherealChains.AC_CAST)) {
      Item.curUser = hero;
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
        this.usesTargeting_ = false;
      } else if (this.charge_ < 1) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
        this.usesTargeting_ = false;
      } else if (this.cursed) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
        this.usesTargeting_ = false;
      } else {
        this.usesTargeting_ = true;
        GameScene.selectCell(this.caster);
      }
    }
  }
  resetForTrinity(visibleLevel: number): void {
    super.resetForTrinity(visibleLevel);
    this.charge_ = (5 + (Math.imul(this.level$(), 2))) | 0;
  }
  chainEnemy(chain: Ballistica, hero: Hero, enemy: Char): void {
    if (enemy.properties().contains(Char$Property.IMMOVABLE)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_pull', []), []);
      return;
    }
    let bestPos = -1;
    for (const $it0 = chain.subPath(1, chain.dist).iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (!Dungeon.level.solid[i] && Actor.findChar(i) == null && (!Char.hasProp(enemy, Char$Property.LARGE) || Dungeon.level.openSpace[i])) {
        bestPos = i;
        break;
      }
    }
    if (bestPos === -1) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'does_nothing', []), []);
      return;
    }
    let pulledPos = bestPos;
    let chargeUse = Dungeon.level.distance(enemy.pos, pulledPos);
    if (chargeUse > this.charge_) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
      return;
    }
    hero.busy();
    this.throwSound();
    Sample.INSTANCE.play$Object(Assets$Sounds.CHAINS);
    hero.sprite_.parent.add$Gizmo(new Chains()._Chains$PointF$PointF$Type$Callback(hero.sprite_.center$(), enemy.sprite_.center$(), Effects$Type.ETHEREAL_CHAIN, new (EtherealChains$2())().$o(this).$c(enemy, pulledPos, chargeUse, hero)));
  }
  chainLocation(chain: Ballistica, hero: Hero): void {
    if (hero.rooted) {
      PixelScene.shake(1, 1);
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(EtherealChains), 'rooted', []), []);
      return;
    }
    if (Dungeon.level.solid[chain.collisionPos] || !(Dungeon.level.passable[chain.collisionPos] || Dungeon.level.avoid[chain.collisionPos])) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'inside_wall', []), []);
      return;
    }
    let solidFound = false;
    for (let i of PathFinder.NEIGHBOURS8) {
      if (Dungeon.level.solid[(chain.collisionPos + i) | 0]) {
        solidFound = true;
        break;
      }
    }
    if (!solidFound) {
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(EtherealChains), 'nothing_to_grab', []), []);
      return;
    }
    let newHeroPos = chain.collisionPos;
    let chargeUse = Dungeon.level.distance(hero.pos, newHeroPos);
    if (chargeUse > this.charge_) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(EtherealChains), 'no_charge', []), []);
      return;
    }
    hero.busy();
    this.throwSound();
    Sample.INSTANCE.play$Object(Assets$Sounds.CHAINS);
    hero.sprite_.parent.add$Gizmo(new Chains()._Chains$PointF$PointF$Type$Callback(hero.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(newHeroPos), Effects$Type.ETHEREAL_CHAIN, new (EtherealChains$3())().$o(this).$c(hero, newHeroPos, chargeUse)));
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new EtherealChains$chainsRecharge().$o(this)._EtherealChains$chainsRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    let chargeTarget = (5 + (Math.imul(this.level$(), 2))) | 0;
    if (this.charge_ < Math.imul(chargeTarget, 2)) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(0.5 * amount));
      while (this.partialCharge >= Math.fround(1)) {
        this.partialCharge--;
        this.charge_++;
        Item.updateQuickslot();
      }
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      desc += '\n\n';
      if (this.cursed) {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      } else {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_equipped', []);
      }
    }
    return desc;
  }
}

export class EtherealChains$chainsRecharge extends Artifact$ArtifactBuff {
  _EtherealChains$chainsRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    let chargeTarget = (5 + (Math.imul(this.$outer.level$(), 2))) | 0;
    if (this.$outer.charge_ < chargeTarget && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null && Regeneration.regenOn()) {
      let chargeGain = (Math.fround(1 / (Math.fround(40 - Math.fround(((chargeTarget - this.$outer.charge_) | 0) * 2)))));
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
    } else if (this.$outer.cursed && Random.Int$int(100) === 0) {
      Buff.prolong(this.target, $J.cls(Cripple), 10);
    }
    while (this.$outer.partialCharge >= Math.fround(1)) {
      this.$outer.partialCharge--;
      this.$outer.charge_++;
    }
    Item.updateQuickslot();
    this.spend(Actor.TICK);
    return true;
  }
  gainExp(levelPortion: number): void {
    if (this.$outer.cursed || this.target.buff($J.cls(MagicImmune)) != null || levelPortion === Math.fround(0)) {
      return;
    }
    this.$outer.exp = (this.$outer.exp + $J.roundf(Math.fround(levelPortion * 100))) | 0;
    if (this.$outer.charge_ > ((5 + (Math.imul(this.$outer.level$(), 2))) | 0)) {
      levelPortion = Math.fround(levelPortion * Math.fround((Math.fround(5 + (Math.fround(Math.fround(this.$outer.level$()) * 2)))) / this.$outer.charge_));
    }
    this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + Math.fround(levelPortion * 6));
    if (this.$outer.exp > ((100 + Math.imul(this.$outer.level$(), 100)) | 0) && this.$outer.level$() < this.$outer.levelCap) {
      this.$outer.exp = (this.$outer.exp - (100 + Math.imul(this.$outer.level$(), 100))) | 0;
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
      Catalog.countUses($J.cls(EtherealChains), 2);
      this.$outer.upgrade$();
    }
  }
}

let $EtherealChains$1: any = null;
/** An anonymous class (EtherealChains.java:123). */
function EtherealChains$1(): any {
  return $EtherealChains$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target != null && (Dungeon.level.visited[target] || Dungeon.level.mapped[target])) {
        PathFinder.buildDistanceMap$int$booleanArr(target, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null));
        if (!(Dungeon.level instanceof MiningLevel) && PathFinder.distance[Item.curUser.pos] === 2147483647) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(EtherealChains), 'cant_reach', []), []);
          return;
        }
        let chain = new Ballistica()._Ballistica(Item.curUser.pos, target, Ballistica.STOP_TARGET);
        if (Actor.findChar(chain.collisionPos) != null) {
          this.$outer.chainEnemy(chain, Item.curUser, Actor.findChar(chain.collisionPos));
        } else {
          this.$outer.chainLocation(chain, Item.curUser);
        }
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(EtherealChains), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains$1', []);
}

let $EtherealChains$2$1: any = null;
/** An anonymous class (EtherealChains.java:194). */
function EtherealChains$2$1(): any {
  return $EtherealChains$2$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_enemy.pos = this.$cv_pulledPos;
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - this.$cv_chargeUse) | 0;
      Invisibility.dispel$Char(this.$cv_hero);
      Talent.onArtifactUsed(this.$cv_hero);
      Item.updateQuickslot();
      Dungeon.level.occupyCell(this.$cv_enemy);
      Dungeon.observe$();
      GameScene.updateFog$();
      this.$cv_hero.spendAndNext(1);
      Artifact.artifactProc(this.$cv_enemy, this.$outer.$outer.visiblyUpgraded(), this.$cv_chargeUse);
    }
    $c($enemy, $pulledPos, $chargeUse, $hero): this {
      this.$cv_enemy = $enemy; this.$cv_pulledPos = $pulledPos; this.$cv_chargeUse = $chargeUse; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains$2$1', ['com.watabou.utils.Callback']);
}

let $EtherealChains$2: any = null;
/** An anonymous class (EtherealChains.java:192). */
function EtherealChains$2(): any {
  return $EtherealChains$2 ??= $J.local(class extends JObject {
    call(): void {
      Actor.add$Actor(new Pushing()._Pushing$Char$int$int$Callback(this.$cv_enemy, this.$cv_enemy.pos, this.$cv_pulledPos, new (EtherealChains$2$1())().$o(this).$c(this.$cv_enemy, this.$cv_pulledPos, this.$cv_chargeUse, this.$cv_hero)));
      this.$cv_hero.next();
    }
    $c($enemy, $pulledPos, $chargeUse, $hero): this {
      this.$cv_enemy = $enemy; this.$cv_pulledPos = $pulledPos; this.$cv_chargeUse = $chargeUse; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains$2', ['com.watabou.utils.Callback']);
}

let $EtherealChains$3$1: any = null;
/** An anonymous class (EtherealChains.java:262). */
function EtherealChains$3$1(): any {
  return $EtherealChains$3$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_hero.pos = this.$cv_newHeroPos;
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - this.$cv_chargeUse) | 0;
      Invisibility.dispel$Char(this.$cv_hero);
      Talent.onArtifactUsed(this.$cv_hero);
      Item.updateQuickslot();
      Dungeon.level.occupyCell(this.$cv_hero);
      this.$cv_hero.spendAndNext(1);
      Dungeon.observe$();
      GameScene.updateFog$();
    }
    $c($hero, $newHeroPos, $chargeUse): this {
      this.$cv_hero = $hero; this.$cv_newHeroPos = $newHeroPos; this.$cv_chargeUse = $chargeUse;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains$3$1', ['com.watabou.utils.Callback']);
}

let $EtherealChains$3: any = null;
/** An anonymous class (EtherealChains.java:260). */
function EtherealChains$3(): any {
  return $EtherealChains$3 ??= $J.local(class extends JObject {
    call(): void {
      Actor.add$Actor(new Pushing()._Pushing$Char$int$int$Callback(this.$cv_hero, this.$cv_hero.pos, this.$cv_newHeroPos, new (EtherealChains$3$1())().$o(this).$c(this.$cv_hero, this.$cv_newHeroPos, this.$cv_chargeUse)));
      this.$cv_hero.next();
    }
    $c($hero, $newHeroPos, $chargeUse): this {
      this.$cv_hero = $hero; this.$cv_newHeroPos = $newHeroPos; this.$cv_chargeUse = $chargeUse;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains$3', ['com.watabou.utils.Callback']);
}

$J.define(EtherealChains, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_EtherealChains' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(EtherealChains$chainsRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains$chainsRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_EtherealChains$chainsRecharge' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Chains = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Chains');
  Effects$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
