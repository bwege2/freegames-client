// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/MapEditorController.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, BufferedImage, FileNotFoundException, HashMap, IOException, Logger, Random, Thread, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from './FreeColClientHolder.ts';

let Dimension, SwingUtilities, FreeCol, MapEditorTool, MiniMap, FreeColException, Messages, FreeColDirectories, FreeColSavegameFile, StringTemplate, ResourceManager, FreeColServer, ServerGame, ServerPlayer;

/**
 * The map editor controller.
 */
export class MapEditorController extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * Map height in MapGeneratorOptionsDialog.
   */
  static readonly MINI_MAP_THUMBNAIL_FINAL_HEIGHT: number = 64;
  currentTool: MapEditorTool = null;
  /**
   * The transform that should be applied to a {@code Tile}
   * that is clicked on the map.
   */
  currentMapTransform: MapTransform = null;
  currentArea: Area = null;
  displayAreas: boolean = false;
  visibleAreas: JMap<Area, boolean> = null;
  /**
   * Creates a new {@code MapEditorController}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MapEditorController(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    this.currentTool = MapEditorTool.PAINTBRUSH;
    this.currentMapTransform = null;
    this.currentArea = null;
    this.displayAreas = false;
    this.visibleAreas = new HashMap();
    return this;
  }
  /**
   * Create a thumbnail for the minimap.
   *
   * FIXME: Delete all code inside this method and replace it with
   *        sensible code directly drawing in necessary size,
   *        without creating a throwaway GUI panel, drawing in wrong
   *        size and immediately resizing.
   *        Consider moving to ImageLibrary in due course, but not
   *        until the MiniMap dependency is gone.
   *
   * @return The created {@code BufferedImage}.
   */
  createMiniMapThumbNail(): BufferedImage {
    let miniMap = new MiniMap()._MiniMap(this.getFreeColClient());
    miniMap.setTileSize(MiniMap.MAX_TILE_SIZE);
    let map = this.getMap();
    let width = (Math.imul(map.getWidth(), MiniMap.MAX_TILE_SIZE) + $J.idiv(MiniMap.MAX_TILE_SIZE, 2)) | 0;
    let height = $J.idiv(Math.imul(map.getHeight(), MiniMap.MAX_TILE_SIZE), 4);
    miniMap.setSize$int$int(width, height);
    let image = new BufferedImage(width, height, 2);
    let g1 = image.createGraphics();
    miniMap.paintEntireMinimap(g1, MiniMap.MAX_TILE_SIZE, new Dimension()._Dimension$int$int(width, height));
    g1.dispose();
    let scaledWidth = Math.min($J.d2i((Math.fround((Math.imul(64, width)) / Math.fround(height)))), 128);
    let scaledImage = new BufferedImage(scaledWidth, MapEditorController.MINI_MAP_THUMBNAIL_FINAL_HEIGHT, 2);
    let g2 = scaledImage.createGraphics();
    g2.drawImage$Image$int$int$int$int$ImageObserver(image, 0, 0, scaledWidth, MapEditorController.MINI_MAP_THUMBNAIL_FINAL_HEIGHT, null);
    g2.dispose();
    return scaledImage;
  }
  /**
   * Require all native nation players to be present in a game.
   *
   * @param game The {@code Game} to add native nations to.
   */
  requireNativeNations(game: Game): void {
    let spec = game.getSpecification();
    for (const $it0 = spec.getIndianNations().iterator(); $it0.hasNext(); ) {
      let n = $it0.next();
      let p = game.getPlayerByNation(n);
      if (p == null) {
        p = new ServerPlayer()._ServerPlayer$Game$boolean$Nation(game, false, n);
        game.addPlayer(p);
      }
    }
  }
  /**
   * Enters map editor mode.
   *
   * FIXME: The TC and difficulty level can now be set at the
   * command line, but we should do better.
   */
  startMapEditor(): void {
    let fcc = this.getFreeColClient();
    let gui = this.getGUI();
    try {
      let specification = this.getDefaultSpecification();
      let mods = this.getClientOptions().getActiveMods();
      let specificationChanges = mods.stream().anyMatch((m) => m.hasSpecification());
      specification.loadMods(mods);
      fcc.setMapEditor(true);
      let freeColServer = new FreeColServer()._FreeColServer$boolean$boolean$Specification$InetAddress$int$String(false, false, specification, null, 0, null);
      fcc.setFreeColServer(freeColServer);
      let serverGame = freeColServer.getGame();
      this.requireNativeNations(serverGame);
      fcc.setGame(serverGame);
      fcc.setMyPlayer(null);
      gui.playSound(null);
      gui.closeMainPanel();
      gui.closeMenus();
      gui.startMapEditorGUI();
      let defaultPlaylist = ResourceManager.getAudioResource('sound.music.playlist.default', true);
      if (defaultPlaylist != null) {
        this.getFreeColClient().getSoundController().setDefaultPlaylist(defaultPlaylist.getAllAudio());
      }
      this.getFreeColClient().getSoundController().playMusic(null);
      if (specificationChanges) {
        gui.showInformationPanel$String('mapEditor.loadedWithMods');
      }
    } catch ($e1) {
      if ($J.isa($e1, IOException)) {
        let e = $J.exc($e1);
        gui.showErrorPanel$StringTemplate(StringTemplate.template$String('server.initialize'));
        return;
      } else {
        throw $e1;
      }
    }
  }
  /**
   * Get the default specification from the default rules.
   *
   * @return A {@code Specification} to use in the map editor.
   */
  getDefaultSpecification(): Specification {
    return FreeCol.loadSpecification(FreeCol.getRulesFile(), FreeCol.getAdvantages(), FreeCol.getDifficulty());
  }
  /**
   * Sets the currently chosen {@code MapTransform}.
   *
   * @param mt The transform that should be applied to a
   *     {@code Tile} that is clicked on the map.
   */
  setMapTransform(mt: MapTransform): void {
    this.currentMapTransform = mt;
    this.getGUI().changeView$MapTransform(mt);
  }
  /**
   * Gets the current {@code MapTransform}.
   *
   * @return The transform that should be applied to a
   *     {@code Tile} that is clicked on the map.
   */
  getMapTransform(): MapTransform {
    return this.currentMapTransform;
  }
  getCurrentTool(): MapEditorTool {
    return this.currentTool;
  }
  setCurrentArea(currentArea: Area): void {
    this.currentArea = currentArea;
  }
  getCurrentArea(): Area {
    return this.currentArea;
  }
  isAreaVisible(area: Area): boolean {
    let b = this.visibleAreas.get(area);
    return (b == null || b);
  }
  setAreaVisible(area: Area, visible: boolean): void {
    this.visibleAreas.put(area, visible);
  }
  /**
   * Checks if areas should be displayed while editing.
   * @return {@code true} if the areas should be displayed.
   */
  isDisplayAreas(): boolean {
    return this.displayAreas;
  }
  /**
   * Sets if areas should be displayed while editing.
   * @param displayAreas {@code true} if the areas should be displayed.
   */
  setDisplayAreas(displayAreas: boolean): void {
    this.displayAreas = displayAreas;
    this.getGUI().refresh();
  }
  /**
   * Transforms the given {@code Tile} using the
   * {@link #getMapTransform()} current {@code MapTransform}.
   *
   * @param t The {@code Tile} to be modified.
   */
  transform(t: Tile): void {
    if (this.currentMapTransform != null) {
      this.currentMapTransform.transform(t);
    }
  }
  /**
   * Creates a new map using a {@code MapGenerator}. A panel
   * with the {@code MapGeneratorOptions} is first displayed.
   *
   * @see MapGenerator
   * @see MapGeneratorOptions
   */
  newMap(): void {
    let freeColServer = this.getFreeColServer();
    this.getGUI().removeInGameComponents();
    this.getGUI().showMapGeneratorOptionsDialog(true, (mgo) => {
      if (mgo != null) {
        let serverGame = new ServerGame()._ServerGame$Specification$Random(this.getDefaultSpecification(), new Random());
        this.getFreeColClient().getFreeColServer().setGame(serverGame);
        this.getFreeColClient().setGame(serverGame);
        serverGame.setMapGeneratorOptions(mgo);
        freeColServer.generateMap(false);
        this.requireNativeNations(serverGame);
        this.getGUI().setFocus(serverGame.getMap().getTile$int$int(1, 1));
        this.getGUI().updateMenuBar();
        this.getGUI().startMapEditorGUI();
        this.getGUI().refresh();
      }
    });
  }
  /**
   * Opens a dialog where the user should specify the filename
   * and saves the game.
   */
  saveMapEditorGame$(): void {
    let dir = FreeColDirectories.getUserMapsDirectory();
    if (dir == null) {
      dir = FreeColDirectories.getSaveDirectory();
    }
    let file = this.getGUI().showSaveDialog(dir, FreeColDirectories.MAP_EDITOR_FILE_NAME);
    if (file != null) {
      this.saveMapEditorGame$File(file);
    }
  }
  /**
   * Saves the game to the given file.
   *
   * @param file The {@code File}.
   */
  saveMapEditorGame$File(file: File): void {
    let gui = this.getGUI();
    let game = this.getGame();
    let map = game.getMap();
    map.resetContiguity();
    map.resetHighSeasCount();
    map.resetLayers();
    gui.showStatusPanel(Messages.message$String('status.savingGame'));
    (new (MapEditorController$1())().$o(this).$c(file, gui)._Thread(FreeCol.CLIENT_THREAD + '-Saving-Map')).start();
  }
  /**
   * Opens a dialog where the user should specify the filename and loads the
   * game.
   */
  loadGame$(): void {
    let file = this.getGUI().showLoadSaveFileDialog(FreeColDirectories.getUserMapsDirectory(), [FreeCol.FREECOL_MAP_EXTENSION, '*']);
    if (file != null) {
      this.loadGame$File$MapEditorController(file);
    }
  }
  /**
   * Loads a game from the given file.
   *
   * @param file The {@code File}.
   */
  loadGame$File$MapEditorController(file: File): void {
    let fcc = this.getFreeColClient();
    let gui = this.getGUI();
    fcc.setMapEditor(true);
    this.getGUI().removeInGameComponents();
    gui.showStatusPanel(Messages.message$String('status.loadingGame'));
    let theFile = file;
    (new (MapEditorController$2())().$o(this).$c(theFile, fcc, gui)._Thread(FreeCol.CLIENT_THREAD + 'Loading-Map')).start();
  }
  static $clinit() {
    MapEditorController.logger = Logger.getLogger($J.cls(MapEditorController).getName());
  }
}

let $MapEditorController$1: any = null;
/** An anonymous class (MapEditorController.java:331). */
function MapEditorController$1(): any {
  return $MapEditorController$1 ??= $J.local(class extends Thread {
    run(): void {
      try {
        let thumb = this.$outer.createMiniMapThumbNail();
        this.$outer.getFreeColServer().saveMapEditorGame(this.$cv_file, thumb);
        SwingUtilities.invokeLater(() => {
          this.$cv_gui.closeStatusPanel();
        });
      } catch ($e2) {
        if ($J.isa($e2, IOException)) {
          let e = $J.exc($e2);
          SwingUtilities.invokeLater(() => {
            this.$cv_gui.closeStatusPanel();
            this.$cv_gui.showErrorPanel$StringTemplate$String(FreeCol.badFile('error.couldNotSave', this.$cv_file), (e == null) ? null : e.getMessage());
          });
        } else {
          throw $e2;
        }
      }
    }
    $c($file, $gui): this {
      this.$cv_file = $file; this.$cv_gui = $gui;
      return this;
    }
  }, 'net.sf.freecol.client.control.MapEditorController$1', []);
}

let $MapEditorController$2: any = null;
/** An anonymous class (MapEditorController.java:376). */
function MapEditorController$2(): any {
  return $MapEditorController$2 ??= $J.local(class extends Thread {
    run(): void {
      let freeColServer = this.$outer.getFreeColServer();
      try {
        let spec = this.$outer.getDefaultSpecification();
        let game = FreeColServer.readGame$FreeColSavegameFile$Specification$FreeColServer(new FreeColSavegameFile()._FreeColSavegameFile(this.$cv_theFile), spec, freeColServer);
        game.generateDefaultAreas();
        this.$cv_fcc.setGame(game);
        this.$outer.requireNativeNations(game);
        SwingUtilities.invokeLater(() => {
          this.$cv_gui.closeStatusPanel();
          this.$outer.getGUI().startMapEditorGUI();
          this.$cv_gui.setFocus(game.getMap().getTile$int$int(1, 1));
          this.$cv_gui.refresh();
        });
      } catch ($e3) {
        if ($J.isa($e3, FileNotFoundException)) {
          let fnfe = $J.exc($e3);
          this.$cv_gui.showErrorPanel$Exception$StringTemplate(fnfe, FreeCol.badFile('error.couldNotFind', this.$cv_theFile));
        } else if ($J.isa($e3, IOException) || $J.isa($e3, FreeColException)) {
          let ioe = $J.exc($e3);
          this.$cv_gui.showErrorPanel$Exception$StringTemplate(ioe, StringTemplate.key$String('server.initialize'));
        } else if ($J.isa($e3, XMLStreamException)) {
          let xse = $J.exc($e3);
          this.$cv_gui.showErrorPanel$Exception$StringTemplate(xse, FreeCol.badFile('error.couldNotLoad', this.$cv_theFile));
        } else {
          throw $e3;
        }
      }
    }
    $c($theFile, $fcc, $gui): this {
      this.$cv_theFile = $theFile; this.$cv_fcc = $fcc; this.$cv_gui = $gui;
      return this;
    }
  }, 'net.sf.freecol.client.control.MapEditorController$2', []);
}

$J.define(MapEditorController, 'net.sf.freecol.client.control.MapEditorController', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_MapEditorController' }, returns: { 'isDisplayAreas': 'boolean', 'getCurrentArea': 'net.sf.freecol.common.model.Area', 'getCurrentTool': 'net.sf.freecol.client.control.MapEditorTool', 'getMapTransform': 'net.sf.freecol.client.control.MapTransform', 'getDefaultSpecification': 'net.sf.freecol.common.model.Specification' }, meths: { 'loadGame(java.io.File)': 'loadGame$File$MapEditorController', 'loadGame()': 'loadGame$', 'saveMapEditorGame(java.io.File)': 'saveMapEditorGame$File', 'saveMapEditorGame()': 'saveMapEditorGame$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  MapEditorTool = $J.load('net.sf.freecol.client.control.MapEditorTool');
  MiniMap = $J.load('net.sf.freecol.client.gui.panel.MiniMap');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColSavegameFile = $J.load('net.sf.freecol.common.io.FreeColSavegameFile');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  FreeColServer = $J.load('net.sf.freecol.server.FreeColServer');
  ServerGame = $J.load('net.sf.freecol.server.model.ServerGame');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
});
