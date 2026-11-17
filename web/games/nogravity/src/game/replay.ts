// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the recorded demos of the main menu (NG_ReplayLoad,
// src/lt_save.c; NG_NetDispatchPlayer and NG_NetTranslateShip, src/lt_reso.c). A menu\record<n>.dem
// holds the 32-bit SGRecordReplay header (startlevel u16, version u16, maxstep u32, step u32, two
// pointers), step x SGNetData (buttons u32 + the ship's V3XMATRIX), and for version 3 step x
// SGRecordBuffer (pointer, length) followed by the buffers: what the network code would have sent,
// the positions and shields of the other ships.
import { kPos, kVect } from '../v3x/vmx.ts';
import { V3XSTATE_MATRIXUPDATE } from '../v3x/vmx.ts';
import { fileGet } from '../sys/sys.ts';
import { loadEpisodeData } from './render.ts';
import { NG_WeaponFire } from './weapons.ts';
import { G, g_SGGame, type SGActor } from './state.ts';

/** NG_ReplayLoad: the next demo (g_SGGame.Demo counts 0..5); returns its level */
export async function replayLoad(): Promise<number> {
  const n = g_SGGame.Demo;
  await loadEpisodeData('menu');
  g_SGGame.Demo++;
  if (g_SGGame.Demo > 5) g_SGGame.Demo = 0;
  const b = fileGet(`menu/record${n}.dem`);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const R = G.rec;
  R.startlevel = dv.getUint16(0, true);
  R.version = dv.getUint16(2, true);
  const step = dv.getUint32(8, true);
  let o = 20;
  R.pos = [];
  for (let i = 0; i < step; i++) {
    const Mat = new Float32Array(16);
    for (let k = 0; k < 16; k++) Mat[k] = dv.getFloat32(o + 4 + 4 * k, true);
    R.pos.push({ but: dv.getUint32(o, true), Mat });
    o += 68;
  }
  R.buf = [];
  if (R.version === 3) {
    const lens: number[] = [];
    for (let i = 0; i < step; i++) { lens.push(dv.getUint32(o + 4, true)); o += 8; }
    for (let i = 0; i < step; i++) { R.buf.push(b.subarray(o, o + lens[i])); o += lens[i]; }
  }
  R.maxstep = step;
  R.step = 0;
  G.g_SGObjects.IsTimed = 0;
  return R.startlevel;
}

/** NG_NetDispatchPlayer(0, buffer) of a single-player recording: only the ships (SGNET_SHIP) */
export function netDispatchPlayer(b: Uint8Array | undefined): void {
  if (!b || b.length < 10) return;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const P = g_SGGame.pPlayer[0];
  let o = 2;
  o += 4; // frame
  P.Notify = dv.getUint32(o, true); o += 4;
  P.J.pInf.ModeX |= 2;
  if (!(P.Notify & 0x4000) || o + 4 > b.length) return;
  const num = dv.getUint32(o, true); o += 4;
  const list = g_SGGame.Scene!.OVI;
  for (let i = 0; i < num && o + 32 <= b.length; i++, o += 32) {
    const id = dv.getUint32(o, true);
    const OVI = list[id & 1023];
    const J = OVI?.data as SGActor | undefined;
    if (!J) continue;
    if (OVI !== G.g_pPlayer.J.OVI) {
      const nm = OVI.node.Tk;
      for (let k = 0; k < 3; k++) { kVect(nm)[k] = dv.getFloat32(o + 4 + 4 * k, true); kPos(nm)[k] = dv.getFloat32(o + 16 + 4 * k, true); }
    }
    J.pInf.Shield = dv.getUint32(o + 28, true) | 0;
    if (OVI !== G.g_pPlayer.J.OVI && J.pInf.Shield > 0) {
      if (id & 1024 && !J.pInf.ShootOk) NG_WeaponFire(J, J.pInf.Attack, J.OVItarget);
      OVI.state |= V3XSTATE_MATRIXUPDATE;
    }
  }
}
