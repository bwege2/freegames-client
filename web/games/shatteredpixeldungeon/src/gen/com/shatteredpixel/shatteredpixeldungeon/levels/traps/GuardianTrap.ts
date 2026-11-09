// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/GuardianTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trap } from './Trap.ts';
import { Statue } from '../../actors/mobs/Statue.ts';
import { StatueSprite } from '../../sprites/StatueSprite.ts';

let Assets$Sounds, Dungeon, CellEmitter, Speck, Generator, Generator$Category, Messages, GameScene, GLog, Sample;

export class GuardianTrap extends Trap {
  _GuardianTrap(): this {
    this._Trap();
    this.color_ = Trap.RED;
    this.shape = Trap.STARS;
    return this;
  }
  activate(): void {
    for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
      let mob = $it0.next();
      mob.beckon(this.pos);
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'alarm', []), []);
      CellEmitter.center(this.pos).start(Speck.factory$int(Speck.SCREAM), Math.fround(0.3), 3);
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.ALERT);
    for (let i = 0; i < $J.idiv(((this.scalingDepth() - 5) | 0), 5); i++) {
      let guardian = new GuardianTrap$Guardian()._GuardianTrap$Guardian();
      guardian.createWeapon(false);
      guardian.state_ = guardian.WANDERING;
      guardian.pos = Dungeon.level.randomRespawnCell(guardian);
      if (guardian.pos !== -1) {
        GameScene.add$Mob(guardian);
        guardian.beckon(Dungeon.hero.pos);
      }
    }
  }
}

export class GuardianTrap$Guardian extends Statue {
  _GuardianTrap$Guardian(): this {
    this._Statue();
    this.spriteClass = $J.cls(GuardianTrap$GuardianSprite);
    this.EXP = 0;
    this.state_ = this.WANDERING;
    this.levelGenStatue = false;
    return this;
  }
  createWeapon(useDecks: boolean): void {
    this.weapon_ = Generator.randomUsingDefaults$Category(Generator$Category.WEAPON);
    this.weapon_.cursed = false;
    this.weapon_.enchant$Enchantment(null);
    this.weapon_.level$int(0);
  }
  beckon(cell: number): void {
    this.notice();
    if (this.state_ !== this.HUNTING) {
      this.state_ = this.WANDERING;
    }
    this.target = cell;
  }
}

export class GuardianTrap$GuardianSprite extends StatueSprite {
  _GuardianTrap$GuardianSprite(): this {
    this._StatueSprite();
    this.tint$float$float$float$float(0, 0, 1, Math.fround(0.2));
    return this;
  }
  resetColor(): void {
    super.resetColor();
    this.tint$float$float$float$float(0, 0, 1, Math.fround(0.2));
  }
}

$J.define(GuardianTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_GuardianTrap' } });
$J.define(GuardianTrap$Guardian, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap$Guardian', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue', ctors: { '': '_GuardianTrap$Guardian' } });
$J.define(GuardianTrap$GuardianSprite, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap$GuardianSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.StatueSprite', ctors: { '': '_GuardianTrap$GuardianSprite' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
