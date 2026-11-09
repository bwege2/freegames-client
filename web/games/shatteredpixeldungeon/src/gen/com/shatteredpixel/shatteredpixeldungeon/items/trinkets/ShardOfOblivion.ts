// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ShardOfOblivion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trinket } from './Trinket.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Badges, Dungeon, Buff$buffType, Talent, Identification, Item, Armor, Ring, Wand, Weapon, Messages, GameScene, ItemSpriteSheet, BuffIndicator, GLog, WndBag$ItemSelector, Sample;

export class ShardOfOblivion extends Trinket {
  static readonly AC_IDENTIFY: string = 'IDENTIFY';
  static identifySelector: WndBag$ItemSelector = null;
  _ShardOfOblivion(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.OBLIVION_SHARD;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [(this.buffedLvl() + 1) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [1]);
    }
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(ShardOfOblivion.AC_IDENTIFY);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    if ($J.equals(action, ShardOfOblivion.AC_IDENTIFY)) {
      Item.curUser = hero;
      Item.curItem = this;
      GameScene.selectItem(ShardOfOblivion.identifySelector);
    } else {
      super.execute$Hero$String(hero, action);
    }
  }
  static passiveIDDisabled(): boolean {
    return Trinket.trinketLevel($J.cls(ShardOfOblivion)) >= 0;
  }
  static lootChanceMultiplier$(): number {
    return ShardOfOblivion.lootChanceMultiplier$int(Trinket.trinketLevel($J.cls(ShardOfOblivion)));
  }
  static lootChanceMultiplier$int(level: number): number {
    if (level < 0) {
      return 1;
    }
    let wornUnIDed = 0;
    if (Dungeon.hero.belongings.weapon() != null && !Dungeon.hero.belongings.weapon().isIdentified()) {
      wornUnIDed++;
    }
    if (Dungeon.hero.belongings.secondWep() != null && !Dungeon.hero.belongings.secondWep().isIdentified()) {
      wornUnIDed++;
    }
    if (Dungeon.hero.belongings.armor() != null && !Dungeon.hero.belongings.armor().isIdentified()) {
      wornUnIDed++;
    }
    if (Dungeon.hero.belongings.ring() != null && !Dungeon.hero.belongings.ring().isIdentified()) {
      wornUnIDed++;
    }
    if (Dungeon.hero.belongings.misc() != null && !Dungeon.hero.belongings.misc().isIdentified()) {
      wornUnIDed++;
    }
    if (Dungeon.hero.buff($J.cls(ShardOfOblivion$WandUseTracker)) != null) {
      wornUnIDed++;
    }
    if (Dungeon.hero.buff($J.cls(ShardOfOblivion$ThrownUseTracker)) != null) {
      wornUnIDed++;
    }
    wornUnIDed = Math.min(wornUnIDed, (level + 1) | 0);
    return Math.fround(1 + Math.fround(Math.fround(0.2) * wornUnIDed));
  }
  static $clinit() {
    ShardOfOblivion.identifySelector = new (ShardOfOblivion$1())()._WndBag$ItemSelector();
  }
}

export class ShardOfOblivion$WandUseTracker extends FlavourBuff {
  static DURATION: number = 0;
  _ShardOfOblivion$WandUseTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.WAND;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, Math.fround(0.6), 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(ShardOfOblivion$WandUseTracker.DURATION - this.visualcooldown())) / ShardOfOblivion$WandUseTracker.DURATION));
  }
  static $clinit() {
    ShardOfOblivion$WandUseTracker.DURATION = 50;
  }
}

export class ShardOfOblivion$ThrownUseTracker extends FlavourBuff {
  static DURATION: number = 0;
  _ShardOfOblivion$ThrownUseTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.THROWN_WEP;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, Math.fround(0.6), 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(ShardOfOblivion$ThrownUseTracker.DURATION - this.visualcooldown())) / ShardOfOblivion$ThrownUseTracker.DURATION));
  }
  static $clinit() {
    ShardOfOblivion$ThrownUseTracker.DURATION = 50;
  }
}

let $ShardOfOblivion$1: any = null;
/** An anonymous class (ShardOfOblivion.java:88). */
function ShardOfOblivion$1(): any {
  return $ShardOfOblivion$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_prompt', []);
    }
    itemSelectable(item: Item): boolean {
      return !item.isIdentified() && item.isUpgradable();
    }
    onSelect(item: Item): void {
      if (item == null) {
        return;
      }
      let ready = false;
      if (item instanceof Weapon) {
        ready = (item).readyToIdentify();
        if (item.isEquipped(Item.curUser) && Item.curUser.pointsInTalent(Talent.ADVENTURERS_INTUITION) === 2) {
          ready = true;
        }
      } else if (item instanceof Armor) {
        ready = (item).readyToIdentify();
        if (item.isEquipped(Item.curUser) && Item.curUser.pointsInTalent(Talent.VETERANS_INTUITION) === 2) {
          ready = true;
        }
      } else if (item instanceof Ring) {
        ready = (item).readyToIdentify();
        if (item.isEquipped(Item.curUser) && Item.curUser.pointsInTalent(Talent.THIEFS_INTUITION) === 2) {
          ready = true;
        }
      } else if (item instanceof Wand) {
        ready = (item).readyToIdentify();
      }
      if (ready) {
        item.identify$();
        Badges.validateItemLevelAquired(item);
        Item.curUser.sprite_.operate$int(Item.curUser.pos);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        Item.curUser.sprite_.parent.add$Gizmo(new Identification()._Identification(Item.curUser.sprite_.center$().offset$float$float(0, -16)));
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify', []), []);
      } else {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_not_yet', []), []);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion$1', []);
}

$J.define(ShardOfOblivion, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_ShardOfOblivion' }, meths: { 'lootChanceMultiplier(int)': 'lootChanceMultiplier$int', 'lootChanceMultiplier()': 'lootChanceMultiplier$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['identifySelector'] });
$J.define(ShardOfOblivion$WandUseTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion$WandUseTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_ShardOfOblivion$WandUseTracker' }, clinit: true, lazy: ['DURATION'] });
$J.define(ShardOfOblivion$ThrownUseTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion$ThrownUseTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_ShardOfOblivion$ThrownUseTracker' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Identification = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Identification');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
