// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerEurope.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JString, Logger } from '../../../../../../jre/index.ts';
import { Europe } from '../../common/model/Europe.ts';

let FreeColException, Ability, AbstractGoods, Europe$MigrationType, ChangeSet$See, GameOptions, IntegerOption, CollectionUtils, RandomChoice, RandomUtils, ServerUnit;

/**
 * The server version of Europe.
 */
export class ServerEurope extends Europe {
  static logger: Logger = null;
  /**
   * Trivial constructor for Game.newInstance.
   *
   * @param game The {@code Game} this object belongs to.
   * @param id The object identifier.
   */
  _ServerEurope$Game$String(game: Game, id: string): this {
    this._Europe$Game$String(game, id);
    return this;
  }
  /**
   * Creates a new ServerEurope.
   *
   * @param game The {@code Game} in which this object belongs.
   * @param owner The {@code Player} that will be using this object of
   *            {@code Europe}.
   */
  _ServerEurope$Game$Player(game: Game, owner: Player): this {
    this._Europe$Game$Player(game, owner);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  equipForRole(unit: Unit, role: Role, roleCount: number): boolean {
    if (!unit.roleIsAvailable(role)) {
      return false;
    }
    let req = unit.getGoodsDifference(role, roleCount);
    try {
      let price = this.priceGoods(req);
      if (price > 0 && !unit.getOwner().checkGold(price)) {
        return false;
      }
    } catch ($e0) {
      if ($J.isa($e0, FreeColException)) {
        let fce = $J.exc($e0);
        return false;
      } else {
        throw $e0;
      }
    }
    let owner = this.getOwner();
    for (const $it1 = (CollectionUtils.transform$Collection$Predicate(req, (g) => g.getAmount() < 0)).iterator(); $it1.hasNext(); ) {
      let ag = $it1.next();
      let rm = (owner).sellInEurope(null, null, ag.getType(), -ag.getAmount());
      if (rm > 0) {
        (owner).addExtraTrade(new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), rm));
      }
    }
    for (const $it2 = (CollectionUtils.transform$Collection$Predicate(req, ($p0) => $p0.isPositive())).iterator(); $it2.hasNext(); ) {
      let ag = $it2.next();
      let m = (owner).buyInEurope(null, null, ag.getType(), ag.getAmount());
      if (m > 0) {
        (owner).addExtraTrade(new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), -m));
      }
    }
    unit.changeRole(role, roleCount);
    return true;
  }
  /**
   * Generates the initial recruits for this player.  Recruits may
   * be determined by the difficulty level, or generated randomly.
   *
   * @param random A pseudo-random number source.
   */
  initializeMigration(random: Random): void {
    let spec = this.getGame().getSpecification();
    for (const $it3 = spec.getUnitList(GameOptions.IMMIGRANTS).iterator(); $it3.hasNext(); ) {
      let au = $it3.next();
      this.addRecruitable$AbstractUnit$boolean(au, true);
    }
    this.fillRecruitables(random);
  }
  /**
   * Fill out to the full amount of recruits.
   *
   * @param random A pseudo-random number source.
   */
  fillRecruitables(random: Random): void {
    let recruits = this.generateRecruitablesList();
    let unitType: UnitType;
    do {
      unitType = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(ServerEurope.logger, 'Recruits', recruits, random);
    } while (this.addRecruitable$UnitType$boolean(unitType, false));
  }
  /**
   * Increases the base price and lower cap for recruits.
   */
  increaseRecruitmentDifficulty(): void {
    let spec = this.getSpecification();
    this.baseRecruitPrice = (this.baseRecruitPrice + spec.getInteger(GameOptions.RECRUIT_PRICE_INCREASE)) | 0;
    this.recruitLowerCap = (this.recruitLowerCap + spec.getInteger(GameOptions.LOWER_CAP_INCREASE)) | 0;
  }
  /**
   * Extract the recruitable at a given slot, and replace it with
   * the given new recruitable type.
   *
   * Note that we shift the old units down, because the AI always
   * recruits from the lowest slot.
   *
   * @param slot The slot to recruit with.
   * @param random A pseudo-random number source.
   * @return The recruited {@code AbstractUnit}.
   */
  extractRecruitable(slot: number, random: Random): AbstractUnit {
    let count = Europe$MigrationType.getMigrantCount();
    let index = (Europe$MigrationType.specificMigrantSlot(slot)) ? Europe$MigrationType.migrantSlotToIndex(slot) : RandomUtils.randomInt(ServerEurope.logger, 'Choose emigrant', random, count);
    let expanded = this.getExpandedRecruitables(true);
    let result = expanded.removeAt(index);
    this.recruitables.clear();
    let top = expanded.removeAt(0);
    this.recruitables.add(top);
    for (const $it4 = expanded.iterator(); $it4.hasNext(); ) {
      let au = $it4.next();
      if ($J.equals(au.getId(), top.getId()) && $J.equals(au.getRoleId(), top.getRoleId())) {
        top.addToNumber(au.getNumber());
      } else {
        this.recruitables.add(au);
        top = au;
      }
    }
    this.fillRecruitables(random);
    return result;
  }
  /**
   * Generate a weighted list of unit types recruitable by this player.
   *
   * @return A weighted list of recruitable unit types.
   */
  generateRecruitablesList(): List<RandomChoice<UnitType>> {
    let owner = this.getOwner();
    return CollectionUtils.transform$Collection$Predicate$Function(this.getSpecification().getUnitTypeList(), (ut) => ut.isRecruitable() && owner.hasAbility$String$FreeColSpecObjectType(Ability.CAN_RECRUIT_UNIT, ut) && ut.isAvailableTo([owner]), (ut) => new RandomChoice()._RandomChoice(ut, ut.getRecruitProbability()));
  }
  /**
   * Replace any non-recruitable recruits.
   *
   * @param random A pseudo-random number source.
   * @return True if any recruit was replaced.
   */
  replaceRecruits(random: Random): boolean {
    let spec = this.getSpecification();
    let result = CollectionUtils.removeInPlace$Collection$Predicate(this.recruitables, (au) => !this.hasAbility$String$FreeColSpecObjectType(Ability.CAN_RECRUIT_UNIT, au.getType(spec)));
    this.fillRecruitables(random);
    return result;
  }
  /**
   * Generate new recruits following a Fountain of Youth discovery.
   *
   * FIXME: Get rid of this, it is only used because the AI is stupid.
   *
   * @param n The number of new units.
   * @param random A pseudo-random number source.
   * @return The generated units.
   */
  generateFountainRecruits(n: number, random: Random): List<Unit> {
    let game = this.getGame();
    let owner = this.getOwner();
    let ret = new ArrayList(n);
    let recruits = this.generateRecruitablesList();
    for (let k = 0; k < n; k++) {
      let ut = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(ServerEurope.logger, 'Choose FoY', recruits, random);
      ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, this, owner, ut));
    }
    return ret;
  }
  /**
   * Increases the price for a unit.
   *
   * @param unitType The {@code UnitType}, trained or purchased
   * @param price The current price of the unit
   */
  increasePrice(unitType: UnitType, price: number): void {
    let spec = this.getSpecification();
    let baseOption = GameOptions.PRICE_INCREASE_PER_TYPE;
    let option = (spec.getBoolean(baseOption)) ? 'model.option.priceIncrease.' + unitType.getSuffix$() : 'model.option.priceIncrease';
    let increase = (spec.hasOption(option, $J.cls(IntegerOption))) ? spec.getInteger(option) : 0;
    if (increase !== 0) {
      this.unitPrices.put(unitType, (price + increase) | 0);
    }
  }
  /**
   * Equip a unit for a specific role.
   *
   * @param unit The {@code Unit} to equip.
   * @param role The {@code Role} to equip for.
   * @param roleCount The role count.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the equipping succeeds.
   */
  csEquipForRole(unit: Unit, role: Role, roleCount: number, random: Random, cs: ChangeSet): boolean {
    let ret = this.equipForRole(unit, role, roleCount);
    if (ret) {
      let owner = this.getOwner();
      cs.addPartial(ChangeSet$See.only(owner), owner, ['gold', String(owner.getGold())]);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [unit]);
      (owner).flushExtraTrades(random);
      (owner).csFlushMarket$ChangeSet(cs);
    }
    return ret;
  }
  /**
   * New turn for this colony tile.
   *
   * FIXME: give Europe a shipyard and remove this?
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    lb.add([this]);
    for (const $it5 = (CollectionUtils.transform$Stream$Predicate(this.getUnits(), (u) => u.isNaval() && u.isDamaged())).iterator(); $it5.hasNext(); ) {
      let unit = $it5.next();
      (unit).csRepairUnit(cs);
    }
  }
  static $clinit() {
    ServerEurope.logger = Logger.getLogger($J.cls(ServerEurope).getName());
  }
}

$J.define(ServerEurope, 'net.sf.freecol.server.model.ServerEurope', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.Europe', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player': '_ServerEurope$Game$Player', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerEurope$Game$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
