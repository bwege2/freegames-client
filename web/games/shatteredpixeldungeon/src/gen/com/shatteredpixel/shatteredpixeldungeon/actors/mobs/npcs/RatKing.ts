// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/RatKing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Statistics, Char, Ratmogrify, KingsCrown, Notes$Landmark, Messages, GameScene, RatKingSprite, Holiday, WndInfoArmorAbility, WndOptions, Game;

export class RatKing extends NPC {
  _RatKing(): this {
    this._NPC();
    this.spriteClass = $J.cls(RatKingSprite);
    this.state_ = this.SLEEPING;
    return this;
  }
  defenseSkill(enemy: Char): number {
    return Char.INFINITE_EVASION;
  }
  speed(): number {
    return 2;
  }
  chooseEnemy(): Char {
    return null;
  }
  damage(dmg: number, src: any): void {
  }
  add(buff: Buff): boolean {
    return false;
  }
  reset(): boolean {
    return true;
  }
  onAdd(): void {
    super.onAdd();
    if (this.firstAdded && Dungeon.depth !== 5) {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'confused', []));
    }
  }
  landmark(): Notes$Landmark {
    return Dungeon.depth === 5 ? Notes$Landmark.RAT_KING : null;
  }
  act(): boolean {
    if (Dungeon.depth < 5) {
      if (this.pos === Dungeon.level.exit()) {
        this.destroy();
        this.sprite_.killAndErase();
      } else {
        this.target = Dungeon.level.exit();
      }
    } else if (Dungeon.depth > 5) {
      if (this.pos === Dungeon.level.entrance()) {
        this.destroy();
        this.sprite_.killAndErase();
      } else {
        this.target = Dungeon.level.entrance();
      }
    }
    return super.act();
  }
  interact(c: Char): boolean {
    this.sprite_.turnTo(this.pos, c.pos);
    if (c !== Dungeon.hero) {
      return super.interact(c);
    }
    let crown = Dungeon.hero.belongings.getItem($J.cls(KingsCrown));
    if (this.state_ === this.SLEEPING) {
      this.notice();
      this.yell(Messages.get$Object$String$ObjectArr(this, 'not_sleeping', []));
      this.state_ = this.WANDERING;
    } else if (crown != null) {
      if (Dungeon.hero.belongings.armor() == null) {
        this.yell(Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_clothes', []));
      } else {
        Badges.validateRatmogrify();
        Game.runOnRenderThread(new (RatKing$1())().$o(this).$c(crown));
      }
    } else if (Dungeon.hero.armorAbility instanceof Ratmogrify) {
      this.yell(Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_after', []));
    } else {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'what_is_it', []));
    }
    return true;
  }
  description(): string {
    if (Dungeon.hero != null && Dungeon.hero.armorAbility instanceof Ratmogrify) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_crown', []);
    } else if (Holiday.getCurrentHoliday() === Holiday.APRIL_FOOLS) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_birthday', []);
    } else if (Holiday.getCurrentHoliday() === Holiday.WINTER_HOLIDAYS) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_winter', []);
    } else {
      return super.description();
    }
  }
}

let $RatKing$1$1: any = null;
/** An anonymous class (RatKing.java:144). */
function RatKing$1$1(): any {
  return $RatKing$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$cv_crown.upgradeArmor(Dungeon.hero, Dungeon.hero.belongings.armor(), new Ratmogrify()._Ratmogrify());
        Statistics.qualifiedForRandomVictoryBadge = false;
        (this.$outer.$outer.sprite_).resetAnims();
        this.$outer.$outer.yell(Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_thankyou', []));
      } else if (index === 1) {
        GameScene.show(new WndInfoArmorAbility()._WndInfoArmorAbility(Dungeon.hero.heroClass, new Ratmogrify()._Ratmogrify()));
      } else {
        this.$outer.$outer.yell(Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_fine', []));
      }
    }
    $c($crown): this {
      this.$cv_crown = $crown;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.RatKing$1$1', []);
}

let $RatKing$1: any = null;
/** An anonymous class (RatKing.java:134). */
function RatKing$1(): any {
  return $RatKing$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (RatKing$1$1())().$o(this).$c(this.$cv_crown)._WndOptions$Image$String$String$StringArr(this.$outer.sprite(), Messages.titleCase(this.$outer.name()), Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_desc', []), [Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_yes', []), Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_info', []), Messages.get$Class$String$ObjectArr($J.cls(RatKing), 'crown_no', [])]));
    }
    $c($crown): this {
      this.$cv_crown = $crown;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.RatKing$1', ['com.watabou.utils.Callback']);
}

$J.define(RatKing, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.RatKing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_RatKing' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  KingsCrown = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.KingsCrown');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  RatKingSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.RatKingSprite');
  Holiday = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.Holiday');
  WndInfoArmorAbility = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoArmorAbility');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
});
