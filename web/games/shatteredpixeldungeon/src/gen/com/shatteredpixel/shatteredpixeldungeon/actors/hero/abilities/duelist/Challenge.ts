// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/duelist/Challenge.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';
import { Buff } from '../../../buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, BlobImmunity, Doom, Invisibility, Talent, Mimic, Mob, NPC, CellEmitter, FloatingText, Speck, Item, Messages, GameScene, PixelScene, CharSprite, CharSprite$State, BuffIndicator, HeroIcon, GLog, Sample, BArray, PathFinder;

export class Challenge extends ArmorAbility {
  _Challenge(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 50;
    return this;
  }
  icon(): number {
    return HeroIcon.CHALLENGE;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  targetedPos(user: Char, dst: number): number {
    return dst;
  }
  chargeUse(hero: Hero): number {
    let chargeUse = super.chargeUse(hero);
    if (hero.buff($J.cls(Challenge$EliminationMatchTracker)) != null) {
      chargeUse = Math.fround(chargeUse * $J.pow(0.84, hero.pointsInTalent(Talent.ELIMINATION_MATCH)));
    }
    return chargeUse;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let targetCh = Actor.findChar(target);
    if (targetCh == null || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    }
    if (hero.buff($J.cls(Challenge$DuelParticipant)) != null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'already_dueling', []), []);
      return;
    }
    if (targetCh.alignment !== Char$Alignment.ENEMY && !(targetCh instanceof Mimic && targetCh.alignment === Char$Alignment.NEUTRAL)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ally_target', []), []);
      return;
    }
    let passable = BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null);
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (c !== hero) {
        passable[c.pos] = false;
      }
    }
    PathFinder.buildDistanceMap$int$booleanArr(targetCh.pos, passable);
    let reachable = PathFinder.distance.slice();
    let blinkpos = hero.pos;
    if (hero.hasTalent(Talent.CLOSE_THE_GAP) && !hero.rooted) {
      let blinkrange = (1 + hero.pointsInTalent(Talent.CLOSE_THE_GAP)) | 0;
      PathFinder.buildDistanceMap$int$booleanArr$int(hero.pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null), blinkrange);
      for (let i = 0; i < PathFinder.distance.length; i++) {
        if (PathFinder.distance[i] === 2147483647 || reachable[i] === 2147483647 || (!Dungeon.level.passable[i] && !(hero.flying && Dungeon.level.avoid[i])) || i === targetCh.pos) {
          continue;
        }
        if (Dungeon.level.distance(i, targetCh.pos) < Dungeon.level.distance(blinkpos, targetCh.pos)) {
          blinkpos = i;
        } else if (Dungeon.level.distance(i, targetCh.pos) === Dungeon.level.distance(blinkpos, targetCh.pos)) {
          if (Dungeon.level.trueDistance(i, hero.pos) < Dungeon.level.trueDistance(blinkpos, hero.pos)) {
            blinkpos = i;
          }
        }
      }
    }
    if (reachable[blinkpos] === 2147483647) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'unreachable_target', []), []);
      if (hero.rooted) {
        PixelScene.shake(1, 1);
      }
      return;
    }
    if (Dungeon.level.distance(blinkpos, targetCh.pos) > 5) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'distant_target', []), []);
      if (hero.rooted) {
        PixelScene.shake(1, 1);
      }
      return;
    }
    if (blinkpos !== hero.pos) {
      Dungeon.hero.pos = blinkpos;
      Dungeon.level.occupyCell(Dungeon.hero);
      Dungeon.observe$();
      GameScene.updateFog$();
      Dungeon.hero.checkVisibleMobs();
      Dungeon.hero.sprite_.place(Dungeon.hero.pos);
      CellEmitter.get(Dungeon.hero.pos).burst(Speck.factory$int(Speck.WOOL), 6);
      Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
    }
    let bossTarget = Char.hasProp(targetCh, Char$Property.BOSS);
    for (const $it1 = Actor.chars().iterator(); $it1.hasNext(); ) {
      let toFreeze = $it1.next();
      if (toFreeze !== targetCh && toFreeze.alignment !== Char$Alignment.ALLY && !(toFreeze instanceof NPC) && (!bossTarget || !(Char.hasProp(targetCh, Char$Property.BOSS) || Char.hasProp(targetCh, Char$Property.BOSS_MINION)))) {
        Actor.delayChar(toFreeze, Challenge$DuelParticipant.DURATION);
        Buff.affect$Char$Class$float(toFreeze, $J.cls(Challenge$SpectatorFreeze), Challenge$DuelParticipant.DURATION);
      }
    }
    Buff.affect$Char$Class(targetCh, $J.cls(Challenge$DuelParticipant));
    Buff.affect$Char$Class(hero, $J.cls(Challenge$DuelParticipant));
    if (targetCh instanceof Mob) {
      (targetCh).aggro(hero);
    }
    GameScene.flash$int(-2130706433);
    Sample.INSTANCE.play$Object(Assets$Sounds.DESCEND);
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    Invisibility.dispel$();
    hero.sprite_.zap$int(target);
    hero.next();
    if (hero.buff($J.cls(Challenge$EliminationMatchTracker)) != null) {
      hero.buff($J.cls(Challenge$EliminationMatchTracker)).detach();
    }
  }
  talents(): Talent[] {
    return [Talent.CLOSE_THE_GAP, Talent.INVIGORATING_VICTORY, Talent.ELIMINATION_MATCH, Talent.HEROIC_ENERGY];
  }
}

export class Challenge$EliminationMatchTracker extends FlavourBuff {
  _Challenge$EliminationMatchTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Challenge$DuelParticipant extends Buff {
  static DURATION: number = 0;
  left_: number = 0;
  takenDmg: number = 0;
  static readonly LEFT: string = 'left';
  static readonly TAKEN_DMG: string = 'taken_dmg';
  _Challenge$DuelParticipant(): this {
    this._Buff();
    this.left_ = $J.d2i(Challenge$DuelParticipant.DURATION);
    this.takenDmg = 0;
    return this;
  }
  icon(): number {
    return BuffIndicator.CHALLENGE;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Challenge$DuelParticipant.DURATION - this.left_)) / Challenge$DuelParticipant.DURATION));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  addDamage(dmg: number): void {
    this.takenDmg = (this.takenDmg + dmg) | 0;
  }
  act(): boolean {
    this.left_--;
    if (this.left_ === 0) {
      this.detach();
    } else {
      let other = null;
      for (const $it2 = Actor.chars().iterator(); $it2.hasNext(); ) {
        let ch = $it2.next();
        if (ch !== this.target && ch.buff($J.cls(Challenge$DuelParticipant)) != null) {
          other = ch;
        }
      }
      if (other == null || this.target.alignment === other.alignment || Dungeon.level.distance(this.target.pos, other.pos) > 5) {
        this.detach();
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  detach(): void {
    super.detach();
    if (this.target !== Dungeon.hero) {
      if (!this.target.isAlive() || this.target.alignment === Dungeon.hero.alignment) {
        Sample.INSTANCE.play$Object(Assets$Sounds.BOSS);
        if (Dungeon.hero.hasTalent(Talent.INVIGORATING_VICTORY)) {
          let heroBuff = Dungeon.hero.buff($J.cls(Challenge$DuelParticipant));
          let hpToHeal = 0;
          if (heroBuff != null) {
            hpToHeal = heroBuff.takenDmg;
          }
          hpToHeal = $J.l2i($J.lround(hpToHeal * (1 - $J.pow(Math.fround(0.707), Dungeon.hero.pointsInTalent(Talent.INVIGORATING_VICTORY)))));
          hpToHeal = (hpToHeal + Math.imul(5, Dungeon.hero.pointsInTalent(Talent.INVIGORATING_VICTORY))) | 0;
          hpToHeal = Math.min(hpToHeal, (Dungeon.hero.HT - Dungeon.hero.HP) | 0);
          if (hpToHeal > 0) {
            Dungeon.hero.HP = (Dungeon.hero.HP + hpToHeal) | 0;
            Dungeon.hero.sprite_.emitter().start(Speck.factory$int(Speck.HEALING), Math.fround(0.33), 6);
            Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(hpToHeal), FloatingText.HEALING, []);
          }
        }
      }
    } else {
      if (Dungeon.hero.isAlive()) {
        GameScene.flash$int(-2130706433);
        if (Dungeon.hero.hasTalent(Talent.ELIMINATION_MATCH)) {
          Buff.affect$Char$Class$float(this.target, $J.cls(Challenge$EliminationMatchTracker), 3);
        }
      }
    }
    for (const $it3 = Actor.chars().iterator(); $it3.hasNext(); ) {
      let ch = $it3.next();
      if (ch.buff($J.cls(Challenge$SpectatorFreeze)) != null) {
        ch.buff($J.cls(Challenge$SpectatorFreeze)).detach();
      }
      if (ch.buff($J.cls(Challenge$DuelParticipant)) != null && ch !== this.target) {
        ch.buff($J.cls(Challenge$DuelParticipant)).detach();
      }
    }
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.left_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Challenge$DuelParticipant.LEFT, this.left_);
    bundle.put$String$int(Challenge$DuelParticipant.TAKEN_DMG, this.takenDmg);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(Challenge$DuelParticipant.LEFT);
    this.takenDmg = bundle.getInt(Challenge$DuelParticipant.TAKEN_DMG);
  }
  static $clinit() {
    Challenge$DuelParticipant.DURATION = 10;
  }
}

export class Challenge$SpectatorFreeze extends FlavourBuff {
  _Challenge$SpectatorFreeze(): this {
    this._FlavourBuff();
    this.immunities_.addAll(new BlobImmunity()._BlobImmunity().immunities());
    return this;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.DARKENED);
      this.target.sprite_.add(CharSprite$State.PARALYSED);
    } else {
      if (this.target.buff($J.cls(Doom)) == null) {
        this.target.sprite_.remove$State(CharSprite$State.DARKENED);
      }
      if (this.target.paralysed === 0) {
        this.target.sprite_.remove$State(CharSprite$State.PARALYSED);
      }
    }
  }
  detach(): void {
    super.detach();
    if (this.cooldown() > Math.fround(0)) {
      Actor.delayChar(this.target, Math.fround(-this.cooldown()));
    }
  }
}

$J.define(Challenge, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_Challenge' } });
$J.define(Challenge$EliminationMatchTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$EliminationMatchTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Challenge$EliminationMatchTracker' } });
$J.define(Challenge$DuelParticipant, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$DuelParticipant', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Challenge$DuelParticipant' }, clinit: true, lazy: ['DURATION'] });
$J.define(Challenge$SpectatorFreeze, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$SpectatorFreeze', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Challenge$SpectatorFreeze' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  BlobImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  NPC = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
