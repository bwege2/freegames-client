// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/Option.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';

/**
 * An option describes something which can be customized by the user.
 */
export class Option<T> {
}

$J.define(Option, 'net.sf.freecol.common.option.Option', { kind: 'interface', ifaces: ['java.lang.Cloneable', 'net.sf.freecol.common.ObjectWithId'], returns: { 'getEnabledBy': 'java.lang.String', 'getGroup': 'java.lang.String' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)': 'toXML$FreeColXMLWriter', 'setValue(java.lang.Object)': 'setValue$Object', 'getValue()': 'getValue$' } });
