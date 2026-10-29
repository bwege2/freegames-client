// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/Beans.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Exception, Hashtable, JObject, URL, Vector } from '../../../jre/index.ts';

let Image;

/**
 * Package private support class.  This provides a default AppletContext
 * for beans which are applets.
 */
export class BeansAppletContext extends JObject {
  target: Applet = null;
  imageCache: Hashtable<URL, any> = null;
  _BeansAppletContext(target: Applet): this {
    this.imageCache = new Hashtable();
    this.target = target;
    return this;
  }
  getAudioClip(url: URL): AudioClip {
    try {
      return url.getContent();
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let ex = $J.exc($e0);
        return null;
      } else {
        throw $e0;
      }
    }
  }
  getImage(url: URL): Image {
    let o = this.imageCache.get(url);
    if (o != null) {
      return o;
    }
    try {
      o = url.getContent();
      if (o == null) {
        return null;
      }
      if (o instanceof Image) {
        this.imageCache.put(url, o);
        return o;
      }
      let img = this.target.createImage$ImageProducer(o);
      this.imageCache.put(url, img);
      return img;
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let ex = $J.exc($e1);
        return null;
      } else {
        throw $e1;
      }
    }
  }
  getApplet(name: string): Applet {
    return null;
  }
  getApplets(): Enumeration<Applet> {
    let applets = new Vector();
    applets.addElement(this.target);
    return applets.elements();
  }
  showDocument$URL(url: URL): void {
  }
  showDocument$URL$String(url: URL, target: string): void {
  }
  showStatus(status: string): void {
  }
  setStream(key: string, stream: InputStream): void {
  }
  getStream(key: string): InputStream {
    return null;
  }
  getStreamKeys(): Iterator<string> {
    return null;
  }
  showDocument(...a: any[]): any {
    if (a.length === 1 && (a[0] == null || $J.isa(a[0], URL))) return this.showDocument$URL(...a);
    if (a.length === 2 && (a[0] == null || $J.isa(a[0], URL)) && (a[1] == null || typeof a[1] === 'string')) return this.showDocument$URL$String(...a);
    throw new Error('no overload of showDocument for these arguments');
  }
}

$J.define(BeansAppletContext, 'java.beans.BeansAppletContext', { kind: 'class', ifaces: ['java.applet.AppletContext'], sup: 'java.lang.Object', ctors: { 'java.applet.Applet': '_BeansAppletContext' }, meths: { 'showDocument(java.net.URL,java.lang.String)': 'showDocument$URL$String', 'showDocument(java.net.URL)': 'showDocument$URL' } });
$J.module(() => {
  Image = $J.load('java.awt.Image');
});
