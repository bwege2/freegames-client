// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/MapEditorTool.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2024   The FreeCol Team
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
import { $J, JEnum } from '../../../../../../jre/index.ts';

/**
 * Possible tools to use in the map editor.
 */
export class MapEditorTool extends JEnum {
  id_: string = null;
  static PAINTBRUSH: MapEditorTool = null;
  static $VALUES: MapEditorTool[] = null;
  _MapEditorTool($name: string, $ordinal: number, id: string): this {
    this._JEnum($name, $ordinal);
    this.id_ = id;
    return this;
  }
  getId(): string {
    return this.id_;
  }
  static values(): MapEditorTool[] { return MapEditorTool.$VALUES.slice(); }
  static valueOf(name: string): MapEditorTool { return $J.enumValueOf(MapEditorTool, name); }
  static $clinit() {
    MapEditorTool.PAINTBRUSH = new MapEditorTool()._MapEditorTool('PAINTBRUSH', 0, 'mapEditor.tool.paintBrush');
    MapEditorTool.$VALUES = [MapEditorTool.PAINTBRUSH];
  }
}

$J.define(MapEditorTool, 'net.sf.freecol.client.control.MapEditorTool', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'java.lang.String': '_MapEditorTool' }, returns: { 'getId': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'PAINTBRUSH'] });
