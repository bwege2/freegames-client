// The client worker's platform layer: what the original client gets from the JVM, AWT's native code and
// the operating system, installed over the translated classes.
import { Scheduler } from './sched.ts';
import { installAwtLoop } from './awtloop.ts';
import { installSound } from './sound.ts';
import { installPeers, present } from './peers.ts';
import { installReceiving } from '../receiving.ts';
import { BufferedImage } from '../../jre/image.ts';
import { $J } from '../../jre/index.ts';

export function installClient(java: (n: string) => any, jmethod: (c: string, sig: string) => string): Scheduler {
  // java.awt.image.BufferedImage is the runtime's; it is a java.awt.Image as the translated code expects
  const Image = java('java.awt.Image');
  Object.setPrototypeOf(BufferedImage.prototype, Image.prototype);
  Object.setPrototypeOf(BufferedImage, Image);
  // and answers to Image's overloads under their translated names
  const BI = BufferedImage.prototype as any;
  for (const [sig, impl] of [['getWidth(java.awt.image.ImageObserver)', 'getWidth'], ['getHeight(java.awt.image.ImageObserver)', 'getHeight'],
    ['getWidth()', 'getWidth'], ['getHeight()', 'getHeight'], ['getProperty(java.lang.String,java.awt.image.ImageObserver)', 'getProperty'],
    ['getProperty(java.lang.String)', 'getProperty'], ['getGraphics()', 'getGraphics'], ['getSource()', 'getSource'],
    ['getScaledInstance(int,int,int)', 'getScaledInstance'], ['getCapabilities(java.awt.GraphicsConfiguration)', 'getCapabilities']]) {
    for (const c of ['java.awt.Image', 'java.awt.image.RenderedImage']) {
      const n = $J.m(c, sig);
      if (n !== impl && !(n in BI && Object.prototype.hasOwnProperty.call(BI, n))) BI[n] = BI[impl];
    }
  }
  const sched = new Scheduler();
  sched.install();
  installAwtLoop(java, jmethod, sched);
  installReceiving(java);
  installSound(java);
  installPeers();
  sched.present = present;
  // The original reads every image (about 1,700 files, 96 MB) in a thread before it shows the main menu. In
  // the browser that would be a long download before anything shows: images load when first drawn, as the
  // original's ImageResource.getImage does for an image the preloading has not reached yet (README, deviations).
  const ResourceManager = java('net.sf.freecol.common.resources.ResourceManager');
  const FreeCol = java('net.sf.freecol.FreeCol');
  const SwingUtilities = java('javax.swing.SwingUtilities');
  $J.replaceStatic(ResourceManager, 'startPreloading', (after: () => void) => {
    if (FreeCol.getHeadless()) return;
    SwingUtilities.invokeLater(after);
  });
  return sched;
}

export { Scheduler };
