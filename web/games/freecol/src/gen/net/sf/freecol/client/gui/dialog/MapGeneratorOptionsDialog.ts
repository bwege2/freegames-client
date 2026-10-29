// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/MapGeneratorOptionsDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, IOException, ImageIO, JString, Level, List, Logger } from '../../../../../../../jre/index.ts';
import { OptionsDialog } from './OptionsDialog.ts';

let ImageIcon, JPanel, JScrollPane, SwingConstants, MigLayout, FreeCol, BooleanOptionUI, FileOptionUI, FreeColButton, Messages, FreeColDirectories, FreeColSavegameFile, StringTemplate, MapGeneratorOptions;

/**
 * Dialog for changing the map generator options.
 *
 * @see MapGeneratorOptions
 * @see OptionGroup
 */
export class MapGeneratorOptionsDialog extends OptionsDialog {
  static logger: Logger = null;
  /**
   * Creates a dialog to set the map generator options.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param editable Whether the options may be edited.
   */
  _MapGeneratorOptionsDialog(freeColClient: FreeColClient, frame: JFrame, editable: boolean): this {
    this._OptionsDialog(freeColClient, freeColClient.getGame().getMapGeneratorOptions(), MapGeneratorOptions.TAG, FreeColDirectories.MAP_GENERATOR_OPTIONS_FILE_NAME, MapGeneratorOptions.TAG, editable);
    if (this.isEditable()) {
      let mapFiles = FreeColDirectories.getMapFileList();
      let mapPanel = new JPanel()._JPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 4, fill'));
      let randomMap = new FreeColButton()._FreeColButton$String(Messages.message$String('mapGeneratorOptions.landGenerator.name'));
      randomMap.addActionListener((ae) => {
        this.updateFile(null);
      });
      mapPanel.add$Component$Object(randomMap, 'sizegroup button, grow');
      for (const $it0 = mapFiles.iterator(); $it0.hasNext(); ) {
        let f = $it0.next();
        let mapButton = this.makeMapButton(f);
        if (mapButton == null) {
          continue;
        }
        mapButton.addActionListener((ae) => {
          this.updateFile(f);
        });
        mapPanel.add$Component$Object(mapButton, 'sizegroup button, grow');
      }
      let scrollPane = new JScrollPane()._JScrollPane$Component(mapPanel);
      scrollPane.getViewport().setOpaque(false);
      this.panel.add$Component$Object(scrollPane, 'height 80%, width 100%');
    }
    this.initialize(frame, List.of());
    return this;
  }
  /**
   * Update the selected map file.
   *
   * @param file The new map {@code File}.
   */
  updateFile(file: File): void {
    let mgoUI = this.getOptionUI();
    mgoUI.selectOption(MapGeneratorOptions.MAPGENERATOROPTIONS_IMPORT);
    mgoUI.getOptionUI$String$Class(MapGeneratorOptions.IMPORT_FILE, $J.cls(FileOptionUI)).setValue(file);
    mgoUI.getOptionUI$String$Class(MapGeneratorOptions.IMPORT_TERRAIN, $J.cls(BooleanOptionUI)).setValue(true);
    mgoUI.getOptionUI$String$Class(MapGeneratorOptions.IMPORT_BONUSES, $J.cls(BooleanOptionUI)).setValue(false);
    mgoUI.getOptionUI$String$Class(MapGeneratorOptions.IMPORT_RUMOURS, $J.cls(BooleanOptionUI)).setValue(false);
    mgoUI.getOptionUI$String$Class(MapGeneratorOptions.IMPORT_SETTLEMENTS, $J.cls(BooleanOptionUI)).setValue(false);
    if (file == null) {
      mgoUI.selectOption(MapGeneratorOptions.MAPGENERATOROPTIONS_LAND_GENERATOR);
    }
  }
  /**
   * Make a map button for a given map file.
   *
   * @param file The map {@code File}.
   * @return A {@code JButton} if the map is readable, or null
   *     on failure.
   */
  makeMapButton(file: File): JButton {
    let mapName = file.getName();
    mapName = mapName.substring(0, mapName.lastIndexOf(String.fromCharCode(46 /* '.' */)));
    let mapButton = null;
    let savegame: FreeColSavegameFile;
    try {
      savegame = new FreeColSavegameFile()._FreeColSavegameFile(file);
    } catch ($e1) {
      if ($J.isa($e1, IOException)) {
        let ioe = $J.exc($e1);
        MapGeneratorOptionsDialog.logger.log(Level.WARNING, 'Failed to make save game for: ' + mapName, ioe);
        return null;
      } else {
        throw $e1;
      }
    }
    let thumbnail: Image;
    try {
      thumbnail = ImageIO.read(savegame.getThumbnailInputStream());
    } catch ($e2) {
      if ($J.isa($e2, IOException)) {
        let ioe = $J.exc($e2);
        MapGeneratorOptionsDialog.logger.log(Level.WARNING, 'Failed to read thumbnail for: ' + mapName, ioe);
        thumbnail = null;
      } else {
        throw $e2;
      }
    }
    if (thumbnail != null) {
      mapButton = new FreeColButton()._FreeColButton$String(Messages.message$String('freecol.map.' + mapName));
      mapButton.setIcon(new ImageIcon()._ImageIcon$Image(thumbnail));
      mapButton.setHorizontalTextPosition(SwingConstants.CENTER);
      mapButton.setVerticalTextPosition(SwingConstants.BOTTOM);
      try {
        let properties = savegame.getProperties();
        mapButton.setToolTipText(properties.getProperty('map.width') + '×' + properties.getProperty('map.height'));
      } catch ($e3) {
        if ($J.isa($e3, IOException)) {
          let ioe = $J.exc($e3);
          MapGeneratorOptionsDialog.logger.log(Level.WARNING, 'Failed to read properties for: ' + mapName, ioe);
        } else {
          throw $e3;
        }
      }
    }
    return mapButton;
  }
  /**
   * {@inheritDoc}
   */
  save(file: File): boolean {
    let EDGE = MapGeneratorOptions.MAXIMUM_DISTANCE_TO_EDGE;
    let ok = false;
    try {
      let edge = this.getGroup().getInteger(EDGE);
      let width = this.getGroup().getInteger(MapGeneratorOptions.MAP_WIDTH);
      if (width >= Math.imul(4, edge)) {
        ok = true;
      } else {
        this.getGUI().showErrorPanel$StringTemplate(StringTemplate.template$String('mapGeneratorOptionsDialog.badWidth').addAmount('%width%', width).addAmount('%edge%', edge));
        this.getGroup().setInteger(EDGE, this.getGroup().getIntegerMinimum(EDGE));
        return false;
      }
    } catch ($e4) {
      if ($J.isa($e4, Exception)) {
        let ex = $J.exc($e4);
        MapGeneratorOptionsDialog.logger.log(Level.WARNING, 'Options in disarray', ex);
      } else {
        throw $e4;
      }
    }
    if (!ok) {
      this.getGUI().showErrorPanel$StringTemplate(FreeCol.badFile('error.couldNotSave', file));
      return false;
    }
    return super.save(file);
  }
  static $clinit() {
    MapGeneratorOptionsDialog.logger = Logger.getLogger($J.cls(MapGeneratorOptionsDialog).getName());
  }
}

$J.define(MapGeneratorOptionsDialog, 'net.sf.freecol.client.gui.dialog.MapGeneratorOptionsDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.OptionsDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,boolean': '_MapGeneratorOptionsDialog' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  BooleanOptionUI = $J.load('net.sf.freecol.client.gui.option.BooleanOptionUI');
  FileOptionUI = $J.load('net.sf.freecol.client.gui.option.FileOptionUI');
  FreeColButton = $J.load('net.sf.freecol.client.gui.panel.FreeColButton');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColSavegameFile = $J.load('net.sf.freecol.common.io.FreeColSavegameFile');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
});
