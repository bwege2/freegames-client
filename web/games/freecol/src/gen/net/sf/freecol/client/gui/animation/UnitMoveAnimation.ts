// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/animation/UnitMoveAnimation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { Animation } from './Animation.ts';

let ImageLibrary, CollectionUtils, Utils;

/**
 * Class for the animation of units movement.
 */
export class UnitMoveAnimation extends Animation {
  static logger: Logger = null;
  /**
   * Display delay between one frame and another, in milliseconds.
   * 33ms == 30 fps
   */
  static readonly ANIMATION_DELAY: number = 33;
  /**
   * The animation speed client option.
   */
  speed: number = 0;
  /**
   * The image scale.
   */
  scale_: number = 0;
  /**
   * Build a new movement animation.
   *
   * @param unit The {@code Unit} to be animated.
   * @param sourceTile The {@code Tile} the unit is moving from.
   * @param destinationTile The {@code Tile} the unit is moving to.
   * @param speed The animation speed.
   * @param scale The scale factor for the unit image.
   */
  _UnitMoveAnimation(unit: Unit, sourceTile: Tile, destinationTile: Tile, speed: number, scale: number): this {
    this._Animation(unit, CollectionUtils.makeUnmodifiableList([sourceTile, destinationTile]));
    this.speed = speed;
    this.scale_ = scale;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  executeWithLabel(unitLabel: JLabel, paintCallback: Animations$Procedure): void {
    let movementRatio = $J.d2i((($J.pow(2, (this.speed + 1) | 0)) * this.scale_));
    let xratio = ImageLibrary.TILE_SIZE.width_ / ImageLibrary.TILE_SIZE.height_;
    let srcPoint = this.points.get(0);
    let dstPoint = this.points.get(1);
    let stepX = $J.d2i(((Math.signum(dstPoint.getX() - srcPoint.getX())) * xratio * movementRatio));
    let stepY = $J.d2i(((Math.signum(dstPoint.getY() - srcPoint.getY())) * movementRatio));
    let point = srcPoint;
    let time = Utils.now();
    let dropFrames = 0;
    while (!point.equals(dstPoint)) {
      point.x_ = (point.x_ + stepX) | 0;
      point.y_ = (point.y_ + stepY) | 0;
      if ((stepX < 0 && point.x_ < dstPoint.x_) || (stepX > 0 && point.x_ > dstPoint.x_)) {
        point.x_ = dstPoint.x_;
      }
      if ((stepY < 0 && point.y_ < dstPoint.y_) || (stepY > 0 && point.y_ > dstPoint.y_)) {
        point.y_ = dstPoint.y_;
      }
      if (dropFrames <= 0) {
        unitLabel.setLocation$Point(point);
        paintCallback.execute();
        let newTime = Utils.now();
        let timeTaken = newTime - time;
        time = newTime;
        let waitTime = UnitMoveAnimation.ANIMATION_DELAY - timeTaken;
        if (waitTime > 0) {
          Utils.delay(waitTime, 'Animation interrupted.');
          dropFrames = 0;
        } else {
          dropFrames = $J.ldiv(timeTaken, UnitMoveAnimation.ANIMATION_DELAY) - 1;
        }
      } else {
        dropFrames--;
      }
    }
  }
  static $clinit() {
    UnitMoveAnimation.logger = Logger.getLogger($J.cls(UnitMoveAnimation).getName());
  }
}

$J.define(UnitMoveAnimation, 'net.sf.freecol.client.gui.animation.UnitMoveAnimation', { kind: 'class', sup: 'net.sf.freecol.client.gui.animation.Animation', ctors: { 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Tile,int,float': '_UnitMoveAnimation' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
