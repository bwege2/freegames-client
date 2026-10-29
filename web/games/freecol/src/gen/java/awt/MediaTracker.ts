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
import { $J, JObject, MultiResolutionToolkitImage } from '../../../jre/index.ts';

let ImageMediaEntry, MediaEntry;

/**
 * The {@code MediaTracker} class is a utility class to track
 * the status of a number of media objects. Media objects could
 * include audio clips as well as images, though currently only
 * images are supported.
 * <p>
 * To use a media tracker, create an instance of
 * {@code MediaTracker} and call its {@code addImage}
 * method for each image to be tracked. In addition, each image can
 * be assigned a unique identifier. This identifier controls the
 * priority order in which the images are fetched. It can also be used
 * to identify unique subsets of the images that can be waited on
 * independently. Images with a lower ID are loaded in preference to
 * those with a higher ID number.
 *
 * <p>
 *
 * Tracking an animated image
 * might not always be useful
 * due to the multi-part nature of animated image
 * loading and painting,
 * but it is supported.
 * {@code MediaTracker} treats an animated image
 * as completely loaded
 * when the first frame is completely loaded.
 * At that point, the {@code MediaTracker}
 * signals any waiters
 * that the image is completely loaded.
 * If no {@code ImageObserver}s are observing the image
 * when the first frame has finished loading,
 * the image might flush itself
 * to conserve resources
 * (see {@link Image#flush()}).
 *
 * <p>
 * Here is an example of using {@code MediaTracker}:
 *
 * <hr><blockquote><pre>{@code
 * import java.applet.Applet;
 * import java.awt.Color;
 * import java.awt.Image;
 * import java.awt.Graphics;
 * import java.awt.MediaTracker;
 *
 * public class ImageBlaster extends Applet implements Runnable {
 *      MediaTracker tracker;
 *      Image bg;
 *      Image anim[] = new Image[5];
 *      int index;
 *      Thread animator;
 *
 *      // Get the images for the background (id == 0)
 *      // and the animation frames (id == 1)
 *      // and add them to the MediaTracker
 *      public void init() {
 *          tracker = new MediaTracker(this);
 *          bg = getImage(getDocumentBase(),
 *                  "images/background.gif");
 *          tracker.addImage(bg, 0);
 *          for (int i = 0; i < 5; i++) {
 *              anim[i] = getImage(getDocumentBase(),
 *                      "images/anim"+i+".gif");
 *              tracker.addImage(anim[i], 1);
 *          }
 *      }
 *
 *      // Start the animation thread.
 *      public void start() {
 *          animator = new Thread(this);
 *          animator.start();
 *      }
 *
 *      // Stop the animation thread.
 *      public void stop() {
 *          animator = null;
 *      }
 *
 *      // Run the animation thread.
 *      // First wait for the background image to fully load
 *      // and paint.  Then wait for all of the animation
 *      // frames to finish loading. Finally, loop and
 *      // increment the animation frame index.
 *      public void run() {
 *          try {
 *              tracker.waitForID(0);
 *              tracker.waitForID(1);
 *          } catch (InterruptedException e) {
 *              return;
 *          }
 *          Thread me = Thread.currentThread();
 *          while (animator == me) {
 *              try {
 *                  Thread.sleep(100);
 *              } catch (InterruptedException e) {
 *                  break;
 *              }
 *              synchronized (this) {
 *                  index++;
 *                  if (index >= anim.length) {
 *                      index = 0;
 *                  }
 *              }
 *              repaint();
 *          }
 *      }
 *
 *      // The background image fills the frame so we
 *      // don't need to clear the applet on repaints.
 *      // Just call the paint method.
 *      public void update(Graphics g) {
 *          paint(g);
 *      }
 *
 *      // Paint a large red rectangle if there are any errors
 *      // loading the images.  Otherwise always paint the
 *      // background so that it appears incrementally as it
 *      // is loading.  Finally, only paint the current animation
 *      // frame if all of the frames (id == 1) are done loading,
 *      // so that we don't get partial animations.
 *      public void paint(Graphics g) {
 *          if ((tracker.statusAll(false) & MediaTracker.ERRORED) != 0) {
 *              g.setColor(Color.red);
 *              g.fillRect(0, 0, size().width, size().height);
 *              return;
 *          }
 *          g.drawImage(bg, 0, 0, this);
 *          if (tracker.statusID(1, false) == MediaTracker.COMPLETE) {
 *              g.drawImage(anim[index], 10, 10, this);
 *          }
 *      }
 * }
 * } </pre></blockquote><hr>
 *
 * @author      Jim Graham
 * @since       1.0
 */
export class MediaTracker extends JObject {
  /**
   * A given {@code Component} that will be
   * tracked by a media tracker where the image will
   * eventually be drawn.
   *
   * @serial
   * @see #MediaTracker(Component)
   */
  target: Component = null;
  /**
   * The head of the list of {@code Images} that is being
   * tracked by the {@code MediaTracker}.
   *
   * @serial
   * @see #addImage(Image, int)
   * @see #removeImage(Image)
   */
  head: MediaEntry = null;
  /**
   * Flag indicating that media is currently being loaded.
   * @see         java.awt.MediaTracker#statusAll
   * @see         java.awt.MediaTracker#statusID
   */
  static readonly LOADING: number = 1;
  /**
   * Flag indicating that the downloading of media was aborted.
   * @see         java.awt.MediaTracker#statusAll
   * @see         java.awt.MediaTracker#statusID
   */
  static readonly ABORTED: number = 2;
  /**
   * Flag indicating that the downloading of media encountered
   * an error.
   * @see         java.awt.MediaTracker#statusAll
   * @see         java.awt.MediaTracker#statusID
   */
  static readonly ERRORED: number = 4;
  /**
   * Flag indicating that the downloading of media was completed
   * successfully.
   * @see         java.awt.MediaTracker#statusAll
   * @see         java.awt.MediaTracker#statusID
   */
  static readonly COMPLETE: number = 8;
  static readonly DONE: number = 14;
  /**
   * Creates a media tracker to track images for a given component.
   * @param     comp the component on which the images
   *                     will eventually be drawn
   */
  _MediaTracker(comp: Component): this {
    this.target = comp;
    return this;
  }
  /**
   * Adds an image to the list of images being tracked by this media
   * tracker. The image will eventually be rendered at its default
   * (unscaled) size.
   * @param     image   the image to be tracked
   * @param     id      an identifier used to track this image
   */
  addImage$Image$int(image: Image, id: number): void {
    this.addImage$Image$int$int$int(image, id, -1, -1);
  }
  /**
   * Adds a scaled image to the list of images being tracked
   * by this media tracker. The image will eventually be
   * rendered at the indicated width and height.
   *
   * @param     image   the image to be tracked
   * @param     id   an identifier that can be used to track this image
   * @param     w    the width at which the image is rendered
   * @param     h    the height at which the image is rendered
   */
  addImage$Image$int$int$int(image: Image, id: number, w: number, h: number): void {
    this.addImageImpl(image, id, w, h);
    let rvImage = MediaTracker.getResolutionVariant(image);
    if (rvImage != null) {
      this.addImageImpl(rvImage, id, w === -1 ? -1 : Math.imul(2, w), h === -1 ? -1 : Math.imul(2, h));
    }
  }
  addImageImpl(image: Image, id: number, w: number, h: number): void {
    this.head = MediaEntry.insert(this.head, new ImageMediaEntry()._ImageMediaEntry(this, image, id, w, h));
  }
  /**
   * Starts loading all images tracked by this media tracker with the
   * specified identifier. This method waits until all the images with
   * the specified identifier have finished loading, or until the
   * length of time specified in milliseconds by the {@code ms}
   * argument has passed.
   * <p>
   * If there is an error while loading or scaling an image, then that
   * image is considered to have finished loading. Use the
   * {@code statusID}, {@code isErrorID}, and
   * {@code isErrorAny} methods to check for errors.
   * @param  id the identifier of the images to check
   * @param  ms the length of time, in milliseconds, to wait
   *         for the loading to complete
   * @return {@code true} if the loading completed in time;
   *         otherwise {@code false}
   * @see           java.awt.MediaTracker#waitForAll
   * @see           java.awt.MediaTracker#waitForID(int)
   * @see           java.awt.MediaTracker#statusID
   * @see           java.awt.MediaTracker#isErrorAny()
   * @see           java.awt.MediaTracker#isErrorID(int)
   * @throws     InterruptedException  if any thread has
   *                          interrupted this thread.
   */
  waitForID$int$long(id: number, ms: number): boolean {
    let end = $J.system_currentTimeMillis() + ms;
    let first = true;
    while (true) {
      let status = this.statusID$int$boolean$boolean$MediaTracker(id, first, first);
      if ((status & MediaTracker.LOADING) === 0) {
        return (status === MediaTracker.COMPLETE);
      }
      first = false;
      let timeout: number;
      if (ms === 0) {
        timeout = 0;
      } else {
        timeout = end - $J.system_currentTimeMillis();
        if (timeout <= 0) {
          return false;
        }
      }
      $J.monitorWait(this, timeout);
    }
  }
  /**
   * Calculates and returns the bitwise inclusive <b>OR</b> of the
   * status of all media with the specified identifier that are
   * tracked by this media tracker.
   * <p>
   * Possible flags defined by the
   * {@code MediaTracker} class are {@code LOADING},
   * {@code ABORTED}, {@code ERRORED}, and
   * {@code COMPLETE}. An image that hasn't started
   * loading has zero as its status.
   * <p>
   * If the value of {@code load} is {@code true}, then
   * this method starts loading any images that are not yet being loaded.
   * @param        id   the identifier of the images to check
   * @param        load   if {@code true}, start loading
   *                            any images that are not yet being loaded
   * @return       the bitwise inclusive <b>OR</b> of the status of
   *                            all of the media with the specified
   *                            identifier that are being tracked
   * @see          java.awt.MediaTracker#statusAll(boolean)
   * @see          java.awt.MediaTracker#LOADING
   * @see          java.awt.MediaTracker#ABORTED
   * @see          java.awt.MediaTracker#ERRORED
   * @see          java.awt.MediaTracker#COMPLETE
   */
  statusID$int$boolean(id: number, load: boolean): number {
    return this.statusID$int$boolean$boolean$MediaTracker(id, load, true);
  }
  statusID$int$boolean$boolean$MediaTracker(id: number, load: boolean, verify: boolean): number {
    let cur = this.head;
    let status = 0;
    while (cur != null) {
      if (cur.getID() === id) {
        status = status | cur.getStatus(load, verify);
      }
      cur = cur.next_;
    }
    return status;
  }
  /**
   * Removes the specified image from the specified tracking
   * ID of this media tracker.
   * All instances of {@code Image} being tracked
   * under the specified ID are removed regardless of scale.
   * @param      image the image to be removed
   * @param      id the tracking ID from which to remove the image
   * @see        java.awt.MediaTracker#removeImage(java.awt.Image)
   * @see        java.awt.MediaTracker#removeImage(java.awt.Image, int, int, int)
   * @since      1.1
   */
  removeImage$Image$int(image: Image, id: number): void {
    this.removeImageImpl$Image$int$MediaTracker(image, id);
    let rvImage = MediaTracker.getResolutionVariant(image);
    if (rvImage != null) {
      this.removeImageImpl$Image$int$MediaTracker(rvImage, id);
    }
    $J.monitorNotify(this, true);
  }
  removeImageImpl$Image$int$MediaTracker(image: Image, id: number): void {
    let cur = this.head;
    let prev = null;
    while (cur != null) {
      let next = cur.next_;
      if (cur.getID() === id && cur.getMedia() === image) {
        if (prev == null) {
          this.head = next;
        } else {
          prev.next_ = next;
        }
        cur.cancel();
      } else {
        prev = cur;
      }
      cur = next;
    }
  }
  setDone(): void {
    $J.monitorNotify(this, true);
  }
  static getResolutionVariant(image: Image): Image {
    if ($J.isa(image, MultiResolutionToolkitImage)) {
      return (image).getResolutionVariant();
    }
    return null;
  }
}

$J.define(MediaTracker, 'java.awt.MediaTracker', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.Component': '_MediaTracker' }, meths: { 'removeImageImpl(java.awt.Image,int,int,int)': 'removeImageImpl$Image$int$int$int$MediaTracker', 'removeImage(java.awt.Image,int,int,int)': 'removeImage$Image$int$int$int', 'removeImageImpl(java.awt.Image,int)': 'removeImageImpl$Image$int$MediaTracker', 'removeImage(java.awt.Image,int)': 'removeImage$Image$int', 'removeImageImpl(java.awt.Image)': 'removeImageImpl$Image$MediaTracker', 'removeImage(java.awt.Image)': 'removeImage$Image', 'statusID(int,boolean,boolean)': 'statusID$int$boolean$boolean$MediaTracker', 'statusID(int,boolean)': 'statusID$int$boolean', 'waitForID(int,long)': 'waitForID$int$long', 'waitForID(int)': 'waitForID$int', 'checkID(int,boolean,boolean)': 'checkID$int$boolean$boolean$MediaTracker', 'checkID(int,boolean)': 'checkID$int$boolean', 'checkID(int)': 'checkID$int', 'statusAll(boolean,boolean)': 'statusAll$boolean$boolean$MediaTracker', 'statusAll(boolean)': 'statusAll$boolean', 'waitForAll(long)': 'waitForAll$long', 'waitForAll()': 'waitForAll$', 'checkAll(boolean,boolean)': 'checkAll$boolean$boolean$MediaTracker', 'checkAll(boolean)': 'checkAll$boolean', 'checkAll()': 'checkAll$', 'addImage(java.awt.Image,int,int,int)': 'addImage$Image$int$int$int', 'addImage(java.awt.Image,int)': 'addImage$Image$int' } });
$J.module(() => {
  ImageMediaEntry = $J.load('java.awt.ImageMediaEntry');
  MediaEntry = $J.load('java.awt.MediaEntry');
});
