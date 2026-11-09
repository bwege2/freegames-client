// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/BrokenSeal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays } from '../../../../../jre/index.ts';
import { Item } from './Item.ts';
import { ShieldBuff } from '../actors/buffs/ShieldBuff.ts';

let Assets$Sounds, Dungeon, Actor, Buff$buffType, Combo, HoldFast, Regeneration, Belongings$Backpack, HeroClass, Talent, Armor, Armor$Glyph, Messages, GameScene, ItemSprite, ItemSpriteSheet, BuffIndicator, GLog, WndBag$ItemSelector, WndOptions, WndUseItem, Sample, GameMath;

export class BrokenSeal extends Item {
  static readonly AC_AFFIX: string = 'AFFIX';
  static readonly AC_INFO: string = 'INFO_WINDOW';
  glyph_: Armor$Glyph = null;
  static armorSelector: WndBag$ItemSelector = null;
  static readonly GLYPH: string = 'glyph';
  _BrokenSeal(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.SEAL;
    this.cursedKnown = this.levelKnown = true;
    this.unique = true;
    this.bones = false;
    this.defaultAction_ = BrokenSeal.AC_INFO;
    return this;
  }
  canTransferGlyph(): boolean {
    if (this.glyph_ == null) {
      return false;
    }
    if (Dungeon.hero.pointsInTalent(Talent.RUNIC_TRANSFERENCE) === 2) {
      return true;
    } else if (Dungeon.hero.pointsInTalent(Talent.RUNIC_TRANSFERENCE) === 1 && (Arrays.asList(...Armor$Glyph.common).contains(this.glyph_.getClass()) || Arrays.asList(...Armor$Glyph.uncommon).contains(this.glyph_.getClass()))) {
      return true;
    } else {
      return false;
    }
  }
  getGlyph(): Armor$Glyph {
    return this.glyph_;
  }
  setGlyph(glyph: Armor$Glyph): void {
    this.glyph_ = glyph;
  }
  maxShield(armTier: number, armLvl: number): number {
    return (3 + Math.imul(2, armTier) + Dungeon.hero.pointsInTalent(Talent.IRON_WILL)) | 0;
  }
  glowing(): ItemSprite$Glowing {
    return this.glyph_ != null ? this.glyph_.glowing() : null;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(BrokenSeal.AC_AFFIX);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, BrokenSeal.AC_AFFIX)) {
      Item.curItem = this;
      GameScene.selectItem(BrokenSeal.armorSelector);
    } else if ($J.equals(action, BrokenSeal.AC_INFO)) {
      GameScene.show(new WndUseItem()._WndUseItem(null, this));
    }
  }
  affixToArmor(armor: Armor, outgoing: Item): void {
    if (armor != null) {
      if (!armor.cursedKnown) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(BrokenSeal), 'unknown_armor', []), []);
      } else if (armor.cursed && (this.getGlyph() == null || !this.getGlyph().curse())) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(BrokenSeal), 'cursed_armor', []), []);
      } else if (armor.glyph_ != null && this.getGlyph() != null && (this.canTransferGlyph() || outgoing instanceof BrokenSeal) && armor.glyph_.getClass() !== this.getGlyph().getClass()) {
        GameScene.show(new (BrokenSeal$1())().$o(this).$c(outgoing, armor)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SEAL), Messages.get$Class$String$ObjectArr($J.cls(BrokenSeal), 'choose_title', []), Messages.get$Class$String$ObjectArr($J.cls(BrokenSeal), 'choose_desc', [armor.glyph_.name$(), this.getGlyph().name$()]), [armor.glyph_.name$(), this.getGlyph().name$()]));
      } else {
        if (outgoing === this) {
          this.detach(Dungeon.hero.belongings.backpack);
        } else if (outgoing instanceof Armor) {
          (outgoing).detachSeal();
        }
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(BrokenSeal), 'affix', []), []);
        Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
        Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
        armor.affixSeal(this);
        Dungeon.hero.next();
      }
    }
  }
  name(): string {
    return this.glyph_ != null ? this.glyph_.name$String(super.name()) : super.name();
  }
  info(): string {
    let info = super.info();
    if (this.glyph_ != null) {
      info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'inscribed', [this.glyph_.name$()]);
      info += ' ' + this.glyph_.desc();
    }
    return info;
  }
  isUpgradable(): boolean {
    return this.level$() === 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(BrokenSeal.GLYPH, this.glyph_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.glyph_ = bundle.get$String(BrokenSeal.GLYPH);
  }
  static $clinit() {
    BrokenSeal.armorSelector = new (BrokenSeal$2())()._WndBag$ItemSelector();
  }
}

export class BrokenSeal$WarriorShield extends ShieldBuff {
  armor_: Armor = null;
  cooldown_: number = 0;
  turnsSinceEnemies: number = 0;
  initialShield: number = 0;
  static COOLDOWN_START: number = 0;
  static readonly COOLDOWN: string = 'cooldown';
  static readonly TURNS_SINCE_ENEMIES: string = 'turns_since_enemies';
  static readonly INITIAL_SHIELD: string = 'initial_shield';
  _BrokenSeal$WarriorShield(): this {
    this._ShieldBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.detachesAtZero = false;
    this.shieldUsePriority = 2;
    this.cooldown_ = 0;
    this.turnsSinceEnemies = 0;
    this.initialShield = 0;
    return this;
  }
  icon(): number {
    if (this.coolingDown() || this.shielding() > 0 || this.cooldown_ < 0) {
      return BuffIndicator.SEAL_SHIELD;
    } else {
      return BuffIndicator.NONE;
    }
  }
  tintIcon(icon: Image): void {
    icon.resetColor();
    if (this.coolingDown() && this.shielding() === 0) {
      icon.brightness(Math.fround(0.3));
    } else if (this.cooldown_ < 0) {
      icon.invert();
    }
  }
  iconFadePercent(): number {
    if (this.shielding() > 0) {
      return GameMath.gate(0, Math.fround(1 - Math.fround(this.shielding() / Math.fround(this.initialShield))), 1);
    } else if (this.coolingDown()) {
      return GameMath.gate(0, Math.fround(this.cooldown_ / Math.fround(BrokenSeal$WarriorShield.COOLDOWN_START)), 1);
    } else if (this.cooldown_ < 0) {
      return GameMath.gate(0, Math.fround(((BrokenSeal$WarriorShield.COOLDOWN_START + this.cooldown_) | 0) / Math.fround(BrokenSeal$WarriorShield.COOLDOWN_START)), 1);
    } else {
      return 0;
    }
  }
  iconTextDisplay(): string {
    if (this.shielding() > 0) {
      return String(this.shielding());
    } else if (this.coolingDown() || this.cooldown_ < 0) {
      return String(this.cooldown_);
    } else {
      return '';
    }
  }
  desc(): string {
    if (this.shielding() > 0) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_active', [this.shielding(), this.cooldown_]);
    } else if (this.cooldown_ < 0) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_negative_cooldown', [this.cooldown_]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'desc_cooldown', [this.cooldown_]);
    }
  }
  act(): boolean {
    if (this.cooldown_ > 0 && Regeneration.regenOn()) {
      this.cooldown_--;
    }
    if (this.shielding() > 0) {
      if (Dungeon.hero.visibleEnemies() === 0 && Dungeon.hero.buff($J.cls(Combo)) == null) {
        this.turnsSinceEnemies = Math.fround(this.turnsSinceEnemies + HoldFast.buffDecayFactor(this.target));
        if (this.turnsSinceEnemies >= Math.fround(5)) {
          if (this.cooldown_ > 0) {
            let percentLeft = Math.fround(this.shielding() / Math.fround(this.initialShield));
            this.cooldown_ = Math.max(0, $J.d2i((Math.fround(this.cooldown_ - Math.fround(BrokenSeal$WarriorShield.COOLDOWN_START * (Math.fround(percentLeft / 2)))))));
          }
          this.decShield$int(this.shielding());
        }
      } else {
        this.turnsSinceEnemies = 0;
      }
    }
    if (this.shielding() <= 0 && this.maxShield() <= 0 && this.cooldown_ === 0) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  activate(): void {
    this.incShield$int(this.maxShield());
    this.cooldown_ = Math.max(0, (this.cooldown_ + BrokenSeal$WarriorShield.COOLDOWN_START) | 0);
    this.turnsSinceEnemies = 0;
    this.initialShield = this.maxShield();
  }
  coolingDown(): boolean {
    return this.cooldown_ > 0;
  }
  reduceCooldown(percentage: number): void {
    this.cooldown_ = (this.cooldown_ - $J.roundf(Math.fround(BrokenSeal$WarriorShield.COOLDOWN_START * percentage))) | 0;
    this.cooldown_ = Math.max(this.cooldown_, -BrokenSeal$WarriorShield.COOLDOWN_START);
  }
  setArmor(arm: Armor): void {
    this.armor_ = arm;
  }
  maxShield(): number {
    if ((this.target).heroClass !== HeroClass.WARRIOR && (this.target).hasTalent(Talent.IRON_WILL)) {
      return (this.target).pointsInTalent(Talent.IRON_WILL);
    }
    if (this.armor_ != null && this.armor_.isEquipped(this.target) && this.armor_.checkSeal() != null) {
      return this.armor_.checkSeal().maxShield(this.armor_.tier_, this.armor_.level$());
    } else {
      return 0;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(BrokenSeal$WarriorShield.COOLDOWN, this.cooldown_);
    bundle.put$String$float(BrokenSeal$WarriorShield.TURNS_SINCE_ENEMIES, this.turnsSinceEnemies);
    bundle.put$String$int(BrokenSeal$WarriorShield.INITIAL_SHIELD, this.initialShield);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(BrokenSeal$WarriorShield.COOLDOWN)) {
      this.cooldown_ = bundle.getInt(BrokenSeal$WarriorShield.COOLDOWN);
      this.turnsSinceEnemies = bundle.getFloat(BrokenSeal$WarriorShield.TURNS_SINCE_ENEMIES);
      this.initialShield = bundle.getInt(BrokenSeal$WarriorShield.INITIAL_SHIELD);
    } else if (this.shielding() > 0) {
      this.turnsSinceEnemies = -100;
      this.initialShield = this.shielding();
    }
  }
  static $clinit() {
    BrokenSeal$WarriorShield.COOLDOWN_START = 150;
  }
}

let $BrokenSeal$1: any = null;
/** An anonymous class (BrokenSeal.java:142). */
function BrokenSeal$1(): any {
  return $BrokenSeal$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === -1) {
        return;
      }
      if (this.$cv_outgoing === this.$outer) {
        this.$outer.detach(Dungeon.hero.belongings.backpack);
      } else if (this.$cv_outgoing instanceof Armor) {
        (this.$cv_outgoing).detachSeal();
      }
      if (index === 0) {
        this.$outer.setGlyph(null);
      }
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(BrokenSeal), 'affix', []), []);
      Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
      Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
      this.$cv_armor.affixSeal(this.$outer);
    }
    hide(): void {
      super.hide();
      Dungeon.hero.next();
    }
    $c($outgoing, $armor): this {
      this.$cv_outgoing = $outgoing; this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$1', []);
}

let $BrokenSeal$2: any = null;
/** An anonymous class (BrokenSeal.java:206). */
function BrokenSeal$2(): any {
  return $BrokenSeal$2 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(BrokenSeal), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(Belongings$Backpack);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Armor;
    }
    onSelect(item: Item): void {
      if (item instanceof Armor) {
        let seal = Item.curItem;
        seal.affixToArmor(item, seal);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$2', []);
}

$J.define(BrokenSeal, 'com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_BrokenSeal' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['armorSelector'] });
$J.define(BrokenSeal$WarriorShield, 'com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_BrokenSeal$WarriorShield' }, clinit: true, lazy: ['COOLDOWN_START'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Combo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo');
  HoldFast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
