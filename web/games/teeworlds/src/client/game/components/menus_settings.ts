// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/menus_settings.cpp and menus_callback.cpp of Teeworlds 0.7.5 in TypeScript (the
// CMenus methods are functions of the menu). What the browser decides is left out: the language and theme lists
// (English only, no menu map), the start menu, demo and screenshot options, the joystick, the OS mouse acceleration,
// the screen, window, v-sync, anti aliasing and resolution options, the sample rate and the background music (the
// menu music belongs to the start menu).
import { vec2, str_format, str_comp, Localize, v4, pi, type vec3, type vec4 } from './common.ts';
import * as P from '../../../generated/protocol.ts';
import { CQuadItem, type CColorVertex } from '../../engine/graphics.ts';
import { STATE_ONLINE } from '../../engine/client.ts';
import * as K from '../../engine/keys.ts';
import { CUIRect, CORNER_ALL, CORNER_B, CORNER_BL, CORNER_BR, CORNER_TL, CORNER_TR, ALIGN_CENTER } from '../ui.ts';
import { CAnimState, CTeeRenderInfo } from '../render.ts';
import type { CMenus } from './menus.ts';
import {
  CButtonContainer, CScrollRegion, CScrollRegionParams, CListBox, CfgStr, LogarithmicScrollbarScale, POPUP_SAVE_SKIN, POPUP_DELETE_SKIN,
  SETTINGS_GENERAL, SETTINGS_PLAYER, SETTINGS_TEE, SETTINGS_CONTROLS, SETTINGS_GRAPHICS, SETTINGS_SOUND, type CNumRef,
ms_FontmodHeight,
} from './menus_ui.ts';
import { HslToRgb, DARKEST_COLOR_LGT, SKINFLAG_SPECIAL, SKINFLAG_STANDARD, ms_apSkinPartNames, type CSkin, type CSkinPart } from './skins.ts';
import { MODIFIER_COUNT } from './binds.ts';
import * as TC from './stats.ts';

const FontmodHeight = ms_FontmodHeight;
const NUM_SKINPARTS = P.NUM_SKINPARTS;

function cv(i: number, c: vec4): CColorVertex { return { m_Index: i, m_R: c.r, m_G: c.g, m_B: c.b, m_A: c.a }; }
function rgb(c: vec3, a = 1): vec4 { return v4(c.x, c.y, c.z, a); }
function hsl(h: number, s: number, l: number): vec3 { return HslToRgb({ x: h, y: s, z: l }); }

const s_CustomColors = {}, s_HLPicker = {};
const s_aHslButtons = Array.from({ length: 12 }, () => new CButtonContainer());
const s_aColorIndices = [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1], [1, 0, 1], [1, 0, 0]];

function RenderHSLPicker(m: CMenus, MainView: CUIRect): void {
  const UI = m.UI(), RT = m.RenderTools(), G = m.Graphics(), Skins = m.m_pClient.m_pSkins;
  const Label = new CUIRect(), Button = new CUIRect(), Picker = new CUIRect();
  // background
  const Spacing = 2;
  RT.DrawUIRect(MainView, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  // use custom color checkbox
  const ButtonHeight = 20;
  MainView.HSplitTop(ButtonHeight, Button, MainView);
  if (m.DoButton_CheckBox(s_CustomColors, Localize('Custom colors'), Skins.UCCVariable(m.m_TeePartSelected), Button)) {
    Skins.SetUCCVariable(m.m_TeePartSelected, Skins.UCCVariable(m.m_TeePartSelected) ^ 1);
    m.m_SkinModified = true;
  }
  if (!Skins.UCCVariable(m.m_TeePartSelected)) return;
  MainView.HSplitTop(Spacing, null, MainView);
  let Modified = false;
  const UseAlpha = m.m_TeePartSelected === P.SKINPART_MARKING;
  const Color = Skins.ColorVariable(m.m_TeePartSelected);
  const aVars = [(Color >> 16) & 0xff, (Color >> 8) & 0xff, Color & 0xff, UseAlpha ? (Color >> 24) & 0xff : 0]; // Hue, Sat, Lgt, Alp
  MainView.HSplitTop(144, Picker, MainView);
  RT.DrawUIRect(Picker, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  const Dark = DARKEST_COLOR_LGT / 255;
  // Hue/Lgt picker :
  {
    Picker.VMargin((Picker.w - 128) / 2, Picker);
    Picker.HMargin((Picker.h - 128) / 2, Picker);
    // picker
    G.TextureClear();
    G.QuadsBegin();
    // base: grey - hue
    const Hue = aVars[0] / 255;
    G.SetColorVertex([cv(0, rgb(hsl(Hue, 0, 0.5))), cv(1, rgb(hsl(Hue, 1, 0.5))), cv(2, rgb(hsl(Hue, 1, 0.5))), cv(3, rgb(hsl(Hue, 0, 0.5)))], 4);
    G.QuadsDrawTL([new CQuadItem(Picker.x, Picker.y, Picker.w, Picker.h)], 1);
    // white blending
    G.SetColorVertex([cv(0, v4(0, 0, 0, 0)), cv(1, v4(0, 0, 0, 0)), cv(2, v4(1, 1, 1, 1)), cv(3, v4(1, 1, 1, 1))], 4);
    G.QuadsDrawTL([new CQuadItem(Picker.x, Picker.y + (Picker.h * (1 - 2 * Dark)) / ((1 - Dark) * 2), Picker.w, Picker.h / ((1 - Dark) * 2))], 1);
    // black blending
    G.SetColorVertex([cv(0, v4(0, 0, 0, 1 - 2 * Dark)), cv(1, v4(0, 0, 0, 1 - 2 * Dark)), cv(2, v4(0, 0, 0, 0)), cv(3, v4(0, 0, 0, 0))], 4);
    G.QuadsDrawTL([new CQuadItem(Picker.x, Picker.y, Picker.w, (Picker.h * (1 - 2 * Dark)) / ((1 - Dark) * 2))], 1);
    G.QuadsEnd();
    // marker
    const Marker = new vec2(aVars[1] / 2, aVars[2] / 2);
    G.TextureClear();
    G.QuadsBegin();
    G.SetColor(0, 0, 0, 1);
    const px = UI.PixelSize();
    G.QuadsDrawTL([
      new CQuadItem(Picker.x + Marker.x, Picker.y + Marker.y - 5 * px, px, 11 * px),
      new CQuadItem(Picker.x + Marker.x - 5 * px, Picker.y + Marker.y, 11 * px, px),
    ], 2);
    G.QuadsEnd();
    // logic
    const p = UI.DoPickerLogic(s_HLPicker, Picker);
    if (p) {
      aVars[1] = Math.trunc((255 * p.x) / Picker.w);
      aVars[2] = Math.trunc((255 * p.y) / Picker.h);
      Modified = true;
    }
  }
  MainView.HSplitTop(Spacing, null, MainView);
  // H/S/L/A sliders :
  {
    const NumBars = UseAlpha ? 4 : 3;
    const apNames = [Localize('Hue:'), Localize('Sat:'), Localize('Lgt:'), Localize('Alp:')];
    const SliderHeight = 16;
    for (let i = 0; i < NumBars; i++) {
      const Bar = new CUIRect();
      MainView.HSplitTop(SliderHeight, Label, MainView);
      MainView.HSplitTop(Spacing, null, MainView);
      // label
      RT.DrawUIRect(Label, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
      Label.VSplitLeft((Label.w - 160) / 2, Label, Button);
      Label.y += 2;
      UI.DoLabel(Label, apNames[i], SliderHeight * FontmodHeight * 0.8, ALIGN_CENTER);
      // button <
      Button.VSplitLeft(Button.h, Button, Bar);
      if (m.DoButton_Menu(s_aHslButtons[i * 3], '<', 0, Button, null, CORNER_TL | CORNER_BL)) {
        aVars[i] = Math.max(0, aVars[i] - 1);
        Modified = true;
      }
      // bar
      Bar.VSplitLeft(128, Bar, Button);
      const NumQuads = i === 0 ? 6 : i === 2 ? 2 : 1;
      let Length = Bar.w / NumQuads;
      let Offset = Length;
      let ColorL: vec4, ColorR: vec4;
      const [Hue, Sat, Lgt] = [aVars[0] / 255, aVars[1] / 255, aVars[2] / 255];
      G.TextureClear();
      G.QuadsBegin();
      for (let j = 0; j < NumQuads; ++j) {
        switch (i) {
          case 0: // Hue
            ColorL = v4(s_aColorIndices[j][0], s_aColorIndices[j][1], s_aColorIndices[j][2], 1);
            ColorR = v4(s_aColorIndices[j + 1][0], s_aColorIndices[j + 1][1], s_aColorIndices[j + 1][2], 1);
            break;
          case 1: // Sat
            ColorL = rgb(hsl(Hue, 0, Dark + Lgt * (1 - Dark)));
            ColorR = rgb(hsl(Hue, 1, Dark + Lgt * (1 - Dark)));
            break;
          case 2: // Lgt
            if (j === 0) {
              // Dark - 0.5f
              ColorL = rgb(hsl(Hue, Sat, Dark));
              ColorR = rgb(hsl(Hue, Sat, 0.5));
              Length = Offset = Bar.w - Bar.w / ((1 - Dark) * 2);
            } else {
              // 0.5f - 0.0f
              ColorL = rgb(hsl(Hue, Sat, 0.5));
              ColorR = rgb(hsl(Hue, Sat, 1));
              Length = Bar.w / ((1 - Dark) * 2);
            }
            break;
          default: // Alpha
            ColorL = rgb(hsl(Hue, Sat, Dark + Lgt * (1 - Dark)), 0);
            ColorR = rgb(hsl(Hue, Sat, Dark + Lgt * (1 - Dark)), 1);
        }
        G.SetColorVertex([cv(0, ColorL), cv(1, ColorR), cv(2, ColorR), cv(3, ColorL)], 4);
        G.QuadsDrawTL([new CQuadItem(Bar.x + Offset * j, Bar.y, Length, Bar.h)], 1);
      }
      // bar marker
      G.SetColor(0, 0, 0, 1);
      G.QuadsDrawTL([new CQuadItem(Bar.x + Math.min(127, aVars[i] / 2), Bar.y, UI.PixelSize(), Bar.h)], 1);
      G.QuadsEnd();
      // button >
      Button.VSplitLeft(Button.h, Button, Label);
      if (m.DoButton_Menu(s_aHslButtons[i * 3 + 1], '>', 0, Button, null, CORNER_TR | CORNER_BR)) {
        aVars[i] = Math.min(255, aVars[i] + 1);
        Modified = true;
      }
      // value label
      Label.y += 2;
      UI.DoLabel(Label, str_format(16, '%d', aVars[i]), SliderHeight * FontmodHeight * 0.8, ALIGN_CENTER);
      // logic
      const p = UI.DoPickerLogic(s_aHslButtons[i * 3 + 2], Bar);
      if (p) {
        aVars[i] = Math.trunc((p.x * 255) / Bar.w);
        Modified = true;
      }
    }
  }
  if (Modified) {
    const NewVal = (aVars[0] << 16) + (aVars[1] << 8) + aVars[2];
    Skins.SetColorVariable(m.m_TeePartSelected, NewVal);
    if (UseAlpha) m.Config().m_PlayerColorMarking = (aVars[3] << 24) + NewVal;
    m.m_SkinModified = true;
  }
}

let s_SkinListBox: CListBox | null = null;
let s_paSkinList: CSkin[] = [];
const s_SkinIDs = new Map<CSkin, object>();

function RenderSkinSelection(m: CMenus, MainView: CUIRect): void {
  const gc = m.m_pClient, Skins = gc.m_pSkins, Cfg = m.Config();
  const s_ListBox = (s_SkinListBox ??= new CListBox(m));
  if (m.m_RefreshSkinSelector) {
    s_paSkinList = [];
    for (let i = 0; i < Skins.Num(); ++i) {
      const s = Skins.Get(i);
      // no special skins
      if ((s.m_Flags & SKINFLAG_SPECIAL) === 0 && s_ListBox.FilterMatches(s.m_aName)) s_paSkinList.push(s);
    }
    s_paSkinList.sort((a, b) => str_comp(a.m_aName, b.m_aName));
    m.m_RefreshSkinSelector = false;
  }
  m.m_pSelectedSkin = null;
  let OldSelected = -1;
  s_ListBox.DoHeader(MainView, Localize('Skins'), m.GetListHeaderHeight());
  m.m_RefreshSkinSelector = s_ListBox.DoFilter();
  s_ListBox.DoStart(50, s_paSkinList.length, 10, OldSelected);
  for (let i = 0; i < s_paSkinList.length; ++i) {
    const s = s_paSkinList[i];
    if (!str_comp(s.m_aName, Cfg.m_PlayerSkin)) {
      m.m_pSelectedSkin = s;
      OldSelected = i;
    }
    let id = s_SkinIDs.get(s);
    if (!id) s_SkinIDs.set(s, (id = {}));
    const Item = s_ListBox.DoNextItem(id, OldSelected === i);
    if (Item.m_Visible) {
      const Info = new CTeeRenderInfo();
      for (let p = 0; p < NUM_SKINPARTS; p++) {
        if (s.m_aUseCustomColors[p]) {
          Info.m_aTextures[p] = s.m_apParts[p].m_ColorTexture;
          Info.m_aColors[p] = Skins.GetColorV4(s.m_aPartColors[p], p === P.SKINPART_MARKING);
        } else {
          Info.m_aTextures[p] = s.m_apParts[p].m_OrgTexture;
          Info.m_aColors[p] = v4(1, 1, 1, 1);
        }
      }
      Info.m_Size = 50;
      Item.m_Rect.HSplitTop(5, null, Item.m_Rect); // some margin from the top
      m.RenderTools().RenderTee(CAnimState.GetIdle(), Info, 0, new vec2(1, 0), new vec2(Item.m_Rect.x + Item.m_Rect.w / 2, Item.m_Rect.y + Item.m_Rect.h / 2));
    }
  }
  const NewSelected = s_ListBox.DoEnd();
  if (NewSelected !== -1 && NewSelected !== OldSelected) {
    const pSkin = s_paSkinList[NewSelected];
    m.m_pSelectedSkin = pSkin;
    Cfg.m_PlayerSkin = pSkin.m_aName;
    for (let p = 0; p < NUM_SKINPARTS; p++) {
      Skins.SetSkinVariable(p, pSkin.m_apParts[p].m_aName);
      Skins.SetUCCVariable(p, pSkin.m_aUseCustomColors[p]);
      Skins.SetColorVariable(p, pSkin.m_aPartColors[p]);
    }
    m.m_SkinModified = true;
  }
}

let s_InitSkinPartList = true;
const s_paPartList: CSkinPart[][] = Array.from({ length: NUM_SKINPARTS }, () => []);
let s_PartListBox: CListBox | null = null;
let s_PartOldSelected = -1;
const s_PartIDs = new Map<CSkinPart, object>();

function RenderSkinPartSelection(m: CMenus, MainView: CUIRect): void {
  const Skins = m.m_pClient.m_pSkins, RT = m.RenderTools();
  const s_ListBox = (s_PartListBox ??= new CListBox(m));
  if (s_InitSkinPartList) {
    for (let p = 0; p < NUM_SKINPARTS; p++) {
      s_paPartList[p] = [];
      for (let i = 0; i < Skins.NumSkinPart(p); ++i) {
        const s = Skins.GetSkinPart(p, i);
        // no special skins
        if ((s.m_Flags & SKINFLAG_SPECIAL) === 0 && s_ListBox.FilterMatches(s.m_aName)) s_paPartList[p].push(s);
      }
      s_paPartList[p].sort((a, b) => str_comp(a.m_aName, b.m_aName));
    }
    s_InitSkinPartList = false;
  }
  const Sel = m.m_TeePartSelected;
  s_ListBox.DoHeader(MainView, Localize(ms_apSkinPartNames[Sel]), m.GetListHeaderHeight());
  s_InitSkinPartList = s_ListBox.DoFilter();
  s_ListBox.DoStart(50, s_paPartList[Sel].length, 5, s_PartOldSelected);
  for (let i = 0; i < s_paPartList[Sel].length; ++i) {
    const s = s_paPartList[Sel][i];
    if (!str_comp(s.m_aName, Skins.SkinVariable(Sel))) s_PartOldSelected = i;
    let id = s_PartIDs.get(s);
    if (!id) s_PartIDs.set(s, (id = {}));
    const Item = s_ListBox.DoNextItem(id, s_PartOldSelected === i);
    if (Item.m_Visible) {
      const Info = new CTeeRenderInfo();
      for (let j = 0; j < NUM_SKINPARTS; j++) {
        const pSkinPart = Skins.GetSkinPart(j, Skins.FindSkinPart(j, Skins.SkinVariable(j), false));
        if (Skins.UCCVariable(j)) {
          Info.m_aTextures[j] = Sel === j ? s.m_ColorTexture : pSkinPart.m_ColorTexture;
          Info.m_aColors[j] = Skins.GetColorV4(Skins.ColorVariable(j), j === P.SKINPART_MARKING);
        } else {
          Info.m_aTextures[j] = Sel === j ? s.m_OrgTexture : pSkinPart.m_OrgTexture;
          Info.m_aColors[j] = v4(1, 1, 1, 1);
        }
      }
      Info.m_Size = 50;
      Item.m_Rect.HSplitTop(5, null, Item.m_Rect); // some margin from the top
      const TeePos = new vec2(Item.m_Rect.x + Item.m_Rect.w / 2, Item.m_Rect.y + Item.m_Rect.h / 2);
      if (Sel === P.SKINPART_HANDS) RT.RenderTeeHand(Info, TeePos, new vec2(1, 0), -pi * 0.5, new vec2(18, 0));
      RT.RenderTee(CAnimState.GetIdle(), Info, 0, new vec2(1, 0), TeePos);
    }
  }
  const NewSelected = s_ListBox.DoEnd();
  if (NewSelected !== -1 && NewSelected !== s_PartOldSelected) {
    Skins.SetSkinVariable(Sel, s_paPartList[Sel][NewSelected].m_aName);
    m.Config().m_PlayerSkin = '';
    m.m_SkinModified = true;
  }
  s_PartOldSelected = NewSelected;
}

const s_aColorPalettes = Array.from({ length: NUM_SKINPARTS }, () => ({}));

function RenderSkinPartPalette(m: CMenus, MainView: CUIRect): void {
  const Skins = m.m_pClient.m_pSkins, UI = m.UI(), RT = m.RenderTools();
  if (!Skins.UCCVariable(m.m_TeePartSelected)) return; // color selection not open
  const ButtonHeight = 20, Width = MainView.w, Margin = 5;
  const Button = new CUIRect();
  // palette
  MainView.HSplitBottom(ButtonHeight / 2, MainView, null);
  MainView.HSplitBottom(ButtonHeight + 2 * Margin, MainView, MainView);
  for (let p = 0; p < NUM_SKINPARTS; p++) {
    MainView.VSplitLeft(Width / NUM_SKINPARTS, Button, MainView);
    // no palette if color is unused for this skin parts
    if (Skins.UCCVariable(p)) {
      const HMargin = (Button.w - (ButtonHeight + 2 * Margin)) / 2;
      Button.VSplitLeft(HMargin, null, Button);
      Button.VSplitRight(HMargin, Button, null);
      const PartColor = Skins.GetColorV4(Skins.ColorVariable(p), p === P.SKINPART_MARKING);
      const Hovered = UI.HotItem() === s_aColorPalettes[p];
      const Clicked = UI.DoButtonLogic(s_aColorPalettes[p], Button);
      const Selected = m.m_TeePartSelected === p;
      if (Selected) RT.DrawUIRect(new CUIRect(Button.x, Button.y + ButtonHeight + 2 * Margin + 2, Button.w, 1), v4(1, 1, 1, 1.5), 0, 0);
      RT.DrawUIRect(Button, Hovered ? v4(1, 1, 1, 0.25) : v4(0, 0, 0, 0.25), CORNER_ALL, 5);
      Button.Margin(Margin, Button);
      RT.DrawUIRect(Button, PartColor, CORNER_ALL, 3);
      if (Clicked && p !== m.m_TeePartSelected) {
        let TeePartSelectedColor = Skins.ColorVariable(p);
        TeePartSelectedColor -= ((TeePartSelectedColor >> 24) & 0xff) << 24; // remove any alpha
        if (m.m_TeePartSelected === P.SKINPART_MARKING) TeePartSelectedColor += 0xff << 24; // force full alpha
        Skins.SetColorVariable(m.m_TeePartSelected, TeePartSelectedColor | 0);
      }
    }
  }
}

const s_DynamicCameraButton = {}, s_AutoswitchWeapons = {}, s_Nameplates = {}, s_NameplatesAlways = {}, s_NameplatesSize = {}, s_NameplatesTeamcolors = {},
  s_Showhud = {}, s_ShowUserId = {}, s_Showsocial = {}, s_Filterchat = {}, s_EnableColoredBroadcasts = {}, s_DisableWhisperFeature = {}, s_MenuAlpha = {};
const s_GeneralResetButton = new CButtonContainer();

function RenderSettingsGeneral(m: CMenus, MainView: CUIRect): void {
  const UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config();
  const Label = new CUIRect(), Button = new CUIRect(), Game = new CUIRect(), Client = new CUIRect(), BottomView = new CUIRect();
  // cut view
  MainView.HSplitBottom(80, MainView, BottomView);
  BottomView.HSplitTop(20, null, BottomView);
  // render game menu backgrounds
  let NumOptions = Math.max(Cfg.m_ClNameplates ? 6 : 3, Cfg.m_ClShowsocial ? 6 : 5);
  const ButtonHeight = 20;
  let Spacing = 2;
  let BackgroundHeight = (NumOptions + 1) * ButtonHeight + NumOptions * Spacing;
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_B, 5);
  MainView.HSplitTop(20, null, MainView);
  MainView.HSplitTop(BackgroundHeight, Game, MainView);
  RT.DrawUIRect(Game, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  // render client menu background
  NumOptions = 1;
  BackgroundHeight = (NumOptions + 1) * ButtonHeight + NumOptions * Spacing;
  MainView.HSplitTop(10, null, MainView);
  MainView.HSplitTop(BackgroundHeight, Client, MainView);
  RT.DrawUIRect(Client, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  const GameLeft = new CUIRect(), GameRight = new CUIRect();
  // render game menu
  Game.HSplitTop(ButtonHeight, Label, Game);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Game'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  Game.VSplitMid(GameLeft, GameRight, Spacing);
  const row = (r: CUIRect, Indent = false): CUIRect => {
    r.HSplitTop(Spacing, null, r);
    r.HSplitTop(ButtonHeight, Button, r);
    if (Indent) Button.VSplitLeft(ButtonHeight, null, Button);
    return Button;
  };
  // left side
  if (m.DoButton_CheckBox(s_DynamicCameraButton, Localize('Dynamic Camera'), Cfg.m_ClDynamicCamera, row(GameLeft))) {
    if (Cfg.m_ClDynamicCamera) {
      Cfg.m_ClDynamicCamera = 0;
      // force to defaults when using the GUI
      Cfg.m_ClMouseMaxDistanceStatic = 400;
    } else {
      Cfg.m_ClDynamicCamera = 1;
      // force to defaults when using the GUI
      Cfg.m_ClMouseMaxDistanceDynamic = 1000;
      Cfg.m_ClMouseFollowfactor = 60;
      Cfg.m_ClMouseDeadzone = 300;
    }
  }
  if (m.DoButton_CheckBox(s_AutoswitchWeapons, Localize('Switch weapon on pickup'), Cfg.m_ClAutoswitchWeapons, row(GameLeft))) Cfg.m_ClAutoswitchWeapons ^= 1;
  if (m.DoButton_CheckBox(s_Nameplates, Localize('Show name plates'), Cfg.m_ClNameplates, row(GameLeft))) Cfg.m_ClNameplates ^= 1;
  if (Cfg.m_ClNameplates) {
    if (m.DoButton_CheckBox(s_NameplatesAlways, Localize('Always show name plates'), Cfg.m_ClNameplatesAlways, row(GameLeft, true))) Cfg.m_ClNameplatesAlways ^= 1;
    Cfg.m_ClNameplatesSize = m.DoScrollbarOption(s_NameplatesSize, Cfg.m_ClNameplatesSize, row(GameLeft, true), Localize('Size'), 0, 100);
    if (m.DoButton_CheckBox(s_NameplatesTeamcolors, Localize('Use team colors for name plates'), Cfg.m_ClNameplatesTeamcolors, row(GameLeft, true))) Cfg.m_ClNameplatesTeamcolors ^= 1;
  }
  // right side
  if (m.DoButton_CheckBox(s_Showhud, Localize('Show ingame HUD'), Cfg.m_ClShowhud, row(GameRight))) Cfg.m_ClShowhud ^= 1;
  if (m.DoButton_CheckBox(s_ShowUserId, Localize('Show user IDs'), Cfg.m_ClShowUserId, row(GameRight))) Cfg.m_ClShowUserId ^= 1;
  if (m.DoButton_CheckBox(s_Showsocial, Localize('Show social'), Cfg.m_ClShowsocial, row(GameRight))) Cfg.m_ClShowsocial ^= 1;
  // show chat messages button
  if (Cfg.m_ClShowsocial) {
    const aLabels = [Localize('everyone'), Localize('friends only'), Localize('no one')];
    Cfg.m_ClFilterchat = m.DoScrollbarOptionLabeled(s_Filterchat, Cfg.m_ClFilterchat, row(GameRight, true), Localize('Show chat messages from'), aLabels, 3);
  }
  if (m.DoButton_CheckBox(s_EnableColoredBroadcasts, Localize('Enable colored server broadcasts'), Cfg.m_ClColoredBroadcast, row(GameRight))) Cfg.m_ClColoredBroadcast ^= 1;
  if (m.DoButton_CheckBox(s_DisableWhisperFeature, Localize('Disable whisper feature'), Cfg.m_ClDisableWhisper, row(GameRight))) Cfg.m_ClDisableWhisper ^= 1;
  // render client menu
  Client.HSplitTop(ButtonHeight, Label, Client);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Client'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  Cfg.m_ClMenuAlpha = m.DoScrollbarOption(s_MenuAlpha, Cfg.m_ClMenuAlpha, row(Client), Localize('Menu background transparency'), 0, 75);
  // reset button
  Spacing = 3;
  const ButtonWidth = BottomView.w / 6 - (Spacing * 5) / 6;
  BottomView.VSplitRight(ButtonWidth, null, BottomView);
  m.RenderBackgroundShadow(BottomView, true);
  BottomView.HSplitTop(25, BottomView, null);
  if (m.DoButton_Menu(s_GeneralResetButton, Localize('Reset'), 0, BottomView)) {
    Cfg.m_ClDynamicCamera = 0;
    Cfg.m_ClMouseMaxDistanceStatic = 400;
    Cfg.m_ClMouseMaxDistanceDynamic = 1000;
    Cfg.m_ClMouseFollowfactor = 60;
    Cfg.m_ClMouseDeadzone = 300;
    Cfg.m_ClAutoswitchWeapons = 1;
    Cfg.m_ClShowhud = 1;
    Cfg.m_ClFilterchat = 0;
    Cfg.m_ClNameplates = 1;
    Cfg.m_ClNameplatesAlways = 1;
    Cfg.m_ClNameplatesSize = 50;
    Cfg.m_ClNameplatesTeamcolors = 1;
  }
}

let s_PlayerInit: { Country: number; Name: string; Clan: string } | null = null;
const s_OffsetName: CNumRef = { v: 0 }, s_OffsetClan: CNumRef = { v: 0 };
let s_CountryListBox: CListBox | null = null;

function RenderSettingsPlayer(m: CMenus, MainView: CUIRect): void {
  const UI = m.UI(), RT = m.RenderTools(), G = m.Graphics(), T = m.TextRender(), Cfg = m.Config(), Flags = m.m_pClient.m_pCountryFlags;
  s_PlayerInit ??= { Country: Cfg.m_PlayerCountry, Name: Cfg.m_PlayerName, Clan: Cfg.m_PlayerClan };
  const Button = new CUIRect(), Left = new CUIRect(), Right = new CUIRect(), TopView = new CUIRect(), Label = new CUIRect();
  // render game menu backgrounds
  const ButtonHeight = 20, Spacing = 2;
  const BackgroundHeight = 2 * ButtonHeight + Spacing;
  MainView.HSplitBottom(80, MainView, null); // now we have the total rect for the settings#
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_B, 5);
  MainView.HSplitTop(20, null, MainView);
  MainView.HSplitTop(BackgroundHeight, TopView, MainView);
  RT.DrawUIRect(TopView, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  // render game menu
  TopView.HSplitTop(ButtonHeight, Label, TopView);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Personal'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  // split menu
  TopView.HSplitTop(Spacing, null, TopView);
  TopView.VSplitMid(Left, Right, 3);
  // left menu
  Left.HSplitTop(ButtonHeight, Button, Left);
  m.DoEditBoxOption(s_OffsetName, CfgStr(Cfg, 'm_PlayerName'), 16, Button, Localize('Name'), 100, s_OffsetName);
  // right menu
  Right.HSplitTop(ButtonHeight, Button, Right);
  m.DoEditBoxOption(s_OffsetClan, CfgStr(Cfg, 'm_PlayerClan'), 12, Button, Localize('Clan'), 100, s_OffsetClan);
  // country flag selector
  MainView.HSplitTop(10, null, MainView);
  const s_ListBox = (s_CountryListBox ??= new CListBox(m));
  let OldSelected = -1;
  s_ListBox.DoHeader(MainView, Localize('Country'), m.GetListHeaderHeight());
  s_ListBox.DoStart(40, Flags.Num(), 18, OldSelected);
  for (let i = 0; i < Flags.Num(); ++i) {
    const pEntry = Flags.GetByIndex(i);
    if (pEntry.m_Blocked) continue;
    if (pEntry.m_CountryCode === Cfg.m_PlayerCountry) OldSelected = i;
    const Item = s_ListBox.DoNextItem(pEntry, OldSelected === i);
    if (Item.m_Visible) {
      const L = new CUIRect();
      Item.m_Rect.Margin(5, Item.m_Rect);
      Item.m_Rect.HSplitBottom(10, Item.m_Rect, L);
      const OldWidth = Item.m_Rect.w;
      Item.m_Rect.w = Item.m_Rect.h * 2;
      Item.m_Rect.x += (OldWidth - Item.m_Rect.w) / 2;
      G.TextureSet(pEntry.m_Texture);
      G.QuadsBegin();
      G.SetColor(1, 1, 1, 1);
      G.QuadsDrawTL([new CQuadItem(Item.m_Rect.x, Item.m_Rect.y, Item.m_Rect.w, Item.m_Rect.h)], 1);
      G.QuadsEnd();
      if (Item.m_Selected) {
        T.TextColor(0, 0, 0, 1);
        T.TextOutlineColor(1, 1, 1, 0.25);
        UI.DoLabel(L, pEntry.m_aCountryCodeString, 10, ALIGN_CENTER);
        T.TextColor(1, 1, 1, 1);
        T.TextOutlineColor(0, 0, 0, 0.3);
      } else UI.DoLabel(L, pEntry.m_aCountryCodeString, 10, ALIGN_CENTER);
    }
  }
  const NewSelected = s_ListBox.DoEnd();
  if (OldSelected !== NewSelected) Cfg.m_PlayerCountry = Flags.GetByIndex(NewSelected, true).m_CountryCode;
  // check if the new settings require a server reload
  m.m_NeedRestartPlayer = !(s_PlayerInit.Country === Cfg.m_PlayerCountry && !str_comp(s_PlayerInit.Clan, Cfg.m_PlayerClan) && !str_comp(s_PlayerInit.Name, Cfg.m_PlayerName));
}

const s_aPatternButtons = Array.from({ length: 6 }, () => new CButtonContainer());

function RenderSettingsTeeCustom(m: CMenus, MainView: CUIRect): void {
  const UI = m.UI(), RT = m.RenderTools();
  const Label = new CUIRect(), Patterns = new CUIRect(), Button = new CUIRect(), Left = new CUIRect(), Right = new CUIRect();
  // render skin preview background
  const SpacingH = 2, SpacingW = 3, ButtonHeight = 20;
  RT.DrawUIRect(MainView, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  MainView.HSplitTop(ButtonHeight, Label, MainView);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Customize'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  // skin part selection
  MainView.HSplitTop(SpacingH, null, MainView);
  MainView.HSplitTop(ButtonHeight, Patterns, MainView);
  RT.DrawUIRect(Patterns, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  const ButtonWidth = Patterns.w / 6 - (SpacingW * 5) / 6;
  for (let i = 0; i < NUM_SKINPARTS; i++) {
    Patterns.VSplitLeft(ButtonWidth, Button, Patterns);
    if (m.DoButton_MenuTabTop(s_aPatternButtons[i], Localize(ms_apSkinPartNames[i]), m.m_TeePartSelected === i, Button)) m.m_TeePartSelected = i;
    Patterns.VSplitLeft(SpacingW, null, Patterns);
  }
  MainView.HSplitTop(SpacingH, null, MainView);
  MainView.VSplitMid(Left, Right, SpacingW);
  // part selection
  RenderSkinPartSelection(m, Left);
  // HSL picker
  RenderHSLPicker(m, Right.copy());
  RenderSkinPartPalette(m, Right);
}

let s_CustomSkinMenu = false;
const s_CustomSkinSaveButton = new CButtonContainer(), s_CustomSkinDeleteButton = new CButtonContainer(), s_CustomSwitchButton = new CButtonContainer();

/** the tee of the current skin variables, validated for GameFlags (CTeeRenderInfo and the variables it was made from) */
function OwnTee(m: CMenus, GameFlags: number): { Info: CTeeRenderInfo; aUCCVars: number[]; aColorVars: number[] } {
  const Skins = m.m_pClient.m_pSkins;
  const Info = new CTeeRenderInfo();
  Info.m_Size = 50;
  const apSkinPartsPtr: string[] = [], aUCCVars: number[] = [], aColorVars: number[] = [];
  for (let p = 0; p < NUM_SKINPARTS; p++) {
    apSkinPartsPtr[p] = Skins.SkinVariable(p).slice(0, 23);
    aUCCVars[p] = Skins.UCCVariable(p);
    aColorVars[p] = Skins.ColorVariable(p);
  }
  Skins.ValidateSkinParts(apSkinPartsPtr, aUCCVars, aColorVars, GameFlags);
  for (let p = 0; p < NUM_SKINPARTS; p++) {
    const pSkinPart = Skins.GetSkinPart(p, Skins.FindSkinPart(p, apSkinPartsPtr[p], false));
    if (aUCCVars[p]) {
      Info.m_aTextures[p] = pSkinPart.m_ColorTexture;
      Info.m_aColors[p] = Skins.GetColorV4(aColorVars[p], p === P.SKINPART_MARKING);
    } else {
      Info.m_aTextures[p] = pSkinPart.m_OrgTexture;
      Info.m_aColors[p] = v4(1, 1, 1, 1);
    }
  }
  return { Info, aUCCVars, aColorVars };
}

function RenderSettingsTee(m: CMenus, MainView: CUIRect): void {
  const UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config(), Skins = m.m_pClient.m_pSkins;
  const Button = new CUIRect(), Label = new CUIRect(), BottomView = new CUIRect(), Preview = new CUIRect();
  // cut view
  MainView.HSplitBottom(80, MainView, BottomView);
  BottomView.HSplitTop(20, null, BottomView);
  // render skin preview background
  const SpacingH = 2, SpacingW = 3, ButtonHeight = 20, SkinHeight = 50;
  let BackgroundHeight = ButtonHeight + SpacingH + SkinHeight;
  if (!s_CustomSkinMenu) BackgroundHeight = (ButtonHeight + SpacingH) * 2 + SkinHeight;
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_B, 5);
  MainView.HSplitTop(20, null, MainView);
  MainView.HSplitTop(BackgroundHeight, Preview, MainView);
  RT.DrawUIRect(Preview, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  Preview.HSplitTop(ButtonHeight, Label, Preview);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Skin'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  // Preview
  {
    const Left = new CUIRect(), Right = new CUIRect();
    Preview.HSplitTop(SpacingH, null, Preview);
    Preview.HSplitTop(SkinHeight, Left, Preview);
    // split the menu in 2 parts
    Left.VSplitMid(Left, Right, SpacingW);
    // handle left: validate skin parts for solo mode
    const Own = OwnTee(m, 0);
    // draw preview
    RT.DrawUIRect(Left, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    Left.VSplitMid(Label, Left);
    Label.y += 17;
    UI.DoLabel(Label, Localize('Normal:'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
    RT.DrawUIRect(Left, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    RT.RenderTee(CAnimState.GetIdle(), Own.Info, 0, new vec2(1, 0), new vec2(Left.x + Left.w / 2, Left.y + Left.h / 2 + 2));
    // handle right (team skins): validate skin parts for team game mode
    const Team = OwnTee(m, P.GAMEFLAG_TEAMS);
    const TeamSkinInfo = Team.Info;
    // draw preview
    RT.DrawUIRect(Right, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    Right.VSplitLeft(Right.w / 3 + SpacingW / 2, Label, Right);
    Label.y += 17;
    UI.DoLabel(Label, Localize('Team:'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
    Right.VSplitMid(Left, Right, SpacingW);
    RT.DrawUIRect(Left, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    for (let p = 0; p < NUM_SKINPARTS; p++) TeamSkinInfo.m_aColors[p] = Skins.GetColorV4(Skins.GetTeamColor(Team.aUCCVars[p], Team.aColorVars[p], P.TEAM_RED, p), p === P.SKINPART_MARKING);
    RT.RenderTee(CAnimState.GetIdle(), TeamSkinInfo, 0, new vec2(1, 0), new vec2(Left.x + Left.w / 2, Left.y + Left.h / 2 + 2));
    RT.DrawUIRect(Right, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    for (let p = 0; p < NUM_SKINPARTS; p++) TeamSkinInfo.m_aColors[p] = Skins.GetColorV4(Skins.GetTeamColor(Team.aUCCVars[p], Team.aColorVars[p], P.TEAM_BLUE, p), p === P.SKINPART_MARKING);
    RT.RenderTee(CAnimState.GetIdle(), TeamSkinInfo, 0, new vec2(1, 0), new vec2(Right.x + Right.w / 2, Right.y + Right.h / 2 + 2));
  }
  if (!s_CustomSkinMenu) {
    Preview.HSplitTop(SpacingH, null, Preview);
    RT.DrawUIRect(Preview, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    Preview.y += 2;
    UI.DoLabel(Preview, Cfg.m_PlayerSkin, ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  }
  MainView.HSplitTop(10, null, MainView);
  if (s_CustomSkinMenu) RenderSettingsTeeCustom(m, MainView);
  else RenderSkinSelection(m, MainView);
  // bottom button
  const ButtonWidth = BottomView.w / 6 - (SpacingW * 5) / 6;
  const Deletable = m.m_pSelectedSkin !== null && (m.m_pSelectedSkin.m_Flags & SKINFLAG_STANDARD) === 0;
  const BackgroundWidth = s_CustomSkinMenu || Deletable ? ButtonWidth * 2 + SpacingW : ButtonWidth;
  BottomView.VSplitRight(BackgroundWidth, null, BottomView);
  m.RenderBackgroundShadow(BottomView, true);
  BottomView.HSplitTop(25, BottomView, null);
  if (s_CustomSkinMenu) {
    BottomView.VSplitLeft(ButtonWidth, Button, BottomView);
    if (m.DoButton_Menu(s_CustomSkinSaveButton, Localize('Save'), 0, Button)) m.m_Popup = POPUP_SAVE_SKIN;
    BottomView.VSplitLeft(SpacingW, null, BottomView);
  } else if (Deletable) {
    BottomView.VSplitLeft(ButtonWidth, Button, BottomView);
    if (m.DoButton_Menu(s_CustomSkinDeleteButton, Localize('Delete'), 0, Button)) m.m_Popup = POPUP_DELETE_SKIN;
    BottomView.VSplitLeft(SpacingW, null, BottomView);
  }
  BottomView.VSplitLeft(ButtonWidth, Button, BottomView);
  if (m.DoButton_Menu(s_CustomSwitchButton, s_CustomSkinMenu ? Localize('Basic') : Localize('Custom'), 0, Button)) s_CustomSkinMenu = !s_CustomSkinMenu;
}

// menus_callback.cpp
interface CKeyInfo { m_Name: string; m_pCommand: string; m_KeyId: number; m_Modifier: number; m_BC: CButtonContainer }
const gs_aKeys: CKeyInfo[] = ([
  ['Move left', '+left'], ['Move right', '+right'], ['Jump', '+jump'], ['Fire', '+fire'], ['Hook', '+hook'],
  ['Hammer', '+weapon1'], ['Pistol', '+weapon2'], ['Shotgun', '+weapon3'], ['Grenade', '+weapon4'], ['Laser', '+weapon5'], ['Next weapon', '+nextweapon'], ['Prev. weapon', '+prevweapon'],
  ['Vote yes', 'vote yes'], ['Vote no', 'vote no'],
  ['Chat', 'chat all'], ['Team chat', 'chat team'], ['Whisper', 'chat whisper'], ['Show chat', '+show_chat'], ['Scoreboard', '+scoreboard'], ['Statboard', '+stats'], ['Emoticon', '+emote'],
  ['Spectator mode', '+spectate'], ['Spectate next', 'spectate_next'], ['Spectate previous', 'spectate_previous'], ['Console', 'toggle_local_console'],
  ['Remote console', 'toggle_remote_console'], ['Screenshot', 'screenshot'], ['Respawn', 'kill'], ['Ready', 'ready_change'], ['Add demo marker', 'add_demomarker'],
  ['Toggle sounds', 'snd_toggle'], ['Toggle dynamic camera', 'toggle cl_dynamic_camera 1 0'],
] as [string, string][]).map(([m_Name, m_pCommand]) => ({ m_Name, m_pCommand, m_KeyId: 0, m_Modifier: 0, m_BC: new CButtonContainer() }));

function UiDoGetButtons(m: CMenus, Start: number, Stop: number, View: CUIRect, ButtonHeight: number, Spacing: number): void {
  const Binds = m.m_pClient.m_pBinds;
  for (let i = Start; i < Stop; i++) {
    View.HSplitTop(Spacing, null, View);
    const Key = gs_aKeys[i];
    const Button = new CUIRect(), Label = new CUIRect();
    View.HSplitTop(ButtonHeight, Button, View);
    m.RenderTools().DrawUIRect(Button, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    Button.VSplitMid(Label, Button);
    Label.y += 2;
    m.UI().DoLabel(Label, str_format(64, '%s:', Localize(Key.m_Name)), 13, ALIGN_CENTER);
    const OldId = Key.m_KeyId, OldModifier = Key.m_Modifier;
    const { Key: NewId, Modifier: NewModifier } = m.DoKeyReader(Key.m_BC, Button, OldId, OldModifier);
    if (NewId !== OldId || NewModifier !== OldModifier) {
      if (OldId !== 0 || NewId === 0) Binds.Bind(OldId, OldModifier, '');
      if (NewId !== 0) Binds.Bind(NewId, NewModifier, Key.m_pCommand);
    }
  }
}

function UpdateBindKeys(m: CMenus): void {
  const Binds = m.m_pClient.m_pBinds;
  // this is kinda slow, but whatever
  for (const k of gs_aKeys) k.m_KeyId = k.m_Modifier = 0;
  for (let KeyId = 0; KeyId < K.KEY_LAST; KeyId++) {
    for (let mod = 0; mod < MODIFIER_COUNT; mod++) {
      const pBind = Binds.Get(KeyId, mod);
      if (!pBind) continue;
      for (const k of gs_aKeys)
        if (str_comp(pBind, k.m_pCommand) === 0) {
          k.m_KeyId = KeyId;
          k.m_Modifier = mod;
          break;
        }
    }
  }
}

const s_ButtonMousesens = {}, s_ButtonUiMousesens = {};
function RenderSettingsControlsMouse(m: CMenus, View: CUIRect): number {
  UpdateBindKeys(m);
  const Cfg = m.Config();
  const NumOptions = 2, ButtonHeight = 20, Spacing = 2;
  const BackgroundHeight = NumOptions * ButtonHeight + NumOptions * Spacing;
  View.HSplitTop(BackgroundHeight, View, null);
  m.RenderTools().DrawUIRect(View, v4(0, 0, 0, 0.25), CORNER_B, 5);
  const Button = new CUIRect();
  View.HSplitTop(Spacing, null, View);
  View.HSplitTop(ButtonHeight, Button, View);
  Cfg.m_InpMousesens = m.DoScrollbarOption(s_ButtonMousesens, Cfg.m_InpMousesens, Button, Localize('Ingame mouse sens.'), 1, 500, LogarithmicScrollbarScale);
  View.HSplitTop(Spacing, null, View);
  View.HSplitTop(ButtonHeight, Button, View);
  Cfg.m_UiMousesens = m.DoScrollbarOption(s_ButtonUiMousesens, Cfg.m_UiMousesens, Button, Localize('Menu mouse sens.'), 1, 500, LogarithmicScrollbarScale);
  return BackgroundHeight;
}

function KeyBlock(Start: number, NumOptions: number): (m: CMenus, View: CUIRect) => number {
  return (m, View) => {
    UpdateBindKeys(m);
    const ButtonHeight = 20, Spacing = 2;
    const BackgroundHeight = NumOptions * ButtonHeight + NumOptions * Spacing;
    View.HSplitTop(BackgroundHeight, View, null);
    m.RenderTools().DrawUIRect(View, v4(0, 0, 0, 0.25), CORNER_B, 5);
    UiDoGetButtons(m, Start, Start + NumOptions, View, ButtonHeight, Spacing);
    return BackgroundHeight;
  };
}
const RenderSettingsControlsMovement = KeyBlock(0, 5);
const RenderSettingsControlsWeapon = KeyBlock(5, 7);
const RenderSettingsControlsVoting = KeyBlock(12, 2);
const RenderSettingsControlsChat = KeyBlock(14, 4);
const RenderSettingsControlsMisc = KeyBlock(20, 12);

const s_aStatboardIDs = Array.from({ length: 11 }, () => ({}));
function RenderSettingsControlsStats(m: CMenus, View: CUIRect): number {
  const Cfg = m.Config();
  const Button = new CUIRect();
  const opts: [string, number, number][] = [
    ['Frags', TC.TC_STATS_FRAGS, 0], ['Deaths', TC.TC_STATS_DEATHS, 1], ['Suicides', TC.TC_STATS_SUICIDES, 2], ['Ratio', TC.TC_STATS_RATIO, 3],
    ['Net score', TC.TC_STATS_NET, 4], ['Frags per minute', TC.TC_STATS_FPM, 5], ['Current spree', TC.TC_STATS_SPREE, 6], ['Best spree', TC.TC_STATS_BESTSPREE, 7],
    ['Weapons stats', TC.TC_STATS_WEAPS, 9], ['Flag grabs', TC.TC_STATS_FLAGGRABS, 8], ['Flag captures', TC.TC_STATS_FLAGCAPTURES, 10],
  ];
  for (const [pName, Flag, Id] of opts) {
    View.HSplitTop(20, Button, View);
    if (m.DoButton_CheckBox(s_aStatboardIDs[Id], Localize(pName), Cfg.m_ClStatboardInfos & Flag, Button)) Cfg.m_ClStatboardInfos ^= Flag;
  }
  return 11 * 20;
}

const s_StatboardConfigDropdown = {}, s_StatboardConfigActive = { v: false };
function RenderSettingsControlsScoreboard(m: CMenus, View: CUIRect): number {
  UpdateBindKeys(m);
  const NumOptions = 2, StartOption = 18, ButtonHeight = 20, Spacing = 2;
  const BackgroundHeight = NumOptions * ButtonHeight + NumOptions * Spacing;
  View.HSplitTop(BackgroundHeight, View, null);
  m.RenderTools().DrawUIRect(View, v4(0, 0, 0, 0.25), CORNER_B, 5);
  UiDoGetButtons(m, StartOption, StartOption + NumOptions, View.copy(), ButtonHeight, Spacing);
  View.HSplitTop(ButtonHeight * 2 + Spacing * 3, null, View);
  View.VSplitLeft(View.w / 3, null, View);
  View.VSplitRight(View.w / 2, View, null);
  const Split = m.DoIndependentDropdownMenu(s_StatboardConfigDropdown, View, Localize('Configure statboard'), 20, (v) => RenderSettingsControlsStats(m, v), s_StatboardConfigActive);
  return BackgroundHeight + Split;
}

let s_ControlsScrollRegion: CScrollRegion | null = null;
const s_aControlDropdowns: { id: object; name: string; active: { v: boolean }; fn: (m: CMenus, View: CUIRect) => number }[] = [
  { id: {}, name: 'Mouse', active: { v: true }, fn: RenderSettingsControlsMouse },
  { id: {}, name: 'Movement', active: { v: true }, fn: RenderSettingsControlsMovement },
  { id: {}, name: 'Weapon', active: { v: true }, fn: RenderSettingsControlsWeapon },
  { id: {}, name: 'Voting', active: { v: true }, fn: RenderSettingsControlsVoting },
  { id: {}, name: 'Chat', active: { v: true }, fn: RenderSettingsControlsChat },
  { id: {}, name: 'Scoreboard', active: { v: true }, fn: RenderSettingsControlsScoreboard },
  { id: {}, name: 'Misc', active: { v: true }, fn: RenderSettingsControlsMisc },
];
const s_ControlsResetButton = new CButtonContainer();

function RenderSettingsControls(m: CMenus, MainView: CUIRect): void {
  const Cfg = m.Config();
  // cut view
  const BottomView = new CUIRect();
  MainView.HSplitBottom(80, MainView, BottomView);
  m.RenderTools().DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_B, 5);
  MainView.HSplitTop(20, null, MainView);
  BottomView.HSplitTop(20, null, BottomView);
  const HeaderHeight = 20;
  const s_ScrollRegion = (s_ControlsScrollRegion ??= new CScrollRegion(m));
  const ScrollParams = new CScrollRegionParams();
  ScrollParams.m_ClipBgColor = v4(0, 0, 0, 0);
  const ScrollOffset = s_ScrollRegion.Begin(MainView, ScrollParams);
  MainView.y += ScrollOffset.y;
  const LastExpandRect = new CUIRect();
  // the joystick dropdown is left out: there are no joysticks
  for (const d of s_aControlDropdowns) {
    const Split = m.DoIndependentDropdownMenu(d.id, MainView, Localize(d.name), HeaderHeight, (v) => d.fn(m, v), d.active);
    MainView.HSplitTop(Split + 10, LastExpandRect, MainView);
    s_ScrollRegion.AddRect(LastExpandRect);
  }
  s_ScrollRegion.End();
  // reset button
  const Spacing = 3;
  const ButtonWidth = BottomView.w / 6 - (Spacing * 5) / 6;
  BottomView.VSplitRight(ButtonWidth, null, BottomView);
  m.RenderBackgroundShadow(BottomView, true);
  BottomView.HSplitTop(25, BottomView, null);
  if (m.DoButton_Menu(s_ControlsResetButton, Localize('Reset'), 0, BottomView)) m.m_pClient.m_pBinds.SetDefaults();
}

const s_ButtonGfxTextureQuality = {}, s_ButtonGfxHighDetail = {};
const s_GraphicsResetButton = new CButtonContainer();
let s_GfxTextureQuality: number | null = null;

function RenderSettingsGraphics(m: CMenus, MainView: CUIRect): void {
  const UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config();
  s_GfxTextureQuality ??= Cfg.m_GfxTextureQuality;
  const Label = new CUIRect(), Button = new CUIRect(), Texture = new CUIRect(), BottomView = new CUIRect();
  // render screen menu background
  const ButtonHeight = 20, Spacing = 2;
  const NumOptions = 2;
  const BackgroundHeight = (NumOptions + 1) * ButtonHeight + NumOptions * Spacing;
  MainView.HSplitBottom(80, MainView, BottomView);
  BottomView.HSplitTop(20, null, BottomView);
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_B, 5);
  MainView.HSplitTop(20, null, MainView);
  // the screen box (fullscreen, window, screen, anti aliasing, v-sync, fps) is left out: the browser decides it
  MainView.HSplitTop(BackgroundHeight, Texture, MainView);
  RT.DrawUIRect(Texture, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  // render texture menu
  Texture.HSplitTop(ButtonHeight, Label, Texture);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Texture'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  Texture.HSplitTop(Spacing, null, Texture);
  Texture.HSplitTop(ButtonHeight, Button, Texture);
  if (m.DoButton_CheckBox(s_ButtonGfxTextureQuality, Localize('Quality Textures'), Cfg.m_GfxTextureQuality, Button)) Cfg.m_GfxTextureQuality ^= 1;
  Texture.HSplitTop(Spacing, null, Texture);
  Texture.HSplitTop(ButtonHeight, Button, Texture);
  if (m.DoButton_CheckBox(s_ButtonGfxHighDetail, Localize('High Detail'), Cfg.m_GfxHighDetail, Button)) Cfg.m_GfxHighDetail ^= 1;
  // reset button
  const ButtonWidth = BottomView.w / 6 - (3 * 5) / 6;
  BottomView.VSplitRight(ButtonWidth, null, BottomView);
  m.RenderBackgroundShadow(BottomView, true);
  BottomView.HSplitTop(25, BottomView, null);
  if (m.DoButton_Menu(s_GraphicsResetButton, Localize('Reset'), 0, BottomView)) {
    Cfg.m_GfxTextureQuality = 1;
    Cfg.m_GfxHighDetail = 1;
  }
  // check if the new settings require a restart
  m.m_NeedRestartGraphics = s_GfxTextureQuality !== Cfg.m_GfxTextureQuality;
}

const s_ButtonSndEnable = {}, s_ButtonSndNonactiveMute = {}, s_ButtonSndVolume = {};
const s_SoundResetButton = new CButtonContainer();

function RenderSettingsSound(m: CMenus, MainView: CUIRect): void {
  const UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config();
  const Label = new CUIRect(), Button = new CUIRect(), Sound = new CUIRect(), Detail = new CUIRect(), BottomView = new CUIRect();
  // render sound menu background
  const NumOptions = Cfg.m_SndEnable ? 2 : 1;
  const ButtonHeight = 20;
  let Spacing = 2;
  let BackgroundHeight = (NumOptions + 1) * ButtonHeight + NumOptions * Spacing;
  let TotalHeight = BackgroundHeight;
  if (Cfg.m_SndEnable) TotalHeight += 10 + 2 * ButtonHeight + Spacing;
  MainView.HSplitBottom(MainView.h - TotalHeight - 20, MainView, BottomView);
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_B, 5);
  MainView.HSplitTop(20, null, MainView);
  MainView.HSplitTop(BackgroundHeight, Sound, MainView);
  RT.DrawUIRect(Sound, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  // render detail menu background
  if (Cfg.m_SndEnable) {
    BackgroundHeight = 2 * ButtonHeight + Spacing;
    MainView.HSplitTop(10, null, MainView);
    MainView.HSplitTop(BackgroundHeight, Detail, MainView);
    RT.DrawUIRect(Detail, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  }
  // render sound menu
  Sound.HSplitTop(ButtonHeight, Label, Sound);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Sound'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  Sound.HSplitTop(Spacing, null, Sound);
  const UseSoundButton = new CUIRect();
  Sound.HSplitTop(ButtonHeight, UseSoundButton, Sound);
  if (Cfg.m_SndEnable) {
    Sound.HSplitTop(Spacing, null, Sound);
    Sound.HSplitTop(ButtonHeight, Button, Sound);
    Button.VSplitLeft(ButtonHeight, null, Button);
    if (m.DoButton_CheckBox(s_ButtonSndNonactiveMute, Localize('Mute when not active'), Cfg.m_SndNonactiveMute, Button)) Cfg.m_SndNonactiveMute ^= 1;
    // render detail menu
    Detail.HSplitTop(ButtonHeight, Label, Detail);
    Label.y += 2;
    UI.DoLabel(Label, Localize('Detail'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
    // split menu
    const Left = new CUIRect(), Right = new CUIRect();
    Detail.HSplitTop(Spacing, null, Detail);
    Detail.VSplitMid(Left, Right, 3);
    // the sample rate is the browser's
    Right.HSplitTop(ButtonHeight, Button, Right);
    Cfg.m_SndVolume = m.DoScrollbarOption(s_ButtonSndVolume, Cfg.m_SndVolume, Button, Localize('Volume'), 0, 100, LogarithmicScrollbarScale);
  }
  if (m.DoButton_CheckBox(s_ButtonSndEnable, Localize('Use sounds'), Cfg.m_SndEnable, UseSoundButton)) {
    Cfg.m_SndEnable ^= 1;
    if (Cfg.m_SndEnable) Cfg.m_SndInit = 1;
  }
  // reset button
  BottomView.HSplitBottom(60, null, BottomView);
  Spacing = 3;
  const ButtonWidth = BottomView.w / 6 - (Spacing * 5) / 6;
  BottomView.VSplitRight(ButtonWidth, null, BottomView);
  m.RenderBackgroundShadow(BottomView, true);
  BottomView.HSplitTop(25, BottomView, null);
  if (m.DoButton_Menu(s_SoundResetButton, Localize('Reset'), 0, BottomView)) {
    Cfg.m_SndEnable = 1;
    Cfg.m_SndInit = 1;
    Cfg.m_SndMusic = 1;
    Cfg.m_SndNonactiveMute = 0;
    Cfg.m_SndRate = 48000;
    Cfg.m_SndVolume = 100;
  }
}

export function RenderSettings(m: CMenus, MainView: CUIRect): void {
  const Cfg = m.Config(), UI = m.UI(), Cl = m.Client(), gc = m.m_pClient;
  // handle which page should be rendered
  if (Cfg.m_UiSettingsPage === SETTINGS_GENERAL) RenderSettingsGeneral(m, MainView.copy());
  else if (Cfg.m_UiSettingsPage === SETTINGS_PLAYER) RenderSettingsPlayer(m, MainView.copy());
  else if (Cfg.m_UiSettingsPage === SETTINGS_TEE) RenderSettingsTee(m, MainView.copy());
  else if (Cfg.m_UiSettingsPage === SETTINGS_CONTROLS) RenderSettingsControls(m, MainView.copy());
  else if (Cfg.m_UiSettingsPage === SETTINGS_GRAPHICS) RenderSettingsGraphics(m, MainView.copy());
  else if (Cfg.m_UiSettingsPage === SETTINGS_SOUND) RenderSettingsSound(m, MainView.copy());
  MainView.HSplitBottom(32, null, MainView);
  // reset warning
  const NeedReconnect = (m.m_NeedRestartPlayer || (m.m_SkinModified && gc.m_LastSkinChangeTime + 6 > Cl.LocalTime())) && Cl.State() === STATE_ONLINE;
  // backwards compatibility
  const v = Cl.GetServerInfo().m_aVersion;
  const NeedRestartTee = v === '0.7.1' || v === '0.7.2';
  if (m.m_NeedRestartGraphics || m.m_NeedRestartSound || NeedReconnect || NeedRestartTee) {
    // background
    const RestartWarning = new CUIRect();
    MainView.HSplitTop(25, RestartWarning, null);
    RestartWarning.VMargin(Cfg.m_UiWideview ? 210 : 140, RestartWarning);
    m.RenderTools().DrawUIRect(RestartWarning, v4(1, 1, 1, 0.25), CORNER_ALL, 5);
    // text
    m.TextRender().TextColor(0.973, 0.863, 0.207, 1);
    RestartWarning.y += 2;
    const FontSize = RestartWarning.h * FontmodHeight * 0.75;
    if (m.m_NeedRestartGraphics || m.m_NeedRestartSound) UI.DoLabel(RestartWarning, Localize('You must restart the game for all settings to take effect.'), FontSize, ALIGN_CENTER);
    else if (Cl.State() === STATE_ONLINE) {
      if (m.m_NeedRestartPlayer || NeedRestartTee) UI.DoLabel(RestartWarning, Localize('You must reconnect to change identity.'), FontSize, ALIGN_CENTER);
      else if (m.m_SkinModified) UI.DoLabel(RestartWarning, str_format(128, Localize('You have to wait %1.0f seconds to change identity.'), gc.m_LastSkinChangeTime + 6.5 - Cl.LocalTime()), FontSize, ALIGN_CENTER);
    }
    m.TextRender().TextColor(1, 1, 1, 1);
  }
}
