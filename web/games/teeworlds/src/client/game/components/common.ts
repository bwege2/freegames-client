// What the components share (the includes most of game/client/components/*.cpp have in common).
export * from '../../../base/system.ts';
export * from '../../../base/vmath.ts';
export { Localize } from '../localization.ts';
export { v4 } from '../render.ts';
import { g_pData } from '../../../generated/content.ts';
import { CTextureHandle } from '../../engine/graphics.ts';

/** g_pData->m_aImages[Image].m_Id: the texture of a content image (its id is set when the client loads it) */
export function ImageTex(Image: number): CTextureHandle { return new CTextureHandle(g_pData.m_aImages[Image].m_Id); }
