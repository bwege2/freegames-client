// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/huntress/SpiritHawk.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { DirectableAlly } from '../../../mobs/npcs/DirectableAlly.ts';
import { MobSprite } from '../../../../sprites/MobSprite.ts';

let Assets$Sprites, Dungeon, Actor, Char, AllyBuff, Blindness, BlobImmunity, Buff, Cripple, Invisibility, Talent, Speck, ShaftParticle, Item, ScrollOfTeleportation, Messages, GameScene, HeroIcon, GLog, MovieClip$Animation, TextureFilm, GameMath, PathFinder, Random;

export class SpiritHawk extends ArmorAbility {
  _SpiritHawk(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  targetingPrompt(): string {
    if (SpiritHawk.getHawk() == null) {
      return super.targetingPrompt();
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
    }
  }
  useTargeting(): boolean {
    return false;
  }
  chargeUse(hero: Hero): number {
    if (SpiritHawk.getHawk() == null) {
      return super.chargeUse(hero);
    } else {
      return 0;
    }
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    let ally = SpiritHawk.getHawk();
    if (ally != null) {
      if (target == null) {
        return;
      } else {
        ally.directTocell(target);
      }
    } else {
      let spawnPoints = new ArrayList();
      for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
        let p = (hero.pos + PathFinder.NEIGHBOURS8[i]) | 0;
        if (Actor.findChar(p) == null && (Dungeon.level.passable[p] || Dungeon.level.avoid[p])) {
          spawnPoints.add(p);
        }
      }
      if (!spawnPoints.isEmpty()) {
        armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
        Item.updateQuickslot();
        ally = new SpiritHawk$HawkAlly()._SpiritHawk$HawkAlly();
        ally.pos = Random.element$Collection(spawnPoints);
        GameScene.add$Mob(ally);
        ScrollOfTeleportation.appear(ally, ally.pos);
        Dungeon.observe$();
        Invisibility.dispel$();
        hero.spendAndNext(Actor.TICK);
      } else {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_space', []), []);
      }
    }
  }
  icon(): number {
    return HeroIcon.SPIRIT_HAWK;
  }
  talents(): Talent[] {
    return [Talent.EAGLE_EYE, Talent.GO_FOR_THE_EYES, Talent.SWIFT_SPIRIT, Talent.HEROIC_ENERGY];
  }
  static getHawk(): SpiritHawk$HawkAlly {
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch instanceof SpiritHawk$HawkAlly) {
        return ch;
      }
    }
    return null;
  }
}

export class SpiritHawk$HawkAlly extends DirectableAlly {
  dodgesUsed: number = 0;
  timeRemaining: number = 0;
  static readonly DODGES_USED: string = 'dodges_used';
  static readonly TIME_REMAINING: string = 'time_remaining';
  _SpiritHawk$HawkAlly(): this {
    this._DirectableAlly();
    this.spriteClass = $J.cls(SpiritHawk$HawkSprite);
    this.HP = this.HT = 10;
    this.defenseSkill_ = 60;
    this.flying = true;
    if (Dungeon.hero != null) {
      this.viewDistance = $J.d2i(GameMath.gate(6, Math.fround((6 + Dungeon.hero.pointsInTalent(Talent.EAGLE_EYE)) | 0), 8));
      this.baseSpeed = Math.fround(2 + Math.fround(Dungeon.hero.pointsInTalent(Talent.SWIFT_SPIRIT) / 2));
    } else {
      this.viewDistance = 6;
      this.baseSpeed = 2;
    }
    this.attacksAutomatically = false;
    this.immunities_.addAll(new BlobImmunity()._BlobImmunity().immunities());
    this.immunities_.add($J.cls(AllyBuff));
    this.dodgesUsed = 0;
    this.timeRemaining = 100;
    return this;
  }
  attackSkill(target: Char): number {
    return 60;
  }
  defenseSkill(enemy: Char): number {
    if (Dungeon.hero.hasTalent(Talent.SWIFT_SPIRIT) && this.dodgesUsed < Math.imul(2, Dungeon.hero.pointsInTalent(Talent.SWIFT_SPIRIT))) {
      this.dodgesUsed++;
      return Char.INFINITE_EVASION;
    }
    return super.defenseSkill(enemy);
  }
  damageRoll(): number {
    return Random.NormalIntRange(5, 10);
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    switch (Dungeon.hero.pointsInTalent(Talent.GO_FOR_THE_EYES)) {
      case 1:
        Buff.prolong(enemy, $J.cls(Blindness), 2);
        break;
      case 2:
        Buff.prolong(enemy, $J.cls(Blindness), 5);
        break;
      case 3:
        Buff.prolong(enemy, $J.cls(Blindness), 5);
        Buff.prolong(enemy, $J.cls(Cripple), 2);
        break;
      case 4:
        Buff.prolong(enemy, $J.cls(Blindness), 5);
        Buff.prolong(enemy, $J.cls(Cripple), 5);
        break;
      default:
    }
    return damage;
  }
  act(): boolean {
    if (this.timeRemaining <= Math.fround(0)) {
      this.die(null);
      Dungeon.hero.interrupt();
      return true;
    }
    this.viewDistance = (6 + Dungeon.hero.pointsInTalent(Talent.EAGLE_EYE)) | 0;
    this.baseSpeed = Math.fround(2 + Math.fround(Dungeon.hero.pointsInTalent(Talent.SWIFT_SPIRIT) / 2));
    let result = super.act();
    Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    GameScene.updateFog$int$int(this.pos, (this.viewDistance + $J.d2i(Math.ceil(this.speed()))) | 0);
    return result;
  }
  die(cause: any): void {
    this.flying = false;
    super.die(cause);
  }
  spend(time: number): void {
    super.spend(time);
    this.timeRemaining = Math.fround(this.timeRemaining - time);
  }
  destroy(): void {
    super.destroy();
    Dungeon.observe$();
    GameScene.updateFog$();
  }
  defendPos(cell: number): void {
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'direct_defend', []), []);
    super.defendPos(cell);
  }
  followHero(): void {
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'direct_follow', []), []);
    super.followHero();
  }
  targetChar(ch: Char): void {
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'direct_attack', []), []);
    super.targetChar(ch);
  }
  description(): string {
    let message = Messages.get$Object$String$ObjectArr(this, 'desc', [$J.d2i(this.timeRemaining)]);
    if (Actor.chars().contains(this)) {
      message += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_remaining', [$J.d2i(this.timeRemaining)]);
      if (this.dodgesUsed < Math.imul(2, Dungeon.hero.pointsInTalent(Talent.SWIFT_SPIRIT))) {
        message += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_dodges', [((Math.imul(2, Dungeon.hero.pointsInTalent(Talent.SWIFT_SPIRIT)) - this.dodgesUsed) | 0)]);
      }
    }
    return message;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(SpiritHawk$HawkAlly.DODGES_USED, this.dodgesUsed);
    bundle.put$String$float(SpiritHawk$HawkAlly.TIME_REMAINING, this.timeRemaining);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.dodgesUsed = bundle.getInt(SpiritHawk$HawkAlly.DODGES_USED);
    this.timeRemaining = bundle.getFloat(SpiritHawk$HawkAlly.TIME_REMAINING);
  }
}

export class SpiritHawk$HawkSprite extends MobSprite {
  _SpiritHawk$HawkSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.SPIRIT_HAWK);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 15, 15);
    let c = 0;
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(6, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(8, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0, 1]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [2, 3, 0, 1]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [4, 5, 6]);
    this.play$Animation(this.idle_);
    return this;
  }
  blood(): number {
    return -16711681;
  }
  die(): void {
    super.die();
    this.emitter().start(ShaftParticle.FACTORY, Math.fround(0.3), 4);
    this.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
  }
}

$J.define(SpiritHawk, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_SpiritHawk' } });
$J.define(SpiritHawk$HawkAlly, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk$HawkAlly', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly', ctors: { '': '_SpiritHawk$HawkAlly' } });
$J.define(SpiritHawk$HawkSprite, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk$HawkSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_SpiritHawk$HawkSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  BlobImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
