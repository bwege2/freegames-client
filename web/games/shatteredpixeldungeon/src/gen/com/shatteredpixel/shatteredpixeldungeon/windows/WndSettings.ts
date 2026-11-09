// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndSettings.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, JObject, JString, Locale } from '../../../../../jre/index.ts';
import { WndTabbed } from './WndTabbed.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Assets$Sounds, Chrome, Chrome$Type, SPDSettings, ShatteredPixelDungeon, Languages, Languages$Status, Messages, GameScene, PixelScene, News, Updates, CharSprite, CheckBox, GameLog, Icons, OptionSlider, RedButton, Toolbar, Toolbar$Mode, Window, WndKeyBindings, WndTabbed$IconTab, ControllerHandler, ColorBlock, Game, Sample, DeviceCompat, Random;

export class WndSettings extends WndTabbed {
  static readonly WIDTH_P: number = 122;
  static readonly WIDTH_L: number = 223;
  static readonly SLIDER_HEIGHT: number = 21;
  static readonly BTN_HEIGHT: number = 16;
  static readonly GAP: number = 1;
  display: WndSettings$DisplayTab = null;
  ui: WndSettings$UITab = null;
  input: WndSettings$InputTab = null;
  data: WndSettings$DataTab = null;
  audio: WndSettings$AudioTab = null;
  langs: WndSettings$LangsTab = null;
  static last_index: number = 0;
  _WndSettings(): this {
    this._WndTabbed();
    let height: number;
    let width = PixelScene.landscape() ? WndSettings.WIDTH_L : WndSettings.WIDTH_P;
    this.display = new WndSettings$DisplayTab()._WndSettings$DisplayTab();
    this.display.setSize(Math.fround(width), 0);
    height = this.display.height();
    this.add$Gizmo(this.display);
    this.add$Tab(new (WndSettings$1())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.DISPLAY)));
    this.ui = new WndSettings$UITab()._WndSettings$UITab();
    this.ui.setSize(Math.fround(width), 0);
    height = Math.max(height, this.ui.height());
    this.add$Gizmo(this.ui);
    this.add$Tab(new (WndSettings$2())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.PREFS)));
    this.input = new WndSettings$InputTab()._WndSettings$InputTab();
    this.input.setSize(Math.fround(width), 0);
    height = Math.max(height, this.input.height());
    if (DeviceCompat.hasHardKeyboard() || ControllerHandler.isControllerConnected()) {
      this.add$Gizmo(this.input);
      let icon: Image;
      if (ControllerHandler.controllerActive || !DeviceCompat.hasHardKeyboard()) {
        icon = Icons.get$Icons(Icons.CONTROLLER);
      } else {
        icon = Icons.get$Icons(Icons.KEYBOARD);
      }
      this.add$Tab(new (WndSettings$3())().$o(this)._WndTabbed$IconTab(icon));
    }
    this.data = new WndSettings$DataTab()._WndSettings$DataTab();
    this.data.setSize(Math.fround(width), 0);
    height = Math.max(height, this.data.height());
    this.add$Gizmo(this.data);
    this.add$Tab(new (WndSettings$4())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.DATA)));
    this.audio = new WndSettings$AudioTab()._WndSettings$AudioTab();
    this.audio.setSize(Math.fround(width), 0);
    height = Math.max(height, this.audio.height());
    this.add$Gizmo(this.audio);
    this.add$Tab(new (WndSettings$5())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.AUDIO)));
    this.langs = new WndSettings$LangsTab()._WndSettings$LangsTab();
    this.langs.setSize(Math.fround(width), 0);
    height = Math.max(height, this.langs.height());
    this.add$Gizmo(this.langs);
    let langsTab = new (WndSettings$6())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.LANGS));
    this.add$Tab(langsTab);
    this.resize(width, $J.d2i(Math.ceil(height)));
    this.layoutTabs();
    if (this.tabs.size() === 5 && WndSettings.last_index >= 3) {
      this.select$int((WndSettings.last_index - 1) | 0);
    } else {
      this.select$int(WndSettings.last_index);
    }
    return this;
  }
  hide(): void {
    super.hide();
    ShatteredPixelDungeon.seamlessResetScene$SceneChangeCallback(new (WndSettings$7())().$o(this));
  }
  static $clinit() {
    WndSettings.last_index = 0;
  }
}

export class WndSettings$DisplayTab extends Component {
  title_: RenderedTextBlock = null;
  sep1: ColorBlock = null;
  chkFullscreen: CheckBox = null;
  chkLandscape: CheckBox = null;
  sep2: ColorBlock = null;
  optBrightness: OptionSlider = null;
  optVisGrid: OptionSlider = null;
  optFollowIntensity: OptionSlider = null;
  optScreenShake: OptionSlider = null;
  _WndSettings$DisplayTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.sep1 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep1);
    let fullscreenText = Messages.get$Object$String$ObjectArr(this, 'fullscreen', []);
    if (DeviceCompat.isAndroid()) {
      fullscreenText = Messages.get$Object$String$ObjectArr(this, 'hide_navigation', []);
    } else if (DeviceCompat.isiOS()) {
      fullscreenText = Messages.get$Object$String$ObjectArr(this, 'hide_gesture', []);
    }
    this.chkFullscreen = new (WndSettings$DisplayTab$1())().$o(this)._CheckBox(fullscreenText);
    if (Game.platform.supportsFullScreen()) {
      this.chkFullscreen.checked$boolean(SPDSettings.fullscreen$());
    } else {
      this.chkFullscreen.checked$boolean(true);
      this.chkFullscreen.enable(false);
    }
    this.add$Gizmo(this.chkFullscreen);
    if (DeviceCompat.isAndroid()) {
      this.chkLandscape = new (WndSettings$DisplayTab$2())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'landscape', []));
      this.chkLandscape.checked$boolean(SPDSettings.landscape$());
      this.add$Gizmo(this.chkLandscape);
    }
    this.sep2 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep2);
    this.optBrightness = new (WndSettings$DisplayTab$3())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'brightness', []), Messages.get$Object$String$ObjectArr(this, 'dark', []), Messages.get$Object$String$ObjectArr(this, 'bright', []), -1, 1);
    this.optBrightness.setSelectedValue(SPDSettings.brightness$());
    this.add$Gizmo(this.optBrightness);
    this.optVisGrid = new (WndSettings$DisplayTab$4())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'visual_grid', []), Messages.get$Object$String$ObjectArr(this, 'off', []), Messages.get$Object$String$ObjectArr(this, 'high', []), -1, 2);
    this.optVisGrid.setSelectedValue(SPDSettings.visualGrid$());
    this.add$Gizmo(this.optVisGrid);
    this.optFollowIntensity = new (WndSettings$DisplayTab$5())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'camera_follow', []), Messages.get$Object$String$ObjectArr(this, 'low', []), Messages.get$Object$String$ObjectArr(this, 'high', []), 1, 4);
    this.optFollowIntensity.setSelectedValue(SPDSettings.cameraFollow$());
    this.add$Gizmo(this.optFollowIntensity);
    this.optScreenShake = new (WndSettings$DisplayTab$6())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'screenshake', []), Messages.get$Object$String$ObjectArr(this, 'off', []), Messages.get$Object$String$ObjectArr(this, 'high', []), 0, 4);
    this.optScreenShake.setSelectedValue(SPDSettings.screenShake$());
    this.add$Gizmo(this.optScreenShake);
  }
  layout(): void {
    let bottom = this.y;
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(bottom + WndSettings.GAP));
    this.sep1.size(this.width_, 1);
    this.sep1.y = Math.fround(this.title_.bottom() + Math.fround(3 * WndSettings.GAP));
    bottom = Math.fround(this.sep1.y + 1);
    this.chkFullscreen.setRect(0, Math.fround(bottom + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
    bottom = this.chkFullscreen.bottom();
    if (this.chkLandscape != null) {
      this.chkLandscape.setRect(0, Math.fround(bottom + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      bottom = this.chkLandscape.bottom();
    }
    this.sep2.size(this.width_, 1);
    this.sep2.y = Math.fround(bottom + WndSettings.GAP);
    bottom = Math.fround(this.sep2.y + 1);
    if (this.width_ > Math.fround(200)) {
      this.optBrightness.setRect(0, Math.fround(bottom + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - Math.fround(WndSettings.GAP / 2)), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optVisGrid.setRect(Math.fround(this.optBrightness.right() + WndSettings.GAP), this.optBrightness.top(), Math.fround(Math.fround(this.width_ / 2) - Math.fround(WndSettings.GAP / 2)), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optFollowIntensity.setRect(0, Math.fround(this.optVisGrid.bottom() + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - Math.fround(WndSettings.GAP / 2)), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optScreenShake.setRect(Math.fround(this.optFollowIntensity.right() + WndSettings.GAP), this.optFollowIntensity.top(), Math.fround(Math.fround(this.width_ / 2) - Math.fround(WndSettings.GAP / 2)), Math.fround(WndSettings.SLIDER_HEIGHT));
    } else {
      this.optBrightness.setRect(0, Math.fround(bottom + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optVisGrid.setRect(0, Math.fround(this.optBrightness.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optFollowIntensity.setRect(0, Math.fround(this.optVisGrid.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optScreenShake.setRect(0, Math.fround(this.optFollowIntensity.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
    }
    this.height_ = this.optScreenShake.bottom();
  }
}

export class WndSettings$UITab extends Component {
  title_: RenderedTextBlock = null;
  sep1: ColorBlock = null;
  optUIMode: OptionSlider = null;
  optUIScale: OptionSlider = null;
  btnToolbarSettings: RedButton = null;
  chkFlipTags: CheckBox = null;
  sep2: ColorBlock = null;
  chkFont: CheckBox = null;
  chkVibrate: CheckBox = null;
  _WndSettings$UITab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.sep1 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep1);
    let wMin = Math.fround(Game.width / PixelScene.MIN_WIDTH_FULL);
    let hMin = Math.fround(Game.height / PixelScene.MIN_HEIGHT_FULL);
    if (Math.min(wMin, hMin) >= Math.fround(2 * Game.density)) {
      this.optUIMode = new (WndSettings$UITab$1())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'ui_mode', []), Messages.get$Object$String$ObjectArr(this, 'mobile', []), Messages.get$Object$String$ObjectArr(this, 'full', []), 0, 2);
      this.optUIMode.setSelectedValue(SPDSettings.interfaceSize$());
      this.add$Gizmo(this.optUIMode);
    }
    if ($J.d2i(Math.ceil(Math.fround(2 * Game.density))) < PixelScene.maxDefaultZoom) {
      this.optUIScale = new (WndSettings$UITab$2())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'scale', []), $J.d2i(Math.ceil(Math.fround(2 * Game.density))) + 'X', PixelScene.maxDefaultZoom + 'X', $J.d2i(Math.ceil(Math.fround(2 * Game.density))), PixelScene.maxDefaultZoom);
      this.optUIScale.setSelectedValue(PixelScene.defaultZoom);
      this.add$Gizmo(this.optUIScale);
    }
    if (SPDSettings.interfaceSize$() === 0) {
      this.btnToolbarSettings = new (WndSettings$UITab$3())().$o(this)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'toolbar_settings', []), 9);
      this.add$Gizmo(this.btnToolbarSettings);
    } else {
      this.chkFlipTags = new (WndSettings$UITab$4())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'flip_indicators', []));
      this.chkFlipTags.checked$boolean(SPDSettings.flipTags$());
      this.add$Gizmo(this.chkFlipTags);
    }
    this.sep2 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep2);
    this.chkFont = new (WndSettings$UITab$5())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'system_font', []));
    this.chkFont.checked$boolean(SPDSettings.systemFont$());
    this.add$Gizmo(this.chkFont);
    this.chkVibrate = new (WndSettings$UITab$6())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'vibration', []));
    this.chkVibrate.enable(Game.platform.supportsVibration());
    if (this.chkVibrate.active) {
      this.chkVibrate.checked$boolean(SPDSettings.vibration$());
    }
    this.add$Gizmo(this.chkVibrate);
  }
  layout(): void {
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(this.y + WndSettings.GAP));
    this.sep1.size(this.width_, 1);
    this.sep1.y = Math.fround(this.title_.bottom() + Math.fround(3 * WndSettings.GAP));
    this.height_ = Math.fround(this.sep1.y + 1);
    if (this.optUIMode != null && this.optUIScale != null && this.width_ > Math.fround(200)) {
      this.optUIMode.setRect(0, Math.fround(this.height_ + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optUIScale.setRect(Math.fround(Math.fround(this.width_ / 2) + 1), Math.fround(this.height_ + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.height_ = this.optUIScale.bottom();
    } else {
      if (this.optUIMode != null) {
        this.optUIMode.setRect(0, Math.fround(this.height_ + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
        this.height_ = this.optUIMode.bottom();
      }
      if (this.optUIScale != null) {
        this.optUIScale.setRect(0, Math.fround(this.height_ + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
        this.height_ = this.optUIScale.bottom();
      }
    }
    if (this.btnToolbarSettings != null) {
      this.btnToolbarSettings.setRect(0, Math.fround(this.height_ + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      this.height_ = this.btnToolbarSettings.bottom();
    } else {
      this.chkFlipTags.setRect(0, Math.fround(this.height_ + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      this.height_ = this.chkFlipTags.bottom();
    }
    this.sep2.size(this.width_, 1);
    this.sep2.y = Math.fround(this.height_ + WndSettings.GAP);
    if (this.width_ > Math.fround(200)) {
      this.chkFont.setRect(0, Math.fround(Math.fround(this.sep2.y + 1) + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
      this.chkVibrate.setRect(Math.fround(this.chkFont.right() + 2), this.chkFont.top(), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
      this.height_ = this.chkVibrate.bottom();
    } else {
      this.chkFont.setRect(0, Math.fround(Math.fround(this.sep2.y + 1) + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      this.chkVibrate.setRect(0, Math.fround(this.chkFont.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      this.height_ = this.chkVibrate.bottom();
    }
  }
}

export class WndSettings$InputTab extends Component {
  title_: RenderedTextBlock = null;
  sep1: ColorBlock = null;
  btnKeyBindings: RedButton = null;
  btnControllerBindings: RedButton = null;
  sep2: ColorBlock = null;
  optControlSens: OptionSlider = null;
  optHoldMoveSens: OptionSlider = null;
  _WndSettings$InputTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.sep1 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep1);
    if (DeviceCompat.hasHardKeyboard()) {
      this.btnKeyBindings = new (WndSettings$InputTab$1())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'key_bindings', []));
      this.add$Gizmo(this.btnKeyBindings);
    }
    if (ControllerHandler.isControllerConnected()) {
      this.btnControllerBindings = new (WndSettings$InputTab$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'controller_bindings', []));
      this.add$Gizmo(this.btnControllerBindings);
    }
    this.sep2 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep2);
    this.optControlSens = new (WndSettings$InputTab$3())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'controller_sensitivity', []), '1', '10', 1, 10);
    this.optControlSens.setSelectedValue(SPDSettings.controllerPointerSensitivity$());
    this.add$Gizmo(this.optControlSens);
    this.optHoldMoveSens = new (WndSettings$InputTab$4())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'movement_sensitivity', []), Messages.get$Object$String$ObjectArr(this, 'off', []), Messages.get$Object$String$ObjectArr(this, 'high', []), 0, 4);
    this.optHoldMoveSens.setSelectedValue(SPDSettings.movementHoldSensitivity$());
    this.add$Gizmo(this.optHoldMoveSens);
  }
  layout(): void {
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(this.y + WndSettings.GAP));
    this.sep1.size(this.width_, 1);
    this.sep1.y = Math.fround(this.title_.bottom() + Math.fround(3 * WndSettings.GAP));
    this.height_ = Math.fround(this.sep1.y + 1);
    if (this.width_ > Math.fround(200) && this.btnKeyBindings != null && this.btnControllerBindings != null) {
      this.btnKeyBindings.setRect(0, Math.fround(this.height_ + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
      this.btnControllerBindings.setRect(Math.fround(Math.fround(this.width_ / 2) + 1), Math.fround(this.height_ + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
      this.height_ = this.btnControllerBindings.bottom();
    } else {
      if (this.btnKeyBindings != null) {
        this.btnKeyBindings.setRect(0, Math.fround(this.height_ + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
        this.height_ = this.btnKeyBindings.bottom();
      }
      if (this.btnControllerBindings != null) {
        this.btnControllerBindings.setRect(0, Math.fround(this.height_ + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
        this.height_ = this.btnControllerBindings.bottom();
      }
    }
    this.sep2.size(this.width_, 1);
    this.sep2.y = Math.fround(this.height_ + WndSettings.GAP);
    if (this.width_ > Math.fround(200)) {
      this.optControlSens.setRect(0, Math.fround(Math.fround(this.sep2.y + 1) + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optHoldMoveSens.setRect(Math.fround(Math.fround(this.width_ / 2) + 1), this.optControlSens.top(), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.SLIDER_HEIGHT));
    } else {
      this.optControlSens.setRect(0, Math.fround(Math.fround(this.sep2.y + 1) + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
      this.optHoldMoveSens.setRect(0, Math.fround(this.optControlSens.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
    }
    this.height_ = this.optHoldMoveSens.bottom();
  }
}

export class WndSettings$DataTab extends Component {
  title_: RenderedTextBlock = null;
  sep1: ColorBlock = null;
  chkNews: CheckBox = null;
  chkUpdates: CheckBox = null;
  chkBetas: CheckBox = null;
  chkWifi: CheckBox = null;
  _WndSettings$DataTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.sep1 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep1);
    this.chkNews = new (WndSettings$DataTab$1())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'news', []));
    this.chkNews.checked$boolean(SPDSettings.news$());
    this.add$Gizmo(this.chkNews);
    if (Updates.supportsUpdates() && Updates.supportsUpdatePrompts()) {
      this.chkUpdates = new (WndSettings$DataTab$2())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'updates', []));
      this.chkUpdates.checked$boolean(SPDSettings.updates$());
      this.add$Gizmo(this.chkUpdates);
      if (Updates.supportsBetaChannel()) {
        this.chkBetas = new (WndSettings$DataTab$3())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'betas', []));
        this.chkBetas.checked$boolean(SPDSettings.betas$());
        this.add$Gizmo(this.chkBetas);
      }
    }
    if (!DeviceCompat.isDesktop()) {
      this.chkWifi = new (WndSettings$DataTab$4())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'wifi', []));
      this.chkWifi.checked$boolean(SPDSettings.WiFi$());
      this.add$Gizmo(this.chkWifi);
    }
  }
  layout(): void {
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(this.y + WndSettings.GAP));
    this.sep1.size(this.width_, 1);
    this.sep1.y = Math.fround(this.title_.bottom() + Math.fround(3 * WndSettings.GAP));
    let pos: number;
    if (this.width_ > Math.fround(200) && this.chkUpdates != null) {
      this.chkNews.setRect(0, Math.fround(Math.fround(this.sep1.y + 1) + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
      this.chkUpdates.setRect(Math.fround(this.chkNews.right() + WndSettings.GAP), this.chkNews.top(), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
      pos = this.chkUpdates.bottom();
    } else {
      this.chkNews.setRect(0, Math.fround(Math.fround(this.sep1.y + 1) + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      pos = this.chkNews.bottom();
      if (this.chkUpdates != null) {
        this.chkUpdates.setRect(0, Math.fround(this.chkNews.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
        pos = this.chkUpdates.bottom();
      }
    }
    if (this.chkBetas != null) {
      this.chkBetas.setRect(0, Math.fround(pos + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      pos = this.chkBetas.bottom();
    }
    if (this.chkWifi != null) {
      this.chkWifi.setRect(0, Math.fround(pos + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      pos = this.chkWifi.bottom();
    }
    this.height_ = pos;
  }
}

export class WndSettings$AudioTab extends Component {
  title_: RenderedTextBlock = null;
  sep1: ColorBlock = null;
  optMusic: OptionSlider = null;
  chkMusicMute: CheckBox = null;
  sep2: ColorBlock = null;
  optSFX: OptionSlider = null;
  chkMuteSFX: CheckBox = null;
  sep3: ColorBlock = null;
  chkIgnoreSilent: CheckBox = null;
  chkMusicBG: CheckBox = null;
  _WndSettings$AudioTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.sep1 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep1);
    this.optMusic = new (WndSettings$AudioTab$1())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'music_vol', []), '0', '10', 0, 10);
    this.optMusic.setSelectedValue(SPDSettings.musicVol$());
    this.add$Gizmo(this.optMusic);
    this.chkMusicMute = new (WndSettings$AudioTab$2())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'music_mute', []));
    this.chkMusicMute.checked$boolean(!SPDSettings.music$());
    this.add$Gizmo(this.chkMusicMute);
    this.sep2 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep2);
    this.optSFX = new (WndSettings$AudioTab$3())().$o(this)._OptionSlider(Messages.get$Object$String$ObjectArr(this, 'sfx_vol', []), '0', '10', 0, 10);
    this.optSFX.setSelectedValue(SPDSettings.SFXVol$());
    this.add$Gizmo(this.optSFX);
    this.chkMuteSFX = new (WndSettings$AudioTab$4())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'sfx_mute', []));
    this.chkMuteSFX.checked$boolean(!SPDSettings.soundFx$());
    this.add$Gizmo(this.chkMuteSFX);
    if (DeviceCompat.isiOS()) {
      this.sep3 = new ColorBlock()._ColorBlock(1, 1, -16777216);
      this.add$Gizmo(this.sep3);
      this.chkIgnoreSilent = new (WndSettings$AudioTab$5())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'ignore_silent', []));
      this.chkIgnoreSilent.checked$boolean(SPDSettings.ignoreSilentMode$());
      this.add$Gizmo(this.chkIgnoreSilent);
    } else if (DeviceCompat.isDesktop()) {
      this.sep3 = new ColorBlock()._ColorBlock(1, 1, -16777216);
      this.add$Gizmo(this.sep3);
      this.chkMusicBG = new (WndSettings$AudioTab$6())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this, 'music_bg', []));
      this.chkMusicBG.checked$boolean(SPDSettings.playMusicInBackground$());
      this.add$Gizmo(this.chkMusicBG);
    }
  }
  layout(): void {
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(this.y + WndSettings.GAP));
    this.sep1.size(this.width_, 1);
    this.sep1.y = Math.fround(this.title_.bottom() + Math.fround(3 * WndSettings.GAP));
    if (this.width_ > Math.fround(200)) {
      this.optMusic.setRect(0, Math.fround(Math.fround(this.sep1.y + 1) + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.chkMusicMute.setRect(0, Math.fround(this.optMusic.bottom() + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
      this.sep2.size(this.width_, 1);
      this.sep2.y = this.sep1.y;
      this.optSFX.setRect(Math.fround(this.optMusic.right() + 2), Math.fround(Math.fround(this.sep2.y + 1) + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.SLIDER_HEIGHT));
      this.chkMuteSFX.setRect(Math.fround(this.chkMusicMute.right() + 2), Math.fround(this.optSFX.bottom() + WndSettings.GAP), Math.fround(Math.fround(this.width_ / 2) - 1), Math.fround(WndSettings.BTN_HEIGHT));
    } else {
      this.optMusic.setRect(0, Math.fround(Math.fround(this.sep1.y + 1) + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
      this.chkMusicMute.setRect(0, Math.fround(this.optMusic.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      this.sep2.size(this.width_, 1);
      this.sep2.y = Math.fround(this.chkMusicMute.bottom() + WndSettings.GAP);
      this.optSFX.setRect(0, Math.fround(Math.fround(this.sep2.y + 1) + WndSettings.GAP), this.width_, Math.fround(WndSettings.SLIDER_HEIGHT));
      this.chkMuteSFX.setRect(0, Math.fround(this.optSFX.bottom() + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
    }
    this.height_ = this.chkMuteSFX.bottom();
    if (this.chkIgnoreSilent != null) {
      this.sep3.size(this.width_, 1);
      this.sep3.y = Math.fround(this.chkMuteSFX.bottom() + WndSettings.GAP);
      this.chkIgnoreSilent.setRect(0, Math.fround(Math.fround(this.sep3.y + 1) + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      this.height_ = this.chkIgnoreSilent.bottom();
    } else if (this.chkMusicBG != null) {
      this.sep3.size(this.width_, 1);
      this.sep3.y = Math.fround(this.chkMuteSFX.bottom() + WndSettings.GAP);
      this.chkMusicBG.setRect(0, Math.fround(Math.fround(this.sep3.y + 1) + WndSettings.GAP), this.width_, Math.fround(WndSettings.BTN_HEIGHT));
      this.height_ = this.chkMusicBG.bottom();
    }
  }
}

export class WndSettings$LangsTab extends Component {
  static readonly COLS_P: number = 3;
  static readonly COLS_L: number = 6;
  static readonly BTN_HEIGHT: number = 11;
  title_: RenderedTextBlock = null;
  sep1: ColorBlock = null;
  txtLangInfo: RenderedTextBlock = null;
  sep2: ColorBlock = null;
  lanBtns: RedButton[] = null;
  sep3: ColorBlock = null;
  txtTranifex: RenderedTextBlock = null;
  btnCredits: RedButton = null;
  _WndSettings$LangsTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.sep1 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep1);
    let langs = new ArrayList(Arrays.asList(...Languages.values()));
    let nativeLang = Languages.matchLocale(Locale.getDefault());
    langs.remove(nativeLang);
    langs.add(0, nativeLang);
    let currLang = Messages.lang();
    this.txtLangInfo = PixelScene.renderTextBlock$int(6);
    let info = '_' + Messages.titleCase(currLang.nativeName()) + '_ - ';
    if (currLang === Languages.ENGLISH) {
      info += 'This is the source language, written by the developer.';
    } else if (currLang.status() === Languages$Status.O_COMPLETE) {
      info += Messages.get$Object$String$ObjectArr(this, 'completed', []);
    } else if (currLang.status() === Languages$Status.__UNREVIEW) {
      info += Messages.get$Object$String$ObjectArr(this, 'unreviewed', []);
    } else if (currLang.status() === Languages$Status.X_UNFINISH) {
      info += Messages.get$Object$String$ObjectArr(this, 'unfinished', []);
    }
    this.txtLangInfo.text$String(info);
    if (currLang.status() === Languages$Status.__UNREVIEW) {
      this.txtLangInfo.setHightlighting$boolean$int(true, CharSprite.WARNING);
    } else if (currLang.status() === Languages$Status.X_UNFINISH) {
      this.txtLangInfo.setHightlighting$boolean$int(true, CharSprite.NEGATIVE);
    }
    this.add$Gizmo(this.txtLangInfo);
    this.sep2 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep2);
    this.lanBtns = $J.newArray(langs.size(), null);
    for (let i = 0; i < langs.size(); i++) {
      let langIndex = i;
      let btn = new (WndSettings$LangsTab$1())().$o(this).$c(langs, langIndex)._RedButton$String$int(Messages.titleCase(langs.get(i).nativeName()), 6);
      if (currLang === langs.get(i)) {
        btn.textColor(Window.TITLE_COLOR);
      } else {
        switch (langs.get(i).status()) {
          case Languages$Status.X_UNFINISH:
            btn.textColor(8947848);
            break;
          case Languages$Status.__UNREVIEW:
            btn.textColor(12303291);
            break;
        }
      }
      this.lanBtns[i] = btn;
      this.add$Gizmo(btn);
    }
    this.sep3 = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.sep3);
    this.txtTranifex = PixelScene.renderTextBlock$int(5);
    this.txtTranifex.text$String(Messages.get$Object$String$ObjectArr(this, 'transifex', []));
    this.add$Gizmo(this.txtTranifex);
    if (currLang !== Languages.ENGLISH) {
      let credText = Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'credits', []));
      this.btnCredits = new (WndSettings$LangsTab$2())().$o(this).$c(currLang)._RedButton$String$int(credText, credText.length > 9 ? 6 : 9);
      this.add$Gizmo(this.btnCredits);
    }
  }
  layout(): void {
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(this.y + WndSettings.GAP));
    this.sep1.size(this.width_, 1);
    this.sep1.y = Math.fround(this.title_.bottom() + Math.fround(3 * WndSettings.GAP));
    this.txtLangInfo.setPos(0, Math.fround(Math.fround(this.sep1.y + 1) + WndSettings.GAP));
    this.txtLangInfo.maxWidth$int($J.d2i(this.width_));
    this.y = Math.fround(this.txtLangInfo.bottom() + Math.fround(2 * WndSettings.GAP));
    let x = 0;
    this.sep2.size(this.width_, 1);
    this.sep2.y = this.y;
    this.y = Math.fround(this.y + 2);
    let cols = PixelScene.landscape() ? WndSettings$LangsTab.COLS_L : WndSettings$LangsTab.COLS_P;
    let btnWidth = $J.d2i(Math.floor(Math.fround((Math.fround(this.width_ - ((cols - 1) | 0))) / cols)));
    for (let btn of this.lanBtns) {
      btn.setRect(Math.fround(x), this.y, Math.fround(btnWidth), Math.fround(WndSettings$LangsTab.BTN_HEIGHT));
      btn.setPos(Math.fround(x), this.y);
      x = (x + (btnWidth + 1)) | 0;
      if (Math.fround((x + btnWidth) | 0) > this.width_) {
        x = 0;
        this.y = Math.fround(this.y + ((WndSettings$LangsTab.BTN_HEIGHT + 1) | 0));
      }
    }
    if (x > 0) {
      this.y = Math.fround(this.y + ((WndSettings$LangsTab.BTN_HEIGHT + 1) | 0));
    }
    this.sep3.size(this.width_, 1);
    this.sep3.y = this.y;
    this.y = Math.fround(this.y + 2);
    if (this.btnCredits != null) {
      this.btnCredits.setSize(Math.fround(this.btnCredits.reqWidth() + 2), 16);
      this.btnCredits.setPos(Math.fround(this.width_ - this.btnCredits.width()), this.y);
      this.txtTranifex.setPos(0, this.y);
      this.txtTranifex.maxWidth$int($J.d2i(this.btnCredits.left()));
      this.height_ = Math.max(this.btnCredits.bottom(), this.txtTranifex.bottom());
    } else {
      this.txtTranifex.setPos(0, this.y);
      this.txtTranifex.maxWidth$int($J.d2i(this.width_));
      this.height_ = this.txtTranifex.bottom();
    }
  }
}

let $WndSettings$1: any = null;
/** An anonymous class (WndSettings.java:86). */
function WndSettings$1(): any {
  return $WndSettings$1 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.display.visible_ = this.$outer.display.active = value;
      if (value) {
        WndSettings.last_index = 0;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$1', []);
}

let $WndSettings$2: any = null;
/** An anonymous class (WndSettings.java:100). */
function WndSettings$2(): any {
  return $WndSettings$2 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.ui.visible_ = this.$outer.ui.active = value;
      if (value) {
        WndSettings.last_index = 1;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$2', []);
}

let $WndSettings$3: any = null;
/** An anonymous class (WndSettings.java:121). */
function WndSettings$3(): any {
  return $WndSettings$3 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.input.visible_ = this.$outer.input.active = value;
      if (value) {
        WndSettings.last_index = 2;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$3', []);
}

let $WndSettings$4: any = null;
/** An anonymous class (WndSettings.java:136). */
function WndSettings$4(): any {
  return $WndSettings$4 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.data.visible_ = this.$outer.data.active = value;
      if (value) {
        WndSettings.last_index = 3;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$4', []);
}

let $WndSettings$5: any = null;
/** An anonymous class (WndSettings.java:150). */
function WndSettings$5(): any {
  return $WndSettings$5 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.audio.visible_ = this.$outer.audio.active = value;
      if (value) {
        WndSettings.last_index = 4;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$5', []);
}

let $WndSettings$6: any = null;
/** An anonymous class (WndSettings.java:165). */
function WndSettings$6(): any {
  return $WndSettings$6 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.langs.visible_ = this.$outer.langs.active = value;
      if (value) {
        WndSettings.last_index = 5;
      }
    }
    createChildren(): void {
      super.createChildren();
      switch (Messages.lang().status()) {
        case Languages$Status.X_UNFINISH:
          this.icon_.hardlight$float$float$float(1.5, 0, 0);
          break;
        case Languages$Status.__UNREVIEW:
          this.icon_.hardlight$float$float$float(1.5, 0.75, 0);
          break;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$6', []);
}

let $WndSettings$7: any = null;
/** An anonymous class (WndSettings.java:206). */
function WndSettings$7(): any {
  return $WndSettings$7 ??= $J.local(class extends JObject {
    beforeCreate(): void {
      Game.platform.resetGenerators$();
    }
    afterCreate(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$7', ['com.watabou.noosa.Game$SceneChangeCallback']);
}

let $WndSettings$DisplayTab$1: any = null;
/** An anonymous class (WndSettings.java:245). */
function WndSettings$DisplayTab$1(): any {
  return $WndSettings$DisplayTab$1 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.fullscreen$boolean(this.checked$());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DisplayTab$1', []);
}

let $WndSettings$DisplayTab$2: any = null;
/** An anonymous class (WndSettings.java:261). */
function WndSettings$DisplayTab$2(): any {
  return $WndSettings$DisplayTab$2 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.landscape$boolean(this.checked$());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DisplayTab$2', []);
}

let $WndSettings$DisplayTab$3: any = null;
/** An anonymous class (WndSettings.java:276). */
function WndSettings$DisplayTab$3(): any {
  return $WndSettings$DisplayTab$3 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.brightness$int(this.getSelectedValue());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DisplayTab$3', []);
}

let $WndSettings$DisplayTab$4: any = null;
/** An anonymous class (WndSettings.java:286). */
function WndSettings$DisplayTab$4(): any {
  return $WndSettings$DisplayTab$4 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.visualGrid$int(this.getSelectedValue());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DisplayTab$4', []);
}

let $WndSettings$DisplayTab$5: any = null;
/** An anonymous class (WndSettings.java:296). */
function WndSettings$DisplayTab$5(): any {
  return $WndSettings$DisplayTab$5 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.cameraFollow$int(this.getSelectedValue());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DisplayTab$5', []);
}

let $WndSettings$DisplayTab$6: any = null;
/** An anonymous class (WndSettings.java:306). */
function WndSettings$DisplayTab$6(): any {
  return $WndSettings$DisplayTab$6 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.screenShake$int(this.getSelectedValue());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DisplayTab$6', []);
}

let $WndSettings$UITab$1: any = null;
/** An anonymous class (WndSettings.java:391). */
function WndSettings$UITab$1(): any {
  return $WndSettings$UITab$1 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.interfaceSize$int(this.getSelectedValue());
      ShatteredPixelDungeon.seamlessResetScene$();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$1', []);
}

let $WndSettings$UITab$2: any = null;
/** An anonymous class (WndSettings.java:407). */
function WndSettings$UITab$2(): any {
  return $WndSettings$UITab$2 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      if (this.getSelectedValue() !== SPDSettings.scale$()) {
        SPDSettings.scale$int(this.getSelectedValue());
        ShatteredPixelDungeon.seamlessResetScene$();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$2', []);
}

let $WndSettings$UITab$3$1$1: any = null;
/** An anonymous class (WndSettings.java:437). */
function WndSettings$UITab$3$1$1(): any {
  return $WndSettings$UITab$3$1$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.textColor(Window.TITLE_COLOR);
      this.$outer.btnGrouped.textColor(Window.WHITE);
      this.$outer.btnCentered.textColor(Window.WHITE);
      SPDSettings.toolbarMode$String(Toolbar$Mode.SPLIT.name());
      Toolbar.updateLayout();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3$1$1', []);
}

let $WndSettings$UITab$3$1$2: any = null;
/** An anonymous class (WndSettings.java:452). */
function WndSettings$UITab$3$1$2(): any {
  return $WndSettings$UITab$3$1$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.btnSplit.textColor(Window.WHITE);
      this.textColor(Window.TITLE_COLOR);
      this.$outer.btnCentered.textColor(Window.WHITE);
      SPDSettings.toolbarMode$String(Toolbar$Mode.GROUP.name());
      Toolbar.updateLayout();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3$1$2', []);
}

let $WndSettings$UITab$3$1$3: any = null;
/** An anonymous class (WndSettings.java:467). */
function WndSettings$UITab$3$1$3(): any {
  return $WndSettings$UITab$3$1$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.btnSplit.textColor(Window.WHITE);
      this.$outer.btnGrouped.textColor(Window.WHITE);
      this.textColor(Window.TITLE_COLOR);
      SPDSettings.toolbarMode$String(Toolbar$Mode.CENTER.name());
      Toolbar.updateLayout();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3$1$3', []);
}

let $WndSettings$UITab$3$1$4: any = null;
/** An anonymous class (WndSettings.java:482). */
function WndSettings$UITab$3$1$4(): any {
  return $WndSettings$UITab$3$1$4 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.quickSwapper$boolean(this.checked$());
      Toolbar.updateLayout();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3$1$4', []);
}

let $WndSettings$UITab$3$1$5: any = null;
/** An anonymous class (WndSettings.java:497). */
function WndSettings$UITab$3$1$5(): any {
  return $WndSettings$UITab$3$1$5 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.flipToolbar$boolean(this.checked$());
      Toolbar.updateLayout();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3$1$5', []);
}

let $WndSettings$UITab$3$1$6: any = null;
/** An anonymous class (WndSettings.java:508). */
function WndSettings$UITab$3$1$6(): any {
  return $WndSettings$UITab$3$1$6 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.flipTags$boolean(this.checked$());
      GameScene.layoutTags();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3$1$6', []);
}

let $WndSettings$UITab$3$1: any = null;
/** An anonymous class (WndSettings.java:424). */
function WndSettings$UITab$3$1(): any {
  return $WndSettings$UITab$3$1 ??= $J.local(class extends Window {
    barDesc: RenderedTextBlock = null;
    btnSplit: RedButton = null;
    btnGrouped: RedButton = null;
    btnCentered: RedButton = null;
    chkQuickSwapper: CheckBox = null;
    swapperDesc: RenderedTextBlock = null;
    chkFlipToolbar: CheckBox = null;
    chkFlipTags: CheckBox = null;
    $init_anon() {
      this.barDesc = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'mode', []), 9);
      this.add$Gizmo(this.barDesc);
      this.btnSplit = new (WndSettings$UITab$3$1$1())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'split', []));
      if ($J.equals(SPDSettings.toolbarMode$(), Toolbar$Mode.SPLIT.name())) {
        this.btnSplit.textColor(Window.TITLE_COLOR);
      }
      this.add$Gizmo(this.btnSplit);
      this.btnGrouped = new (WndSettings$UITab$3$1$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'group', []));
      if ($J.equals(SPDSettings.toolbarMode$(), Toolbar$Mode.GROUP.name())) {
        this.btnGrouped.textColor(Window.TITLE_COLOR);
      }
      this.add$Gizmo(this.btnGrouped);
      this.btnCentered = new (WndSettings$UITab$3$1$3())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'center', []));
      if ($J.equals(SPDSettings.toolbarMode$(), Toolbar$Mode.CENTER.name())) {
        this.btnCentered.textColor(Window.TITLE_COLOR);
      }
      this.add$Gizmo(this.btnCentered);
      this.chkQuickSwapper = new (WndSettings$UITab$3$1$4())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'quickslot_swapper', []));
      this.chkQuickSwapper.checked$boolean(SPDSettings.quickSwapper$());
      this.add$Gizmo(this.chkQuickSwapper);
      this.swapperDesc = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'swapper_desc', []), 5);
      this.swapperDesc.hardlight(8947848);
      this.add$Gizmo(this.swapperDesc);
      this.chkFlipToolbar = new (WndSettings$UITab$3$1$5())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'flip_toolbar', []));
      this.chkFlipToolbar.checked$boolean(SPDSettings.flipToolbar$());
      this.add$Gizmo(this.chkFlipToolbar);
      this.chkFlipTags = new (WndSettings$UITab$3$1$6())().$o(this)._CheckBox(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'flip_indicators', []));
      this.chkFlipTags.checked$boolean(SPDSettings.flipTags$());
      this.add$Gizmo(this.chkFlipTags);
      this.resize(WndSettings.WIDTH_P, 0);
      this.barDesc.setPos(Math.fround((Math.fround(this.width_ - this.barDesc.width())) / 2), WndSettings.GAP);
      PixelScene.align$Component(this.barDesc);
      let btnWidth = $J.idiv($J.d2i((Math.fround(this.width_ - Math.fround(2 * WndSettings.GAP)))), 3);
      this.btnSplit.setRect(0, Math.fround(this.barDesc.bottom() + WndSettings.GAP), Math.fround(btnWidth), Math.fround((WndSettings.BTN_HEIGHT - 2) | 0));
      this.btnGrouped.setRect(Math.fround(this.btnSplit.right() + WndSettings.GAP), this.btnSplit.top(), Math.fround(btnWidth), Math.fround((WndSettings.BTN_HEIGHT - 2) | 0));
      this.btnCentered.setRect(Math.fround(this.btnGrouped.right() + WndSettings.GAP), this.btnSplit.top(), Math.fround(btnWidth), Math.fround((WndSettings.BTN_HEIGHT - 2) | 0));
      this.chkQuickSwapper.setRect(0, Math.fround(this.btnGrouped.bottom() + WndSettings.GAP), Math.fround(this.width_), Math.fround(WndSettings.BTN_HEIGHT));
      this.swapperDesc.maxWidth$int(this.width_);
      this.swapperDesc.setPos(0, Math.fround(this.chkQuickSwapper.bottom() + 1));
      if (this.width_ > 200) {
        this.chkFlipToolbar.setRect(0, Math.fround(this.swapperDesc.bottom() + WndSettings.GAP), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), Math.fround(WndSettings.BTN_HEIGHT));
        this.chkFlipTags.setRect(Math.fround(this.chkFlipToolbar.right() + WndSettings.GAP), this.chkFlipToolbar.top(), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), Math.fround(WndSettings.BTN_HEIGHT));
      } else {
        this.chkFlipToolbar.setRect(0, Math.fround(this.swapperDesc.bottom() + WndSettings.GAP), Math.fround(this.width_), Math.fround(WndSettings.BTN_HEIGHT));
        this.chkFlipTags.setRect(0, Math.fround(this.chkFlipToolbar.bottom() + WndSettings.GAP), Math.fround(this.width_), Math.fround(WndSettings.BTN_HEIGHT));
      }
      this.resize(WndSettings.WIDTH_P, $J.d2i(this.chkFlipTags.bottom()));
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3$1', []);
}

let $WndSettings$UITab$3: any = null;
/** An anonymous class (WndSettings.java:421). */
function WndSettings$UITab$3(): any {
  return $WndSettings$UITab$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      Game.scene().addToFront(new (WndSettings$UITab$3$1())().$o(this)._Window$().$init_anon());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$3', []);
}

let $WndSettings$UITab$4: any = null;
/** An anonymous class (WndSettings.java:553). */
function WndSettings$UITab$4(): any {
  return $WndSettings$UITab$4 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.flipTags$boolean(this.checked$());
      GameScene.layoutTags();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$4', []);
}

let $WndSettings$UITab$5$1: any = null;
/** An anonymous class (WndSettings.java:573). */
function WndSettings$UITab$5$1(): any {
  return $WndSettings$UITab$5$1 ??= $J.local(class extends JObject {
    beforeCreate(): void {
      SPDSettings.systemFont$boolean(this.$outer.checked$());
    }
    afterCreate(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$5$1', ['com.watabou.noosa.Game$SceneChangeCallback']);
}

let $WndSettings$UITab$5: any = null;
/** An anonymous class (WndSettings.java:569). */
function WndSettings$UITab$5(): any {
  return $WndSettings$UITab$5 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      ShatteredPixelDungeon.seamlessResetScene$SceneChangeCallback(new (WndSettings$UITab$5$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$5', []);
}

let $WndSettings$UITab$6: any = null;
/** An anonymous class (WndSettings.java:589). */
function WndSettings$UITab$6(): any {
  return $WndSettings$UITab$6 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.vibration$boolean(this.checked$());
      if (this.checked$()) {
        Game.vibrate(250);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab$6', []);
}

let $WndSettings$InputTab$1: any = null;
/** An anonymous class (WndSettings.java:679). */
function WndSettings$InputTab$1(): any {
  return $WndSettings$InputTab$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      Game.scene().addToFront(new WndKeyBindings()._WndKeyBindings(false));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$InputTab$1', []);
}

let $WndSettings$InputTab$2: any = null;
/** An anonymous class (WndSettings.java:691). */
function WndSettings$InputTab$2(): any {
  return $WndSettings$InputTab$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      Game.scene().addToFront(new WndKeyBindings()._WndKeyBindings(true));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$InputTab$2', []);
}

let $WndSettings$InputTab$3: any = null;
/** An anonymous class (WndSettings.java:712). */
function WndSettings$InputTab$3(): any {
  return $WndSettings$InputTab$3 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.controllerPointerSensitivity$int(this.getSelectedValue());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$InputTab$3', []);
}

let $WndSettings$InputTab$4: any = null;
/** An anonymous class (WndSettings.java:727). */
function WndSettings$InputTab$4(): any {
  return $WndSettings$InputTab$4 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.movementHoldSensitivity$int(this.getSelectedValue());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$InputTab$4', []);
}

let $WndSettings$DataTab$1: any = null;
/** An anonymous class (WndSettings.java:795). */
function WndSettings$DataTab$1(): any {
  return $WndSettings$DataTab$1 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.news$boolean(this.checked$());
      News.clearArticles();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DataTab$1', []);
}

let $WndSettings$DataTab$2: any = null;
/** An anonymous class (WndSettings.java:807). */
function WndSettings$DataTab$2(): any {
  return $WndSettings$DataTab$2 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.updates$boolean(this.checked$());
      Updates.clearUpdate();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DataTab$2', []);
}

let $WndSettings$DataTab$3: any = null;
/** An anonymous class (WndSettings.java:819). */
function WndSettings$DataTab$3(): any {
  return $WndSettings$DataTab$3 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.betas$boolean(this.checked$());
      Updates.clearUpdate();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DataTab$3', []);
}

let $WndSettings$DataTab$4: any = null;
/** An anonymous class (WndSettings.java:833). */
function WndSettings$DataTab$4(): any {
  return $WndSettings$DataTab$4 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.WiFi$boolean(this.checked$());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DataTab$4', []);
}

let $WndSettings$AudioTab$1: any = null;
/** An anonymous class (WndSettings.java:902). */
function WndSettings$AudioTab$1(): any {
  return $WndSettings$AudioTab$1 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.musicVol$int(this.getSelectedValue());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$AudioTab$1', []);
}

let $WndSettings$AudioTab$2: any = null;
/** An anonymous class (WndSettings.java:911). */
function WndSettings$AudioTab$2(): any {
  return $WndSettings$AudioTab$2 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.music$boolean(!this.checked$());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$AudioTab$2', []);
}

let $WndSettings$AudioTab$3: any = null;
/** An anonymous class (WndSettings.java:924). */
function WndSettings$AudioTab$3(): any {
  return $WndSettings$AudioTab$3 ??= $J.local(class extends OptionSlider {
    onChange(): void {
      SPDSettings.SFXVol$int(this.getSelectedValue());
      if (Random.Int$int(100) === 0) {
        Sample.INSTANCE.play$Object(Assets$Sounds.MIMIC);
      } else {
        Sample.INSTANCE.play$Object(Random.oneOf([Assets$Sounds.GOLD, Assets$Sounds.HIT, Assets$Sounds.ITEM, Assets$Sounds.SHATTER, Assets$Sounds.EVOKE, Assets$Sounds.SECRET]));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$AudioTab$3', []);
}

let $WndSettings$AudioTab$4: any = null;
/** An anonymous class (WndSettings.java:943). */
function WndSettings$AudioTab$4(): any {
  return $WndSettings$AudioTab$4 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.soundFx$boolean(!this.checked$());
      Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$AudioTab$4', []);
}

let $WndSettings$AudioTab$5: any = null;
/** An anonymous class (WndSettings.java:959). */
function WndSettings$AudioTab$5(): any {
  return $WndSettings$AudioTab$5 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.ignoreSilentMode$boolean(this.checked$());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$AudioTab$5', []);
}

let $WndSettings$AudioTab$6: any = null;
/** An anonymous class (WndSettings.java:974). */
function WndSettings$AudioTab$6(): any {
  return $WndSettings$AudioTab$6 ??= $J.local(class extends CheckBox {
    onClick(): void {
      super.onClick();
      SPDSettings.playMusicInBackground$boolean(this.checked$());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$AudioTab$6', []);
}

let $WndSettings$LangsTab$1$1: any = null;
/** An anonymous class (WndSettings.java:1089). */
function WndSettings$LangsTab$1$1(): any {
  return $WndSettings$LangsTab$1$1 ??= $J.local(class extends JObject {
    beforeCreate(): void {
      SPDSettings.language$Languages(this.$cv_langs.get(this.$cv_langIndex));
      GameLog.wipe();
      Game.platform.resetGenerators$();
    }
    afterCreate(): void {
    }
    $c($langs, $langIndex): this {
      this.$cv_langs = $langs; this.$cv_langIndex = $langIndex;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$LangsTab$1$1', ['com.watabou.noosa.Game$SceneChangeCallback']);
}

let $WndSettings$LangsTab$1: any = null;
/** An anonymous class (WndSettings.java:1084). */
function WndSettings$LangsTab$1(): any {
  return $WndSettings$LangsTab$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      Messages.setup(this.$cv_langs.get(this.$cv_langIndex));
      ShatteredPixelDungeon.seamlessResetScene$SceneChangeCallback(new (WndSettings$LangsTab$1$1())().$o(this).$c(this.$cv_langs, this.$cv_langIndex));
    }
    $c($langs, $langIndex): this {
      this.$cv_langs = $langs; this.$cv_langIndex = $langIndex;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$LangsTab$1', []);
}

let $WndSettings$LangsTab$2: any = null;
/** An anonymous class (WndSettings.java:1128). */
function WndSettings$LangsTab$2(): any {
  return $WndSettings$LangsTab$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      let reviewers = this.$cv_currLang.reviewers();
      let translators = this.$cv_currLang.translators();
      let totalCredits = (Math.imul(2, reviewers.length) + translators.length) | 0;
      let totalTokens = Math.imul(2, totalCredits);
      if (reviewers.length > 0) {
        totalTokens = (totalTokens + 6) | 0;
      }
      totalTokens = (totalTokens + 4) | 0;
      let entries = $J.newArray(totalTokens, null);
      let index = 0;
      if (reviewers.length > 0) {
        entries[0] = '_';
        entries[1] = Messages.titleCase(Messages.get$Object$String$ObjectArr(this.$outer, 'reviewers', []));
        entries[2] = '_';
        entries[3] = '\n';
        index = 4;
        for (let i = 0; i < reviewers.length; i++) {
          entries[index] = reviewers[i];
          if (i < ((reviewers.length - 1) | 0)) {
            entries[index] += ', ';
          }
          (entries[(index + 1) | 0]) = ' ';
          index = (index + 2) | 0;
        }
        entries[index] = '\n';
        (entries[(index + 1) | 0]) = '\n';
        index = (index + 2) | 0;
      }
      entries[index] = '_';
      (entries[(index + 1) | 0]) = Messages.titleCase(Messages.get$Object$String$ObjectArr(this.$outer, 'translators', []));
      (entries[(index + 2) | 0]) = '_';
      (entries[(index + 3) | 0]) = '\n';
      index = (index + 4) | 0;
      for (let i = 0; i < reviewers.length; i++) {
        entries[index] = reviewers[i];
        if (i < ((reviewers.length - 1) | 0) || translators.length > 0) {
          entries[index] += ', ';
        }
        (entries[(index + 1) | 0]) = ' ';
        index = (index + 2) | 0;
      }
      for (let i = 0; i < translators.length; i++) {
        entries[index] = translators[i];
        if (i < ((translators.length - 1) | 0)) {
          entries[index] += ', ';
        }
        (entries[(index + 1) | 0]) = ' ';
        index = (index + 2) | 0;
      }
      let credits = new Window()._Window$int$int$NinePatch(0, 0, Chrome.get(Chrome$Type.TOAST));
      let w = PixelScene.landscape() ? 120 : 80;
      if (totalCredits >= 25) {
        w = $J.d2i(Math.fround(w * 1.5));
      }
      let title = PixelScene.renderTextBlock$int(9);
      title.text$String$int(Messages.titleCase(Messages.get$Object$String$ObjectArr(this.$outer, 'credits', [])), w);
      title.hardlight(Window.TITLE_COLOR);
      title.setPos(Math.fround((Math.fround(w - title.width())) / 2), 0);
      credits.add$Gizmo(title);
      let text = PixelScene.renderTextBlock$int(7);
      text.maxWidth$int(w);
      text.tokens(entries);
      text.setPos(0, Math.fround(title.bottom() + 4));
      credits.add$Gizmo(text);
      credits.resize(w, ($J.d2i(text.bottom()) + 2) | 0);
      Game.scene().addToFront(credits);
    }
    $c($currLang): this {
      this.$cv_currLang = $currLang;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$LangsTab$2', []);
}

$J.define(WndSettings, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', ctors: { '': '_WndSettings' }, clinit: true, lazy: ['last_index'] });
$J.define(WndSettings$DisplayTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DisplayTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndSettings$DisplayTab' } });
$J.define(WndSettings$UITab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$UITab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndSettings$UITab' } });
$J.define(WndSettings$InputTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$InputTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndSettings$InputTab' } });
$J.define(WndSettings$DataTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$DataTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndSettings$DataTab' } });
$J.define(WndSettings$AudioTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$AudioTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndSettings$AudioTab' } });
$J.define(WndSettings$LangsTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings$LangsTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndSettings$LangsTab' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Languages$Status = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages$Status');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  News = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.news.News');
  Updates = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.updates.Updates');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CheckBox = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CheckBox');
  GameLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.GameLog');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  OptionSlider = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.OptionSlider');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  Toolbar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar');
  Toolbar$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$Mode');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  WndTabbed$IconTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$IconTab');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  Random = $J.load('com.watabou.utils.Random');
});
