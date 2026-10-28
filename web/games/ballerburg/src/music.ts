// music.c: Eckhard Kruse's player for pieces of his music editor (1986): baller.mus is a list of bars
// with repeats, transpositions and volumes, and the bars' notes for three channels and noise, 96 steps
// a bar; every step sets the sound chip's registers and waits (m_wait, in baller1.c).
import { Giaccess } from './psg.ts';
import { m_wait } from './baller1.ts';
import { SDL_Delay } from './sdl.ts';

const s16 = (v: number) => (v << 16) >> 16;

let takte: Uint16Array | null = null;
let liste: Int16Array | null = null;
const buffer = new Int16Array(100);
let w_len = 96, kanal = 0, reg7 = 0, save7 = 0;
let tempo = 0, temp = 0;
const tra = new Int16Array(3), lau = new Int16Array(3);

/**************** Tabellen für Noten- und Frequenzwerte **********************/
const st_wert = [
  15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 27, 28, 30,
  32, 34, 36, 38, 40, 42, 45, 47, 50, 53, 56, 60,
  63, 67, 71, 75, 80, 84, 89, 95, 100, 106, 113, 119,
  127, 134, 142, 150, 159, 169, 179, 190, 201, 213, 226, 239,
  253, 268, 284, 301, 319, 338, 358, 379, 402, 426, 451, 478,
  506, 536, 568, 602, 638, 676, 716, 759, 804, 852, 903, 956,
  1013, 1073, 1136, 1204, 1276, 1351, 1432, 1517, 1607, 1703, 1804, 1911,
  2025, 2145, 2273, 2408, 2553, 2703, 2864, 3034, 3214, 3405, 3608, 3823,
];

const st_ton = [
  0, 1, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19, 20, 22, 24, 25,
  27, 29, 31, 32, 34, 36, 37, 39, 41, 43, 44, 46, 48, 49, 51, 53,
  55, 56, 58, 60, 61, 63, 65, 67, 68, 70, 72, 73,
  75, 77, 79, 80, 82, 84, 85, 87, 89, 91, 92, 94, 96,
];

export function musicReset(): void {
  takte = liste = null;
  buffer.fill(0);
  w_len = 96;
  kanal = reg7 = save7 = tempo = temp = 0;
  tra.fill(0);
  lau.fill(0);
}

/******************** Laden und Speicher reservieren *************************/
/** the music file's bytes (big-endian 16-bit words) */
export function m_load(file: Uint8Array): number {
  const word = (i: number) => s16((file[i] << 8) | file[i + 1]);
  if (file.length < 16) return -1;
  for (let i = 0; i < 8; i++) buffer[i] = word(i * 2);
  tempo = buffer[2];
  const max_abl = buffer[3];
  const max_tkt = buffer[4];
  const walz = buffer[7];
  w_len = walz ? 72 : 96;

  const l = new Int16Array(((max_abl + 2) << 3) >> 1);
  /* Reserviere Speicherbereich der Größe (w_len*2)*(max_tkt+2) und lösch ihn. */
  const t = new Uint16Array(w_len * (max_tkt + 2 + 2));
  let p = 16;
  if (file.length < p + 36) return -1;
  for (let i = 0; i < 18; i++) buffer[i] = word(p + i * 2);
  p += 36;
  const nl = ((max_abl + 1) << 3) >> 1;
  if (file.length < p + nl * 2) return -1;
  for (let i = 0; i < nl; i++) l[i] = word(p + i * 2);
  p += nl * 2;
  const nt = (max_tkt + 1) * w_len;
  if (file.length < p + nt * 2) return -1;
  for (let i = 0; i < nt; i++) t[100 + i] = word(p + i * 2) & 0xffff;
  liste = l;
  takte = t;
  return 0;
}

export function m_quit(): void {
  liste = takte = null;
}

/** the tempo word of the piece (m_wloop's wait does not use it) */
export function m_tempo(): number {
  return tempo + temp * 0;
}

/************************ Stück spielen **************************************/
export async function m_musik(): Promise<void> {
  let buf_ptr: number, lis_ptr: number, ende: number, help: number;
  let kan1: number, kan2: number, kan3: number, rau: number;

  if (!liste || !takte) return;
  const L = liste, T = takte;

  s_init();
  buffer[0] = 0;
  buffer[1] = -2;
  buf_ptr = 2;
  lis_ptr = 0;
  temp = 100;
  lau[0] = lau[1] = lau[2] = 100;
  tra[0] = tra[1] = tra[2] = 0;
  ende = 0;

  while (!ende) {
    switch (L[lis_ptr]) {
      case -1:
        if (buffer[--buf_ptr] === -2) ende = 1;
        lis_ptr = buffer[--buf_ptr];
        break;
      case -2:
        tra[0] = L[++lis_ptr];
        tra[1] = L[++lis_ptr];
        tra[2] = L[++lis_ptr];
        lis_ptr++;
        break;
      case -3:
        lau[0] = L[++lis_ptr];
        lau[1] = L[++lis_ptr];
        lau[2] = L[++lis_ptr];
        lis_ptr++;
        break;
      case -4:
        temp = L[++lis_ptr];
        lis_ptr += 3;
        break;
      case -5:
        lis_ptr += 4;
        buffer[buf_ptr++] = lis_ptr;
        buffer[buf_ptr++] = 0;
        break;
      case -6:
        lis_ptr += 4;
        if (buffer[buf_ptr - 1] === L[lis_ptr - 3]) {
          buf_ptr -= 2;
          help = 0;
          while (help >= 0) {
            if (L[lis_ptr] === -1) help = -1;
            help += (L[lis_ptr] === -5 ? 1 : 0) - (L[lis_ptr] === -7 ? 1 : 0);
            lis_ptr += 4;
          }
        }
        break;
      case -7:
        buffer[buf_ptr - 1]++;
        lis_ptr = buffer[buf_ptr - 2];
        break;
      case -8:
        if (L[++lis_ptr] < 0) {
          lis_ptr += 3;
        } else {
          buffer[buf_ptr++] = lis_ptr + 3;
          buffer[buf_ptr++] = -5;
          lis_ptr = (L[lis_ptr] - 1) << 2;
        }
        break;
      default:
        rau = s16((L[lis_ptr] >= 0 ? 1 : 0) * (L[lis_ptr] * w_len + 100));
        lis_ptr++;
        kan1 = s16((L[lis_ptr] >= 0 ? 1 : 0) * (L[lis_ptr] * w_len + 100));
        lis_ptr++;
        kan2 = s16((L[lis_ptr] >= 0 ? 1 : 0) * (L[lis_ptr] * w_len + 100));
        lis_ptr++;
        kan3 = s16((L[lis_ptr] >= 0 ? 1 : 0) * (L[lis_ptr] * w_len + 100));
        lis_ptr++;
        for (help = 0; help < w_len; help++) {
          s_rausch(T[rau++] & 255);
          kanal = 0;
          s_note(T[kan1++]);
          kanal++;
          s_note(T[kan2++]);
          kanal++;
          s_note(T[kan3++]);

          if (await m_wait()) {
            help = 100;
            ende++; /* Bei Taste Abbruch */
          }
        }
    }
  }
  s_quit();
}

/************* Standardroutine für m_wait(): Pause machen ********************/
export async function m_wloop(): Promise<void> {
  await SDL_Delay(Math.trunc(1800 / w_len));
}

/****************************** Note spielen *********************************/
function s_note(wert: number): void {
  let ton_nr = st_ton[(wert >> 2) & 63];
  if (wert & 0x4000) ton_nr--;
  if (wert & 0x8000) ton_nr++;
  if ((wert & 0xc000) === 0xc000) {
    s_rausch(wert & 255);
  } else {
    ton_nr -= tra[kanal];
    if (ton_nr < 0) ton_nr = 0;
    if (ton_nr > 95) ton_nr = 95;
    s_freq((st_wert[ton_nr] * (4 - (wert & 3)) + st_wert[ton_nr + 1] * (wert & 3)) >> 2);
    if (wert & 0x1000) s_t_an();
    else s_t_aus();
    if (wert & 0x2000) s_r_an();
    else s_r_aus();
    s_laut(s16(Math.trunc(((wert >> 8) & 15) * lau[kanal] / 100)));
  }
}

/**************************** Initialisierung ********************************/
function s_init(): void {
  reg7 = save7 = s16(Giaccess(0, 0x07));
  s_rausch(0);
}

/*********************** Wiederherstellen vor Ende ***************************/
function s_quit(): void {
  s_aus();
  Giaccess(save7, 0x87);
}

/************************** Tonfrequenz setzen *******************************/
function s_freq(freq: number): void {
  freq &= 0xffff;
  const kan = kanal << 1;
  Giaccess(freq & 0xff, kan + 0x80);
  Giaccess(freq >> 8, kan + 0x81);
}

/************************** Lautstärke setzen ********************************/
function s_laut(laut: number): void {
  Giaccess(laut, kanal + 0x88);
}

/************************* Rauschperiode setzen ******************************/
function s_rausch(periode: number): void {
  Giaccess(periode, 0x86);
}

const k2 = () => 1 + kanal + (kanal === 2 ? 1 : 0);

/**************************** Ton einschalten ********************************/
function s_t_an(): void {
  reg7 = s16(reg7 & (254 - kanal - (kanal === 2 ? 1 : 0)));
  Giaccess(reg7, 0x87);
}

/**************************** Ton ausschalten ********************************/
function s_t_aus(): void {
  reg7 = s16(reg7 | k2());
  Giaccess(reg7, 0x87);
}

/*************************** Rauschen einschalten ****************************/
function s_r_an(): void {
  reg7 = s16(reg7 & (255 - (k2() << 3)));
  Giaccess(reg7, 0x87);
}

/*************************** Rauschen ausschalten ****************************/
function s_r_aus(): void {
  reg7 = s16(reg7 | (k2() << 3));
  Giaccess(reg7, 0x87);
}

/*************************** Sound abschalten ********************************/
function s_aus(): void {
  kanal = 0;
  s_laut(0);
  kanal = 1;
  s_laut(0);
  kanal = 2;
  s_laut(0);
}
