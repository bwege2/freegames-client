// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/MapViewerScaledUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, EnumMap, JObject } from '../../../../../../../jre/index.ts';

let BasicStroke, GeneralPath, Point2D$Float, FontLibrary, TileBounds, Direction;

export class MapViewerScaledUtils extends JObject {
  /**
   * Fog of war area.
   */
  fog: GeneralPath = null;
  /**
   * Fonts (scaled).
   */
  fontNormal: Font = null;
  /**
   * Fonts (scaled).
   */
  fontItalic: Font = null;
  /**
   * Fonts (scaled).
   */
  fontProduction: Font = null;
  /**
   * Fonts (scaled).
   */
  fontTiny: Font = null;
  /**
   * Points to use to draw the borders.
   */
  borderPoints: EnumMap<Direction, Point2D$Float> = null;
  /**
   * Support points for quadTo calls when drawing borders.
   */
  controlPoints: EnumMap<Direction, Point2D$Float> = null;
  /**
   * Stroke to draw the borders with.
   */
  borderStroke: Stroke = null;
  /**
   * Stroke to draw the grid with.
   */
  gridStroke: Stroke = null;
  _MapViewerScaledUtils(): this {
    this.fog = new GeneralPath()._GeneralPath$();
    this.borderPoints = new EnumMap($J.cls(Direction));
    this.controlPoints = new EnumMap($J.cls(Direction));
    this.borderStroke = new BasicStroke()._BasicStroke$float(4);
    this.gridStroke = new BasicStroke()._BasicStroke$float(1);
    return this;
  }
  updateScaledVariables(lib: ImageLibrary): void {
    let tileBounds = new TileBounds()._TileBounds(lib.getTileSize(), lib.getScaleFactor());
    this.fog.reset();
    this.fog.moveTo$float$float(Math.fround(tileBounds.getHalfWidth()), 0);
    this.fog.lineTo$float$float(Math.fround(tileBounds.getWidth()), Math.fround(tileBounds.getHalfHeight()));
    this.fog.lineTo$float$float(Math.fround(tileBounds.getHalfWidth()), Math.fround(tileBounds.getHeight()));
    this.fog.lineTo$float$float(0, Math.fround(tileBounds.getHalfHeight()));
    this.fog.closePath();
    this.fontNormal = lib.getScaledFont('normal-bold-smaller', null);
    this.fontItalic = lib.getScaledFont('normal-bold+italic-smaller', null);
    this.fontProduction = lib.getScaledFont('normal-bold-tiny', null);
    this.fontTiny = lib.getScaledFont('normal-plain-tiny', null);
    if (this.fontNormal == null) {
      this.fontNormal = (lib.getScaleFactor() < 1) ? FontLibrary.getUnscaledFont$String$String('normal-bold-tiny', null) : FontLibrary.getUnscaledFont$String$String('normal-bold-max', null);
    }
    if (this.fontItalic == null) {
      this.fontItalic = this.fontNormal;
    }
    let dx = $J.idiv(tileBounds.getWidth(), 16);
    let dy = $J.idiv(tileBounds.getHeight(), 16);
    let ddx = (dx + $J.idiv(dx, 2)) | 0;
    let ddy = (dy + $J.idiv(dy, 2)) | 0;
    this.controlPoints.put(Direction.N, new Point2D$Float()._Point2D$Float$float$float(Math.fround(tileBounds.getHalfWidth()), Math.fround(dy)));
    this.controlPoints.put(Direction.E, new Point2D$Float()._Point2D$Float$float$float(Math.fround((tileBounds.getWidth() - dx) | 0), Math.fround(tileBounds.getHalfHeight())));
    this.controlPoints.put(Direction.S, new Point2D$Float()._Point2D$Float$float$float(Math.fround(tileBounds.getHalfWidth()), Math.fround((tileBounds.getHeight() - dy) | 0)));
    this.controlPoints.put(Direction.W, new Point2D$Float()._Point2D$Float$float$float(Math.fround(dx), Math.fround(tileBounds.getHalfHeight())));
    this.controlPoints.put(Direction.SE, new Point2D$Float()._Point2D$Float$float$float(Math.fround(tileBounds.getHalfWidth()), Math.fround(tileBounds.getHeight())));
    this.controlPoints.put(Direction.NE, new Point2D$Float()._Point2D$Float$float$float(Math.fround(tileBounds.getWidth()), Math.fround(tileBounds.getHalfHeight())));
    this.controlPoints.put(Direction.SW, new Point2D$Float()._Point2D$Float$float$float(0, Math.fround(tileBounds.getHalfHeight())));
    this.controlPoints.put(Direction.NW, new Point2D$Float()._Point2D$Float$float$float(Math.fround(tileBounds.getHalfWidth()), 0));
    this.borderPoints.put(Direction.NW, new Point2D$Float()._Point2D$Float$float$float(Math.fround((dx + ddx) | 0), Math.fround((tileBounds.getHalfHeight() - ddy) | 0)));
    this.borderPoints.put(Direction.N, new Point2D$Float()._Point2D$Float$float$float(Math.fround((tileBounds.getHalfWidth() - ddx) | 0), Math.fround((dy + ddy) | 0)));
    this.borderPoints.put(Direction.NE, new Point2D$Float()._Point2D$Float$float$float(Math.fround((tileBounds.getHalfWidth() + ddx) | 0), Math.fround((dy + ddy) | 0)));
    this.borderPoints.put(Direction.E, new Point2D$Float()._Point2D$Float$float$float(Math.fround((tileBounds.getWidth() - dx - ddx) | 0), Math.fround((tileBounds.getHalfHeight() - ddy) | 0)));
    this.borderPoints.put(Direction.SE, new Point2D$Float()._Point2D$Float$float$float(Math.fround((tileBounds.getWidth() - dx - ddx) | 0), Math.fround((tileBounds.getHalfHeight() + ddy) | 0)));
    this.borderPoints.put(Direction.S, new Point2D$Float()._Point2D$Float$float$float(Math.fround((tileBounds.getHalfWidth() + ddx) | 0), Math.fround((tileBounds.getHeight() - dy - ddy) | 0)));
    this.borderPoints.put(Direction.SW, new Point2D$Float()._Point2D$Float$float$float(Math.fround((tileBounds.getHalfWidth() - ddx) | 0), Math.fround((tileBounds.getHeight() - dy - ddy) | 0)));
    this.borderPoints.put(Direction.W, new Point2D$Float()._Point2D$Float$float$float(Math.fround((dx + ddx) | 0), Math.fround((tileBounds.getHalfHeight() + ddy) | 0)));
    this.borderStroke = new BasicStroke()._BasicStroke$float(Math.fround(dy));
    this.gridStroke = new BasicStroke()._BasicStroke$float(lib.getScaleFactor());
  }
  getFog(): GeneralPath {
    return this.fog;
  }
  getBaseTileOutline(): GeneralPath {
    return this.fog;
  }
  getGridStroke(): Stroke {
    return this.gridStroke;
  }
  getBorderStroke(): Stroke {
    return this.borderStroke;
  }
  getBorderPoints(): EnumMap<Direction, Point2D$Float> {
    return this.borderPoints;
  }
  getControlPoints(): EnumMap<Direction, Point2D$Float> {
    return this.controlPoints;
  }
  getFontNormal(): Font {
    return this.fontNormal;
  }
  getFontProduction(): Font {
    return this.fontProduction;
  }
  getFontItalic(): Font {
    return this.fontItalic;
  }
  getFontTiny(): Font {
    return this.fontTiny;
  }
}

$J.define(MapViewerScaledUtils, 'net.sf.freecol.client.gui.mapviewer.MapViewerScaledUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MapViewerScaledUtils' }, returns: { 'getFontTiny': 'java.awt.Font', 'getFontItalic': 'java.awt.Font', 'getFontProduction': 'java.awt.Font', 'getFontNormal': 'java.awt.Font', 'getControlPoints': 'java.util.EnumMap', 'getBorderPoints': 'java.util.EnumMap', 'getBorderStroke': 'java.awt.Stroke', 'getGridStroke': 'java.awt.Stroke', 'getBaseTileOutline': 'java.awt.geom.GeneralPath', 'getFog': 'java.awt.geom.GeneralPath' } });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  GeneralPath = $J.load('java.awt.geom.GeneralPath');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  TileBounds = $J.load('net.sf.freecol.client.gui.mapviewer.TileBounds');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
});
