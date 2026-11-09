// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_4_X_Changes.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, JObject } from '../../../../../../jre/index.ts';

let Messages, ChangesScene, Window, ChangeButton, ChangeIcons, ChangeInfo;

export class v0_4_X_Changes extends JObject {
  _v0_4_X_Changes(): this {
    return this;
  }
  static addAllChanges(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.4.X', true, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    v0_4_X_Changes.add_v0_4_3_Changes(changeInfos);
    v0_4_X_Changes.add_v0_4_2_Changes(changeInfos);
    v0_4_X_Changes.add_v0_4_1_Changes(changeInfos);
    v0_4_X_Changes.add_v0_4_0_Changes(changeInfos);
  }
  static add_v0_4_3_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.4.3', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released October 16th, 2016\n_-_ 37 days after Shattered v0.4.2\n\nv0.4.3 was a small update that mostly focused on more technical changes. With all the internal changes that v0.4.2 brought there were lots of new bugs, and I didn\'t want to make players wait all the way until the release of v0.5.0 to get fixes for them.\n\nWhile it doesn\'t affect the content of the game, I also massively improved how Shattered is built from its source code in v0.4.2 and v0.4.3. This makes Shattered easier to compile for people who want to work with its open source, and also results in a compiled game that\'s a bit smaller and more efficient.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, 'Technical Improvements', ['_-_ Added rankings and hall of heroes sync via Google Play Games, for the Google Play version of Shattered.\n\n_-_ Added Power Saver mode in settings\n_-_ Download size reduced by ~25%\n_-_ Game now supports small screen devices\n_-_ Performance improvements\n_-_ Improved variety of level visuals']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V043_FLAIL, 'Balance Changes', ['_-_ Flail max damage increased by ~15%\n_-_ Wand of Frost damage reduction increased from 5% per turn of chill to 7.5%\n_-_ Ring of Furor speed bonus reduced by ~15% for slow weapons, ~0% for fast weapons\n_-_ Reduced sacrificial curse bleed by ~33%\n_-_ Reworked glyph of brimstone, now grants shielding instead of healing\n_-_ Reworked glyph of stone, now reduces speed in doorways\n_-_ Thrown potions now trigger traps and plants']));
  }
  static add_v0_4_2_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.4.2', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released September 9th, 2016\n_-_ 46 days after Shattered v0.4.1\n\nv0.4.2 was an update almost entirely focused on technical improvements in preparation for v0.5.0 and v0.6.0. I knew that I wanted the game to be able to support bigger maps and more complex graphics.\n\nThe most user-visible change in this update was the decoupling of Shattered\'s display logic and gameplay logic. This doubled the amount of processor power that the game had access to and meant that the game wouldn\'t freeze or hitch if gameplay logic was taking a while. This made the game run much smoother.\n\nBehind the scenes, the biggest changes were probably to various bits of game logic that assumed a constant map size of 32x32. After v0.4.2 many of these operations were made more efficient, and could work on variably sized maps, up to a new theoretical max of about 144x144.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, 'Technical Improvements', ['_-_ Many general performance improvements\n_-_ Game now uses 2 CPU cores, up from 1\n_-_ Reduced hitching on many devices\n_-_ Framerate improvements for older devices\n_-_ Game size reduced by ~10%']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V042_GLAIVE, 'Balance Changes', ['_-_ Spear and Glaive damage reduced\n_-_ Runic blade damage reduced\n_-_ Grim enchant now procs more often\n_-_ Glyph of stone adds more weight\n_-_ Glyph of potential procs less often\n_-_ Wand of Fireblast less dangerous to caster\n_-_ Wand of Pris. Light reveal area reduced\n_-_ Ring of Wealth slightly more effective\n_-_ Ring of Sharpshooting gives more accuracy']));
  }
  static add_v0_4_1_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.4.1', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released July 25th, 2016\n_-_ 35 days after Shattered v0.4.0\n\nv0.4.1 was a direct followup to v0.4.0. I wanted to address various balance issues that arose as a consequence of the weapon overhaul. Upgrading armor was already seen as optional by many players prior to v0.4.0, and so after v0.4.0 armor was beginning to be seen as almost useless! I had always intended to try and better balance armor vs. weapons, but after v0.4.0 I realized that I needed to make it a top priority.\n\nAside from the obvious numbers changes in this update, I also made armor much more reliable. In Shattered damage calculations have always used a \'triangular distribution\', where the middle value is the most likely result, and the max or min are quite rare. Armor didn\'t use this prior to v0.4.1, which meant that even highly upgraded armor could be quite unreliable. Since v0.4.1, and other updates like v0.8.0, I now feel that armor is well-balanced versus weapons.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V041_PLATE, 'Item Changes pt.1', ['Armor and Enemy Balance Changes:\n_-_ Armor now has a min damage block value\n_-_ Armor gains more blocking from upgrades\n_-_ Prison+ enemy damage increased\n_-_ Evil Eyes reworked\n_-_ Brimstone glyph healing reduced\n\nClass Balance Changes:\n_-_ Mage\'s Staff melee damage increased\n_-_ Mage\'s Staff can now preserve one upgrade\n_-_ Cloak of Shadows buffed at lower levels\n_-_ Some Battlemage effects changed\n\nWand Balance Changes:\n_-_ All wands damage adjusted/increased\n_-_ Upgraded wands appear slightly less often\n_-_ Wand of Lightning bonus damage reduced\n_-_ Wand of Fireblast uses fewer charges\n_-_ Wand of Venom damage increases over time\n_-_ Wand of Prismatic Light bonus damage reduced\n_-_ Corrupted enemies live longer & no longer attack eachother\n_-_ Wands in the holster now charge faster']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V041_RUNICBLADE, 'Item Changes pt.2', ['Ring Balance Changes:\n_-_ Ring of Force weaker at 18+ strength, stronger otherwise\n_-_ Ring of Tenacity reduces more damage\n_-_ Ring of Wealth secret rewards adjusted\n_-_ Ring of Evasion now works consistently\n\nArtifact Balance Changes:\n_-_ Dried Rose charges faster, ghost HP up\n_-_ Horn of Plenty now charges on exp gain\n_-_ Master Thieves Armband levels faster\n_-_ Sandals of Nature level faster\n_-_ Hourglass uses fewer charges at a time\n_-_ Horn of Plenty adjusted, now stronger\n\nWeapon Balance Changes:\n_-_ Lucky enchant deals max dmg more often\n_-_ Dazzling enchant now cripples & blinds\n_-_ Flail now can\'t surprise attack, damage increased\n_-_ Extra reach weapons no longer penetrate\n_-_ Runic blade damage decreased']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['_-_ Added a new journal button with key display\n_-_ Keys now exist in the journal, not inventory\n_-_ Improved donator menu button visuals\n_-_ Increased the efficiency of data storage\n_-_ Chasms now deal less damage, but bleed\n_-_ Many shop prices adjusted\n_-_ Pirahna rooms no longer give cursed gear']));
  }
  static add_v0_4_0_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.4.0', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released June 20th, 2016\n_-_ 50 days after Shattered v0.3.5\n_-_ 391 days after Shattered v0.3.0\n\nv0.4.0 was Shattered\'s third major item category update, this time addressing weapons! I see this update as the start of a new era for Shattered\'s development. For the first time a major update was adding far more content than it was reworking or repurposing.\n\nThis update also restructured how weapon strength requirements scaled with upgrades. This made it much more difficult to access high tier items early by dumping upgrades into them. This was my attempt to solve some of the game\'s pacing issues without adding degradation.\n\nI also retooled curses to try and make them more about negative effects than negative stats. This meant the player had more flexibility when it came to trying gear out, as equipping a cursed item wasn\'t an almost certain game over.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V040_LONGSWORD, 'Equipment Overhaul!', ['_-_ 13 new weapons, 12 rebalanced weapons\n\nEquipment Balance:\n_-_ Tier 2-4 weapons do more base damage\n_-_ All weapons gain more dmg from upgrades\n_-_ Upgrades now remove enchants less often\n_-_ Upgrades reduce str requirements less\n_-_ All armors require 1 more str\n_-_ Encumbered characters can\'t sneak attack\n\nDroprate Changes:\n_-_ Powerful equipment less common early\n_-_ +3 and +2 equipment less common\n_-_ Equipment curses more common\n_-_ Tier 1 equipment no longer drops\n_-_ Arcane styli slightly more common\n_-_ Better item drops on floors 22-24']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V040_STYLUS, 'Curse, Enchant, & Glyph Overhaul!', ['_-_ 3 new enchants, 10 rebalanced enchants\n_-_ 8 new glyphs, 5 rebalanced glyphs\n_-_ 12 new curse effects\n\nEquipment Curses:\n_-_ Curses now give negative effects\n_-_ Curses no longer give negative levels\n_-_ Upgrades now weaken curses\n_-_ Remove curse scrolls now affect 1 item']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['Class Balance:\n_-_ Huntress now starts with knuckleduster\n_-_ Assassin sneak bonus damage reduced\n_-_ Fixed a bug where berserker was immune when enraged\n_-_ Gladiator\'s clobber now inflicts vertigo, not stun\n\nEnemy Balance:\n_-_ Tengu damage increased\n_-_ Prison Guard health and DR increased\n\nMisc:\n_-_ Scrolls of upgrade no longer burn\n_-_ Potions of strength no longer freeze\n_-_ Translation updates\n_-_ Various bugfixes']));
  }
}

$J.define(v0_4_X_Changes, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_4_X_Changes', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_v0_4_X_Changes' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ChangesScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  ChangeButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeButton');
  ChangeIcons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeIcons');
  ChangeInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeInfo');
});
