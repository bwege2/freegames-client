// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicEditorPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, HTMLDocument, JBoolean, StyleSheet } from '../../../../../jre/index.ts';
import { BasicTextUI } from './BasicTextUI.ts';

let Action, JEditorPane, SwingUtilities, TransferHandler, ActionMapUIResource, BasicTextPaneUI, BasicTextUI$FocusAction, EditorKit, StyleConstants, StyleContext, StyledDocument, SwingUtilities2;

/**
 * Provides the look and feel for a JEditorPane.
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
 * @author  Timothy Prinzing
 */
export class BasicEditorPaneUI extends BasicTextUI {
  /**
   * Attribute key to reference the default font.
   * used in javax.swing.text.StyleContext.getFont
   * to resolve the default font.
   */
  static readonly FONT_ATTRIBUTE_KEY: string = 'FONT_ATTRIBUTE_KEY';
  /**
   * Creates a new BasicEditorPaneUI.
   */
  _BasicEditorPaneUI(): this {
    this._BasicTextUI();
    return this;
  }
  /**
   * Creates a UI for the JTextPane.
   *
   * @param c the JTextPane component
   * @return the UI
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicEditorPaneUI()._BasicEditorPaneUI();
  }
  /**
   * Fetches the name used as a key to lookup properties through the
   * UIManager.  This is used as a prefix to all the standard
   * text properties.
   *
   * @return the name ("EditorPane")
   */
  getPropertyPrefix(): string {
    return 'EditorPane';
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.5
   */
  installUI(c: JComponent): void {
    super.installUI(c);
    this.updateDisplayProperties(c.getFont(), c.getForeground());
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.5
   */
  uninstallUI(c: JComponent): void {
    this.cleanDisplayProperties();
    super.uninstallUI(c);
  }
  /**
   * Fetches the EditorKit for the UI.  This is whatever is
   * currently set in the associated JEditorPane.
   *
   * @return the editor capabilities
   * @see TextUI#getEditorKit
   */
  getEditorKit(tc: JTextComponent): EditorKit {
    let pane = this.getComponent();
    return pane.getEditorKit();
  }
  /**
   * Fetch an action map to use.  The map for a JEditorPane
   * is not shared because it changes with the EditorKit.
   */
  getActionMap(): ActionMap {
    let am = new ActionMapUIResource()._ActionMapUIResource();
    am.put$Object$Action('requestFocus', new BasicTextUI$FocusAction().$o(this)._BasicTextUI$FocusAction());
    let editorKit = this.getEditorKit(this.getComponent());
    if (editorKit != null) {
      let actions = editorKit.getActions$();
      if (actions != null) {
        this.addActions(am, actions);
      }
    }
    am.put$Object$Action(TransferHandler.getCutAction().getValue$String(Action.NAME), TransferHandler.getCutAction());
    am.put$Object$Action(TransferHandler.getCopyAction().getValue$String(Action.NAME), TransferHandler.getCopyAction());
    am.put$Object$Action(TransferHandler.getPasteAction().getValue$String(Action.NAME), TransferHandler.getPasteAction());
    return am;
  }
  /**
   * This method gets called when a bound property is changed
   * on the associated JTextComponent.  This is a hook
   * which UI implementations may change to reflect how the
   * UI displays bound properties of JTextComponent subclasses.
   * This is implemented to rebuild the ActionMap based upon an
   * EditorKit change.
   *
   * @param evt the property change event
   */
  propertyChange(evt: PropertyChangeEvent): void {
    super.propertyChange(evt);
    let name = evt.getPropertyName();
    if ($J.equals('editorKit', name)) {
      let map = SwingUtilities.getUIActionMap(this.getComponent());
      if (map != null) {
        let oldValue = evt.getOldValue();
        if (oldValue instanceof EditorKit) {
          let actions = (oldValue).getActions$();
          if (actions != null) {
            this.removeActions(map, actions);
          }
        }
        let newValue = evt.getNewValue();
        if (newValue instanceof EditorKit) {
          let actions = (newValue).getActions$();
          if (actions != null) {
            this.addActions(map, actions);
          }
        }
      }
      this.updateFocusTraversalKeys();
    } else if ($J.equals('editable', name)) {
      this.updateFocusTraversalKeys();
    } else if ($J.equals('foreground', name) || $J.equals('font', name) || $J.equals('document', name) || $J.equals(JEditorPane.W3C_LENGTH_UNITS, name) || $J.equals(JEditorPane.HONOR_DISPLAY_PROPERTIES, name)) {
      let c = this.getComponent();
      this.updateDisplayProperties(c.getFont(), c.getForeground());
      if ($J.equals(JEditorPane.W3C_LENGTH_UNITS, name) || $J.equals(JEditorPane.HONOR_DISPLAY_PROPERTIES, name)) {
        this.modelChanged();
      }
      if ($J.equals('foreground', name)) {
        let honorDisplayPropertiesObject = c.getClientProperty(JEditorPane.HONOR_DISPLAY_PROPERTIES);
        let honorDisplayProperties = false;
        if ($J.isa(honorDisplayPropertiesObject, JBoolean)) {
          honorDisplayProperties = (honorDisplayPropertiesObject);
        }
        if (honorDisplayProperties) {
          this.modelChanged();
        }
      }
    }
  }
  removeActions(map: ActionMap, actions: Action[]): void {
    let n = actions.length;
    for (let i = 0; i < n; i++) {
      let a = actions[i];
      map.remove(a.getValue$String(Action.NAME));
    }
  }
  addActions(map: ActionMap, actions: Action[]): void {
    let n = actions.length;
    for (let i = 0; i < n; i++) {
      let a = actions[i];
      map.put$Object$Action(a.getValue$String(Action.NAME), a);
    }
  }
  updateDisplayProperties(font: Font, fg: Color): void {
    let c = this.getComponent();
    let honorDisplayPropertiesObject = c.getClientProperty(JEditorPane.HONOR_DISPLAY_PROPERTIES);
    let honorDisplayProperties = false;
    let w3cLengthUnitsObject = c.getClientProperty(JEditorPane.W3C_LENGTH_UNITS);
    let w3cLengthUnits = false;
    if ($J.isa(honorDisplayPropertiesObject, JBoolean)) {
      honorDisplayProperties = (honorDisplayPropertiesObject);
    }
    if ($J.isa(w3cLengthUnitsObject, JBoolean)) {
      w3cLengthUnits = (w3cLengthUnitsObject);
    }
    if (this instanceof BasicTextPaneUI || honorDisplayProperties) {
      let doc = this.getComponent().getDocument();
      if ($J.isa(doc, StyledDocument)) {
        if ($J.isa(doc, HTMLDocument) && honorDisplayProperties) {
          this.updateCSS(font, fg);
        } else {
          this.updateStyle(font, fg);
        }
      }
    } else {
      this.cleanDisplayProperties();
    }
    if (w3cLengthUnits) {
      let doc = this.getComponent().getDocument();
      if ($J.isa(doc, HTMLDocument)) {
        let documentStyleSheet = (doc).getStyleSheet();
        documentStyleSheet.addRule('W3C_LENGTH_UNITS_ENABLE');
      }
    } else {
      let doc = this.getComponent().getDocument();
      if ($J.isa(doc, HTMLDocument)) {
        let documentStyleSheet = (doc).getStyleSheet();
        documentStyleSheet.addRule('W3C_LENGTH_UNITS_DISABLE');
      }
    }
  }
  cleanDisplayProperties(): void {
    let document = this.getComponent().getDocument();
    if ($J.isa(document, HTMLDocument)) {
      let documentStyleSheet = (document).getStyleSheet();
      let styleSheets = documentStyleSheet.getStyleSheets();
      if (styleSheets != null) {
        for (let s of styleSheets) {
          if (s instanceof BasicEditorPaneUI$StyleSheetUIResource) {
            documentStyleSheet.removeStyleSheet(s);
            documentStyleSheet.addRule('BASE_SIZE_DISABLE');
            break;
          }
        }
      }
      let style = (document).getStyle(StyleContext.DEFAULT_STYLE);
      if (style.getAttribute(BasicEditorPaneUI.FONT_ATTRIBUTE_KEY) != null) {
        style.removeAttribute(BasicEditorPaneUI.FONT_ATTRIBUTE_KEY);
      }
    }
  }
  updateCSS(font: Font, fg: Color): void {
    let component = this.getComponent();
    let document = component.getDocument();
    if ($J.isa(document, HTMLDocument)) {
      let styleSheet = new BasicEditorPaneUI$StyleSheetUIResource()._BasicEditorPaneUI$StyleSheetUIResource();
      let documentStyleSheet = (document).getStyleSheet();
      let styleSheets = documentStyleSheet.getStyleSheets();
      if (styleSheets != null) {
        for (let s of styleSheets) {
          if (s instanceof BasicEditorPaneUI$StyleSheetUIResource) {
            documentStyleSheet.removeStyleSheet(s);
          }
        }
      }
      let cssRule = SwingUtilities2.displayPropertiesToCSS(font, fg);
      styleSheet.addRule(cssRule);
      documentStyleSheet.addStyleSheet(styleSheet);
      documentStyleSheet.addRule('BASE_SIZE ' + component.getFont().getSize());
      let style = (document).getStyle(StyleContext.DEFAULT_STYLE);
      if (!font.equals(style.getAttribute(BasicEditorPaneUI.FONT_ATTRIBUTE_KEY))) {
        style.addAttribute(BasicEditorPaneUI.FONT_ATTRIBUTE_KEY, font);
      }
    }
  }
  updateStyle(font: Font, fg: Color): void {
    this.updateFont(font);
    this.updateForeground(fg);
  }
  /**
   * Update the color in the default style of the document.
   *
   * @param color the new color to use or null to remove the color attribute
   *              from the document's style
   */
  updateForeground(color: Color): void {
    let doc = this.getComponent().getDocument();
    let style = doc.getStyle(StyleContext.DEFAULT_STYLE);
    if (style == null) {
      return;
    }
    if (color == null) {
      if (style.getAttribute(StyleConstants.Foreground) != null) {
        style.removeAttribute(StyleConstants.Foreground);
      }
    } else {
      if (!color.equals(StyleConstants.getForeground(style))) {
        StyleConstants.setForeground(style, color);
      }
    }
  }
  /**
   * Update the font in the default style of the document.
   *
   * @param font the new font to use or null to remove the font attribute
   *             from the document's style
   */
  updateFont(font: Font): void {
    let doc = this.getComponent().getDocument();
    let style = doc.getStyle(StyleContext.DEFAULT_STYLE);
    if (style == null) {
      return;
    }
    let fontFamily = style.getAttribute(StyleConstants.FontFamily);
    let fontSize = style.getAttribute(StyleConstants.FontSize);
    let isBold = style.getAttribute(StyleConstants.Bold);
    let isItalic = style.getAttribute(StyleConstants.Italic);
    let fontAttribute = style.getAttribute(BasicEditorPaneUI.FONT_ATTRIBUTE_KEY);
    if (font == null) {
      if (fontFamily != null) {
        style.removeAttribute(StyleConstants.FontFamily);
      }
      if (fontSize != null) {
        style.removeAttribute(StyleConstants.FontSize);
      }
      if (isBold != null) {
        style.removeAttribute(StyleConstants.Bold);
      }
      if (isItalic != null) {
        style.removeAttribute(StyleConstants.Italic);
      }
      if (fontAttribute != null) {
        style.removeAttribute(BasicEditorPaneUI.FONT_ATTRIBUTE_KEY);
      }
    } else {
      if (!$J.equals(font.getName(), fontFamily)) {
        StyleConstants.setFontFamily(style, font.getName());
      }
      if (fontSize == null || (+fontSize) !== font.getSize()) {
        StyleConstants.setFontSize(style, font.getSize());
      }
      if (isBold == null || isBold !== font.isBold()) {
        StyleConstants.setBold(style, font.isBold());
      }
      if (isItalic == null || isItalic !== font.isItalic()) {
        StyleConstants.setItalic(style, font.isItalic());
      }
      if (!font.equals(fontAttribute)) {
        style.addAttribute(BasicEditorPaneUI.FONT_ATTRIBUTE_KEY, font);
      }
    }
  }
}

export class BasicEditorPaneUI$StyleSheetUIResource extends StyleSheet {
  _BasicEditorPaneUI$StyleSheetUIResource(): this {
    this._StyleSheet();
    return this;
  }
}

$J.define(BasicEditorPaneUI, 'javax.swing.plaf.basic.BasicEditorPaneUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTextUI', ctors: { '': '_BasicEditorPaneUI' } });
$J.define(BasicEditorPaneUI$StyleSheetUIResource, 'javax.swing.plaf.basic.BasicEditorPaneUI$StyleSheetUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.text.html.StyleSheet', ctors: { '': '_BasicEditorPaneUI$StyleSheetUIResource' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
  JEditorPane = $J.load('javax.swing.JEditorPane');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  TransferHandler = $J.load('javax.swing.TransferHandler');
  ActionMapUIResource = $J.load('javax.swing.plaf.ActionMapUIResource');
  BasicTextPaneUI = $J.load('javax.swing.plaf.basic.BasicTextPaneUI');
  BasicTextUI$FocusAction = $J.load('javax.swing.plaf.basic.BasicTextUI$FocusAction');
  EditorKit = $J.load('javax.swing.text.EditorKit');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyleContext = $J.load('javax.swing.text.StyleContext');
  StyledDocument = $J.load('javax.swing.text.StyledDocument');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
