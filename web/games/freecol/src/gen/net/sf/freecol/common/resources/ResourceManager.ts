// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/ResourceManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, InterruptedException, JObject, JString, Logger, Thread } from '../../../../../../jre/index.ts';

let SwingUtilities, FreeCol, ColorResource, FontResource, PropertyList, ResourceMapping, StringResource, CollectionUtils, StringUtils;

/**
 * Class for getting resources (images, audio etc).
 */
export class ResourceManager extends JObject {
  static logger: Logger = null;
  /**
   * The thread that handles preloading of resources.
   */
  static preloadThread: Thread = null;
  /**
   * Flag to inform the preload thead that all mappings are queued.
   */
  static preloadDone: boolean = false;
  /**
   * All the mappings are merged in order into this single ResourceMapping.
   */
  static mergedContainer: ResourceMapping = null;
  static baseDataFile: FreeColDataFile = null;
  static baseResourceMapping: ResourceMapping = null;
  static tcDataFile: FreeColDataFile = null;
  static tcResourceMapping: ResourceMapping = null;
  static mods: List<FreeColDataFile> = null;
  static modResourceMappings: List<ResourceMapping> = null;
  static savegameFile: FreeColSavegameFile = null;
  static savegameResourceMapping: ResourceMapping = null;
  _ResourceManager(): this {
    return this;
  }
  static setBaseData(baseDataFile: FreeColDataFile): void {
    ResourceManager.baseDataFile = baseDataFile;
    ResourceManager.baseResourceMapping = baseDataFile.getResourceMapping();
  }
  static setTcData(tcDataFile: FreeColDataFile): void {
    ResourceManager.tcDataFile = tcDataFile;
    ResourceManager.tcResourceMapping = (tcDataFile != null) ? tcDataFile.getResourceMapping() : new ResourceMapping()._ResourceMapping();
    ResourceManager.prepare();
  }
  static setMods<T>(mods: List<T>): void {
    ResourceManager.mods = mods;
    ResourceManager.modResourceMappings = mods.stream().map(($p0) => $p0.getResourceMapping()).collect(Collectors.toList());
    ResourceManager.prepare();
  }
  static setSavegameFile(savegameFile: FreeColSavegameFile): void {
    ResourceManager.savegameFile = savegameFile;
    ResourceManager.savegameResourceMapping = (savegameFile != null) ? savegameFile.getResourceMapping() : new ResourceMapping()._ResourceMapping();
    ResourceManager.prepare();
  }
  static prepare(): void {
    ResourceManager.finishPreloading();
    let newMergedContainer = new ResourceMapping()._ResourceMapping();
    newMergedContainer.addAll(ResourceManager.baseResourceMapping);
    newMergedContainer.addAll(ResourceManager.tcResourceMapping);
    for (const $it0 = ResourceManager.modResourceMappings.iterator(); $it0.hasNext(); ) {
      let modResourceMapping = $it0.next();
      newMergedContainer.addAll(modResourceMapping);
    }
    newMergedContainer.addAll(ResourceManager.savegameResourceMapping);
    ResourceManager.waitForPreloadingToStop();
    ResourceManager.mergedContainer = newMergedContainer;
  }
  /**
   * Clear all caches and
   */
  static reload(): void {
    ResourceManager.baseResourceMapping = ResourceManager.baseDataFile.getResourceMapping();
    ResourceManager.tcResourceMapping = (ResourceManager.tcDataFile != null) ? ResourceManager.tcDataFile.getResourceMapping() : new ResourceMapping()._ResourceMapping();
    ResourceManager.modResourceMappings = ResourceManager.mods.stream().map(($p0) => $p0.getResourceMapping()).collect(Collectors.toList());
    ResourceManager.savegameResourceMapping = (ResourceManager.savegameFile != null) ? ResourceManager.savegameFile.getResourceMapping() : new ResourceMapping()._ResourceMapping();
    ResourceManager.prepare();
  }
  static waitForPreloadingToStop(): void {
    try {
      while (ResourceManager.preloadThread != null) {
        Thread.sleep(10);
      }
    } catch ($e1) {
      if ($J.isa($e1, InterruptedException)) {
        let e = $J.exc($e1);
        ResourceManager.logger.warning(e.getMessage());
      } else {
        throw $e1;
      }
    }
  }
  /**
   * Create and start a new background preload thread.
   *
   * Synchronization protects preloadThread.  The thread is the only place
   * mergedContainer is written.
   *
   * @param afterPreloadHasCompleted A {@code Runnable} to run when it says.
   */
  static startPreloading(afterPreloadHasCompleted: Runnable): void {
    if (FreeCol.getHeadless()) {
      return;
    }
    if (ResourceManager.preloadThread != null) {
      return;
    }
    ResourceManager.preloadDone = false;
    ResourceManager.preloadThread = new (ResourceManager$1())().$c(afterPreloadHasCompleted)._Thread(FreeCol.CLIENT_THREAD + '-Resource loader');
    ResourceManager.preloadThread.start();
  }
  /**
   * Signal to the preload thread that no further mappings need to
   * be loaded.
   */
  static finishPreloading(): void {
    ResourceManager.preloadDone = true;
  }
  /**
   * Get an audio resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getAudioResource(key: string, warn: boolean): AudioResource {
    let r = ResourceManager.mergedContainer.getAudioResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getAudioResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Get a color resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getColorResource(key: string, warn: boolean): ColorResource {
    let r = ResourceManager.mergedContainer.getColorResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getColorResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Get a FAFile resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getFAFileResource(key: string, warn: boolean): FAFileResource {
    let r = ResourceManager.mergedContainer.getFAFileResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getFAFileResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Get a font resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getFontResource(key: string, warn: boolean): FontResource {
    let r = ResourceManager.mergedContainer.getFontResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getFontResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Get an image resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getImageResource(key: string, warn: boolean): ImageResource {
    let r = ResourceManager.mergedContainer.getImageResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getImageResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Get a string resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getStringResource(key: string, warn: boolean): StringResource {
    let r = ResourceManager.mergedContainer.getStringResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getStringResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Get a SZA resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getSZAResource(key: string, warn: boolean): SZAResource {
    let r = ResourceManager.mergedContainer.getSZAResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getSZAResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Get a video resource.
   *
   * @param key The resource to get.
   * @param warn Log a warning if the resource is not found.
   * @return The resource if there is one with the given
   *     resource key and type, or else {@code null}.
   */
  static getVideoResource(key: string, warn: boolean): VideoResource {
    let r = ResourceManager.mergedContainer.getVideoResource(key);
    if (warn && r == null) {
      ResourceManager.logger.warning('getVideoResource(' + key + ') failed');
    }
    return r;
  }
  /**
   * Gets an audio resource with the given name.
   * This can return null as there as not all necessary sounds have
   * been added to the game.
   * FIXME: Change calling code to check using hasResource, then
   *        replace null return with calling FreeColClient.fatal on error.
   *
   * @param key The name of the resource to query.
   * @return A {@code File} containing the audio data.
   */
  static getAudio(key: string): File {
    let r = ResourceManager.getAudioResource(key, true);
    return (r == null) ? null : r.getAudio();
  }
  /**
   * Gets a color resource with the given name.
   *
   * @param key The name of the resource to query.
   * @param replacement A fallback color.
   * @return The {@code Color} found, or if not found, the replacement color,
   *     or finally the generic replacement color.
   */
  static getColor(key: string, replacement: Color): Color {
    let r = ResourceManager.getColorResource(key, true);
    return (r != null) ? r.getColor() : (replacement != null) ? replacement : ColorResource.REPLACEMENT_COLOR;
  }
  /**
   * Gets a FAFile resource with the given name.
   * This can return null as there is only one FAFile in FreeCol.
   * FIXME: Consider calling FreeColClient.fatal on error.
   *
   * @param key The name of the resource to query.
   * @return The {@code FAFile} found in a FAFileResource.
   */
  static getFAFile(key: string): FAFile {
    let r = ResourceManager.getFAFileResource(key, true);
    return (r == null) ? null : r.getFAFile();
  }
  /**
   * Gets the font with the given name.
   *
   * @param key The name of the resource to query.
   * @return The {@code Font} found in a FontResource, or the default
   *     Java font if not found.
   */
  static getFont(key: string): Font {
    let r = ResourceManager.getFontResource(key, true);
    if (r == null) {
      return FontResource.getEmergencyFont();
    }
    return r.getFont();
  }
  /**
   * Get the image specified by the given key.
   *
   * @param key The name of the resource to return.
   * @return The image identified by {@code resource}.
   */
  static getImage$String(key: string): BufferedImage {
    let ir = ResourceManager.getImageResource(key, true);
    return (ir == null) ? null : ir.getImage$();
  }
  /**
   * Get the image specified by the given name, size and grayscale.
   *
   * @param key The name of the resource to return.
   * @param size The size of the requested image.
   *     Rescaling will be performed if necessary.
   * @param grayscale If true return a grayscale image.
   * @return The image identified by {@code resource}.
   */
  static getImage$String$Dimension$boolean(key: string, size: Dimension, grayscale: boolean): BufferedImage {
    let ir = ResourceManager.getImageResource(key, true);
    return (ir == null) ? null : ir.getImage$Dimension$boolean(size, grayscale);
  }
  /**
   * Get a list of all image keys starting with the given prefix.
   *
   * @param prefix The prefix.
   * @return A list of all image resource keys starting with the prefix.
   */
  static getImageKeys(prefix: string): List<string> {
    return CollectionUtils.transform$Collection$Predicate(ResourceManager.mergedContainer.getImageKeySet(), (k) => k.startsWith(prefix));
  }
  /**
   * Gets a string resource with the given name.
   * Trying to get a nonexisting string is an error, but returns
   * a replacement string to prevent crashes.
   *
   * @param key The name of the resource to query.
   * @return The string value.
   */
  static getString$String(key: string): string {
    let r = ResourceManager.getStringResource(key, true);
    return (r == null) ? StringResource.REPLACEMENT_STRING : r.getString();
  }
  /**
   * Gets a string resource with the given name and builds a
   * {@code PropertyList} from it.
   *
   * @param key The name of the resource to query.
   * @return The string value.
   */
  static getPropertyList(key: string): PropertyList {
    let r = ResourceManager.getStringResource(key, true);
    if (r == null) {
      return new PropertyList()._PropertyList('');
    }
    return new PropertyList()._PropertyList(r.getString());
  }
  /**
   * Gets a string resource with the given name, or returns the default value
   * if the resource could not be found.
   *
   * @param key The name of the resource to query.
   * @param defaultString The default value.
   * @return The string value.
   */
  static getString$String$String(key: string, defaultString: string): string {
    let r = ResourceManager.getStringResource(key, false);
    return (r == null) ? defaultString : r.getString();
  }
  /**
   * Returns the animation specified by the given name.
   *
   * As the artwork is still incomplete and animations exist only for
   * some military units, null can still be returned in many cases.
   * FIXME: Check using hasResource before calling this, then replace
   *        null return with calling FreeColClient.fatal on error.
   *
   * @param key The name of the resource to return.
   * @return The animation identified by {@code resource}
   *      or {@code null} if there is no animation
   *      identified by that name.
   */
  static getSZA$String(key: string): SimpleZippedAnimation {
    let r = ResourceManager.getSZAResource(key, true);
    return (r != null) ? r.getSimpleZippedAnimation$() : null;
  }
  /**
   * Returns the animation specified by the given name.
   *
   * @param key The name of the resource to return.
   * @param scale The size of the requested animation (with 1
   *      being normal size, 2 twice the size, 0.5 half the
   *      size etc). Rescaling will be performed unless using 1.
   * @return The animation identified by {@code resource}
   *      or {@code null} if there is no animation
   *      identified by that name.
   */
  static getSZA$String$float(key: string, scale: number): SimpleZippedAnimation {
    let r = ResourceManager.getSZAResource(key, true);
    return (r != null) ? r.getSimpleZippedAnimation$float(scale) : null;
  }
  /**
   * Gets the {@code Video} represented by the given resource.
   * This can return null as there is only one video in FreeCol.
   * FIXME: Consider calling FreeColClient.fatal on error.
   *
   * @param key The name of the resource to return.
   * @return The {@code Video} in it's original size.
   */
  static getVideo(key: string): Video {
    let r = ResourceManager.getVideoResource(key, true);
    return (r != null) ? r.getVideo() : null;
  }
  /**
   * Summarize the image resources.
   *
   * @param sb A {@code StringBuilder} to summarize to.
   */
  static summarizeImageResources(sb: StringBuilder): void {
    let keys = ResourceManager.mergedContainer.getImageKeySet();
    sb.append('All keys\n').append(StringUtils.join$String$Collection(' ', keys)).append(String.fromCharCode(10 /* \u000a */));
  }
  static $clinit() {
    ResourceManager.logger = Logger.getLogger($J.cls(ResourceManager).getName());
    ResourceManager.preloadThread = null;
    ResourceManager.preloadDone = false;
    ResourceManager.mergedContainer = new ResourceMapping()._ResourceMapping();
    ResourceManager.baseDataFile = null;
    ResourceManager.baseResourceMapping = new ResourceMapping()._ResourceMapping();
    ResourceManager.tcDataFile = null;
    ResourceManager.tcResourceMapping = new ResourceMapping()._ResourceMapping();
    ResourceManager.mods = new ArrayList();
    ResourceManager.modResourceMappings = new ArrayList();
    ResourceManager.savegameFile = null;
    ResourceManager.savegameResourceMapping = new ResourceMapping()._ResourceMapping();
  }
}

let $ResourceManager$1: any = null;
/** An anonymous class (ResourceManager.java:145). */
function ResourceManager$1(): any {
  return $ResourceManager$1 ??= $J.local(class extends Thread {
    /**
     * {@inheritDoc}
     */
    run(): void {
      ResourceManager.logger.info('Preload thread started');
      let n = ResourceManager.mergedContainer.preload(() => !ResourceManager.preloadDone);
      ResourceManager.logger.info('Preload done, ' + n + ' resources.');
      ResourceManager.preloadThread = null;
      SwingUtilities.invokeLater(() => {
        this.$cv_afterPreloadHasCompleted();
      });
    }
    $c($afterPreloadHasCompleted): this {
      this.$cv_afterPreloadHasCompleted = $afterPreloadHasCompleted;
      return this;
    }
  }, 'net.sf.freecol.common.resources.ResourceManager$1', []);
}

$J.define(ResourceManager, 'net.sf.freecol.common.resources.ResourceManager', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ResourceManager' }, meths: { 'getSZA(java.lang.String,float)': 'getSZA$String$float', 'getSZA(java.lang.String)': 'getSZA$String', 'getString(java.lang.String,java.lang.String)': 'getString$String$String', 'getString(java.lang.String)': 'getString$String', 'getImage(java.lang.String,java.awt.Dimension,boolean)': 'getImage$String$Dimension$boolean', 'getImage(java.lang.String)': 'getImage$String' }, clinit: true, lazy: ['logger', 'preloadThread', 'preloadDone', 'mergedContainer', 'baseDataFile', 'baseResourceMapping', 'tcDataFile', 'tcResourceMapping', 'mods', 'modResourceMappings', 'savegameFile', 'savegameResourceMapping'] });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ColorResource = $J.load('net.sf.freecol.common.resources.ColorResource');
  FontResource = $J.load('net.sf.freecol.common.resources.FontResource');
  PropertyList = $J.load('net.sf.freecol.common.resources.PropertyList');
  ResourceMapping = $J.load('net.sf.freecol.common.resources.ResourceMapping');
  StringResource = $J.load('net.sf.freecol.common.resources.StringResource');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
