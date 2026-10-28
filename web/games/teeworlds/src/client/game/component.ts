// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/component.h of Teeworlds 0.7.5 in TypeScript.
import type { CGameClient } from './gameclient.ts';
import type { CEvent } from '../engine/input.ts';
import type { CNetMsg } from './gameclient.ts';

export abstract class CComponent {
  m_pClient!: CGameClient;
  Graphics() { return this.m_pClient.Graphics(); }
  TextRender() { return this.m_pClient.TextRender(); }
  Client() { return this.m_pClient.Client(); }
  Input() { return this.m_pClient.Input(); }
  Storage() { return this.m_pClient.Storage(); }
  UI() { return this.m_pClient.UI(); }
  Sound() { return this.m_pClient.Sound(); }
  RenderTools() { return this.m_pClient.RenderTools(); }
  Config() { return this.m_pClient.Config(); }
  Console() { return this.m_pClient.Console(); }
  Layers() { return this.m_pClient.Layers(); }
  Collision() { return this.m_pClient.Collision(); }

  OnStateChange(_NewState: number, _OldState: number): void {}
  OnConsoleInit(): void {}
  GetInitAmount(): number { return 0; }
  OnInit(): void {}
  OnShutdown(): void {}
  OnReset(): void {}
  OnRender(): void {}
  OnRelease(): void {}
  OnMapLoad(): void {}
  OnMessage(_Msg: number, _pRawMsg: CNetMsg): void {}
  OnMouseMove(_x: number, _y: number): boolean { return false; }
  OnInput(_e: CEvent): boolean { return false; }
}
