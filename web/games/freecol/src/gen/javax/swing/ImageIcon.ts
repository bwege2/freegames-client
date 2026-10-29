// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ImageIcon.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessControlContext, AccessController, AppContext, InterruptedException, JObject, JString, ProtectionDomain, StringBuilder, Throwable, Toolkit } from '../../../jre/index.ts';
import { AccessibleContext } from '../accessibility/AccessibleContext.ts';

let Component, MediaTracker, AWTAccessor;

/**
 * An implementation of the Icon interface that paints Icons
 * from Images. Images that are created from a URL, filename or byte array
 * are preloaded using MediaTracker to monitor the loaded state
 * of the image.
 *
 * <p>
 * For further information and examples of using image icons, see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/icon.html">How to Use Icons</a>
 * in <em>The Java Tutorial.</em>
 *
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Jeff Dinkins
 * @author Lynn Monsanto
 * @since 1.2
 */
export class ImageIcon extends JObject {
  filename: string = null;
  location_: URL = null;
  image: Image = null;
  loadStatus: number = 0;
  imageObserver: ImageObserver = null;
  description_: string = null;
  /**
   * Do not use this shared component, which is used to track image loading.
   * It is left for backward compatibility only.
   * @deprecated since 1.8
   */
  static component: Component = null;
  /**
   * Do not use this shared media tracker, which is used to load images.
   * It is left for backward compatibility only.
   * @deprecated since 1.8
   */
  static tracker: MediaTracker = null;
  /**
   * Id used in loading images from MediaTracker.
   */
  static mediaTrackerID: number = 0;
  static TRACKER_KEY: any = null;
  width_: number = 0;
  height_: number = 0;
  /**
   * --- Accessibility Support ---
   */
  accessibleContext: ImageIcon$AccessibleImageIcon = null;
  $init_ImageIcon() {
    this.loadStatus = 0;
    this.description_ = null;
    this.width_ = -1;
    this.height_ = -1;
    this.accessibleContext = null;
  }
  /**
   * Creates an ImageIcon from the specified URL. The image will
   * be preloaded by using MediaTracker to monitor the loaded state
   * of the image.
   * @param location the URL for the image
   * @param description a brief textual description of the image
   * @see #ImageIcon(String)
   */
  _ImageIcon$URL$String(location: URL, description: string): this {
    this.$init_ImageIcon();
    this.image = Toolkit.getDefaultToolkit().getImage(location);
    if (this.image == null) {
      return this;
    }
    this.location_ = location;
    this.description_ = description;
    this.loadImage(this.image);
    return this;
  }
  /**
   * Creates an ImageIcon from the specified URL. The image will
   * be preloaded by using MediaTracker to monitor the loaded state
   * of the image.
   * The icon's description is initialized to be
   * a string representation of the URL.
   * @param location the URL for the image
   * @see #getDescription
   */
  _ImageIcon$URL(location: URL): this {
    this._ImageIcon$URL$String(location, location.toExternalForm());
    return this;
  }
  /**
   * Creates an ImageIcon from an image object.
   * If the image has a "comment" property that is a string,
   * then the string is used as the description of this icon.
   * @param image the image
   * @see #getDescription
   * @see java.awt.Image#getProperty
   */
  _ImageIcon$Image(image: Image): this {
    this.$init_ImageIcon();
    this.image = image;
    let o = image.getProperty('comment', this.imageObserver);
    if ($J.isa(o, JString)) {
      this.description_ = o;
    }
    this.loadImage(image);
    return this;
  }
  /**
   * Creates an ImageIcon from an array of bytes which were
   * read from an image file containing a supported image format,
   * such as GIF, JPEG, or (as of 1.3) PNG.
   * Normally this array is created
   * by reading an image using Class.getResourceAsStream(), but
   * the byte array may also be statically stored in a class.
   * If the resulting image has a "comment" property that is a string,
   * then the string is used as the description of this icon.
   *
   * @param  imageData an array of pixels in an image format supported by
   *             the AWT Toolkit, such as GIF, JPEG, or (as of 1.3) PNG
   * @see    java.awt.Toolkit#createImage
   * @see #getDescription
   * @see java.awt.Image#getProperty
   */
  _ImageIcon$byteArr(imageData: number[]): this {
    this.$init_ImageIcon();
    this.image = Toolkit.getDefaultToolkit().createImage(imageData);
    if (this.image == null) {
      return this;
    }
    let o = this.image.getProperty('comment', this.imageObserver);
    if ($J.isa(o, JString)) {
      this.description_ = o;
    }
    this.loadImage(this.image);
    return this;
  }
  /**
   * Creates an uninitialized image icon.
   */
  _ImageIcon$(): this {
    this.$init_ImageIcon();
    return this;
  }
  static createNoPermsComponent(): Component {
    return AccessController.doPrivileged(new (ImageIcon$2())(), new AccessControlContext([new ProtectionDomain(null, null)]));
  }
  /**
   * Loads the image, returning only when the image is loaded.
   * @param image the image
   */
  loadImage(image: Image): void {
    let mTracker = this.getTracker();
    let interrupted = false;
    {
      let id = this.getNextID();
      mTracker.addImage$Image$int(image, id);
      try {
        mTracker.waitForID$int$long(id, 0);
      } catch ($e0) {
        if ($J.isa($e0, InterruptedException)) {
          let e = $J.exc($e0);
          interrupted = true;
        } else {
          throw $e0;
        }
      }
      this.loadStatus = mTracker.statusID$int$boolean(id, false);
      mTracker.removeImage$Image$int(image, id);
      if (interrupted && ((this.loadStatus & MediaTracker.LOADING) !== 0)) {
        this.loadStatus = MediaTracker.ABORTED;
      }
      this.width_ = image.getWidth$ImageObserver(this.imageObserver);
      this.height_ = image.getHeight$ImageObserver(this.imageObserver);
    }
  }
  /**
   * Returns an ID to use with the MediaTracker in loading an image.
   */
  getNextID(): number {
    {
      return ++ImageIcon.mediaTrackerID;
    }
  }
  /**
   * Returns the MediaTracker for the current AppContext, creating a new
   * MediaTracker if necessary.
   */
  getTracker(): MediaTracker {
    let trackerObj: any;
    let ac = AppContext.getAppContext();
    {
      trackerObj = ac.get(ImageIcon.TRACKER_KEY);
      if (trackerObj == null) {
        let comp = new (ImageIcon$3())().$o(this)._Component();
        trackerObj = new MediaTracker()._MediaTracker(comp);
        ac.put(ImageIcon.TRACKER_KEY, trackerObj);
      }
    }
    return trackerObj;
  }
  /**
   * Returns this icon's <code>Image</code>.
   * @return the <code>Image</code> object for this <code>ImageIcon</code>
   */
  getImage(): Image {
    return this.image;
  }
  /**
   * Sets the image displayed by this icon.
   * @param image the image
   */
  setImage(image: Image): void {
    this.image = image;
    this.loadImage(image);
  }
  /**
   * Paints the icon.
   * The top-left corner of the icon is drawn at
   * the point (<code>x</code>, <code>y</code>)
   * in the coordinate space of the graphics context <code>g</code>.
   * If this icon has no image observer,
   * this method uses the <code>c</code> component
   * as the observer.
   *
   * @param c the component to be used as the observer
   *          if this icon has no image observer
   * @param g the graphics context
   * @param x the X coordinate of the icon's top-left corner
   * @param y the Y coordinate of the icon's top-left corner
   */
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    if (this.imageObserver == null) {
      g.drawImage$Image$int$int$ImageObserver(this.image, x, y, c);
    } else {
      g.drawImage$Image$int$int$ImageObserver(this.image, x, y, this.imageObserver);
    }
  }
  /**
   * Gets the width of the icon.
   *
   * @return the width in pixels of this icon
   */
  getIconWidth(): number {
    return this.width_;
  }
  /**
   * Gets the height of the icon.
   *
   * @return the height in pixels of this icon
   */
  getIconHeight(): number {
    return this.height_;
  }
  /**
   * Returns a string representation of this image.
   *
   * @return a string representing this image
   */
  toString(): string {
    if (this.description_ != null) {
      return this.description_;
    }
    return super.toString();
  }
  /**
   * Gets the AccessibleContext associated with this ImageIcon.
   * For image icons, the AccessibleContext takes the form of an
   * AccessibleImageIcon.
   * A new AccessibleImageIcon instance is created if necessary.
   *
   * @return an AccessibleImageIcon that serves as the
   *         AccessibleContext of this ImageIcon
   * @since 1.3
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new ImageIcon$AccessibleImageIcon().$o(this)._ImageIcon$AccessibleImageIcon();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    ImageIcon.component = AccessController.doPrivileged(new (ImageIcon$1())());
    ImageIcon.tracker = new MediaTracker()._MediaTracker(ImageIcon.component);
    ImageIcon.TRACKER_KEY = new StringBuilder('TRACKER_KEY');
  }
}

/**
 * This class implements accessibility support for the
 * <code>ImageIcon</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to image icon user-interface
 * elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 * @since 1.3
 */
export class ImageIcon$AccessibleImageIcon extends AccessibleContext {
  /**
   * Constructs an {@code AccessibleImageIcon}.
   */
  _ImageIcon$AccessibleImageIcon(): this {
    this._AccessibleContext();
    return this;
  }
  /**
   * Gets the Accessible parent of this object.  If the parent of this
   * object implements Accessible, this method should simply return
   * getParent().
   *
   * @return the Accessible parent of this object -- can be null if this
   * object does not have an Accessible parent
   */
  getAccessibleParent(): Accessible {
    return null;
  }
  /**
   * Gets the index of this object in its accessible parent.
   *
   * @return the index of this object in its parent; -1 if this
   * object does not have an accessible parent.
   * @see #getAccessibleParent
   */
  getAccessibleIndexInParent(): number {
    return -1;
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement Accessible, than this
   * method should return the number of children of this object.
   *
   * @return the number of accessible children in the object.
   */
  getAccessibleChildrenCount(): number {
    return 0;
  }
  /**
   * Returns the nth Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    return null;
  }
}

let $ImageIcon$2$1: any = null;
/** An anonymous class (ImageIcon.java:145). */
function ImageIcon$2$1(): any {
  return $ImageIcon$2$1 ??= $J.local(class extends Component {
  }, 'javax.swing.ImageIcon$2$1', []);
}

let $ImageIcon$2: any = null;
/** An anonymous class (ImageIcon.java:143). */
function ImageIcon$2(): any {
  return $ImageIcon$2 ??= $J.local(class extends JObject {
    run(): Component {
      return new (ImageIcon$2$1())().$o(this)._Component();
    }
  }, 'javax.swing.ImageIcon$2', ['java.security.PrivilegedAction']);
}

let $ImageIcon$3: any = null;
/** An anonymous class (ImageIcon.java:368). */
function ImageIcon$3(): any {
  return $ImageIcon$3 ??= $J.local(class extends Component {
  }, 'javax.swing.ImageIcon$3', []);
}

let $ImageIcon$1: any = null;
/** An anonymous class (ImageIcon.java:111). */
function ImageIcon$1(): any {
  return $ImageIcon$1 ??= $J.local(class extends JObject {
    run(): Component {
      try {
        let component = ImageIcon.createNoPermsComponent();
        AWTAccessor.getComponentAccessor().setAppContext(component, null);
        return component;
      } catch ($e1) {
        {
          let e = $J.exc($e1);
          e.printStackTrace();
          return null;
        }
      }
    }
  }, 'javax.swing.ImageIcon$1', ['java.security.PrivilegedAction']);
}

$J.define(ImageIcon, 'javax.swing.ImageIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable', 'javax.accessibility.Accessible'], sup: 'java.lang.Object', ctors: { '': '_ImageIcon$', 'byte[]': '_ImageIcon$byteArr', 'byte[],java.lang.String': '_ImageIcon$byteArr$String', 'java.awt.Image': '_ImageIcon$Image', 'java.awt.Image,java.lang.String': '_ImageIcon$Image$String', 'java.net.URL': '_ImageIcon$URL', 'java.net.URL,java.lang.String': '_ImageIcon$URL$String', 'java.lang.String': '_ImageIcon$String', 'java.lang.String,java.lang.String': '_ImageIcon$String$String' }, clinit: true, lazy: ['component', 'tracker', 'mediaTrackerID', 'TRACKER_KEY'] });
$J.define(ImageIcon$AccessibleImageIcon, 'javax.swing.ImageIcon$AccessibleImageIcon', { kind: 'class', ifaces: ['javax.accessibility.AccessibleIcon', 'java.io.Serializable'], sup: 'javax.accessibility.AccessibleContext', ctors: { '': '_ImageIcon$AccessibleImageIcon' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  MediaTracker = $J.load('java.awt.MediaTracker');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
