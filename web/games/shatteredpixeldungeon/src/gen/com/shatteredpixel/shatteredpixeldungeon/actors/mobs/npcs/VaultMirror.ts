// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultMirror.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { NPC } from './NPC.ts';
import { Greatsword } from '../../../items/weapon/melee/Greatsword.ts';

let Dungeon, Char, Char$Property, Hero, HeroClass, Imp$Quest, BrokenSeal, Armor$Glyph, CloakOfShadows, HolyTome, SpiritBow, MagesStaff, Messages, GameScene, VaultMirrorSprite, GLog, WndOptions, WndTitledMessage, Game, Random;

export class VaultMirror extends NPC {
  reward: Item = null;
  static readonly REWARD: string = 'reward';
  _VaultMirror(): this {
    this._NPC();
    this.spriteClass = $J.cls(VaultMirrorSprite);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.OBJECT);
    this.reward = null;
    return this;
  }
  throwItems(): void {
    let heap = Dungeon.level.heaps.get(this.pos);
    if (heap != null) {
      Dungeon.level.drop(heap.pickUp(), (this.pos + Dungeon.level.width()) | 0).sprite_.drop$int(this.pos);
    }
  }
  createReward(cls: HeroClass): void {
    Random.pushGenerator$long(Random.Long$());
    switch (cls) {
      case HeroClass.WARRIOR:
        this.reward = new BrokenSeal()._BrokenSeal().upgrade$().identify$boolean(false);
        (this.reward).setGlyph(Armor$Glyph.random([]));
        break;
      case HeroClass.MAGE:
        this.reward = new MagesStaff()._MagesStaff$().upgrade$int(3).identify$boolean(false);
        (this.reward).enchant$();
        break;
      case HeroClass.ROGUE:
        this.reward = new CloakOfShadows()._CloakOfShadows().upgrade$int(8).identify$boolean(false);
        (this.reward).directCharge(8);
        break;
      case HeroClass.HUNTRESS:
        this.reward = new SpiritBow()._SpiritBow().identify$boolean(false);
        (this.reward).enchant$();
        break;
      case HeroClass.DUELIST:
        this.reward = new VaultMirror$MirrorSword()._VaultMirror$MirrorSword().upgrade$int(3).identify$boolean(false);
        (this.reward).enchant$();
        break;
      case HeroClass.CLERIC:
        this.reward = new HolyTome()._HolyTome().upgrade$int(8).identify$boolean(false);
        (this.reward).directCharge(8);
        break;
    }
    Random.popGenerator();
  }
  interact(c: Char): boolean {
    if (c instanceof Hero) {
      Game.runOnRenderThread(new (VaultMirror$1())().$o(this).$c(c));
    }
    return false;
  }
  defenseSkill(enemy: Char): number {
    return Char.INFINITE_EVASION;
  }
  damage(dmg: number, src: any): void {
  }
  add(buff: Buff): boolean {
    return false;
  }
  reset(): boolean {
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.reward != null) {
      bundle.put$String$Bundlable(VaultMirror.REWARD, this.reward);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(VaultMirror.REWARD)) {
      this.reward = bundle.get$String(VaultMirror.REWARD);
    }
  }
}

export class VaultMirror$MirrorSword extends Greatsword {
  _VaultMirror$MirrorSword(): this {
    this._Greatsword();
    this.unique = true;
    return this;
  }
}

let $VaultMirror$1$1: any = null;
/** An anonymous class (VaultMirror.java:135). */
function VaultMirror$1$1(): any {
  return $VaultMirror$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(this.$outer.$outer.sprite(), Messages.titleCase(this.$outer.$outer.name()), Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_take', [])));
        if (this.$outer.$outer.reward.doPickUp$Hero(this.$cv_c)) {
          GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'you_now_have', [this.$outer.$outer.reward.name()])), []);
        } else {
          Dungeon.level.drop(this.$outer.$outer.reward, this.$cv_c.pos).sprite_.drop$();
        }
        Imp$Quest.mirrorUsed = true;
        this.$outer.$outer.reward = null;
      }
    }
    $c($c): this {
      this.$cv_c = $c;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultMirror$1$1', []);
}

let $VaultMirror$1: any = null;
/** An anonymous class (VaultMirror.java:104). */
function VaultMirror$1(): any {
  return $VaultMirror$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$outer.reward != null) {
        let sceneText = Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'approach', []) + '\n\n';
        switch ((this.$cv_c).heroClass) {
          case HeroClass.WARRIOR:
            sceneText += Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_warrior', []);
            break;
          case HeroClass.MAGE:
            sceneText += Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_mage', []);
            break;
          case HeroClass.ROGUE:
            sceneText += Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_rogue', []);
            break;
          case HeroClass.HUNTRESS:
            sceneText += Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_huntress', []);
            break;
          case HeroClass.DUELIST:
            sceneText += Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_duelist', []);
            break;
          case HeroClass.CLERIC:
            sceneText += Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_cleric', []);
            break;
        }
        sceneText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_final', []);
        GameScene.show(new (VaultMirror$1$1())().$o(this).$c(this.$cv_c)._WndOptions$Image$String$String$StringArr(this.$outer.sprite(), Messages.titleCase(this.$outer.name()), sceneText, [Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'take', [])]));
      } else {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(this.$outer.sprite(), Messages.titleCase(this.$outer.name()), Messages.get$Class$String$ObjectArr($J.cls(VaultMirror), 'scene_nothing', [])));
      }
    }
    $c($c): this {
      this.$cv_c = $c;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultMirror$1', ['com.watabou.utils.Callback']);
}

$J.define(VaultMirror, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultMirror', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_VaultMirror' } });
$J.define(VaultMirror$MirrorSword, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultMirror$MirrorSword', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greatsword', ctors: { '': '_VaultMirror$MirrorSword' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  BrokenSeal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  VaultMirrorSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.VaultMirrorSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
});
