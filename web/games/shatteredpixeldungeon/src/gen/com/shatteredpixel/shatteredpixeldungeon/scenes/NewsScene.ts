// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/NewsScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { StyledButton } from '../ui/StyledButton.ts';
import { WndTitledMessage } from '../windows/WndTitledMessage.ts';

let Chrome, Chrome$Type, SPDSettings, ShatteredPixelDungeon, Languages, Messages, TitleScene, News, CharSprite, ExitButton, Icons, RedButton, TitleBackground, Window, IconTitle, BitmapText, Camera, Game;

export class NewsScene extends PixelScene {
  displayingNoArticles: boolean = false;
  static readonly BTN_HEIGHT: number = 22;
  static readonly BTN_WIDTH: number = 100;
  _NewsScene(): this {
    this._PixelScene();
    this.displayingNoArticles = false;
    return this;
  }
  create(): void {
    super.create();
    PixelScene.uiCamera.visible_ = false;
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    this.add$Gizmo(BG);
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let fullWidth = PixelScene.landscape() ? 202 : 100;
    let left = ($J.d2i(insets.left_) + $J.idiv(((w - fullWidth) | 0), 2)) | 0;
    let btnExit = new ExitButton()._ExitButton();
    btnExit.setPos(Math.fround(Math.fround(insets.left_ + w) - btnExit.width()), insets.top_);
    this.add$Gizmo(btnExit);
    let title = new IconTitle()._IconTitle$Image$String(Icons.NEWS.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setSize(200, 0);
    title.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - title.reqWidth())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(20 - title.height())) / 2)));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    let top = Math.fround(18 + insets.top_);
    this.displayingNoArticles = !News.articlesAvailable();
    if (this.displayingNoArticles || Messages.lang() !== Languages.ENGLISH) {
      let newsInfo = new NewsScene$NewsInfo()._NewsScene$NewsInfo();
      newsInfo.setRect(Math.fround(left), top, Math.fround(fullWidth), 0);
      this.add$Gizmo(newsInfo);
      top = newsInfo.bottom();
    }
    if (!this.displayingNoArticles) {
      let articles = News.articles();
      let articleSpace = Math.fround(Math.fround(Math.fround(h - top) - 2) + insets.top_);
      let rows = articles.size();
      if (PixelScene.landscape()) {
        rows = $J.idiv(rows, 2);
      }
      rows++;
      while (Math.fround((articleSpace) / (Math.fround(NewsScene.BTN_HEIGHT + 0.5))) < Math.fround(rows)) {
        articles.removeAt((articles.size() - 1) | 0);
        if (PixelScene.landscape()) {
          articles.removeAt((articles.size() - 1) | 0);
        }
        rows--;
      }
      let gap = Math.fround((Math.fround((articleSpace) - (Math.imul(NewsScene.BTN_HEIGHT, rows)))) / Math.fround(rows));
      let rightCol = false;
      for (const $it0 = articles.iterator(); $it0.hasNext(); ) {
        let article = $it0.next();
        let b = new NewsScene$ArticleButton()._NewsScene$ArticleButton(article);
        b.multiline = true;
        if (!rightCol) {
          top = Math.fround(top + gap);
          b.setRect(Math.fround(left), top, Math.fround(NewsScene.BTN_WIDTH), Math.fround(NewsScene.BTN_HEIGHT));
        } else {
          b.setRect(Math.fround((left + fullWidth - NewsScene.BTN_WIDTH) | 0), top, Math.fround(NewsScene.BTN_WIDTH), Math.fround(NewsScene.BTN_HEIGHT));
        }
        PixelScene.align$Component(b);
        this.add$Gizmo(b);
        if (!PixelScene.landscape()) {
          top = Math.fround(top + NewsScene.BTN_HEIGHT);
        } else {
          if (rightCol) {
            top = Math.fround(top + NewsScene.BTN_HEIGHT);
          }
          rightCol = !rightCol;
        }
      }
      top = Math.fround(top + gap);
    } else {
      top = Math.fround(top + 20);
    }
    let btnSite = new (NewsScene$1())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, Messages.get$Object$String$ObjectArr(this, 'read_more', []));
    btnSite.icon$Image(Icons.get$Icons(Icons.NEWS));
    btnSite.textColor(Window.TITLE_COLOR);
    btnSite.setRect(Math.fround(left), top, Math.fround(fullWidth), Math.fround(NewsScene.BTN_HEIGHT));
    this.add$Gizmo(btnSite);
  }
  onBackPressed(): void {
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
  }
  update(): void {
    if (this.displayingNoArticles && News.articlesAvailable()) {
      ShatteredPixelDungeon.seamlessResetScene$();
    }
    super.update();
  }
}

export class NewsScene$NewsInfo extends Component {
  bg: NinePatch = null;
  text_: RenderedTextBlock = null;
  button: RedButton = null;
  _NewsScene$NewsInfo(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.bg = Chrome.get(Chrome$Type.GREY_BUTTON_TR);
    this.add$Gizmo(this.bg);
    let message = '';
    if (Messages.lang() !== Languages.ENGLISH) {
      message += Messages.get$Object$String$ObjectArr(this, 'english_warn', []);
    }
    if (!News.articlesAvailable()) {
      if (SPDSettings.news$()) {
        if (SPDSettings.WiFi$() && !Game.platform.connectedToUnmeteredNetwork()) {
          message += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'metered_network', []);
          this.button = new (NewsScene$NewsInfo$1())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'enable_data', []));
          this.add$Gizmo(this.button);
        } else {
          message += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'no_internet', []);
        }
      } else {
        message += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'news_disabled', []);
        this.button = new (NewsScene$NewsInfo$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'enable_news', []));
        this.add$Gizmo(this.button);
      }
    }
    if (message.startsWith('\n\n')) {
      message = JString.replaceFirst(message, '\n\n', '');
    }
    this.text_ = PixelScene.renderTextBlock$String$int(message, 6);
    this.text_.hardlight(CharSprite.WARNING);
    this.add$Gizmo(this.text_);
  }
  layout(): void {
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.text_.maxWidth$int(($J.d2i(this.width_) - this.bg.marginHor()) | 0);
    this.text_.setPos(Math.fround(this.x + this.bg.marginLeft()), Math.fround(Math.fround(this.y + this.bg.marginTop()) + 1));
    this.height_ = Math.fround((this.text_.bottom()) - this.y);
    if (this.button != null) {
      this.height_ = Math.fround(this.height_ + 4);
      this.button.multiline = true;
      this.button.setSize(Math.fround(this.width_ - this.bg.marginHor()), 16);
      this.button.setSize(Math.fround(this.width_ - this.bg.marginHor()), Math.max(this.button.reqHeight(), 16));
      this.button.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.button.width())) / 2)), Math.fround(this.y + this.height_));
      this.height_ = Math.fround(this.button.bottom() - this.y);
    }
    this.height_ = Math.fround(this.height_ + ((this.bg.marginBottom() + 1) | 0));
    this.bg.size(this.width_, this.height_);
  }
}

export class NewsScene$ArticleButton extends StyledButton {
  article: NewsArticle = null;
  date: BitmapText = null;
  _NewsScene$ArticleButton(article: NewsArticle): this {
    this._StyledButton$Type$String$int(Chrome$Type.GREY_BUTTON_TR, article.title_, 6);
    this.article = article;
    this.icon$Image(News.parseArticleIcon(article));
    let lastRead = SPDSettings.newsLastRead$();
    if (lastRead > 0n && article.date.getTime() > lastRead) {
      this.textColor(Window.SHPX_COLOR);
    }
    this.date = new BitmapText()._BitmapText$String$Font(News.parseArticleDate(article), PixelScene.pixelFont);
    this.date.scale_.set$float(PixelScene.align$float(0.5));
    this.date.hardlight$int(8947848);
    this.date.measure();
    this.add$Gizmo(this.date);
    return this;
  }
  layout(): void {
    super.layout();
    this.icon_.x = Math.fround(Math.fround(this.x + this.bg.marginLeft()) + Math.fround((Math.fround(16 - this.icon_.width())) / 2));
    PixelScene.align$Visual(this.icon_);
    this.text_.setPos(Math.fround(Math.fround(this.x + this.bg.marginLeft()) + 18), this.text_.top());
    if (this.date != null) {
      this.date.x = Math.fround(Math.fround(Math.fround(Math.fround(this.x + this.width_) - this.bg.marginRight()) - this.date.width()) + 1);
      this.date.y = Math.fround(Math.fround(Math.fround(Math.fround(this.y + this.height_) - this.bg.marginBottom()) - this.date.height()) + 2.5);
      PixelScene.align$Visual(this.date);
    }
  }
  onClick(): void {
    super.onClick();
    this.textColor(Window.WHITE);
    if (this.article.date.getTime() > SPDSettings.newsLastRead$()) {
      SPDSettings.newsLastRead$long(this.article.date.getTime());
    }
    Game.scene().addToFront(new NewsScene$WndArticle()._NewsScene$WndArticle(this.article));
  }
}

export class NewsScene$WndArticle extends WndTitledMessage {
  _NewsScene$WndArticle(article: NewsArticle): this {
    this._WndTitledMessage$Image$String$String(News.parseArticleIcon(article), article.title_, article.summary);
    let link = new (NewsScene$WndArticle$1())().$o(this).$c(article)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(NewsScene), 'read_more', []));
    link.setRect(0, Math.fround((this.height_ + 2) | 0), Math.fround(this.width_), Math.fround(NewsScene.BTN_HEIGHT));
    this.add$Gizmo(link);
    this.resize(this.width_, $J.d2i(link.bottom()));
    return this;
  }
}

let $NewsScene$1: any = null;
/** An anonymous class (NewsScene.java:148). */
function NewsScene$1(): any {
  return $NewsScene$1 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      Game.platform.openURI('https://ShatteredPixel.com');
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene$1', []);
}

let $NewsScene$NewsInfo$1: any = null;
/** An anonymous class (NewsScene.java:197). */
function NewsScene$NewsInfo$1(): any {
  return $NewsScene$NewsInfo$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      SPDSettings.WiFi$boolean(false);
      News.checkForNews();
      ShatteredPixelDungeon.seamlessResetScene$();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene$NewsInfo$1', []);
}

let $NewsScene$NewsInfo$2: any = null;
/** An anonymous class (NewsScene.java:213). */
function NewsScene$NewsInfo$2(): any {
  return $NewsScene$NewsInfo$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      SPDSettings.news$boolean(true);
      News.checkForNews();
      ShatteredPixelDungeon.seamlessResetScene$();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene$NewsInfo$2', []);
}

let $NewsScene$WndArticle$1: any = null;
/** An anonymous class (NewsScene.java:313). */
function NewsScene$WndArticle$1(): any {
  return $NewsScene$WndArticle$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      Game.platform.openURI(this.$cv_article.URL);
    }
    $c($article): this {
      this.$cv_article = $article;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene$WndArticle$1', []);
}

$J.define(NewsScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_NewsScene' } });
$J.define(NewsScene$NewsInfo, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene$NewsInfo', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_NewsScene$NewsInfo' } });
$J.define(NewsScene$ArticleButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene$ArticleButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.services.news.NewsArticle': '_NewsScene$ArticleButton' } });
$J.define(NewsScene$WndArticle, 'com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene$WndArticle', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.services.news.NewsArticle': '_NewsScene$WndArticle' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  News = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.news.News');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
});
