// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/FontResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IOException, JString, Level, Logger } from '../../../../../../jre/index.ts';
import { Resource } from './Resource.ts';

let Font, FontFormatException, GraphicsEnvironment;

/**
 * A {@code Resource} wrapping a {@code Font}.
 *
 * @see Resource
 * @see Font
 */
export class FontResource extends Resource {
  static logger: Logger = null;
  static readonly SCHEME: string = 'font:';
  font: Font = null;
  _FontResource$String$Font(primaryKey: string, font: Font): this {
    this._Resource$String(primaryKey);
    this.font = font;
    return this;
  }
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this
   *     resource.
   * @exception IOException if unable to read the font.
   */
  _FontResource$String$URI(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    this.font = null;
    try {
      if (resourceLocator.getPath() != null && resourceLocator.getPath().endsWith('.ttf')) {
        let url = resourceLocator.toURL();
        this.font = Font.createFont$int$InputStream(Font.TRUETYPE_FONT, url.openStream());
      } else {
        let name = resourceLocator.getSchemeSpecificPart();
        this.font = Font.decode(name.substring(FontResource.SCHEME.length));
      }
      GraphicsEnvironment.getLocalGraphicsEnvironment().registerFont(this.font);
      FontResource.logger.info('Loaded font: ' + this.font.getFontName$() + ' from: ' + $J.str(resourceLocator));
    } catch ($e0) {
      if ($J.isa($e0, FontFormatException) || $J.isa($e0, IOException)) {
        let ex = $J.exc($e0);
        FontResource.logger.log(Level.WARNING, 'Failed loading font from: ' + $J.str(resourceLocator), ex);
        throw new IOException('Font load failed from: ' + $J.str(resourceLocator), ex);
      } else {
        throw $e0;
      }
    }
    return this;
  }
  /**
   * {@inheritDoc}
   */
  preload(): void {
  }
  /**
   * Gets the {@code Font} represented by this resource.  As
   * failure to load a critical font might remove the ability to
   * even display an error message, it is too risky to allow this
   * routine to return null.  Hence the emergency font use.
   *
   * @return The {@code Font} for this resource, or the default
   *     Java font if none found.
   */
  getFont(): Font {
    if (this.font == null) {
      this.font = FontResource.getEmergencyFont();
      FontResource.logger.warning('Font is null');
    }
    return this.font;
  }
  /**
   * Gets a font of last resort, as finding fonts must not fail!
   * Currently using the default Java font, not matter how ugly.
   *
   * @return The default Java font.
   */
  static getEmergencyFont(): Font {
    FontResource.logger.warning('Using emergency font');
    return Font.decode(null);
  }
  static $clinit() {
    FontResource.logger = Logger.getLogger($J.cls(FontResource).getName());
  }
}

$J.define(FontResource, 'net.sf.freecol.common.resources.FontResource', { kind: 'class', sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_FontResource$String$URI', 'java.lang.String,java.awt.Font': '_FontResource$String$Font' }, returns: { 'getFont': 'java.awt.Font' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  FontFormatException = $J.load('java.awt.FontFormatException');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
});
