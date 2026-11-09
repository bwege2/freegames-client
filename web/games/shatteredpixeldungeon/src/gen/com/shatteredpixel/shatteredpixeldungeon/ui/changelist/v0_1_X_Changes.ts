// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_1_X_Changes.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Window, ChangeButton, ChangeIcons, ChangeInfo;

export class v0_1_X_Changes extends JObject {
  _v0_1_X_Changes(): this {
    return this;
  }
  static addAllChanges(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.1.X', true, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    v0_1_X_Changes.add_v0_1_1_Changes(changeInfos);
    v0_1_X_Changes.add_v0_1_0_Changes(changeInfos);
  }
  static add_v0_1_1_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.1.1', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V010_SHPX, 'Developer Commentary', ['_-_ Released August 15th, 2014\n_-_ 10 days after Shattered v0.1.0\n\nv0.1.1 was the first update that added new content! I added new ankh functionality and a new type of food based on suggestions and feedback from v0.1.0.\n\nThis update also included Shattered\'s first contentious change: I removed the automatic revival feature from the dew vial. This led to many accidental deaths for players who were used to the automatic revive from Pixel Dungeon. I kept receiving complaints about it years later!\n\nThese early updates were much smaller and less polished compared to more modern ones, which meant I released them much faster. I eventually shifted towards slower updates with more size and quality.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V011_BLANDFRUIT, 'Blandfruit', ['Players who chance upon gardens or who get lucky while trampling grass may come across a new plant: the _Blandfruit._\n\nAs the name implies, the fruit from this plant is pretty unexceptional, and will barely do anything for you on its own. Perhaps there is some way to prepare the fruit with another ingredient...']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V011_ANKH, 'Revival Item Changes', ['When the Dew Vial was initially added to Pixel Dungeon, its essentially free revive made ankhs pretty useless by comparison. To fix this, both items have been adjusted to combine to create a more powerful revive.\n\nDew Vial nerfed:\n_-_ Still grants a full heal at full charge, but grants less healing at partial charge.\n_-_ No longer revives the player if they die.\n\nAnkh buffed:\n_-_ Can now be blessed with a full dew vial, to gain the vial\'s old revive effect.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V011_SCROLL_LAGUZ, 'Misc Item Changes', ['Sungrass buffed:\n_-_ Heal scaling now scales with max hp.\n\nScroll of Psionic Blast rebalanced:\n_-_ Now deals less self damage, and damage is more consistent.\n_-_ Duration of self stun/blind effect increased.\n\nScroll of lullaby reworked:\n_-_ No longer instantly sleeps enemies, now afflicts them with drowsy, which turns into magical sleep.\n_-_ Magically slept enemies will only wake up when attacked.\n_-_ Hero is also affected, and will be healed by magical sleep.']));
  }
  static add_v0_1_0_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.1.0', false, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V010_SHPX, 'Developer Commentary', ['_-_ Released August 5th, 2014\n_-_ 9 days after Pixel Dungeon source release\n_-_ 69 days after Pixel Dungeon v1.7.1\n\nv0.1.0 and v0.1.1 were extremely early Shattered updates that were only distributed via the Pixel Dungeon Subreddit. At this stage of development Shattered was basically the same game as Pixel Dungeon v1.7.1.\n\nI started playing Pixel Dungeon in mid 2013. I loved the game but was frustrated with the balance of some items. When Pixel Dungeon went open source I decided to make Shattered as a balance modification. I called it Shattered as \'Shattered Pixel\' was an old trade name I had, and the mod was going to \'shatter\' Pixel Dungeon\'s balance.\n\nAt the time I didn\'t have any plans to add new content, I thought I was just going to spend a couple months rebalancing the game and that was it!']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V010_EARTHROOT, 'Seed Changes', ['_-_ Blindweed buffed, now cripples as well as blinds.\n\n_-_ Sungrass nerfed, heal scales up over time, total heal reduced by combat.\n\n_-_ Earthroot nerfed, damage absorb down to 50% from 100%, total shield unchanged.\n\n_-_ Icecap buffed, freeze effect is now much stronger in water.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V010_POTION_SILVER, 'Potion Changes', ['_-_ Potion of Purity buffed, immunity duration increased to 10 turns from 5, clear effect radius increased.\n\n_-_ Potion of Frost buffed, freeze effect is now much stronger in water.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V010_SCROLL_BERKANAN, 'Scroll Changes', ['_-_ Scroll of Psionic blast reworked, now rarer and much stronger, but deals damage to the hero.\n\n_-_ Scroll of Challenge renamed to Scroll of Rage, now amoks nearby enemies.']));
  }
}

$J.define(v0_1_X_Changes, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_1_X_Changes', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_v0_1_X_Changes' } });
$J.module(() => {
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  ChangeButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeButton');
  ChangeIcons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeIcons');
  ChangeInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeInfo');
});
