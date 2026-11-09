// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/CellSelector.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { ScrollArea } from '../../../watabou/noosa/ScrollArea.ts';

let Dungeon, SPDAction, SPDSettings, Actor, GameScene, PixelScene, DungeonTilemap, ControllerHandler, GameAction, KeyBindings, KeyEvent, PointerEvent, PointerEvent$Type, Camera, Game, GameMath, Point, PointF;

export class CellSelector extends ScrollArea {
  listener: CellSelector$Listener = null;
  enabled_: boolean = false;
  dragThreshold: number = 0;
  mouseZoom: number = 0;
  pinching: boolean = false;
  another: PointerEvent = null;
  startZoom: number = 0;
  startSpan: number = 0;
  dragging: boolean = false;
  lastPos: PointF = null;
  heldAction1: GameAction = null;
  heldAction2: GameAction = null;
  heldAction3: GameAction = null;
  heldDelay: number = 0;
  delayingForRelease: boolean = false;
  keyListener: Signal$Listener<KeyEvent> = null;
  leftStickAction: GameAction = null;
  lastCellMoved: number = 0;
  _CellSelector(map: DungeonTilemap): this {
    this._ScrollArea$Visual(map);
    this.listener = null;
    this.pinching = false;
    this.dragging = false;
    this.lastPos = new PointF()._PointF$();
    this.heldAction1 = SPDAction.NONE;
    this.heldAction2 = SPDAction.NONE;
    this.heldAction3 = SPDAction.NONE;
    this.heldDelay = 0;
    this.delayingForRelease = false;
    this.keyListener = new (CellSelector$1())().$o(this);
    this.leftStickAction = SPDAction.NONE;
    this.lastCellMoved = 0;
    this.camera_ = map.camera();
    this.dragThreshold = Math.fround($J.idiv(Math.imul(PixelScene.defaultZoom, DungeonTilemap.SIZE), 2));
    this.mouseZoom = this.camera_.zoom_;
    KeyEvent.addKeyListener(this.keyListener);
    return this;
  }
  onScroll(event: ScrollEvent): void {
    let diff = Math.fround(event.amount / 10);
    diff = Math.fround(diff / Math.fround((Math.fround((Math.fround(this.camera_.zoom_ + 1)) / this.camera_.zoom_)) - 1));
    diff = Math.min(1, diff);
    this.mouseZoom = GameMath.gate(PixelScene.minZoom, Math.fround(this.mouseZoom - diff), PixelScene.maxZoom);
    this.zoom(Math.fround($J.roundf(this.mouseZoom)));
  }
  onClick(event: PointerEvent): void {
    if (this.dragging) {
      this.dragging = false;
    } else {
      let p = Camera.main.screenToCamera($J.d2i(event.current.x), $J.d2i(event.current.y));
      if (Dungeon.hero.sprite_ != null && Dungeon.hero.sprite_.overlapsPoint(p.x, p.y)) {
        let c = DungeonTilemap.tileCenterToWorld(Dungeon.hero.pos);
        if (Math.fround(Math.abs(Math.fround(p.x - c.x))) <= Math.fround(12) && Math.fround(Math.abs(Math.fround(p.y - c.y))) <= Math.fround(12)) {
          this.select(Dungeon.hero.pos, event.button);
          return;
        }
      }
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (mob.sprite_ != null && mob.sprite_.overlapsPoint(p.x, p.y)) {
          let c = DungeonTilemap.tileCenterToWorld(mob.pos);
          if (Math.fround(Math.abs(Math.fround(p.x - c.x))) <= Math.fround(12) && Math.fround(Math.abs(Math.fround(p.y - c.y))) <= Math.fround(12)) {
            this.select(mob.pos, event.button);
            return;
          }
        }
      }
      for (const $it0 = Dungeon.level.heaps.valueList().iterator(); $it0.hasNext(); ) {
        let heap = $it0.next();
        if (heap.sprite_ != null && heap.sprite_.overlapsPoint(p.x, p.y)) {
          let c = DungeonTilemap.tileCenterToWorld(heap.pos);
          if (Math.fround(Math.abs(Math.fround(p.x - c.x))) <= Math.fround(12) && Math.fround(Math.abs(Math.fround(p.y - c.y))) <= Math.fround(12)) {
            this.select(heap.pos, event.button);
            return;
          }
        }
      }
      this.select((this.target).screenToTile$int$int$boolean($J.d2i(event.current.x), $J.d2i(event.current.y), true), event.button);
    }
  }
  zoom(value: number): number {
    value = GameMath.gate(PixelScene.minZoom, value, PixelScene.maxZoom);
    SPDSettings.zoom$int($J.d2i((Math.fround(value - PixelScene.defaultZoom))));
    this.camera_.zoom$float(value);
    for (const $it1 = Actor.chars().iterator(); $it1.hasNext(); ) {
      let c = $it1.next();
      if (c.sprite_ != null && !c.sprite_.isMoving) {
        c.sprite_.point$PointF(c.sprite_.worldToCamera(c.pos));
      }
    }
    for (const $it2 = Dungeon.level.heaps.valueList().iterator(); $it2.hasNext(); ) {
      let heap = $it2.next();
      if (heap.sprite_ != null) {
        heap.sprite_.point$PointF(heap.sprite_.worldToCamera(heap.pos));
      }
    }
    return value;
  }
  select(cell: number, button: number): void {
    if (this.enabled_ && Dungeon.hero.ready_ && !GameScene.interfaceBlockingHero() && this.listener != null && cell !== -1) {
      switch (button) {
        default:
          this.listener.onSelect(cell);
          break;
        case PointerEvent.RIGHT:
          this.listener.onRightClick(cell);
          break;
      }
      GameScene.ready();
    } else {
      GameScene.cancel();
    }
  }
  onPointerDown(event: PointerEvent): void {
    this.camera_.edgeScroll.set$float(-1);
    if (event !== this.curEvent && this.another == null) {
      if (this.curEvent.type_ === PointerEvent$Type.UP) {
        this.curEvent = event;
        this.onPointerDown(event);
        return;
      }
      this.pinching = true;
      this.another = event;
      this.startSpan = PointF.distance(this.curEvent.current, this.another.current);
      this.startZoom = this.camera_.zoom_;
      this.dragging = false;
    } else if (event !== this.curEvent) {
      this.reset();
    }
  }
  onPointerUp(event: PointerEvent): void {
    this.camera_.edgeScroll.set$float(1);
    if (this.pinching && (event === this.curEvent || event === this.another)) {
      this.pinching = false;
      this.zoom(Math.fround($J.roundf(this.camera_.zoom_)));
      this.dragging = true;
      if (event === this.curEvent) {
        this.curEvent = this.another;
      }
      this.another = null;
      this.lastPos.set$PointF(this.curEvent.current);
    }
  }
  onDrag(event: PointerEvent): void {
    if (this.pinching) {
      let curSpan = PointF.distance(this.curEvent.current, this.another.current);
      let zoom = (Math.fround(Math.fround(this.startZoom * curSpan) / this.startSpan));
      this.camera_.zoom$float(GameMath.gate(PixelScene.minZoom, Math.fround(zoom - (Math.fround(zoom % Math.fround(0.1)))), PixelScene.maxZoom));
    } else {
      if (!this.dragging && PointF.distance(event.current, event.start_) > this.dragThreshold) {
        this.dragging = true;
        this.lastPos.set$PointF(event.current);
      } else if (this.dragging) {
        this.camera_.shift(PointF.diff(this.lastPos, event.current).invScale(this.camera_.zoom_));
        this.lastPos.set$PointF(event.current);
      }
    }
  }
  static initialDelay(): number {
    switch (SPDSettings.movementHoldSensitivity$()) {
      case 0:
        return Infinity;
      case 1:
        return Math.fround(0.13);
      case 2:
        return Math.fround(0.09);
      case 3:
      default:
        return Math.fround(0.06);
      case 4:
        return Math.fround(0.03);
    }
  }
  update(): void {
    super.update();
    let newLeftStick = this.actionFromStick(ControllerHandler.leftStickPosition.x, ControllerHandler.leftStickPosition.y);
    if ((newLeftStick === this.leftStickAction && this.leftStickAction === GameAction.NONE && this.heldAction1 === SPDAction.NONE) || GameScene.interfaceBlockingHero()) {
      return;
    }
    if (newLeftStick !== this.leftStickAction) {
      if (this.leftStickAction === SPDAction.NONE) {
        this.heldDelay = CellSelector.initialDelay();
        Dungeon.hero.resting = false;
      } else if (newLeftStick === SPDAction.NONE && this.heldDelay > 0) {
        this.heldDelay = 0;
        this.moveFromActions([this.leftStickAction]);
      }
      this.leftStickAction = newLeftStick;
    }
    if (this.heldDelay > Math.fround(0)) {
      this.heldDelay = Math.fround(this.heldDelay - Game.elapsed);
    }
    if (this.heldAction1 === SPDAction.NONE && this.leftStickAction === SPDAction.NONE) {
      this.lastCellMoved = -1;
    } else if (Dungeon.hero.ready_) {
      this.processKeyHold();
    }
  }
  moveFromActions(actions: GameAction[]): boolean {
    if (Dungeon.hero == null || !Dungeon.hero.ready_) {
      return false;
    }
    if (GameScene.cancelCellSelector()) {
      return false;
    }
    let direction = new Point()._Point$();
    for (let action of actions) {
      direction.offset$Point(this.directionFromAction(action));
    }
    let cell = Dungeon.hero.pos;
    cell = $J.d2i(Math.fround(cell + GameMath.gate(-1, Math.fround(direction.x), Math.fround(+1))));
    cell = $J.d2i(Math.fround(cell + Math.fround(GameMath.gate(-1, Math.fround(direction.y), Math.fround(+1)) * Dungeon.level.width())));
    if (cell !== Dungeon.hero.pos && cell !== this.lastCellMoved) {
      this.lastCellMoved = cell;
      if (Dungeon.hero.handle(cell)) {
        Dungeon.hero.next();
      }
      return true;
    } else {
      return false;
    }
  }
  directionFromAction(action: GameAction): Point {
    if (action === SPDAction.N) {
      return new Point()._Point$int$int(0, -1);
    }
    if (action === SPDAction.NE) {
      return new Point()._Point$int$int(+1, -1);
    }
    if (action === SPDAction.E) {
      return new Point()._Point$int$int(+1, 0);
    }
    if (action === SPDAction.SE) {
      return new Point()._Point$int$int(+1, +1);
    }
    if (action === SPDAction.S) {
      return new Point()._Point$int$int(0, +1);
    }
    if (action === SPDAction.SW) {
      return new Point()._Point$int$int(-1, +1);
    }
    if (action === SPDAction.W) {
      return new Point()._Point$int$int(-1, 0);
    }
    if (action === SPDAction.NW) {
      return new Point()._Point$int$int(-1, -1);
    } else {
      return new Point()._Point$();
    }
  }
  actionFromStick(x: number, y: number): GameAction {
    if (x > 0.5) {
      if (y < Math.fround(-0.5)) {
        return SPDAction.NE;
      } else if (y > 0.5) {
        return SPDAction.SE;
      } else if (x > Math.fround(0.8)) {
        return SPDAction.E;
      }
    } else if (x < Math.fround(-0.5)) {
      if (y < Math.fround(-0.5)) {
        return SPDAction.NW;
      } else if (y > 0.5) {
        return SPDAction.SW;
      } else if (x < Math.fround(-Math.fround(0.8))) {
        return SPDAction.W;
      }
    } else if (y > Math.fround(0.8)) {
      return SPDAction.S;
    } else if (y < Math.fround(-Math.fround(0.8))) {
      return SPDAction.N;
    }
    return SPDAction.NONE;
  }
  processKeyHold(): void {
    if (!this.directionFromAction(this.leftStickAction).isZero() && this.heldDelay < Math.fround(0)) {
      this.enabled_ = Dungeon.hero.ready_ = true;
      Dungeon.observe$();
      if (this.moveFromActions([this.leftStickAction])) {
        Dungeon.hero.ready_ = false;
      }
    } else if (!(this.directionFromAction(this.heldAction1).offset$Point(this.directionFromAction(this.heldAction2)).isZero()) && this.heldDelay <= Math.fround(0)) {
      this.enabled_ = Dungeon.hero.ready_ = true;
      Dungeon.observe$();
      if (this.moveFromActions([this.heldAction1, this.heldAction2])) {
        Dungeon.hero.ready_ = false;
      }
    }
  }
  resetKeyHold(): void {
    this.heldAction1 = this.heldAction2 = this.heldAction3 = SPDAction.NONE;
  }
  cancel(): void {
    if (this.listener != null) {
      this.listener.onSelect(null);
    }
    GameScene.ready();
  }
  reset(): void {
    super.reset();
    this.another = null;
    if (this.pinching) {
      this.pinching = false;
      this.zoom(Math.fround($J.roundf(this.camera_.zoom_)));
    }
  }
  enable(value: boolean): void {
    if (this.enabled_ !== value) {
      this.enabled_ = value;
    }
  }
  destroy(): void {
    super.destroy();
    KeyEvent.removeKeyListener(this.keyListener);
  }
}

export class CellSelector$Listener extends JObject {
  _CellSelector$Listener(): this {
    return this;
  }
  onRightClick(cell: number): void {
  }
}

let $CellSelector$1: any = null;
/** An anonymous class (CellSelector.java:275). */
function CellSelector$1(): any {
  return $CellSelector$1 ??= $J.local(class extends JObject {
    onSignal(event: KeyEvent): boolean {
      let action = KeyBindings.getActionForKey(event);
      if (!event.pressed) {
        if (action === SPDAction.ZOOM_IN) {
          this.$outer.zoom(Math.fround(this.$outer.camera_.zoom_ + 1));
          this.$outer.mouseZoom = this.$outer.camera_.zoom_;
          return true;
        } else if (action === SPDAction.ZOOM_OUT) {
          this.$outer.zoom(Math.fround(this.$outer.camera_.zoom_ - 1));
          this.$outer.mouseZoom = this.$outer.camera_.zoom_;
          return true;
        }
        if (this.$outer.heldAction1 !== SPDAction.NONE && this.$outer.heldAction1 === action) {
          this.$outer.heldAction1 = SPDAction.NONE;
          if (this.$outer.heldAction2 !== SPDAction.NONE) {
            this.$outer.heldAction1 = this.$outer.heldAction2;
            this.$outer.heldAction2 = SPDAction.NONE;
            if (this.$outer.heldAction3 !== SPDAction.NONE) {
              this.$outer.heldAction2 = this.$outer.heldAction3;
              this.$outer.heldAction3 = SPDAction.NONE;
            }
          }
        } else if (this.$outer.heldAction2 !== SPDAction.NONE && this.$outer.heldAction2 === action) {
          this.$outer.heldAction2 = SPDAction.NONE;
          if (this.$outer.heldAction3 !== SPDAction.NONE) {
            this.$outer.heldAction2 = this.$outer.heldAction3;
            this.$outer.heldAction3 = SPDAction.NONE;
          }
        } else if (this.$outer.heldAction3 !== SPDAction.NONE && this.$outer.heldAction3 === action) {
          this.$outer.heldAction3 = SPDAction.NONE;
        }
        if (this.$outer.heldDelay > 0 && !this.$outer.delayingForRelease) {
          this.$outer.heldDelay = 0;
          this.$outer.moveFromActions([action, this.$outer.heldAction1, this.$outer.heldAction2]);
        }
        if (this.$outer.heldAction1 === GameAction.NONE && this.$outer.heldAction2 === GameAction.NONE) {
          this.$outer.resetKeyHold();
          return true;
        } else {
          this.$outer.delayingForRelease = true;
          this.$outer.heldDelay = CellSelector.initialDelay();
        }
      } else if (!this.$outer.directionFromAction(action).isZero()) {
        Dungeon.hero.resting = false;
        this.$outer.lastCellMoved = -1;
        if (this.$outer.heldAction1 === SPDAction.NONE) {
          this.$outer.heldAction1 = action;
          this.$outer.heldDelay = CellSelector.initialDelay();
          this.$outer.delayingForRelease = false;
        } else if (this.$outer.heldAction2 === SPDAction.NONE) {
          this.$outer.heldAction2 = action;
        } else {
          this.$outer.heldAction3 = action;
        }
        return true;
      } else if (Dungeon.hero != null && Dungeon.hero.resting) {
        Dungeon.hero.resting = false;
        return true;
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$1', ['com.watabou.utils.Signal$Listener']);
}

$J.define(CellSelector, 'com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector', { kind: 'class', sup: 'com.watabou.noosa.ScrollArea', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap': '_CellSelector' } });
$J.define(CellSelector$Listener, 'com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CellSelector$Listener' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  GameAction = $J.load('com.watabou.input.GameAction');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  PointerEvent$Type = $J.load('com.watabou.input.PointerEvent$Type');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
});
