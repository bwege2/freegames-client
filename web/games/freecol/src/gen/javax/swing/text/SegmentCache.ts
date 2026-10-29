// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/SegmentCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2001, 2008, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, ArrayList, Arrays, JObject } from '../../../../jre/index.ts';
import { Segment } from './Segment.ts';

/**
 * SegmentCache caches <code>Segment</code>s to avoid continually creating
 * and destroying of <code>Segment</code>s. A common use of this class would
 * be:
 * <pre>
 *   Segment segment = segmentCache.getSegment();
 *   // do something with segment
 *   ...
 *   segmentCache.releaseSegment(segment);
 * </pre>
 */
export class SegmentCache extends JObject {
  /**
   * A global cache.
   */
  static sharedCache: SegmentCache = null;
  /**
   * A list of the currently unused Segments.
   */
  segments: List<Segment> = null;
  /**
   * Creates and returns a SegmentCache.
   */
  _SegmentCache(): this {
    this.segments = new ArrayList(11);
    return this;
  }
  /**
   * Returns the shared SegmentCache.
   */
  static getSharedInstance(): SegmentCache {
    return SegmentCache.sharedCache;
  }
  /**
   * A convenience method to get a Segment from the shared
   * <code>SegmentCache</code>.
   */
  static getSharedSegment(): Segment {
    return SegmentCache.getSharedInstance().getSegment();
  }
  /**
   * A convenience method to release a Segment to the shared
   * <code>SegmentCache</code>.
   */
  static releaseSharedSegment(segment: Segment): void {
    SegmentCache.getSharedInstance().releaseSegment(segment);
  }
  /**
   * Returns a <code>Segment</code>. When done, the <code>Segment</code>
   * should be recycled by invoking <code>releaseSegment</code>.
   */
  getSegment(): Segment {
    {
      let size = this.segments.size();
      if (size > 0) {
        return this.segments.removeAt((size - 1) | 0);
      }
    }
    return new SegmentCache$CachedSegment()._SegmentCache$CachedSegment();
  }
  /**
   * Releases a Segment. You should not use a Segment after you release it,
   * and you should NEVER release the same Segment more than once, eg:
   * <pre>
   *   segmentCache.releaseSegment(segment);
   *   segmentCache.releaseSegment(segment);
   * </pre>
   * Will likely result in very bad things happening!
   */
  releaseSegment(segment: Segment): void {
    if (segment instanceof SegmentCache$CachedSegment) {
      {
        if (segment.copy_) {
          Arrays.fill(segment.array, 0 /* \u0000 */);
        }
        segment.array = null;
        segment.copy_ = false;
        segment.count_ = 0;
        this.segments.add(segment);
      }
    }
  }
  static $clinit() {
    SegmentCache.sharedCache = new SegmentCache()._SegmentCache();
  }
}

/**
 * CachedSegment is used as a tagging interface to determine if
 * a Segment can successfully be shared.
 */
export class SegmentCache$CachedSegment extends Segment {
  _SegmentCache$CachedSegment(): this {
    this._Segment$();
    return this;
  }
}

$J.define(SegmentCache, 'javax.swing.text.SegmentCache', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_SegmentCache' }, clinit: true, lazy: ['sharedCache'] });
$J.define(SegmentCache$CachedSegment, 'javax.swing.text.SegmentCache$CachedSegment', { kind: 'class', sup: 'javax.swing.text.Segment', ctors: { '': '_SegmentCache$CachedSegment' } });
