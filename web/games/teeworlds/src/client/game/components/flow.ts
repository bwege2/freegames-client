// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/flow.h and flow.cpp of Teeworlds 0.7.5 in TypeScript. In the release nothing
// calls CFlow::Init, so the flow has no cells and Get, Add and Update do nothing; the same here.
import { vec2 } from './common.ts';
import { CComponent } from '../component.ts';

export class CFlow extends CComponent {
  private m_pCells: vec2[] | null = null;
  private m_Height = 0;
  private m_Width = 0;
  private m_Spacing = 16;

  Get(Pos: vec2): vec2 {
    if (!this.m_pCells) return new vec2(0, 0);
    const x = Math.trunc(Pos.x / this.m_Spacing), y = Math.trunc(Pos.y / this.m_Spacing);
    if (x < 0 || y < 0 || x >= this.m_Width || y >= this.m_Height) return new vec2(0, 0);
    return this.m_pCells[y * this.m_Width + x];
  }

  Add(Pos: vec2, Vel: vec2, _Size: number): void {
    if (!this.m_pCells) return;
    const x = Math.trunc(Pos.x / this.m_Spacing), y = Math.trunc(Pos.y / this.m_Spacing);
    if (x < 0 || y < 0 || x >= this.m_Width || y >= this.m_Height) return;
    this.m_pCells[y * this.m_Width + x] = this.m_pCells[y * this.m_Width + x].add(Vel);
  }

  Update(): void {
    if (!this.m_pCells) return;
    for (let i = 0; i < this.m_pCells.length; i++) this.m_pCells[i] = this.m_pCells[i].mul(0.85);
  }
}
