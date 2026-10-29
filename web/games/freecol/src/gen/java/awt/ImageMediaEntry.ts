// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/MediaTracker.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { MediaEntry } from './MediaEntry.ts';

let ImageObserver;

/**
 * The entry of the list of {@code Images} that is being tracked by the
 * {@code MediaTracker}.
 */
export class ImageMediaEntry extends MediaEntry {
  image: Image = null;
  width_: number = 0;
  height_: number = 0;
  _ImageMediaEntry(mt: MediaTracker, img: Image, c: number, w: number, h: number): this {
    this._MediaEntry(mt, c);
    this.image = img;
    this.width_ = w;
    this.height_ = h;
    return this;
  }
  getMedia(): any {
    return this.image;
  }
  getStatus(doLoad: boolean, doVerify: boolean): number {
    if (doVerify) {
      let flags = this.tracker.target.checkImage$Image$int$int$ImageObserver(this.image, this.width_, this.height_, null);
      let s = this.parseflags(flags);
      if (s === 0) {
        if ((this.status_ & (MediaEntry.ERRORED | MediaEntry.COMPLETE)) !== 0) {
          this.setStatus(MediaEntry.ABORTED);
        }
      } else if (s !== this.status_) {
        this.setStatus(s);
      }
    }
    return super.getStatus(doLoad, doVerify);
  }
  startLoad(): void {
    if (this.tracker.target.prepareImage$Image$int$int$ImageObserver(this.image, this.width_, this.height_, this)) {
      this.setStatus(MediaEntry.COMPLETE);
    }
  }
  parseflags(infoflags: number): number {
    if ((infoflags & ImageObserver.ERROR) !== 0) {
      return MediaEntry.ERRORED;
    } else if ((infoflags & ImageObserver.ABORT) !== 0) {
      return MediaEntry.ABORTED;
    } else if ((infoflags & (ImageObserver.ALLBITS | ImageObserver.FRAMEBITS)) !== 0) {
      return MediaEntry.COMPLETE;
    }
    return 0;
  }
}

$J.define(ImageMediaEntry, 'java.awt.ImageMediaEntry', { kind: 'class', ifaces: ['java.awt.image.ImageObserver', 'java.io.Serializable'], sup: 'java.awt.MediaEntry', ctors: { 'java.awt.MediaTracker,java.awt.Image,int,int,int': '_ImageMediaEntry' } });
$J.module(() => {
  ImageObserver = $J.load('java.awt.image.ImageObserver');
});
