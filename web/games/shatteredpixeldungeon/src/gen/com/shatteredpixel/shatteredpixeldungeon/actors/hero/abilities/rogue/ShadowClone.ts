// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/rogue/ShadowClone.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char$Property, AllyBuff, Invisibility, HeroClass, Talent, SpiritHawk, SmokeParticle, Item, CityLevel$Smoke, Messages, GameScene, HeroSprite, HeroIcon, GLog, MovieClip$Animation, TextureFilm, Sample, BArray, PathFinder, Random;

export class ShadowClone extends ArmorAbility {
  _ShadowClone(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  targetingPrompt(): string {
    if (ShadowClone.getShadowAlly() == null) {
      return super.targetingPrompt();
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
    }
  }
  useTargeting(): boolean {
    return false;
  }
  chargeUse(hero: Hero): number {
    if (ShadowClone.getShadowAlly() == null) {
      return super.chargeUse(hero);
    } else {
      return 0;
    }
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    let ally = ShadowClone.getShadowAlly();
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
        if (Actor.findChar(p) == null && Dungeon.level.passable[p]) {
          spawnPoints.add(p);
        }
      }
      if (!spawnPoints.isEmpty()) {
        armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
        Item.updateQuickslot();
        ally = new ShadowClone$ShadowAlly()._ShadowClone$ShadowAlly$int(hero.lvl);
        ally.pos = Random.element$Collection(spawnPoints);
        GameScene.add$Mob(ally);
        ShadowClone$ShadowAlly.appear(ally, ally.pos);
        Invisibility.dispel$();
        hero.spendAndNext(Actor.TICK);
      } else {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SpiritHawk), 'no_space', []), []);
      }
    }
  }
  icon(): number {
    return HeroIcon.SHADOW_CLONE;
  }
  talents(): Talent[] {
    return [Talent.SHADOW_BLADE, Talent.CLONED_ARMOR, Talent.PERFECT_COPY, Talent.HEROIC_ENERGY];
  }
  static getShadowAlly(): ShadowClone$ShadowAlly {
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch instanceof ShadowClone$ShadowAlly) {
        return ch;
      }
    }
    return null;
  }
}

export class ShadowClone$ShadowAlly extends DirectableAlly {
  static readonly DEF_SKILL: string = 'def_skill';
  $init_ShadowClone_ShadowAlly() {
    this.spriteClass = $J.cls(ShadowClone$ShadowSprite);
    this.HP = this.HT = 80;
    this.immunities_.add($J.cls(AllyBuff));
    this.properties_.add(Char$Property.INORGANIC);
  }
  _ShadowClone$ShadowAlly$(): this {
    this._DirectableAlly();
    this.$init_ShadowClone_ShadowAlly();
    return this;
  }
  _ShadowClone$ShadowAlly$int(heroLevel: number): this {
    this._DirectableAlly();
    this.$init_ShadowClone_ShadowAlly();
    let hpBonus = (15 + Math.imul(5, heroLevel)) | 0;
    hpBonus = $J.roundf(Math.fround(Math.fround(Math.fround(0.1) * Dungeon.hero.pointsInTalent(Talent.PERFECT_COPY)) * hpBonus));
    if (hpBonus > 0) {
      this.HT = (this.HT + hpBonus) | 0;
      this.HP = (this.HP + hpBonus) | 0;
    }
    this.defenseSkill_ = (heroLevel + 4) | 0;
    return this;
  }
  act(): boolean {
    let oldPos = this.pos;
    let result = super.act();
    if ((this.pos === this.target || oldPos === this.pos) && this.sprite_.looping()) {
      this.sprite_.idle();
    }
    return result;
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
  attackSkill(target: Char): number {
    return (this.defenseSkill_ + 5) | 0;
  }
  damageRoll(): number {
    let damage = Random.NormalIntRange(10, 20);
    let heroDamage = Dungeon.hero.damageRoll();
    heroDamage = $J.d2i(Math.fround(heroDamage / Dungeon.hero.attackDelay()));
    heroDamage = $J.roundf(Math.fround(Math.fround(Math.fround(0.08) * Dungeon.hero.pointsInTalent(Talent.SHADOW_BLADE)) * heroDamage));
    if (heroDamage > 0) {
      damage = (damage + heroDamage) | 0;
    }
    return damage;
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (Random.Int$int(4) < Dungeon.hero.pointsInTalent(Talent.SHADOW_BLADE) && Dungeon.hero.belongings.weapon() != null) {
      return Dungeon.hero.belongings.weapon().proc(this, enemy, damage);
    } else {
      return damage;
    }
  }
  drRoll(): number {
    let dr = super.drRoll();
    let heroRoll = Dungeon.hero.drRoll();
    heroRoll = $J.roundf(Math.fround(Math.fround(Math.fround(0.12) * Dungeon.hero.pointsInTalent(Talent.CLONED_ARMOR)) * heroRoll));
    if (heroRoll > 0) {
      dr = (dr + heroRoll) | 0;
    }
    return dr;
  }
  glyphLevel(cls: JClass<Armor$Glyph>): number {
    if (Dungeon.hero != null && Random.Int$int(4) < Dungeon.hero.pointsInTalent(Talent.CLONED_ARMOR)) {
      return Math.max(super.glyphLevel(cls), Dungeon.hero.glyphLevel(cls));
    } else {
      return super.glyphLevel(cls);
    }
  }
  defenseProc(enemy: Char, damage: number): number {
    damage = super.defenseProc(enemy, damage);
    if (Random.Int$int(4) < Dungeon.hero.pointsInTalent(Talent.CLONED_ARMOR) && Dungeon.hero.belongings.armor() != null) {
      return Dungeon.hero.belongings.armor().proc(enemy, this, damage);
    } else {
      return damage;
    }
  }
  speed(): number {
    let speed = super.speed();
    if (this.state_ === this.WANDERING && this.defendingPos === -1 && Dungeon.level.distance(this.pos, Dungeon.hero.pos) > 1) {
      speed = Math.fround(speed * 2);
    }
    return speed;
  }
  canInteract(c: Char): boolean {
    if (super.canInteract(c)) {
      return true;
    } else if (Dungeon.level.distance(this.pos, c.pos) <= Dungeon.hero.pointsInTalent(Talent.PERFECT_COPY)) {
      return true;
    } else {
      return false;
    }
  }
  interact(c: Char): boolean {
    if (!Dungeon.hero.hasTalent(Talent.PERFECT_COPY)) {
      return super.interact(c);
    }
    if (!Dungeon.level.passable[this.pos] && !c.flying) {
      return true;
    }
    if (this.properties().contains(Char$Property.LARGE) && !Dungeon.level.openSpace[c.pos] || c.properties().contains(Char$Property.LARGE) && !Dungeon.level.openSpace[this.pos]) {
      return true;
    }
    let curPos = this.pos;
    PathFinder.buildDistanceMap$int$booleanArr(c.pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null));
    if (PathFinder.distance[this.pos] === 2147483647) {
      return true;
    }
    ShadowClone$ShadowAlly.appear(this, Dungeon.hero.pos);
    ShadowClone$ShadowAlly.appear(Dungeon.hero, curPos);
    Dungeon.observe$();
    GameScene.updateFog$();
    return true;
  }
  static appear(ch: Char, pos: number): void {
    ch.sprite_.interruptMotion();
    if (Dungeon.level.heroFOV[pos] || Dungeon.level.heroFOV[ch.pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
    }
    ch.move$int(pos);
    if (ch.pos === pos) {
      ch.sprite_.place(pos);
    }
    if (Dungeon.level.heroFOV[pos] || ch === Dungeon.hero) {
      ch.sprite_.emitter().burst(SmokeParticle.FACTORY, 10);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ShadowClone$ShadowAlly.DEF_SKILL, this.defenseSkill_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.defenseSkill_ = bundle.getInt(ShadowClone$ShadowAlly.DEF_SKILL);
  }
}

export class ShadowClone$ShadowSprite extends MobSprite {
  smoke: Emitter = null;
  _ShadowClone$ShadowSprite(): this {
    this._MobSprite();
    this.texture(HeroClass.ROGUE.spritesheet());
    let film = new TextureFilm()._TextureFilm$TextureFilm$Object$int$int(HeroSprite.tiers(), 6, 12, 15);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(film, [0, 0, 0, 1, 0, 0, 1, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.run_.frames$TextureFilm$ObjectArr(film, [2, 3, 4, 5, 6, 7]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.die_.frames$TextureFilm$ObjectArr(film, [0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(film, [13, 14, 15, 0]);
    this.idle();
    this.resetColor();
    return this;
  }
  onComplete$Tweener(tweener: Tweener): void {
    super.onComplete$Tweener(tweener);
  }
  resetColor(): void {
    super.resetColor();
    this.alpha$float(Math.fround(0.8));
    this.brightness(0);
  }
  link(ch: Char): void {
    super.link(ch);
    this.renderShadow = false;
    if (this.smoke == null) {
      this.smoke = this.emitter();
      this.smoke.pour(CityLevel$Smoke.factory, Math.fround(0.2));
    }
  }
  update(): void {
    super.update();
    if (this.smoke != null) {
      this.smoke.visible_ = this.visible_;
    }
  }
  kill(): void {
    super.kill();
    if (this.smoke != null) {
      this.smoke.on = false;
    }
  }
}

$J.define(ShadowClone, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_ShadowClone' } });
$J.define(ShadowClone$ShadowAlly, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone$ShadowAlly', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly', ctors: { 'int': '_ShadowClone$ShadowAlly$int', '': '_ShadowClone$ShadowAlly$' } });
$J.define(ShadowClone$ShadowSprite, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone$ShadowSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_ShadowClone$ShadowSprite' }, meths: { 'onComplete(com.watabou.noosa.tweeners.Tweener)': 'onComplete$Tweener' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  SpiritHawk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk');
  SmokeParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  CityLevel$Smoke = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$Smoke');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
