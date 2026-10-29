// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/SimpleCombatModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashSet, IllegalArgumentException, Level, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { CombatModel } from './CombatModel.ts';

let Ability, Colony, CombatModel$CombatEffectType, CombatModel$CombatOdds, CombatModel$CombatResult, FeatureContainer, IndianSettlement, Modifier, Modifier$ModifierType, Ownable, Specification, Unit, Unit$UnitState, UnitChangeType, CollectionUtils, LogBuilder, RandomUtils;

/**
 * This class implements the original Colonization combat model.
 *
 * The name of this class is laughably wrong.
 *
 * Note that the damage part of any CombatResult is ignored throughout.
 */
export class SimpleCombatModel extends CombatModel {
  static logger: Logger = null;
  /**
   * The maximum attack power of a Colony's fortifications against a
   * naval unit.
   */
  static readonly MAXIMUM_BOMBARD_POWER: number = 48;
  /**
   * A defence percentage bonus that disables the fortification bonus.
   */
  static readonly STRONG_DEFENCE_THRESHOLD: number = 150;
  static UNKNOWN_DEFENCE_MODIFIER: Modifier = null;
  /**
   * Deliberately empty constructor.
   */
  _SimpleCombatModel(): this {
    this._CombatModel();
    return this;
  }
  /**
   * Calculates the odds of success in combat.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return The combat odds.
   */
  calculateCombatOdds$FreeColGameObject$FreeColGameObject(attacker: FreeColGameObject, defender: FreeColGameObject): CombatModel$CombatOdds {
    return this.calculateCombatOdds$FreeColGameObject$FreeColGameObject$LogBuilder(attacker, defender, null);
  }
  /**
   * Calculates the odds of success in combat.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @param lb An optional {@code LogBuilder} to log to.
   * @return The combat odds.
   */
  calculateCombatOdds$FreeColGameObject$FreeColGameObject$LogBuilder(attacker: FreeColGameObject, defender: FreeColGameObject, lb: LogBuilder): CombatModel$CombatOdds {
    if (attacker == null || defender == null) {
      if (lb != null) {
        lb.add([' odds=unknowable']);
      }
      return new CombatModel$CombatOdds()._CombatModel$CombatOdds(CombatModel$CombatOdds.UNKNOWN_ODDS);
    }
    if (lb != null) {
      lb.add([' attacker=', attacker, ' ']);
    }
    let attackPower = this.getOffencePower$FreeColGameObject$FreeColGameObject$LogBuilder$SimpleCombatModel(attacker, defender, lb);
    if (lb != null) {
      lb.add([' defender=', defender, ' ']);
    }
    let defencePower = this.getDefencePower$FreeColGameObject$FreeColGameObject$LogBuilder(attacker, defender, lb);
    if (attackPower === 0 && defencePower === 0) {
      if (lb != null) {
        lb.add([' odds=unknown']);
      }
      return new CombatModel$CombatOdds()._CombatModel$CombatOdds(CombatModel$CombatOdds.UNKNOWN_ODDS);
    }
    let victory = attackPower / (attackPower + defencePower);
    if (lb != null) {
      lb.add([' odds=', $J.boxD(victory)]);
    }
    return new CombatModel$CombatOdds()._CombatModel$CombatOdds(victory);
  }
  /**
   * Get the offensive power of a unit attacking another.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return The offensive power.
   */
  getOffencePower$FreeColGameObject$FreeColGameObject(attacker: FreeColGameObject, defender: FreeColGameObject): number {
    return this.getOffencePower$FreeColGameObject$FreeColGameObject$LogBuilder$SimpleCombatModel(attacker, defender, null);
  }
  /**
   * Helper to log modifiers with.
   *
   * @param lb The {@code LogBuilder} to log to.
   * @param modSet A set of {@code Modifiers} to log.
   */
  logModifiers(lb: LogBuilder, modSet: JSet<Modifier>): void {
    lb.addCollection(' ', CollectionUtils.sort$Collection$Comparator(modSet, Modifier.ascendingModifierIndexComparator));
  }
  /**
   * Get the offensive power of a unit attacking another.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @param lb An optional {@code LogBuilder} to log to.
   * @return The offensive power.
   */
  getOffencePower$FreeColGameObject$FreeColGameObject$LogBuilder$SimpleCombatModel(attacker: FreeColGameObject, defender: FreeColGameObject, lb: LogBuilder): number {
    let result = 0;
    if (attacker == null) {
      throw new RuntimeException('Null attacker: ' + $J.str(this));
    } else if (this.combatIsAttackMeasurement(attacker, defender) || this.combatIsAttack(attacker, defender) || this.combatIsSettlementAttack(attacker, defender)) {
      let mods = this.getOffensiveModifiers(attacker, defender);
      let turn = attacker.getGame().getTurn();
      result = FeatureContainer.applyModifiers$float$Turn$Collection(0, turn, mods);
      if (lb != null) {
        this.logModifiers(lb, mods);
        lb.add([' = ', $J.boxD(result)]);
      }
    } else if (this.combatIsBombard(attacker, defender)) {
      let attackerSettlement = attacker;
      if (attackerSettlement.hasAbility$String(Ability.BOMBARD_SHIPS)) {
        result += CollectionUtils.sumDouble$Stream$Predicate$ToDoubleFunction(attackerSettlement.getTile$().getUnits(), (u) => u.hasAbility$String(Ability.BOMBARD), (u) => u.getType().getOffence());
      }
      if (result > SimpleCombatModel.MAXIMUM_BOMBARD_POWER) {
        result = SimpleCombatModel.MAXIMUM_BOMBARD_POWER;
      }
      if (lb != null) {
        lb.add([' bombard=', $J.boxD(result)]);
      }
    } else {
      throw new RuntimeException('Bogus combat: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
    return result;
  }
  /**
   * Get the defensive power wrt an attacker.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return The defensive power.
   */
  getDefencePower$FreeColGameObject$FreeColGameObject(attacker: FreeColGameObject, defender: FreeColGameObject): number {
    return this.getDefencePower$FreeColGameObject$FreeColGameObject$LogBuilder(attacker, defender, null);
  }
  /**
   * Get the defensive power wrt an attacker.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @param lb An optional {@code LogBuilder} to log to.
   * @return The defensive power.
   */
  getDefencePower$FreeColGameObject$FreeColGameObject$LogBuilder(attacker: FreeColGameObject, defender: FreeColGameObject, lb: LogBuilder): number {
    let result: number;
    if (this.combatIsDefenceMeasurement(attacker, defender) || this.combatIsAttack(attacker, defender) || this.combatIsSettlementAttack(attacker, defender) || this.combatIsBombard(attacker, defender)) {
      let mods = this.getDefensiveModifiers(attacker, defender);
      let turn = defender.getGame().getTurn();
      result = FeatureContainer.applyModifiers$float$Turn$Collection(0, turn, mods);
      if (lb != null) {
        this.logModifiers(lb, mods);
        lb.add([' = ', $J.boxD(result)]);
      }
    } else {
      throw new IllegalArgumentException('Bogus combat');
    }
    return result;
  }
  /**
   * Collect all the offensive modifiers that apply to an attack.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return All the applicable offensive modifiers.
   */
  getOffensiveModifiers(attacker: FreeColGameObject, defender: FreeColGameObject): JSet<Modifier> {
    let result = new HashSet();
    if (attacker == null) {
      throw new RuntimeException('Null attacker: ' + $J.str(this));
    } else if (this.combatIsAttackMeasurement(attacker, defender) || this.combatIsAttack(attacker, defender) || this.combatIsSettlementAttack(attacker, defender)) {
      let attackerUnit = attacker;
      let turn = attackerUnit.getGame().getTurn();
      result.add(new Modifier()._Modifier$String$float$ModifierType$FreeColObject$int(Modifier.OFFENCE, Math.fround(attackerUnit.getType().getBaseOffence()), Modifier$ModifierType.ADDITIVE, Specification.BASE_OFFENCE_SOURCE, Modifier.BASE_COMBAT_INDEX));
      result.addAll(attackerUnit.getCombatModifiers(Modifier.OFFENCE, attackerUnit.getType(), turn));
      if ($J.isa(defender, Ownable)) {
        let owner = (defender).getOwner();
        result.addAll(CollectionUtils.toList$Stream(attackerUnit.getModifiers$String$FreeColSpecObjectType(Modifier.OFFENCE_AGAINST, owner.getNationType())));
      }
      if (attackerUnit.isNaval()) {
        this.addNavalOffensiveModifiers(attackerUnit, result);
      } else {
        this.addLandOffensiveModifiers(attackerUnit, defender, result);
      }
    } else if (this.combatIsBombard(attacker, defender)) {
    } else {
      throw new RuntimeException('Bogus combat: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
    for (const $it0 = (CollectionUtils.transform$Collection$Predicate(result, CollectionUtils.matchKeyEquals$Object$Function(Modifier.DEFAULT_MODIFIER_INDEX, ($p0) => $p0.getModifierIndex()))).iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      m.setModifierIndex(Modifier.GENERAL_COMBAT_INDEX);
    }
    return result;
  }
  /**
   * Add all the offensive modifiers that apply to a naval attack.
   *
   * @param attacker The attacker.
   * @param result The set of modifiers to add to.
   */
  addNavalOffensiveModifiers(attacker: Unit, result: JSet<Modifier>): void {
    let spec = attacker.getSpecification();
    result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.ATTACK_BONUS)));
    let goodsCount = attacker.getGoodsSpaceTaken();
    if (goodsCount > 0) {
      result.addAll(CollectionUtils.transform$Stream$Predicate$Function(spec.getModifiers(Modifier.CARGO_PENALTY), CollectionUtils.alwaysTrue(), (m) => Modifier.makeModifier(m).setValue(Math.fround(m.getValue$() * goodsCount))));
    }
  }
  /**
   * Add the popular support bonus to the result set if applicable.
   *
   * @param colony The {@code Colony} under attack.
   * @param attacker The attacking {@code Unit}.
   * @param result The set of modifiers to add to.
   */
  addPopularSupportBonus(colony: Colony, attacker: Unit, result: JSet<Modifier>): void {
    let bonus = colony.getSonsOfLiberty();
    if (bonus >= 0) {
      if (attacker.getOwner().isREF()) {
        bonus = (100 - bonus) | 0;
      }
      if (bonus > 0) {
        result.add(new Modifier()._Modifier$String$float$ModifierType$FreeColObject$int(Modifier.POPULAR_SUPPORT, Math.fround(bonus), Modifier$ModifierType.PERCENTAGE, colony, Modifier.GENERAL_COMBAT_INDEX));
      }
    }
  }
  /**
   * Add all the offensive modifiers that apply to a land attack.
   *
   * @param attacker The attacker {@code Unit}.
   * @param defender The defender.
   * @param result The set of modifiers to add to.
   */
  addLandOffensiveModifiers(attacker: Unit, defender: FreeColGameObject, result: JSet<Modifier>): void {
    let spec = attacker.getSpecification();
    result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.ATTACK_BONUS)));
    switch (attacker.getMovesLeft()) {
      case 1:
        result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.BIG_MOVEMENT_PENALTY)));
        break;
      case 2:
        result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.SMALL_MOVEMENT_PENALTY)));
        break;
      default:
        break;
    }
    if (this.combatIsAmphibious(attacker, defender)) {
      result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.AMPHIBIOUS_ATTACK)));
    }
    if (this.combatIsAttackMeasurement(attacker, defender)) {
    } else if (this.combatIsSettlementAttack(attacker, defender)) {
      result.addAll(CollectionUtils.toList$Stream(attacker.getModifiers$String(Modifier.BOMBARD_BONUS)));
      if (this.combatIsWarOfIndependence(attacker, defender)) {
        this.addPopularSupportBonus(defender, attacker, result);
      }
    } else if (this.combatIsAttack(attacker, defender)) {
      let defenderUnit = defender;
      let tile = defenderUnit.getTile$();
      if (tile != null) {
        if (tile.hasSettlement()) {
          result.addAll(CollectionUtils.toList$Stream(attacker.getModifiers$String(Modifier.BOMBARD_BONUS)));
          if (this.combatIsWarOfIndependence(attacker, defender)) {
            this.addPopularSupportBonus(tile.getSettlement(), attacker, result);
          }
        } else {
          if (this.isAmbush(attacker, defender)) {
            for (const $it1 = tile.getDefenceModifiers().iterator(); $it1.hasNext(); ) {
              let m = $it1.next();
              let mod = Modifier.makeModifier(m);
              mod.setId(Modifier.OFFENCE);
              mod.setSource(Specification.AMBUSH_BONUS_SOURCE);
              result.add(mod);
            }
          }
        }
      }
      if (attacker.hasAbility$String(Ability.BOMBARD) && attacker.isOnTile() && attacker.getSettlement() == null && attacker.getState() !== Unit$UnitState.FORTIFIED && defenderUnit.getSettlement() == null) {
        result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.ARTILLERY_IN_THE_OPEN)));
      }
    } else {
      throw new RuntimeException('Bogus combat: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
  }
  /**
   * Collect all defensive modifiers when defending against an attack.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return All the applicable defensive modifiers.
   */
  getDefensiveModifiers(attacker: FreeColGameObject, defender: FreeColGameObject): JSet<Modifier> {
    let result = new HashSet();
    if (this.combatIsDefenceMeasurement(attacker, defender) || this.combatIsAttack(attacker, defender) || this.combatIsBombard(attacker, defender)) {
      let defenderUnit = defender;
      let turn = defenderUnit.getGame().getTurn();
      result.add(new Modifier()._Modifier$String$float$ModifierType$FreeColObject$int(Modifier.DEFENCE, Math.fround(defenderUnit.getType().getBaseDefence()), Modifier$ModifierType.ADDITIVE, Specification.BASE_DEFENCE_SOURCE, Modifier.BASE_COMBAT_INDEX));
      result.addAll(defenderUnit.getCombatModifiers(Modifier.DEFENCE, defenderUnit.getType(), turn));
      if (defenderUnit.isNaval()) {
        this.addNavalDefensiveModifiers(defenderUnit, result);
      } else {
        this.addLandDefensiveModifiers(attacker, defenderUnit, result);
      }
    } else if (this.combatIsSettlementAttack(attacker, defender)) {
      let settlement = defender;
      let tile = settlement.getTile$();
      result.addAll(tile.getType().getDefenceModifiers());
      result.addAll(settlement.getDefenceModifiers());
      result.add(SimpleCombatModel.UNKNOWN_DEFENCE_MODIFIER);
    } else {
      throw new RuntimeException('Bogus combat: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
    for (const $it2 = (CollectionUtils.transform$Collection$Predicate(result, CollectionUtils.matchKeyEquals$Object$Function(Modifier.DEFAULT_MODIFIER_INDEX, ($p0) => $p0.getModifierIndex()))).iterator(); $it2.hasNext(); ) {
      let m = $it2.next();
      m.setModifierIndex(Modifier.GENERAL_COMBAT_INDEX);
    }
    return result;
  }
  /**
   * Add all the defensive modifiers that apply to a naval attack.
   *
   * @param defender The defender {@code Unit}.
   * @param result The set of modifiers to add to.
   */
  addNavalDefensiveModifiers(defender: Unit, result: JSet<Modifier>): void {
    let spec = defender.getSpecification();
    let goodsCount = defender.getVisibleGoodsCount();
    if (goodsCount > 0) {
      result.addAll(CollectionUtils.transform$Stream$Predicate$Function(spec.getModifiers(Modifier.CARGO_PENALTY), CollectionUtils.alwaysTrue(), (m) => Modifier.makeModifier(m).setValue(Math.fround(m.getValue$() * goodsCount))));
    }
  }
  /**
   * Does a given object provide a strong defence bonus?
   *
   * @param fco The {@code FreeColObject} to check.
   * @return True if a strong defence bonus is present.
   */
  hasStrongDefenceModifier(fco: FreeColObject): boolean {
    return CollectionUtils.any$Collection$Predicate(fco.getDefenceModifiers(), (m) => m.getType() === Modifier$ModifierType.PERCENTAGE && m.getValue$() >= Math.fround(SimpleCombatModel.STRONG_DEFENCE_THRESHOLD));
  }
  /**
   * Add all the defensive modifiers that apply to a land attack.
   *
   * @param attacker The attacker.
   * @param defender The defender {@code Unit}.
   * @param result The set of modifiers to add to.
   */
  addLandDefensiveModifiers(attacker: FreeColGameObject, defender: Unit, result: JSet<Modifier>): void {
    let spec = defender.getSpecification();
    let tile = defender.getTile$();
    let settlement = (tile == null) ? null : tile.getSettlement();
    if (tile != null) {
      let disableFortified = false;
      disableFortified = !!(disableFortified | this.hasStrongDefenceModifier(tile.getType()));
      if (settlement == null) {
        result.addAll(tile.getType().getDefenceModifiers());
        if (defender.hasAbility$String(Ability.BOMBARD) && defender.getState() !== Unit$UnitState.FORTIFIED) {
          result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.ARTILLERY_IN_THE_OPEN)));
        }
      } else {
        result.addAll(settlement.getDefenceModifiers());
        if (attacker != null && (attacker).getOwner().isIndian() && defender.hasAbility$String(Ability.BOMBARD)) {
          result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.ARTILLERY_AGAINST_RAID)));
        }
        let autoRole = defender.getAutomaticRole();
        if (autoRole != null) {
          result.addAll(autoRole.getDefenceModifiers());
        }
        if (settlement instanceof Colony) {
          let stockade = (settlement).getStockade();
          if (stockade != null) {
            disableFortified = !!(disableFortified | this.hasStrongDefenceModifier(stockade.getType()));
          }
        }
      }
      if (!disableFortified && defender.getState() === Unit$UnitState.FORTIFIED) {
        result.addAll(CollectionUtils.toList$Stream(spec.getModifiers(Modifier.FORTIFIED)));
      }
    }
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
    let r = RandomUtils.randomDouble(SimpleCombatModel.logger, 'AttackResult', random);
    lb.add([' random(1.0)=', $J.boxD(r)]);
    let great = false;
    let action: string;
    if (this.combatIsAttack(attacker, defender)) {
      let attackerUnit = attacker;
      let defenderUnit = defender;
      action = 'Attack';
      if (r < odds.win || defenderUnit.isBeached$()) {
        great = r < 0.1 * odds.win;
        crs.add(CombatModel$CombatEffectType.WIN);
        this.resolveAttack(attackerUnit, defenderUnit, great, r / (0.1 * odds.win), crs);
      } else if (r < 0.8 * odds.win + 0.2 && defenderUnit.hasAbility$String(Ability.EVADE_ATTACK)) {
        crs.add(CombatModel$CombatEffectType.NO_RESULT);
        crs.add(CombatModel$CombatEffectType.EVADE_ATTACK);
      } else {
        great = r >= 0.1 * odds.win + 0.9;
        crs.add(CombatModel$CombatEffectType.LOSE);
        this.resolveAttack(defenderUnit, attackerUnit, great, (1.25 * r - 0.25 - odds.win) / (1 - odds.win), crs);
      }
    } else if (this.combatIsBombard(attacker, defender)) {
      let defenderUnit = defender;
      if (!defenderUnit.isNaval()) {
        throw new RuntimeException('Bombard of non-naval: ' + $J.str(attacker) + ' v ' + $J.str(defender));
      }
      action = 'Bombard';
      if (r <= odds.win) {
        crs.add(CombatModel$CombatEffectType.WIN);
        let offencePower = this.getOffencePower$FreeColGameObject$FreeColGameObject(attacker, defender);
        let defencePower = this.getDefencePower$FreeColGameObject$FreeColGameObject(attacker, defender);
        let diff = Math.max(3, defencePower * 2 - offencePower);
        great = r < odds.win / diff;
        if (great || defenderUnit.getRepairLocation() == null) {
          crs.add(CombatModel$CombatEffectType.SINK_SHIP_BOMBARD);
        } else {
          crs.add(CombatModel$CombatEffectType.DAMAGE_SHIP_BOMBARD);
        }
      } else {
        crs.add(CombatModel$CombatEffectType.NO_RESULT);
        crs.add(CombatModel$CombatEffectType.EVADE_BOMBARD);
      }
    } else {
      throw new RuntimeException('Bogus combat: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
    lb.add([' great=', great, ' ', action]);
    for (const $it3 = crs.iterator(); $it3.hasNext(); ) {
      let cr = $it3.next();
      lb.add([' ', cr]);
    }
    lb.log(SimpleCombatModel.logger, Level.INFO);
    return new CombatModel$CombatResult()._CombatModel$CombatResult$List(crs);
  }
  /**
   * Resolve all the consequences of a normal attack.
   *
   * @param winner The winning {@code Unit}.
   * @param loser The losing {@code Unit}.
   * @param great True if this is a great win/loss.
   * @param r A "residual" random value (for convert/burn mission).
   * @param crs A list of {@code CombatResult}s to add to.
   */
  resolveAttack(winner: Unit, loser: Unit, great: boolean, r: number, crs: List<CombatModel$CombatEffectType>): void {
    let loserPlayer = loser.getOwner();
    let tile = loser.getTile$();
    let winnerPlayer = winner.getOwner();
    let attackerWon = crs.get(0) === CombatModel$CombatEffectType.WIN;
    let loserMustDie = loser.hasAbility$String(Ability.DISPOSE_ON_COMBAT_LOSS);
    let uc: UnitTypeChange;
    if (loser.isNaval()) {
      if (winner.isNaval() && winner.canCaptureGoods() && !loser.getGoodsList().isEmpty()) {
        crs.add(CombatModel$CombatEffectType.LOOT_SHIP);
      }
      if (great || loserMustDie || loser.getRepairLocation() == null || loser.isBeached$()) {
        crs.add(CombatModel$CombatEffectType.SINK_SHIP_ATTACK);
      } else {
        crs.add(CombatModel$CombatEffectType.DAMAGE_SHIP_ATTACK);
      }
    } else {
      let autoRole = (attackerWon) ? loser.getAutomaticRole() : null;
      if (autoRole != null) {
        crs.add(CombatModel$CombatEffectType.AUTOEQUIP_UNIT);
      }
      let done = false;
      let settlement = tile.getSettlement();
      if (settlement instanceof Colony) {
        let colony = settlement;
        if (autoRole == null && !loser.isDefensiveUnit()) {
          let ships = colony.getTile$().getNavalUnits();
          let shipResult = (ships.isEmpty()) ? null : (ships.get(0).getRepairLocation() == null) ? CombatModel$CombatEffectType.SINK_COLONY_SHIPS : CombatModel$CombatEffectType.DAMAGE_COLONY_SHIPS;
          if (winnerPlayer.isEuropean() || winnerPlayer.isUndead()) {
            if (loserMustDie) {
              crs.add(CombatModel$CombatEffectType.SLAUGHTER_UNIT);
            }
            if (shipResult != null) {
              crs.add(shipResult);
            }
            crs.add(CombatModel$CombatEffectType.CAPTURE_COLONY);
            done = true;
          } else if (!great && colony.canBePillaged(winner)) {
            crs.add(CombatModel$CombatEffectType.PILLAGE_COLONY);
            done = true;
          } else if (colony.getUnitCount() > 1 || loser.getLocation() === tile) {
            loserMustDie = true;
            done = false;
          } else {
            crs.add(CombatModel$CombatEffectType.SLAUGHTER_UNIT);
            if (shipResult != null) {
              crs.add(shipResult);
            }
            crs.add(CombatModel$CombatEffectType.DESTROY_COLONY);
            done = true;
          }
        }
      } else if (settlement instanceof IndianSettlement) {
        let is$ = settlement;
        let lose = 0;
        if (loserMustDie) {
          crs.add(CombatModel$CombatEffectType.SLAUGHTER_UNIT);
          lose++;
          done = true;
        }
        if (attackerWon) {
          if (r < winner.getConvertProbability()) {
            if (((is$.getUnitCount() + tile.getUnitCount()) | 0) > lose && is$.hasMissionary$Player(winnerPlayer) && !this.combatIsAmphibious(winner, loser)) {
              crs.add(CombatModel$CombatEffectType.CAPTURE_CONVERT);
              lose++;
            }
          } else if (r >= 1 - winner.getBurnProbability()) {
            if (CollectionUtils.any$Collection(CollectionUtils.transform$Stream$Predicate(loserPlayer.getIndianSettlements(), (s) => s.hasMissionary$Player(winnerPlayer)))) {
              crs.add(CombatModel$CombatEffectType.BURN_MISSIONS);
            }
          }
        }
        if (((settlement.getUnitCount() + tile.getUnitCount()) | 0) <= lose) {
          crs.add(CombatModel$CombatEffectType.DESTROY_SETTLEMENT);
          done = true;
        }
      }
      if (!done) {
        let loserRole = loser.getRole();
        if (autoRole != null) {
          crs.add((winner.canCaptureEquipment(autoRole) != null) ? CombatModel$CombatEffectType.CAPTURE_AUTOEQUIP : CombatModel$CombatEffectType.LOSE_AUTOEQUIP);
          if (loserMustDie) {
            crs.add(CombatModel$CombatEffectType.SLAUGHTER_UNIT);
          } else if (loser.hasAbility$String(Ability.DEMOTE_ON_ALL_EQUIPMENT_LOST)) {
            crs.add(CombatModel$CombatEffectType.DEMOTE_UNIT);
          }
        } else if (loserMustDie) {
          crs.add(CombatModel$CombatEffectType.SLAUGHTER_UNIT);
        } else if (loserRole.isOffensive()) {
          crs.add((winner.canCaptureEquipment(loserRole) != null) ? CombatModel$CombatEffectType.CAPTURE_EQUIP : CombatModel$CombatEffectType.LOSE_EQUIP);
          if (loser.losingEquipmentKillsUnit()) {
            crs.add(CombatModel$CombatEffectType.SLAUGHTER_UNIT);
          } else if (loser.losingEquipmentDemotesUnit()) {
            crs.add(CombatModel$CombatEffectType.DEMOTE_UNIT);
          }
        } else if (loser.hasAbility$String(Ability.CAN_BE_CAPTURED) && winner.hasAbility$String(Ability.CAPTURE_UNITS) && !this.combatIsAmphibious(winner, loser)) {
          crs.add(CombatModel$CombatEffectType.CAPTURE_UNIT);
        } else if (loser.getUnitChange$String(UnitChangeType.DEMOTION) != null) {
          crs.add(CombatModel$CombatEffectType.DEMOTE_UNIT);
        } else if (winner.isUndead() && !loser.isUndead() && loser.getUnitChange$String$UnitType$Player(UnitChangeType.UNDEAD, null, winner.getOwner()) != null) {
          crs.add(CombatModel$CombatEffectType.CAPTURE_UNIT);
        } else {
          crs.add(CombatModel$CombatEffectType.SLAUGHTER_UNIT);
        }
      }
    }
    uc = winner.getUnitChange$String(UnitChangeType.PROMOTION);
    if (uc != null && (winner.hasAbility$String(Ability.AUTOMATIC_PROMOTION) || (great && (100 * (r - Math.floor(r)) <= uc.probability)))) {
      crs.add(CombatModel$CombatEffectType.PROMOTE_UNIT);
    }
  }
  /**
   * Could this attack be an ambush?
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return True if the attack can be an ambush.
   */
  isAmbush(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    return attacker instanceof Unit && defender instanceof Unit && (attacker).canAmbush(defender);
  }
  static $clinit() {
    SimpleCombatModel.logger = Logger.getLogger($J.cls(SimpleCombatModel).getName());
    SimpleCombatModel.UNKNOWN_DEFENCE_MODIFIER = new Modifier()._Modifier$String$float$ModifierType('bogus', Modifier.UNKNOWN, Modifier$ModifierType.ADDITIVE);
  }
}

$J.define(SimpleCombatModel, 'net.sf.freecol.common.model.SimpleCombatModel', { kind: 'class', sup: 'net.sf.freecol.common.model.CombatModel', ctors: { '': '_SimpleCombatModel' }, meths: { 'getDefencePower(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.util.LogBuilder)': 'getDefencePower$FreeColGameObject$FreeColGameObject$LogBuilder', 'getDefencePower(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'getDefencePower$FreeColGameObject$FreeColGameObject', 'getOffencePower(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.util.LogBuilder)': 'getOffencePower$FreeColGameObject$FreeColGameObject$LogBuilder$SimpleCombatModel', 'getOffencePower(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'getOffencePower$FreeColGameObject$FreeColGameObject', 'calculateCombatOdds(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.util.LogBuilder)': 'calculateCombatOdds$FreeColGameObject$FreeColGameObject$LogBuilder', 'calculateCombatOdds(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'calculateCombatOdds$FreeColGameObject$FreeColGameObject' }, clinit: true, lazy: ['logger', 'UNKNOWN_DEFENCE_MODIFIER'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  CombatModel$CombatEffectType = $J.load('net.sf.freecol.common.model.CombatModel$CombatEffectType');
  CombatModel$CombatOdds = $J.load('net.sf.freecol.common.model.CombatModel$CombatOdds');
  CombatModel$CombatResult = $J.load('net.sf.freecol.common.model.CombatModel$CombatResult');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Modifier$ModifierType = $J.load('net.sf.freecol.common.model.Modifier$ModifierType');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
