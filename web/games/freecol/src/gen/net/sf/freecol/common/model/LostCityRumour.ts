// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/LostCityRumour.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, Logger, Stream } from '../../../../../../jre/index.ts';
import { TileItem } from './TileItem.ts';

let Messages, NameCache, Ability, Map$Layer, ModelMessage, ModelMessage$MessageType, Modifier, Player$PlayerType, Tile, UnitChangeType, GameOptions, RandomChoice, RandomUtils, StringUtils;

/**
 * Represents a lost city rumour.
 */
export class LostCityRumour extends TileItem {
  static logger: Logger = null;
  static readonly TAG: string = 'lostCityRumour';
  static readonly MAYAN_PROPHESY_YEAR: number = 2012;
  static rumourNothing: number = 0;
  /**
   * The type of the rumour.  A RumourType, or null if the type has
   * not yet been determined.
   */
  type: LostCityRumour$RumourType = null;
  /**
   * The name of this rumour, or null, if it has none.  Rumours such
   * as the Seven Cities of Gold and Fountains of Youth may have
   * individual names.
   */
  name: string = null;
  static readonly NAME_TAG: string = 'name';
  static readonly TILE_TAG: string = 'tile';
  static readonly TYPE_TAG: string = 'type';
  $init_LostCityRumour() {
    this.type = null;
    this.name = null;
  }
  /**
   * Creates a new {@code LostCityRumour} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param tile The {@code Tile} where the LCR is.
   */
  _LostCityRumour$Game$Tile(game: Game, tile: Tile): this {
    this._TileItem$Game$Tile(game, tile);
    this.$init_LostCityRumour();
    return this;
  }
  /**
   * Creates a new {@code LostCityRumour} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param tile The {@code Tile} where the LCR is.
   * @param type The type of rumour.
   * @param name The name of the rumour.
   */
  _LostCityRumour$Game$Tile$RumourType$String(game: Game, tile: Tile, type$: LostCityRumour$RumourType, name: string): this {
    this._TileItem$Game$Tile(game, tile);
    this.$init_LostCityRumour();
    this.type = type$;
    this.name = name;
    return this;
  }
  /**
   * Creates a new {@code LostCityRumour} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _LostCityRumour$Game$String(game: Game, id: string): this {
    this._TileItem$Game$String(game, id);
    this.$init_LostCityRumour();
    return this;
  }
  /**
   * Get the type of rumour.
   *
   * @return The {@code RumourType}.
   */
  getType(): LostCityRumour$RumourType {
    return this.type;
  }
  /**
   * Set the type of rumour.
   *
   * @param newType The new rumour type.
   */
  setType(newType: LostCityRumour$RumourType): void {
    this.type = newType;
  }
  /**
   * Get the name of this rumour.
   *
   * @return The name.
   */
  getName(): string {
    return this.name;
  }
  /**
   * Chooses a type of Lost City Rumour.  The type of rumour depends
   * on the exploring unit, as well as player settings.
   *
   * The scouting outcome is based on three factors: good/bad percent
   * rumour difficulty option, expert scout or not, DeSoto or not.
   *
   * FIXME: Make RumourType a FreeColSpecObjectType and move all the
   * magic numbers in here to the specification.
   *
   * @param unit The {@code Unit} exploring (optional).
   * @param random A random number source.
   * @return The type of rumour.
   */
  chooseType(unit: Unit, random: Random): LostCityRumour$RumourType {
    let spec = this.getSpecification();
    let tile = this.getTile$();
    let allowBurial = tile.getOwner() != null && tile.getOwner().isIndian();
    let allowFoY = unit != null && unit.getOwner().getPlayerType() === Player$PlayerType.COLONIAL;
    let allowLearn = unit != null && !spec.getUnitChanges(UnitChangeType.LOST_CITY, unit.getType()).isEmpty();
    let allowVanish = !(unit != null && unit.hasAbility$String(Ability.EXPERT_SCOUT));
    let percentBad = spec.getInteger(GameOptions.BAD_RUMOUR);
    let percentGood = spec.getInteger(GameOptions.GOOD_RUMOUR);
    if (!allowBurial && !allowVanish) {
      percentBad = 0;
    } else if (unit != null) {
      if (unit.getOwner().hasAbility$String(Ability.RUMOURS_ALWAYS_POSITIVE)) {
        percentBad = 0;
        percentGood = 100;
      } else {
        let mod = unit.apply$float$Turn$String(1, this.getGame().getTurn(), Modifier.EXPLORE_LOST_CITY_RUMOUR);
        percentBad = $J.roundf(Math.fround(percentBad / mod));
        percentGood = $J.roundf(Math.fround(percentGood * mod));
      }
    }
    let percentNeutral = Math.max(0, (100 - percentBad - percentGood) | 0);
    let c = new ArrayList();
    if (percentGood > 0) {
      if (allowFoY) {
        c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.FOUNTAIN_OF_YOUTH, Math.imul(2, percentGood)));
      }
      if (allowLearn) {
        c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.LEARN, Math.imul(30, percentGood)));
        c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.TRIBAL_CHIEF, Math.imul(30, percentGood)));
        c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.COLONIST, Math.imul(20, percentGood)));
      } else {
        c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.TRIBAL_CHIEF, Math.imul(50, percentGood)));
        c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.COLONIST, Math.imul(30, percentGood)));
      }
      c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.MOUNDS, Math.imul(8, percentGood)));
      c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.RUINS, Math.imul(6, percentGood)));
      c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.CIBOLA, Math.imul(4, percentGood)));
    }
    if (percentBad > 0) {
      let cbad = new ArrayList();
      if (allowBurial) {
        cbad.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.BURIAL_GROUND, Math.imul(25, percentBad)));
      }
      if (allowVanish) {
        cbad.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.EXPEDITION_VANISHES, Math.imul(75, percentBad)));
      }
      RandomChoice.normalize(cbad, 100);
      c.addAll(cbad);
    }
    if (percentNeutral > 0) {
      c.add(new RandomChoice()._RandomChoice(LostCityRumour$RumourType.NOTHING, Math.imul(100, percentNeutral)));
    }
    return RandomChoice.getWeightedRandom$Logger$String$Collection$Random(LostCityRumour.logger, 'Choose rumour', c, random);
  }
  /**
   * Get the message for a "nothing" rumour.
   *
   * @param player The {@code Player} to generate the message for.
   * @param mounds Is this rumour a result of exploring "strange mounds"?
   * @param random A pseudo-random number source.
   * @return A suitable {@code ModelMessage}.
   */
  getNothingMessage(player: Player, mounds: boolean, random: Random): ModelMessage {
    let game = this.getGame();
    return (mounds) ? new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, LostCityRumour$RumourType.NOTHING.getAlternateDescriptionKey('mounds'), player) : (game.getTurn().getYear() % 100 === 12 && RandomUtils.randomInt(LostCityRumour.logger, 'Mayans?', random, 4) === 0) ? new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, LostCityRumour$RumourType.NOTHING.getAlternateDescriptionKey('mayans'), player).addAmount('%years%', (LostCityRumour.MAYAN_PROPHESY_YEAR - game.getTurn().getYear()) | 0) : new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, NameCache.getRumourNothingKey(random), player);
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.lostCityRumour');
  }
  /**
   * {@inheritDoc}
   */
  getZIndex(): number {
    return Tile.RUMOUR_ZINDEX;
  }
  /**
   * {@inheritDoc}
   */
  isTileTypeAllowed(tileType: TileType): boolean {
    return !tileType.isWater();
  }
  /**
   * {@inheritDoc}
   */
  applyBonus(goodsType: GoodsType, unitType: UnitType, potential: number): number {
    return potential;
  }
  /**
   * {@inheritDoc}
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getProductionModifiers(goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    return Stream.empty();
  }
  /**
   * {@inheritDoc}
   */
  isNatural(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  isComplete(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getLayer(): Map$Layer {
    return Map$Layer.RUMOURS;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    if (this.type === LostCityRumour$RumourType.NO_SUCH_RUMOUR) {
      lb.add(['\n  Rumour with null type: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(LostCityRumour));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.type = o.getType();
    this.name = o.getName();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(LostCityRumour.TILE_TAG, this.getTile$());
    if (this.type != null) {
      xw.writeAttribute$String$Enum(LostCityRumour.TYPE_TAG, this.getType());
    }
    if (this.name != null) {
      xw.writeAttribute(LostCityRumour.NAME_TAG, this.name);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.tile = xr.findFreeColGameObject(this.getGame(), LostCityRumour.TILE_TAG, $J.cls(Tile), null, true);
    this.type = xr.getAttribute$String$Class$Enum(LostCityRumour.TYPE_TAG, $J.cls(LostCityRumour$RumourType), null);
    this.name = xr.getAttribute$String$String(LostCityRumour.NAME_TAG, null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return LostCityRumour.TAG;
  }
  static $clinit() {
    LostCityRumour.logger = Logger.getLogger($J.cls(LostCityRumour).getName());
    LostCityRumour.rumourNothing = -1;
  }
}

/**
 * Constants describing types of Lost City Rumours.
 */
export class LostCityRumour$RumourType extends JEnum {
  static NO_SUCH_RUMOUR: LostCityRumour$RumourType = null;
  static BURIAL_GROUND: LostCityRumour$RumourType = null;
  static EXPEDITION_VANISHES: LostCityRumour$RumourType = null;
  static NOTHING: LostCityRumour$RumourType = null;
  static LEARN: LostCityRumour$RumourType = null;
  static TRIBAL_CHIEF: LostCityRumour$RumourType = null;
  static COLONIST: LostCityRumour$RumourType = null;
  static MOUNDS: LostCityRumour$RumourType = null;
  static RUINS: LostCityRumour$RumourType = null;
  static CIBOLA: LostCityRumour$RumourType = null;
  static FOUNTAIN_OF_YOUTH: LostCityRumour$RumourType = null;
  static $VALUES: LostCityRumour$RumourType[] = null;
  _LostCityRumour$RumourType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get the stem key for this LCR type.
   *
   * @return The stem key.
   */
  getKey(): string {
    return 'lostCityRumour.' + StringUtils.getEnumKey(this);
  }
  getDescriptionKey(): string {
    return Messages.descriptionKey$String('model.' + this.getKey());
  }
  getAlternateDescriptionKey(variant: string): string {
    return Messages.descriptionKey$String('model.' + this.getKey() + '.' + variant);
  }
  static values(): LostCityRumour$RumourType[] { return LostCityRumour$RumourType.$VALUES.slice(); }
  static valueOf(name: string): LostCityRumour$RumourType { return $J.enumValueOf(LostCityRumour$RumourType, name); }
  static $clinit() {
    LostCityRumour$RumourType.NO_SUCH_RUMOUR = new LostCityRumour$RumourType()._LostCityRumour$RumourType('NO_SUCH_RUMOUR', 0);
    LostCityRumour$RumourType.BURIAL_GROUND = new LostCityRumour$RumourType()._LostCityRumour$RumourType('BURIAL_GROUND', 1);
    LostCityRumour$RumourType.EXPEDITION_VANISHES = new LostCityRumour$RumourType()._LostCityRumour$RumourType('EXPEDITION_VANISHES', 2);
    LostCityRumour$RumourType.NOTHING = new LostCityRumour$RumourType()._LostCityRumour$RumourType('NOTHING', 3);
    LostCityRumour$RumourType.LEARN = new LostCityRumour$RumourType()._LostCityRumour$RumourType('LEARN', 4);
    LostCityRumour$RumourType.TRIBAL_CHIEF = new LostCityRumour$RumourType()._LostCityRumour$RumourType('TRIBAL_CHIEF', 5);
    LostCityRumour$RumourType.COLONIST = new LostCityRumour$RumourType()._LostCityRumour$RumourType('COLONIST', 6);
    LostCityRumour$RumourType.MOUNDS = new LostCityRumour$RumourType()._LostCityRumour$RumourType('MOUNDS', 7);
    LostCityRumour$RumourType.RUINS = new LostCityRumour$RumourType()._LostCityRumour$RumourType('RUINS', 8);
    LostCityRumour$RumourType.CIBOLA = new LostCityRumour$RumourType()._LostCityRumour$RumourType('CIBOLA', 9);
    LostCityRumour$RumourType.FOUNTAIN_OF_YOUTH = new LostCityRumour$RumourType()._LostCityRumour$RumourType('FOUNTAIN_OF_YOUTH', 10);
    LostCityRumour$RumourType.$VALUES = [LostCityRumour$RumourType.NO_SUCH_RUMOUR, LostCityRumour$RumourType.BURIAL_GROUND, LostCityRumour$RumourType.EXPEDITION_VANISHES, LostCityRumour$RumourType.NOTHING, LostCityRumour$RumourType.LEARN, LostCityRumour$RumourType.TRIBAL_CHIEF, LostCityRumour$RumourType.COLONIST, LostCityRumour$RumourType.MOUNDS, LostCityRumour$RumourType.RUINS, LostCityRumour$RumourType.CIBOLA, LostCityRumour$RumourType.FOUNTAIN_OF_YOUTH];
  }
}

$J.define(LostCityRumour, 'net.sf.freecol.common.model.LostCityRumour', { kind: 'class', sup: 'net.sf.freecol.common.model.TileItem', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_LostCityRumour$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.LostCityRumour$RumourType,java.lang.String': '_LostCityRumour$Game$Tile$RumourType$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Tile': '_LostCityRumour$Game$Tile' }, returns: { 'getXMLTagName': 'java.lang.String', 'getLayer': 'net.sf.freecol.common.model.Map$Layer', 'isComplete': 'boolean', 'isNatural': 'boolean', 'getZIndex': 'int', 'getNameKey': 'java.lang.String', 'getName': 'java.lang.String', 'getType': 'net.sf.freecol.common.model.LostCityRumour$RumourType' }, clinit: true, lazy: ['logger', 'rumourNothing'] });
$J.define(LostCityRumour$RumourType, 'net.sf.freecol.common.model.LostCityRumour$RumourType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_LostCityRumour$RumourType' }, returns: { 'getDescriptionKey': 'java.lang.String', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'NO_SUCH_RUMOUR', 'BURIAL_GROUND', 'EXPEDITION_VANISHES', 'NOTHING', 'LEARN', 'TRIBAL_CHIEF', 'COLONIST', 'MOUNDS', 'RUINS', 'CIBOLA', 'FOUNTAIN_OF_YOUTH'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  NameCache = $J.load('net.sf.freecol.common.i18n.NameCache');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Map$Layer = $J.load('net.sf.freecol.common.model.Map$Layer');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
