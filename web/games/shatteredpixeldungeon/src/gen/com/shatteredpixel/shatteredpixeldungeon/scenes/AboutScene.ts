// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/AboutScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Flare, TitleScene, ExitButton, Icons, RenderedTextBlock, ScrollPane, TitleBackground, Window, Camera, ColorBlock, Game, PointerArea;

export class AboutScene extends PixelScene {
  _AboutScene(): this {
    this._PixelScene();
    return this;
  }
  create(): void {
    super.create();
    let colWidth = Math.fround(PixelScene.landscape() ? 120 : 130);
    let fullWidth = Math.fround(colWidth * (PixelScene.landscape() ? 2 : 1));
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    this.add$Gizmo(BG);
    this.add$Gizmo(new ColorBlock()._ColorBlock(Math.fround(w), Math.fround(h), 1140850688));
    let list = new ScrollPane()._ScrollPane(new Component()._Component());
    this.add$Gizmo(list);
    let content = list.content();
    content.clear();
    let shpx = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(true, Window.SHPX_COLOR, 'Shattered Pixel Dungeon', Icons.SHPX.get(), 'Developed by: _Evan Debenham_\nBased on Pixel Dungeon\'s open source', 'ShatteredPixel.com', 'https://ShatteredPixel.com');
    if (PixelScene.landscape()) {
      shpx.setRect(Math.fround(Math.fround((Math.fround(w - fullWidth)) / 2) - 6), Math.fround(insets.top_ + 26), 120, 0);
    } else {
      shpx.setRect(Math.fround((Math.fround(w - fullWidth)) / 2), Math.fround(insets.top_ + 6), 120, 0);
    }
    content.add$Gizmo(shpx);
    let aleks = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, Window.SHPX_COLOR, 'Splash & Dungeon Art:', Icons.ALEKS.get(), 'Aleksandar Komitov', 'alekskomitov.com', 'https://www.alekskomitov.com/');
    aleks.setSize(Math.fround(colWidth / 2), 0);
    if (PixelScene.landscape()) {
      aleks.setPos(shpx.right(), Math.fround(insets.top_ + 6));
    } else {
      aleks.setPos(Math.fround(Math.fround(w / 2) - Math.fround(colWidth / 2)), Math.fround(shpx.bottom() + 6));
    }
    content.add$Gizmo(aleks);
    let lumine = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, Window.SHPX_COLOR, 'Composer:', Icons.LUMINE.get(), 'Lumine Haaristo', 'youtube.com/@Lumine...', 'https://www.youtube.com/@LumineThomasHaaristo');
    lumine.setRect(aleks.right(), aleks.top(), Math.fround(colWidth / 2), 0);
    content.add$Gizmo(lumine);
    let pumpkin = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, Window.SHPX_COLOR, 'Item Pixel Art:', Icons.PUMPKINVOLT.get(), 'PumpkinVolt', null, null);
    pumpkin.setSize(Math.fround(colWidth / 2), 0);
    pumpkin.setRect(aleks.left(), Math.fround(aleks.bottom() + 6), Math.fround(colWidth / 2), 0);
    content.add$Gizmo(pumpkin);
    let celesti = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, Window.SHPX_COLOR, 'Sound Effects:', Icons.CELESTI.get(), 'Celesti', 'celesti-whispers.itch.io', 'https://celesti-whispers.itch.io/');
    celesti.setRect(pumpkin.right(), pumpkin.top(), Math.fround(colWidth / 2), 0);
    content.add$Gizmo(celesti);
    let alastair = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, Window.SHPX_COLOR, 'Additional Pixel Art:', Icons.ALASTAIR.get(), 'Alastair Braun', null, null);
    alastair.setSize(Math.fround(colWidth / 2), 0);
    alastair.setRect(pumpkin.left(), Math.fround(celesti.bottom() + 6), Math.fround(colWidth / 2), 0);
    content.add$Gizmo(alastair);
    let WATA_COLOR = 5614335;
    let wata = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(true, WATA_COLOR, 'Pixel Dungeon', Icons.WATA.get(), 'Developed by: _Watabou_\nInspired by Brian Walker\'s Brogue', 'watabou.itch.io', 'https://watabou.itch.io/');
    if (PixelScene.landscape()) {
      wata.setRect(shpx.left(), Math.fround(alastair.bottom() + 8), colWidth, 0);
    } else {
      wata.setRect(shpx.left(), Math.fround(alastair.bottom() + 8), colWidth, 0);
    }
    content.add$Gizmo(wata);
    this.addLine(Math.fround(wata.top() - 4), content);
    let cube = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, WATA_COLOR, 'Music:', Icons.CUBE_CODE.get(), 'Cube Code', null, null);
    cube.setSize(Math.fround(colWidth / 2), 0);
    if (PixelScene.landscape()) {
      cube.setPos(Math.fround(wata.right() + Math.fround(colWidth / 4)), Math.fround(wata.top() + Math.fround((Math.fround(wata.height() - cube.height())) / 2)));
    } else {
      cube.setPos(Math.fround(aleks.left() + Math.fround(colWidth / 4)), Math.fround(wata.bottom() + 6));
    }
    content.add$Gizmo(cube);
    let GDX_COLOR = 14961980;
    let gdx = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(true, GDX_COLOR, 'libGDX', Icons.LIBGDX.get(), 'ShatteredPD is powered by _libGDX_!', 'libgdx.com', 'https://libgdx.com/');
    if (PixelScene.landscape()) {
      gdx.setRect(wata.left(), Math.fround(wata.bottom() + 8), colWidth, 0);
    } else {
      gdx.setRect(wata.left(), Math.fround(cube.bottom() + 8), colWidth, 0);
    }
    content.add$Gizmo(gdx);
    this.addLine(Math.fround(gdx.top() - 4), content);
    let arcnor = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, GDX_COLOR, 'Pixel Dungeon GDX:', Icons.ARCNOR.get(), 'Edu García', 'gamedev.place/@arcnor', 'https://mastodon.gamedev.place/@arcnor');
    arcnor.setSize(Math.fround(colWidth / 2), 0);
    if (PixelScene.landscape()) {
      arcnor.setPos(gdx.right(), Math.fround(gdx.top() + Math.fround((Math.fround(gdx.height() - arcnor.height())) / 2)));
    } else {
      arcnor.setPos(aleks.left(), Math.fround(gdx.bottom() + 6));
    }
    content.add$Gizmo(arcnor);
    let purigro = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(false, GDX_COLOR, 'Shattered GDX Help:', Icons.PURIGRO.get(), 'Kevin MacMartin', 'github.com/prurigro', 'https://github.com/prurigro/');
    purigro.setRect(Math.fround(arcnor.right() + 2), arcnor.top(), Math.fround(colWidth / 2), 0);
    content.add$Gizmo(purigro);
    let transifex = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(true, Window.TITLE_COLOR, null, null, 'ShatteredPD is community-translated via _Transifex_! Thank you so much to all of Shattered\'s volunteer translators!', 'transifex.com/shattered-pixel/...', 'https://explore.transifex.com/shattered-pixel/shattered-pixel-dungeon/');
    transifex.setRect(Math.fround((Math.fround(Camera.main.width_ - colWidth)) / 2), Math.fround(purigro.bottom() + 12), colWidth, 0);
    content.add$Gizmo(transifex);
    this.addLine(Math.fround(transifex.top() - 4), content);
    this.addLine(Math.fround(transifex.bottom() + 4), content);
    let freesound = new AboutScene$CreditsBlock()._AboutScene$CreditsBlock(true, Window.TITLE_COLOR, null, null, 'Shattered Pixel Dungeon uses the following sound samples from _freesound.org_:\n\nCreative Commons Attribution License:\n_SFX ATTACK SWORD 001.wav_ by _JoelAudio_\n_Pack: Slingshots and Longbows_ by _saturdaysoundguy_\n_Cracking/Crunching, A.wav_ by _InspectorJ_\n_Extracting a sword.mp3_ by _Taira Komori_\n_Pack: Uni Sound Library_ by _timmy h123_\n\nCreative Commons Zero License:\n_Pack: Movie Foley: Swords_ by _Black Snow_\n_machine gun shot 2.flac_ by _qubodup_\n_m240h machine gun burst 4.flac_ by _qubodup_\n_Pack: Onomatopoeia_ by _Adam N_\n_Pack: Watermelon_ by _lolamadeus_\n_metal chain_ by _Mediapaja2009_\n_Pack: Sword Clashes Pack_ by _JohnBuhr_\n_Pack: Metal Clangs and Pings_ by _wilhellboy_\n_Pack: Stabbing Stomachs & Crushing Skulls_ by _TheFilmLook_\n_Sheep bleating_ by _zachrau_\n_Lemon,Juicy,Squeeze,Fruit.wav_ by _Filipe Chagas_\n_Lemon,Squeeze,Squishy,Fruit.wav_ by _Filipe Chagas_', 'freesound.org', 'https://www.freesound.org');
    freesound.setRect(Math.fround(transifex.left() - 10), Math.fround(transifex.bottom() + 8), Math.fround(colWidth + 20), 0);
    content.add$Gizmo(freesound);
    content.setSize(fullWidth, Math.fround(Math.fround(freesound.bottom() + 10) + insets.bottom_));
    list.setRect(0, 0, Math.fround(w), Math.fround(h));
    list.scrollTo(0, 0);
    let btnExit = new ExitButton()._ExitButton();
    let ofs = PixelScene.landscape() ? 0 : 4;
    btnExit.setPos(Math.fround(Math.fround(Camera.main.width_ - btnExit.width()) - ofs), Math.fround(ofs));
    this.add$Gizmo(btnExit);
  }
  onBackPressed(): void {
    Game.switchScene$Class($J.cls(TitleScene));
  }
  addLine(y: number, content: Group): void {
    let line = new ColorBlock()._ColorBlock(Math.fround(Camera.main.width_), 1, -13421773);
    line.y = y;
    content.add$Gizmo(line);
  }
}

export class AboutScene$CreditsBlock extends Component {
  large: boolean = false;
  title_: RenderedTextBlock = null;
  avatar: Image = null;
  flare: Flare = null;
  body: RenderedTextBlock = null;
  link_: RenderedTextBlock = null;
  linkUnderline: ColorBlock = null;
  linkButton: PointerArea = null;
  _AboutScene$CreditsBlock(large: boolean, highlight: number, title: string, avatar: Image, body: string, linkText: string, linkUrl: string): this {
    this._Component();
    this.large = large;
    if (title != null) {
      this.title_ = PixelScene.renderTextBlock$String$int(title, large ? 8 : 6);
      if (highlight !== -1) {
        this.title_.hardlight(highlight);
      }
      this.add$Gizmo(this.title_);
    }
    if (avatar != null) {
      this.avatar = avatar;
      this.add$Gizmo(this.avatar);
    }
    if (large && highlight !== -1 && this.avatar != null) {
      this.flare = new Flare()._Flare(7, 24).color$int$boolean(highlight, true).show$Visual$float(this.avatar, 0);
      this.flare.angularSpeed = 20;
    }
    this.body = PixelScene.renderTextBlock$String$int(body, 6);
    if (highlight !== -1) {
      this.body.setHightlighting$boolean$int(true, highlight);
    }
    if (large) {
      this.body.align(RenderedTextBlock.CENTER_ALIGN);
    }
    this.add$Gizmo(this.body);
    if (linkText != null && linkUrl != null) {
      let color = -1;
      if (highlight !== -1) {
        color = -16777216 | highlight;
      }
      this.linkUnderline = new ColorBlock()._ColorBlock(1, 1, color);
      this.add$Gizmo(this.linkUnderline);
      this.link_ = PixelScene.renderTextBlock$String$int(linkText, 6);
      if (highlight !== -1) {
        this.link_.hardlight(highlight);
      }
      this.add$Gizmo(this.link_);
      this.linkButton = new (AboutScene$CreditsBlock$1())().$o(this).$c(linkUrl)._PointerArea$float$float$float$float(0, 0, 0, 0);
      this.add$Gizmo(this.linkButton);
    }
    return this;
  }
  layout(): void {
    super.layout();
    let topY = this.top();
    if (this.title_ != null) {
      this.title_.maxWidth$int($J.d2i(this.width()));
      this.title_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width() - this.title_.width())) / 2)), topY);
      topY = Math.fround(topY + Math.fround(this.title_.height() + (this.large ? 2 : 1)));
    }
    if (this.large) {
      if (this.avatar != null) {
        this.avatar.x = Math.fround(this.x + Math.fround((Math.fround(this.width() - this.avatar.width())) / 2));
        this.avatar.y = topY;
        PixelScene.align$Visual(this.avatar);
        if (this.flare != null) {
          this.flare.point$PointF(this.avatar.center$());
        }
        topY = Math.fround(Math.fround(this.avatar.y + this.avatar.height()) + 2);
      }
      this.body.maxWidth$int($J.d2i(this.width()));
      this.body.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width() - this.body.width())) / 2)), topY);
      topY = Math.fround(topY + Math.fround(this.body.height() + 2));
    } else {
      if (this.avatar != null) {
        this.avatar.x = this.x;
        this.body.maxWidth$int($J.d2i((Math.fround(Math.fround(this.width() - this.avatar.width_) - 1))));
        let fullAvHeight = Math.max(this.avatar.height(), 16);
        if (fullAvHeight > this.body.height()) {
          this.avatar.y = Math.fround(topY + Math.fround((Math.fround(fullAvHeight - this.avatar.height())) / 2));
          PixelScene.align$Visual(this.avatar);
          this.body.setPos(Math.fround(Math.fround(this.avatar.x + this.avatar.width()) + 1), Math.fround(topY + Math.fround((Math.fround(fullAvHeight - this.body.height())) / 2)));
          topY = Math.fround(topY + Math.fround(fullAvHeight + 1));
        } else {
          this.avatar.y = Math.fround(topY + Math.fround((Math.fround(this.body.height() - fullAvHeight)) / 2));
          PixelScene.align$Visual(this.avatar);
          this.body.setPos(Math.fround(Math.fround(this.avatar.x + this.avatar.width()) + 1), topY);
          topY = Math.fround(topY + Math.fround(this.body.height() + 2));
        }
      } else {
        topY = Math.fround(topY + 1);
        this.body.maxWidth$int($J.d2i(this.width()));
        this.body.setPos(this.x, topY);
        topY = Math.fround(topY + Math.fround(this.body.height() + 2));
      }
    }
    if (this.link_ != null) {
      if (this.large) {
        topY = Math.fround(topY + 1);
      }
      this.link_.maxWidth$int($J.d2i(this.width()));
      this.link_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width() - this.link_.width())) / 2)), topY);
      topY = Math.fround(topY + Math.fround(this.link_.height() + 2));
      this.linkButton.x = Math.fround(this.link_.left() - 1);
      this.linkButton.y = Math.fround(this.link_.top() - 1);
      this.linkButton.width_ = Math.fround(this.link_.width() + 2);
      this.linkButton.height_ = Math.fround(this.link_.height() + 2);
      this.linkUnderline.size(this.link_.width(), PixelScene.align$float(Math.fround(0.49)));
      this.linkUnderline.x = this.link_.left();
      this.linkUnderline.y = Math.fround(this.link_.bottom() + 1);
    }
    topY = Math.fround(topY - 2);
    this.height_ = Math.max(this.height_, Math.fround(topY - this.top()));
  }
}

let $AboutScene$CreditsBlock$1: any = null;
/** An anonymous class (AboutScene.java:331). */
function AboutScene$CreditsBlock$1(): any {
  return $AboutScene$CreditsBlock$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      Game.platform.openURI(this.$cv_linkUrl);
    }
    $c($linkUrl): this {
      this.$cv_linkUrl = $linkUrl;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AboutScene$CreditsBlock$1', []);
}

$J.define(AboutScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AboutScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_AboutScene' } });
$J.define(AboutScene$CreditsBlock, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AboutScene$CreditsBlock', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'boolean,int,java.lang.String,com.watabou.noosa.Image,java.lang.String,java.lang.String,java.lang.String': '_AboutScene$CreditsBlock' } });
$J.module(() => {
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  ScrollPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  Camera = $J.load('com.watabou.noosa.Camera');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
