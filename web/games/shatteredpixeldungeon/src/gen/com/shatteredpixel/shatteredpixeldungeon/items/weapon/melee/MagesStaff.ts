// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/MagesStaff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { MeleeWeapon } from './MeleeWeapon.ts';
import { PixelParticle } from '../../../../../watabou/noosa/particles/PixelParticle.ts';

let Assets$Sounds, Badges, Dungeon, ArtifactRecharge, Buff, Hero, HeroSubClass, Talent, Talent$EmpoweredStrikeTracker, Talent$WandPreservationCounter, Mob, ElmoParticle, EquipableItem, Item, MagicalHolster, ScrollOfRecharging, Wand, WandOfCorrosion, WandOfCorruption, WandOfDisintegration, WandOfLivingEarth, WandOfRegrowth, Weapon$Enchantment, Messages, GameScene, ItemSprite, ItemSpriteSheet, GLog, WndBag$ItemSelector, WndOptions, WndUseItem, Sample, Emitter, Emitter$Factory, Random;

export class MagesStaff extends MeleeWeapon {
  wand_: Wand = null;
  static readonly AC_IMBUE: string = 'IMBUE';
  static readonly AC_ZAP: string = 'ZAP';
  static readonly STAFF_SCALE_FACTOR: number = 0.75;
  static readonly WAND: string = 'wand';
  itemSelector: WndBag$ItemSelector = null;
  StaffParticleFactory: Emitter$Factory = null;
  $init_MagesStaff() {
    this.image_ = ItemSpriteSheet.MAGES_STAFF;
    this.hitSound_ = Assets$Sounds.HIT;
    this.hitSoundPitch = Math.fround(1.1);
    this.tier_ = 1;
    this.defaultAction_ = MagesStaff.AC_ZAP;
    this.usesTargeting_ = true;
    this.unique = true;
    this.bones = false;
    this.itemSelector = new (MagesStaff$1())().$o(this)._WndBag$ItemSelector();
    this.StaffParticleFactory = new (MagesStaff$2())().$o(this)._Emitter$Factory();
  }
  _MagesStaff$(): this {
    this._MeleeWeapon();
    this.$init_MagesStaff();
    this.wand_ = null;
    return this;
  }
  _MagesStaff$Wand(wand: Wand): this {
    this._MagesStaff$();
    wand.identify$();
    wand.cursed = false;
    this.wand_ = wand;
    this.updateWand(false);
    wand.curCharges = wand.maxCharges;
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(3 * ((this.tier_ + 1) | 0))) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(MagesStaff.AC_IMBUE);
    if (this.wand_ != null && this.wand_.curCharges > 0) {
      actions.add(MagesStaff.AC_ZAP);
    }
    return actions;
  }
  defaultAction(): string {
    return MagesStaff.AC_ZAP;
  }
  activate(ch: Char): void {
    super.activate(ch);
    this.applyWandChargeBuff(ch);
  }
  targetingPos(user: Hero, dst: number): number {
    if (this.wand_ != null) {
      return this.wand_.targetingPos(user, dst);
    } else {
      return super.targetingPos(user, dst);
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, MagesStaff.AC_IMBUE)) {
      Item.curUser = hero;
      GameScene.selectItem(this.itemSelector);
    } else if ($J.equals(action, MagesStaff.AC_ZAP)) {
      if (this.wand_ == null) {
        GameScene.show(new WndUseItem()._WndUseItem(null, this));
        return;
      }
      if (this.cursed || this.hasCurseEnchant()) {
        this.wand_.cursed = true;
      } else {
        this.wand_.cursed = false;
      }
      this.wand_.execute$Hero$String(hero, MagesStaff.AC_ZAP);
    }
  }
  buffedVisiblyUpgraded(): number {
    if (this.wand_ != null) {
      return Math.max(super.buffedVisiblyUpgraded(), this.wand_.buffedVisiblyUpgraded());
    } else {
      return super.buffedVisiblyUpgraded();
    }
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (attacker instanceof Hero && (attacker).hasTalent(Talent.MYSTICAL_CHARGE)) {
      let hero = attacker;
      ArtifactRecharge.chargeArtifacts(hero, Math.fround(hero.pointsInTalent(Talent.MYSTICAL_CHARGE) / 2));
    }
    let empoweredStrike = attacker.buff($J.cls(Talent$EmpoweredStrikeTracker));
    if (empoweredStrike != null) {
      damage = $J.roundf(Math.fround(damage * (Math.fround(1 + Math.fround(Dungeon.hero.pointsInTalent(Talent.EMPOWERED_STRIKE) / 6)))));
    }
    if (this.wand_ != null && attacker instanceof Hero && (attacker).subClass === HeroSubClass.BATTLEMAGE) {
      if (this.wand_.curCharges < this.wand_.maxCharges) {
        this.wand_.partialCharge = Math.fround(this.wand_.partialCharge + 0.5);
      }
      ScrollOfRecharging.charge(attacker);
      this.wand_.onHit(this, attacker, defender, damage);
    }
    if (empoweredStrike != null) {
      if (!empoweredStrike.delayedDetach) {
        empoweredStrike.detach();
      }
      if (!(defender instanceof Mob) || !(defender).surprisedBy$Char(attacker)) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_STRONG, 0.75, Math.fround(1.2));
      }
    }
    return super.proc(attacker, defender, damage);
  }
  reachFactor(owner: Char): number {
    let reach = super.reachFactor(owner);
    if (owner instanceof Hero && this.wand_ instanceof WandOfDisintegration && (owner).subClass === HeroSubClass.BATTLEMAGE) {
      reach = (reach + $J.roundf(Wand.procChanceMultiplier(owner))) | 0;
    }
    return reach;
  }
  collect$Bag(container: Bag): boolean {
    if (super.collect$Bag(container)) {
      if (container.owner != null) {
        this.applyWandChargeBuff(container.owner);
      }
      return true;
    } else {
      return false;
    }
  }
  onDetach(): void {
    if (this.wand_ != null) {
      this.wand_.stopCharging();
    }
  }
  imbueWand(wand: Wand, owner: Char): Item {
    let oldStaffcharges = this.wand_ != null ? this.wand_.curCharges : 0;
    if (owner === Dungeon.hero && this.wand_ != null && Dungeon.hero.hasTalent(Talent.WAND_PRESERVATION)) {
      let counter = Buff.affect$Char$Class(Dungeon.hero, $J.cls(Talent$WandPreservationCounter));
      if (counter.count() === Math.fround(0)) {
        counter.countUp(1);
        this.wand_.level$int(0);
        if (!this.wand_.collect$()) {
          Dungeon.level.drop(this.wand_, owner.pos);
        }
        GLog.newLine();
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'preserved', []), []);
      }
    }
    this.wand_ = null;
    wand.resinBonus = 0;
    wand.updateLevel();
    let targetLevel = Math.max(this.trueLevel(), wand.trueLevel());
    if (wand.trueLevel() >= this.trueLevel() && this.trueLevel() > 0) {
      targetLevel++;
    }
    this.level$int(targetLevel);
    this.wand_ = wand;
    wand.levelKnown = wand.curChargeKnown = true;
    this.updateWand(false);
    wand.curCharges = Math.min(wand.maxCharges, (wand.curCharges + oldStaffcharges) | 0);
    if (owner != null) {
      this.applyWandChargeBuff(owner);
    } else if (Dungeon.hero.belongings.contains(this)) {
      this.applyWandChargeBuff(Dungeon.hero);
    }
    if (wand.cursed && (!this.cursed || !this.hasCurseEnchant())) {
      EquipableItem.equipCursed(Dungeon.hero);
      this.cursed = this.cursedKnown = true;
      this.enchant$Enchantment(Weapon$Enchantment.randomCurse([]));
    }
    let slot = Dungeon.quickslot.getSlot(this);
    if (slot !== -1) {
      Dungeon.quickslot.clearSlot(slot);
      Item.updateQuickslot();
      Dungeon.quickslot.setSlot(slot, this);
      Item.updateQuickslot();
    }
    Badges.validateItemLevelAquired(this);
    return this;
  }
  gainCharge$float(amt: number): void {
    this.gainCharge$float$boolean(amt, false);
  }
  gainCharge$float$boolean(amt: number, overcharge: boolean): void {
    if (this.wand_ != null) {
      this.wand_.gainCharge$float$boolean(amt, overcharge);
    }
  }
  applyWandChargeBuff(owner: Char): void {
    if (this.wand_ != null) {
      this.wand_.charge$Char$float(owner, MagesStaff.STAFF_SCALE_FACTOR);
    }
  }
  wandClass(): JClass<Wand> {
    return this.wand_ != null ? this.wand_.getClass() : null;
  }
  upgrade$boolean(enchant: boolean): Item {
    super.upgrade$boolean(enchant);
    this.updateWand(true);
    return this;
  }
  degrade$(): Item {
    super.degrade$();
    this.updateWand(false);
    return this;
  }
  updateWand(levelled: boolean): void {
    if (this.wand_ != null) {
      let curCharges = this.wand_.curCharges;
      this.wand_.level$int(this.level$());
      this.wand_.maxCharges = Math.min((this.wand_.maxCharges + 1) | 0, 10);
      this.wand_.curCharges = Math.min((curCharges + (levelled ? 1 : 0)) | 0, this.wand_.maxCharges);
      Item.updateQuickslot();
    }
  }
  status(): string {
    if (this.wand_ == null) {
      return super.status();
    } else {
      return this.wand_.status();
    }
  }
  name(): string {
    if (this.wand_ == null) {
      return super.name();
    } else {
      let name = Messages.get$Object$String$ObjectArr(this.wand_, 'staff_name', []);
      return this.enchantment != null && (this.cursedKnown || !this.enchantment.curse()) ? this.enchantment.name$String(name) : name;
    }
  }
  info(): string {
    let info = super.info();
    if (this.wand_ != null) {
      info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'has_wand', [Messages.get$Object$String$ObjectArr(this.wand_, 'name', [])]);
      if ((!this.cursed && !this.hasCurseEnchant()) || !this.cursedKnown) {
        info += ' ' + this.wand_.statsDesc();
      } else {
        info += ' ' + Messages.get$Object$String$ObjectArr(this, 'cursed_wand', []);
      }
      if (Dungeon.hero.subClass === HeroSubClass.BATTLEMAGE) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this.wand_, 'bmage_desc', []);
      }
    }
    return info;
  }
  emitter(): Emitter {
    if (this.wand_ == null) {
      return null;
    }
    let emitter = new Emitter()._Emitter();
    emitter.pos$float$float(12.5, 3);
    emitter.fillTarget = false;
    emitter.pour(this.StaffParticleFactory, Math.fround(0.1));
    return emitter;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(MagesStaff.WAND, this.wand_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.wand_ = bundle.get$String(MagesStaff.WAND);
    if (this.wand_ != null) {
      this.wand_.maxCharges = Math.min((this.wand_.maxCharges + 1) | 0, 10);
    }
  }
  value(): number {
    return 0;
  }
  enchant$Enchantment(ench: Weapon$Enchantment): Weapon {
    if (this.curseInfusionBonus && (ench == null || !ench.curse())) {
      this.curseInfusionBonus = false;
      this.updateWand(false);
    }
    return super.enchant$Enchantment(ench);
  }
}

export class MagesStaff$StaffParticle extends PixelParticle {
  minSize: number = 0;
  maxSize: number = 0;
  sizeJitter: number = 0;
  _MagesStaff$StaffParticle(): this {
    this._PixelParticle();
    this.sizeJitter = 0;
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.speed_.set$float(0);
    this.x = x;
    this.y = y;
    if (this.$outer.wand_ != null) {
      this.$outer.wand_.staffFx(this);
    }
  }
  setSize(minSize: number, maxSize: number): void {
    this.minSize = minSize;
    this.maxSize = maxSize;
  }
  setLifespan(life: number): void {
    this.lifespan = this.left_ = life;
  }
  shuffleXY(amt: number): void {
    this.x = Math.fround(this.x + Random.Float$float$float(Math.fround(-amt), amt));
    this.y = Math.fround(this.y + Random.Float$float$float(Math.fround(-amt), amt));
  }
  radiateXY(amt: number): void {
    let hypot = Math.fround(Math.hypot(this.speed_.x, this.speed_.y));
    this.x = Math.fround(this.x + Math.fround(Math.fround(this.speed_.x / hypot) * amt));
    this.y = Math.fround(this.y + Math.fround(Math.fround(this.speed_.y / hypot) * amt));
  }
  update(): void {
    super.update();
    this.size$float(Math.fround(Math.fround(this.minSize + Math.fround((Math.fround(this.left_ / this.lifespan)) * (Math.fround(this.maxSize - this.minSize)))) + Random.Float$float(this.sizeJitter)));
  }
}

let $MagesStaff$1$1: any = null;
/** An anonymous class (MagesStaff.java:460). */
function MagesStaff$1$1(): any {
  return $MagesStaff$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.applyWand(this.$cv_item);
      }
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff$1$1', []);
}

let $MagesStaff$1: any = null;
/** An anonymous class (MagesStaff.java:405). */
function MagesStaff$1(): any {
  return $MagesStaff$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(MagicalHolster);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Wand;
    }
    onSelect(item: Item): void {
      if (item != null) {
        let newLevel: number;
        let itemLevel = item.trueLevel();
        if (itemLevel >= this.$outer.trueLevel()) {
          if (this.$outer.trueLevel() > 0) {
            newLevel = (itemLevel + 1) | 0;
          } else {
            newLevel = itemLevel;
          }
        } else {
          newLevel = this.$outer.trueLevel();
        }
        let bodyText = Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'imbue_desc', []);
        if (item.isIdentified()) {
          bodyText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'imbue_level', [newLevel]);
        } else {
          bodyText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'imbue_unknown', [this.$outer.trueLevel()]);
        }
        if (!item.cursedKnown || item.cursed) {
          bodyText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'imbue_cursed', []);
        }
        if (this.$outer.wand_ != null) {
          if (Dungeon.hero.hasTalent(Talent.WAND_PRESERVATION) && Dungeon.hero.buff($J.cls(Talent$WandPreservationCounter)) == null) {
            bodyText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'imbue_talent', []);
          } else {
            bodyText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'imbue_lost', []);
          }
        }
        GameScene.show(new (MagesStaff$1$1())().$o(this).$c(item)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(item), Messages.titleCase(item.name()), bodyText, [Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'no', [])]));
      }
    }
    applyWand(wand: Wand): void {
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      Item.curUser.sprite_.emitter().burst(ElmoParticle.FACTORY, 12);
      Item.evoke(Item.curUser);
      Dungeon.quickslot.clearItem(wand);
      wand.detach(Item.curUser.belongings.backpack);
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(MagesStaff), 'imbue', [wand.name()]), []);
      this.$outer.imbueWand(wand, Item.curUser);
      Item.updateQuickslot();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff$1', []);
}

let $MagesStaff$2: any = null;
/** An anonymous class (MagesStaff.java:488). */
function MagesStaff$2(): any {
  return $MagesStaff$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let c = emitter.getFirstAvailable($J.cls(MagesStaff$StaffParticle));
      if (c == null) {
        c = new MagesStaff$StaffParticle().$o(this.$outer)._MagesStaff$StaffParticle();
        emitter.add$Gizmo(c);
      }
      c.reset$float$float(x, y);
    }
    lightMode(): boolean {
      return !((this.$outer.wand_ instanceof WandOfDisintegration) || (this.$outer.wand_ instanceof WandOfCorruption) || (this.$outer.wand_ instanceof WandOfCorrosion) || (this.$outer.wand_ instanceof WandOfRegrowth) || (this.$outer.wand_ instanceof WandOfLivingEarth));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff$2', []);
}

$J.define(MagesStaff, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand': '_MagesStaff$Wand', '': '_MagesStaff$' }, meths: { 'enchant(com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment)': 'enchant$Enchantment', 'degrade()': 'degrade$', 'upgrade(boolean)': 'upgrade$boolean', 'gainCharge(float,boolean)': 'gainCharge$float$boolean', 'gainCharge(float)': 'gainCharge$float', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String', 'max(int)': 'max$int' } });
$J.define(MagesStaff$StaffParticle, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff$StaffParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_MagesStaff$StaffParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$EmpoweredStrikeTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$EmpoweredStrikeTracker');
  Talent$WandPreservationCounter = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$WandPreservationCounter');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  WandOfCorrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorrosion');
  WandOfCorruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorruption');
  WandOfDisintegration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfDisintegration');
  WandOfLivingEarth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth');
  WandOfRegrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
