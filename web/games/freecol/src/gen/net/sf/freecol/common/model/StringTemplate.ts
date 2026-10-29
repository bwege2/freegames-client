// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/StringTemplate.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AbstractMap_SimpleEntry, ArrayList, ClassCastException, Collections, JEnum, Level, RuntimeException, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

let Messages, CollectionUtils, Utils;

/**
 * The {@code StringTemplate} represents a non-localized string
 * that can be localized by looking up its value in a message bundle
 * or similar Map. The StringTemplate may contain variables (keys)
 * delimited by the '%' character, such as "%amount%" that will be
 * replaced with a string or a StringTemplate. If the StringTemplate
 * contains replacement values but no keys, then it is considered a
 * "label" StringTemplate, and its value will be used to join the
 * replacement values.
 *
 * @version 1.0
 */
export class StringTemplate extends FreeColObject {
  static readonly TAG: string = 'stringTemplate';
  /**
   * Fixed trivial return value for entryList().
   */
  static emptyList: List<AbstractMap_SimpleEntry<string, StringTemplate>> = null;
  /**
   * The TemplateType of this StringTemplate. Defaults to KEY.
   */
  templateType: StringTemplate$TemplateType = null;
  /**
   * An alternative key to use if the identifier is not contained in
   * the message bundle.
   */
  defaultId: string = null;
  /**
   * The key,value paris to apply within the string template.
   */
  kv: List<AbstractMap_SimpleEntry<string, StringTemplate>> = null;
  static readonly DEFAULT_ID_TAG: string = 'defaultId';
  static readonly PAIR_TAG: string = 'pair';
  static readonly TEMPLATE_TYPE_TAG: string = 'templateType';
  static readonly OLD_KEY_TAG: string = 'key';
  $init_StringTemplate() {
    this.templateType = StringTemplate$TemplateType.KEY;
    this.defaultId = null;
    this.kv = null;
  }
  /**
   * Trivial constructor to allow creation with Game.newInstance.
   */
  _StringTemplate$(): this {
    this._FreeColObject();
    this.$init_StringTemplate();
    return this;
  }
  /**
   * Copy an existing template, but with a new identifier.
   *
   * @param id The object identifier.
   * @param template A {@code StringTemplate} to copy.
   */
  _StringTemplate$String$StringTemplate(id: string, template: StringTemplate): this {
    this._FreeColObject();
    this.$init_StringTemplate();
    this.setId(id);
    this.templateType = template.templateType;
    this.defaultId = template.defaultId;
    this.kv = template.kv;
    return this;
  }
  /**
   * Creates a new {@code StringTemplate} instance.
   *
   * @param id The object identifier.
   * @param defaultId The default identifier.
   * @param templateType The {@code TemplateType} for this template.
   */
  _StringTemplate$String$String$TemplateType(id: string, defaultId: string, templateType: StringTemplate$TemplateType): this {
    this._FreeColObject();
    this.$init_StringTemplate();
    this.setId(id);
    this.defaultId = defaultId;
    this.templateType = templateType;
    this.kv = null;
    return this;
  }
  /**
   * Create a new {@code StringTemplate} by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _StringTemplate$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._FreeColObject();
    this.$init_StringTemplate();
    this.readFromXML(xr);
    return this;
  }
  static copy(id: string, template: StringTemplate): StringTemplate {
    return new StringTemplate()._StringTemplate$String$StringTemplate(id, template);
  }
  static name_(value: string): StringTemplate {
    return new StringTemplate()._StringTemplate$String$String$TemplateType(value, null, StringTemplate$TemplateType.NAME);
  }
  static key$Named(named: Named): StringTemplate {
    return StringTemplate.key$String(named.getNameKey());
  }
  static key$String(value: string): StringTemplate {
    return new StringTemplate()._StringTemplate$String$String$TemplateType(value, null, StringTemplate$TemplateType.KEY);
  }
  static template$Named(named: Named): StringTemplate {
    return StringTemplate.template$String(named.getNameKey());
  }
  static template$String(value: string): StringTemplate {
    return new StringTemplate()._StringTemplate$String$String$TemplateType(value, null, StringTemplate$TemplateType.TEMPLATE);
  }
  static label(value: string): StringTemplate {
    return new StringTemplate()._StringTemplate$String$String$TemplateType(value, null, StringTemplate$TemplateType.LABEL);
  }
  /**
   * Get the template type.
   *
   * @return The template type.
   */
  getTemplateType(): StringTemplate$TemplateType {
    return this.templateType;
  }
  /**
   * Get the default identifier.
   *
   * @return The default identifier.
   */
  getDefaultId(): string {
    return this.defaultId;
  }
  /**
   * Set the default identifier.
   *
   * @param id The new default identifier.
   */
  setDefaultId$String(id: string): void {
    this.defaultId = id;
  }
  /**
   * Wrapper for subclasses to set the default identifier and return the
   * setting object.
   *
   * @param <T> The actual return type.
   * @param id The new default identifier
   * @param returnClass The expected return class.
   * @return The setting object.
   */
  setDefaultId$String$Class<T>(id: string, returnClass: JClass<T>): T {
    this.setDefaultId$String(id);
    try {
      return returnClass.cast(this);
    } catch ($e0) {
      if ($J.isa($e0, ClassCastException)) {
        let cce = $J.exc($e0);
        FreeColObject.logger.log(Level.WARNING, 'Invalid class ' + $J.str(this.getClass()) + ' referenced.', cce);
      } else {
        throw $e0;
      }
    }
    return null;
  }
  /**
   * Has nothing been added to this template?
   *
   * @return True if the template is empty.
   */
  isEmpty(): boolean {
    return this.kv == null || this.kv.isEmpty();
  }
  /**
   * Get the list of key, value pairs.
   *
   * @return The pairs.
   */
  entryList(): List<AbstractMap_SimpleEntry<string, StringTemplate>> {
    return (this.kv != null) ? this.kv : StringTemplate.emptyList;
  }
  /**
   * Try to find the replacement for a given key.
   *
   * @param key The key to look for.
   * @return The value found, otherwise null.
   */
  getReplacement(key: string): StringTemplate {
    if (this.kv == null) {
      return null;
    }
    let val = CollectionUtils.find$Collection$Predicate(this.kv, CollectionUtils.matchKeyEquals$Object$Function(key, ($p0) => $p0.getKey()));
    return (val == null) ? null : val.getValue();
  }
  /**
   * Add a key, value pair.
   *
   * @param key The {@code String} key.
   * @param value The {@code StringTemplate} value.
   */
  addPair(key: string, value: StringTemplate): void {
    if (key == null && value == null) {
      throw new RuntimeException('Null key and pair: ' + $J.str(this));
    }
    if (this.kv == null) {
      this.kv = new ArrayList();
    }
    this.kv.add(new AbstractMap_SimpleEntry(key, value));
  }
  /**
   * Add a key.
   *
   * @param key The key to add.
   */
  addKey(key: string): void {
    this.addPair(key, null);
  }
  /**
   * Add a replacement.
   *
   * @param replacement The {@code StringTemplate} replacement to add.
   */
  addReplacement(replacement: StringTemplate): void {
    if (this.kv == null) {
      this.kv = new ArrayList();
    }
    for (const $it1 = this.kv.iterator(); $it1.hasNext(); ) {
      let e = $it1.next();
      if (e.getValue() == null) {
        e.setValue(replacement);
        return;
      }
    }
    this.addPair(null, replacement);
  }
  /**
   * Add an optional key and replacement.  Helper function for the add*()
   * routines that follow.
   *
   * @param <T> The actual return type.
   * @param key The optional key.
   * @param value The replacement {@code StringTemplate}.
   * @return This object, cast back to its original class.
   */
  complete<T>(key: string, value: StringTemplate): T {
    this.addPair(key, value);
    return this;
  }
  /**
   * Add a new key and replacement value to this template.
   *
   * This is only possible if the template is of type TEMPLATE.
   *
   * @param <T> The actual return type.
   * @param key The key to add.
   * @param value The corresponding replacement.
   * @return This.
   */
  add$String$String<T>(key: string, value: string): T {
    if (this.templateType !== StringTemplate$TemplateType.TEMPLATE) {
      throw new RuntimeException('Cannot add key-value pair to StringTemplate.' + $J.str(this.templateType));
    }
    return this.complete(key, StringTemplate.key$String(value));
  }
  /**
   * Add a replacement value without a key to this template.
   *
   * This is only possible if the template is of type LABEL.
   *
   * @param <T> The actual return type.
   * @param value The replacement value.
   * @return This.
   */
  add$String<T>(value: string): T {
    if (this.templateType !== StringTemplate$TemplateType.LABEL) {
      throw new RuntimeException('Cannot add a single string to StringTemplate.' + $J.str(this.templateType));
    }
    return this.complete(null, StringTemplate.key$String(value));
  }
  /**
   * Add a new key and replacement proper name to this template.
   *
   * This is only possible if the template is of type TEMPLATE.
   *
   * @param <T> The actual return type.
   * @param key The key to add.
   * @param value The corresponding replacement.
   * @return This.
   */
  addName$String$String<T>(key: string, value: string): T {
    if (this.templateType !== StringTemplate$TemplateType.TEMPLATE) {
      throw new RuntimeException('Cannot add key-name pair to StringTemplate.' + $J.str(this.templateType));
    }
    return this.complete(key, StringTemplate.name_(value));
  }
  /**
   * Add a new key and replacement namable object to this template.
   *
   * This is only possible if the StringTemplate is of type TEMPLATE.
   *
   * @param <T> The actual return type.
   * @param key The key to add.
   * @param object The replacement {@code FreeColObject}.
   * @return This.
   */
  addName$String$FreeColObject<T>(key: string, object$: FreeColObject): T {
    if (this.templateType !== StringTemplate$TemplateType.TEMPLATE) {
      throw new RuntimeException('Cannot add key-object pair to StringTemplate.' + $J.str(this.templateType));
    }
    return this.complete(key, StringTemplate.key$String(Messages.nameKey$String(object$.getId())));
  }
  /**
   * Add a replacement proper name without a key to this template.
   *
   * This is only possible if the StringTemplate is of type LABEL.
   *
   * @param <T> The actual return type.
   * @param value The replacement value.
   * @return This.
   */
  addName$String<T>(value: string): T {
    if (this.templateType !== StringTemplate$TemplateType.LABEL) {
      throw new RuntimeException('Cannot add a single string to StringTemplate.' + $J.str(this.templateType));
    }
    return this.complete(null, StringTemplate.name_(value));
  }
  /**
   * Add a key and named object to this template.
   *
   * @param <T> The actual return type.
   * @param key The key to add.
   * @param named The {@code Named} to add.
   * @return This.
   */
  addNamed$String$Named<T>(key: string, named: Named): T {
    return this.add$String$String(key, named.getNameKey());
  }
  /**
   * Add named object without key to this template.
   *
   * @param <T> The actual return type.
   * @param named The {@code Named} to add.
   * @return This.
   */
  addNamed$Named<T>(named: Named): T {
    return this.add$String(named.getNameKey());
  }
  /**
   * Add a key and an integer value to replace it to this template.
   *
   * @param <T> The actual return type.
   * @param key The key to add.
   * @param amount The {@code Number} value to add.
   * @return This.
   */
  addAmount<T>(key: string, amount: number): T {
    return this.addName$String$String(key, $J.str(amount));
  }
  /**
   * Add a key and a replacement StringTemplate to this template.
   *
   * This is only possible if the StringTemplate is of type TEMPLATE.
   *
   * @param <T> The actual return type.
   * @param key The key to add.
   * @param template The {@code StringTemplate} value.
   * @return This.
   */
  addStringTemplate$String$StringTemplate<T>(key: string, template: StringTemplate): T {
    if (this.templateType !== StringTemplate$TemplateType.TEMPLATE) {
      throw new RuntimeException('Cannot add key-template pair to StringTemplate.' + $J.str(this.templateType));
    }
    return this.complete(key, template);
  }
  /**
   * Add a StringTemplate to this template.
   *
   * This is only possible if the StringTemplate is of type LABEL.
   *
   * @param <T> The actual return type.
   * @param template The replacement {@code StringTemplate}.
   * @return This.
   */
  addStringTemplate$StringTemplate<T>(template: StringTemplate): T {
    if (this.templateType !== StringTemplate$TemplateType.LABEL) {
      throw new RuntimeException('Cannot add a template to StringTemplate.' + $J.str(this.templateType));
    }
    return this.complete(null, template);
  }
  /**
   * Add a tagged value.
   *
   * Functionally identical to add(), but used to distinguish the special
   * cases at the point they are used.
   *
   * @param <T> The actual return type.
   * @param key The tag.
   * @param value The special tag value.
   * @return This.
   */
  addTagged<T>(key: string, value: string): T {
    return this.add$String$String(key, value);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(StringTemplate));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.templateType = o.getTemplateType();
    this.defaultId = o.getDefaultId();
    this.kv = o.kv;
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$Enum(StringTemplate.TEMPLATE_TYPE_TAG, this.templateType);
    if (this.defaultId != null) {
      xw.writeAttribute(StringTemplate.DEFAULT_ID_TAG, this.defaultId);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.kv != null) {
      for (const $it2 = this.kv.iterator(); $it2.hasNext(); ) {
        let e = $it2.next();
        xw.writeStartElement(StringTemplate.PAIR_TAG);
        let key = e.getKey();
        if (key != null) {
          xw.writeAttribute(FreeColObject.VALUE_TAG, key);
        }
        e.getValue().toXML$FreeColXMLWriter(xw);
        xw.writeEndElement();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.templateType = xr.getAttribute$String$Class$Enum(StringTemplate.TEMPLATE_TYPE_TAG, $J.cls(StringTemplate$TemplateType), StringTemplate$TemplateType.TEMPLATE);
    this.defaultId = xr.getAttribute$String$String(StringTemplate.DEFAULT_ID_TAG, null);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    if (this.kv != null) {
      this.kv.clear();
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(StringTemplate.PAIR_TAG, tag)) {
      let key = xr.getAttribute$String$String(FreeColObject.VALUE_TAG, null);
      let val = null;
      while (xr.moreTags()) {
        let inner = xr.getLocalName();
        if ($J.equals(StringTemplate.TAG, inner)) {
          if (val == null) {
            val = new StringTemplate()._StringTemplate$FreeColXMLReader(xr);
          } else {
            xr.expectTag(StringTemplate.PAIR_TAG);
          }
        } else {
          xr.expectTag(StringTemplate.TAG);
        }
      }
      this.addPair(key, val);
    } else if ($J.equals(StringTemplate.OLD_KEY_TAG, tag)) {
      this.addKey(xr.getAttribute$String$String(FreeColObject.VALUE_TAG, null));
      xr.closeTag$String(StringTemplate.OLD_KEY_TAG);
    } else if ($J.equals(StringTemplate.TAG, tag)) {
      this.addReplacement(new StringTemplate()._StringTemplate$FreeColXMLReader(xr));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return StringTemplate.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof StringTemplate) {
      let other = o;
      let i: number;
      if (this.templateType !== other.templateType || !Utils.equals(this.defaultId, other.defaultId)) {
        return false;
      }
      if ((this.kv == null) !== (other.kv == null)) {
        return false;
      }
      if (this.kv != null) {
        if (this.kv.size() !== other.kv.size()) {
          return false;
        }
        i = 0;
        for (const $it3 = this.kv.iterator(); $it3.hasNext(); ) {
          let e = $it3.next();
          if (!$J.equals(e.getKey(), other.kv.get(i).getKey())) {
            return false;
          }
          if (!e.getValue().equals(other.kv.get(i).getValue())) {
            return false;
          }
          i++;
        }
      }
      return super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + this.templateType.ordinal()) | 0;
    hash = (Math.imul(31, hash) + Utils.hashCode(this.defaultId)) | 0;
    if (this.kv != null) {
      for (const $it4 = this.kv.iterator(); $it4.hasNext(); ) {
        let e = $it4.next();
        hash = (Math.imul(31, hash) + Utils.hashCode(e.getKey())) | 0;
        hash = (Math.imul(31, hash) + Utils.hashCode(e.getValue())) | 0;
      }
    }
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append($J.str(this.templateType)).append(String.fromCharCode(58 /* ':' */)).append(this.getId());
    if (this.defaultId != null) {
      sb.append(String.fromCharCode(40 /* '(' */)).append(this.defaultId).append(String.fromCharCode(41 /* ')' */));
    }
    let start: string;
    switch (this.templateType) {
      case StringTemplate$TemplateType.LABEL:
        if (this.kv != null) {
          let index = 0;
          start = '[';
          for (const $it5 = this.kv.iterator(); $it5.hasNext(); ) {
            let e = $it5.next();
            sb.append(start).append(String(index++)).append(String.fromCharCode(58 /* ':' */)).append($J.str(e.getValue()));
            start = ' ';
          }
          sb.append(String.fromCharCode(93 /* ']' */));
        }
        break;
      case StringTemplate$TemplateType.TEMPLATE:
        sb.append(String.fromCharCode(91 /* '[' */));
        if (this.kv != null) {
          start = '';
          for (const $it6 = this.kv.iterator(); $it6.hasNext(); ) {
            let e = $it6.next();
            sb.append(start).append(e.getKey()).append(String.fromCharCode(61 /* '=' */)).append($J.str(e.getValue()));
            start = '';
          }
        }
        sb.append(String.fromCharCode(93 /* ']' */));
        break;
      case StringTemplate$TemplateType.KEY:
      case StringTemplate$TemplateType.NAME:
      default:
        break;
    }
    return sb.toString();
  }
  static $clinit() {
    StringTemplate.emptyList = Collections.emptyList();
  }
}

/**
 * The type of this StringTemplate, either NAME, a proper name
 * that must not be localized (e.g. "George Washington"), or KEY,
 * a string that must be localized (e.g. "model.goods.food.name"),
 * or TEMPLATE, a key with replacements to apply to the localized
 * value of the key, or LABEL, a separator string that will be
 * used to join the replacement values.
 */
export class StringTemplate$TemplateType extends JEnum {
  static NAME: StringTemplate$TemplateType = null;
  static KEY: StringTemplate$TemplateType = null;
  static TEMPLATE: StringTemplate$TemplateType = null;
  static LABEL: StringTemplate$TemplateType = null;
  static $VALUES: StringTemplate$TemplateType[] = null;
  _StringTemplate$TemplateType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): StringTemplate$TemplateType[] { return StringTemplate$TemplateType.$VALUES.slice(); }
  static valueOf(name: string): StringTemplate$TemplateType { return $J.enumValueOf(StringTemplate$TemplateType, name); }
  static $clinit() {
    StringTemplate$TemplateType.NAME = new StringTemplate$TemplateType()._StringTemplate$TemplateType('NAME', 0);
    StringTemplate$TemplateType.KEY = new StringTemplate$TemplateType()._StringTemplate$TemplateType('KEY', 1);
    StringTemplate$TemplateType.TEMPLATE = new StringTemplate$TemplateType()._StringTemplate$TemplateType('TEMPLATE', 2);
    StringTemplate$TemplateType.LABEL = new StringTemplate$TemplateType()._StringTemplate$TemplateType('LABEL', 3);
    StringTemplate$TemplateType.$VALUES = [StringTemplate$TemplateType.NAME, StringTemplate$TemplateType.KEY, StringTemplate$TemplateType.TEMPLATE, StringTemplate$TemplateType.LABEL];
  }
}

$J.define(StringTemplate, 'net.sf.freecol.common.model.StringTemplate', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_StringTemplate$FreeColXMLReader', 'java.lang.String,java.lang.String,net.sf.freecol.common.model.StringTemplate$TemplateType': '_StringTemplate$String$String$TemplateType', 'java.lang.String,net.sf.freecol.common.model.StringTemplate': '_StringTemplate$String$StringTemplate', '': '_StringTemplate$' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'isEmpty': 'boolean', 'getDefaultId': 'java.lang.String', 'getTemplateType': 'net.sf.freecol.common.model.StringTemplate$TemplateType' }, meths: { 'addStringTemplate(net.sf.freecol.common.model.StringTemplate)': 'addStringTemplate$StringTemplate', 'addStringTemplate(java.lang.String,net.sf.freecol.common.model.StringTemplate)': 'addStringTemplate$String$StringTemplate', 'addNamed(net.sf.freecol.common.model.Named)': 'addNamed$Named', 'addNamed(java.lang.String,net.sf.freecol.common.model.Named)': 'addNamed$String$Named', 'addName(java.lang.String)': 'addName$String', 'addName(java.lang.String,net.sf.freecol.common.model.FreeColObject)': 'addName$String$FreeColObject', 'addName(java.lang.String,java.lang.String)': 'addName$String$String', 'add(java.lang.String)': 'add$String', 'add(java.lang.String,java.lang.String)': 'add$String$String', 'setDefaultId(java.lang.String,java.lang.Class)': 'setDefaultId$String$Class', 'setDefaultId(java.lang.String)': 'setDefaultId$String', 'template(java.lang.String)': 'template$String', 'template(net.sf.freecol.common.model.Named)': 'template$Named', 'key(java.lang.String)': 'key$String', 'key(net.sf.freecol.common.model.Named)': 'key$Named', 'name(java.lang.String)': 'name_' }, clinit: true, lazy: ['emptyList'] });
$J.define(StringTemplate$TemplateType, 'net.sf.freecol.common.model.StringTemplate$TemplateType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_StringTemplate$TemplateType' }, clinit: true, lazy: ['$VALUES', 'NAME', 'KEY', 'TEMPLATE', 'LABEL'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
