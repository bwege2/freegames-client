// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndHero.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JString, Locale } from '../../../../../jre/index.ts';
import { WndTabbed } from './WndTabbed.ts';
import { Group } from '../../../watabou/noosa/Group.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Dungeon, SPDAction, Statistics, Messages, GameScene, PixelScene, HeroSprite, BuffIcon, BuffIndicator, IconButton, Icons, ScrollPane, StatusPane, TalentButton$Mode, TalentsPane, Window, DungeonSeed, IconTitle, WndHeroInfo, WndInfoBuff, WndKeyBindings, WndTabbed$IconTab, KeyBindings, Game;

export class WndHero extends WndTabbed {
  static readonly WIDTH: number = 120;
  static readonly HEIGHT: number = 120;
  stats: WndHero$StatsTab = null;
  talents_: WndHero$TalentsTab = null;
  buffs: WndHero$BuffsTab = null;
  static lastIdx: number = 0;
  _WndHero(): this {
    this._WndTabbed();
    this.resize(WndHero.WIDTH, WndHero.HEIGHT);
    this.stats = new WndHero$StatsTab().$o(this)._WndHero$StatsTab();
    this.add$Gizmo(this.stats);
    this.talents_ = new WndHero$TalentsTab().$o(this)._WndHero$TalentsTab();
    this.add$Gizmo(this.talents_);
    this.talents_.setRect(0, 0, Math.fround(WndHero.WIDTH), Math.fround(WndHero.HEIGHT));
    this.buffs = new WndHero$BuffsTab().$o(this)._WndHero$BuffsTab();
    this.add$Gizmo(this.buffs);
    this.buffs.setRect(0, 0, Math.fround(WndHero.WIDTH), Math.fround(WndHero.HEIGHT));
    this.buffs.setupList();
    this.add$Tab(new (WndHero$1())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.RANKINGS)));
    this.add$Tab(new (WndHero$2())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.TALENT)));
    this.add$Tab(new (WndHero$3())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.BUFFS)));
    this.layoutTabs();
    this.talents_.setRect(0, 0, Math.fround(WndHero.WIDTH), Math.fround(WndHero.HEIGHT));
    this.talents_.pane.scrollTo(0, Math.fround(this.talents_.pane.content().height() - this.talents_.pane.height()));
    this.talents_.layout();
    this.select$int(WndHero.lastIdx);
    return this;
  }
  onSignal(event: KeyEvent): boolean {
    if (event.pressed && KeyBindings.getActionForKey(event) === SPDAction.HERO_INFO) {
      this.onBackPressed();
      return true;
    } else {
      return super.onSignal(event);
    }
  }
  offset$int$int(xOffset: number, yOffset: number): void {
    super.offset$int$int(xOffset, yOffset);
    this.talents_.layout();
    this.buffs.layout();
  }
  static $clinit() {
    WndHero.lastIdx = 0;
  }
}

export class WndHero$StatsTab extends Group {
  static readonly GAP: number = 6;
  pos: number = 0;
  _WndHero$StatsTab(): this {
    this._Group();
    this.initialize();
    return this;
  }
  initialize(): void {
    for (const $it0 = this.members.iterator(); $it0.hasNext(); ) {
      let g = $it0.next();
      if (g != null) {
        g.destroy();
      }
    }
    this.clear();
    let hero = Dungeon.hero;
    let title = new IconTitle()._IconTitle$();
    title.icon(HeroSprite.avatar$Hero(hero));
    if ($J.equals(hero.name(), hero.className())) {
      title.label$String(Messages.get$Object$String$ObjectArr(this, 'title', [hero.lvl, hero.className()]).toUpperCase());
    } else {
      title.label$String((hero.name() + '\n' + Messages.get$Object$String$ObjectArr(this, 'title', [hero.lvl, hero.className()])).toUpperCase());
    }
    title.color(Window.TITLE_COLOR);
    title.setRect(0, 0, Math.fround((WndHero.WIDTH - 16) | 0), 0);
    this.add$Gizmo(title);
    let infoButton = new (WndHero$StatsTab$1())().$o(this).$c(hero)._IconButton$Image(Icons.get$Icons(Icons.INFO));
    infoButton.setRect(title.right(), 0, 16, 16);
    this.add$Gizmo(infoButton);
    this.pos = Math.fround(title.bottom() + Math.imul(2, WndHero$StatsTab.GAP));
    let strBonus = (hero.STR() - hero.STR_) | 0;
    if (strBonus > 0) {
      this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'str', []), hero.STR_ + ' + ' + strBonus);
    } else if (strBonus < 0) {
      this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'str', []), hero.STR_ + ' - ' + -strBonus);
    } else {
      this.statSlot$String$int$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'str', []), hero.STR());
    }
    if (hero.shielding() > 0) {
      this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'health', []), hero.HP + '+' + hero.shielding() + '/' + hero.HT);
    } else {
      this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'health', []), (hero.HP) + '/' + hero.HT);
    }
    this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'exp', []), hero.exp + '/' + hero.maxExp());
    this.pos = Math.fround(this.pos + WndHero$StatsTab.GAP);
    this.statSlot$String$int$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'gold', []), Statistics.goldCollected);
    this.statSlot$String$int$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'depth', []), Statistics.deepestFloor);
    if (Dungeon.daily) {
      if (!Dungeon.dailyReplay) {
        this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'daily_for', []), '_' + Dungeon.customSeedText + '_');
      } else {
        this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'replay_for', []), '_' + Dungeon.customSeedText + '_');
      }
    } else if (!(Dungeon.customSeedText.length === 0)) {
      this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'custom_seed', []), '_' + Dungeon.customSeedText + '_');
    } else {
      this.statSlot$String$String$WndHero_StatsTab(Messages.get$Object$String$ObjectArr(this, 'dungeon_seed', []), DungeonSeed.convertToCode(Dungeon.seed));
    }
    this.pos = Math.fround(this.pos + WndHero$StatsTab.GAP);
  }
  statSlot$String$String$WndHero_StatsTab(label: string, value: string): void {
    let size = 8;
    let txt: RenderedTextBlock;
    do {
      txt = PixelScene.renderTextBlock$String$int(label, size);
      size--;
    } while (txt.width() >= Math.fround(WndHero.WIDTH * Math.fround(0.55)));
    txt.setPos(0, Math.fround(this.pos + Math.fround((Math.fround(6 - txt.height())) / 2)));
    PixelScene.align$Component(txt);
    this.add$Gizmo(txt);
    size = 8;
    do {
      txt = PixelScene.renderTextBlock$String$int(value, size);
      size--;
    } while (txt.width() >= Math.fround(WndHero.WIDTH * Math.fround(0.45)));
    txt.setPos(Math.fround(WndHero.WIDTH * Math.fround(0.55)), Math.fround(this.pos + Math.fround((Math.fround(6 - txt.height())) / 2)));
    PixelScene.align$Component(txt);
    this.add$Gizmo(txt);
    this.pos = Math.fround(this.pos + Math.fround(WndHero$StatsTab.GAP + txt.height()));
  }
  statSlot$String$int$WndHero_StatsTab(label: string, value: number): void {
    this.statSlot$String$String$WndHero_StatsTab(label, String(value));
  }
  height(): number {
    return this.pos;
  }
}

export class WndHero$TalentsTab extends Component {
  pane: TalentsPane = null;
  _WndHero$TalentsTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.pane = new TalentsPane()._TalentsPane$Mode(TalentButton$Mode.UPGRADE);
    this.add$Gizmo(this.pane);
  }
  layout(): void {
    super.layout();
    this.pane.setRect(this.x, this.y, this.width_, this.height_);
  }
}

export class WndHero$BuffsTab extends Component {
  static readonly GAP: number = 2;
  pos: number = 0;
  buffList: ScrollPane = null;
  slots: ArrayList<WndHero$BuffsTab$BuffSlot> = null;
  _WndHero$BuffsTab(): this {
    this._Component();
    this.slots = new ArrayList();
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.buffList = new (WndHero$BuffsTab$1())().$o(this)._ScrollPane(new Component()._Component());
    this.add$Gizmo(this.buffList);
  }
  layout(): void {
    super.layout();
    this.buffList.setRect(0, 0, this.width_, this.height_);
  }
  setupList(): void {
    let content = this.buffList.content();
    for (const $it1 = Dungeon.hero.buffs$().iterator(); $it1.hasNext(); ) {
      let buff = $it1.next();
      if (buff.icon() !== BuffIndicator.NONE) {
        let slot = new WndHero$BuffsTab$BuffSlot().$o(this)._WndHero$BuffsTab$BuffSlot(buff);
        slot.setRect(0, this.pos, Math.fround(WndHero.WIDTH), slot.icon_.height());
        content.add$Gizmo(slot);
        this.slots.add(slot);
        this.pos = Math.fround(this.pos + Math.fround(WndHero$BuffsTab.GAP + slot.height()));
      }
    }
    content.setSize(this.buffList.width(), this.pos);
    this.buffList.setSize(this.buffList.width(), this.buffList.height());
  }
}

export class WndHero$BuffsTab$BuffSlot extends Component {
  buff_: Buff = null;
  icon_: Image = null;
  txt: RenderedTextBlock = null;
  _WndHero$BuffsTab$BuffSlot(buff: Buff): this {
    this._Component();
    this.buff_ = buff;
    this.icon_ = new BuffIcon()._BuffIcon$Buff$boolean(buff, true);
    this.icon_.y = this.y;
    this.add$Gizmo(this.icon_);
    this.txt = PixelScene.renderTextBlock$String$int(Messages.titleCase(buff.name()), 8);
    this.txt.setPos(Math.fround(this.icon_.width_ + WndHero$BuffsTab.GAP), Math.fround(this.y + Math.fround((Math.fround(this.icon_.height_ - this.txt.height())) / 2)));
    PixelScene.align$Component(this.txt);
    this.add$Gizmo(this.txt);
    return this;
  }
  layout(): void {
    super.layout();
    this.icon_.y = this.y;
    this.txt.maxWidth$int($J.d2i((Math.fround(this.width_ - this.icon_.width()))));
    this.txt.setPos(Math.fround(this.icon_.width_ + WndHero$BuffsTab.GAP), Math.fround(this.y + Math.fround((Math.fround(this.icon_.height_ - this.txt.height())) / 2)));
    PixelScene.align$Component(this.txt);
  }
  onClick(x: number, y: number): boolean {
    if (this.inside(x, y)) {
      GameScene.show(new WndInfoBuff()._WndInfoBuff(this.buff_));
      return true;
    } else {
      return false;
    }
  }
}

let $WndHero$1: any = null;
/** An anonymous class (WndHero.java:84). */
function WndHero$1(): any {
  return $WndHero$1 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      if (this.selected) {
        WndHero.lastIdx = 0;
        if (!this.$outer.stats.visible_) {
          this.$outer.stats.initialize();
        }
      }
      this.$outer.stats.visible_ = this.$outer.stats.active = this.selected;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$1', []);
}

let $WndHero$2: any = null;
/** An anonymous class (WndHero.java:96). */
function WndHero$2(): any {
  return $WndHero$2 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      if (this.selected) {
        WndHero.lastIdx = 1;
      }
      if (this.selected) {
        StatusPane.talentBlink = 0;
      }
      this.$outer.talents_.visible_ = this.$outer.talents_.active = this.selected;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$2', []);
}

let $WndHero$3: any = null;
/** An anonymous class (WndHero.java:104). */
function WndHero$3(): any {
  return $WndHero$3 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      if (this.selected) {
        WndHero.lastIdx = 2;
      }
      this.$outer.buffs.visible_ = this.$outer.buffs.active = this.selected;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$3', []);
}

let $WndHero$StatsTab$1: any = null;
/** An anonymous class (WndHero.java:167). */
function WndHero$StatsTab$1(): any {
  return $WndHero$StatsTab$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      if (Game.scene() instanceof GameScene) {
        GameScene.show(new WndHeroInfo()._WndHeroInfo(this.$cv_hero.heroClass));
      } else {
        Game.scene().addToFront(new WndHeroInfo()._WndHeroInfo(this.$cv_hero.heroClass));
      }
    }
    hoverText(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'hero_info', []));
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$StatsTab$1', []);
}

let $WndHero$BuffsTab$1: any = null;
/** An anonymous class (WndHero.java:281). */
function WndHero$BuffsTab$1(): any {
  return $WndHero$BuffsTab$1 ??= $J.local(class extends ScrollPane {
    onClick(x: number, y: number): void {
      let size = this.$outer.slots.size();
      for (let i = 0; i < size; i++) {
        if (this.$outer.slots.get(i).onClick(x, y)) {
          break;
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$BuffsTab$1', []);
}

$J.define(WndHero, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', ctors: { '': '_WndHero' }, meths: { 'offset(int,int)': 'offset$int$int' }, clinit: true, lazy: ['lastIdx'] });
$J.define(WndHero$StatsTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$StatsTab', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_WndHero$StatsTab' }, meths: { 'statSlot(java.lang.String,int)': 'statSlot$String$int$WndHero_StatsTab', 'statSlot(java.lang.String,java.lang.String)': 'statSlot$String$String$WndHero_StatsTab' }, inner: true });
$J.define(WndHero$TalentsTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$TalentsTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndHero$TalentsTab' }, inner: true });
$J.define(WndHero$BuffsTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$BuffsTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndHero$BuffsTab' }, inner: true });
$J.define(WndHero$BuffsTab$BuffSlot, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero$BuffsTab$BuffSlot', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff': '_WndHero$BuffsTab$BuffSlot' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  BuffIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIcon');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ScrollPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane');
  StatusPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane');
  TalentButton$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode');
  TalentsPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  DungeonSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndHeroInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo');
  WndInfoBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoBuff');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  WndTabbed$IconTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$IconTab');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  Game = $J.load('com.watabou.noosa.Game');
});
