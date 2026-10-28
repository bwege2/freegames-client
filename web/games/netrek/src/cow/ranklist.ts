// @ts-nocheck
// COW 3.3.3 ranklist.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_ClearWindow, W_Flush, W_ResizeTextWindow, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, $sadd, G, P, S, sprintf, strcat, strcmp, strcpy, strlen } from '../rt/index.ts';


let ranklist$size: number;

function toNextRank(rank: number): number {
  let hourratio = 0;
  let rankDI = 0;
  let myDI = 0;
  let oRating = 0;
  let pRating = 0;
  let bRating = 0;
  let Ratings = 0;
  if (!strcmp(P(G.me.p_name), S("guest")) || !strcmp(P(G.me.p_name), S("Guest"))) {
    hourratio = 5;
  } else {
    hourratio = 1;
  }
  oRating = G.me.p_stats.st_tkills * G.status.timeprod / (G.me.p_stats.st_tticks * G.status.kills);
  pRating = G.me.p_stats.st_tplanets * G.status.timeprod / (G.me.p_stats.st_tticks * G.status.planets);
  bRating = G.me.p_stats.st_tarmsbomb * G.status.timeprod / (G.me.p_stats.st_tticks * G.status.armsbomb);
  Ratings = oRating + pRating + bRating;
  myDI = Ratings * (G.me.p_stats.st_tticks / 36000);
  rankDI = $sadd(G.ranks, rank).ratings * $sadd(G.ranks, rank).hours / hourratio;
  if (Ratings > $sadd(G.ranks, rank).ratings) {
    if (myDI > rankDI) {
      return 0;
    } else {
      return rankDI - myDI;
    }
  } else if (Ratings > $sadd(G.ranks, (rank - 1)).ratings) {
    if (myDI > 2 * rankDI) {
      return 0;
    } else {
      return 2 * rankDI - myDI;
    }
  } else if (G.me.p_stats.st_rank > 0 && Ratings > $sadd(G.ranks, (rank - 2)).ratings) {
    if (myDI > 4 * rankDI) {
      return 0;
    } else {
      return 4 * rankDI - myDI;
    }
  } else if (G.me.p_stats.st_rank >= 4 && Ratings > $sadd(G.ranks, (rank - 3)).ratings) {
    if (myDI > 8 * rankDI) {
      return 0;
    } else {
      return 8 * rankDI - myDI;
    }
  } else {
    return -1;
  }
}

export function ranklist(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let i = 0;
  let buf = new Int8Array(80);
  let col = G.F_sp_rank ? G.textColor : G.W_Grey;
  if (ranklist$size !== G.nranks) {
    W_ClearWindow(G.rankw);
    W_ResizeTextWindow(G.rankw, 65, G.nranks + 9);
    ranklist$size = G.nranks;
  }
  strcpy(P(buf), S("  Rank       Hours  Offense  Ratings      DI"));
  W_WriteText(G.rankw, 1, 1, col, P(buf), strlen(P(buf)) | 0, G.W_HighlightFont);
  for (i = 0; i < G.nranks; ++i) {
    sprintf(P(buf), S("%-11.11s %5.0f %8.2f %8.2f   %7.2f"), $sadd(G.ranks, i).name, $sadd(G.ranks, i).hours, $sadd(G.ranks, i).offense, $sadd(G.ranks, i).ratings, $sadd(G.ranks, i).ratings * $sadd(G.ranks, i).hours);
    if (G.mystats.st_rank === i) {
      if (i < G.nranks - 1) {
        let buf2 = new Int8Array(35);
        let DI = 0;
        if ((DI = toNextRank(i + 1)) !== -1) {
          sprintf(P(buf2), S(" (need %.2f DI)"), DI);
          strcat(P(buf), P(buf2));
        } else {
          strcat(P(buf), S(" (need ratings)"));
        }
      }
      W_WriteText(G.rankw, 1, i + 2, G.W_Cyan, P(buf), strlen(P(buf)) | 0, G.W_HighlightFont);
    } else {
      W_WriteText(G.rankw, 1, i + 2, col, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
    }
  }
  strcpy(P(buf), S("To achieve a rank, you need the corresponding DI"));
  W_WriteText(G.rankw, 1, i + 3, col, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  strcpy(P(buf), S("in less than the hours allowed (DI = ratings x hours)."));
  W_WriteText(G.rankw, 1, i + 4, col, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  strcpy(P(buf), S("OR, get offense+bombing+planets above corresponding Ratings"));
  W_WriteText(G.rankw, 1, i + 5, col, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  strcpy(P(buf), S("Promotions also occur at 2xDI with Ratings - 1"));
  W_WriteText(G.rankw, 1, i + 6, col, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  strcpy(P(buf), S("4xDI with Ratings - 2, and 8xDI with Ratings - 3"));
  W_WriteText(G.rankw, 1, i + 7, col, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  W_Flush();
}

export function $init(): void {
  ranklist$size = 0;
}
