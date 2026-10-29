// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/GameOptions.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

/**
 * Keeps track of the available game options. New options must be
 * added to the {@link net.sf.freecol.common.model.Specification} and
 * each option should be given an unique identifier (defined as a
 * constant in this class).
 */
export class GameOptions extends JObject {
  static readonly TAG: string = 'gameOptions';
  /**
   * Map game option group.
   */
  static readonly GAMEOPTIONS_MAP: string = 'gameOptions.map';
  /**
   * The number of turns to sail between Europe and the New World.
   */
  static readonly TURNS_TO_SAIL: string = 'model.option.turnsToSail';
  /**
   * Changes the settlement limits.
   */
  static readonly SETTLEMENT_LIMIT_MODIFIER: string = 'model.option.settlementLimitModifier';
  /**
   * Enables/disables fog of war.
   */
  static readonly FOG_OF_WAR: string = 'model.option.fogOfWar';
  /**
   * Whether to award exploration points or not.
   */
  static readonly EXPLORATION_POINTS: string = 'model.option.explorationPoints';
  /**
   * Allow amphibious moves.
   */
  static readonly AMPHIBIOUS_MOVES: string = 'model.option.amphibiousMoves';
  /**
   * Allow empty units to trade.
   */
  static readonly EMPTY_TRADERS: string = 'model.option.emptyTraders';
  /**
   * Do settlement actions consume the chief contact bonus.
   */
  static readonly SETTLEMENT_ACTIONS_CONTACT_CHIEF: string = 'model.option.settlementActionsContactChief';
  /**
   * Do missionaries provide extra benefits.
   */
  static readonly ENHANCED_MISSIONARIES: string = 'model.option.enhancedMissionaries';
  /**
   * The strength of the influence of a Mission to the
   *        alarm level of the natives in a settlement.
   */
  static readonly MISSION_INFLUENCE: string = 'model.option.missionInfluence';
  /**
   * Probability of a settlement with a surplus offering a gift.
   */
  static readonly GIFT_PROBABILITY: string = 'model.option.giftProbability';
  /**
   * Probability of an angry settlement making a demand.
   */
  static readonly DEMAND_PROBABILITY: string = 'model.option.demandProbability';
  static readonly ALARM_BONUS_BUY: string = 'model.option.alarmBonusBuy';
  static readonly ALARM_BONUS_SELL: string = 'model.option.alarmBonusSell';
  static readonly ALARM_BONUS_GIFT: string = 'model.option.alarmBonusGift';
  /**
   * Maximum number of goods a native settlement will offer for sale.
   */
  static readonly SETTLEMENT_NUMBER_OF_GOODS_TO_SELL: string = 'model.option.settlementNumberOfGoodsToSell';
  /**
   * Continue recruiting founding fathers after declaring independence.
   */
  static readonly CONTINUE_FOUNDING_FATHER_RECRUITMENT: string = 'model.option.continueFoundingFatherRecruitment';
  /**
   * Does the REF "teleport" to its first target.
   */
  static readonly TELEPORT_REF: string = 'model.option.teleportREF';
  /**
   * Use map defined starting positions (if available).
   */
  static readonly MAP_DEFINED_STARTING_POSITIONS: string = 'model.option.mapDefinedStartingPositions';
  /**
   * How to determine the starting positions of European players.
   */
  static readonly STARTING_POSITIONS: string = 'model.option.startingPositions';
  static readonly STARTING_POSITIONS_CLASSIC: number = 0;
  static readonly STARTING_POSITIONS_RANDOM: number = 1;
  static readonly STARTING_POSITIONS_HISTORICAL: number = 2;
  /**
   * Percent chance peace will hold if there is a recent treaty.
   */
  static readonly PEACE_PROBABILITY: string = 'model.option.peaceProbability';
  /**
   * Initial immigration target value.
   */
  static readonly INITIAL_IMMIGRATION: string = 'model.option.initialImmigration';
  /**
   * Per turn immigration penalty for units in Europe.
   */
  static readonly EUROPEAN_UNIT_IMMIGRATION_PENALTY: string = 'model.option.europeanUnitImmigrationPenalty';
  /**
   * Per turn player immigration bonus.
   */
  static readonly PLAYER_IMMIGRATION_BONUS: string = 'model.option.playerImmigrationBonus';
  /**
   * Equip European recruits.
   */
  static readonly EQUIP_EUROPEAN_RECRUITS: string = 'model.option.equipEuropeanRecruits';
  /**
   * Enhanced trade routes.
   */
  static readonly ENHANCED_TRADE_ROUTES: string = 'model.option.enhancedTradeRoutes';
  /**
   * Colony game option group.
   */
  static readonly GAMEOPTIONS_COLONY: string = 'gameOptions.colony';
  /**
   * Is bell accumulation capped when 100% rebels achieved?
   */
  static readonly BELL_ACCUMULATION_CAPPED: string = 'model.option.bellAccumulationCapped';
  /**
   * Capture units under repair with colony.
   */
  static readonly CAPTURE_UNITS_UNDER_REPAIR: string = 'model.option.captureUnitsUnderRepair';
  /**
   * Does the Custom House sell boycotted goods?
   */
  static readonly CUSTOM_IGNORE_BOYCOTT: string = 'model.option.customIgnoreBoycott';
  /**
   * Custom Houses only allowed in coastal colonies?
   */
  static readonly CUSTOMS_ON_COAST: string = 'model.option.customsOnCoast';
  /**
   * All units disembark when a carrier arrives in a colony (Col1).
   */
  static readonly DISEMBARK_IN_COLONY: string = 'model.option.disembarkInColony';
  /**
   * Whether experts have connections, producing without raw
   * materials in factories.
   */
  static readonly EXPERTS_HAVE_CONNECTIONS: string = 'model.option.expertsHaveConnections';
  /**
   * Can colonies be founded during the war of independence?
   */
  static readonly FOUND_COLONY_DURING_REBELLION: string = 'model.option.foundColonyDuringRebellion';
  /**
   * Can colony buildings be completed quickly by paying for the
   * missing goods?
   */
  static readonly PAY_FOR_BUILDING: string = 'model.option.payForBuilding';
  /**
   * Does a hammer surplus after a build completes accumulate to
   * the next build?
   */
  static readonly SAVE_PRODUCTION_OVERFLOW: string = 'model.option.saveProductionOverflow';
  /**
   * Clear the hammers when changing production.
   */
  static readonly CLEAR_HAMMERS_ON_CONSTRUCTION_SWITCH: string = 'model.option.clearHammersOnConstructionSwitch';
  /**
   * Whether to educate the least skilled unit first. This is the
   * behaviour of the original game and disallows manually assigning
   * students to teachers.
   */
  static readonly ALLOW_STUDENT_SELECTION: string = 'model.option.allowStudentSelection';
  /**
   * Claim all possible surrounding tiles when founding a colony?
   */
  static readonly CLAIM_ALL_TILES: string = 'model.option.claimAllTiles';
  /**
   * Enable upkeep requirement on buildings.
   */
  static readonly ENABLE_UPKEEP: string = 'model.option.enableUpkeep';
  /**
   * Toggle whether artifical tile improvements contribute to the
   * production of secondary (non-food) goods on the colony center
   * tile.
   */
  static readonly ONLY_NATURAL_IMPROVEMENTS: string = 'model.option.onlyNaturalImprovements';
  /**
   * Enable natural disasters striking colonies.
   */
  static readonly NATURAL_DISASTERS: string = 'model.option.naturalDisasters';
  /**
   * Victory conditions game option group.
   */
  static readonly GAMEOPTIONS_VICTORY_CONDITIONS: string = 'gameOptions.victoryConditions';
  /**
   * Victory condition: Should the {@code Player} who first
   * defeats the Royal Expeditionary Force win the game?
   */
  static readonly VICTORY_DEFEAT_REF: string = 'model.option.victoryDefeatREF';
  /**
   * Victory condition: Should a {@code Player} who
   * defeats all other European players win the game?
   */
  static readonly VICTORY_DEFEAT_EUROPEANS: string = 'model.option.victoryDefeatEuropeans';
  /**
   * Victory condition: Should a {@code Player} who defeats all
   * other human players win the game?
   */
  static readonly VICTORY_DEFEAT_HUMANS: string = 'model.option.victoryDefeatHumans';
  /**
   * Years game option group.
   */
  static readonly GAMEOPTIONS_YEARS: string = 'gameOptions.years';
  /**
   * The year in which the game starts. At the moment, changing this
   * value only shortens the game.  In future, it might cause the map
   * generator to create foreign colonies.
   */
  static readonly STARTING_YEAR: string = 'model.option.startingYear';
  /**
   * The first year in which there are two seasons.  Changing this
   * value influences the duration of the game.
   */
  static readonly SEASON_YEAR: string = 'model.option.seasonYear';
  /**
   * The year in which owning at least one colony becomes mandatory.
   */
  static readonly MANDATORY_COLONY_YEAR: string = 'model.option.mandatoryColonyYear';
  /**
   * The very last year of the game.
   */
  static readonly LAST_YEAR: string = 'model.option.lastYear';
  /**
   * The last year of the game for colonial players.  In other
   * words, if a colonial player does not declare independence by
   * the end of this year, the game is lost.
   */
  static readonly LAST_COLONIAL_YEAR: string = 'model.option.lastColonialYear';
  /**
   * Score bonus on declaring independence = (1780, Spring) - turn
   * 1780 is documented in the Col1 manual:
   *   ``if you've declared your independence before 1780, your score
   *     is increased; the sooner you declare; the better your Bonus.''
   * which suggests this needs to cut off at 1780.  Using turns
   * rather than years though so that scores are equivalent in games
   * with &gt;2 seasons.
   */
  static readonly INDEPENDENCE_TURN: string = 'model.option.independenceTurn';
  /**
   * The "ages" where founding father weights change, specified as years.
   */
  static readonly AGES: string = 'model.option.ages';
  /**
   * The number of seasons.
   */
  static readonly SEASONS: string = 'model.option.seasons';
  /**
   * Prices game option group.
   * This group is synthesized at game initialization.
   */
  static readonly GAMEOPTIONS_PRICES: string = 'gameOptions.prices';
  /**
   * Immigration (difficulty) group.
   */
  static readonly DIFFICULTY_IMMIGRATION: string = 'model.difficulty.immigration';
  /**
   * Rate cross requirement increases.
   */
  static readonly CROSSES_INCREMENT: string = 'model.option.crossesIncrement';
  /**
   * Rate recruitment prices increase.
   */
  static readonly RECRUIT_PRICE_INCREASE: string = 'model.option.recruitPriceIncrease';
  /**
   * Lower bound on the recruitment price.
   */
  static readonly LOWER_CAP_INCREASE: string = 'model.option.lowerCapIncrease';
  /**
   * A price increase prefix.
   */
  static readonly PRICE_INCREASE: string = 'model.option.priceIncrease';
  /**
   * Are there price increases specific to unit type.
   */
  static readonly PRICE_INCREASE_PER_TYPE: string = 'model.option.priceIncreasePerType';
  /**
   * Are the initial immigrants expert units.
   */
  static readonly EXPERT_STARTING_UNITS: string = 'model.option.expertStartingUnits';
  /**
   * Predefined initial immigrants.
   */
  static readonly IMMIGRANTS: string = 'model.option.immigrants';
  /**
   * Native (difficulty) group.
   */
  static readonly DIFFICULTY_NATIVES: string = 'model.difficulty.natives';
  /**
   * Base multiplier from land productivity to price.
   */
  static readonly LAND_PRICE_FACTOR: string = 'model.option.landPriceFactor';
  /**
   * Probability of an attack extracting converts.
   */
  static readonly NATIVE_CONVERT_PROBABILITY: string = 'model.option.nativeConvertProbability';
  /**
   * Probability of angry natives burning missions.
   */
  static readonly BURN_PROBABILITY: string = 'model.option.burnProbability';
  /**
   * Factor for how a successful native demand reduces tension.
   */
  static readonly NATIVE_DEMANDS: string = 'model.option.nativeDemands';
  /**
   * Rumour difficulty factor. [FIXME: should go away]
   */
  static readonly RUMOUR_DIFFICULTY: string = 'model.option.rumourDifficulty';
  /**
   * The penalty applied to trading with the natives from a ship.
   */
  static readonly SHIP_TRADE_PENALTY: string = 'model.option.shipTradePenalty';
  /**
   * The score penalty for destroying a settlement.
   */
  static readonly DESTROY_SETTLEMENT_SCORE: string = 'model.option.destroySettlementScore';
  /**
   * The behaviour when building on native land.
   */
  static readonly BUILD_ON_NATIVE_LAND: string = 'model.option.buildOnNativeLand';
  static readonly BUILD_ON_NATIVE_LAND_ALWAYS: string = 'model.option.buildOnNativeLand.always';
  static readonly BUILD_ON_NATIVE_LAND_FIRST: string = 'model.option.buildOnNativeLand.first';
  static readonly BUILD_ON_NATIVE_LAND_FIRST_AND_UNCONTACTED: string = 'model.option.buildOnNativeLand.firstAndUncontacted';
  static readonly BUILD_ON_NATIVE_LAND_NEVER: string = 'model.option.buildOnNativeLand.never';
  /**
   * Option for setting the number of settlements on the map.
   * Note: *not* a MapGeneratorOption because it is difficulty-sensitive.
   */
  static readonly SETTLEMENT_NUMBER: string = 'model.option.settlementNumber';
  /**
   * Monarch (difficulty) group.
   */
  static readonly DIFFICULTY_MONARCH: string = 'model.difficulty.monarch';
  /**
   * The grace period at the start of the game before the monarch
   * begins to meddle.
   */
  static readonly MONARCH_MEDDLING: string = 'model.option.monarchMeddling';
  /**
   * Moderating factor for tax raises.
   */
  static readonly TAX_ADJUSTMENT: string = 'model.option.taxAdjustment';
  /**
   * Percentage of real price to change for mercenary units.
   */
  static readonly MERCENARY_PRICE: string = 'model.option.mercenaryPrice';
  /**
   * Maximum tax rate.
   */
  static readonly MAXIMUM_TAX: string = 'model.option.maximumTax';
  /**
   * The degree of monarch support.
   */
  static readonly MONARCH_SUPPORT: string = 'model.option.monarchSupport';
  /**
   * Percentage fee for transporting treasures to Europe.
   */
  static readonly TREASURE_TRANSPORT_FEE: string = 'model.option.treasureTransportFee';
  /**
   * Bells to generate to trigger the intervention force.
   */
  static readonly INTERVENTION_BELLS: string = 'model.option.interventionBells';
  /**
   * How often to update the intervention force.
   */
  static readonly INTERVENTION_TURNS: string = 'model.option.interventionTurns';
  /**
   * The basic composition of the REF.  "refSize" is a legacy term.
   */
  static readonly REF_FORCE: string = 'model.option.refSize';
  /**
   * The basic composition of the intervention force.
   */
  static readonly INTERVENTION_FORCE: string = 'model.option.interventionForce';
  /**
   * The basic composition of the mercenary force.
   */
  static readonly MERCENARY_FORCE: string = 'model.option.mercenaryForce';
  /**
   * The base mercenary force sometimes supplied with a war declaration.
   */
  static readonly WAR_SUPPORT_FORCE: string = 'model.option.warSupportForce';
  /**
   * The base amount of gold sometimes supplied with a war declaration.
   */
  static readonly WAR_SUPPORT_GOLD: string = 'model.option.warSupportGold';
  /**
   * Government (difficulty) group.
   */
  static readonly DIFFICULTY_GOVERNMENT: string = 'model.difficulty.government';
  /**
   * The percent SoL to achieve "bad" government.
   */
  static readonly BAD_GOVERNMENT_LIMIT: string = 'model.option.badGovernmentLimit';
  /**
   * The percent SoL to achieve "very bad" government.
   */
  static readonly VERY_BAD_GOVERNMENT_LIMIT: string = 'model.option.veryBadGovernmentLimit';
  /**
   * The percent SoL to achieve "good" government.
   */
  static readonly GOOD_GOVERNMENT_LIMIT: string = 'model.option.goodGovernmentLimit';
  /**
   * The percent SoL to achieve "very good" government.
   */
  static readonly VERY_GOOD_GOVERNMENT_LIMIT: string = 'model.option.veryGoodGovernmentLimit';
  /**
   * Other (difficulty) group.
   */
  static readonly DIFFICULTY_OTHER: string = 'model.difficulty.other';
  /**
   * The amount of money each player will receive before the game starts.
   */
  static readonly STARTING_MONEY: string = 'model.option.startingMoney';
  /**
   * Rate the bells for founding father recruitment grows.
   */
  static readonly FOUNDING_FATHER_FACTOR: string = 'model.option.foundingFatherFactor';
  /**
   * Retributive markup on tea party goods.
   */
  static readonly ARREARS_FACTOR: string = 'model.option.arrearsFactor';
  /**
   * The number of units that do not consume bells.
   */
  static readonly UNITS_THAT_USE_NO_BELLS: string = 'model.option.unitsThatUseNoBells';
  /**
   * Tile production.
   */
  static readonly TILE_PRODUCTION: string = 'model.option.tileProduction';
  /**
   * Bad rumour chance.
   */
  static readonly BAD_RUMOUR: string = 'model.option.badRumour';
  /**
   * Good rumour chance.
   */
  static readonly GOOD_RUMOUR: string = 'model.option.goodRumour';
  /**
   * Cheat (difficulty) group.
   */
  static readonly DIFFICULTY_CHEAT: string = 'model.difficulty.cheat';
  static readonly LIFT_BOYCOTT_CHEAT: string = 'model.option.liftBoycottCheat';
  static readonly EQUIP_SCOUT_CHEAT: string = 'model.option.equipScoutCheat';
  static readonly EQUIP_PIONEER_CHEAT: string = 'model.option.equipPioneerCheat';
  static readonly LAND_UNIT_CHEAT: string = 'model.option.landUnitCheat';
  static readonly OFFENSIVE_LAND_UNIT_CHEAT: string = 'model.option.offensiveLandUnitCheat';
  static readonly OFFENSIVE_NAVAL_UNIT_CHEAT: string = 'model.option.offensiveNavalUnitCheat';
  static readonly TRANSPORT_NAVAL_UNIT_CHEAT: string = 'model.option.transportNavalUnitCheat';
  static readonly TRADE_PROFIT_MULTIPLIER_CHEAT: string = 'model.option.tradeProfitMultiplierCheat';
  static readonly TRADE_PROFIT_MULTIPLIER_CHEAT_TURNS: string = 'model.option.tradeProfitMultiplierCheatTurns';
  _GameOptions(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return GameOptions.TAG;
  }
}

$J.define(GameOptions, 'net.sf.freecol.common.option.GameOptions', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GameOptions' }, returns: { 'getXMLTagName': 'java.lang.String' } });
