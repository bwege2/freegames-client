// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/maplayers.h, maplayers.cpp, mapimages.h and mapimages.cpp of Teeworlds 0.7.5
// in TypeScript. Left out: the menu background map (the port has no main menu) and the tile layer dump
// (ctrl+shift+keypad 0 writes a file).
import { f, mix, clamp, v4 } from './common.ts';
import * as MI from '../../../game/mapitems.ts';
import { GAMESTATEFLAG_PAUSED } from '../../../generated/protocol.ts';
import { CTextureHandle, FORMAT_AUTO, FORMAT_RGB, FORMAT_RGBA, TEXLOAD_ARRAY_256, TEXLOAD_MULTI_DIMENSION } from '../../engine/graphics.ts';
import { STATE_DEMOPLAYBACK, STATE_OFFLINE, STATE_ONLINE } from '../../engine/client.ts';
import { OUTPUT_LEVEL_ADDINFO } from '../../engine/console.ts';
import { CRenderTools, LAYERRENDERFLAG_OPAQUE, LAYERRENDERFLAG_TRANSPARENT, TILERENDERFLAG_EXTEND, type CEnvPoints } from '../render.ts';
import { CComponent } from '../component.ts';

const MAX_TEXTURES = 64;

export class CMapImages extends CComponent {
  private m_aTextures: CTextureHandle[] = [];
  private m_Count = 0;
  private m_EasterTexture = new CTextureHandle();
  private m_EasterIsLoaded = false;

  private LoadMapImages(): void {
    for (let i = 0; i < this.m_Count; i++) this.Graphics().UnloadTexture(this.m_aTextures[i]);
    this.m_Count = 0;
    const pMap = this.Layers().Map();
    const t = pMap.GetType(MI.MAPITEMTYPE_IMAGE);
    const Start = t.start;
    this.m_Count = clamp(t.num, 0, MAX_TEXTURES);
    const it = pMap.items;
    for (let i = 0; i < this.m_Count; i++) {
      let TextureFlags = 0;
      let FoundQuadLayer = false, FoundTileLayer = false;
      for (let k = 0; k < this.Layers().NumLayers(); k++) {
        const L = this.Layers().GetLayer(k);
        if (!FoundQuadLayer && it[L + MI.LAYER_TYPE] === MI.LAYERTYPE_QUADS && it[L + MI.QUADS_IMAGE] === i) FoundQuadLayer = true;
        if (!FoundTileLayer && it[L + MI.LAYER_TYPE] === MI.LAYERTYPE_TILES && it[L + MI.TILEMAP_IMAGE] === i) FoundTileLayer = true;
      }
      if (FoundTileLayer) TextureFlags = FoundQuadLayer ? TEXLOAD_MULTI_DIMENSION : TEXLOAD_ARRAY_256;
      const pImg = pMap.GetItem(Start + i);
      const Version = it[pImg + MI.IMAGE_VERSION], Format = it[pImg + MI.IMAGE_FORMAT];
      if (it[pImg + MI.IMAGE_EXTERNAL] || (Version > 1 && Format !== FORMAT_RGB && Format !== FORMAT_RGBA)) {
        const nameData = pMap.GetData(it[pImg + MI.IMAGE_NAME]);
        let pName = '';
        if (nameData) for (let k = 0; k < nameData.length && nameData[k]; k++) pName += String.fromCharCode(nameData[k]);
        this.m_aTextures[i] = this.Graphics().LoadTexture(`mapres/${pName}.png`, 0, FORMAT_AUTO, TextureFlags);
      } else {
        const pData = pMap.GetData(it[pImg + MI.IMAGE_DATA]) ?? new Uint8Array(0);
        this.m_aTextures[i] = this.Graphics().LoadTextureRaw(it[pImg + MI.IMAGE_WIDTH], it[pImg + MI.IMAGE_HEIGHT], Version === 1 ? FORMAT_RGBA : Format, pData, FORMAT_RGBA, TextureFlags);
      }
    }
    if (this.m_pClient.IsEaster()) this.GetEasterTexture();
  }

  override OnMapLoad(): void { this.LoadMapImages(); }

  GetEasterTexture(): CTextureHandle {
    if (!this.m_EasterIsLoaded) {
      this.m_EasterTexture = this.Graphics().LoadTexture('mapres/easter.png', 0, FORMAT_AUTO, TEXLOAD_ARRAY_256);
      if (!this.m_EasterTexture.IsValid()) this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'mapimages', 'Failed to load easter.png');
      this.m_EasterIsLoaded = true;
    }
    return this.m_EasterTexture;
  }

  Get(Index: number): CTextureHandle { return this.m_aTextures[clamp(Index, 0, this.m_Count)] ?? new CTextureHandle(); }
  Num(): number { return this.m_Count; }
}

export const TYPE_BACKGROUND = 0, TYPE_FOREGROUND = 1;

export class CMapLayers extends CComponent {
  private m_Type: number;
  private m_OnlineStartTime = 0;
  private m_lEnvPoints: CEnvPoints = { d: new Int32Array(0), stride: MI.ENVPOINT_INTS };
  private m_pEggTiles: Uint8Array | null = null;
  private m_EggLayerWidth = 0;
  private m_EggLayerHeight = 0;

  constructor(t: number) {
    super();
    this.m_Type = t;
  }

  override OnStateChange(NewState: number): void {
    if (NewState === STATE_ONLINE) this.m_OnlineStartTime = this.Client().LocalTime();
  }

  override OnInit(): void { this.m_pEggTiles = null; }

  private static PlaceEggDoodads(LayerWidth: number, LayerHeight: number, aOutTiles: Uint8Array, aGameLayerTiles: Uint8Array, ItemWidth: number, ItemHeight: number, aImageTileID: number[], Freq: number): void {
    for (let y = 0; y < LayerHeight - ItemHeight; y++)
      for (let x = 0; x < LayerWidth - ItemWidth; x++) {
        let Overlap = false, ObstructedByWall = false, HasGround = true;
        for (let iy = 0; iy < ItemHeight; iy++)
          for (let ix = 0; ix < ItemWidth; ix++) {
            const Tid = (y + iy) * LayerWidth + (x + ix), DownTid = (y + iy + 1) * LayerWidth + (x + ix);
            if (aOutTiles[Tid * 4] !== 0) {
              Overlap = true;
              break;
            }
            if (aGameLayerTiles[Tid * 4] === 1) {
              ObstructedByWall = true;
              break;
            }
            if (iy === ItemHeight - 1 && aGameLayerTiles[DownTid * 4] !== 1) {
              HasGround = false;
              break;
            }
          }
        const rnd = (): number => Math.floor(Math.random() * 0x7fffffff);
        if (!Overlap && !ObstructedByWall && HasGround && rnd() % Freq === 0) {
          const BaskerStartID = aImageTileID[rnd() % aImageTileID.length];
          for (let iy = 0; iy < ItemHeight; iy++)
            for (let ix = 0; ix < ItemWidth; ix++) aOutTiles[((y + iy) * LayerWidth + (x + ix)) * 4] = BaskerStartID + iy * 16 + ix;
        }
      }
  }

  override OnMapLoad(): void {
    this.LoadEnvPoints();
    if (this.m_pClient.IsEaster()) {
      const L = this.Layers(), it = L.Map().items, g = L.m_pGameLayer;
      this.m_EggLayerWidth = it[g + MI.TILEMAP_WIDTH];
      this.m_EggLayerHeight = it[g + MI.TILEMAP_HEIGHT];
      this.m_pEggTiles = new Uint8Array(this.m_EggLayerWidth * this.m_EggLayerHeight * 4);
      const aGameLayerTiles = L.Map().GetData(it[g + MI.TILEMAP_DATA])!;
      CMapLayers.PlaceEggDoodads(this.m_EggLayerWidth, this.m_EggLayerHeight, this.m_pEggTiles, aGameLayerTiles, 3, 2, [38, 86], 250);
      CMapLayers.PlaceEggDoodads(this.m_EggLayerWidth, this.m_EggLayerHeight, this.m_pEggTiles, aGameLayerTiles, 2, 1, [9, 25, 41, 57, 73, 89], 100);
      CMapLayers.PlaceEggDoodads(this.m_EggLayerWidth, this.m_EggLayerHeight, this.m_pEggTiles, aGameLayerTiles, 1, 1,
        [1, 2, 3, 4, 5, 17, 18, 19, 20, 33, 34, 35, 36, 49, 50, 52, 65, 66, 82, 98], 30);
    }
  }

  override OnShutdown(): void { this.m_pEggTiles = null; }

  /** LoadEnvPoints: every envelope's points as CEnvPoint (22 ints), v1 points converted */
  private LoadEnvPoints(): void {
    const map = this.Layers().Map(), it = map.items;
    const out: number[] = [];
    this.m_lEnvPoints = { d: new Int32Array(0), stride: MI.ENVPOINT_INTS };
    const pts = map.GetType(MI.MAPITEMTYPE_ENVPOINTS);
    if (!pts.num) return;
    const pPoints = map.GetItem(pts.start);
    const env = map.GetType(MI.MAPITEMTYPE_ENVELOPE);
    if (!env.num) return;
    for (let e = 0; e < env.num; e++) {
      const pItem = map.GetItem(env.start + e);
      const Version = it[pItem + MI.ENV_VERSION], NumPoints = it[pItem + MI.ENV_NUM_POINTS], StartPoint = it[pItem + MI.ENV_START_POINT];
      if (Version >= 3) {
        for (let i = 0; i < NumPoints; i++) for (let k = 0; k < MI.ENVPOINT_INTS; k++) out.push(it[pPoints + (i + StartPoint) * MI.ENVPOINT_INTS + k] ?? 0);
      } else {
        const Channels = it[pItem + MI.ENV_CHANNELS];
        for (let i = 0; i < NumPoints; i++) {
          const o = pPoints + (i + StartPoint) * MI.ENVPOINT_V1_INTS;
          const p = new Array(MI.ENVPOINT_INTS).fill(0);
          p[0] = it[o];
          p[1] = it[o + 1];
          for (let c = 0; c < Channels; c++) p[2 + c] = it[o + 2 + c];
          out.push(...p);
        }
      }
    }
    this.m_lEnvPoints = { d: Int32Array.from(out), stride: MI.ENVPOINT_INTS };
  }

  private EnvelopeEval = (TimeOffset: number, Env: number, pChannels: number[]): void => {
    pChannels[0] = pChannels[1] = pChannels[2] = pChannels[3] = 0;
    const map = this.Layers().Map(), it = map.items;
    const env = map.GetType(MI.MAPITEMTYPE_ENVELOPE);
    if (Env >= env.num) return;
    const pItem = map.GetItem(env.start + Env);
    let Time = 0;
    const Cl = this.Client();
    if (Cl.State() !== STATE_OFFLINE) {
      const gd = this.m_pClient.m_Snap.m_pGameData;
      if (gd && !(gd.m_GameStateFlags & GAMESTATEFLAG_PAUSED)) {
        if (it[pItem + MI.ENV_VERSION] < 2 || it[pItem + MI.ENV_SYNCHRONIZED]) {
          Time = mix(f((Cl.PrevGameTick() - gd.m_GameStartTick) / Cl.GameTickSpeed()), f((Cl.GameTick() - gd.m_GameStartTick) / Cl.GameTickSpeed()), Cl.IntraGameTick());
        } else Time = Cl.LocalTime() - this.m_OnlineStartTime;
      }
    } else Time = Cl.LocalTime();
    CRenderTools.RenderEvalEnvelope(this.m_lEnvPoints, it[pItem + MI.ENV_START_POINT], it[pItem + MI.ENV_NUM_POINTS], 4, Time + TimeOffset, pChannels);
  };

  override OnRender(): void {
    const Cl = this.Client();
    if (Cl.State() !== STATE_ONLINE && Cl.State() !== STATE_DEMOPLAYBACK) return;
    const pLayers = this.Layers();
    const map = pLayers.Map(), it = map.items;
    const G = this.Graphics(), RT = this.RenderTools();
    const Screen = G.GetScreen();
    const Center = this.m_pClient.m_pCamera.GetCenter();
    const Zoom = this.m_pClient.m_pCamera.GetZoom();
    let PassedGameLayer = false;
    for (let g = 0; g < pLayers.NumGroups(); g++) {
      const pGroup = pLayers.GetGroup(g);
      if (!this.Config().m_GfxNoclip && it[pGroup + MI.GROUP_VERSION] >= 2 && it[pGroup + MI.GROUP_USE_CLIPPING]) {
        RT.MapScreenToGroup(Center.x, Center.y, it, pLayers.m_pGameGroup, Zoom);
        const Points = G.GetScreen();
        const cx = it[pGroup + MI.GROUP_CLIP_X], cy = it[pGroup + MI.GROUP_CLIP_Y], cw = it[pGroup + MI.GROUP_CLIP_W], ch = it[pGroup + MI.GROUP_CLIP_H];
        const x0 = (cx - Points[0]) / (Points[2] - Points[0]), y0 = (cy - Points[1]) / (Points[3] - Points[1]);
        const x1 = (cx + cw - Points[0]) / (Points[2] - Points[0]), y1 = (cy + ch - Points[1]) / (Points[3] - Points[1]);
        if (x1 < 0 || x0 > 1 || y1 < 0 || y0 > 1) continue;
        G.ClipEnable(Math.trunc(x0 * G.ScreenWidth()), Math.trunc(y0 * G.ScreenHeight()), Math.trunc((x1 - x0) * G.ScreenWidth()), Math.trunc((y1 - y0) * G.ScreenHeight()));
      }
      RT.MapScreenToGroup(Center.x, Center.y, it, pGroup, Zoom);
      const NumLayers = it[pGroup + MI.GROUP_NUM_LAYERS], StartLayer = it[pGroup + MI.GROUP_START_LAYER];
      for (let l = 0; l < NumLayers; l++) {
        const pLayer = pLayers.GetLayer(StartLayer + l);
        let Render = false, IsGameLayer = false;
        if (pLayer === pLayers.m_pGameLayer) {
          IsGameLayer = true;
          PassedGameLayer = true;
        }
        if (this.m_Type === -1) Render = true;
        else if (this.m_Type === 0) {
          if (PassedGameLayer) return;
          Render = true;
        } else if (PassedGameLayer && !IsGameLayer) Render = true;
        if (!Render) continue;
        if (!(it[pLayer + MI.LAYER_FLAGS] & MI.LAYERFLAG_DETAIL && !this.Config().m_GfxHighDetail && !IsGameLayer)) {
          if (!IsGameLayer) {
            if (it[pLayer + MI.LAYER_TYPE] === MI.LAYERTYPE_TILES) {
              const Image = it[pLayer + MI.TILEMAP_IMAGE];
              if (Image === -1) G.TextureClear();
              else G.TextureSet(this.m_pClient.m_pMapimages.Get(Image));
              const pTiles = map.GetData(it[pLayer + MI.TILEMAP_DATA]);
              if (pTiles) {
                const c = pLayer + MI.TILEMAP_COLOR;
                const Color = v4(it[c] / 255, it[c + 1] / 255, it[c + 2] / 255, it[c + 3] / 255);
                const w = it[pLayer + MI.TILEMAP_WIDTH], h = it[pLayer + MI.TILEMAP_HEIGHT];
                const env = it[pLayer + MI.TILEMAP_COLOR_ENV], envo = it[pLayer + MI.TILEMAP_COLOR_ENV_OFFSET];
                G.BlendNone();
                RT.RenderTilemap(pTiles, w, h, 32, Color, TILERENDERFLAG_EXTEND | LAYERRENDERFLAG_OPAQUE, this.EnvelopeEval, env, envo);
                G.BlendNormal();
                RT.RenderTilemap(pTiles, w, h, 32, Color, TILERENDERFLAG_EXTEND | LAYERRENDERFLAG_TRANSPARENT, this.EnvelopeEval, env, envo);
              }
            } else if (it[pLayer + MI.LAYER_TYPE] === MI.LAYERTYPE_QUADS) {
              const Image = it[pLayer + MI.QUADS_IMAGE];
              if (Image === -1) G.TextureClear();
              else G.TextureSet(this.m_pClient.m_pMapimages.Get(Image));
              const pQuads = map.GetDataInts(it[pLayer + MI.QUADS_DATA]);
              G.BlendNormal();
              if (pQuads) RT.RenderQuads(pQuads, it[pLayer + MI.QUADS_NUM_QUADS], LAYERRENDERFLAG_TRANSPARENT, this.EnvelopeEval);
            }
          }
        }
        if (this.m_pClient.IsEaster()) {
          if (this.m_pEggTiles && l + 1 < NumLayers && pLayers.GetLayer(StartLayer + l + 1) === pLayers.m_pGameLayer) {
            G.TextureSet(this.m_pClient.m_pMapimages.GetEasterTexture());
            G.BlendNormal();
            RT.RenderTilemap(this.m_pEggTiles, this.m_EggLayerWidth, this.m_EggLayerHeight, 32, v4(1, 1, 1, 1), LAYERRENDERFLAG_TRANSPARENT, this.EnvelopeEval, -1, 0);
          }
        }
      }
      if (!this.Config().m_GfxNoclip) G.ClipDisable();
    }
    if (!this.Config().m_GfxNoclip) G.ClipDisable();
    G.MapScreen(Screen[0], Screen[1], Screen[2], Screen[3]);
  }
}
