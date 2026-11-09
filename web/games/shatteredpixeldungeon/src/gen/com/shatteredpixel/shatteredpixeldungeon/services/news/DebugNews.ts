// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/services/news/DebugNews.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JDate } from '../../../../../../jre/index.ts';
import { NewsService } from './NewsService.ts';

let NewsArticle, Game;

export class DebugNews extends NewsService {
  _DebugNews(): this {
    this._NewsService();
    return this;
  }
  checkForArticles(useMetered: boolean, forceHTTPS: boolean, callback: NewsService$NewsResultCallback): void {
    if (!useMetered && !Game.platform.connectedToUnmeteredNetwork()) {
      callback.onConnectionFailed();
      return;
    }
    if (false) {
      callback.onConnectionFailed();
      return;
    }
    let testUnread = false;
    let startTime = testUnread ? Game.realTime : 864000000n;
    let articles = new ArrayList();
    for (let i = 0; i < 10; i++) {
      let article = new NewsArticle()._NewsArticle();
      article.title_ = 'TEST ARTICLE ' + i;
      article.summary = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
      article.date = new JDate(BigInt.asIntN(64, startTime - BigInt(Math.imul(Math.imul(Math.imul(Math.imul((i), 1000), 60), 60), 24))));
      article.URL = 'http://www.google.com';
      article.icon_ = 'sprites/spinner.png, 144, 0, 16, 16';
      articles.add(article);
    }
    callback.onArticlesFound(articles);
  }
}

$J.define(DebugNews, 'com.shatteredpixel.shatteredpixeldungeon.services.news.DebugNews', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.services.news.NewsService', ctors: { '': '_DebugNews' } });
$J.module(() => {
  NewsArticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.news.NewsArticle');
  Game = $J.load('com.watabou.noosa.Game');
});
