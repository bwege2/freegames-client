// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/ClientOptions.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AtomicReference, Collator, Comparator, Exception, HashMap, IOException, Level, Logger, RuntimeException, XMLStreamException } from '../../../../../jre/index.ts';
import { OptionGroup } from '../common/option/OptionGroup.ts';

let Dimension, Point, FreeCol, FreeColException, FreeColDirectories, FreeColModFile, FreeColXMLReader, Location, ModelMessage, BooleanOption, IntegerOption, PercentageOption, RangeOption, TextOption, CollectionUtils, LogBuilder;

/**
 * Defines how available client options are displayed on the Setting
 * dialog from File/Preferences Also contains several Comparators used
 * for display purposes.
 *
 * Most available client options and their default values are defined
 * in the file {@code base/client-options.xml} in the FreeCol
 * data directory. They are overridden by the player's personal
 * settings in the file {@code options.xml} in the user
 * directory. Note that some options are generated and added dynamically.
 *
 * Each option should be given an unique identifier (defined as a
 * constant in this class). In general, the options are called
 * something like "model.option.UNIQUENAME". Since the options must
 * also be represented by the GUI, they following two keys must be
 * added to the file {@code FreeColMessages.properties}:
 *
 * <ul><li>model.option.UNIQUENAME.name</li>
 * <li>model.option.UNIQUENAME.shortDescription</li></ul>
 */
export class ClientOptions extends OptionGroup {
  static logger: Logger = null;
  static readonly TAG: string = 'clientOptions';
  static readonly PERSONAL_GROUP: string = 'clientOptions.personal';
  /**
   * Option for the player's preferred name.
   */
  static readonly NAME: string = 'model.option.playerName';
  /**
   * Special option for setting the language.
   */
  static readonly LANGUAGE: string = 'model.option.languageOption';
  /**
   * Value for automatic language selection.
   */
  static readonly AUTOMATIC: string = 'clientOptions.gui.languageOption.autoDetectLanguage';
  static readonly GUI_GROUP: string = 'clientOptions.gui';
  static readonly DISPLAY_GROUP: string = 'clientOptions.display';
  /**
   * Option to control the display scale factor.
   */
  static readonly DISPLAY_SCALING: string = 'model.option.displayScaling';
  /**
   * Enable manual override of main font size.
   */
  static readonly MANUAL_MAIN_FONT_SIZE: string = 'model.option.manualMainFontSize';
  /**
   * Value to use to override the main font size, if enabled by the above.
   */
  static readonly MAIN_FONT_SIZE: string = 'model.option.mainFontSize';
  /**
   * Pixmap setting to work around Java 2D graphics bug.
   */
  static readonly USE_PIXMAPS: string = 'model.option.usePixmaps';
  /**
   * Enable use of openGL pipeline.
   */
  static readonly USE_OPENGL: string = 'model.option.useOpenGL';
  /**
   * Enable use of XRender pipeline (unix specific).
   */
  static readonly USE_XRENDER: string = 'model.option.useXRender';
  static readonly USE_TERRAIN_ANIMATIONS: string = 'model.option.useTerrainAnimations';
  /**
   * Allows the user to determine the tradeoff between quality and rendering speed.
   */
  static readonly GRAPHICS_QUALITY: string = 'model.option.graphicsQuality';
  static readonly GRAPHICS_QUALITY_LOWEST: number = 0;
  static readonly GRAPHICS_QUALITY_LOW: number = 10;
  static readonly GRAPHICS_QUALITY_NORMAL: number = 20;
  static readonly GRAPHICS_QUALITY_HIGH: number = 30;
  static readonly GRAPHICS_QUALITY_HIGHEST: number = 40;
  /**
   * Animation speed for our units.
   */
  static readonly MOVE_ANIMATION_SPEED: string = 'model.option.moveAnimationSpeed';
  /**
   * Animation speed for enemy units.
   */
  static readonly ENEMY_MOVE_ANIMATION_SPEED: string = 'model.option.enemyMoveAnimationSpeed';
  /**
   * Animation speed for friendly units.
   */
  static readonly FRIENDLY_MOVE_ANIMATION_SPEED: string = 'model.option.friendlyMoveAnimationSpeed';
  static readonly INTERFACE_GROUP: string = 'clientOptions.interface';
  static readonly MAPVIEW_GROUP: string = 'clientOptions.interface.mapView';
  /**
   * Default zoom level of the minimap.
   */
  static readonly DEFAULT_ZOOM_LEVEL: string = 'model.option.defaultZoomLevel';
  /**
   * Selected tiles always gets centered if this option is enabled (even if
   * the tile is on screen.
   */
  static readonly ALWAYS_CENTER: string = 'model.option.alwaysCenter';
  /**
   * If this option is enabled, the display will recenter in order
   * to display the active unit if it is not on screen.
   */
  static readonly JUMP_TO_ACTIVE_UNIT: string = 'model.option.jumpToActiveUnit';
  /**
   * Option to scroll when dragging units on the mapboard.
   */
  static readonly MAP_SCROLL_ON_DRAG: string = 'model.option.mapScrollOnDrag';
  /**
   * Option to auto-scroll on mouse movement.
   */
  static readonly AUTO_SCROLL: string = 'model.option.autoScroll';
  /**
   * Whether to display the grid by default or not.
   */
  static readonly DISPLAY_GRID: string = 'model.option.displayGrid';
  /**
   * Whether to display borders by default or not.
   */
  static readonly DISPLAY_BORDERS: string = 'model.option.displayBorders';
  /**
   * Whether to draw the fog of war on the actual map or not.
   */
  static readonly DISPLAY_FOG_OF_WAR: string = 'model.option.displayFogOfWar';
  /**
   * Whether to delay on a unit's last move or not.
   */
  static readonly UNIT_LAST_MOVE_DELAY: string = 'model.option.unitLastMoveDelay';
  /**
   * What text to display in the tiles.
   */
  static readonly DISPLAY_TILE_TEXT: string = 'model.option.displayTileText';
  static readonly DISPLAY_TILE_TEXT_EMPTY: number = 0;
  static readonly DISPLAY_TILE_TEXT_NAMES: number = 1;
  static readonly DISPLAY_TILE_TEXT_OWNERS: number = 2;
  static readonly DISPLAY_TILE_TEXT_REGIONS: number = 3;
  /**
   * Style of colony labels.
   */
  static readonly DISPLAY_COLONY_LABELS: string = 'model.option.displayColonyLabels';
  static readonly COLONY_LABELS_NONE: number = 0;
  static readonly COLONY_LABELS_CLASSIC: number = 1;
  static readonly COLONY_LABELS_MODERN: number = 2;
  static readonly MAPCONTROLS_GROUP: string = 'clientOptions.interface.mapControls';
  /**
   * Whether to display a compass rose or not.
   */
  static readonly DISPLAY_COMPASS_ROSE: string = 'model.option.displayCompassRose';
  /**
   * Whether to display the map controls or not.
   */
  static readonly DISPLAY_MAP_CONTROLS: string = 'model.option.displayMapControls';
  /**
   * The type of map controls, corner or classic.
   */
  static readonly MAP_CONTROLS: string = 'model.option.mapControls';
  /**
   * Styles of map controls.
   */
  static readonly MAP_CONTROLS_CORNERS: string = 'clientOptions.gui.mapControls.CornerMapControls';
  static readonly MAP_CONTROLS_CLASSIC: string = 'clientOptions.gui.mapControls.ClassicMapControls';
  /**
   * Whether to draw the fog of war on the minimap.
   */
  static readonly MINIMAP_TOGGLE_FOG_OF_WAR: string = 'model.option.miniMapToggleFogOfWar';
  /**
   * Whether to draw the borders on the minimap.
   */
  static readonly MINIMAP_TOGGLE_BORDERS: string = 'model.option.miniMapToggleBorders';
  /**
   * The color to fill in around the actual map on the
   * minimap.  Typically only visible when the minimap is at full
   * zoom-out, but at the default 'black' you can't differentiate
   * between the background and the (unexplored) map.  Actually:
   * clientOptions.minimap.color.background
   */
  static readonly MINIMAP_BACKGROUND_COLOR: string = 'model.option.color.background';
  static readonly MESSAGES_GROUP: string = 'clientOptions.messages';
  /**
   * Used by GUI, this defines the grouping of ModelMessages.
   * Possible values include nothing, type and source.
   *
   * @see net.sf.freecol.client.gui.mapviewer.MapViewer
   * @see net.sf.freecol.common.model.ModelMessage
   */
  static readonly MESSAGES_GROUP_BY: string = 'model.option.guiMessagesGroupBy';
  static readonly MESSAGES_GROUP_BY_NOTHING: number = 0;
  static readonly MESSAGES_GROUP_BY_TYPE: number = 1;
  static readonly MESSAGES_GROUP_BY_SOURCE: number = 2;
  /**
   * Show goods movement messages.  Used by followTradeRoute.
   */
  static readonly SHOW_GOODS_MOVEMENT: string = 'model.option.guiShowGoodsMovement';
  /**
   * Show warnings about colony sites.
   */
  static readonly SHOW_COLONY_WARNINGS: string = 'model.option.guiShowColonyWarnings';
  /**
   * Show the pre-combat dialog?
   */
  static readonly SHOW_PRECOMBAT: string = 'model.option.guiShowPreCombat';
  /**
   * Show warnings about suboptimal colony tile choice.
   */
  static readonly SHOW_NOT_BEST_TILE: string = 'model.option.guiShowNotBestTile';
  static readonly SHOW_REGION_NAMING: string = 'model.option.guiShowRegionNaming';
  /**
   * Option for selecting the compact colony report.
   */
  static readonly COLONY_REPORT: string = 'model.option.colonyReport';
  static readonly COLONY_REPORT_CLASSIC: number = 0;
  static readonly COLONY_REPORT_COMPACT: number = 1;
  /**
   * The type of labour report to display.
   */
  static readonly LABOUR_REPORT: string = 'model.option.labourReport';
  static readonly LABOUR_REPORT_CLASSIC: number = 0;
  static readonly LABOUR_REPORT_COMPACT: number = 1;
  static readonly WAREHOUSE_GROUP: string = 'clientOptions.warehouse';
  /**
   * The amount of stock the custom house should keep when selling goods.
   */
  static readonly CUSTOM_STOCK: string = 'model.option.customStock';
  /**
   * Generate warning of stock drops below this percentage of capacity.
   */
  static readonly LOW_LEVEL: string = 'model.option.lowLevel';
  /**
   * Generate warning of stock exceeds this percentage of capacity.
   */
  static readonly HIGH_LEVEL: string = 'model.option.highLevel';
  /**
   * Should trade route units check production to determine goods levels at
   * stops along its route?
   */
  static readonly STOCK_ACCOUNTS_FOR_PRODUCTION: string = 'model.option.stockAccountsForProduction';
  static readonly OTHER_GROUP: string = 'clientOptions.other';
  /**
   * Whether to remember the positions of various dialogs and panels.
   */
  static readonly REMEMBER_PANEL_POSITIONS: string = 'model.option.rememberPanelPositions';
  /**
   * Whether to remember the sizes of various dialogs and panels.
   */
  static readonly REMEMBER_PANEL_SIZES: string = 'model.option.rememberPanelSizes';
  /**
   * Whether to display end turn grey background or not.
   */
  static readonly DISABLE_GRAY_LAYER: string = 'model.option.disableGrayLayer';
  /**
   * Option to autoload emigrants on sailing to america.
   */
  static readonly AUTOLOAD_EMIGRANTS: string = 'model.option.autoloadEmigrants';
  /**
   * Option to autoload sentried units.
   */
  static readonly AUTOLOAD_SENTRIES: string = 'model.option.autoloadSentries';
  /**
   * Automatically end the turn when no units can be * made active.
   */
  static readonly AUTO_END_TURN: string = 'model.option.autoEndTurn';
  /**
   * Show the end turn dialog.
   */
  static readonly SHOW_END_TURN_DIALOG: string = 'model.option.showEndTurnDialog';
  /**
   * Set the default native demand action.
   */
  static readonly INDIAN_DEMAND_RESPONSE: string = 'model.option.indianDemandResponse';
  static readonly INDIAN_DEMAND_RESPONSE_ASK: number = 0;
  static readonly INDIAN_DEMAND_RESPONSE_ACCEPT: number = 1;
  static readonly INDIAN_DEMAND_RESPONSE_REJECT: number = 2;
  /**
   * Set the default warehouse overflow on unload action.
   */
  static readonly UNLOAD_OVERFLOW_RESPONSE: string = 'model.option.unloadOverflowResponse';
  static readonly UNLOAD_OVERFLOW_RESPONSE_ASK: number = 0;
  static readonly UNLOAD_OVERFLOW_RESPONSE_NEVER: number = 1;
  static readonly UNLOAD_OVERFLOW_RESPONSE_ALWAYS: number = 2;
  /**
   * Used by GUI, the number will be displayed when a group of goods are
   * higher than this number.
   *
   * @see net.sf.freecol.client.gui.mapviewer.MapViewer
   */
  static readonly MIN_NUMBER_FOR_DISPLAYING_GOODS_COUNT: string = 'model.option.guiMinNumberToDisplayGoodsCount';
  /**
   * Used by GUI, this is the most repetitions drawn of a goods image for a
   * single goods grouping.
   *
   * @see net.sf.freecol.client.gui.mapviewer.MapViewer
   */
  static readonly MAX_NUMBER_OF_GOODS_IMAGES: string = 'model.option.guiMaxNumberOfGoodsImages';
  /**
   * Used by GUI, this is the minimum number of goods a colony must
   * possess for the goods to show up at the bottom of the colony
   * panel.
   *
   * @see net.sf.freecol.client.gui.GUI
   */
  static readonly MIN_NUMBER_FOR_DISPLAYING_GOODS: string = 'model.option.guiMinNumberToDisplayGoods';
  /**
   * Used by GUI to sort colonies.
   */
  static readonly COLONY_COMPARATOR: string = 'model.option.colonyComparator';
  static readonly COLONY_COMPARATOR_NAME: number = 0;
  static readonly COLONY_COMPARATOR_AGE: number = 1;
  static readonly COLONY_COMPARATOR_POSITION: number = 2;
  static readonly COLONY_COMPARATOR_SIZE: number = 3;
  static readonly COLONY_COMPARATOR_SOL: number = 4;
  static readonly SAVEGAMES_GROUP: string = 'clientOptions.savegames';
  /**
   * Use default values for savegames instead of displaying a dialog.
   */
  static readonly SHOW_SAVEGAME_SETTINGS: string = 'model.option.showSavegameSettings';
  static readonly SHOW_SAVEGAME_SETTINGS_NEVER: number = 0;
  static readonly SHOW_SAVEGAME_SETTINGS_MULTIPLAYER: number = 1;
  static readonly SHOW_SAVEGAME_SETTINGS_ALWAYS: number = 2;
  /**
   * Option for setting the period of autosaves. The value 0 signals that
   * autosaving is disabled.
   */
  static readonly AUTOSAVE_PERIOD: string = 'model.option.autosavePeriod';
  /**
   * Option for setting the number of days autosaves are keep (valid
   * time).  If set to 0, valid time is not checked.
   */
  static readonly AUTOSAVE_VALIDITY: string = 'model.option.autosaveValidity';
  /**
   * Option for deleting autosaves when a new game is started.  If set to
   * true, old autosaves will be deleted if a new game is started.
   */
  static readonly AUTOSAVE_DELETE: string = 'model.option.autosaveDelete';
  /**
   * Whether to display confirmation for the overwrite of existing
   * save files.
   */
  static readonly CONFIRM_SAVE_OVERWRITE: string = 'model.option.confirmSaveOverwrite';
  /**
   * Prefix for the auto-save file.
   */
  static readonly AUTO_SAVE_PREFIX: string = 'model.option.autoSavePrefix';
  /**
   * Stem of the last-turn save file name.
   */
  static readonly LAST_TURN_NAME: string = 'model.option.lastTurnName';
  /**
   * Stem of the before-last-turn save file name.
   */
  static readonly BEFORE_LAST_TURN_NAME: string = 'model.option.beforeLastTurnName';
  static readonly AUDIO_GROUP: string = 'clientOptions.audio';
  /**
   * Choose the default mixer.
   */
  static readonly AUDIO_MIXER: string = 'model.option.audioMixer';
  /**
   * The volume level to set.
   */
  static readonly AUDIO_VOLUME: string = 'model.option.audioVolume';
  /**
   * The volume level to set for the music.
   */
  static readonly MUSIC_VOLUME: string = 'model.option.musicVolume';
  /**
   * The volume level to set.
   */
  static readonly SOUND_EFFECTS_VOLUME: string = 'model.option.soundEffectsVolume';
  /**
   * Play an alert sound on message arrival.
   */
  static readonly AUDIO_ALERTS: string = 'model.option.audioAlerts';
  /**
   * The mods.
   */
  static readonly USER_MODS: string = 'clientOptions.mods.userMods';
  /**
   * The dynamic placement options.
   */
  static readonly ETC: string = 'clientOptions.etc';
  static specialKeys: List<string> = null;
  /**
   * Compare by ascending age.
   */
  static colonyAgeComparator: Comparator<Colony> = null;
  /**
   * Compare by name, initialized at run time.
   */
  static colonyNameComparator: AtomicReference<Comparator<Colony>> = null;
  /**
   * Compare by descending size then liberty.
   */
  static colonySizeComparator: Comparator<Colony> = null;
  /**
   * Compare by descending liberty then size.
   */
  static colonySoLComparator: Comparator<Colony> = null;
  /**
   * Compare by position on the map.
   */
  static colonyPositionComparator: Comparator<Colony> = null;
  /**
   * Friendly move animation speed option values.
   */
  static friendlyMoveAnimationSpeeds: JMap<number, string> = null;
  static graphicsQualityChoices: JMap<number, string> = null;
  /**
   * Creates a new {@code ClientOptions}.
   *
   * Unlike other OptionGroup classes, ClientOptions can not supply a
   * specification as it is needed before the specification is available.
   */
  _ClientOptions(): this {
    this._OptionGroup$String(ClientOptions.TAG);
    return this;
  }
  /**
   * Loads the options from the given save game.
   *
   * @param save The {@code FreeColSaveGame} to read the options from.
   * @return True if the options were loaded without error.
   */
  load$FreeColSavegameFile$ClientOptions(save: FreeColSavegameFile): boolean {
    if (save == null) {
      return false;
    }
    let ret = false;
    {
      try {
        const xr = save.getClientOptionsFreeColXMLReader();
        try {
          ret = this.load$FreeColXMLReader(xr);
        } finally {
          if (xr != null) xr.close();
        }
      } catch ($e0) {
        if ($J.isa($e0, IOException) || $J.isa($e0, XMLStreamException)) {
          let ex = $J.exc($e0);
          ClientOptions.logger.log(Level.WARNING, 'Load OptionGroup(' + this.getId() + ') from file ' + save.getPath() + ' crashed', ex);
          return false;
        } else {
          throw $e0;
        }
      }
    }
    ClientOptions.logger.info('Load OptionGroup(' + this.getId() + ') from ' + save.getPath() + ((ret) ? ' succeeded' : ' failed'));
    return ret;
  }
  /**
   * Merge the options from the given file game.
   *
   * @param file The {@code File} to merge the options from.
   * @return True if the options were merge without error.
   */
  merge$File(file: File): boolean {
    let clop = new ClientOptions()._ClientOptions();
    if (!clop.load$File(file)) {
      return false;
    }
    let lb = new LogBuilder()._LogBuilder(64);
    let ret = this.merge$Option$LogBuilder(clop, lb);
    lb.shrink('\n');
    lb.log(ClientOptions.logger, Level.FINEST);
    return ret;
  }
  /**
   * Merge the options from the given save game.
   *
   * @param save The {@code FreeColSaveGame} to merge from.
   * @return True if the options were merged without error.
   */
  merge$FreeColSavegameFile(save: FreeColSavegameFile): boolean {
    let clop = new ClientOptions()._ClientOptions();
    if (!clop.load$FreeColSavegameFile$ClientOptions(save)) {
      return false;
    }
    let lb = new LogBuilder()._LogBuilder(64);
    let ret = this.merge$Option$LogBuilder(clop.getOption$String(ClientOptions.USER_MODS), lb);
    lb.shrink('\n');
    lb.log(ClientOptions.logger, Level.FINEST);
    return ret;
  }
  /**
   * Gets a list of active mods in this ClientOptions.
   *
   * @return A list of active mods.
   */
  getActiveMods(): List<FreeColModFile> {
    let validModPred = (m) => m != null && m.getId() != null;
    let modFileMapper = (m) => FreeColModFile.getFreeColModFile(m.getId());
    return CollectionUtils.transform$Collection$Predicate$Function$Collector(this.getModList(ClientOptions.USER_MODS), validModPred, modFileMapper, CollectionUtils.toListNoNulls());
  }
  /**
   * Get the client's preferred tile text type.
   *
   * @return A {@code DISPLAY_TILE_TEXT_} value
   */
  getDisplayTileText(): number {
    return this.getInteger(ClientOptions.DISPLAY_TILE_TEXT);
  }
  /**
   * Get the client's preferred comparator for colonies.
   *
   * @return The current colony {@code Comparator}.
   */
  getColonyComparator(): Comparator<Colony> {
    return ClientOptions.getColonyComparatorInternal(this.getInteger(ClientOptions.COLONY_COMPARATOR));
  }
  /**
   * Get the colony comparator identified by type.
   *
   * @param type The colony comparator option integer value.
   * @return The corresponding colony {@code Comparator}.
   */
  static getColonyComparatorInternal(type$: number): Comparator<Colony> {
    {
      let cnc: Comparator<Colony>;
      switch (type$) {
        case ClientOptions.COLONY_COMPARATOR_AGE:
          return ClientOptions.colonyAgeComparator;
        case ClientOptions.COLONY_COMPARATOR_POSITION:
          return ClientOptions.colonyPositionComparator;
        case ClientOptions.COLONY_COMPARATOR_SIZE:
          return ClientOptions.colonySizeComparator;
        case ClientOptions.COLONY_COMPARATOR_SOL:
          return ClientOptions.colonySoLComparator;
        case ClientOptions.COLONY_COMPARATOR_NAME:
          cnc = ClientOptions.colonyNameComparator.get();
          if (cnc == null) {
            cnc = Comparator.comparing(($p0) => $p0.getName(), $J.fn(Collator.getInstance(FreeCol.getLocale()), 'compare'));
            ClientOptions.colonyNameComparator.set(cnc);
          }
          return cnc;
        default:
          throw new RuntimeException('Unknown comparator: ' + type$);
      }
    }
  }
  /**
   * Return the client's preferred comparator for ModelMessages.
   *
   * @param game The {@code Game} to extract a comparator for.
   * @return The preferred {@code Comparator}.
   */
  getModelMessageComparator(game: Game): Comparator<ModelMessage> {
    {
      let specialized: JMap<string, Comparator<any>>;
      switch (this.getInteger(ClientOptions.MESSAGES_GROUP_BY)) {
        case ClientOptions.MESSAGES_GROUP_BY_SOURCE:
          specialized = new HashMap();
          specialized.put('Colony', this.getColonyComparator());
          return ModelMessage.getSourceComparator(game, specialized);
        case ClientOptions.MESSAGES_GROUP_BY_TYPE:
          return ModelMessage.messageTypeComparator;
        default:
          return null;
      }
    }
  }
  isRiverAnimationEnabled(): boolean {
    return this.isTerrainAnimationsEnabled() && this.getRange(ClientOptions.GRAPHICS_QUALITY) >= ClientOptions.GRAPHICS_QUALITY_NORMAL;
  }
  isTerrainAnimationsEnabled(): boolean {
    return this.getBoolean(ClientOptions.USE_TERRAIN_ANIMATIONS) && this.getRange(ClientOptions.GRAPHICS_QUALITY) >= ClientOptions.GRAPHICS_QUALITY_LOW;
  }
  /**
   * Perform backward compatibility fixups on new client options as
   * they are introduced.  Annotate with introduction version so we
   * can clean these up as they become standard.
   */
  fixClientOptions(): void {
    this.addBooleanOption(ClientOptions.MINIMAP_TOGGLE_BORDERS, ClientOptions.GUI_GROUP, true);
    this.addBooleanOption(ClientOptions.MINIMAP_TOGGLE_FOG_OF_WAR, ClientOptions.GUI_GROUP, true);
    this.addTextOption(ClientOptions.AUTO_SAVE_PREFIX, ClientOptions.SAVEGAMES_GROUP, 'Autosave');
    this.addTextOption(ClientOptions.LAST_TURN_NAME, ClientOptions.SAVEGAMES_GROUP, 'last-turn');
    this.addTextOption(ClientOptions.BEFORE_LAST_TURN_NAME, ClientOptions.SAVEGAMES_GROUP, 'before-last-turn');
    this.addBooleanOption(ClientOptions.STOCK_ACCOUNTS_FOR_PRODUCTION, ClientOptions.WAREHOUSE_GROUP, false);
    this.addBooleanOption(ClientOptions.AUTOLOAD_SENTRIES, ClientOptions.OTHER_GROUP, false);
    try {
      let ro = this.getOption$String$Class(ClientOptions.DEFAULT_ZOOM_LEVEL, $J.cls(RangeOption));
      if (ro.getItemValues().size() !== 6) {
        let value = ro.getValue$();
        ro.clearItemValues();
        ro.addItemValue(1, '1');
        ro.addItemValue(2, '2');
        ro.addItemValue(3, '3');
        ro.addItemValue(4, '4');
        ro.addItemValue(5, '5');
        ro.addItemValue(6, '6');
        ro.setValue$Object(value);
      }
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        ClientOptions.logger.log(Level.WARNING, 'Failed to fix ' + ClientOptions.DEFAULT_ZOOM_LEVEL + ' option', e);
      } else {
        throw $e1;
      }
    }
    this.addBooleanOption(ClientOptions.SHOW_REGION_NAMING, ClientOptions.MESSAGES_GROUP, true);
    this.addBooleanOption('model.option.guiShowCombatResult', ClientOptions.MESSAGES_GROUP, true);
    this.addBooleanOption('model.option.guiShowUnitRepaired', ClientOptions.MESSAGES_GROUP, true);
    this.addBooleanOption('model.option.guiShowUnitArrived', ClientOptions.MESSAGES_GROUP, true);
    this.addBooleanOption('model.option.guiShowDisasters', ClientOptions.MESSAGES_GROUP, true);
    this.addBooleanOption(ClientOptions.USE_OPENGL, ClientOptions.GUI_GROUP, true);
    this.addBooleanOption(ClientOptions.USE_XRENDER, ClientOptions.GUI_GROUP, true);
    this.addRangeOption(ClientOptions.FRIENDLY_MOVE_ANIMATION_SPEED, ClientOptions.GUI_GROUP, 3, ClientOptions.friendlyMoveAnimationSpeeds);
    this.regroup(ClientOptions.LANGUAGE, ClientOptions.PERSONAL_GROUP);
    this.addOptionGroup$String$String$ClientOptions(ClientOptions.DISPLAY_GROUP, ClientOptions.TAG);
    this.addIntegerOption(ClientOptions.DISPLAY_SCALING, ClientOptions.DISPLAY_GROUP, 0);
    this.addBooleanOption(ClientOptions.MANUAL_MAIN_FONT_SIZE, ClientOptions.DISPLAY_GROUP, false);
    this.addIntegerOption(ClientOptions.MAIN_FONT_SIZE, ClientOptions.DISPLAY_GROUP, 12);
    for (let n of [ClientOptions.USE_PIXMAPS, ClientOptions.USE_OPENGL, ClientOptions.USE_XRENDER, ClientOptions.MOVE_ANIMATION_SPEED, ClientOptions.ENEMY_MOVE_ANIMATION_SPEED, ClientOptions.FRIENDLY_MOVE_ANIMATION_SPEED]) {
      this.regroup(n, ClientOptions.DISPLAY_GROUP);
    }
    this.addOptionGroup$String$String$ClientOptions(ClientOptions.INTERFACE_GROUP, ClientOptions.TAG);
    this.addOptionGroup$String$String$ClientOptions(ClientOptions.MAPVIEW_GROUP, ClientOptions.INTERFACE_GROUP);
    for (let n of [ClientOptions.DEFAULT_ZOOM_LEVEL, ClientOptions.ALWAYS_CENTER, ClientOptions.JUMP_TO_ACTIVE_UNIT, ClientOptions.MAP_SCROLL_ON_DRAG, ClientOptions.AUTO_SCROLL, ClientOptions.DISPLAY_GRID, ClientOptions.DISPLAY_BORDERS, ClientOptions.UNIT_LAST_MOVE_DELAY, ClientOptions.DISPLAY_TILE_TEXT, ClientOptions.DISPLAY_COLONY_LABELS]) {
      this.regroup(n, ClientOptions.MAPVIEW_GROUP);
    }
    this.addOptionGroup$String$String$ClientOptions(ClientOptions.MAPCONTROLS_GROUP, ClientOptions.INTERFACE_GROUP);
    for (let n of [ClientOptions.DISPLAY_COMPASS_ROSE, ClientOptions.DISPLAY_MAP_CONTROLS, ClientOptions.MINIMAP_TOGGLE_FOG_OF_WAR, ClientOptions.MINIMAP_TOGGLE_BORDERS, ClientOptions.MINIMAP_BACKGROUND_COLOR]) {
      this.regroup(n, ClientOptions.MAPCONTROLS_GROUP);
    }
    this.regroup(ClientOptions.MESSAGES_GROUP, ClientOptions.INTERFACE_GROUP);
    this.regroup(ClientOptions.WAREHOUSE_GROUP, ClientOptions.INTERFACE_GROUP);
    this.regroup(ClientOptions.OTHER_GROUP, ClientOptions.INTERFACE_GROUP);
    this.addBooleanOption(ClientOptions.DISPLAY_FOG_OF_WAR, ClientOptions.MAPCONTROLS_GROUP, false);
    this.addRangeOption(ClientOptions.GRAPHICS_QUALITY, ClientOptions.DISPLAY_GROUP, 20, ClientOptions.graphicsQualityChoices);
    this.addBooleanOption(ClientOptions.USE_TERRAIN_ANIMATIONS, ClientOptions.DISPLAY_GROUP, true);
    this.addPercentageOption(ClientOptions.MUSIC_VOLUME, ClientOptions.AUDIO_GROUP, 100);
    this.addPercentageOption(ClientOptions.SOUND_EFFECTS_VOLUME, ClientOptions.AUDIO_GROUP, 100);
    this.remove('model.option.mapControls');
    let op = this.getOption$String$Class(ClientOptions.DISPLAY_SCALING, $J.cls(RangeOption));
    if (!op.getItemValues().containsKey(75)) {
      op.setItemValueAtIndex(1, 75, 'model.option.displayScaling.75');
    }
  }
  addPercentageOption(id: string, gr: string, val: number): void {
    if (!this.hasOption(id, $J.cls(PercentageOption))) {
      let op = new PercentageOption()._PercentageOption$String$Specification(id, null);
      op.setGroup(gr);
      op.setValue$Object(val);
      this.add(op);
    }
  }
  addBooleanOption(id: string, gr: string, val: boolean): void {
    if (!this.hasOption(id, $J.cls(BooleanOption))) {
      let op = new BooleanOption()._BooleanOption$String$Specification(id, null);
      op.setGroup(gr);
      op.setValue$Object(val);
      this.add(op);
    }
  }
  addIntegerOption(id: string, gr: string, val: number): void {
    if (!this.hasOption(id, $J.cls(IntegerOption))) {
      let op = new IntegerOption()._IntegerOption$String$Specification(id, null);
      op.setGroup(gr);
      op.setValue$Object(val);
      this.add(op);
    }
  }
  addOptionGroup$String$String$ClientOptions(id: string, gr: string): void {
    if (!this.hasOption(id, $J.cls(OptionGroup))) {
      let og = new OptionGroup()._OptionGroup$String(id);
      og.setGroup(gr);
      this.add(og);
    }
  }
  /**
   * Add a new range option.
   *
   * @param id The option identifier.
   * @param gr The group identifier.
   * @param rank The option rank.
   * @param entries The options in the range.
   */
  addRangeOption(id: string, gr: string, rank: number, entries: JMap<number, string>): void {
    if (!this.hasOption(id, $J.cls(RangeOption))) {
      let op = new RangeOption()._RangeOption$String$Specification(id, null);
      op.setGroup(gr);
      op.clearItemValues();
      for (const $it2 = entries.entrySet().iterator(); $it2.hasNext(); ) {
        let e = $it2.next();
        op.addItemValue(e.getKey(), e.getValue());
      }
      op.setValueRank(rank);
      this.add(op);
    }
  }
  /**
   * Add a new text option.
   *
   * @param id The option identifier.
   * @param gr The group identifier.
   * @param val The the text value.
   */
  addTextOption(id: string, gr: string, val: string): void {
    if (!this.hasOption(id, $J.cls(TextOption))) {
      let op = new TextOption()._TextOption$String$Specification(id, null);
      op.setGroup(gr);
      op.setValue$Object(val);
      this.add(op);
    }
  }
  /**
   * Move an option to a different group.
   *
   * @param id The identifier for the option to move.
   * @param gr The identifier for the option group to move to.
   */
  regroup(id: string, gr: string): void {
    let op = this.getOption$String(id);
    if (op != null) {
      op.setGroup(gr);
    }
  }
  /**
   * Extract the panel position options for a given panel class name
   * as a point.
   *
   * @param className The panel class name.
   * @return A {@code Point} for the position if found, else null.
   */
  getPanelPosition(className: string): Point {
    let etc = this.getOptionGroup(ClientOptions.ETC);
    try {
      return (etc == null) ? null : new Point()._Point$int$int(etc.getInteger(className + '.x'), etc.getInteger(className + '.y'));
    } catch ($e3) {
      if ($J.isa($e3, Exception)) {
        let ex = $J.exc($e3);
        ClientOptions.logger.finest('Missing position option for ' + className);
        return null;
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Extract the panel size options for a given panel class name as
   * a dimension.
   *
   * @param className The panel class name.
   * @return A {@code Dimension} for the size if found, else null.
   */
  getPanelSize(className: string): Dimension {
    let etc = this.getOptionGroup(ClientOptions.ETC);
    try {
      return (etc == null) ? null : new Dimension()._Dimension$int$int(etc.getInteger(className + '.w'), etc.getInteger(className + '.h'));
    } catch ($e4) {
      if ($J.isa($e4, Exception)) {
        let ex = $J.exc($e4);
        ClientOptions.logger.finest('Missing size option for ' + className);
        return null;
      } else {
        throw $e4;
      }
    }
  }
  /**
   * Extracts the special options from the client options file.
   *
   * Note: called early, the logger is not yet reliably available.
   *
   * @return A map of the special options and the values found for them.
   * @exception FreeColException if there is a problem reading the stream.
   */
  static getSpecialOptions(): JMap<string, string> {
    let ret = new HashMap(ClientOptions.specialKeys.size());
    for (const $it5 = ClientOptions.specialKeys.iterator(); $it5.hasNext(); ) {
      let key = $it5.next();
      ret.put(key, null);
    }
    let optionsFile = FreeColDirectories.getClientOptionsFile();
    {
      try {
        const xr = new FreeColXMLReader()._FreeColXMLReader$File(optionsFile);
        try {
          xr.readAttributeValues(ret, 'value');
        } finally {
          if (xr != null) xr.close();
        }
      } catch ($e6) {
        if ($J.isa($e6, IOException) || $J.isa($e6, XMLStreamException)) {
          let xe = $J.exc($e6);
          throw new FreeColException()._FreeColException$Throwable(xe);
        } else {
          throw $e6;
        }
      }
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ClientOptions.TAG;
  }
  static $clinit() {
    ClientOptions.logger = Logger.getLogger($J.cls(ClientOptions).getName());
    ClientOptions.specialKeys = CollectionUtils.makeUnmodifiableList([ClientOptions.LANGUAGE, ClientOptions.USE_OPENGL, ClientOptions.USE_PIXMAPS, ClientOptions.USE_XRENDER]);
    ClientOptions.colonyAgeComparator = Comparator.comparingInt((c) => c.getEstablished().getNumber());
    ClientOptions.colonyNameComparator = new AtomicReference(null);
    ClientOptions.colonySizeComparator = Comparator.reversed(Comparator.thenComparingInt((Comparator.comparingInt(($p0) => $p0.getUnitCount())), ($p0) => $p0.getSonsOfLiberty()));
    ClientOptions.colonySoLComparator = Comparator.reversed(Comparator.thenComparingInt((Comparator.comparingInt(($p0) => $p0.getSonsOfLiberty())), ($p0) => $p0.getUnitCount()));
    ClientOptions.colonyPositionComparator = Comparator.comparingInt((c) => Location.rankOf(c));
    ClientOptions.friendlyMoveAnimationSpeeds = CollectionUtils.makeUnmodifiableMap([0, 1, 2, 3], ['clientOptions.gui.friendlyMoveAnimationSpeed.off', 'clientOptions.gui.friendlyMoveAnimationSpeed.slow', 'clientOptions.gui.friendlyMoveAnimationSpeed.normal', 'clientOptions.gui.friendlyMoveAnimationSpeed.fast']);
    ClientOptions.graphicsQualityChoices = CollectionUtils.makeUnmodifiableMap([ClientOptions.GRAPHICS_QUALITY_LOWEST, ClientOptions.GRAPHICS_QUALITY_LOW, ClientOptions.GRAPHICS_QUALITY_NORMAL, ClientOptions.GRAPHICS_QUALITY_HIGH, ClientOptions.GRAPHICS_QUALITY_HIGHEST], ['clientOptions.gui.graphicsQuality.lowest', 'clientOptions.gui.graphicsQuality.low', 'clientOptions.gui.graphicsQuality.normal', 'clientOptions.gui.graphicsQuality.high', 'clientOptions.gui.graphicsQuality.highest']);
  }
}

$J.define(ClientOptions, 'net.sf.freecol.client.ClientOptions', { kind: 'class', sup: 'net.sf.freecol.common.option.OptionGroup', ctors: { '': '_ClientOptions' }, returns: { 'getXMLTagName': 'java.lang.String', 'isTerrainAnimationsEnabled': 'boolean', 'isRiverAnimationEnabled': 'boolean', 'getColonyComparator': 'java.util.Comparator', 'getDisplayTileText': 'int', 'getActiveMods': 'java.util.List' }, meths: { 'addOptionGroup(java.lang.String,java.lang.String)': 'addOptionGroup$String$String$ClientOptions', 'merge(net.sf.freecol.common.io.FreeColSavegameFile)': 'merge$FreeColSavegameFile', 'merge(java.io.File)': 'merge$File', 'load(net.sf.freecol.common.io.FreeColSavegameFile)': 'load$FreeColSavegameFile$ClientOptions' }, clinit: true, lazy: ['logger', 'specialKeys', 'colonyAgeComparator', 'colonyNameComparator', 'colonySizeComparator', 'colonySoLComparator', 'colonyPositionComparator', 'friendlyMoveAnimationSpeeds', 'graphicsQualityChoices'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColModFile = $J.load('net.sf.freecol.common.io.FreeColModFile');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  Location = $J.load('net.sf.freecol.common.model.Location');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  BooleanOption = $J.load('net.sf.freecol.common.option.BooleanOption');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  PercentageOption = $J.load('net.sf.freecol.common.option.PercentageOption');
  RangeOption = $J.load('net.sf.freecol.common.option.RangeOption');
  TextOption = $J.load('net.sf.freecol.common.option.TextOption');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
});
