// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Stasis.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { ClericSpell } from './ClericSpell.ts';
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Buff$buffType, LifeLink, Talent, PowerOfMany, DirectableAlly, MagicMissile, ScrollOfTeleportation, Messages, GameScene, BuffIndicator, HeroIcon, Sample, PathFinder, Random;

export class Stasis extends ClericSpell {
  static INSTANCE: Stasis = null;
  _Stasis(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.STASIS;
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [(30 + Math.imul(30, Dungeon.hero.pointsInTalent(Talent.STASIS))) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.STASIS) && (PowerOfMany.getPoweredAlly() != null || hero.buff($J.cls(Stasis$StasisBuff)) != null);
  }
  chargeUse(hero: Hero): number {
    if (hero.buff($J.cls(Stasis$StasisBuff)) != null) {
      return 0;
    }
    return 2;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    this.onSpellCast(tome, hero);
    if (hero.buff($J.cls(Stasis$StasisBuff)) != null) {
      hero.sprite_.operate$int(hero.pos);
      hero.buff($J.cls(Stasis$StasisBuff)).act();
      return;
    }
    let ally = PowerOfMany.getPoweredAlly();
    hero.sprite_.zap$int(ally.pos);
    MagicMissile.boltFromChar(hero.sprite_.parent, MagicMissile.LIGHT_MISSILE, ally.sprite_, hero.pos, null);
    let buffs = ally.buffs$();
    Actor.remove(ally);
    ally.sprite_.killAndErase();
    ally.sprite_ = null;
    Dungeon.level.mobs.remove(ally);
    for (const $it0 = buffs.iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      if (b.type_ === Buff$buffType.POSITIVE || b.revivePersists) {
        ally.add(b);
      }
    }
    ally.clearTime();
    Buff.prolong(hero, $J.cls(Stasis$StasisBuff), Math.fround((30 + Math.imul(30, hero.pointsInTalent(Talent.STASIS))) | 0)).stasisAlly = ally;
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    if (hero.buff($J.cls(LifeLink)) != null && hero.buff($J.cls(LifeLink)).object === ally.id()) {
      hero.buff($J.cls(LifeLink)).detach();
    }
    hero.spendAndNext(Actor.TICK);
    Dungeon.observe$();
    GameScene.updateFog$();
  }
  static getStasisAlly(): Char {
    if (Dungeon.hero != null && Dungeon.hero.buff($J.cls(Stasis$StasisBuff)) != null) {
      return Dungeon.hero.buff($J.cls(Stasis$StasisBuff)).stasisAlly;
    }
    return null;
  }
  static $clinit() {
    Stasis.INSTANCE = new Stasis()._Stasis();
  }
}

export class Stasis$StasisBuff extends FlavourBuff {
  stasisAlly: Mob = null;
  static readonly ALLY: string = 'ally';
  _Stasis$StasisBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.MANY_POWER;
  }
  iconFadePercent(): number {
    let duration = (30 + Math.imul(30, Dungeon.hero.pointsInTalent(Talent.STASIS))) | 0;
    return Math.max(0, Math.fround((Math.fround(duration - this.visualcooldown())) / duration));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [Messages.titleCase(this.stasisAlly.name()), this.dispTurns$()]);
  }
  act(): boolean {
    let spawnPoints = new ArrayList();
    for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
      let p = (this.target.pos + PathFinder.NEIGHBOURS8[i]) | 0;
      if (Actor.findChar(p) == null && (Dungeon.level.passable[p] || (this.stasisAlly.flying && Dungeon.level.avoid[p]))) {
        spawnPoints.add(p);
      }
    }
    if (spawnPoints.isEmpty()) {
      spawnPoints.add((this.target.pos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0);
    }
    this.stasisAlly.pos = Random.element$Collection(spawnPoints);
    GameScene.add$Mob(this.stasisAlly);
    if (this.stasisAlly instanceof DirectableAlly) {
      (this.stasisAlly).clearDefensingPos();
    }
    if (this.stasisAlly.buff($J.cls(LifeLink)) != null) {
      Buff.prolong(Dungeon.hero, $J.cls(LifeLink), this.stasisAlly.buff($J.cls(LifeLink)).cooldown()).object = this.stasisAlly.id();
    }
    ScrollOfTeleportation.appear(this.stasisAlly, this.stasisAlly.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    return super.act();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Stasis$StasisBuff.ALLY, this.stasisAlly);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.stasisAlly = bundle.get$String(Stasis$StasisBuff.ALLY);
  }
}

$J.define(Stasis, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_Stasis' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(Stasis$StasisBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis$StasisBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Stasis$StasisBuff' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  LifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LifeLink');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  DirectableAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
