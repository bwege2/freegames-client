// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/RevealedArea.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from './FlavourBuff.ts';

let Dungeon, Buff$buffType, Talent, Messages, GameScene, BuffIndicator;

export class RevealedArea extends FlavourBuff {
  pos: number = 0;
  depth_: number = 0;
  branch: number = 0;
  static readonly BRANCH: string = 'branch';
  static readonly DEPTH: string = 'depth';
  static readonly POS: string = 'pos';
  _RevealedArea(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  detach(): void {
    GameScene.updateFog$int$int(this.pos, 2);
    super.detach();
  }
  icon(): number {
    return BuffIndicator.MIND_VISION;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 1, 1);
  }
  iconFadePercent(): number {
    let max = Math.fround(Math.imul(5, Dungeon.hero.pointsInTalent(Talent.SEER_SHOT)));
    return Math.max(0, Math.fround((Math.fround(max - this.visualcooldown())) / max));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [$J.d2i(this.visualcooldown())]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(RevealedArea.DEPTH, this.depth_);
    bundle.put$String$int(RevealedArea.BRANCH, this.branch);
    bundle.put$String$int(RevealedArea.POS, this.pos);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.depth_ = bundle.getInt(RevealedArea.DEPTH);
    this.branch = bundle.getInt(RevealedArea.BRANCH);
    this.pos = bundle.getInt(RevealedArea.POS);
  }
}

$J.define(RevealedArea, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.RevealedArea', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_RevealedArea' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
