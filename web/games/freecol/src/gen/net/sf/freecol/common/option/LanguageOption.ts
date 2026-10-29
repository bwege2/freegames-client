// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/LanguageOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, Exception, JObject, Level, Locale, Logger } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let Messages, FreeColDirectories, FreeColObject, CollectionUtils, StringUtils, Utils;

/**
 * Option for selecting a language.  The possible choices are determined
 * using the available language files in the i18n directory.
 */
export class LanguageOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'languageOption';
  /**
   * Extra languages with alternate names.
   */
  static languageNames: JMap<string, string> = null;
  /**
   * A list of know languages.
   * Initialized on demand with initializeLanguages(), as it depends
   * on the location of the i18n directory having stabilized.
   */
  static languages: List<LanguageOption$Language> = null;
  /**
   * The default language.
   */
  static DEFAULT_LANGUAGE: LanguageOption$Language = null;
  /**
   * The value of this option.
   */
  value_: LanguageOption$Language = null;
  /**
   * Creates a new {@code LanguageOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _LanguageOption(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.value_ = LanguageOption.DEFAULT_LANGUAGE;
    LanguageOption.initializeLanguages();
    return this;
  }
  /**
   * Initialize the languages list.
   */
  static initializeLanguages(): void {
    if (!LanguageOption.languages.isEmpty()) {
      return;
    }
    for (const $it0 = FreeColDirectories.getLanguageIdList().iterator(); $it0.hasNext(); ) {
      let languageId = $it0.next();
      if (languageId == null) {
        continue;
      }
      try {
        LanguageOption.languages.add(new LanguageOption$Language()._LanguageOption$Language(languageId, Messages.getLocale(languageId)));
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
          LanguageOption.logger.log(Level.WARNING, 'Failed to add: ' + languageId, e);
        } else {
          throw $e1;
        }
      }
    }
    LanguageOption.languages.sort(Comparator.naturalOrder());
    LanguageOption.languages.add(0, LanguageOption.DEFAULT_LANGUAGE);
  }
  /**
   * Find the language with the given key.
   *
   * @param key The key to search for.
   * @return The corresponding language, or null if none found.
   */
  getLanguage(key: string): LanguageOption$Language {
    return CollectionUtils.find$Collection$Predicate(LanguageOption.languages, (l) => $J.equals(key, l.getKey()));
  }
  /**
   * Gets a list of the available languages.
   *
   * @return A list of the available languages.
   */
  getChoices(): List<LanguageOption$Language> {
    return new ArrayList(LanguageOption.languages);
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): LanguageOption {
    let result = new LanguageOption()._LanguageOption(this.getSpecification());
    result.setValues(this);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): LanguageOption$Language {
    return this.value_;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(newValue: LanguageOption$Language): void {
    let oldValue = this.value_;
    this.value_ = newValue;
    if (!newValue.equals(oldValue)) {
      this.firePropertyChange$String$Object$Object(FreeColObject.VALUE_TAG, oldValue, this.value_);
    }
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    let l = null;
    if (l == null && valueString != null) {
      l = this.getLanguage(valueString);
    }
    if (l == null && defaultValueString != null) {
      l = this.getLanguage(defaultValueString);
    }
    if (l == null) {
      l = this.getLanguage(Messages.AUTOMATIC);
    }
    this.setValue$Object(l);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute(FreeColObject.VALUE_TAG, this.getValue$().getKey());
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return LanguageOption.TAG;
  }
  static $clinit() {
    LanguageOption.logger = Logger.getLogger($J.cls(LanguageOption).getName());
    LanguageOption.languageNames = CollectionUtils.makeUnmodifiableMap(['arz', 'hsb', 'nds', 'pms', 'be-tarask'], ['مصري', 'Serbšćina', 'Plattdüütsch', 'Piemontés', 'Беларуская (тарашкевіца)']);
    LanguageOption.languages = new ArrayList();
    LanguageOption.DEFAULT_LANGUAGE = new LanguageOption$Language()._LanguageOption$Language(Messages.AUTOMATIC, Locale.getDefault());
  }
}

export class LanguageOption$Language extends JObject {
  /**
   * The language name.
   */
  key: string = null;
  /**
   * The corresponding Locale.
   */
  locale: Locale = null;
  _LanguageOption$Language(key: string, locale: Locale): this {
    this.key = key;
    this.locale = locale;
    return this;
  }
  /**
   * Get the key.
   *
   * @return The key.
   */
  getKey(): string {
    return this.key;
  }
  /**
   * Set the key.
   *
   * @param newKey The new key.
   */
  setKey(newKey: string): void {
    this.key = newKey;
  }
  /**
   * Get the locale.
   *
   * @return The {@code Locale}.
   */
  getLocale(): Locale {
    return this.locale;
  }
  /**
   * Set the locale.
   *
   * @param newLocale The new {@code Locale}.
   */
  setLocale(newLocale: Locale): void {
    this.locale = newLocale;
  }
  /**
   * {@inheritDoc}
   */
  compareTo(l: LanguageOption$Language): number {
    return $J.compareTo(this.toString(), l.toString());
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof LanguageOption$Language) {
      let other = o;
      return Utils.equals(this.key, other.key) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(31, hash) + Utils.hashCode(this.key)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    if ($J.equals(Messages.AUTOMATIC, this.getKey())) {
      return Messages.message$String('clientOptions.gui.languageOption.autoDetectLanguage');
    }
    let name = this.locale.getDisplayName(this.locale);
    if ($J.equals(name, this.key) && LanguageOption.languageNames.containsKey(this.key)) {
      name = LanguageOption.languageNames.get(this.key);
    }
    return StringUtils.capitalize$String$Locale(name, this.locale);
  }
}

$J.define(LanguageOption, 'net.sf.freecol.common.option.LanguageOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'net.sf.freecol.common.model.Specification': '_LanguageOption' }, returns: { 'getXMLTagName': 'java.lang.String', 'getValue$': 'net.sf.freecol.common.option.LanguageOption$Language', 'getChoices': 'java.util.List' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(net.sf.freecol.common.option.LanguageOption$Language)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger', 'languageNames', 'languages', 'DEFAULT_LANGUAGE'] });
$J.define(LanguageOption$Language, 'net.sf.freecol.common.option.LanguageOption$Language', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'java.lang.Object', ctors: { 'java.lang.String,java.util.Locale': '_LanguageOption$Language' }, returns: { 'hashCode': 'int', 'getLocale': 'java.util.Locale', 'getKey': 'java.lang.String' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
