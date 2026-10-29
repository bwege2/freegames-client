// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/AboutPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, ImageIcon, JLabel, MigLayout, FreeCol, FontLibrary, ImageLibrary, Utility, OSUtils;

/**
 * This is the About panel
 * <p>
 * Panel Layout:
 * <p style="display: block; font-family: monospace; white-space: pre; margin: 1em 0;">
 * | ---------------|
 * | apLogoLabel    |
 * | ---------------|
 * | apVersion      |
 * | ---------------|
 * | apRevision     |
 * | ---------------|
 * | apOfficialSite |
 * | ---------------|
 * | apSiteURL      |
 * | ---------------|
 * | apSFProject    |
 * | ---------------|
 * | apProjectURL   |
 * | ---------------|
 * | apLegal        |
 * | ---------------|
 * | apCopyright    |
 * | ---------------|
 * | okButton       |
 * | ---------------|
 */
export class AboutPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The main FreeCol website
   */
  static readonly SITE_URL: string = 'http://www.freecol.org';
  /**
   * The FreeCol SourceForge project link
   */
  static readonly PROJECT_URL: string = 'https://sourceforge.net/projects/freecol/';
  /**
   * The link to the user manual for FreeCol users
   */
  static readonly MANUAL_URL: string = 'http://www.freecol.org/documentation/freecol-user-manual.html';
  /**
   * The link to the GitHub mirror
   */
  static readonly GITHUB_URL: string = 'https://github.com/FreeCol/freecol';
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _AboutPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String('wrap'));
    let apLogoLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(ImageLibrary.getUnscaledImage('image.flavor.Title')));
    this.add$Component$Object(apLogoLabel, 'center');
    let fontBold = FontLibrary.getScaledFont$String('normal-bold-tiny');
    let fontNormal = FontLibrary.getScaledFont$String('normal-plain-tiny');
    let apVersion = Utility.localizedLabel$String('aboutPanel.version');
    apVersion.setFont(fontBold);
    let apRevision = new JLabel()._JLabel$String(FreeCol.getRevision());
    apRevision.setFont(fontNormal);
    this.add$Component$Object(apVersion, 'newline 20');
    this.add$Component$Object(apRevision, 'newline');
    let apOfficialSite = Utility.localizedLabel$String('aboutPanel.officialSite');
    apOfficialSite.setFont(fontBold);
    this.add$Component$Object(apOfficialSite, 'newline 10');
    let apSiteURL = Utility.getLinkButton(AboutPanel.SITE_URL, null, AboutPanel.SITE_URL);
    apSiteURL.addActionListener($J.fn(this, 'actionPerformed'));
    apSiteURL.setFont(fontNormal);
    this.add$Component$Object(apSiteURL, 'newline');
    let apSFProject = Utility.localizedLabel$String('aboutPanel.sfProject');
    apSFProject.setFont(fontBold);
    this.add$Component$Object(apSFProject, 'newline 10');
    let apProjectURL = Utility.getLinkButton(AboutPanel.PROJECT_URL, null, AboutPanel.PROJECT_URL);
    apProjectURL.addActionListener($J.fn(this, 'actionPerformed'));
    apProjectURL.setFont(fontNormal);
    this.add$Component$Object(apProjectURL, 'newline');
    let apGitHubButton = Utility.localizedLabel$String('aboutPanel.github');
    apGitHubButton.setFont(fontBold);
    this.add$Component$Object(apGitHubButton, 'newline 10');
    let apGitHubURL = Utility.getLinkButton(AboutPanel.GITHUB_URL, null, AboutPanel.GITHUB_URL);
    apGitHubURL.addActionListener($J.fn(this, 'actionPerformed'));
    apGitHubURL.setFont(fontNormal);
    this.add$Component$Object(apGitHubURL, 'newline');
    let apManual = Utility.localizedLabel$String('aboutPanel.manual');
    apManual.setFont(fontBold);
    this.add$Component$Object(apManual, 'newline 10');
    let apManualURL = Utility.getLinkButton(AboutPanel.MANUAL_URL, null, AboutPanel.MANUAL_URL);
    apManualURL.addActionListener($J.fn(this, 'actionPerformed'));
    this.add$Component$Object(apManualURL, 'newline');
    let apLegal = Utility.localizedTextArea$String('aboutPanel.legalDisclaimer');
    apLegal.setFont(fontNormal);
    this.add$Component$Object(apLegal, 'newline 20, width 300px');
    let apCopyright = Utility.localizedLabel$String('aboutPanel.copyright');
    apCopyright.setFont(fontNormal);
    this.add$Component$Object(apCopyright, 'newline 10');
    this.add$Component$Object(this.okButton, 'newline 20, tag ok');
    this.setEscapeAction(new (AboutPanel$1())().$o(this)._AbstractAction$());
    return this;
  }
  /**
   * {@inheritDoc}
   *
   * Launch a browser with the link clicked from the panel.
   *
   * @see OSUtils#launchBrowser(String)
   */
  actionPerformed(ae: ActionEvent): void {
    let url = ae.getActionCommand();
    if ($J.equals(AboutPanel.SITE_URL, url) || $J.equals(AboutPanel.PROJECT_URL, url) || $J.equals(AboutPanel.MANUAL_URL, url) || $J.equals(AboutPanel.GITHUB_URL, url)) {
      OSUtils.launchBrowser(url);
    } else {
      super.actionPerformed(ae);
    }
  }
  static $clinit() {
    AboutPanel.logger = Logger.getLogger($J.cls(AboutPanel).getName());
  }
}

let $AboutPanel$1: any = null;
/** An anonymous class (AboutPanel.java:162). */
function AboutPanel$1(): any {
  return $AboutPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.AboutPanel$1', []);
}

$J.define(AboutPanel, 'net.sf.freecol.client.gui.panel.AboutPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_AboutPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  OSUtils = $J.load('net.sf.freecol.common.util.OSUtils');
});
