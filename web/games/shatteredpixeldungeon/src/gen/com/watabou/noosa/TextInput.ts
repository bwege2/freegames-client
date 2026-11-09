// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/TextInput.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ChangeListener, Container, Files_FileType, Gdx, JObject, JString, Mesh_VertexDataType, OrthographicCamera, Skin, SpriteBatch, Stage, TextArea, TextField, TextField_TextFieldStyle, Viewport } from '../../../../jre/index.ts';
import { Component } from './ui/Component.ts';

let Align, Script, Blending, Quad, Texture, Camera, Game, DeviceCompat, FileUtils;

export class TextInput extends Component {
  stage: Stage = null;
  container: Container = null;
  textField: TextField = null;
  skin: Skin = null;
  bg: NinePatch = null;
  _TextInput(bg: NinePatch, multiline: boolean, size: number): this {
    this._Component();
    this.bg = bg;
    this.add$Gizmo(bg);
    let viewport = new (TextInput$1())().$o(this)._Viewport();
    viewport.setWorldSize(Math.fround(Game.width), Math.fround(Game.height));
    viewport.setScreenBounds(0, 0, Game.width, Game.height);
    viewport.setCamera(new OrthographicCamera());
    SpriteBatch.overrideVertexType = Mesh_VertexDataType.VertexArray;
    this.stage = new Stage(viewport);
    Game.inputHandler.addInputProcessor(this.stage);
    this.container = new Container();
    this.stage.addActor(this.container);
    this.container.setTransform(true);
    this.skin = new Skin(FileUtils.getFileHandle$FileType$String(Files_FileType.Internal, 'gdx/textfield.json'));
    let style = this.skin.get($J.cls(TextField_TextFieldStyle));
    style.font = Game.platform.getFont(size, '', false, false);
    style.background = null;
    if (multiline) {
      this.textField = new (TextInput$2())().$o(this)._TextArea('', style);
    } else {
      this.textField = new (TextInput$3())().$o(this)._TextField('', style);
    }
    this.textField.setProgrammaticChangeEvents(true);
    if (!multiline) {
      this.textField.setAlignment(Align.center);
    }
    this.textField.addListener(new (TextInput$4())().$o(this).$c(size)._ChangeListener());
    if (!multiline) {
      this.textField.setTextFieldListener(new (TextInput$5())().$o(this));
    }
    this.textField.setOnscreenKeyboard(new (TextInput$6())().$o(this).$c(multiline));
    this.container.setActor(this.textField);
    this.stage.setKeyboardFocus(this.textField);
    Game.platform.setOnscreenKeyboardVisible(true, multiline);
    return this;
  }
  enterPressed(): void {
  }
  onChanged(): void {
  }
  onClipBoardUpdate(): void {
  }
  setText(text: string): void {
    this.textField.setText(text);
    this.textField.setCursorPosition(this.textField.getText().length);
  }
  setMaxLength(maxLength: number): void {
    this.textField.setMaxLength(maxLength);
  }
  getText(): string {
    return this.textField.getText();
  }
  copyToClipboard(): void {
    if ((this.textField.getSelection().length === 0)) {
      this.textField.selectAll();
    }
    this.textField.copy();
  }
  pasteFromClipboard(): void {
    let contents = Gdx.app.getClipboard().getContents();
    if (contents == null) {
      return;
    }
    if (!(this.textField.getSelection().length === 0)) {
      this.textField.cut();
      Gdx.app.getClipboard().setContents(contents);
    }
    let existing = this.textField.getText();
    let cursorIdx = this.textField.getCursorPosition();
    this.textField.setText(existing.substring(0, cursorIdx) + contents + existing.substring(cursorIdx));
    this.textField.setCursorPosition((cursorIdx + contents.length) | 0);
  }
  layout(): void {
    super.layout();
    let contX = this.x;
    let contY = this.y;
    let contW = this.width_;
    let contH = this.height_;
    if (this.bg != null) {
      this.bg.x = this.x;
      this.bg.y = this.y;
      this.bg.size(this.width_, this.height_);
      contX = Math.fround(contX + this.bg.marginLeft());
      contY = Math.fround(contY + this.bg.marginTop());
      contW = Math.fround(contW - this.bg.marginHor());
      contH = Math.fround(contH - this.bg.marginVer());
    }
    let zoom = Camera.main.zoom_;
    let c = this.camera();
    if (c != null) {
      zoom = c.zoom_;
      let p = c.cameraToScreen(contX, contY);
      contX = Math.fround(p.x / zoom);
      contY = Math.fround(p.y / zoom);
    }
    this.container.align(Align.topLeft);
    this.container.setPosition(Math.fround(contX * zoom), (Math.fround(Game.height - (Math.fround(contY * zoom)))));
    this.container.size(Math.fround(contW * zoom), Math.fround(contH * zoom));
  }
  update(): void {
    super.update();
    this.stage.act(Game.elapsed);
  }
  draw(): void {
    super.draw();
    Quad.releaseIndices();
    Script.unuse();
    Texture.clear();
    this.stage.draw();
    Quad.bindIndices();
    Blending.useDefault();
  }
  destroy(): void {
    super.destroy();
    if (this.stage != null) {
      this.stage.dispose();
      this.skin.dispose();
      Game.inputHandler.removeInputProcessor(this.stage);
      Game.platform.setOnscreenKeyboardVisible(false, false);
      if (!DeviceCompat.isDesktop()) {
        Game.platform.updateSystemUI();
      }
    }
  }
}

let $TextInput$1: any = null;
/** An anonymous class (TextInput.java:65). */
function TextInput$1(): any {
  return $TextInput$1 ??= $J.local(class extends Viewport {
  }, 'com.watabou.noosa.TextInput$1', []);
}

let $TextInput$2: any = null;
/** An anonymous class (TextInput.java:85). */
function TextInput$2(): any {
  return $TextInput$2 ??= $J.local(class extends TextArea {
    cut(): void {
      super.cut();
      this.$outer.onClipBoardUpdate();
    }
    copy(): void {
      super.copy();
      this.$outer.onClipBoardUpdate();
    }
  }, 'com.watabou.noosa.TextInput$2', []);
}

let $TextInput$3: any = null;
/** An anonymous class (TextInput.java:99). */
function TextInput$3(): any {
  return $TextInput$3 ??= $J.local(class extends TextField {
    cut(): void {
      super.cut();
      this.$outer.onClipBoardUpdate();
    }
    copy(): void {
      super.copy();
      this.$outer.onClipBoardUpdate();
    }
  }, 'com.watabou.noosa.TextInput$3', []);
}

let $TextInput$4: any = null;
/** An anonymous class (TextInput.java:117). */
function TextInput$4(): any {
  return $TextInput$4 ??= $J.local(class extends ChangeListener {
    changed(event: ChangeListener_ChangeEvent, actor: Actor): void {
      let f = Game.platform.getFont(this.$cv_size, this.$outer.textField.getText(), false, false);
      let style = this.$outer.textField.getStyle();
      if (f !== style.font) {
        style.font = f;
        this.$outer.textField.setStyle(style);
      }
      this.$outer.onChanged();
    }
    $c($size): this {
      this.$cv_size = $size;
      return this;
    }
  }, 'com.watabou.noosa.TextInput$4', []);
}

let $TextInput$5: any = null;
/** An anonymous class (TextInput.java:131). */
function TextInput$5(): any {
  return $TextInput$5 ??= $J.local(class extends JObject {
    keyTyped(textField: TextField, c: number): void {
      if (c === 13 /* \u000d */ || c === 10 /* \u000a */) {
        this.$outer.enterPressed();
      }
    }
  }, 'com.watabou.noosa.TextInput$5', ['com.badlogic.gdx.scenes.scene2d.ui.TextField$TextFieldListener']);
}

let $TextInput$6: any = null;
/** An anonymous class (TextInput.java:141). */
function TextInput$6(): any {
  return $TextInput$6 ??= $J.local(class extends JObject {
    show(visible: boolean): void {
      Game.platform.setOnscreenKeyboardVisible(visible, this.$cv_multiline);
    }
    $c($multiline): this {
      this.$cv_multiline = $multiline;
      return this;
    }
  }, 'com.watabou.noosa.TextInput$6', ['com.badlogic.gdx.scenes.scene2d.ui.TextField$OnscreenKeyboard']);
}

$J.define(TextInput, 'com.watabou.noosa.TextInput', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.NinePatch,boolean,int': '_TextInput' } });
$J.module(() => {
  Align = $J.load('com.badlogic.gdx.utils.Align');
  Script = $J.load('com.watabou.glscripts.Script');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Texture = $J.load('com.watabou.glwrap.Texture');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
});
