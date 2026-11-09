// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_2_X_Changes.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class v0_2_X_Changes extends JObject {
  _v0_2_X_Changes(): this {
    return this;
  }
  static addAllChanges(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.2.X', true, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    v0_2_X_Changes.add_v0_2_4_Changes(changeInfos);
    v0_2_X_Changes.add_v0_2_3_Changes(changeInfos);
    v0_2_X_Changes.add_v0_2_2_Changes(changeInfos);
    v0_2_X_Changes.add_v0_2_1_Changes(changeInfos);
    v0_2_X_Changes.add_v0_2_0_Changes(changeInfos);
    changes = new ChangeInfo()._ChangeInfo(' ', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
  }
  static add_v0_2_4_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.2.4', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released February 23rd, 2015\n_-_ 48 days after Shattered v0.2.3\n\nv0.2.4 was a very important update, even if it was mainly porting another update from Pixel Dungeon\'s source code. This is because the v1.7.5 source included a change that was quite controversial: Degradation.\n\nIn Pixel Dungeon (after v1.7.5) upgraded gear degrades as it is used, and this degradation is usually reset by upgrading an item further. The goal of this change was to discourage hoarding upgrades and dumping them on a single weapon, but (especially in v.1.7.5) many players felt that degradation ruined the fun of the game.\n\nAfter a lot of consideration, I decided to not implement degradation into Shattered. Instead I started planning other changes to solve this problem without restricting gameplay quite as much. Those changes would eventually show up in updates like v0.4.0 and v0.8.0.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V024_HONEYPOT, 'Pixel Dungeon v1.7.5', ['v1.7.3 - v1.7.5 Source Implemented, with exceptions:\n_-_ Degredation not implemented.\n\n_-_ Badge syncing not implemented.\n\n_-_ Scroll of Weapon Upgrade renamed to Magical Infusion, works on armor.\n\n_-_ Scroll of Enchantment not implemented, Arcane stylus has not been removed.\n\n_-_ Honey pots now shatter in a new item: shattered honeypot. A bee will defend its shattered pot to the death against anything that gets near.\n\n_-_ Bombs have been reworked/nerfed: they explode after a delay, no longer stun, deal more damage at the center of the blast, affect the world (destroy items, blow up other bombs).']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V024_BANDOLIER, 'New Content', ['_-_ The huntress has been buffed: starts with Potion of Mind Vision identified, now benefits from strength on melee attacks, and has a chance to reclaim a single used ranged weapon from each defeated enemy.\n\n_-_ A new container: The Potion Bandolier! Potions can now shatter from frost, but the bandolier can protect them.\n\n_-_ Shops now stock a much greater variety of items, some item prices have been rebalanced.\n\n_-_ Added Merchant\'s Beacon.\n\n_-_ Added initials for IDed scrolls/potions.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['_-_ Going down stairs no longer increases hunger, going up still does.\n\n_-_ Many, many bugfixes.\n_-_ Some UI improvements.\n_-_ Ingame audio quality improved.\n_-_ Unstable spellbook buffed.\n_-_ Psionic blasts deal less self-damage.\n_-_ Potions of liquid flame affect a 3x3 grid.']));
  }
  static add_v0_2_3_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.2.3', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released January 6th, 2015\n_-_ 64 days after Shattered v0.2.2\n\nv0.2.3 was another update made of many small improvements. The most significant game content in this update was major additions and refinements to artifacts, including preventing duplicates.\n\nThis was also the first update where I started really trying to focus on game stability and code quality. In v0.2.3 I made some big changes to the internal code of the game\'s save system, which fixed lots of cases where the game would fail to save and load properly.\n\nLastly, v0.2.3 brought the addition of the game\'s supporter system! While monetization isn\'t as exciting as new game content, the supporter system is the primary reason why I\'ve been able to work on the game for so long.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V023_HOURGLASS, 'Artifact Changes', ['Added 4 new artifacts:\n_-_ Alchemist\'s Toolkit\n_-_ Unstable Spellbook\n_-_ Timekeeper\'s Hourglass\n_-_ Dried Rose\n\n_-_ Artifacts are now unique over each run\n_-_ Artifacts can now be cursed!\n_-_ Cloak of Shadows is now exclusive to the rogue\n_-_ Smaller Balance Changes and QOL improvements to almost every artifact']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V023_POTION_CRIMSON, 'Balance Changes', ['_-_ Health potion farming has been nerfed from all sources\n_-_ Freerunner now moves at very high speeds when invisible\n_-_ Ring of Force buffed significantly\n_-_ Ring of Evasion reworked again\n_-_ Improved the effects of some blandfruit types\n_-_ Using throwing weapons now cancels stealth']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['_-_ Implemented a donation system in the Google Play version of Shattered\n\n_-_ Significantly increased the stability of the save system\n\n_-_ Increased the number of visible rankings to 11 from 6\n\n_-_ Improved how the player is interrupted by harmful events']));
  }
  static add_v0_2_2_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.2.2', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released November 3rd, 2014\n_-_ 21 days after Shattered v0.2.1\n\nv0.2.2 was Shattered\'s first update that didn\'t have a specific focus. Instead this update was focused on making a bunch of little improvements.\n\nThe largest change was the integration of Pixel Dungeon\'s source code from v1.7.2, which included synchronous movement! It\'s something we take for granted now, but before this change every on-screen character had to move one at a time. This slowed the pace of the game to a crawl whenever enemies were on screen.\n\nHeroes remains also received big changes this update. In Pixel Dungeon you could use remains to consistently pass highly upgraded armor from one run to the next. I felt this violated the roguelike nature of the game, and so I nerfed remains to prevent this.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V022_WEIGHTSTONE, 'Pixel Dungeon v1.7.2', ['Implemented directly from v1.7.2:\n_-_ Synchronous Movement\n_-_ Challenges\n_-_ UI improvements\n_-_ Vertigo debuff\n\nImplement with changes:\n_-_ Weightstone: Increases either speed or damage, at the cost of the other, instead of increasing either speed or accuracy.\n\nNot Implemented:\n_-_ Key ring and unstackable keys\n_-_ Blindweed has not been removed']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V022_DREAMFOIL, 'New Plants', ['Added two new plants:\n_-_ Stormvine, which brews into levitation\n_-_ Dreamfoil, which brews into purity\n\n_-_ Potion of levitation can now be thrown to make a cloud of confusion gas\n\n_-_ Removed gas collision logic, gasses can now stack without limitation.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V022_REMAINS, 'Heroes Remains', ['Heroes remains have been significantly adjusted to prevent strategies that exploit them, but also to increase their average loot.\n\nRemains have additional limitations:\n_-_ Heros will no longer drop remains if they have obtained the amulet of yendor, or die 5 or more floors above the deepest floor they have reached\n_-_ Class exclusive items can no longer appear in remains\n_-_ Items found in remains are now more harshly level-capped\n_-_ Remains are not dropped, and cannot be found, when challenges are enabled.\n\nHowever:\n_-_ Remains can now contain useful items from the inventory, not just equipped items.\n_-_ Remains are now less likely to contain gold.']));
  }
  static add_v0_2_1_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.2.1', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released October 13th, 2014\n_-_ 28 days after Shattered v0.2.0\n\nv0.2.1 was the first in a short lived series of \'region overhaul\' updates. Thanks to releasing on Google Play, Shattered was getting a huge influx of new players, and I wanted to make some changes that they would appreciate. The three new minibosses and Goo changes were all made to try and help new players get used to the game.\n\nThis update also continued v0.2.0\'s trend of expanding Shattered\'s scope. I was no longer just planning to change items, but was now making additions and reworks to regions of the dungeon as well!']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.PD_GHOST, 'New Sewer Quests', ['_-_ Removed the dried rose quest (the rose will return...)\n\n_-_ Tweaked the mechanics of the fetid rat quest\n\n_-_ Added a gnoll trickster quest\n\n_-_ Added a great crab quest']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_GOO, 'Goo Changes', ['Goo\'s animations have been overhauled, including a particle effect for the area of its pumped up attack.\n\nGoo\'s arena has been updated to give more room to maneuver, and to be more variable.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SIGNPOST, 'Story & Signpost Changes', ['Most text in the sewers has been overhauled, including descriptions, quest dialogues, signposts, and story scrolls']));
  }
  static add_v0_2_0_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.2.0', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V010_SHPX, 'Developer Commentary', ['_-_ Released September 15th, 2014\n_-_ 31 days after Shattered v0.1.1\n_-_ 41 days after Shattered v0.1.0\n\nv0.2.0 was the first version of Shattered to release on Google Play! I had originally wanted to wait longer, but I was getting flooded with messages about it.\n\nArtifacts came from realizing it would be very difficult to make some rings worth upgrading by just buffing them. Instead, I decided to put their mechanics  on a new class of item that didn\'t need upgrades. Artifacts ended up becoming Shattered\'s first flagship feature!\n\nI feel like this was the start of a new era for Shattered\'s development, as updates become about making much more significant changes to content than just balance adjustments.\n\nGiving the Cloak of Shadows to the Rogue was also my first attempt at a class rework. It was a much more simple change than later reworks, and I ended up revisiting the Rogue in v0.6.2.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_HORN, 'Artifacts!', ['Added artifacts to the game!\n\nArtifacts are unique items which offer new gameplay opportunities and grow stronger through unique means.\n\nRemoved 7 Rings... And Replaced them with 7 Artifacts!\n_-_ Ring of Shadows becomes Cloak of Shadows\n_-_ Ring of Satiety becomes Horn of Plenty\n_-_ Ring of Mending becomes Chalice of Blood\n_-_ Ring of Thorns becomes Cape of Thorns\n_-_ Ring of Haggler becomes Master Thieves\' Armband\n_-_ Ring of Naturalism becomes Sandals of Nature']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_RING_DIAMOND, 'New Rings!', ['To replace the lost rings, 6 new rings have been added:\n_-_ Ring of Force\n_-_ Ring of Furor\n_-_ Ring of Might\n_-_ Ring of Tenacity\n_-_ Ring of Sharpshooting\n_-_ Ring of Wealth\n\nThe 5 remaining rings have also been tweaked or reworked entirely:\n_-_ Ring of Accuracy\n_-_ Ring of Elements\n_-_ Ring of Evasion\n_-_ Ring of Haste\n_-_ Ring of Magic (formerly Power)']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['-Nerfed farming health potions from fly swarms.\n\n-Buffed crazed bandit and his drops.\n\n-Made Blandfruit more common.\n\n-Nerfed Assassin bonus damage slightly, to balance with him having an artifact now.\n\n-Added a welcome page!']));
  }
}

$J.define(v0_2_X_Changes, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_2_X_Changes', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_v0_2_X_Changes' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ChangesScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  ChangeButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeButton');
  ChangeIcons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeIcons');
  ChangeInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeInfo');
});
