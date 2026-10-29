// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/FAFile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, BufferedReader, HashMap, InputStream, InputStreamReader, JObject, JString, Logger, RuntimeException, StandardCharsets, StringBuilder, StringTokenizer } from '../../../../../../jre/index.ts';

let Dimension, Point;

/**
 * Represents the data within a Font Animation File.
 *
 * @see net.sf.freecol.client.gui.panel.DeclarationPanel
 */
export class FAFile extends JObject {
  static logger: Logger = null;
  letters: HashMap<any, any> = null;
  maxHeight_: number = 0;
  /**
   * Reads data from the given {@code InputStream} and
   * creates an object to represent this data.
   *
   * @param is The {@code InputStream}
   * @throws IOException gets thrown if the data is invalid.
   */
  _FAFile(is$: InputStream): this {
    this.letters = new HashMap();
    this.maxHeight_ = 0;
    this.load(new FAFile$CREatingInputStream()._FAFile$CREatingInputStream(is$));
    return this;
  }
  /**
   * Returns the input with invalid characters removed.
   * @param text The input text.
   * @return The input with invalid characters removed.
   */
  onlyValidCharacters(text: string): string {
    let sb = new StringBuilder();
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      let fl = this.getLetter(c);
      if (fl == null) {
        FAFile.logger.warning('Missing character in FAF: ' + String.fromCharCode(c));
        continue;
      }
      sb.append(String.fromCharCode(c));
    }
    return sb.toString();
  }
  /**
   * Gets the {@code Dimension} of the given
   * {@code String} when rendered.
   *
   * @param text The {@code String}.
   * @return The {@code Dimension}.
   */
  getDimension(text: string): Dimension {
    let fn = this.getFAName(text);
    if (fn != null) {
      return new Dimension()._Dimension$int$int(fn.width_, fn.height_);
    }
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      let fl = this.getLetter(text.charCodeAt(i));
      width = (width + fl.advance_) | 0;
    }
    let firstMinX = 2147483647;
    let letter = this.getLetter(text.charCodeAt(0));
    for (let i = 0; i < letter.points.length; i++) {
      let p = letter.points[i];
      if (p.x_ < firstMinX) {
        firstMinX = p.x_;
      }
    }
    width = (width + firstMinX) | 0;
    let lastMaxX = 0;
    letter = this.getLetter(text.charCodeAt((text.length - 1) | 0));
    for (let i = 0; i < letter.points.length; i++) {
      let p = letter.points[i];
      if (p.x_ > lastMaxX) {
        lastMaxX = p.x_;
      }
    }
    width = (width + lastMaxX) | 0;
    return new Dimension()._Dimension$int$int(width, this.maxHeight_);
  }
  /**
   * Gets the points to display the given text as an
   * animation.
   *
   * @param text The text to get the points for.
   * @return The points in the order in which they 
   *      should be drawn.
   */
  getPoints(text: string): Point[] {
    let fn = this.getFAName(text);
    if (fn != null) {
      return fn.points;
    }
    let points = new ArrayList();
    let x = 0;
    for (let i = 0; i < text.length; i++) {
      let fl = this.getLetter(text.charCodeAt(i));
      for (let j = 0; j < fl.points.length; j++) {
        let p = fl.points[j];
        points.add(new Point()._Point$int$int((p.x_ + x) | 0, p.y_));
      }
      x = (x + fl.advance_) | 0;
    }
    return $J.toArrayInto(points.toArray(), $J.newArray(0, null));
  }
  load(is$: InputStream): void {
    this.letters.clear();
    let in$ = new BufferedReader(new InputStreamReader(is$, StandardCharsets.UTF_8));
    let line = in$.readLine();
    if (line == null || !line.startsWith('FontAnimationFile')) {
      throw new RuntimeException('Not a FAF: ' + $J.str(this));
    }
    line = in$.readLine();
    if (line == null) {
      throw new RuntimeException('Max height expected: ' + $J.str(this));
    }
    let st = new StringTokenizer(line);
    this.maxHeight_ = $J.parseInt(st.nextToken());
    line = in$.readLine();
    while (line != null && !line.startsWith('[Chars]')) {
      let name = line;
      if ((line = in$.readLine()) == null) {
        break;
      }
      st = new StringTokenizer(line);
      let width = $J.parseInt(st.nextToken());
      let height = $J.parseInt(st.nextToken());
      let numberOfPoints = $J.parseInt(st.nextToken());
      let xs = $J.newArray(numberOfPoints, 0);
      let ys = $J.newArray(numberOfPoints, 0);
      if ((line = in$.readLine()) == null) {
        break;
      }
      st = new StringTokenizer(line);
      for (let i = 0; i < numberOfPoints; i++) {
        xs[i] = $J.parseInt(st.nextToken());
      }
      if ((line = in$.readLine()) == null) {
        break;
      }
      st = new StringTokenizer(line);
      for (let i = 0; i < numberOfPoints; i++) {
        ys[i] = $J.parseInt(st.nextToken());
      }
      let newLetter = new FAFile$FAName()._FAFile$FAName();
      newLetter.width_ = width;
      newLetter.height_ = height;
      newLetter.points = $J.newArray(numberOfPoints, null);
      for (let i = 0; i < numberOfPoints; i++) {
        newLetter.points[i] = new Point()._Point$int$int(xs[i], ys[i]);
      }
      this.letters.put(name, newLetter);
      line = in$.readLine();
    }
    line = in$.readLine();
    while (line != null) {
      st = new StringTokenizer(line.substring(1));
      let letter = line.charCodeAt(0);
      let advance = $J.parseInt(st.nextToken());
      let numberOfPoints = $J.parseInt(st.nextToken());
      let xs = $J.newArray(numberOfPoints, 0);
      let ys = $J.newArray(numberOfPoints, 0);
      if ((line = in$.readLine()) == null) {
        break;
      }
      st = new StringTokenizer(line);
      for (let i = 0; i < numberOfPoints; i++) {
        xs[i] = $J.parseInt(st.nextToken());
      }
      if ((line = in$.readLine()) == null) {
        break;
      }
      st = new StringTokenizer(line);
      for (let i = 0; i < numberOfPoints; i++) {
        ys[i] = $J.parseInt(st.nextToken());
      }
      let newLetter = new FAFile$FALetter()._FAFile$FALetter();
      newLetter.advance_ = advance;
      newLetter.points = $J.newArray(numberOfPoints, null);
      for (let i = 0; i < numberOfPoints; i++) {
        newLetter.points[i] = new Point()._Point$int$int(xs[i], ys[i]);
      }
      this.letters.put(letter, newLetter);
      line = in$.readLine();
    }
  }
  getLetter(letter: number): FAFile$FALetter {
    return this.letters.get(letter);
  }
  getFAName(name: string): FAFile$FAName {
    return this.letters.get(name);
  }
  static $clinit() {
    FAFile.logger = Logger.getLogger($J.cls(FAFile).getName());
  }
}

export class FAFile$FALetter extends JObject {
  points: Point[] = null;
  advance_: number = 0;
  _FAFile$FALetter(): this {
    return this;
  }
}

export class FAFile$FAName extends JObject {
  points: Point[] = null;
  width_: number = 0;
  height_: number = 0;
  _FAFile$FAName(): this {
    return this;
  }
}

/**
 * This utility class removes all CR:s from an {@link InputStream}.
 * It is not particularly efficient and is intended as a temporary
 * workaround.
 */
export class FAFile$CREatingInputStream extends InputStream {
  in: InputStream = null;
  /**
   * Constructor.
   *
   * @param in The input stream to wrap.
   */
  _FAFile$CREatingInputStream(in$: InputStream): this {
    this._InputStream();
    this.in = in$;
    return this;
  }
  /**
   * Read a character, override to eat all CR:s.
   *
   * @return next character or -1 on end of file.
   * @throws IOException if wrapped stream throws it.
   */
  read$(): number {
    let c: number;
    do {
      c = this.in.read();
    } while (c === 13 /* \u000d */);
    return c;
  }
  read(...a: any[]): any {
    if (a.length === 0) return this.read$(...a);
    return super.read(...a);
  }
}

$J.define(FAFile, 'net.sf.freecol.common.resources.FAFile', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.io.InputStream': '_FAFile' }, clinit: true, lazy: ['logger'] });
$J.define(FAFile$FALetter, 'net.sf.freecol.common.resources.FAFile$FALetter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FAFile$FALetter' } });
$J.define(FAFile$FAName, 'net.sf.freecol.common.resources.FAFile$FAName', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FAFile$FAName' } });
$J.define(FAFile$CREatingInputStream, 'net.sf.freecol.common.resources.FAFile$CREatingInputStream', { kind: 'class', sup: 'java.io.InputStream', ctors: { 'java.io.InputStream': '_FAFile$CREatingInputStream' }, meths: { 'read()': 'read$' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
});
