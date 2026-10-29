// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Stance.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, RuntimeException } from '../../../../../../jre/index.ts';

let Messages, Tension, Tension$Level, StringUtils;

/**
 * The stance one player has towards another player.
 *   Valid transitions:
 *
 *   [FROM] \  [TO]  U  A  P  C  W        Reasons
 *   ----------------------------------   a = attack
 *   UNCONTACTED  |  -  x  c  x  i    |   c = contact
 *   ALLIANCE     |  x  -  d  x  adit |   d = act of diplomacy
 *   PEACE        |  x  d  -  x  adit |   i = incitement/rebellion
 *   CEASE_FIRE   |  x  d  t  -  adit |   t = change of tension
 *   WAR          |  x  d  ds dt -    |   s = surrender
 *   ----------------------------------   x = invalid
 */
export class Stance extends JEnum {
  static UNCONTACTED: Stance = null;
  static ALLIANCE: Stance = null;
  static PEACE: Stance = null;
  static CEASE_FIRE: Stance = null;
  static WAR: Stance = null;
  static $VALUES: Stance[] = null;
  _Stance($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  badStance(): void {
  }
  badTransition(newStance: Stance): void {
    throw new RuntimeException('Bad transition: ' + $J.str(this) + ' -> ' + $J.str(newStance));
  }
  /**
   * Check whether tension has changed enough to merit a stance
   * change.  Do not simply check for crossing tension
   * thresholds, add in Tension.DELTA to provide a bit of
   * hysteresis to dampen ringing.
   *
   * @param tension The {@code Tension} to check.
   * @return The {@code Stance} appropriate to the tension level.
   */
  getStanceFromTension(tension: Tension): Stance {
    let value = tension.getValue();
    switch (this) {
      case Stance.WAR:
        if (value <= ((Tension$Level.CONTENT.getLimit() - Tension.DELTA) | 0)) {
          return Stance.CEASE_FIRE;
        }
        break;
      case Stance.CEASE_FIRE:
        if (value <= ((Tension$Level.HAPPY.getLimit() - Tension.DELTA) | 0)) {
          return Stance.PEACE;
        }
      case Stance.ALLIANCE:
      case Stance.PEACE:
        if (value > ((Tension$Level.HATEFUL.getLimit() + Tension.DELTA) | 0)) {
          return Stance.WAR;
        }
        break;
      case Stance.UNCONTACTED:
        break;
      default:
        this.badStance();
    }
    return this;
  }
  /**
   * A stance change is about to happen.  Get the appropriate tension
   * modifier.
   *
   * @param newStance The new {@code Stance}.
   * @return A modifier to the current tension.
   */
  getTensionModifier(newStance: Stance): number {
    switch (newStance) {
      case Stance.UNCONTACTED:
        this.badTransition(newStance);
        break;
      case Stance.ALLIANCE:
        switch (this) {
          case Stance.UNCONTACTED:
            this.badTransition(newStance);
          case Stance.ALLIANCE:
            return 0;
          case Stance.PEACE:
            return Tension.ALLIANCE_MODIFIER;
          case Stance.CEASE_FIRE:
            return (Tension.ALLIANCE_MODIFIER + Tension.PEACE_TREATY_MODIFIER) | 0;
          case Stance.WAR:
            return (Tension.ALLIANCE_MODIFIER + Tension.CEASE_FIRE_MODIFIER + Tension.PEACE_TREATY_MODIFIER) | 0;
          default:
            break;
        }
        break;
      case Stance.PEACE:
        switch (this) {
          case Stance.UNCONTACTED:
            return Tension.CONTACT_MODIFIER;
          case Stance.ALLIANCE:
            return Tension.DROP_ALLIANCE_MODIFIER;
          case Stance.PEACE:
            return 0;
          case Stance.CEASE_FIRE:
            return Tension.PEACE_TREATY_MODIFIER;
          case Stance.WAR:
            return (Tension.CEASE_FIRE_MODIFIER + Tension.PEACE_TREATY_MODIFIER) | 0;
          default:
            break;
        }
        break;
      case Stance.CEASE_FIRE:
        switch (this) {
          case Stance.UNCONTACTED:
            this.badTransition(newStance);
          case Stance.ALLIANCE:
            this.badTransition(newStance);
          case Stance.PEACE:
            this.badTransition(newStance);
          case Stance.CEASE_FIRE:
            return 0;
          case Stance.WAR:
            return Tension.CEASE_FIRE_MODIFIER;
          default:
            break;
        }
        break;
      case Stance.WAR:
        switch (this) {
          case Stance.UNCONTACTED:
            return Tension.WAR_MODIFIER;
          case Stance.ALLIANCE:
            return Tension.WAR_MODIFIER;
          case Stance.PEACE:
            return Tension.WAR_MODIFIER;
          case Stance.CEASE_FIRE:
            return Tension.RESUME_WAR_MODIFIER;
          case Stance.WAR:
            return 0;
          default:
            break;
        }
        break;
      default:
        throw new RuntimeException('Bogus newStance: ' + $J.str(newStance));
    }
    throw new RuntimeException('Bogus stance: ' + $J.str(this));
  }
  /**
   * Is this stance one that can be incited to war?
   *
   * @return True if this stance is incitable.
   */
  isIncitable(): boolean {
    switch (this) {
      case Stance.CEASE_FIRE:
      case Stance.PEACE:
        return true;
      default:
        break;
    }
    return false;
  }
  /**
   * Get the stem key.
   *
   * @return The stance stem key.
   */
  getKey(): string {
    return 'stance.' + StringUtils.getEnumKey(this);
  }
  /**
   * Get the message key to use for player messages when stance changes.
   *
   * @return A suitable message key.
   */
  getStanceChangeKey(): string {
    return 'model.player.' + this.getKey() + '.declared';
  }
  /**
   * Get the message key to use for player messages when stance
   * changes between other players.
   *
   * @return A suitable message key.
   */
  getOtherStanceChangeKey(): string {
    return 'model.player.' + this.getKey() + '.others';
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  static values(): Stance[] { return Stance.$VALUES.slice(); }
  static valueOf(name: string): Stance { return $J.enumValueOf(Stance, name); }
  static $clinit() {
    Stance.UNCONTACTED = new Stance()._Stance('UNCONTACTED', 0);
    Stance.ALLIANCE = new Stance()._Stance('ALLIANCE', 1);
    Stance.PEACE = new Stance()._Stance('PEACE', 2);
    Stance.CEASE_FIRE = new Stance()._Stance('CEASE_FIRE', 3);
    Stance.WAR = new Stance()._Stance('WAR', 4);
    Stance.$VALUES = [Stance.UNCONTACTED, Stance.ALLIANCE, Stance.PEACE, Stance.CEASE_FIRE, Stance.WAR];
  }
}

$J.define(Stance, 'net.sf.freecol.common.model.Stance', { kind: 'enum', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Enum', ctors: { '': '_Stance' }, returns: { 'getNameKey': 'java.lang.String', 'getOtherStanceChangeKey': 'java.lang.String', 'getStanceChangeKey': 'java.lang.String', 'getKey': 'java.lang.String', 'isIncitable': 'boolean' }, clinit: true, lazy: ['$VALUES', 'UNCONTACTED', 'ALLIANCE', 'PEACE', 'CEASE_FIRE', 'WAR'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Tension = $J.load('net.sf.freecol.common.model.Tension');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
