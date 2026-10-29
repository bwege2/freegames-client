// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/UnitAnimator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, HashMap, JObject, RuntimeException } from '../../../../../../../jre/index.ts';

let ImageIcon, JLabel, TileBounds, ImageUtils;

/**
 * Handles taking units of of the map rendering in order to be animated using {@code JLabel}s.
 */
export class UnitAnimator extends JObject {
  /**
   * The units that are being animated and an associated reference count.
   */
  unitsOutForAnimation: JMap<Unit, number> = null;
  /**
   * The labels being used in animation for a unit.
   */
  unitsOutForAnimationLabels: JMap<Unit, JLabel> = null;
  freeColClient: FreeColClient = null;
  mapViewer: MapViewer = null;
  lib: ImageLibrary = null;
  _UnitAnimator(freeColClient: FreeColClient, mapViewer: MapViewer, lib: ImageLibrary): this {
    this.unitsOutForAnimation = new HashMap();
    this.unitsOutForAnimationLabels = new HashMap();
    this.freeColClient = freeColClient;
    this.mapViewer = mapViewer;
    this.lib = lib;
    return this;
  }
  /**
   * Make an animation label for the unit, and reference count it.
   *
   * @param unit The {@code Unit} to animate.
   * @return A {@code JLabel} for the animation.
   */
  enterUnitOutForAnimation(unit: Unit): JLabel {
    let i = this.unitsOutForAnimation.get(unit);
    if (i == null) {
      let unitLabel = this.createUnitAnimationLabel(unit);
      this.unitsOutForAnimationLabels.put(unit, unitLabel);
      i = 1;
    } else {
      i++;
    }
    this.unitsOutForAnimation.put(unit, i);
    return this.unitsOutForAnimationLabels.get(unit);
  }
  /**
   * Release an animation label for a unit, maintain the reference count.
   *
   * @param unit The {@code Unit} to animate.
   */
  releaseUnitOutForAnimation(unit: Unit): void {
    let i = this.unitsOutForAnimation.get(unit);
    if (i == null) {
      throw new RuntimeException('Unit not out for animation: ' + $J.str(unit));
    }
    if (i === 1) {
      this.unitsOutForAnimation.remove(unit);
    } else {
      i--;
      this.unitsOutForAnimation.put(unit, i);
    }
  }
  /**
   * Are any units being animated?
   *
   * @return True if unit animation underway.
   */
  isUnitsOutForAnimation(): boolean {
    return !this.unitsOutForAnimation.isEmpty();
  }
  /**
   * Is a given unit being animated?
   *
   * @param unit The {@code Unit} to check.
   * @return True if the unit is being animated.
   */
  isOutForAnimation(unit: Unit): boolean {
    return this.unitsOutForAnimation.containsKey(unit);
  }
  /**
   * Get the position a unit label should be positioned in a tile.
   *
   * @param unitLabel The unit {@code JLabel}.
   * @param tile The {@code Tile} to position in.
   * @return The {@code Point} to position the label.
   */
  getAnimationPosition(unitLabel: JLabel, tile: Tile): Point {
    return this.mapViewer.getTileBounds().calculateUnitLabelPositionInTile(unitLabel, this.mapViewer.getMapViewerBounds().calculateTilePosition(tile, false));
  }
  /**
   * Create a label to use for animating a unit.
   *
   * @param unit The {@code Unit} to animate.
   * @return A {@code JLabel} to use in animation.
   */
  createUnitAnimationLabel(unit: Unit): JLabel {
    let unitImg = this.lib.getScaledUnitImage$Unit(unit);
    let scaledUnitOffset = $J.d2i((Math.fround(TileBounds.UNIT_OFFSET * this.lib.getScaleFactor())));
    let width = Math.max(unitImg.getWidth(), this.mapViewer.getTileBounds().getWidth());
    let height = Math.max((unitImg.getHeight() + Math.imul(scaledUnitOffset, 2)) | 0, this.mapViewer.getTileBounds().getHeight());
    let img = ImageUtils.createBufferedImage$int$int(width, height);
    let g2d = img.createGraphics();
    g2d.translate$int$int($J.idiv(((width - this.mapViewer.getTileBounds().getWidth()) | 0), 2), $J.idiv(((height - this.mapViewer.getTileBounds().getHeight()) | 0), 2));
    this.mapViewer.displayUnit(g2d, unit);
    let label = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(img));
    label.setSize$int$int(width, height);
    g2d.dispose();
    return label;
  }
}

$J.define(UnitAnimator, 'net.sf.freecol.client.gui.mapviewer.UnitAnimator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.mapviewer.MapViewer,net.sf.freecol.client.gui.ImageLibrary': '_UnitAnimator' }, returns: { 'isUnitsOutForAnimation': 'boolean' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  TileBounds = $J.load('net.sf.freecol.client.gui.mapviewer.TileBounds');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
