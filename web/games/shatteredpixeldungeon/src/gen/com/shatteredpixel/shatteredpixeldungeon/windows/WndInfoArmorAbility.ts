// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoArmorAbility.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { WndTitledMessage } from './WndTitledMessage.ts';

let Talent, Ratmogrify, Messages, HeroIcon, TalentButton$Mode, TalentsPane$TalentTierPane, WndHeroInfo;

export class WndInfoArmorAbility extends WndTitledMessage {
  _WndInfoArmorAbility(cls: HeroClass, ability: ArmorAbility): this {
    this._WndTitledMessage$Image$String$String(new HeroIcon()._HeroIcon$ArmorAbility(ability), Messages.titleCase(ability.name()), ability.desc());
    let talentList = new ArrayList();
    Talent.initArmorTalents$ArmorAbility$ArrayList(ability, talentList);
    Ratmogrify.useRatroicEnergy = ability instanceof Ratmogrify;
    let talentPane = new TalentsPane$TalentTierPane()._TalentsPane$TalentTierPane(talentList.get(3), 4, TalentButton$Mode.INFO);
    talentPane.title_.text$String(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndHeroInfo), 'talents', [])));
    talentPane.setRect(0, Math.fround((this.height_ + 5) | 0), Math.fround(this.width_), talentPane.height());
    this.add$Gizmo(talentPane);
    this.resize(this.width_, $J.d2i(talentPane.bottom()));
    return this;
  }
  targetHeight(): number {
    return Math.fround(super.targetHeight() - 40);
  }
}

$J.define(WndInfoArmorAbility, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoArmorAbility', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass,com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility': '_WndInfoArmorAbility' } });
$J.module(() => {
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  TalentButton$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode');
  TalentsPane$TalentTierPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane$TalentTierPane');
  WndHeroInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo');
});
