// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultTokenDoor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Char, Char$Property, Hero, DwarfToken, ScrollOfMagicMapping, Level, Terrain, Messages, GameScene, VaultTokenDoorSprite, GLog, WndOptions, WndTitledMessage, Game, Sample;

export class VaultTokenDoor extends NPC {
  _VaultTokenDoor(): this {
    this._NPC();
    this.spriteClass = $J.cls(VaultTokenDoorSprite);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.OBJECT);
    return this;
  }
  throwItems(): void {
    let heap = Dungeon.level.heaps.get(this.pos);
    if (heap != null) {
      Dungeon.level.drop(heap.pickUp(), (this.pos + Dungeon.level.width()) | 0).sprite_.drop$int(this.pos);
    }
  }
  interact(c: Char): boolean {
    if (c instanceof Hero) {
      let h = c;
      let tokens = h.belongings.getItem($J.cls(DwarfToken));
      let descText = this.description();
      if (tokens == null) {
        descText += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'no_tokens', []);
      } else if (tokens.quantity$() < 10) {
        descText += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'too_few_tokens', []);
      } else {
        descText += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'enough_tokens', []);
      }
      let finalDescText = descText;
      Game.runOnRenderThread(new (VaultTokenDoor$1())().$o(this).$c(tokens, finalDescText, c, h));
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
}

let $VaultTokenDoor$1$1: any = null;
/** An anonymous class (VaultTokenDoor.java:88). */
function VaultTokenDoor$1$1(): any {
  return $VaultTokenDoor$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        this.$cv_c.sprite_.operate$int(this.$outer.$outer.pos);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.UNLOCK, 0.25);
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(VaultTokenDoor), 'unlocked', []), []);
        this.$outer.$outer.destroy();
        Level.set$int$int(this.$outer.$outer.pos, Terrain.DOOR);
        GameScene.updateMap$int(this.$outer.$outer.pos);
        ScrollOfMagicMapping.discover(this.$outer.$outer.pos);
        this.$outer.$outer.sprite_.killAndErase();
        this.$cv_tokens.detachAll(this.$cv_h.belongings.backpack);
      }
    }
    $c($c, $tokens, $h): this {
      this.$cv_c = $c; this.$cv_tokens = $tokens; this.$cv_h = $h;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultTokenDoor$1$1', []);
}

let $VaultTokenDoor$1: any = null;
/** An anonymous class (VaultTokenDoor.java:80). */
function VaultTokenDoor$1(): any {
  return $VaultTokenDoor$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$cv_tokens != null && this.$cv_tokens.quantity$() >= 10) {
        GameScene.show(new (VaultTokenDoor$1$1())().$o(this).$c(this.$cv_c, this.$cv_tokens, this.$cv_h)._WndOptions$Image$String$String$StringArr(this.$outer.sprite(), Messages.titleCase(this.$outer.name()), this.$cv_finalDescText, [Messages.get$Class$String$ObjectArr($J.cls(VaultTokenDoor), 'open', []), Messages.get$Class$String$ObjectArr($J.cls(VaultTokenDoor), 'not_yet', [])]));
      } else {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(this.$outer.sprite(), Messages.titleCase(this.$outer.name()), this.$cv_finalDescText));
      }
    }
    $c($tokens, $finalDescText, $c, $h): this {
      this.$cv_tokens = $tokens; this.$cv_finalDescText = $finalDescText; this.$cv_c = $c; this.$cv_h = $h;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultTokenDoor$1', ['com.watabou.utils.Callback']);
}

$J.define(VaultTokenDoor, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultTokenDoor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_VaultTokenDoor' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  VaultTokenDoorSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.VaultTokenDoorSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
