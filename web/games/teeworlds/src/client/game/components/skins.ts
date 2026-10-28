// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/skins.h and skins.cpp of Teeworlds 0.7.5 in TypeScript (and base/color.h).
// The skin files saved by the player go to the server storage with settings.cfg (the save directory).
import { clamp, f, mix, powf, sqrtf, type vec3, type vec4 } from '../../../base/vmath.ts';
import { str_comp, str_comp_nocase, utf8Decode } from '../../../base/system.ts';
import * as P from '../../../generated/protocol.ts';
import type { CConfig } from '../../../generated/config.ts';
import { CTextureHandle } from '../../engine/graphics.ts';
import { OUTPUT_LEVEL_ADDINFO } from '../../engine/console.ts';
import { CComponent } from '../component.ts';

export const SKINFLAG_SPECIAL = 1 << 0, SKINFLAG_STANDARD = 1 << 1, DARKEST_COLOR_LGT = 61, NUM_COLOR_COMPONENTS = 4, HAT_NUM = 2, HAT_OFFSET_SIDE = 2;
const MIN_EYE_BODY_COLOR_DIST = 80;

export interface CSkinPart { m_Flags: number; m_aName: string; m_OrgTexture: CTextureHandle; m_ColorTexture: CTextureHandle; m_BloodColor: vec3 }
export interface CSkin { m_Flags: number; m_aName: string; m_apParts: CSkinPart[]; m_aPartColors: number[]; m_aUseCustomColors: number[] }

export const ms_apSkinPartNames = ['body', 'marking', 'decoration', 'hands', 'feet', 'eyes'];
export const ms_apColorComponents = ['hue', 'sat', 'lgt', 'alp'];
const PART_CFG = ['Body', 'Marking', 'Decoration', 'Hands', 'Feet', 'Eyes'];

// base/color.h
export function HueToRgb(v1: number, v2: number, h: number): number {
  if (h < 0) h += 1;
  if (h > 1) h -= 1;
  if (6 * h < 1) return v1 + (v2 - v1) * 6 * h;
  if (2 * h < 1) return v2;
  if (3 * h < 2) return v1 + (v2 - v1) * (2 / 3 - h) * 6;
  return v1;
}
export function HslToRgb(HSL: vec3): vec3 {
  const h = HSL.x, s = HSL.y, l = HSL.z;
  if (s === 0) return { x: l, y: l, z: l };
  const v2 = l < 0.5 ? l * (1 + s) : l + s - s * l;
  const v1 = 2 * l - v2;
  return { x: HueToRgb(v1, v2, h + 1 / 3), y: HueToRgb(v1, v2, h), z: HueToRgb(v1, v2, h - 1 / 3) };
}
export function RgbToHsv(rgb: vec3): vec3 {
  const r = rgb.x, g = rgb.y, b = rgb.z;
  const h_min = Math.min(Math.min(r, g), b), h_max = Math.max(Math.max(r, g), b);
  let hue = 0;
  if (h_max === h_min) hue = 0;
  else if (h_max === r) hue = (g - b) / (h_max - h_min);
  else if (h_max === g) hue = 2 + (b - r) / (h_max - h_min);
  else hue = 4 + (r - g) / (h_max - h_min);
  hue /= 6;
  if (hue < 0) hue += 1;
  const s = h_max !== 0 ? (h_max - h_min) / h_max : 0;
  return { x: hue, y: s, z: h_max };
}
function RgbToLab(rgb: vec3): vec3 {
  const ax = 0.950467, ay = 1, az = 1.088969;
  const x = 0.412424 * rgb.x + 0.357579 * rgb.y + 0.180464 * rgb.z;
  const y = 0.212656 * rgb.x + 0.715158 * rgb.y + 0.0721856 * rgb.z;
  const z = 0.0193324 * rgb.x + 0.119193 * rgb.y + 0.950444 * rgb.z;
  const H = (v: number): number => (v > 0.008856 ? powf(f(v), f(0.333333)) : 7.787 * v + 0.137931);
  return { x: 116 * H(y / ay) - 16, y: 500 * (H(x / ax) - H(y / ay)), z: 200 * (H(y / ay) - H(z / az)) };
}
function LabDistance(a: vec3, b: vec3): number {
  const ld = a.x - b.x, ad = a.y - b.y, bd = a.z - b.z;
  return sqrtf(ld * ld + ad * ad + bd * bd);
}

function normalize3(v: vec3): vec3 {
  const l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return l ? { x: v.x / l, y: v.y / l, z: v.z / l } : { x: 0, y: 0, z: 0 };
}

export class CSkins extends CComponent {
  m_XmasHatTexture = new CTextureHandle();
  m_BotTexture = new CTextureHandle();
  private m_aaSkinParts: CSkinPart[][] = ms_apSkinPartNames.map(() => []);
  private m_aSkins: CSkin[] = [];
  private m_DummySkin!: CSkin;

  /** ms_apSkinVariables, ms_apUCCVariables, ms_apColorVariables: the player_* config variables of a part */
  SkinVariable(p: number): string { return (this.Config() as unknown as Record<string, string>)['m_PlayerSkin' + PART_CFG[p]]; }
  SetSkinVariable(p: number, v: string): void { (this.Config() as unknown as Record<string, string>)['m_PlayerSkin' + PART_CFG[p]] = v; }
  UCCVariable(p: number): number { return (this.Config() as unknown as Record<string, number>)['m_PlayerUseCustomColor' + PART_CFG[p]]; }
  SetUCCVariable(p: number, v: number): void { (this.Config() as unknown as Record<string, number>)['m_PlayerUseCustomColor' + PART_CFG[p]] = v; }
  ColorVariable(p: number): number { return (this.Config() as unknown as Record<string, number>)['m_PlayerColor' + PART_CFG[p]]; }
  SetColorVariable(p: number, v: number): void { (this.Config() as unknown as Record<string, number>)['m_PlayerColor' + PART_CFG[p]] = v; }
  static ConfigOf(c: CConfig, what: 'skin' | 'ucc' | 'color', p: number): string {
    return (what === 'skin' ? 'm_PlayerSkin' : what === 'ucc' ? 'm_PlayerUseCustomColor' : 'm_PlayerColor') + PART_CFG[p] + (c ? '' : '');
  }

  private static sortedAdd<T extends { m_aName: string }>(a: T[], x: T): void {
    let i = 0;
    while (i < a.length && str_comp_nocase(a[i].m_aName, x.m_aName) <= 0) i++;
    a.splice(i, 0, x);
  }

  private SkinPartScan(part: number, pName: string, IsDir: boolean): void {
    if (IsDir || !pName.endsWith('.png')) return;
    const aBuf = `skins/${ms_apSkinPartNames[part]}/${pName}`;
    const Info = this.Graphics().LoadPNG(aBuf);
    if (!Info) {
      this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'skins', `failed to load skin part '${pName}'`);
      return;
    }
    const Part: CSkinPart = { m_Flags: 0, m_aName: '', m_OrgTexture: new CTextureHandle(), m_ColorTexture: new CTextureHandle(), m_BloodColor: { x: 1, y: 1, z: 1 } };
    Part.m_OrgTexture = this.Graphics().LoadTextureRaw(Info.m_Width, Info.m_Height, Info.m_Format, Info.m_pData, Info.m_Format, 0);
    const d = Info.m_pData;
    const Pitch = Info.m_Width * 4;
    if (part === P.SKINPART_BODY) {
      const PartX = Math.trunc(Info.m_Width / 2), PartY = 0, PartWidth = Math.trunc(Info.m_Width / 2), PartHeight = Math.trunc(Info.m_Height / 2);
      const aColors = [0, 0, 0];
      for (let y = PartY; y < PartY + PartHeight; y++)
        for (let x = PartX; x < PartX + PartWidth; x++)
          if (d[y * Pitch + x * 4 + 3] > 128) {
            aColors[0] += d[y * Pitch + x * 4];
            aColors[1] += d[y * Pitch + x * 4 + 1];
            aColors[2] += d[y * Pitch + x * 4 + 2];
          }
      Part.m_BloodColor = normalize3({ x: aColors[0], y: aColors[1], z: aColors[2] });
    }
    const Step = Info.m_Format === 1 ? 4 : 3;
    for (let i = 0; i < Info.m_Width * Info.m_Height; i++) {
      const v = Math.trunc((d[i * Step] + d[i * Step + 1] + d[i * Step + 2]) / 3);
      d[i * Step] = d[i * Step + 1] = d[i * Step + 2] = v;
    }
    Part.m_ColorTexture = this.Graphics().LoadTextureRaw(Info.m_Width, Info.m_Height, Info.m_Format, Info.m_pData, Info.m_Format, 0);
    if (pName[0] === 'x' && pName[1] === '_') Part.m_Flags |= SKINFLAG_SPECIAL;
    Part.m_Flags |= SKINFLAG_STANDARD;
    Part.m_aName = pName.slice(0, Math.min(23, pName.length - 4));
    CSkins.sortedAdd(this.m_aaSkinParts[part], Part);
  }

  /** SkinScan: a skin file (JSON) */
  private SkinScan(pName: string, data: Uint8Array, DirType: 'data' | 'save'): void {
    if (!pName.endsWith('.json')) return;
    const Skin: CSkin = { ...this.m_DummySkin, m_apParts: this.m_DummySkin.m_apParts.slice(), m_aPartColors: this.m_DummySkin.m_aPartColors.slice(), m_aUseCustomColors: this.m_DummySkin.m_aUseCustomColors.slice() };
    Skin.m_aName = pName.slice(0, Math.min(23, pName.length - 5));
    if (this.Find(Skin.m_aName, true) !== -1) return;
    const SpecialSkin = pName[0] === 'x' && pName[1] === '_';
    let json: unknown;
    try {
      json = JSON.parse(utf8Decode(String.fromCharCode(...data)));
    } catch (e) {
      this.Console().Print(OUTPUT_LEVEL_ADDINFO, `skins/${pName}`, String(e));
      return;
    }
    const rStart = (json as Record<string, unknown>)?.skin;
    if (rStart && typeof rStart === 'object') {
      for (let PartIndex = 0; PartIndex < P.NUM_SKINPARTS; ++PartIndex) {
        const rPart = (rStart as Record<string, unknown>)[ms_apSkinPartNames[PartIndex]] as Record<string, unknown> | undefined;
        if (!rPart || typeof rPart !== 'object') continue;
        if (typeof rPart.filename === 'string') {
          const SkinPart = this.FindSkinPart(PartIndex, rPart.filename, SpecialSkin);
          if (SkinPart > -1) Skin.m_apParts[PartIndex] = this.GetSkinPart(PartIndex, SkinPart);
        }
        let UseCustomColors = false;
        const rColour = rPart.custom_colors;
        if (typeof rColour === 'string') UseCustomColors = rColour === 'true';
        else if (typeof rColour === 'boolean') UseCustomColors = rColour;
        Skin.m_aUseCustomColors[PartIndex] = UseCustomColors ? 1 : 0;
        if (!UseCustomColors) continue;
        for (let i = 0; i < NUM_COLOR_COMPONENTS; i++) {
          if (PartIndex !== P.SKINPART_MARKING && i === 3) continue;
          const rComponent = rPart[ms_apColorComponents[i]];
          if (typeof rComponent === 'number' && Number.isInteger(rComponent)) {
            const c = Skin.m_aPartColors[PartIndex];
            switch (i) {
              case 0: Skin.m_aPartColors[PartIndex] = (c & 0xff00ffff) | (rComponent << 16); break;
              case 1: Skin.m_aPartColors[PartIndex] = (c & 0xffff00ff) | (rComponent << 8); break;
              case 2: Skin.m_aPartColors[PartIndex] = (c & 0xffffff00) | rComponent; break;
              case 3: Skin.m_aPartColors[PartIndex] = (c & 0x00ffffff) | (rComponent << 24); break;
            }
          }
        }
      }
    }
    Skin.m_Flags = SpecialSkin ? SKINFLAG_SPECIAL : 0;
    if (DirType !== 'save') Skin.m_Flags |= SKINFLAG_STANDARD;
    CSkins.sortedAdd(this.m_aSkins, Skin);
  }

  override GetInitAmount(): number { return P.NUM_SKINPARTS * 2 + 8; }

  override OnInit(): void {
    for (let p = 0; p < P.NUM_SKINPARTS; p++) {
      this.m_aaSkinParts[p] = [];
      if (p === P.SKINPART_MARKING || p === P.SKINPART_DECORATION)
        CSkins.sortedAdd(this.m_aaSkinParts[p], { m_Flags: SKINFLAG_STANDARD, m_aName: '', m_OrgTexture: new CTextureHandle(), m_ColorTexture: new CTextureHandle(), m_BloodColor: { x: 1, y: 1, z: 1 } });
      this.Storage().ListDirectory(`skins/${ms_apSkinPartNames[p]}`, (name, isDir) => this.SkinPartScan(p, name, isDir));
      if (!this.m_aaSkinParts[p].length)
        this.m_aaSkinParts[p].push({ m_Flags: SKINFLAG_STANDARD, m_aName: 'dummy', m_OrgTexture: new CTextureHandle(), m_ColorTexture: new CTextureHandle(), m_BloodColor: { x: 1, y: 1, z: 1 } });
    }
    this.m_DummySkin = { m_Flags: SKINFLAG_STANDARD, m_aName: 'dummy', m_apParts: [], m_aPartColors: [], m_aUseCustomColors: [] };
    for (let p = 0; p < P.NUM_SKINPARTS; p++) {
      let Default = p === P.SKINPART_MARKING || p === P.SKINPART_DECORATION ? this.FindSkinPart(p, '', false) : this.FindSkinPart(p, 'standard', false);
      if (Default < 0) Default = 0;
      this.m_DummySkin.m_apParts[p] = this.GetSkinPart(p, Default);
      this.m_DummySkin.m_aPartColors[p] = p === P.SKINPART_MARKING ? (255 << 24) + 65408 : 65408;
      this.m_DummySkin.m_aUseCustomColors[p] = 0;
    }
    this.m_aSkins = [];
    this.Storage().ListDirectory('skins', (name, isDir) => {
      if (isDir) return;
      const d = this.Storage().ReadFile('skins/' + name);
      if (d) this.SkinScan(name, d, 'data');
    });
    for (const [name, d] of this.m_pClient.m_SavedSkins) this.SkinScan(name, d, 'save');
    if (!this.m_aSkins.length) this.m_aSkins.push(this.m_DummySkin);
    {
      const Info = this.Graphics().LoadPNG('skins/xmas_hat.png');
      if (!Info || Info.m_Width !== 128 || Info.m_Height !== 512) this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'game', "failed to load xmas hat 'skins/xmas_hat.png'");
      else this.m_XmasHatTexture = this.Graphics().LoadTextureRaw(Info.m_Width, Info.m_Height, Info.m_Format, Info.m_pData, Info.m_Format, 0);
    }
    {
      const Info = this.Graphics().LoadPNG('skins/bot.png');
      if (!Info || Info.m_Width !== 384 || Info.m_Height !== 160) this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'game', "failed to load bot 'skins/bot.png'");
      else this.m_BotTexture = this.Graphics().LoadTextureRaw(Info.m_Width, Info.m_Height, Info.m_Format, Info.m_pData, Info.m_Format, 0);
    }
  }

  AddSkin(pSkinName: string): void {
    const Skin: CSkin = { m_Flags: 0, m_aName: pSkinName.slice(0, 23), m_apParts: this.m_DummySkin.m_apParts.slice(), m_aPartColors: [], m_aUseCustomColors: [] };
    for (let PartIndex = 0; PartIndex < P.NUM_SKINPARTS; ++PartIndex) {
      const SkinPart = this.FindSkinPart(PartIndex, this.SkinVariable(PartIndex), false);
      if (SkinPart > -1) Skin.m_apParts[PartIndex] = this.GetSkinPart(PartIndex, SkinPart);
      Skin.m_aUseCustomColors[PartIndex] = this.UCCVariable(PartIndex);
      Skin.m_aPartColors[PartIndex] = this.ColorVariable(PartIndex);
    }
    const SkinIndex = this.Find(pSkinName, false);
    if (SkinIndex !== -1) this.m_aSkins[SkinIndex] = Skin;
    else CSkins.sortedAdd(this.m_aSkins, Skin);
  }

  RemoveSkin(pSkin: CSkin): void {
    const i = this.m_aSkins.indexOf(pSkin);
    if (i >= 0) this.m_aSkins.splice(i, 1);
    this.m_pClient.m_SavedSkins.delete(pSkin.m_aName + '.json');
    this.m_pClient.onSkinsChanged?.();
  }

  Num(): number { return this.m_aSkins.length; }
  NumSkinPart(Part: number): number { return this.m_aaSkinParts[Part].length; }
  Get(Index: number): CSkin { return this.m_aSkins[Math.max(0, Index % this.m_aSkins.length)]; }
  Find(pName: string, AllowSpecialSkin: boolean): number {
    for (let i = 0; i < this.m_aSkins.length; i++)
      if (str_comp(this.m_aSkins[i].m_aName, pName) === 0 && ((this.m_aSkins[i].m_Flags & SKINFLAG_SPECIAL) === 0 || AllowSpecialSkin)) return i;
    return -1;
  }
  GetSkinPart(Part: number, Index: number): CSkinPart {
    const Size = this.m_aaSkinParts[Part].length;
    return this.m_aaSkinParts[Part][Math.max(0, Index % Size)];
  }
  FindSkinPart(Part: number, pName: string, AllowSpecialPart: boolean): number {
    const a = this.m_aaSkinParts[Part];
    for (let i = 0; i < a.length; i++) if (str_comp(a[i].m_aName, pName) === 0 && ((a[i].m_Flags & SKINFLAG_SPECIAL) === 0 || AllowSpecialPart)) return i;
    return -1;
  }

  GetColorV3(v: number): vec3 {
    const Dark = DARKEST_COLOR_LGT / 255;
    return HslToRgb({ x: ((v >> 16) & 0xff) / 255, y: ((v >> 8) & 0xff) / 255, z: Dark + ((v & 0xff) / 255) * (1 - Dark) });
  }
  GetColorV4(v: number, UseAlpha: boolean): vec4 {
    const r = this.GetColorV3(v);
    return { r: r.x, g: r.y, b: r.z, a: UseAlpha ? ((v >> 24) & 0xff) / 255 : 1 };
  }

  GetTeamColor(UseCustomColors: number, PartColor: number, Team: number, Part: number): number {
    const s_aTeamColors = [0xc4c34e, 0x00ff6b, 0x9bff6b];
    const TeamHue = (s_aTeamColors[Team + 1] >> 16) & 0xff, TeamSat = (s_aTeamColors[Team + 1] >> 8) & 0xff, TeamLgt = s_aTeamColors[Team + 1] & 0xff;
    let PartSat = (PartColor >> 8) & 0xff, PartLgt = PartColor & 0xff;
    if (!UseCustomColors) {
      PartSat = 255;
      PartLgt = 255;
    }
    const h = TeamHue;
    // clamp(mix(int, int, double)) takes the int overload in C++ (the double converted to int)
    const s = clamp(Math.trunc(mix(TeamSat, PartSat, 0.2)), 160, 255);
    const l = clamp(Math.trunc(mix(TeamLgt, PartLgt, 0.2)), DARKEST_COLOR_LGT, 200);
    let ColorVal = (h << 16) + (s << 8) + l;
    if (Part === P.SKINPART_MARKING) ColorVal += PartColor & 0xff000000;
    return ColorVal | 0;
  }

  /** ValidateSkinParts: true if everything was valid (the arrays are changed in place otherwise) */
  ValidateSkinParts(aPartNames: string[], aUseCustomColors: number[], aPartColors: number[], GameFlags: number): boolean {
    if (GameFlags & P.GAMEFLAG_TEAMS) {
      if (str_comp(aPartNames[P.SKINPART_EYES], 'colorable') === 0 || str_comp(aPartNames[P.SKINPART_EYES], 'negative') === 0) {
        aPartNames[P.SKINPART_EYES] = 'standard';
        return false;
      }
    } else {
      const BodyColor = aPartColors[P.SKINPART_BODY], EyeColor = aPartColors[P.SKINPART_EYES];
      let BodyHsl: vec3 = { x: ((BodyColor >> 16) & 0xff) / 255, y: ((BodyColor >> 8) & 0xff) / 255, z: (BodyColor & 0xff) / 255 };
      let EyeHsl: vec3 = { x: ((EyeColor >> 16) & 0xff) / 255, y: ((EyeColor >> 8) & 0xff) / 255, z: (EyeColor & 0xff) / 255 };
      if (!aUseCustomColors[P.SKINPART_BODY]) BodyHsl = { x: 0, y: 0, z: 1 };
      const BodyLab = RgbToLab(HslToRgb(BodyHsl));
      const enc = (h: vec3): number => (Math.trunc(h.x * 255) << 16) | (Math.trunc(h.y * 255) << 8) | Math.trunc(h.z * 255);
      if (str_comp(aPartNames[P.SKINPART_EYES], 'negative') === 0) {
        if (!aUseCustomColors[P.SKINPART_EYES]) EyeHsl = { x: 0, y: 0, z: 1 };
        const OrgEyeHsl = { ...EyeHsl };
        EyeHsl.z *= 0.925;
        const Dist = LabDistance(BodyLab, RgbToLab(HslToRgb(EyeHsl)));
        if (Dist < MIN_EYE_BODY_COLOR_DIST) {
          OrgEyeHsl.z = clamp(OrgEyeHsl.z - 0.22, 0, 1);
          if (OrgEyeHsl.z < DARKEST_COLOR_LGT / 255) aPartNames[P.SKINPART_EYES] = 'standard';
          else {
            aUseCustomColors[P.SKINPART_EYES] = 1;
            aPartColors[P.SKINPART_EYES] = enc(OrgEyeHsl);
          }
          return false;
        }
      } else if (str_comp(aPartNames[P.SKINPART_EYES], 'colorable') === 0) {
        if (!aUseCustomColors[P.SKINPART_EYES]) EyeHsl = { x: 0, y: 0, z: 1 };
        const OrgEyeHsl = { ...EyeHsl };
        EyeHsl.z = clamp(EyeHsl.z * 0.0823, 0, 1);
        const Dist = LabDistance(BodyLab, RgbToLab(HslToRgb(EyeHsl)));
        if (Dist < MIN_EYE_BODY_COLOR_DIST) {
          OrgEyeHsl.z -= 0.6;
          OrgEyeHsl.z = clamp(OrgEyeHsl.z, 0, 1);
          aUseCustomColors[P.SKINPART_EYES] = 1;
          aPartColors[P.SKINPART_EYES] = enc(OrgEyeHsl);
          return false;
        }
      }
    }
    return true;
  }

  /** SaveSkinfile: the skin file (CJsonWriter's layout) into the save directory */
  SaveSkinfile(pSaveSkinName: string): void {
    const lines: string[] = ['{', '\t"skin": {'];
    const parts: string[] = [];
    for (let PartIndex = 0; PartIndex < P.NUM_SKINPARTS; PartIndex++) {
      if (!this.SkinVariable(PartIndex)) continue;
      const a: string[] = [`\t\t"${ms_apSkinPartNames[PartIndex]}": {`, `\t\t\t"filename": ${JSON.stringify(this.SkinVariable(PartIndex))}`];
      const CustomColors = !!this.UCCVariable(PartIndex);
      a.push(`\t\t\t"custom_colors": ${CustomColors ? 'true' : 'false'}`);
      if (CustomColors) {
        for (let c = 0; c < NUM_COLOR_COMPONENTS - 1; c++) a.push(`\t\t\t"${ms_apColorComponents[c]}": ${(this.ColorVariable(PartIndex) >> ((2 - c) * 8)) & 0xff}`);
        if (PartIndex === P.SKINPART_MARKING) a.push(`\t\t\t"${ms_apColorComponents[3]}": ${(this.ColorVariable(PartIndex) >> 24) & 0xff}`);
      }
      parts.push(a[0] + '\n' + a.slice(1).join(',\n') + '\n\t\t}');
    }
    lines.push(parts.join(',\n'), '\t}', '}');
    const text = lines.join('\n') + '\n';
    this.m_pClient.m_SavedSkins.set(pSaveSkinName + '.json', new Uint8Array([...text].map((c) => c.charCodeAt(0) & 0xff)));
    this.m_pClient.onSkinsChanged?.();
    this.AddSkin(pSaveSkinName);
  }
}
