// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/Flag.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, BufferedImage, EnumSet, JEnum, JObject } from '../../../../../../../jre/index.ts';

let Color, RenderingHints, AffineTransform, GeneralPath, Path2D, Rectangle2D$Double;

/**
 * This class generates the most common types of flags from a small
 * number of parameters, biased towards flags similar to that of the
 * United States, i.e. flags with a "union", an area filled with stars
 * representing the colonies of the player. Obvious improvements
 * include adding shapes other than stars (e.g. the fleur-de-lys for
 * Quebec) and larger design elements, such as the Southern Cross, or
 * coats of arms.
 *
 * Please feel free to correct any vexillological errors.
 */
export class Flag extends JObject {
  /**
   * Width and height are used in the usual sense, not the
   * vexillological sense.
   */
  static readonly WIDTH: number = 150;
  static readonly HEIGHT: number = 100;
  static SQRT_3: number = 0;
  /**
   * MAGIC NUMBER: the width of decoration elements.
   */
  static readonly DECORATION_SIZE: number = 14.285714285714286;
  static CHEVRON_X: number = 0;
  /**
   * MAGIC NUMBER: the size of the stars in the union.
   */
  static readonly STAR_SIZE: number = 7.000000000000001;
  /**
   * MAGIC NUMBER: the horizontal offset of the vertical bar of the
   * Scandinavian cross.
   */
  static readonly CROSS_OFFSET: number = 28.571428571428573;
  static readonly BEND_X: number = 14.285714285714286;
  static BEND_Y: number = 0;
  static star: GeneralPath = null;
  /**
   * The distribution of stars in the "union", based on historical
   * flags of the United States. This really should be extended to
   * handle rectangles of different shapes.
   */
  static layout: number[][] = null;
  /**
   * If the background is striped, the background colors will be
   * used in turn, from top to bottom, or from left to right. If the
   * background is quartered, the colors will be used clockwise,
   * starting at the top left. If there are more colors than stripes
   * or quarters, the superfluous colors will be ignored.
   */
  backgroundColors: List<Color> = null;
  unionColor: Color = null;
  starColor: Color = null;
  decorationColor: Color = null;
  background: Flag$Background = null;
  decoration: Flag$Decoration = null;
  unionShape: Flag$UnionShape = null;
  unionPosition: Flag$UnionPosition = null;
  /**
   * The number of stars in the union. This value is only relevant
   * if the flag contains a union.
   */
  stars: number = 0;
  /**
   * The number of background stripes. This value is only relevant
   * if the background contains stripes (currently FESSES or
   * PALES).
   */
  stripes: number = 0;
  $init_Flag() {
    this.backgroundColors = new ArrayList();
    this.unionColor = Color.BLUE;
    this.starColor = Color.WHITE;
    this.decorationColor = Color.WHITE;
    this.background = Flag$Background.FESSES;
    this.decoration = Flag$Decoration.NONE;
    this.unionShape = Flag$UnionShape.RECTANGLE;
    this.unionPosition = Flag$UnionPosition.CANTON;
    this.stars = 13;
    this.stripes = 13;
  }
  _Flag$Background$Decoration$UnionPosition(background: Flag$Background, decoration: Flag$Decoration, unionPosition: Flag$UnionPosition): this {
    this._Flag$Background$Decoration$UnionPosition$UnionShape(background, decoration, unionPosition, Flag$UnionShape.RECTANGLE);
    return this;
  }
  _Flag$Background$Decoration$UnionPosition$UnionShape(background: Flag$Background, decoration: Flag$Decoration, unionPosition: Flag$UnionPosition, unionShape: Flag$UnionShape): this {
    this.$init_Flag();
    this.background = background;
    this.decoration = decoration;
    this.unionPosition = unionPosition;
    this.unionShape = unionShape;
    return this;
  }
  /**
   * Returns the background of the flag.
   *
   * @return A {@code Background} value.
   */
  getBackground(): Flag$Background {
    return this.background;
  }
  /**
   * Sets the background of the flag and returns the flag itself.
   *
   * @param background The new {@code Background} value.
   * @return The modified flag.
   */
  setBackground(background: Flag$Background): Flag {
    this.background = background;
    return this;
  }
  /**
   * Returns the decoration of the flag.
   *
   * @return A {@code Decoration} value.
   */
  getDecoration(): Flag$Decoration {
    return this.decoration;
  }
  /**
   * Sets the decoration of the flag and returns the flag itself.
   *
   * @param decoration The new {@code Decoration} value.
   * @return The modified flag.
   */
  setDecoration(decoration: Flag$Decoration): Flag {
    this.decoration = decoration;
    return this;
  }
  /**
   * Returns the union position of the flag.
   *
   * @return A {@code UnionPosition} value.
   */
  getUnionPosition(): Flag$UnionPosition {
    return this.unionPosition;
  }
  /**
   * Sets the union position of the flag and returns the flag
   * itself.
   *
   * @param position The new {@code UnionPosition} value.
   * @return The modified flag.
   */
  setUnionPosition(position: Flag$UnionPosition): Flag {
    this.unionPosition = position;
    return this;
  }
  /**
   * Returns the union shape of the flag.
   *
   * @return A {@code UnionShape} value.
   */
  getUnionShape(): Flag$UnionShape {
    return this.unionShape;
  }
  /**
   * Sets the union shape of the flag and returns the flag itself.
   *
   * @param shape The new {@code UnionShape} value.
   * @return The modified flag.
   */
  setUnionShape(shape: Flag$UnionShape): Flag {
    this.unionShape = shape;
    return this;
  }
  /**
   * Returns a {@code List} of background colors.
   *
   * @return A {@code List} of background colors.
   */
  getBackgroundColors(): List<Color> {
    return this.backgroundColors;
  }
  /**
   * Sets the background colors of the flag and returns the flag
   * itself.
   *
   * @param backgroundColors A {@code List} of background colors.
   * @return The modified flag.
   */
  setBackgroundColors$List(backgroundColors: List<Color>): Flag {
    this.backgroundColors = backgroundColors;
    return this;
  }
  /**
   * Sets the background colors of the flag and returns the flag
   * itself.
   *
   * @param colors A variable number of background colors.
   * @return The modified flag.
   */
  setBackgroundColors$ColorArr(colors: Color[]): Flag {
    this.backgroundColors.clear();
    for (let color of colors) {
      if (color != null) {
        this.backgroundColors.add(color);
      }
    }
    return this;
  }
  /**
   * Returns the union color of the flag.
   *
   * @return A {@code Color} value.
   */
  getUnionColor(): Color {
    return this.unionColor;
  }
  /**
   * Sets the union color of the flag and returns the flag itself.
   *
   * @param unionColor The new {@code Color} value.
   * @return The modified flag.
   */
  setUnionColor(unionColor: Color): Flag {
    this.unionColor = unionColor;
    return this;
  }
  /**
   * Returns the decoration color of the flag.
   *
   * @return A {@code Color} value.
   */
  getDecorationColor(): Color {
    return this.decorationColor;
  }
  /**
   * Sets the decoration color of the flag and returns the flag
   * itself.
   *
   * @param decorationColor The new {@code Color} value.
   * @return The modified flag.
   */
  setDecorationColor(decorationColor: Color): Flag {
    this.decorationColor = decorationColor;
    return this;
  }
  /**
   * Returns the star color of the flag.
   *
   * @return A {@code Color} value.
   */
  getStarColor(): Color {
    return this.starColor;
  }
  /**
   * Sets the star color of the flag and returns the flag itself.
   *
   * @param starColor The new {@code Color} value.
   * @return The modified flag.
   */
  setStarColor(starColor: Color): Flag {
    this.starColor = starColor;
    return this;
  }
  /**
   * Returns the number of stars in the union.
   *
   * @return The number of stars.
   */
  getStars(): number {
    return this.stars;
  }
  /**
   * Sets the number of stars in the union and returns the flag
   * itself.
   *
   * @param stars The new number of stars.
   * @return The modified flag.
   */
  setStars(stars: number): Flag {
    this.stars = stars;
    return this;
  }
  /**
   * Returns the number of background stripes.
   *
   * @return The number of stars.
   */
  getStripes(): number {
    return this.stripes;
  }
  /**
   * Sets the number of background stripes and returns the flag
   * itself.
   *
   * @param stripes The new number of background stripes.
   * @return The modified flag.
   */
  setStripes(stripes: number): Flag {
    this.stripes = stripes;
    return this;
  }
  /**
   * Generates an image of the flag.
   *
   * @return An image of the flag.
   */
  getImage(): BufferedImage {
    let image = new BufferedImage(Flag.WIDTH, Flag.HEIGHT, 1);
    let g = image.createGraphics();
    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    if (this.backgroundColors.isEmpty()) {
      this.backgroundColors.add(Color.BLACK);
    }
    switch (this.background) {
      case Flag$Background.FESSES:
      case Flag$Background.PALES:
        if (this.stripes < 1) {
          this.drawBackground(g);
        } else {
          this.drawStripes(g, this.background.alignment, this.stripes);
        }
        break;
      case Flag$Background.PLAIN:
        this.drawBackground(g);
        break;
      case Flag$Background.QUARTERLY:
        this.drawQuarters(g);
        break;
      case Flag$Background.PER_BEND:
        this.drawPerBend(g, false);
        break;
      case Flag$Background.PER_BEND_SINISTER:
        this.drawPerBend(g, true);
        break;
      case Flag$Background.PER_SALTIRE:
        this.drawPerSaltire(g);
        break;
      default:
        break;
    }
    let decorationShape = null;
    switch (this.decoration) {
      case Flag$Decoration.GREEK_CROSS:
      case Flag$Decoration.CROSS:
      case Flag$Decoration.SCANDINAVIAN_CROSS:
        decorationShape = this.getCross(this.decoration);
        break;
      case Flag$Decoration.CHEVRON:
        decorationShape = this.getTriangle(Flag$UnionShape.CHEVRON, false);
        break;
      case Flag$Decoration.PALL:
        decorationShape = this.getPall();
        break;
      case Flag$Decoration.BEND:
        decorationShape = this.getBend(false);
        break;
      case Flag$Decoration.BEND_SINISTER:
        decorationShape = this.getBend(true);
        break;
      case Flag$Decoration.SALTIRE:
        decorationShape = this.getBend(true);
        decorationShape.append$Shape$boolean(this.getBend(false), false);
        break;
      case Flag$Decoration.SALTIRE_AND_CROSS:
        decorationShape = this.getBend(true);
        decorationShape.append$Shape$boolean(this.getBend(false), false);
        decorationShape.append$Shape$boolean(this.getCross(Flag$Decoration.CROSS), false);
        break;
      default:
        break;
    }
    if (decorationShape != null) {
      g.setColor(this.decorationColor);
      g.fill(decorationShape);
    }
    if (this.unionPosition == null || this.unionPosition === Flag$UnionPosition.NONE) {
      return image;
    }
    let union = null;
    let starShape = null;
    if (this.unionShape == null && this.decoration != null) {
      this.unionShape = this.decoration.getUnionShape();
    }
    if (this.unionShape == null) {
      return image;
    }
    {
      let rectangle: Rectangle2D$Double;
      switch (this.unionShape) {
        case Flag$UnionShape.RECTANGLE:
          rectangle = this.getRectangle();
          union = new GeneralPath()._GeneralPath$Shape(rectangle);
          starShape = this.getUnionRectangle(rectangle);
          break;
        case Flag$UnionShape.CHEVRON:
          union = this.getTriangle(this.unionShape, this.decoration === Flag$Decoration.PALL);
          starShape = this.getUnionTriangle(true);
          break;
        case Flag$UnionShape.BEND:
          union = this.getTriangle(this.unionShape, (this.decoration === Flag$Decoration.BEND) || (this.decoration === Flag$Decoration.BEND_SINISTER));
          starShape = this.getUnionTriangle(false);
          this.transformBend(union);
          this.transformBend(starShape);
          break;
        case Flag$UnionShape.RHOMBUS:
          union = this.getRhombus();
          starShape = this.getUnionRhombus();
          break;
        case Flag$UnionShape.TRIANGLE:
          union = this.getTriangle(this.unionShape, this.decoration === Flag$Decoration.SALTIRE);
          starShape = this.getUnionTriangle(true);
          this.transformTriangle(union);
          this.transformTriangle(starShape);
          break;
        default:
          break;
      }
    }
    if (!(union == null || this.unionColor == null)) {
      g.setColor(this.unionColor);
      g.fill(union);
    }
    if (starShape != null) {
      g.setColor(this.starColor);
      g.fill(starShape);
    }
    g.dispose();
    return image;
  }
  /**
   * Return the stars in a rectangular "union", distributed
   * according to rules derived from historical flags of the United
   * States.
   *
   * @param union The rectangular area to fill.
   * @return The union path
   */
  getUnionRectangle(union: Rectangle2D$Double): GeneralPath {
    if (union == null) {
      return null;
    }
    let unionPath: GeneralPath;
    if (this.stars < 14) {
      let radius = 0.3 * Math.min(union.height_, union.width_);
      unionPath = this.getCircleOfStars(radius);
    } else {
      unionPath = this.getGridOfStars(union);
    }
    let x = union.x_ + union.width_ / 2;
    let y = union.y_ + union.height_ / 2;
    this.center(unionPath, x, y);
    return unionPath;
  }
  getUnionTriangle(isosceles: boolean): GeneralPath {
    let small = (this.decoration === Flag$Decoration.PALL || this.decoration === Flag$Decoration.BEND || this.decoration === Flag$Decoration.BEND_SINISTER);
    let x = 0;
    let y = 0;
    let r = 0;
    if (this.unionShape === Flag$UnionShape.CHEVRON) {
      x = Flag.CHEVRON_X;
      y = Flag.HEIGHT;
      if (small) {
        x -= Flag.BEND_X;
        y -= 2 * Flag.BEND_Y;
      }
      r = Flag.SQRT_3 * y / 6;
    } else if (this.unionShape === Flag$UnionShape.TRIANGLE) {
      if (this.unionPosition === Flag$UnionPosition.LEFT || this.unionPosition === Flag$UnionPosition.RIGHT) {
        x = $J.idiv(Flag.WIDTH, 2);
        y = Flag.HEIGHT;
        if (small) {
          x -= Flag.BEND_X;
          y -= 2 * Flag.BEND_Y;
        }
        r = Flag.SQRT_3 * y / 6;
      } else {
        x = $J.idiv(Flag.HEIGHT, 2);
        y = Flag.WIDTH;
        if (small) {
          x -= Flag.BEND_Y;
          y -= 2 * Flag.BEND_X;
        }
        let h = y / 2;
        let c = Math.sqrt(h * h + x * x);
        r = x * y / (y + 2 * c);
      }
    } else {
      x = Flag.WIDTH;
      y = Flag.HEIGHT;
      if (small) {
        x -= Flag.BEND_X;
        y -= Flag.BEND_Y;
      }
      let c = Math.sqrt(x * x + y * y);
      let A = x * y / 2;
      r = 2 * A / (x + y + c);
    }
    let radius = r * 0.6;
    let unionPath = new GeneralPath()._GeneralPath$();
    if (this.stars < 14) {
      unionPath = this.getCircleOfStars(radius);
      if (isosceles) {
        if (this.unionPosition === Flag$UnionPosition.LEFT || this.unionPosition === Flag$UnionPosition.RIGHT) {
          this.center(unionPath, r, $J.idiv(Flag.HEIGHT, 2));
        } else {
          this.center(unionPath, r, $J.idiv(Flag.WIDTH, 2));
        }
      } else {
        this.center(unionPath, r, r);
      }
    } else {
      let sum = 0;
      let rows = 1;
      while (sum < this.stars) {
        sum = (sum + rows) | 0;
        rows++;
      }
      let missing = (sum - this.stars) | 0;
      let slope = y / x;
      let dx = x / rows;
      let xx = dx / 2;
      let height = y - xx * slope;
      let offset = 0;
      rows--;
      let dy = height / rows;
      for (let index = rows; index > 0; index--) {
        if (isosceles) {
          height = y - xx * slope;
          dy = height / index;
          offset = (Flag.HEIGHT - height) / 2;
        }
        let yy = dy / 2;
        let count = index;
        if (missing > 0) {
          count = (index - missing) | 0;
          yy += missing / 2 * dy;
          missing = 0;
        }
        for (let star = 0; star < count; star++) {
          unionPath.append$Shape$boolean(this.getStar$double$double$Flag(xx, yy + offset), false);
          yy += dy;
        }
        xx += dx;
      }
    }
    return unionPath;
  }
  /**
   * Flip or rotate a top left triangle so that it fits another
   * corner.
   *
   * @param triangle The top left triangle.
   */
  transformBend(triangle: GeneralPath): void {
    if (this.unionPosition === Flag$UnionPosition.TOP) {
      if (this.decoration === Flag$Decoration.BEND) {
        triangle.transform(AffineTransform.getScaleInstance(-1, 1));
        triangle.transform(AffineTransform.getTranslateInstance(Flag.WIDTH, 0));
      } else if (this.decoration === Flag$Decoration.BEND_SINISTER) {
      }
    } else if (this.unionPosition === Flag$UnionPosition.BOTTOM) {
      if (this.decoration === Flag$Decoration.BEND) {
        triangle.transform(AffineTransform.getScaleInstance(1, -1));
        triangle.transform(AffineTransform.getTranslateInstance(0, Flag.HEIGHT));
      } else if (this.decoration === Flag$Decoration.BEND_SINISTER) {
        triangle.transform(AffineTransform.getQuadrantRotateInstance$int(2));
        triangle.transform(AffineTransform.getTranslateInstance(Flag.WIDTH, Flag.HEIGHT));
      }
    }
  }
  /**
   * Flip or rotate a left triangle so that it fits another side.
   *
   * @param triangle The left triangle.
   */
  transformTriangle(triangle: GeneralPath): void {
    switch (this.unionPosition) {
      case Flag$UnionPosition.TOP:
        triangle.transform(AffineTransform.getQuadrantRotateInstance$int(1));
        triangle.transform(AffineTransform.getTranslateInstance(Flag.WIDTH, 0));
        break;
      case Flag$UnionPosition.BOTTOM:
        triangle.transform(AffineTransform.getQuadrantRotateInstance$int(3));
        triangle.transform(AffineTransform.getTranslateInstance(0, Flag.HEIGHT));
        break;
      case Flag$UnionPosition.RIGHT:
        triangle.transform(AffineTransform.getScaleInstance(-1, 1));
        triangle.transform(AffineTransform.getTranslateInstance(Flag.WIDTH, 0));
        break;
      case Flag$UnionPosition.LEFT:
      default:
    }
  }
  getUnionRhombus(): GeneralPath {
    let unionPath = new GeneralPath()._GeneralPath$();
    let count = 1;
    let square = 1;
    while (square < this.stars) {
      count++;
      square = Math.imul(count, count);
    }
    let rows = $J.idiv(this.stars, count);
    if (Math.imul(rows, count) < this.stars) {
      rows++;
    }
    let starCount = 0;
    let a = $J.idiv(Flag.WIDTH, 2) - Flag.BEND_X;
    let b = $J.idiv(Flag.HEIGHT, 2) - Flag.BEND_Y;
    if (this.stars < 14) {
      let c = Math.sqrt(a * a + b * b);
      let r = (a * b) / c;
      let radius = 0.6 * r;
      unionPath = this.getCircleOfStars(radius);
      this.center(unionPath, $J.idiv(Flag.WIDTH, 2), $J.idiv(Flag.HEIGHT, 2));
    } else {
      let dx = a / count;
      let dy = b / count;
      let dx1 = a / rows;
      let dy1 = b / rows;
      outer:
      for (let index = 0; index < rows; index++) {
        let x = Flag.BEND_X + dx + index * dx1;
        let y = $J.idiv(Flag.HEIGHT, 2) - index * dy1;
        for (let star = 0; star < count; star++) {
          unionPath.append$Shape$boolean(this.getStar$double$double$Flag(x, y), false);
          starCount++;
          if (starCount === this.stars) {
            break outer;
          } else {
            x += dx;
            y += dy;
          }
        }
      }
    }
    return unionPath;
  }
  /**
   * Calculate the width of stripes on the basis of the given
   * alignment.
   *
   * @param alignment The alignment of the stripes.
   * @return The width of the stripes.
   */
  getStripeWidth(alignment: Flag$Alignment): number {
    return (alignment === Flag$Alignment.HORIZONTAL) ? Flag.WIDTH : Flag.WIDTH / this.stripes;
  }
  /**
   * Calculate the height of stripes on the basis of the given
   * alignment.
   *
   * @param alignment The alignment of the stripes.
   * @return The height of the stripes.
   */
  getStripeHeight(alignment: Flag$Alignment): number {
    return (alignment === Flag$Alignment.VERTICAL) ? Flag.HEIGHT : Flag.HEIGHT / this.stripes;
  }
  drawBackground(g: Graphics2D): void {
    g.setColor(this.backgroundColors.get(0));
    g.fillRect(0, 0, Flag.WIDTH, Flag.HEIGHT);
  }
  drawStripes(g: Graphics2D, alignment: Flag$Alignment, stripes: number): void {
    let colors = this.backgroundColors.size();
    let stripeWidth = this.getStripeWidth(alignment);
    let stripeHeight = this.getStripeHeight(alignment);
    let x = (alignment === Flag$Alignment.VERTICAL) ? stripeWidth : 0;
    let y = (alignment === Flag$Alignment.HORIZONTAL) ? stripeHeight : 0;
    let rectangle = new Rectangle2D$Double()._Rectangle2D$Double$();
    for (let index = 0; index < stripes; index++) {
      g.setColor(this.backgroundColors.get(index % colors));
      rectangle.setRect$double$double$double$double(index * x, index * y, stripeWidth, stripeHeight);
      g.fill(rectangle);
    }
  }
  drawQuarters(g: Graphics2D): void {
    let colors = this.backgroundColors.size();
    let x = [0, 1, 1, 0];
    let y = [0, 0, 1, 1];
    let halfWidth = $J.idiv(Flag.WIDTH, 2);
    let halfHeight = $J.idiv(Flag.HEIGHT, 2);
    let offset = (this.decoration === Flag$Decoration.SCANDINAVIAN_CROSS) ? Flag.CROSS_OFFSET : 0;
    let rectangle = new Rectangle2D$Double()._Rectangle2D$Double$();
    for (let index = 0; index < 4; index++) {
      g.setColor(this.backgroundColors.get(index % colors));
      rectangle.setRect$double$double$double$double(x[index] * halfWidth - offset, y[index] * halfHeight, halfWidth + x[index] * offset, halfHeight);
      g.fill(rectangle);
    }
  }
  drawPerBend(g: Graphics2D, sinister: boolean): void {
    this.drawBackground(g);
    let colors = this.backgroundColors.size();
    let path = new GeneralPath()._GeneralPath$();
    path.moveTo$float$float(0, Math.fround(Flag.HEIGHT));
    path.lineTo$float$float(Math.fround(sinister ? Flag.WIDTH : 0), 0);
    path.lineTo$float$float(Math.fround(Flag.WIDTH), Math.fround(Flag.HEIGHT));
    g.setColor(this.backgroundColors.get(1 % colors));
    g.fill(path);
  }
  drawPerSaltire(g: Graphics2D): void {
    let colors = this.backgroundColors.size();
    let path = new GeneralPath()._GeneralPath$();
    let x = [0, Flag.WIDTH, Flag.WIDTH, 0];
    let y = [0, 0, Flag.HEIGHT, Flag.HEIGHT];
    let halfWidth = $J.idiv(Flag.WIDTH, 2);
    let halfHeight = $J.idiv(Flag.HEIGHT, 2);
    for (let index = 0; index < 4; index++) {
      path.moveTo$float$float(Math.fround(x[index]), Math.fround(y[index]));
      path.lineTo$double$double(halfWidth, halfHeight);
      let nextIndex = ((index + 1) | 0) % 4;
      path.lineTo$float$float(Math.fround(x[nextIndex]), Math.fround(y[nextIndex]));
      g.setColor(this.backgroundColors.get(index % colors));
      g.fill(path);
      path.reset();
    }
  }
  getCross(decoration: Flag$Decoration): GeneralPath {
    let quarterWidth = (Flag.WIDTH - Flag.DECORATION_SIZE) / 2;
    let quarterHeight = (Flag.HEIGHT - Flag.DECORATION_SIZE) / 2;
    let offset = 0;
    let width = Flag.WIDTH;
    let height = Flag.HEIGHT;
    switch (decoration) {
      case Flag$Decoration.SCANDINAVIAN_CROSS:
        offset = Flag.CROSS_OFFSET;
        break;
      case Flag$Decoration.GREEK_CROSS:
        width = height = Math.min(Flag.WIDTH, Flag.HEIGHT) - 2 * Flag.DECORATION_SIZE;
        break;
      default:
        break;
    }
    let cross = new GeneralPath()._GeneralPath$();
    cross.append$Shape$boolean(new Rectangle2D$Double()._Rectangle2D$Double$double$double$double$double((Flag.WIDTH - width) / 2, quarterHeight, width, Flag.DECORATION_SIZE), false);
    cross.append$Shape$boolean(new Rectangle2D$Double()._Rectangle2D$Double$double$double$double$double(quarterWidth - offset, (Flag.HEIGHT - height) / 2, Flag.DECORATION_SIZE, height), false);
    return cross;
  }
  getBend(sinister: boolean): GeneralPath {
    let path = new GeneralPath()._GeneralPath$();
    if (sinister) {
      path.moveTo$float$float(0, Math.fround(Flag.HEIGHT));
      path.lineTo$double$double(0, Flag.HEIGHT - Flag.BEND_Y);
      path.lineTo$double$double(Flag.WIDTH - Flag.BEND_X, 0);
      path.lineTo$float$float(Math.fround(Flag.WIDTH), 0);
      path.lineTo$double$double(Flag.WIDTH, Flag.BEND_Y);
      path.lineTo$double$double(Flag.BEND_X, Flag.HEIGHT);
    } else {
      path.moveTo$float$float(0, 0);
      path.lineTo$double$double(Flag.BEND_X, 0);
      path.lineTo$double$double(Flag.WIDTH, Flag.HEIGHT - Flag.BEND_Y);
      path.lineTo$float$float(Math.fround(Flag.WIDTH), Math.fround(Flag.HEIGHT));
      path.lineTo$double$double(Flag.WIDTH - Flag.BEND_X, Flag.HEIGHT);
      path.lineTo$double$double(0, Flag.BEND_Y);
    }
    return path;
  }
  getPall(): GeneralPath {
    let y1 = (Flag.HEIGHT - Flag.DECORATION_SIZE) / 2;
    let y2 = (Flag.HEIGHT + Flag.DECORATION_SIZE) / 2;
    let x = Flag.BEND_X + y1 * Flag.SQRT_3;
    let path = new GeneralPath()._GeneralPath$Shape(this.getTriangle(Flag$UnionShape.CHEVRON, true));
    path.lineTo$float$float(0, Math.fround(Flag.HEIGHT));
    path.lineTo$double$double(Flag.BEND_X, Flag.HEIGHT);
    path.lineTo$double$double(x, y2);
    path.lineTo$double$double(Flag.WIDTH, y2);
    path.lineTo$double$double(Flag.WIDTH, y1);
    path.lineTo$double$double(x, y1);
    path.lineTo$double$double(Flag.BEND_X, 0);
    path.lineTo$float$float(0, 0);
    return path;
  }
  /**
   * Returns a triangle of the given shape and size. This is a large
   * top left triangle if the given shape is BEND, and a small left
   * triangle if the given shape is CHEVRON or TRIANGLE.
   *
   * @param unionShape The shape of the union.
   * @param small Whether the shape is limited by decorations.
   * @return The triangle shape.
   */
  getTriangle(unionShape: Flag$UnionShape, small: boolean): GeneralPath {
    let path = new GeneralPath()._GeneralPath$();
    let x = 0;
    let y = 0;
    if (small) {
      x = Flag.BEND_X;
      y = Flag.BEND_Y;
    }
    switch (unionShape) {
      case Flag$UnionShape.BEND:
        path.moveTo$double$double(0, Flag.HEIGHT - y);
        path.lineTo$float$float(0, 0);
        path.lineTo$double$double(Flag.WIDTH - x, 0);
        break;
      case Flag$UnionShape.CHEVRON:
        path.moveTo$double$double(0, y);
        path.lineTo$double$double(Flag.CHEVRON_X - x, $J.idiv(Flag.HEIGHT, 2));
        path.lineTo$double$double(0, Flag.HEIGHT - y);
        break;
      case Flag$UnionShape.TRIANGLE:
        if (this.unionPosition === Flag$UnionPosition.LEFT || this.unionPosition === Flag$UnionPosition.RIGHT) {
          path.moveTo$double$double(0, y);
          path.lineTo$double$double($J.idiv(Flag.WIDTH, 2) - x, $J.idiv(Flag.HEIGHT, 2));
          path.lineTo$double$double(0, Flag.HEIGHT - y);
        } else {
          path.moveTo$double$double(0, x);
          path.lineTo$double$double($J.idiv(Flag.HEIGHT, 2) - y, $J.idiv(Flag.WIDTH, 2));
          path.lineTo$double$double(0, Flag.WIDTH - x);
        }
        break;
      default:
        break;
    }
    return path;
  }
  getRhombus(): GeneralPath {
    let rhombus = new GeneralPath()._GeneralPath$();
    rhombus.moveTo$double$double($J.idiv(Flag.WIDTH, 2), Flag.BEND_Y);
    rhombus.lineTo$double$double(Flag.WIDTH - Flag.BEND_X, $J.idiv(Flag.HEIGHT, 2));
    rhombus.lineTo$double$double($J.idiv(Flag.WIDTH, 2), Flag.HEIGHT - Flag.BEND_Y);
    rhombus.lineTo$double$double(Flag.BEND_X, $J.idiv(Flag.HEIGHT, 2));
    return rhombus;
  }
  getRectangle(): Rectangle2D$Double {
    if (this.unionPosition == null || this.unionPosition === Flag$UnionPosition.NONE) {
      return null;
    }
    let union = new Rectangle2D$Double()._Rectangle2D$Double$();
    if (this.unionPosition.alignment === Flag$Alignment.VERTICAL) {
      if (this.background.alignment === Flag$Alignment.VERTICAL && this.stripes < 3) {
        union.width_ = Flag.WIDTH / this.stripes;
        if (this.stripes === 2 && this.unionPosition === Flag$UnionPosition.RIGHT) {
          union.x_ = $J.idiv(Flag.WIDTH, 2);
        }
      } else {
        union.width_ = $J.idiv(Flag.WIDTH, 3);
        union.x_ = this.unionPosition.index_ * union.width_;
      }
      union.height_ = Flag.HEIGHT;
    } else if (this.unionPosition.alignment === Flag$Alignment.HORIZONTAL) {
      if (this.background.alignment === Flag$Alignment.HORIZONTAL && this.stripes < 3) {
        union.height_ = Flag.HEIGHT / this.stripes;
        if (this.stripes === 2 && this.unionPosition === Flag$UnionPosition.BOTTOM) {
          union.y_ = $J.idiv(Flag.HEIGHT, 2);
        }
      } else {
        union.height_ = $J.idiv(Flag.HEIGHT, 3);
        union.y_ = this.unionPosition.index_ * union.height_;
      }
      union.width_ = Flag.WIDTH;
    } else {
      union.width_ = $J.idiv(Flag.WIDTH, 2);
      union.height_ = $J.idiv(Flag.HEIGHT, 2);
      if (this.background.alignment === Flag$Alignment.HORIZONTAL) {
        union.height_ = (this.stripes < 3) ? $J.idiv(Flag.HEIGHT, 2) : (this.stripes / 2) * this.getStripeHeight(this.background.alignment);
      } else if (this.background.alignment === Flag$Alignment.VERTICAL) {
        union.width_ = (this.stripes < 3) ? $J.idiv(Flag.WIDTH, 2) : (this.stripes / 2) * this.getStripeWidth(this.background.alignment);
      }
      if (this.decoration === Flag$Decoration.GREEK_CROSS || this.decoration === Flag$Decoration.CROSS) {
        union.width_ = (Flag.WIDTH - Flag.DECORATION_SIZE) / 2;
        union.height_ = (Flag.HEIGHT - Flag.DECORATION_SIZE) / 2;
      } else if (this.decoration === Flag$Decoration.SCANDINAVIAN_CROSS) {
        union.width_ = (Flag.WIDTH - Flag.DECORATION_SIZE) / 2 - Flag.CROSS_OFFSET;
        union.height_ = (Flag.HEIGHT - Flag.DECORATION_SIZE) / 2;
      }
    }
    return union;
  }
  /**
   * Return the basic five-point star.
   *
   * @return the basic star shape
   */
  static get5Star(): GeneralPath {
    let star = new GeneralPath()._GeneralPath$int(Path2D.WIND_NON_ZERO);
    let angle = 2 * 3.141592653589793 / 5;
    let radius = Flag.STAR_SIZE / 2;
    let x = 0;
    let y = -radius;
    star.moveTo$double$double(x, y);
    let vertex = [2, 4, 1, 3];
    for (let i of vertex) {
      let phi = i * angle;
      x = radius * Math.sin(phi);
      y = -radius * Math.cos(phi);
      star.lineTo$double$double(x, y);
    }
    star.closePath();
    return star;
  }
  /**
   * Returns a star at the given coordinates (x, y).
   *
   * @param x The x coordinate of the star.
   * @param y The y coordinate of the star.
   * @return The star shape.
   */
  getStar$double$double$Flag(x: number, y: number): GeneralPath {
    return this.getStar$double$double$double$Flag(-1, x, y);
  }
  /**
   * Returns a star of the given scale at the given coordinates (x, y).
   *
   * @param scale The scale of the star.
   * @param x The x coordinate of the star.
   * @param y The y coordinate of the star.
   * @return The star shape.
   */
  getStar$double$double$double$Flag(scale: number, x: number, y: number): GeneralPath {
    let newStar = new GeneralPath()._GeneralPath$Shape(Flag.star);
    if (scale > 0) {
      newStar.transform(AffineTransform.getScaleInstance(scale, scale));
    }
    newStar.transform(AffineTransform.getTranslateInstance(x, y));
    return newStar;
  }
  /**
   * Centers the given path on the given point (x,y).
   *
   * @param path The path to center.
   * @param x The x coordinate of the center.
   * @param y The y coordinate of the center.
   */
  center(path: GeneralPath, x: number, y: number): void {
    let dx = x - path.getBounds().getX() - path.getBounds().getWidth() / 2;
    let dy = y - path.getBounds().getY() - path.getBounds().getHeight() / 2;
    path.transform(AffineTransform.getTranslateInstance(dx, dy));
  }
  /**
   * Returns either a single star, or a circle of stars with the
   * given radius, centered at the origin.
   *
   * @param radius The radius of the circle.
   * @return The circle of stars.
   */
  getCircleOfStars(radius: number): GeneralPath {
    let phi = 3.141592653589793 * 2 / this.stars;
    let unionPath = new GeneralPath()._GeneralPath$();
    if (this.stars === 0) {
    } else if (this.stars === 1) {
      unionPath = this.getStar$double$double$double$Flag(2, 0, 0);
    } else if (this.stars === 2) {
      unionPath.append$Shape$boolean(this.getStar$double$double$double$Flag(1.5, -radius, 0), false);
      unionPath.append$Shape$boolean(this.getStar$double$double$double$Flag(1.5, radius, 0), false);
    } else {
      for (let i = 0; i < this.stars; i++) {
        let x = -radius - radius * (Math.sin(i * phi));
        let y = -radius * (Math.cos(i * phi));
        unionPath.append$Shape$boolean(this.getStar$double$double$Flag(x, y), false);
      }
    }
    return unionPath;
  }
  getGridOfStars(union: Rectangle2D$Double): GeneralPath {
    let bars = $J.newArray(2, 0);
    for (let count = this.stars; count < 51; count++) {
      if (Flag.layout[count][0] > 0) {
        bars = Flag.layout[count];
        break;
      }
    }
    let maxCols = Math.max(bars[0], bars[1]);
    let rows = 2;
    let sum = (bars[0] + bars[1]) | 0;
    while (sum < this.stars) {
      sum = (sum + bars[rows % 2]) | 0;
      rows++;
    }
    let hSpace = union.getWidth() / (Math.imul(2, maxCols));
    let vSpace = union.getHeight() / (Math.imul(2, rows));
    let y = 0;
    let grid = new GeneralPath()._GeneralPath$();
    let count = 1;
    for (let row = 0; row < rows; row++) {
      let cols = bars[row % 2];
      let x = (cols === maxCols) ? 0 : hSpace;
      for (let col = 0; col < cols; col++) {
        if (count > this.stars) {
          break;
        }
        grid.append$Shape$boolean(this.getStar$double$double$Flag(x, y), false);
        x += 2 * hSpace;
        count++;
      }
      y += 2 * vSpace;
    }
    return grid;
  }
  static $clinit() {
    Flag.SQRT_3 = Math.sqrt(3);
    Flag.CHEVRON_X = Flag.SQRT_3 * Flag.HEIGHT / 2;
    Flag.BEND_Y = Flag.DECORATION_SIZE / Flag.SQRT_3;
    Flag.star = Flag.get5Star();
    Flag.layout = $J.newArrayN([51, 2], 0);
    for (let bars of [[5, 4], [5, 6], [6, 5], [5, 5]]) {
      let sum = (bars[0] + bars[1]) | 0;
      let even = true;
      while (sum < 51) {
        Flag.layout[sum] = bars;
        if (even) {
          sum = (sum + bars[0]) | 0;
          even = false;
        } else {
          sum = (sum + bars[1]) | 0;
          even = true;
        }
      }
    }
  }
}

/**
 * The alignment of stripes or other design elements on the
 * flag. Might be extended to handle diagonal alignment
 * (Friesland, for example).
 */
export class Flag$Alignment extends JEnum {
  static NONE: Flag$Alignment = null;
  static HORIZONTAL: Flag$Alignment = null;
  static VERTICAL: Flag$Alignment = null;
  static $VALUES: Flag$Alignment[] = null;
  _Flag$Alignment($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Flag$Alignment[] { return Flag$Alignment.$VALUES.slice(); }
  static valueOf(name: string): Flag$Alignment { return $J.enumValueOf(Flag$Alignment, name); }
  static $clinit() {
    Flag$Alignment.NONE = new Flag$Alignment()._Flag$Alignment('NONE', 0);
    Flag$Alignment.HORIZONTAL = new Flag$Alignment()._Flag$Alignment('HORIZONTAL', 1);
    Flag$Alignment.VERTICAL = new Flag$Alignment()._Flag$Alignment('VERTICAL', 2);
    Flag$Alignment.$VALUES = [Flag$Alignment.NONE, Flag$Alignment.HORIZONTAL, Flag$Alignment.VERTICAL];
  }
}

/**
 * The "background layer" of the flag, generally one or several
 * squares or triangles of different color. The alignment of the
 * background influences the size of the canton, if there is one.
 */
export class Flag$Background extends JEnum {
  alignment: Flag$Alignment = null;
  static PLAIN: Flag$Background = null;
  static QUARTERLY: Flag$Background = null;
  static PALES: Flag$Background = null;
  static FESSES: Flag$Background = null;
  static PER_BEND: Flag$Background = null;
  static PER_BEND_SINISTER: Flag$Background = null;
  static PER_SALTIRE: Flag$Background = null;
  static $VALUES: Flag$Background[] = null;
  _Flag$Background($name: string, $ordinal: number, alignment: Flag$Alignment): this {
    this._JEnum($name, $ordinal);
    this.alignment = alignment;
    return this;
  }
  static values(): Flag$Background[] { return Flag$Background.$VALUES.slice(); }
  static valueOf(name: string): Flag$Background { return $J.enumValueOf(Flag$Background, name); }
  static $clinit() {
    Flag$Background.PLAIN = new Flag$Background()._Flag$Background('PLAIN', 0, Flag$Alignment.NONE);
    Flag$Background.QUARTERLY = new Flag$Background()._Flag$Background('QUARTERLY', 1, Flag$Alignment.NONE);
    Flag$Background.PALES = new Flag$Background()._Flag$Background('PALES', 2, Flag$Alignment.VERTICAL);
    Flag$Background.FESSES = new Flag$Background()._Flag$Background('FESSES', 3, Flag$Alignment.HORIZONTAL);
    Flag$Background.PER_BEND = new Flag$Background()._Flag$Background('PER_BEND', 4, Flag$Alignment.NONE);
    Flag$Background.PER_BEND_SINISTER = new Flag$Background()._Flag$Background('PER_BEND_SINISTER', 5, Flag$Alignment.NONE);
    Flag$Background.PER_SALTIRE = new Flag$Background()._Flag$Background('PER_SALTIRE', 6, Flag$Alignment.NONE);
    Flag$Background.$VALUES = [Flag$Background.PLAIN, Flag$Background.QUARTERLY, Flag$Background.PALES, Flag$Background.FESSES, Flag$Background.PER_BEND, Flag$Background.PER_BEND_SINISTER, Flag$Background.PER_SALTIRE];
  }
}

/**
 * The "middle layer" of the flag, generally a number of vertical,
 * horizontal or diagonal bars. The decoration limits the shape
 * and possible positions of the "union".
 */
export class Flag$Decoration extends JEnum {
  unionShape: Flag$UnionShape = null;
  unionPositions: JSet<Flag$UnionPosition> = null;
  static NONE: Flag$Decoration = null;
  static CROSS: Flag$Decoration = null;
  static GREEK_CROSS: Flag$Decoration = null;
  static SCANDINAVIAN_CROSS: Flag$Decoration = null;
  static CHEVRON: Flag$Decoration = null;
  static PALL: Flag$Decoration = null;
  static BEND: Flag$Decoration = null;
  static BEND_SINISTER: Flag$Decoration = null;
  static SALTIRE: Flag$Decoration = null;
  static SALTIRE_AND_CROSS: Flag$Decoration = null;
  static $VALUES: Flag$Decoration[] = null;
  $init_Flag_Decoration() {
    this.unionShape = Flag$UnionShape.RECTANGLE;
    this.unionPositions = EnumSet.allOf($J.cls(Flag$UnionPosition));
  }
  _Flag$Decoration$UnionPositionArr($name: string, $ordinal: number, positions: Flag$UnionPosition[]): this {
    this._JEnum($name, $ordinal);
    this.$init_Flag_Decoration();
    this.unionPositions = EnumSet.of(Flag$UnionPosition.NONE);
    for (let position of positions) {
      this.unionPositions.add(position);
    }
    return this;
  }
  _Flag$Decoration$UnionShape$UnionPositionArr($name: string, $ordinal: number, shape: Flag$UnionShape, positions: Flag$UnionPosition[]): this {
    this._Flag$Decoration$UnionPositionArr($name, $ordinal, positions);
    this.unionShape = shape;
    return this;
  }
  getUnionShape(): Flag$UnionShape {
    return this.unionShape;
  }
  getUnionPositions(): JSet<Flag$UnionPosition> {
    return this.unionPositions;
  }
  static values(): Flag$Decoration[] { return Flag$Decoration.$VALUES.slice(); }
  static valueOf(name: string): Flag$Decoration { return $J.enumValueOf(Flag$Decoration, name); }
  static $clinit() {
    Flag$Decoration.NONE = new Flag$Decoration()._Flag$Decoration$UnionPositionArr('NONE', 0, []);
    Flag$Decoration.CROSS = new Flag$Decoration()._Flag$Decoration$UnionPositionArr('CROSS', 1, [Flag$UnionPosition.CANTON]);
    Flag$Decoration.GREEK_CROSS = new Flag$Decoration()._Flag$Decoration$UnionPositionArr('GREEK_CROSS', 2, [Flag$UnionPosition.CANTON]);
    Flag$Decoration.SCANDINAVIAN_CROSS = new Flag$Decoration()._Flag$Decoration$UnionPositionArr('SCANDINAVIAN_CROSS', 3, [Flag$UnionPosition.CANTON]);
    Flag$Decoration.CHEVRON = new Flag$Decoration()._Flag$Decoration$UnionShape$UnionPositionArr('CHEVRON', 4, Flag$UnionShape.CHEVRON, [Flag$UnionPosition.LEFT]);
    Flag$Decoration.PALL = new Flag$Decoration()._Flag$Decoration$UnionShape$UnionPositionArr('PALL', 5, Flag$UnionShape.CHEVRON, [Flag$UnionPosition.LEFT]);
    Flag$Decoration.BEND = new Flag$Decoration()._Flag$Decoration$UnionShape$UnionPositionArr('BEND', 6, Flag$UnionShape.BEND, [Flag$UnionPosition.TOP, Flag$UnionPosition.BOTTOM]);
    Flag$Decoration.BEND_SINISTER = new Flag$Decoration()._Flag$Decoration$UnionShape$UnionPositionArr('BEND_SINISTER', 7, Flag$UnionShape.BEND, [Flag$UnionPosition.TOP, Flag$UnionPosition.BOTTOM]);
    Flag$Decoration.SALTIRE = new Flag$Decoration()._Flag$Decoration$UnionShape$UnionPositionArr('SALTIRE', 8, Flag$UnionShape.CHEVRON, [Flag$UnionPosition.TOP, Flag$UnionPosition.BOTTOM, Flag$UnionPosition.LEFT, Flag$UnionPosition.RIGHT]);
    Flag$Decoration.SALTIRE_AND_CROSS = new Flag$Decoration()._Flag$Decoration$UnionPositionArr('SALTIRE_AND_CROSS', 9, [Flag$UnionPosition.CANTON]);
    Flag$Decoration.$VALUES = [Flag$Decoration.NONE, Flag$Decoration.CROSS, Flag$Decoration.GREEK_CROSS, Flag$Decoration.SCANDINAVIAN_CROSS, Flag$Decoration.CHEVRON, Flag$Decoration.PALL, Flag$Decoration.BEND, Flag$Decoration.BEND_SINISTER, Flag$Decoration.SALTIRE, Flag$Decoration.SALTIRE_AND_CROSS];
  }
}

/**
 * The shape of the "union", which generally depends on the
 * decoration or background of the flag.
 */
export class Flag$UnionShape extends JEnum {
  static RECTANGLE: Flag$UnionShape = null;
  static TRIANGLE: Flag$UnionShape = null;
  static CHEVRON: Flag$UnionShape = null;
  static BEND: Flag$UnionShape = null;
  static RHOMBUS: Flag$UnionShape = null;
  static $VALUES: Flag$UnionShape[] = null;
  _Flag$UnionShape($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Flag$UnionShape[] { return Flag$UnionShape.$VALUES.slice(); }
  static valueOf(name: string): Flag$UnionShape { return $J.enumValueOf(Flag$UnionShape, name); }
  static $clinit() {
    Flag$UnionShape.RECTANGLE = new Flag$UnionShape()._Flag$UnionShape('RECTANGLE', 0);
    Flag$UnionShape.TRIANGLE = new Flag$UnionShape()._Flag$UnionShape('TRIANGLE', 1);
    Flag$UnionShape.CHEVRON = new Flag$UnionShape()._Flag$UnionShape('CHEVRON', 2);
    Flag$UnionShape.BEND = new Flag$UnionShape()._Flag$UnionShape('BEND', 3);
    Flag$UnionShape.RHOMBUS = new Flag$UnionShape()._Flag$UnionShape('RHOMBUS', 4);
    Flag$UnionShape.$VALUES = [Flag$UnionShape.RECTANGLE, Flag$UnionShape.TRIANGLE, Flag$UnionShape.CHEVRON, Flag$UnionShape.BEND, Flag$UnionShape.RHOMBUS];
  }
}

/**
 * The position of the "union", which depends on the alignment of
 * the background. The "canton" is the top left quarter of the
 * flag. Other quarters might be added.
 */
export class Flag$UnionPosition extends JEnum {
  alignment: Flag$Alignment = null;
  index_: number = 0;
  static LEFT: Flag$UnionPosition = null;
  static CENTER: Flag$UnionPosition = null;
  static RIGHT: Flag$UnionPosition = null;
  static TOP: Flag$UnionPosition = null;
  static MIDDLE: Flag$UnionPosition = null;
  static BOTTOM: Flag$UnionPosition = null;
  static CANTON: Flag$UnionPosition = null;
  static NONE: Flag$UnionPosition = null;
  static $VALUES: Flag$UnionPosition[] = null;
  _Flag$UnionPosition($name: string, $ordinal: number, alignment: Flag$Alignment, index: number): this {
    this._JEnum($name, $ordinal);
    this.alignment = alignment;
    this.index_ = index;
    return this;
  }
  static values(): Flag$UnionPosition[] { return Flag$UnionPosition.$VALUES.slice(); }
  static valueOf(name: string): Flag$UnionPosition { return $J.enumValueOf(Flag$UnionPosition, name); }
  static $clinit() {
    Flag$UnionPosition.LEFT = new Flag$UnionPosition()._Flag$UnionPosition('LEFT', 0, Flag$Alignment.VERTICAL, 0);
    Flag$UnionPosition.CENTER = new Flag$UnionPosition()._Flag$UnionPosition('CENTER', 1, Flag$Alignment.VERTICAL, 1);
    Flag$UnionPosition.RIGHT = new Flag$UnionPosition()._Flag$UnionPosition('RIGHT', 2, Flag$Alignment.VERTICAL, 2);
    Flag$UnionPosition.TOP = new Flag$UnionPosition()._Flag$UnionPosition('TOP', 3, Flag$Alignment.HORIZONTAL, 0);
    Flag$UnionPosition.MIDDLE = new Flag$UnionPosition()._Flag$UnionPosition('MIDDLE', 4, Flag$Alignment.HORIZONTAL, 1);
    Flag$UnionPosition.BOTTOM = new Flag$UnionPosition()._Flag$UnionPosition('BOTTOM', 5, Flag$Alignment.HORIZONTAL, 2);
    Flag$UnionPosition.CANTON = new Flag$UnionPosition()._Flag$UnionPosition('CANTON', 6, Flag$Alignment.NONE, 0);
    Flag$UnionPosition.NONE = new Flag$UnionPosition()._Flag$UnionPosition('NONE', 7, null, 0);
    Flag$UnionPosition.$VALUES = [Flag$UnionPosition.LEFT, Flag$UnionPosition.CENTER, Flag$UnionPosition.RIGHT, Flag$UnionPosition.TOP, Flag$UnionPosition.MIDDLE, Flag$UnionPosition.BOTTOM, Flag$UnionPosition.CANTON, Flag$UnionPosition.NONE];
  }
}

$J.define(Flag, 'net.sf.freecol.client.gui.dialog.Flag', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.dialog.Flag$Background,net.sf.freecol.client.gui.dialog.Flag$Decoration,net.sf.freecol.client.gui.dialog.Flag$UnionPosition,net.sf.freecol.client.gui.dialog.Flag$UnionShape': '_Flag$Background$Decoration$UnionPosition$UnionShape', 'net.sf.freecol.client.gui.dialog.Flag$Background,net.sf.freecol.client.gui.dialog.Flag$Decoration,net.sf.freecol.client.gui.dialog.Flag$UnionPosition': '_Flag$Background$Decoration$UnionPosition' }, returns: { 'getRectangle': 'java.awt.geom.Rectangle2D$Double', 'getRhombus': 'java.awt.geom.GeneralPath', 'getPall': 'java.awt.geom.GeneralPath', 'getUnionRhombus': 'java.awt.geom.GeneralPath', 'getImage': 'java.awt.image.BufferedImage', 'getStripes': 'int', 'getStars': 'int', 'getStarColor': 'java.awt.Color', 'getDecorationColor': 'java.awt.Color', 'getUnionColor': 'java.awt.Color', 'getBackgroundColors': 'java.util.List', 'getUnionShape': 'net.sf.freecol.client.gui.dialog.Flag$UnionShape', 'getUnionPosition': 'net.sf.freecol.client.gui.dialog.Flag$UnionPosition', 'getDecoration': 'net.sf.freecol.client.gui.dialog.Flag$Decoration', 'getBackground': 'net.sf.freecol.client.gui.dialog.Flag$Background' }, meths: { 'getStar(double,double,double)': 'getStar$double$double$double$Flag', 'getStar(double,double)': 'getStar$double$double$Flag', 'setBackgroundColors(java.awt.Color[])': 'setBackgroundColors$ColorArr', 'setBackgroundColors(java.util.List)': 'setBackgroundColors$List' }, clinit: true, lazy: ['SQRT_3', 'CHEVRON_X', 'BEND_Y', 'star', 'layout'] });
$J.define(Flag$Alignment, 'net.sf.freecol.client.gui.dialog.Flag$Alignment', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Flag$Alignment' }, clinit: true, lazy: ['$VALUES', 'NONE', 'HORIZONTAL', 'VERTICAL'] });
$J.define(Flag$Background, 'net.sf.freecol.client.gui.dialog.Flag$Background', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'net.sf.freecol.client.gui.dialog.Flag$Alignment': '_Flag$Background' }, clinit: true, lazy: ['$VALUES', 'PLAIN', 'QUARTERLY', 'PALES', 'FESSES', 'PER_BEND', 'PER_BEND_SINISTER', 'PER_SALTIRE'] });
$J.define(Flag$Decoration, 'net.sf.freecol.client.gui.dialog.Flag$Decoration', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'net.sf.freecol.client.gui.dialog.Flag$UnionShape,net.sf.freecol.client.gui.dialog.Flag.UnionPosition[]': '_Flag$Decoration$UnionShape$UnionPositionArr', 'net.sf.freecol.client.gui.dialog.Flag.UnionPosition[]': '_Flag$Decoration$UnionPositionArr' }, returns: { 'getUnionPositions': 'java.util.Set', 'getUnionShape': 'net.sf.freecol.client.gui.dialog.Flag$UnionShape' }, clinit: true, lazy: ['$VALUES', 'NONE', 'CROSS', 'GREEK_CROSS', 'SCANDINAVIAN_CROSS', 'CHEVRON', 'PALL', 'BEND', 'BEND_SINISTER', 'SALTIRE', 'SALTIRE_AND_CROSS'] });
$J.define(Flag$UnionShape, 'net.sf.freecol.client.gui.dialog.Flag$UnionShape', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Flag$UnionShape' }, clinit: true, lazy: ['$VALUES', 'RECTANGLE', 'TRIANGLE', 'CHEVRON', 'BEND', 'RHOMBUS'] });
$J.define(Flag$UnionPosition, 'net.sf.freecol.client.gui.dialog.Flag$UnionPosition', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'net.sf.freecol.client.gui.dialog.Flag$Alignment,int': '_Flag$UnionPosition' }, clinit: true, lazy: ['$VALUES', 'LEFT', 'CENTER', 'RIGHT', 'TOP', 'MIDDLE', 'BOTTOM', 'CANTON', 'NONE'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  RenderingHints = $J.load('java.awt.RenderingHints');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  GeneralPath = $J.load('java.awt.geom.GeneralPath');
  Path2D = $J.load('java.awt.geom.Path2D');
  Rectangle2D$Double = $J.load('java.awt.geom.Rectangle2D$Double');
});
