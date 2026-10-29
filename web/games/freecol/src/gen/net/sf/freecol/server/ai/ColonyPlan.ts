// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/ColonyPlan.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, HashMap, HashSet, IllegalStateException, JEnum, JFunction, JObject, JString, Logger, RuntimeException } from '../../../../../../jre/index.ts';

let Ability, FreeColObject, GoodsContainer, GoodsType, Modifier, UnitChangeType, CollectionUtils, LogBuilder, WorkLocationPlan;

/**
 * Objects of this class describes the plan the AI has for a
 * {@code Colony}.
 *
 * A {@code ColonyPlan} contains a list of
 * {@link WorkLocationPlan}s which suggests the food and non-food
 * production of each {@link WorkLocation}, and a list of
 * {@link BuildableType}s to build.  It takes account of the available
 * tiles and building production, but does not make decisions to claim
 * tiles or change the current buildable.  It does takes account of
 * goods present in the colony, and overall colony size but not the
 * exact composition of the units involved.  However there is
 * extensive structure for making a trial assignment of workers in
 * {@link #assignWorkers}.
 *
 * {@link AIColony} is responsible for making
 * the real decisions.
 *
 * @see Colony
 */
export class ColonyPlan extends JObject {
  static logger: Logger = null;
  /**
   * Comparator to sort buildable by descending value.
   */
  static buildPlanComparator: Comparator<ColonyPlan$BuildPlan> = null;
  /**
   * Require production plans to always produce an amount exceeding this.
   */
  static readonly LOW_PRODUCTION_THRESHOLD: number = 1;
  /**
   * Number of turns to require production of without exhausting the
   * input goods.
   */
  static readonly PRODUCTION_TURNOVER_TURNS: number = 5;
  profileType: ColonyPlan$ProfileType = null;
  /**
   * Private copy of the AIMain.
   */
  aiMain: AIMain = null;
  /**
   * The colony this AIColony manages.
   */
  colony: Colony = null;
  buildPlans: List<ColonyPlan$BuildPlan> = null;
  /**
   * Plans for work locations available to this colony.
   */
  workPlans: List<WorkLocationPlan> = null;
  /**
   * The goods types to produce.
   */
  produce_: List<GoodsType> = null;
  /**
   * Sets of goods types to be produced in this colony.
   * Temporary variables that do not need to be serialized.
   * Note: food and luxury groups disabled as not currently used, but
   * will probably be needed in due course.  Raw building goods types
   * need to be sorted so they are a list.
   */
  libertyGoodsTypes: JSet<GoodsType> = null;
  immigrationGoodsTypes: JSet<GoodsType> = null;
  militaryGoodsTypes: JSet<GoodsType> = null;
  rawBuildingGoodsTypes: List<GoodsType> = null;
  buildingGoodsTypes: JSet<GoodsType> = null;
  rawLuxuryGoodsTypes: JSet<GoodsType> = null;
  otherRawGoodsTypes: JSet<GoodsType> = null;
  static readonly BREEDING_WEIGHT: number = 0.1;
  static readonly BUILDING_WEIGHT: number = 0.9;
  static readonly DEFENCE_WEIGHT: number = 0.1;
  static readonly EXPORT_WEIGHT: number = 0.6;
  static readonly FISH_WEIGHT: number = 0.25;
  static readonly FORTIFY_WEIGHT: number = 0.3;
  static readonly IMMIGRATION_WEIGHT: number = 0.05;
  static readonly LIBERTY_WEIGHT: number = 0.75;
  static readonly MILITARY_WEIGHT: number = 0.4;
  static readonly PRODUCTION_WEIGHT: number = 0.25;
  static readonly REPAIR_WEIGHT: number = 0.1;
  static readonly STORAGE_WEIGHT: number = 0.85;
  static readonly TEACH_WEIGHT: number = 0.2;
  static readonly TRANSPORT_WEIGHT: number = 0.15;
  /**
   * Creates a new {@code ColonyPlan}.
   *
   * @param aiMain The main AI-object.
   * @param colony The colony to make a {@code ColonyPlan} for.
   */
  _ColonyPlan(aiMain: AIMain, colony: Colony): this {
    this.buildPlans = new ArrayList();
    this.workPlans = new ArrayList();
    this.produce_ = new ArrayList();
    this.libertyGoodsTypes = new HashSet();
    this.immigrationGoodsTypes = new HashSet();
    this.militaryGoodsTypes = new HashSet();
    this.rawBuildingGoodsTypes = new ArrayList();
    this.buildingGoodsTypes = new HashSet();
    this.rawLuxuryGoodsTypes = new HashSet();
    this.otherRawGoodsTypes = new HashSet();
    if (aiMain == null) {
      throw new RuntimeException('Null AIMain: ' + $J.str(this));
    }
    if (colony == null) {
      throw new RuntimeException('Null colony: ' + $J.str(this));
    }
    this.aiMain = aiMain;
    this.colony = colony;
    this.profileType = ColonyPlan$ProfileType.getProfileTypeFromSize(colony.getUnitCount());
    return this;
  }
  /**
   * Gets the main AI-object.
   *
   * @return The main AI-object.
   */
  getAIMain(): AIMain {
    return this.aiMain;
  }
  /**
   * Gets the specification.
   *
   * @return The specification.
   */
  spec(): Specification {
    return this.aiMain.getGame().getSpecification();
  }
  /**
   * Gets the preferred goods to produce.
   *
   * @return A copy of the preferred goods production list in this plan.
   */
  getPreferredProduction(): List<GoodsType> {
    return new ArrayList(this.produce_);
  }
  /**
   * Gets a copy of the current list of buildable types associated
   * with this {@code ColonyPlan}.
   *
   * @return A copy of the of {@code BuildableType}s list.
   */
  getBuildableTypes(): List<BuildableType> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.buildPlans, CollectionUtils.alwaysTrue(), (bp) => bp.type);
  }
  /**
   * Gets the best buildable type from this plan that can currently
   * be built by the colony.
   *
   * @return The best current {@code BuildableType}.
   */
  getBestBuildableType(): BuildableType {
    let bp = CollectionUtils.find$Collection$Predicate(this.buildPlans, (p) => this.colony.canBuild$BuildableType(p.type));
    return (bp == null) ? null : bp.type;
  }
  /**
   * Get a report on the build plans.
   *
   * @return A build plan report.
   */
  getBuildableReport(): string {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['Buildables:\n']);
    for (const $it0 = this.buildPlans.iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      lb.add([b, '\n']);
    }
    return lb.toString();
  }
  /**
   * Gets the food-producing and non-autoproducing work location
   * plans associated with this {@code ColonyPlan}.
   *
   * @return A list of food producing plans.
   */
  getFoodPlans(): List<WorkLocationPlan> {
    return CollectionUtils.transform$Collection$Predicate(this.workPlans, (wp) => wp.isFoodPlan() && !wp.getWorkLocation().canAutoProduce());
  }
  /**
   * Gets the non-food-producing/non-autoproducing work location
   * plans associated with this {@code ColonyPlan}.
   *
   * @return A list of non-food producing plans.
   */
  getWorkPlans(): List<WorkLocationPlan> {
    return CollectionUtils.transform$Collection$Predicate(this.workPlans, (wp) => !wp.isFoodPlan() && !wp.getWorkLocation().canAutoProduce());
  }
  /**
   * Refines this plan given the colony choice of what to build.
   *
   * @param build The {@code BuildableType} to be built (may be null).
   * @param lb A {@code LogBuilder} to log to.
   */
  refine(build: BuildableType, lb: LogBuilder): void {
    let required = CollectionUtils.transform$Collection$Predicate$Function(this.colony.getFullRequiredGoods(build), CollectionUtils.alwaysTrue(), ($p0) => $p0.getType());
    let suppressed = new HashMap();
    let plans = new ArrayList(this.workPlans);
    let offset = 0;
    for (let i = 0; i < plans.size(); i++) {
      let wls: List<WorkLocationPlan>;
      let wlp = plans.get(i);
      let g = wlp.getGoodsType();
      if ((this.rawBuildingGoodsTypes.contains(g) && !required.contains(g.getOutputType())) || (this.buildingGoodsTypes.contains(g) && !required.contains(g))) {
        this.workPlans.removeAt((i - offset) | 0);
        offset++;
        wls = suppressed.get(g);
        if (wls == null) {
          wls = new ArrayList();
        }
        wls.add(0, wlp);
        suppressed.put(g, wls);
        this.produce_.remove(g);
        lb.add([', suppress production of ', g]);
      } else if (g.isRefined() && (this.rawBuildingGoodsTypes.contains(g.getInputType()) || this.buildingGoodsTypes.contains(g.getInputType()))) {
        let n = 0;
        let idx = this.produce_.indexOf(g);
        for (let type$ = g.getInputType(); type$ != null; type$ = type$.getInputType()) {
          if ((wls = suppressed.get(type$)) == null) {
            break;
          }
          if (this.colony.getGoodsCount(type$) >= $J.idiv(GoodsContainer.CARGO_SIZE, 2)) {
            break;
          }
          n = (n + wls.size()) | 0;
          while (!wls.isEmpty()) {
            this.workPlans.add((i - offset) | 0, wls.removeAt(0));
          }
          this.produce_.add(idx, type$);
          lb.add([', restore production of ', type$]);
        }
        offset = (offset - n) | 0;
      }
    }
  }
  /**
   * Recreates the buildables and work location plans for this
   * colony.
   */
  update(): void {
    this.profileType = ColonyPlan$ProfileType.getProfileTypeFromSize(this.colony.getUnitCount());
    let production = this.createProductionMap();
    this.updateGoodsTypeLists(production);
    this.updateRawMaterials(production);
    this.updateBuildableTypes();
    this.updatePlans(production);
  }
  /**
   * Creates a map of potential production of all goods types
   * from all available work locations using the default unit type.
   * Includes non-workable locations (e.g. chapel, colony-center-tile)
   * as their production can influence the choice of goods to produce.
   *
   * @return The map of potential production.
   */
  createProductionMap(): JMap<GoodsType, JMap<WorkLocation, number>> {
    let production = new HashMap();
    for (const $it1 = this.colony.getAvailableWorkLocationsList().iterator(); $it1.hasNext(); ) {
      let wl = $it1.next();
      for (const $it2 = this.spec().getGoodsTypeList().iterator(); $it2.hasNext(); ) {
        let g = $it2.next();
        let p = wl.getGenericPotential(g);
        if (p > 0) {
          let m = production.get(g);
          if (m == null) {
            m = new HashMap();
            production.put(g, m);
          }
          m.put(wl, p);
        }
      }
    }
    return production;
  }
  /**
   * Updates the goods type lists.  The categories are:<UL>
   * <LI>food</LI>
   * <LI>liberty</LI>
   * <LI>immigration</LI>
   * <LI>military</LI>
   * <LI>raw building</LI>
   * <LI>building</LI>
   * <LI>raw luxury</LI>
   * <LI>luxury</LI>
   * <LI>raw other</LI>
   * </UL>
   *
   * Ignore raw materials which can not be refined and refined goods
   * that have no raw materials available.  Also ignore other goods
   * that do not fit these categories (e.g. trade goods).
   *
   * @param production The production map.
   */
  updateGoodsTypeLists(production: JMap<GoodsType, JMap<WorkLocation, number>>): void {
    this.libertyGoodsTypes.clear();
    this.immigrationGoodsTypes.clear();
    this.militaryGoodsTypes.clear();
    this.rawBuildingGoodsTypes.clear();
    this.buildingGoodsTypes.clear();
    this.rawLuxuryGoodsTypes.clear();
    this.otherRawGoodsTypes.clear();
    for (const $it3 = new ArrayList(production.keySet()).iterator(); $it3.hasNext(); ) {
      let g = $it3.next();
      if (g.isFoodType()) {
      } else if (g.isLibertyType()) {
        this.libertyGoodsTypes.add(g);
      } else if (g.isImmigrationType()) {
        this.immigrationGoodsTypes.add(g);
      } else if (g.getMilitary()) {
        this.militaryGoodsTypes.add(g);
      } else if (g.isRawBuildingMaterial()) {
        if (g.isRawMaterialForUnstorableBuildingMaterial()) {
          this.rawBuildingGoodsTypes.add(g);
        }
      } else if (g.isBuildingMaterial() && g.getInputType().isRawBuildingMaterial()) {
        if (!g.isStorable()) {
          this.buildingGoodsTypes.add(g);
        }
      } else if (g.isNewWorldGoodsType()) {
        this.rawLuxuryGoodsTypes.add(g);
      } else if (g.isRefined() && g.getInputType().isNewWorldGoodsType()) {
      } else if (g.isFarmed()) {
        this.otherRawGoodsTypes.add(g);
      } else {
        ColonyPlan.logger.warning('Ignoring goods type ' + $J.str(g) + ' at ' + this.colony.getName());
        production.remove(g);
      }
    }
  }
  /**
   * Chooses the two best raw materials, updating the production
   * map and lists.
   *
   * FIXME: scale with colony size.
   *
   * @param production The production map.
   */
  updateRawMaterials(production: JMap<GoodsType, JMap<WorkLocation, number>>): void {
    let player = this.colony.getOwner();
    let market = player.getMarket();
    let nationType = player.getNationType();
    let primaryRawMaterial = null;
    let secondaryRawMaterial = null;
    let primaryValue = -1;
    let secondaryValue = -1;
    this.produce_.clear();
    let rawMaterials = new ArrayList(this.rawLuxuryGoodsTypes);
    rawMaterials.addAll(this.otherRawGoodsTypes);
    for (const $it4 = rawMaterials.iterator(); $it4.hasNext(); ) {
      let g = $it4.next();
      let value = CollectionUtils.sum$Collection$ToIntFunction(production.get(g).entrySet(), ($p0) => $p0.getValue());
      if (value <= ColonyPlan.LOW_PRODUCTION_THRESHOLD) {
        production.remove(g);
        continue;
      }
      if (market != null) {
        if (g.getOutputType() == null) {
          value = Math.imul(value, market.getSalePrice$GoodsType$int(g, 1));
        } else if (production.containsKey(g.getOutputType())) {
          value = Math.imul(value, $J.idiv(((market.getSalePrice$GoodsType$int(g, 1) + market.getSalePrice$GoodsType$int(g.getOutputType(), 1)) | 0), 2));
        }
      }
      if (nationType.hasModifier$String(g.getId())) {
        value = $J.idiv((Math.imul(value, 12)), 10);
      }
      if (value > secondaryValue && secondaryRawMaterial != null) {
        production.remove(secondaryRawMaterial);
        production.remove(secondaryRawMaterial.getOutputType());
        if (this.rawLuxuryGoodsTypes.remove(secondaryRawMaterial)) {
        } else {
          this.otherRawGoodsTypes.remove(secondaryRawMaterial);
        }
      }
      if (value > primaryValue) {
        secondaryRawMaterial = primaryRawMaterial;
        secondaryValue = primaryValue;
        primaryRawMaterial = g;
        primaryValue = value;
      } else if (value > secondaryValue) {
        secondaryRawMaterial = g;
        secondaryValue = value;
      }
    }
    if (primaryRawMaterial != null) {
      this.produce_.add(primaryRawMaterial);
      if (primaryRawMaterial.getOutputType() != null) {
        this.produce_.add(primaryRawMaterial.getOutputType());
      }
      if (secondaryRawMaterial != null) {
        this.produce_.add(secondaryRawMaterial);
        if (secondaryRawMaterial.getOutputType() != null) {
          this.produce_.add(secondaryRawMaterial.getOutputType());
        }
      }
    }
  }
  /**
   * Finds a build plan for this type.
   *
   * @param type The {@code BuildableType} to search for.
   * @return A {@code BuildPlan} with this type, or null if not found.
   */
  findBuildPlan(type$: BuildableType): ColonyPlan$BuildPlan {
    return CollectionUtils.find$Collection$Predicate(this.buildPlans, (bp) => bp.type === type$);
  }
  /**
   * Adds or improves the priority of a buildable in a list.
   *
   * @param type The {@code BuildableType} to use.
   * @param weight The relative weight of this class of buildable with
   *     respect to other buildable classes.
   * @param support The support for this buildable within its class.
   * @return True if this type was prioritized.
   */
  prioritize(type$: BuildableType, weight: number, support: number): boolean {
    let bp = this.findBuildPlan(type$);
    if (bp == null) {
      this.buildPlans.add(new ColonyPlan$BuildPlan()._ColonyPlan$BuildPlan(type$, weight, support));
      return true;
    }
    if (bp.weight * bp.support < weight * support) {
      bp.weight = weight;
      bp.support = support;
      return true;
    }
    return false;
  }
  /**
   * Given a buildable that improves production of a goods type,
   * prioritize it.
   *
   * @param type The {@code BuildableType} to consider.
   * @param goodsType The {@code GoodsType} improved by the buildable.
   * @return True if this type was prioritized.
   */
  prioritizeProduction(type$: BuildableType, goodsType: GoodsType): boolean {
    let player = this.colony.getOwner();
    let nationType = player.getNationType();
    let advantage = this.getAIMain().getAIPlayer(player).getAIAdvantage();
    let ret = false;
    let factor = 1;
    if (nationType.hasModifier$String(goodsType.getId())) {
      factor *= 1.2;
    }
    if (goodsType.getMilitary()) {
      if ($J.equals('conquest', advantage)) {
        factor = 1.2;
      }
      ret = this.prioritize(type$, ColonyPlan.MILITARY_WEIGHT * factor, 1);
    } else if (goodsType.isBuildingMaterial() && !goodsType.isStorable()) {
      ret = this.prioritize(type$, ColonyPlan.BUILDING_WEIGHT * factor, 1);
    } else if (goodsType.isLibertyType()) {
      if (player.isREF()) {
        return false;
      }
      ret = this.prioritize(type$, ColonyPlan.LIBERTY_WEIGHT, (this.colony.getSonsOfLiberty() >= 100) ? 0.01 : 1);
    } else if (goodsType.isImmigrationType()) {
      if ($J.equals('immigration', advantage)) {
        factor = 1.2;
      }
      ret = this.prioritize(type$, ColonyPlan.IMMIGRATION_WEIGHT * factor, 1);
    } else if (this.produce_.contains(goodsType)) {
      if ($J.equals('trade', advantage)) {
        factor = 1.2;
      }
      let f = 0.1 * this.colony.getTotalProductionOf(goodsType.getInputType());
      ret = this.prioritize(type$, ColonyPlan.PRODUCTION_WEIGHT * factor, f);
    }
    return ret;
  }
  /**
   * Updates the build plans for this colony.
   */
  updateBuildableTypes(): void {
    let euaip = this.getAIMain().getAIPlayer(this.colony.getOwner());
    let advantage = euaip.getAIAdvantage();
    this.buildPlans.clear();
    let maxLevel: number;
    switch (this.profileType) {
      case ColonyPlan$ProfileType.OUTPOST:
      case ColonyPlan$ProfileType.SMALL:
        maxLevel = 1;
        break;
      case ColonyPlan$ProfileType.MEDIUM:
        maxLevel = 2;
        break;
      case ColonyPlan$ProfileType.LARGE:
        maxLevel = 3;
        break;
      case ColonyPlan$ProfileType.CAPITAL:
        maxLevel = 4;
        break;
      default:
        throw new IllegalStateException('Bogus profile type: ' + $J.str(this.profileType));
    }
    let player = this.colony.getOwner();
    for (const $it5 = (CollectionUtils.transform$Collection$Predicate(this.spec().getBuildingTypeList(), (bt) => this.colony.canBuild$BuildableType(bt))).iterator(); $it5.hasNext(); ) {
      let type$ = $it5.next();
      let expectFail = false;
      if (type$.hasModifier$String(Modifier.DEFENCE)) {
        let factor = 1;
        if ($J.equals('conquest', advantage)) {
          factor = 1.1;
        }
        this.prioritize(type$, ColonyPlan.FORTIFY_WEIGHT * factor, 1);
      }
      if (type$.hasAbility$String(Ability.EXPORT)) {
        let factor = 1;
        if ($J.equals('trade', advantage)) {
          factor = 1.1;
        }
        this.prioritize(type$, ColonyPlan.EXPORT_WEIGHT * factor, 1);
      }
      if (type$.getLevel() > maxLevel) {
        continue;
      }
      if (type$.hasAbility$String(Ability.PRODUCE_IN_WATER)) {
        let factor = 0;
        if (!this.colony.hasAbility$String(Ability.PRODUCE_IN_WATER) && this.colony.getTile$().isShore()) {
          let landFood = 0;
          let seaFood = 0;
          for (const $it6 = (CollectionUtils.transform$Collection$Predicate(this.colony.getTile$().getSurroundingTiles$int$int(1, 1), (t2) => (t2.getOwningSettlement() === this.colony || player.canClaimForSettlement(t2)))).iterator(); $it6.hasNext(); ) {
            let t = $it6.next();
            for (const $it7 = t.getSortedPotential$().iterator(); $it7.hasNext(); ) {
              let ag = $it7.next();
              if (ag.isFoodType()) {
                if (t.isLand()) {
                  landFood = (landFood + ag.getAmount()) | 0;
                } else {
                  seaFood = (seaFood + ag.getAmount()) | 0;
                }
              }
            }
          }
          factor = (((seaFood + landFood) | 0) === 0) ? 0 : seaFood / ((seaFood + landFood) | 0);
        }
        this.prioritize(type$, ColonyPlan.FISH_WEIGHT, factor);
      }
      if (type$.hasAbility$String(Ability.BUILD)) {
        let factor = ($J.equals('building', advantage)) ? 1.1 : 1;
        let support = (CollectionUtils.any$Stream$Predicate(type$.getAbilities$String(Ability.BUILD), ($p0) => $p0.hasScope())) ? 0.1 : 1;
        this.prioritize(type$, ColonyPlan.BUILDING_WEIGHT * factor, support);
      }
      if (type$.hasAbility$String(Ability.TEACH)) {
        this.prioritize(type$, ColonyPlan.TEACH_WEIGHT, 1);
      }
      if (type$.hasAbility$String(Ability.REPAIR_UNITS)) {
        let factor = 1;
        if ($J.equals('naval', advantage)) {
          factor = 1.1;
        }
        this.prioritize(type$, ColonyPlan.REPAIR_WEIGHT * factor, 1);
      }
      let output = type$.getProducedGoodsType();
      if (output != null) {
        if (!this.prioritizeProduction(type$, output)) {
          expectFail = true;
        }
      } else {
        for (const $it8 = this.spec().getGoodsTypeList().iterator(); $it8.hasNext(); ) {
          let g = $it8.next();
          if (type$.hasModifier$String(g.getId())) {
            if (!this.prioritizeProduction(type$, g)) {
              expectFail = true;
            }
          }
        }
        if (type$.hasModifier$String(Modifier.WAREHOUSE_STORAGE)) {
          let factor = 1;
          if ($J.equals('trade', advantage)) {
            factor = 1.1;
          }
          this.prioritize(type$, ColonyPlan.STORAGE_WEIGHT * factor, 1);
        }
        if (type$.hasModifier$String(Modifier.BREEDING_DIVISOR)) {
          this.prioritize(type$, ColonyPlan.BREEDING_WEIGHT, 1);
        }
      }
      if (!expectFail && this.findBuildPlan(type$) == null) {
        ColonyPlan.logger.warning('No building priority found for: ' + $J.str(type$));
      }
    }
    let wagonNeed = 0;
    if (!this.colony.isConnectedPort()) {
      let wagons = euaip.getNeededWagons(this.colony.getTile$());
      wagonNeed = (wagons <= 0) ? 0 : (wagons > 3) ? 1 : wagons / 3;
    }
    for (const $it9 = (CollectionUtils.transform$Collection$Predicate(this.spec().getUnitTypeList(), (ut) => this.colony.canBuild$BuildableType(ut))).iterator(); $it9.hasNext(); ) {
      let unitType = $it9.next();
      if (unitType.hasAbility$String(Ability.NAVAL_UNIT)) {
      } else if (unitType.isDefensive()) {
        if (euaip.needsMoreArtillery()) {
          this.prioritize(unitType, ColonyPlan.DEFENCE_WEIGHT, 1);
        }
      } else if (wagonNeed > 0 && unitType.hasAbility$String(Ability.CARRY_GOODS)) {
        let factor = 1;
        if ($J.equals('trade', advantage)) {
          factor = 1.1;
        }
        this.prioritize(unitType, ColonyPlan.TRANSPORT_WEIGHT * factor, wagonNeed);
      }
    }
    for (const $it10 = this.buildPlans.iterator(); $it10.hasNext(); ) {
      let bp = $it10.next();
      let difficulty = CollectionUtils.sum$Stream$Predicate$ToIntFunction(bp.type.getRequiredGoods$(), (ag) => ag.getAmount() > this.colony.getGoodsCount(ag.getType()), (ag) => {
        let type$ = ag.getType();
        return Math.imul(((ag.getAmount() - this.colony.getGoodsCount(type$)) | 0), ((this.produce_.contains(type$.getInputType())) ? 1 : 5));
      });
      bp.difficulty = Math.max(1, Math.sqrt(difficulty));
    }
    this.buildPlans.sort(ColonyPlan.buildPlanComparator);
  }
  /**
   * Makes a plan for each type of possible production, that is
   * those work locations that can use a unit or can auto-produce.
   * Note that this will almost certainly include clashes over work
   * locations.  That gets sorted out elsewhere as ColonyPlans do
   * not examine the units present.
   *
   * With the complete list of work plans, finish creating the list
   * of goods to produce.
   *
   * Then filter out the auto-production plans as they are not
   * going to be helpful for unit allocation.
   *
   * Finally sort by desirability.
   *
   * @param production A map of the goods type and production.
   */
  updatePlans(production: JMap<GoodsType, JMap<WorkLocation, number>>): void {
    this.workPlans.clear();
    let fullPred = (e) => {
      let g = e.getKey();
      return !g.isStorable() || g.limitIgnored() || this.colony.getGoodsCount(g) < this.colony.getWarehouseCapacity();
    };
    CollectionUtils.forEachMapEntry$Map$Predicate$Consumer(production, fullPred, (e) => {
      for (const $it11 = (CollectionUtils.transform$Collection$Predicate(e.getValue().keySet(), (w) => (w.canBeWorked() || w.canAutoProduce()))).iterator(); $it11.hasNext(); ) {
        let wl = $it11.next();
        this.workPlans.add(new WorkLocationPlan()._WorkLocationPlan(this.getAIMain(), wl, e.getKey()));
      }
    });
    this.updateProductionList(production);
    let oldPlans = new ArrayList(this.workPlans);
    this.workPlans.clear();
    this.workPlans.addAll(CollectionUtils.transform$Collection$Predicate(oldPlans, (w) => w.getWorkLocation().canBeWorked()));
    let comp = Comparator.thenComparing(Comparator.thenComparingInt((CollectionUtils.cachingIntComparator((wp) => {
      let gt = wp.getGoodsType();
      let i = this.produce_.indexOf(gt);
      return (i < 0 && !gt.isFoodType()) ? 99999 : i;
    })), (wp) => {
      return Math.imul(wp.getWorkLocation().getGenericPotential(wp.getGoodsType()), -1);
    }), ($p0) => $p0.getGoodsType(), GoodsType.goodsTypeComparator);
    this.workPlans.sort(comp);
  }
  /**
   * Add the other goods types to the production list.  When this is
   * called the new world goods production is already present on the
   * produce list.  Ignores food which is treated separately.
   *
   * @param production A map of the production.
   */
  updateProductionList(production: JMap<GoodsType, JMap<WorkLocation, number>>): void {
    let productionComparator = Comparator.reversed((CollectionUtils.cachingIntComparator((gt) => CollectionUtils.sum$Collection$ToIntFunction(production.get(gt).values(), ($p0) => (+$p0)))));
    if (this.colony.getSonsOfLiberty() < 100) {
      this.produce_.addAll(0, CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.libertyGoodsTypes, (gt) => production.containsKey(gt), JFunction.identity(), productionComparator));
    }
    this.rawBuildingGoodsTypes.sort(productionComparator);
    let indexer = (gt) => this.rawBuildingGoodsTypes.indexOf(gt.getInputType());
    let toAdd = new ArrayList();
    toAdd.addAll(CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.buildingGoodsTypes, (gt) => production.containsKey(gt) && (this.colony.getGoodsCount(gt.getInputType()) >= $J.idiv(GoodsContainer.CARGO_SIZE, 2) || production.containsKey(gt.getInputType())), JFunction.identity(), Comparator.reversed(Comparator.comparingInt(indexer))));
    for (let i = (toAdd.size() - 1) | 0; i >= 0; i--) {
      let make = toAdd.get(i);
      let raw = make.getInputType();
      if (production.containsKey(raw)) {
        if (this.colony.getGoodsCount(raw) >= $J.idiv(GoodsContainer.CARGO_SIZE, 2)) {
          this.produce_.add(raw);
          this.produce_.add(0, make);
        } else {
          this.produce_.add(0, make);
          this.produce_.add(0, raw);
        }
      } else {
        this.produce_.add(0, make);
      }
    }
    this.produce_.addAll(CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.militaryGoodsTypes, (gt) => production.containsKey(gt), JFunction.identity(), productionComparator));
    if (this.colony.getOwner().getEurope() != null) {
      this.produce_.addAll(CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.immigrationGoodsTypes, (gt) => production.containsKey(gt), JFunction.identity(), productionComparator));
    }
  }
  /**
   * Finds a plan on a list that produces a given goods type.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param plans The list of {@code WorkLocationPlan}s to check.
   * @return The first plan found that produces the goods type, or null
   *     if none found.
   */
  findPlan(goodsType: GoodsType, plans: List<WorkLocationPlan>): WorkLocationPlan {
    return CollectionUtils.find$Collection$Predicate(plans, (wlp) => wlp.getGoodsType() === goodsType);
  }
  /**
   * Gets the best worker to execute a work location plan.
   * - The most productive one wins (which will automatically pick a
   *   relevant expert).
   * - If they are all relevant experts, pick any.
   * - Pick the unit that can upgrade to the required expert with the most
   *     relevant experience or least irrelevant expertise.
   * - Pick a unit that can not upgrade at all.
   * - Pick an otherwise upgradeable unit with the most relevant experience
   *     or least irrelevant experience.
   * - Pick the least skillful unit.
   *
   * Public for the benefit of the test suite.
   *
   * @param wl The {@code WorkLocation} to work at.
   * @param goodsType The {@code GoodsType} to make.
   * @param workers A list of potential {@code Unit}s to try.
   * @return The best worker for the job.
   */
  static getBestWorker(wl: WorkLocation, goodsType: GoodsType, workers: List<Unit>): Unit {
    if (workers == null || workers.isEmpty()) {
      return null;
    }
    let colony = wl.getColony();
    let outputType = (goodsType.isStoredAs()) ? goodsType.getStoredAs() : goodsType;
    if (workers.size() === 1) {
      let u = workers.get(0);
      if (!wl.canAdd(u)) {
        return null;
      }
      let oldLoc = u.getLocation();
      let oldWork = u.getWorkType();
      u.setLocation(wl);
      u.changeWorkType(goodsType);
      let production = wl.getProductionOf(u, goodsType);
      u.setLocation(oldLoc);
      u.changeWorkType(oldWork);
      return (production > 0) ? u : null;
    }
    let todo = new ArrayList(workers);
    let best = new ArrayList();
    let bestValue = colony.getAdjustedNetProductionOf(outputType);
    let special = null;
    best.clear();
    for (const $it12 = (CollectionUtils.transform$Collection$Predicate(todo, (u2) => wl.canAdd(u2))).iterator(); $it12.hasNext(); ) {
      let u = $it12.next();
      let oldLoc = u.getLocation();
      let oldWork = u.getWorkType();
      u.setLocation(wl);
      u.changeWorkType(goodsType);
      let value = colony.getAdjustedNetProductionOf(outputType);
      if (value > bestValue) {
        bestValue = value;
        best.clear();
        best.add(u);
        if (u.getType().getExpertProduction() === goodsType) {
          special = u;
        }
      } else if (value === bestValue && !best.isEmpty()) {
        best.add(u);
        if (u.getType().getExpertProduction() === goodsType) {
          special = u;
        }
      }
      u.setLocation(oldLoc);
      u.changeWorkType(oldWork);
    }
    switch (best.size()) {
      case 0:
        return null;
      case 1:
        return best.get(0);
      default:
        todo.clear();
        todo.addAll(best);
        break;
    }
    if (special != null) {
      return special;
    }
    let spec = colony.getSpecification();
    let expert = spec.getExpertForProducing(goodsType);
    best.clear();
    bestValue = -2147483648;
    for (const $it13 = todo.iterator(); $it13.hasNext(); ) {
      let u = $it13.next();
      let relevant = u.getWorkType() === goodsType;
      let score = (relevant) ? u.getExperience() : -u.getExperience();
      if (expert != null && u.getUnitChange$String$UnitType(UnitChangeType.EXPERIENCE, expert) != null) {
        score = (score + 10000) | 0;
      } else if (expert != null && u.getUnitChange$String(UnitChangeType.EXPERIENCE) != null) {
        score = (score - 10000) | 0;
      }
      if (score > bestValue) {
        best.clear();
        best.add(u);
        bestValue = score;
      } else if (score === bestValue) {
        best.add(u);
      }
    }
    switch (best.size()) {
      case 0:
        break;
      case 1:
        return best.get(0);
      default:
        todo.clear();
        todo.addAll(best);
        break;
    }
    let worstSkill = 2147483647;
    special = null;
    for (const $it14 = todo.iterator(); $it14.hasNext(); ) {
      let u = $it14.next();
      if (u.getType().getSkill() < worstSkill) {
        special = u;
        worstSkill = u.getType().getSkill();
      }
    }
    return special;
  }
  /**
   * Equips a unit for a role, trying all possibilities if a military role
   * was called for.
   *
   * @param spec The {@code Specification} defining the roles.
   * @param unit The {@code Unit} to equip if possible.
   * @param role The {@code Role} for the unit to take.
   * @param colony The {@code Colony} storing the equipment.
   * @return True if the unit was equipped.
   */
  static fullEquipUnit(spec: Specification, unit: Unit, role: Role, colony: Colony): boolean {
    return colony.equipForRole(unit, role, role.getMaximumCount());
  }
  /**
   * Tries to apply a colony plan given a list of workers.
   *
   * @param workers A list of {@code Unit}s to assign.
   * @param preferScout Prefer to make scouts rather than soldiers.
   * @param lb A {@code LogBuilder} to log to.
   * @return A scratch colony with the workers in place.
   */
  assignWorkers(workers: List<Unit>, preferScout: boolean, lb: LogBuilder): Colony {
    let foodType = this.spec().getPrimaryFoodType();
    let produce = this.getPreferredProduction();
    let foodPlans = this.getFoodPlans();
    let workPlans = this.getWorkPlans();
    let col = this.colony.copyColony();
    let tile = col.getTile$();
    let otherWorkers = new ArrayList(workers);
    workers.clear();
    for (const $it15 = otherWorkers.iterator(); $it15.hasNext(); ) {
      let u = $it15.next();
      workers.add(col.getCorresponding(u));
    }
    for (const $it16 = workers.iterator(); $it16.hasNext(); ) {
      let u = $it16.next();
      u.setLocation(tile);
      col.equipForRole(u, this.spec().getDefaultRole(), 0);
    }
    let outdoorRoles = [this.spec().getRoleWithAbility(Ability.IMPROVE_TERRAIN, null), null, this.spec().getRoleWithAbility(Ability.SPEAK_WITH_CHIEF, null)];
    if (preferScout) {
      let tmp = outdoorRoles[1];
      outdoorRoles[1] = outdoorRoles[2];
      outdoorRoles[2] = tmp;
    }
    for (let outdoorRole of outdoorRoles) {
      for (const $it17 = new ArrayList(workers).iterator(); $it17.hasNext(); ) {
        let u = $it17.next();
        if (workers.size() <= 1) {
          break;
        }
        let role = outdoorRole;
        if (role == null) {
          for (const $it18 = u.getSortedMilitaryRoles().iterator(); $it18.hasNext(); ) {
            let r = $it18.next();
            if (u.getType() === r.getExpertUnit() && ColonyPlan.fullEquipUnit(this.spec(), u, r, col)) {
              workers.remove(u);
              lb.add([u.getId(), '(', u.getType().getSuffix$(), ') -> ', r.getSuffix$(), '\n']);
              break;
            }
          }
        } else if (u.getType() === role.getExpertUnit() && ColonyPlan.fullEquipUnit(this.spec(), u, role, col)) {
          workers.remove(u);
          lb.add([u.getId(), '(', u.getType().getSuffix$(), ') -> ', role.getSuffix$(), '\n']);
        }
      }
    }
    let soldierComparator = Comparator.thenComparingInt(Comparator.reversed(Comparator.thenComparingInt(Comparator.thenComparingInt((Comparator.comparingInt(($p0) => $p0.getSkillLevel())), (u) => (u.getType().getExpertProduction() == null) ? 1 : 0), (u) => produce.indexOf(u.getType().getExpertProduction()))), ($p0) => $p0.getExperience());
    let buildGoods = new ArrayList();
    let build = col.getCurrentlyBuilding();
    if (build != null) {
      buildGoods.addAll(build.getRequiredGoodsList$());
    }
    let wlps: List<WorkLocationPlan>;
    let wlp: WorkLocationPlan;
    let done = false;
    while (!done && !workers.isEmpty()) {
      wlps = null;
      wlp = null;
      if (col.getAdjustedNetProductionOf(foodType) > 0) {
        wlps = workPlans;
        while (!produce.isEmpty()) {
          if ((wlp = this.findPlan(produce.get(0), workPlans)) != null) {
            break;
          }
          produce.removeAt(0);
        }
      }
      let best: Unit;
      let wl: WorkLocation;
      let goodsType: GoodsType;
      for (; ; ) {
        if (wlp == null) {
          if (foodPlans.isEmpty()) {
            lb.add(['    Food plans exhausted\n']);
            done = true;
            break;
          }
          wlps = foodPlans;
          wlp = wlps.get(0);
        }
        let err = null;
        goodsType = wlp.getGoodsType();
        wl = col.getCorresponding(wlp.getWorkLocation());
        best = null;
        lb.add(['    ', LogBuilder.wide(2, [col.getUnitCount()]), ': ', LogBuilder.wide(-15, [goodsType.getSuffix$()]), '@', LogBuilder.wide(25, [this.locationDescription(wl)]), ' => ']);
        if (!wl.canBeWorked()) {
          err = 'can not be worked';
        } else if (wl.isFull()) {
          err = 'full';
        } else if ((best = ColonyPlan.getBestWorker(wl, goodsType, workers)) == null) {
          err = 'no worker found';
        }
        if (err != null) {
          wlps.remove(wlp);
          lb.add([err, '\n']);
          break;
        }
        best.setLocation(wl);
        if (col.getProductionBonus() < 0) {
          best.setLocation(tile);
          done = true;
          lb.add(['    broke production bonus\n']);
          break;
        }
        if (col.getAdjustedNetProductionOf(foodType) < 0) {
          let net = col.getAdjustedNetProductionOf(foodType);
          let count = col.getGoodsCount(foodType);
          if ($J.idiv(count, -net) < ColonyPlan.PRODUCTION_TURNOVER_TURNS) {
            best.setLocation(tile);
            wlp = null;
            if (goodsType.isFoodType()) {
              lb.add(['    starvation (', count, '/', net, ')\n']);
              done = true;
              break;
            }
            lb.add(['    would starve (', count, '/', net, ')\n']);
            continue;
          }
        }
        let raw = goodsType.getInputType();
        let rawNeeded = CollectionUtils.sum$Collection$Predicate$ToIntFunction(buildGoods, (ag) => ag.getType() === raw, ($p0) => $p0.getAmount());
        if (raw == null || col.getAdjustedNetProductionOf(raw) >= 0 || (($J.idiv(((col.getGoodsCount(raw) - rawNeeded) | 0), -col.getAdjustedNetProductionOf(raw))) >= ColonyPlan.PRODUCTION_TURNOVER_TURNS)) {
          best.changeWorkType(goodsType);
          workers.remove(best);
          lb.add(['    ', best.getId(), '(', best.getType().getSuffix$(), ')\n']);
          if (!goodsType.isFoodType() && produce.remove(goodsType)) {
            produce.add(goodsType);
          }
          break;
        }
        best.setLocation(tile);
        let rawWlp = this.findPlan(raw, workPlans);
        if (rawWlp != null) {
          if (produce.remove(raw)) {
            produce.add(0, raw);
          }
          wlp = rawWlp;
          lb.add(['    retry with ', raw.getSuffix$(), '\n']);
          continue;
        }
        wlps.remove(wlp);
        produce.remove(goodsType);
        lb.add(['    needs more ', raw.getSuffix$(), '\n']);
        break;
      }
    }
    for (const $it19 = workers.iterator(); $it19.hasNext(); ) {
      let u = $it19.next();
      if (u.getLocation() !== tile) {
        u.setLocation(tile);
      }
    }
    if (col.getUnitCount() === 0) {
      if (this.getFoodPlans().isEmpty()) {
        locations:
        for (const $it20 = col.getAvailableWorkLocationsList().iterator(); $it20.hasNext(); ) {
          let wl = $it20.next();
          for (const $it21 = new ArrayList(workers).iterator(); $it21.hasNext(); ) {
            let u = $it21.next();
            for (const $it22 = this.libertyGoodsTypes.iterator(); $it22.hasNext(); ) {
              let type$ = $it22.next();
              if (wl.canAdd(u) && wl.getPotentialProduction(type$, u.getType()) > 0) {
                u.setLocation(wl);
                u.changeWorkType(type$);
                workers.remove(u);
                break locations;
              }
            }
          }
        }
      } else {
        plans:
        for (const $it23 = this.getFoodPlans().iterator(); $it23.hasNext(); ) {
          let w = $it23.next();
          let goodsType = w.getGoodsType();
          let wl = col.getCorresponding(w.getWorkLocation());
          for (const $it24 = new ArrayList(workers).iterator(); $it24.hasNext(); ) {
            let u = $it24.next();
            let oldWork = u.getWorkType();
            u.setLocation(wl);
            u.changeWorkType(goodsType);
            if (col.getAdjustedNetProductionOf(foodType) >= 0) {
              lb.add(['    Subsist with ', u, '\n']);
              workers.remove(u);
              break plans;
            }
            u.setLocation(tile);
            u.changeWorkType(oldWork);
          }
        }
      }
    }
    let experts = new ArrayList();
    let nonExperts = new ArrayList();
    for (const $it25 = col.getUnitList().iterator(); $it25.hasNext(); ) {
      let u = $it25.next();
      if (u.getType().getExpertProduction() != null) {
        if (u.getType().getExpertProduction() !== u.getWorkType()) {
          experts.add(u);
        }
      } else {
        nonExperts.add(u);
      }
    }
    let expert = 0;
    let expertIterator = experts.iterator();
    while (expertIterator.hasNext()) {
      let u1 = expertIterator.next();
      let other = u1.trySwapExpert(experts);
      if (other != null) {
        lb.add(['    Swapped ', u1.getId(), '(', u1.getType().getSuffix$(), ') for ', other, '\n']);
        expertIterator.remove();
      } else if ((other = u1.trySwapExpert(nonExperts)) != null) {
        lb.add(['    Swapped ', u1.getId(), '(', u1.getType().getSuffix$(), ') for ', other, '\n']);
        expertIterator.remove();
      }
    }
    for (const $it26 = new ArrayList(workers).iterator(); $it26.hasNext(); ) {
      let u = $it26.next();
      let work = u.getType().getExpertProduction();
      if (work != null) {
        let other = u.trySwapExpert(col.getUnitList());
        if (other != null) {
          lb.add(['    Swapped ', u.getId(), '(', u.getType().getSuffix$(), ') for ', other, '\n']);
          workers.remove(u);
          workers.add(other);
        }
      }
    }
    for (const $it27 = CollectionUtils.sort$Collection$Comparator(workers, soldierComparator).iterator(); $it27.hasNext(); ) {
      let u = $it27.next();
      if (u.getSkillLevel() > 0) {
        continue;
      }
      for (const $it28 = u.getSortedMilitaryRoles().iterator(); $it28.hasNext(); ) {
        let role = $it28.next();
        if (ColonyPlan.fullEquipUnit(this.spec(), u, role, col)) {
          lb.add(['    ', u.getId(), '(', u.getType().getSuffix$(), ') -> ', u.getRoleSuffix(), '\n']);
          workers.remove(u);
          break;
        }
      }
    }
    for (const $it29 = (CollectionUtils.transform$Stream$Predicate(col.getUnits(), (u) => !u.hasDefaultRole())).iterator(); $it29.hasNext(); ) {
      let u = $it29.next();
      ColonyPlan.logger.warning('assignWorkers bogus role for ' + $J.str(u));
      u.changeRole(this.spec().getDefaultRole(), 0);
    }
    for (const $it30 = workers.iterator(); $it30.hasNext(); ) {
      let u = $it30.next();
      lb.add(['    ', u.getId(), '(', u.getType().getSuffix$(), ') -> UNUSED\n']);
    }
    if (col.getUnitCount() <= 0) {
      col = null;
    }
    return col;
  }
  /**
   * Gets a concise textual description of a location associated with
   * the colony.  No i18n here, this is for debugging purposes.
   *
   * @param loc The {@code Location} to describe.
   * @return The text description.
   */
  locationDescription(loc: Location): string {
    let name = this.colony.getName() + '-';
    let desc = loc.toShortString();
    if (desc.startsWith(name)) {
      desc = desc.substring(name.length, desc.length);
    }
    return desc;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add(['ColonyPlan: ', this.colony, ' ', this.colony.getTile$(), '\nProfile: ', this.profileType, '\nPreferred production:']);
    FreeColObject.logFreeColObjects(this.getPreferredProduction(), lb);
    lb.add(['\n']);
    lb.add([this.getBuildableReport(), 'Food Plans:\n']);
    for (const $it31 = this.getFoodPlans().iterator(); $it31.hasNext(); ) {
      let wlp = $it31.next();
      let wl = wlp.getWorkLocation();
      lb.add([this.locationDescription(wl), ': ', wl.getGenericPotential(wlp.getGoodsType()), ' ', wlp.getGoodsType().getSuffix$(), '\n']);
    }
    lb.add(['Work Plans:\n']);
    for (const $it32 = this.getWorkPlans().iterator(); $it32.hasNext(); ) {
      let wlp = $it32.next();
      let wl = wlp.getWorkLocation();
      lb.add([this.locationDescription(wl), ': ', wl.getGenericPotential(wlp.getGoodsType()), ' ', wlp.getGoodsType().getSuffix$(), '\n']);
    }
    return lb.toString();
  }
  static $clinit() {
    ColonyPlan.logger = Logger.getLogger($J.cls(ColonyPlan).getName());
    ColonyPlan.buildPlanComparator = Comparator.reversed((Comparator.comparingDouble(($p0) => $p0.getValue())));
  }
}

/**
 * The things to build, and their priority.
 */
export class ColonyPlan$BuildPlan extends JObject {
  type: BuildableType = null;
  weight: number = 0;
  support: number = 0;
  difficulty: number = 0;
  _ColonyPlan$BuildPlan(type$: BuildableType, weight: number, support: number): this {
    this.type = type$;
    this.weight = weight;
    this.support = support;
    this.difficulty = 1;
    return this;
  }
  getValue(): number {
    return this.weight * this.support / this.difficulty;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return JString.format('%s (%1.3f * %1.3f / %1.3f = %1.3f)', this.type.getSuffix$(), $J.boxD(this.weight), $J.boxD(this.support), $J.boxD(this.difficulty), $J.boxD(this.getValue()));
  }
}

/**
 * The profile of the colony (a sort of general flavour).
 */
export class ColonyPlan$ProfileType extends JEnum {
  static OUTPOST: ColonyPlan$ProfileType = null;
  static SMALL: ColonyPlan$ProfileType = null;
  static MEDIUM: ColonyPlan$ProfileType = null;
  static LARGE: ColonyPlan$ProfileType = null;
  static CAPITAL: ColonyPlan$ProfileType = null;
  static $VALUES: ColonyPlan$ProfileType[] = null;
  _ColonyPlan$ProfileType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Chooses a suitable profile type given a size of colony.
   *
   * @param size A proposed colony size.
   * @return The colony profile type.
   */
  static getProfileTypeFromSize(size: number): ColonyPlan$ProfileType {
    return (size <= 1) ? ColonyPlan$ProfileType.OUTPOST : (size <= 2) ? ColonyPlan$ProfileType.SMALL : (size <= 4) ? ColonyPlan$ProfileType.MEDIUM : (size <= 8) ? ColonyPlan$ProfileType.LARGE : ColonyPlan$ProfileType.CAPITAL;
  }
  static values(): ColonyPlan$ProfileType[] { return ColonyPlan$ProfileType.$VALUES.slice(); }
  static valueOf(name: string): ColonyPlan$ProfileType { return $J.enumValueOf(ColonyPlan$ProfileType, name); }
  static $clinit() {
    ColonyPlan$ProfileType.OUTPOST = new ColonyPlan$ProfileType()._ColonyPlan$ProfileType('OUTPOST', 0);
    ColonyPlan$ProfileType.SMALL = new ColonyPlan$ProfileType()._ColonyPlan$ProfileType('SMALL', 1);
    ColonyPlan$ProfileType.MEDIUM = new ColonyPlan$ProfileType()._ColonyPlan$ProfileType('MEDIUM', 2);
    ColonyPlan$ProfileType.LARGE = new ColonyPlan$ProfileType()._ColonyPlan$ProfileType('LARGE', 3);
    ColonyPlan$ProfileType.CAPITAL = new ColonyPlan$ProfileType()._ColonyPlan$ProfileType('CAPITAL', 4);
    ColonyPlan$ProfileType.$VALUES = [ColonyPlan$ProfileType.OUTPOST, ColonyPlan$ProfileType.SMALL, ColonyPlan$ProfileType.MEDIUM, ColonyPlan$ProfileType.LARGE, ColonyPlan$ProfileType.CAPITAL];
  }
}

$J.define(ColonyPlan, 'net.sf.freecol.server.ai.ColonyPlan', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Colony': '_ColonyPlan' }, returns: { 'getWorkPlans': 'java.util.List', 'getFoodPlans': 'java.util.List', 'getBuildableReport': 'java.lang.String', 'getBestBuildableType': 'net.sf.freecol.common.model.BuildableType', 'getBuildableTypes': 'java.util.List', 'getPreferredProduction': 'java.util.List', 'getAIMain': 'net.sf.freecol.server.ai.AIMain' }, clinit: true, lazy: ['logger', 'buildPlanComparator'] });
$J.define(ColonyPlan$BuildPlan, 'net.sf.freecol.server.ai.ColonyPlan$BuildPlan', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.BuildableType,double,double': '_ColonyPlan$BuildPlan' }, returns: { 'getValue': 'double' } });
$J.define(ColonyPlan$ProfileType, 'net.sf.freecol.server.ai.ColonyPlan$ProfileType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_ColonyPlan$ProfileType' }, clinit: true, lazy: ['$VALUES', 'OUTPOST', 'SMALL', 'MEDIUM', 'LARGE', 'CAPITAL'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  WorkLocationPlan = $J.load('net.sf.freecol.server.ai.WorkLocationPlan');
});
