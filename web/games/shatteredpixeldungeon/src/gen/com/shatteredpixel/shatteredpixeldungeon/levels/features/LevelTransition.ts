// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/features/LevelTransition.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../../jre/index.ts';
import { Rect } from '../../../../watabou/utils/Rect.ts';

let Dungeon, Point, Random;

export class LevelTransition extends Rect {
  type_: LevelTransition$Type = null;
  destDepth: number = 0;
  destBranch: number = 0;
  destType: LevelTransition$Type = null;
  centerCell: number = 0;
  static readonly TYPE: string = 'type';
  static readonly DEST_DEPTH: string = 'dest_depth';
  static readonly DEST_BRANCH: string = 'dest_branch';
  static readonly DEST_TYPE: string = 'dest_type';
  _LevelTransition$(): this {
    this._Rect$();
    return this;
  }
  _LevelTransition$Level$int$Type$int$int$Type(level: Level, cell: number, type$: LevelTransition$Type, destDepth: number, destBranch: number, destType: LevelTransition$Type): this {
    this._Rect$();
    this.centerCell = cell;
    let p = level.cellToPoint(cell);
    this.set$int$int$int$int(p.x, p.y, p.x, p.y);
    this.type_ = type$;
    this.destDepth = destDepth;
    this.destBranch = destBranch;
    this.destType = destType;
    return this;
  }
  _LevelTransition$Level$int$Type(level: Level, cell: number, type$: LevelTransition$Type): this {
    this._Rect$();
    this.centerCell = cell;
    let p = level.cellToPoint(cell);
    this.set$int$int$int$int(p.x, p.y, p.x, p.y);
    this.type_ = type$;
    switch (type$) {
      case LevelTransition$Type.REGULAR_ENTRANCE:
      default:
        this.destDepth = (Dungeon.depth - 1) | 0;
        this.destBranch = Dungeon.branch;
        this.destType = LevelTransition$Type.REGULAR_EXIT;
        break;
      case LevelTransition$Type.REGULAR_EXIT:
        this.destDepth = (Dungeon.depth + 1) | 0;
        this.destBranch = Dungeon.branch;
        this.destType = LevelTransition$Type.REGULAR_ENTRANCE;
        break;
      case LevelTransition$Type.SURFACE:
        this.destDepth = 0;
        this.destBranch = 0;
        this.destType = null;
        break;
    }
    return this;
  }
  cell(): number {
    return this.centerCell;
  }
  width(): number {
    return (super.width() + 1) | 0;
  }
  height(): number {
    return (super.height() + 1) | 0;
  }
  inside$Point(p: Point): boolean {
    return p.x >= this.left_ && p.x <= this.right_ && p.y >= this.top_ && p.y <= this.bottom_;
  }
  inside$int(cell: number): boolean {
    return this.inside$Point(new Point()._Point$Point(Dungeon.level.cellToPoint(cell)));
  }
  center(): Point {
    return new Point()._Point$int$int(($J.idiv(((this.left_ + this.right_) | 0), 2) + ((((this.right_ - this.left_) | 0) % 2) === 1 ? Random.Int$int(2) : 0)) | 0, ($J.idiv(((this.top_ + this.bottom_) | 0), 2) + ((((this.bottom_ - this.top_) | 0) % 2) === 1 ? Random.Int$int(2) : 0)) | 0);
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int('left', this.left_);
    bundle.put$String$int('top', this.top_);
    bundle.put$String$int('right', this.right_);
    bundle.put$String$int('bottom', this.bottom_);
    bundle.put$String$int('center', this.centerCell);
    bundle.put$String$Enum(LevelTransition.TYPE, this.type_);
    bundle.put$String$int(LevelTransition.DEST_DEPTH, this.destDepth);
    bundle.put$String$int(LevelTransition.DEST_BRANCH, this.destBranch);
    bundle.put$String$Enum(LevelTransition.DEST_TYPE, this.destType);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.left_ = bundle.getInt('left');
    this.top_ = bundle.getInt('top');
    this.right_ = bundle.getInt('right');
    this.bottom_ = bundle.getInt('bottom');
    this.centerCell = bundle.getInt('center');
    this.type_ = bundle.getEnum(LevelTransition.TYPE, $J.cls(LevelTransition$Type));
    this.destDepth = bundle.getInt(LevelTransition.DEST_DEPTH);
    this.destBranch = bundle.getInt(LevelTransition.DEST_BRANCH);
    if (bundle.contains(LevelTransition.DEST_TYPE)) {
      this.destType = bundle.getEnum(LevelTransition.DEST_TYPE, $J.cls(LevelTransition$Type));
    }
  }
}

export class LevelTransition$Type extends JEnum {
  static SURFACE: LevelTransition$Type = null;
  static REGULAR_ENTRANCE: LevelTransition$Type = null;
  static REGULAR_EXIT: LevelTransition$Type = null;
  static BRANCH_ENTRANCE: LevelTransition$Type = null;
  static BRANCH_EXIT: LevelTransition$Type = null;
  static $VALUES: LevelTransition$Type[] = null;
  _LevelTransition$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): LevelTransition$Type[] { return LevelTransition$Type.$VALUES.slice(); }
  static valueOf(name: string): LevelTransition$Type { return $J.enumValueOf(LevelTransition$Type, name); }
  static $clinit() {
    LevelTransition$Type.SURFACE = new LevelTransition$Type()._LevelTransition$Type('SURFACE', 0);
    LevelTransition$Type.REGULAR_ENTRANCE = new LevelTransition$Type()._LevelTransition$Type('REGULAR_ENTRANCE', 1);
    LevelTransition$Type.REGULAR_EXIT = new LevelTransition$Type()._LevelTransition$Type('REGULAR_EXIT', 2);
    LevelTransition$Type.BRANCH_ENTRANCE = new LevelTransition$Type()._LevelTransition$Type('BRANCH_ENTRANCE', 3);
    LevelTransition$Type.BRANCH_EXIT = new LevelTransition$Type()._LevelTransition$Type('BRANCH_EXIT', 4);
    LevelTransition$Type.$VALUES = [LevelTransition$Type.SURFACE, LevelTransition$Type.REGULAR_ENTRANCE, LevelTransition$Type.REGULAR_EXIT, LevelTransition$Type.BRANCH_ENTRANCE, LevelTransition$Type.BRANCH_EXIT];
  }
}

$J.define(LevelTransition, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'com.watabou.utils.Rect', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type': '_LevelTransition$Level$int$Type', 'com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type,int,int,com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type': '_LevelTransition$Level$int$Type$int$int$Type', '': '_LevelTransition$' }, meths: { 'inside(int)': 'inside$int', 'inside(com.watabou.utils.Point)': 'inside$Point' } });
$J.define(LevelTransition$Type, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_LevelTransition$Type' }, clinit: true, lazy: ['$VALUES', 'SURFACE', 'REGULAR_ENTRANCE', 'REGULAR_EXIT', 'BRANCH_ENTRANCE', 'BRANCH_EXIT'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
