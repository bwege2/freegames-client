// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/debughud.h and debughud.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, length, str_format } from './common.ts';
import { CTuningParams, TUNING_NAMES, VelocityRamp } from '../../../game/gamecore.ts';
import { CLineItem } from '../../engine/graphics.ts';
import { CComponent } from '../component.ts';

export class CDebugHud extends CComponent {
  private RenderNetCorrections(): void {
    const gc = this.m_pClient, S = gc.m_Snap, cfg = this.Config(), T = this.TextRender();
    if (!cfg.m_Debug || cfg.m_DbgGraphs || !S.m_pLocalCharacter || !S.m_pLocalPrevCharacter) return;
    const Width = 300 * this.Graphics().ScreenAspect();
    this.Graphics().MapScreen(0, 0, Width, 300);
    const Velspeed = length(new vec2(S.m_pLocalCharacter.m_VelX / 256, S.m_pLocalCharacter.m_VelY / 256)) * 50;
    const t = gc.m_Tuning;
    const Ramp = VelocityRamp(Velspeed, t.m_VelrampStart, t.m_VelrampRange, t.m_VelrampCurvature);
    const paStrings = ['velspeed:', 'velspeed*ramp:', 'ramp:', 'Pos', ' x:', ' y:', 'netmsg failed on:', 'netobj num failures:', 'netobj failed on:'];
    const LineHeight = 6, Fontsize = 5;
    let x = Width - 100, y = 50;
    for (let i = 0; i < paStrings.length; ++i) T.Text(0, x, y + i * LineHeight, Fontsize, paStrings[i], -1);
    x = Width - 10;
    const right = (s: string): void => T.Text(0, x - T.TextWidth(0, Fontsize, s, -1, -1), y, Fontsize, s, -1);
    right(str_format(128, '%.0f', Velspeed / 32));
    y += LineHeight;
    right(str_format(128, '%.0f', (Velspeed / 32) * Ramp));
    y += LineHeight;
    right(str_format(128, '%.2f', Ramp));
    y += 2 * LineHeight;
    right(str_format(128, '%d', Math.trunc(S.m_pLocalCharacter.m_X / 32)));
    y += LineHeight;
    right(str_format(128, '%d', Math.trunc(S.m_pLocalCharacter.m_Y / 32)));
    y += LineHeight;
    right(gc.NetmsgFailedOn());
    y += LineHeight;
    right(str_format(128, '%d', gc.NetobjNumFailures()));
    y += LineHeight;
    right(gc.NetobjFailedOn());
  }

  private RenderTuning(): void {
    if (!this.Config().m_DbgTuning) return;
    const G = this.Graphics(), T = this.TextRender(), gc = this.m_pClient;
    const StandardTuning = new CTuningParams();
    G.MapScreen(0, 0, 300 * G.ScreenAspect(), 300);
    let y = 50;
    let Count = 0;
    for (let i = 0; i < CTuningParams.Num(); i++) {
      const Current = gc.m_Tuning.get(i), Standard = StandardTuning.get(i);
      if (Standard === Current) T.TextColor(1, 1, 1, 1);
      else T.TextColor(1, 0.25, 0.25, 1);
      let x = 5;
      let aBuf = str_format(128, '%.2f', Standard);
      x += 20;
      T.Text(0, x - T.TextWidth(0, 5, aBuf, -1, -1), y + Count * 6, 5, aBuf, -1);
      aBuf = str_format(128, '%.2f', Current);
      x += 20;
      T.Text(0, x - T.TextWidth(0, 5, aBuf, -1, -1), y + Count * 6, 5, aBuf, -1);
      x += 5;
      T.Text(0, x, y + Count * 6, 5, TUNING_NAMES[i], -1);
      Count++;
    }
    y = y + Count * 6;
    G.TextureClear();
    G.BlendNormal();
    G.LinesBegin();
    const Height = 50;
    let pv = 1;
    const A: CLineItem[] = [];
    const t = gc.m_Tuning;
    for (let i = 0; i < 100; i++) {
      const Speed = (i / 100) * 3000;
      const RampedSpeed = (Speed * VelocityRamp(Speed, t.m_VelrampStart, t.m_VelrampRange, t.m_VelrampCurvature)) / 1000;
      A.push(new CLineItem((i - 1) * 2, y + Height - pv * Height, i * 2, y + Height - RampedSpeed * Height));
      pv = RampedSpeed;
    }
    G.LinesDraw(A, 100);
    G.LinesEnd();
    T.TextColor(1, 1, 1, 1);
  }

  override OnRender(): void {
    this.RenderTuning();
    this.RenderNetCorrections();
  }
}
