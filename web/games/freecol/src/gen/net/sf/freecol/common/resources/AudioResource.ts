// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/AudioResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, File, JString, Random } from '../../../../../../jre/index.ts';
import { Resource } from './Resource.ts';

let SoundPlayer;

/**
 * A {@code Resource} wrapping a {@code File} containing sounds.
 *
 * @see Resource
 */
export class AudioResource extends Resource {
  files: List<File> = null;
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this
   *      resource.
   * @exception IOException if the URI does not point to recognizable audio.
   */
  _AudioResource(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    this.files = new ArrayList();
    let file = new File(resourceLocator);
    if (!file.isDirectory()) {
      {
        const ais = SoundPlayer.getAudioInputStream(file);
        try {
          this.files.add(file);
        } finally {
          if (ais != null) ais.close();
        }
      }
    } else {
      let candidateFiles = file.listFiles($J.lambdaObj((dir, name) => name.endsWith('.ogg') || name.endsWith('.wav'), 'accept', 'java.io.FilenameFilter'));
      for (let f of candidateFiles) {
        {
          const ais = SoundPlayer.getAudioInputStream(f);
          try {
            this.files.add(f);
          } finally {
            if (ais != null) ais.close();
          }
        }
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
   * Gets the file represented by this resource.
   *
   * @return The {@code File} for this resource.
   */
  getAudio(): File {
    if (this.files.isEmpty()) {
      return null;
    }
    return this.files.get(new Random().nextInt(this.files.size()));
  }
  getAllAudio(): List<File> {
    return this.files;
  }
}

$J.define(AudioResource, 'net.sf.freecol.common.resources.AudioResource', { kind: 'class', sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_AudioResource' }, returns: { 'getAllAudio': 'java.util.List', 'getAudio': 'java.io.File' } });
$J.module(() => {
  SoundPlayer = $J.load('net.sf.freecol.common.sound.SoundPlayer');
});
