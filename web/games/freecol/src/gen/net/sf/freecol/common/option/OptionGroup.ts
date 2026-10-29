// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/OptionGroup.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Exception, HashMap, IOException, JString, Level, Logger, RuntimeException, StringBuilder, XMLStreamException } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let ClientOptions, Messages, FreeColXMLReader, CollectionUtils;

/**
 * Used for grouping {@link Option}s.
 */
export class OptionGroup extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'optionGroup';
  /**
   * The options in this group.
   */
  options: List<Option> = null;
  /**
   * A map of all option ids to its option.  Unlike the options
   * array, this contains all child options of options that are
   * themselves groups.
   */
  optionMap: JMap<string, Option> = null;
  /**
   * Is this option group user editable?
   */
  editable: boolean = false;
  /**
   * Should this option group be visible?
   */
  visible: boolean = false;
  static readonly EDITABLE_TAG: string = 'editable';
  static readonly VISIBLE_TAG: string = 'visible';
  $init_OptionGroup() {
    this.options = new ArrayList();
    this.optionMap = new HashMap();
    this.editable = true;
    this.visible = true;
  }
  /**
   * Creates a new {@code OptionGroup}.
   *
   * @param id The object identifier.
   */
  _OptionGroup$String(id: string): this {
    this._AbstractOption$String(id);
    this.$init_OptionGroup();
    return this;
  }
  /**
   * Creates a new {@code OptionGroup}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _OptionGroup$Specification(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.$init_OptionGroup();
    return this;
  }
  /**
   * Creates a new {@code OptionGroup}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _OptionGroup$String$Specification(id: string, specification: Specification): this {
    this._AbstractOption$String$Specification(id, specification);
    this.$init_OptionGroup();
    return this;
  }
  /**
   * Creates a new {@code OptionGroup}.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _OptionGroup$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.$init_OptionGroup();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Is this option group editable?
   *
   * @return True if the option group is editable.
   */
  isEditable(): boolean {
    return this.editable;
  }
  /**
   * Set the editable status of this group.
   *
   * @param editable The new editable status.
   */
  setEditable(editable: boolean): void {
    this.editable = editable;
  }
  /**
   * Should this option group be visible?
   *
   * @return True if the option group should be visible.
   */
  isVisible(): boolean {
    return this.visible;
  }
  /**
   * Gets the i18n-name of this {@code Option}.
   *
   * @return The name as provided in the constructor.
   */
  getName(): string {
    return Messages.getName$String(this.getId());
  }
  /**
   * Gets the i18n short description of this {@code Option}.
   * Should be suitable for use as a tooltip text.
   *
   * @return A short description of this {@code Option}.
   */
  getShortDescription(): string {
    return Messages.getShortDescription$String(this.getId());
  }
  /**
   * Get the options in this group.
   *
   * @return The list of {@code Option}s.
   */
  getOptions(): List<Option> {
    return this.options;
  }
  /**
   * Get an option in this group (or descendents) by object identifier.
   *
   * @param id The object identifier.
   * @return The option, or null if not found.
   */
  getOption$String(id: string): Option {
    return this.optionMap.get(id);
  }
  /**
   * Does this option group contain any subgroups?
   *
   * @return True if there are any child {@code OptionGroup}s present.
   */
  hasOptionGroup(): boolean {
    return CollectionUtils.any$Collection$Predicate(this.options, (o) => o instanceof OptionGroup);
  }
  /**
   * Adds the given option to this group.  The option is assumed to
   * be correct.
   *
   * @param option The {@code Option} to add.
   */
  add(option: Option): void {
    let id = option.getId();
    if (this.optionMap.containsKey(id)) {
      for (let index = 0; index < this.options.size(); index++) {
        if ($J.equals(id, this.options.get(index).getId())) {
          this.options.removeAt(index);
          this.options.add(index, option);
          break;
        }
      }
    } else {
      this.options.add(option);
    }
    this.optionMap.put(id, option);
    if (option instanceof OptionGroup) {
      let group = option;
      group.setEditable(this.editable && group.isEditable());
      this.addOptionGroup$OptionGroup$OptionGroup(group);
    }
  }
  /**
   * Merges the given {@code Option} into this group.
   *
   * - Option groups are *not* merged, but their leaf options are.
   * - If an option is not already present it is ignored.
   * - If an option is present, it is merged but in the option group where
   *   it is already placed.
   *
   * The intent is that the option group structure is never subject to
   * merging.
   *
   * @param option The {@code Option} to merge.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the merge was accepted.
   */
  merge$Option$LogBuilder(option: Option, lb: LogBuilder): boolean {
    if (option == null) {
      return false;
    }
    let id = option.getId();
    let etc = null;
    if (option instanceof OptionGroup) {
      let optionGroup = option;
      let result = true;
      for (const $it0 = optionGroup.getOptions().iterator(); $it0.hasNext(); ) {
        let o = $it0.next();
        if (o.getId().startsWith('net.sf.freecol.client.gui.panel.')) {
          if (etc == null) {
            etc = this.getOptionGroup(ClientOptions.ETC);
          }
          etc.add(o);
          lb.add([o.getId(), ' moved to ', ClientOptions.ETC, '.\n']);
          continue;
        }
        result = result && this.merge$Option$LogBuilder(o, lb);
      }
      if (result) {
        optionGroup.setEditable(this.editable && optionGroup.isEditable());
      }
      lb.add([id, ' group merged contents into ', this.getId(), '.\n']);
      return result;
    }
    if (!this.optionMap.containsKey(id)) {
      lb.add([id, ' unknown/ignored.\n']);
      return false;
    }
    for (let index = 0; index < this.options.size(); index++) {
      let o = this.options.get(index);
      if ($J.equals(id, o.getId())) {
        this.options.removeAt(index);
        this.options.add(index, option);
        this.optionMap.put(id, option);
        lb.add([id, ' merged into ', this.getId(), ': ', option.toString() + '.\n']);
        return true;
      }
      if (o instanceof OptionGroup) {
        let og = o;
        if (og.optionMap.containsKey(id) && og.merge$Option$LogBuilder(option, lb)) {
          this.optionMap.put(id, option);
          return true;
        }
      }
    }
    lb.add([id, ' registered but not found!\n']);
    return false;
  }
  /**
   * Helper function to recursively add option group members to the
   * optionMap.
   *
   * @param group The initial {@code OptionGroup} to add.
   */
  addOptionGroup$OptionGroup$OptionGroup(group: OptionGroup): void {
    for (const $it1 = group.getOptions().iterator(); $it1.hasNext(); ) {
      let option = $it1.next();
      this.optionMap.put(option.getId(), option);
      if (option instanceof OptionGroup) {
        this.addOptionGroup$OptionGroup$OptionGroup(option);
      }
    }
  }
  /**
   * Remove an option.
   *
   * @param id The identifier of the option to remove.
   * @return The {@code Option} removed if any.
   */
  remove(id: string): Option {
    let op = this.optionMap.remove(id);
    this.options.remove(op);
    if (op != null) {
      this.options.stream().filter((o) => o instanceof OptionGroup).map((o) => o).forEach((og) => og.remove(id));
    }
    return op;
  }
  /**
   * Removes all of the {@code Option}s from this
   * {@code OptionGroup}.
   */
  removeAll(): void {
    this.options.clear();
    this.optionMap.clear();
  }
  /**
   * Loads the options from the given reader.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @return True if the options were loaded without error.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  load$FreeColXMLReader(xr: FreeColXMLReader): boolean {
    if (xr == null) {
      return false;
    }
    xr.nextTag();
    this.readFromXML(xr);
    return true;
  }
  /**
   * Loads the options from the given file.
   *
   * @param file The {@code File} to read the options from.
   * @return True if the options were loaded without error.
   */
  load$File(file: File): boolean {
    if (file == null) {
      return false;
    }
    let ret = false;
    {
      try {
        const xr = new FreeColXMLReader()._FreeColXMLReader$File(file);
        try {
          ret = this.load$FreeColXMLReader(xr);
        } finally {
          if (xr != null) xr.close();
        }
      } catch ($e2) {
        if ($J.isa($e2, IOException) || $J.isa($e2, XMLStreamException)) {
          let xse = $J.exc($e2);
          OptionGroup.logger.log(Level.WARNING, 'Load OptionGroup(' + this.getId() + ') from file ' + file.getPath() + ' crashed', xse);
          return false;
        } else {
          throw $e2;
        }
      }
    }
    OptionGroup.logger.info('Load OptionGroup(' + this.getId() + ') from ' + file.getPath() + ((ret) ? ' succeeded' : ' failed'));
    return ret;
  }
  /**
   * Load a specific option group from a file by identifier.
   *
   * @param file The {@code File} to load from.
   * @param optionId The option identifier to look for.
   * @param spec A base {@code Specification}.
   * @return The {@code OptionGroup} found, or null on error or
   *     not found.
   */
  static loadOptionGroup(file: File, optionId: string, spec: Specification): OptionGroup {
    let ret = new OptionGroup()._OptionGroup$Specification(spec);
    if (ret.load$File(file)) {
      if (!$J.equals(optionId, ret.getId())) {
        let op = ret.getOption$String(optionId);
        ret = (op instanceof OptionGroup) ? op : null;
      }
    } else {
      ret = null;
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  hasOption<T>(id: string, returnClass: JClass<T>): boolean {
    if (id == null) {
      return false;
    }
    let val = this.optionMap.get(id);
    return (val == null) ? false : returnClass.isAssignableFrom(val.getClass());
  }
  /**
   * {@inheritDoc}
   */
  getOption$String$Class<T>(id: string, returnClass: JClass<T>): T {
    if (id == null) {
      throw new RuntimeException('Null id: ' + $J.str(this));
    } else if (!this.optionMap.containsKey(id)) {
      throw new RuntimeException('Missing option: ' + id);
    } else {
      try {
        return returnClass.cast(this.optionMap.get(id));
      } catch ($e3) {
        if ($J.isa($e3, ClassCastException)) {
          let cce = $J.exc($e3);
          throw new RuntimeException('Not a ' + returnClass.getName() + ': ' + id, cce);
        } else {
          throw $e3;
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): OptionGroup {
    let result = new OptionGroup()._OptionGroup$String$Specification(this.getId(), this.getSpecification());
    result.editable = this.editable;
    result.setValues(this);
    result.options.addAll(this.options);
    result.optionMap.putAll(this.optionMap);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): OptionGroup {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: OptionGroup): void {
    if (value != null) {
      for (const $it4 = value.getOptions().iterator(); $it4.hasNext(); ) {
        let other = $it4.next();
        let mine = this.getOption$String(other.getId());
        if (mine != null) {
          mine.setValue$Object(other.getValue$());
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
  }
  /**
   * {@inheritDoc}
   */
  generateChoices(): void {
    for (const $it5 = this.options.iterator(); $it5.hasNext(); ) {
      let o = $it5.next();
      if (o instanceof OptionGroup) {
        (o).generateChoices();
      } else if (o instanceof AbstractOption) {
        (o).generateChoices();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  isNullValueOK(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  save$File(file: File): boolean {
    let ret = false;
    try {
      ret = this.save$File$WriteScope$boolean(file, null, true);
    } catch ($e6) {
      if ($J.isa($e6, Exception)) {
        let e = $J.exc($e6);
        OptionGroup.logger.log(Level.WARNING, 'Save OptionGroup(' + this.getId() + ') to ' + file.getPath() + ' crashed', e);
        return false;
      } else {
        throw $e6;
      }
    }
    OptionGroup.logger.info('Save OptionGroup(' + this.getId() + ') to ' + file.getPath() + ((ret) ? ' succeeded' : ' failed'));
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(OptionGroup.EDITABLE_TAG, this.editable);
    xw.writeAttribute$String$boolean(OptionGroup.VISIBLE_TAG, this.visible);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it7 = this.options.iterator(); $it7.hasNext(); ) {
      let o = $it7.next();
      o.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.editable = xr.getAttribute$String$boolean(OptionGroup.EDITABLE_TAG, true);
    this.visible = xr.getAttribute$String$boolean(OptionGroup.VISIBLE_TAG, true);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
    for (const $it8 = this.getOptions().iterator(); $it8.hasNext(); ) {
      let option = $it8.next();
      this.optionMap.put(option.getId(), option);
      if (option instanceof OptionGroup) {
        this.addOptionGroup$OptionGroup$OptionGroup(option);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let optionId = xr.readId();
    let option = this.getOption$String(optionId);
    if (option == null) {
      let abstractOption = this.readOption(xr);
      if (abstractOption != null) {
        this.add(abstractOption);
        abstractOption.setGroup(this.getId());
      }
    } else {
      option.readFromXML(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return OptionGroup.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder();
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' <');
    for (const $it9 = this.getOptions().iterator(); $it9.hasNext(); ) {
      let o = $it9.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(o.toString());
    }
    sb.append(' >]');
    return sb.toString();
  }
  static $clinit() {
    OptionGroup.logger = Logger.getLogger($J.cls(OptionGroup).getName());
  }
}

$J.define(OptionGroup, 'net.sf.freecol.common.option.OptionGroup', { kind: 'class', ifaces: ['net.sf.freecol.common.option.OptionContainer'], sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_OptionGroup$FreeColXMLReader$Specification', 'java.lang.String,net.sf.freecol.common.model.Specification': '_OptionGroup$String$Specification', 'net.sf.freecol.common.model.Specification': '_OptionGroup$Specification', 'java.lang.String': '_OptionGroup$String' }, returns: { 'getXMLTagName': 'java.lang.String', 'isNullValueOK': 'boolean', 'getValue$': 'net.sf.freecol.common.option.OptionGroup', 'hasOptionGroup': 'boolean', 'getOptions': 'java.util.List', 'getShortDescription': 'java.lang.String', 'getName': 'java.lang.String', 'isVisible': 'boolean', 'isEditable': 'boolean' }, meths: { 'save(java.io.File)': 'save$File', 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(net.sf.freecol.common.option.OptionGroup)': 'setValue$Object', 'getValue()': 'getValue$', 'getOption(java.lang.String,java.lang.Class)': 'getOption$String$Class', 'load(java.io.File)': 'load$File', 'load(net.sf.freecol.common.io.FreeColXMLReader)': 'load$FreeColXMLReader', 'addOptionGroup(net.sf.freecol.common.option.OptionGroup)': 'addOptionGroup$OptionGroup$OptionGroup', 'merge(net.sf.freecol.common.option.Option,net.sf.freecol.common.util.LogBuilder)': 'merge$Option$LogBuilder', 'getOption(java.lang.String)': 'getOption$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
