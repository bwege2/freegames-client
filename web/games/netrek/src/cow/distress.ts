// @ts-nocheck
// COW 3.3.3 distress.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { itoapad } from './string_util.ts';
import { warning } from './warning.ts';
import { struct_distress } from './structs.ts';
import { $bytes, $rd, $sadd, $u64, $wr, G, P, R, S, __ctype_b_loc, atoi, fprintf, memccpy, memset, printf, sprintf, strncat, toupper } from '../rt/index.ts';
import { ADDRLEN, ALLTEAM, MAXMACLEN, MSG_LEN, PFCLOAK, PFENG, PFWEP, _ISlower, rcm } from './consts.ts';

let strcap$buf: any;

export function itoa2(n: number, s: Ptr | null): number {
  let i = 0;
  let c = 0;
  let j = 0;
  let len = 0;
  if ((c = n) < 0) {
    n = -n;
  }
  i = 0;
  do {
    s.a[s.o + i++] = n % 10 + 48 << 24 >> 24;
  } while ((n = n / 10 | 0) > 0);
  if (c < 0) {
    s.a[s.o + i++] = 45;
  }
  s.a[s.o + i] = 0;
  len = i--;
  for (j = 0; i > j; ++j, --i) {
    c = s.a[s.o + i];
    s.a[s.o + i] = s.a[s.o + j];
    s.a[s.o + j] = c << 24 >> 24;
  }
  return len;
}

export function HandleGenDistr(message: Ptr | null, from: number, to: number, dist: struct_distress | null): void {
  let mtext = null;
  let i = 0;
  mtext = message.add(ADDRLEN);
  memset($bytes(dist), 0, 8);
  dist.sender = from;
  dist.distype = (mtext.a[mtext.o] & 31) & 0xff;
  dist.macroflag = ((mtext.a[mtext.o] & 32) > 0 ? 1 : 0) & 0xff;
  dist.fuelp = (mtext.a[mtext.o + 1] & 127) & 0xff;
  dist.dam = (mtext.a[mtext.o + 2] & 127) & 0xff;
  dist.shld = (mtext.a[mtext.o + 3] & 127) & 0xff;
  dist.etmp = (mtext.a[mtext.o + 4] & 127) & 0xff;
  dist.wtmp = (mtext.a[mtext.o + 5] & 127) & 0xff;
  dist.arms = (mtext.a[mtext.o + 6] & 31) & 0xff;
  dist.sts = (mtext.a[mtext.o + 7] & 127) & 0xff;
  dist.wtmpflag = ((dist.sts & PFWEP) > 0 ? 1 : 0) & 0xff;
  dist.etempflag = ((dist.sts & PFENG) > 0 ? 1 : 0) & 0xff;
  dist.cloakflag = ((dist.sts & PFCLOAK) > 0 ? 1 : 0) & 0xff;
  dist.close_pl = (mtext.a[mtext.o + 8] & 127) & 0xff;
  dist.close_en = (mtext.a[mtext.o + 9] & 127) & 0xff;
  dist.tclose_pl = (mtext.a[mtext.o + 10] & 127) & 0xff;
  dist.tclose_en = (mtext.a[mtext.o + 11] & 127) & 0xff;
  dist.tclose_j = (mtext.a[mtext.o + 12] & 127) & 0xff;
  dist.close_j = (mtext.a[mtext.o + 13] & 127) & 0xff;
  dist.tclose_fr = (mtext.a[mtext.o + 14] & 127) & 0xff;
  dist.close_fr = (mtext.a[mtext.o + 15] & 127) & 0xff;
  i = 0;
  while ((mtext.a[mtext.o + (16 + i)] & 192) === 192 && i < 6) {
    dist.cclist[i] = (mtext.a[mtext.o + (16 + i)] & 31) & 0xff;
    i = i + 1 & 0xff;
  }
  dist.cclist[i] = mtext.a[mtext.o + (16 + i)] & 0xff;
  if (dist.cclist[i] === 128) {
    dist.pre_app = 1;
  } else {
    dist.pre_app = 0;
  }
  dist.preappend[0] = 0;
  if (mtext.a[mtext.o + (16 + i + 1)] !== 0) {
    memccpy(P(dist.preappend), mtext.add(16).add(i).add(1), 0, 80 - 1);
    dist.preappend[MSG_LEN - 1] = 0;
  }
}

export function Dist2Mesg(dist: struct_distress | null, buf: Ptr | null): void {
  let len = 0;
  let i = 0;
  sprintf(buf, S("%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c"), (dist.macroflag << 5) + dist.distype, dist.fuelp | 128, dist.dam | 128, dist.shld | 128, dist.etmp | 128, dist.wtmp | 128, dist.arms | 128, dist.sts | 128, dist.close_pl | 128, dist.close_en | 128, dist.tclose_pl | 128, dist.tclose_en | 128, dist.tclose_j | 128, dist.close_j | 128, dist.tclose_fr | 128, dist.close_fr | 128);
  i = 0;
  while ((dist.cclist[i] & 192) === 192) {
    buf.a[buf.o + (16 + i)] = dist.cclist[i] << 24 >> 24;
    ++i;
  }
  buf.a[buf.o + (16 + i)] = dist.cclist[i] << 24 >> 24;
  buf.a[buf.o + (16 + i + 1)] = 0;
  len = 16 + i + 1;
  if (dist.preappend[0] !== 0) {
    strncat(buf, P(dist.preappend), $u64(MSG_LEN - len));
    buf.a[buf.o + (MSG_LEN - 1)] = 0;
  }
}

export function makedistress(dist: struct_distress | null, cry: Ptr | null, pm: Ptr | null): number {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any, $t15: any, $t16: any, $t17: any, $t18: any, $t19: any, $t20: any, $t21: any, $t22: any, $t23: any, $t24: any, $t25: any, $t26: any, $t27: any, $t28: any, $t29: any, $t30: any, $t31: any, $t32: any, $t33: any, $t34: any, $t35: any, $t36: any;
  let buf1 = new Int8Array(850);
  let pbuf1 = null;
  let buf2 = new Int8Array(850);
  let buf3 = new Int8Array(850);
  let tmp = new Int8Array(850);
  const index = new Int32Array(1);
  index[0] = 0;
  const index2 = new Int32Array(1);
  index2[0] = 0;
  const index3 = new Int32Array(1);
  index3[0] = 0;
  let cap = 0;
  let sender = null;
  let j = null;
  let l = null;
  let c = 0;
  sender = $sadd(G.players, dist.sender);
  if (!pm.a[pm.o]) {
    cry.a[cry.o] = 0;
    return 0;
  }
  buf1[0] = 0;
  pbuf1 = P(buf1);
  while (pm.a[pm.o]) {
    if (pm.a[pm.o] === 37) {
      pm = pm.add(1);
      if (!pm.a[pm.o]) {
        continue;
      }
      switch (c = $rd(($t1 = pm, pm = $t1.add(1), $t1))) {
      case 32:
        $wr(($t2 = pbuf1, pbuf1 = $t2.add(1), $t2), 0, 32);
        break;
      case 79:
        cap = 1;
      case 111:
        if (sender.p_team !== ALLTEAM) {
          G.pappend = G.teamshort[sender.p_team];
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t3 = pbuf1, pbuf1 = $t3.add(1), $t3), 0, (cap ? toupper(G.pappend.a[G.pappend.o]) : G.pappend.a[G.pappend.o]) << 24 >> 24);
            G.pappend = G.pappend.add(1);
          }
        }
        ;
        cap = 0;
        break;
      case 97:
        pbuf1 = pbuf1.add(itoa2(dist.arms, pbuf1));
        ;
        break;
      case 100:
        pbuf1 = pbuf1.add(itoa2(dist.dam, pbuf1));
        ;
        break;
      case 115:
        pbuf1 = pbuf1.add(itoa2(dist.shld, pbuf1));
        ;
        break;
      case 102:
        pbuf1 = pbuf1.add(itoa2(dist.fuelp, pbuf1));
        ;
        break;
      case 119:
        pbuf1 = pbuf1.add(itoa2(dist.wtmp, pbuf1));
        ;
        break;
      case 101:
        pbuf1 = pbuf1.add(itoa2(dist.etmp, pbuf1));
        ;
        break;
      case 80:
      case 71:
      case 72:
      case 112:
      case 103:
      case 104:
        switch (c) {
        case 112:
          j = $sadd(G.players, dist.tclose_j);
          break;
        case 103:
          j = $sadd(G.players, dist.tclose_fr);
          break;
        case 104:
          j = $sadd(G.players, dist.tclose_en);
          break;
        case 80:
          j = $sadd(G.players, dist.close_j);
          break;
        case 71:
          j = $sadd(G.players, dist.close_fr);
          break;
        default:
          j = $sadd(G.players, dist.close_en);
          break;
        }
        $wr(($t4 = pbuf1, pbuf1 = $t4.add(1), $t4), 0, j.p_mapchars[1]);
        break;
      case 110:
        l = $sadd(G.planets, dist.tclose_pl);
        pbuf1 = pbuf1.add(itoa2(l.pl_info & sender.p_team ? l.pl_armies : -1, pbuf1));
        ;
        break;
      case 66:
        cap = 1;
      case 98:
        l = $sadd(G.planets, dist.close_pl);
        tmp[0] = l.pl_name[0] - 65 + 97 << 24 >> 24;
        tmp[1] = l.pl_name[1];
        tmp[2] = l.pl_name[2];
        tmp[3] = 0;
        {
          G.pappend = P(tmp);
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t5 = pbuf1, pbuf1 = $t5.add(1), $t5), 0, (cap ? toupper(G.pappend.a[G.pappend.o]) : G.pappend.a[G.pappend.o]) << 24 >> 24);
            G.pappend = G.pappend.add(1);
          }
        }
        ;
        cap = 0;
        break;
      case 76:
        cap = 1;
      case 108:
        l = $sadd(G.planets, dist.tclose_pl);
        tmp[0] = l.pl_name[0] - 65 + 97 << 24 >> 24;
        tmp[1] = l.pl_name[1];
        tmp[2] = l.pl_name[2];
        tmp[3] = 0;
        {
          G.pappend = P(tmp);
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t6 = pbuf1, pbuf1 = $t6.add(1), $t6), 0, (cap ? toupper(G.pappend.a[G.pappend.o]) : G.pappend.a[G.pappend.o]) << 24 >> 24);
            G.pappend = G.pappend.add(1);
          }
        }
        ;
        cap = 0;
        break;
      case 78:
        l = $sadd(G.planets, dist.tclose_pl);
        {
          G.pappend = P(l.pl_name);
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t7 = pbuf1, pbuf1 = $t7.add(1), $t7), 0, $rd(($t8 = G.pappend, G.pappend = $t8.add(1), $t8)));
          }
        }
        ;
        break;
      case 90:
        cap = 1;
      case 122:
        l = $sadd(G.planets, dist.tclose_pl);
        {
          G.pappend = G.teamshort[l.pl_owner];
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t9 = pbuf1, pbuf1 = $t9.add(1), $t9), 0, (cap ? toupper(G.pappend.a[G.pappend.o]) : G.pappend.a[G.pappend.o]) << 24 >> 24);
            G.pappend = G.pappend.add(1);
          }
        }
        ;
        cap = 0;
        break;
      case 116:
        l = $sadd(G.planets, dist.tclose_pl);
        $wr(($t10 = pbuf1, pbuf1 = $t10.add(1), $t10), 0, G.teamlet[l.pl_owner]);
        break;
      case 84:
        $wr(($t11 = pbuf1, pbuf1 = $t11.add(1), $t11), 0, G.teamlet[sender.p_team]);
        break;
      case 114:
        j = $sadd(G.players, dist.tclose_j);
        $wr(($t12 = pbuf1, pbuf1 = $t12.add(1), $t12), 0, G.teamlet[j.p_team]);
        break;
      case 99:
        $wr(($t13 = pbuf1, pbuf1 = $t13.add(1), $t13), 0, sender.p_mapchars[1]);
        break;
      case 87:
        if (dist.distype === rcm) {
          {
            G.pappend = G.whydeadmess[dist.wtmp];
            while (G.pappend.a[G.pappend.o]) {
              $wr(($t14 = pbuf1, pbuf1 = $t14.add(1), $t14), 0, $rd(($t15 = G.pappend, G.pappend = $t15.add(1), $t15)));
            }
          }
          ;
        } else if (dist.wtmpflag) {
          $wr(($t16 = pbuf1, pbuf1 = $t16.add(1), $t16), 0, 49);
        } else {
          $wr(($t17 = pbuf1, pbuf1 = $t17.add(1), $t17), 0, 48);
        }
        break;
      case 69:
        if (dist.etempflag) {
          $wr(($t18 = pbuf1, pbuf1 = $t18.add(1), $t18), 0, 49);
        } else {
          $wr(($t19 = pbuf1, pbuf1 = $t19.add(1), $t19), 0, 48);
        }
        break;
      case 75:
        cap = 1;
      case 107:
        if (cap) {
          j = $sadd(G.players, dist.tclose_j);
        } else {
          j = sender;
        }
        if (dist.distype === rcm) {
          pbuf1 = pbuf1.add(itoa2(dist.dam, pbuf1));
          ;
          $wr(($t20 = pbuf1, pbuf1 = $t20.add(1), $t20), 0, 46);
          itoapad(dist.shld, pbuf1, 1, 2);
          pbuf1 = pbuf1.add(2);
        } else {
          sprintf(P(tmp), S("%5.2f"), j.p_kills);
          {
            G.pappend = P(tmp);
            while (G.pappend.a[G.pappend.o]) {
              $wr(($t21 = pbuf1, pbuf1 = $t21.add(1), $t21), 0, $rd(($t22 = G.pappend, G.pappend = $t22.add(1), $t22)));
            }
          }
          ;
        }
        break;
      case 85:
        cap = 1;
      case 117:
        j = $sadd(G.players, dist.tclose_j);
        {
          G.pappend = P(j.p_name);
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t23 = pbuf1, pbuf1 = $t23.add(1), $t23), 0, (cap ? toupper(G.pappend.a[G.pappend.o]) : G.pappend.a[G.pappend.o]) << 24 >> 24);
            G.pappend = G.pappend.add(1);
          }
        }
        ;
        cap = 0;
        break;
      case 73:
        cap = 1;
      case 105:
        {
          G.pappend = P(sender.p_name);
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t24 = pbuf1, pbuf1 = $t24.add(1), $t24), 0, (cap ? toupper(G.pappend.a[G.pappend.o]) : G.pappend.a[G.pappend.o]) << 24 >> 24);
            G.pappend = G.pappend.add(1);
          }
        }
        ;
        cap = 0;
        break;
      case 83:
        {
          G.pappend = G.classes[sender.p_ship.s_type];
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t25 = pbuf1, pbuf1 = $t25.add(1), $t25), 0, $rd(($t26 = G.pappend, G.pappend = $t26.add(1), $t26)));
          }
        }
        ;
        break;
      case 77:
        cap = 1;
      case 109:
        {
          G.pappend = P(G.lastMessage);
          while (G.pappend.a[G.pappend.o]) {
            $wr(($t27 = pbuf1, pbuf1 = $t27.add(1), $t27), 0, (cap ? toupper(G.pappend.a[G.pappend.o]) : G.pappend.a[G.pappend.o]) << 24 >> 24);
            G.pappend = G.pappend.add(1);
          }
        }
        ;
        cap = 0;
        break;
      case 118:
        pbuf1 = pbuf1.add(itoa2(G.ping_av, pbuf1));
        ;
        break;
      case 86:
        pbuf1 = pbuf1.add(itoa2(G.ping_sd, pbuf1));
        ;
        break;
      case 121:
        pbuf1 = pbuf1.add(itoa2((2 * G.ping_tloss_sc + G.ping_tloss_cs) / 3 | 0, pbuf1));
        ;
        break;
      case 42:
      case 125:
      case 123:
      case 33:
      case 63:
      case 37:
        $wr(($t28 = pbuf1, pbuf1 = $t28.add(1), $t28), 0, 37);
        $wr(($t29 = pbuf1, pbuf1 = $t29.add(1), $t29), 0, c);
        break;
      case 62:
        c = 0;
        if (pm.a[pm.o] >= 48 && pm.a[pm.o] <= 57) {
          c = $rd(($t30 = pm, pm = $t30.add(1), $t30)) - 48 << 24 >> 24;
        }
        if (pm.a[pm.o] >= 48 && pm.a[pm.o] <= 57) {
          c = c * 10 + ($rd(($t31 = pm, pm = $t31.add(1), $t31)) - 48) << 24 >> 24;
        }
        if (c) {
          $wr(($t32 = pbuf1, pbuf1 = $t32.add(1), $t32), 0, 37);
          $wr(($t33 = pbuf1, pbuf1 = $t33.add(1), $t33), 0, 62);
          $wr(($t34 = pbuf1, pbuf1 = $t34.add(1), $t34), 0, c);
        }
        break;
      default:
        warning(S("Bad Macro character in distress!"));
        fprintf(R.stderr, S("Unrecognizable special character in distress pass 1: %c\n"), $rd(pm.add(-1)));
        break;
      }
    } else {
      $wr(($t35 = pbuf1, pbuf1 = $t35.add(1), $t35), 0, $rd(($t36 = pm, pm = $t36.add(1), $t36)));
    }
  }
  pbuf1.a[pbuf1.o] = 0;
  testmacro(P(buf1), P(buf2), P(index, 0), P(index2, 0));
  buf2[index2[0]] = 0;
  if (index2[0] <= 0) {
    cry.a[cry.o] = 0;
    return 0;
  }
  index2[0] = 0;
  condmacro(P(buf2), P(buf3), P(index2, 0), P(index3, 0), 1);
  if (index3[0] <= 0) {
    cry.a[cry.o] = 0;
    return 0;
  }
  buf3[index3[0]] = 0;
  cry.a[cry.o] = 0;
  strncat(cry, P(buf3), MSG_LEN - 1);
  return index3[0];
}

function testmacro(bufa: Ptr | null, bufb: Ptr | null, inda: Ptr | null, indb: Ptr | null): void {
  let $t1: any;
  let state = 0;
  let c = 0;
  if (indb.a[indb.o] >= 10 * MAXMACLEN) {
    return;
  }
  while (bufa.a[bufa.o + inda.a[inda.o]] && indb.a[indb.o] < 10 * MAXMACLEN) {
    if (state) {
      switch (c = bufa.a[bufa.o + inda.a[inda.o]++]) {
      case 42:
      case 37:
      case 123:
      case 125:
      case 33:
      case 62:
        if (indb.a[indb.o] < 10 * MAXMACLEN - 2) {
          bufb.a[bufb.o + indb.a[indb.o]] = 37;
          ++indb.a[indb.o];
          bufb.a[bufb.o + indb.a[indb.o]] = c;
          ++indb.a[indb.o];
          if (c === 62) {
            ($t1 = bufa.a[bufa.o + inda.a[inda.o]++], bufb.a[bufb.o + indb.a[indb.o]++] = $t1);
          }
        } else {
          return;
        }
        state = 0;
        continue;
        break;
      case 63:
        bufb.a[bufb.o + indb.a[indb.o]] = 48 + solvetest(bufa, inda) << 24 >> 24;
        ++indb.a[indb.o];
        state = 0;
        continue;
        break;
      default:
        warning(S("Bad character in Macro!"));
        printf(S("Unrecognizable special character in macro pass2: %c  Trying to continue.\n"), bufa.a[bufa.o + (inda.a[inda.o] - 1)]);
        state = 0;
        continue;
        break;
      }
    }
    if (bufa.a[bufa.o + inda.a[inda.o]] === 37) {
      ++state;
      ++inda.a[inda.o];
      continue;
    }
    state = 0;
    if (indb.a[indb.o] < 10 * MAXMACLEN) {
      bufb.a[bufb.o + indb.a[indb.o]] = bufa.a[bufa.o + inda.a[inda.o]];
      ++inda.a[inda.o];
      ++indb.a[indb.o];
    } else {
      return;
    }
  }
}

function solvetest(bufa: Ptr | null, inda: Ptr | null): number {
  let $t1: any, $t2: any;
  let state = 0;
  let bufh = new Int8Array(850);
  let bufc = new Int8Array(850);
  let indh = 0;
  let indc = 0;
  let i = 0;
  let operation = 0;
  while (bufa.a[bufa.o + inda.a[inda.o]] && bufa.a[bufa.o + inda.a[inda.o]] !== 60 && bufa.a[bufa.o + inda.a[inda.o]] !== 62 && bufa.a[bufa.o + inda.a[inda.o]] !== 61) {
    ($t1 = bufa.a[bufa.o + inda.a[inda.o]++], bufh[indh++] = $t1);
  }
  bufh[indh] = 0;
  operation = bufa.a[bufa.o + inda.a[inda.o]++];
  while (bufa.a[bufa.o + inda.a[inda.o]] && !(state && (bufa.a[bufa.o + inda.a[inda.o]] === 63 || bufa.a[bufa.o + inda.a[inda.o]] === 123))) {
    if (state && (bufa.a[bufa.o + inda.a[inda.o]] === 37 || bufa.a[bufa.o + inda.a[inda.o]] === 33 || bufa.a[bufa.o + inda.a[inda.o]] === 125)) {
      bufc[indc++] = 37;
    } else if (bufa.a[bufa.o + inda.a[inda.o]] === 37) {
      state = 1;
      ++inda.a[inda.o];
      continue;
    }
    state = 0;
    ($t2 = bufa.a[bufa.o + inda.a[inda.o]++], bufc[indc++] = $t2);
  }
  bufc[indc] = 0;
  if (bufa.a[bufa.o + inda.a[inda.o]]) {
    --inda.a[inda.o];
  }
  if (!operation) {
    return 1;
  }
  switch (operation) {
  case 61:
    if (indc !== indh) {
      return 0;
    }
    for (i = 0; i < indc; ++i) {
      if (bufc[i] !== bufh[i]) {
        return 0;
      }
    }
    return 1;
    break;
  case 60:
    if (atoi(P(bufh)) < atoi(P(bufc))) {
      return 1;
    } else {
      return 0;
    }
    break;
  case 62:
    if (atoi(P(bufh)) > atoi(P(bufc))) {
      return 1;
    } else {
      return 0;
    }
    break;
  default:
    warning(S("Bad operation in Macro!"));
    printf(S("Unrecognizable operation in macro pass3: %c  Trying to continue.\n"), operation);
    return 1;
    break;
  }
}

function condmacro(bufa: Ptr | null, bufb: Ptr | null, inda: Ptr | null, indb: Ptr | null, flag: number): number {
  let newflag = 0;
  let include = 0;
  let state = 0;
  if (indb.a[indb.o] >= MAXMACLEN) {
    return 0;
  }
  include = flag;
  while (bufa.a[bufa.o + inda.a[inda.o]] && indb.a[indb.o] < MAXMACLEN) {
    if (state) {
      switch (bufa.a[bufa.o + inda.a[inda.o]++]) {
      case 125:
        return 0;
        break;
      case 123:
        if (indb.a[indb.o] > 0) {
          --indb.a[indb.o];
          if (bufb.a[bufb.o + indb.a[indb.o]] === 48) {
            newflag = 0;
          } else {
            newflag = 1;
          }
        } else {
          newflag = 1;
        }
        if (include) {
          condmacro(bufa, bufb, inda, indb, newflag);
        } else {
          ++indb.a[indb.o];
          inda.a[inda.o] = skipmacro(bufa, inda.a[inda.o]);
        }
        state = 0;
        continue;
        break;
      case 33:
        if (flag) {
          include = 0;
        } else {
          include = 1;
        }
        state = 0;
        continue;
        break;
      case 42:
        if (include) {
          bufb.a[bufb.o] = 0;
          indb.a[indb.o] = 0;
          return 0;
        }
        state = 0;
        continue;
        break;
      case 37:
        if (include) {
          if (indb.a[indb.o] < MAXMACLEN) {
            bufb.a[bufb.o + indb.a[indb.o]] = 37;
            ++indb.a[indb.o];
          } else {
            return 0;
          }
        }
        state = 0;
        continue;
      case 62:
        if (include) {
          let t = bufa.a[bufa.o + inda.a[inda.o]++];
          for (; indb.a[indb.o] < t && indb.a[indb.o] < MAXMACLEN; ++indb.a[indb.o]) {
            bufb.a[bufb.o + indb.a[indb.o]] = 32;
          }
        }
        state = 0;
        continue;
      default:
        warning(S("Bad character in Macro!"));
        printf(S("Unrecognizable special character in macro pass4: %c  Trying to continue.\n"), bufa.a[bufa.o + (inda.a[inda.o] - 1)]);
      }
    }
    if (bufa.a[bufa.o + inda.a[inda.o]] === 37) {
      ++state;
      ++inda.a[inda.o];
      continue;
    }
    state = 0;
    if (include) {
      if (indb.a[indb.o] < MAXMACLEN) {
        bufb.a[bufb.o + indb.a[indb.o]] = bufa.a[bufa.o + inda.a[inda.o]];
        ++inda.a[inda.o];
        ++indb.a[indb.o];
      } else {
        return 0;
      }
    } else {
      ++inda.a[inda.o];
    }
  }
  return 0;
}

function skipmacro(buf: Ptr | null, index: number): number {
  let state = 0;
  let end = 0;
  if (index === 0) {
    ++index;
  }
  while (buf.a[buf.o + index] && !end) {
    if (state) {
      switch (buf.a[buf.o + index++]) {
      case 123:
        index = skipmacro(buf, index);
        continue;
        break;
      case 125:
        end = 1;
        continue;
        break;
      case 62:
        ++index;
      case 33:
      case 37:
      case 42:
        state = 0;
        continue;
        break;
      default:
        warning(S("Bad character in Macro!"));
        printf(S("Unrecognizable special character in macro pass5: %c  Trying to continue.\n"), buf.a[buf.o + (index - 1)]);
      }
    }
    if (buf.a[buf.o + index] === 37) {
      ++state;
      ++index;
      continue;
    }
    state = 0;
    ++index;
  }
  return index;
}

export function strcap(s: Ptr | null): Ptr | null {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let t = P(strcap$buf);
  while (s.a[s.o]) {
    if ($rd($rd(__ctype_b_loc()), s.a[s.o]) & _ISlower) {
      $wr(($t1 = t, t = $t1.add(1), $t1), 0, toupper($rd(($t2 = s, s = $t2.add(1), $t2))) << 24 >> 24);
    } else {
      $wr(($t3 = t, t = $t3.add(1), $t3), 0, $rd(($t4 = s, s = $t4.add(1), $t4)));
    }
  }
  t.a[t.o] = 0;
  if (strcap$buf[255]) {
    fprintf(R.stderr, S("ERROR: String constant overwritten\n"));
    return null;
  }
  return P(strcap$buf);
}

export function $init(): void {
  G.pappend = null;
  strcap$buf = new Int8Array(256);
}
