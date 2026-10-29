// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/LogBuilder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JClass, JObject, JString, StringBuilder } from '../../../../../../jre/index.ts';

let FreeColDebugger, Location;

/**
 * A class to wrap a StringBuilder for log generation purposes.
 */
export class LogBuilder extends JObject {
  /**
   * The string builder to use.
   */
  sb: StringBuilder = null;
  /**
   * The remembered buffer index.
   */
  points: List<number> = null;
  /**
   * Create a new LogBuilder that can only be used as a buffer.
   *
   * @param size An initial size for the buffer.
   */
  _LogBuilder(size: number): this {
    this.points = new ArrayList();
    this.sb = (size <= 0) ? null : new StringBuilder(size);
    return this;
  }
  /**
   * Convert a simple object to a string suitable for a log buffer.
   *
   * @param o The {@code Object} to convert.
   * @return The simple string result.
   */
  static o2s(o: any): string {
    return (o == null) ? 'null' : ($J.isa(o, JClass)) ? (o).getName() : ($J.isa(o, JString)) ? o : ($J.isa(o, Location)) ? (o).toShortString() : $J.str(o);
  }
  /**
   * Add objects to a string builder.
   *
   * @param sb The {@code StringBuilder} to add to.
   * @param objects The objects to add.
   */
  static addInternal(sb: StringBuilder, objects: any[]): void {
    for (let o of objects) {
      if (Array.isArray(o)) {
        for (let o2 of o) {
          sb.append(LogBuilder.o2s(o2));
        }
      } else {
        sb.append(LogBuilder.o2s(o));
      }
    }
  }
  /**
   * Add objects to the buffer.
   *
   * @param objects The objects to add.
   */
  add(objects: any[]): void {
    if (this.sb != null) {
      LogBuilder.addInternal(this.sb, objects);
    }
  }
  /**
   * Add a delimited collection to the buffer.
   *
   * @param <T> The collection member type.
   * @param delim An internal delimiter.
   * @param c The {@code Collection} of objects to add.
   */
  addCollection<T>(delim: string, c: Collection<T>): void {
    if (this.sb != null) {
      for (const $it0 = c.iterator(); $it0.hasNext(); ) {
        let t = $it0.next();
        LogBuilder.addInternal(this.sb, [t, delim]);
      }
      if (!c.isEmpty()) {
        this.shrink(delim);
      }
    }
  }
  /**
   * Add a stack trace to the buffer.
   */
  addStackTrace(): void {
    if (this.sb != null) {
      FreeColDebugger.addStackTrace$LogBuilder(this);
    }
  }
  /**
   * Truncate the buffer to a given size.
   *
   * @param size The size to truncate to.
   */
  truncate(size: number): void {
    if (this.sb != null && this.sb.length() > size) {
      this.sb.setLength(size);
    }
  }
  /**
   * Remember a position in a buffer.
   */
  mark(): void {
    if (this.sb != null) {
      this.points.add(0, this.sb.length());
    }
  }
  /**
   * Check if a buffer has grown since marked, and optionally insert
   * text at that point.
   *
   * @param objects Optional {@code Object}s to insert if the buffer has
   *     grown.
   * @return True if the buffer grew (before inserting).
   */
  grew(objects: any[]): boolean {
    if (this.sb == null) {
      return false;
    }
    let p = this.points.removeAt(0);
    if (this.sb.length() <= p) {
      return false;
    }
    let sb2 = new StringBuilder(64);
    LogBuilder.addInternal(sb2, objects);
    this.sb.insert(p, sb2.toString());
    return true;
  }
  /**
   * Shorten a buffer by a trailing delimiter.
   *
   * (Cheats, does not really check that the delimiter is there)
   *
   * @param delim The delimiter to remove.
   */
  shrink(delim: string): void {
    if (this.sb != null && delim != null) {
      let dlen = delim.length;
      let idx = (this.sb.length() - dlen) | 0;
      if (idx >= 0 && $J.equals(this.sb.substring(idx), delim)) {
        this.sb.setLength((this.sb.length() - dlen) | 0);
      }
    }
  }
  /**
   * Output to a logger.
   *
   * @param logger The {@code Logger} to write to.
   * @param level The logging {@code Level}.
   */
  log(logger: Logger, level: Level): void {
    if (this.sb != null && logger != null && level != null && logger.isLoggable(level)) {
      logger.log(level, this.toString());
    }
  }
  /**
   * Get the amount of accumulated data.
   *
   * @return The amount of data accumulated so far.
   */
  size(): number {
    return (this.sb == null) ? 0 : this.sb.length();
  }
  /**
   * Add a group of objects to the buffer at a particular width
   *
   * @param size The width to set.
   * @param objects The {@code Object}s to add.
   * @return The widened string.
   */
  static wide(size: number, objects: any[]): string {
    if (size === 0) {
      return '';
    }
    let left = size > 0;
    if (!left) {
      size = -size;
    }
    let s2 = new StringBuilder(size);
    LogBuilder.addInternal(s2, objects);
    let delta = (size - s2.length()) | 0;
    if (left) {
      for (; delta > 0; delta--) {
        s2.append(String.fromCharCode(32 /* ' ' */));
      }
    } else {
      for (; delta > 0; delta--) {
        s2.insert(0, ' ');
      }
    }
    if (delta < 0) {
      s2.setLength(size);
    }
    return s2.toString();
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return (this.sb == null) ? '' : this.sb.toString();
  }
}

$J.define(LogBuilder, 'net.sf.freecol.common.util.LogBuilder', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_LogBuilder' } });
$J.module(() => {
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Location = $J.load('net.sf.freecol.common.model.Location');
});
