// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Specification.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Collections, Collectors, Files, HashMap, HashSet, IOException, JFunction, JObject, JString, Level, Logger, NumberFormatException, RuntimeException, Stream, StringBuilder, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let Color, FreeColUserMessageException, Messages, FreeColDirectories, FreeColRules, FreeColXMLReader, Ability, AbstractUnit, BuildableType, BuildingType, Constants, Disaster, EuropeanNationType, Event, FoundingFather, FreeColObject, GoodsType, IndianNationType, Limit$Operator, Modifier, Modifier$ModifierType, Nation, NationOptions$Advantages, NationType, ResourceType, Role, Scope, StringTemplate, TileImprovementType, TileType, Turn, UnitChangeType, UnitType, AbstractOption, AbstractUnitOption, BooleanOption, GameOptions, IntegerOption, MapGeneratorOptions, OptionGroup, PercentageOption, TextOption, UnitListOption, CollectionUtils, Introspector, Introspector$IntrospectorException, LogBuilder;

/**
 * This class encapsulates any parts of the "specification" for
 * FreeCol that are expressed best using XML.  The XML is loaded
 * through the class loader from the resource named
 * "specification.xml" in the same package as this class.
 */
export class Specification extends JObject {
  static logger: Logger = null;
  /**
   * Fixed class array argument used in newType().
   */
  static newTypeClasses: JClass[] = null;
  static AMBUSH_BONUS_SOURCE: Specification$Source = null;
  static AMPHIBIOUS_ATTACK_PENALTY_SOURCE: Specification$Source = null;
  static ARTILLERY_PENALTY_SOURCE: Specification$Source = null;
  static ATTACK_BONUS_SOURCE: Specification$Source = null;
  static BASE_DEFENCE_SOURCE: Specification$Source = null;
  static BASE_OFFENCE_SOURCE: Specification$Source = null;
  static CARGO_PENALTY_SOURCE: Specification$Source = null;
  static COLONY_GOODS_PARTY_SOURCE: Specification$Source = null;
  static FORTIFICATION_BONUS_SOURCE: Specification$Source = null;
  static INDIAN_RAID_BONUS_SOURCE: Specification$Source = null;
  static MOVEMENT_PENALTY_SOURCE: Specification$Source = null;
  static SHIP_TRADE_PENALTY_SOURCE: Specification$Source = null;
  static SOL_MODIFIER_SOURCE: Specification$Source = null;
  /**
   * All the special static sources.
   */
  static sources: Specification$Source[] = null;
  /**
   * A map of default nation colours.
   */
  static defaultColors: JMap<string, Color> = null;
  static readonly TAG: string = 'freecol-specification';
  /**
   * The difficulty levels option group is special.
   */
  static readonly DIFFICULTY_LEVELS: string = 'difficultyLevels';
  /**
   * Roles backward compatibility fragment.
   */
  static readonly ROLES_COMPAT_FILE_NAME: string = 'roles-compat.xml';
  /**
   * Unit change types backward compatibility fragment.
   */
  static readonly UNIT_CHANGE_TYPES_COMPAT_FILE_NAME: string = 'unit-change-types-compat.xml';
  /**
   * The default food type.
   */
  static readonly DEFAULT_FOOD_TYPE: string = 'model.goods.food';
  /**
   * The default nation type, which does nothing special.
   */
  static readonly DEFAULT_NATION_TYPE: string = 'model.nationType.default';
  /**
   * The default role.
   */
  static readonly DEFAULT_ROLE_ID: string = 'model.role.default';
  /**
   * How many game ages.
   */
  static readonly NUMBER_OF_AGES: number = 3;
  /**
   * The option groups to save.
   */
  static coreOptionGroups: string[] = null;
  /**
   * A map from specification object group identifier to a reader for it.
   */
  readerMap: JMap<string, Specification$ChildReader> = null;
  buildingTypeList: List<BuildingType> = null;
  disasters: List<Disaster> = null;
  europeanNationTypes: List<EuropeanNationType> = null;
  events: List<Event> = null;
  foundingFathers: List<FoundingFather> = null;
  goodsTypeList: List<GoodsType> = null;
  indianNationTypes: List<IndianNationType> = null;
  nations: List<Nation> = null;
  resourceTypeList: List<ResourceType> = null;
  roles: List<Role> = null;
  tileTypeList: List<TileType> = null;
  tileImprovementTypeList: List<TileImprovementType> = null;
  unitChangeTypeList: List<UnitChangeType> = null;
  unitTypeList: List<UnitType> = null;
  allModifiers: JMap<string, List<Modifier>> = null;
  specialModifiers: List<Modifier> = null;
  allOptions: JMap<string, AbstractOption> = null;
  allOptionGroups: JMap<string, OptionGroup> = null;
  storableGoodsTypeList: List<GoodsType> = null;
  farmedGoodsTypeList: List<GoodsType> = null;
  foodGoodsTypeList: List<GoodsType> = null;
  newWorldGoodsTypeList: List<GoodsType> = null;
  newWorldLuxuryGoodsTypeList: List<GoodsType> = null;
  libertyGoodsTypeList: List<GoodsType> = null;
  immigrationGoodsTypeList: List<GoodsType> = null;
  rawBuildingGoodsTypeList: List<GoodsType> = null;
  rawMaterialsForUnstorableBuildingMaterials: List<GoodsType> = null;
  rawMaterialsForStorableBuildingMaterials: List<GoodsType> = null;
  europeanNations: List<Nation> = null;
  REFNations: List<Nation> = null;
  indianNations: List<Nation> = null;
  nationTypes: List<NationType> = null;
  REFNationTypes: List<EuropeanNationType> = null;
  buildableUnitTypes: ArrayList<UnitType> = null;
  experts: JMap<GoodsType, UnitType> = null;
  unitTypesTrainedInEurope: List<UnitType> = null;
  unitTypesPurchasedInEurope: List<UnitType> = null;
  fastestLandUnitType: UnitType = null;
  fastestNavalUnitType: UnitType = null;
  defaultUnitTypes: List<UnitType> = null;
  /**
   * All the FreeColSpecObjectType objects, indexed by identifier.
   *
   * This list include abstract types that are read from the specification files,
   * but no longer contains the abstract types after reserialization. The reason
   * for this is that the abstract types are needed when still applying mods
   * that might reference the abstract type.
   */
  allTypes: JMap<string, FreeColSpecObjectType> = null;
  /**
   * All the abilities by identifier.
   */
  allAbilities: JMap<string, List<Ability>> = null;
  gameAbilities: List<Ability> = null;
  /**
   * A cache of the military roles in decreasing order.  Do not serialize.
   */
  militaryRoles: List<Role> = null;
  initialized: boolean = false;
  /**
   * The specification identifier.
   */
  id_: string = null;
  /**
   * The specification version.
   */
  version: string = null;
  /**
   * The name of the difficulty level option group.
   */
  difficultyLevel: string = null;
  /**
   * The turn number for the game ages for FF recruitment.
   */
  ages: number[] = null;
  static readonly ABILITIES_TAG: string = 'abilities';
  static readonly BUILDING_TYPES_TAG: string = 'building-types';
  static readonly DIFFICULTY_LEVEL_TAG: string = 'difficulty-level';
  static readonly DISASTERS_TAG: string = 'disasters';
  static readonly EUROPEAN_NATION_TYPES_TAG: string = 'european-nation-types';
  static readonly EVENTS_TAG: string = 'events';
  static readonly FOUNDING_FATHERS_TAG: string = 'founding-fathers';
  static readonly GOODS_TYPES_TAG: string = 'goods-types';
  static readonly INDIAN_NATION_TYPES_TAG: string = 'indian-nation-types';
  static readonly MODIFIERS_TAG: string = 'modifiers';
  static readonly NATIONS_TAG: string = 'nations';
  static readonly OPTIONS_TAG: string = 'options';
  static readonly RESOURCE_TYPES_TAG: string = 'resource-types';
  static readonly ROLES_TAG: string = 'roles';
  static readonly TILE_TYPES_TAG: string = 'tile-types';
  static readonly TILE_IMPROVEMENT_TYPES_TAG: string = 'tile-improvement-types';
  static readonly UNIT_CHANGE_TYPES_TAG: string = 'unit-change-types';
  static readonly UNIT_TYPES_TAG: string = 'unit-types';
  static readonly VERSION_TAG: string = 'version';
  static readonly OLD_DIFFICULTY_LEVEL_TAG: string = 'difficultyLevel';
  static readonly OLD_TILEIMPROVEMENT_TYPES_TAG: string = 'tileimprovement-types';
  static readonly OLD_EQUIPMENT_TYPES_TAG: string = 'equipment-types';
  $init_Specification() {
    this.readerMap = new HashMap(20);
    this.buildingTypeList = new ArrayList();
    this.disasters = new ArrayList();
    this.europeanNationTypes = new ArrayList();
    this.events = new ArrayList();
    this.foundingFathers = new ArrayList();
    this.goodsTypeList = new ArrayList();
    this.indianNationTypes = new ArrayList();
    this.nations = new ArrayList();
    this.resourceTypeList = new ArrayList();
    this.roles = new ArrayList();
    this.tileTypeList = new ArrayList();
    this.tileImprovementTypeList = new ArrayList();
    this.unitChangeTypeList = new ArrayList();
    this.unitTypeList = new ArrayList();
    this.allModifiers = new HashMap();
    this.specialModifiers = new ArrayList();
    this.allOptions = new HashMap();
    this.allOptionGroups = new HashMap();
    this.storableGoodsTypeList = new ArrayList();
    this.farmedGoodsTypeList = new ArrayList();
    this.foodGoodsTypeList = new ArrayList();
    this.newWorldGoodsTypeList = new ArrayList();
    this.newWorldLuxuryGoodsTypeList = new ArrayList();
    this.libertyGoodsTypeList = new ArrayList();
    this.immigrationGoodsTypeList = new ArrayList();
    this.rawBuildingGoodsTypeList = new ArrayList();
    this.rawMaterialsForUnstorableBuildingMaterials = new ArrayList();
    this.rawMaterialsForStorableBuildingMaterials = new ArrayList();
    this.europeanNations = new ArrayList();
    this.REFNations = new ArrayList();
    this.indianNations = new ArrayList();
    this.nationTypes = new ArrayList();
    this.REFNationTypes = new ArrayList();
    this.buildableUnitTypes = new ArrayList();
    this.experts = new HashMap();
    this.unitTypesTrainedInEurope = new ArrayList();
    this.unitTypesPurchasedInEurope = new ArrayList();
    this.fastestLandUnitType = null;
    this.fastestNavalUnitType = null;
    this.defaultUnitTypes = new ArrayList();
    this.allTypes = new HashMap(256);
    this.allAbilities = new HashMap(128);
    this.gameAbilities = new ArrayList();
    this.militaryRoles = null;
    this.initialized = false;
    this.difficultyLevel = null;
    this.ages = $J.newArray(Specification.NUMBER_OF_AGES, 0);
  }
  /**
   * Creates a new Specification object.
   */
  _Specification$(): this {
    this.$init_Specification();
    Specification.logger.fine('Initializing Specification');
    for (let source of Specification.sources) {
      this.addType(source.getId(), source);
    }
    this.readerMap.put(Specification.BUILDING_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(BuildingType), this.buildingTypeList));
    this.readerMap.put(Specification.DISASTERS_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(Disaster), this.disasters));
    this.readerMap.put(Specification.EUROPEAN_NATION_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(EuropeanNationType), this.europeanNationTypes));
    this.readerMap.put(Specification.EVENTS_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(Event), this.events));
    this.readerMap.put(Specification.FOUNDING_FATHERS_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(FoundingFather), this.foundingFathers));
    this.readerMap.put(Specification.GOODS_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(GoodsType), this.goodsTypeList));
    this.readerMap.put(Specification.INDIAN_NATION_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(IndianNationType), this.indianNationTypes));
    this.readerMap.put(Specification.NATIONS_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(Nation), this.nations));
    this.readerMap.put(Specification.RESOURCE_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(ResourceType), this.resourceTypeList));
    this.readerMap.put(Specification.ROLES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(Role), this.roles));
    this.readerMap.put(Specification.TILE_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(TileType), this.tileTypeList));
    this.readerMap.put(Specification.TILE_IMPROVEMENT_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(TileImprovementType), this.tileImprovementTypeList));
    this.readerMap.put(Specification.OLD_TILEIMPROVEMENT_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(TileImprovementType), this.tileImprovementTypeList));
    this.readerMap.put(Specification.UNIT_CHANGE_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(UnitChangeType), this.unitChangeTypeList));
    this.readerMap.put(Specification.UNIT_TYPES_TAG, new Specification$TypeReader().$o(this)._Specification$TypeReader($J.cls(UnitType), this.unitTypeList));
    this.readerMap.put(Specification.ABILITIES_TAG, new Specification$AbilityReader().$o(this)._Specification$AbilityReader());
    this.readerMap.put(Specification.MODIFIERS_TAG, new Specification$ModifierReader().$o(this)._Specification$ModifierReader());
    this.readerMap.put(Specification.OPTIONS_TAG, new Specification$OptionReader().$o(this)._Specification$OptionReader());
    return this;
  }
  /**
   * Creates a new Specification object by loading it from the
   * given {@code FreeColXMLReader}.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem with the stream.
   */
  _Specification$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._Specification$();
    this.initialized = false;
    this.readFromXML(xr);
    this.prepare$Advantages$String(null, this.difficultyLevel);
    this.clean('load from stream');
    this.initialized = true;
    return this;
  }
  /**
   * Creates a new Specification object by loading it from the
   * given {@code InputStream}.
   *
   * @param in The {@code InputStream} to read from.
   * @exception XMLStreamException if there is a problem with the stream.
   */
  _Specification$InputStream(in$: InputStream): this {
    this._Specification$();
    this.initialized = false;
    this.load(in$);
    this.prepare$Advantages$String(null, this.difficultyLevel);
    this.clean('load from InputStream');
    this.initialized = true;
    return this;
  }
  /**
   * Load a specification or fragment from a stream.
   *
   * @param in The {@code InputStream} to read from.
   * @exception XMLStreamException if there is a problem with the stream.
   */
  load(in$: InputStream): void {
    {
      const xr = new FreeColXMLReader()._FreeColXMLReader$InputStream(in$);
      try {
        xr.nextTag();
        this.readFromXML(xr);
      } finally {
        if (xr != null) xr.close();
      }
    }
  }
  /**
   * Load mods into this specification.
   *
   * @param mods A list of {@code FreeColModFile}s for the active mods.
   * @return True if any mod was loaded.
   */
  loadMods(mods: List<FreeColModFile>): boolean {
    this.initialized = false;
    let loadedMod = false;
    for (const $it0 = mods.iterator(); $it0.hasNext(); ) {
      let mod = $it0.next();
      let sis = null;
      try {
        if ((sis = mod.getSpecificationInputStream()) != null) {
          this.load(sis);
        }
        loadedMod = true;
        Specification.logger.info('Loaded mod ' + mod.getId());
      } catch ($e1) {
        if ($J.isa($e1, FreeColUserMessageException)) {
          let e = $J.exc($e1);
          throw e;
        } else if ($J.isa($e1, IOException) || $J.isa($e1, XMLStreamException)) {
          let ex = $J.exc($e1);
          Specification.logger.log(Level.WARNING, 'Read error in mod ' + mod.getId(), ex);
          throw new FreeColUserMessageException()._FreeColUserMessageException$StringTemplate$Throwable(StringTemplate.template$String('error.mod').add$String$String('%id%', mod.getId()).add$String$String('%name%', Messages.getName$String('mod.' + mod.getId())), ex);
        } else if ($J.isa($e1, RuntimeException)) {
          let rte = $J.exc($e1);
          Specification.logger.log(Level.WARNING, 'Parse error in mod ' + mod.getId(), rte);
          throw new FreeColUserMessageException()._FreeColUserMessageException$StringTemplate$Throwable(StringTemplate.template$String('error.mod').add$String$String('%id%', mod.getId()).add$String$String('%name%', Messages.getName$String('mod.' + mod.getId())), rte);
        } else {
          throw $e1;
        }
      }
    }
    if (loadedMod) {
      this.clean('mod loading');
    }
    this.initialized = true;
    return loadedMod;
  }
  /**
   * Prepare a specification with given advantages and difficulty level.
   *
   * @param advantages An optional {@code Advantages} setting.
   * @param difficulty An optional identifier for the difficulty level.
   */
  prepare$Advantages$String(advantages: NationOptions$Advantages, difficulty: string): void {
    this.prepare$Advantages$OptionGroup(advantages, (difficulty == null) ? null : this.getDifficultyOptionGroup$String(difficulty));
  }
  hasAbility(key: string): boolean {
    let ability = this.allAbilities.get(key);
    return ability != null && ability.stream().anyMatch((a) => a.getValue());
  }
  /**
   * Prepare a specification with given advantages and difficulty level.
   *
   * @param advantages An optional {@code Advantages} setting.
   * @param difficulty An optional difficulty level {@code OptionGroup}.
   */
  prepare$Advantages$OptionGroup(advantages: NationOptions$Advantages, difficulty: OptionGroup): void {
    this.applyFixes();
    if (advantages === NationOptions$Advantages.NONE) {
      this.clearEuropeanNationalAdvantages();
    }
    if (difficulty != null) {
      this.setDifficultyOptionGroup(difficulty);
      this.applyDifficultyLevel$OptionGroup(difficulty);
    }
  }
  /**
   * Clean up the specification.
   *
   * Builds all the cached containers and secondary variables.  This
   * *must* clear any containers before building as it may be called
   * multiple times in response to various specification updates.
   *
   * @param why A short statement of why the specification needed to
   *     be cleaned.
   */
  clean(why: string): void {
    Specification.logger.finest('Cleaning up specification following ' + why + '.');
    GoodsType.setDerivedAttributes(this);
    this.storableGoodsTypeList.clear();
    this.farmedGoodsTypeList.clear();
    this.foodGoodsTypeList.clear();
    this.newWorldGoodsTypeList.clear();
    this.newWorldLuxuryGoodsTypeList.clear();
    this.libertyGoodsTypeList.clear();
    this.immigrationGoodsTypeList.clear();
    this.rawBuildingGoodsTypeList.clear();
    this.rawMaterialsForUnstorableBuildingMaterials.clear();
    this.rawMaterialsForStorableBuildingMaterials.clear();
    for (const $it2 = this.goodsTypeList.iterator(); $it2.hasNext(); ) {
      let goodsType = $it2.next();
      if (goodsType.isStorable()) {
        this.storableGoodsTypeList.add(goodsType);
      }
      if (goodsType.isFarmed()) {
        this.farmedGoodsTypeList.add(goodsType);
      }
      if (goodsType.isFoodType()) {
        this.foodGoodsTypeList.add(goodsType);
      }
      if (goodsType.isNewWorldGoodsType()) {
        this.newWorldGoodsTypeList.add(goodsType);
        if (goodsType.isNewWorldLuxuryType()) {
          this.newWorldLuxuryGoodsTypeList.add(goodsType);
        }
      }
      if (goodsType.isLibertyType()) {
        this.libertyGoodsTypeList.add(goodsType);
      }
      if (goodsType.isImmigrationType()) {
        this.immigrationGoodsTypeList.add(goodsType);
      }
      if (goodsType.isRawBuildingMaterial() && !goodsType.isFoodType()) {
        this.rawBuildingGoodsTypeList.add(goodsType);
        if (!goodsType.isRawMaterialForUnstorableBuildingMaterial()) {
          this.rawMaterialsForStorableBuildingMaterials.add(goodsType);
        }
      }
      if (goodsType.isRawMaterialForUnstorableBuildingMaterial() && !goodsType.isFoodType()) {
        this.rawMaterialsForUnstorableBuildingMaterials.add(goodsType);
      }
    }
    this.REFNations.clear();
    this.europeanNations.clear();
    this.indianNations.clear();
    for (const $it3 = this.nations.iterator(); $it3.hasNext(); ) {
      let nation = $it3.next();
      if (nation.isUnknownEnemy()) {
        continue;
      }
      if (nation.getType().isEuropean()) {
        if (nation.getType().isREF()) {
          this.REFNations.add(nation);
        } else {
          this.europeanNations.add(nation);
        }
      } else {
        this.indianNations.add(nation);
      }
    }
    this.nationTypes.clear();
    this.nationTypes.addAll(this.indianNationTypes);
    this.nationTypes.addAll(this.europeanNationTypes);
    this.REFNationTypes.addAll(CollectionUtils.transform$Collection$Predicate(this.europeanNationTypes, ($p0) => $p0.isREF()));
    this.europeanNationTypes.removeAll(this.REFNationTypes);
    this.experts.clear();
    this.unitTypesTrainedInEurope.clear();
    this.unitTypesPurchasedInEurope.clear();
    this.defaultUnitTypes.clear();
    let bestLandValue = -1;
    let bestNavalValue = -1;
    for (const $it4 = this.unitTypeList.iterator(); $it4.hasNext(); ) {
      let unitType = $it4.next();
      if (unitType.isDefaultUnitType()) {
        this.defaultUnitTypes.add(unitType);
      }
      if (unitType.needsGoodsToBuild() && !unitType.hasAbility$String(Ability.BORN_IN_COLONY)) {
        this.buildableUnitTypes.add(unitType);
      }
      if (unitType.getExpertProduction() != null) {
        this.experts.put(unitType.getExpertProduction(), unitType);
      }
      if (unitType.hasPrice()) {
        if (unitType.getSkill() > 0) {
          this.unitTypesTrainedInEurope.add(unitType);
        } else if (!unitType.hasSkill()) {
          this.unitTypesPurchasedInEurope.add(unitType);
        }
      }
      if (unitType.isNaval()) {
        if (bestNavalValue < unitType.getMovement()) {
          bestNavalValue = unitType.getMovement();
          this.fastestNavalUnitType = unitType;
        }
      } else {
        if (bestLandValue < unitType.getMovement()) {
          bestLandValue = unitType.getMovement();
          this.fastestLandUnitType = unitType;
        }
      }
    }
    for (const $it5 = this.allOptionGroups.values().iterator(); $it5.hasNext(); ) {
      let og = $it5.next();
      og.generateChoices();
    }
    Turn.initialize(this.getInteger(GameOptions.STARTING_YEAR), this.getInteger(GameOptions.SEASON_YEAR), this.getInteger(GameOptions.SEASONS));
    let badAges = !this.hasOption(GameOptions.AGES, $J.cls(TextOption));
    let agesValue = '';
    if (!badAges) {
      agesValue = this.getText(GameOptions.AGES);
      let a = JString.split(agesValue, ',');
      badAges = a.length !== ((Specification.NUMBER_OF_AGES - 1) | 0);
      if (!badAges) {
        try {
          this.ages[0] = 1;
          this.ages[1] = Turn.yearToTurn$int($J.parseInt(a[0]));
          this.ages[2] = Turn.yearToTurn$int($J.parseInt(a[1]));
          if (this.ages[1] < 1 || this.ages[2] < 1) {
            badAges = true;
          } else if (this.ages[1] > this.ages[2]) {
            let tmp = this.ages[1];
            this.ages[1] = this.ages[2];
            this.ages[2] = tmp;
          }
        } catch ($e6) {
          if ($J.isa($e6, NumberFormatException)) {
            let nfe = $J.exc($e6);
            badAges = true;
          } else {
            throw $e6;
          }
        }
      }
    }
    if (badAges) {
      Specification.logger.warning('Bad ages: ' + agesValue);
      this.ages[0] = 1;
      this.ages[1] = Turn.yearToTurn$int(1600);
      this.ages[2] = Turn.yearToTurn$int(1700);
    }
    let customsOnCoast = this.getBoolean(GameOptions.CUSTOMS_ON_COAST);
    for (const $it7 = CollectionUtils.iterable(this.getBuildingType('model.building.customHouse').getAbilities$String(Ability.COASTAL_ONLY)).iterator(); $it7.hasNext(); ) {
      let a = $it7.next();
      a.setValue(customsOnCoast);
    }
    let sb = new StringBuilder(1024);
    sb.append('Specification clean following ').append(why).append(' complete, starting year=').append(String(Turn.getStartingYear())).append(', season year=').append(String(Turn.getSeasonYear())).append(', ages=[').append(String(this.ages[0])).append(String.fromCharCode(44 /* ',' */)).append(String(this.ages[1])).append(String.fromCharCode(44 /* ',' */)).append(String(this.ages[2])).append('], seasons=').append(String(Turn.getSeasonNumber())).append(', difficulty=').append(this.difficultyLevel).append(', ').append(String(this.allTypes.size())).append(' Types').append(', ').append(String(this.allAbilities.size())).append(' Abilities').append(', ').append(String(this.buildingTypeList.size())).append(' BuildingTypes').append(', ').append(String(this.disasters.size())).append(' Disasters').append(', ').append(String(this.europeanNationTypes.size())).append(' EuropeanNationTypes').append(', ').append(String(this.events.size())).append(' Events').append(', ').append(String(this.foundingFathers.size())).append(' FoundingFathers').append(', ').append(String(this.goodsTypeList.size())).append(' GoodsTypes').append(', ').append(String(this.indianNationTypes.size())).append(' IndianNationTypes').append(', ').append(String(this.allModifiers.size())).append(' Modifiers').append(', ').append(String(this.nations.size())).append(' Nations').append(', ').append(String(this.allOptions.size())).append(' Options').append(', ').append(String(this.allOptionGroups.size())).append(' Option Groups').append(', ').append(String(this.resourceTypeList.size())).append(' ResourceTypes').append(', ').append(String(this.roles.size())).append(' Roles').append(', ').append(String(this.tileTypeList.size())).append(' TileTypes').append(', ').append(String(this.tileImprovementTypeList.size())).append(' TileImprovementTypes').append(', ').append(String(this.unitChangeTypeList.size())).append(' UnitChangeTypes').append(', ').append(String(this.unitTypeList.size())).append(' UnitTypes').append(' read.');
    Specification.logger.info(sb.toString());
  }
  /**
   * Get the specification identifier.
   *
   * @return The specification identifier.
   */
  getId(): string {
    return this.id_;
  }
  /**
   * Get the specification version.
   *
   * @return The specification version.
   */
  getVersion(): string {
    return this.version;
  }
  /**
   * Get a {@code FreeColSpecObjectType} by id.
   *
   * @param id The identifier to look for.
   * @return The {@code FreeColSpecObjectType} found if any.
   */
  getType(id: string): FreeColSpecObjectType {
    return this.allTypes.get(id);
  }
  /**
   * Find a {@code FreeColSpecObjectType} by id and class.
   *
   * @param <T> The actual return type.
   * @param id The object identifier to look for.
   * @param returnClass The expected {@code Class}.
   * @return The {@code FreeColSpecObjectType} found if any.
   */
  getAlreadyInitializedType<T>(id: string, returnClass: JClass<T>): T {
    let ret = this.getType(id);
    return (ret == null) ? null : returnClass.cast(ret);
  }
  /**
   * Add a type by identifier.
   *
   * @param id The identifier to associate with.
   * @param type The {@code FreeColSpecObjectType} to add.
   */
  addType(id: string, type$: FreeColSpecObjectType): void {
    this.allTypes.put(id, type$);
  }
  /**
   * Remove reference to a type.
   *
   * @param id The type identifier to remove.
   * @return The removed {@code FreeColSpecObjectType}.
   */
  removeType(id: string): FreeColSpecObjectType {
    return this.allTypes.remove(id);
  }
  /**
   * Registers an Ability as defined.
   *
   * @param ability an {@code Ability} value
   */
  addAbility$Ability(ability: Ability): void {
    let id = ability.getId();
    this.addAbility$String(id);
    this.allAbilities.get(id).add(ability);
  }
  /**
   * Registers an Ability's id as defined.  This is useful for
   * abilities that are required rather than provided by
   * FreeColSpecObjectTypes.
   *
   * @param id The object identifier.
   */
  addAbility$String(id: string): void {
    if (!this.allAbilities.containsKey(id)) {
      this.allAbilities.put(id, new ArrayList());
    }
  }
  /**
   * Get all the Abilities with the given identifier.
   *
   * @param id The object identifier to look for.
   * @return A stream of {@code Ability}s.
   */
  getAbilities(id: string): Stream<Ability> {
    let result = this.allAbilities.get(id);
    return (result == null) ? Stream.empty() : result.stream();
  }
  /**
   * Add a modifier.
   *
   * @param modifier The {@code Modifier} to add.
   */
  addModifier(modifier: Modifier): void {
    let id = modifier.getId();
    if (!this.allModifiers.containsKey(id)) {
      this.allModifiers.put(id, new ArrayList());
    }
    this.allModifiers.get(id).add(modifier);
  }
  /**
   * Get all the Modifiers with the given identifier.
   *
   * @param id The object identifier to look for.
   * @return A stream of {@code Modifier}s.
   */
  getModifiers(id: string): Stream<Modifier> {
    let result = this.allModifiers.get(id);
    return (result == null) ? Stream.empty() : result.stream();
  }
  /**
   * Add a father, for test purposes.
   *
   * @param ff The {@code FoundingFather} to add.
   */
  addTestFather(ff: FoundingFather): void {
    this.addType(ff.getId(), ff);
    this.foundingFathers.add(ff);
  }
  /**
   * Disable editing of some critical option groups.
   */
  disableEditing(): void {
    for (let s of Specification.coreOptionGroups) {
      let og = this.allOptionGroups.get(s);
      if (og != null) {
        og.setEditable(false);
      }
    }
  }
  /**
   * Compare a spec version number with the current one.
   *
   * @param other The other spec version number.
   * @return Positive if the current version is greater than the other,
   *     negative if the current version is lower than the other,
   *     zero if they are equal.
   */
  compareVersion(other: string): number {
    let version = this.getVersion();
    if (version == null) {
      return 0;
    }
    let rex = '\\.';
    let sv = JString.split(version, rex, 2);
    let so = JString.split(other, rex, 2);
    if (sv.length === 2 && so.length === 2) {
      let cmp: number;
      try {
        cmp = $J.icmp($J.parseInt(sv[0]), $J.parseInt(so[0]));
        if (cmp !== 0) {
          return cmp;
        }
        return $J.icmp($J.parseInt(sv[1]), $J.parseInt(so[1]));
      } catch ($e8) {
        if ($J.isa($e8, NumberFormatException)) {
          let nfe = $J.exc($e8);
        } else {
          throw $e8;
        }
      }
    }
    throw new RuntimeException('Bad version: ' + other);
  }
  /**
   * {@inheritDoc}
   */
  hasOption<T>(id: string, returnClass: JClass<T>): boolean {
    if (id == null) {
      return false;
    }
    let val = this.allOptions.get(id);
    return (val == null) ? false : returnClass.isAssignableFrom(val.getClass());
  }
  /**
   * {@inheritDoc}
   */
  getOption$String$Class<T>(id: string, returnClass: JClass<T>): T {
    if (id == null) {
      throw new RuntimeException('Null identifier for ' + returnClass.getName());
    } else if (!this.allOptions.containsKey(id)) {
      throw new RuntimeException('Missing option: ' + id);
    } else {
      let op = this.allOptions.get(id);
      try {
        return returnClass.cast(op);
      } catch ($e9) {
        if ($J.isa($e9, ClassCastException)) {
          let cce = $J.exc($e9);
          throw new RuntimeException('Not a ' + returnClass.getName() + ': ' + id, cce);
        } else {
          throw $e9;
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getOptionGroup(id: string): OptionGroup {
    if (id == null) {
      throw new RuntimeException('OptionGroup with null id: ' + $J.str(this));
    } else if (!this.allOptionGroups.containsKey(id)) {
      throw new RuntimeException('Missing OptionGroup: ' + id);
    } else {
      return this.allOptionGroups.get(id);
    }
  }
  /**
   * Adds an {@code OptionGroup} to this specification.
   *
   * @param optionGroup The {@code OptionGroup} to add.
   * @param recursive If true, add recursively to subgroups.
   */
  addOptionGroup(optionGroup: OptionGroup, recursive: boolean): void {
    for (const $it10 = optionGroup.getOptions().iterator(); $it10.hasNext(); ) {
      let option = $it10.next();
      if (option instanceof OptionGroup) {
        this.allOptionGroups.put(option.getId(), option);
        if (recursive) {
          this.addOptionGroup(option, true);
        }
      } else {
        this.addAbstractOption(option);
      }
    }
  }
  /**
   * Adds an {@code AbstractOption} to this specification.
   *
   * @param abstractOption The {@code AbstractOption} to add.
   */
  addAbstractOption(abstractOption: AbstractOption): void {
    this.allOptions.put(abstractOption.getId(), abstractOption);
  }
  /**
   * Merge an option group into the spec.
   *
   * @param group The {@code OptionGroup} to merge.
   * @return The merged {@code OptionGroup} from this
   *     {@code Specification}.
   */
  mergeGroup(group: OptionGroup): OptionGroup {
    let realGroup = this.allOptionGroups.get(group.getId());
    if (realGroup == null || !realGroup.isEditable()) {
      return realGroup;
    }
    for (const $it11 = group.getOptions().iterator(); $it11.hasNext(); ) {
      let o = $it11.next();
      if (o instanceof OptionGroup) {
        this.mergeGroup(o);
      } else {
        realGroup.add(o);
      }
    }
    return realGroup;
  }
  /**
   * Gets the difficulty levels in this specification.
   *
   * @return A list of difficulty levels in this specification.
   */
  getDifficultyLevels(): List<OptionGroup> {
    let group = this.allOptionGroups.get(Specification.DIFFICULTY_LEVELS);
    let stream = (group == null) ? Stream.empty() : group.getOptions().stream();
    return CollectionUtils.transform$Stream$Predicate$Function(stream, (o) => o instanceof OptionGroup, (o) => o);
  }
  /**
   * Get the current difficulty level.
   *
   * @return The difficulty level.
   */
  getDifficultyLevel(): string {
    return this.difficultyLevel;
  }
  /**
   * Gets the current difficulty level options.
   *
   * @return The current difficulty level {@code OptionGroup}.
   */
  getDifficultyOptionGroup$(): OptionGroup {
    return this.getDifficultyOptionGroup$String(this.difficultyLevel);
  }
  /**
   * Gets difficulty level options by id.
   *
   * @param id The difficulty level identifier to look for.
   * @return The corresponding difficulty level {@code OptionGroup},
   *     if any.
   */
  getDifficultyOptionGroup$String(id: string): OptionGroup {
    return CollectionUtils.find$Collection$Predicate(this.getDifficultyLevels(), CollectionUtils.matchKeyEquals$Object$Function(id, ($p0) => $p0.getId()));
  }
  /**
   * Add/overwrite a difficulty option group.
   *
   * @param difficulty The {@code OptionGroup} to add.
   */
  setDifficultyOptionGroup(difficulty: OptionGroup): void {
    let group = this.allOptionGroups.get(Specification.DIFFICULTY_LEVELS);
    if (group != null) {
      group.add(difficulty);
    }
    this.allOptionGroups.put(difficulty.getId(), difficulty);
  }
  /**
   * Applies the difficulty level identified by the given String to
   * the current specification.
   *
   * @param difficulty The identifier of a difficulty level to apply.
   */
  applyDifficultyLevel$String(difficulty: string): void {
    this.applyDifficultyLevel$OptionGroup(this.getDifficultyOptionGroup$String(difficulty));
  }
  /**
   * Applies the given difficulty level to the current
   * specification.
   *
   * Public for the test suite.
   *
   * @param level The difficulty level {@code OptionGroup} to apply.
   */
  applyDifficultyLevel$OptionGroup(level: OptionGroup): void {
    if (level == null) {
      Specification.logger.warning('Null difficulty level supplied');
      return;
    }
    Specification.logger.config('Applying difficulty level ' + level.getId());
    this.addOptionGroup(level, true);
    this.difficultyLevel = level.getId();
  }
  getGameOptions(): OptionGroup {
    return this.getOptionGroup(GameOptions.TAG);
  }
  setGameOptions(go: OptionGroup): void {
    this.allOptionGroups.put(GameOptions.TAG, go);
    this.addOptionGroup(go, true);
  }
  getMapGeneratorOptions(): OptionGroup {
    return this.getOptionGroup(MapGeneratorOptions.TAG);
  }
  setMapGeneratorOptions(mgo: OptionGroup): void {
    this.allOptionGroups.put(MapGeneratorOptions.TAG, mgo);
    this.addOptionGroup(mgo, true);
  }
  /**
   * Update the game and map options from the user configuration files.
   *
   * @return True if any option was fixed.
   */
  updateGameAndMapOptions(): boolean {
    let ret = false;
    return ret;
  }
  /**
   * Generate the dynamic options.
   *
   * Only call this in the server.  If clients call it the European
   * prices can be desynchronized.
   */
  generateDynamicOptions(): void {
    Specification.logger.finest('Generating dynamic options.');
    let prices = new OptionGroup()._OptionGroup$String$Specification(GameOptions.GAMEOPTIONS_PRICES, this);
    this.allOptionGroups.put(prices.getId(), prices);
    for (const $it12 = this.goodsTypeList.iterator(); $it12.hasNext(); ) {
      let goodsType = $it12.next();
      let name = goodsType.getSuffix$String('model.goods.');
      let base = 'model.option.' + name + '.';
      if (goodsType.getInitialSellPrice() > 0) {
        let diff = (goodsType.isNewWorldGoodsType() || goodsType.isNewWorldLuxuryType()) ? 3 : 0;
        let minimum = new IntegerOption()._IntegerOption$String$Specification(base + 'minimumPrice', this);
        minimum.setValue$Object(goodsType.getInitialSellPrice());
        minimum.setMinimumValue(1);
        minimum.setMaximumValue(100);
        prices.add(minimum);
        this.addAbstractOption(minimum);
        let maximum = new IntegerOption()._IntegerOption$String$Specification(base + 'maximumPrice', this);
        maximum.setValue$Object((goodsType.getInitialSellPrice() + diff) | 0);
        maximum.setMinimumValue(1);
        maximum.setMaximumValue(100);
        prices.add(maximum);
        this.addAbstractOption(maximum);
        let spread = new IntegerOption()._IntegerOption$String$Specification(base + 'spread', this);
        spread.setValue$Object(goodsType.getPriceDifference());
        spread.setMinimumValue(1);
        spread.setMaximumValue(100);
        prices.add(spread);
        this.addAbstractOption(spread);
      } else if (goodsType.getPrice() < Constants.INFINITY) {
        let price = new IntegerOption()._IntegerOption$String$Specification(base + 'price', this);
        price.setValue$Object(goodsType.getPrice());
        price.setMinimumValue(1);
        price.setMaximumValue(100);
        prices.add(price);
        this.addAbstractOption(price);
      }
    }
    this.getGameOptions().add(prices);
  }
  /**
   * Merge in a new set of game options.
   *
   * @param newGameOptions The new game options {@code OptionGroup}
   *     to merge.
   * @param who Where are we, client or server?
   * @return True if the merge succeeded.
   */
  mergeGameOptions(newGameOptions: OptionGroup, who: string): boolean {
    let go = this.getGameOptions();
    let lb = new LogBuilder()._LogBuilder(64);
    let ret = go.merge$Option$LogBuilder(newGameOptions, lb);
    lb.shrink('\n');
    lb.log(Specification.logger, Level.FINEST);
    if (!ret) {
      return false;
    }
    this.addOptionGroup(go, true);
    this.clean('merged game options (' + who + ')');
    return true;
  }
  /**
   * Merge in a new set of map options.
   *
   * @param newMapGeneratorOptions The new game options
   *     {@code OptionGroup} to merge.
   * @param who Where are we, client or server?
   * @return True if the merge succeeded.
   */
  mergeMapGeneratorOptions(newMapGeneratorOptions: OptionGroup, who: string): boolean {
    let go = this.getMapGeneratorOptions();
    let lb = new LogBuilder()._LogBuilder(64);
    let ret = go.merge$Option$LogBuilder(newMapGeneratorOptions, lb);
    lb.shrink('\n');
    lb.log(Specification.logger, Level.FINEST);
    if (!ret) {
      return false;
    }
    this.addOptionGroup(go, true);
    this.clean('merged map options (' + who + ')');
    return true;
  }
  /**
   * Gets the age corresponding to a given turn.
   *
   * @param turn The {@code Turn} to check.
   * @return The age of the given turn.
   */
  getAge(turn: Turn): number {
    let n = turn.getNumber();
    return (n < this.ages[0]) ? -1 : (n < this.ages[1]) ? 0 : (n < this.ages[2]) ? 1 : 2;
  }
  getBuildableType(id: string): BuildableType {
    return this.getAlreadyInitializedType(id, $J.cls(BuildableType));
  }
  getBuildingTypeList(): List<BuildingType> {
    return this.buildingTypeList;
  }
  /**
   * Get a building type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code BuildingType} found.
   */
  getBuildingType(id: string): BuildingType {
    return this.getAlreadyInitializedType(id, $J.cls(BuildingType));
  }
  getDisasters(): List<Disaster> {
    return this.disasters;
  }
  /**
   * Get a disaster by identifier.
   *
   * @param id The object identifier.
   * @return The {@code Disaster} found.
   */
  getDisaster(id: string): Disaster {
    return this.getAlreadyInitializedType(id, $J.cls(Disaster));
  }
  getEvents(): List<Event> {
    return this.events;
  }
  /**
   * Get an event by identifier.
   *
   * @param id The object identifier.
   * @return The {@code Event} found.
   */
  getEvent(id: string): Event {
    return this.getAlreadyInitializedType(id, $J.cls(Event));
  }
  getFoundingFathers(): List<FoundingFather> {
    return this.foundingFathers;
  }
  /**
   * Get a founding father type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code FoundingFather} found.
   */
  getFoundingFather(id: string): FoundingFather {
    return this.getAlreadyInitializedType(id, $J.cls(FoundingFather));
  }
  getGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.goodsTypeList);
  }
  getStorableGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.storableGoodsTypeList);
  }
  getFarmedGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.farmedGoodsTypeList);
  }
  getNewWorldGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.newWorldGoodsTypeList);
  }
  getNewWorldLuxuryGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.newWorldLuxuryGoodsTypeList);
  }
  getLibertyGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.libertyGoodsTypeList);
  }
  getImmigrationGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.immigrationGoodsTypeList);
  }
  getFoodGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.foodGoodsTypeList);
  }
  getRawBuildingGoodsTypeList(): List<GoodsType> {
    return new ArrayList(this.rawBuildingGoodsTypeList);
  }
  getRawMaterialsForUnstorableBuildingMaterials(): List<GoodsType> {
    return new ArrayList(this.rawMaterialsForUnstorableBuildingMaterials);
  }
  getRawMaterialsForStorableBuildingMaterials(): List<GoodsType> {
    return new ArrayList(this.rawMaterialsForStorableBuildingMaterials);
  }
  /**
   * Get the primary food type.
   *
   * FIXME: The "Food" type is handled as a special case in many
   * places.  This routine was added to collect them into one place,
   * in the hope we can one day deprecate this routine and clean up
   * the special cases.
   *
   * @return The main food type.
   */
  getPrimaryFoodType(): GoodsType {
    return this.getGoodsType(Specification.DEFAULT_FOOD_TYPE);
  }
  /**
   * Get the initial <em>minimum</em> price of the given goods
   * type. The initial price in a particular Market may be higher.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return The minimum price.
   */
  getInitialPrice(goodsType: GoodsType): number {
    let suffix = goodsType.getSuffix$String('model.goods.');
    let minPrice = 'model.option.' + suffix + '.minimumPrice';
    let maxPrice = 'model.option.' + suffix + '.maximumPrice';
    return (this.hasOption(minPrice, $J.cls(IntegerOption)) && this.hasOption(maxPrice, $J.cls(IntegerOption))) ? Math.min(this.getInteger(minPrice), this.getInteger(maxPrice)) : goodsType.getInitialSellPrice();
  }
  /**
   * Get a goods type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code GoodsType} found.
   */
  getGoodsType(id: string): GoodsType {
    return this.getAlreadyInitializedType(id, $J.cls(GoodsType));
  }
  getTileImprovementTypeList(): List<TileImprovementType> {
    return this.tileImprovementTypeList;
  }
  /**
   * Get a tile improvement type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code TileImprovementType} found.
   */
  getTileImprovementType(id: string): TileImprovementType {
    return this.getAlreadyInitializedType(id, $J.cls(TileImprovementType));
  }
  getNationTypes(): List<NationType> {
    return this.nationTypes;
  }
  getEuropeanNationTypes(): List<EuropeanNationType> {
    return this.europeanNationTypes;
  }
  getVisibleEuropeanNationTypes(): List<EuropeanNationType> {
    return this.europeanNationTypes.stream().filter((type$) => !$J.equals('model.nationType.optionOnly', type$.getId())).collect(Collectors.toList());
  }
  getREFNationTypes(): List<EuropeanNationType> {
    return this.REFNationTypes;
  }
  getIndianNationTypes(): List<IndianNationType> {
    return this.indianNationTypes;
  }
  /**
   * Get a nation type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code NationType} found.
   */
  getNationType(id: string): NationType {
    return this.getAlreadyInitializedType(id, $J.cls(NationType));
  }
  getDefaultNationType(): NationType {
    return this.getNationType(Specification.DEFAULT_NATION_TYPE);
  }
  getNations(): List<Nation> {
    return this.nations;
  }
  getEuropeanNations(): List<Nation> {
    return this.europeanNations;
  }
  getIndianNations(): List<Nation> {
    return this.indianNations;
  }
  getREFNations(): List<Nation> {
    return this.REFNations;
  }
  /**
   * Get a nation by identifier.
   *
   * @param id The object identifier.
   * @return The {@code Nation} found.
   */
  getNation(id: string): Nation {
    return this.getAlreadyInitializedType(id, $J.cls(Nation));
  }
  /**
   * Get the special unknown enemy nation.
   *
   * @return The unknown enemy {@code Nation}.
   */
  getUnknownEnemyNation(): Nation {
    return this.getNation(Nation.UNKNOWN_NATION_ID);
  }
  /**
   * Clear all European advantages.  Implements the Advantages==NONE setting.
   */
  clearEuropeanNationalAdvantages(): void {
    for (const $it13 = this.getEuropeanNations().iterator(); $it13.hasNext(); ) {
      let n = $it13.next();
      n.setType(this.getDefaultNationType());
    }
  }
  getResourceTypeList(): List<ResourceType> {
    return this.resourceTypeList;
  }
  /**
   * Get a resource type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code ResourceType} found.
   */
  getResourceType(id: string): ResourceType {
    return this.getAlreadyInitializedType(id, $J.cls(ResourceType));
  }
  /**
   * Get all the available roles.
   *
   * @return A list of available {@code Role}s.
   */
  getRolesList(): List<Role> {
    return this.roles;
  }
  /**
   * Get all the available roles as a stream.
   *
   * @return A stream of available {@code Role}s.
   */
  getRoles(): Stream<Role> {
    return this.getRolesList().stream();
  }
  /**
   * Get a role by identifier.
   *
   * @param id The object identifier.
   * @return The {@code Role} found.
   */
  getRole(id: string): Role {
    return this.getAlreadyInitializedType(id, $J.cls(Role));
  }
  /**
   * Get the default role.
   *
   * @return The default {@code Role}.
   */
  getDefaultRole(): Role {
    return this.getRole(Specification.DEFAULT_ROLE_ID);
  }
  /**
   * Get the military roles in this specification, in decreasing order
   * of effectiveness.
   *
   * @return An unmodifiable list of military {@code Role}s.
   */
  getMilitaryRolesList(): List<Role> {
    if (this.militaryRoles == null) {
      this.militaryRoles = Collections.unmodifiableList(CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.roles, ($p0) => $p0.isOffensive(), JFunction.identity(), Role.militaryComparator));
    }
    return this.militaryRoles;
  }
  /**
   * Get the available military roles as a stream.
   *
   * @return A stream of military {@code Role}s.
   */
  getMilitaryRoles(): Stream<Role> {
    return this.getMilitaryRolesList().stream();
  }
  /**
   * Gets the roles suitable for a REF unit.
   *
   * @param naval If true, choose roles for naval units, if not, land units.
   * @return A list of {@code Role}s suitable for REF units.
   */
  getREFRolesList(naval: boolean): List<Role> {
    return CollectionUtils.transform$Stream$Predicate(((naval) ? Stream.of(this.getDefaultRole()) : this.getMilitaryRoles()), (r) => r.requiresAbility(Ability.REF_UNIT));
  }
  /**
   * Gets the roles suitable for a REF unit as a stream.
   *
   * @param naval If true, choose roles for naval units, if not, land units.
   * @return A stream of {@code Role}s suitable for REF units.
   */
  getREFRoles(naval: boolean): Stream<Role> {
    return this.getREFRolesList(naval).stream();
  }
  /**
   * Get a role with an ability.
   *
   * @param id The ability identifier to look for.
   * @param roles An optional list of {@code Role}s to look in,
   *     if null all roles are used.
   * @return The first {@code Role} found with the required
   *     ability, or null if none found.
   */
  getRoleWithAbility(id: string, roles: List<Role>): Role {
    return CollectionUtils.find$Stream$Predicate(this.getRoles(), (r) => r.hasAbility$String(id));
  }
  /**
   * Get the missionary role.
   *
   * @return The missionary {@code Role}.
   */
  getMissionaryRole(): Role {
    return this.getRoleWithAbility(Ability.ESTABLISH_MISSION, null);
  }
  /**
   * Get the pioneer role.
   *
   * @return The pioneer {@code Role}.
   */
  getPioneerRole(): Role {
    return this.getRoleWithAbility(Ability.IMPROVE_TERRAIN, null);
  }
  /**
   * Get the scout role.
   *
   * @return The scout {@code Role}.
   */
  getScoutRole(): Role {
    return this.getRoleWithAbility(Ability.SPEAK_WITH_CHIEF, null);
  }
  getTileTypeList(): List<TileType> {
    return this.tileTypeList;
  }
  getHillsTileTypeList(): List<TileType> {
    return this.getTileTypeList().stream().filter((t) => t.isHills()).collect(Collectors.toList());
  }
  getMountainsTileTypeList(): List<TileType> {
    return this.getTileTypeList().stream().filter((t) => t.isMountains()).collect(Collectors.toList());
  }
  /**
   * Get a tile type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code TileType} found.
   */
  getTileType(id: string): TileType {
    return this.getAlreadyInitializedType(id, $J.cls(TileType));
  }
  /**
   * Get the list of all unit change types.
   *
   * @return The unit change type list.
   */
  getUnitChangeTypeList(): List<UnitChangeType> {
    return this.unitChangeTypeList;
  }
  /**
   * Get a specific type of unit change type.
   *
   * Suitable indexing constants are in UnitChangeType.
   *
   * @param id The identifier for the required change type.
   * @return The {@code UnitChangeType} found, or null if none present.
   */
  getUnitChangeType(id: string): UnitChangeType {
    return CollectionUtils.find$Collection$Predicate(this.unitChangeTypeList, CollectionUtils.matchKeyEquals$Object$Function(id, ($p0) => $p0.getId()));
  }
  /**
   * Get a specific unit change for a given unit change type and
   * source unit type to change.
   *
   * Suitable indexing constants are in UnitChangeType.
   *
   * @param id The identifier for the required change type.
   * @param fromType The {@code UnitType} to change.
   * @return A list of {@code UnitChange}s.
   */
  getUnitChanges(id: string, fromType: UnitType): List<UnitTypeChange> {
    let uct = this.getUnitChangeType(id);
    return (uct == null) ? Collections.emptyList() : uct.getUnitChanges(fromType);
  }
  /**
   * Get a specific unit change for a given unit change type, a
   * source unit type to change, and a destination unit type.
   *
   * Suitable indexing constants are in UnitChangeType.
   *
   * @param id The identifier for the required change type.
   * @param fromType The {@code UnitType} to change from.
   * @return The {@code UnitChange} found, or null if the
   *     change is impossible.
   */
  getUnitChange$String$UnitType(id: string, fromType: UnitType): UnitTypeChange {
    return this.getUnitChange$String$UnitType$UnitType(id, fromType, null);
  }
  /**
   * Get a specific unit change for a given unit change type, a
   * source unit type to change, and a destination unit type.
   *
   * Suitable indexing constants are in UnitChangeType.
   *
   * @param id The identifier for the required change type.
   * @param fromType The {@code UnitType} to change from.
   * @param toType The {@code UnitType} to change to.
   * @return The {@code UnitChange} found, or null if the
   *     change is impossible.
   */
  getUnitChange$String$UnitType$UnitType(id: string, fromType: UnitType, toType: UnitType): UnitTypeChange {
    let uct = this.getUnitChangeType(id);
    return (uct == null) ? null : uct.getUnitChange(fromType, toType);
  }
  /**
   * Gets the number of turns a unit has to train to educate a student.
   * This value is only meaningful for units that can be put in a school.
   *
   * @param typeTeacher The teacher {@code UnitType}.
   * @param typeStudent the student {@code UnitType}.
   * @return The turns of training needed.
   */
  getNeededTurnsOfTraining(typeTeacher: UnitType, typeStudent: UnitType): number {
    let learn = typeStudent.getTeachingType(typeTeacher);
    if (learn == null) {
      throw new RuntimeException('Can not learn: teacher=' + $J.str(typeTeacher) + ' student=' + $J.str(typeStudent));
    }
    return this.getUnitChange$String$UnitType$UnitType(UnitChangeType.EDUCATION, typeStudent, learn).turns;
  }
  getUnitTypeList(): List<UnitType> {
    return this.unitTypeList;
  }
  /**
   * Get the most vanilla unit type for a given player.
   *
   * @param player The {@code Player} to find the default
   *     unit type for, or null indicating a normal player nation
   *     (i.e. non-REF European).
   * @return The default unit type.
   */
  getDefaultUnitType$Player(player: Player): UnitType {
    return (player == null) ? this.getDefaultUnitType$() : this.getDefaultUnitType$NationType(player.getNationType());
  }
  /**
   * Get the most vanilla unit type for a type of nation.
   *
   * Provides a type to use to make a neutral comparison of the
   * productivity of work locations.
   *
   * @param nationType The {@code NationType} to find the default
   *     unit type for, or null indicating a normal player nation
   *     (i.e. non-REF European).
   * @return The free colonist unit type.
   */
  getDefaultUnitType$NationType(nationType: NationType): UnitType {
    let p = (nationType == null) ? ((ut) => !ut.hasAbility$String(Ability.BORN_IN_INDIAN_SETTLEMENT) && !ut.hasAbility$String(Ability.REF_UNIT)) : (nationType.isIndian()) ? ((ut) => ut.hasAbility$String(Ability.BORN_IN_INDIAN_SETTLEMENT) && !ut.hasAbility$String(Ability.REF_UNIT)) : (nationType.isREF()) ? ((ut) => !ut.hasAbility$String(Ability.BORN_IN_INDIAN_SETTLEMENT) && ut.hasAbility$String(Ability.REF_UNIT)) : (ut) => !ut.hasAbility$String(Ability.BORN_IN_INDIAN_SETTLEMENT) && !ut.hasAbility$String(Ability.REF_UNIT);
    return CollectionUtils.find$Collection$Predicate$Object(this.defaultUnitTypes, p, this.getDefaultUnitType$());
  }
  /**
   * Get the most vanilla unit type.
   *
   * @return The default unit type.
   */
  getDefaultUnitType$(): UnitType {
    return this.getUnitType('model.unit.freeColonist');
  }
  /**
   * Get the list of buildable unit types.
   *
   * @return The list of buildable unit types.
   */
  getBuildableUnitTypes(): List<UnitType> {
    return this.buildableUnitTypes;
  }
  /**
   * Get the unit type that is the expert for producing a type of goods.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return The expert {@code UnitType}, or null if none.
   */
  getExpertForProducing(goodsType: GoodsType): UnitType {
    return this.experts.get(goodsType);
  }
  /**
   * Get the unit types which have any of the given abilities
   *
   * @param abilities The abilities for the search
   * @return A list of {@code UnitType}s with the abilities.
   */
  getUnitTypesWithAbility(abilities: string[]): List<UnitType> {
    return this.getTypesWithAbility($J.cls(UnitType), abilities);
  }
  /**
   * Get the unit types which have none of the given abilities
   *
   * @param abilities The abilities for the search
   * @return A list of {@code UnitType}s without the abilities.
   */
  getUnitTypesWithoutAbility(abilities: string[]): List<UnitType> {
    return this.getTypesWithoutAbility($J.cls(UnitType), abilities);
  }
  /**
   * Gets the unit types that can be trained in Europe.
   *
   * @param player The player that want to purchase the unit.
   * @return A list of Europe-trainable {@code UnitType}s.
   */
  getUnitTypesTrainedInEurope(player: Player): List<UnitType> {
    return this.unitTypesTrainedInEurope.stream().filter((type$) => type$.isAvailableTo([player])).collect(Collectors.toList());
  }
  /**
   * Get the unit types that can be purchased in Europe for a given player.
   *
   * @param player The player that want to purchase the unit.
   * @return A list of Europe-purchasable {@code UnitType}s.
   */
  getUnitTypesPurchasedInEurope(player: Player): List<UnitType> {
    return this.unitTypesPurchasedInEurope.stream().filter((type$) => type$.isAvailableTo([player])).collect(Collectors.toList());
  }
  /**
   * Gets the fastest land unit type in this specification.
   *
   * @return The fastest land unit type.
   */
  getFastestLandUnitType(): UnitType {
    return this.fastestLandUnitType;
  }
  /**
   * Gets the fastest naval unit type in this specification.
   *
   * @return The fastest naval unit type.
   */
  getFastestNavalUnitType(): UnitType {
    return this.fastestNavalUnitType;
  }
  /**
   * Gets the REF unit types.
   *
   * @param naval If true, choose naval units, if not, land units.
   * @return A list of {@code UnitType}s allowed for the REF.
   */
  getREFUnitTypes(naval: boolean): List<UnitType> {
    return CollectionUtils.transform$Collection$Predicate(this.getUnitTypesWithAbility([Ability.REF_UNIT]), CollectionUtils.matchKey$Object$Function(naval, ($p0) => $p0.isNaval()));
  }
  /**
   * Get a unit type by identifier.
   *
   * @param id The object identifier.
   * @return The {@code UnitType} found.
   */
  getUnitType(id: string): UnitType {
    return this.getAlreadyInitializedType(id, $J.cls(UnitType));
  }
  /**
   * Find the {@code FreeColSpecObjectType} with the given identifier.
   *
   * @param <T> The actual return type.
   * @param id The object identifier to look for.
   * @param returnClass The expected {@code Class}.
   * @return The {@code FreeColSpecObjectType} found.
   */
  findType<T>(id: string, returnClass: JClass<T>): T {
    let o = this.getAlreadyInitializedType(id, returnClass);
    if (o != null) {
      return o;
    }
    if (this.initialized) {
      throw new RuntimeException('Undefined FCGOT: ' + id);
    }
    o = this.newType(id, returnClass);
    this.addType(id, o);
    return o;
  }
  /**
   * Build a new {@code FreeColSpecObjectType} with given identifier
   * and class.
   *
   * @param <T> The actual return type.
   * @param id The identifier to look for.
   * @param returnClass The expected {@code Class}.
   * @return The new {@code FreeColSpecObjectType} or null on error.
   */
  newType<T>(id: string, returnClass: JClass<T>): T {
    try {
      return Introspector.instantiate$Class$ClassArr$ObjectArr(returnClass, Specification.newTypeClasses, [id, this]);
    } catch ($e14) {
      if ($J.isa($e14, Introspector$IntrospectorException)) {
        let ie = $J.exc($e14);
        Specification.logger.log(Level.WARNING, 'newType(' + id + ',' + returnClass.getName() + ') failed', ie);
      } else {
        throw $e14;
      }
    }
    return null;
  }
  /**
   * Get the FreeColSpecObjectTypes that provide the required ability.
   *
   * @param id The object identifier.
   * @param value The ability value to check.
   * @return A list of {@code FreeColSpecObjectType}s that
   *     provide the required ability.
   */
  getTypesProviding(id: string, value: boolean): List<FreeColSpecObjectType> {
    return CollectionUtils.transform$Stream$Predicate$Function(this.getAbilities(id), (a) => a.getValue() === value && a.getSource() instanceof FreeColSpecObjectType, (a) => a.getSource());
  }
  /**
   * Get all types which have any of the given abilities.
   *
   * @param <T> The actual return type.
   * @param resultType The expected result type.
   * @param abilities The abilities for the search.
   * @return A list of {@code FreeColSpecObjectType}s with at
   *     least one of the given abilities.
   */
  getTypesWithAbility<T>(resultType: JClass<T>, abilities: string[]): List<T> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.allTypes.values(), (type$) => resultType.isInstance(type$) && !type$.isAbstractType() && (CollectionUtils.any$ObjectArr$Predicate(abilities, (a) => type$.hasAbility$String(a))), (type$) => resultType.cast(type$));
  }
  /**
   * Get all types which have none of the given abilities.
   *
   * @param <T> The actual return type.
   * @param resultType The expected result type.
   * @param abilities The abilities for the search
   * @return A list of {@code FreeColSpecObjectType}s without the
   *     given abilities.
   */
  getTypesWithoutAbility<T>(resultType: JClass<T>, abilities: string[]): List<T> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.allTypes.values(), (type$) => resultType.isInstance(type$) && !type$.isAbstractType() && (CollectionUtils.none$ObjectArr$Predicate(abilities, (a) => type$.hasAbility$String(a))), (type$) => resultType.cast(type$));
  }
  /**
   * Apply all the special fixes to bring older specifications up to date.
   *
   * @return True if a change was made.
   */
  applyFixes(): boolean {
    let ret = false;
    ret = !!(ret | this.fixDifficultyOptions());
    ret = !!(ret | this.fixGameOptions());
    ret = !!(ret | this.fixMapGeneratorOptions());
    ret = !!(ret | this.fixOrphanOptions());
    ret = !!(ret | this.fixRoles());
    ret = !!(ret | this.fixUnitChanges());
    ret = !!(ret | this.fixSpec());
    return ret;
  }
  /**
   * Find and remove orphan options/groups that are not part of the
   * core tree of options.
   *
   * @return True if a fix was made.
   */
  fixOrphanOptions(): boolean {
    let allO = new HashSet(this.allOptions.values());
    let allG = new HashSet(this.allOptionGroups.values());
    for (let id of Specification.coreOptionGroups) {
      this.dropOptions(this.allOptionGroups.get(id), allO);
      this.dropOptions(this.allOptionGroups.get(id), allG);
    }
    for (const $it15 = allO.iterator(); $it15.hasNext(); ) {
      let ao = $it15.next();
      this.dropOptions(ao, this.allOptions.values());
      if (ao instanceof OptionGroup) {
        this.allOptionGroups.remove(ao.getId());
      }
      Specification.logger.warning('Dropping orphan option: ' + $J.str(ao));
    }
    for (const $it16 = allG.iterator(); $it16.hasNext(); ) {
      let ao = $it16.next();
      this.allOptionGroups.remove(ao.getId());
      Specification.logger.warning('Dropping orphan option group: ' + $J.str(ao));
    }
    return !allO.isEmpty() || !allG.isEmpty();
  }
  /**
   * Drop an option and its descendents from a collection.
   *
   * @param o The {@code AbstractOption} to drop.
   * @param all The collection of options to drop from.
   */
  dropOptions(o: AbstractOption, all: Collection<AbstractOption>): void {
    all.remove(o);
    if (o instanceof OptionGroup) {
      let og = o;
      for (const $it17 = og.getOptions().iterator(); $it17.hasNext(); ) {
        let op = $it17.next();
        if (op instanceof AbstractOption) {
          this.dropOptions(op, all);
        }
      }
    }
  }
  /**
   * Handle the reworking of roles that landed in 0.11.0.
   *
   * Deliberately not part of applyFixes(), this is called from readFromXML
   * which can most accurately determine whether it is needed.
   *
   * @return True if a fix was made.
   */
  fixRoles(): boolean {
    if (!this.roles.isEmpty()) {
      return false;
    }
    if (this.compareVersion('0.85') > 0) {
      return false;
    }
    let rolf = FreeColDirectories.getCompatibilityFile(Specification.ROLES_COMPAT_FILE_NAME);
    {
      try {
        const fis = Files.newInputStream(rolf.toPath());
        try {
          this.load(fis);
        } finally {
          if (fis != null) fis.close();
        }
      } catch ($e18) {
        if ($J.isa($e18, IOException) || $J.isa($e18, XMLStreamException)) {
          let e = $J.exc($e18);
          Specification.logger.log(Level.WARNING, 'Failed to load remedial roles.', e);
          return false;
        } else {
          throw $e18;
        }
      }
    }
    Specification.logger.info('Loading role backward compatibility fragment: ' + Specification.ROLES_COMPAT_FILE_NAME + ' with roles: ' + CollectionUtils.transform$Stream$Predicate$Function$Collector(this.getRoles(), CollectionUtils.alwaysTrue(), ($p0) => $p0.getId(), Collectors.joining(' ')));
    return true;
  }
  fixUnitChanges(): boolean {
    if (this.compareVersion('0.116') > 0) {
      return false;
    }
    let enter = CollectionUtils.find$Collection$Predicate(this.unitChangeTypeList, CollectionUtils.matchKeyEquals$Object$Function(UnitChangeType.ENTER_COLONY, ($p0) => $p0.getId()));
    let uctf = FreeColDirectories.getCompatibilityFile(Specification.UNIT_CHANGE_TYPES_COMPAT_FILE_NAME);
    {
      try {
        const fis = Files.newInputStream(uctf.toPath());
        try {
          this.load(fis);
        } finally {
          if (fis != null) fis.close();
        }
      } catch ($e19) {
        if ($J.isa($e19, IOException) || $J.isa($e19, XMLStreamException)) {
          let e = $J.exc($e19);
          Specification.logger.log(Level.WARNING, 'Failed to load unit changes.', e);
          return false;
        } else {
          throw $e19;
        }
      }
    }
    if (enter != null) {
      this.unitChangeTypeList.add(enter);
    }
    Specification.logger.info('Loading unit-changes backward compatibility fragment: ' + Specification.UNIT_CHANGE_TYPES_COMPAT_FILE_NAME + ' with changes: ' + CollectionUtils.transform$Collection$Predicate$Function$Collector(this.getUnitChangeTypeList(), CollectionUtils.alwaysTrue(), ($p0) => $p0.getId(), Collectors.joining(' ')));
    return true;
  }
  /**
   * Backward compatibility for the Specification in general.
   *
   * @return True if a fix was made.
   */
  fixSpec(): boolean {
    let ret = false;
    let ue = this.findType(Nation.UNKNOWN_NATION_ID, $J.cls(Nation));
    ue.setType(this.getNationType('model.nationType.default'));
    if (!this.nations.contains(ue)) {
      this.nations.add(ue);
      ret = true;
    }
    for (const $it20 = this.nations.iterator(); $it20.hasNext(); ) {
      let nation = $it20.next();
      if (nation.getColor() == null) {
        nation.setColor(Specification.defaultColors.get(nation.getId()));
        ret = true;
      }
    }
    let coronado = this.getFoundingFather('model.foundingFather.franciscoDeCoronado');
    if ($J.equals('freecol', this.getId()) && !coronado.hasAbility$String(Ability.SEE_ALL_COLONIES)) {
      coronado.addAbility(new Ability()._Ability$String$FreeColSpecObjectType$boolean(Ability.SEE_ALL_COLONIES, coronado, true));
      ret = true;
    }
    for (const $it21 = this.getDifficultyLevels().iterator(); $it21.hasNext(); ) {
      let level = $it21.next();
      let monarch = level.getOption$String(GameOptions.DIFFICULTY_MONARCH);
      let refSize = (((monarch instanceof OptionGroup) ? monarch : level)).getOption$String(GameOptions.REF_FORCE);
      if (!(refSize instanceof UnitListOption)) {
        continue;
      }
      let changed: boolean;
      for (const $it22 = (refSize).getOptionValues().iterator(); $it22.hasNext(); ) {
        let au = $it22.next();
        changed = true;
        if ($J.equals('DEFAULT', au.getRoleId())) {
          au.setRoleId(Specification.DEFAULT_ROLE_ID);
        } else if ($J.equals('model.role.soldier', au.getRoleId()) || $J.equals('SOLDIER', au.getRoleId())) {
          au.setRoleId('model.role.infantry');
        } else if ($J.equals('model.role.dragoon', au.getRoleId()) || $J.equals('DRAGOON', au.getRoleId())) {
          au.setRoleId('model.role.cavalry');
        } else {
          changed = false;
        }
        if (changed) {
          ret = true;
        }
      }
    }
    let todo = new ArrayList(this.getDifficultyLevels());
    while (!todo.isEmpty()) {
      let o = todo.removeAt(0);
      if (o instanceof OptionGroup) {
        let next = (o).getOptions();
        todo.addAll(new ArrayList(next));
      } else if (o instanceof UnitListOption) {
        let changed: boolean;
        for (const $it23 = (o).getOptionValues().iterator(); $it23.hasNext(); ) {
          let au = $it23.next();
          let roleId = au.getRoleId();
          changed = true;
          if (roleId == null) {
            au.setRoleId(Specification.DEFAULT_ROLE_ID);
          } else if (au.getRoleId().startsWith('model.role.')) {
            changed = false;
          } else if ($J.equals('DEFAULT', au.getRoleId())) {
            au.setRoleId(Specification.DEFAULT_ROLE_ID);
          } else if ($J.equals('DRAGOON', au.getRoleId())) {
            au.setRoleId('model.role.dragoon');
          } else if ($J.equals('MISSIONARY', au.getRoleId())) {
            au.setRoleId('model.role.missionary');
          } else if ($J.equals('PIONEER', au.getRoleId())) {
            au.setRoleId('model.role.pioneer');
          } else if ($J.equals('SCOUT', au.getRoleId())) {
            au.setRoleId('model.role.scout');
          } else if ($J.equals('SOLDIER', au.getRoleId())) {
            au.setRoleId('model.role.soldier');
          } else {
            au.setRoleId(Specification.DEFAULT_ROLE_ID);
          }
          if (changed) {
            ret = true;
          }
        }
      }
    }
    let goodsType = this.getGoodsType('model.goods.horses');
    if (!goodsType.getMilitary()) {
      goodsType.setMilitary();
      ret = true;
    }
    goodsType = this.getGoodsType('model.goods.muskets');
    if (!goodsType.getMilitary()) {
      goodsType.setMilitary();
      ret = true;
    }
    let bolivar = this.getFoundingFather('model.foundingFather.simonBolivar');
    let bolivarAdd = false;
    if (!bolivar.getEvents().isEmpty()) {
      bolivar.setEvents(Collections.emptyList());
      bolivarAdd = true;
    } else if (bolivar.hasModifier$String(Modifier.LIBERTY)) {
      bolivar.removeModifiers(Modifier.LIBERTY);
      bolivarAdd = true;
    }
    if (bolivarAdd) {
      bolivar.addModifier(new Modifier()._Modifier$String$float$ModifierType$FreeColObject$int(Modifier.SOL, 20, Modifier$ModifierType.ADDITIVE, bolivar, 0));
      ret = true;
    }
    let customs = this.getBuildingType('model.building.customHouse');
    if (!customs.hasAbility$String(Ability.COASTAL_ONLY)) {
      customs.addAbility(new Ability()._Ability$String$FreeColSpecObjectType$boolean(Ability.COASTAL_ONLY, null, false));
      ret = true;
    }
    if (CollectionUtils.none$Stream(this.getModifiers(Modifier.CARGO_PENALTY))) {
      this.addModifier(new Modifier()._Modifier$String$float$ModifierType$FreeColObject$int(Modifier.CARGO_PENALTY, Math.fround(-12.5), Modifier$ModifierType.PERCENTAGE, Specification.CARGO_PENALTY_SOURCE, Modifier.GENERAL_COMBAT_INDEX));
      ret = true;
    }
    let event = this.getEvent('model.event.declareIndependence');
    if (event != null) {
      let limit = event.getLimit('model.limit.independence.coastalColonies');
      if (limit != null) {
        limit.setOperator(Limit$Operator.GE);
        limit.getRightHandSide().setValue(1);
        ret = true;
      }
    }
    let hardyPioneer = this.getUnitType('model.unit.hardyPioneer');
    if (CollectionUtils.none$Stream(hardyPioneer.getModifiers$String(Modifier.TILE_TYPE_CHANGE_PRODUCTION))) {
      let m = new Modifier()._Modifier$String$float$ModifierType(Modifier.TILE_TYPE_CHANGE_PRODUCTION, 2, Modifier$ModifierType.MULTIPLICATIVE);
      let scope = new Scope()._Scope$();
      scope.setType('model.goods.lumber');
      m.addScope(scope);
      hardyPioneer.addModifier(m);
      ret = true;
    }
    if (!coronado.hasModifier$String(Modifier.EXPOSED_TILES_RADIUS)) {
      coronado.addModifier(new Modifier()._Modifier$String$float$ModifierType$FreeColObject$int(Modifier.EXPOSED_TILES_RADIUS, 3, Modifier$ModifierType.ADDITIVE, coronado, 0));
      ret = true;
    }
    for (const $it24 = this.indianNationTypes.iterator(); $it24.hasNext(); ) {
      let nt = $it24.next();
      for (const $it25 = nt.getSettlementTypes().iterator(); $it25.hasNext(); ) {
        let st = $it25.next();
        for (const $it26 = st.getPlunderTypes().iterator(); $it26.hasNext(); ) {
          let pt = $it26.next();
          if (pt.getId() == null) {
            let scope = CollectionUtils.find$Stream$Predicate(pt.getScopes(), CollectionUtils.matchKey$Object$Function('model.ability.plunderNatives', ($p0) => $p0.getAbilityId()));
            let id = 'plunder.' + nt.getSuffix$() + ((st.isCapital()) ? '.capital' : '') + ((scope == null) ? '' : '.extra');
            pt.setId(id);
            ret = true;
          }
        }
      }
    }
    let casas = this.getFoundingFather('model.foundingFather.bartolomeDeLasCasas');
    if (casas != null && !casas.hasAbility$String(Ability.UPGRADE_CONVERT)) {
      let uc = new Ability()._Ability$String$FreeColSpecObjectType$boolean(Ability.UPGRADE_CONVERT, casas, true);
      this.addAbility$Ability(uc);
      casas.addAbility(uc);
      ret = true;
    }
    let mow = this.getUnitType('model.unit.manOWar');
    if (mow != null && mow.getMercenaryPrice() < 0) {
      mow.setMercenaryPrice(10000);
      ret = true;
    }
    let maidId = 'model.ability.independenceDeclared';
    if (mow != null && mow.requiresAbility(maidId)) {
      mow.removeRequiredAbility(maidId);
      mow.addRequiredAbility(Ability.INDEPENDENT_NATION, true);
      ret = true;
    }
    for (const $it27 = this.getUnitTypesWithAbility([Ability.REF_UNIT]).iterator(); $it27.hasNext(); ) {
      let ut = $it27.next();
      if (!ut.containsAbilityKey(Ability.CAN_BE_SURRENDERED)) {
        ut.addAbility(new Ability()._Ability$String$FreeColSpecObjectType$boolean(Ability.CAN_BE_SURRENDERED, null, $J.equals('model.unit.artillery', ut.getId())));
        ret = true;
      }
    }
    return ret;
  }
  /**
   * Backward compatibility code to make sure this specification
   * contains a default value for every difficulty option.
   *
   * When a new difficulty option is added to the spec, add a
   * sensible default here.
   *
   * @return True if an option was missing and added.
   */
  fixDifficultyOptions(): boolean {
    let ret = false;
    let id: string;
    let op: AbstractOption;
    let og: OptionGroup;
    let ulo: UnitListOption;
    let lb = new LogBuilder()._LogBuilder(64);
    lb.mark();
    ret = !!(ret | this.checkDifficultyOptionGroup(GameOptions.DIFFICULTY_IMMIGRATION, lb, [GameOptions.CROSSES_INCREMENT, GameOptions.RECRUIT_PRICE_INCREASE, GameOptions.LOWER_CAP_INCREASE, GameOptions.PRICE_INCREASE + '.artillery', GameOptions.PRICE_INCREASE_PER_TYPE, GameOptions.EXPERT_STARTING_UNITS, GameOptions.IMMIGRANTS]));
    ret = !!(ret | this.checkDifficultyOptionGroup(GameOptions.DIFFICULTY_NATIVES, lb, [GameOptions.LAND_PRICE_FACTOR, GameOptions.NATIVE_CONVERT_PROBABILITY, GameOptions.BURN_PROBABILITY, GameOptions.NATIVE_DEMANDS, GameOptions.RUMOUR_DIFFICULTY, GameOptions.SHIP_TRADE_PENALTY, GameOptions.BUILD_ON_NATIVE_LAND, GameOptions.SETTLEMENT_NUMBER]));
    ret = !!(ret | this.checkDifficultyOptionGroup(GameOptions.DIFFICULTY_MONARCH, lb, [GameOptions.MONARCH_MEDDLING, GameOptions.TAX_ADJUSTMENT, GameOptions.MERCENARY_PRICE, GameOptions.MAXIMUM_TAX, GameOptions.MONARCH_SUPPORT, GameOptions.TREASURE_TRANSPORT_FEE, GameOptions.REF_FORCE, GameOptions.INTERVENTION_BELLS, GameOptions.INTERVENTION_TURNS, GameOptions.INTERVENTION_FORCE, GameOptions.MERCENARY_FORCE]));
    ret = !!(ret | this.checkDifficultyOptionGroup(GameOptions.DIFFICULTY_GOVERNMENT, lb, [GameOptions.BAD_GOVERNMENT_LIMIT, GameOptions.VERY_BAD_GOVERNMENT_LIMIT, GameOptions.GOOD_GOVERNMENT_LIMIT, GameOptions.VERY_GOOD_GOVERNMENT_LIMIT]));
    ret = !!(ret | this.checkDifficultyOptionGroup(GameOptions.DIFFICULTY_OTHER, lb, [GameOptions.STARTING_MONEY, GameOptions.FOUNDING_FATHER_FACTOR, GameOptions.ARREARS_FACTOR, GameOptions.UNITS_THAT_USE_NO_BELLS, GameOptions.TILE_PRODUCTION]));
    ret = !!(ret | this.checkDifficultyOptionGroup(GameOptions.DIFFICULTY_CHEAT, lb, [GameOptions.LIFT_BOYCOTT_CHEAT, GameOptions.EQUIP_SCOUT_CHEAT, GameOptions.LAND_UNIT_CHEAT, GameOptions.OFFENSIVE_NAVAL_UNIT_CHEAT, GameOptions.TRANSPORT_NAVAL_UNIT_CHEAT]));
    id = GameOptions.REF_FORCE;
    ulo = this.checkDifficultyUnitListOption(id, GameOptions.DIFFICULTY_MONARCH, lb);
    if (ulo != null) {
      let regulars = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.regulars', this);
      regulars.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.kingsRegular', 'model.role.infantry', 31));
      ulo.getValue$().add(regulars);
      let dragoons = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.dragoons', this);
      dragoons.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.kingsRegular', 'model.role.cavalry', 15));
      ulo.getValue$().add(dragoons);
      let artillery = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.artillery', this);
      artillery.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.artillery', Specification.DEFAULT_ROLE_ID, 14));
      ulo.getValue$().add(artillery);
      let menOfWar = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.menOfWar', this);
      menOfWar.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.manOWar', Specification.DEFAULT_ROLE_ID, 8));
      ulo.getValue$().add(menOfWar);
      ret = true;
    }
    id = GameOptions.IMMIGRANTS;
    ulo = this.checkDifficultyUnitListOption(id, GameOptions.DIFFICULTY_IMMIGRATION, lb);
    if (ulo != null) {
      let i1 = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.1', this);
      i1.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.masterCarpenter', Specification.DEFAULT_ROLE_ID, 1));
      ulo.getValue$().add(i1);
      ret = true;
    }
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.INTERVENTION_BELLS, GameOptions.DIFFICULTY_MONARCH, lb, 5000));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.INTERVENTION_TURNS, GameOptions.DIFFICULTY_MONARCH, lb, 52));
    id = GameOptions.INTERVENTION_FORCE;
    ulo = this.checkDifficultyUnitListOption(id, GameOptions.DIFFICULTY_MONARCH, lb);
    if (ulo != null) {
      let regulars = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.regulars', this);
      regulars.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.colonialRegular', 'model.role.soldier', 2));
      ulo.getValue$().add(regulars);
      let dragoons = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.dragoons', this);
      dragoons.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.colonialRegular', 'model.role.dragoon', 2));
      ulo.getValue$().add(dragoons);
      let artillery = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.artillery', this);
      artillery.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.artillery', Specification.DEFAULT_ROLE_ID, 2));
      ulo.getValue$().add(artillery);
      let menOfWar = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.menOfWar', this);
      menOfWar.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.manOWar', Specification.DEFAULT_ROLE_ID, 2));
      ulo.getValue$().add(menOfWar);
      ret = true;
    }
    id = GameOptions.MERCENARY_FORCE;
    ulo = this.checkDifficultyUnitListOption(id, GameOptions.DIFFICULTY_MONARCH, lb);
    if (ulo != null) {
      let regulars = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.regulars', this);
      regulars.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.veteranSoldier', 'model.role.soldier', 2));
      ulo.getValue$().add(regulars);
      let dragoons = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.dragoons', this);
      dragoons.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.veteranSoldier', 'model.role.dragoon', 2));
      ulo.getValue$().add(dragoons);
      let artillery = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.artillery', this);
      artillery.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.artillery', Specification.DEFAULT_ROLE_ID, 2));
      ulo.getValue$().add(artillery);
      let menOfWar = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id + '.menOfWar', this);
      menOfWar.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.manOWar', Specification.DEFAULT_ROLE_ID, 2));
      ulo.getValue$().add(menOfWar);
      ret = true;
    }
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.GOOD_GOVERNMENT_LIMIT, GameOptions.DIFFICULTY_GOVERNMENT, lb, 50));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.VERY_GOOD_GOVERNMENT_LIMIT, GameOptions.DIFFICULTY_GOVERNMENT, lb, 100));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.LIFT_BOYCOTT_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 10));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.EQUIP_SCOUT_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 10));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.LAND_UNIT_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 10));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.OFFENSIVE_NAVAL_UNIT_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 10));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.TRANSPORT_NAVAL_UNIT_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 10));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.DESTROY_SETTLEMENT_SCORE, GameOptions.DIFFICULTY_NATIVES, lb, -5));
    ret = !!(ret | this.checkDifficultyPercentageOption(GameOptions.BAD_RUMOUR, GameOptions.DIFFICULTY_OTHER, lb, 23));
    ret = !!(ret | this.checkDifficultyPercentageOption(GameOptions.GOOD_RUMOUR, GameOptions.DIFFICULTY_OTHER, lb, 48));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.OFFENSIVE_LAND_UNIT_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 4));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.EQUIP_PIONEER_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 10));
    id = GameOptions.WAR_SUPPORT_FORCE;
    ulo = this.checkDifficultyUnitListOption(id, GameOptions.DIFFICULTY_MONARCH, lb);
    if (ulo != null) {
      let support = new AbstractUnitOption()._AbstractUnitOption$String$Specification(id, this);
      support.setValue$Object(new AbstractUnit()._AbstractUnit$String$String$int('model.unit.veteranSoldier', 'model.role.soldier', 4));
      ulo.getValue$().add(support);
      ret = true;
    }
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.WAR_SUPPORT_GOLD, GameOptions.DIFFICULTY_MONARCH, lb, 1500));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.TRADE_PROFIT_MULTIPLIER_CHEAT, GameOptions.DIFFICULTY_CHEAT, lb, 10));
    ret = !!(ret | this.checkDifficultyIntegerOption(GameOptions.TRADE_PROFIT_MULTIPLIER_CHEAT_TURNS, GameOptions.DIFFICULTY_CHEAT, lb, 200));
    for (const $it28 = this.getDifficultyLevels().iterator(); $it28.hasNext(); ) {
      let level = $it28.next();
      for (const $it29 = level.getOptions().iterator(); $it29.hasNext(); ) {
        let o = $it29.next();
        if (o instanceof OptionGroup) {
          og = o;
          for (const $it30 = og.getOptions().iterator(); $it30.hasNext(); ) {
            let o2 = $it30.next();
            if (o2 instanceof OptionGroup) {
              lb.add(['?-group ', level.getId() + '/' + og.getId() + '/' + o2.getId()]);
            }
          }
        } else {
          lb.add(['? ', level.getId() + '/' + o.getId()]);
        }
      }
    }
    if (lb.grew(['Check difficulty options:'])) {
      lb.log(Specification.logger, Level.INFO);
    }
    return ret;
  }
  checkDifficultyOptionGroup(gr: string, lb: LogBuilder, ids: string[]): boolean {
    let ret = false;
    for (const $it31 = this.getDifficultyLevels().iterator(); $it31.hasNext(); ) {
      let level = $it31.next();
      let og = null;
      for (const $it32 = level.getOptions().iterator(); $it32.hasNext(); ) {
        let o = $it32.next();
        if ($J.equals(o.getId(), gr) && o instanceof OptionGroup) {
          og = o;
          break;
        }
      }
      if (og == null) {
        level.remove(gr);
        og = new OptionGroup()._OptionGroup$String$Specification(gr, this);
        level.add(og);
        og.setGroup(level.getId());
        lb.add(['\n  +', level.getId(), '/', gr]);
        ret = true;
      }
      for (let id of ids) {
        let op = null;
        for (const $it33 = level.getOptions().iterator(); $it33.hasNext(); ) {
          let o = $it33.next();
          if ($J.equals(o.getId(), id) && !(o instanceof OptionGroup)) {
            op = o;
            break;
          }
        }
        if (op != null) {
          level.remove(op.getId());
          if (op instanceof AbstractOption) {
            (op).setGroup(og.getId());
          }
          og.add(op);
          lb.add(['\n  ~', level.getId(), '/', id, ' -> ', level.getId(), '/' + og.getId()]);
          ret = true;
        }
      }
    }
    return ret;
  }
  checkDifficultyIntegerOption(id: string, gr: string, lb: LogBuilder, defaultValue: number): boolean {
    let ret = false;
    for (const $it34 = this.getDifficultyLevels().iterator(); $it34.hasNext(); ) {
      let level = $it34.next();
      let og = null;
      for (const $it35 = level.getOptions().iterator(); $it35.hasNext(); ) {
        let o = $it35.next();
        if ($J.equals(o.getId(), gr) && o instanceof OptionGroup) {
          og = o;
          break;
        }
      }
      if (og == null) {
        continue;
      }
      let op = null;
      for (const $it36 = level.getOptions().iterator(); $it36.hasNext(); ) {
        let o = $it36.next();
        if ($J.equals(o.getId(), id) && !(o instanceof OptionGroup)) {
          op = o;
          break;
        }
      }
      if (op != null) {
        level.remove(op.getId());
        if (!(op instanceof IntegerOption)) {
          let iop = new IntegerOption()._IntegerOption$String$Specification(id, this);
          iop.setValue$Object(defaultValue);
          op = iop;
        }
        op.setGroup(gr);
        og.add(op);
        lb.add(['\n  ~', level.getId(), '/', id, ' -> ', level.getId(), '/' + og.getId()]);
      } else {
        op = null;
        for (const $it37 = og.getOptions().iterator(); $it37.hasNext(); ) {
          let o = $it37.next();
          if ($J.equals(o.getId(), id)) {
            op = o;
            break;
          }
        }
        if (op instanceof IntegerOption) {
          continue;
        }
        if (op != null) {
          og.remove(id);
        }
        let iop = new IntegerOption()._IntegerOption$String$Specification(id, this);
        iop.setGroup(gr);
        iop.setValue$Object(defaultValue);
        og.add(iop);
        lb.add(['\n  +', level.getId(), '/', og.getId(), '/', id, '=', defaultValue]);
      }
      ret = true;
    }
    return ret;
  }
  checkDifficultyPercentageOption(id: string, gr: string, lb: LogBuilder, defaultValue: number): boolean {
    let ret = false;
    for (const $it38 = this.getDifficultyLevels().iterator(); $it38.hasNext(); ) {
      let level = $it38.next();
      let og = null;
      for (const $it39 = level.getOptions().iterator(); $it39.hasNext(); ) {
        let o = $it39.next();
        if ($J.equals(o.getId(), gr) && o instanceof OptionGroup) {
          og = o;
          break;
        }
      }
      if (og == null) {
        continue;
      }
      let op = null;
      for (const $it40 = level.getOptions().iterator(); $it40.hasNext(); ) {
        let o = $it40.next();
        if ($J.equals(o.getId(), id) && !(o instanceof OptionGroup)) {
          op = o;
          break;
        }
      }
      if (op != null) {
        level.remove(op.getId());
        if (!(op instanceof PercentageOption)) {
          let pop = new PercentageOption()._PercentageOption$String$Specification(id, this);
          pop.setValue$Object(defaultValue);
          op = pop;
        }
        op.setGroup(gr);
        og.add(op);
        lb.add(['\n  ~', level.getId(), '/', id, ' -> ', level.getId(), '/' + og.getId()]);
      } else {
        op = null;
        for (const $it41 = og.getOptions().iterator(); $it41.hasNext(); ) {
          let o = $it41.next();
          if ($J.equals(o.getId(), id)) {
            op = o;
            break;
          }
        }
        if (op instanceof PercentageOption) {
          continue;
        }
        if (op != null) {
          og.remove(id);
        }
        let pop = new PercentageOption()._PercentageOption$String$Specification(id, this);
        pop.setValue$Object(defaultValue);
        pop.setGroup(gr);
        og.add(pop);
        lb.add(['\n  +', level.getId(), '/', og.getId(), '/', id, '=', defaultValue]);
      }
      ret = true;
    }
    return ret;
  }
  checkDifficultyUnitListOption(id: string, gr: string, lb: LogBuilder): UnitListOption {
    let ulo = null;
    for (const $it42 = this.getDifficultyLevels().iterator(); $it42.hasNext(); ) {
      let level = $it42.next();
      let og = null;
      for (const $it43 = level.getOptions().iterator(); $it43.hasNext(); ) {
        let o = $it43.next();
        if ($J.equals(o.getId(), gr) && o instanceof OptionGroup) {
          og = o;
          break;
        }
      }
      if (og == null) {
        continue;
      }
      let op = null;
      for (const $it44 = level.getOptions().iterator(); $it44.hasNext(); ) {
        let o = $it44.next();
        if ($J.equals(o.getId(), id) && !(o instanceof OptionGroup)) {
          op = o;
          break;
        }
      }
      if (op != null) {
        level.remove(op.getId());
        if (op instanceof AbstractOption) {
          (op).setGroup(og.getId());
        }
        og.add(op);
        lb.add(['\n  ~', level.getId(), '/', id, ' -> ', level.getId(), '/' + og.getId()]);
      } else {
        op = null;
        for (const $it45 = og.getOptions().iterator(); $it45.hasNext(); ) {
          let o = $it45.next();
          if ($J.equals(o.getId(), id)) {
            op = o;
            break;
          }
        }
        if (op instanceof UnitListOption) {
          continue;
        }
        if (op != null) {
          og.remove(id);
        }
        if (ulo == null) {
          ulo = new UnitListOption()._UnitListOption$String$Specification(id, this);
        }
        og.add(ulo);
        lb.add(['\n  +', level.getId(), '/', og.getId(), '/[', id, ']']);
      }
    }
    return ulo;
  }
  /**
   * Backward compatibility code to make sure this specification
   * contains a default value for every game option.
   *
   * When a new game option is added to the spec, add a sensible
   * default here.
   *
   * @return True if an option was missing and added.
   */
  fixGameOptions(): boolean {
    let ret = false;
    ret = !!(ret | this.checkOp(GameOptions.ENABLE_UPKEEP, GameOptions.GAMEOPTIONS_COLONY, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.NATURAL_DISASTERS, GameOptions.GAMEOPTIONS_COLONY, 0, $J.cls(PercentageOption)));
    ret = !!(ret | this.checkOp(GameOptions.GIFT_PROBABILITY, GameOptions.GAMEOPTIONS_MAP, 5, $J.cls(PercentageOption)));
    ret = !!(ret | this.checkOp(GameOptions.DEMAND_PROBABILITY, GameOptions.GAMEOPTIONS_MAP, 10, $J.cls(PercentageOption)));
    ret = !!(ret | this.checkOp(GameOptions.EMPTY_TRADERS, GameOptions.GAMEOPTIONS_MAP, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.ONLY_NATURAL_IMPROVEMENTS, GameOptions.GAMEOPTIONS_COLONY, true, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.PEACE_PROBABILITY, GameOptions.GAMEOPTIONS_MAP, 90, $J.cls(PercentageOption)));
    ret = !!(ret | this.checkOp(GameOptions.INITIAL_IMMIGRATION, GameOptions.GAMEOPTIONS_MAP, 15, $J.cls(IntegerOption)));
    ret = !!(ret | this.checkOp(GameOptions.EUROPEAN_UNIT_IMMIGRATION_PENALTY, GameOptions.GAMEOPTIONS_MAP, -4, $J.cls(IntegerOption)));
    ret = !!(ret | this.checkOp(GameOptions.PLAYER_IMMIGRATION_BONUS, GameOptions.GAMEOPTIONS_MAP, 2, $J.cls(IntegerOption)));
    ret = !!(ret | this.checkOp(GameOptions.FOUND_COLONY_DURING_REBELLION, GameOptions.GAMEOPTIONS_COLONY, true, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.BELL_ACCUMULATION_CAPPED, GameOptions.GAMEOPTIONS_COLONY, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.CAPTURE_UNITS_UNDER_REPAIR, GameOptions.GAMEOPTIONS_COLONY, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.PAY_FOR_BUILDING, GameOptions.GAMEOPTIONS_COLONY, true, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.CLEAR_HAMMERS_ON_CONSTRUCTION_SWITCH, GameOptions.GAMEOPTIONS_COLONY, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.CUSTOMS_ON_COAST, GameOptions.GAMEOPTIONS_COLONY, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.EQUIP_EUROPEAN_RECRUITS, GameOptions.GAMEOPTIONS_COLONY, true, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.MISSION_INFLUENCE, GameOptions.GAMEOPTIONS_MAP, -10, $J.cls(IntegerOption)));
    ret = !!(ret | this.checkOp(GameOptions.INDEPENDENCE_TURN, GameOptions.GAMEOPTIONS_YEARS, 468, $J.cls(IntegerOption)));
    ret = !!(ret | this.checkOp(GameOptions.AGES, GameOptions.GAMEOPTIONS_YEARS, '1600,1700', $J.cls(TextOption)));
    ret = !!(ret | this.checkOp(GameOptions.SEASONS, GameOptions.GAMEOPTIONS_YEARS, 2, $J.cls(IntegerOption)));
    ret = !!(ret | this.checkOp(GameOptions.DISEMBARK_IN_COLONY, GameOptions.GAMEOPTIONS_COLONY, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.ENHANCED_TRADE_ROUTES, GameOptions.GAMEOPTIONS_MAP, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.SETTLEMENT_NUMBER_OF_GOODS_TO_SELL, GameOptions.GAMEOPTIONS_MAP, 3, $J.cls(IntegerOption)));
    ret = !!(ret | this.checkOp(GameOptions.ALARM_BONUS_BUY, GameOptions.GAMEOPTIONS_MAP, 20, $J.cls(PercentageOption)));
    ret = !!(ret | this.checkOp(GameOptions.ALARM_BONUS_SELL, GameOptions.GAMEOPTIONS_MAP, 20, $J.cls(PercentageOption)));
    ret = !!(ret | this.checkOp(GameOptions.ALARM_BONUS_GIFT, GameOptions.GAMEOPTIONS_MAP, 40, $J.cls(PercentageOption)));
    ret = !!(ret | this.checkOp(GameOptions.CLAIM_ALL_TILES, GameOptions.GAMEOPTIONS_COLONY, false, $J.cls(BooleanOption)));
    ret = !!(ret | this.checkOp(GameOptions.MAP_DEFINED_STARTING_POSITIONS, GameOptions.GAMEOPTIONS_MAP, true, $J.cls(BooleanOption)));
    return ret;
  }
  /**
   * Backward compatibility code to make sure this specification
   * contains a default value for every map option.
   *
   * When a new map option is added to the spec, add a sensible
   * default here.
   *
   * @return True if an option was missing and added.
   */
  fixMapGeneratorOptions(): boolean {
    let ret = false;
    return ret;
  }
  /**
   * Check if an option exists, and if not, create and install it.
   *
   * FIXME: Handles failure to create a needed option badly.
   *
   * @param <R> The underlying type encapsulated by the option.
   * @param <T> The option type.
   * @param id The option identifier.
   * @param gr The option group identifier.
   * @param defaultValue The default value of the option.
   * @param returnClass The expected class of option.
   * @return True if the option did not exist and was successfully created.
   */
  checkOp<R, T>(id: string, gr: string, defaultValue: R, returnClass: JClass<T>): boolean {
    if (this.hasOption(id, returnClass)) {
      return false;
    }
    let op: T;
    try {
      op = Introspector.instantiate$Class$ClassArr$ObjectArr(returnClass, [$J.cls(JString), $J.cls(Specification)], [id, this]);
    } catch ($e46) {
      if ($J.isa($e46, Introspector$IntrospectorException)) {
        let ie = $J.exc($e46);
        Specification.logger.warning('Failed to make ' + returnClass.getName() + ': ' + id);
        return false;
      } else {
        throw $e46;
      }
    }
    op.setGroup(gr);
    op.setValue$Object(defaultValue);
    this.getOptionGroup(gr).add(op);
    this.addAbstractOption(op);
    return true;
  }
  /**
   * Write an XML-representation of this object to the given stream.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there are any problems writing
   *      to the stream.
   */
  toXML(xw: FreeColXMLWriter): void {
    xw.writeStartElement(Specification.TAG);
    xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, this.getId());
    if (this.difficultyLevel != null) {
      xw.writeAttribute(Specification.DIFFICULTY_LEVEL_TAG, this.difficultyLevel);
    }
    if (this.version != null) {
      xw.writeAttribute(Specification.VERSION_TAG, this.version);
    }
    this.writeSection(xw, Specification.ABILITIES_TAG, this.gameAbilities);
    this.writeSection(xw, Specification.MODIFIERS_TAG, this.specialModifiers);
    this.writeSection(xw, Specification.EVENTS_TAG, this.events);
    this.writeSection(xw, Specification.DISASTERS_TAG, this.disasters);
    this.writeSection(xw, Specification.GOODS_TYPES_TAG, this.goodsTypeList);
    this.writeSection(xw, Specification.RESOURCE_TYPES_TAG, this.resourceTypeList);
    this.writeSection(xw, Specification.TILE_TYPES_TAG, this.tileTypeList);
    this.writeSection(xw, Specification.ROLES_TAG, this.roles);
    this.writeSection(xw, Specification.TILE_IMPROVEMENT_TYPES_TAG, this.tileImprovementTypeList);
    this.writeSection(xw, Specification.UNIT_CHANGE_TYPES_TAG, this.unitChangeTypeList);
    this.writeSection(xw, Specification.UNIT_TYPES_TAG, this.unitTypeList);
    this.writeSection(xw, Specification.BUILDING_TYPES_TAG, this.buildingTypeList);
    this.writeSection(xw, Specification.FOUNDING_FATHERS_TAG, this.foundingFathers);
    this.writeSection(xw, Specification.EUROPEAN_NATION_TYPES_TAG, this.europeanNationTypes);
    this.writeSection(xw, Specification.EUROPEAN_NATION_TYPES_TAG, this.REFNationTypes);
    this.writeSection(xw, Specification.INDIAN_NATION_TYPES_TAG, this.indianNationTypes);
    this.writeSection(xw, Specification.NATIONS_TAG, this.nations);
    xw.writeStartElement(Specification.OPTIONS_TAG);
    for (let id of Specification.coreOptionGroups) {
      let og = this.allOptionGroups.get(id);
      if (og != null) {
        og.toXML$FreeColXMLWriter(xw);
      }
    }
    xw.writeEndElement();
    xw.writeEndElement();
  }
  writeSection<T>(xw: FreeColXMLWriter, section: string, items: Collection<T>): void {
    xw.writeStartElement(section);
    for (const $it47 = items.iterator(); $it47.hasNext(); ) {
      let item = $it47.next();
      item.toXML$FreeColXMLWriter(xw);
    }
    xw.writeEndElement();
  }
  /**
   * Initializes this object from its XML-representation.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there are any problems reading
   *     the stream.
   */
  readFromXML(xr: FreeColXMLReader): void {
    let newId = xr.readId();
    if (this.id_ == null) {
      this.id_ = newId;
    }
    if (this.difficultyLevel == null) {
      this.difficultyLevel = xr.getAttribute$String$String(Specification.DIFFICULTY_LEVEL_TAG, null);
      if (this.difficultyLevel == null) {
        this.difficultyLevel = xr.getAttribute$String$String(Specification.OLD_DIFFICULTY_LEVEL_TAG, null);
      }
    }
    if (this.version == null) {
      this.version = xr.getAttribute$String$String(Specification.VERSION_TAG, null);
    }
    Specification.logger.fine('Reading specification ' + newId + ' difficulty=' + this.difficultyLevel + ' version=' + this.version);
    let parentId = xr.getAttribute$String$String(FreeColSpecObjectType.EXTENDS_TAG, null);
    if (parentId != null) {
      try {
        let parent = FreeColRules.getFreeColRulesFile(parentId);
        try {
          this.load(parent.getSpecificationInputStream());
        } catch ($e48) {
          if ($J.isa($e48, RuntimeException) || $J.isa($e48, XMLStreamException)) {
            let e = $J.exc($e48);
            throw new FreeColUserMessageException()._FreeColUserMessageException$StringTemplate$Throwable(StringTemplate.template$String('error.mod').add$String$String('%id%', parent.getId()).add$String$String('%name%', Messages.getName$String('mod.' + parent.getId())), e);
          } else {
            throw $e48;
          }
        }
        this.initialized = false;
      } catch ($e49) {
        if ($J.isa($e49, IOException)) {
          let e = $J.exc($e49);
          throw new XMLStreamException('Failed to open parent specification: ', e);
        } else {
          throw $e49;
        }
      }
    }
    while (xr.moreTags()) {
      let childName = xr.getLocalName();
      if ($J.equals(Specification.OLD_EQUIPMENT_TYPES_TAG, childName)) {
        xr.swallowTag(Specification.OLD_EQUIPMENT_TYPES_TAG);
        continue;
      }
      let reader = this.readerMap.get(childName);
      if (reader == null) {
        Specification.logger.warning('No reader found for: ' + childName);
      } else {
        reader.readChildren(xr);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Specification.TAG;
  }
  static $clinit() {
    Specification.logger = Logger.getLogger($J.cls(Specification).getName());
    Specification.newTypeClasses = [$J.cls(JString), $J.cls(Specification)];
    Specification.AMBUSH_BONUS_SOURCE = new Specification$Source()._Specification$Source('model.source.ambushBonus');
    Specification.AMPHIBIOUS_ATTACK_PENALTY_SOURCE = new Specification$Source()._Specification$Source('model.source.amphibiousAttack');
    Specification.ARTILLERY_PENALTY_SOURCE = new Specification$Source()._Specification$Source('model.source.artilleryInTheOpen');
    Specification.ATTACK_BONUS_SOURCE = new Specification$Source()._Specification$Source('model.source.attackBonus');
    Specification.BASE_DEFENCE_SOURCE = new Specification$Source()._Specification$Source('model.source.baseDefence');
    Specification.BASE_OFFENCE_SOURCE = new Specification$Source()._Specification$Source('model.source.baseOffence');
    Specification.CARGO_PENALTY_SOURCE = new Specification$Source()._Specification$Source('model.source.cargoPenalty');
    Specification.COLONY_GOODS_PARTY_SOURCE = new Specification$Source()._Specification$Source('model.source.colonyGoodsParty');
    Specification.FORTIFICATION_BONUS_SOURCE = new Specification$Source()._Specification$Source('model.source.fortified');
    Specification.INDIAN_RAID_BONUS_SOURCE = new Specification$Source()._Specification$Source('model.source.artilleryAgainstRaid');
    Specification.MOVEMENT_PENALTY_SOURCE = new Specification$Source()._Specification$Source('model.source.movementPenalty');
    Specification.SHIP_TRADE_PENALTY_SOURCE = new Specification$Source()._Specification$Source('model.source.shipTradePenalty');
    Specification.SOL_MODIFIER_SOURCE = new Specification$Source()._Specification$Source('model.source.solModifier');
    Specification.sources = [Specification.MOVEMENT_PENALTY_SOURCE, Specification.ARTILLERY_PENALTY_SOURCE, Specification.ATTACK_BONUS_SOURCE, Specification.FORTIFICATION_BONUS_SOURCE, Specification.INDIAN_RAID_BONUS_SOURCE, Specification.AMPHIBIOUS_ATTACK_PENALTY_SOURCE, Specification.BASE_OFFENCE_SOURCE, Specification.BASE_DEFENCE_SOURCE, Specification.CARGO_PENALTY_SOURCE, Specification.AMBUSH_BONUS_SOURCE, Specification.COLONY_GOODS_PARTY_SOURCE, Specification.SHIP_TRADE_PENALTY_SOURCE, Specification.SOL_MODIFIER_SOURCE];
    Specification.defaultColors = new HashMap();
    Specification.defaultColors.put('model.nation.dutch', new Color()._Color$int(16751932));
    Specification.defaultColors.put('model.nation.french', new Color()._Color$int(255));
    Specification.defaultColors.put('model.nation.english', new Color()._Color$int(16711680));
    Specification.defaultColors.put('model.nation.spanish', new Color()._Color$int(16776960));
    Specification.defaultColors.put('model.nation.inca', new Color()._Color$int(16052420));
    Specification.defaultColors.put('model.nation.aztec', new Color()._Color$int(12886048));
    Specification.defaultColors.put('model.nation.arawak', new Color()._Color$int(6850752));
    Specification.defaultColors.put('model.nation.cherokee', new Color()._Color$int(7093272));
    Specification.defaultColors.put('model.nation.iroquois', new Color()._Color$int(7644236));
    Specification.defaultColors.put('model.nation.sioux', new Color()._Color$int(12627076));
    Specification.defaultColors.put('model.nation.apache', new Color()._Color$int(9437184));
    Specification.defaultColors.put('model.nation.tupi', new Color()._Color$int(285700));
    Specification.defaultColors.put('model.nation.dutchREF', new Color()._Color$int(13391104));
    Specification.defaultColors.put('model.nation.frenchREF', new Color()._Color$int(6312156));
    Specification.defaultColors.put('model.nation.englishREF', new Color()._Color$int(14561635));
    Specification.defaultColors.put('model.nation.spanishREF', new Color()._Color$int(16768768));
    Specification.defaultColors.put('model.nation.portuguese', new Color()._Color$int(65280));
    Specification.defaultColors.put('model.nation.swedish', new Color()._Color$int(49151));
    Specification.defaultColors.put('model.nation.danish', new Color()._Color$int(16711871));
    Specification.defaultColors.put('model.nation.russian', new Color()._Color$int(16777215));
    Specification.defaultColors.put('model.nation.portugueseREF', new Color()._Color$int(12582656));
    Specification.defaultColors.put('model.nation.swedishREF', new Color()._Color$int(3569032));
    Specification.defaultColors.put('model.nation.danishREF', new Color()._Color$int(9502829));
    Specification.defaultColors.put('model.nation.russianREF', new Color()._Color$int(12500670));
    Specification.defaultColors.put(Nation.UNKNOWN_NATION_ID, Nation.UNKNOWN_NATION_COLOR);
    Specification.coreOptionGroups = [GameOptions.TAG, MapGeneratorOptions.TAG, Specification.DIFFICULTY_LEVELS];
  }
}

export class Specification$ChildReader {
}

/**
 * Modifiers have to be hooked to the specification and added to
 * the special modifiers list, hence the special purpose reader.
 */
export class Specification$ModifierReader extends JObject {
  _Specification$ModifierReader(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    while (xr.moreTags()) {
      let modifier = new Modifier()._Modifier$FreeColXMLReader$Specification(xr, this.$outer);
      this.$outer.addModifier(modifier);
      this.$outer.specialModifiers.add(modifier);
    }
  }
}

export class Specification$AbilityReader extends JObject {
  _Specification$AbilityReader(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    while (xr.moreTags()) {
      let ability = new Ability()._Ability$FreeColXMLReader$Specification(xr, this.$outer);
      this.$outer.addAbility$Ability(ability);
      this.$outer.gameAbilities.add(ability);
    }
  }
}

/**
 * Options are special as they live in the allOptionGroups
 * collection, which has its own particular semantics.  So they
 * need their own reader.
 */
export class Specification$OptionReader extends JObject {
  static readonly RECURSIVE_TAG: string = 'recursive';
  _Specification$OptionReader(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    while (xr.moreTags()) {
      this.readChild(xr);
    }
  }
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    let recursive = xr.getAttribute$String$boolean(Specification$OptionReader.RECURSIVE_TAG, true);
    if ($J.equals(OptionGroup.TAG, tag)) {
      let id = xr.readId();
      let group = this.$outer.allOptionGroups.get(id);
      if (group == null) {
        group = new OptionGroup()._OptionGroup$String$Specification(id, this.$outer);
        this.$outer.allOptionGroups.put(id, group);
      }
      group.readFromXML(xr);
      this.$outer.addOptionGroup(group, recursive);
    } else {
      Specification.logger.warning(OptionGroup.TAG + ' expected in OptionReader, not: ' + tag);
      xr.nextTag();
    }
  }
}

/**
 * A reader for ordinary spec object types.
 */
export class Specification$TypeReader<T> extends JObject {
  /**
   * The class of objects to read.
   */
  type: JClass<T> = null;
  /**
   * The list to append new objects to.
   */
  result: List<T> = null;
  /**
   * Internal index to impose an ordering.
   */
  index_: number = 0;
  /**
   * Build a type read.
   *
   * @param type The class to read.
   * @param listToFill A list of read types.
   */
  _Specification$TypeReader(type$: JClass<T>, listToFill: List<T>): this {
    this.index_ = 0;
    this.result = listToFill;
    this.type = type$;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      let id = xr.readId();
      if (id == null) {
        Specification.logger.warning('Null identifier, tag: ' + tag);
      } else if ($J.equals(FreeColSpecObjectType.DELETE_TAG, tag)) {
        let object$ = this.$outer.removeType(id);
        if (object$ != null) {
          this.result.remove(object$);
        } else {
          Specification.logger.warning('Delete ' + id + ' failed');
        }
      } else {
        let object$ = this.$outer.getAlreadyInitializedType(id, this.type);
        if (object$ == null) {
          object$ = this.$outer.newType(id, this.type);
          this.$outer.addType(id, object$);
        }
        if (object$.getId() != null && xr.getAttribute$String$boolean(FreeColSpecObjectType.PRESERVE_TAG, false)) {
          object$.readChildren(xr);
        } else {
          object$.readFromXML(xr);
        }
        if (!object$.isAbstractType() && !this.result.contains(object$)) {
          this.result.add(object$);
          object$.setIndex(this.index_);
          this.index_++;
        }
      }
    }
  }
}

/**
 * Sources.  Special static spec objects.
 */
export class Specification$Source extends FreeColSpecObjectType {
  /**
   * Trivial constructor.
   *
   * @param id The object identifier.
   */
  _Specification$Source(id: string): this {
    this._FreeColSpecObjectType$String(id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toXML$FreeColXMLWriter(xw: FreeColXMLWriter): void {
    throw new RuntimeException('Can not happen: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return 'source';
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.getId();
  }
}

$J.define(Specification, 'net.sf.freecol.common.model.Specification', { kind: 'class', ifaces: ['net.sf.freecol.common.option.OptionContainer'], sup: 'java.lang.Object', ctors: { 'java.io.InputStream': '_Specification$InputStream', 'net.sf.freecol.common.io.FreeColXMLReader': '_Specification$FreeColXMLReader', '': '_Specification$' }, returns: { 'getXMLTagName': 'java.lang.String', 'getFastestNavalUnitType': 'net.sf.freecol.common.model.UnitType', 'getFastestLandUnitType': 'net.sf.freecol.common.model.UnitType', 'getBuildableUnitTypes': 'java.util.List', 'getDefaultUnitType$': 'net.sf.freecol.common.model.UnitType', 'getUnitTypeList': 'java.util.List', 'getUnitChangeTypeList': 'java.util.List', 'getMountainsTileTypeList': 'java.util.List', 'getHillsTileTypeList': 'java.util.List', 'getTileTypeList': 'java.util.List', 'getScoutRole': 'net.sf.freecol.common.model.Role', 'getPioneerRole': 'net.sf.freecol.common.model.Role', 'getMissionaryRole': 'net.sf.freecol.common.model.Role', 'getMilitaryRoles': 'java.util.stream.Stream', 'getMilitaryRolesList': 'java.util.List', 'getDefaultRole': 'net.sf.freecol.common.model.Role', 'getRoles': 'java.util.stream.Stream', 'getRolesList': 'java.util.List', 'getResourceTypeList': 'java.util.List', 'getUnknownEnemyNation': 'net.sf.freecol.common.model.Nation', 'getREFNations': 'java.util.List', 'getIndianNations': 'java.util.List', 'getEuropeanNations': 'java.util.List', 'getNations': 'java.util.List', 'getDefaultNationType': 'net.sf.freecol.common.model.NationType', 'getIndianNationTypes': 'java.util.List', 'getREFNationTypes': 'java.util.List', 'getVisibleEuropeanNationTypes': 'java.util.List', 'getEuropeanNationTypes': 'java.util.List', 'getNationTypes': 'java.util.List', 'getTileImprovementTypeList': 'java.util.List', 'getPrimaryFoodType': 'net.sf.freecol.common.model.GoodsType', 'getRawMaterialsForStorableBuildingMaterials': 'java.util.List', 'getRawMaterialsForUnstorableBuildingMaterials': 'java.util.List', 'getRawBuildingGoodsTypeList': 'java.util.List', 'getFoodGoodsTypeList': 'java.util.List', 'getImmigrationGoodsTypeList': 'java.util.List', 'getLibertyGoodsTypeList': 'java.util.List', 'getNewWorldLuxuryGoodsTypeList': 'java.util.List', 'getNewWorldGoodsTypeList': 'java.util.List', 'getFarmedGoodsTypeList': 'java.util.List', 'getStorableGoodsTypeList': 'java.util.List', 'getGoodsTypeList': 'java.util.List', 'getFoundingFathers': 'java.util.List', 'getEvents': 'java.util.List', 'getDisasters': 'java.util.List', 'getBuildingTypeList': 'java.util.List', 'getMapGeneratorOptions': 'net.sf.freecol.common.option.OptionGroup', 'getGameOptions': 'net.sf.freecol.common.option.OptionGroup', 'getDifficultyOptionGroup$': 'net.sf.freecol.common.option.OptionGroup', 'getDifficultyLevel': 'java.lang.String', 'getDifficultyLevels': 'java.util.List', 'getVersion': 'java.lang.String', 'getId': 'java.lang.String' }, meths: { 'getDefaultUnitType()': 'getDefaultUnitType$', 'getDefaultUnitType(net.sf.freecol.common.model.NationType)': 'getDefaultUnitType$NationType', 'getDefaultUnitType(net.sf.freecol.common.model.Player)': 'getDefaultUnitType$Player', 'getUnitChange(java.lang.String,net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.UnitType)': 'getUnitChange$String$UnitType$UnitType', 'getUnitChange(java.lang.String,net.sf.freecol.common.model.UnitType)': 'getUnitChange$String$UnitType', 'applyDifficultyLevel(net.sf.freecol.common.option.OptionGroup)': 'applyDifficultyLevel$OptionGroup', 'applyDifficultyLevel(java.lang.String)': 'applyDifficultyLevel$String', 'getDifficultyOptionGroup(java.lang.String)': 'getDifficultyOptionGroup$String', 'getDifficultyOptionGroup()': 'getDifficultyOptionGroup$', 'getOption(java.lang.String,java.lang.Class)': 'getOption$String$Class', 'addAbility(java.lang.String)': 'addAbility$String', 'addAbility(net.sf.freecol.common.model.Ability)': 'addAbility$Ability', 'prepare(net.sf.freecol.common.model.NationOptions$Advantages,net.sf.freecol.common.option.OptionGroup)': 'prepare$Advantages$OptionGroup', 'prepare(net.sf.freecol.common.model.NationOptions$Advantages,java.lang.String)': 'prepare$Advantages$String' }, clinit: true, lazy: ['logger', 'newTypeClasses', 'AMBUSH_BONUS_SOURCE', 'AMPHIBIOUS_ATTACK_PENALTY_SOURCE', 'ARTILLERY_PENALTY_SOURCE', 'ATTACK_BONUS_SOURCE', 'BASE_DEFENCE_SOURCE', 'BASE_OFFENCE_SOURCE', 'CARGO_PENALTY_SOURCE', 'COLONY_GOODS_PARTY_SOURCE', 'FORTIFICATION_BONUS_SOURCE', 'INDIAN_RAID_BONUS_SOURCE', 'MOVEMENT_PENALTY_SOURCE', 'SHIP_TRADE_PENALTY_SOURCE', 'SOL_MODIFIER_SOURCE', 'sources', 'defaultColors', 'coreOptionGroups'] });
$J.define(Specification$ChildReader, 'net.sf.freecol.common.model.Specification$ChildReader', { kind: 'interface' });
$J.define(Specification$ModifierReader, 'net.sf.freecol.common.model.Specification$ModifierReader', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Specification$ChildReader'], sup: 'java.lang.Object', ctors: { '': '_Specification$ModifierReader' }, inner: true });
$J.define(Specification$AbilityReader, 'net.sf.freecol.common.model.Specification$AbilityReader', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Specification$ChildReader'], sup: 'java.lang.Object', ctors: { '': '_Specification$AbilityReader' }, inner: true });
$J.define(Specification$OptionReader, 'net.sf.freecol.common.model.Specification$OptionReader', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Specification$ChildReader'], sup: 'java.lang.Object', ctors: { '': '_Specification$OptionReader' }, inner: true });
$J.define(Specification$TypeReader, 'net.sf.freecol.common.model.Specification$TypeReader', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Specification$ChildReader'], sup: 'java.lang.Object', ctors: { 'java.lang.Class,java.util.List': '_Specification$TypeReader' }, inner: true });
$J.define(Specification$Source, 'net.sf.freecol.common.model.Specification$Source', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String': '_Specification$Source' }, returns: { 'getXMLTagName': 'java.lang.String' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)': 'toXML$FreeColXMLWriter' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  FreeColUserMessageException = $J.load('net.sf.freecol.common.FreeColUserMessageException');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColRules = $J.load('net.sf.freecol.common.io.FreeColRules');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  BuildableType = $J.load('net.sf.freecol.common.model.BuildableType');
  BuildingType = $J.load('net.sf.freecol.common.model.BuildingType');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Disaster = $J.load('net.sf.freecol.common.model.Disaster');
  EuropeanNationType = $J.load('net.sf.freecol.common.model.EuropeanNationType');
  Event = $J.load('net.sf.freecol.common.model.Event');
  FoundingFather = $J.load('net.sf.freecol.common.model.FoundingFather');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  IndianNationType = $J.load('net.sf.freecol.common.model.IndianNationType');
  Limit$Operator = $J.load('net.sf.freecol.common.model.Limit$Operator');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Modifier$ModifierType = $J.load('net.sf.freecol.common.model.Modifier$ModifierType');
  Nation = $J.load('net.sf.freecol.common.model.Nation');
  NationOptions$Advantages = $J.load('net.sf.freecol.common.model.NationOptions$Advantages');
  NationType = $J.load('net.sf.freecol.common.model.NationType');
  ResourceType = $J.load('net.sf.freecol.common.model.ResourceType');
  Role = $J.load('net.sf.freecol.common.model.Role');
  Scope = $J.load('net.sf.freecol.common.model.Scope');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TileImprovementType = $J.load('net.sf.freecol.common.model.TileImprovementType');
  TileType = $J.load('net.sf.freecol.common.model.TileType');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  AbstractOption = $J.load('net.sf.freecol.common.option.AbstractOption');
  AbstractUnitOption = $J.load('net.sf.freecol.common.option.AbstractUnitOption');
  BooleanOption = $J.load('net.sf.freecol.common.option.BooleanOption');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
  OptionGroup = $J.load('net.sf.freecol.common.option.OptionGroup');
  PercentageOption = $J.load('net.sf.freecol.common.option.PercentageOption');
  TextOption = $J.load('net.sf.freecol.common.option.TextOption');
  UnitListOption = $J.load('net.sf.freecol.common.option.UnitListOption');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Introspector = $J.load('net.sf.freecol.common.util.Introspector');
  Introspector$IntrospectorException = $J.load('net.sf.freecol.common.util.Introspector$IntrospectorException');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
});
