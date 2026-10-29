// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/animation/UnitImageAnimation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, Logger } from '../../../../../../../jre/index.ts';
import { Animation } from './Animation.ts';

let ImageLibrary, ImageAnimationEvent, Direction, CollectionUtils, ImageUtils, StringUtils, Utils;

/**
 * Class for in-place animation of units.
 */
export class UnitImageAnimation extends Animation {
  static logger: Logger = null;
  /**
   * Alternate directions to check when a directional animation is
   *       not found.
   */
  static alternatives: JMap<Direction, List<Direction>> = null;
  /**
   * The animation image series.
   */
  animation: SimpleZippedAnimation = null;
  /**
   * Reflect the images?
   */
  mirror: boolean = false;
  /**
   * Build a new image animation.
   *
   * @param unit The {@code Unit} to be animated.
   * @param tile The {@code Tile} where the animation occurs.
   * @param animation The {@code SimpleZippedAnimation} to show.
   */
  _UnitImageAnimation(unit: Unit, tile: Tile, animation: SimpleZippedAnimation): this {
    this._Animation(unit, CollectionUtils.makeUnmodifiableList([tile]));
    this.animation = animation;
    this.mirror = false;
    return this;
  }
  /**
   * Set the mirror state.
   *
   * @param mirror The new mirror state.
   */
  setMirrored(mirror: boolean): void {
    this.mirror = mirror;
  }
  /**
   * Get a list of directions to try when looking for a
   * direction-keyed animation given a preferred direction which has
   * failed.
   *
   * @param direction The preferred {@code Direction}.
   * @return A list of {@code Direction}s.
   */
  static trialDirections(direction: Direction): List<Direction> {
    if (UnitImageAnimation.alternatives.isEmpty()) {
      for (const $it0 = Direction.allDirections.iterator(); $it0.hasNext(); ) {
        let d = $it0.next();
        let a = new ArrayList();
        a.add(d);
        switch (d) {
          case Direction.N:
          case Direction.S:
            a.add(Direction.E);
            a.add(Direction.W);
            a.add(d.rotate(1));
            a.add(d.rotate(-1));
            a.add(d.rotate(3));
            a.add(d.rotate(-3));
            break;
          case Direction.NE:
          case Direction.SW:
            a.add(d.rotate(1));
            a.add(d.rotate(2));
            a.add(d.rotate(-1));
            a.add(d.rotate(3));
            break;
          case Direction.NW:
          case Direction.SE:
            a.add(d.rotate(-1));
            a.add(d.rotate(-2));
            a.add(d.rotate(1));
            a.add(d.rotate(-3));
            break;
          case Direction.E:
          case Direction.W:
            a.add(d.rotate(1));
            a.add(d.rotate(-1));
            a.add(d.rotate(2));
            a.add(d.rotate(-2));
            break;
        }
        UnitImageAnimation.alternatives.put(d, a);
      }
    }
    return UnitImageAnimation.alternatives.get(direction);
  }
  /**
   * Static quasi-constructor that can fail harmlessly.
   *
   * @param unit The {@code Unit} to be animated.
   * @param tile The {@code Tile} where the animation occurs.
   * @param dirn The {@code Direction} of the attack.
   * @param base The base prefix for the animation resource.
   * @param scale The gui scale.
   * @return The animation found or null if none present.
   */
  static build(unit: Unit, tile: Tile, dirn: Direction, base: string, scale: number): UnitImageAnimation {
    for (const $it1 = UnitImageAnimation.trialDirections(dirn).iterator(); $it1.hasNext(); ) {
      let d = $it1.next();
      let szaId = base + StringUtils.downCase$String(d.toString());
      let sza = ImageLibrary.getSZA(szaId, scale);
      if (sza != null) {
        return new UnitImageAnimation()._UnitImageAnimation(unit, tile, sza);
      }
      szaId = base + StringUtils.downCase$String(d.getEWMirroredDirection().toString());
      sza = ImageLibrary.getSZA(szaId, scale);
      if (sza != null) {
        let ret = new UnitImageAnimation()._UnitImageAnimation(unit, tile, sza);
        ret.setMirrored(true);
        return ret;
      }
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  executeWithLabel(unitLabel: JLabel, paintCallback: Animations$Procedure): void {
    let icon = unitLabel.getIcon();
    for (const $it2 = this.animation.iterator(); $it2.hasNext(); ) {
      let event = $it2.next();
      let time = $J.system_nanoTime();
      if ($J.isa(event, ImageAnimationEvent)) {
        let ievent = event;
        let image = ievent.getImage();
        if (this.mirror) {
          image = ImageUtils.createMirroredImage(image);
        }
        icon.setImage(image);
        paintCallback.execute();
        time = ievent.getDurationInMs() - $J.ldiv(($J.system_nanoTime() - time), 1000000);
        if (time > 0) {
          Utils.delay(time, 'Animation delayed.');
        }
      }
    }
  }
  static $clinit() {
    UnitImageAnimation.logger = Logger.getLogger($J.cls(UnitImageAnimation).getName());
    UnitImageAnimation.alternatives = new HashMap();
  }
}

$J.define(UnitImageAnimation, 'net.sf.freecol.client.gui.animation.UnitImageAnimation', { kind: 'class', sup: 'net.sf.freecol.client.gui.animation.Animation', ctors: { 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Tile,net.sf.freecol.common.io.sza.SimpleZippedAnimation': '_UnitImageAnimation' }, clinit: true, lazy: ['logger', 'alternatives'] });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ImageAnimationEvent = $J.load('net.sf.freecol.common.io.sza.ImageAnimationEvent');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
