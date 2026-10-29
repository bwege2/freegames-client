// @ts-nocheck
// The screen as Java2D sees it: one graphics environment, one device (the game's canvas), one
// configuration, as the JDK's X11GraphicsEnvironment presents a plain 24-bit display. They extend the
// translated java.awt classes, so they are made when first asked for (after the translation is linked).
import { $J, defineLib } from './lang.ts';
import { awt } from './toolkit.ts';
import { FontManagerFactory } from './fonts.ts';

/** A class extending a translated class, made on first use. */
export function lateClass<T>(make: () => T): () => T {
  let c: T | null = null;
  return () => (c ??= make());
}

const geClass = lateClass(() => {
  const GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  const C = class WebGraphicsEnvironment extends GraphicsEnvironment {
    device: any = null;
    getScreenDevices() {
      return [this.getDefaultScreenDevice()];
    }
    getDefaultScreenDevice() {
      return (this.device ??= new (deviceClass())().$init());
    }
    createGraphics(img: any) {
      return awt.createGraphics(img);
    }
    getAllFonts() {
      const Font = $J.load('java.awt.Font');
      return this.getAvailableFontFamilyNames().map((n: string) => $J.make('java.awt.Font', 'java.lang.String,int,int', n, Font.PLAIN, 1));
    }
    getAvailableFontFamilyNames(_l?: any) {
      return FontManagerFactory.getInstance().getFamilyNames();
    }
    registerFont(font: any) {
      return FontManagerFactory.getInstance().registerFont(font);
    }
    preferLocaleFonts() {}
    preferProportionalFonts() {}
    isHeadlessInstance() {
      return false;
    }
    getMaximumWindowBounds() {
      return $J.make('java.awt.Rectangle', 'int,int,int,int', 0, 0, awt.screenWidth, awt.screenHeight);
    }
  };
  $J.adoptOverloads(C);
  $J.define(C, 'sun.awt.WebGraphicsEnvironment', { kind: 'class', sup: 'java.awt.GraphicsEnvironment' });
  return C;
});

const deviceClass = lateClass(() => {
  const GraphicsDevice = $J.load('java.awt.GraphicsDevice');
  const C = class WebGraphicsDevice extends GraphicsDevice {
    config: any = null;
    fullScreen: any = null;
    $init() {
      this[GraphicsDevice.$meta.ctors['']]();
      return this;
    }
    getType() {
      return 0; // TYPE_RASTER_SCREEN
    }
    getIDstring() {
      return ':0.0';
    }
    getConfigurations() {
      return [this.getDefaultConfiguration()];
    }
    getDefaultConfiguration() {
      return (this.config ??= new (configClass())().$init(this));
    }
    isFullScreenSupported() {
      return false;
    }
    isDisplayChangeSupported() {
      return false;
    }
    getDisplayMode() {
      return $J.make('java.awt.DisplayMode', 'int,int,int,int', awt.screenWidth, awt.screenHeight, 24, 60);
    }
    getDisplayModes() {
      return [this.getDisplayMode()];
    }
    getAvailableAcceleratedMemory() {
      return -1;
    }
  };
  $J.adoptOverloads(C);
  $J.define(C, 'sun.awt.WebGraphicsDevice', { kind: 'class', sup: 'java.awt.GraphicsDevice' });
  return C;
});

const configClass = lateClass(() => {
  const GraphicsConfiguration = $J.load('java.awt.GraphicsConfiguration');
  const C = class WebGraphicsConfig extends GraphicsConfiguration {
    device: any;
    $init(device: any) {
      this[GraphicsConfiguration.$meta.ctors['']]();
      this.device = device;
      return this;
    }
    getDevice() {
      return this.device;
    }
    getColorModel(transparency?: number) {
      const ColorModel = $J.load('java.awt.image.ColorModel');
      if (transparency === undefined || transparency === 1) {
        // a 24-bit TrueColor visual, as Xvfb's
        return $J.make('java.awt.image.DirectColorModel', 'int,int,int,int', 24, 0xff0000, 0xff00, 0xff);
      }
      return ColorModel.getRGBdefault();
    }
    getDefaultTransform() {
      return $J.make('java.awt.geom.AffineTransform', '');
    }
    getNormalizingTransform() {
      return $J.make('java.awt.geom.AffineTransform', '');
    }
    getBounds() {
      return $J.make('java.awt.Rectangle', 'int,int,int,int', 0, 0, awt.screenWidth, awt.screenHeight);
    }
    /** As X11GraphicsConfig's: opaque images are TYPE_INT_RGB, the others TYPE_INT_ARGB. */
    createCompatibleImage(w: number, h: number, t?: number) {
      const BufferedImage = $J.load('java.awt.image.BufferedImage');
      if (t !== undefined && t !== 1 && t !== 2 && t !== 3) throw new ($J.load('java.lang.IllegalArgumentException') as any)('Unknown transparency: ' + t);
      return new BufferedImage(w, h, t === undefined || t === 1 ? 1 : 2);
    }
    createCompatibleVolatileImage(w: number, h: number, ..._a: any[]) {
      return awt.newVolatile(w, h);
    }
    isTranslucencyCapable() {
      return false;
    }
  };
  $J.adoptOverloads(C);
  $J.define(C, 'sun.awt.WebGraphicsConfig', { kind: 'class', sup: 'java.awt.GraphicsConfiguration' });
  return C;
});

/** sun.awt.PlatformGraphicsInfo: what the platform is. */
export const PlatformGraphicsInfo: any = {
  createGE: () => new (geClass())(),
  createToolkit: () => $J.load('java.awt.Toolkit').getDefaultToolkit(),
  getDefaultHeadlessProperty: () => false,
  getDefaultHeadlessMessage: () => '\nNo X11 DISPLAY variable was set,\nor no headful library support was found,\nbut this program performed an operation which requires it,',
};
defineLib(PlatformGraphicsInfo, 'sun.awt.PlatformGraphicsInfo');
