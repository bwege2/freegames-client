// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/NumberRules.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject, JString, Logger } from '../../../../../../jre/index.ts';

let DefaultNumberRule, DualNumberRule, Number$Category, OtherNumberRule, PluralNumberRule, Rule, ZeroOneNumberRule, FreeColXMLReader;

/**
 * See the
 * <a href="http://cldr.unicode.org/index/cldr-spec/plural-rules">
 * Common Locale Data Repository</a>.
 */
export class NumberRules extends JObject {
  static logger: Logger = null;
  /**
   * A rule that always returns category "other".
   */
  static OTHER_NUMBER_RULE: Number_ = null;
  /**
   * A rule that assigns 1 to category "one", 2 to category "two"
   * and all other numbers to category "other".
   */
  static DUAL_NUMBER_RULE: Number_ = null;
  /**
   * A rule that assigns 1 to category "one" and all other numbers
   * to category "other".
   */
  static PLURAL_NUMBER_RULE: Number_ = null;
  /**
   * A rule that assigns 0 and 1 to category "one", and all other
   * number to category "other".
   */
  static ZERO_ONE_NUMBER_RULE: Number_ = null;
  static numberMap: JMap<string, Number_> = null;
  static readonly COUNT_TAG: string = 'count';
  static readonly GENERATION_TAG: string = 'generation';
  static readonly LOCALES_TAG: string = 'locales';
  static readonly PLURALS_TAG: string = 'plurals';
  static readonly PLURAL_RULE_TAG: string = 'pluralRule';
  static readonly PLURAL_RULES_TAG: string = 'pluralRules';
  static readonly VERSION_TAG: string = 'version';
  /**
   * Creates a new {@code NumberRules} instance from the given
   * input stream, which must contain an XML representation of the
   * CLDR plural rules.
   *
   * @param in an {@code InputStream} value
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _NumberRules(in$: InputStream): this {
    NumberRules.load(in$);
    return this;
  }
  /**
   * Returns a rule appropriate for the given language, or the
   * OTHER_NUMBER_RULE if none has been defined.
   *
   * @param lang a {@code String} value
   * @return a {@code Number} value
   */
  static getNumberForLanguage(lang: string): Number_ {
    let number$ = NumberRules.numberMap.get(lang);
    return (number$ == null) ? NumberRules.OTHER_NUMBER_RULE : number$;
  }
  static isInitialized(): boolean {
    return !NumberRules.numberMap.isEmpty();
  }
  static load(in$: InputStream): void {
    {
      const xr = new FreeColXMLReader()._FreeColXMLReader$InputStream(in$);
      try {
        NumberRules.readFromXML(xr);
      } finally {
        if (xr != null) xr.close();
      }
    }
  }
  static readFromXML(xr: FreeColXMLReader): void {
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if (null != tag) {
        switch (tag) {
          case NumberRules.VERSION_TAG:
          case NumberRules.GENERATION_TAG:
            xr.nextTag();
            break;
          case NumberRules.PLURALS_TAG:
            while (xr.moreTags()) {
              tag = xr.getLocalName();
              if ($J.equals(NumberRules.PLURAL_RULES_TAG, tag)) {
                NumberRules.readChild(xr);
              }
            }
            break;
        }
      }
    }
  }
  static readChild(xr: FreeColXMLReader): void {
    let loc = xr.getAttribute$String$String(NumberRules.LOCALES_TAG, null);
    let locales = (loc == null) ? null : JString.split(loc, ' ');
    if (locales != null) {
      let numberRule = new DefaultNumberRule()._DefaultNumberRule();
      while (xr.moreTags()) {
        if ($J.equals(NumberRules.PLURAL_RULE_TAG, xr.getLocalName())) {
          let plu = xr.getAttribute$String$String(NumberRules.COUNT_TAG, null);
          let category = Number$Category.valueOf(plu);
          let rule = new Rule()._Rule(xr.getElementText());
          numberRule.addRule$Category$Rule(category, rule);
        }
      }
      let number$ = null;
      {
        let rule: Rule, oneRule: Rule, twoRule: Rule;
        switch (numberRule.countRules()) {
          case 0:
            number$ = NumberRules.OTHER_NUMBER_RULE;
            break;
          case 1:
            rule = numberRule.getRule(Number$Category.one);
            if (rule != null) {
              let val = rule.toString();
              switch (val) {
                case 'n is 1':
                  number$ = NumberRules.PLURAL_NUMBER_RULE;
                  break;
                case 'n in 0..1':
                  number$ = NumberRules.ZERO_ONE_NUMBER_RULE;
                  break;
                default:
                  break;
              }
            }
            break;
          case 2:
            oneRule = numberRule.getRule(Number$Category.one);
            twoRule = numberRule.getRule(Number$Category.two);
            if (oneRule != null && $J.equals('n is 1', oneRule.toString()) && twoRule != null && $J.equals('n is 2', twoRule.toString())) {
              number$ = NumberRules.DUAL_NUMBER_RULE;
            }
            break;
          default:
            number$ = numberRule;
            break;
        }
      }
      for (let locale of locales) {
        NumberRules.numberMap.put(locale, number$);
      }
    }
  }
  static $clinit() {
    NumberRules.logger = Logger.getLogger($J.cls(NumberRules).getName());
    NumberRules.OTHER_NUMBER_RULE = new OtherNumberRule()._OtherNumberRule();
    NumberRules.DUAL_NUMBER_RULE = new DualNumberRule()._DualNumberRule();
    NumberRules.PLURAL_NUMBER_RULE = new PluralNumberRule()._PluralNumberRule();
    NumberRules.ZERO_ONE_NUMBER_RULE = new ZeroOneNumberRule()._ZeroOneNumberRule();
    NumberRules.numberMap = new HashMap();
  }
}

$J.define(NumberRules, 'net.sf.freecol.common.i18n.NumberRules', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.io.InputStream': '_NumberRules' }, clinit: true, lazy: ['logger', 'OTHER_NUMBER_RULE', 'DUAL_NUMBER_RULE', 'PLURAL_NUMBER_RULE', 'ZERO_ONE_NUMBER_RULE', 'numberMap'] });
$J.module(() => {
  DefaultNumberRule = $J.load('net.sf.freecol.common.i18n.DefaultNumberRule');
  DualNumberRule = $J.load('net.sf.freecol.common.i18n.DualNumberRule');
  Number$Category = $J.load('net.sf.freecol.common.i18n.Number$Category');
  OtherNumberRule = $J.load('net.sf.freecol.common.i18n.OtherNumberRule');
  PluralNumberRule = $J.load('net.sf.freecol.common.i18n.PluralNumberRule');
  Rule = $J.load('net.sf.freecol.common.i18n.Rule');
  ZeroOneNumberRule = $J.load('net.sf.freecol.common.i18n.ZeroOneNumberRule');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
});
