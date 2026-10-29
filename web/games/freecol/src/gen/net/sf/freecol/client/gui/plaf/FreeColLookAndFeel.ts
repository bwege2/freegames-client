// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColLookAndFeel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ClassNotFoundException, HashSet, JClass, JString, Level, Logger } from '../../../../../../../jre/index.ts';
import { MetalLookAndFeel } from '../../../../../../javax/swing/plaf/metal/MetalLookAndFeel.ts';
import { DefaultMetalTheme } from '../../../../../../javax/swing/plaf/metal/DefaultMetalTheme.ts';

let Font, UIManager, UnsupportedLookAndFeelException, ColorUIResource, FontUIResource, MetalButtonUI, MetalIconFactory, ImageLibrary, FreeColButtonUI, FreeColCheckBoxMenuItemUI, FreeColCheckBoxUI, FreeColComboBoxUI, FreeColFileChooserUI, FreeColFormattedTextFieldUI, FreeColInternalFrameUI, FreeColLabelUI, FreeColListUI, FreeColMenuBarUI, FreeColMenuItemUI, FreeColMenuUI, FreeColOptionPaneUI, FreeColPanelUI, FreeColPopupMenuUI, FreeColRadioButtonMenuItemUI, FreeColRadioButtonUI, FreeColScrollPaneUI, FreeColSpinnerUI, FreeColTableHeaderUI, FreeColTableUI, FreeColTextAreaUI, FreeColTextFieldUI, FreeColToolTipUI, FreeColTransparentPanelUI, FreeColException;

/**
 * Implements the FreeCol look and feel.
 */
export class FreeColLookAndFeel extends MetalLookAndFeel {
  static logger: Logger = null;
  static readonly brightPanelUI: string = 'net.sf.freecol.client.gui.plaf.FreeColBrightPanelUI';
  static readonly transparentPanelUI: string = 'net.sf.freecol.client.gui.plaf.FreeColTransparentPanelUI';
  static uiClasses: JClass[] = null;
  static scaleFactor: number = 0;
  /**
   * Initiates a new FreeCol look and feel.
   *
   * @exception FreeColException If the ui directory could not be found.
   */
  _FreeColLookAndFeel(): this {
    this._MetalLookAndFeel();
    MetalLookAndFeel.setCurrentTheme(new FreeColLookAndFeel$FreeColMetalTheme()._FreeColLookAndFeel$FreeColMetalTheme());
    return this;
  }
  /**
   * Creates the look and feel specific defaults table.
   *
   * @return The defaults table.
   */
  getDefaults(): UIDefaults {
    let u = super.getDefaults();
    let offset = 'FreeCol'.length;
    for (let uiClass of FreeColLookAndFeel.uiClasses) {
      let name = uiClass.getName();
      let index = name.lastIndexOf('FreeCol');
      if (index >= 0) {
        index = (index + offset) | 0;
        let shortName = name.substring(index);
        u.put(shortName, name);
        u.put(name, uiClass);
      }
    }
    try {
      u.put(FreeColLookAndFeel.brightPanelUI, JClass.forName(FreeColLookAndFeel.brightPanelUI));
      u.put('InPortPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('CargoPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('BuildingsPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('OutsideColonyPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('WarehousePanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('ConstructionPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('PopulationPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('WarehouseGoodsPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('ReportPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('ColopediaPanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('TilePanelUI', FreeColLookAndFeel.brightPanelUI);
      u.put('OptionGroupUI', FreeColLookAndFeel.brightPanelUI);
    } catch ($e0) {
      if ($J.isa($e0, ClassNotFoundException)) {
        let cnfe = $J.exc($e0);
        FreeColLookAndFeel.logger.log(Level.WARNING, 'Could not load ' + FreeColLookAndFeel.brightPanelUI, cnfe);
      } else {
        throw $e0;
      }
    }
    try {
      u.put(FreeColLookAndFeel.transparentPanelUI, JClass.forName(FreeColLookAndFeel.transparentPanelUI));
      u.put('MarketPanelUI', FreeColLookAndFeel.transparentPanelUI);
      u.put('EuropeCargoPanelUI', FreeColLookAndFeel.transparentPanelUI);
      u.put('ToAmericaPanelUI', FreeColLookAndFeel.transparentPanelUI);
      u.put('ToEuropePanelUI', FreeColLookAndFeel.transparentPanelUI);
      u.put('EuropeInPortPanelUI', FreeColLookAndFeel.transparentPanelUI);
      u.put('DocksPanelUI', FreeColLookAndFeel.transparentPanelUI);
    } catch ($e1) {
      if ($J.isa($e1, ClassNotFoundException)) {
        let cnfe = $J.exc($e1);
        FreeColLookAndFeel.logger.log(Level.WARNING, 'Could not load ' + FreeColLookAndFeel.transparentPanelUI, cnfe);
      } else {
        throw $e1;
      }
    }
    u.put('javax.swing.plaf.metal.MetalButtonUI', $J.cls(MetalButtonUI));
    u.put('ColorButtonUI', 'javax.swing.plaf.metal.MetalButtonUI');
    u.put('cursor.go', ImageLibrary.getCursor());
    u.put('CheckBox.icon', (t) => FreeColCheckBoxUI.createCheckBoxIcon());
    u.put('CheckBoxMenuItem.checkIcon', (t) => FreeColCheckBoxUI.createCheckBoxIcon());
    u.put('RadioButton.icon', (t) => FreeColRadioButtonUI.createRadioButtonIcon());
    u.put('RadioButtonMenuItem.checkIcon', (t) => FreeColRadioButtonUI.createRadioButtonIcon());
    return u;
  }
  /**
   * Installs a FreeColLookAndFeel as the default look and feel.
   *
   * @param fclaf The {@code FreeColLookAndFeel} to install.
   * @throws FreeColException if the installation fails.
   */
  static install(fclaf: FreeColLookAndFeel): void {
    try {
      UIManager.setLookAndFeel$LookAndFeel(fclaf);
      UIManager.put('Button.defaultButtonFollowsFocus', true);
    } catch ($e2) {
      if ($J.isa($e2, UnsupportedLookAndFeelException)) {
        let e = $J.exc($e2);
        throw new FreeColException()._FreeColException$String$Throwable('Look and feel install failure: ' + $J.str(fclaf), e);
      } else {
        throw $e2;
      }
    }
  }
  /**
   * Set the default font in all UI elements.
   *
   * @param defaultFont A {@code Font} to use by default.
   */
  static installFont(defaultFont: Font): void {
    let u = UIManager.getLookAndFeelDefaults();
    let keySet = new HashSet(u.keySet());
    for (const $it3 = keySet.iterator(); $it3.hasNext(); ) {
      let key = $it3.next();
      if (u.get(key) instanceof FontUIResource) {
        u.put(key, defaultFont);
      } else if (u.get(key) instanceof Font) {
        u.put(key, defaultFont);
      }
    }
  }
  static setScaleFactor(scaleFactor: number): void {
    FreeColLookAndFeel.scaleFactor = scaleFactor;
    let u = UIManager.getLookAndFeelDefaults();
    let scrollbarWidth = $J.d2i((Math.fround(17 * scaleFactor)));
    u.put('ScrollBar.width', scrollbarWidth);
    let internalFrameIconSize = $J.d2i((Math.fround(16 * scaleFactor)));
    u.put('InternalFrame.closeIcon', (t) => MetalIconFactory.getInternalFrameCloseIcon(internalFrameIconSize));
    u.put('InternalFrame.maximizeIcon', (t) => MetalIconFactory.getInternalFrameMaximizeIcon(internalFrameIconSize));
    u.put('InternalFrame.iconifyIcon', (t) => MetalIconFactory.getInternalFrameMinimizeIcon(internalFrameIconSize));
    u.put('InternalFrame.minimizeIcon', (t) => MetalIconFactory.getInternalFrameAltMaximizeIcon(internalFrameIconSize));
  }
  static getScaleFactor(): number {
    return FreeColLookAndFeel.scaleFactor;
  }
  /**
   * Gets a one line description of this Look and Feel.
   *
   * @return "The default Look and Feel for FreeCol"
   */
  getDescription(): string {
    return 'The default Look and Feel for FreeCol';
  }
  /**
   * Gets the name of this Look and Feel.
   *
   * @return "FreeCol Look and Feel"
   */
  getName(): string {
    return 'FreeCol Look and Feel';
  }
  static $clinit() {
    FreeColLookAndFeel.logger = Logger.getLogger($J.cls(FreeColLookAndFeel).getName());
    FreeColLookAndFeel.uiClasses = [$J.cls(FreeColButtonUI), $J.cls(FreeColCheckBoxMenuItemUI), $J.cls(FreeColCheckBoxUI), $J.cls(FreeColComboBoxUI), $J.cls(FreeColFileChooserUI), $J.cls(FreeColInternalFrameUI), $J.cls(FreeColLabelUI), $J.cls(FreeColListUI), $J.cls(FreeColMenuBarUI), $J.cls(FreeColMenuItemUI), $J.cls(FreeColMenuUI), $J.cls(FreeColOptionPaneUI), $J.cls(FreeColPanelUI), $J.cls(FreeColPopupMenuUI), $J.cls(FreeColRadioButtonMenuItemUI), $J.cls(FreeColRadioButtonUI), $J.cls(FreeColScrollPaneUI), $J.cls(FreeColTableHeaderUI), $J.cls(FreeColTableUI), $J.cls(FreeColTextAreaUI), $J.cls(FreeColTextFieldUI), $J.cls(FreeColFormattedTextFieldUI), $J.cls(FreeColToolTipUI), $J.cls(FreeColTransparentPanelUI), $J.cls(FreeColSpinnerUI)];
    FreeColLookAndFeel.scaleFactor = 1;
  }
}

export class FreeColLookAndFeel$FreeColMetalTheme extends DefaultMetalTheme {
  _FreeColLookAndFeel$FreeColMetalTheme(): this {
    this._DefaultMetalTheme();
    return this;
  }
  static getColor(resourceName: string): ColorUIResource {
    return new ColorUIResource()._ColorUIResource$Color(ImageLibrary.getColor$String(resourceName));
  }
  /**
   * {@inheritDoc}
   */
  getPrimary1(): ColorUIResource {
    return FreeColLookAndFeel$FreeColMetalTheme.getColor('color.primary1.LookAndFeel');
  }
  /**
   * {@inheritDoc}
   */
  getPrimary2(): ColorUIResource {
    return FreeColLookAndFeel$FreeColMetalTheme.getColor('color.backgroundSelect.LookAndFeel');
  }
  /**
   * {@inheritDoc}
   */
  getPrimary3(): ColorUIResource {
    return FreeColLookAndFeel$FreeColMetalTheme.getColor('color.primary3.LookAndFeel');
  }
  /**
   * {@inheritDoc}
   */
  getSecondary1(): ColorUIResource {
    return FreeColLookAndFeel$FreeColMetalTheme.getColor('color.secondary1.LookAndFeel');
  }
  /**
   * {@inheritDoc}
   */
  getSecondary2(): ColorUIResource {
    return FreeColLookAndFeel$FreeColMetalTheme.getColor('color.disabled.LookAndFeel');
  }
  /**
   * {@inheritDoc}
   */
  getSecondary3(): ColorUIResource {
    return FreeColLookAndFeel$FreeColMetalTheme.getColor('color.background.LookAndFeel');
  }
  /**
   * {@inheritDoc}
   */
  getMenuDisabledForeground(): ColorUIResource {
    return FreeColLookAndFeel$FreeColMetalTheme.getColor('color.disabledMenu.LookAndFeel');
  }
}

$J.define(FreeColLookAndFeel, 'net.sf.freecol.client.gui.plaf.FreeColLookAndFeel', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalLookAndFeel', ctors: { '': '_FreeColLookAndFeel' }, returns: { 'getName': 'java.lang.String', 'getDescription': 'java.lang.String', 'getDefaults': 'javax.swing.UIDefaults' }, clinit: true, lazy: ['logger', 'uiClasses', 'scaleFactor'] });
$J.define(FreeColLookAndFeel$FreeColMetalTheme, 'net.sf.freecol.client.gui.plaf.FreeColLookAndFeel$FreeColMetalTheme', { kind: 'class', sup: 'javax.swing.plaf.metal.DefaultMetalTheme', ctors: { '': '_FreeColLookAndFeel$FreeColMetalTheme' }, returns: { 'getMenuDisabledForeground': 'javax.swing.plaf.ColorUIResource', 'getSecondary3': 'javax.swing.plaf.ColorUIResource', 'getSecondary2': 'javax.swing.plaf.ColorUIResource', 'getSecondary1': 'javax.swing.plaf.ColorUIResource', 'getPrimary3': 'javax.swing.plaf.ColorUIResource', 'getPrimary2': 'javax.swing.plaf.ColorUIResource', 'getPrimary1': 'javax.swing.plaf.ColorUIResource' } });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  UIManager = $J.load('javax.swing.UIManager');
  UnsupportedLookAndFeelException = $J.load('javax.swing.UnsupportedLookAndFeelException');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
  MetalButtonUI = $J.load('javax.swing.plaf.metal.MetalButtonUI');
  MetalIconFactory = $J.load('javax.swing.plaf.metal.MetalIconFactory');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColButtonUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColButtonUI');
  FreeColCheckBoxMenuItemUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColCheckBoxMenuItemUI');
  FreeColCheckBoxUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColCheckBoxUI');
  FreeColComboBoxUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxUI');
  FreeColFileChooserUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColFileChooserUI');
  FreeColFormattedTextFieldUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColFormattedTextFieldUI');
  FreeColInternalFrameUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColInternalFrameUI');
  FreeColLabelUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColLabelUI');
  FreeColListUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColListUI');
  FreeColMenuBarUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColMenuBarUI');
  FreeColMenuItemUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColMenuItemUI');
  FreeColMenuUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColMenuUI');
  FreeColOptionPaneUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColOptionPaneUI');
  FreeColPanelUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColPanelUI');
  FreeColPopupMenuUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColPopupMenuUI');
  FreeColRadioButtonMenuItemUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColRadioButtonMenuItemUI');
  FreeColRadioButtonUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColRadioButtonUI');
  FreeColScrollPaneUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColScrollPaneUI');
  FreeColSpinnerUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColSpinnerUI');
  FreeColTableHeaderUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColTableHeaderUI');
  FreeColTableUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColTableUI');
  FreeColTextAreaUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColTextAreaUI');
  FreeColTextFieldUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColTextFieldUI');
  FreeColToolTipUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColToolTipUI');
  FreeColTransparentPanelUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColTransparentPanelUI');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
});
