// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/Utility.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collectors, Inet4Address, InetAddress, JObject, JString, List, NetworkInterface, SocketException, TextLayout } from '../../../../../../../jre/index.ts';

let BasicStroke, Color, Cursor, GridLayout, Insets, RenderingHints, BorderFactory, ImageIcon, JButton, JCheckBoxMenuItem, JComboBox, JLabel, JMenu, JMenuItem, JPanel, JRadioButtonMenuItem, JTextArea, JTextPane, SwingConstants, BevelBorder, DefaultStyledDocument, StyleConstants, StyleContext, FontLibrary, ImageLibrary, FreeColButton, FreeColButton$ButtonStyle, FreeColComboBoxRenderer, Messages, Location, StringTemplate, Unit;

/**
 * Static utilities for panels and dialogs.
 */
export class Utility extends JObject {
  /**
   * Useful static borders.
   */
  static BEVEL_BORDER: Border = null;
  static ETCHED_BORDER: Border = null;
  static PROGRESS_BORDER: Border = null;
  static COLOR_CELL_BORDER: Border = null;
  static DIALOG_BORDER: Border = null;
  static SIMPLE_LINE_BORDER: Border = null;
  static TOPCELLBORDER: Border = null;
  static CELLBORDER: Border = null;
  static LEFTCELLBORDER: Border = null;
  static TOPLEFTCELLBORDER: Border = null;
  /**
   * How many columns (em-widths) to use in the text area.
   */
  static readonly DEFAULT_TEXT_COLUMNS: number = 20;
  /**
   * The margin to use for a link button.
   */
  static EMPTY_MARGIN: Insets = null;
  /**
   * A style context to use for panels and dialogs.
   */
  static STYLE_CONTEXT: StyleContext = null;
  /**
   * Font specification for panel titles.
   */
  static FONTSPEC_TITLE: string = null;
  /**
   * Font specification for panel subtitles.
   */
  static FONTSPEC_SUBTITLE: string = null;
  _Utility(): this {
    return this;
  }
  static initStyleContext(font: Font): void {
    let defaultStyle = StyleContext.getDefaultStyleContext().getStyle(StyleContext.DEFAULT_STYLE);
    Utility.STYLE_CONTEXT = new StyleContext()._StyleContext();
    let regular = Utility.STYLE_CONTEXT.addStyle('regular', defaultStyle);
    StyleConstants.setFontFamily(regular, font.getFamily$());
    StyleConstants.setFontSize(regular, font.getSize());
    let buttonStyle = Utility.STYLE_CONTEXT.addStyle('button', regular);
    StyleConstants.setForeground(buttonStyle, Utility.getLinkColor());
    let right = Utility.STYLE_CONTEXT.addStyle('right', regular);
    StyleConstants.setAlignment(right, StyleConstants.ALIGN_RIGHT);
  }
  /**
   * Get the standard border color.
   *
   * @return The border {@code Color}.
   */
  static getBorderColor(): Color {
    return ImageLibrary.getColor$String$Color('color.border.LookAndFeel', Color.BLACK);
  }
  /**
   * Get the color to use for links.
   *
   * @return The link {@code Color}.
   */
  static getLinkColor(): Color {
    return ImageLibrary.getColor$String$Color('color.link.LookAndFeel', Color.BLUE);
  }
  /**
   * Get the color to use for things the player probably should not do.
   *
   * @return The warning {@code Color}.
   */
  static getWarningColor(): Color {
    return ImageLibrary.getColor$String$Color('color.warning.LookAndFeel', Color.RED);
  }
  static getColorCellBorder(): Border {
    if (Utility.COLOR_CELL_BORDER == null) {
      let icon = new ImageIcon()._ImageIcon$Image(ImageLibrary.getColorCellRendererBackground());
      Utility.COLOR_CELL_BORDER = BorderFactory.createCompoundBorder$Border$Border(BorderFactory.createMatteBorder$int$int$int$int$Icon(5, 10, 5, 10, icon), BorderFactory.createLineBorder$Color(Utility.getBorderColor()));
    }
    return Utility.COLOR_CELL_BORDER;
  }
  static getDialogBorder(): Border {
    if (Utility.DIALOG_BORDER == null) {
      Utility.DIALOG_BORDER = BorderFactory.createCompoundBorder$Border$Border(Utility.getTrivialLineBorder(), Utility.blankBorder(10, 20, 10, 20));
    }
    return Utility.DIALOG_BORDER;
  }
  static getProductionBorder(): Border {
    return BorderFactory.createCompoundBorder$Border$Border(BorderFactory.createMatteBorder$int$int$int$int$Color(1, 0, 0, 0, Utility.getBorderColor()), Utility.blankBorder(2, 2, 2, 2));
  }
  static getSimpleLineBorder(): Border {
    if (Utility.SIMPLE_LINE_BORDER == null) {
      Utility.SIMPLE_LINE_BORDER = BorderFactory.createCompoundBorder$Border$Border(Utility.getTrivialLineBorder(), Utility.blankBorder(5, 5, 5, 5));
    }
    return Utility.SIMPLE_LINE_BORDER;
  }
  static getTrivialLineBorder(): Border {
    return BorderFactory.createLineBorder$Color(Utility.getBorderColor());
  }
  static getTopCellBorder(): Border {
    if (Utility.TOPCELLBORDER == null) {
      Utility.TOPCELLBORDER = BorderFactory.createCompoundBorder$Border$Border(BorderFactory.createMatteBorder$int$int$int$int$Color(1, 0, 1, 1, Utility.getBorderColor()), BorderFactory.createEmptyBorder$int$int$int$int(2, 2, 2, 2));
    }
    return Utility.TOPCELLBORDER;
  }
  static getCellBorder(): Border {
    if (Utility.CELLBORDER == null) {
      Utility.CELLBORDER = BorderFactory.createCompoundBorder$Border$Border(BorderFactory.createMatteBorder$int$int$int$int$Color(0, 0, 1, 1, Utility.getBorderColor()), BorderFactory.createEmptyBorder$int$int$int$int(2, 2, 2, 2));
    }
    return Utility.CELLBORDER;
  }
  static getLeftCellBorder(): Border {
    if (Utility.LEFTCELLBORDER == null) {
      Utility.LEFTCELLBORDER = BorderFactory.createCompoundBorder$Border$Border(BorderFactory.createMatteBorder$int$int$int$int$Color(0, 1, 1, 1, Utility.getBorderColor()), BorderFactory.createEmptyBorder$int$int$int$int(2, 2, 2, 2));
    }
    return Utility.LEFTCELLBORDER;
  }
  static getTopLeftCellBorder(): Border {
    if (Utility.TOPLEFTCELLBORDER == null) {
      Utility.TOPLEFTCELLBORDER = BorderFactory.createCompoundBorder$Border$Border(BorderFactory.createMatteBorder$int$int$int$int$Color(1, 1, 1, 1, Utility.getBorderColor()), BorderFactory.createEmptyBorder$int$int$int$int(2, 2, 2, 2));
    }
    return Utility.TOPLEFTCELLBORDER;
  }
  /**
   * Return a button suitable for linking to another panel
   * (e.g. ColopediaPanel).
   *
   * @param text a {@code String} value
   * @param icon an {@code Icon} value
   * @param action a {@code String} value
   * @return a {@code JButton} value
   */
  static getLinkButton(text: string, icon: Icon, action: string): JButton {
    let button = new FreeColButton()._FreeColButton$String$Icon(text, icon).withButtonStyle(FreeColButton$ButtonStyle.TRANSPARENT);
    button.setMargin(Utility.EMPTY_MARGIN);
    button.setOpaque(false);
    button.setForeground(Utility.getLinkColor());
    button.setAlignmentY(Math.fround(0.8));
    button.setBorder(Utility.blankBorder(0, 0, 0, 0));
    button.setActionCommand(action);
    button.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
    return button;
  }
  /**
   * Make a suitable link button for a given key.
   *
   * Colonies and Europe-like objects are obvious, locations and units
   * are dependent on the message source.
   * TODO: Are there more useful possibilities?
   *
   * @param key The message key to make a link for.
   * @param val The text for the link.
   * @param player The {@code Player} to make a link for.
   * @param source The message source {@code FreeColGameObject}.
   * @return A {@code JButton} for the link, or null if no good
   *     choice found.
   */
  static getMessageButton(key: string, val: string, player: Player, source: FreeColGameObject): JButton {
    let link = null;
    if ($J.equals('%colony%', key) || key.endsWith('Colony%') || $J.equals('%settlement%', key)) {
      let settlement = player.getGame().getSettlementByName(val);
      link = (settlement == null) ? null : (player.owns(settlement)) ? settlement : settlement.getTile$();
    } else if ($J.equals('%europe%', key) || $J.equals('%market%', key)) {
      link = player.getEurope();
    } else if ($J.equals('%location%', key) || $J.equals('%repairLocation%', key)) {
      if ($J.isa(source, Location)) {
        link = source.getLinkTarget(player);
      }
    } else if ($J.equals('%unit%', key)) {
      if (source instanceof Unit && player.owns(source)) {
        link = source.getLinkTarget(player);
      }
    } else if ($J.equals('%enemyUnit%', key)) {
      if (source instanceof Unit && !player.owns(source)) {
        link = source.getLinkTarget(player);
      }
    }
    return (link == null) ? null : Utility.getLinkButton(val, null, link.getId());
  }
  /**
   * Creates a text area with standard settings suitable for use in FreeCol
   * panels, without setting its size.
   *
   * @param text The text to display in the text area.
   * @return A suitable text area.
   */
  static createTextArea(text: string): JTextArea {
    let textArea = new JTextArea()._JTextArea$String(text);
    textArea.setOpaque(false);
    textArea.setLineWrap(true);
    textArea.setWrapStyleWord(true);
    textArea.setFocusable(false);
    return textArea;
  }
  /**
   * Gets a text area with standard settings suitable for use in FreeCol
   * panels.
   *
   * @param text The text to display in the text area.
   * @return A suitable text area.
   */
  static getDefaultTextArea$String(text: string): JTextArea {
    return Utility.getDefaultTextArea$String$int(text, Utility.DEFAULT_TEXT_COLUMNS);
  }
  /**
   * Gets a text area with standard settings suitable for use in FreeCol
   * panels, which adapt their size based on what they contain.
   *
   * @param text The text to display in the text area.
   * @param columns The em-width number of columns to display the text in.
   * @return A suitable text area.
   */
  static getDefaultTextArea$String$int(text: string, columns: number): JTextArea {
    let textArea = Utility.createTextArea(text);
    textArea.setColumns(columns);
    textArea.setSize$Dimension(textArea.getPreferredSize$());
    return textArea;
  }
  /**
   * Gets a text area with standard settings suitable for use in FreeCol
   * panels, which can not adapt their size.
   *
   * @param text The text to display in the text area.
   * @param size The size of the area to display the text in.
   * @return A suitable text area.
   */
  static getDefaultTextArea$String$Dimension(text: string, size: Dimension): JTextArea {
    let textArea = Utility.createTextArea(text);
    textArea.setPreferredSize(size);
    return textArea;
  }
  /**
   * Get a {@code JTextPane} with default styles.
   *
   * @return The default {@code JTextPane} to use.
   */
  static getDefaultTextPane$(): JTextPane {
    let document = new DefaultStyledDocument()._DefaultStyledDocument$StyleContext(Utility.STYLE_CONTEXT);
    let textPane = new JTextPane()._JTextPane$StyledDocument(document);
    textPane.setOpaque(false);
    textPane.setEditable(false);
    textPane.setLogicalStyle(Utility.STYLE_CONTEXT.getStyle('regular'));
    return textPane;
  }
  /**
   * Get a {@code JTextPane} with default styles and given text.
   *
   * @param text The text to display.
   * @return A suitable {@code JTextPane}.
   */
  static getDefaultTextPane$String(text: string): JTextPane {
    let textPane = Utility.getDefaultTextPane$();
    textPane.setText(text);
    return textPane;
  }
  /**
   * Get a border consisting of empty space.
   *
   * @param top Top spacing.
   * @param left left spacing.
   * @param bottom Bottom spacing.
   * @param right Right spacing.
   * @return A blank border.
   */
  static blankBorder(top: number, left: number, bottom: number, right: number): Border {
    return BorderFactory.createEmptyBorder$int$int$int$int(top, left, bottom, right);
  }
  static padBorder(component: JComponent, top: number, left: number, bottom: number, right: number): void {
    component.setBorder(BorderFactory.createCompoundBorder$Border$Border(Utility.blankBorder(top, left, bottom, right), component.getBorder()));
  }
  /**
   * Returns a combo box for selecting a possible server address.
   * @return The combo box.
   */
  static createServerInetAddressBox(): JComboBox<InetAddress> {
    let serverAddresses = Utility.getPossibleServerAddresses();
    let serverAddressBox = new JComboBox()._JComboBox$ObjectArr($J.toArrayInto(serverAddresses.toArray(), $J.newArray(0, null)));
    serverAddressBox.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$());
    return serverAddressBox;
  }
  static getPossibleServerAddresses(): List<InetAddress> {
    let serverAddresses: List<InetAddress>;
    try {
      serverAddresses = NetworkInterface.networkInterfaces().flatMap(($p0) => $p0.inetAddresses()).filter((ia) => $J.isa(ia, Inet4Address)).collect(Collectors.toList());
    } catch ($e0) {
      if ($J.isa($e0, SocketException)) {
        let e = $J.exc($e0);
        serverAddresses = List.of(InetAddress.getLoopbackAddress());
      } else {
        throw $e0;
      }
    }
    return serverAddresses;
  }
  /**
   * Localize the a titled border.
   *
   * @param component The {@code JComponent} to localize.
   * @param template The {@code StringTemplate} to use.
   */
  static localizeBorder(component: JComponent, template: StringTemplate): void {
    let tb = component.getBorder();
    tb.setTitle(Messages.message$StringTemplate(template));
  }
  /**
   * Get a titled border for a Named object.
   *
   * @param named The {@code Named} to use.
   * @return The {@code TitledBorder}.
   */
  static localizedBorder$Named(named: Named): TitledBorder {
    return Utility.localizedBorder$String(named.getNameKey());
  }
  /**
   * Get a titled border for a Named object and a given
   * colored line border.
   *
   * @param named The {@code Named} to use.
   * @param color The color to use.
   * @return The {@code TitledBorder}.
   */
  static localizedBorder$Named$Color(named: Named, color: Color): TitledBorder {
    return Utility.localizedBorder$String$Color(named.getNameKey(), color);
  }
  /**
   * Get a titled border with Messages.message(key) as text.
   *
   * @param key The key to use.
   * @return The {@code TitledBorder}.
   */
  static localizedBorder$String(key: string): TitledBorder {
    return BorderFactory.createTitledBorder$Border$String(BorderFactory.createEmptyBorder$(), Messages.message$String(key));
  }
  /**
   * Get a titled border with Messages.message(key) as text and a given
   * colored line border.
   *
   * @param key The key to use.
   * @param color The color to use.
   * @return The {@code TitledBorder}.
   */
  static localizedBorder$String$Color(key: string, color: Color): TitledBorder {
    return BorderFactory.createTitledBorder$Border$String(BorderFactory.createLineBorder$Color$int(color, 1), Messages.message$String(key));
  }
  /**
   * Get a JButton with Messages.message(key) as text.
   *
   * @param key The key to use.
   * @return The {@code JButton}.
   */
  static localizedButton$String(key: string): FreeColButton {
    return new FreeColButton()._FreeColButton$String(Messages.message$String(key));
  }
  /**
   * Get a JButton with Messages.message(template) as text.
   *
   * @param template The {@code StringTemplate} to use.
   * @return The {@code JButton}.
   */
  static localizedButton$StringTemplate(template: StringTemplate): JButton {
    return new JButton()._JButton$String(Messages.message$StringTemplate(template));
  }
  /**
   * Get a JCheckBoxMenuItem with Messages.message(key) as text.
   *
   * @param key The key to use.
   * @param value The initial value.
   * @return The {@code JCheckBoxMenuItem}.
   */
  static localizedCheckBoxMenuItem(key: string, value: boolean): JCheckBoxMenuItem {
    return new JCheckBoxMenuItem()._JCheckBoxMenuItem$String$boolean(Messages.message$String(key), value);
  }
  /**
   * Gets a default header for panels containing a localized message.
   *
   * @param key The message key to use.
   * @param fontSpec A font-specification for the font to use.
   * @return A suitable {@code JLabel}.
   */
  static localizedHeader(key: string, fontSpec: string): JLabel {
    let header = Utility.localizedHeaderLabel$String$int$String(key, SwingConstants.CENTER, fontSpec);
    header.setBorder(BorderFactory.createEmptyBorder$int$int$int$int(20, 0, 20, 0));
    return header;
  }
  /**
   * Gets a label containing a localized message using the header font.
   *
   * @param key The message key to use.
   * @param alignment The alignment.
   * @param fontSpec A font specification.
   * @return A suitable {@code JLabel}.
   */
  static localizedHeaderLabel$String$int$String(key: string, alignment: number, fontSpec: string): JLabel {
    let text = Messages.message$String(key);
    let header = new JLabel()._JLabel$String$int(text, alignment);
    header.setFont(FontLibrary.getScaledFont$String$String(fontSpec, text));
    header.setOpaque(false);
    return header;
  }
  static localizedHeaderLabel$StringTemplate$int$String(template: StringTemplate, alignment: number, fontSpec: string): JLabel {
    let text = Messages.message$StringTemplate(template);
    let header = new JLabel()._JLabel$String$int(text, alignment);
    header.setFont(FontLibrary.getScaledFont$String$String(fontSpec, text));
    header.setOpaque(false);
    return header;
  }
  static localizedHeaderLabel$Named$String(named: Named, fontSpec: string): JLabel {
    return Utility.localizedHeaderLabel$String$int$String(named.getNameKey(), SwingConstants.LEADING, fontSpec);
  }
  /**
   * Get a JLabel for a FreeColSpecObjectType.
   *
   * @param fcgot The {@code FreeColSpecObjectType} to use.
   * @return The {@code JLabel}.
   */
  static localizedLabel$FreeColSpecObjectType(fcgot: FreeColSpecObjectType): JLabel {
    return Utility.localizedLabel$String(fcgot.getNameKey());
  }
  /**
   * Get a JLabel with Messages.message(key) as text.
   *
   * @param key The key to use.
   * @return The {@code JLabel}.
   */
  static localizedLabel$String(key: string): JLabel {
    return Utility.localizedLabel$StringTemplate(StringTemplate.key$String(key));
  }
  /**
   * Get a JLabel with Messages.message(template) as text.
   *
   * @param template The {@code StringTemplate} to use.
   * @return The {@code JLabel}.
   */
  static localizedLabel$StringTemplate(template: StringTemplate): JLabel {
    let label = new JLabel()._JLabel$String(Messages.message$StringTemplate(template));
    label.setOpaque(false);
    return label;
  }
  /**
   * Get a JLabel with Messages.message(template) as text.
   *
   * @param template The {@code StringTemplate} to use.
   * @param icon The icon to use.
   * @param alignment The alignment.
   * @return The {@code JLabel}.
   */
  static localizedLabel$StringTemplate$Icon$int(template: StringTemplate, icon: Icon, alignment: number): JLabel {
    let label = new JLabel()._JLabel$String$Icon$int(Messages.message$StringTemplate(template), icon, alignment);
    label.setOpaque(false);
    return label;
  }
  /**
   * Get a JMenu with Messages.message(key) as text.
   *
   * @param key The key to use.
   * @return The {@code JMenu}.
   */
  static localizedMenu$String(key: string): JMenu {
    return new JMenu()._JMenu$String(Messages.message$String(key));
  }
  /**
   * Get a JMenu with Messages.message(template) as text.
   *
   * @param template The {@code StringTemplate} to use.
   * @return The {@code JMenu}.
   */
  static localizedMenu$StringTemplate(template: StringTemplate): JMenu {
    return new JMenu()._JMenu$String(Messages.message$StringTemplate(template));
  }
  /**
   * Get a JMenuItem with Messages.message(key) as text.
   *
   * @param key The key to use.
   * @return The {@code JMenuItem}.
   */
  static localizedMenuItem$String(key: string): JMenuItem {
    return Utility.localizedMenuItem$String$Icon(key, null);
  }
  /**
   * Get a JMenuItem with Messages.message(key) as text.
   *
   * @param key The key to use.
   * @param icon The icon to use.
   * @return The {@code JMenuItem}.
   */
  static localizedMenuItem$String$Icon(key: string, icon: Icon): JMenuItem {
    return new JMenuItem()._JMenuItem$String$Icon(Messages.message$String(key), icon);
  }
  /**
   * Get a JMenuItem with Messages.message(template) as text.
   *
   * @param template The {@code StringTemplate} to use.
   * @return The {@code JMenuItem}.
   */
  static localizedMenuItem$StringTemplate(template: StringTemplate): JMenuItem {
    return Utility.localizedMenuItem$StringTemplate$Icon(template, null);
  }
  /**
   * Get a JMenuItem with Messages.message(template) as text.
   *
   * @param template The {@code StringTemplate} to use.
   * @param icon The icon to use.
   * @return The {@code JMenuItem}.
   */
  static localizedMenuItem$StringTemplate$Icon(template: StringTemplate, icon: Icon): JMenuItem {
    return new JMenuItem()._JMenuItem$String$Icon(Messages.message$StringTemplate(template), icon);
  }
  /**
   * Get a JRadioButtonMenuItem with Messages.message(template) as text.
   *
   * @param template The {@code StringTemplate} to generate the text.
   * @param value The initial value.
   * @return The {@code JRadioButtonMenuItem}.
   */
  static localizedRadioButtonMenuItem(template: StringTemplate, value: boolean): JRadioButtonMenuItem {
    return new JRadioButtonMenuItem()._JRadioButtonMenuItem$String$boolean(Messages.message$StringTemplate(template), value);
  }
  /**
   * Get a text area containing a localized message.
   *
   * @param key The message key.
   * @return A suitable {@code JTextArea}.
   */
  static localizedTextArea$String(key: string): JTextArea {
    return Utility.localizedTextArea$StringTemplate(StringTemplate.key$String(key));
  }
  /**
   * Get a text area containing a localized message.
   *
   * @param key The message key.
   * @param columns The em-width number of columns to display the text in.
   * @return A suitable {@code JTextArea}.
   */
  static localizedTextArea$String$int(key: string, columns: number): JTextArea {
    return Utility.localizedTextArea$StringTemplate$int(StringTemplate.key$String(key), columns);
  }
  /**
   * Get a text area containing a localized message.
   *
   * @param template The {@code StringTemplate} to use.
   * @return A suitable {@code JTextArea}.
   */
  static localizedTextArea$StringTemplate(template: StringTemplate): JTextArea {
    return Utility.localizedTextArea$StringTemplate$int(template, Utility.DEFAULT_TEXT_COLUMNS);
  }
  /**
   * Get a text area containing a localized message.
   *
   * @param template The {@code StringTemplate} to use.
   * @param columns The em-width number of columns to display the text in.
   * @return A suitable {@code JTextArea}.
   */
  static localizedTextArea$StringTemplate$int(template: StringTemplate, columns: number): JTextArea {
    return Utility.getDefaultTextArea$String$int(Messages.message$StringTemplate(template), columns);
  }
  /**
   * Get a panel with a localized message and icon.
   *
   * @param template The {@code StringTemplate} to use.
   * @param icon An {@code ImageIcon} to use.
   * @return The resulting {@code JPanel}.
   */
  static localizedTextPanel(template: StringTemplate, icon: ImageIcon): JPanel {
    let panel = new JPanel()._JPanel$LayoutManager(new GridLayout()._GridLayout$int$int(0, 2));
    panel.add$Component(new JLabel()._JLabel$Icon(icon));
    panel.add$Component(Utility.localizedTextArea$StringTemplate(template));
    panel.setBorder(Utility.getDialogBorder());
    return panel;
  }
  /**
   * Localize the tool tip message for a JComponent.
   *
   * @param comp The {@code JComponent} to localize.
   * @param key The key to use.
   */
  static localizeToolTip$JComponent$String(comp: JComponent, key: string): void {
    comp.setToolTipText(Messages.message$String(key));
  }
  /**
   * Localize the tool tip message for a JComponent.
   *
   * @param comp The {@code JComponent} to localize.
   * @param template The {@code StringTemplate} to use.
   */
  static localizeToolTip$JComponent$StringTemplate(comp: JComponent, template: StringTemplate): void {
    comp.setToolTipText(Messages.message$StringTemplate(template));
  }
  static drawGoldenText(text: string, g2d: Graphics2D, font: Font, x: number, y: number): void {
    g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    let textShape = new TextLayout(text, font, g2d.getFontRenderContext()).getOutline(null);
    let strokeScaling = Math.fround(FontLibrary.getFontScaling() / 2);
    let oldStroke = g2d.getStroke();
    g2d.translate$int$int(x, y);
    g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(strokeScaling * 4), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    g2d.setColor(Color.BLACK);
    g2d.draw(textShape);
    g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(strokeScaling * 2), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    g2d.setColor(new Color()._Color$int$int$int(162, 136, 105));
    g2d.draw(textShape);
    g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(strokeScaling * 1), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    g2d.setColor(new Color()._Color$int$int$int(64, 31, 6));
    g2d.draw(textShape);
    g2d.setStroke(oldStroke);
    g2d.setColor(new Color()._Color$int$int$int(222, 194, 161));
    g2d.fill(textShape);
    g2d.translate$int$int(-x, -y);
  }
  static $clinit() {
    Utility.BEVEL_BORDER = BorderFactory.createBevelBorder$int(BevelBorder.LOWERED);
    Utility.ETCHED_BORDER = BorderFactory.createEtchedBorder$();
    Utility.PROGRESS_BORDER = BorderFactory.createLineBorder$Color(new Color()._Color$int$int$int(122, 109, 82));
    Utility.COLOR_CELL_BORDER = null;
    Utility.DIALOG_BORDER = null;
    Utility.SIMPLE_LINE_BORDER = null;
    Utility.TOPCELLBORDER = null;
    Utility.CELLBORDER = null;
    Utility.LEFTCELLBORDER = null;
    Utility.TOPLEFTCELLBORDER = null;
    Utility.EMPTY_MARGIN = new Insets()._Insets(0, 0, 0, 0);
    Utility.STYLE_CONTEXT = null;
    Utility.FONTSPEC_TITLE = 'header-plain-max';
    Utility.FONTSPEC_SUBTITLE = 'header-plain-large';
  }
}

$J.define(Utility, 'net.sf.freecol.client.gui.panel.Utility', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Utility' }, meths: { 'localizeToolTip(javax.swing.JComponent,net.sf.freecol.common.model.StringTemplate)': 'localizeToolTip$JComponent$StringTemplate', 'localizeToolTip(javax.swing.JComponent,java.lang.String)': 'localizeToolTip$JComponent$String', 'localizedTextArea(net.sf.freecol.common.model.StringTemplate,int)': 'localizedTextArea$StringTemplate$int', 'localizedTextArea(net.sf.freecol.common.model.StringTemplate)': 'localizedTextArea$StringTemplate', 'localizedTextArea(java.lang.String,int)': 'localizedTextArea$String$int', 'localizedTextArea(java.lang.String)': 'localizedTextArea$String', 'localizedMenuItem(net.sf.freecol.common.model.StringTemplate,javax.swing.Icon)': 'localizedMenuItem$StringTemplate$Icon', 'localizedMenuItem(net.sf.freecol.common.model.StringTemplate)': 'localizedMenuItem$StringTemplate', 'localizedMenuItem(java.lang.String,javax.swing.Icon)': 'localizedMenuItem$String$Icon', 'localizedMenuItem(java.lang.String)': 'localizedMenuItem$String', 'localizedMenu(net.sf.freecol.common.model.StringTemplate)': 'localizedMenu$StringTemplate', 'localizedMenu(java.lang.String)': 'localizedMenu$String', 'localizedLabel(net.sf.freecol.common.model.StringTemplate,javax.swing.Icon,int)': 'localizedLabel$StringTemplate$Icon$int', 'localizedLabel(net.sf.freecol.common.model.StringTemplate)': 'localizedLabel$StringTemplate', 'localizedLabel(java.lang.String)': 'localizedLabel$String', 'localizedLabel(net.sf.freecol.common.model.FreeColSpecObjectType)': 'localizedLabel$FreeColSpecObjectType', 'localizedHeaderLabel(net.sf.freecol.common.model.Named,java.lang.String)': 'localizedHeaderLabel$Named$String', 'localizedHeaderLabel(net.sf.freecol.common.model.StringTemplate,int,java.lang.String)': 'localizedHeaderLabel$StringTemplate$int$String', 'localizedHeaderLabel(java.lang.String,int,java.lang.String)': 'localizedHeaderLabel$String$int$String', 'localizedButton(net.sf.freecol.common.model.StringTemplate)': 'localizedButton$StringTemplate', 'localizedButton(java.lang.String)': 'localizedButton$String', 'localizedBorder(java.lang.String,java.awt.Color)': 'localizedBorder$String$Color', 'localizedBorder(java.lang.String)': 'localizedBorder$String', 'localizedBorder(net.sf.freecol.common.model.Named,java.awt.Color)': 'localizedBorder$Named$Color', 'localizedBorder(net.sf.freecol.common.model.Named)': 'localizedBorder$Named', 'getDefaultTextPane(java.lang.String)': 'getDefaultTextPane$String', 'getDefaultTextPane()': 'getDefaultTextPane$', 'getDefaultTextArea(java.lang.String,java.awt.Dimension)': 'getDefaultTextArea$String$Dimension', 'getDefaultTextArea(java.lang.String,int)': 'getDefaultTextArea$String$int', 'getDefaultTextArea(java.lang.String)': 'getDefaultTextArea$String' }, clinit: true, lazy: ['BEVEL_BORDER', 'ETCHED_BORDER', 'PROGRESS_BORDER', 'COLOR_CELL_BORDER', 'DIALOG_BORDER', 'SIMPLE_LINE_BORDER', 'TOPCELLBORDER', 'CELLBORDER', 'LEFTCELLBORDER', 'TOPLEFTCELLBORDER', 'EMPTY_MARGIN', 'STYLE_CONTEXT', 'FONTSPEC_TITLE', 'FONTSPEC_SUBTITLE'] });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Color = $J.load('java.awt.Color');
  Cursor = $J.load('java.awt.Cursor');
  GridLayout = $J.load('java.awt.GridLayout');
  Insets = $J.load('java.awt.Insets');
  RenderingHints = $J.load('java.awt.RenderingHints');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JCheckBoxMenuItem = $J.load('javax.swing.JCheckBoxMenuItem');
  JComboBox = $J.load('javax.swing.JComboBox');
  JLabel = $J.load('javax.swing.JLabel');
  JMenu = $J.load('javax.swing.JMenu');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JPanel = $J.load('javax.swing.JPanel');
  JRadioButtonMenuItem = $J.load('javax.swing.JRadioButtonMenuItem');
  JTextArea = $J.load('javax.swing.JTextArea');
  JTextPane = $J.load('javax.swing.JTextPane');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  BevelBorder = $J.load('javax.swing.border.BevelBorder');
  DefaultStyledDocument = $J.load('javax.swing.text.DefaultStyledDocument');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyleContext = $J.load('javax.swing.text.StyleContext');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColButton = $J.load('net.sf.freecol.client.gui.panel.FreeColButton');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Location = $J.load('net.sf.freecol.common.model.Location');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
});
