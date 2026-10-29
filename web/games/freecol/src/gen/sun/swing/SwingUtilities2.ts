// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/SwingUtilities2.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2002, 2024, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, AttributedString, BreakIterator, BufferedInputStream, Character, ClassCastException, FontDesignMetrics, FontUtilities, HashMap, IOException, Integer, JBoolean, JEnum, JMap, JObject, JString, LineBreakMeasurer, Modifier, NumberFormatException, Objects, PrinterGraphics, ProxyPrintGraphics, SecurityException, StringBuffer, StringBuilder, SunGraphicsEnvironment, SunToolkit, TextLayout, Toolkit } from '../../../jre/index.ts';

let Container, EventQueue, Graphics2D, GraphicsEnvironment, PrintGraphics, RenderingHints, InputEvent, KeyEvent, FontRenderContext, TextAttribute, TextHitInfo, AffineTransform, JComponent, SwingUtilities, UIManager, DefaultCaret, JTextComponent, TreePath, AWTAccessor, AWTPermissions, ImageIconUIResource, PrintColorUIResource, StringUIClientPropertyKey;

/**
 * A collection of utility methods for Swing.
 * <p>
 * <b>WARNING:</b> While this class is public, it should not be treated as
 * public API and its API may change in incompatible ways between dot dot
 * releases and even patch releases. You should not rely on this class even
 * existing.
 */
export class SwingUtilities2 extends JObject {
  /**
   * The {@code AppContext} key for our one {@code LAFState}
   * instance.
   */
  static LAF_STATE_KEY: any = null;
  static MENU_SELECTION_MANAGER_LISTENER_KEY: any = null;
  static fontCache: SwingUtilities2$LSBCacheEntry[] = null;
  static readonly CACHE_SIZE: number = 6;
  static nextIndex: number = 0;
  static searchKey: SwingUtilities2$LSBCacheEntry = null;
  static readonly MIN_CHAR_INDEX: number = 87;
  static readonly MAX_CHAR_INDEX: number = 88;
  static DEFAULT_FRC: FontRenderContext = null;
  /**
   * Attribute key for the content elements.  If it is set on an element, the
   * element is considered to be a line break.
   */
  static readonly IMPLIED_CR: string = 'CR';
  /**
   * Used to tell a text component, being used as an editor for table
   * or tree, how many clicks it took to start editing.
   */
  static SKIP_CLICK_COUNT: StringBuilder = null;
  /**
   * Client Property key for the text maximal offsets for BasicMenuItemUI
   */
  static BASICMENUITEMUI_MAX_TEXT_OFFSET: StringUIClientPropertyKey = null;
  static readonly UntrustedClipboardAccess: string = 'UNTRUSTED_CLIPBOARD_ACCESS_KEY';
  static readonly CHAR_BUFFER_SIZE: number = 100;
  static charsBufferLock: any = null;
  static charsBuffer: number[] = null;
  static APP_CONTEXT_FRC_CACHE_KEY: any = null;
  static putAATextInfo(lafCondition: boolean, map: JMap<any, any>): void {
    SunToolkit.setAAFontSettingsCondition(lafCondition);
    let tk = Toolkit.getDefaultToolkit();
    let desktopHints = tk.getDesktopProperty('awt.font.desktophints');
    if ($J.isa(desktopHints, JMap)) {
      let hints = desktopHints;
      let aaHint = hints.get(RenderingHints.KEY_TEXT_ANTIALIASING);
      if (aaHint == null || aaHint === RenderingHints.VALUE_TEXT_ANTIALIAS_OFF || aaHint === RenderingHints.VALUE_TEXT_ANTIALIAS_DEFAULT) {
        return;
      }
      map.put(RenderingHints.KEY_TEXT_ANTIALIASING, aaHint);
      map.put(RenderingHints.KEY_TEXT_LCD_CONTRAST, hints.get(RenderingHints.KEY_TEXT_LCD_CONTRAST));
    }
  }
  /**
   * Fill the character buffer cache.  Return the buffer length.
   */
  static syncCharsBuffer(s: string): number {
    let length = s.length;
    if ((SwingUtilities2.charsBuffer == null) || (SwingUtilities2.charsBuffer.length < length)) {
      SwingUtilities2.charsBuffer = JString.toCharArray(s);
    } else {
      JString.getChars(s, 0, length, SwingUtilities2.charsBuffer, 0);
    }
    return length;
  }
  /**
   * checks whether TextLayout is required to handle characters.
   *
   * @param text characters to be tested
   * @param start start
   * @param limit limit
   * @return {@code true}  if TextLayout is required
   *         {@code false} if TextLayout is not required
   */
  static isComplexLayout(text: number[], start: number, limit: number): boolean {
    return FontUtilities.isComplexText(text, start, limit);
  }
  /**
   * Returns the left side bearing of the first character of string. The
   * left side bearing is calculated from the passed in
   * FontMetrics.  If the passed in String is less than one
   * character {@code 0} is returned.
   *
   * @param c JComponent that will display the string
   * @param fm FontMetrics used to measure the String width
   * @param string String to get the left side bearing for.
   * @throws NullPointerException if {@code string} is {@code null}
   *
   * @return the left side bearing of the first character of string
   * or {@code 0} if the string is empty
   */
  static getLeftSideBearing$JComponent$FontMetrics$String(c: JComponent, fm: FontMetrics, string$: string): number {
    if ((string$ == null) || (string$.length === 0)) {
      return 0;
    }
    return SwingUtilities2.getLeftSideBearing$JComponent$FontMetrics$char(c, fm, string$.charCodeAt(0));
  }
  /**
   * Returns the left side bearing of the first character of string. The
   * left side bearing is calculated from the passed in FontMetrics.
   *
   * @param c JComponent that will display the string
   * @param fm FontMetrics used to measure the String width
   * @param firstChar Character to get the left side bearing for.
   */
  static getLeftSideBearing$JComponent$FontMetrics$char(c: JComponent, fm: FontMetrics, firstChar: number): number {
    let charIndex = firstChar;
    if (charIndex < SwingUtilities2.MAX_CHAR_INDEX && charIndex >= SwingUtilities2.MIN_CHAR_INDEX) {
      let lsbs = null;
      let frc = SwingUtilities2.getFontRenderContext$Component$FontMetrics(c, fm);
      let font = fm.getFont();
      {
        let entry = null;
        if (SwingUtilities2.searchKey == null) {
          SwingUtilities2.searchKey = new SwingUtilities2$LSBCacheEntry()._SwingUtilities2$LSBCacheEntry(frc, font);
        } else {
          SwingUtilities2.searchKey.reset(frc, font);
        }
        for (let cacheEntry of SwingUtilities2.fontCache) {
          if (SwingUtilities2.searchKey.equals(cacheEntry)) {
            entry = cacheEntry;
            break;
          }
        }
        if (entry == null) {
          entry = SwingUtilities2.searchKey;
          SwingUtilities2.fontCache[SwingUtilities2.nextIndex] = SwingUtilities2.searchKey;
          SwingUtilities2.searchKey = null;
          SwingUtilities2.nextIndex = ((SwingUtilities2.nextIndex + 1) | 0) % SwingUtilities2.CACHE_SIZE;
        }
        return entry.getLeftSideBearing(firstChar);
      }
    }
    return 0;
  }
  /**
   * Returns the FontMetrics for the current Font of the passed
   * in Graphics.  This method is used when a Graphics
   * is available, typically when painting.  If a Graphics is not
   * available the JComponent method of the same name should be used.
   * <p>
   * Callers should pass in a non-null JComponent, the exception
   * to this is if a JComponent is not readily available at the time of
   * painting.
   * <p>
   * This does not necessarily return the FontMetrics from the
   * Graphics.
   *
   * @param c JComponent requesting FontMetrics, may be null
   * @param g Graphics Graphics
   */
  static getFontMetrics$JComponent$Graphics(c: JComponent, g: Graphics): FontMetrics {
    return SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(c, g, g.getFont());
  }
  /**
   * Returns the FontMetrics for the specified Font.
   * This method is used when a Graphics is available, typically when
   * painting.  If a Graphics is not available the JComponent method of
   * the same name should be used.
   * <p>
   * Callers should pass in a non-null JComonent, the exception
   * to this is if a JComponent is not readily available at the time of
   * painting.
   * <p>
   * This does not necessarily return the FontMetrics from the
   * Graphics.
   *
   * @param c JComponent requesting FontMetrics, may be null
   * @param c Graphics Graphics
   * @param font Font to get FontMetrics for
   */
  static getFontMetrics$JComponent$Graphics$Font(c: JComponent, g: Graphics, font: Font): FontMetrics {
    if (c != null) {
      return c.getFontMetrics(font);
    }
    return Toolkit.getDefaultToolkit().getFontMetrics(font);
  }
  /**
   * Returns the width of the passed in String.
   * If the passed String is {@code null}, returns zero.
   *
   * @param c JComponent that will display the string, may be null
   * @param fm FontMetrics used to measure the String width
   * @param string String to get the width of
   */
  static stringWidth$JComponent$FontMetrics$String(c: JComponent, fm: FontMetrics, string$: string): number {
    return $J.d2i(SwingUtilities2.stringWidth$JComponent$FontMetrics$String$boolean(c, fm, string$, false));
  }
  /**
   * Returns the width of the passed in String.
   * If the passed String is {@code null}, returns zero.
   *
   * @param c JComponent that will display the string, may be null
   * @param fm FontMetrics used to measure the String width
   * @param string String to get the width of
   * @param useFPAPI use floating point API
   */
  static stringWidth$JComponent$FontMetrics$String$boolean(c: JComponent, fm: FontMetrics, string$: string, useFPAPI: boolean): number {
    if (string$ == null || (string$.length === 0)) {
      return 0;
    }
    let needsTextLayout = ((c != null) && (c.getClientProperty(TextAttribute.NUMERIC_SHAPING) != null));
    if (needsTextLayout) {
      {
        let length = SwingUtilities2.syncCharsBuffer(string$);
        needsTextLayout = SwingUtilities2.isComplexLayout(SwingUtilities2.charsBuffer, 0, length);
      }
    }
    if (needsTextLayout) {
      let layout = SwingUtilities2.createTextLayout(c, string$, fm.getFont(), fm.getFontRenderContext());
      return layout.getAdvance();
    } else {
      return SwingUtilities2.getFontStringWidth(string$, fm, useFPAPI);
    }
  }
  /**
   * Clips the passed in String to the space provided.
   *
   * @param c JComponent that will display the string, may be null
   * @param fm FontMetrics used to measure the String width
   * @param string String to display
   * @param availTextWidth Amount of space that the string can be drawn in
   * @return Clipped string that can fit in the provided space.
   */
  static clipStringIfNecessary(c: JComponent, fm: FontMetrics, string$: string, availTextWidth: number): string {
    if (string$ == null || (string$.length === 0)) {
      return '';
    }
    let textWidth = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, fm, string$);
    if (textWidth > availTextWidth) {
      return SwingUtilities2.clipString(c, fm, string$, availTextWidth);
    }
    return string$;
  }
  /**
   * Clips the passed in String to the space provided.  NOTE: this assumes
   * the string does not fit in the available space.
   *
   * @param c JComponent that will display the string, may be null
   * @param fm FontMetrics used to measure the String width
   * @param string String to display
   * @param availTextWidth Amount of space that the string can be drawn in
   * @return Clipped string that can fit in the provided space.
   */
  static clipString(c: JComponent, fm: FontMetrics, string$: string, availTextWidth: number): string {
    let clipString = '...';
    availTextWidth = (availTextWidth - SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, fm, clipString)) | 0;
    if (availTextWidth <= 0) {
      return clipString;
    }
    let needsTextLayout: boolean;
    {
      let stringLength = SwingUtilities2.syncCharsBuffer(string$);
      needsTextLayout = SwingUtilities2.isComplexLayout(SwingUtilities2.charsBuffer, 0, stringLength);
      if (!needsTextLayout) {
        let width = 0;
        for (let nChars = 0; nChars < stringLength; nChars++) {
          width = (width + fm.charWidth$char(SwingUtilities2.charsBuffer[nChars])) | 0;
          if (width > availTextWidth) {
            string$ = string$.substring(0, nChars);
            break;
          }
        }
      }
    }
    if (needsTextLayout) {
      let aString = new AttributedString(string$);
      if (c != null) {
        aString.addAttribute(TextAttribute.NUMERIC_SHAPING, c.getClientProperty(TextAttribute.NUMERIC_SHAPING));
      }
      let measurer = new LineBreakMeasurer(aString.getIterator(), BreakIterator.getCharacterInstance(), SwingUtilities2.getFontRenderContext$Component$FontMetrics(c, fm));
      string$ = string$.substring(0, measurer.nextOffset(Math.fround(availTextWidth)));
    }
    return string$ + clipString;
  }
  /**
   * Draws the string at the specified location.
   *
   * @param c JComponent that will display the string, may be null
   * @param g Graphics to draw the text to
   * @param text String to display
   * @param x X coordinate to draw the text at
   * @param y Y coordinate to draw the text at
   */
  static drawString$JComponent$Graphics$String$int$int(c: JComponent, g: Graphics, text: string, x: number, y: number): void {
    SwingUtilities2.drawString$JComponent$Graphics$String$float$float$boolean(c, g, text, Math.fround(x), Math.fround(y), false);
  }
  /**
   * Draws the string at the specified location.
   *
   * @param c JComponent that will display the string, may be null
   * @param g Graphics to draw the text to
   * @param text String to display
   * @param x X coordinate to draw the text at
   * @param y Y coordinate to draw the text at
   * @param useFPAPI use floating point API
   */
  static drawString$JComponent$Graphics$String$float$float$boolean(c: JComponent, g: Graphics, text: string, x: number, y: number, useFPAPI: boolean): void {
    if (text == null || text.length <= 0) {
      return;
    }
    if (SwingUtilities2.isPrinting(g)) {
      let g2d = SwingUtilities2.getGraphics2D(g);
      if (g2d != null) {
        let trimmedText = JString.stripTrailing(text);
        if (!(trimmedText.length === 0)) {
          let screenWidth = Math.fround(g2d.getFont().getStringBounds$String$FontRenderContext(trimmedText, SwingUtilities2.getFontRenderContext$Component(c)).getWidth());
          let layout = SwingUtilities2.createTextLayout(c, text, g2d.getFont(), g2d.getFontRenderContext());
          if (Math.fround(SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, g2d.getFontMetrics$(), trimmedText)) > screenWidth) {
            layout = layout.getJustifiedLayout(screenWidth);
          }
          let col = g2d.getColor();
          if (col instanceof PrintColorUIResource) {
            g2d.setColor((col).getPrintColor());
          }
          layout.draw(g2d, x, y);
          g2d.setColor(col);
        }
        return;
      }
    }
    if (g instanceof Graphics2D) {
      let g2 = g;
      let needsTextLayout = ((c != null) && (c.getClientProperty(TextAttribute.NUMERIC_SHAPING) != null));
      if (needsTextLayout) {
        {
          let length = SwingUtilities2.syncCharsBuffer(text);
          needsTextLayout = SwingUtilities2.isComplexLayout(SwingUtilities2.charsBuffer, 0, length);
        }
      }
      let aaHint = (c == null) ? null : c.getClientProperty(RenderingHints.KEY_TEXT_ANTIALIASING);
      if (aaHint != null) {
        let oldContrast = null;
        let oldAAValue = g2.getRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING);
        if (aaHint !== oldAAValue) {
          g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, aaHint);
        } else {
          oldAAValue = null;
        }
        let lcdContrastHint = c.getClientProperty(RenderingHints.KEY_TEXT_LCD_CONTRAST);
        if (lcdContrastHint != null) {
          oldContrast = g2.getRenderingHint(RenderingHints.KEY_TEXT_LCD_CONTRAST);
          if ($J.equals(lcdContrastHint, oldContrast)) {
            oldContrast = null;
          } else {
            g2.setRenderingHint(RenderingHints.KEY_TEXT_LCD_CONTRAST, lcdContrastHint);
          }
        }
        if (needsTextLayout) {
          let layout = SwingUtilities2.createTextLayout(c, text, g2.getFont(), g2.getFontRenderContext());
          layout.draw(g2, x, y);
        } else {
          g2.drawString$String$float$float(text, x, y);
        }
        if (oldAAValue != null) {
          g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, oldAAValue);
        }
        if (oldContrast != null) {
          g2.setRenderingHint(RenderingHints.KEY_TEXT_LCD_CONTRAST, oldContrast);
        }
        return;
      }
      if (needsTextLayout) {
        let layout = SwingUtilities2.createTextLayout(c, text, g2.getFont(), g2.getFontRenderContext());
        layout.draw(g2, x, y);
        return;
      }
    }
    g.drawString$String$int$int(text, $J.d2i(x), $J.d2i(y));
  }
  /**
   * Draws the string at the specified location underlining the specified
   * character.
   *
   * @param c JComponent that will display the string, may be null
   * @param g Graphics to draw the text to
   * @param text String to display
   * @param underlinedIndex Index of a character in the string to underline
   * @param x X coordinate to draw the text at
   * @param y Y coordinate to draw the text at
   */
  static drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(c: JComponent, g: Graphics, text: string, underlinedIndex: number, x: number, y: number): void {
    SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$float$float$boolean(c, g, text, underlinedIndex, Math.fround(x), Math.fround(y), false);
  }
  /**
   * Draws the string at the specified location underlining the specified
   * character.
   *
   * @param c JComponent that will display the string, may be null
   * @param g Graphics to draw the text to
   * @param text String to display
   * @param underlinedIndex Index of a character in the string to underline
   * @param x X coordinate to draw the text at
   * @param y Y coordinate to draw the text at
   * @param useFPAPI use floating point API
   */
  static drawStringUnderlineCharAt$JComponent$Graphics$String$int$float$float$boolean(c: JComponent, g: Graphics, text: string, underlinedIndex: number, x: number, y: number, useFPAPI: boolean): void {
    if (text == null || text.length <= 0) {
      return;
    }
    SwingUtilities2.drawString$JComponent$Graphics$String$float$float$boolean(c, g, text, x, y, useFPAPI);
    let textLength = text.length;
    if (underlinedIndex >= 0 && underlinedIndex < textLength) {
      let underlineRectY = y;
      let underlineRectHeight = 1;
      let underlineRectX = 0;
      let underlineRectWidth = 0;
      let isPrinting = SwingUtilities2.isPrinting(g);
      let needsTextLayout = isPrinting;
      if (!needsTextLayout) {
        {
          SwingUtilities2.syncCharsBuffer(text);
          needsTextLayout = SwingUtilities2.isComplexLayout(SwingUtilities2.charsBuffer, 0, textLength);
        }
      }
      if (!needsTextLayout) {
        let fm = g.getFontMetrics$();
        underlineRectX = Math.fround(x + SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, fm, text.substring(0, underlinedIndex)));
        underlineRectWidth = fm.charWidth$char(text.charCodeAt(underlinedIndex));
      } else {
        let g2d = SwingUtilities2.getGraphics2D(g);
        if (g2d != null) {
          let layout = SwingUtilities2.createTextLayout(c, text, g2d.getFont(), g2d.getFontRenderContext());
          if (isPrinting) {
            let screenWidth = Math.fround(g2d.getFont().getStringBounds$String$FontRenderContext(text, SwingUtilities2.getFontRenderContext$Component(c)).getWidth());
            if (Math.fround(SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, g2d.getFontMetrics$(), text)) > screenWidth) {
              layout = layout.getJustifiedLayout(screenWidth);
            }
          }
          let leading = TextHitInfo.leading(underlinedIndex);
          let trailing = TextHitInfo.trailing(underlinedIndex);
          let shape = layout.getVisualHighlightShape(leading, trailing);
          let rect = shape.getBounds();
          underlineRectX = Math.fround(x + rect.x_);
          underlineRectWidth = rect.width_;
        }
      }
      g.fillRect($J.d2i(underlineRectX), ($J.d2i(underlineRectY) + 1) | 0, underlineRectWidth, underlineRectHeight);
    }
  }
  /**
   * A variation of locationToIndex() which only returns an index if the
   * Point is within the actual bounds of a list item (not just in the cell)
   * and if the JList has the "List.isFileList" client property set.
   * Otherwise, this method returns -1.
   * This is used to make Windows {@literal L&F} JFileChooser act
   * like native dialogs.
   */
  static loc2IndexFileList(list: JList<any>, point: Point): number {
    let index = list.locationToIndex(point);
    if (index !== -1) {
      let bySize = list.getClientProperty('List.isFileList');
      if ($J.isa(bySize, JBoolean) && (bySize) && !SwingUtilities2.pointIsInActualBounds(list, index, point)) {
        index = -1;
      }
    }
    return index;
  }
  /**
   * Returns true if the given point is within the actual bounds of the
   * JList item at index (not just inside the cell).
   */
  static pointIsInActualBounds<T>(list: JList<T>, index: number, point: Point): boolean {
    let renderer = list.getCellRenderer();
    let value = list.getModel().getElementAt(index);
    let item = renderer.getListCellRendererComponent(list, value, index, false, false);
    let itemSize = item.getPreferredSize$();
    let cellBounds = list.getCellBounds(index, index);
    if (!item.getComponentOrientation().isLeftToRight()) {
      cellBounds.x_ = (cellBounds.x_ + (cellBounds.width_ - itemSize.width_)) | 0;
    }
    cellBounds.width_ = itemSize.width_;
    return cellBounds.contains$Point(point);
  }
  /**
   * Returns true if the given point is outside the preferredSize of the
   * item at the given row of the table.  (Column must be 0).
   * Does not check the "Table.isFileList" property. That should be checked
   * before calling this method.
   * This is used to make Windows {@literal L&F} JFileChooser act
   * like native dialogs.
   */
  static pointOutsidePrefSize(table: JTable, row: number, column: number, p: Point): boolean {
    if (table.convertColumnIndexToModel(column) !== 0 || row === -1) {
      return true;
    }
    let tcr = table.getCellRenderer(row, column);
    let value = table.getValueAt(row, column);
    let cell = tcr.getTableCellRendererComponent(table, value, false, false, row, column);
    let itemSize = cell.getPreferredSize$();
    let cellBounds = table.getCellRect(row, column, false);
    cellBounds.width_ = itemSize.width_;
    cellBounds.height_ = itemSize.height_;
    // assert (p.x >= cellBounds.x && p.y >= cellBounds.y)
    return p.x_ > ((cellBounds.x_ + cellBounds.width_) | 0) || p.y_ > ((cellBounds.y_ + cellBounds.height_) | 0);
  }
  /**
   * Set the lead and anchor without affecting selection.
   */
  static setLeadAnchorWithoutSelection(model: ListSelectionModel, lead: number, anchor: number): void {
    if (anchor === -1) {
      anchor = lead;
    }
    if (lead === -1) {
      model.setAnchorSelectionIndex(-1);
      model.setLeadSelectionIndex(-1);
    } else {
      if (model.isSelectedIndex(lead)) {
        model.addSelectionInterval(lead, lead);
      } else {
        model.removeSelectionInterval(lead, lead);
      }
      model.setAnchorSelectionIndex(anchor);
    }
  }
  /**
   * Ignore mouse events if the component is null, not enabled, the event
   * is not associated with the left mouse button, or the event has been
   * consumed.
   */
  static shouldIgnore(me: MouseEvent, c: JComponent): boolean {
    return c == null || !c.isEnabled() || !SwingUtilities.isLeftMouseButton(me) || me.isConsumed();
  }
  /**
   * Request focus on the given component if it doesn't already have it
   * and {@code isRequestFocusEnabled()} returns true.
   */
  static adjustFocus(c: JComponent): void {
    if (!c.hasFocus() && c.isRequestFocusEnabled()) {
      c.requestFocus$();
    }
  }
  static drawChars$JComponent$Graphics$charArr$int$int$float$float(c: JComponent, g: Graphics, data: number[], offset: number, length: number, x: number, y: number): number {
    return SwingUtilities2.drawChars$JComponent$Graphics$charArr$int$int$float$float$boolean(c, g, data, offset, length, x, y, true);
  }
  static drawChars$JComponent$Graphics$charArr$int$int$float$float$boolean(c: JComponent, g: Graphics, data: number[], offset: number, length: number, x: number, y: number, useFPAPI: boolean): number {
    if (length <= 0) {
      return x;
    }
    let nextX = Math.fround(x + SwingUtilities2.getFontCharsWidth(data, offset, length, SwingUtilities2.getFontMetrics$JComponent$Graphics(c, g), useFPAPI));
    if (SwingUtilities2.isPrinting(g)) {
      let g2d = SwingUtilities2.getGraphics2D(g);
      if (g2d != null) {
        let deviceFontRenderContext = g2d.getFontRenderContext();
        let frc = SwingUtilities2.getFontRenderContext$Component(c);
        if (frc != null && !SwingUtilities2.isFontRenderContextPrintCompatible(deviceFontRenderContext, frc)) {
          let text = JString.newString(data, offset, length);
          let layout = new TextLayout(text, g2d.getFont(), deviceFontRenderContext);
          let trimmedText = JString.stripTrailing(text);
          if (!(trimmedText.length === 0)) {
            let screenWidth = Math.fround(g2d.getFont().getStringBounds$String$FontRenderContext(trimmedText, frc).getWidth());
            if (Math.fround(SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, g2d.getFontMetrics$(), trimmedText)) > screenWidth) {
              layout = layout.getJustifiedLayout(screenWidth);
            }
            let col = g2d.getColor();
            if (col instanceof PrintColorUIResource) {
              g2d.setColor((col).getPrintColor());
            }
            layout.draw(g2d, x, y);
            g2d.setColor(col);
          }
          return nextX;
        }
      }
    }
    let aaHint = (c == null) ? null : c.getClientProperty(RenderingHints.KEY_TEXT_ANTIALIASING);
    if (!(g instanceof Graphics2D)) {
      g.drawChars(data, offset, length, $J.d2i(x), $J.d2i(y));
      return nextX;
    }
    let g2 = g;
    if (aaHint != null) {
      let oldContrast = null;
      let oldAAValue = g2.getRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING);
      if (aaHint != null && aaHint !== oldAAValue) {
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, aaHint);
      } else {
        oldAAValue = null;
      }
      let lcdContrastHint = c.getClientProperty(RenderingHints.KEY_TEXT_LCD_CONTRAST);
      if (lcdContrastHint != null) {
        oldContrast = g2.getRenderingHint(RenderingHints.KEY_TEXT_LCD_CONTRAST);
        if ($J.equals(lcdContrastHint, oldContrast)) {
          oldContrast = null;
        } else {
          g2.setRenderingHint(RenderingHints.KEY_TEXT_LCD_CONTRAST, lcdContrastHint);
        }
      }
      g2.drawString$String$float$float(JString.newString(data, offset, length), x, y);
      if (oldAAValue != null) {
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, oldAAValue);
      }
      if (oldContrast != null) {
        g2.setRenderingHint(RenderingHints.KEY_TEXT_LCD_CONTRAST, oldContrast);
      }
    } else {
      g2.drawString$String$float$float(JString.newString(data, offset, length), x, y);
    }
    return nextX;
  }
  static getFontCharWidth(c: number, fm: FontMetrics, useFPAPI: boolean): number {
    return SwingUtilities2.getFontCharsWidth([c], 0, 1, fm, useFPAPI);
  }
  static getFontCharsWidth(data: number[], offset: number, len: number, fm: FontMetrics, useFPAPI: boolean): number {
    if (len === 0) {
      return 0;
    }
    if (useFPAPI) {
      let bounds = fm.getFont().getStringBounds$charArr$int$int$FontRenderContext(data, offset, (offset + len) | 0, fm.getFontRenderContext());
      return Math.fround(bounds.getWidth());
    } else {
      return Math.fround(fm.charsWidth(data, offset, len));
    }
  }
  static getFontStringWidth(data: string, fm: FontMetrics, useFPAPI: boolean): number {
    if (useFPAPI) {
      let bounds = fm.getFont().getStringBounds$String$FontRenderContext(data, fm.getFontRenderContext());
      return Math.fround(bounds.getWidth());
    } else {
      return Math.fround(fm.stringWidth(data));
    }
  }
  static drawString$JComponent$Graphics$AttributedCharacterIterator$int$int(c: JComponent, g: Graphics, iterator: AttributedCharacterIterator, x: number, y: number): number {
    return SwingUtilities2.drawStringImpl(c, g, iterator, Math.fround(x), Math.fround(y));
  }
  static drawString$JComponent$Graphics$AttributedCharacterIterator$float$float(c: JComponent, g: Graphics, iterator: AttributedCharacterIterator, x: number, y: number): number {
    return SwingUtilities2.drawStringImpl(c, g, iterator, x, y);
  }
  static drawStringImpl(c: JComponent, g: Graphics, iterator: AttributedCharacterIterator, x: number, y: number): number {
    let retVal: number;
    let isPrinting = SwingUtilities2.isPrinting(g);
    let col = g.getColor();
    if (isPrinting) {
      if (col instanceof PrintColorUIResource) {
        g.setColor((col).getPrintColor());
      }
    }
    let g2d = SwingUtilities2.getGraphics2D(g);
    if (g2d == null) {
      g.drawString$AttributedCharacterIterator$int$int(iterator, $J.d2i(x), $J.d2i(y));
      retVal = x;
    } else {
      let frc: FontRenderContext;
      if (isPrinting) {
        frc = SwingUtilities2.getFontRenderContext$Component(c);
        if (frc.isAntiAliased() || frc.usesFractionalMetrics()) {
          frc = new FontRenderContext()._FontRenderContext$AffineTransform$boolean$boolean(frc.getTransform(), false, false);
        }
      } else if ((frc = SwingUtilities2.getFRCProperty(c)) != null) {
      } else {
        frc = g2d.getFontRenderContext();
      }
      let layout: TextLayout;
      if (isPrinting) {
        let deviceFRC = g2d.getFontRenderContext();
        if (!SwingUtilities2.isFontRenderContextPrintCompatible(frc, deviceFRC)) {
          layout = new TextLayout(iterator, deviceFRC);
          let trimmedIt = SwingUtilities2.getTrimmedTrailingSpacesIterator(iterator);
          if (trimmedIt != null) {
            let screenWidth = new TextLayout(trimmedIt, frc).getAdvance();
            layout = layout.getJustifiedLayout(screenWidth);
          }
        } else {
          layout = new TextLayout(iterator, frc);
        }
      } else {
        layout = new TextLayout(iterator, frc);
      }
      layout.draw(g2d, x, y);
      retVal = layout.getAdvance();
    }
    if (isPrinting) {
      g.setColor(col);
    }
    return retVal;
  }
  /**
   * This method should be used for drawing a borders over a filled rectangle.
   * Draws vertical line, using the current color, between the points {@code
   * (x, y1)} and {@code (x, y2)} in graphics context's coordinate system.
   * Note: it use {@code Graphics.fillRect()} internally.
   *
   * @param g  Graphics to draw the line to.
   * @param x  the <i>x</i> coordinate.
   * @param y1 the first point's <i>y</i> coordinate.
   * @param y2 the second point's <i>y</i> coordinate.
   */
  static drawVLine(g: Graphics, x: number, y1: number, y2: number): void {
    if (y2 < y1) {
      let temp = y2;
      y2 = y1;
      y1 = temp;
    }
    g.fillRect(x, y1, 1, (y2 - y1 + 1) | 0);
  }
  /**
   * This method should be used for drawing a borders over a filled rectangle.
   * Draws horizontal line, using the current color, between the points {@code
   * (x1, y)} and {@code (x2, y)} in graphics context's coordinate system.
   * Note: it use {@code Graphics.fillRect()} internally.
   *
   * @param g  Graphics to draw the line to.
   * @param x1 the first point's <i>x</i> coordinate.
   * @param x2 the second point's <i>x</i> coordinate.
   * @param y  the <i>y</i> coordinate.
   */
  static drawHLine(g: Graphics, x1: number, x2: number, y: number): void {
    if (x2 < x1) {
      let temp = x2;
      x2 = x1;
      x1 = temp;
    }
    g.fillRect(x1, y, (x2 - x1 + 1) | 0, 1);
  }
  /**
   * This method should be used for drawing a borders over a filled rectangle.
   * Draws the outline of the specified rectangle. The left and right edges of
   * the rectangle are at {@code x} and {@code x + w}. The top and bottom
   * edges are at {@code y} and {@code y + h}. The rectangle is drawn using
   * the graphics context's current color. Note: it use {@code
   * Graphics.fillRect()} internally.
   *
   * @param g Graphics to draw the rectangle to.
   * @param x the <i>x</i> coordinate of the rectangle to be drawn.
   * @param y the <i>y</i> coordinate of the rectangle to be drawn.
   * @param w the w of the rectangle to be drawn.
   * @param h the h of the rectangle to be drawn.
   * @see SwingUtilities2#drawVLine(java.awt.Graphics, int, int, int)
   * @see SwingUtilities2#drawHLine(java.awt.Graphics, int, int, int)
   */
  static drawRect(g: Graphics, x: number, y: number, w: number, h: number): void {
    if (w < 0 || h < 0) {
      return;
    }
    if (h === 0 || w === 0) {
      g.fillRect(x, y, (w + 1) | 0, (h + 1) | 0);
    } else {
      g.fillRect(x, y, w, 1);
      g.fillRect((x + w) | 0, y, 1, h);
      g.fillRect((x + 1) | 0, (y + h) | 0, w, 1);
      g.fillRect(x, (y + 1) | 0, 1, h);
    }
  }
  static createTextLayout(c: JComponent, s: string, f: Font, frc: FontRenderContext): TextLayout {
    let shaper = (c == null ? null : c.getClientProperty(TextAttribute.NUMERIC_SHAPING));
    if (shaper == null) {
      return new TextLayout(s, f, frc);
    } else {
      let a = new HashMap();
      a.put(TextAttribute.FONT, f);
      a.put(TextAttribute.NUMERIC_SHAPING, shaper);
      return new TextLayout(s, a, frc);
    }
  }
  static isFontRenderContextPrintCompatible(frc1: FontRenderContext, frc2: FontRenderContext): boolean {
    if (frc1 === frc2) {
      return true;
    }
    if (frc1 == null || frc2 == null) {
      return false;
    }
    if (frc1.getFractionalMetricsHint() !== frc2.getFractionalMetricsHint()) {
      return false;
    }
    if (!frc1.isTransformed() && !frc2.isTransformed()) {
      return true;
    }
    let mat1 = $J.newArray(4, 0);
    let mat2 = $J.newArray(4, 0);
    frc1.getTransform().getMatrix(mat1);
    frc2.getTransform().getMatrix(mat2);
    return mat1[0] === mat2[0] && mat1[1] === mat2[1] && mat1[2] === mat2[2] && mat1[3] === mat2[3];
  }
  static getGraphics2D(g: Graphics): Graphics2D {
    if (g instanceof Graphics2D) {
      return g;
    } else if ($J.isa(g, ProxyPrintGraphics)) {
      return ((g).getGraphics());
    } else {
      return null;
    }
  }
  static getFontRenderContext$Component(c: Component): FontRenderContext {
    // assert c != null
    if (c == null) {
      return SwingUtilities2.DEFAULT_FRC;
    } else {
      return c.getFontMetrics(c.getFont()).getFontRenderContext();
    }
  }
  /**
   * A convenience method to get FontRenderContext.
   * Returns the FontRenderContext for the passed in FontMetrics or
   * for the passed in Component if FontMetrics is null
   */
  static getFontRenderContext$Component$FontMetrics(c: Component, fm: FontMetrics): FontRenderContext {
    // assert fm != null || c != null
    return (fm != null) ? fm.getFontRenderContext() : SwingUtilities2.getFontRenderContext$Component(c);
  }
  static getFontMetrics$JComponent$Font(c: JComponent, font: Font): FontMetrics {
    let frc = SwingUtilities2.getFRCProperty(c);
    if (frc == null) {
      frc = SwingUtilities2.DEFAULT_FRC;
    }
    return FontDesignMetrics.getMetrics(font, frc);
  }
  static getFRCProperty(c: JComponent): FontRenderContext {
    if (c != null) {
      let gc = c.getGraphicsConfiguration();
      let tx = (gc == null) ? null : gc.getDefaultTransform();
      let aaHint = c.getClientProperty(RenderingHints.KEY_TEXT_ANTIALIASING);
      return SwingUtilities2.getFRCFromCache(tx, aaHint);
    }
    return null;
  }
  static getFRCFromCache(tx: AffineTransform, aaHint: any): FontRenderContext {
    if (tx == null && aaHint == null) {
      return null;
    }
    let cache = AppContext.getAppContext().get(SwingUtilities2.APP_CONTEXT_FRC_CACHE_KEY);
    if (cache == null) {
      cache = new HashMap();
      AppContext.getAppContext().put(SwingUtilities2.APP_CONTEXT_FRC_CACHE_KEY, cache);
    }
    let key = (tx == null) ? aaHint : (aaHint == null ? tx : new SwingUtilities2$KeyPair()._SwingUtilities2$KeyPair(tx, aaHint));
    let frc = cache.get(key);
    if (frc == null) {
      aaHint = (aaHint == null) ? RenderingHints.VALUE_TEXT_ANTIALIAS_OFF : aaHint;
      frc = new FontRenderContext()._FontRenderContext$AffineTransform$Object$Object(tx, aaHint, RenderingHints.VALUE_FRACTIONALMETRICS_DEFAULT);
      cache.put(key, frc);
    }
    return frc;
  }
  static isPrinting(g: Graphics): boolean {
    return ($J.isa(g, PrinterGraphics) || $J.isa(g, PrintGraphics));
  }
  static getTrimmedTrailingSpacesIterator(iterator: AttributedCharacterIterator): AttributedCharacterIterator {
    let curIdx = iterator.getIndex();
    let c = iterator.last();
    while (c !== 65535 /* \uffff */ && Character.isWhitespace(c)) {
      c = iterator.previous();
    }
    if (c !== 65535 /* \uffff */) {
      let endIdx = iterator.getIndex();
      if (endIdx === ((iterator.getEndIndex() - 1) | 0)) {
        iterator.setIndex(curIdx);
        return iterator;
      } else {
        let trimmedText = new AttributedString(iterator, iterator.getBeginIndex(), (endIdx + 1) | 0);
        return trimmedText.getIterator();
      }
    } else {
      return null;
    }
  }
  /**
   * Determines whether the SelectedTextColor should be used for painting text
   * foreground for the specified highlight.
   *
   * Returns true only if the highlight painter for the specified highlight
   * is the swing painter (whether inner class of javax.swing.text.DefaultHighlighter
   * or com.sun.java.swing.plaf.windows.WindowsTextUI) and its background color
   * is null or equals to the selection color of the text component.
   *
   * This is a hack for fixing both bugs 4761990 and 5003294
   */
  static useSelectedTextColor(h: Highlighter$Highlight, c: JTextComponent): boolean {
    let painter = h.getPainter();
    let painterClass = painter.getClass().getName();
    if (painterClass.indexOf('javax.swing.text.DefaultHighlighter') !== 0 && painterClass.indexOf('com.sun.java.swing.plaf.windows.WindowsTextUI') !== 0) {
      return false;
    }
    try {
      let defPainter = painter;
      if (defPainter.getColor() != null && !defPainter.getColor().equals(c.getSelectionColor())) {
        return false;
      }
    } catch ($e0) {
      if ($J.isa($e0, ClassCastException)) {
        let e = $J.exc($e0);
        return false;
      } else {
        throw $e0;
      }
    }
    return true;
  }
  /**
   * checks the security permissions for accessing system clipboard
   *
   * for untrusted context (see isTrustedContext) checks the
   * permissions for the current event being handled
   */
  static canAccessSystemClipboard(): boolean {
    let canAccess = false;
    if (!GraphicsEnvironment.isHeadless()) {
      let sm = $J.system_getSecurityManager();
      if (sm == null) {
        canAccess = true;
      } else {
        try {
          sm.checkPermission(AWTPermissions.ACCESS_CLIPBOARD_PERMISSION);
          canAccess = true;
        } catch ($e1) {
          if ($J.isa($e1, SecurityException)) {
            let e = $J.exc($e1);
          } else {
            throw $e1;
          }
        }
        if (canAccess && !SwingUtilities2.isTrustedContext()) {
          canAccess = SwingUtilities2.canCurrentEventAccessSystemClipboard$boolean(true);
        }
      }
    }
    return canAccess;
  }
  /**
   * Returns true if EventQueue.getCurrentEvent() has the permissions to
   * access the system clipboard
   */
  static canCurrentEventAccessSystemClipboard$(): boolean {
    return SwingUtilities2.isTrustedContext() || SwingUtilities2.canCurrentEventAccessSystemClipboard$boolean(false);
  }
  /**
   * Returns true if the given event has permissions to access the
   * system clipboard
   *
   * @param e AWTEvent to check
   */
  static canEventAccessSystemClipboard$AWTEvent(e: AWTEvent): boolean {
    return SwingUtilities2.isTrustedContext() || SwingUtilities2.canEventAccessSystemClipboard$AWTEvent$boolean(e, false);
  }
  /**
   * Returns true if the given event is current gesture for
   * accessing clipboard
   *
   * @param ie InputEvent to check
   */
  static isAccessClipboardGesture(ie: InputEvent): boolean {
    let allowedGesture = false;
    if (ie instanceof KeyEvent) {
      let ke = ie;
      let keyCode = ke.getKeyCode();
      let keyModifiers = ke.getModifiers();
      switch (keyCode) {
        case KeyEvent.VK_C:
        case KeyEvent.VK_V:
        case KeyEvent.VK_X:
          allowedGesture = (keyModifiers === InputEvent.CTRL_MASK);
          break;
        case KeyEvent.VK_INSERT:
          allowedGesture = (keyModifiers === InputEvent.CTRL_MASK || keyModifiers === InputEvent.SHIFT_MASK);
          break;
        case KeyEvent.VK_COPY:
        case KeyEvent.VK_PASTE:
        case KeyEvent.VK_CUT:
          allowedGesture = true;
          break;
        case KeyEvent.VK_DELETE:
          allowedGesture = (keyModifiers === InputEvent.SHIFT_MASK);
          break;
      }
    }
    return allowedGesture;
  }
  /**
   * Returns true if e has the permissions to
   * access the system clipboard and if it is allowed gesture (if
   * checkGesture is true)
   *
   * @param e AWTEvent to check
   * @param checkGesture boolean
   */
  static canEventAccessSystemClipboard$AWTEvent$boolean(e: AWTEvent, checkGesture: boolean): boolean {
    if (EventQueue.isDispatchThread()) {
      if (e instanceof InputEvent && (!checkGesture || SwingUtilities2.isAccessClipboardGesture(e))) {
        return AWTAccessor.getInputEventAccessor().canAccessSystemClipboard(e);
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  /**
   * Utility method that throws SecurityException if SecurityManager is set
   * and modifiers are not public
   *
   * @param modifiers a set of modifiers
   */
  static checkAccess(modifiers: number): void {
    if ($J.system_getSecurityManager() != null && !Modifier.isPublic(modifiers)) {
      throw new SecurityException('Resource is not accessible');
    }
  }
  /**
   * Returns true if EventQueue.getCurrentEvent() has the permissions to
   * access the system clipboard and if it is allowed gesture (if
   * checkGesture true)
   *
   * @param checkGesture boolean
   */
  static canCurrentEventAccessSystemClipboard$boolean(checkGesture: boolean): boolean {
    let event = EventQueue.getCurrentEvent();
    return SwingUtilities2.canEventAccessSystemClipboard$AWTEvent$boolean(event, checkGesture);
  }
  /**
   * see RFE 5012841 [Per AppContect security permissions] for the
   * details
   */
  static isTrustedContext(): boolean {
    return ($J.system_getSecurityManager() == null) || (AppContext.getAppContext().get(SwingUtilities2.UntrustedClipboardAccess) == null);
  }
  static displayPropertiesToCSS(font: Font, fg: Color): string {
    let rule = new StringBuilder('body {');
    if (font != null) {
      rule.append(' font-family: ');
      rule.append(font.getFamily$());
      rule.append(' ; ');
      rule.append(' font-size: ');
      rule.append(String(font.getSize()));
      rule.append('pt ;');
      if (font.isBold()) {
        rule.append(' font-weight: 700 ; ');
      }
      if (font.isItalic()) {
        rule.append(' font-style: italic ; ');
      }
    }
    if (fg != null) {
      rule.append(' color: #');
      if (fg.getRed() < 16) {
        rule.append(String.fromCharCode(48 /* '0' */));
      }
      rule.append($J.Integer_toHexString(fg.getRed()));
      if (fg.getGreen() < 16) {
        rule.append(String.fromCharCode(48 /* '0' */));
      }
      rule.append($J.Integer_toHexString(fg.getGreen()));
      if (fg.getBlue() < 16) {
        rule.append(String.fromCharCode(48 /* '0' */));
      }
      rule.append($J.Integer_toHexString(fg.getBlue()));
      rule.append(' ; ');
    }
    rule.append(' }');
    return rule.toString();
  }
  /**
   * Utility method that creates a {@code UIDefaults.LazyValue} that
   * creates an {@code ImageIcon} {@code UIResource} for the
   * specified image file name. The image is loaded using
   * {@code getResourceAsStream}, starting with a call to that method
   * on the base class parameter. If it cannot be found, searching will
   * continue through the base class' inheritance hierarchy, up to and
   * including {@code rootClass}.
   *
   * @param baseClass the first class to use in searching for the resource
   * @param rootClass an ancestor of {@code baseClass} to finish the
   *                  search at
   * @param imageFile the name of the file to be found
   * @return a lazy value that creates the {@code ImageIcon}
   *         {@code UIResource} for the image,
   *         or null if it cannot be found
   */
  static makeIcon$Class$Class$String(baseClass: JClass<any>, rootClass: JClass<any>, imageFile: string): any {
    return SwingUtilities2.makeIcon$Class$Class$String$boolean(baseClass, rootClass, imageFile, true);
  }
  static makeIcon$Class$Class$String$boolean(baseClass: JClass<any>, rootClass: JClass<any>, imageFile: string, enablePrivileges: boolean): any {
    return (table) => {
      let buffer = enablePrivileges ? AccessController.doPrivileged($J.lambdaObj(() => SwingUtilities2.getIconBytes(baseClass, rootClass, imageFile), 'run', 'java.security.PrivilegedAction')) : SwingUtilities2.getIconBytes(baseClass, rootClass, imageFile);
      if (buffer == null) {
        return null;
      }
      if (buffer.length === 0) {
        $J.err.println('warning: ' + imageFile + ' is zero-length');
        return null;
      }
      return new ImageIconUIResource()._ImageIconUIResource$byteArr(buffer);
    };
  }
  static getIconBytes(baseClass: JClass<any>, rootClass: JClass<any>, imageFile: string): number[] {
    let srchClass = baseClass;
    while (srchClass != null) {
      {
        try {
          const resource = srchClass.getResourceAsStream(imageFile);
          try {
            if (resource == null) {
              if (srchClass === rootClass) {
                break;
              }
              srchClass = srchClass.getSuperclass();
              continue;
            }
            {
              const in$ = new BufferedInputStream(resource);
              try {
                return in$.readAllBytes();
              } finally {
                if (in$ != null) in$.close();
              }
            }
          } finally {
            if (resource != null) resource.close();
          }
        } catch ($e2) {
          if ($J.isa($e2, IOException)) {
            let ioe = $J.exc($e2);
            $J.err.println(ioe.toString());
          } else {
            throw $e2;
          }
        }
      }
    }
    return null;
  }
  static isLocalDisplay(): boolean {
    let isLocal: boolean;
    let ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
    if ($J.isa(ge, SunGraphicsEnvironment)) {
      isLocal = (ge).isDisplayLocal();
    } else {
      isLocal = true;
    }
    return isLocal;
  }
  /**
   * Returns an integer from the defaults table that is appropriate
   * for the given locale. If {@code key} does not map to a valid
   * {@code Integer}, or cannot be converted from a {@code String}
   * to an integer, the value 0 is returned.
   *
   * @param key  an {@code Object} specifying the int. Returned value
   *             is 0 if {@code key} is not available,
   * @param l the {@code Locale} for which the int is desired
   * @return the int
   */
  static getUIDefaultsInt$Object$Locale(key: any, l: Locale): number {
    return SwingUtilities2.getUIDefaultsInt$Object$Locale$int(key, l, 0);
  }
  /**
   * Returns an integer from the defaults table that is appropriate
   * for the given locale. If {@code key} does not map to a valid
   * {@code Integer}, or can not be converted from a {@code String}
   * to an integer, {@code default} is returned.
   *
   * @param key  an {@code Object} specifying the int. Returned value
   *             is 0 if {@code key} is not available,
   * @param l the {@code Locale} for which the int is desired
   * @param defaultValue Returned value if {@code key} is not available,
   *                     or is not an Integer
   * @return the int
   */
  static getUIDefaultsInt$Object$Locale$int(key: any, l: Locale, defaultValue: number): number {
    let value = UIManager.get$Object$Locale(key, l);
    if ($J.isa(value, Integer)) {
      return (+(value));
    }
    if ($J.isa(value, JString)) {
      try {
        return $J.parseInt(value);
      } catch ($e3) {
        if ($J.isa($e3, NumberFormatException)) {
          let nfe = $J.exc($e3);
        } else {
          throw $e3;
        }
      }
    }
    return defaultValue;
  }
  static compositeRequestFocus(component: Component): Component {
    if (component instanceof Container) {
      let container = component;
      if (container.isFocusCycleRoot$()) {
        let policy = container.getFocusTraversalPolicy();
        let comp = policy.getDefaultComponent(container);
        if (comp != null) {
          comp.requestFocus$();
          return comp;
        }
      }
      let rootAncestor = container.getFocusCycleRootAncestor();
      if (rootAncestor != null) {
        let policy = rootAncestor.getFocusTraversalPolicy();
        let comp = policy.getComponentAfter(rootAncestor, container);
        if (comp != null && SwingUtilities.isDescendingFrom(comp, container)) {
          comp.requestFocus$();
          return comp;
        }
      }
    }
    if (component.isFocusable()) {
      component.requestFocus$();
      return component;
    }
    return null;
  }
  /**
   * Change focus to the visible component in {@code JTabbedPane}.
   * This is not a general-purpose method and is here only to permit
   * sharing code.
   */
  static tabbedPaneChangeFocusTo(comp: Component): boolean {
    if (comp != null) {
      if (comp.isFocusTraversable()) {
        SwingUtilities2.compositeRequestFocus(comp);
        return true;
      } else if (comp instanceof JComponent && (comp).requestDefaultFocus()) {
        return true;
      }
    }
    return false;
  }
  /**
   * Sets the {@code SKIP_CLICK_COUNT} client property on the component
   * if it is an instance of {@code JTextComponent} with a
   * {@code DefaultCaret}. This property, used for text components acting
   * as editors in a table or tree, tells {@code DefaultCaret} how many
   * clicks to skip before starting selection.
   */
  static setSkipClickCount(comp: Component, count: number): void {
    if (comp instanceof JTextComponent && (comp).getCaret() instanceof DefaultCaret) {
      (comp).putClientProperty(SwingUtilities2.SKIP_CLICK_COUNT, count);
    }
  }
  /**
   * Return the MouseEvent's click count, possibly reduced by the value of
   * the component's {@code SKIP_CLICK_COUNT} client property. Clears
   * the {@code SKIP_CLICK_COUNT} property if the mouse event's click count
   * is 1. In order for clearing of the property to work correctly, there
   * must be a mousePressed implementation on the caller with this
   * call as the first line.
   */
  static getAdjustedClickCount(comp: JTextComponent, e: MouseEvent): number {
    let cc = e.getClickCount();
    if (cc === 1) {
      comp.putClientProperty(SwingUtilities2.SKIP_CLICK_COUNT, null);
    } else {
      let sub = comp.getClientProperty(SwingUtilities2.SKIP_CLICK_COUNT);
      if (sub != null) {
        return (cc - sub) | 0;
      }
    }
    return cc;
  }
  /**
   * This method divides a rectangle into two or three sections along
   * the specified axis and determines which section the given point
   * lies in on that axis; used by drag and drop when calculating drop
   * locations.
   * <p>
   * For two sections, the rectangle is divided equally and the method
   * returns whether the point lies in {@code Section.LEADING} or
   * {@code Section.TRAILING}. For horizontal divisions, the calculation
   * respects component orientation.
   * <p>
   * For three sections, if the rectangle is greater than or equal to
   * 30 pixels in length along the axis, the calculation gives 10 pixels
   * to each of the leading and trailing sections and the remainder to the
   * middle. For smaller sizes, the rectangle is divided equally into three
   * sections.
   * <p>
   * Note: This method assumes that the point is within the bounds of
   * the given rectangle on the specified axis. However, in cases where
   * it isn't, the results still have meaning: {@code Section.MIDDLE}
   * remains the same, {@code Section.LEADING} indicates that the point
   * is in or somewhere before the leading section, and
   * {@code Section.TRAILING} indicates that the point is in or somewhere
   * after the trailing section.
   *
   * @param rect the rectangle
   * @param p the point the check
   * @param horizontal {@code true} to use the horizontal axis,
   *        or {@code false} for the vertical axis
   * @param ltr {@code true} for left to right orientation,
   *        or {@code false} for right to left orientation;
   *        only used for horizontal calculations
   * @param three {@code true} for three sections,
   *        or {@code false} for two
   *
   * @return the {@code Section} where the point lies
   *
   * @throws NullPointerException if {@code rect} or {@code p} are
   *         {@code null}
   */
  static liesIn(rect: Rectangle, p: Point, horizontal: boolean, ltr: boolean, three: boolean): SwingUtilities2$Section {
    let p0: number;
    let pComp: number;
    let length: number;
    let forward: boolean;
    if (horizontal) {
      p0 = rect.x_;
      pComp = p.x_;
      length = rect.width_;
      forward = ltr;
    } else {
      p0 = rect.y_;
      pComp = p.y_;
      length = rect.height_;
      forward = true;
    }
    if (three) {
      let boundary = (length >= 30) ? 10 : $J.idiv(length, 3);
      if (pComp < ((p0 + boundary) | 0)) {
        return forward ? SwingUtilities2$Section.LEADING : SwingUtilities2$Section.TRAILING;
      } else if (pComp >= ((p0 + length - boundary) | 0)) {
        return forward ? SwingUtilities2$Section.TRAILING : SwingUtilities2$Section.LEADING;
      }
      return SwingUtilities2$Section.MIDDLE;
    } else {
      let middle = (p0 + $J.idiv(length, 2)) | 0;
      if (forward) {
        return pComp >= middle ? SwingUtilities2$Section.TRAILING : SwingUtilities2$Section.LEADING;
      } else {
        return pComp < middle ? SwingUtilities2$Section.TRAILING : SwingUtilities2$Section.LEADING;
      }
    }
  }
  /**
   * This method divides a rectangle into two or three sections along
   * the horizontal axis and determines which section the given point
   * lies in; used by drag and drop when calculating drop locations.
   * <p>
   * See the documentation for {@link #liesIn} for more information
   * on how the section is calculated.
   *
   * @param rect the rectangle
   * @param p the point the check
   * @param ltr {@code true} for left to right orientation,
   *        or {@code false} for right to left orientation
   * @param three {@code true} for three sections,
   *        or {@code false} for two
   *
   * @return the {@code Section} where the point lies
   *
   * @throws NullPointerException if {@code rect} or {@code p} are
   *         {@code null}
   */
  static liesInHorizontal(rect: Rectangle, p: Point, ltr: boolean, three: boolean): SwingUtilities2$Section {
    return SwingUtilities2.liesIn(rect, p, true, ltr, three);
  }
  /**
   * This method divides a rectangle into two or three sections along
   * the vertical axis and determines which section the given point
   * lies in; used by drag and drop when calculating drop locations.
   * <p>
   * See the documentation for {@link #liesIn} for more information
   * on how the section is calculated.
   *
   * @param rect the rectangle
   * @param p the point the check
   * @param three {@code true} for three sections,
   *        or {@code false} for two
   *
   * @return the {@code Section} where the point lies
   *
   * @throws NullPointerException if {@code rect} or {@code p} are
   *         {@code null}
   */
  static liesInVertical(rect: Rectangle, p: Point, three: boolean): SwingUtilities2$Section {
    return SwingUtilities2.liesIn(rect, p, false, false, three);
  }
  /**
   * Maps the index of the column in the view at
   * {@code viewColumnIndex} to the index of the column
   * in the table model.  Returns the index of the corresponding
   * column in the model.  If {@code viewColumnIndex}
   * is less than zero, returns {@code viewColumnIndex}.
   *
   * @param cm the table model
   * @param   viewColumnIndex     the index of the column in the view
   * @return  the index of the corresponding column in the model
   *
   * @see JTable#convertColumnIndexToModel(int)
   * @see javax.swing.plaf.basic.BasicTableHeaderUI
   */
  static convertColumnIndexToModel(cm: TableColumnModel, viewColumnIndex: number): number {
    if (viewColumnIndex < 0) {
      return viewColumnIndex;
    }
    return cm.getColumn(viewColumnIndex).getModelIndex();
  }
  /**
   * Maps the index of the column in the {@code cm} at
   * {@code modelColumnIndex} to the index of the column
   * in the view.  Returns the index of the
   * corresponding column in the view; returns {@code -1} if this column
   * is not being displayed. If {@code modelColumnIndex} is less than zero,
   * returns {@code modelColumnIndex}.
   *
   * @param cm the table model
   * @param modelColumnIndex the index of the column in the model
   * @return the index of the corresponding column in the view
   *
   * @see JTable#convertColumnIndexToView(int)
   * @see javax.swing.plaf.basic.BasicTableHeaderUI
   */
  static convertColumnIndexToView(cm: TableColumnModel, modelColumnIndex: number): number {
    if (modelColumnIndex < 0) {
      return modelColumnIndex;
    }
    for (let column = 0; column < cm.getColumnCount(); column++) {
      if (cm.getColumn(column).getModelIndex() === modelColumnIndex) {
        return column;
      }
    }
    return -1;
  }
  /**
   * Sets the InputEvent.ALT_GRAPH mask on any modifier passed to the function
   * @param modifier the modifier passed
   * @return the modifier retiurned with ALT_GRAPH flag set
   */
  static setAltGraphMask(modifier: number): number {
    return (modifier | InputEvent.ALT_GRAPH_DOWN_MASK);
  }
  static getSystemMnemonicKeyMask(): number {
    let toolkit = Toolkit.getDefaultToolkit();
    if ($J.isa(toolkit, SunToolkit)) {
      return (toolkit).getFocusAcceleratorKeyMask();
    }
    return InputEvent.ALT_MASK;
  }
  /**
   * Returns the {@link TreePath} that identifies the changed nodes.
   *
   * @param event  changes in a tree model
   * @param model  corresponding tree model
   * @return  the path to the changed nodes
   */
  static getTreePath(event: TreeModelEvent, model: TreeModel): TreePath {
    let path = event.getTreePath();
    if ((path == null) && (model != null)) {
      let root = model.getRoot();
      if (root != null) {
        path = new TreePath()._TreePath$Object(root);
      }
    }
    return path;
  }
  static isScaledGraphics(g: Graphics): boolean {
    if (g instanceof Graphics2D) {
      let tx = (g).getTransform();
      return (tx.getType() & ~(AffineTransform.TYPE_TRANSLATION | AffineTransform.TYPE_FLIP)) !== 0;
    }
    return false;
  }
  /**
   * Enables the antialiasing rendering hint for the scaled graphics and
   * returns the previous hint value.
   * The returned null value indicates that the passed graphics is not
   * instance of Graphics2D.
   *
   * @param g the graphics
   * @return the previous antialiasing rendering hint value if the passed
   * graphics is instance of Graphics2D, null otherwise.
   */
  static getAndSetAntialisingHintForScaledGraphics(g: Graphics): any {
    if (SwingUtilities2.isScaledGraphics(g) && SwingUtilities2.isLocalDisplay()) {
      let g2d = g;
      let hint = g2d.getRenderingHint(RenderingHints.KEY_ANTIALIASING);
      g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
      return hint;
    }
    return null;
  }
  /**
   * Sets the antialiasing rendering hint if its value is not null.
   * Null hint value indicates that the passed graphics is not instance of
   * Graphics2D.
   *
   * @param g the graphics
   * @param hint the antialiasing rendering hint
   */
  static setAntialiasingHintForScaledGraphics(g: Graphics, hint: any): void {
    if (hint != null) {
      (g).setRenderingHint(RenderingHints.KEY_ANTIALIASING, hint);
    }
  }
  static isFloatingPointScale(tx: AffineTransform): boolean {
    let type$ = tx.getType() & ~(AffineTransform.TYPE_FLIP | AffineTransform.TYPE_TRANSLATION);
    if (type$ === 0) {
      return false;
    } else if ((type$ & ~AffineTransform.TYPE_MASK_SCALE) === 0) {
      let scaleX = tx.getScaleX();
      let scaleY = tx.getScaleY();
      return (scaleX !== $J.d2i(scaleX)) || (scaleY !== $J.d2i(scaleY));
    } else {
      return false;
    }
  }
  /**
   * Returns the client property for the given key if it is set; otherwise
   * returns the {@literal L&F} property.
   *
   * @param component the component
   * @param key an {@code String} specifying the key for the desired boolean value
   * @return the boolean value of the client property if it is set or the {@literal L&F}
   *         property in other case.
   */
  static getBoolean(component: JComponent, key: string): boolean {
    let clientProperty = component.getClientProperty(key);
    if ($J.isa(clientProperty, JBoolean)) {
      return $J.equals(true, clientProperty);
    }
    return UIManager.getBoolean$Object(key);
  }
  /**
   * Returns whether or not the scale used by {@code GraphicsConfiguration}
   * was changed.
   *
   * @param  ev a {@code PropertyChangeEvent}
   * @return whether or not the scale was changed
   * @since 11
   */
  static isScaleChanged$PropertyChangeEvent(ev: PropertyChangeEvent): boolean {
    return SwingUtilities2.isScaleChanged$String$Object$Object(ev.getPropertyName(), ev.getOldValue(), ev.getNewValue());
  }
  /**
   * Returns whether or not the scale used by {@code GraphicsConfiguration}
   * was changed.
   *
   * @param  name the name of the property
   * @param  oldValue the old value of the property
   * @param  newValue the new value of the property
   * @return whether or not the scale was changed
   * @since 11
   */
  static isScaleChanged$String$Object$Object(name: string, oldValue: any, newValue: any): boolean {
    if (oldValue === newValue || !$J.equals('graphicsConfiguration', name)) {
      return false;
    }
    let newGC = oldValue;
    let oldGC = newValue;
    let newTx = newGC != null ? newGC.getDefaultTransform() : null;
    let oldTx = oldGC != null ? oldGC.getDefaultTransform() : null;
    return !Objects.equals(newTx, oldTx);
  }
  static $clinit() {
    SwingUtilities2.LAF_STATE_KEY = new StringBuffer('LookAndFeel State');
    SwingUtilities2.MENU_SELECTION_MANAGER_LISTENER_KEY = new StringBuffer('MenuSelectionManager listener key');
    SwingUtilities2.DEFAULT_FRC = new FontRenderContext()._FontRenderContext$AffineTransform$boolean$boolean(null, false, false);
    SwingUtilities2.SKIP_CLICK_COUNT = new StringBuilder('skipClickCount');
    SwingUtilities2.BASICMENUITEMUI_MAX_TEXT_OFFSET = new StringUIClientPropertyKey()._StringUIClientPropertyKey('maxTextOffset');
    SwingUtilities2.charsBufferLock = new JObject();
    SwingUtilities2.charsBuffer = $J.newArray(SwingUtilities2.CHAR_BUFFER_SIZE, 0);
    SwingUtilities2.fontCache = $J.newArray(SwingUtilities2.CACHE_SIZE, null);
    SwingUtilities2.APP_CONTEXT_FRC_CACHE_KEY = new JObject();
  }
}

export class SwingUtilities2$KeyPair extends JObject {
  key1: any = null;
  key2: any = null;
  _SwingUtilities2$KeyPair(key1: any, key2: any): this {
    this.key1 = key1;
    this.key2 = key2;
    return this;
  }
  equals(obj: any): boolean {
    if (!(obj instanceof SwingUtilities2$KeyPair)) {
      return false;
    }
    let that = obj;
    return $J.equals(this.key1, that.key1) && $J.equals(this.key2, that.key2);
  }
  hashCode(): number {
    return ($J.hashCode(this.key1) + Math.imul(37, $J.hashCode(this.key2))) | 0;
  }
}

/**
 * LSBCacheEntry is used to cache the left side bearing (lsb) for
 * a particular {@code Font} and {@code FontRenderContext}.
 * This only caches characters that fall in the range
 * {@code MIN_CHAR_INDEX} to {@code MAX_CHAR_INDEX}.
 */
export class SwingUtilities2$LSBCacheEntry extends JObject {
  static readonly UNSET: number = 127;
  static oneChar: number[] = null;
  lsbCache: number[] = null;
  font: Font = null;
  frc: FontRenderContext = null;
  _SwingUtilities2$LSBCacheEntry(frc: FontRenderContext, font: Font): this {
    this.lsbCache = $J.newArray((SwingUtilities2.MAX_CHAR_INDEX - SwingUtilities2.MIN_CHAR_INDEX) | 0, 0);
    this.reset(frc, font);
    return this;
  }
  reset(frc: FontRenderContext, font: Font): void {
    this.font = font;
    this.frc = frc;
    for (let counter = (this.lsbCache.length - 1) | 0; counter >= 0; counter--) {
      this.lsbCache[counter] = SwingUtilities2$LSBCacheEntry.UNSET;
    }
  }
  getLeftSideBearing(aChar: number): number {
    let index = (aChar - SwingUtilities2.MIN_CHAR_INDEX) | 0;
    // assert (index >= 0 && index < (MAX_CHAR_INDEX - MIN_CHAR_INDEX))
    let lsb = this.lsbCache[index];
    if (lsb === SwingUtilities2$LSBCacheEntry.UNSET) {
      SwingUtilities2$LSBCacheEntry.oneChar[0] = aChar;
      let gv = this.font.createGlyphVector$FontRenderContext$charArr(this.frc, SwingUtilities2$LSBCacheEntry.oneChar);
      lsb = ((gv.getGlyphPixelBounds(0, this.frc, 0, 0).x_) << 24) >> 24;
      if (lsb < 0) {
        let aaHint = this.frc.getAntiAliasingHint();
        if (aaHint === RenderingHints.VALUE_TEXT_ANTIALIAS_LCD_HRGB || aaHint === RenderingHints.VALUE_TEXT_ANTIALIAS_LCD_HBGR) {
          lsb++;
        }
      }
      this.lsbCache[index] = lsb;
    }
    return lsb;
  }
  equals(entry: any): boolean {
    if (entry === this) {
      return true;
    }
    if (!(entry instanceof SwingUtilities2$LSBCacheEntry)) {
      return false;
    }
    let oEntry = entry;
    return (this.font.equals(oEntry.font) && this.frc.equals$FontRenderContext(oEntry.frc));
  }
  hashCode(): number {
    let result = 17;
    if (this.font != null) {
      result = (Math.imul(37, result) + this.font.hashCode()) | 0;
    }
    if (this.frc != null) {
      result = (Math.imul(37, result) + this.frc.hashCode()) | 0;
    }
    return result;
  }
  static $clinit() {
    SwingUtilities2$LSBCacheEntry.oneChar = $J.newArray(1, 0);
  }
}

/**
 * Used by the {@code liesIn} method to return which section
 * the point lies in.
 *
 * @see #liesIn
 */
export class SwingUtilities2$Section extends JEnum {
  static LEADING: SwingUtilities2$Section = null;
  static MIDDLE: SwingUtilities2$Section = null;
  static TRAILING: SwingUtilities2$Section = null;
  static $VALUES: SwingUtilities2$Section[] = null;
  _SwingUtilities2$Section($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): SwingUtilities2$Section[] { return SwingUtilities2$Section.$VALUES.slice(); }
  static valueOf(name: string): SwingUtilities2$Section { return $J.enumValueOf(SwingUtilities2$Section, name); }
  static $clinit() {
    SwingUtilities2$Section.LEADING = new SwingUtilities2$Section()._SwingUtilities2$Section('LEADING', 0);
    SwingUtilities2$Section.MIDDLE = new SwingUtilities2$Section()._SwingUtilities2$Section('MIDDLE', 1);
    SwingUtilities2$Section.TRAILING = new SwingUtilities2$Section()._SwingUtilities2$Section('TRAILING', 2);
    SwingUtilities2$Section.$VALUES = [SwingUtilities2$Section.LEADING, SwingUtilities2$Section.MIDDLE, SwingUtilities2$Section.TRAILING];
  }
}

/**
 * Used to listen to "blit" repaints in RepaintManager.
 */
export class SwingUtilities2$RepaintListener {
}

$J.define(SwingUtilities2, 'sun.swing.SwingUtilities2', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_SwingUtilities2' }, meths: { 'isScaleChanged(java.lang.String,java.lang.Object,java.lang.Object)': 'isScaleChanged$String$Object$Object', 'isScaleChanged(java.beans.PropertyChangeEvent)': 'isScaleChanged$PropertyChangeEvent', 'submit(java.lang.Runnable,java.lang.Object)': 'submit$Runnable$Object', 'submit(java.util.concurrent.Callable)': 'submit$Callable', 'getUIDefaultsInt(java.lang.Object,java.util.Locale,int)': 'getUIDefaultsInt$Object$Locale$int', 'getUIDefaultsInt(java.lang.Object,int)': 'getUIDefaultsInt$Object$int', 'getUIDefaultsInt(java.lang.Object,java.util.Locale)': 'getUIDefaultsInt$Object$Locale', 'getUIDefaultsInt(java.lang.Object)': 'getUIDefaultsInt$Object', 'makeIcon(java.lang.Class,java.lang.Class,java.lang.String,boolean)': 'makeIcon$Class$Class$String$boolean', 'makeIcon(java.lang.Class,java.lang.Class,java.lang.String)': 'makeIcon$Class$Class$String', 'canCurrentEventAccessSystemClipboard(boolean)': 'canCurrentEventAccessSystemClipboard$boolean', 'canEventAccessSystemClipboard(java.awt.AWTEvent,boolean)': 'canEventAccessSystemClipboard$AWTEvent$boolean', 'canEventAccessSystemClipboard(java.awt.AWTEvent)': 'canEventAccessSystemClipboard$AWTEvent', 'canCurrentEventAccessSystemClipboard()': 'canCurrentEventAccessSystemClipboard$', 'getFontMetrics(javax.swing.JComponent,java.awt.Font)': 'getFontMetrics$JComponent$Font', 'getFontRenderContext(java.awt.Component,java.awt.FontMetrics)': 'getFontRenderContext$Component$FontMetrics', 'getFontRenderContext(java.awt.Component)': 'getFontRenderContext$Component', 'drawString(javax.swing.JComponent,java.awt.Graphics,java.text.AttributedCharacterIterator,float,float)': 'drawString$JComponent$Graphics$AttributedCharacterIterator$float$float', 'drawString(javax.swing.JComponent,java.awt.Graphics,java.text.AttributedCharacterIterator,int,int)': 'drawString$JComponent$Graphics$AttributedCharacterIterator$int$int', 'drawChars(javax.swing.JComponent,java.awt.Graphics,char[],int,int,float,float,boolean)': 'drawChars$JComponent$Graphics$charArr$int$int$float$float$boolean', 'drawChars(javax.swing.JComponent,java.awt.Graphics,char[],int,int,float,float)': 'drawChars$JComponent$Graphics$charArr$int$int$float$float', 'drawChars(javax.swing.JComponent,java.awt.Graphics,char[],int,int,int,int)': 'drawChars$JComponent$Graphics$charArr$int$int$int$int', 'drawStringUnderlineCharAt(javax.swing.JComponent,java.awt.Graphics,java.lang.String,int,float,float,boolean)': 'drawStringUnderlineCharAt$JComponent$Graphics$String$int$float$float$boolean', 'drawStringUnderlineCharAt(javax.swing.JComponent,java.awt.Graphics,java.lang.String,int,int,int)': 'drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int', 'drawString(javax.swing.JComponent,java.awt.Graphics,java.lang.String,float,float,boolean)': 'drawString$JComponent$Graphics$String$float$float$boolean', 'drawString(javax.swing.JComponent,java.awt.Graphics,java.lang.String,int,int)': 'drawString$JComponent$Graphics$String$int$int', 'stringWidth(javax.swing.JComponent,java.awt.FontMetrics,java.lang.String,boolean)': 'stringWidth$JComponent$FontMetrics$String$boolean', 'stringWidth(javax.swing.JComponent,java.awt.FontMetrics,java.lang.String)': 'stringWidth$JComponent$FontMetrics$String', 'getFontMetrics(javax.swing.JComponent,java.awt.Graphics,java.awt.Font)': 'getFontMetrics$JComponent$Graphics$Font', 'getFontMetrics(javax.swing.JComponent,java.awt.Graphics)': 'getFontMetrics$JComponent$Graphics', 'getLeftSideBearing(javax.swing.JComponent,java.awt.FontMetrics,char)': 'getLeftSideBearing$JComponent$FontMetrics$char', 'getLeftSideBearing(javax.swing.JComponent,java.awt.FontMetrics,java.lang.String)': 'getLeftSideBearing$JComponent$FontMetrics$String' }, clinit: true, lazy: ['LAF_STATE_KEY', 'MENU_SELECTION_MANAGER_LISTENER_KEY', 'fontCache', 'nextIndex', 'searchKey', 'DEFAULT_FRC', 'SKIP_CLICK_COUNT', 'BASICMENUITEMUI_MAX_TEXT_OFFSET', 'charsBufferLock', 'charsBuffer', 'APP_CONTEXT_FRC_CACHE_KEY'] });
$J.define(SwingUtilities2$KeyPair, 'sun.swing.SwingUtilities2$KeyPair', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Object,java.lang.Object': '_SwingUtilities2$KeyPair' } });
$J.define(SwingUtilities2$LSBCacheEntry, 'sun.swing.SwingUtilities2$LSBCacheEntry', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.font.FontRenderContext,java.awt.Font': '_SwingUtilities2$LSBCacheEntry' }, clinit: true, lazy: ['oneChar'] });
$J.define(SwingUtilities2$Section, 'sun.swing.SwingUtilities2$Section', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_SwingUtilities2$Section' }, clinit: true, lazy: ['$VALUES', 'LEADING', 'MIDDLE', 'TRAILING'] });
$J.define(SwingUtilities2$RepaintListener, 'sun.swing.SwingUtilities2$RepaintListener', { kind: 'interface' });
$J.module(() => {
  Container = $J.load('java.awt.Container');
  EventQueue = $J.load('java.awt.EventQueue');
  Graphics2D = $J.load('java.awt.Graphics2D');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  PrintGraphics = $J.load('java.awt.PrintGraphics');
  RenderingHints = $J.load('java.awt.RenderingHints');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  FontRenderContext = $J.load('java.awt.font.FontRenderContext');
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  TextHitInfo = $J.load('java.awt.font.TextHitInfo');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  JComponent = $J.load('javax.swing.JComponent');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  DefaultCaret = $J.load('javax.swing.text.DefaultCaret');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
  TreePath = $J.load('javax.swing.tree.TreePath');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  AWTPermissions = $J.load('sun.awt.AWTPermissions');
  ImageIconUIResource = $J.load('sun.swing.ImageIconUIResource');
  PrintColorUIResource = $J.load('sun.swing.PrintColorUIResource');
  StringUIClientPropertyKey = $J.load('sun.swing.StringUIClientPropertyKey');
});
