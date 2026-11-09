// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/SummonElemental.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Spell } from './Spell.ts';
import { AllyBuff } from '../../actors/buffs/AllyBuff.ts';
import { Recipe$SimpleRecipe } from '../Recipe.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Invisibility, Talent, SpiritHawk, Elemental, Elemental$AllyNewBornElemental, Elemental$ChaosElemental, Elemental$FireElemental, Elemental$FrostElemental, Elemental$ShockElemental, MagicMissile$MagicParticle, FlameParticle, RainbowParticle, ShaftParticle, Item, PotionOfFrost, PotionOfLiquidFlame, Embers, ScrollOfRecharging, ScrollOfTeleportation, ScrollOfTransmutation, Catalog, Messages, GameScene, CharSprite$State, ItemSprite$Glowing, ItemSpriteSheet, GLog, WndBag$ItemSelector, Sample, PathFinder, Random, Reflection;

export class SummonElemental extends Spell {
  static readonly AC_IMBUE: string = 'IMBUE';
  summonClass: JClass<Elemental> = null;
  static readonly SUMMON_CLASS: string = 'summon_class';
  selector: WndBag$ItemSelector = null;
  _SummonElemental(): this {
    this._Spell();
    this.image_ = ItemSpriteSheet.SUMMON_ELE;
    this.talentChance = Math.fround(1 / Math.fround(SummonElemental$Recipe.OUT_QUANTITY));
    this.summonClass = $J.cls(Elemental$AllyNewBornElemental);
    this.selector = new (SummonElemental$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(SummonElemental.AC_IMBUE);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, SummonElemental.AC_IMBUE)) {
      GameScene.selectItem(this.selector);
    }
  }
  onCast(hero: Hero): void {
    let spawnPoints = new ArrayList();
    for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
      let p = (hero.pos + PathFinder.NEIGHBOURS8[i]) | 0;
      if (Actor.findChar(p) == null && Dungeon.level.passable[p]) {
        spawnPoints.add(p);
      }
    }
    if (!spawnPoints.isEmpty()) {
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch instanceof Elemental && ch.buff($J.cls(SummonElemental$InvisAlly)) != null) {
          ScrollOfTeleportation.appear(ch, Random.element$Collection(spawnPoints));
          (ch).state_ = (ch).HUNTING;
          Item.curUser.spendAndNext(Actor.TICK);
          return;
        }
      }
      let elemental = Reflection.newInstance(this.summonClass);
      GameScene.add$Mob(elemental);
      Buff.affect$Char$Class(elemental, $J.cls(SummonElemental$InvisAlly));
      elemental.setSummonedALly();
      elemental.HP = elemental.HT;
      ScrollOfTeleportation.appear(elemental, Random.element$Collection(spawnPoints));
      Invisibility.dispel$Char(Item.curUser);
      Item.curUser.sprite_.operate$int(Item.curUser.pos);
      Item.curUser.spendAndNext(Actor.TICK);
      this.detach(Dungeon.hero.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      if (Random.Float$() < this.talentChance) {
        Talent.onScrollUsed(Item.curUser, Item.curUser.pos, this.talentFactor, $J.getClass(this));
      }
    } else {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SpiritHawk), 'no_space', []), []);
    }
  }
  glowing(): ItemSprite$Glowing {
    if (this.summonClass === $J.cls(Elemental$FireElemental)) {
      return new ItemSprite$Glowing()._ItemSprite$Glowing$int(16759603);
    }
    if (this.summonClass === $J.cls(Elemental$FrostElemental)) {
      return new ItemSprite$Glowing()._ItemSprite$Glowing$int(9364479);
    }
    if (this.summonClass === $J.cls(Elemental$ShockElemental)) {
      return new ItemSprite$Glowing()._ItemSprite$Glowing$int(16777093);
    }
    if (this.summonClass === $J.cls(Elemental$ChaosElemental)) {
      return new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(14935011, 0.5);
    }
    return super.glowing();
  }
  desc(): string {
    let desc = super.desc();
    desc += '\n\n';
    if (this.summonClass === $J.cls(Elemental$AllyNewBornElemental)) {
      desc += Messages.get$Object$String$ObjectArr(this, 'desc_newborn', []);
    }
    if (this.summonClass === $J.cls(Elemental$FireElemental)) {
      desc += Messages.get$Object$String$ObjectArr(this, 'desc_fire', []);
    }
    if (this.summonClass === $J.cls(Elemental$FrostElemental)) {
      desc += Messages.get$Object$String$ObjectArr(this, 'desc_frost', []);
    }
    if (this.summonClass === $J.cls(Elemental$ShockElemental)) {
      desc += Messages.get$Object$String$ObjectArr(this, 'desc_shock', []);
    }
    if (this.summonClass === $J.cls(Elemental$ChaosElemental)) {
      desc += Messages.get$Object$String$ObjectArr(this, 'desc_chaos', []);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Class(SummonElemental.SUMMON_CLASS, this.summonClass);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(SummonElemental.SUMMON_CLASS)) {
      this.summonClass = bundle.getClass$String(SummonElemental.SUMMON_CLASS);
    }
    if (this.summonClass === $J.cls(Elemental$AllyNewBornElemental)) {
      this.image_ = ItemSpriteSheet.SUMMON_ELE;
    }
    if (this.summonClass === $J.cls(Elemental$FireElemental)) {
      this.image_ = ItemSpriteSheet.SUMMON_ELE_FIRE;
    }
    if (this.summonClass === $J.cls(Elemental$FrostElemental)) {
      this.image_ = ItemSpriteSheet.SUMMON_ELE_FROST;
    }
    if (this.summonClass === $J.cls(Elemental$ShockElemental)) {
      this.image_ = ItemSpriteSheet.SUMMON_ELE_SHOCK;
    }
    if (this.summonClass === $J.cls(Elemental$ChaosElemental)) {
      this.image_ = ItemSpriteSheet.SUMMON_ELE_CHAOS;
    }
  }
}

export class SummonElemental$InvisAlly extends AllyBuff {
  _SummonElemental$InvisAlly(): this {
    this._AllyBuff();
    return this;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.HEARTS);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.HEARTS);
    }
  }
}

export class SummonElemental$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 6;
  _SummonElemental$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(Embers)];
    this.inQuantity = [1];
    this.cost_ = 10;
    this.output = $J.cls(SummonElemental);
    this.outQuantity = SummonElemental$Recipe.OUT_QUANTITY;
    return this;
  }
}

let $SummonElemental$1: any = null;
/** An anonymous class (SummonElemental.java:179). */
function SummonElemental$1(): any {
  return $SummonElemental$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(SummonElemental), 'imbue_prompt', []);
    }
    itemSelectable(item: Item): boolean {
      return item.isIdentified() && (item instanceof PotionOfLiquidFlame || item instanceof PotionOfFrost || item instanceof ScrollOfRecharging || item instanceof ScrollOfTransmutation);
    }
    onSelect(item: Item): void {
      if (item == null) {
        return;
      }
      item.detach(Dungeon.hero.belongings.backpack);
      if (item instanceof PotionOfLiquidFlame) {
        Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
        Item.curUser.sprite_.emitter().burst(FlameParticle.FACTORY, 12);
        this.$outer.summonClass = $J.cls(Elemental$FireElemental);
        this.$outer.image_ = ItemSpriteSheet.SUMMON_ELE_FIRE;
      } else if (item instanceof PotionOfFrost) {
        Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
        Item.curUser.sprite_.emitter().burst(MagicMissile$MagicParticle.FACTORY, 12);
        this.$outer.summonClass = $J.cls(Elemental$FrostElemental);
        this.$outer.image_ = ItemSpriteSheet.SUMMON_ELE_FROST;
      } else if (item instanceof ScrollOfRecharging) {
        Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
        Item.curUser.sprite_.emitter().burst(ShaftParticle.FACTORY, 12);
        this.$outer.summonClass = $J.cls(Elemental$ShockElemental);
        this.$outer.image_ = ItemSpriteSheet.SUMMON_ELE_SHOCK;
      } else if (item instanceof ScrollOfTransmutation) {
        Sample.INSTANCE.play$Object(Assets$Sounds.READ);
        Item.curUser.sprite_.emitter().burst(RainbowParticle.BURST, 12);
        this.$outer.summonClass = $J.cls(Elemental$ChaosElemental);
        this.$outer.image_ = ItemSpriteSheet.SUMMON_ELE_CHAOS;
      }
      Item.curUser.sprite_.operate$int(Item.curUser.pos);
      Item.updateQuickslot();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.SummonElemental$1', []);
}

$J.define(SummonElemental, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.SummonElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', ctors: { '': '_SummonElemental' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(SummonElemental$InvisAlly, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.SummonElemental$InvisAlly', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff', ctors: { '': '_SummonElemental$InvisAlly' } });
$J.define(SummonElemental$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.SummonElemental$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_SummonElemental$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  SpiritHawk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk');
  Elemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental');
  Elemental$AllyNewBornElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$AllyNewBornElemental');
  Elemental$ChaosElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ChaosElemental');
  Elemental$FireElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FireElemental');
  Elemental$FrostElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FrostElemental');
  Elemental$ShockElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ShockElemental');
  MagicMissile$MagicParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  RainbowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  Embers = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Embers');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
