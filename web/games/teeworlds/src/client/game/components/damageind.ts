// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/damageind.h and damageind.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, clamp, pi, ImageTex } from './common.ts';
import { IMAGE_GAME, SPRITE_STAR1 } from '../../../generated/content.ts';
import { GAMESTATEFLAG_PAUSED } from '../../../generated/protocol.ts';
import { CComponent } from '../component.ts';

interface CItem { m_Pos: vec2; m_Dir: vec2; m_StartTime: number; m_StartAngle: number }
const MAX_ITEMS = 64;

export class CDamageInd extends CComponent {
  private m_aItems: CItem[] = [];
  private s_LastLocalTime: number | null = null;

  Create(Pos: vec2, Dir: vec2): void {
    if (this.m_aItems.length >= MAX_ITEMS) return;
    this.m_aItems.push({ m_Pos: Pos, m_StartTime: this.Client().LocalTime(), m_Dir: Dir.mul(-1), m_StartAngle: (Math.random() - 1) * 2 * pi });
  }

  override OnRender(): void {
    const G = this.Graphics();
    G.TextureSet(ImageTex(IMAGE_GAME));
    G.QuadsBegin();
    const now = this.Client().LocalTime();
    if (this.s_LastLocalTime === null) this.s_LastLocalTime = now;
    const gd = this.m_pClient.m_Snap.m_pGameData;
    for (let i = 0; i < this.m_aItems.length;) {
      const it = this.m_aItems[i];
      if (gd && gd.m_GameStateFlags & GAMESTATEFLAG_PAUSED) it.m_StartTime += now - this.s_LastLocalTime;
      const Life = 0.75 - (now - it.m_StartTime);
      if (Life < 0) {
        // DestroyI: the last item takes its place
        this.m_aItems[i] = this.m_aItems[this.m_aItems.length - 1];
        this.m_aItems.pop();
      } else {
        const a = it.m_Pos.add(it.m_Dir.mul(75)), t = clamp((Life - 0.6) / 0.15, 0, 1);
        const Pos = new vec2(a.x + (it.m_Pos.x - a.x) * t, a.y + (it.m_Pos.y - a.y) * t);
        const Alpha = clamp(Life * 10, 0, 1);
        G.SetColor(Alpha, Alpha, Alpha, Alpha);
        G.QuadsSetRotation(it.m_StartAngle + Life * 2);
        this.RenderTools().SelectSprite(SPRITE_STAR1);
        this.RenderTools().DrawSprite(Pos.x, Pos.y, 48);
        i++;
      }
    }
    this.s_LastLocalTime = now;
    G.QuadsEnd();
  }

  override OnReset(): void { this.m_aItems = []; }
}
