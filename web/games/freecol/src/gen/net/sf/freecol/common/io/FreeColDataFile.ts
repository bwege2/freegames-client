// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColDataFile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, BufferedInputStream, Collectors, File, FileNotFoundException, FileSystems, Files, IOException, JMap, JObject, JString, JarFile, Level, LinkedHashMap, List, Logger, Pattern, Properties, URI, URISyntaxException } from '../../../../../../jre/index.ts';

let FileFilter, FileNameExtensionFilter, MemoryManager, Messages, FreeColDirectories, ImageResource, ResourceFactory, ResourceMapping, LogBuilder, StringUtils;

/**
 * Support for reading a FreeCol data file. The data file
 * is either a ZIP-file or a directory containing certain files.
 */
export class FreeColDataFile extends JObject {
  static logger: Logger = null;
  static readonly ZIP_FILE_EXTENSION: string = 'zip';
  /**
   * A fake URI scheme for resources delegating to other resources.
   */
  static readonly resourceScheme: string = 'resource:';
  /**
   * The file this object represents.
   */
  file: File = null;
  /**
   * A prefix string for the jar-entries (only if {@link #file} is
   * a ZIP-file).
   */
  jarDirectory: string = null;
  /**
   * Opens the given file for reading.
   *
   * @param file The file to be read.
   * @exception IOException if the file does not exist.
   */
  _FreeColDataFile(file: File): this {
    if (!file.exists()) {
      throw new IOException('File ' + file.getName() + ' does not exist');
    }
    this.file = file;
    this.jarDirectory = (file.isDirectory()) ? null : FreeColDataFile.findJarDirectory(file);
    return this;
  }
  /**
   * Finds the directory within the zip-file in case the data file
   * has been renamed.
   *
   * @param file The zip-file.
   * @return The name of the base directory in the zip-file or null on error.
   */
  static findJarDirectory(file: File): string {
    {
      try {
        const jf = new JarFile(file);
        try {
          let entry = jf.entries().nextElement();
          let en = entry.getName();
          let index = en.lastIndexOf(String.fromCharCode(47 /* \u002f */));
          let name = '';
          if (index > 0) {
            name = en.substring(0, (index + 1) | 0);
          }
          return name;
        } finally {
          if (jf != null) jf.close();
        }
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let ioe = $J.exc($e0);
          FreeColDataFile.logger.warning('Failed to create jar file: ' + file.getName());
        } else {
          throw $e0;
        }
      }
    }
    return null;
  }
  /**
   * Get a URI to access a resource through.
   *
   * @param name A name with special prefixes to convert to the URI.
   * @return A {@code URI}, or null if none found.
   */
  getURI(name: string): URI {
    try {
      if (name.startsWith('urn:')) {
        try {
          return new URI(name);
        } catch ($e1) {
          if ($J.isa($e1, URISyntaxException)) {
            let e = $J.exc($e1);
            FreeColDataFile.logger.log(Level.WARNING, 'Resource creation failure with: ' + name, e);
            return null;
          } else {
            throw $e1;
          }
        }
      } else if (this.file.isDirectory()) {
        return new File(this.file, name).toURI();
      } else {
        return new URI('jar:file', $J.str(this.file) + '!/' + this.jarDirectory + name, null);
      }
    } catch ($e2) {
      if ($J.isa($e2, URISyntaxException)) {
        let e = $J.exc($e2);
        FreeColDataFile.logger.log(Level.WARNING, 'Failed to lookup: ' + $J.str(this.file) + '/' + name, e);
        return null;
      } else {
        throw $e2;
      }
    }
  }
  /**
   * Gets an input stream for the specified resource.
   *
   * @param filename The filename of a resource within this
   *     collection of data.  If this object represents a directory
   *     then the provided filename should be relative towards the
   *     path of the directory.  In case of a compressed archive it
   *     should be the path within the archive.
   * @return An {@code InputStream} to read the resource with.
   * @exception IOException if an error occurs
   */
  getInputStream(filename: string): BufferedInputStream {
    let connection = this.getURI(filename).toURL().openConnection();
    connection.setDefaultUseCaches(false);
    return new BufferedInputStream(connection.getInputStream());
  }
  /**
   * Creates a {@code ResourceMapping} from the available resource files.
   *
   * @return A {@code ResourceMapping} or {@code null}
   *     there is no resource mapping file.
   */
  getResourceMapping(): ResourceMapping {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['Resource mappings:']);
    lb.mark();
    let properties = this.readResourcesProperties(lb);
    if (properties == null) {
      return null;
    }
    let rc = new ResourceMapping()._ResourceMapping();
    let virtualResources = this.handleResources(properties, rc);
    this.handleVirtualResources(virtualResources, lb, properties, rc);
    if (lb.grew([])) {
      lb.log(FreeColDataFile.logger, Level.FINE);
    }
    return rc;
  }
  /**
   * Handles loading of all resources defined in {@code properties}.
   *
   * This method also handles alternate variations and sizes.
   *  
   * @param properties The resources to be loaded.
   * @param rc The output object where resolved resources should be placed.
   * @return A list of keys that are virtual resources, that is a link to
   *      another resource. Virtual resources are used by mods when the
   *      author wants to reuse graphics that are defined in other FreeCol
   *      data files.
   */
  handleResources(properties: Properties, rc: ResourceMapping): List<string> {
    let resourceFactory = new ResourceFactory()._ResourceFactory();
    let virtualResources = new ArrayList();
    let pn = properties.propertyNames();
    while (pn.hasMoreElements()) {
      let key = pn.nextElement();
      let updatedKey = this.stripEnding(key, '.r0');
      let value = properties.getProperty(key);
      if (value.startsWith(FreeColDataFile.resourceScheme)) {
        virtualResources.add(updatedKey);
      } else {
        this.handleNormalResource(resourceFactory, rc, key, value);
      }
    }
    return virtualResources;
  }
  handleNormalResource(resourceFactory: ResourceFactory, rc: ResourceMapping, key: string, value: string): void {
    let uri = this.getURI(value);
    if (uri == null) {
      return;
    }
    let cachingKey = uri.toString();
    let resource = resourceFactory.createResource(key, cachingKey, uri);
    let supportsVariations = !key.includes('.improvement.river.');
    if (resource instanceof ImageResource && supportsVariations) {
      let imageResource = resource;
      this.extendWithAdditionalSizesAndVariations(resourceFactory, imageResource, value);
    }
    if (resource != null) {
      rc.add(key, resource);
    }
  }
  handleVirtualResources(virtualResources: List<string>, lb: LogBuilder, properties: Properties, rc: ResourceMapping): void {
    let progress = true;
    let miss = new ArrayList();
    while (progress && !virtualResources.isEmpty()) {
      miss.clear();
      progress = false;
      while (!virtualResources.isEmpty()) {
        let key = virtualResources.removeAt(0);
        let updatedKey = this.stripEnding(key, '.r0');
        let value = properties.getProperty(key).substring(FreeColDataFile.resourceScheme.length);
        if (!rc.duplicateResource(value, updatedKey)) {
          miss.add(key);
        } else {
          progress = true;
        }
      }
      virtualResources.addAll(miss);
    }
    if (!virtualResources.isEmpty()) {
      lb.add([', could not resolve virtual resource/s: ', StringUtils.join$String$Collection(' ', virtualResources)]);
    }
  }
  /**
   * Reads "resources.properties". We support localized versions of this
   * file, so that localized images can be provided.
   *
   * @param lb Just used for logging.
   * @return The read properties, or {@code null} if an error occured while
   *      reading the file(s).
   */
  readResourcesProperties(lb: LogBuilder): Properties {
    let properties = new Properties();
    for (const $it3 = FreeColDirectories.getResourceFileNames().iterator(); $it3.hasNext(); ) {
      let fileName = $it3.next();
      {
        try {
          const is$ = this.getInputStream(fileName);
          try {
            properties.load(is$);
            lb.add([32 /* ' ' */, this.file, 47 /* \u002f */, fileName, ':ok']);
          } finally {
            if (is$ != null) is$.close();
          }
        } catch ($e4) {
          if ($J.isa($e4, FileNotFoundException)) {
            let e = $J.exc($e4);
            lb.add([32 /* ' ' */, this.file, 47 /* \u002f */, fileName, ':not-found']);
          } else if ($J.isa($e4, IOException)) {
            let e = $J.exc($e4);
            FreeColDataFile.logger.log(Level.WARNING, 'ResourceMapping read exception: ' + $J.str(this.file) + '/' + fileName, e);
            return null;
          } else {
            throw $e4;
          }
        }
      }
    }
    return properties;
  }
  stripEnding(key: string, ending: string): string {
    return (key.endsWith(ending)) ? key.substring(0, (key.length - 3) | 0) : key;
  }
  extendWithAdditionalSizesAndVariations(resourceFactory: ResourceFactory, imageResource: ImageResource, value: string): void {
    let variationsWithAlternateSizes = this.findVariationsWithAlternateSizes(value);
    imageResource.addAlternativeResourceLocators(variationsWithAlternateSizes.get(null));
    variationsWithAlternateSizes.entrySet().stream().filter((entry) => entry.getKey() != null).forEach((entry) => {
      let variationResource = resourceFactory.createResource('', imageResource.getCachingKey(), entry.getKey());
      if (variationResource != null) {
        variationResource.addAlternativeResourceLocators(entry.getValue());
        imageResource.addVariation(variationResource);
      }
    });
  }
  findVariationsWithAlternateSizes(name: string): JMap<URI, List<URI>> {
    if (name.indexOf('.') <= 0) {
      return JMap.of();
    }
    let fileSystem = null;
    try {
      let filePath: Path;
      if (this.file.isDirectory()) {
        filePath = new File(this.file, name).toPath();
      } else {
        fileSystem = FileSystems.newFileSystem(new URI('jar:file', this.file.getAbsolutePath(), null), JMap.of());
        filePath = fileSystem.getPath(this.jarDirectory + name);
      }
      let result = new LinkedHashMap();
      if (MemoryManager.isHighQualityGraphicsEnabled()) {
        result.put(null, this.findFilesWithVariationOrAlternativeSizeAsUri(filePath, false));
      } else {
        result.put(null, List.of());
      }
      let variations = this.findFilesWithVariationOrAlternativeSize(filePath, true);
      for (const $it5 = variations.iterator(); $it5.hasNext(); ) {
        let variationPath = $it5.next();
        if (MemoryManager.isHighQualityGraphicsEnabled()) {
          result.put(variationPath.toUri(), this.findFilesWithVariationOrAlternativeSizeAsUri(variationPath, false));
        } else {
          result.put(variationPath.toUri(), List.of());
        }
      }
      return result;
    } catch ($e6) {
      if ($J.isa($e6, IOException) || $J.isa($e6, URISyntaxException)) {
        let e = $J.exc($e6);
        FreeColDataFile.logger.log(Level.WARNING, 'Failed to read directory from jar/zip file: ' + $J.str(this.file) + ' jarDirectory' + this.jarDirectory, e);
        return JMap.of();
      } else {
        throw $e6;
      }
    } finally {
      if (fileSystem != null) {
        try {
          fileSystem.close();
        } catch ($e7) {
          if ($J.isa($e7, IOException)) {
            let e = $J.exc($e7);
          } else {
            throw $e7;
          }
        }
      }
    }
  }
  findFilesWithVariationOrAlternativeSizeAsUri(filePath: Path, findVariation: boolean): List<URI> {
    return this.toUris(this.findFilesWithVariationOrAlternativeSize(filePath, findVariation));
  }
  toUris(paths: List<Path>): List<URI> {
    return paths.stream().map((p) => p.toUri()).collect(Collectors.toList());
  }
  findFilesWithVariationOrAlternativeSize(filePath: Path, findVariation: boolean): List<Path> {
    let variationFileRegex = '[0-9][0-9]?';
    let sizeFileRegex = '\\.size[0-9][0-9]*';
    let regex = (findVariation) ? variationFileRegex : sizeFileRegex;
    let resourceFilename = filePath.getFileName().toString();
    let prefix = resourceFilename.substring(0, resourceFilename.lastIndexOf('.'));
    if (findVariation) {
      prefix = JString.replaceAll(prefix, '[0-9]*$', '');
    }
    let suffix = resourceFilename.substring(resourceFilename.lastIndexOf('.'));
    let completeRegex = Pattern.quote(prefix) + regex + Pattern.quote(suffix);
    {
      const pathStream = Files.list(filePath.getParent());
      try {
        return pathStream.sorted().filter((p) => JString.matches(p.getFileName().toString(), completeRegex) && (!findVariation || !p.equals(filePath))).collect(Collectors.toList());
      } finally {
        if (pathStream != null) pathStream.close();
      }
    }
  }
  /**
   * Get the path to the underlying file.
   *
   * Useful for error messages.
   *
   * @return The path to the file.
   */
  getPath(): string {
    return this.file.getPath();
  }
  /**
   * Get a file filter for a given extension.
   *
   * @param extension The file extension to filter on.
   * @return File filters for the extension.
   */
  static getFileFilter(extension: string): FileFilter {
    let s = Messages.message$String('filter.' + extension);
    if ($J.equals(extension, '*')) {
      return new (FreeColDataFile$1())().$c(s)._FileFilter();
    }
    return new FileNameExtensionFilter()._FileNameExtensionFilter(s, [extension]);
  }
  static $clinit() {
    FreeColDataFile.logger = Logger.getLogger($J.cls(FreeColDataFile).getName());
  }
}

let $FreeColDataFile$1: any = null;
/** An anonymous class (FreeColDataFile.java:442). */
function FreeColDataFile$1(): any {
  return $FreeColDataFile$1 ??= $J.local(class extends FileFilter {
    accept(f: File): boolean {
      return true;
    }
    getDescription(): string {
      return this.$cv_s;
    }
    $c($s): this {
      this.$cv_s = $s;
      return this;
    }
  }, 'net.sf.freecol.common.io.FreeColDataFile$1', []);
}

$J.define(FreeColDataFile, 'net.sf.freecol.common.io.FreeColDataFile', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.io.File': '_FreeColDataFile' }, returns: { 'getPath': 'java.lang.String', 'getResourceMapping': 'net.sf.freecol.common.resources.ResourceMapping' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FileFilter = $J.load('javax.swing.filechooser.FileFilter');
  FileNameExtensionFilter = $J.load('javax.swing.filechooser.FileNameExtensionFilter');
  MemoryManager = $J.load('net.sf.freecol.common.MemoryManager');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  ImageResource = $J.load('net.sf.freecol.common.resources.ImageResource');
  ResourceFactory = $J.load('net.sf.freecol.common.resources.ResourceFactory');
  ResourceMapping = $J.load('net.sf.freecol.common.resources.ResourceMapping');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
