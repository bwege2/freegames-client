// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/Ratmogrify.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashSet } from '../../../../../../../jre/index.ts';
import { ArmorAbility } from './ArmorAbility.ts';
import { Mob } from '../../mobs/Mob.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, Adrenaline, AllyBuff, AscensionChallenge$AscensionBuffBlocker, Buff, Invisibility, Talent, Rat, Statue, CellEmitter, Speck, Item, ScrollOfTeleportation, ScrollOfSirensSong$Enthralled, Bestiary, Notes, Messages, GameScene, RatSprite, HeroIcon, TargetHealthIndicator, GLog, Sample, PathFinder, Random;

export class Ratmogrify extends ArmorAbility {
  static useRatroicEnergy: boolean = false;
  _Ratmogrify(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 50;
    return this;
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
    let ch = Actor.findChar(target);
    if (ch == null || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    } else if (ch === hero) {
      if (!hero.hasTalent(Talent.RATFORCEMENTS)) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'self_target', []), []);
        return;
      } else {
        let spawnPoints = new ArrayList();
        for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
          let p = (hero.pos + PathFinder.NEIGHBOURS8[i]) | 0;
          if (Actor.findChar(p) == null && Dungeon.level.passable[p]) {
            spawnPoints.add(p);
          }
        }
        let ratsToSpawn = hero.pointsInTalent(Talent.RATFORCEMENTS);
        while (ratsToSpawn > 0 && spawnPoints.size() > 0) {
          let index = Random.index(spawnPoints);
          let rat = new Rat()._Rat();
          rat.alignment = Char$Alignment.ALLY;
          rat.state_ = rat.HUNTING;
          Buff.affect$Char$Class(rat, $J.cls(AscensionChallenge$AscensionBuffBlocker));
          GameScene.add$Mob(rat);
          ScrollOfTeleportation.appear(rat, spawnPoints.get(index));
          spawnPoints.removeAt(index);
          ratsToSpawn--;
        }
      }
    } else if (ch.alignment !== Char$Alignment.ENEMY || !(ch instanceof Mob) || ch instanceof Rat) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_transform', []), []);
      return;
    } else if (ch instanceof Ratmogrify$TransmogRat) {
      if ((ch).allied || !hero.hasTalent(Talent.RATLOMACY)) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_transform', []), []);
        return;
      } else {
        (ch).makeAlly();
        ch.sprite_.emitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 5);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        if (hero.pointsInTalent(Talent.RATLOMACY) > 1) {
          Buff.affect$Char$Class$float(ch, $J.cls(Adrenaline), Math.fround(Math.imul(2, ((hero.pointsInTalent(Talent.RATLOMACY) - 1) | 0))));
        }
      }
    } else if (Char.hasProp(ch, Char$Property.MINIBOSS) || Char.hasProp(ch, Char$Property.BOSS)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'too_strong', []), []);
      return;
    } else {
      let rat = new Ratmogrify$TransmogRat()._Ratmogrify$TransmogRat();
      rat.setup(ch);
      rat.pos = ch.pos;
      let persistentBuffs = new HashSet();
      for (const $it0 = ch.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        if (b.revivePersists) {
          persistentBuffs.add(b);
        }
      }
      Actor.remove(ch);
      ch.sprite_.killAndErase();
      Dungeon.level.mobs.remove(ch);
      for (const $it1 = persistentBuffs.iterator(); $it1.hasNext(); ) {
        let b = $it1.next();
        ch.add(b);
      }
      GameScene.add$Mob(rat);
      TargetHealthIndicator.instance.target$Char(null);
      CellEmitter.get(rat.pos).burst(Speck.factory$int(Speck.WOOL), 4);
      Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
      if (!rat.isAlive()) {
        rat.die(this);
      } else {
        Dungeon.level.occupyCell(rat);
      }
    }
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    Invisibility.dispel$();
    hero.spendAndNext(Actor.TICK);
  }
  icon(): number {
    return HeroIcon.RATMOGRIFY;
  }
  talents(): Talent[] {
    return [Talent.RATSISTANCE, Talent.RATLOMACY, Talent.RATFORCEMENTS, Talent.HEROIC_ENERGY];
  }
  static $clinit() {
    Ratmogrify.useRatroicEnergy = false;
  }
}

export class Ratmogrify$TransmogRat extends Mob {
  original: Mob = null;
  allied: boolean = false;
  timeLeft: number = 0;
  static readonly ORIGINAL: string = 'original';
  static readonly ALLIED: string = 'allied';
  _Ratmogrify$TransmogRat(): this {
    this._Mob();
    this.spriteClass = $J.cls(RatSprite);
    this.firstAdded = false;
    this.timeLeft = 6;
    this.immunities_.add($J.cls(AllyBuff));
    return this;
  }
  setup(original: Mob): void {
    this.original = original;
    original.clearTime();
    this.HP = original.HP;
    this.HT = original.HT;
    this.defenseSkill_ = original.defenseSkill_;
    this.EXP = original.EXP;
    this.maxLvl = original.maxLvl;
    if (original.state_ === original.SLEEPING) {
      this.state_ = this.SLEEPING;
    } else if (original.state_ === original.HUNTING) {
      this.state_ = this.HUNTING;
    } else {
      this.state_ = this.WANDERING;
    }
  }
  getOriginal(): Mob {
    if (this.original != null) {
      this.original.HP = this.HP;
      this.original.pos = this.pos;
    }
    return this.original;
  }
  act(): boolean {
    if (this.timeLeft <= Math.fround(0)) {
      let original = this.getOriginal();
      this.original = null;
      GameScene.add$Mob(original);
      this.EXP = 0;
      this.destroy();
      this.sprite_.killAndErase();
      CellEmitter.get(original.pos).burst(Speck.factory$int(Speck.WOOL), 4);
      Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
      return true;
    } else {
      return super.act();
    }
  }
  spend(time: number): void {
    if (!this.allied) {
      this.timeLeft = Math.fround(this.timeLeft - time);
    }
    super.spend(time);
  }
  makeAlly(): void {
    this.allied = true;
    this.alignment = Char$Alignment.ALLY;
    this.timeLeft = Infinity;
    if (this.original != null) {
      this.original.pos = this.pos;
      AllyBuff.affectAndLoot(this.original, Dungeon.hero, $J.cls(ScrollOfSirensSong$Enthralled));
    }
  }
  attackSkill(target: Char): number {
    return this.original.attackSkill(target);
  }
  drRoll(): number {
    return this.original.drRoll();
  }
  damageRoll(): number {
    let damage = this.original.damageRoll();
    if (!this.allied && Dungeon.hero.hasTalent(Talent.RATSISTANCE)) {
      damage = $J.d2i(damage * $J.pow(Math.fround(0.9), Dungeon.hero.pointsInTalent(Talent.RATSISTANCE)));
    }
    return damage;
  }
  attackDelay(): number {
    return this.original.attackDelay();
  }
  rollToDropLoot(): void {
    this.original.pos = this.pos;
    this.original.rollToDropLoot();
  }
  destroy(): void {
    super.destroy();
    if (this.alignment === Char$Alignment.ENEMY && this.original != null) {
      Bestiary.setSeen(this.original.getClass());
      Bestiary.countEncounter(this.original.getClass());
    }
    if (this.original instanceof Statue) {
      Notes.remove$Landmark(this.original.landmark());
    }
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', [this.original.name()]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Ratmogrify$TransmogRat.ORIGINAL, this.original);
    bundle.put$String$boolean(Ratmogrify$TransmogRat.ALLIED, this.allied);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.original = bundle.get$String(Ratmogrify$TransmogRat.ORIGINAL);
    this.defenseSkill_ = this.original.defenseSkill_;
    this.EXP = this.original.EXP;
    this.allied = bundle.getBoolean(Ratmogrify$TransmogRat.ALLIED);
    if (this.allied) {
      this.alignment = Char$Alignment.ALLY;
    }
  }
}

$J.define(Ratmogrify, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_Ratmogrify' }, clinit: true, lazy: ['useRatroicEnergy'] });
$J.define(Ratmogrify$TransmogRat, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify$TransmogRat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Ratmogrify$TransmogRat' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Adrenaline = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Adrenaline');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  AscensionChallenge$AscensionBuffBlocker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge$AscensionBuffBlocker');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Rat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfSirensSong$Enthralled = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfSirensSong$Enthralled');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  RatSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.RatSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
