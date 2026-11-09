// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/ChaliceOfBlood.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Badges, Dungeon, Actor, MagicImmune, Hero, HeroSubClass, HolyWard$HolyArmBuff, FloatingText, ShadowParticle, WandOfLivingEarth$RockArmor, Catalog, Messages, Earthroot$Armor, GameScene, CharSprite, ItemSprite, ItemSpriteSheet, GLog, WndOptions, Sample, Random;

export class ChaliceOfBlood extends Artifact {
  static readonly AC_PRICK: string = 'PRICK';
  _ChaliceOfBlood(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_CHALICE1;
    this.levelCap = 10;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && this.level$() < this.levelCap && !this.cursed && !hero.isInvulnerable($J.getClass(this)) && hero.buff($J.cls(MagicImmune)) == null) {
      actions.add(ChaliceOfBlood.AC_PRICK);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, ChaliceOfBlood.AC_PRICK)) {
      let minDmg = this.minPrickDmg();
      let maxDmg = this.maxPrickDmg();
      let totalHeroHP = (hero.HP + hero.shielding()) | 0;
      let deathChance = 0;
      if (totalHeroHP <= maxDmg) {
        deathChance = Math.fround(((maxDmg - (totalHeroHP - 1)) | 0) / Math.fround(((maxDmg - minDmg + 1) | 0)));
        if (deathChance < 0.5) {
          deathChance = Math.fround(Math.fround($J.pow(Math.fround(2 * deathChance), 2)) / 2);
        } else if (deathChance < 1) {
          deathChance = Math.fround(1 - deathChance);
          deathChance = Math.fround(Math.fround($J.pow(Math.fround(2 * deathChance), 2)) / 2);
          deathChance = Math.fround(1 - deathChance);
        } else {
          deathChance = 1;
        }
      }
      GameScene.show(new (ChaliceOfBlood$1())().$o(this)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.name()), Messages.get$Object$String$ObjectArr(this, 'prick_warn', [minDmg, maxDmg, Messages.decimalFormat('#.##', Math.fround(100 * deathChance))]), [Messages.get$Object$String$ObjectArr(this, 'yes', []), Messages.get$Object$String$ObjectArr(this, 'no', [])]));
    }
  }
  minPrickDmg(): number {
    return $J.d2i(Math.ceil(Math.fround(3 + Math.fround(2.5 * (Math.imul(this.level$(), this.level$()))))));
  }
  maxPrickDmg(): number {
    return $J.d2i(Math.floor(Math.fround(7 + Math.fround(3.5 * (Math.imul(this.level$(), this.level$()))))));
  }
  prick(hero: Hero): void {
    let damage = Random.NormalIntRange(this.minPrickDmg(), this.maxPrickDmg());
    let armor = hero.buff($J.cls(Earthroot$Armor));
    if (armor != null) {
      damage = armor.absorb(damage);
    }
    if (hero.buff($J.cls(MagicImmune)) != null && hero.buff($J.cls(HolyWard$HolyArmBuff)) != null) {
      damage = (damage - (hero.subClass === HeroSubClass.PALADIN ? 3 : 1)) | 0;
    }
    let rockArmor = hero.buff($J.cls(WandOfLivingEarth$RockArmor));
    if (rockArmor != null) {
      damage = rockArmor.absorb(damage);
    }
    damage = (damage - hero.drRoll()) | 0;
    hero.sprite_.operate$int(hero.pos);
    hero.busy();
    hero.spend(Actor.TICK);
    GLog.w(Messages.get$Object$String$ObjectArr(this, 'onprick', []), []);
    if (damage <= 0) {
      damage = 1;
    } else {
      Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
      hero.sprite_.emitter().burst(ShadowParticle.CURSE, (4 + ($J.idiv(damage, 10))) | 0);
    }
    hero.damage(damage, this);
    if (!hero.isAlive()) {
      Badges.validateDeathFromFriendlyMagic();
      Dungeon.fail(this);
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
    } else {
      this.upgrade$();
      Catalog.countUse($J.getClass(this));
    }
  }
  upgrade$(): Item {
    if (this.level$() >= 6) {
      this.image_ = ItemSpriteSheet.ARTIFACT_CHALICE3;
    } else if (this.level$() >= 2) {
      this.image_ = ItemSpriteSheet.ARTIFACT_CHALICE2;
    }
    return super.upgrade$();
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (this.level$() >= 7) {
      this.image_ = ItemSpriteSheet.ARTIFACT_CHALICE3;
    } else if (this.level$() >= 3) {
      this.image_ = ItemSpriteSheet.ARTIFACT_CHALICE2;
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new ChaliceOfBlood$chaliceRegen().$o(this)._ChaliceOfBlood$chaliceRegen();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (target.isStarving()) {
      return;
    }
    let healDelay = Math.fround(10 - (Math.fround(Math.fround(1.33) + Math.fround(this.level$() * Math.fround(0.667)))));
    healDelay = Math.fround(healDelay / amount);
    let heal = Math.fround(5 / healDelay);
    if (Random.Float$() < Math.fround(heal % 1)) {
      heal++;
    }
    if (heal >= 1 && target.HP < target.HT) {
      target.HP = Math.min(target.HT, (target.HP + $J.d2i(heal)) | 0);
      target.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.d2i(heal)), FloatingText.HEALING, []);
      if (target.HP === target.HT && target instanceof Hero) {
        (target).resting = false;
      }
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      desc += '\n\n';
      if (this.cursed) {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      } else if (this.level$() === 0) {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_1', []);
      } else if (this.level$() < this.levelCap) {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_2', []);
      } else {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_3', []);
      }
    }
    return desc;
  }
}

export class ChaliceOfBlood$chaliceRegen extends Artifact$ArtifactBuff {
  _ChaliceOfBlood$chaliceRegen(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
}

let $ChaliceOfBlood$1: any = null;
/** An anonymous class (ChaliceOfBlood.java:106). */
function ChaliceOfBlood$1(): any {
  return $ChaliceOfBlood$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.prick(Dungeon.hero);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood$1', []);
}

$J.define(ChaliceOfBlood, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_ChaliceOfBlood' }, meths: { 'upgrade()': 'upgrade$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(ChaliceOfBlood$chaliceRegen, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood$chaliceRegen', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_ChaliceOfBlood$chaliceRegen' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  HolyWard$HolyArmBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard$HolyArmBuff');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  WandOfLivingEarth$RockArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$RockArmor');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Earthroot$Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Armor');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
