// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/FileUtils.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, ArrayList, Arrays, Exception, Files_FileType, Gdx, GdxRuntimeException, IOException, JObject, JString } from '../../../../jre/index.ts';

let Bundle;

export class FileUtils extends JObject {
  static defaultFileType: Files_FileType = null;
  static defaultPath: string = null;
  _FileUtils(): this {
    return this;
  }
  static setDefaultFileProperties(type$: Files_FileType, path: string): void {
    FileUtils.defaultFileType = type$;
    FileUtils.defaultPath = path;
  }
  static getFileHandle$String(name: string): FileHandle {
    return FileUtils.getFileHandle$FileType$String$String(FileUtils.defaultFileType, FileUtils.defaultPath, name);
  }
  static getFileHandle$FileType$String(type$: Files_FileType, name: string): FileHandle {
    return FileUtils.getFileHandle$FileType$String$String(type$, '', name);
  }
  static getFileHandle$FileType$String$String(type$: Files_FileType, basePath: string, name: string): FileHandle {
    switch (type$) {
      case Files_FileType.Classpath:
        return Gdx.files.classpath(basePath + name);
      case Files_FileType.Internal:
        return Gdx.files.internal(basePath + name);
      case Files_FileType.External:
        return Gdx.files.external(basePath + name);
      case Files_FileType.Absolute:
        return Gdx.files.absolute(basePath + name);
      case Files_FileType.Local:
        return Gdx.files.local(basePath + name);
      default:
        return null;
    }
  }
  static cleanTempFiles$(): boolean {
    return FileUtils.cleanTempFiles$String('');
  }
  static cleanTempFiles$String(dirName: string): boolean {
    let dir = FileUtils.getFileHandle$String(dirName);
    let foundTemp = false;
    for (let file of dir.list()) {
      if (file.isDirectory()) {
        foundTemp = FileUtils.cleanTempFiles$String(dirName + file.name()) || foundTemp;
      } else if (file.length() === 0n) {
        file.delete();
      } else {
        if (file.name().endsWith('.spdtmp')) {
          let temp = file;
          let original = FileUtils.getFileHandle$FileType$String$String(FileUtils.defaultFileType, '', JString.replace(temp.path(), '.spdtmp', ''));
          try {
            FileUtils.bundleFromStream(temp.read());
            try {
              FileUtils.bundleFromStream(original.read());
              if (temp.lastModified() > original.lastModified()) {
                temp.moveTo(original);
              } else {
                temp.delete();
              }
            } catch ($e0) {
              if ($J.isa($e0, Exception)) {
                let e = $J.exc($e0);
                temp.moveTo(original);
              } else {
                throw $e0;
              }
            }
          } catch ($e1) {
            if ($J.isa($e1, Exception)) {
              let e = $J.exc($e1);
              temp.delete();
            } else {
              throw $e1;
            }
          }
          foundTemp = true;
        }
      }
    }
    return foundTemp;
  }
  static fileExists(name: string): boolean {
    let file = FileUtils.getFileHandle$String(name);
    return file.exists() && !file.isDirectory() && file.length() > 0n;
  }
  static fileLength(name: string): bigint {
    let file = FileUtils.getFileHandle$String(name);
    if (!file.exists() || file.isDirectory()) {
      return 0n;
    } else {
      return file.length();
    }
  }
  static deleteFile(name: string): boolean {
    return FileUtils.getFileHandle$String(name).delete();
  }
  static overwriteFile(name: string, bytes: number): void {
    let data = $J.newArray(bytes, 0);
    Arrays.fill(data, ((1) << 24) >> 24);
    FileUtils.getFileHandle$String(name).writeBytes(data, false);
  }
  static dirExists(name: string): boolean {
    let dir = FileUtils.getFileHandle$String(name);
    return dir.exists() && dir.isDirectory();
  }
  static deleteDir(name: string): boolean {
    let dir = FileUtils.getFileHandle$String(name);
    if (dir == null || !dir.isDirectory()) {
      return false;
    } else {
      return dir.deleteDirectory();
    }
  }
  static filesInDir(name: string): ArrayList<string> {
    let dir = FileUtils.getFileHandle$String(name);
    let result = new ArrayList();
    if (dir != null && dir.isDirectory()) {
      for (let file of dir.list()) {
        result.add(file.name());
      }
    }
    return result;
  }
  static bundleFromFile(fileName: string): Bundle {
    try {
      let file = FileUtils.getFileHandle$String(fileName);
      if (!file.exists() || file.isDirectory() || file.length() === 0n) {
        throw new IOException('file does not exist!');
      }
      return FileUtils.bundleFromStream(file.read());
    } catch ($e2) {
      if ($J.isa($e2, GdxRuntimeException)) {
        let e = $J.exc($e2);
        throw new IOException(e);
      } else {
        throw $e2;
      }
    }
  }
  static bundleFromStream(input: InputStream): Bundle {
    let bundle = Bundle.read(input);
    input.close();
    return bundle;
  }
  static bundleToFile(fileName: string, bundle: Bundle): void {
    try {
      let file = FileUtils.getFileHandle$String(fileName);
      if (file.exists()) {
        let temp = FileUtils.getFileHandle$String(fileName + '.spdtmp');
        FileUtils.bundleToStream(temp.write(false), bundle);
        file.delete();
        temp.moveTo(file);
      } else {
        FileUtils.bundleToStream(file.write(false), bundle);
      }
    } catch ($e3) {
      if ($J.isa($e3, GdxRuntimeException)) {
        let e = $J.exc($e3);
        throw new IOException(e);
      } else {
        throw $e3;
      }
    }
  }
  static bundleToStream(output: OutputStream, bundle: Bundle): void {
    Bundle.write$Bundle$OutputStream(bundle, output);
    output.close();
  }
  static $clinit() {
    FileUtils.defaultFileType = null;
    FileUtils.defaultPath = '';
  }
}

$J.define(FileUtils, 'com.watabou.utils.FileUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FileUtils' }, meths: { 'cleanTempFiles(java.lang.String)': 'cleanTempFiles$String', 'cleanTempFiles()': 'cleanTempFiles$', 'getFileHandle(com.badlogic.gdx.Files$FileType,java.lang.String,java.lang.String)': 'getFileHandle$FileType$String$String', 'getFileHandle(com.badlogic.gdx.Files$FileType,java.lang.String)': 'getFileHandle$FileType$String', 'getFileHandle(java.lang.String)': 'getFileHandle$String' }, clinit: true, lazy: ['defaultFileType', 'defaultPath'] });
$J.module(() => {
  Bundle = $J.load('com.watabou.utils.Bundle');
});
