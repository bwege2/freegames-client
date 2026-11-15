// C-Dogs SDL 2.5.0, translated: the equipment screen before a mission (prep_equip.c, equip_menu.c, weapon_menu.c,
// ammo_menu.c, util_menu.c) and the wait for the game start (prep.c ScreenWait, ScreenWaitForGameStart).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  Button1, Button2, CLAMP, DIRECTION_DOWN, Down, Left, MAX, MIN, Right, Up, ColorMult, colorBlack, colorBlue, colorDarkGray, colorGray,
  colorGreen, colorMaroon, colorOfficeGreen, colorRed, colorSelectedBG, colorWhite, colorYellow, type Color, type Vec2i,
} from '../core/base.ts';
import {
  AmmoGetById, AmmoGetNumClasses, AmmoIsLow, GunTypeGetSlotStartEnd, WeaponClassFullPrice, WeaponClassGetBarrel, WeaponClassGetPrerequisite,
  WeaponClassNumBarrels, WeaponClassesAreRelated,
} from '../core/classes.ts';
import { CPicGetPic, PicManagerGetPic, PicManagerGetSprites, gPicManager, type NamedSprites, type Pic } from '../core/pics.ts';
import { GAME_MODE_NORMAL, gCampaign, gMission, gPlayerDatas } from '../core/state.ts';
import { GUNTYPE_GRENADE, GUNTYPE_MELEE, INPUT_DEVICE_AI, MAX_GRENADES, MAX_GUNS, MAX_WEAPONS, MELEE_SLOT, type PlayerData, type WeaponClass } from '../core/types.ts';
import {
  CampaignGetLives, CampaignGetMaxHP, CampaignGetMaxLives, GetNumPlayers, PLAYER_ANY, PlayerAddAmmo, PlayerAddMinimalWeapons, PlayerAddWeapon,
  PlayerAddWeaponToSlot, PlayerDataGetByUID, PlayerGetAmmoAmount, PlayerGetNumWeapons, PlayerHasWeapon, PlayerRemoveWeapon, PlayerScore,
  PlayerSetHP, PlayerSetLives, PlayerUsesAmmo, PlayerUsesAnyAmmo,
} from '../core/player.ts';
import { AICoopSelectWeapons } from '../core/aicoop.ts';
import { CampaignUnload } from '../core/data.ts';
import { AutosaveGetCampaign, PlayerSavesApply } from '../core/autosave.ts';
import { gSoundDevice, SoundPlay, StrSound } from '../core/sounds.ts';
import { EVENT_WAIT_CANCEL, EVENT_WAIT_CONTINUE, EVENT_WAIT_OK, EventIsEscape, GetMenuCmd, GetPlayerCmds, ARROW_DOWN, ARROW_UP } from '../platform/input.ts';
import { ALIGN_CENTER, ALIGN_END, ALIGN_START, CPicDraw, CPicDrawContextNew, DrawCross, DrawRectangle, FLIP_NONE, FLIP_VERTICAL, FontH, FontOptsNew, FontStrOpt, FontStrSize, PicRender, gGfx, type FontOpts } from '../render/gfx.ts';
import { Draw9Slice, DrawCharacterSimple, GetHeadPic } from '../render/draw.ts';
import {
  DisplayMenuItem, MENU_ALIGN_LEFT, MENU_SOUND_BACK, MENU_SOUND_ENTER, MENU_SOUND_SWITCH, MENU_TYPE_NORMAL, MENU_TYPE_RETURN, MenuAddExitType,
  MenuCreateCustom, MenuCreateNormal, MenuDisplay, MenuDraw, MenuIsExit, MenuPlaySound, MenuProcessCmd, MenuSetDisabled, MenuSetPostInputFunc,
  MenuSystemAddCustomDisplay, MenuSystemInit, MenuUpdate, type Menu, type MenuSystem,
} from './menu.ts';
import { GameLoopDataNew, UPDATE_RESULT_DRAW, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';
import { AnimatedCounterDraw, AnimatedCounterNew, AnimatedCounterUpdate, type AnimatedCounter } from './briefing.ts';
import { MenuDisplayPlayerControls } from './playerselect.ts';
import { ScreenLoading } from './loading.ts';
import { RunGame } from './rungame.ts';

/** online play: the players' equipment goes to the other clients, the game starts when all are ready */
export const equipHooks = {
  sendPlayerData: (): void => {},
  /** null: offline; otherwise has every client sent its players (gMission.HasStarted in the original) */
  allReady: null as (() => boolean) | null,
  /** the connection is gone */
  disconnected: (): boolean => false,
};

const META_NONE = 0;
const META_NEW = 1;
const META_UPGRADE = 2;
const META_DOWNGRADE = 3;
const NO_GUN_LABEL = '(None)';
const EQUIP_MENU_SLOT_HEIGHT = 40;
const SLOT_BORDER = 3;
const AMMO_LEVEL_W = 2;
const SCROLL_H = 12;
const DIV_ROUND_UP = (x: number, y: number): number => Math.trunc((x + y - 1) / y);
const fopt = (HAlign: number, VAlign: number, Area: Vec2i, Pad: Vec2i, Mask: Color): FontOpts => ({ HAlign, VAlign, Area, Pad, Mask });
const playerOf = (uid: number): PlayerData => PlayerDataGetByUID(uid)!;

function InSlot(wc: WeaponClass, slot: number): boolean {
  const [s, e] = GunTypeGetSlotStartEnd(wc.Type);
  return slot >= s && slot <= e;
}
const WC_AMMO_ID = (wc: WeaponClass, i: number): number => WeaponClassGetBarrel(wc, i).Normal.AmmoId;

export function DrawWeaponAmmo(p: PlayerData, wc: WeaponClass | null, mask: Color, pos: Vec2i, slotSize: Vec2i): void {
  if (!gCampaign.Setting.Ammo || !wc) return;
  const c = CPicDrawContextNew();
  c.Mask = mask;
  const numBarrels = WeaponClassNumBarrels(wc);
  for (let i = 0; i < numBarrels; i++) {
    const ammoId = WC_AMMO_ID(wc, i);
    if (ammoId < 0) continue;
    const a = AmmoGetById(ammoId)!;
    const amount = PlayerGetAmmoAmount(p, ammoId);
    const ammoMax = a.Max ? a.Max : amount;
    if (ammoMax > 0) {
      const dx = slotSize.x - SLOT_BORDER - AMMO_LEVEL_W * (numBarrels - i);
      const h = Math.trunc((amount * (slotSize.y - 2 * SLOT_BORDER)) / ammoMax);
      if (AmmoIsLow(a, amount)) {
        DrawRectangle({ x: pos.x + dx, y: pos.y + SLOT_BORDER }, { x: AMMO_LEVEL_W, y: slotSize.y - 2 * SLOT_BORDER }, ColorMult(colorRed, mask), true);
      }
      if (amount > 0) DrawRectangle({ x: pos.x + dx, y: pos.y + slotSize.y - SLOT_BORDER - h }, { x: AMMO_LEVEL_W, y: h }, ColorMult(colorBlue, mask), true);
    }
    CPicDraw(a.Pic, { x: pos.x + slotSize.x - (16 - (numBarrels - i) * 4), y: pos.y + slotSize.y - 18 }, c);
  }
}
function DrawMeta(meta: number, metaPos: Vec2i): void {
  const arrow = PicManagerGetPic(gPicManager, 'hud/arrow');
  const arrowPos = { x: metaPos.x - 4, y: metaPos.y };
  switch (meta) {
    case META_NEW: DrawCross(metaPos, colorGreen); break;
    case META_UPGRADE: PicRender(arrow, arrowPos, colorGreen); break;
    case META_DOWNGRADE: PicRender(arrow, arrowPos, colorRed, 0, { x: 1, y: 1 }, FLIP_VERTICAL); break;
    default: break;
  }
}
function DrawScroll(bg: Pic, pos: Vec2i, scrollSize: Vec2i, color: Color, down: boolean, gradientPos: Vec2i): void {
  const gradient = PicManagerGetPic(gPicManager, 'hud/gradient');
  PicRender(gradient, gradientPos, colorBlack, 0, { x: scrollSize.x, y: 1 }, down ? FLIP_VERTICAL : FLIP_NONE);
  const r = { Pos: pos, Size: scrollSize };
  Draw9Slice(bg, r, 3, 3, 3, 3, true, color, FLIP_NONE);
  const fo = FontOptsNew();
  fo.Area = scrollSize;
  fo.HAlign = ALIGN_CENTER;
  fo.VAlign = ALIGN_CENTER;
  fo.Mask = color;
  FontStrOpt(down ? ARROW_DOWN : ARROW_UP, pos, fo);
}

// --- weapon_menu.c ---------------------------------------------------------------------------------------------------

const WEAPON_MENU_NONE = 0;
const WEAPON_MENU_SELECT = 1;
const WEAPON_MENU_CANCEL = 2;
const WEAPON_MENU_MAX_ROWS = 4;
const GUN_BG_W = 40;
const GUN_BG_H = 25;
interface WeaponMenu {
  ms: MenuSystem;
  PlayerUID: number;
  menuBGSprites: NamedSprites;
  weapons: WeaponClass[];
  weaponIsNew: boolean[];
  weaponIndices: number[];
  weaponMeta: number[];
  slot: number;
  idx: number;
  cols: number;
  scroll: number;
  Active: boolean;
  SelectResult: number;
}
function GetSelectedGun(m: WeaponMenu): WeaponClass | null {
  return m.idx >= m.weaponIndices.length ? null : m.weapons[m.weaponIndices[m.idx]];
}
function EquipCostDiff(wc: WeaponClass | null, p: PlayerData, slot: number): number {
  if (!gCampaign.Setting.BuyAndSell) return 0;
  if (PlayerHasWeapon(p, wc)) return 0;
  return WeaponClassFullPrice(wc) - WeaponClassFullPrice(p.guns[slot]);
}
function WeaponMenuSelectedCostDiff(m: WeaponMenu): number {
  const wc = GetSelectedGun(m);
  return wc ? EquipCostDiff(wc, playerOf(m.PlayerUID), m.slot) : 0;
}
function WeaponClampScroll(m: WeaponMenu): number {
  const selectedRow = Math.trunc(m.idx / m.cols);
  const lastRow = Math.trunc(m.weaponIndices.length / m.cols);
  let minRow = MAX(0, selectedRow - WEAPON_MENU_MAX_ROWS + 1);
  let maxRow = MIN(selectedRow, MAX(0, DIV_ROUND_UP(m.weaponIndices.length + 1, m.cols) - WEAPON_MENU_MAX_ROWS));
  if (selectedRow - m.scroll === WEAPON_MENU_MAX_ROWS - 1 && selectedRow < lastRow) minRow++;
  else if (selectedRow === m.scroll && selectedRow > 0) maxRow--;
  return CLAMP(m.scroll, minRow, maxRow);
}
function WeaponMenuCreate(weapons: WeaponClass[], weaponIsNew: boolean[], playerUID: number, slot: number, pos: Vec2i, size: Vec2i): WeaponMenu {
  const m: WeaponMenu = {
    ms: MenuSystemInit(pos, size), PlayerUID: playerUID, menuBGSprites: PicManagerGetSprites(gPicManager, 'hud/gun_bg')!, weapons, weaponIsNew,
    weaponIndices: [], weaponMeta: [], slot, idx: 0, cols: 2, scroll: 0, Active: false, SelectResult: WEAPON_MENU_NONE,
  };
  WeaponMenuReset(m);
  // the original computes the columns from menu->size, which is never set (zero): always 2
  m.cols = CLAMP(Math.trunc(Math.trunc((0 * 3) / (m.menuBGSprites.pics[0].size.x + 2)) / 4), 2, 4);
  m.ms.align = MENU_ALIGN_LEFT;
  const menu = MenuCreateCustom('', (_mm, p, s) => WeaponDrawMenu(m, p, s), (cmd) => WeaponHandleInput(m, cmd), m);
  MenuSetPostInputFunc(menu, (_mm, cmd) => {
    if (Button1(cmd)) {
      const p = playerOf(m.PlayerUID);
      const g = GetSelectedGun(m);
      if (gCampaign.Setting.BuyAndSell && WeaponMenuSelectedCostDiff(m) > p.Totals.Score) {
        SoundPlay(gSoundDevice, StrSound('ammo_none'));
        return;
      }
      m.SelectResult = WEAPON_MENU_SELECT;
      if (g != null) SoundPlay(gSoundDevice, g.SwitchSound);
      else MenuPlaySound(MENU_SOUND_SWITCH);
    } else if (Button2(cmd)) {
      m.SelectResult = WEAPON_MENU_CANCEL;
      MenuPlaySound(MENU_SOUND_BACK);
    }
  }, m);
  m.ms.root = m.ms.current = menu;
  MenuSystemAddCustomDisplay(m.ms, MenuDisplayPlayerControls, { PlayerUID: playerUID });
  return m;
}
function WeaponDrawMenu(d: WeaponMenu, pos: Vec2i, size: Vec2i): void {
  const weaponsY = Math.trunc((size.y - (EQUIP_MENU_SLOT_HEIGHT * 2 + FontH())) / 2) - 12;
  const color = d.Active ? colorWhite : colorGray;
  const h = GUN_BG_H + (gCampaign.Setting.BuyAndSell ? FontH() : 0);
  const bgSize = { x: GUN_BG_W, y: h };
  const scrollSize = { x: d.cols * GUN_BG_W - 2, y: SCROLL_H };
  let scrollDown = false;
  for (let i = 0; i < d.weaponIndices.length; i++) {
    const row = Math.trunc(i / d.cols);
    const idx = d.weaponIndices[i];
    if (row >= d.scroll && row < d.scroll + WEAPON_MENU_MAX_ROWS) DrawGun(d, i, d.weapons[idx], d.weaponMeta[idx], { x: pos.x, y: pos.y + weaponsY }, bgSize);
    if (row === d.scroll + WEAPON_MENU_MAX_ROWS) {
      scrollDown = true;
      break;
    }
  }
  const gradient = PicManagerGetPic(gPicManager, 'hud/gradient')!;
  const bg = d.menuBGSprites.pics[0];
  if (d.scroll > 0) {
    const sp = { x: pos.x + 3, y: pos.y + 1 + weaponsY };
    DrawScroll(bg, sp, scrollSize, color, false, { x: sp.x + Math.trunc(scrollSize.x / 2), y: pos.y + Math.trunc(gradient.size.y / 2) + weaponsY + scrollSize.y - 1 });
  }
  if (scrollDown) {
    const sp = { x: pos.x + 3, y: pos.y - 1 + weaponsY + bgSize.y * WEAPON_MENU_MAX_ROWS - SCROLL_H };
    DrawScroll(bg, sp, scrollSize, color, true, {
      x: sp.x + Math.trunc(scrollSize.x / 2),
      y: pos.y - Math.trunc(gradient.size.y / 2) + weaponsY + bgSize.y * WEAPON_MENU_MAX_ROWS - SCROLL_H - Math.trunc(gradient.size.y / 2) + 1,
    });
  } else {
    DrawGun(d, d.weaponIndices.length, null, META_NONE, { x: pos.x, y: pos.y + weaponsY }, bgSize);
  }
}
function DrawGun(d: WeaponMenu, idx: number, wc: WeaponClass | null, meta: number, pos: Vec2i, bgSize: Vec2i): void {
  const selected = d.idx === idx;
  const p = playerOf(d.PlayerUID);
  const equipped = wc != null && PlayerHasWeapon(p, wc);
  const bg = d.menuBGSprites.pics[selected ? 1 : 0];
  const bgPos = { x: pos.x + 2 + (idx % d.cols) * GUN_BG_W, y: pos.y + (Math.trunc(idx / d.cols) - d.scroll) * bgSize.y };
  const costDiff = EquipCostDiff(wc, p, d.slot);
  const enabled = d.Active && (!gCampaign.Setting.BuyAndSell || costDiff <= p.Totals.Score);
  let color = enabled ? colorWhite : colorGray;
  const mask = color;
  if (selected && d.Active) {
    DrawRectangle(bgPos, bgSize, colorSelectedBG, true);
    color = colorRed;
  } else if (equipped) {
    color = colorYellow;
  }
  Draw9Slice(bg, { Pos: { x: bgPos.x + 1, y: bgPos.y + 1 }, Size: { x: GUN_BG_W - 2, y: bgSize.y - 2 } }, 3, 3, 3, 3, true, mask, FLIP_NONE);
  const icon = wc ? wc.Icon : PicManagerGetPic(gPicManager, 'peashooter');
  if (icon) {
    PicRender(icon, { x: bgPos.x + Math.trunc(bgSize.x / 2) - Math.trunc(icon.size.x / 2), y: bgPos.y + Math.trunc(bgSize.y / 2) - Math.trunc(icon.size.y / 2) }, wc ? mask : colorBlack);
  }
  DrawWeaponAmmo(p, wc, mask, bgPos, { x: bgSize.x - 1, y: bgSize.y });
  if (gCampaign.Setting.BuyAndSell && wc && wc.Price !== 0) {
    FontStrOpt(`$${wc.Price}`, bgPos, fopt(ALIGN_CENTER, ALIGN_START, bgSize, { x: 2, y: 2 }, enabled ? (selected ? colorRed : colorGray) : colorDarkGray));
  }
  DrawMeta(meta, { x: bgPos.x + GUN_BG_W - 6, y: bgPos.y + 5 });
  FontStrOpt(wc ? wc.name : NO_GUN_LABEL, bgPos, fopt(ALIGN_CENTER, ALIGN_END, bgSize, { x: 2, y: 2 }, color));
}
function WeaponHandleInput(d: WeaponMenu, cmd: number): boolean {
  const p = playerOf(d.PlayerUID);
  const numGuns = d.weaponIndices.length;
  if (Button1(cmd)) {
    if (gCampaign.Setting.BuyAndSell) {
      const c = WeaponMenuSelectedCostDiff(d);
      if (c > 0 && c > p.Totals.Score) return false;
    }
    return true;
  } else if (Button2(cmd)) {
    return true;
  } else if (Left(cmd)) {
    if (d.idx % d.cols > 0) {
      d.idx--;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  } else if (Right(cmd)) {
    if (d.idx % d.cols < d.cols - 1 && numGuns > 0) {
      d.idx++;
      if (d.idx > numGuns) d.idx = MAX(0, d.idx - d.cols);
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  } else if (Up(cmd)) {
    if (d.idx >= d.cols) {
      d.idx -= d.cols;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  } else if (Down(cmd)) {
    if (d.idx + d.cols < DIV_ROUND_UP(numGuns + 1, d.cols) * d.cols) {
      d.idx = MIN(numGuns, d.idx + d.cols);
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  }
  d.scroll = WeaponClampScroll(d);
  return false;
}
function WeaponMenuReset(m: WeaponMenu): void {
  const p = playerOf(m.PlayerUID);
  m.idx = 0;
  const equipped = p.guns[m.slot];
  m.weaponMeta = m.weapons.map((wc, i) => {
    let meta = m.weaponIsNew[i] ? META_NEW : META_NONE;
    if (equipped != null) {
      if (equipped === WeaponClassGetPrerequisite(wc)) meta = META_UPGRADE;
      else if (WeaponClassGetPrerequisite(equipped) === wc) meta = META_DOWNGRADE;
    }
    return meta;
  });
  m.weaponIndices = [];
  if (equipped != null) {
    m.weapons.forEach((wc, i) => { if (WeaponClassGetPrerequisite(wc) === equipped) m.weaponIndices.push(i); });
    m.weapons.forEach((wc, i) => { if (WeaponClassGetPrerequisite(equipped) === wc) m.weaponIndices.push(i); });
  }
  m.weapons.forEach((wc, i) => {
    if (!InSlot(wc, m.slot)) return;
    if (wc === equipped) m.idx = m.weaponIndices.length;
    else if (WeaponClassesAreRelated(wc, equipped)) return;
    else if (WeaponClassGetPrerequisite(wc) != null && !PlayerHasWeapon(p, wc)) return;
    m.weaponIndices.push(i);
  });
}
function WeaponMenuUpdate(m: WeaponMenu, cmd: number): void {
  const p = playerOf(m.PlayerUID);
  MenuProcessCmd(m.ms, cmd);
  switch (m.SelectResult) {
    case WEAPON_MENU_SELECT:
      PlayerAddWeaponToSlot(p, GetSelectedGun(m), m.slot);
    // fallthrough
    case WEAPON_MENU_CANCEL:
      m.ms.current = m.ms.root;
      m.Active = false;
      break;
    default:
      break;
  }
}

// --- ammo_menu.c / util_menu.c ---------------------------------------------------------------------------------------

const MENU_MAX_ROWS = 4;
const BUTTON_BG_W = 20;
const ROW_H = 10;
const SEL_NONE = 0;
const SEL_SELECT = 1;
const SEL_CANCEL = 2;
interface AmmoMenu { ms: MenuSystem; PlayerUID: number; buttonBG: Pic; ammoIds: number[]; idx: number; scroll: number; Active: boolean; SelectResult: number }
function GetSelectedAmmo(m: AmmoMenu): number {
  return Math.trunc(m.idx / 2) >= m.ammoIds.length ? -1 : m.ammoIds[Math.trunc(m.idx / 2)];
}
function CanBuy(m: AmmoMenu, ammoId: number): boolean {
  const p = playerOf(m.PlayerUID);
  const a = AmmoGetById(ammoId)!;
  return a.Max > PlayerGetAmmoAmount(p, ammoId) && a.Price <= p.Totals.Score;
}
const CanSell = (m: AmmoMenu, ammoId: number): boolean => PlayerGetAmmoAmount(playerOf(m.PlayerUID), ammoId) > 0;
function AmmoMenuSelectedCostDiff(m: AmmoMenu): number {
  const p = playerOf(m.PlayerUID);
  const ammoId = GetSelectedAmmo(m);
  if (ammoId >= 0) {
    const a = AmmoGetById(ammoId)!;
    const amount = PlayerGetAmmoAmount(p, ammoId);
    if ((m.idx & 1) === 0 && a.Max > amount) return a.Price;
    if (amount > 0) return -a.Price;
  }
  return 0;
}
function AmmoClampScroll(m: AmmoMenu): number {
  const selectedRow = Math.trunc(m.idx / 2);
  const lastRow = Math.trunc(m.ammoIds.length / 2);
  let minRow = MAX(0, selectedRow - MENU_MAX_ROWS + 1);
  let maxRow = MIN(selectedRow, MAX(0, lastRow - MENU_MAX_ROWS));
  if (selectedRow - m.scroll === MENU_MAX_ROWS - 1 && selectedRow < lastRow) minRow++;
  else if (selectedRow === m.scroll && selectedRow > 0) maxRow--;
  return CLAMP(m.scroll, minRow, maxRow);
}
/** the original's AmmoMenu/UtilMenu size is never set (zero) */
const ITEM_W = CLAMP(Math.trunc((0 * 3) / 4), 40 * 2, 40 * 4);
function BuySell(x0: number, y: number, bgW: number, buttonBG: Pic, sellSelected: boolean, canSell: boolean, buySelected: boolean, canBuy: boolean): void {
  let x = x0 + bgW - BUTTON_BG_W - 2;
  const sellPos = { x, y };
  Draw9Slice(buttonBG, { Pos: sellPos, Size: { x: BUTTON_BG_W, y: FontH() + 4 } }, 3, 3, 3, 3, true, canSell ? (sellSelected ? colorRed : colorMaroon) : colorGray, FLIP_NONE);
  FontStrOpt('Sell', sellPos, fopt(ALIGN_CENTER, ALIGN_START, { x: BUTTON_BG_W, y: FontH() }, { x: 2, y: 2 }, sellSelected ? colorRed : colorGray));
  x -= BUTTON_BG_W + 3;
  const buyPos = { x, y };
  Draw9Slice(buttonBG, { Pos: buyPos, Size: { x: BUTTON_BG_W, y: FontH() + 4 } }, 3, 3, 3, 3, true, canBuy ? (buySelected ? colorGreen : colorOfficeGreen) : colorGray, FLIP_NONE);
  FontStrOpt('Buy', buyPos, fopt(ALIGN_CENTER, ALIGN_START, { x: BUTTON_BG_W, y: FontH() }, { x: 2, y: 2 }, buySelected ? colorGreen : colorGray));
}
function AmmoMenuCreate(playerUID: number, pos: Vec2i, size: Vec2i): AmmoMenu {
  const m: AmmoMenu = { ms: MenuSystemInit(pos, size), PlayerUID: playerUID, buttonBG: PicManagerGetPic(gPicManager, 'hud/button_bg')!, ammoIds: [], idx: -1, scroll: 0, Active: false, SelectResult: SEL_NONE };
  AmmoMenuReset(m);
  m.ms.align = MENU_ALIGN_LEFT;
  const menu = MenuCreateCustom('', (_mm, p, s) => AmmoDrawMenu(m, p, s), (cmd) => {
    const numAmmo = m.ammoIds.length;
    if (Button1(cmd)) {
      // nothing
    } else if (Button2(cmd)) {
      return true;
    } else if (Left(cmd)) {
      if (m.idx % 2 === 1) {
        m.idx--;
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    } else if (Right(cmd)) {
      if (m.idx < numAmmo * 2 && m.idx % 2 === 0) {
        m.idx++;
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    } else if (Up(cmd)) {
      if (m.idx >= 2) {
        m.idx -= 2;
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    } else if (Down(cmd)) {
      if (m.idx + 2 < numAmmo * 2 + 2) {
        m.idx = MIN(numAmmo * 2 + 2, m.idx + 2);
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    }
    m.scroll = AmmoClampScroll(m);
    return false;
  }, m);
  MenuSetPostInputFunc(menu, (_mm, cmd) => {
    m.SelectResult = SEL_NONE;
    if (Button1(cmd)) {
      const ammoId = GetSelectedAmmo(m);
      if (ammoId < 0) {
        m.SelectResult = SEL_CANCEL;
        MenuPlaySound(MENU_SOUND_BACK);
      } else {
        const a = AmmoGetById(ammoId)!;
        const buy = (m.idx & 1) === 0;
        if ((buy && CanBuy(m, ammoId)) || (!buy && CanSell(m, ammoId))) {
          SoundPlay(gSoundDevice, StrSound(a.Sound));
          m.SelectResult = SEL_SELECT;
        } else {
          SoundPlay(gSoundDevice, StrSound('ammo_none'));
        }
      }
    } else if (Button2(cmd)) {
      m.SelectResult = SEL_CANCEL;
      MenuPlaySound(MENU_SOUND_BACK);
    }
  }, m);
  m.ms.root = m.ms.current = menu;
  MenuSystemAddCustomDisplay(m.ms, MenuDisplayPlayerControls, { PlayerUID: playerUID });
  return m;
}
function AmmoDrawMenu(d: AmmoMenu, pos: Vec2i, size: Vec2i): void {
  const ammoY = Math.trunc((size.y - (EQUIP_MENU_SLOT_HEIGHT * 2 + FontH())) / 2) - 12;
  const color = d.Active ? colorWhite : colorGray;
  const bgSize = { x: ITEM_W, y: FontH() * 3 + 4 };
  const scrollSize = { x: bgSize.x, y: SCROLL_H };
  let scrollDown = false;
  for (let i = 0; i < d.ammoIds.length; i++) {
    if (i >= d.scroll && i < d.scroll + MENU_MAX_ROWS) DrawAmmoMenuItem(d, i, d.ammoIds[i], { x: pos.x, y: pos.y + ammoY }, bgSize);
    if (i === d.scroll + MENU_MAX_ROWS) {
      scrollDown = true;
      break;
    }
  }
  const gradient = PicManagerGetPic(gPicManager, 'hud/gradient')!;
  if (d.scroll > 0) {
    const sp = { x: pos.x + 3, y: pos.y + 1 + ammoY };
    DrawScroll(d.buttonBG, sp, scrollSize, color, false, { x: sp.x + Math.trunc(scrollSize.x / 2), y: pos.y + Math.trunc(gradient.size.y / 2) + ammoY + scrollSize.y - 1 });
  }
  if (scrollDown) {
    const sp = { x: pos.x + 3, y: pos.y - 1 + ammoY + bgSize.y * MENU_MAX_ROWS - SCROLL_H };
    DrawScroll(d.buttonBG, sp, scrollSize, color, true, {
      x: sp.x + Math.trunc(scrollSize.x / 2),
      y: pos.y - Math.trunc(gradient.size.y / 2) + ammoY + bgSize.y * MENU_MAX_ROWS - SCROLL_H - Math.trunc(gradient.size.y / 2) + 1,
    });
  } else {
    DrawAmmoMenuItem(d, d.ammoIds.length, -1, { x: pos.x, y: pos.y + ammoY }, bgSize);
  }
}
function DrawAmmoMenuItem(d: AmmoMenu, idx: number, ammoId: number, pos: Vec2i, bgSize: Vec2i): void {
  const a = ammoId >= 0 ? AmmoGetById(ammoId) : null;
  const selected = Math.trunc(d.idx / 2) === idx;
  const p = playerOf(d.PlayerUID);
  const amount = PlayerGetAmmoAmount(p, idx < d.ammoIds.length ? d.ammoIds[idx] : -1);
  const bgPos = { x: pos.x, y: pos.y + (idx - d.scroll) * bgSize.y };
  const enabled = a == null || (d.Active && a.Price > 0 && a.Price <= p.Totals.Score);
  let color = enabled ? colorWhite : colorGray;
  if (selected && d.Active) {
    DrawRectangle(bgPos, bgSize, colorSelectedBG, true);
    color = colorRed;
  }
  const gauge = (y: number): void => {
    if (a && a.Max > 0 && amount > 0) {
      DrawRectangle({ x: bgPos.x + 5, y: y + 1 }, { x: Math.trunc((amount * (bgSize.x - 8)) / a.Max), y: FontH() }, AmmoIsLow(a, amount) ? colorRed : colorBlue, true);
    }
  };
  gauge(bgPos.y + ROW_H * 2);
  if (a != null) {
    const sellSel = selected && d.Active && (d.idx & 1) === 1;
    const buySel = selected && d.Active && (d.idx & 1) === 0;
    BuySell(bgPos.x, bgPos.y + ROW_H, bgSize.x, d.buttonBG, sellSel, CanSell(d, ammoId), buySel, CanBuy(d, ammoId));
  }
  const x = bgPos.x + 4;
  FontStrOpt(a ? a.Name : 'Back', { x, y: bgPos.y }, fopt(ALIGN_START, ALIGN_START, bgSize, { x: 2, y: 2 }, color));
  if (a && a.Price > 0) {
    FontStrOpt(`$${a.Price}`, { x, y: bgPos.y }, fopt(ALIGN_END, ALIGN_START, bgSize, { x: 8, y: 2 }, enabled ? (selected ? colorRed : colorGray) : colorDarkGray));
  }
  gauge(bgPos.y + ROW_H * 2);
  if (a != null) {
    FontStrOpt(a.Max > 0 ? `${amount}/${a.Max}` : `${amount}`, { x, y: bgPos.y + ROW_H * 2 }, fopt(ALIGN_END, ALIGN_START, bgSize, { x: 8, y: 2 }, color));
    const pic = CPicGetPic(a.Pic, 0)!;
    CPicDraw(a.Pic, { x: bgPos.x + 12 - Math.trunc(pic.size.x / 2), y: bgPos.y + Math.trunc(bgSize.y / 2) - Math.trunc(pic.size.y / 2) }, CPicDrawContextNew());
  }
}
function AmmoMenuReset(m: AmmoMenu): void {
  const p = playerOf(m.PlayerUID);
  m.ammoIds = [];
  for (let i = 0; i < AmmoGetNumClasses(); i++) if (PlayerUsesAmmo(p, i)) m.ammoIds.push(i);
  m.idx = CLAMP(m.idx, 0, m.ammoIds.length * 2);
}
function AmmoMenuUpdate(m: AmmoMenu, cmd: number): boolean {
  const p = playerOf(m.PlayerUID);
  MenuProcessCmd(m.ms, cmd);
  if (m.SelectResult === SEL_SELECT) {
    const ammoId = GetSelectedAmmo(m);
    const amount = AmmoGetById(ammoId)!.Amount;
    PlayerAddAmmo(p, ammoId, (m.idx & 1) === 0 ? amount : -amount, false);
    return true;
  }
  if (m.SelectResult === SEL_CANCEL) {
    m.ms.current = m.ms.root;
    m.Active = false;
  }
  return false;
}

const HP_DELTA = 5;
const HP_PRICE = 2000;
const LIFE_PRICE = 4000;
const OPTION_HP = 0;
const OPTION_LIVES = 1;
const OPTION_COUNT = 2;
interface UtilMenu { ms: MenuSystem; PlayerUID: number; buttonBG: Pic; idx: number; Active: boolean; SelectResult: number }
const GetSelectedOption = (m: UtilMenu): number => MIN(Math.trunc(m.idx / 2), OPTION_COUNT);
function utilValues(p: PlayerData, option: number): { amount: number; max: number; delta: number; price: number } {
  switch (option) {
    case OPTION_HP: return { amount: p.HP, max: CampaignGetMaxHP(gCampaign), delta: HP_DELTA, price: HP_PRICE };
    case OPTION_LIVES: return { amount: p.Lives, max: CampaignGetMaxLives(gCampaign), delta: 1, price: LIFE_PRICE };
    default: return { amount: 0, max: 0, delta: 0, price: 0 };
  }
}
function UtilMenuSelectedCostDiff(m: UtilMenu): number {
  const option = GetSelectedOption(m);
  if (option < OPTION_COUNT) {
    const v = utilValues(playerOf(m.PlayerUID), option);
    if ((m.idx & 1) === 0 && v.max > v.amount) return v.price;
    if (v.amount > 0) return -v.price;
  }
  return 0;
}
function UtilMenuCreate(playerUID: number, pos: Vec2i, size: Vec2i): UtilMenu {
  const m: UtilMenu = { ms: MenuSystemInit(pos, size), PlayerUID: playerUID, buttonBG: PicManagerGetPic(gPicManager, 'hud/button_bg')!, idx: -1, Active: false, SelectResult: SEL_NONE };
  m.idx = CLAMP(m.idx, 0, OPTION_COUNT * 2);
  m.ms.align = MENU_ALIGN_LEFT;
  const menu = MenuCreateCustom('', (_mm, pos2, size2) => {
    const y0 = Math.trunc((size2.y - (EQUIP_MENU_SLOT_HEIGHT * 2 + FontH())) / 2) - 12;
    const bgSize = { x: ITEM_W, y: FontH() * 3 + 4 };
    for (let o = OPTION_HP; o <= OPTION_COUNT; o++) DrawUtilMenuItem(m, o, { x: pos2.x, y: pos2.y + y0 }, bgSize);
  }, (cmd) => {
    if (Button1(cmd)) {
      // nothing
    } else if (Button2(cmd)) {
      return true;
    } else if (Left(cmd)) {
      if (m.idx % 2 === 1) {
        m.idx--;
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    } else if (Right(cmd)) {
      if (m.idx < OPTION_COUNT * 2 && m.idx % 2 === 0) {
        m.idx++;
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    } else if (Up(cmd)) {
      if (m.idx >= 2) {
        m.idx -= 2;
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    } else if (Down(cmd)) {
      if (m.idx + 2 < OPTION_COUNT * 2 + 2) {
        m.idx = MIN(OPTION_COUNT * 2 + 2, m.idx + 2);
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
    }
    return false;
  }, m);
  MenuSetPostInputFunc(menu, (_mm, cmd) => {
    const p = playerOf(m.PlayerUID);
    m.SelectResult = SEL_NONE;
    if (Button1(cmd)) {
      const option = GetSelectedOption(m);
      const buy = (m.idx & 1) === 0;
      const v = utilValues(p, option);
      const sound = option === OPTION_HP ? 'health' : option === OPTION_LIVES ? '1up' : null;
      if (option === OPTION_COUNT) {
        m.SelectResult = SEL_CANCEL;
        MenuPlaySound(MENU_SOUND_BACK);
      }
      if (buy && v.amount < v.max && v.price <= p.Totals.Score) {
        SoundPlay(gSoundDevice, StrSound(sound));
        m.SelectResult = SEL_SELECT;
      } else if (!buy && v.amount > v.delta) {
        SoundPlay(gSoundDevice, StrSound(sound));
        m.SelectResult = SEL_SELECT;
      } else if (option !== OPTION_COUNT) {
        SoundPlay(gSoundDevice, StrSound('ammo_none'));
      }
    } else if (Button2(cmd)) {
      m.SelectResult = SEL_CANCEL;
      MenuPlaySound(MENU_SOUND_BACK);
    }
  }, m);
  m.ms.root = m.ms.current = menu;
  MenuSystemAddCustomDisplay(m.ms, MenuDisplayPlayerControls, { PlayerUID: playerUID });
  return m;
}
function DrawUtilMenuItem(d: UtilMenu, option: number, pos: Vec2i, bgSize: Vec2i): void {
  const selected = Math.trunc(d.idx / 2) === option;
  const p = playerOf(d.PlayerUID);
  const v = utilValues(p, option);
  const name = option === OPTION_HP ? 'Armor' : option === OPTION_LIVES ? 'Life' : 'Back';
  const pic = option === OPTION_HP ? PicManagerGetPic(gPicManager, 'health') : option === OPTION_LIVES ? GetHeadPic(p.Char.Class!, DIRECTION_DOWN, false, p.Char.Colors) : null;
  const bgPos = { x: pos.x, y: pos.y + option * bgSize.y };
  let color = colorWhite;
  if (selected && d.Active) {
    DrawRectangle(bgPos, bgSize, colorSelectedBG, true);
    color = colorRed;
  }
  const x = bgPos.x + 4;
  const gauge = (): void => {
    if (v.max > 0 && v.amount > 0) DrawRectangle({ x: x + 1, y: bgPos.y + ROW_H * 2 + 1 }, { x: Math.trunc((v.amount * (bgSize.x - 8)) / v.max), y: FontH() }, colorBlue, true);
  };
  gauge();
  if (v.max > 0) {
    const sellSel = selected && d.Active && (d.idx & 1) === 1;
    const buySel = selected && d.Active && (d.idx & 1) === 0;
    BuySell(bgPos.x, bgPos.y + ROW_H, bgSize.x, d.buttonBG, sellSel, v.amount > v.delta, buySel, v.amount < v.max && v.price <= p.Totals.Score);
  }
  FontStrOpt(name, { x, y: bgPos.y }, fopt(ALIGN_START, ALIGN_START, bgSize, { x: 2, y: 2 }, color));
  if (v.price > 0) FontStrOpt(`$${v.price}`, { x, y: bgPos.y }, fopt(ALIGN_END, ALIGN_START, bgSize, { x: 8, y: 2 }, selected ? colorRed : colorGray));
  gauge();
  if (v.max > 0) FontStrOpt(`${v.amount}/${v.max}`, { x, y: bgPos.y + ROW_H * 2 }, fopt(ALIGN_END, ALIGN_START, bgSize, { x: 8, y: 2 }, color));
  if (pic != null) PicRender(pic, { x: bgPos.x + 12 - Math.trunc(pic.size.x / 2), y: bgPos.y + Math.trunc(bgSize.y / 2) - Math.trunc(pic.size.y / 2) }, colorWhite);
}
function UtilMenuUpdate(m: UtilMenu, cmd: number): boolean {
  const p = playerOf(m.PlayerUID);
  MenuProcessCmd(m.ms, cmd);
  if (m.SelectResult === SEL_SELECT) {
    const buy = (m.idx & 1) === 0;
    switch (GetSelectedOption(m)) {
      case OPTION_HP:
        PlayerSetHP(p, p.HP + (buy ? HP_DELTA : -HP_DELTA));
        PlayerScore(p, buy ? -HP_PRICE : HP_PRICE);
        break;
      case OPTION_LIVES:
        PlayerSetLives(p, p.Lives + (buy ? 1 : -1));
        PlayerScore(p, buy ? -LIFE_PRICE : LIFE_PRICE);
        break;
      default:
        break;
    }
    return true;
  }
  if (m.SelectResult === SEL_CANCEL) {
    m.ms.current = m.ms.root;
    m.Active = false;
  }
  return false;
}

// --- equip_menu.c ----------------------------------------------------------------------------------------------------

const AMMO_LABEL = 'Ammo...';
const UTIL_LABEL = 'Utilities...';
const END_MENU_LABEL = '(End)';
const EQUIP_MENU_WIDTH = 80;
const UTIL_MENU_SLOT_HEIGHT = 12;
interface EquipMenu {
  ms: MenuSystem;
  display: { PlayerUID: number; GunIdx: number };
  PlayerUID: number;
  Cash: AnimatedCounter;
  slotBGSprites: NamedSprites;
  weapons: WeaponClass[];
  weaponIsNew: boolean[];
  SlotMeta: number[];
  size: Vec2i;
  slot: number;
  endSlot: number;
  ammoSlot: number;
  utilSlot: number;
  equipping: boolean;
  EquipEnabled: boolean[];
  weaponMenus: WeaponMenu[];
  ammoMenu: AmmoMenu | null;
  utilMenu: UtilMenu | null;
}
const CountNumGuns = (d: EquipMenu, slot: number): number => (slot >= MAX_WEAPONS ? 0 : d.weapons.filter((wc) => InSlot(wc, slot)).length);
function IsSlotDisabled(d: EquipMenu, slot: number): boolean {
  if (slot < 0 || slot > d.endSlot) return true;
  if (slot < MAX_WEAPONS) return CountNumGuns(d, slot) === 0;
  const p = playerOf(d.PlayerUID);
  if (slot === d.endSlot) return PlayerGetNumWeapons(p) === 0;
  if (slot === d.ammoSlot) return !PlayerUsesAnyAmmo(p);
  return false;
}
function DrawEquipSlot(d: EquipMenu, slot: number, label: string, pos: Vec2i, align: number): void {
  const selected = d.slot === slot;
  let color = d.equipping ? colorDarkGray : colorWhite;
  let mask = color;
  const h = EQUIP_MENU_SLOT_HEIGHT + (gCampaign.Setting.BuyAndSell ? FontH() : 0);
  if (selected) {
    if (d.equipping) {
      color = colorYellow;
      mask = colorWhite;
    } else {
      DrawRectangle({ x: pos.x - 1, y: pos.y - 1 }, { x: EQUIP_MENU_WIDTH / 2 + 2, y: h + 2 }, colorSelectedBG, true);
      color = colorRed;
    }
  }
  if (IsSlotDisabled(d, slot)) color = mask = colorDarkGray;
  const p = playerOf(d.PlayerUID);
  let y = pos.y;
  const slotBG = d.slotBGSprites.pics[(slot & 1) + (selected ? 2 : 0)];
  const bgPos = { x: pos.x, y };
  Draw9Slice(slotBG, { Pos: { x: bgPos.x + 1, y: bgPos.y + 1 }, Size: { x: EQUIP_MENU_WIDTH / 2, y: h - 2 } }, 11, slot & 1 ? 4 : 13, 12, slot & 1 ? 13 : 4, true, mask, FLIP_NONE);
  FontStrOpt(label, pos, fopt(align, ALIGN_START, { x: EQUIP_MENU_WIDTH / 2, y: FontH() }, { x: 3, y: 1 }, color));
  const gunIcon = p.guns[slot] ? p.guns[slot]!.Icon : PicManagerGetPic(gPicManager, 'peashooter');
  const slotSize = { x: EQUIP_MENU_WIDTH / 2, y: h };
  if (gunIcon) {
    PicRender(gunIcon, { x: bgPos.x + Math.trunc(slotSize.x / 2) - Math.trunc(gunIcon.size.x / 2), y: bgPos.y + Math.trunc(slotSize.y / 2) - Math.trunc(gunIcon.size.y / 2) }, p.guns[slot] ? mask : colorBlack);
  }
  DrawWeaponAmmo(p, p.guns[slot], mask, { x: bgPos.x, y: bgPos.y + FontH() }, { x: slotSize.x, y: slotSize.y - 2 * FontH() - 1 });
  DrawMeta(d.SlotMeta[slot], { x: pos.x + EQUIP_MENU_WIDTH / 2 - 6, y: y + 13 });
  if (gCampaign.Setting.BuyAndSell && d.equipping && p.guns[slot] && p.guns[slot]!.Price !== 0) {
    FontStrOpt(`$${p.guns[slot]!.Price}`, { x: pos.x, y: pos.y + FontH() + 2 }, fopt(ALIGN_CENTER, ALIGN_START, { x: EQUIP_MENU_WIDTH / 2, y: FontH() }, { x: 2, y: 2 }, selected ? colorGray : colorDarkGray));
  }
  y += h - FontH() - 1;
  FontStrOpt(p.guns[slot] ? p.guns[slot]!.name : NO_GUN_LABEL, { x: pos.x, y }, fopt(align, ALIGN_START, { x: EQUIP_MENU_WIDTH / 2, y: FontH() }, { x: 3, y: 0 }, color));
}
function DrawEquipMenu(d: EquipMenu, pos: Vec2i, size: Vec2i): void {
  const p = playerOf(d.PlayerUID);
  const h = EQUIP_MENU_SLOT_HEIGHT + (gCampaign.Setting.BuyAndSell ? FontH() : 0);
  let y = pos.y;
  if (gCampaign.Setting.BuyAndSell) {
    const fpos = AnimatedCounterDraw(d.Cash, { x: pos.x, y: pos.y - FontH() - 2 });
    if (d.equipping) {
      let costDiff = 0;
      if (d.slot < MAX_WEAPONS) costDiff = WeaponMenuSelectedCostDiff(d.weaponMenus[d.slot]);
      else if (d.slot === d.ammoSlot) costDiff = AmmoMenuSelectedCostDiff(d.ammoMenu!);
      else if (d.slot === d.utilSlot) costDiff = UtilMenuSelectedCostDiff(d.utilMenu!);
      if (costDiff !== 0) FontStrOpt(`${costDiff < 0 ? '+' : ''}${-costDiff}`, fpos, fopt(ALIGN_START, ALIGN_START, { x: 0, y: 0 }, { x: 0, y: 0 }, costDiff > 0 ? colorRed : colorGreen));
    }
  }
  DrawEquipSlot(d, 0, 'I', { x: pos.x, y }, ALIGN_START);
  DrawEquipSlot(d, 1, 'II', { x: pos.x + EQUIP_MENU_WIDTH / 2, y }, ALIGN_END);
  y += h;
  DrawEquipSlot(d, MELEE_SLOT, 'Melee', { x: pos.x, y }, ALIGN_START);
  DrawEquipSlot(d, 3, 'Bombs', { x: pos.x + EQUIP_MENU_WIDTH / 2, y }, ALIGN_END);
  y += h + 8;
  const item = (label: string, selected: boolean, disabled: boolean): void => {
    const ls = FontStrSize(label);
    DisplayMenuItem({ Pos: { x: pos.x + Math.trunc((size.x - ls.x) / 2), y }, Size: ls }, label, selected, disabled, colorWhite);
  };
  if (d.ammoSlot >= 0) {
    item(AMMO_LABEL, d.slot === d.ammoSlot, !PlayerUsesAnyAmmo(p));
    y += UTIL_MENU_SLOT_HEIGHT;
  }
  if (d.utilSlot >= 0) {
    item(UTIL_LABEL, d.slot === d.utilSlot, false);
    y += UTIL_MENU_SLOT_HEIGHT;
  }
  y += 8;
  const gun = d.display.GunIdx >= 0 && d.display.GunIdx < MAX_WEAPONS ? p.guns[d.display.GunIdx] : null;
  DrawCharacterSimple(p.Char, { x: pos.x + EQUIP_MENU_WIDTH / 2, y: pos.y + h + 8 }, DIRECTION_DOWN, false, false, gun);
  item(END_MENU_LABEL, d.slot === d.endSlot, IsSlotDisabled(d, d.endSlot) || d.equipping);
}
function HandleInputEquipMenu(d: EquipMenu, cmd: number): boolean {
  const p = playerOf(d.PlayerUID);
  let newSlot = d.slot;
  const dis = (s: number): boolean => IsSlotDisabled(d, s);
  if (Button1(cmd)) {
    MenuPlaySound(MENU_SOUND_ENTER);
    return true;
  } else if (Button2(cmd)) {
    if (d.slot < MAX_WEAPONS) {
      PlayerRemoveWeapon(p, d.slot);
      MenuPlaySound(MENU_SOUND_SWITCH);
      d.Cash.max = p.Totals.Score;
    }
  } else if (Left(cmd) || Right(cmd)) {
    const left = Left(cmd);
    if (d.slot < MAX_WEAPONS && (d.slot & 1) === (left ? 1 : 0)) {
      newSlot += left ? -1 : 1;
      if (dis(newSlot)) {
        if (!dis(newSlot - 2)) newSlot -= 2;
        else if (!dis(newSlot + 2)) newSlot += 2;
      }
    }
  } else if (Up(cmd)) {
    if (d.slot >= MAX_WEAPONS) {
      do newSlot--; while (newSlot > 0 && dis(newSlot));
    } else if (d.slot >= 2) {
      newSlot -= 2;
      if (dis(newSlot)) {
        if (!dis(newSlot ^ 1)) newSlot ^= 1;
        else do newSlot--; while (newSlot > 0 && dis(newSlot));
      }
    }
  } else if (Down(cmd)) {
    if (d.slot < d.endSlot) {
      if (d.slot < MAX_WEAPONS) {
        newSlot = MIN(d.endSlot, d.slot + 2);
        if (dis(newSlot)) {
          if (!dis(newSlot ^ 1)) newSlot ^= 1;
          else do newSlot++; while (newSlot < d.endSlot && dis(newSlot));
        }
      } else {
        do newSlot++; while (newSlot < d.endSlot && dis(newSlot));
      }
    }
  }
  if (newSlot !== d.slot && !dis(newSlot)) {
    d.slot = newSlot;
    MenuPlaySound(MENU_SOUND_SWITCH);
  }
  if (d.slot < MAX_WEAPONS) d.display.GunIdx = d.slot;
  return false;
}
function ResetSlotMeta(m: EquipMenu): void {
  const p = playerOf(m.PlayerUID);
  for (let i = 0; i < MAX_WEAPONS; i++) {
    m.SlotMeta[i] = META_NONE;
    const slotWC = p.guns[i];
    m.weapons.forEach((wc, j) => {
      if (!InSlot(wc, i)) return;
      let meta = m.weaponIsNew[j] ? META_NEW : META_NONE;
      if (slotWC != null) {
        if (slotWC === WeaponClassGetPrerequisite(wc)) meta = META_UPGRADE;
        else if (WeaponClassGetPrerequisite(slotWC) === wc) meta = META_DOWNGRADE;
      }
      m.SlotMeta[i] = MAX(m.SlotMeta[i], meta);
    });
  }
}
function EquipMenuCreate(weapons: WeaponClass[], prevWeapons: WeaponClass[] | null, numPlayers: number, player: number, playerUID: number): EquipMenu {
  const w = gGfx.w;
  const h = gGfx.h;
  const p = playerOf(playerUID);
  const menu: EquipMenu = {
    ms: MenuSystemInit({ x: 0, y: 0 }, { x: 0, y: 0 }), display: { PlayerUID: playerUID, GunIdx: 0 }, PlayerUID: playerUID,
    Cash: { ...AnimatedCounterNew('Cash: $', p.Totals.Score), incRatio: Math.fround(0.2) },
    slotBGSprites: PicManagerGetSprites(gPicManager, 'hud/gun_slot_bg')!, weapons: [...weapons],
    weaponIsNew: weapons.map((wc) => !(prevWeapons == null || prevWeapons.includes(wc))), SlotMeta: [0, 0, 0, 0], size: { x: 0, y: 0 },
    slot: 0, endSlot: MAX_WEAPONS, ammoSlot: -1, utilSlot: -1, equipping: false, EquipEnabled: [], weaponMenus: [], ammoMenu: null, utilMenu: null,
  };
  ResetSlotMeta(menu);
  let pos: Vec2i;
  switch (numPlayers) {
    case 2: pos = { x: Math.trunc((player * w) / 2) + Math.trunc(w / 4), y: 0 }; menu.size = { x: Math.trunc(w / 4), y: h }; break;
    case 3:
    case 4:
      pos = { x: Math.trunc(((player & 1) * w) / 2) + Math.trunc(w / 4), y: Math.trunc((Math.trunc(player / 2) * h) / 2) };
      menu.size = { x: Math.trunc(w / 4), y: Math.trunc(h / 2) };
      break;
    default: pos = { x: Math.trunc(w / 2), y: 0 }; menu.size = { x: Math.trunc(w / 2), y: h }; break;
  }
  if (gCampaign.Setting.BuyAndSell) {
    if (gCampaign.Setting.Ammo) {
      menu.ammoSlot = menu.endSlot;
      menu.endSlot++;
      for (let i = 0; i < AmmoGetNumClasses(); i++) {
        const a = AmmoGetById(i)!;
        if (a.Price === 0) PlayerAddAmmo(p, i, a.Max, true);
      }
    }
    menu.utilSlot = menu.endSlot;
    menu.endSlot++;
  }
  const weaponsSize = { x: EQUIP_MENU_WIDTH, y: EQUIP_MENU_SLOT_HEIGHT * 2 + FontH() };
  menu.ms = MenuSystemInit({ x: pos.x - EQUIP_MENU_WIDTH, y: pos.y + Math.trunc((menu.size.y - weaponsSize.y) / 2) - 12 }, weaponsSize);
  menu.ms.align = MENU_ALIGN_LEFT;
  MenuAddExitType(menu.ms, MENU_TYPE_RETURN);
  let numGuns = 0;
  let numMelee = 0;
  let numGrenades = 0;
  for (const wc of menu.weapons) {
    if (wc.Type === GUNTYPE_GRENADE) numGrenades++;
    else if (wc.Type === GUNTYPE_MELEE) numMelee++;
    else numGuns++;
  }
  for (let i = 0; i < MELEE_SLOT; i++) menu.EquipEnabled[i] = i < numGuns;
  menu.EquipEnabled[MELEE_SLOT] = numMelee > 0;
  for (let i = 0; i < MAX_GRENADES; i++) menu.EquipEnabled[i + MAX_GUNS] = i < numGrenades;
  menu.slot = menu.endSlot;
  const root: Menu = MenuCreateCustom('', (_m, p2, s2) => DrawEquipMenu(menu, p2, s2), (cmd) => HandleInputEquipMenu(menu, cmd), menu);
  menu.ms.root = menu.ms.current = root;
  if (p.inputDevice === INPUT_DEVICE_AI) {
    menu.ms.current = null;
    menu.equipping = false;
    AICoopSelectWeapons(p, player, weapons);
  } else {
    for (let i = 0; i < MAX_WEAPONS; i++) menu.weaponMenus.push(WeaponMenuCreate(menu.weapons, menu.weaponIsNew, playerUID, i, pos, menu.size));
    menu.ammoMenu = AmmoMenuCreate(playerUID, pos, menu.size);
    menu.utilMenu = UtilMenuCreate(playerUID, pos, menu.size);
  }
  return menu;
}
function EquipMenuUpdate(menu: EquipMenu, cmd: number): void {
  AnimatedCounterUpdate(menu.Cash, 1);
  const p = playerOf(menu.PlayerUID);
  if (menu.slot < MAX_WEAPONS && menu.weaponMenus[menu.slot]?.Active) {
    WeaponMenuUpdate(menu.weaponMenus[menu.slot], cmd);
    menu.equipping = menu.weaponMenus[menu.slot].Active;
    if (!menu.equipping) {
      for (const wm of menu.weaponMenus) WeaponMenuReset(wm);
      AmmoMenuReset(menu.ammoMenu!);
      ResetSlotMeta(menu);
    }
  } else if (menu.slot === menu.ammoSlot && menu.ammoMenu?.Active) {
    if (AmmoMenuUpdate(menu.ammoMenu, cmd)) menu.Cash.max = p.Totals.Score;
    menu.equipping = menu.ammoMenu.Active;
  } else if (menu.slot === menu.utilSlot && menu.utilMenu?.Active) {
    if (UtilMenuUpdate(menu.utilMenu, cmd)) menu.Cash.max = p.Totals.Score;
    menu.equipping = menu.utilMenu.Active;
  } else {
    MenuProcessCmd(menu.ms, cmd);
    if (menu.slot < menu.endSlot && MenuIsExit(menu.ms)) {
      menu.equipping = true;
      if (menu.slot < MAX_WEAPONS) {
        menu.weaponMenus[menu.slot].Active = true;
        menu.weaponMenus[menu.slot].SelectResult = WEAPON_MENU_NONE;
      } else if (menu.slot === menu.ammoSlot) {
        menu.ammoMenu!.Active = true;
        menu.ammoMenu!.SelectResult = SEL_NONE;
      } else if (menu.slot === menu.utilSlot) {
        menu.utilMenu!.Active = true;
        menu.utilMenu!.SelectResult = SEL_NONE;
      }
      menu.ms.current = menu.ms.root;
    }
  }
  MenuSetDisabled(menu.ms.root!, menu.equipping);
  if (!menu.equipping) menu.Cash.max = p.Totals.Score;
}
const EquipMenuIsDone = (m: EquipMenu): boolean => m.ms.current == null && !m.equipping && m.slot === m.endSlot;
function EquipMenuDraw(m: EquipMenu): void {
  MenuDisplay(m.ms);
  if (m.slot < MAX_WEAPONS) {
    if (m.weaponMenus[m.slot]) MenuDisplay(m.weaponMenus[m.slot].ms);
  } else if (m.slot === m.ammoSlot) {
    if (m.ammoMenu) MenuDisplay(m.ammoMenu.ms);
  } else if (m.slot === m.utilSlot) {
    if (m.utilMenu) MenuDisplay(m.utilMenu.ms);
  }
}

// --- prep_equip.c ----------------------------------------------------------------------------------------------------

const DEFAULT_GUNS = [
  ['Shotgun', 'Machine gun', 'Knife', 'Shrapnel bombs'],
  ['Powergun', 'Flamer', 'Knife', 'Grenades'],
  ['Sniper rifle', 'Pulse rifle', 'Knife', 'Molotovs'],
  ['Machine gun', 'Flamer', 'Knife', 'Dynamite'],
];
function AddDefaultGuns(p: PlayerData, idx: number, guns: WeaponClass[]): void {
  if (!gCampaign.Setting.BuyAndSell) {
    for (let i = 0; i < MAX_WEAPONS; i++) {
      let def: WeaponClass | null = null;
      for (const wc of guns) if (wc.name === DEFAULT_GUNS[idx][i]) def = wc;
      if (def != null) PlayerAddWeapon(p, def);
    }
    for (const wc of guns) PlayerAddWeapon(p, wc);
  }
  PlayerAddMinimalWeapons(p);
}
export function PlayerEquip(): GameLoopData {
  const menus: EquipMenu[] = [];
  let waitResult = EVENT_WAIT_CONTINUE;
  const save = AutosaveGetCampaign(gCampaign.Entry.Path);
  const m = gCampaign.Setting.Missions[gCampaign.MissionIndex];
  if (save != null && gCampaign.MissionIndex > 0) PlayerSavesApply(save.Players, m.WeaponPersist);
  // online every client equips only its own players (isOwn); offline all players are own
  const numOwn = gPlayerDatas.filter((p) => p.IsLocal && p.isOwn).length;
  let idx = 0;
  for (const p of gPlayerDatas) {
    if (!p.IsLocal) continue;
    if (!p.isOwn) {
      idx++;
      continue;
    }
    const weapons = [...gMission.Weapons];
    if (gMission.missionData!.WeaponPersist) {
      for (let i = 0; i < MAX_WEAPONS; i++) if (p.guns[i] != null && !weapons.includes(p.guns[i]!)) weapons.push(p.guns[i]!);
    } else {
      for (let i = 0; i < MAX_WEAPONS; i++) if (!weapons.includes(p.guns[i]!)) p.guns[i] = null;
    }
    if (PlayerGetNumWeapons(p) === 0) AddDefaultGuns(p, idx, weapons);
    let prev: WeaponClass[] | null = null;
    if (gCampaign.Entry.Mode === GAME_MODE_NORMAL && gCampaign.MissionIndex > 0) prev = gCampaign.Setting.Missions[gCampaign.MissionIndex - 1].Weapons;
    if (save == null || gCampaign.MissionIndex === 0) p.Lives = CampaignGetLives(gCampaign);
    menus.push(EquipMenuCreate(weapons, prev, numOwn, menus.length, p.UID));
    idx++;
  }
  return GameLoopDataNew({
    OnExit: () => {
      if (waitResult === EVENT_WAIT_OK) equipHooks.sendPlayerData();
      else CampaignUnload(gCampaign);
    },
    UpdateFunc: (l: LoopRunner) => {
      if (GetNumPlayers(PLAYER_ANY, false, true) === 0 || gCampaign.Setting.SkipWeaponMenu) {
        waitResult = EVENT_WAIT_OK;
      } else {
        const cmds = GetPlayerCmds();
        if (EventIsEscape(cmds, GetMenuCmd(false))) {
          waitResult = EVENT_WAIT_CANCEL;
        } else {
          let isDone = true;
          for (let i = 0; i < menus.length; i++) {
            const menu = menus[i];
            EquipMenuUpdate(menu, cmds[i]);
            isDone = isDone && EquipMenuIsDone(menu);
          }
          if (!isDone) return UPDATE_RESULT_DRAW;
          waitResult = EVENT_WAIT_OK;
        }
      }
      if (waitResult === EVENT_WAIT_OK) l.change(ScreenWaitForGameStart());
      else l.pop();
      return UPDATE_RESULT_OK;
    },
    DrawFunc: () => {
          for (const menu of menus) EquipMenuDraw(menu);
    },
  });
}
export function ScreenWaitForGameStart(): GameLoopData {
  const ms = MenuSystemInit({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h });
  ms.allowAborts = true;
  ms.root = ms.current = MenuCreateNormal('', 'Waiting for game start...', MENU_TYPE_NORMAL, 0);
  MenuAddExitType(ms, MENU_TYPE_RETURN);
  const check = (l: LoopRunner): number => {
    if (equipHooks.allReady != null && !equipHooks.allReady()) {
      if (!equipHooks.disconnected()) return UPDATE_RESULT_DRAW;
      CampaignUnload(gCampaign);
    }
    if (!gCampaign.IsLoaded) {
      l.pop();
      return UPDATE_RESULT_OK;
    }
    l.push(ScreenLoading('Starting game...', true, RunGame(), true));
    return UPDATE_RESULT_OK;
  };
  return GameLoopDataNew({
    UpdateFunc: (l: LoopRunner) => {
      const r = check(l);
      if (r !== UPDATE_RESULT_DRAW) return r;
      const mr = MenuUpdate(ms);
      if (mr === UPDATE_RESULT_OK) l.pop();
      return mr;
    },
    DrawFunc: () => MenuDraw(ms),
  });
}
