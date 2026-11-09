// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/SpiritForm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff, Buff$buffType, Corruption, Talent, Trinity$WndItemtypeSelect, Wraith, AlchemistsToolkit, Artifact, DriedRose, EtherealChains, HornOfPlenty, MasterThievesArmband, SandalsOfNature, SkeletonKey, TalismanOfForesight, TimekeepersHourglass, UnstableSpellbook, Ring, RingOfMight, Messages, Blindweed$Seed, Fadeleaf$Seed, Firebloom$Seed, Icecap$Seed, Sorrowmoss$Seed, Stormvine$Seed, Swiftthistle$TimeBubble, AlchemyScene, GameScene, BuffIndicator, HeroIcon, QuickSlotButton, Game, PathFinder, Random;

export class SpiritForm extends ClericSpell {
  static INSTANCE: SpiritForm = null;
  _SpiritForm(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.SPIRIT_FORM;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [SpiritForm.ringLevel(), SpiritForm.artifactLevel()]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  chargeUse(hero: Hero): number {
    return 4;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.SPIRIT_FORM);
  }
  onCast(tome: HolyTome, hero: Hero): void {
    GameScene.show(new Trinity$WndItemtypeSelect()._Trinity$WndItemtypeSelect(tome, this));
  }
  static ringLevel(): number {
    return Dungeon.hero.pointsInTalent(Talent.SPIRIT_FORM);
  }
  static artifactLevel(): number {
    return (2 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.SPIRIT_FORM))) | 0;
  }
  static applyActiveArtifactEffect(armor: ClassArmor, effect: Artifact): void {
    if (effect instanceof AlchemistsToolkit) {
      Talent.onArtifactUsed(Dungeon.hero);
      AlchemyScene.assignToolkit(effect);
      Game.switchScene$Class($J.cls(AlchemyScene));
    } else if (effect instanceof DriedRose) {
      let spawnPoints = new ArrayList();
      for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
        let p = (Dungeon.hero.pos + PathFinder.NEIGHBOURS8[i]) | 0;
        if (Actor.findChar(p) == null && !Dungeon.level.solid[p]) {
          spawnPoints.add(p);
        }
      }
      if (!spawnPoints.isEmpty()) {
        let w = Wraith.spawnAt$int$Class(Random.element$Collection(spawnPoints), $J.cls(Wraith));
        w.HP = w.HT = (20 + Math.imul(8, SpiritForm.artifactLevel())) | 0;
        Buff.affect$Char$Class(w, $J.cls(Corruption));
      }
      Talent.onArtifactUsed(Dungeon.hero);
      Dungeon.hero.spendAndNext(1);
    } else if (effect instanceof EtherealChains) {
      GameScene.selectCell((effect).caster);
      if (Dungeon.quickslot.contains(armor)) {
        QuickSlotButton.useTargeting(Dungeon.quickslot.getSlot(armor));
      }
    } else if (effect instanceof HornOfPlenty) {
      (effect).doEatEffect(Dungeon.hero, 1);
    } else if (effect instanceof MasterThievesArmband) {
      GameScene.selectCell((effect).targeter);
      if (Dungeon.quickslot.contains(armor)) {
        QuickSlotButton.useTargeting(Dungeon.quickslot.getSlot(armor));
      }
    } else if (effect instanceof SandalsOfNature) {
      (effect).curSeedEffect = Random.oneOf([$J.cls(Blindweed$Seed), $J.cls(Fadeleaf$Seed), $J.cls(Firebloom$Seed), $J.cls(Icecap$Seed), $J.cls(Sorrowmoss$Seed), $J.cls(Stormvine$Seed)]);
      GameScene.selectCell((effect).cellSelector);
      if (Dungeon.quickslot.contains(armor)) {
        QuickSlotButton.useTargeting(Dungeon.quickslot.getSlot(armor));
      }
    } else if (effect instanceof TalismanOfForesight) {
      GameScene.selectCell((effect).scry);
    } else if (effect instanceof TimekeepersHourglass) {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(Swiftthistle$TimeBubble)).reset$int(SpiritForm.artifactLevel());
      Dungeon.hero.spendAndNext(1);
    } else if (effect instanceof UnstableSpellbook) {
      (effect).doReadEffect(Dungeon.hero);
    } else if (effect instanceof SkeletonKey) {
      GameScene.selectCell((effect).targeter);
    }
  }
  static $clinit() {
    SpiritForm.INSTANCE = new SpiritForm()._SpiritForm();
  }
}

export class SpiritForm$SpiritFormBuff extends FlavourBuff {
  static readonly DURATION: number = 20;
  effect_: Bundlable = null;
  static readonly EFFECT: string = 'effect';
  _SpiritForm$SpiritFormBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.TRINITY_FORM;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 1, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(SpiritForm$SpiritFormBuff.DURATION - this.visualcooldown())) / SpiritForm$SpiritFormBuff.DURATION));
  }
  setEffect(effect: Bundlable): void {
    this.effect_ = effect;
    if (effect instanceof RingOfMight) {
      (effect).level$int(SpiritForm.ringLevel());
      Dungeon.hero.updateHT(false);
    }
  }
  detach(): void {
    super.detach();
    if (this.effect_ instanceof RingOfMight) {
      Dungeon.hero.updateHT(false);
    }
  }
  ring(): Ring {
    if (this.effect_ instanceof Ring) {
      (this.effect_).level$int(SpiritForm.ringLevel());
      return this.effect_;
    }
    return null;
  }
  artifact(): Artifact {
    if (this.effect_ instanceof Artifact) {
      if ((this.effect_).visiblyUpgraded() < SpiritForm.artifactLevel()) {
        (this.effect_).transferUpgrade((SpiritForm.artifactLevel() - (this.effect_).visiblyUpgraded()) | 0);
      }
      return this.effect_;
    }
    return null;
  }
  desc(): string {
    if (this.ring() != null) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', [Messages.titleCase(this.ring().name()), this.dispTurns$()]);
    } else if (this.artifact() != null) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', [Messages.titleCase(this.artifact().name()), this.dispTurns$()]);
    }
    return super.desc();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(SpiritForm$SpiritFormBuff.EFFECT, this.effect_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.effect_ = bundle.get$String(SpiritForm$SpiritFormBuff.EFFECT);
  }
}

$J.define(SpiritForm, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_SpiritForm' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(SpiritForm$SpiritFormBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm$SpiritFormBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_SpiritForm$SpiritFormBuff' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Trinity$WndItemtypeSelect = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemtypeSelect');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  AlchemistsToolkit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.AlchemistsToolkit');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  DriedRose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose');
  EtherealChains = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains');
  HornOfPlenty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty');
  MasterThievesArmband = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband');
  SandalsOfNature = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature');
  SkeletonKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey');
  TalismanOfForesight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight');
  TimekeepersHourglass = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass');
  UnstableSpellbook = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  RingOfMight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfMight');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Blindweed$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed$Seed');
  Fadeleaf$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf$Seed');
  Firebloom$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed');
  Icecap$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap$Seed');
  Sorrowmoss$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss$Seed');
  Stormvine$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine$Seed');
  Swiftthistle$TimeBubble = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  Game = $J.load('com.watabou.noosa.Game');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
