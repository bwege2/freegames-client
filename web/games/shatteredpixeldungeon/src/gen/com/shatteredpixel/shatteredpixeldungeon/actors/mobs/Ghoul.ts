// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Ghoul.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { Mob$Sleeping } from './Mob.ts';
import { Mob$Wandering } from './Mob.ts';
import { Buff } from '../buffs/Buff.ts';

let Dungeon, Actor, Char, Char$Property, SacrificialFire$Marked, Challenge$DuelParticipant, Challenge$SpectatorFreeze, FloatingText, Pushing, Gold, Chasm, GameScene, CharSprite, GhoulSprite, PathFinder, Random;

export class Ghoul extends Mob {
  timesDowned: number = 0;
  partnerID: number = 0;
  static readonly PARTNER_ID: string = 'partner_id';
  static readonly TIMES_DOWNED: string = 'times_downed';
  beingLifeLinked: boolean = false;
  _Ghoul(): this {
    this._Mob();
    this.spriteClass = $J.cls(GhoulSprite);
    this.HP = this.HT = 45;
    this.defenseSkill_ = 20;
    this.EXP = 5;
    this.maxLvl = 20;
    this.SLEEPING = new Ghoul$Sleeping().$o(this)._Ghoul$Sleeping();
    this.WANDERING = new Ghoul$Wandering().$o(this)._Ghoul$Wandering();
    this.state_ = this.SLEEPING;
    this.loot = $J.cls(Gold);
    this.lootChance_ = Math.fround(0.2);
    this.properties_.add(Char$Property.UNDEAD);
    this.timesDowned = 0;
    this.partnerID = -1;
    this.beingLifeLinked = false;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(16, 22);
  }
  attackSkill(target: Char): number {
    return 24;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 4)) | 0;
  }
  spawningWeight(): number {
    return 0.5;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Ghoul.PARTNER_ID, this.partnerID);
    bundle.put$String$int(Ghoul.TIMES_DOWNED, this.timesDowned);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.partnerID = bundle.getInt(Ghoul.PARTNER_ID);
    this.timesDowned = bundle.getInt(Ghoul.TIMES_DOWNED);
  }
  act(): boolean {
    if (this.partnerID === -1) {
      let candidates = new ArrayList();
      let neighbours = [(this.pos + 1) | 0, (this.pos - 1) | 0, (this.pos + Dungeon.level.width()) | 0, (this.pos - Dungeon.level.width()) | 0];
      for (let n of neighbours) {
        if (Dungeon.level.passable[n] && Actor.findChar(n) == null && (!Char.hasProp(this, Char$Property.LARGE) || Dungeon.level.openSpace[n])) {
          candidates.add(n);
        }
      }
      if (!candidates.isEmpty()) {
        let child = new Ghoul()._Ghoul();
        child.partnerID = this.id();
        this.partnerID = child.id();
        if (this.state_ !== this.SLEEPING) {
          child.state_ = child.WANDERING;
        }
        child.pos = Random.element$Collection(candidates);
        GameScene.add$Mob(child);
        Dungeon.level.occupyCell(child);
        if (this.sprite_.visible_) {
          Actor.add$Actor(new Pushing()._Pushing$Char$int$int(child, this.pos, child.pos));
        }
        for (const $it0 = this.buffs$().iterator(); $it0.hasNext(); ) {
          let b = $it0.next();
          if (b.revivePersists) {
            Buff.affect$Char$Class(child, b.getClass());
          }
        }
      }
    }
    return super.act();
  }
  die(cause: any): void {
    if (cause !== $J.cls(Chasm) && cause !== $J.cls(Ghoul$GhoulLifeLink) && !Dungeon.level.pit[this.pos]) {
      let nearby = Ghoul$GhoulLifeLink.searchForHost(this);
      if (nearby != null) {
        this.beingLifeLinked = true;
        this.timesDowned++;
        Actor.remove(this);
        Dungeon.level.mobs.remove(this);
        Buff.append$Char$Class(nearby, $J.cls(Ghoul$GhoulLifeLink)).set(Math.imul(this.timesDowned, 5), this);
        (this.sprite_).crumple();
        return;
      }
    }
    super.die(cause);
  }
  isAlive(): boolean {
    return super.isAlive() || this.beingLifeLinked;
  }
  isActive(): boolean {
    return !this.beingLifeLinked && this.isAlive();
  }
  onRemove(): void {
    if (this.beingLifeLinked) {
      for (const $it1 = this.buffs$().iterator(); $it1.hasNext(); ) {
        let buff = $it1.next();
        if (buff instanceof SacrificialFire$Marked) {
          Buff.prolong(this, $J.cls(SacrificialFire$Marked), Math.fround(Math.imul(this.timesDowned, 5)));
        } else if (buff.revivePersists) {
        } else {
          buff.detach();
        }
      }
    } else {
      super.onRemove();
    }
  }
}

export class Ghoul$Sleeping extends Mob$Sleeping {
  _Ghoul$Sleeping(): this {
    this._Mob$Sleeping();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    let partner = Actor.findById(this.$outer.partnerID);
    if (partner != null && partner.state_ !== partner.SLEEPING) {
      this.$outer.state_ = this.$outer.WANDERING;
      this.$outer.target = partner.pos;
      return true;
    } else {
      return super.act(enemyInFOV, justAlerted);
    }
  }
}

export class Ghoul$Wandering extends Mob$Wandering {
  _Ghoul$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  continueWandering(): boolean {
    this.$outer.enemySeen = false;
    let partner = Actor.findById(this.$outer.partnerID);
    if (partner != null && (partner.state_ !== partner.WANDERING || Dungeon.level.distance(this.$outer.pos, partner.target) > 1)) {
      this.$outer.target = partner.pos;
      let oldPos = this.$outer.pos;
      if (this.$outer.getCloser(this.$outer.target)) {
        this.$outer.spend(Math.fround(1 / this.$outer.speed()));
        return this.$outer.moveSprite(oldPos, this.$outer.pos);
      } else {
        this.$outer.spend(Actor.TICK);
        return true;
      }
    } else {
      return super.continueWandering();
    }
  }
}

export class Ghoul$GhoulLifeLink extends Buff {
  ghoul: Ghoul = null;
  turnsToRevive: number = 0;
  static readonly GHOUL: string = 'ghoul';
  static readonly LEFT: string = 'left';
  _Ghoul$GhoulLifeLink(): this {
    this._Buff();
    return this;
  }
  act(): boolean {
    if (this.target.alignment !== this.ghoul.alignment) {
      this.detach();
      return true;
    }
    if (this.target.fieldOfView == null) {
      this.target.fieldOfView = $J.newArray(Dungeon.level.length(), false);
      Dungeon.level.updateFieldOfView(this.target, this.target.fieldOfView);
    }
    if (!this.target.fieldOfView[this.ghoul.pos] && Dungeon.level.distance(this.ghoul.pos, this.target.pos) >= 4) {
      this.detach();
      return true;
    }
    if (Dungeon.level.pit[this.ghoul.pos]) {
      super.detach();
      this.ghoul.beingLifeLinked = false;
      this.ghoul.die(this);
      return true;
    }
    if (this.target.buff($J.cls(Challenge$DuelParticipant)) == null) {
      this.turnsToRevive--;
    }
    if (this.turnsToRevive <= 0) {
      if (Actor.findChar(this.ghoul.pos) != null) {
        let candidates = new ArrayList();
        for (let n of PathFinder.NEIGHBOURS8) {
          let cell = (this.ghoul.pos + n) | 0;
          if (Dungeon.level.passable[cell] && Actor.findChar(cell) == null && (!Char.hasProp(this.ghoul, Char$Property.LARGE) || Dungeon.level.openSpace[cell])) {
            candidates.add(cell);
          }
        }
        if (candidates.size() > 0) {
          let newPos = Random.element$Collection(candidates);
          Actor.add$Actor(new Pushing()._Pushing$Char$int$int(this.ghoul, this.ghoul.pos, newPos));
          this.ghoul.pos = newPos;
        } else {
          this.spend(Actor.TICK);
          return true;
        }
      }
      this.ghoul.HP = $J.roundf(Math.fround(this.ghoul.HT / 10));
      this.ghoul.beingLifeLinked = false;
      Actor.add$Actor(this.ghoul);
      this.ghoul.timeToNow();
      Dungeon.level.mobs.add(this.ghoul);
      Dungeon.level.occupyCell(this.ghoul);
      this.ghoul.sprite_.idle();
      this.ghoul.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.roundf(Math.fround(this.ghoul.HT / 10))), FloatingText.HEALING, []);
      if (this.ghoul.enemy != null && this.ghoul.enemy.alignment === this.ghoul.alignment) {
        this.ghoul.enemy = null;
      }
      super.detach();
      return true;
    }
    this.spend(Actor.TICK);
    return true;
  }
  updateVisibility(): void {
    if (this.ghoul != null && this.ghoul.sprite_ != null) {
      this.ghoul.sprite_.visible_ = Dungeon.level.heroFOV[this.ghoul.pos];
    }
  }
  set(turns: number, ghoul: Ghoul): void {
    this.ghoul = ghoul;
    this.turnsToRevive = turns;
  }
  fx(on: boolean): void {
    if (on && this.ghoul != null && this.ghoul.sprite_ == null) {
      GameScene.addSprite(this.ghoul);
      (this.ghoul.sprite_).crumple();
    }
  }
  detach(): void {
    super.detach();
    let newHost = Ghoul$GhoulLifeLink.searchForHost(this.ghoul);
    if (newHost != null) {
      this.attachTo(newHost);
      this.timeToNow();
    } else {
      this.ghoul.beingLifeLinked = false;
      this.ghoul.die(this);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Ghoul$GhoulLifeLink.GHOUL, this.ghoul);
    bundle.put$String$int(Ghoul$GhoulLifeLink.LEFT, this.turnsToRevive);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.ghoul = bundle.get$String(Ghoul$GhoulLifeLink.GHOUL);
    this.ghoul.beingLifeLinked = true;
    this.turnsToRevive = bundle.getInt(Ghoul$GhoulLifeLink.LEFT);
  }
  static searchForHost(dieing: Ghoul): Ghoul {
    for (const $it2 = Actor.chars().iterator(); $it2.hasNext(); ) {
      let ch = $it2.next();
      if (ch !== dieing && ch instanceof Ghoul && ch.alignment === dieing.alignment && ch.buff($J.cls(Challenge$SpectatorFreeze)) == null) {
        if (ch.fieldOfView == null) {
          ch.fieldOfView = $J.newArray(Dungeon.level.length(), false);
          Dungeon.level.updateFieldOfView(ch, ch.fieldOfView);
        }
        if (ch.fieldOfView[dieing.pos] || Dungeon.level.distance(ch.pos, dieing.pos) < 4) {
          return ch;
        }
      }
    }
    return null;
  }
}

$J.define(Ghoul, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Ghoul' } });
$J.define(Ghoul$Sleeping, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul$Sleeping', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Sleeping', ctors: { '': '_Ghoul$Sleeping' }, inner: true });
$J.define(Ghoul$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_Ghoul$Wandering' }, inner: true });
$J.define(Ghoul$GhoulLifeLink, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul$GhoulLifeLink', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Ghoul$GhoulLifeLink' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  SacrificialFire$Marked = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire$Marked');
  Challenge$DuelParticipant = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$DuelParticipant');
  Challenge$SpectatorFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$SpectatorFreeze');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  GhoulSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GhoulSprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
