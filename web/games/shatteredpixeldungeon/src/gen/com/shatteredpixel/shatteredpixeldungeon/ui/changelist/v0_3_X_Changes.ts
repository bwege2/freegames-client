// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_3_X_Changes.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class v0_3_X_Changes extends JObject {
  _v0_3_X_Changes(): this {
    return this;
  }
  static addAllChanges(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.3.X', true, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    v0_3_X_Changes.add_v0_3_5_Changes(changeInfos);
    v0_3_X_Changes.add_v0_3_4_Changes(changeInfos);
    v0_3_X_Changes.add_v0_3_3_Changes(changeInfos);
    v0_3_X_Changes.add_v0_3_2_Changes(changeInfos);
    v0_3_X_Changes.add_v0_3_1_Changes(changeInfos);
    v0_3_X_Changes.add_v0_3_0_Changes(changeInfos);
  }
  static add_v0_3_5_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.3.5', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released May 1st, 2016\n_-_ 81 days after Shattered v0.3.4\n\nv0.3.5 introduced the second proper class rework, this time to the Warrior! I tried to shift the warrior\'s powers away from a raw stat increase into something more interesting, while still keeping his power easy to access for new players. Similarly to the Mage\'s rework, the core ideas added here are still in the game, but I\'ve since made lots of changes to the specifics.\n\nThis was also the first time that I decided to split a major update into two smaller ones. Originally v0.4.0 was going to rework both the warrior and weapons, but part way through development I decided to split them in order to get an update out sooner. This approach was quite successful, but I ended up not properly using it again until v0.9.0!']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V035_WARRIOR_CLOTH, 'Warrior Rework!', ['Warrior Rework:\n_-_ Starting STR down to 10, from 11\n_-_ Short sword dmg down to 1-10, from 1-12\n_-_ Short sword can no longer be reforged\n_-_ Now IDs potions of health, not STR\n_-_ Now starts with a unique seal for armor\n_-_ Seal grants shielding ontop of health\n_-_ Seal allows for one upgrade transfer']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V035_WARRIOR_HEROARM, 'Warrior Subclass Rework!', ['Berserker Rework:\n_-_ Bonus damage now scales with lost HP, instead of a flat 50% at 50% hp\n_-_ Berserker can now endure through death for a short time, with caveats\n\nGladiator Rework:\n_-_ Combo no longer grants bonus damage\n_-_ Combo is now easier to stack\n_-_ Combo now unlocks special finisher moves']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['Balance Tweaks:\n_-_ Spears can now reach enemies 1 tile away\n_-_ Wand of Blast Wave now pushes bosses less\n\nMisc:\n_-_ Can now examine multiple things in one tile\n_-_ Pixelated font now available for cyrillic languages\n_-_ Added Hungarian language']));
  }
  static add_v0_3_4_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.3.4', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released February 10th, 2016\n_-_ 54 days after Shattered v0.3.3\n\nv0.3.4 made Shattered available in multiple languages! This update was a direct response to messages I kept getting from users who wanted to share the game with their friends, but couldn\'t due to the language barrier.\n\nTranslating the game was no small feat, Shattered has a huge amount of text that is constantly changing and growing, over 50 thousand words in total. Because of the volume of text it would have been prohibitively expensive to get the game professionally translated, and so I opted to ask for community translations instead.\n\nThe response from the community was and continues to be incredible! Even multiple years later Shattered\'s updates are still consistently translated into a number of languages.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V034_TRANSLATIONS, 'Translations!', ['Shattered Pixel Dungeon now supports multiple languages, thanks to a new community translation project!\n\nThe Following languages are supported at release:\n_-_ English\n_-_ Russian\n_-_ Korean\n_-_ Chinese\n_-_ Portugese\n_-_ German\n_-_ French\n_-_ Italian\n_-_ Polish\n_-_ Spanish\n\nNote that translations are not currently supported on desktop.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['Completely redesigned the text rendering system to support none-english characters\n\nNew text system renders using either the default system font, or the original pixelated game font. None-latin languages must use system font.\n\nBalance Changes:\n_-_ Hunger now builds ~10% slower\n_-_ Sad Ghost no longer gives tier 1 loot\n_-_ Sad Ghost gives tier 4/5 loot less often\n_-_ Burning now deals less damage at low HP\n_-_ Weakness no longer discharges wands\n_-_ Rockfall traps rebalanced']));
  }
  static add_v0_3_3_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.3.3', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released December 18th, 2015\n_-_ 44 days after Shattered v0.3.2\n\nv0.3.3 was a small bumper update that was mostly focused on getting Google Play Games functionality working.\n\nGoogle Play Games was the first online functionality ever added to Shattered. Some people were worried that this was the start of me turning Shattered into a game that would require internet. I tried to address this worry by making the functionality as optional as possible and heavily emphasizing that it was only for tiny extras like cloud sync and play games badges. Nowadays things are much more relaxed and Shattered has several internet-enabled features, but still none of them are needed to play the game itself.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V033_PLAYGAMES, 'Google Play Games', ['Added support for Google Play Games in the Google Play version:\n\n- Badges can now sync across devices\n- Five Google Play Achievements added\n- Rankings sync will come in future\n\nShattered remains a 100% offline game if Google Play Games is not enabled']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['Gameplay Changes:\n- Tengu\'s maze is now different each time\n- Items no longer auto-pickup when enemies are near\n\nFixes:\n- Fixed several bugs with prison enemies\n- Fixed some landscape window size issues\n- Fixed other minor bugs\n\nMisc:\n- Added support for reverse landscape\n- Added a small holiday treat ;)\n- Thieves now disappear when they get away']));
  }
  static add_v0_3_2_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.3.2', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released November 4th, 2015\n_-_ 79 days after Shattered v0.3.1\n\nv0.3.2 was my second \'area rework\' before I ended up shelving the idea. I stopped doing area reworks because I decided to shift my focus toward the longer-term, and so decided I wanted to make other changes before reworking more areas. Future area reworks ended up happening incrementally as I worked on larger updates instead, such as v0.6.0 and v0.8.0.\n\nv0.3.2 was also another update with a controversial change: the removal of the tome of mastery from the start of the game. Prior to this change subclasses were available from floor 1 after you unlocked them. I changed this as I wanted to make subclasses more powerful and interesting, but having them available on floor 1 limited that.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V032_TENGU, 'Prison Rework', ['_-_ Tengu boss fight completely redone\n_-_ Corpse dust quest overhauled\n_-_ Rotberry quest overhauled\n_-_ NEW elemental embers quest\n_-_ NEW prison mob: insane prison guards!\n_-_ Thieves can escape with a stolen item\n_-_ Gnoll shaman attack speed increased']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V032_MASTERY, 'Balance Changes', ['_-_ Mastery Book now always at floor 10, even when unlocked\n_-_ Hunger damage now increases with hero level, starts lower\n\nSewers rebalance: \n_-_ Marsupial rat dmg and evasion reduced\n_-_ Gnoll scout accuracy reduced\n_-_ Sewer crabs less likely to spawn on floor 3, grant more exp\n_-_ Fly swarms rebalanced, moved to the sewers\n_-_ Great Crab HP reduced \n_-_ Goo fight rebalanced \n \nBase Class Changes: \n_-_ Mage\'s staff base damage increased \n_-_ Huntress now starts with 20 hp \n_-_ Huntress no longer heals more from dew \n_-_ Rogue\'s cloak of shadows now drains less while invisible\n \nSubclass Changes: \n_-_ Berserker now starts raging at 50% hp (up from 40%) \n_-_ Warden now heals 2 extra HP from dew \n_-_ Warlock completely overhauled']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['_-_ Visual improvements from 1.9.1 source\n_-_ Improved golden UI for donators\n_-_ Fixed \'white line\' graphical artifacts\n_-_ Floor locking now pauses all passive effects, not just hunger\n_-_ Cursed chains now only cripple, do not root\n_-_ Warping trap rebalanced, much less harsh\n_-_ Various other bugfixes']));
  }
  static add_v0_3_1_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.3.1', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released August 17th, 2015\n_-_ 83 days after Shattered v0.3.0\n\nv0.3.1 is the first update that I ended up regretting. While almost all of the content in these earlier updates has been revisited in some way, the trap changes were arguably detrimental to the game at the time they were implemented.\n\nI was too obsessed with quantity over quality, and so I ended up adding lots of frustrating traps in the mid and lategame. I only ended up fixing this years later, primarily with the trap changes in v0.6.2 and v0.8.0. Incrementally adding well-designed traps over time would have been a much better approach.\n\nStill, v0.3.1 wasn\'t all bad. Traps in the earlygame were improved, and it also introduced some very important interface changes such as four quickslots, expanded game settings, and quickslot autotargeting. This was also the first update that had a beta release, something that I\'ve done for every update since.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V031_GRIM_TRAP, 'Trap Overhaul', ['_-_ Over 20 new traps + tweaks to existing ones\n_-_ Trap visuals overhauled\n_-_ Traps now get trickier deeper in the dungeon\n_-_ Trap room reworked to make use of new traps']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V031_MENU_BUTTON, 'Interface Improvements', ['_-_ Adjusted display scaling\n_-_ Search and Examine merged into one button (double tap to search)\n_-_ New max of 4 Quickslots!\n_-_ Multiple toolbar modes for large display and landscape users\n_-_ Ability to flip toolbar and indicators (left-handed mode)\n_-_ Better settings menu\n_-_ Graphics settings are now accessible ingame\n_-_ More consistent text rendering\n_-_ Recent changes can now be viewed from the title screen\n_-_ Added a health bar for bosses']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['Balance changes:\n_-_ Ethereal chains now gain less charge the more charges they have\n_-_ Staff of regrowth grants more herbal healing\n_-_ Monks now disarm less randomly, but not less frequently\n_-_ Invisibility potion effect now lasts for 20 turns, up from 15\n\nQOL improvements:\n_-_ Quickslots now autotarget enemies\n_-_ Resting now works while hungry & at max HP\n_-_ Dew drops no longer collect when at full health with no dew vial\n_-_ Items now stay visible in the fog of war\n_-_ Added a visual hint to weak floor rooms\n_-_ Many bugfixes']));
  }
  static add_v0_3_0_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.3.0', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released May 26th, 2015\n_-_ 92 days after Shattered v0.2.4\n_-_ 253 days after Shattered v0.2.0\n\nv0.3.0 was Shattered\'s second major item category rework, and Shattered\'s first real class rework!\n\nThis class rework also included changes to the Mage\'s subclasses. While other aspects of the Mage have changed a bunch since the rework, the core idea of each subclass and his staff have persisted. While this may seem similar to the Rogue changes in v0.2.0, the mage never required a second full rework.\n\nAround this time I was also starting to include substantial smaller tweaks in each update. Nowadays every update includes a large amount of smaller changes, but back in these earlier days this was a newer development.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V030_MAGE_CLOTH, 'Mage Rework!', ['_-_ No longer starts with knuckledusters or a wand\n_-_ Can no longer equip wands\n_-_ Now starts with a unique mages staff, empowered with magic missile to start.\n\n_-_ Battlemage reworked, staff now deals bonus effects when used as a melee weapon.\n\n_-_ Warlock reworked, gains more health and fullness from gaining exp, but food no longer restores hunger.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V030_DISINTEGRATION, 'Wand Rework!', ['Removed Wands:\nFlock, Blink, Teleportation, Avalanche\n\nReworked Wands:\nMagic Missile, Lightning, Disintegration,\nFireblast (was Firebolt), Venom (was Poison),\nFrost (was Slowing), Corruption (was Amok),\nBlast Wave (was Telekinesis), Regrowth\n\nNew Wands:\nPrismatic Light, Transfusion\n\n_-_ Wand types are now known by default.\n_-_ Wands now each have unique sprites.\n_-_ Wands now cap at 10 charges instead of 9\n_-_ Wands now recharge faster the more charges are missing.\n_-_ Self-targeting with wands is no longer possible.\n_-_ Wand recharge effects now give charge over time.\n_-_ Wands can now be cursed!']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V020_MISC, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'misc', []), ['New Artifacts:\n_-_ Ethereal Chains (replaces wand of blink)\n_-_ Lloyd\'s Beacon (replaces wand of teleportation)\n\nMisc. Balance Changes:\n_-_ Blessed Ankhs now revive at 1/4hp, but also grant initiative.\n_-_ Alchemist\'s Toolkit removed (will be reworked)\n_-_ Ring of Magic removed (will be reworked)\n_-_ Chalice of blood nerfed, now regens less hp at high levels.\n_-_ Cape of Thorns buffed, now absorbs all damage, but only deflects adjacent attacks.\n_-_ Sandals of nature adjusted, now give more seeds, less dew.\n_-_ Hunger no longer increases while fighting bosses.\n_-_ Floor 1 now spawns 10 rats, exactly enough to level up.\n_-_ Scrolls of recharging and mirror image now more common.\n_-_ Mimics are now less common, stronger, & give better loot.\n\nUI tweaks:\n_-_ New app icon!\n_-_ Shading added to main game interface\n_-_ Buffs now have descriptions, tap their icons!\n_-_ Visual indicator added for surprising enemies']));
  }
}

$J.define(v0_3_X_Changes, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_3_X_Changes', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_v0_3_X_Changes' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ChangesScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  ChangeButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeButton');
  ChangeIcons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeIcons');
  ChangeInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeInfo');
});
