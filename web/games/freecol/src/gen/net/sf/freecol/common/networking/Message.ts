// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/Message.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Collections, Comparator, Exception, HashMap, HashSet, JEnum, JObject, Level, Logger, NumberFormatException, StringBuilder, XMLStreamException } from '../../../../../../jre/index.ts';

let FreeColException, FreeColXMLReader, FreeColObject, Game, CollectionUtils, Introspector, Introspector$IntrospectorException, StringUtils;

/**
 * Base abstract class for all messages.
 */
export class Message extends JObject {
  static logger: Logger = null;
  /**
   * A map of message name to message constructors, built on the fly
   * as new messages are encountered and suitable constructors found.
   */
  static builders: JMap<string, Constructor<Message>> = null;
  /**
   * Classes used by Message.read()
   */
  static readClasses: JClass[] = null;
  /**
   * Comparator comparing by message priority.
   */
  static messagePriorityComparator: Comparator<Message> = null;
  /**
   * Deliberately trivial constructor.
   */
  _Message(): this {
    return this;
  }
  /**
   * Does this message consist only of mergeable attributes?
   *
   * @return True if this message is trivially mergeable.
   */
  canMerge(): boolean {
    return false;
  }
  /**
   * Checks if this message is of a given type.
   *
   * @param type The type you wish to test against.
   * @return True if the type of this message equals the given type.
   */
  isType(type$: string): boolean {
    return $J.equals(this.getType$(), type$);
  }
  /**
   * Get a boolean attribute value.
   *
   * @param key The attribute to look for.
   * @param defaultValue The fallback result.
   * @return The boolean value, or the default value if no boolean is found.
   */
  getBooleanAttribute(key: string, defaultValue: boolean): boolean {
    if (this.hasAttribute(key)) {
      try {
        return $J.parseBoolean(this.getStringAttribute(key));
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let nfe = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    return defaultValue;
  }
  /**
   * Get an integer attribute value.
   *
   * @param key The attribute to look for.
   * @param defaultValue The fallback result.
   * @return The integer value, or the default value if no integer is found.
   */
  getIntegerAttribute(key: string, defaultValue: number): number {
    if (this.hasAttribute(key)) {
      try {
        return $J.parseInt(this.getStringAttribute(key));
      } catch ($e1) {
        if ($J.isa($e1, NumberFormatException)) {
          let nfe = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    }
    return defaultValue;
  }
  /**
   * Gets an enum attribute value.
   *
   * @param <T> The expected enum type.
   * @param key The attribute name.
   * @param returnClass The class of the return value.
   * @param defaultValue The default value.
   * @return The enum attribute value, or the default value if none found.
   */
  getEnumAttribute<T>(key: string, returnClass: JClass<T>, defaultValue: T): T {
    let result = defaultValue;
    if (this.hasAttribute(key)) {
      let kv = StringUtils.upCase$String(this.getStringAttribute(key));
      try {
        result = $J.enumValueOf(returnClass, kv);
      } catch ($e2) {
        if ($J.isa($e2, Exception)) {
          let e = $J.exc($e2);
          Message.logger.warning('Not a ' + $J.getClass(defaultValue).getName() + ': ' + kv);
        } else {
          throw $e2;
        }
      }
    }
    return result;
  }
  /**
   * Sets an attribute in this message with a boolean value.
   *
   * @param key The attribute to set.
   * @param value The value of the attribute.
   */
  setBooleanAttribute(key: string, value: boolean): void {
    if (value != null) {
      this.setStringAttribute(key, String(value));
    }
  }
  /**
   * Sets an attribute in this message with an enum value.
   *
   * @param key The attribute to set.
   * @param value The value of the attribute.
   */
  setEnumAttribute(key: string, value: JEnum<any>): void {
    if (value != null) {
      this.setStringAttribute(key, StringUtils.downCase$String(value.toString()));
    }
  }
  /**
   * Sets an attribute in this message with an integer value.
   *
   * @param key The attribute to set.
   * @param value The value of the attribute.
   */
  setIntegerAttribute(key: string, value: number): void {
    this.setStringAttribute(key, String(value));
  }
  /**
   * Set all the attributes in a map.
   *
   * @param attributeMap The map of key,value pairs to set.
   */
  setStringAttributeMap(attributeMap: JMap<string, string>): void {
    CollectionUtils.forEachMapEntry$Map$Consumer(attributeMap, (e) => this.setStringAttribute(e.getKey(), e.getValue()));
  }
  /**
   * Set all the attributes from a list.
   *
   * @param attributes A list of alternating key,value pairs.
   */
  setStringAttributes$List(attributes: List<string>): void {
    for (let i = 0; i < ((attributes.size() - 1) | 0); i = (i + 2) | 0) {
      let k = attributes.get(i);
      let v = attributes.get((i + 1) | 0);
      if (k != null && v != null) {
        this.setStringAttribute(k, v);
      }
    }
  }
  /**
   * Set all the attributes from an array.
   *
   * @param attributes An array of alternating key,value pairs.
   */
  setStringAttributes$StringArr(attributes: string[]): void {
    for (let i = 0; i < attributes.length; i = (i + 2) | 0) {
      if ((attributes[(i + 1) | 0]) != null) {
        this.setStringAttribute(attributes[i], attributes[(i + 1) | 0]);
      }
    }
  }
  /**
   * Get the array attributes of this message.
   *
   * @return A list of the array attributes found.
   */
  getArrayAttributes(): List<string> {
    let ret = new ArrayList();
    let n = this.getIntegerAttribute(FreeColObject.ARRAY_SIZE_TAG, -1);
    for (let i = 0; i < n; i++) {
      let key = FreeColObject.arrayKey(i);
      if (!this.hasAttribute(key)) {
        break;
      }
      ret.add(this.getStringAttribute(key));
    }
    return ret;
  }
  /**
   * Set a list of attributes as an array.
   *
   * @param attributes A list of attribute values.
   */
  setArrayAttributes$List(attributes: List<string>): void {
    if (attributes != null) {
      let i = 0;
      for (const $it3 = attributes.iterator(); $it3.hasNext(); ) {
        let a = $it3.next();
        let key = FreeColObject.arrayKey(i);
        i++;
        this.setStringAttribute(key, a);
      }
      this.setIntegerAttribute(FreeColObject.ARRAY_SIZE_TAG, i);
    }
  }
  /**
   * Set an array of attributes.
   *
   * @param attributes The array of attributes.
   */
  setArrayAttributes$StringArr(attributes: string[]): void {
    if (attributes != null) {
      for (let i = 0; i < attributes.length; i++) {
        this.setStringAttribute(FreeColObject.arrayKey(i), attributes[i]);
      }
    }
  }
  /**
   * Get a child object.
   *
   * @param <T> The actual class of {@code FreeColObject} to get.
   * @param index The index of the child to get.
   * @param returnClass The expected class of child.
   * @return The child object found, or null if the index is invalid or
   *     return class incorrect.
   */
  getChild<T>(index: number, returnClass: JClass<T>): T {
    if (index >= this.getChildCount()) {
      return null;
    }
    let fco = this.getChildren$().get(index);
    try {
      return returnClass.cast(fco);
    } catch ($e4) {
      if ($J.isa($e4, ClassCastException)) {
        let cce = $J.exc($e4);
        Message.logger.log(Level.WARNING, 'Cast fail', cce);
        return null;
      } else {
        throw $e4;
      }
    }
  }
  /**
   * Get the child objects.
   *
   * @param <T> The actual class of {@code FreeColObject} to get.
   * @param returnClass The expected class of children.
   * @return The children with the expected class.
   */
  getChildren$Class<T>(returnClass: JClass<T>): List<T> {
    let ret = new ArrayList();
    for (const $it5 = this.getChildren$().iterator(); $it5.hasNext(); ) {
      let fco = $it5.next();
      try {
        ret.add(returnClass.cast(fco));
      } catch ($e6) {
        if ($J.isa($e6, ClassCastException)) {
          let cce = $J.exc($e6);
        } else {
          throw $e6;
        }
      }
    }
    return ret;
  }
  /**
   * Is this message vacuous?
   *
   * @return True if there are no attributes or children present.
   */
  isEmpty(): boolean {
    return this.getStringAttributeMap().isEmpty() && this.getChildren$().isEmpty();
  }
  /**
   * Get the priority level of this type of message.
   *
   * @return The message priority level.
   */
  getPriorityLevel(): number {
    return this.getPriority().getValue();
  }
  /**
   * Merge another message into this message if possible.
   *
   * @param message The {@code Message} to merge.
   * @return True if the other message was merged.
   */
  merge(message: Message): boolean {
    if (!message.canMerge()) {
      return false;
    }
    let map = this.getStringAttributeMap();
    map.putAll(message.getStringAttributeMap());
    this.setStringAttributeMap(map);
    let objs = new HashSet(this.getChildren$());
    objs.addAll(message.getChildren$());
    this.setChildren(CollectionUtils.toList$Collection(objs));
    return true;
  }
  /**
   * Write any attributes of this message.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there is a problem writing the stream.
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    for (const $it7 = this.getStringAttributeMap().entrySet().iterator(); $it7.hasNext(); ) {
      let e = $it7.next();
      xw.writeAttribute(e.getKey(), e.getValue());
    }
  }
  /**
   * Write any children of this message.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there is a problem writing the stream.
   */
  writeChildren(xw: FreeColXMLWriter): void {
    for (const $it8 = this.getChildren$().iterator(); $it8.hasNext(); ) {
      let fco = $it8.next();
      fco.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * Write this message as XML.
   *
   * @param xw The {@code FreeColXMLWriter} to write with.
   * @exception XMLStreamException if there is a problem writing the stream.
   */
  toXML(xw: FreeColXMLWriter): void {
    xw.writeStartElement(this.getType$());
    this.writeAttributes(xw);
    this.writeChildren(xw);
    xw.writeEndElement();
  }
  igc$FreeColClient(freeColClient: FreeColClient): InGameController {
    return freeColClient.getInGameController();
  }
  igc$FreeColServer(freeColServer: FreeColServer): InGameController {
    return freeColServer.getInGameController();
  }
  invokeAndWait(freeColClient: FreeColClient, runnable: Runnable): void {
    freeColClient.getGUI().invokeNowOrWait(runnable);
  }
  invokeLater(freeColClient: FreeColClient, runnable: Runnable): void {
    freeColClient.getGUI().invokeNowOrLater(runnable);
  }
  pgc$FreeColClient(freeColClient: FreeColClient): PreGameController {
    return freeColClient.getPreGameController();
  }
  pgc$FreeColServer(freeColServer: FreeColServer): PreGameController {
    return freeColServer.getPreGameController();
  }
  /**
   * Create a runnable to execute generic message actions.
   *
   * @param freeColClient The client.
   */
  clientGeneric(freeColClient: FreeColClient): void {
    let fcc = freeColClient;
    if (fcc.currentPlayerIsMyPlayer()) {
      let soundId = this.getStringAttribute('sound');
      let flush = this.getBooleanAttribute('flush', false);
      if (soundId != null || flush) {
        this.invokeLater(freeColClient, () => {
          if (soundId != null) {
            this.igc$FreeColClient(fcc).sound(soundId);
          }
          if (flush) {
            this.igc$FreeColClient(fcc).nextModelMessage();
          }
        });
      }
    }
  }
  /**
   * Complain about finding the wrong XML element.
   *
   * @param wanted The tag we wanted.
   * @param got The tag we got.
   * @exception XMLStreamException is always thrown.
   */
  expected(wanted: string, got: string): void {
    throw new XMLStreamException('In ' + $J.getClass(this).getName() + ', expected ' + wanted + ' but read: ' + got);
  }
  /**
   * Read a new message from a stream.
   *
   * @param game The {@code Game} within which to construct the message.
   * @param xr A {@code FreeColXMLReader} to read from.
   * @return The new {@code Message}.
   * @exception FreeColException if there is problem reading the message.
   */
  static read(game: Game, xr: FreeColXMLReader): Message {
    let tag = xr.getLocalName();
    let ret = null;
    let mb = Message.builders.get(tag);
    if (mb == null) {
      let className = 'net.sf.freecol.common.networking.' + StringUtils.capitalize$String(tag) + 'Message';
      let cl = Introspector.getClassByName(className);
      if (cl == null) {
        throw (new FreeColException()._FreeColException$String('No class for: ' + tag)).preserveDebug();
      }
      mb = Introspector.getConstructor(cl, Message.readClasses);
      if (mb == null) {
        throw (new FreeColException()._FreeColException$String('No constructor for: ' + tag)).preserveDebug();
      }
      Message.builders.put(tag, mb);
    }
    try {
      ret = Introspector.construct(mb, [game, xr]);
    } catch ($e9) {
      if ($J.isa($e9, Introspector$IntrospectorException)) {
        let ie = $J.exc($e9);
        throw new FreeColException()._FreeColException$Throwable(ie);
      } else {
        throw $e9;
      }
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */));
    Message.pretty(sb, this.getType$(), this.getStringAttributeMap(), this.getChildren$());
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  /**
   * Pretty print the components of a message to a string builder.
   *
   * @param sb The {@code StringBuilder} to print to.
   * @param type The type of the message.
   * @param attributeMap A map of key,value attribute pairs.
   * @param children The attached child {@code FreeColObject}s.
   */
  static pretty(sb: StringBuilder, type$: string, attributeMap: JMap<string, string>, children: List<FreeColObject>): void {
    sb.append(type$);
    if (attributeMap != null) {
      for (const $it10 = attributeMap.entrySet().iterator(); $it10.hasNext(); ) {
        let e = $it10.next();
        sb.append(String.fromCharCode(32 /* ' ' */)).append(e.getKey()).append(String.fromCharCode(61 /* '=' */)).append(e.getValue());
      }
    }
    if (children != null) {
      for (const $it11 = children.iterator(); $it11.hasNext(); ) {
        let fco = $it11.next();
        sb.append(String.fromCharCode(32 /* ' ' */)).append(fco.getId());
      }
    }
  }
  static $clinit() {
    Message.logger = Logger.getLogger($J.cls(Message).getName());
    Message.builders = Collections.synchronizedMap(new HashMap());
    Message.readClasses = [$J.cls(Game), $J.cls(FreeColXMLReader)];
    Message.messagePriorityComparator = Comparator.comparingInt(($p0) => $p0.getPriorityLevel());
  }
}

export class Message$MessagePriority extends JEnum {
  level: number = 0;
  static ATTRIBUTE: Message$MessagePriority = null;
  static ANIMATION: Message$MessagePriority = null;
  static REMOVE: Message$MessagePriority = null;
  static ADDPLAYER: Message$MessagePriority = null;
  static STANCE: Message$MessagePriority = null;
  static OWNED: Message$MessagePriority = null;
  static PARTIAL: Message$MessagePriority = null;
  static UPDATE: Message$MessagePriority = null;
  static EARLY: Message$MessagePriority = null;
  static NORMAL: Message$MessagePriority = null;
  static LATE: Message$MessagePriority = null;
  static LAST: Message$MessagePriority = null;
  static $VALUES: Message$MessagePriority[] = null;
  _Message$MessagePriority($name: string, $ordinal: number, level: number): this {
    this._JEnum($name, $ordinal);
    this.level = level;
    return this;
  }
  getValue(): number {
    return this.level;
  }
  static values(): Message$MessagePriority[] { return Message$MessagePriority.$VALUES.slice(); }
  static valueOf(name: string): Message$MessagePriority { return $J.enumValueOf(Message$MessagePriority, name); }
  static $clinit() {
    Message$MessagePriority.ATTRIBUTE = new Message$MessagePriority()._Message$MessagePriority('ATTRIBUTE', 0, -1);
    Message$MessagePriority.ANIMATION = new Message$MessagePriority()._Message$MessagePriority('ANIMATION', 1, 0);
    Message$MessagePriority.REMOVE = new Message$MessagePriority()._Message$MessagePriority('REMOVE', 2, 100);
    Message$MessagePriority.ADDPLAYER = new Message$MessagePriority()._Message$MessagePriority('ADDPLAYER', 3, 4);
    Message$MessagePriority.STANCE = new Message$MessagePriority()._Message$MessagePriority('STANCE', 4, 5);
    Message$MessagePriority.OWNED = new Message$MessagePriority()._Message$MessagePriority('OWNED', 5, 20);
    Message$MessagePriority.PARTIAL = new Message$MessagePriority()._Message$MessagePriority('PARTIAL', 6, 9);
    Message$MessagePriority.UPDATE = new Message$MessagePriority()._Message$MessagePriority('UPDATE', 7, 10);
    Message$MessagePriority.EARLY = new Message$MessagePriority()._Message$MessagePriority('EARLY', 8, 1);
    Message$MessagePriority.NORMAL = new Message$MessagePriority()._Message$MessagePriority('NORMAL', 9, 15);
    Message$MessagePriority.LATE = new Message$MessagePriority()._Message$MessagePriority('LATE', 10, 90);
    Message$MessagePriority.LAST = new Message$MessagePriority()._Message$MessagePriority('LAST', 11, 99);
    Message$MessagePriority.$VALUES = [Message$MessagePriority.ATTRIBUTE, Message$MessagePriority.ANIMATION, Message$MessagePriority.REMOVE, Message$MessagePriority.ADDPLAYER, Message$MessagePriority.STANCE, Message$MessagePriority.OWNED, Message$MessagePriority.PARTIAL, Message$MessagePriority.UPDATE, Message$MessagePriority.EARLY, Message$MessagePriority.NORMAL, Message$MessagePriority.LATE, Message$MessagePriority.LAST];
  }
}

$J.define(Message, 'net.sf.freecol.common.networking.Message', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Message' }, returns: { 'getPriorityLevel': 'int', 'isEmpty': 'boolean', 'getArrayAttributes': 'java.util.List', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getChildren$': 'java.util.List', 'getChildCount': 'int', 'getStringAttributeMap': 'java.util.Map', 'getType$': 'java.lang.String' }, meths: { 'pgc(net.sf.freecol.server.FreeColServer)': 'pgc$FreeColServer', 'pgc(net.sf.freecol.client.FreeColClient)': 'pgc$FreeColClient', 'igc(net.sf.freecol.server.FreeColServer)': 'igc$FreeColServer', 'igc(net.sf.freecol.client.FreeColClient)': 'igc$FreeColClient', 'getChildren(java.lang.Class)': 'getChildren$Class', 'setArrayAttributes(java.lang.String[])': 'setArrayAttributes$StringArr', 'setArrayAttributes(java.util.List)': 'setArrayAttributes$List', 'setStringAttributes(java.lang.String[])': 'setStringAttributes$StringArr', 'setStringAttributes(java.util.List)': 'setStringAttributes$List', 'getChildren()': 'getChildren$', 'getType()': 'getType$' }, clinit: true, lazy: ['logger', 'builders', 'readClasses', 'messagePriorityComparator'] });
$J.define(Message$MessagePriority, 'net.sf.freecol.common.networking.Message$MessagePriority', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int': '_Message$MessagePriority' }, returns: { 'getValue': 'int' }, clinit: true, lazy: ['$VALUES', 'ATTRIBUTE', 'ANIMATION', 'REMOVE', 'ADDPLAYER', 'STANCE', 'OWNED', 'PARTIAL', 'UPDATE', 'EARLY', 'NORMAL', 'LATE', 'LAST'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Game = $J.load('net.sf.freecol.common.model.Game');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Introspector = $J.load('net.sf.freecol.common.util.Introspector');
  Introspector$IntrospectorException = $J.load('net.sf.freecol.common.util.Introspector$IntrospectorException');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
