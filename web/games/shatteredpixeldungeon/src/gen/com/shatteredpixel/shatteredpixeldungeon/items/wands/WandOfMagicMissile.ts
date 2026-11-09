// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfMagicMissile.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DamageWand } from './DamageWand.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Buff$buffType, SpellSprite, Item, Wand, Wand$Charger, Messages, ItemSpriteSheet, BuffIndicator, Sample, Random;

export class WandOfMagicMissile extends DamageWand {
  _WandOfMagicMissile(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_MAGIC_MISSILE;
    return this;
  }
  min$int(lvl: number): number {
    return (2 + lvl) | 0;
  }
  max$int(lvl: number): number {
    return (8 + Math.imul(2, lvl)) | 0;
  }
  onZap(bolt: Ballistica): void {
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch != null) {
      this.wandProc(ch, this.chargesPerCast());
      ch.damage(this.damageRoll$(), this);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Random.Float$float$float(Math.fround(0.87), Math.fround(1.15)));
      ch.sprite_.burst(-1, ($J.idiv(this.buffedLvl(), 2) + 2) | 0);
      for (const $it0 = Item.curUser.buffs$Class($J.cls(Wand$Charger)).iterator(); $it0.hasNext(); ) {
        let wandCharger = $it0.next();
        if (wandCharger.wand().buffedLvl() < this.buffedLvl() || Item.curUser.buff($J.cls(WandOfMagicMissile$MagicCharge)) != null) {
          Buff.prolong(Item.curUser, $J.cls(WandOfMagicMissile$MagicCharge), WandOfMagicMissile$MagicCharge.DURATION).setup(this);
          break;
        }
      }
    } else {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    SpellSprite.show$Char$int(attacker, SpellSprite.CHARGE);
    for (const $it1 = attacker.buffs$Class($J.cls(Wand$Charger)).iterator(); $it1.hasNext(); ) {
      let c = $it1.next();
      if (c.wand() !== this) {
        c.gainCharge(Math.fround(0.5 * Wand.procChanceMultiplier(attacker)));
      }
    }
  }
  initialCharges(): number {
    return 3;
  }
}

export class WandOfMagicMissile$MagicCharge extends FlavourBuff {
  static DURATION: number = 0;
  level_: number = 0;
  wandJustApplied_: Wand = null;
  static readonly LEVEL: string = 'level';
  _WandOfMagicMissile$MagicCharge(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    this.level_ = 0;
    return this;
  }
  setup(wand: Wand): void {
    if (this.level_ < wand.buffedLvl()) {
      this.level_ = wand.buffedLvl();
      this.wandJustApplied_ = wand;
    }
  }
  detach(): void {
    super.detach();
    Item.updateQuickslot();
  }
  level(): number {
    return this.level_;
  }
  wandJustApplied(): Wand {
    let result = this.wandJustApplied_;
    this.wandJustApplied_ = null;
    return result;
  }
  icon(): number {
    return BuffIndicator.UPGRADE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.2), Math.fround(0.6), 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(WandOfMagicMissile$MagicCharge.DURATION - this.visualcooldown())) / WandOfMagicMissile$MagicCharge.DURATION));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.level(), this.dispTurns$()]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WandOfMagicMissile$MagicCharge.LEVEL, this.level_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.level_ = bundle.getInt(WandOfMagicMissile$MagicCharge.LEVEL);
  }
  static $clinit() {
    WandOfMagicMissile$MagicCharge.DURATION = 4;
  }
}

$J.define(WandOfMagicMissile, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfMagicMissile' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.define(WandOfMagicMissile$MagicCharge, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile$MagicCharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_WandOfMagicMissile$MagicCharge' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Wand$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$Charger');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
