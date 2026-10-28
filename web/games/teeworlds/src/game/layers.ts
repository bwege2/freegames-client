// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/layers.cpp of Teeworlds 0.7.5 in TypeScript.
import type { CDataFileReader } from '../engine/shared/datafile.ts';
import * as MI from './mapitems.ts';

export class CLayers {
  m_GroupsNum = 0;
  m_GroupsStart = 0;
  m_LayersNum = 0;
  m_LayersStart = 0;
  /** the int index of the game group / game layer item in the map's items, or -1 */
  m_pGameGroup = -1;
  m_pGameLayer = -1;
  m_pMap!: CDataFileReader;

  Init(map: CDataFileReader): void {
    this.m_pMap = map;
    const g = map.GetType(MI.MAPITEMTYPE_GROUP);
    this.m_GroupsStart = g.start;
    this.m_GroupsNum = g.num;
    const l = map.GetType(MI.MAPITEMTYPE_LAYER);
    this.m_LayersStart = l.start;
    this.m_LayersNum = l.num;
    const it = map.items;
    for (let gi = 0; gi < this.m_GroupsNum; gi++) {
      const grp = this.GetGroup(gi);
      for (let li = 0; li < it[grp + MI.GROUP_NUM_LAYERS]; li++) {
        const lay = this.GetLayer(it[grp + MI.GROUP_START_LAYER] + li);
        if (it[lay + MI.LAYER_TYPE] === MI.LAYERTYPE_TILES && it[lay + MI.TILEMAP_FLAGS] & MI.TILESLAYERFLAG_GAME) {
          this.m_pGameLayer = lay;
          this.m_pGameGroup = grp;
          it[grp + MI.GROUP_OFFSET_X] = 0;
          it[grp + MI.GROUP_OFFSET_Y] = 0;
          it[grp + MI.GROUP_PARALLAX_X] = 100;
          it[grp + MI.GROUP_PARALLAX_Y] = 100;
          if (it[grp + MI.GROUP_VERSION] >= 2) {
            it[grp + MI.GROUP_USE_CLIPPING] = 0;
            it[grp + MI.GROUP_CLIP_X] = 0;
            it[grp + MI.GROUP_CLIP_Y] = 0;
            it[grp + MI.GROUP_CLIP_W] = 0;
            it[grp + MI.GROUP_CLIP_H] = 0;
          }
          break;
        }
      }
    }
    this.InitTilemapSkip();
  }

  private InitTilemapSkip(): void {
    const it = this.m_pMap.items;
    for (let gi = 0; gi < this.m_GroupsNum; gi++) {
      const grp = this.GetGroup(gi);
      for (let li = 0; li < it[grp + MI.GROUP_NUM_LAYERS]; li++) {
        const lay = this.GetLayer(it[grp + MI.GROUP_START_LAYER] + li);
        if (it[lay + MI.LAYER_TYPE] !== MI.LAYERTYPE_TILES) continue;
        const tiles = this.m_pMap.GetData(it[lay + MI.TILEMAP_DATA]);
        if (!tiles) continue;
        const w = it[lay + MI.TILEMAP_WIDTH], h = it[lay + MI.TILEMAP_HEIGHT];
        for (let y = 0; y < h; y++) {
          for (let x = 1; x < w;) {
            let sx;
            for (sx = 1; x + sx < w && sx < 255; sx++) if (tiles[(y * w + x + sx) * 4]) break;
            tiles[(y * w + x) * 4 + 2] = sx - 1;
            x += sx;
          }
        }
      }
    }
  }

  NumGroups(): number { return this.m_GroupsNum; }
  NumLayers(): number { return this.m_LayersNum; }
  Map(): CDataFileReader { return this.m_pMap; }
  GetGroup(i: number): number { return this.m_pMap.GetItem(this.m_GroupsStart + i); }
  GetLayer(i: number): number { return this.m_pMap.GetItem(this.m_LayersStart + i); }
}
