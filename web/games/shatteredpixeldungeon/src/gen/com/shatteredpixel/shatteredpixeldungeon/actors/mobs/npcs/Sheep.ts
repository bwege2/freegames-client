// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Sheep.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { NPC } from './NPC.ts';

let Assets$Sounds, Dungeon, Char, Bestiary, Messages, CharSprite, SheepSprite, Sample, Random;

export class Sheep extends NPC {
  static LINE_KEYS: string[] = null;
  lifespan: number = 0;
  static readonly LIFESPAN: string = 'lifespan';
  _Sheep(): this {
    this._NPC();
    this.spriteClass = $J.cls(SheepSprite);
    return this;
  }
  act(): boolean {
    if (Dungeon.level.heroFOV[this.pos]) {
      Bestiary.setSeen($J.getClass(this));
    }
    this.HP = 0;
    this.destroy();
    this.sprite_.die();
    return true;
  }
  initialize(lifespan: number): void {
    this.lifespan = lifespan;
    this.spend(Math.fround(lifespan + Random.Float$float$float(-2, 2)));
  }
  defenseSkill(enemy: Char): number {
    return Char.INFINITE_EVASION;
  }
  damage(dmg: number, src: any): void {
  }
  add(buff: Buff): boolean {
    return false;
  }
  interact(c: Char): boolean {
    Bestiary.setSeen($J.getClass(this));
    this.sprite_.showStatus(CharSprite.NEUTRAL, Messages.get$Object$String$ObjectArr(this, Random.element$ObjectArr(Sheep.LINE_KEYS), []), []);
    if (c === Dungeon.hero) {
      Dungeon.hero.spendAndNext(1);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.SHEEP, 1, Random.Float$float$float(Math.fround(0.91), Math.fround(1.1)));
      if (this.lifespan >= Math.fround(20)) {
        this.spend(Math.fround(-this.cooldown()));
      }
    }
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Sheep.LIFESPAN, this.lifespan);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.lifespan = Math.fround(bundle.getInt(Sheep.LIFESPAN));
  }
  static $clinit() {
    Sheep.LINE_KEYS = ['Baa!', 'Baa?', 'Baa.', 'Baa...'];
  }
}

$J.define(Sheep, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_Sheep' }, clinit: true, lazy: ['LINE_KEYS'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  SheepSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SheepSprite');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
