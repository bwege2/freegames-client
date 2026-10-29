// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/AlphaComposite.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject, SunCompositeContext } from '../../../jre/index.ts';

/**
 * The {@code AlphaComposite} class implements basic alpha
 * compositing rules for combining source and destination colors
 * to achieve blending and transparency effects with graphics and
 * images.
 * The specific rules implemented by this class are the basic set
 * of 12 rules described in
 * T. Porter and T. Duff, "Compositing Digital Images", SIGGRAPH 84,
 * 253-259.
 * The rest of this documentation assumes some familiarity with the
 * definitions and concepts outlined in that paper.
 *
 * <p>
 * This class extends the standard equations defined by Porter and
 * Duff to include one additional factor.
 * An instance of the {@code AlphaComposite} class can contain
 * an alpha value that is used to modify the opacity or coverage of
 * every source pixel before it is used in the blending equations.
 *
 * <p>
 * It is important to note that the equations defined by the Porter
 * and Duff paper are all defined to operate on color components
 * that are premultiplied by their corresponding alpha components.
 * Since the {@code ColorModel} and {@code Raster} classes
 * allow the storage of pixel data in either premultiplied or
 * non-premultiplied form, all input data must be normalized into
 * premultiplied form before applying the equations and all results
 * might need to be adjusted back to the form required by the destination
 * before the pixel values are stored.
 *
 * <p>
 * Also note that this class defines only the equations
 * for combining color and alpha values in a purely mathematical
 * sense. The accurate application of its equations depends
 * on the way the data is retrieved from its sources and stored
 * in its destinations.
 * See <a href="#caveats">Implementation Caveats</a>
 * for further information.
 *
 * <p>
 * The following factors are used in the description of the blending
 * equation in the Porter and Duff paper:
 *
 * <table class="striped">
 * <caption style="display:none">Factors</caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Factor
 *     <th scope="col">Definition
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row"><em>A<sub>s</sub></em>
 *     <td>the alpha component of the source pixel
 *   <tr>
 *     <th scope="row"><em>C<sub>s</sub></em>
 *     <td>a color component of the source pixel in premultiplied form
 *   <tr>
 *     <th scope="row"><em>A<sub>d</sub></em>
 *     <td>the alpha component of the destination pixel
 *   <tr>
 *     <th scope="row"><em>C<sub>d</sub></em>
 *     <td>a color component of the destination pixel in premultiplied form
 *   <tr>
 *     <th scope="row"><em>F<sub>s</sub></em>
 *     <td>the fraction of the source pixel that contributes to the output
 *   <tr>
 *     <th scope="row"><em>F<sub>d</sub></em>
 *     <td>the fraction of the destination pixel that contributes to the output
 *   <tr>
 *     <th scope="row"><em>A<sub>r</sub></em>
 *     <td>the alpha component of the result
 *   <tr>
 *     <th scope="row"><em>C<sub>r</sub></em>
 *     <td>a color component of the result in premultiplied form
 * </tbody>
 * </table>
 * <p>
 * Using these factors, Porter and Duff define 12 ways of choosing
 * the blending factors <em>F<sub>s</sub></em> and <em>F<sub>d</sub></em> to
 * produce each of 12 desirable visual effects.
 * The equations for determining <em>F<sub>s</sub></em> and <em>F<sub>d</sub></em>
 * are given in the descriptions of the 12 static fields
 * that specify visual effects.
 * For example,
 * the description for
 * <a href="#SRC_OVER">{@code SRC_OVER}</a>
 * specifies that <em>F<sub>s</sub></em> = 1 and <em>F<sub>d</sub></em> = (1-<em>A<sub>s</sub></em>).
 * Once a set of equations for determining the blending factors is
 * known they can then be applied to each pixel to produce a result
 * using the following set of equations:
 *
 * <pre>
 *      <em>F<sub>s</sub></em> = <em>f</em>(<em>A<sub>d</sub></em>)
 *      <em>F<sub>d</sub></em> = <em>f</em>(<em>A<sub>s</sub></em>)
 *      <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>*<em>F<sub>s</sub></em> + <em>A<sub>d</sub></em>*<em>F<sub>d</sub></em>
 *      <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>*<em>F<sub>s</sub></em> + <em>C<sub>d</sub></em>*<em>F<sub>d</sub></em></pre>
 *
 * <p>
 * The following factors will be used to discuss our extensions to
 * the blending equation in the Porter and Duff paper:
 *
 * <table class="striped">
 * <caption style="display:none">Factors</caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Factor
 *     <th scope="col">Definition
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row"><em>C<sub>sr</sub></em>
 *     <td>one of the raw color components of the source pixel
 *   <tr>
 *     <th scope="row"><em>C<sub>dr</sub></em>
 *     <td>one of the raw color components of the destination pixel
 *   <tr>
 *     <th scope="row"><em>A<sub>ac</sub></em>
 *     <td>the "extra" alpha component from the AlphaComposite instance
 *   <tr>
 *     <th scope="row"><em>A<sub>sr</sub></em>
 *     <td>the raw alpha component of the source pixel
 *   <tr>
 *     <th scope="row"><em>A<sub>dr</sub></em>
 *     <td>the raw alpha component of the destination pixel
 *   <tr>
 *     <th scope="row"><em>A<sub>df</sub></em>
 *     <td>the final alpha component stored in the destination
 *   <tr>
 *     <th scope="row"><em>C<sub>df</sub></em>
 *     <td>the final raw color component stored in the destination
 * </tbody>
 * </table>
 *
 * <h2>Preparing Inputs</h2>
 *
 * <p>
 * The {@code AlphaComposite} class defines an additional alpha
 * value that is applied to the source alpha.
 * This value is applied as if an implicit SRC_IN rule were first
 * applied to the source pixel against a pixel with the indicated
 * alpha by multiplying both the raw source alpha and the raw
 * source colors by the alpha in the {@code AlphaComposite}.
 * This leads to the following equation for producing the alpha
 * used in the Porter and Duff blending equation:
 *
 * <pre>
 *      <em>A<sub>s</sub></em> = <em>A<sub>sr</sub></em> * <em>A<sub>ac</sub></em> </pre>
 *
 * All of the raw source color components need to be multiplied
 * by the alpha in the {@code AlphaComposite} instance.
 * Additionally, if the source was not in premultiplied form
 * then the color components also need to be multiplied by the
 * source alpha.
 * Thus, the equation for producing the source color components
 * for the Porter and Duff equation depends on whether the source
 * pixels are premultiplied or not:
 *
 * <pre>
 *      <em>C<sub>s</sub></em> = <em>C<sub>sr</sub></em> * <em>A<sub>sr</sub></em> * <em>A<sub>ac</sub></em>     (if source is not premultiplied)
 *      <em>C<sub>s</sub></em> = <em>C<sub>sr</sub></em> * <em>A<sub>ac</sub></em>           (if source is premultiplied) </pre>
 *
 * No adjustment needs to be made to the destination alpha:
 *
 * <pre>
 *      <em>A<sub>d</sub></em> = <em>A<sub>dr</sub></em> </pre>
 *
 * <p>
 * The destination color components need to be adjusted only if
 * they are not in premultiplied form:
 *
 * <pre>
 *      <em>C<sub>d</sub></em> = <em>C<sub>dr</sub></em> * <em>A<sub>d</sub></em>    (if destination is not premultiplied)
 *      <em>C<sub>d</sub></em> = <em>C<sub>dr</sub></em>         (if destination is premultiplied) </pre>
 *
 * <h2>Applying the Blending Equation</h2>
 *
 * <p>
 * The adjusted <em>A<sub>s</sub></em>, <em>A<sub>d</sub></em>,
 * <em>C<sub>s</sub></em>, and <em>C<sub>d</sub></em> are used in the standard
 * Porter and Duff equations to calculate the blending factors
 * <em>F<sub>s</sub></em> and <em>F<sub>d</sub></em> and then the resulting
 * premultiplied components <em>A<sub>r</sub></em> and <em>C<sub>r</sub></em>.
 *
 * <h2>Preparing Results</h2>
 *
 * <p>
 * The results only need to be adjusted if they are to be stored
 * back into a destination buffer that holds data that is not
 * premultiplied, using the following equations:
 *
 * <pre>
 *      <em>A<sub>df</sub></em> = <em>A<sub>r</sub></em>
 *      <em>C<sub>df</sub></em> = <em>C<sub>r</sub></em>                 (if dest is premultiplied)
 *      <em>C<sub>df</sub></em> = <em>C<sub>r</sub></em> / <em>A<sub>r</sub></em>            (if dest is not premultiplied) </pre>
 *
 * Note that since the division is undefined if the resulting alpha
 * is zero, the division in that case is omitted to avoid the "divide
 * by zero" and the color components are left as
 * all zeros.
 *
 * <h2>Performance Considerations</h2>
 *
 * <p>
 * For performance reasons, it is preferable that
 * {@code Raster} objects passed to the {@code compose}
 * method of a {@link CompositeContext} object created by the
 * {@code AlphaComposite} class have premultiplied data.
 * If either the source {@code Raster}
 * or the destination {@code Raster}
 * is not premultiplied, however,
 * appropriate conversions are performed before and after the compositing
 * operation.
 *
 * <h2><a id="caveats">Implementation Caveats</a></h2>
 *
 * <ul>
 * <li>
 * Many sources, such as some of the opaque image types listed
 * in the {@code BufferedImage} class, do not store alpha values
 * for their pixels.  Such sources supply an alpha of 1.0 for
 * all of their pixels.
 *
 * <li>
 * Many destinations also have no place to store the alpha values
 * that result from the blending calculations performed by this class.
 * Such destinations thus implicitly discard the resulting
 * alpha values that this class produces.
 * It is recommended that such destinations should treat their stored
 * color values as non-premultiplied and divide the resulting color
 * values by the resulting alpha value before storing the color
 * values and discarding the alpha value.
 *
 * <li>
 * The accuracy of the results depends on the manner in which pixels
 * are stored in the destination.
 * An image format that provides at least 8 bits of storage per color
 * and alpha component is at least adequate for use as a destination
 * for a sequence of a few to a dozen compositing operations.
 * An image format with fewer than 8 bits of storage per component
 * is of limited use for just one or two compositing operations
 * before the rounding errors dominate the results.
 * An image format
 * that does not separately store
 * color components is not a
 * good candidate for any type of translucent blending.
 * For example, {@code BufferedImage.TYPE_BYTE_INDEXED}
 * should not be used as a destination for a blending operation
 * because every operation
 * can introduce large errors, due to
 * the need to choose a pixel from a limited palette to match the
 * results of the blending equations.
 *
 * <li>
 * Nearly all formats store pixels as discrete integers rather than
 * the floating point values used in the reference equations above.
 * The implementation can either scale the integer pixel
 * values into floating point values in the range 0.0 to 1.0 or
 * use slightly modified versions of the equations
 * that operate entirely in the integer domain and yet produce
 * analogous results to the reference equations.
 *
 * <p>
 * Typically the integer values are related to the floating point
 * values in such a way that the integer 0 is equated
 * to the floating point value 0.0 and the integer
 * 2^<em>n</em>-1 (where <em>n</em> is the number of bits
 * in the representation) is equated to 1.0.
 * For 8-bit representations, this means that 0x00
 * represents 0.0 and 0xff represents
 * 1.0.
 *
 * <li>
 * The internal implementation can approximate some of the equations
 * and it can also eliminate some steps to avoid unnecessary operations.
 * For example, consider a discrete integer image with non-premultiplied
 * alpha values that uses 8 bits per component for storage.
 * The stored values for a
 * nearly transparent darkened red might be:
 *
 * <pre>
 *    (A, R, G, B) = (0x01, 0xb0, 0x00, 0x00)</pre>
 *
 * <p>
 * If integer math were being used and this value were being
 * composited in
 * <a href="#SRC">{@code SRC}</a>
 * mode with no extra alpha, then the math would
 * indicate that the results were (in integer format):
 *
 * <pre>
 *    (A, R, G, B) = (0x01, 0x01, 0x00, 0x00)</pre>
 *
 * <p>
 * Note that the intermediate values, which are always in premultiplied
 * form, would only allow the integer red component to be either 0x00
 * or 0x01.  When we try to store this result back into a destination
 * that is not premultiplied, dividing out the alpha will give us
 * very few choices for the non-premultiplied red value.
 * In this case an implementation that performs the math in integer
 * space without shortcuts is likely to end up with the final pixel
 * values of:
 *
 * <pre>
 *    (A, R, G, B) = (0x01, 0xff, 0x00, 0x00)</pre>
 *
 * <p>
 * (Note that 0x01 divided by 0x01 gives you 1.0, which is equivalent
 * to the value 0xff in an 8-bit storage format.)
 *
 * <p>
 * Alternately, an implementation that uses floating point math
 * might produce more accurate results and end up returning to the
 * original pixel value with little, if any, round-off error.
 * Or, an implementation using integer math might decide that since
 * the equations boil down to a virtual NOP on the color values
 * if performed in a floating point space, it can transfer the
 * pixel untouched to the destination and avoid all the math entirely.
 *
 * <p>
 * These implementations all attempt to honor the
 * same equations, but use different tradeoffs of integer and
 * floating point math and reduced or full equations.
 * To account for such differences, it is probably best to
 * expect only that the premultiplied form of the results to
 * match between implementations and image formats.  In this
 * case both answers, expressed in premultiplied form would
 * equate to:
 *
 * <pre>
 *    (A, R, G, B) = (0x01, 0x01, 0x00, 0x00)</pre>
 *
 * <p>
 * and thus they would all match.
 *
 * <li>
 * Because of the technique of simplifying the equations for
 * calculation efficiency, some implementations might perform
 * differently when encountering result alpha values of 0.0
 * on a non-premultiplied destination.
 * Note that the simplification of removing the divide by alpha
 * in the case of the SRC rule is technically not valid if the
 * denominator (alpha) is 0.
 * But, since the results should only be expected to be accurate
 * when viewed in premultiplied form, a resulting alpha of 0
 * essentially renders the resulting color components irrelevant
 * and so exact behavior in this case should not be expected.
 * </ul>
 * @see Composite
 * @see CompositeContext
 */
export class AlphaComposite extends JObject {
  /**
   * Both the color and the alpha of the destination are cleared
   * (Porter-Duff Clear rule).
   * Neither the source nor the destination is used as input.
   * <p>
   * <em>F<sub>s</sub></em> = 0 and <em>F<sub>d</sub></em> = 0, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = 0
   *  <em>C<sub>r</sub></em> = 0
   * </pre>
   */
  static readonly CLEAR: number = 1;
  /**
   * The source is copied to the destination
   * (Porter-Duff Source rule).
   * The destination is not used as input.
   * <p>
   * <em>F<sub>s</sub></em> = 1 and <em>F<sub>d</sub></em> = 0, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>
   * </pre>
   */
  static readonly SRC: number = 2;
  /**
   * The destination is left untouched
   * (Porter-Duff Destination rule).
   * <p>
   * <em>F<sub>s</sub></em> = 0 and <em>F<sub>d</sub></em> = 1, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>d</sub></em>
   *  <em>C<sub>r</sub></em> = <em>C<sub>d</sub></em>
   * </pre>
   * @since 1.4
   */
  static readonly DST: number = 9;
  /**
   * The source is composited over the destination
   * (Porter-Duff Source Over Destination rule).
   * <p>
   * <em>F<sub>s</sub></em> = 1 and <em>F<sub>d</sub></em> = (1-<em>A<sub>s</sub></em>), thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em> + <em>A<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>)
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em> + <em>C<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>)
   * </pre>
   */
  static readonly SRC_OVER: number = 3;
  /**
   * The destination is composited over the source and
   * the result replaces the destination
   * (Porter-Duff Destination Over Source rule).
   * <p>
   * <em>F<sub>s</sub></em> = (1-<em>A<sub>d</sub></em>) and <em>F<sub>d</sub></em> = 1, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>) + <em>A<sub>d</sub></em>
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>) + <em>C<sub>d</sub></em>
   * </pre>
   */
  static readonly DST_OVER: number = 4;
  /**
   * The part of the source lying inside of the destination replaces
   * the destination
   * (Porter-Duff Source In Destination rule).
   * <p>
   * <em>F<sub>s</sub></em> = <em>A<sub>d</sub></em> and <em>F<sub>d</sub></em> = 0, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>*<em>A<sub>d</sub></em>
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>*<em>A<sub>d</sub></em>
   * </pre>
   */
  static readonly SRC_IN: number = 5;
  /**
   * The part of the destination lying inside of the source
   * replaces the destination
   * (Porter-Duff Destination In Source rule).
   * <p>
   * <em>F<sub>s</sub></em> = 0 and <em>F<sub>d</sub></em> = <em>A<sub>s</sub></em>, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>d</sub></em>*<em>A<sub>s</sub></em>
   *  <em>C<sub>r</sub></em> = <em>C<sub>d</sub></em>*<em>A<sub>s</sub></em>
   * </pre>
   */
  static readonly DST_IN: number = 6;
  /**
   * The part of the source lying outside of the destination
   * replaces the destination
   * (Porter-Duff Source Held Out By Destination rule).
   * <p>
   * <em>F<sub>s</sub></em> = (1-<em>A<sub>d</sub></em>) and <em>F<sub>d</sub></em> = 0, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>)
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>)
   * </pre>
   */
  static readonly SRC_OUT: number = 7;
  /**
   * The part of the destination lying outside of the source
   * replaces the destination
   * (Porter-Duff Destination Held Out By Source rule).
   * <p>
   * <em>F<sub>s</sub></em> = 0 and <em>F<sub>d</sub></em> = (1-<em>A<sub>s</sub></em>), thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>)
   *  <em>C<sub>r</sub></em> = <em>C<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>)
   * </pre>
   */
  static readonly DST_OUT: number = 8;
  /**
   * The part of the source lying inside of the destination
   * is composited onto the destination
   * (Porter-Duff Source Atop Destination rule).
   * <p>
   * <em>F<sub>s</sub></em> = <em>A<sub>d</sub></em> and <em>F<sub>d</sub></em> = (1-<em>A<sub>s</sub></em>), thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>*<em>A<sub>d</sub></em> + <em>A<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>) = <em>A<sub>d</sub></em>
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>*<em>A<sub>d</sub></em> + <em>C<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>)
   * </pre>
   * @since 1.4
   */
  static readonly SRC_ATOP: number = 10;
  /**
   * The part of the destination lying inside of the source
   * is composited over the source and replaces the destination
   * (Porter-Duff Destination Atop Source rule).
   * <p>
   * <em>F<sub>s</sub></em> = (1-<em>A<sub>d</sub></em>) and <em>F<sub>d</sub></em> = <em>A<sub>s</sub></em>, thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>) + <em>A<sub>d</sub></em>*<em>A<sub>s</sub></em> = <em>A<sub>s</sub></em>
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>) + <em>C<sub>d</sub></em>*<em>A<sub>s</sub></em>
   * </pre>
   * @since 1.4
   */
  static readonly DST_ATOP: number = 11;
  /**
   * The part of the source that lies outside of the destination
   * is combined with the part of the destination that lies outside
   * of the source
   * (Porter-Duff Source Xor Destination rule).
   * <p>
   * <em>F<sub>s</sub></em> = (1-<em>A<sub>d</sub></em>) and <em>F<sub>d</sub></em> = (1-<em>A<sub>s</sub></em>), thus:
   * <pre>
   *  <em>A<sub>r</sub></em> = <em>A<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>) + <em>A<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>)
   *  <em>C<sub>r</sub></em> = <em>C<sub>s</sub></em>*(1-<em>A<sub>d</sub></em>) + <em>C<sub>d</sub></em>*(1-<em>A<sub>s</sub></em>)
   * </pre>
   * @since 1.4
   */
  static readonly XOR: number = 12;
  /**
   * {@code AlphaComposite} object that implements the opaque CLEAR rule
   * with an alpha of 1.0f.
   * @see #CLEAR
   */
  static Clear: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque SRC rule
   * with an alpha of 1.0f.
   * @see #SRC
   */
  static Src: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque DST rule
   * with an alpha of 1.0f.
   * @see #DST
   * @since 1.4
   */
  static Dst: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque SRC_OVER rule
   * with an alpha of 1.0f.
   * @see #SRC_OVER
   */
  static SrcOver: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque DST_OVER rule
   * with an alpha of 1.0f.
   * @see #DST_OVER
   */
  static DstOver: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque SRC_IN rule
   * with an alpha of 1.0f.
   * @see #SRC_IN
   */
  static SrcIn: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque DST_IN rule
   * with an alpha of 1.0f.
   * @see #DST_IN
   */
  static DstIn: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque SRC_OUT rule
   * with an alpha of 1.0f.
   * @see #SRC_OUT
   */
  static SrcOut: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque DST_OUT rule
   * with an alpha of 1.0f.
   * @see #DST_OUT
   */
  static DstOut: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque SRC_ATOP rule
   * with an alpha of 1.0f.
   * @see #SRC_ATOP
   * @since 1.4
   */
  static SrcAtop: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque DST_ATOP rule
   * with an alpha of 1.0f.
   * @see #DST_ATOP
   * @since 1.4
   */
  static DstAtop: AlphaComposite = null;
  /**
   * {@code AlphaComposite} object that implements the opaque XOR rule
   * with an alpha of 1.0f.
   * @see #XOR
   * @since 1.4
   */
  static Xor: AlphaComposite = null;
  static readonly MIN_RULE: number = 1;
  static readonly MAX_RULE: number = 12;
  extraAlpha: number = 0;
  rule: number = 0;
  _AlphaComposite$int(rule: number): this {
    this._AlphaComposite$int$float(rule, 1);
    return this;
  }
  _AlphaComposite$int$float(rule: number, alpha: number): this {
    if (rule < AlphaComposite.MIN_RULE || rule > AlphaComposite.MAX_RULE) {
      throw new IllegalArgumentException('unknown composite rule');
    }
    if (alpha >= 0 && alpha <= 1) {
      this.rule = rule;
      this.extraAlpha = alpha;
    } else {
      throw new IllegalArgumentException('alpha value out of range');
    }
    return this;
  }
  /**
   * Creates an {@code AlphaComposite} object with the specified rule.
   *
   * @param rule the compositing rule
   * @return the {@code AlphaComposite} object created
   * @throws IllegalArgumentException if {@code rule} is not one of
   *         the following:  {@link #CLEAR}, {@link #SRC}, {@link #DST},
   *         {@link #SRC_OVER}, {@link #DST_OVER}, {@link #SRC_IN},
   *         {@link #DST_IN}, {@link #SRC_OUT}, {@link #DST_OUT},
   *         {@link #SRC_ATOP}, {@link #DST_ATOP}, or {@link #XOR}
   */
  static getInstance$int(rule: number): AlphaComposite {
    switch (rule) {
      case AlphaComposite.CLEAR:
        return AlphaComposite.Clear;
      case AlphaComposite.SRC:
        return AlphaComposite.Src;
      case AlphaComposite.DST:
        return AlphaComposite.Dst;
      case AlphaComposite.SRC_OVER:
        return AlphaComposite.SrcOver;
      case AlphaComposite.DST_OVER:
        return AlphaComposite.DstOver;
      case AlphaComposite.SRC_IN:
        return AlphaComposite.SrcIn;
      case AlphaComposite.DST_IN:
        return AlphaComposite.DstIn;
      case AlphaComposite.SRC_OUT:
        return AlphaComposite.SrcOut;
      case AlphaComposite.DST_OUT:
        return AlphaComposite.DstOut;
      case AlphaComposite.SRC_ATOP:
        return AlphaComposite.SrcAtop;
      case AlphaComposite.DST_ATOP:
        return AlphaComposite.DstAtop;
      case AlphaComposite.XOR:
        return AlphaComposite.Xor;
      default:
        throw new IllegalArgumentException('unknown composite rule');
    }
  }
  /**
   * Creates an {@code AlphaComposite} object with the specified rule and
   * the constant alpha to multiply with the alpha of the source.
   * The source is multiplied with the specified alpha before being composited
   * with the destination.
   *
   * @param rule the compositing rule
   * @param alpha the constant alpha to be multiplied with the alpha of
   * the source. {@code alpha} must be a floating point number in the
   * inclusive range [0.0,&nbsp;1.0].
   * @return the {@code AlphaComposite} object created
   * @throws IllegalArgumentException if
   *         {@code alpha} is less than 0.0 or greater than 1.0, or if
   *         {@code rule} is not one of
   *         the following:  {@link #CLEAR}, {@link #SRC}, {@link #DST},
   *         {@link #SRC_OVER}, {@link #DST_OVER}, {@link #SRC_IN},
   *         {@link #DST_IN}, {@link #SRC_OUT}, {@link #DST_OUT},
   *         {@link #SRC_ATOP}, {@link #DST_ATOP}, or {@link #XOR}
   */
  static getInstance$int$float(rule: number, alpha: number): AlphaComposite {
    if (alpha === 1) {
      return AlphaComposite.getInstance$int(rule);
    }
    return new AlphaComposite()._AlphaComposite$int$float(rule, alpha);
  }
  /**
   * Creates a context for the compositing operation.
   * The context contains state that is used in performing
   * the compositing operation.
   * @param srcColorModel  the {@link ColorModel} of the source
   * @param dstColorModel  the {@code ColorModel} of the destination
   * @return the {@code CompositeContext} object to be used to perform
   * compositing operations.
   */
  createContext(srcColorModel: ColorModel, dstColorModel: ColorModel, hints: RenderingHints): CompositeContext {
    return new SunCompositeContext(this, srcColorModel, dstColorModel);
  }
  /**
   * Returns the alpha value of this {@code AlphaComposite}.  If this
   * {@code AlphaComposite} does not have an alpha value, 1.0 is returned.
   * @return the alpha value of this {@code AlphaComposite}.
   */
  getAlpha(): number {
    return this.extraAlpha;
  }
  /**
   * Returns the compositing rule of this {@code AlphaComposite}.
   * @return the compositing rule of this {@code AlphaComposite}.
   */
  getRule(): number {
    return this.rule;
  }
  /**
   * Returns a similar {@code AlphaComposite} object that uses
   * the specified compositing rule.
   * If this object already uses the specified compositing rule,
   * this object is returned.
   * @return an {@code AlphaComposite} object derived from
   * this object that uses the specified compositing rule.
   * @param rule the compositing rule
   * @throws IllegalArgumentException if
   *         {@code rule} is not one of
   *         the following:  {@link #CLEAR}, {@link #SRC}, {@link #DST},
   *         {@link #SRC_OVER}, {@link #DST_OVER}, {@link #SRC_IN},
   *         {@link #DST_IN}, {@link #SRC_OUT}, {@link #DST_OUT},
   *         {@link #SRC_ATOP}, {@link #DST_ATOP}, or {@link #XOR}
   * @since 1.6
   */
  derive$int(rule: number): AlphaComposite {
    return (this.rule === rule) ? this : AlphaComposite.getInstance$int$float(rule, this.extraAlpha);
  }
  /**
   * Returns a similar {@code AlphaComposite} object that uses
   * the specified alpha value.
   * If this object already has the specified alpha value,
   * this object is returned.
   * @return an {@code AlphaComposite} object derived from
   * this object that uses the specified alpha value.
   * @param alpha the constant alpha to be multiplied with the alpha of
   * the source. {@code alpha} must be a floating point number in the
   * inclusive range [0.0,&nbsp;1.0].
   * @throws IllegalArgumentException if
   *         {@code alpha} is less than 0.0 or greater than 1.0
   * @since 1.6
   */
  derive$float(alpha: number): AlphaComposite {
    return (this.extraAlpha === alpha) ? this : AlphaComposite.getInstance$int$float(this.rule, alpha);
  }
  /**
   * Returns the hashcode for this composite.
   * @return      a hash code for this composite.
   */
  hashCode(): number {
    return ((Math.imul($J.Float_floatToIntBits(this.extraAlpha), 31) + this.rule) | 0);
  }
  /**
   * Determines whether the specified object is equal to this
   * {@code AlphaComposite}.
   * <p>
   * The result is {@code true} if and only if
   * the argument is not {@code null} and is an
   * {@code AlphaComposite} object that has the same
   * compositing rule and alpha value as this object.
   *
   * @param obj the {@code Object} to test for equality
   * @return {@code true} if {@code obj} equals this
   * {@code AlphaComposite}; {@code false} otherwise.
   */
  equals(obj: any): boolean {
    if (!(obj instanceof AlphaComposite)) {
      return false;
    }
    let ac = obj;
    if (this.rule !== ac.rule) {
      return false;
    }
    if (this.extraAlpha !== ac.extraAlpha) {
      return false;
    }
    return true;
  }
  static $clinit() {
    AlphaComposite.Clear = new AlphaComposite()._AlphaComposite$int(AlphaComposite.CLEAR);
    AlphaComposite.Src = new AlphaComposite()._AlphaComposite$int(AlphaComposite.SRC);
    AlphaComposite.Dst = new AlphaComposite()._AlphaComposite$int(AlphaComposite.DST);
    AlphaComposite.SrcOver = new AlphaComposite()._AlphaComposite$int(AlphaComposite.SRC_OVER);
    AlphaComposite.DstOver = new AlphaComposite()._AlphaComposite$int(AlphaComposite.DST_OVER);
    AlphaComposite.SrcIn = new AlphaComposite()._AlphaComposite$int(AlphaComposite.SRC_IN);
    AlphaComposite.DstIn = new AlphaComposite()._AlphaComposite$int(AlphaComposite.DST_IN);
    AlphaComposite.SrcOut = new AlphaComposite()._AlphaComposite$int(AlphaComposite.SRC_OUT);
    AlphaComposite.DstOut = new AlphaComposite()._AlphaComposite$int(AlphaComposite.DST_OUT);
    AlphaComposite.SrcAtop = new AlphaComposite()._AlphaComposite$int(AlphaComposite.SRC_ATOP);
    AlphaComposite.DstAtop = new AlphaComposite()._AlphaComposite$int(AlphaComposite.DST_ATOP);
    AlphaComposite.Xor = new AlphaComposite()._AlphaComposite$int(AlphaComposite.XOR);
  }
}

$J.define(AlphaComposite, 'java.awt.AlphaComposite', { kind: 'class', ifaces: ['java.awt.Composite'], sup: 'java.lang.Object', ctors: { 'int,float': '_AlphaComposite$int$float', 'int': '_AlphaComposite$int' }, meths: { 'derive(float)': 'derive$float', 'derive(int)': 'derive$int', 'getInstance(int,float)': 'getInstance$int$float', 'getInstance(int)': 'getInstance$int' }, clinit: true, lazy: ['Clear', 'Src', 'Dst', 'SrcOver', 'DstOver', 'SrcIn', 'DstIn', 'SrcOut', 'DstOut', 'SrcAtop', 'DstAtop', 'Xor'] });
