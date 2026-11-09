// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/GameLog.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject, JString, Pattern } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let SPDSettings, PixelScene, CharSprite, GLog;

export class GameLog extends Component {
  static readonly MAX_LINES: number = 3;
  static PUNCTUATION: Pattern = null;
  lastEntry: RenderedTextBlock = null;
  lastColor: number = 0;
  static entries: ArrayList<GameLog$Entry> = null;
  static textsToAdd: ArrayList<string> = null;
  _GameLog(): this {
    this._Component();
    GLog.update.replace(this);
    this.recreateLines();
    return this;
  }
  update(): void {
    {
      if (!GameLog.textsToAdd.isEmpty()) {
        let maxLines = SPDSettings.interfaceSize$() > 0 ? 5 : 3;
        for (const $it0 = GameLog.textsToAdd.iterator(); $it0.hasNext(); ) {
          let text = $it0.next();
          if (this.length_ !== GameLog.entries.size()) {
            this.clear();
            this.recreateLines();
          }
          if ($J.equals(text, GLog.NEW_LINE)) {
            this.lastEntry = null;
            continue;
          }
          let color = CharSprite.DEFAULT;
          if (text.startsWith(GLog.POSITIVE)) {
            text = text.substring(GLog.POSITIVE.length);
            color = CharSprite.POSITIVE;
          } else if (text.startsWith(GLog.NEGATIVE)) {
            text = text.substring(GLog.NEGATIVE.length);
            color = CharSprite.NEGATIVE;
          } else if (text.startsWith(GLog.WARNING)) {
            text = text.substring(GLog.WARNING.length);
            color = CharSprite.WARNING;
          } else if (text.startsWith(GLog.HIGHLIGHT)) {
            text = text.substring(GLog.HIGHLIGHT.length);
            color = CharSprite.NEUTRAL;
          }
          if (this.lastEntry != null && color === this.lastColor && this.lastEntry.nLines < maxLines) {
            let lastMessage = this.lastEntry.text$();
            this.lastEntry.text$String(lastMessage.length === 0 ? text : lastMessage + ' ' + text);
            GameLog.entries.get((GameLog.entries.size() - 1) | 0).text_ = this.lastEntry.text$();
          } else {
            this.lastEntry = PixelScene.renderTextBlock$String$int(text, 6);
            this.lastEntry.hardlight(color);
            this.lastColor = color;
            this.add$Gizmo(this.lastEntry);
            GameLog.entries.add(new GameLog$Entry()._GameLog$Entry(text, color));
          }
          if (this.length_ > 0) {
            let nLines: number;
            do {
              nLines = 0;
              for (let i = 0; i < ((this.length_ - 1) | 0); i++) {
                nLines = (nLines + (this.members.get(i)).nLines) | 0;
              }
              if (nLines > maxLines) {
                let r = (this.members.get(0));
                this.remove$Gizmo(r);
                r.destroy();
                GameLog.entries.removeAt(0);
              }
            } while (nLines > maxLines);
            if (GameLog.entries.isEmpty()) {
              this.lastEntry = null;
            }
          }
        }
        this.layout();
        GameLog.textsToAdd.clear();
      }
    }
    super.update();
  }
  recreateLines(): void {
    for (const $it1 = GameLog.entries.iterator(); $it1.hasNext(); ) {
      let entry = $it1.next();
      this.lastEntry = PixelScene.renderTextBlock$String$int(entry.text_, 6);
      this.lastEntry.hardlight(this.lastColor = entry.color_);
      this.add$Gizmo(this.lastEntry);
    }
  }
  newLine(): void {
    this.lastEntry = null;
  }
  onSignal(text: string): boolean {
    {
      GameLog.textsToAdd.add(text);
    }
    return false;
  }
  layout(): void {
    let pos = this.y;
    for (let i = (this.length_ - 1) | 0; i >= 0; i--) {
      let entry = this.members.get(i);
      entry.setHightlighting$boolean(false);
      entry.maxWidth$int($J.d2i(this.width_));
      entry.setPos(this.x, Math.fround(pos - entry.height()));
      pos = Math.fround(pos - Math.fround(entry.height() + 2));
    }
  }
  static wipe(): void {
    {
      GameLog.entries.clear();
      GameLog.textsToAdd.clear();
    }
  }
  static $clinit() {
    GameLog.PUNCTUATION = Pattern.compile('.*[.,;?! ]$');
    GameLog.entries = new ArrayList();
    GameLog.textsToAdd = new ArrayList();
  }
}

export class GameLog$Entry extends JObject {
  text_: string = null;
  color_: number = 0;
  _GameLog$Entry(text: string, color: number): this {
    this.text_ = text;
    this.color_ = color;
    return this;
  }
}

$J.define(GameLog, 'com.shatteredpixel.shatteredpixeldungeon.ui.GameLog', { kind: 'class', ifaces: ['com.watabou.utils.Signal$Listener'], sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_GameLog' }, clinit: true, lazy: ['PUNCTUATION', 'entries', 'textsToAdd'] });
$J.define(GameLog$Entry, 'com.shatteredpixel.shatteredpixeldungeon.ui.GameLog$Entry', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,int': '_GameLog$Entry' } });
$J.module(() => {
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
