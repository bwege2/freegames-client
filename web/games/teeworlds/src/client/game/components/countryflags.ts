// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/countryflags.h and countryflags.cpp of Teeworlds 0.7.5 in TypeScript.
import { str_comp, utf8Decode, str_format, type vec4 } from './common.ts';
import { CQuadItem, CTextureHandle } from '../../engine/graphics.ts';
import { CTextCursor, TEXTFLAG_RENDER, TEXTFLAG_STOP_AT_END } from '../../engine/text.ts';
import { OUTPUT_LEVEL_ADDINFO, OUTPUT_LEVEL_STANDARD } from '../../engine/console.ts';
import { CComponent } from '../component.ts';

export interface CCountryFlag { m_CountryCode: number; m_aCountryCodeString: string; m_Blocked: boolean; m_Texture: CTextureHandle }

const CODE_LB = -1, CODE_UB = 999, CODE_RANGE = CODE_UB - CODE_LB + 1;

export class CCountryFlags extends CComponent {
  private m_aCountryFlags: CCountryFlag[] = [];
  private m_CodeIndexLUT = new Int32Array(CODE_RANGE);

  private LoadCountryflagsIndexfile(): void {
    const pFilename = 'countryflags/index.json';
    const d = this.Storage().ReadFile(pFilename);
    if (!d) {
      this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'countryflags', "couldn't open index file");
      return;
    }
    let json: { 'country codes'?: Record<string, { id: string; code: number; blocked?: boolean }[]> };
    try {
      json = JSON.parse(utf8Decode(String.fromCharCode(...d)));
    } catch (e) {
      this.Console().Print(OUTPUT_LEVEL_ADDINFO, pFilename, String(e));
      return;
    }
    const rInit = json['country codes'];
    if (rInit && typeof rInit === 'object') {
      for (const idx of ['custom', 'ISO 3166-1']) {
        const rStart = rInit[idx];
        if (!Array.isArray(rStart)) continue;
        for (const e of rStart) {
          const CountryCode = Math.trunc(Number(e.code) || 0);
          if (CountryCode < CODE_LB || CountryCode > CODE_UB) {
            this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'countryflags', str_format(64, "country code '%i' not within valid code range [%i..%i]", CountryCode, CODE_LB, CODE_UB));
            continue;
          }
          const pCountryName = String(e.id ?? '');
          const CountryFlag: CCountryFlag = { m_CountryCode: CountryCode, m_aCountryCodeString: pCountryName.slice(0, 7), m_Blocked: false, m_Texture: new CTextureHandle() };
          if (this.Config().m_ClLoadCountryFlags) {
            const aBuf = `countryflags/${pCountryName}.png`;
            const Info = this.Graphics().LoadPNG(aBuf);
            if (!Info) {
              this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'countryflags', `failed to load '${aBuf}'`);
              continue;
            }
            CountryFlag.m_Texture = this.Graphics().LoadTextureRaw(Info.m_Width, Info.m_Height, Info.m_Format, Info.m_pData, Info.m_Format, 0);
          }
          if (e.blocked === true) CountryFlag.m_Blocked = true;
          this.m_aCountryFlags.push(CountryFlag);
        }
      }
    }
    // sort_range: a stable merge sort by the code string
    this.m_aCountryFlags = mergeSort(this.m_aCountryFlags, (a, b) => str_comp(a.m_aCountryCodeString, b.m_aCountryCodeString) < 0);
    let DefaultIndex = 0;
    for (let i = 0; i < this.m_aCountryFlags.length; i++)
      if (this.m_aCountryFlags[i].m_CountryCode === -1) {
        DefaultIndex = i;
        break;
      }
    this.m_CodeIndexLUT.fill(DefaultIndex !== 0 ? DefaultIndex : 0);
    for (let i = 0; i < this.m_aCountryFlags.length; ++i) this.m_CodeIndexLUT[Math.max(0, (this.m_aCountryFlags[i].m_CountryCode - CODE_LB) % CODE_RANGE)] = i;
  }

  override GetInitAmount(): number { return 15; }

  override OnInit(): void {
    this.m_aCountryFlags = [];
    this.LoadCountryflagsIndexfile();
    if (!this.m_aCountryFlags.length) {
      this.Console().Print(OUTPUT_LEVEL_STANDARD, 'countryflags', "failed to load country flags. folder='countryflags/'");
      this.m_aCountryFlags.push({ m_CountryCode: -1, m_Blocked: false, m_aCountryCodeString: '', m_Texture: new CTextureHandle() });
    }
  }

  Num(): number { return this.m_aCountryFlags.length; }
  GetByCountryCode(CountryCode: number): CCountryFlag { return this.GetByIndex(this.m_CodeIndexLUT[Math.max(0, (CountryCode - CODE_LB) % CODE_RANGE)]); }
  GetByIndex(Index: number, SkipBlocked = false): CCountryFlag {
    if (SkipBlocked) {
      for (const c of this.m_aCountryFlags) if (!c.m_Blocked) if (!Index--) return c;
    }
    return this.m_aCountryFlags[Math.max(0, Index % this.m_aCountryFlags.length)];
  }

  Render(CountryCode: number, pColor: vec4, x: number, y: number, w: number, h: number, AllowBlocked = false): void {
    let pFlag = this.GetByCountryCode(CountryCode);
    if (!AllowBlocked && pFlag.m_Blocked) pFlag = this.GetByCountryCode(-1);
    if (pFlag.m_Texture.IsValid()) {
      const G = this.Graphics();
      G.TextureSet(pFlag.m_Texture);
      G.QuadsBegin();
      G.SetColor(pColor.r * pColor.a, pColor.g * pColor.a, pColor.b * pColor.a, pColor.a);
      G.QuadsDrawTL([new CQuadItem(x, y, w, h)], 1);
      G.QuadsEnd();
    } else {
      const Cursor = new CTextCursor();
      this.TextRender().SetCursor(Cursor, x, y, 10, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
      Cursor.m_LineWidth = w;
      this.TextRender().TextEx(Cursor, pFlag.m_aCountryCodeString, -1);
    }
  }
}

/** a stable sort with the original's less-than */
export function mergeSort<T>(a: T[], less: (x: T, y: T) => boolean): T[] {
  if (a.length < 2) return a.slice();
  const m = a.length >> 1;
  const l = mergeSort(a.slice(0, m), less), r = mergeSort(a.slice(m), less);
  const out: T[] = [];
  let i = 0, j = 0;
  while (i < l.length && j < r.length) out.push(less(r[j], l[i]) ? r[j++] : l[i++]);
  return out.concat(l.slice(i), r.slice(j));
}
