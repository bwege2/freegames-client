// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/MindForm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { ClericSpell } from './ClericSpell.ts';
import { CellSelector$Listener } from '../../../scenes/CellSelector.ts';

let Dungeon, Actor, Talent, Trinity, Trinity$WndItemtypeSelect, Item, WondrousResin, CursedWand, Wand, MissileWeapon, Ballistica, Messages, GameScene, HeroIcon, QuickSlotButton, GLog, Random;

export class MindForm extends ClericSpell {
  static INSTANCE: MindForm = null;
  _MindForm(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.MIND_FORM;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [MindForm.itemLevel()]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  chargeUse(hero: Hero): number {
    return 3;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.MIND_FORM);
  }
  static effectLevel(): number {
    return (2 + Dungeon.hero.pointsInTalent(Talent.MIND_FORM)) | 0;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    GameScene.show(new Trinity$WndItemtypeSelect()._Trinity$WndItemtypeSelect(tome, this));
  }
  static itemLevel(): number {
    return (2 + Dungeon.hero.pointsInTalent(Talent.MIND_FORM)) | 0;
  }
  static $clinit() {
    MindForm.INSTANCE = new MindForm()._MindForm();
  }
}

export class MindForm$targetSelector extends CellSelector$Listener {
  effect_: Bundlable = null;
  _MindForm$targetSelector(): this {
    this._CellSelector$Listener();
    return this;
  }
  setEffect(effect: Bundlable): void {
    this.effect_ = effect;
  }
  wand(): Wand {
    if (this.effect_ instanceof Wand) {
      (this.effect_).level$int(MindForm.effectLevel());
      (this.effect_).curCharges = (this.effect_).maxCharges;
      (this.effect_).identify$boolean(false);
      return this.effect_;
    }
    return null;
  }
  thrown(): MissileWeapon {
    if (this.effect_ instanceof MissileWeapon) {
      (this.effect_).level$int(MindForm.effectLevel());
      (this.effect_).repair(100);
      (this.effect_).identify$boolean(false);
      (this.effect_).spawnedForEffect = true;
      return this.effect_;
    }
    return null;
  }
  onSelect(target: number): void {
    if (target == null) {
      return;
    }
    if (this.wand() != null) {
      let wand = this.wand();
      if (wand.tryToZap(Dungeon.hero, target)) {
        let shot = new Ballistica()._Ballistica(Dungeon.hero.pos, target, wand.collisionProperties(target));
        let cell = shot.collisionPos;
        if (target === Dungeon.hero.pos || cell === Dungeon.hero.pos) {
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'self_target', []), []);
          return;
        }
        Dungeon.hero.sprite_.zap$int(cell);
        if (Actor.findChar(target) != null) {
          QuickSlotButton.target(Actor.findChar(target));
        } else {
          QuickSlotButton.target(Actor.findChar(cell));
        }
        wand.fx(shot, new (MindForm$targetSelector$1())().$o(this).$c(wand, shot, cell));
      }
    } else if (this.thrown() != null) {
      let thrown = this.thrown();
      thrown.cast(Dungeon.hero, target);
      (Dungeon.hero.belongings.armor()).charge_ = Math.fround((Dungeon.hero.belongings.armor()).charge_ - Trinity.trinityChargeUsePerEffect(thrown.getClass()));
    }
  }
  prompt(): string {
    if (this.wand() != null) {
      return Messages.get$Class$String$ObjectArr($J.cls(Wand), 'prompt', []);
    } else {
      return Messages.get$Class$String$ObjectArr($J.cls(Item), 'prompt', []);
    }
  }
}

let $MindForm$targetSelector$1$1: any = null;
/** An anonymous class (MindForm.java:147). */
function MindForm$targetSelector$1$1(): any {
  return $MindForm$targetSelector$1$1 ??= $J.local(class extends JObject {
    call(): void {
      WondrousResin.forcePositive = false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm$targetSelector$1$1', ['com.watabou.utils.Callback']);
}

let $MindForm$targetSelector$1: any = null;
/** An anonymous class (MindForm.java:140). */
function MindForm$targetSelector$1(): any {
  return $MindForm$targetSelector$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_wand.onZap(this.$cv_shot);
      if (Random.Float$() < WondrousResin.extraCurseEffectChance$()) {
        WondrousResin.forcePositive = true;
        CursedWand.cursedZap(this.$cv_wand, Dungeon.hero, new Ballistica()._Ballistica(Dungeon.hero.pos, this.$cv_cell, Ballistica.MAGIC_BOLT), new (MindForm$targetSelector$1$1())().$o(this));
      }
      (Dungeon.hero.belongings.armor()).charge_ = Math.fround((Dungeon.hero.belongings.armor()).charge_ - Trinity.trinityChargeUsePerEffect(this.$cv_wand.getClass()));
      this.$cv_wand.wandUsed();
    }
    $c($wand, $shot, $cell): this {
      this.$cv_wand = $wand; this.$cv_shot = $shot; this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm$targetSelector$1', ['com.watabou.utils.Callback']);
}

$J.define(MindForm, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_MindForm' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(MindForm$targetSelector, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm$targetSelector', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener', ctors: { '': '_MindForm$targetSelector' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Trinity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity');
  Trinity$WndItemtypeSelect = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemtypeSelect');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  WondrousResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
