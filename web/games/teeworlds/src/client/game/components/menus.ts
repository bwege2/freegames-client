// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/menus.h, menus.cpp, menus_scrollregion.cpp and menus_listbox.cpp of Teeworlds 0.7.5
// in TypeScript: the menu's state, its widgets, the menu bar, the popups and Esc. The in-game pages are in
// menus_ingame.ts, the settings in menus_settings.ts. The start menu, the server browser, the demo player and the
// editor are left out: the website is the main menu, so the menu only shows while the client is connecting or in
// game. Strings that the original keeps in char buffers are references ({ v }), the widget ids are objects.
import { vec2, str_format, Localize, ImageTex, v4, clamp, type vec4 } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CQuadItem, type CTextureHandle } from '../../engine/graphics.ts';
import { STATE_CONNECTING, STATE_DEMOPLAYBACK, STATE_LOADING, STATE_OFFLINE, STATE_ONLINE } from '../../engine/client.ts';
import { FLAG_PRESS, FLAG_RELEASE, type CEvent } from '../../engine/input.ts';
import * as K from '../../engine/keys.ts';
import { CUIRect, CORNER_ALL, CORNER_B, CORNER_BL, CORNER_T, ALIGN_CENTER, ALIGN_LEFT, type UIID } from '../ui.ts';
import { CLineInput, type CLineState } from '../lineinput.ts';
import { CComponent } from '../component.ts';
import { CBinds } from './binds.ts';
import type { CSkin } from './skins.ts';
import * as CAM from './camera.ts';
import { RenderGame, RenderPlayers, RenderServerInfo, RenderServerControl } from './menus_ingame.ts';
import { RenderSettings } from './menus_settings.ts';
import {
  CButtonContainer, LinearScrollbarScale, POPUP_NONE, POPUP_CONNECTING, POPUP_MESSAGE, POPUP_DISCONNECTED, POPUP_PURE, POPUP_SAVE_SKIN, POPUP_DELETE_SKIN,
  POPUP_SOUNDERROR, POPUP_QUIT, PAGE_GAME, PAGE_PLAYERS, PAGE_SERVER_INFO, PAGE_CALLVOTE, PAGE_INTERNET, PAGE_SETTINGS, PAGE_START, SETTINGS_GENERAL,
  SETTINGS_PLAYER, SETTINGS_TEE, SETTINGS_CONTROLS, SETTINGS_GRAPHICS, SETTINGS_SOUND, ms_ButtonHeight, ms_ListheaderHeight, ms_FontmodHeight, type CStrRef, type CNumRef, type IScrollbarScale,
} from './menus_ui.ts';

// component to fetch keypresses, override all other input
export class CMenusKeyBinder extends CComponent {
  m_TakeKey = false;
  m_GotKey = false;
  m_Modifier = 0;
  m_Key: CEvent = { m_Flags: 0, m_Key: 0, m_aText: '', m_InputCount: 0 };
  override OnInput(Event: CEvent): boolean {
    if (this.m_TakeKey) {
      const TriggeringEvent = Event.m_Key === K.KEY_MOUSE_1 ? FLAG_PRESS : FLAG_RELEASE;
      if (Event.m_Flags & TriggeringEvent) { // delay to RELEASE to support composed binds
        this.m_Key = Event;
        this.m_GotKey = true;
        this.m_TakeKey = false;
        let Mask = CBinds.GetModifierMask(this.Input()); // always > 0
        this.m_Modifier = 0;
        while (!(Mask & 1)) { // this computes a log2, we take the first modifier flag in mask.
          Mask >>= 1;
          this.m_Modifier++;
        }
        // prevent from adding e.g. a control modifier to lctrl
        if (CBinds.ModifierMatchesKey(this.m_Modifier, Event.m_Key)) this.m_Modifier = 0;
      }
      return true;
    }
    return false;
  }
}

export interface CSwitchTeamInfo { m_aNotification: string; m_AllowSpec: boolean; m_TimeLeft: number }

// statics of the widgets
let s_EditAtIndex = 0, s_EditDoScroll = false, s_EditScrollStart = 0;
let s_ScrollOffsetY = 0, s_ScrollOffsetX = 0;
let s_KeyGrabbedID: UIID = null, s_KeyMouseReleased = true, s_KeyButtonUsed = 0;
const s_QuitButton = new CButtonContainer();
const s_PopupButtonNo = new CButtonContainer(), s_PopupButtonYes = new CButtonContainer(), s_PopupButton = new CButtonContainer();
const s_GameButton = new CButtonContainer(), s_PlayersButton = new CButtonContainer(), s_ServerInfoButton = new CButtonContainer(),
  s_CallVoteButton = new CButtonContainer(), s_SettingsButton = new CButtonContainer();
const s_SettingsTabs: [CButtonContainer, string, number, number][] = [
  [new CButtonContainer(), 'General', SETTINGS_GENERAL, CAM.POS_SETTINGS_GENERAL],
  [new CButtonContainer(), 'Player', SETTINGS_PLAYER, CAM.POS_SETTINGS_PLAYER],
  [new CButtonContainer(), 'Tee', SETTINGS_TEE, CAM.POS_SETTINGS_TEE],
  [new CButtonContainer(), 'Controls', SETTINGS_CONTROLS, CAM.POS_SETTINGS_CONTROLS],
  [new CButtonContainer(), 'Graphics', SETTINGS_GRAPHICS, CAM.POS_SETTINGS_GRAPHICS],
  [new CButtonContainer(), 'Sound', SETTINGS_SOUND, CAM.POS_SETTINGS_SOUND],
];
const s_OffsetSaveSkin: CNumRef = { v: 0 };

export class CMenus extends CComponent {
  static readonly ms_ButtonHeight = ms_ButtonHeight;
  static readonly ms_ListheaderHeight = ms_ListheaderHeight;
  static readonly ms_FontmodHeight = ms_FontmodHeight;

  m_Binder = new CMenusKeyBinder();
  m_GamePage = PAGE_GAME;
  m_Popup = POPUP_NONE;
  m_ActivePage = PAGE_INTERNET;
  m_MenuPage = PAGE_START;
  m_MenuActive = true;
  m_UseMouseButtons = true;
  m_MousePos = new vec2(0, 0);
  m_PrevMousePos = new vec2(0, 0);
  m_CursorActive = false;
  m_PrevCursorActive = false;
  m_PopupActive = false;
  m_SkinModified = false;
  m_KeyReaderWasActive = false;
  m_KeyReaderIsActive = false;
  m_aMessageTopic = '';
  m_aMessageBody = '';
  m_aMessageButton = '';
  m_NextPopup = POPUP_NONE;
  // for settings
  m_NeedRestartPlayer = false;
  m_NeedRestartGraphics = false;
  m_NeedRestartSound = false;
  m_TeePartSelected = 0;
  m_aSaveSkinName: CStrRef = { v: '' };
  m_RefreshSkinSelector = true;
  m_pSelectedSkin: CSkin | null = null;
  m_EscapePressed = false;
  m_EnterPressed = false;
  m_TabPressed = false;
  m_DeletePressed = false;
  m_UpArrowPressed = false;
  m_DownArrowPressed = false;
  // for call vote
  m_CallvoteSelectedOption = 0;
  m_CallvoteSelectedPlayer = -1;
  m_aFilterString: CStrRef = { v: '' };
  m_aCallvoteReason: CStrRef = { v: '' };
  // for callbacks
  m_pActiveDropdown: UIID = null;
  // loading
  m_LoadCurrent = 0;
  m_LoadTotal = 0;
  private m_TextureBlob: CTextureHandle | null = null;
  /** the player quits (the Yes of the Quit popup): host.ts leaves the game */
  onQuit: (() => void) | null = null;

  IsActive(): boolean { return this.m_MenuActive; }
  UseMouseButtons(Use: boolean): void { this.m_UseMouseButtons = Use; }
  GetListHeaderHeight(): number { return CMenus.ms_ListheaderHeight + (this.Config().m_UiWideview ? 3 : 0); }
  GetListHeaderHeightFactor(): number { return 1 + (this.Config().m_UiWideview ? 3 / CMenus.ms_ListheaderHeight : 0); }

  ButtonFade(pBC: CButtonContainer, Seconds: number, Checked = 0): number {
    if (this.UI().HotItem() === pBC.GetID() || Checked) {
      pBC.m_FadeStartTime = this.Client().LocalTime();
      return Seconds;
    }
    return Math.max(0, pBC.m_FadeStartTime - this.Client().LocalTime() + Seconds);
  }

  DoIcon(ImageId: number, SpriteId: number, pRect: CUIRect): number {
    const G = this.Graphics();
    G.TextureSet(ImageTex(ImageId));
    G.QuadsBegin();
    this.RenderTools().SelectSprite(SpriteId);
    G.QuadsDrawTL([new CQuadItem(pRect.x, pRect.y, pRect.w, pRect.h)], 1);
    G.QuadsEnd();
    return 0;
  }

  DoIconColor(ImageId: number, SpriteId: number, pRect: CUIRect, Color: vec4): void {
    const G = this.Graphics();
    G.TextureSet(ImageTex(ImageId));
    G.QuadsBegin();
    this.RenderTools().SelectSprite(SpriteId);
    G.SetColor(Color.r * Color.a, Color.g * Color.a, Color.b * Color.a, Color.a);
    G.QuadsDrawTL([new CQuadItem(pRect.x, pRect.y, pRect.w, pRect.h)], 1);
    G.QuadsEnd();
  }

  DoButton_Toggle(pID: UIID, Checked: number | boolean, pRect: CUIRect, Active: boolean): number {
    const G = this.Graphics(), RT = this.RenderTools();
    G.TextureSet(ImageTex(C.IMAGE_GUIBUTTONS));
    G.QuadsBegin();
    if (!Active) G.SetColor(1, 1, 1, 0.5);
    RT.SelectSprite(Checked ? C.SPRITE_GUIBUTTON_ON : C.SPRITE_GUIBUTTON_OFF);
    G.QuadsDrawTL([new CQuadItem(pRect.x, pRect.y, pRect.w, pRect.h)], 1);
    if (this.UI().HotItem() === pID && Active) {
      RT.SelectSprite(C.SPRITE_GUIBUTTON_HOVER);
      G.QuadsDrawTL([new CQuadItem(pRect.x, pRect.y, pRect.w, pRect.h)], 1);
    }
    G.QuadsEnd();
    return Active ? this.UI().DoButtonLogic(pID, pRect) : 0;
  }

  DoButton_Menu(pBC: CButtonContainer, pText: string, Checked: number | boolean, pRect: CUIRect, _pImageName: string | null = null, Corners = CORNER_ALL, r = 5,
    FontFactor = 0, ColorHot: vec4 = v4(1, 1, 1, 0.75), TextFade = true): number {
    const Seconds = 0.6; //  0.6 seconds for fade
    const Fade = this.ButtonFade(pBC, Seconds, Checked ? 1 : 0);
    const FadeVal = Fade / Seconds;
    const Text = pRect.copy();
    const Color = v4(ColorHot.r * FadeVal, ColorHot.g * FadeVal, ColorHot.b * FadeVal, 0.25 + (ColorHot.a - 0.25) * FadeVal);
    this.RenderTools().DrawUIRect(pRect, Color, Corners, r);
    // the menu images (pImageName) belong to the start menu, which the port leaves out
    Text.HMargin(pRect.h >= 20 ? 2 : 1, Text);
    Text.HMargin((Text.h * FontFactor) / 2, Text);
    const T = this.TextRender();
    if (TextFade) {
      T.TextColor(1 - FadeVal, 1 - FadeVal, 1 - FadeVal, 1);
      T.TextOutlineColor(0 + FadeVal, 0 + FadeVal, 0 + FadeVal, 0.25);
    }
    this.UI().DoLabel(Text, pText, Text.h * CMenus.ms_FontmodHeight, ALIGN_CENTER);
    if (TextFade) {
      T.TextColor(1, 1, 1, 1);
      T.TextOutlineColor(0, 0, 0, 0.3);
    }
    return this.UI().DoButtonLogic(pBC.GetID(), pRect);
  }

  DoButton_KeySelect(pBC: CButtonContainer, pText: string, Checked: number, pRect: CUIRect): void {
    const Seconds = 0.6;
    const FadeVal = this.ButtonFade(pBC, Seconds, Checked) / Seconds;
    this.RenderTools().DrawUIRect(pRect, v4(0 + FadeVal, 0 + FadeVal, 0 + FadeVal, 0.25 + FadeVal * 0.5), CORNER_ALL, 5);
    const Temp = new CUIRect();
    pRect.HMargin(1, Temp);
    const T = this.TextRender();
    T.TextColor(1 - FadeVal, 1 - FadeVal, 1 - FadeVal, 1);
    T.TextOutlineColor(0 + FadeVal, 0 + FadeVal, 0 + FadeVal, 0.25);
    this.UI().DoLabel(Temp, pText, Temp.h * CMenus.ms_FontmodHeight, ALIGN_CENTER);
    T.TextColor(1, 1, 1, 1);
    T.TextOutlineColor(0, 0, 0, 0.3);
  }

  DoButton_MenuTab(pID: UIID, pText: string, Checked: number | boolean, pRect: CUIRect, Corners: number): number {
    if (Checked) this.RenderTools().DrawUIRect(pRect, v4(1, 1, 1, 0.25), Corners, 10);
    else {
      this.RenderTools().DrawUIRect(pRect, v4(0, 0, 0, 0.25), Corners, 10);
      this.TextRender().TextColor(1, 1, 1, 0.7);
    }
    const Temp = new CUIRect();
    pRect.HMargin(pRect.h >= 20 ? 2 : 1, Temp);
    this.UI().DoLabel(Temp, pText, Temp.h * CMenus.ms_FontmodHeight, ALIGN_CENTER);
    this.TextRender().TextColor(1, 1, 1, 1);
    return this.UI().DoButtonLogic(pID, pRect);
  }

  DoButton_MenuTabTop(pBC: CButtonContainer, pText: string, Checked: number | boolean, pRect: CUIRect, Alpha = 1, FontAlpha = 1, Corners = CORNER_ALL, r = 5, FontFactor = 0): number {
    if (this.UI().MouseInside(pRect)) Alpha = 1;
    const Seconds = 0.6;
    const Fade = this.ButtonFade(pBC, Seconds, Checked ? 1 : 0);
    const FadeVal = (Fade / Seconds) * FontAlpha;
    this.RenderTools().DrawUIRect(pRect, v4(0 + FadeVal, 0 + FadeVal, 0 + FadeVal, (this.Config().m_ClMenuAlpha / 100) * Alpha + FadeVal * 0.5), Corners, r);
    const Temp = new CUIRect();
    pRect.HMargin(pRect.h >= 20 ? 2 : 1, Temp);
    Temp.HMargin((Temp.h * FontFactor) / 2, Temp);
    const T = this.TextRender();
    T.TextColor(1 - FadeVal, 1 - FadeVal, 1 - FadeVal, FontAlpha);
    T.TextOutlineColor(0 + FadeVal, 0 + FadeVal, 0 + FadeVal, 0.25 * FontAlpha);
    this.UI().DoLabel(Temp, pText, Temp.h * CMenus.ms_FontmodHeight, ALIGN_CENTER);
    T.TextColor(1, 1, 1, 1);
    T.TextOutlineColor(0, 0, 0, 0.3);
    return this.UI().DoButtonLogic(pBC.GetID(), pRect);
  }

  DoButton_GridHeader(pID: UIID, pText: string, Checked: number | boolean, Align: number, pRect: CUIRect): number {
    const T = this.TextRender();
    if (Checked) {
      this.RenderTools().DrawUIRect(pRect, v4(0.9, 0.9, 0.9, 0.5), CORNER_ALL, 5);
      T.TextColor(0, 0, 0, 1);
      T.TextOutlineColor(1, 1, 1, 0.25);
    } else if (this.UI().HotItem() === pID) this.RenderTools().DrawUIRect(pRect, v4(1, 1, 1, 0.5), CORNER_ALL, 5);
    const Label = new CUIRect();
    pRect.VMargin(2, Label);
    Label.y += 2;
    this.UI().DoLabel(Label, pText, pRect.h * CMenus.ms_FontmodHeight * 0.8, Align);
    if (Checked) {
      T.TextColor(1, 1, 1, 1);
      T.TextOutlineColor(0, 0, 0, 0.3);
    }
    return this.UI().DoButtonLogic(pID, pRect);
  }

  DoButton_CheckBox_Common(pID: UIID, pText: string, pBoxText: string, pRect: CUIRect, Checked = false, Locked = false): number {
    const G = this.Graphics(), RT = this.RenderTools();
    RT.DrawUIRect(pRect, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    const c = pRect.copy(), t = pRect.copy();
    c.w = c.h;
    t.x += c.w;
    t.w -= c.w;
    t.VSplitLeft(5, null, t);
    c.Margin(2, c);
    G.TextureSet(ImageTex(C.IMAGE_MENUICONS));
    G.QuadsBegin();
    if (Locked) G.SetColor(0.5, 0.5, 0.5, 1);
    else G.SetColor(1, 1, 1, 1);
    if (this.UI().HotItem() === pID) {
      RT.SelectSprite(C.SPRITE_MENU_CHECKBOX_HOVER);
      G.QuadsDrawTL([new CQuadItem(c.x, c.y, c.w, c.h)], 1);
    }
    RT.SelectSprite(Checked ? C.SPRITE_MENU_CHECKBOX_ACTIVE : C.SPRITE_MENU_CHECKBOX_INACTIVE);
    G.QuadsDrawTL([new CQuadItem(c.x, c.y, c.w, c.h)], 1);
    G.QuadsEnd();
    t.y += 1; // lame fix
    this.UI().DoLabel(c, pBoxText, pRect.h * CMenus.ms_FontmodHeight * 0.6, ALIGN_CENTER);
    this.UI().DoLabel(t, pText, pRect.h * CMenus.ms_FontmodHeight * 0.8, ALIGN_LEFT);
    return this.UI().DoButtonLogic(pID, pRect);
  }

  DoButton_CheckBox(pID: UIID, pText: string, Checked: number | boolean, pRect: CUIRect, Locked = false): number {
    if (Locked) {
      this.TextRender().TextColor(0.5, 0.5, 0.5, 1);
      this.DoButton_CheckBox_Common(pID, pText, '', pRect, !!Checked, Locked);
      this.TextRender().TextColor(1, 1, 1, 1);
      return 0;
    }
    return this.DoButton_CheckBox_Common(pID, pText, '', pRect, !!Checked, Locked);
  }

  DoButton_CheckBox_Number(pID: UIID, pText: string, SelectedNumber: number, pRect: CUIRect): number {
    return this.DoButton_CheckBox_Common(pID, pText, str_format(16, '%d', SelectedNumber), pRect);
  }

  DoButton_SpriteID(pBC: CButtonContainer, ImageID: number, SpriteID: number, Checked: boolean, pRect: CUIRect, Corners = CORNER_ALL, r = 5, Fade = true): number {
    const Seconds = 0.6;
    const FadeVal = Fade ? this.ButtonFade(pBC, Seconds, Checked ? 1 : 0) / Seconds : 0;
    this.RenderTools().DrawUIRect(pRect, v4(0 + FadeVal, 0 + FadeVal, 0 + FadeVal, 0.25 + FadeVal * 0.5), Corners, r);
    const Icon = pRect.copy();
    if (Icon.w > Icon.h) Icon.VMargin((Icon.w - Icon.h) / 2, Icon);
    else if (Icon.w < Icon.h) Icon.HMargin((Icon.h - Icon.w) / 2, Icon);
    Icon.Margin(2, Icon);
    const G = this.Graphics();
    G.TextureSet(ImageTex(ImageID));
    G.QuadsBegin();
    G.SetColor(1, 1, 1, 1);
    this.RenderTools().SelectSprite(SpriteID);
    G.QuadsDrawTL([new CQuadItem(Icon.x, Icon.y, Icon.w, Icon.h)], 1);
    G.QuadsEnd();
    return this.UI().DoButtonLogic(pBC.GetID(), pRect);
  }

  DoButton_SpriteClean(ImageID: number, SpriteID: number, pRect: CUIRect): number {
    const Inside = this.UI().MouseInside(pRect);
    const G = this.Graphics();
    G.TextureSet(ImageTex(ImageID));
    G.QuadsBegin();
    G.SetColor(1, 1, 1, Inside ? 1 : 0.6);
    this.RenderTools().SelectSprite(SpriteID);
    G.QuadsDrawTL([new CQuadItem(pRect.x, pRect.y, pRect.w, pRect.h)], 1);
    G.QuadsEnd();
    return Inside && this.Input().KeyPress(K.KEY_MOUSE_1) ? 1 : 0;
  }

  DoButton_SpriteCleanID(pID: UIID, ImageID: number, SpriteID: number, pRect: CUIRect, Blend = true): number {
    const Inside = this.UI().MouseInside(pRect);
    const G = this.Graphics();
    G.TextureSet(ImageTex(ImageID));
    G.QuadsBegin();
    G.SetColor(1, 1, 1, !Blend || Inside ? 1 : 0.6);
    this.RenderTools().SelectSprite(SpriteID);
    G.QuadsDrawTL([new CQuadItem(pRect.x, pRect.y, pRect.w, pRect.h)], 1);
    G.QuadsEnd();
    return this.UI().DoButtonLogic(pID, pRect);
  }

  DoButton_MouseOver(ImageID: number, SpriteID: number, pRect: CUIRect): boolean {
    const Inside = this.UI().MouseInside(pRect);
    const G = this.Graphics();
    G.TextureSet(ImageTex(ImageID));
    G.QuadsBegin();
    G.SetColor(1, 1, 1, Inside ? 1 : 0.6);
    this.RenderTools().SelectSprite(SpriteID);
    G.QuadsDrawTL([new CQuadItem(pRect.x, pRect.y, pRect.w, pRect.h)], 1);
    G.QuadsEnd();
    return Inside;
  }

  DoEditBox(pID: UIID, pRect: CUIRect, pStr: CStrRef, StrSize: number, FontSize: number, pOffset: CNumRef, Hidden = false, Corners = CORNER_ALL): boolean {
    const UI = this.UI(), T = this.TextRender(), In = this.Input();
    const Inside = UI.MouseInside(pRect);
    let Changed = false, UpdateOffset = false;
    if (UI.LastActiveItem() === pID) {
      let Len = pStr.v.length;
      if (Len === 0) s_EditAtIndex = 0;
      if (Inside && UI.MouseButton(0)) {
        s_EditDoScroll = true;
        s_EditScrollStart = UI.MouseX();
        const MxRel = Math.trunc(UI.MouseX() - pRect.x);
        for (let i = 1; i <= Len; i++) {
          if (T.TextWidth(0, FontSize, pStr.v, i, -1) - pOffset.v > MxRel) {
            s_EditAtIndex = i - 1;
            break;
          }
          if (i === Len) s_EditAtIndex = Len;
        }
      } else if (!UI.MouseButton(0)) s_EditDoScroll = false;
      else if (s_EditDoScroll) {
        // do scrolling
        if (UI.MouseX() < pRect.x && s_EditScrollStart - UI.MouseX() > 10) {
          s_EditAtIndex = Math.max(0, s_EditAtIndex - 1);
          s_EditScrollStart = UI.MouseX();
          UpdateOffset = true;
        } else if (UI.MouseX() > pRect.x + pRect.w && UI.MouseX() - s_EditScrollStart > 10) {
          s_EditAtIndex = Math.min(Len, s_EditAtIndex + 1);
          s_EditScrollStart = UI.MouseX();
          UpdateOffset = true;
        }
      } else if (!Inside && UI.MouseButton(0)) {
        s_EditAtIndex = Math.min(s_EditAtIndex, pStr.v.length);
        s_EditDoScroll = false;
        UI.SetActiveItem(null);
        UI.ClearLastActiveItem();
      }
      if (UI.LastActiveItem() === pID && !this.m_pClient.m_pGameConsole.IsConsoleActive()) {
        for (let i = 0; i < In.NumEvents(); i++) {
          Len = pStr.v.length;
          const s: CLineState = { str: pStr.v, len: Len, cursor: s_EditAtIndex, numChars: Len };
          const c = CLineInput.Manipulate(In.GetEvent(i), s, StrSize, StrSize, In);
          if (c) pStr.v = s.str;
          s_EditAtIndex = s.cursor;
          Changed ||= c;
        }
      }
    }
    let JustGotActive = false;
    if (UI.CheckActiveItem(pID)) {
      if (!UI.MouseButton(0)) {
        s_EditAtIndex = Math.min(s_EditAtIndex, pStr.v.length);
        s_EditDoScroll = false;
        UI.SetActiveItem(null);
      }
    } else if (UI.HotItem() === pID) {
      if (UI.MouseButton(0)) {
        if (UI.LastActiveItem() !== pID) JustGotActive = true;
        UI.SetActiveItem(pID);
      }
    }
    if (Inside) UI.SetHotItem(pID);
    const Textbox = pRect.copy();
    let Color: vec4;
    if (UI.LastActiveItem() === pID) Color = v4(0.25, 0.25, 0.25, 0.25);
    else if (Inside) Color = v4(0.5, 0.5, 0.5, 0.25);
    else Color = v4(0, 0, 0, 0.25);
    this.RenderTools().DrawUIRect(Textbox, Color, Corners, 5);
    Textbox.VMargin(2, Textbox);
    Textbox.HMargin(2, Textbox);
    const pDisplayStr = Hidden ? '*'.repeat(Math.min(pStr.v.length, 127)) : pStr.v;
    // check if the text has to be moved
    if (UI.LastActiveItem() === pID && !JustGotActive && (UpdateOffset || In.NumEvents())) {
      const w = T.TextWidth(0, FontSize, pDisplayStr, s_EditAtIndex, -1);
      if (w - pOffset.v > Textbox.w) {
        // move to the left
        const wt = T.TextWidth(0, FontSize, pDisplayStr, -1, -1);
        do pOffset.v += Math.min(wt - pOffset.v - Textbox.w, Textbox.w / 3);
        while (w - pOffset.v > Textbox.w);
      } else if (w - pOffset.v < 0) {
        // move to the right
        do pOffset.v = Math.max(0, pOffset.v - Textbox.w / 3);
        while (w - pOffset.v < 0);
      }
    }
    UI.ClipEnable(pRect);
    Textbox.x -= pOffset.v;
    UI.DoLabel(Textbox, pDisplayStr, FontSize, ALIGN_LEFT);
    // render the cursor
    if (UI.LastActiveItem() === pID && !JustGotActive) {
      // set cursor active
      this.m_CursorActive = true;
      const w = T.TextWidth(0, FontSize, pDisplayStr, s_EditAtIndex, -1);
      const Cur = pRect.copy();
      Cur.VSplitLeft(2, null, Cur);
      Cur.x += w - pOffset.v - T.TextWidth(0, FontSize, '|', -1, -1) / 2;
      if (Math.trunc((2 * this.Client().time_get()) / TIME_FREQ) % 2) UI.DoLabel(Cur, '|', FontSize, ALIGN_LEFT); // make it blink
    }
    UI.ClipDisable();
    return Changed;
  }

  DoEditBoxOption(pID: UIID, pOption: CStrRef, OptionLength: number, pRect: CUIRect, pStr: string, VSplitVal: number, pOffset: CNumRef, Hidden = false): void {
    this.RenderTools().DrawUIRect(pRect, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    const Label = new CUIRect(), EditBox = new CUIRect();
    pRect.VSplitLeft(VSplitVal, Label, EditBox);
    Label.y += 2;
    this.UI().DoLabel(Label, str_format(32, '%s:', pStr), pRect.h * CMenus.ms_FontmodHeight * 0.8, ALIGN_CENTER);
    this.DoEditBox(pID, EditBox, pOption, OptionLength, pRect.h * CMenus.ms_FontmodHeight * 0.8, pOffset, Hidden);
  }

  /** DoScrollbarOption: the new value of the option */
  DoScrollbarOption(pID: UIID, Option: number, pRect: CUIRect, pStr: string, Min: number, Max: number, pScale: IScrollbarScale = LinearScrollbarScale, Infinite = false): number {
    let Value = Option;
    if (Infinite) {
      Min += 1;
      Max += 1;
      if (Value === 0) Value = Max;
    }
    const aBufMax = str_format(128, '%s: %i', pStr, Max);
    const aBuf = !Infinite || Value !== Max ? str_format(128, '%s: %i', pStr, Value) : str_format(128, '%s: \xe2\x88\x9e', pStr);
    const FontSize = pRect.h * CMenus.ms_FontmodHeight * 0.8;
    const T = this.TextRender();
    const VSplitVal = Math.max(T.TextWidth(0, FontSize, aBuf, -1, -1), T.TextWidth(0, FontSize, aBufMax, -1, -1));
    this.RenderTools().DrawUIRect(pRect, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    const Label = new CUIRect(), ScrollBar = new CUIRect();
    pRect.VSplitLeft(pRect.h + 10 + VSplitVal, Label, ScrollBar);
    Label.VSplitLeft(Label.h + 5, null, Label);
    Label.y += 2;
    this.UI().DoLabel(Label, aBuf, FontSize, ALIGN_LEFT);
    ScrollBar.VMargin(4, ScrollBar);
    Value = pScale.ToAbsolute(this.DoScrollbarH(pID, ScrollBar, pScale.ToRelative(Value, Min, Max)), Min, Max);
    if (Infinite && Value === Max) Value = 0;
    return Value;
  }

  DoScrollbarOptionLabeled(pID: UIID, Option: number, pRect: CUIRect, pStr: string, aLabels: string[], Num: number, pScale: IScrollbarScale = LinearScrollbarScale): number {
    let Value = clamp(Option, 0, Num - 1);
    const Max = Num - 1;
    const aBuf = str_format(128, '%s: %s', pStr, aLabels[Value]);
    const FontSize = pRect.h * CMenus.ms_FontmodHeight * 0.8;
    this.RenderTools().DrawUIRect(pRect, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    const Label = new CUIRect(), ScrollBar = new CUIRect();
    pRect.VSplitLeft(5, null, Label);
    Label.VSplitRight(60, Label, ScrollBar);
    Label.y += 2;
    this.UI().DoLabel(Label, aBuf, FontSize, ALIGN_LEFT);
    ScrollBar.VMargin(4, ScrollBar);
    Value = pScale.ToAbsolute(this.DoScrollbarH(pID, ScrollBar, pScale.ToRelative(Value, 0, Max)), 0, Max);
    return clamp(Value, 0, Max);
  }

  /** the header both dropdown menus draw */
  private DropdownHeader(pID: UIID, pRect: CUIRect, pStr: string, HeaderHeight: number, Active: boolean): { View: CUIRect; Clicked: boolean } {
    const View = pRect.copy(), Header = new CUIRect();
    const Corners = Active ? CORNER_T : CORNER_ALL;
    View.HSplitTop(HeaderHeight, Header, View);
    // background
    this.RenderTools().DrawUIRect(Header, v4(0, 0, 0, 0.25), Corners, 5);
    // render icon
    const Button = new CUIRect();
    Header.VSplitLeft(Header.h, Button, null);
    Button.Margin(2, Button);
    const G = this.Graphics();
    G.TextureSet(ImageTex(C.IMAGE_MENUICONS));
    G.QuadsBegin();
    if (this.UI().MouseInside(Header)) G.SetColor(1, 1, 1, 1);
    else G.SetColor(0.6, 0.6, 0.6, 1);
    this.RenderTools().SelectSprite(Active ? C.SPRITE_MENU_EXPANDED : C.SPRITE_MENU_COLLAPSED);
    G.QuadsDrawTL([new CQuadItem(Button.x, Button.y, Button.w, Button.h)], 1);
    G.SetColor(1, 1, 1, 1);
    G.QuadsEnd();
    // label
    const Label = Header.copy();
    Label.y += 2;
    this.UI().DoLabel(Label, pStr, Header.h * CMenus.ms_FontmodHeight * 0.8, ALIGN_CENTER);
    return { View, Clicked: !!this.UI().DoButtonLogic(pID, Header) };
  }

  DoDropdownMenu(pID: UIID, pRect: CUIRect, pStr: string, HeaderHeight: number, pfnCallback: (View: CUIRect) => number): number {
    const Active = pID === this.m_pActiveDropdown;
    const { View, Clicked } = this.DropdownHeader(pID, pRect, pStr, HeaderHeight, Active);
    if (Clicked) this.m_pActiveDropdown = Active ? null : pID;
    // render content of expanded menu
    if (Active) return HeaderHeight + pfnCallback(View);
    return HeaderHeight;
  }

  DoIndependentDropdownMenu(pID: UIID, pRect: CUIRect, pStr: string, HeaderHeight: number, pfnCallback: (View: CUIRect) => number, pActive: { v: boolean }): number {
    const Active = pActive.v;
    const { View, Clicked } = this.DropdownHeader(pID, pRect, pStr, HeaderHeight, Active);
    if (Clicked) pActive.v = !pActive.v;
    if (Active) return HeaderHeight + pfnCallback(View);
    return HeaderHeight;
  }

  DoInfoBox(pRect: CUIRect, pLabel: string, pValue: string): void {
    this.RenderTools().DrawUIRect(pRect, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    const Label = new CUIRect(), Value = new CUIRect();
    pRect.VSplitMid(Label, Value, 2);
    this.RenderTools().DrawUIRect(Value, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    Label.y += 2;
    this.UI().DoLabel(Label, str_format(32, '%s:', pLabel), pRect.h * CMenus.ms_FontmodHeight * 0.8, ALIGN_CENTER);
    Value.y += 2;
    this.UI().DoLabel(Value, pValue, pRect.h * CMenus.ms_FontmodHeight * 0.8, ALIGN_CENTER);
  }

  DoScrollbarV(pID: UIID, pRect: CUIRect, Current: number): number {
    const UI = this.UI();
    // layout
    const Handle = new CUIRect();
    pRect.HSplitTop(Math.min(pRect.h / 8, 33), Handle, null);
    Handle.y += (pRect.h - Handle.h) * Current;
    Handle.VMargin(5, Handle);
    const Rail = new CUIRect();
    pRect.VMargin(5, Rail);
    // logic
    const InsideHandle = UI.MouseInside(Handle);
    const InsideRail = UI.MouseInside(Rail);
    let ReturnValue = Current;
    let Grabbed = false; // whether to apply the offset
    if (UI.CheckActiveItem(pID)) {
      if (!UI.MouseButton(0)) UI.SetActiveItem(null);
      Grabbed = true;
    } else if (UI.HotItem() === pID) {
      if (UI.MouseButton(0)) {
        UI.SetActiveItem(pID);
        s_ScrollOffsetY = UI.MouseY() - Handle.y;
      }
    } else if (UI.MouseButton(0) && !InsideHandle && InsideRail) {
      const Up = UI.MouseY() < Handle.y + Handle.h / 2;
      s_ScrollOffsetY = UI.MouseY() - Handle.y + 8 * (Up ? 1 : -1);
      Grabbed = true;
    }
    if (Grabbed) {
      const Min = pRect.y, Max = pRect.h - Handle.h, Cur = UI.MouseY() - s_ScrollOffsetY;
      ReturnValue = clamp((Cur - Min) / Max, 0, 1);
    }
    if (InsideHandle) UI.SetHotItem(pID);
    // render
    this.RenderTools().DrawUIRect(Rail, v4(1, 1, 1, 0.25), CORNER_ALL, Rail.w / 2);
    const Color = Grabbed ? v4(0.9, 0.9, 0.9, 1) : InsideHandle ? v4(1, 1, 1, 1) : v4(0.8, 0.8, 0.8, 1);
    this.RenderTools().DrawUIRect(Handle, Color, CORNER_ALL, Handle.w / 2);
    return ReturnValue;
  }

  DoScrollbarH(pID: UIID, pRect: CUIRect, Current: number): number {
    const UI = this.UI();
    // layout
    const Handle = new CUIRect();
    pRect.VSplitLeft(Math.max(Math.min(pRect.w / 8, 33), pRect.h), Handle, null);
    Handle.x += (pRect.w - Handle.w) * clamp(Current, 0, 1);
    Handle.HMargin(5, Handle);
    const Rail = new CUIRect();
    pRect.HMargin(5, Rail);
    // logic
    const InsideHandle = UI.MouseInside(Handle);
    const InsideRail = UI.MouseInside(Rail);
    let ReturnValue = Current;
    let Grabbed = false;
    if (UI.CheckActiveItem(pID)) {
      if (!UI.MouseButton(0)) UI.SetActiveItem(null);
      Grabbed = true;
    } else if (UI.HotItem() === pID) {
      if (UI.MouseButton(0)) {
        UI.SetActiveItem(pID);
        s_ScrollOffsetX = UI.MouseX() - Handle.x;
      }
    } else if (UI.MouseButtonClicked(0) && !InsideHandle && InsideRail) {
      s_ScrollOffsetX = Handle.w * 0.5;
      UI.SetActiveItem(pID);
      Grabbed = true;
    }
    if (Grabbed) {
      const Min = pRect.x, Max = pRect.w - Handle.w, Cur = UI.MouseX() - s_ScrollOffsetX;
      ReturnValue = clamp((Cur - Min) / Max, 0, 1);
    }
    if (InsideHandle) UI.SetHotItem(pID);
    // render
    this.RenderTools().DrawUIRect(Rail, v4(1, 1, 1, 0.25), CORNER_ALL, Rail.h / 2);
    const Color = Grabbed ? v4(0.9, 0.9, 0.9, 1) : InsideHandle ? v4(1, 1, 1, 1) : v4(0.8, 0.8, 0.8, 1);
    this.RenderTools().DrawUIRect(Handle, Color, CORNER_ALL, Handle.h / 2);
    return ReturnValue;
  }

  /** DoKeyReader: the new key and its modifier */
  DoKeyReader(pBC: CButtonContainer, pRect: CUIRect, Key: number, Modifier: number): { Key: number; Modifier: number } {
    const UI = this.UI();
    // process
    const Inside = UI.MouseInside(pRect) && UI.MouseInsideClip();
    let NewKey = Key, NewModifier = Modifier;
    if (!UI.MouseButton(0) && !UI.MouseButton(1) && s_KeyGrabbedID === pBC.GetID()) s_KeyMouseReleased = true;
    if (UI.CheckActiveItem(pBC.GetID())) {
      if (this.m_Binder.m_GotKey) {
        // abort with escape key
        if (this.m_Binder.m_Key.m_Key !== K.KEY_ESCAPE) {
          NewKey = this.m_Binder.m_Key.m_Key;
          NewModifier = this.m_Binder.m_Modifier;
        }
        this.m_Binder.m_GotKey = false;
        UI.SetActiveItem(null);
        s_KeyMouseReleased = false;
        s_KeyGrabbedID = pBC.GetID();
      }
      if (s_KeyButtonUsed === 1 && !UI.MouseButton(1)) {
        if (Inside) NewKey = 0;
        UI.SetActiveItem(null);
      }
    } else if (UI.HotItem() === pBC.GetID()) {
      if (s_KeyMouseReleased) {
        if (UI.MouseButton(0)) {
          this.m_Binder.m_TakeKey = true;
          this.m_Binder.m_GotKey = false;
          UI.SetActiveItem(pBC.GetID());
          s_KeyButtonUsed = 0;
        }
        if (UI.MouseButton(1)) {
          UI.SetActiveItem(pBC.GetID());
          s_KeyButtonUsed = 1;
        }
      }
    }
    if (Inside) UI.SetHotItem(pBC.GetID());
    // draw
    if (UI.CheckActiveItem(pBC.GetID()) && s_KeyButtonUsed === 0) {
      this.DoButton_KeySelect(pBC, '???', 0, pRect);
      this.m_KeyReaderIsActive = true;
    } else if (Key === 0) this.DoButton_KeySelect(pBC, '', 0, pRect);
    else this.DoButton_KeySelect(pBC, str_format(64, '%s%s', CBinds.GetModifierName(NewModifier), this.Input().KeyName(Key)), 0, pRect);
    return { Key: NewKey, Modifier: NewModifier };
  }

  RenderMenubar(Rect: CUIRect): void {
    const Box = new CUIRect(), Button = new CUIRect();
    Rect.HSplitTop(60, Box, Rect);
    const InactiveAlpha = 0.25;
    const Cl = this.Client(), Cfg = this.Config();
    this.m_ActivePage = this.m_MenuPage;
    let NewPage = -1;
    if (Cl.State() !== STATE_OFFLINE) this.m_ActivePage = this.m_GamePage;
    if (Cl.State() === STATE_ONLINE) {
      const Spacing = 3;
      const ButtonWidth = Box.w / 6 - (Spacing * 5) / 6;
      const Alpha = this.m_GamePage === PAGE_SETTINGS ? InactiveAlpha : 1;
      // render header backgrounds
      const Left = new CUIRect(), Right = new CUIRect();
      Box.VSplitLeft(ButtonWidth * 4 + Spacing * 3, Left, null);
      Box.VSplitRight(ButtonWidth * 1.5 + Spacing, null, Right);
      this.RenderBackgroundShadow(Left, false);
      this.RenderBackgroundShadow(Right, false);
      Left.HSplitBottom(25, null, Left);
      Right.HSplitBottom(25, null, Right);
      Left.VSplitLeft(ButtonWidth, Button, Left);
      if (this.DoButton_MenuTabTop(s_GameButton, Localize('Game'), this.m_ActivePage === PAGE_GAME, Button, Alpha, Alpha) || this.CheckHotKey(K.KEY_G)) NewPage = PAGE_GAME;
      Left.VSplitLeft(Spacing, null, Left); // little space
      Left.VSplitLeft(ButtonWidth, Button, Left);
      if (this.DoButton_MenuTabTop(s_PlayersButton, Localize('Players'), this.m_ActivePage === PAGE_PLAYERS, Button, Alpha, Alpha) || this.CheckHotKey(K.KEY_P)) NewPage = PAGE_PLAYERS;
      Left.VSplitLeft(Spacing, null, Left); // little space
      Left.VSplitLeft(ButtonWidth, Button, Left);
      if (this.DoButton_MenuTabTop(s_ServerInfoButton, Localize('Server info'), this.m_ActivePage === PAGE_SERVER_INFO, Button, Alpha, Alpha) || this.CheckHotKey(K.KEY_I)) NewPage = PAGE_SERVER_INFO;
      Left.VSplitLeft(Spacing, null, Left); // little space
      Left.VSplitLeft(ButtonWidth, Button, Left);
      if (this.DoButton_MenuTabTop(s_CallVoteButton, Localize('Call vote'), this.m_ActivePage === PAGE_CALLVOTE, Button, Alpha, Alpha) || this.CheckHotKey(K.KEY_V)) NewPage = PAGE_CALLVOTE;
      Right.VSplitRight(ButtonWidth, Right, Button);
      if (this.DoButton_MenuTabTop(s_SettingsButton, Localize('Settings'), this.m_GamePage === PAGE_SETTINGS, Button) || this.CheckHotKey(K.KEY_S)) NewPage = PAGE_SETTINGS;
      // the server browser button next to it is left out: there is no server browser
      Rect.HSplitTop(Spacing, null, Rect);
      Rect.HSplitTop(25, Box, Rect);
    }
    if (Cl.State() === STATE_ONLINE && this.m_GamePage === PAGE_SETTINGS) {
      const Spacing = 3;
      const ButtonWidth = Box.w / 6 - (Spacing * 5) / 6;
      const NotActiveAlpha = 0.5;
      Box.HSplitBottom(25, null, Box);
      for (let i = 0; i < s_SettingsTabs.length; i++) {
        const [pBC, pName, Page, CamPos] = s_SettingsTabs[i];
        if (i > 0) Box.VSplitLeft(Spacing, null, Box); // little space
        Box.VSplitLeft(ButtonWidth, Button, Box);
        if (this.DoButton_MenuTabTop(pBC, Localize(pName), false, Button, Cfg.m_UiSettingsPage === Page ? 1 : NotActiveAlpha, 1, CORNER_T)) {
          this.m_pClient.m_pCamera.ChangePosition(CamPos);
          Cfg.m_UiSettingsPage = Page;
        }
      }
    }
    if (NewPage !== -1) {
      if (Cl.State() === STATE_OFFLINE) this.SetMenuPage(NewPage);
      else this.m_GamePage = NewPage;
    }
  }

  InitLoading(TotalWorkAmount: number): void {
    this.m_LoadCurrent = 0;
    this.m_LoadTotal = TotalWorkAmount;
  }
  /** RenderLoading: the client loads in one go (the browser presents nothing before the frame ends), so it only counts */
  RenderLoading(WorkedAmount = 0): void { this.m_LoadCurrent += WorkedAmount; }

  PopupMessage(pTopic: string, pBody: string, pButton: string, Next = POPUP_NONE): void {
    // reset active item
    this.UI().SetActiveItem(null);
    this.m_aMessageTopic = pTopic;
    this.m_aMessageBody = pBody;
    this.m_aMessageButton = pButton;
    this.m_Popup = POPUP_MESSAGE;
    this.m_NextPopup = Next;
  }

  private Render(): number {
    const UI = this.UI(), G = this.Graphics(), Cl = this.Client(), Cfg = this.Config();
    const Screen = UI.Screen().copy();
    G.MapScreen(Screen.x, Screen.y, Screen.w, Screen.h);
    // render background only if needed
    if (this.IsBackgroundNeeded()) this.RenderBackground(Cl.LocalTime());
    const TabBar = new CUIRect(), MainView = new CUIRect();
    if (this.m_Popup === POPUP_NONE) {
      // do tab bar
      let BarHeight = 60;
      if (Cl.State() === STATE_ONLINE && this.m_GamePage === PAGE_SETTINGS) BarHeight += 3 + 25;
      let VMargin = Screen.w / 2 - 365;
      if (Cfg.m_UiWideview) VMargin = Math.min(VMargin, 60);
      Screen.VMargin(VMargin, MainView);
      MainView.HSplitTop(BarHeight, TabBar, MainView);
      this.RenderMenubar(TabBar);
      {
        // quit button
        const Button = new CUIRect(), Row = new CUIRect();
        const TopOffset = 27;
        Screen.HSplitTop(TopOffset, Row, null);
        Row.VSplitRight(TopOffset, Row, Button);
        // draw red-blending button
        const a = this.ButtonFade(s_QuitButton, 0.6, 0) / 0.6;
        const Color = v4((0xf9 / 0xff) * a, (0x2b / 0xff) * a, (0x2b / 0xff) * a, 0.25 + (0.75 - 0.25) * a);
        this.RenderTools().DrawUIRect(Button, Color, CORNER_BL, 5);
        // draw non-blending X
        UI.DoLabel(Button, '\xE2\x9C\x95', Button.h * CMenus.ms_FontmodHeight, ALIGN_CENTER);
        if (UI.DoButtonLogic(s_QuitButton.GetID(), Button)) this.m_Popup = POPUP_QUIT;
      }
      // render current page
      if (Cl.State() !== STATE_OFFLINE) {
        if (this.m_GamePage === PAGE_GAME) RenderGame(this, MainView);
        else if (this.m_GamePage === PAGE_PLAYERS) RenderPlayers(this, MainView);
        else if (this.m_GamePage === PAGE_SERVER_INFO) RenderServerInfo(this, MainView);
        else if (this.m_GamePage === PAGE_CALLVOTE) RenderServerControl(this, MainView);
        else if (this.m_GamePage === PAGE_SETTINGS) RenderSettings(this, MainView);
      }
    } else this.RenderPopup(Screen);
    return 0;
  }

  private RenderPopup(Screen: CUIRect): void {
    const UI = this.UI(), Cl = this.Client();
    let pTitle = '', pExtraText = '', pButtonText = '';
    let ExtraAlign = ALIGN_CENTER;
    let NumOptions = 4;
    if (this.m_Popup === POPUP_MESSAGE) {
      pTitle = this.m_aMessageTopic;
      pExtraText = this.m_aMessageBody;
      pButtonText = this.m_aMessageButton;
    } else if (this.m_Popup === POPUP_CONNECTING) {
      pTitle = Localize('Connecting to');
      pButtonText = Localize('Abort');
      if (Cl.m_MapdownloadTotalsize > 0) {
        pTitle = str_format(128, '%s: %s', Localize('Downloading map'), Cl.m_aMapdownloadName);
        pExtraText = '';
        NumOptions = 5;
      }
    } else if (this.m_Popup === POPUP_DISCONNECTED) {
      pTitle = Localize('Disconnected');
      pExtraText = Cl.ErrorString();
      pButtonText = Localize('Ok');
      ExtraAlign = ALIGN_LEFT;
    } else if (this.m_Popup === POPUP_PURE) {
      pTitle = Localize('Disconnected');
      pExtraText = Localize('The server is running a non-standard tuning on a pure game type.');
      pButtonText = Localize('Ok');
      ExtraAlign = ALIGN_LEFT;
    } else if (this.m_Popup === POPUP_SAVE_SKIN) {
      pTitle = Localize('Save skin');
      pExtraText = Localize('Are you sure you want to save your skin? If a skin with this name already exists, it will be replaced.');
      NumOptions = 6;
      ExtraAlign = ALIGN_LEFT;
    } else if (this.m_Popup === POPUP_DELETE_SKIN) {
      pTitle = Localize('Delete skin');
      pExtraText = Localize('Are you sure that you want to delete the skin?');
      ExtraAlign = ALIGN_LEFT;
    } else if (this.m_Popup === POPUP_SOUNDERROR) {
      pTitle = Localize('Sound error');
      pExtraText = Localize("The audio device couldn't be initialised.");
      pButtonText = Localize('Ok');
      ExtraAlign = ALIGN_LEFT;
    } else if (this.m_Popup === POPUP_QUIT) {
      pTitle = Localize('Quit');
      pExtraText = Localize('Are you sure that you want to quit?');
    }

    const Box = new CUIRect(), Part = new CUIRect(), BottomBar = new CUIRect();
    const ButtonHeight = 20, ButtonHeightBig = ButtonHeight + 5, SpacingH = 2, SpacingW = 3;
    Screen.VMargin(Screen.w / 2 - 365, Box);
    const ButtonWidth = Box.w / 6 - (SpacingW * 5) / 6;
    Box.VMargin(ButtonWidth + SpacingW, Box);
    Box.HMargin(Box.h / 2 - ((NumOptions + 1) * ButtonHeight + NumOptions * SpacingH) / 2 - 10, Box);
    // render the box
    this.RenderTools().DrawUIRect(Box, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    // headline
    Box.HSplitTop(ButtonHeightBig, Part, Box);
    Part.y += 3;
    UI.DoLabel(Part, pTitle, Part.h * CMenus.ms_FontmodHeight * 0.8, ALIGN_CENTER);
    // inner box
    Box.HSplitTop(SpacingH, null, Box);
    Box.HSplitBottom(ButtonHeight + 5 + SpacingH, Box, BottomBar);
    BottomBar.HSplitTop(SpacingH, null, BottomBar);
    this.RenderTools().DrawUIRect(Box, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    const FontSize = ButtonHeight * CMenus.ms_FontmodHeight * 0.8;

    if (this.m_Popup === POPUP_QUIT) {
      const Yes = new CUIRect(), No = new CUIRect();
      Box.HSplitTop(27, null, Box);
      UI.DoLabel(Box, pExtraText, FontSize, ExtraAlign);
      // buttons
      BottomBar.VSplitMid(No, Yes, SpacingW);
      if (this.DoButton_Menu(s_PopupButtonNo, Localize('No'), 0, No) || this.m_EscapePressed) this.m_Popup = POPUP_NONE;
      if (this.DoButton_Menu(s_PopupButtonYes, Localize('Yes'), 0, Yes) || this.m_EnterPressed) {
        this.m_Popup = POPUP_NONE;
        this.onQuit?.();
      }
    } else if (this.m_Popup === POPUP_CONNECTING) {
      if (this.DoButton_Menu(s_PopupButton, pButtonText, 0, BottomBar) || this.m_EscapePressed || this.m_EnterPressed) {
        Cl.Disconnect();
        this.m_Popup = POPUP_NONE;
      }
      if (Cl.m_MapdownloadTotalsize > 0) {
        Box.HSplitTop(15, null, Box);
        Box.HSplitTop(ButtonHeight, Part, Box);
        UI.DoLabel(Part, str_format(128, '%d/%d KiB', Math.trunc(Cl.m_MapdownloadAmount / 1024), Math.trunc(Cl.m_MapdownloadTotalsize / 1024)), FontSize, ALIGN_CENTER);
        // progress bar
        Box.HSplitTop(SpacingH, null, Box);
        Box.HSplitTop(ButtonHeight, Part, Box);
        Box.HSplitTop(SpacingH, null, Box);
        Box.HSplitTop(ButtonHeight, Part, Box);
        Part.VMargin(40, Part);
        this.RenderTools().DrawUIRect(Part, v4(1, 1, 1, 0.25), CORNER_ALL, 5);
        Part.w = Math.max(10, (Part.w * Cl.m_MapdownloadAmount) / Cl.m_MapdownloadTotalsize);
        this.RenderTools().DrawUIRect(Part, v4(1, 1, 1, 0.5), CORNER_ALL, 5);
      } else {
        Box.HSplitTop(27, null, Box);
        UI.DoLabel(Box, Cl.m_aServerAddressStr, FontSize, ALIGN_CENTER);
      }
    } else if (this.m_Popup === POPUP_SAVE_SKIN) {
      const Yes = new CUIRect(), No = new CUIRect(), EditBox = new CUIRect();
      Box.HSplitTop(24, null, Box);
      Box.VMargin(10, Part);
      UI.DoLabel(Part, pExtraText, FontSize, ExtraAlign, Box.w - 20);
      Box.HSplitBottom(Box.h / 2, null, Box);
      Box.HSplitTop(20, EditBox, Box);
      this.DoEditBoxOption(this.m_aSaveSkinName, this.m_aSaveSkinName, 24, EditBox, Localize('Name'), ButtonWidth, s_OffsetSaveSkin);
      // buttons
      BottomBar.VSplitMid(No, Yes, SpacingW);
      if (this.DoButton_Menu(s_PopupButtonNo, Localize('No'), 0, No) || this.m_EscapePressed) this.m_Popup = POPUP_NONE;
      if (this.DoButton_Menu(s_PopupButtonYes, Localize('Yes'), !this.m_aSaveSkinName.v, Yes) || this.m_EnterPressed) {
        const n = this.m_aSaveSkinName.v;
        if (n && n[0] !== 'x' && n[1] !== '_') {
          this.m_Popup = POPUP_NONE;
          this.m_pClient.m_pSkins.SaveSkinfile(n);
          this.m_aSaveSkinName.v = '';
          this.m_RefreshSkinSelector = true;
        }
      }
    } else if (this.m_Popup === POPUP_DELETE_SKIN) {
      const Yes = new CUIRect(), No = new CUIRect();
      Box.HSplitTop(27, null, Box);
      Box.VMargin(10, Box);
      UI.DoLabel(Box, pExtraText, FontSize, ExtraAlign);
      // buttons
      BottomBar.VSplitMid(No, Yes, SpacingW);
      if (this.DoButton_Menu(s_PopupButtonNo, Localize('No'), 0, No) || this.m_EscapePressed) this.m_Popup = POPUP_NONE;
      if (this.DoButton_Menu(s_PopupButtonYes, Localize('Yes'), 0, Yes) || this.m_EnterPressed) {
        this.m_Popup = POPUP_NONE;
        // delete demo
        if (this.m_pSelectedSkin) {
          // skins/<name>.json of the save directory (RemoveSkin removes it from the saved skins)
          this.m_pClient.m_pSkins.RemoveSkin(this.m_pSelectedSkin);
          this.m_RefreshSkinSelector = true;
          this.m_pSelectedSkin = null;
        }
      }
    } else {
      Box.HSplitTop(27, null, Box);
      Box.VMargin(5, Part);
      UI.DoLabel(Part, pExtraText, FontSize, ExtraAlign, ExtraAlign === ALIGN_CENTER ? -1 : Part.w);
      // button
      if (this.DoButton_Menu(s_PopupButton, pButtonText, 0, BottomBar) || this.m_EscapePressed || this.m_EnterPressed) this.m_Popup = this.m_NextPopup;
    }
    if (this.m_Popup === POPUP_NONE) UI.SetActiveItem(null);
  }

  SetActive(Active: boolean): void {
    this.m_MenuActive = Active;
    if (!this.m_MenuActive) {
      if (this.Client().State() === STATE_ONLINE) {
        this.m_pClient.OnRelease();
        if (this.Client().State() === STATE_ONLINE && this.m_SkinModified) {
          this.m_SkinModified = false;
          this.m_pClient.SendSkinChange();
        }
      }
    } else {
      this.m_SkinModified = false;
      if (this.Client().State() === STATE_DEMOPLAYBACK) this.m_pClient.OnRelease();
    }
  }

  override OnMouseMove(x: number, y: number): boolean {
    if (!this.m_MenuActive) return false;
    // prev mouse position
    this.m_PrevMousePos = this.m_MousePos;
    const m = { x, y };
    this.UI().ConvertMouseMove(m);
    const G = this.Graphics();
    this.m_MousePos = new vec2(clamp(this.m_MousePos.x + m.x, 0, G.ScreenWidth()), clamp(this.m_MousePos.y + m.y, 0, G.ScreenHeight()));
    return true;
  }

  override OnInput(e: CEvent): boolean {
    // special handle esc and enter for popup purposes
    if (e.m_Flags & FLAG_PRESS) {
      if (e.m_Key === K.KEY_ESCAPE) {
        this.m_EscapePressed = true;
        this.SetActive(!this.IsActive());
        return true;
      }
    }
    if (this.IsActive()) {
      if (e.m_Flags & FLAG_PRESS) {
        // special for popups
        if (e.m_Key === K.KEY_RETURN || e.m_Key === K.KEY_KP_ENTER) this.m_EnterPressed = true;
        else if (e.m_Key === K.KEY_TAB && !this.Input().KeyPress(K.KEY_LALT) && !this.Input().KeyPress(K.KEY_RALT)) this.m_TabPressed = true;
        else if (e.m_Key === K.KEY_DELETE) this.m_DeletePressed = true;
        else if (e.m_Key === K.KEY_UP) this.m_UpArrowPressed = true;
        else if (e.m_Key === K.KEY_DOWN) this.m_DownArrowPressed = true;
      }
      return true;
    }
    return false;
  }

  override OnStateChange(NewState: number, _OldState: number): void {
    // reset active item
    this.UI().SetActiveItem(null);
    if (NewState === STATE_OFFLINE) {
      this.m_Popup = POPUP_NONE;
      if (this.Client().ErrorString()) this.m_Popup = POPUP_DISCONNECTED;
    } else if (NewState === STATE_LOADING || NewState === STATE_CONNECTING) this.m_Popup = POPUP_CONNECTING;
    else if (NewState === STATE_ONLINE || NewState === STATE_DEMOPLAYBACK) {
      this.m_Popup = POPUP_NONE;
      this.SetActive(false);
    }
  }

  override OnRender(): void {
    const UI = this.UI(), G = this.Graphics(), Cl = this.Client(), In = this.Input();
    UI.StartCheck();
    // reset cursor
    this.m_PrevCursorActive = this.m_CursorActive;
    this.m_CursorActive = false;
    if (this.m_KeyReaderIsActive) {
      this.m_KeyReaderIsActive = false;
      this.m_KeyReaderWasActive = true;
    } else if (this.m_KeyReaderWasActive) this.m_KeyReaderWasActive = false;
    if (Cl.State() !== STATE_ONLINE && Cl.State() !== STATE_DEMOPLAYBACK) this.SetActive(true);
    if (Cl.State() === STATE_ONLINE && this.m_pClient.m_ServerMode === 2 /* SERVERMODE_PUREMOD */) {
      Cl.Disconnect();
      this.SetActive(true);
      this.m_Popup = POPUP_PURE;
    }
    if (!this.IsActive()) {
      this.m_EscapePressed = this.m_EnterPressed = this.m_TabPressed = this.m_DeletePressed = this.m_UpArrowPressed = this.m_DownArrowPressed = false;
      return;
    }
    // without the pointer lock the menu follows the system cursor
    if (!In.locked()) {
      const p = In.AbsolutePos();
      this.m_MousePos = new vec2(clamp(p.x, 0, G.ScreenWidth()), clamp(p.y, 0, G.ScreenHeight()));
    }
    // update the ui
    const pScreen = UI.Screen();
    const mx = (this.m_MousePos.x / G.ScreenWidth()) * pScreen.w;
    const my = (this.m_MousePos.y / G.ScreenHeight()) * pScreen.h;
    let Buttons = 0;
    if (this.m_UseMouseButtons) {
      if (In.KeyIsPressed(K.KEY_MOUSE_1)) Buttons |= 1;
      if (In.KeyIsPressed(K.KEY_MOUSE_2)) Buttons |= 2;
      if (In.KeyIsPressed(K.KEY_MOUSE_3)) Buttons |= 4;
    }
    UI.Update(mx, my, mx * 3, my * 3, Buttons);
    // render
    if (Cl.State() !== STATE_DEMOPLAYBACK) this.Render();
    // render cursor
    G.TextureSet(ImageTex(C.IMAGE_CURSOR));
    G.WrapClamp();
    G.QuadsBegin();
    G.SetColor(1, 1, 1, 1);
    G.QuadsDrawTL([new CQuadItem(mx, my, 24, 24)], 1);
    G.QuadsEnd();
    G.WrapNormal();
    UI.FinishCheck();
    this.m_EscapePressed = this.m_EnterPressed = this.m_TabPressed = this.m_DeletePressed = this.m_UpArrowPressed = this.m_DownArrowPressed = false;
  }

  CheckHotKey(Key: number): boolean {
    const In = this.Input();
    return !this.m_KeyReaderIsActive && !this.m_KeyReaderWasActive && !this.m_PrevCursorActive && !this.m_PopupActive &&
      !In.KeyIsPressed(K.KEY_LSHIFT) && !In.KeyIsPressed(K.KEY_RSHIFT) && !In.KeyIsPressed(K.KEY_LCTRL) && !In.KeyIsPressed(K.KEY_RCTRL) && !In.KeyIsPressed(K.KEY_LALT) && // no modifier
      In.KeyIsPressed(Key) && !this.m_pClient.m_pGameConsole.IsConsoleActive();
  }

  /** the port has no menu map, so the background is needed whenever the client is not in game */
  IsBackgroundNeeded(): boolean { return !this.m_pClient.m_InitComplete || this.Client().State() !== STATE_ONLINE; }

  RenderBackground(Time: number): void {
    const G = this.Graphics();
    const sw = 300 * G.ScreenAspect(), sh = 300;
    G.MapScreen(0, 0, sw, sh);
    // render the tiles
    G.TextureClear();
    G.QuadsBegin();
    const Size = 15;
    const OffsetTime = (Time * 0.15) % 2;
    for (let y = -2; y < Math.trunc(sw / Size); y++)
      for (let x = -2; x < Math.trunc(sh / Size); x++) {
        G.SetColor(0, 0, 0, 0.045);
        G.QuadsDrawTL([new CQuadItem((x - OffsetTime) * Size * 2 + (y & 1) * Size, (y + OffsetTime) * Size, Size, Size)], 1);
      }
    G.QuadsEnd();
    // render border fade
    this.m_TextureBlob ??= G.LoadTexture('ui/blob.png', 0, 0, 0);
    G.TextureSet(this.m_TextureBlob);
    G.QuadsBegin();
    G.SetColor(0, 0, 0, 0.5);
    G.QuadsDrawTL([new CQuadItem(-100, -100, sw + 200, sh + 200)], 1);
    G.QuadsEnd();
    // restore screen
    const Screen = this.UI().Screen();
    G.MapScreen(Screen.x, Screen.y, Screen.w, Screen.h);
  }

  RenderBackgroundShadow(pRect: CUIRect, TopToBottom: boolean): void {
    const Transparent = v4(0, 0, 0, 0);
    const Background = v4(0, 0, 0, this.Config().m_ClMenuAlpha / 100);
    if (TopToBottom) this.RenderTools().DrawUIRect4(pRect, Background, Background, Transparent, Transparent, CORNER_T, 5);
    else this.RenderTools().DrawUIRect4(pRect, Transparent, Transparent, Background, Background, CORNER_B, 5);
  }

  SetMenuPage(NewPage: number): void {
    if (NewPage === this.m_MenuPage) return;
    this.m_MenuPage = NewPage;
    if (NewPage === PAGE_SETTINGS) this.m_pClient?.m_pCamera?.ChangePosition(CAM.POS_SETTINGS_GENERAL + this.Config().m_UiSettingsPage);
  }

  GetSwitchTeamInfo(): CSwitchTeamInfo {
    const gc = this.m_pClient;
    const pInfo: CSwitchTeamInfo = { m_aNotification: '', m_AllowSpec: true, m_TimeLeft: 0 };
    const TeamMod = gc.m_aClients[gc.m_LocalClientID].m_Team !== P.TEAM_SPECTATORS ? -1 : 0;
    if (gc.m_ServerSettings.m_TeamLock) {
      pInfo.m_aNotification = Localize('Teams are locked');
      pInfo.m_AllowSpec = false;
    } else if (TeamMod + gc.m_GameInfo.m_aTeamSize[P.TEAM_RED] + gc.m_GameInfo.m_aTeamSize[P.TEAM_BLUE] >= gc.m_ServerSettings.m_PlayerSlots) {
      pInfo.m_aNotification = str_format(128, Localize('Only %d active players are allowed'), gc.m_ServerSettings.m_PlayerSlots);
    } else if (gc.m_TeamCooldownTick + 1 >= this.Client().GameTick()) {
      pInfo.m_TimeLeft = Math.trunc((gc.m_TeamCooldownTick - this.Client().GameTick()) / this.Client().GameTickSpeed()) + 1;
      pInfo.m_aNotification = str_format(128, Localize('Teams are locked. Time to wait before changing team: %02d:%02d'), Math.trunc(pInfo.m_TimeLeft / 60), pInfo.m_TimeLeft % 60);
      pInfo.m_AllowSpec = false;
    }
    return pInfo;
  }
}
