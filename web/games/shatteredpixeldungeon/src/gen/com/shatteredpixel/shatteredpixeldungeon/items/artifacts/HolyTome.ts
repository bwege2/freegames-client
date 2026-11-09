// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/HolyTome.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, MagicImmune, Regeneration, Hero, Talent, ClericSpell, GuidingLight, Item, RingOfEnergy, Catalog, Ballistica, Messages, GameScene, ItemSpriteSheet, ActionIndicator, HeroIcon, QuickSlotButton, GLog, WndClericSpells;

export class HolyTome extends Artifact {
  static readonly AC_CAST: string = 'CAST';
  targetingSpell: ClericSpell = null;
  quickSpell: ClericSpell = null;
  static readonly QUICK_CLS: string = 'quick_cls';
  _HolyTome(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_TOME;
    this.exp = 0;
    this.levelCap = 10;
    this.charge_ = Math.min((this.level$() + 3) | 0, 10);
    this.partialCharge = 0;
    this.chargeCap_ = Math.min((this.level$() + 3) | 0, 10);
    this.defaultAction_ = HolyTome.AC_CAST;
    this.unique = true;
    this.bones = false;
    this.targetingSpell = null;
    this.quickSpell = null;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if ((this.isEquipped(hero) || hero.hasTalent(Talent.LIGHT_READING)) && !this.cursed && hero.buff($J.cls(MagicImmune)) == null) {
      actions.add(HolyTome.AC_CAST);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, HolyTome.AC_CAST)) {
      if (!this.isEquipped(hero) && !hero.hasTalent(Talent.LIGHT_READING)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.cursed) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else {
        GameScene.show(new WndClericSpells()._WndClericSpells(this, hero, false));
      }
    }
  }
  targetingPos(user: Hero, dst: number): number {
    if (this.targetingSpell == null || this.targetingSpell.targetingFlags() === -1) {
      return super.targetingPos(user, dst);
    } else {
      return new Ballistica()._Ballistica(user.pos, dst, this.targetingSpell.targetingFlags()).collisionPos;
    }
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (collect && hero.hasTalent(Talent.LIGHT_READING)) {
        this.activate(hero);
      }
      return true;
    } else {
      return false;
    }
  }
  collect$Bag(container: Bag): boolean {
    if (super.collect$Bag(container)) {
      if (container.owner instanceof Hero && this.passiveBuff_ == null && (container.owner).hasTalent(Talent.LIGHT_READING)) {
        this.activate(container.owner);
      }
      return true;
    } else {
      return false;
    }
  }
  onDetach(): void {
    if (this.passiveBuff_ != null) {
      this.passiveBuff_.detach();
      this.passiveBuff_ = null;
    }
  }
  canCast(hero: Hero, spell: ClericSpell): boolean {
    return (this.isEquipped(hero) || (Dungeon.hero.hasTalent(Talent.LIGHT_READING) && hero.belongings.contains(this))) && hero.buff($J.cls(MagicImmune)) == null && Math.fround(this.charge_) >= spell.chargeUse(hero) && spell.canCast(hero);
  }
  spendCharge(chargesSpent: number): void {
    this.partialCharge = Math.fround(this.partialCharge - chargesSpent);
    while (this.partialCharge < Math.fround(0)) {
      this.charge_--;
      this.partialCharge++;
    }
    let lvlDiffFromTarget = (Dungeon.hero.lvl - (1 + Math.imul(this.level$(), 2))) | 0;
    if (this.level$() >= 7) {
      lvlDiffFromTarget = (lvlDiffFromTarget - (this.level$() - 6)) | 0;
    }
    if (lvlDiffFromTarget >= 0) {
      this.exp = $J.l2i(BigInt.asIntN(64, BigInt(this.exp) + $J.lround(Math.fround(chargesSpent * 10) * $J.pow(Math.fround(1.1), lvlDiffFromTarget))));
    } else {
      this.exp = $J.l2i(BigInt.asIntN(64, BigInt(this.exp) + $J.lround(Math.fround(chargesSpent * 10) * $J.pow(0.75, -lvlDiffFromTarget))));
    }
    if (this.exp >= Math.imul(((this.level$() + 1) | 0), 50) && this.level$() < this.levelCap) {
      this.upgrade$();
      Catalog.countUse($J.cls(HolyTome));
      this.exp = (this.exp - Math.imul(this.level$(), 50)) | 0;
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
    }
    Item.updateQuickslot();
  }
  directCharge(amount: number): void {
    if (this.charge_ < this.chargeCap_) {
      this.partialCharge = Math.fround(this.partialCharge + amount);
      while (this.partialCharge >= 1) {
        this.charge_++;
        this.partialCharge--;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.partialCharge = 0;
        this.charge_ = this.chargeCap_;
      }
      Item.updateQuickslot();
    }
    Item.updateQuickslot();
  }
  upgrade$(): Item {
    this.chargeCap_ = Math.min((this.chargeCap_ + 1) | 0, 10);
    return super.upgrade$();
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new HolyTome$TomeRecharge().$o(this)._HolyTome$TomeRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.charge_ < this.chargeCap_) {
      if (!this.isEquipped(target)) {
        amount = Math.fround(amount * Math.fround(Math.fround(0.75 * target.pointsInTalent(Talent.LIGHT_READING)) / 3));
      }
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(0.25 * amount));
      while (this.partialCharge >= 1) {
        this.charge_++;
        this.partialCharge--;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.partialCharge = 0;
        this.charge_ = this.chargeCap_;
      }
      Item.updateQuickslot();
    }
  }
  setQuickSpell(spell: ClericSpell): void {
    if (this.quickSpell === spell) {
      this.quickSpell = null;
      if (this.passiveBuff_ != null) {
        ActionIndicator.clearAction$Action(this.passiveBuff_);
      }
    } else {
      this.quickSpell = spell;
      if (this.passiveBuff_ != null) {
        ActionIndicator.setAction(this.passiveBuff_);
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.quickSpell != null) {
      bundle.put$String$Class(HolyTome.QUICK_CLS, this.quickSpell.getClass());
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(HolyTome.QUICK_CLS)) {
      let quickCls = bundle.getClass$String(HolyTome.QUICK_CLS);
      for (const $it0 = ClericSpell.getAllSpells().iterator(); $it0.hasNext(); ) {
        let spell = $it0.next();
        if (spell.getClass() === quickCls) {
          this.quickSpell = spell;
        }
      }
    }
  }
}

export class HolyTome$TomeRecharge extends Artifact$ArtifactBuff {
  _HolyTome$TomeRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      if (this.$outer.quickSpell != null) {
        ActionIndicator.setAction(this);
      }
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    super.detach();
    ActionIndicator.clearAction$Action(this);
  }
  act(): boolean {
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null) {
      if (Regeneration.regenOn()) {
        let missing = Math.fround(((this.$outer.chargeCap_ - this.$outer.charge_) | 0));
        if (this.$outer.level$() > 7) {
          missing = Math.fround(missing + Math.fround(Math.imul(5, ((this.$outer.level$() - 7) | 0)) / 3));
        }
        let turnsToCharge = (Math.fround(45 - missing));
        turnsToCharge = Math.fround(turnsToCharge / RingOfEnergy.artifactChargeMultiplier(this.target));
        let chargeToGain = (Math.fround(1 / turnsToCharge));
        if (!this.$outer.isEquipped(Dungeon.hero)) {
          chargeToGain = Math.fround(chargeToGain * Math.fround(Math.fround(0.75 * Dungeon.hero.pointsInTalent(Talent.LIGHT_READING)) / 3));
        }
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeToGain);
      }
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.charge_++;
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge - 1);
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
        }
      }
    } else {
      this.$outer.partialCharge = 0;
    }
    Item.updateQuickslot();
    this.spend(Actor.TICK);
    return true;
  }
  actionName(): string {
    return this.$outer.quickSpell.name();
  }
  actionIcon(): number {
    return (this.$outer.quickSpell.icon() + HeroIcon.SPELL_ACTION_OFFSET) | 0;
  }
  indicatorColor(): number {
    if (this.$outer.quickSpell === GuidingLight.INSTANCE && this.$outer.quickSpell.chargeUse(Dungeon.hero) === Math.fround(0)) {
      return 25599;
    } else {
      return 8535;
    }
  }
  doAction(): void {
    if (this.$outer.cursed) {
      GLog.w(Messages.get$Object$String$ObjectArr(this.$outer, 'cursed', []), []);
      return;
    }
    if (!this.$outer.canCast(Dungeon.hero, this.$outer.quickSpell)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this.$outer, 'no_spell', []), []);
      return;
    }
    if (QuickSlotButton.targetingSlot !== -1 && Dungeon.quickslot.getItem(QuickSlotButton.targetingSlot) === this.$outer) {
      this.$outer.targetingSpell = this.$outer.quickSpell;
      let cell = QuickSlotButton.autoAim$Char$Item(QuickSlotButton.lastTarget, this.$outer);
      if (cell !== -1) {
        GameScene.handleCell(cell);
      } else {
        GameScene.handleCell(QuickSlotButton.lastTarget.pos);
      }
    } else {
      this.$outer.quickSpell.onCast(this.$outer, Dungeon.hero);
      if (this.$outer.quickSpell.targetingFlags() !== -1 && Dungeon.quickslot.contains(this.$outer)) {
        this.$outer.targetingSpell = this.$outer.quickSpell;
        QuickSlotButton.useTargeting(Dungeon.quickslot.getSlot(this.$outer));
      }
    }
  }
}

$J.define(HolyTome, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_HolyTome' }, meths: { 'upgrade()': 'upgrade$', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(HolyTome$TomeRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome$TomeRecharge', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_HolyTome$TomeRecharge' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndClericSpells = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndClericSpells');
});
