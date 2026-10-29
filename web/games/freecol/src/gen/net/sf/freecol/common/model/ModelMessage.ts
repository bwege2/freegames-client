// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ModelMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, JString, StringBuilder } from '../../../../../../jre/index.ts';
import { StringTemplate } from './StringTemplate.ts';

let Utility, Messages, FreeColObject, Player, StringTemplate$TemplateType, StringUtils, Utils;

/**
 * Contains a message about a change in the model.
 */
export class ModelMessage extends StringTemplate {
  static readonly TAG: string = 'modelMessage';
  /**
   * Compare messages by type.
   */
  static messageTypeComparator: Comparator<ModelMessage> = null;
  sourceId: string = null;
  displayId: string = null;
  messageType: ModelMessage$MessageType = null;
  displayed: boolean = false;
  static readonly DISPLAY_TAG: string = 'display';
  static readonly HAS_BEEN_DISPLAYED_TAG: string = 'hasBeenDisplayed';
  static readonly MESSAGE_TYPE_TAG: string = 'messageType';
  static readonly SOURCE_TAG: string = 'source';
  $init_ModelMessage() {
    this.displayed = false;
  }
  /**
   * Trivial constructor to allow creation with Game.newInstance.
   */
  _ModelMessage$(): this {
    this._StringTemplate$();
    this.$init_ModelMessage();
    return this;
  }
  /**
   * Creates a new {@code ModelMessage}.
   *
   * @param messageType The type of this model message.
   * @param id The object identifier.
   * @param defaultId The default identifier.
   * @param source The source of the message. This is what the
   *               message should be associated with.
   * @param display The {@code FreeColObject} to display.
   */
  _ModelMessage$MessageType$String$String$FreeColGameObject$FreeColObject(messageType: ModelMessage$MessageType, id: string, defaultId: string, source: FreeColGameObject, display: FreeColObject): this {
    this._StringTemplate$String$String$TemplateType(id, defaultId, StringTemplate$TemplateType.TEMPLATE);
    this.$init_ModelMessage();
    this.messageType = messageType;
    this.sourceId = source.getId();
    this.displayId = (display != null) ? display.getId() : source.getId();
    return this;
  }
  /**
   * Creates a new {@code ModelMessage}.
   *
   * @param messageType The type of this model message.
   * @param id The object identifier.
   * @param source The source of the message. This is what the
   *               message should be associated with.
   * @param display The {@code FreeColObject} to display.
   */
  _ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(messageType: ModelMessage$MessageType, id: string, source: FreeColGameObject, display: FreeColObject): this {
    this._ModelMessage$MessageType$String$String$FreeColGameObject$FreeColObject(messageType, id, null, source, display);
    return this;
  }
  /**
   * Creates a new {@code ModelMessage}.
   *
   * @param messageType The type of this model message.
   * @param id The object identifier.
   * @param source The source of the message. This is what the
   *               message should be associated with.
   */
  _ModelMessage$MessageType$String$FreeColGameObject(messageType: ModelMessage$MessageType, id: string, source: FreeColGameObject): this {
    this._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(messageType, id, source, ModelMessage.getDefaultDisplay(messageType, source));
    return this;
  }
  /**
   * Creates a new model message by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _ModelMessage$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._StringTemplate$();
    this.$init_ModelMessage();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Gets the source of the message.
   *
   * @return The identifier for the source of the message.
   */
  getSourceId(): string {
    return this.sourceId;
  }
  /**
   * Sets the source object.
   *
   * @param sourceId A new source object identifier.
   */
  setSourceId(sourceId: string): void {
    this.sourceId = sourceId;
  }
  /**
   * Gets the object to display.
   *
   * @return The identifier of the object to display.
   */
  getDisplayId(): string {
    return this.displayId;
  }
  /**
   * Sets the object to display.
   *
   * @param displayId A new display object identifier.
   */
  setDisplayId(displayId: string): void {
    this.displayId = displayId;
  }
  /**
   * Switch the source (and display if it is the same) to a new
   * object.  Called when the source object becomes invalid.
   *
   * @param newSource A new source.
   */
  divert(newSource: FreeColGameObject): void {
    if (Utils.equals(this.displayId, this.sourceId)) {
      this.displayId = newSource.getId();
    }
    this.sourceId = newSource.getId();
  }
  /**
   * Gets the messageType of the message to display.
   *
   * @return The messageType.
   */
  getMessageType(): ModelMessage$MessageType {
    return this.messageType;
  }
  /**
   * Sets the type of the message.
   *
   * @param messageType The new messageType.
   */
  setMessageType(messageType: ModelMessage$MessageType): void {
    this.messageType = messageType;
  }
  /**
   * Get the option name for this message.
   *
   * @return The option name.
   */
  getOptionName(): string {
    return (this.messageType == null) ? null : this.messageType.getOptionName();
  }
  /**
   * Has this message been displayed?
   *
   * @return True if this message has been displayed.
   */
  getDisplayed(): boolean {
    return this.displayed;
  }
  /**
   * Sets whether this message has been displayed.
   *
   * @param displayed The new displayed state.
   */
  setDisplayed(displayed: boolean): void {
    this.displayed = displayed;
  }
  /**
   * Set a default identifier.
   *
   * @param id The new default identifier.
   * @return This {@code ModelMessage}.
   */
  addDefaultId(id: string): ModelMessage {
    return super.setDefaultId$String$Class(id, $J.cls(ModelMessage));
  }
  /**
   * Gets the default display object for the given type.
   *
   * @param messageType The type to find the default display object for.
   * @param source The source object
   * @return An object to be displayed for the message.
   */
  static getDefaultDisplay(messageType: ModelMessage$MessageType, source: FreeColGameObject): FreeColObject {
    let o = null;
    switch (messageType) {
      case ModelMessage$MessageType.SONS_OF_LIBERTY:
      case ModelMessage$MessageType.GOVERNMENT_EFFICIENCY:
        o = source.getSpecification().getGoodsType('model.goods.bells');
        break;
      case ModelMessage$MessageType.UNIT_IMPROVED:
      case ModelMessage$MessageType.UNIT_DEMOTED:
      case ModelMessage$MessageType.UNIT_LOST:
      case ModelMessage$MessageType.UNIT_ADDED:
      case ModelMessage$MessageType.LOST_CITY_RUMOUR:
      case ModelMessage$MessageType.COMBAT_RESULT:
      case ModelMessage$MessageType.DEMANDS:
      case ModelMessage$MessageType.GOODS_MOVEMENT:
        o = source;
        break;
      case ModelMessage$MessageType.BUILDING_COMPLETED:
        o = source.getSpecification().getGoodsType('model.goods.hammers');
        break;
      case ModelMessage$MessageType.DEFAULT:
      case ModelMessage$MessageType.WARNING:
      case ModelMessage$MessageType.WAREHOUSE_CAPACITY:
      case ModelMessage$MessageType.FOREIGN_DIPLOMACY:
      case ModelMessage$MessageType.MARKET_PRICES:
      case ModelMessage$MessageType.MISSING_GOODS:
      case ModelMessage$MessageType.TUTORIAL:
      case ModelMessage$MessageType.GIFT_GOODS:
      default:
        if (source instanceof Player) {
          o = source;
        }
        break;
    }
    return o;
  }
  /**
   * Get a key for a message that might be ignored.
   *
   * @return A key, or null if the message should not be ignored.
   */
  getIgnoredMessageKey(): string {
    {
      let sb: StringBuilder;
      switch (this.getMessageType()) {
        case ModelMessage$MessageType.WAREHOUSE_CAPACITY:
          sb = new StringBuilder(64);
          sb.append(this.getSourceId());
          {
            let t: StringTemplate;
            switch (this.getTemplateType()) {
              case StringTemplate$TemplateType.TEMPLATE:
                t = this.getReplacement('%goods%');
                if (t != null) {
                  sb.append(String.fromCharCode(45 /* '-' */)).append(t.getId());
                }
                break;
              default:
                break;
            }
          }
          return sb.toString();
        default:
          break;
      }
    }
    return null;
  }
  /**
   * Split a message into a list of text and link objects.
   *
   * @param player The {@code Player} who will see the result.
   * @return A list of strings and buttons.
   */
  splitLinks(player: Player): List<any> {
    let source = player.getGame().getMessageSource(this);
    let result = new ArrayList();
    result.add(Messages.message$StringTemplate(this));
    for (const $it0 = this.entryList().iterator(); $it0.hasNext(); ) {
      let e = $it0.next();
      let key = e.getKey();
      let val = Messages.message$StringTemplate(e.getValue());
      if (val == null) {
        continue;
      }
      let b = Utility.getMessageButton(key, val, player, source);
      if (b == null) {
        continue;
      }
      let next = new ArrayList();
      for (const $it1 = result.iterator(); $it1.hasNext(); ) {
        let o = $it1.next();
        if ($J.isa(o, JString)) {
          let str = o;
          let index: number;
          let start = 0;
          while ((index = str.indexOf(val, start)) >= 0) {
            if (index > start) {
              next.add(str.substring(start, index));
            }
            next.add(Utility.getMessageButton(key, val, player, source));
            start = (index + val.length) | 0;
          }
          next.add(str.substring(start, str.length));
        } else {
          next.add(o);
        }
      }
      result = next;
    }
    return result;
  }
  /**
   * Get a comparator that sorts on the message source object.
   *
   * @param game The {@code Game} to look up source objects in.
   * @param specialized A map of specialized comparators keyed by class name.
   * @return The {@code Comparator}.
   */
  static getSourceComparator(game: Game, specialized: JMap<string, Comparator<any>>): Comparator<ModelMessage> {
    return (message1, message2) => {
      let sourceId1 = message1.getSourceId();
      let sourceId2 = message2.getSourceId();
      if (Utils.equals(sourceId1, sourceId2)) {
        return ModelMessage.messageTypeComparator(message1, message2);
      }
      let source1 = game.getMessageSource(message1);
      let source2 = game.getMessageSource(message2);
      let base = (FreeColObject.getObjectClassIndex(source1) - FreeColObject.getObjectClassIndex(source2)) | 0;
      if (base === 0 && specialized != null && source1 != null) {
        let name = source1.getClass().getName();
        let c = specialized.get(name);
        if (c != null) {
          base = c(source1, source2);
        }
      }
      return base;
    };
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ModelMessage));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.sourceId = o.getSourceId();
    this.displayId = o.getDisplayId();
    this.messageType = o.getMessageType();
    this.displayed = o.getDisplayed();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute(ModelMessage.SOURCE_TAG, this.sourceId);
    if (this.displayId != null) {
      xw.writeAttribute(ModelMessage.DISPLAY_TAG, this.displayId);
    }
    xw.writeAttribute$String$Enum(ModelMessage.MESSAGE_TYPE_TAG, this.messageType);
    xw.writeAttribute$String$boolean(ModelMessage.HAS_BEEN_DISPLAYED_TAG, this.displayed);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.sourceId = xr.getAttribute$String$String(ModelMessage.SOURCE_TAG, null);
    this.displayId = xr.getAttribute$String$String(ModelMessage.DISPLAY_TAG, null);
    this.messageType = xr.getAttribute$String$Class$Enum(ModelMessage.MESSAGE_TYPE_TAG, $J.cls(ModelMessage$MessageType), ModelMessage$MessageType.DEFAULT);
    this.displayed = xr.getAttribute$String$boolean(ModelMessage.HAS_BEEN_DISPLAYED_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ModelMessage.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof ModelMessage) {
      let other = o;
      return this.messageType === other.messageType && this.displayed === other.displayed && Utils.equals(this.sourceId, other.sourceId) && Utils.equals(this.displayId, other.displayId) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    if (this.sourceId != null) {
      hash = (Math.imul(37, hash) + $J.hashCode(this.sourceId)) | 0;
    }
    if (this.displayId != null) {
      hash = (Math.imul(37, hash) + $J.hashCode(this.displayId)) | 0;
    }
    hash = (Math.imul(37, hash) + this.messageType.ordinal()) | 0;
    hash = (Math.imul(37, hash) + ((this.displayed) ? 1 : 0)) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(128);
    sb.append('[ModelMessage ').append(String(this.hashCode())).append(String.fromCharCode(32 /* ' ' */)).append((this.sourceId == null) ? 'null' : this.sourceId).append(String.fromCharCode(47 /* \u002f */)).append((this.displayId == null) ? 'null' : this.displayId).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.messageType)).append(String.fromCharCode(32 /* ' ' */)).append(String(this.displayed)).append(String.fromCharCode(32 /* ' ' */)).append(super.toString()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    ModelMessage.messageTypeComparator = (m1, m2) => (m1.getMessageType().ordinal() - m2.getMessageType().ordinal()) | 0;
  }
}

/**
 * Constants categorizing the type of message.
 *
 * When this changes, be sure to update client-options.xml and the
 * messages file appropriately.
 */
export class ModelMessage$MessageType extends JEnum {
  optionName: string = null;
  static DEFAULT: ModelMessage$MessageType = null;
  static BUILDING_COMPLETED: ModelMessage$MessageType = null;
  static COMBAT_RESULT: ModelMessage$MessageType = null;
  static DEMANDS: ModelMessage$MessageType = null;
  static DISASTERS: ModelMessage$MessageType = null;
  static FOREIGN_DIPLOMACY: ModelMessage$MessageType = null;
  static GIFT_GOODS: ModelMessage$MessageType = null;
  static GOODS_MOVEMENT: ModelMessage$MessageType = null;
  static GOVERNMENT_EFFICIENCY: ModelMessage$MessageType = null;
  static LOST_CITY_RUMOUR: ModelMessage$MessageType = null;
  static MARKET_PRICES: ModelMessage$MessageType = null;
  static MISSING_GOODS: ModelMessage$MessageType = null;
  static SONS_OF_LIBERTY: ModelMessage$MessageType = null;
  static TUTORIAL: ModelMessage$MessageType = null;
  static UNIT_ADDED: ModelMessage$MessageType = null;
  static UNIT_ARRIVED: ModelMessage$MessageType = null;
  static UNIT_DEMOTED: ModelMessage$MessageType = null;
  static UNIT_IMPROVED: ModelMessage$MessageType = null;
  static UNIT_LOST: ModelMessage$MessageType = null;
  static UNIT_REPAIRED: ModelMessage$MessageType = null;
  static WAREHOUSE_CAPACITY: ModelMessage$MessageType = null;
  static WARNING: ModelMessage$MessageType = null;
  static $VALUES: ModelMessage$MessageType[] = null;
  _ModelMessage$MessageType($name: string, $ordinal: number, optionName: string): this {
    this._JEnum($name, $ordinal);
    this.optionName = optionName;
    return this;
  }
  getOptionName(): string {
    return this.optionName;
  }
  /**
   * Get a message key for this message type.
   *
   * @return A message key.
   */
  getKey(): string {
    return 'messageType.' + StringUtils.getEnumKey(this);
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  static values(): ModelMessage$MessageType[] { return ModelMessage$MessageType.$VALUES.slice(); }
  static valueOf(name: string): ModelMessage$MessageType { return $J.enumValueOf(ModelMessage$MessageType, name); }
  static $clinit() {
    ModelMessage$MessageType.DEFAULT = new ModelMessage$MessageType()._ModelMessage$MessageType('DEFAULT', 0, '');
    ModelMessage$MessageType.BUILDING_COMPLETED = new ModelMessage$MessageType()._ModelMessage$MessageType('BUILDING_COMPLETED', 1, 'model.option.guiShowBuildingCompleted');
    ModelMessage$MessageType.COMBAT_RESULT = new ModelMessage$MessageType()._ModelMessage$MessageType('COMBAT_RESULT', 2, null);
    ModelMessage$MessageType.DEMANDS = new ModelMessage$MessageType()._ModelMessage$MessageType('DEMANDS', 3, 'model.option.guiShowDemands');
    ModelMessage$MessageType.DISASTERS = new ModelMessage$MessageType()._ModelMessage$MessageType('DISASTERS', 4, 'model.option.guiShowDisasters');
    ModelMessage$MessageType.FOREIGN_DIPLOMACY = new ModelMessage$MessageType()._ModelMessage$MessageType('FOREIGN_DIPLOMACY', 5, 'model.option.guiShowForeignDiplomacy');
    ModelMessage$MessageType.GIFT_GOODS = new ModelMessage$MessageType()._ModelMessage$MessageType('GIFT_GOODS', 6, 'model.option.guiShowGifts');
    ModelMessage$MessageType.GOODS_MOVEMENT = new ModelMessage$MessageType()._ModelMessage$MessageType('GOODS_MOVEMENT', 7, 'model.option.guiShowGoodsMovement');
    ModelMessage$MessageType.GOVERNMENT_EFFICIENCY = new ModelMessage$MessageType()._ModelMessage$MessageType('GOVERNMENT_EFFICIENCY', 8, 'model.option.guiShowGovernmentEfficiency');
    ModelMessage$MessageType.LOST_CITY_RUMOUR = new ModelMessage$MessageType()._ModelMessage$MessageType('LOST_CITY_RUMOUR', 9, null);
    ModelMessage$MessageType.MARKET_PRICES = new ModelMessage$MessageType()._ModelMessage$MessageType('MARKET_PRICES', 10, 'model.option.guiShowMarketPrices');
    ModelMessage$MessageType.MISSING_GOODS = new ModelMessage$MessageType()._ModelMessage$MessageType('MISSING_GOODS', 11, 'model.option.guiShowMissingGoods');
    ModelMessage$MessageType.SONS_OF_LIBERTY = new ModelMessage$MessageType()._ModelMessage$MessageType('SONS_OF_LIBERTY', 12, 'model.option.guiShowSonsOfLiberty');
    ModelMessage$MessageType.TUTORIAL = new ModelMessage$MessageType()._ModelMessage$MessageType('TUTORIAL', 13, 'model.option.guiShowTutorial');
    ModelMessage$MessageType.UNIT_ADDED = new ModelMessage$MessageType()._ModelMessage$MessageType('UNIT_ADDED', 14, 'model.option.guiShowUnitAdded');
    ModelMessage$MessageType.UNIT_ARRIVED = new ModelMessage$MessageType()._ModelMessage$MessageType('UNIT_ARRIVED', 15, 'model.option.guiShowUnitArrived');
    ModelMessage$MessageType.UNIT_DEMOTED = new ModelMessage$MessageType()._ModelMessage$MessageType('UNIT_DEMOTED', 16, 'model.option.guiShowUnitDemoted');
    ModelMessage$MessageType.UNIT_IMPROVED = new ModelMessage$MessageType()._ModelMessage$MessageType('UNIT_IMPROVED', 17, 'model.option.guiShowUnitImproved');
    ModelMessage$MessageType.UNIT_LOST = new ModelMessage$MessageType()._ModelMessage$MessageType('UNIT_LOST', 18, 'model.option.guiShowUnitLost');
    ModelMessage$MessageType.UNIT_REPAIRED = new ModelMessage$MessageType()._ModelMessage$MessageType('UNIT_REPAIRED', 19, 'model.option.guiShowUnitRepaired');
    ModelMessage$MessageType.WAREHOUSE_CAPACITY = new ModelMessage$MessageType()._ModelMessage$MessageType('WAREHOUSE_CAPACITY', 20, 'model.option.guiShowWarehouseCapacity');
    ModelMessage$MessageType.WARNING = new ModelMessage$MessageType()._ModelMessage$MessageType('WARNING', 21, 'model.option.guiShowWarning');
    ModelMessage$MessageType.$VALUES = [ModelMessage$MessageType.DEFAULT, ModelMessage$MessageType.BUILDING_COMPLETED, ModelMessage$MessageType.COMBAT_RESULT, ModelMessage$MessageType.DEMANDS, ModelMessage$MessageType.DISASTERS, ModelMessage$MessageType.FOREIGN_DIPLOMACY, ModelMessage$MessageType.GIFT_GOODS, ModelMessage$MessageType.GOODS_MOVEMENT, ModelMessage$MessageType.GOVERNMENT_EFFICIENCY, ModelMessage$MessageType.LOST_CITY_RUMOUR, ModelMessage$MessageType.MARKET_PRICES, ModelMessage$MessageType.MISSING_GOODS, ModelMessage$MessageType.SONS_OF_LIBERTY, ModelMessage$MessageType.TUTORIAL, ModelMessage$MessageType.UNIT_ADDED, ModelMessage$MessageType.UNIT_ARRIVED, ModelMessage$MessageType.UNIT_DEMOTED, ModelMessage$MessageType.UNIT_IMPROVED, ModelMessage$MessageType.UNIT_LOST, ModelMessage$MessageType.UNIT_REPAIRED, ModelMessage$MessageType.WAREHOUSE_CAPACITY, ModelMessage$MessageType.WARNING];
  }
}

$J.define(ModelMessage, 'net.sf.freecol.common.model.ModelMessage', { kind: 'class', sup: 'net.sf.freecol.common.model.StringTemplate', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_ModelMessage$FreeColXMLReader', 'net.sf.freecol.common.model.ModelMessage$MessageType,java.lang.String,net.sf.freecol.common.model.FreeColGameObject': '_ModelMessage$MessageType$String$FreeColGameObject', 'net.sf.freecol.common.model.ModelMessage$MessageType,java.lang.String,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColObject': '_ModelMessage$MessageType$String$FreeColGameObject$FreeColObject', 'net.sf.freecol.common.model.ModelMessage$MessageType,java.lang.String,java.lang.String,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColObject': '_ModelMessage$MessageType$String$String$FreeColGameObject$FreeColObject', '': '_ModelMessage$' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getIgnoredMessageKey': 'java.lang.String', 'getDisplayed': 'boolean', 'getOptionName': 'java.lang.String', 'getMessageType': 'net.sf.freecol.common.model.ModelMessage$MessageType', 'getDisplayId': 'java.lang.String', 'getSourceId': 'java.lang.String' }, clinit: true, lazy: ['messageTypeComparator'] });
$J.define(ModelMessage$MessageType, 'net.sf.freecol.common.model.ModelMessage$MessageType', { kind: 'enum', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Enum', ctors: { 'java.lang.String': '_ModelMessage$MessageType' }, returns: { 'getNameKey': 'java.lang.String', 'getKey': 'java.lang.String', 'getOptionName': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'DEFAULT', 'BUILDING_COMPLETED', 'COMBAT_RESULT', 'DEMANDS', 'DISASTERS', 'FOREIGN_DIPLOMACY', 'GIFT_GOODS', 'GOODS_MOVEMENT', 'GOVERNMENT_EFFICIENCY', 'LOST_CITY_RUMOUR', 'MARKET_PRICES', 'MISSING_GOODS', 'SONS_OF_LIBERTY', 'TUTORIAL', 'UNIT_ADDED', 'UNIT_ARRIVED', 'UNIT_DEMOTED', 'UNIT_IMPROVED', 'UNIT_LOST', 'UNIT_REPAIRED', 'WAREHOUSE_CAPACITY', 'WARNING'] });
$J.module(() => {
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate$TemplateType = $J.load('net.sf.freecol.common.model.StringTemplate$TemplateType');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
