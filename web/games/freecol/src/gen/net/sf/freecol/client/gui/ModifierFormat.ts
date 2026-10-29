// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/ModifierFormat.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collectors, DecimalFormat, JFunction, JObject, JString } from '../../../../../../jre/index.ts';

let JLabel, Messages, Modifier, Modifier$ModifierType, Nameable, Named, CollectionUtils;

export class ModifierFormat extends JObject {
  /**
   * The decimal format to use for Modifiers.
   */
  static modifierFormat: DecimalFormat = null;
  _ModifierFormat(): this {
    return this;
  }
  static getUnknownValue(): string {
    return Messages.message$String('modifierFormat.unknown');
  }
  static format(value: number): string {
    return Modifier.isFloatKnown(value) ? ModifierFormat.modifierFormat.format(value) : ModifierFormat.getUnknownValue();
  }
  static getModifierStrings$Modifier(modifier: Modifier): string[] {
    return ModifierFormat.getModifierStrings$float$ModifierType(modifier.getValue$(), modifier.getType());
  }
  static getModifierStrings$float$ModifierType(value: number, type$: Modifier$ModifierType): string[] {
    let bonus = ModifierFormat.modifierFormat.format(value);
    if (!Modifier.isFloatKnown(value)) {
      return [' ', bonus, null];
    }
    let result = (value < Math.fround(0)) ? ['-', bonus.substring(1), null] : ['+', bonus, null];
    switch (type$) {
      case Modifier$ModifierType.MULTIPLICATIVE:
        result[0] = '×';
        break;
      case Modifier$ModifierType.PERCENTAGE:
        result[2] = '%';
        break;
      default:
        break;
    }
    return result;
  }
  static getSourceName(source: FreeColObject): string {
    if (source == null) {
      return ModifierFormat.getUnknownValue();
    }
    let result = null;
    if (result == null && $J.isa(source, Nameable)) {
      result = (source).getName();
      if (result != null && (result.length === 0)) {
        result = null;
      }
    }
    if (result == null && $J.isa(source, Named)) {
      result = Messages.getName$Named(source);
      if ((result.length === 0)) {
        result = null;
      }
    }
    if (result == null) {
      result = Messages.getName$String(source.getId());
    }
    return result;
  }
  static getModifierLabels(modifier: Modifier, fcgot: FreeColSpecObjectType, turn: Turn): JLabel[] {
    let sourceName = ModifierFormat.getSourceName(modifier.getSource());
    if (fcgot != null && modifier.appliesTo$FreeColObject(fcgot)) {
      sourceName += ' (' + Messages.getName$Named(fcgot) + ')';
    }
    let value = modifier.getValue$Turn(turn);
    let bonus = ModifierFormat.getModifierStrings$float$ModifierType(value, modifier.getType());
    let result = $J.newArray(3, null);
    result[0] = new JLabel()._JLabel$String(sourceName);
    result[1] = new JLabel()._JLabel$String(bonus[0] + bonus[1]);
    result[2] = (bonus[2] == null) ? null : new JLabel()._JLabel$String(bonus[2]);
    return result;
  }
  static getFeatureAsString(feature: Feature): string {
    return Messages.getName$Named(feature) + ':' + ((!feature.hasScope()) ? '' : CollectionUtils.transform$Stream$Predicate$Function$Collector(feature.getScopes(), CollectionUtils.isNotNull$(), ($p0) => $p0.getFeatureString(), Collectors.joining(',')));
  }
  static getModifierAsString(modifier: Modifier): string {
    return CollectionUtils.transform$ObjectArr$Predicate$Function$Collector(ModifierFormat.getModifierStrings$Modifier(modifier), CollectionUtils.isNotNull$(), JFunction.identity(), Collectors.joining());
  }
  static $clinit() {
    ModifierFormat.modifierFormat = new DecimalFormat('0.00');
  }
}

$J.define(ModifierFormat, 'net.sf.freecol.client.gui.ModifierFormat', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ModifierFormat' }, meths: { 'getModifierStrings(float,net.sf.freecol.common.model.Modifier$ModifierType)': 'getModifierStrings$float$ModifierType', 'getModifierStrings(net.sf.freecol.common.model.Modifier)': 'getModifierStrings$Modifier' }, clinit: true, lazy: ['modifierFormat'] });
$J.module(() => {
  JLabel = $J.load('javax.swing.JLabel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Modifier$ModifierType = $J.load('net.sf.freecol.common.model.Modifier$ModifierType');
  Nameable = $J.load('net.sf.freecol.common.model.Nameable');
  Named = $J.load('net.sf.freecol.common.model.Named');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
