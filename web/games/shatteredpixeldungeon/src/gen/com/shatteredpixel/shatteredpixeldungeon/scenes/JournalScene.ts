// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/JournalScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';

let Assets$Music, Badges, Chrome, Chrome$Type, Dungeon, ShatteredPixelDungeon, Potion, Ring, Scroll, Journal, Messages, TitleScene, ItemSprite, ItemSpriteSheet, TerrainFeaturesTilemap, ExitButton, Icons, StyledButton, TitleBackground, IconTitle, WndJournal$AlchemyTab, WndJournal$BadgesTab, WndJournal$CatalogTab, WndJournal$GuideTab, Camera, Music, SparseArray;

export class JournalScene extends PixelScene {
  static readonly WIDTH_P: number = 126;
  static readonly WIDTH_L: number = 216;
  static lastIDX: number = 0;
  _JournalScene(): this {
    this._PixelScene();
    return this;
  }
  create(): void {
    super.create();
    Dungeon.hero = null;
    Badges.loadGlobal();
    Journal.loadGlobal();
    Potion.clearColors();
    Scroll.clearLabels();
    Ring.clearGems();
    new TerrainFeaturesTilemap()._TerrainFeaturesTilemap(new SparseArray()._SparseArray(), new SparseArray()._SparseArray());
    Music.INSTANCE.playTracks([Assets$Music.THEME_1, Assets$Music.THEME_2], [1, 1], false);
    PixelScene.uiCamera.visible_ = false;
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let top = 20;
    let title = new IconTitle()._IconTitle$Image$String(Icons.JOURNAL.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setSize(200, 0);
    title.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - title.reqWidth())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(top - title.height())) / 2)));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    let panel = Chrome.get(Chrome$Type.TOAST);
    let pw = ((PixelScene.landscape() ? JournalScene.WIDTH_L : JournalScene.WIDTH_P) + panel.marginHor()) | 0;
    let ph = (h - 50 + panel.marginVer()) | 0;
    panel.size(Math.fround(pw), Math.fround(ph));
    panel.x = Math.fround(insets.left_ + Math.fround(((w - pw) | 0) / 2));
    panel.y = Math.fround(insets.top_ + top);
    this.add$Gizmo(panel);
    {
      let badges: WndJournal$BadgesTab, catalog: WndJournal$CatalogTab, guidebook: WndJournal$GuideTab, alchemy: WndJournal$AlchemyTab;
      switch (JournalScene.lastIDX) {
        case 0:
        default:
          badges = new WndJournal$BadgesTab()._WndJournal$BadgesTab();
          this.add$Gizmo(badges);
          badges.setRect(Math.fround(panel.x + panel.marginLeft()), Math.fround(panel.y + panel.marginTop()), Math.fround(panel.width() - panel.marginHor()), Math.fround(panel.height() - panel.marginVer()));
          break;
        case 1:
          catalog = new WndJournal$CatalogTab()._WndJournal$CatalogTab();
          this.add$Gizmo(catalog);
          catalog.setRect(Math.fround(panel.x + panel.marginLeft()), Math.fround(panel.y + panel.marginTop()), Math.fround(panel.width() - panel.marginHor()), Math.fround(panel.height() - panel.marginVer()));
          catalog.updateList();
          break;
        case 2:
          guidebook = new WndJournal$GuideTab()._WndJournal$GuideTab();
          this.add$Gizmo(guidebook);
          guidebook.setRect(Math.fround(panel.x + panel.marginLeft()), Math.fround(panel.y + panel.marginTop()), Math.fround(panel.width() - panel.marginHor()), Math.fround(panel.height() - panel.marginVer()));
          guidebook.updateList();
          break;
        case 3:
          alchemy = new WndJournal$AlchemyTab()._WndJournal$AlchemyTab();
          this.add$Gizmo(alchemy);
          alchemy.setRect(Math.fround(panel.x + panel.marginLeft()), Math.fround(panel.y + panel.marginTop()), Math.fround(panel.width() - panel.marginHor()), Math.fround(panel.height() - panel.marginVer()));
          break;
      }
    }
    let btnBadges = new (JournalScene$1())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, '');
    btnBadges.icon$Image(Icons.BADGES.get());
    btnBadges.setRect(panel.x, Math.fround(Math.fround(panel.y + ph) - 3), Math.fround(Math.fround(pw / 4) + 1.5), Math.fround(JournalScene.lastIDX === 0 ? 25 : 20));
    PixelScene.align$Component(btnBadges);
    if (JournalScene.lastIDX !== 0) {
      btnBadges.icon$().brightness(Math.fround(0.6));
    }
    this.addToBack(btnBadges);
    let btnCatalog = new (JournalScene$2())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, '');
    btnCatalog.icon$Image(Icons.CATALOG.get());
    btnCatalog.setRect(Math.fround(btnBadges.right() - 2), btnBadges.top(), Math.fround(Math.fround(pw / 4) + 1.5), Math.fround(JournalScene.lastIDX === 1 ? 25 : 20));
    PixelScene.align$Component(btnCatalog);
    if (JournalScene.lastIDX !== 1) {
      btnCatalog.icon$().brightness(Math.fround(0.6));
    }
    this.addToBack(btnCatalog);
    let btnGuide = new (JournalScene$3())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, '');
    btnGuide.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.MASTERY));
    btnGuide.setRect(Math.fround(btnCatalog.right() - 2), btnBadges.top(), Math.fround(Math.fround(pw / 4) + 1.5), Math.fround(JournalScene.lastIDX === 2 ? 25 : 20));
    PixelScene.align$Component(btnGuide);
    if (JournalScene.lastIDX !== 2) {
      btnGuide.icon$().brightness(Math.fround(0.6));
    }
    this.addToBack(btnGuide);
    let btnAlchemy = new (JournalScene$4())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, '');
    btnAlchemy.icon$Image(Icons.ALCHEMY.get());
    btnAlchemy.setRect(Math.fround(btnGuide.right() - 2), btnBadges.top(), Math.fround(Math.fround(pw / 4) + 1.5), Math.fround(JournalScene.lastIDX === 3 ? 25 : 20));
    PixelScene.align$Component(btnAlchemy);
    if (JournalScene.lastIDX !== 3) {
      btnAlchemy.icon$().brightness(Math.fround(0.6));
    }
    this.addToBack(btnAlchemy);
    this.addToBack(BG);
    let btnExit = new ExitButton()._ExitButton();
    btnExit.setPos(Math.fround(Math.fround(insets.left_ + w) - btnExit.width()), insets.top_);
    this.add$Gizmo(btnExit);
    this.fadeIn$();
  }
  destroy(): void {
    Badges.saveGlobal$();
    super.destroy();
  }
  onBackPressed(): void {
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
  }
  static $clinit() {
    JournalScene.lastIDX = 0;
  }
}

let $JournalScene$1: any = null;
/** An anonymous class (JournalScene.java:149). */
function JournalScene$1(): any {
  return $JournalScene$1 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (JournalScene.lastIDX !== 0) {
        JournalScene.lastIDX = 0;
      }
      ShatteredPixelDungeon.seamlessResetScene$();
      super.onClick();
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndJournal$BadgesTab), 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.JournalScene$1', []);
}

let $JournalScene$2: any = null;
/** An anonymous class (JournalScene.java:170). */
function JournalScene$2(): any {
  return $JournalScene$2 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (JournalScene.lastIDX !== 1) {
        JournalScene.lastIDX = 1;
      }
      ShatteredPixelDungeon.seamlessResetScene$();
      super.onClick();
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.JournalScene$2', []);
}

let $JournalScene$3: any = null;
/** An anonymous class (JournalScene.java:190). */
function JournalScene$3(): any {
  return $JournalScene$3 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (JournalScene.lastIDX !== 2) {
        JournalScene.lastIDX = 2;
      }
      ShatteredPixelDungeon.seamlessResetScene$();
      super.onClick();
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndJournal$GuideTab), 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.JournalScene$3', []);
}

let $JournalScene$4: any = null;
/** An anonymous class (JournalScene.java:210). */
function JournalScene$4(): any {
  return $JournalScene$4 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (JournalScene.lastIDX !== 3) {
        JournalScene.lastIDX = 3;
      }
      ShatteredPixelDungeon.seamlessResetScene$();
      super.onClick();
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndJournal$AlchemyTab), 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.JournalScene$4', []);
}

$J.define(JournalScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.JournalScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_JournalScene' }, clinit: true, lazy: ['lastIDX'] });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  TerrainFeaturesTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.TerrainFeaturesTilemap');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndJournal$AlchemyTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$AlchemyTab');
  WndJournal$BadgesTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$BadgesTab');
  WndJournal$CatalogTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$CatalogTab');
  WndJournal$GuideTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$GuideTab');
  Camera = $J.load('com.watabou.noosa.Camera');
  Music = $J.load('com.watabou.noosa.audio.Music');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
