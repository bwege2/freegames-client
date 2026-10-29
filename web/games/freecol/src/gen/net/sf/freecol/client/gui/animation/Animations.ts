// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/animation/Animations.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject, Logger } from '../../../../../../../jre/index.ts';

let UnitImageAnimation, UnitMoveAnimation;

/**
 * A facade for animations.
 */
export class Animations extends JObject {
  static logger: Logger = null;
  _Animations(): this {
    return this;
  }
  /**
   * Collect animations for a unit move.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param unit The {@code Unit} to be animated.
   * @param source The source {@code Tile} for the unit.
   * @param destination The destination {@code Tile} for the unit.
   * @param scale The scale factor for the unit image.
   * @return A list of {@code Animation}s.
   */
  static unitMove(freeColClient: FreeColClient, unit: Unit, source: Tile, destination: Tile, scale: number): List<Animation> {
    let ret = new ArrayList();
    let speed = freeColClient.getAnimationSpeed(unit.getOwner());
    if (speed > 0) {
      let a = new UnitMoveAnimation()._UnitMoveAnimation(unit, source, destination, speed, scale);
      if (a == null) {
        Animations.logger.warning('No move animation for: ' + $J.str(unit));
      } else {
        ret.add(a);
      }
    }
    return ret;
  }
  /**
   * Get the base resource identifier for an attack animation.
   *
   * @param unit The attacking {@code Unit}.
   * @return The resource base exclusive of direction.
   */
  static getAttackAnimationBase(unit: Unit): string {
    let roleStr = (unit.hasDefaultRole()) ? '' : '.' + unit.getRoleSuffix();
    return 'animation.unit.' + unit.getType().getId() + roleStr + '.attack.';
  }
  /**
   * Collection animations for a unit attack.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param attacker The {@code Unit} that is attacking.
   * @param defender The {@code Unit} that is defending.
   * @param attackerTile The {@code Tile} the attack comes from.
   * @param defenderTile The {@code Tile} the attack goes to.
   * @param success Did the attack succeed?
   * @param scale The scale factor for the unit image.
   * @return A list of {@code Animation}s.
   */
  static unitAttack(freeColClient: FreeColClient, attacker: Unit, defender: Unit, attackerTile: Tile, defenderTile: Tile, success: boolean, scale: number): List<Animation> {
    let ret = new ArrayList();
    let dirn = attackerTile.getDirection(defenderTile);
    if (dirn == null) {
      Animations.logger.warning('Attack animation null direction: ' + $J.str(attacker) + ' v ' + $J.str(defender));
      return ret;
    }
    if (freeColClient.getAnimationSpeed(attacker.getOwner()) > 0) {
      let a = UnitImageAnimation.build(attacker, attackerTile, dirn, Animations.getAttackAnimationBase(attacker), scale);
      if (a == null) {
        Animations.logger.warning('No attack animation for: ' + $J.str(attacker) + ' (' + $J.str(dirn) + ')');
      } else {
        ret.add(a);
      }
    }
    if (!success && freeColClient.getAnimationSpeed(defender.getOwner()) > 0) {
      let revd = dirn.getReverseDirection();
      let a = UnitImageAnimation.build(defender, defenderTile, revd, Animations.getAttackAnimationBase(defender), scale);
      if (a == null) {
        Animations.logger.warning('No attack animation for: ' + $J.str(defender) + ' (' + $J.str(revd) + ')');
      } else {
        ret.add(a);
      }
    }
    return ret;
  }
  static $clinit() {
    Animations.logger = Logger.getLogger($J.cls(Animations).getName());
  }
}

/**
 * Trivial wrapper for zero-argument-zero-return function, 
 * used as a callback for an animation to trigger painting.
 */
export class Animations$Procedure {
}

$J.define(Animations, 'net.sf.freecol.client.gui.animation.Animations', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Animations' }, clinit: true, lazy: ['logger'] });
$J.define(Animations$Procedure, 'net.sf.freecol.client.gui.animation.Animations$Procedure', { kind: 'interface' });
$J.module(() => {
  UnitImageAnimation = $J.load('net.sf.freecol.client.gui.animation.UnitImageAnimation');
  UnitMoveAnimation = $J.load('net.sf.freecol.client.gui.animation.UnitMoveAnimation');
});
