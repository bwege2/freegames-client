// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/notifications.h and notifications.cpp of Teeworlds 0.7.5 in TypeScript.
import { v4, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { CUIRect, CORNER_ALL } from '../ui.ts';
import { CComponent } from '../component.ts';

export class CNotifications extends CComponent {
  private m_SoundToggleTime = -99;

  override OnConsoleInit(): void {
    this.Console().Register('snd_toggle', '', CFGFLAG_CLIENT, () => {
      this.Config().m_SndEnable ^= 1;
      this.m_SoundToggleTime = this.Client().LocalTime();
    }, this, 'Toggle sounds on and off');
  }

  private RenderSoundNotification(): void {
    const G = this.Graphics();
    const Height = 300, Width = Height * G.ScreenAspect();
    const ItemHeight = 20, ItemWidth = 20, DisplayTime = 1.5, FadeTime = 0.6;
    const RemainingDisplayTime = Math.max(0, this.m_SoundToggleTime + DisplayTime - this.Client().LocalTime());
    if (RemainingDisplayTime === 0) return;
    G.MapScreen(0, 0, Width, Height);
    const Area = new CUIRect((Width - ItemWidth) / 2, Height / 5 - ItemHeight / 2, ItemWidth, ItemHeight);
    const Fade = Math.min(1, RemainingDisplayTime / FadeTime);
    const c = this.Config().m_SndEnable === 0 ? v4(0xf9 / 0xff, 0x2b / 0xff, 0x2b / 0xff, 0.55) : v4(0x2b / 0xff, 0xf9 / 0xff, 0x2b / 0xff, 0.55);
    const t = 0.8 * Fade;
    this.RenderTools().DrawUIRect(Area, v4(c.r, c.g, c.b, c.a * t), CORNER_ALL, 3);
    G.TextureSet(ImageTex(C.IMAGE_SOUNDICONS));
    G.QuadsBegin();
    G.SetColor(Fade, Fade, Fade, Fade);
    this.RenderTools().SelectSprite(this.Config().m_SndEnable ? C.SPRITE_SOUNDICON_ON : C.SPRITE_SOUNDICON_MUTE);
    G.QuadsDrawTL([new CQuadItem(Area.x, Area.y, Area.w, Area.h)], 1);
    G.QuadsEnd();
  }

  override OnRender(): void { this.RenderSoundNotification(); }
}
