// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/services/news/News.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Application_ApplicationType, ArrayList, Calendar, Exception, Gdx, JDate, JObject, JString } from '../../../../../../jre/index.ts';

let SPDSettings, NewsService$NewsResultCallback, ItemSprite, Icons, Game, Image;

export class News extends JObject {
  static service: NewsService = null;
  static lastCheck: JDate = null;
  static readonly CHECK_DELAY: bigint = 3600000n;
  static articles_: ArrayList<NewsArticle> = null;
  _News(): this {
    return this;
  }
  static supportsNews(): boolean {
    return News.service != null;
  }
  static checkForNews(): void {
    if (!News.supportsNews()) {
      return;
    }
    if (News.lastCheck != null && (BigInt.asIntN(64, new JDate().getTime() - News.lastCheck.getTime())) < News.CHECK_DELAY) {
      return;
    }
    let useHTTPS = true;
    if (Gdx.app.getType() === Application_ApplicationType.Android && Gdx.app.getVersion() < 20) {
      useHTTPS = false;
    }
    News.service.checkForArticles(!SPDSettings.WiFi$(), useHTTPS, new (News$1())()._NewsService$NewsResultCallback());
  }
  static articlesAvailable(): boolean {
    return News.articles_ != null && !News.articles_.isEmpty();
  }
  static articles(): ArrayList<NewsArticle> {
    return new ArrayList(News.articles_);
  }
  static unreadArticles(lastRead: JDate): number {
    let unread = 0;
    if (News.articles_ != null) {
      for (const $it0 = News.articles_.iterator(); $it0.hasNext(); ) {
        let article = $it0.next();
        if (article.date.after(lastRead)) {
          unread++;
        }
      }
    }
    return unread;
  }
  static clearArticles(): void {
    News.articles_ = null;
    News.lastCheck = null;
  }
  static parseArticleIcon(article: NewsArticle): Image {
    try {
      if (article.icon_.startsWith('ICON: ')) {
        return Icons.get$Icons(Icons.valueOf(JString.replace(article.icon_, 'ICON: ', '')));
      } else if (article.icon_.startsWith('ITEM: ')) {
        return new ItemSprite()._ItemSprite$int($J.parseInt(JString.replace(article.icon_, 'ITEM: ', '')));
      } else {
        let split = JString.split(article.icon_, ', ');
        return new Image()._Image$Object$int$int$int$int(split[0], $J.parseInt(split[1]), $J.parseInt(split[2]), $J.parseInt(split[3]), $J.parseInt(split[4]));
      }
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        if (article.icon_ != null) {
          Game.reportException(e);
        }
        return Icons.get$Icons(Icons.NEWS);
      } else {
        throw $e1;
      }
    }
  }
  static parseArticleDate(article: NewsArticle): string {
    let cal = Calendar.getInstance();
    cal.setTime(article.date);
    return cal.get(1) + '-' + (JString.format('%02d', (cal.get(2) + 1) | 0)) + '-' + JString.format('%02d', cal.get(5));
  }
  static $clinit() {
    News.lastCheck = null;
  }
}

let $News$1: any = null;
/** An anonymous class (News.java:56). */
function News$1(): any {
  return $News$1 ??= $J.local(class extends NewsService$NewsResultCallback {
    onArticlesFound(articles: ArrayList<NewsArticle>): void {
      News.lastCheck = new JDate();
      News.articles_ = articles;
    }
    onConnectionFailed(): void {
      News.lastCheck = null;
      News.articles_ = null;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.services.news.News$1', []);
}

$J.define(News, 'com.shatteredpixel.shatteredpixeldungeon.services.news.News', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_News' }, clinit: true, lazy: ['service', 'lastCheck', 'articles_'] });
$J.module(() => {
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  NewsService$NewsResultCallback = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.news.NewsService$NewsResultCallback');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
});
