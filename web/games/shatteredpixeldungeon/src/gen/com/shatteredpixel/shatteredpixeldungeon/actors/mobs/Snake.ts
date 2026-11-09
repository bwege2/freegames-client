// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Snake.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Badges, Badges$Badge, Dungeon, Generator$Category, Document, GameScene, SnakeSprite, Random;

export class Snake extends Mob {
  static dodges: number = 0;
  _Snake(): this {
    this._Mob();
    this.spriteClass = $J.cls(SnakeSprite);
    this.HP = this.HT = 4;
    this.defenseSkill_ = 25;
    this.EXP = 2;
    this.maxLvl = 7;
    this.loot = Generator$Category.SEED;
    this.lootChance_ = 0.25;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(1, 4);
  }
  attackSkill(target: Char): number {
    return 10;
  }
  defenseVerb(): string {
    if (Dungeon.level.heroFOV[this.pos]) {
      Snake.dodges++;
    }
    if ((Snake.dodges >= 2 && !Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_SURPRISE_ATKS)) || (Snake.dodges >= 4 && !Badges.isUnlocked(Badges$Badge.BOSS_SLAIN_1))) {
      GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_SURPRISE_ATKS);
      Snake.dodges = 0;
    }
    return super.defenseVerb();
  }
  static $clinit() {
    Snake.dodges = 0;
  }
}

$J.define(Snake, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Snake' }, clinit: true, lazy: ['dodges'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  SnakeSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SnakeSprite');
  Random = $J.load('com.watabou.utils.Random');
});
