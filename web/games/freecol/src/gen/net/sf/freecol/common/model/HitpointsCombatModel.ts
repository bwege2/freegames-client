// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/HitpointsCombatModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2023   The FreeCol Team
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
import { $J, ArrayList, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { SimpleCombatModel } from './SimpleCombatModel.ts';

let CombatModel$CombatEffectType, CombatModel$CombatResult, LogBuilder, RandomUtils;

export class HitpointsCombatModel extends SimpleCombatModel {
  static logger: Logger = null;
  /**
   * Deliberately empty constructor.
   */
  _HitpointsCombatModel(): this {
    this._SimpleCombatModel();
    return this;
  }
  /**
   * Generates a result of a unit attacking.
   * Takes care to only call the pseudo-random source *once*.
   *
   * @param random A pseudo-random number source.
   * @param attacker The attacker.
   * @param defender The defender.
   * @return The results of the combat.
   */
  generateAttackResult(random: Random, attacker: FreeColGameObject, defender: FreeColGameObject): CombatModel$CombatResult {
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add(['Combat']);
    let crs = new ArrayList();
    let odds = this.calculateCombatOdds$FreeColGameObject$FreeColGameObject$LogBuilder(attacker, defender, lb);
    let r = RandomUtils.randomDouble(HitpointsCombatModel.logger, 'AttackResult', random);
    lb.add([' random(1.0)=', $J.boxD(r)]);
    if (this.combatIsAttack(attacker, defender)) {
      let attackerUnit = attacker;
      let defenderUnit = defender;
      let defenderDamage = random.nextInt(($J.d2i(Math.ceil(this.getOffencePower$FreeColGameObject$FreeColGameObject(attacker, defender))) + 1) | 0);
      let newDefenderHitpoints = (defenderUnit.getHitPoints() - defenderDamage) | 0;
      if (newDefenderHitpoints > 0) {
        let newAttackerHitpoints = -1;
        if (attackerUnit.getType().getAttackRange() <= defenderUnit.getType().getAttackRange() || defenderUnit.getTile$().getDistanceTo(attackerUnit.getTile$()) <= defenderUnit.getType().getAttackRange()) {
          let attackerDamage = random.nextInt(($J.d2i(Math.ceil(this.getDefencePower$FreeColGameObject$FreeColGameObject(attacker, defender))) + 1) | 0);
          newAttackerHitpoints = (attackerUnit.getHitPoints() - attackerDamage) | 0;
          if (newAttackerHitpoints <= 0) {
            crs.add(CombatModel$CombatEffectType.LOSE);
            this.resolveAttack(defenderUnit, attackerUnit, true, (1.25 * r - 0.25 - odds.win) / (1 - odds.win), crs);
            return new CombatModel$CombatResult()._CombatModel$CombatResult$List$int$int(crs, 1, newDefenderHitpoints);
          }
        }
        crs.add(CombatModel$CombatEffectType.WIN);
        return new CombatModel$CombatResult()._CombatModel$CombatResult$List$int$int(crs, newAttackerHitpoints, newDefenderHitpoints);
      } else {
        crs.add(CombatModel$CombatEffectType.WIN);
        this.resolveAttack(attackerUnit, defenderUnit, true, r / (0.1 * odds.win), crs);
        return new CombatModel$CombatResult()._CombatModel$CombatResult$List$int$int(crs, -1, 1);
      }
    } else if (this.combatIsBombard(attacker, defender)) {
      let defenderUnit = defender;
      if (!defenderUnit.isNaval()) {
        throw new RuntimeException('Bombard of non-naval: ' + $J.str(attacker) + ' v ' + $J.str(defender));
      }
      let defenderDamage = random.nextInt(($J.d2i(Math.ceil(this.getOffencePower$FreeColGameObject$FreeColGameObject(attacker, defender))) + 1) | 0);
      if (defenderDamage === 0) {
        crs.add(CombatModel$CombatEffectType.NO_RESULT);
        crs.add(CombatModel$CombatEffectType.EVADE_BOMBARD);
        return new CombatModel$CombatResult()._CombatModel$CombatResult$List$int$int(crs, -1, -1);
      }
      let newDefenderHitpoints = (defenderUnit.getHitPoints() - defenderDamage) | 0;
      if (newDefenderHitpoints > 0) {
        crs.add(CombatModel$CombatEffectType.WIN);
        return new CombatModel$CombatResult()._CombatModel$CombatResult$List$int$int(crs, -1, newDefenderHitpoints);
      } else {
        crs.add(CombatModel$CombatEffectType.WIN);
        crs.add(CombatModel$CombatEffectType.SINK_SHIP_BOMBARD);
        return new CombatModel$CombatResult()._CombatModel$CombatResult$List$int$int(crs, -1, -1);
      }
    } else {
      throw new RuntimeException('Bogus combat: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
  }
  static $clinit() {
    HitpointsCombatModel.logger = Logger.getLogger($J.cls(HitpointsCombatModel).getName());
  }
}

$J.define(HitpointsCombatModel, 'net.sf.freecol.common.model.HitpointsCombatModel', { kind: 'class', sup: 'net.sf.freecol.common.model.SimpleCombatModel', ctors: { '': '_HitpointsCombatModel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  CombatModel$CombatEffectType = $J.load('net.sf.freecol.common.model.CombatModel$CombatEffectType');
  CombatModel$CombatResult = $J.load('net.sf.freecol.common.model.CombatModel$CombatResult');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
