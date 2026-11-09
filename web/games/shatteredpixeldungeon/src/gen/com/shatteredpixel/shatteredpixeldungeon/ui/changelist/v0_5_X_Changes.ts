// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_5_X_Changes.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class v0_5_X_Changes extends JObject {
  _v0_5_X_Changes(): this {
    return this;
  }
  static addAllChanges(changeInfos: ArrayList<ChangeInfo>): void {
    v0_5_X_Changes.add_v0_5_0_Changes(changeInfos);
  }
  static add_v0_5_0_Changes(changeInfos: ArrayList<ChangeInfo>): void {
    let changes = new ChangeInfo()._ChangeInfo('v0.5.0', true, '');
    changes.hardlight(Window.TITLE_COLOR);
    changeInfos.add(changes);
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V021_SHPX, 'Developer Commentary', ['_-_ Released February 8th, 2017\n_-_ 115 days after Shattered v0.4.3\n_-_ 233 days after Shattered v0.4.0\n\nv0.5.0 was the first major update that didn\'t focus on a category of items, instead it was all about the game\'s visuals! This visual overhaul was a very important update for Shattered, as it created an immediate visual difference between it and the original Pixel Dungeon. At this stage Shattered was starting to become less of an addition to Pixel Dungeon and more of its own game in the same spirit. Having an updated set of graphics really helped sell people on this idea.\n\nv0.5.0 was also Shattered\'s longest-developed update yet. While I don\'t think there was much I could do about this for v0.5.0 and v0.6.0, it started an unfortunate trend of major updates taking up to half a year! I eventually broke this trend in v0.9.0 by splitting these larger updates into smaller parts.']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V050_STAIRS, 'New Dungeon Visual Style!', ['_-_ Walls and some terrain now have depth\n_-_ Characters & items are raised & cast shadows\n_-_ Added a visible tile grid in the settings menu']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V050_QUARTERSTAFF, 'Equipment Balance Changes', ['_-_ Quarterstaff armor bonus increased from 2 to 3\n\n_-_ Wand of Frost damage against chilled enemies reduced from -7.5% per turn of chill to -10%\n\n_-_ Wand of Transfusion self-damage reduced from 15% max hp to 10% max hp per zap\n\n_-_ Dried Rose charges 20% faster and the ghost hero is stronger, especially at low levels']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V040_STYLUS, 'Glyph Balance Changes', ['_-_ Glyph of Entanglement activates less often but grants significantly more herbal armor\n\n_-_ Glyph of Stone armor bonus reduced from 2+level to 0+level\n\n_-_ Glyph of Antimagic magical damage resist reduced from 50% of armor to 33% of armor\n\n_-_ Glyph of Viscosity damage rate increased from 10% of deferred damage to 15%']));
    changes.addButton(new ChangeButton()._ChangeButton$ChangeIcons$String$StringArr(ChangeIcons.V034_TRANSLATIONS, Messages.get$Class$String$ObjectArr($J.cls(ChangesScene), 'language', []), ['_-_ Added new Language: Esperanto\n_-_ Added new Language: Indonesian\n']));
  }
}

$J.define(v0_5_X_Changes, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_5_X_Changes', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_v0_5_X_Changes' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ChangesScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  ChangeButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeButton');
  ChangeIcons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeIcons');
  ChangeInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeInfo');
});
