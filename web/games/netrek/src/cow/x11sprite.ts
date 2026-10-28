// @ts-nocheck
// COW 3.3.3 x11sprite.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { getdefault, strcmpi } from './defaults.ts';
import { W_SetBackgroundPixmap, W_UnsetBackgroundPixmap } from './x11window.ts';
import { struct_S_Object, struct_stat, struct_window } from './structs.ts';
import { $arr, $at2, $cast, $cs, $rows, $sadd, $sarr, $sat, $ta, $u64, G, P, R, S, XClearArea, XCopyArea, XCreateGC, XFreeGC, XFreePixmap, XSetClipMask, XSetClipOrigin, access, calloc, exit, fprintf, free, fts_close, fts_open, fts_read, imlib_context_set_colormap, imlib_context_set_display, imlib_context_set_drawable, imlib_context_set_image, imlib_context_set_visual, imlib_free_image_and_decache, imlib_image_get_height, imlib_image_get_width, imlib_load_image, imlib_render_pixmaps_for_whole_image, memset, random, realloc, sprintf, stat, strcpy, strlen, strncpy } from '../rt/index.ts';
import { FTS_F, FTS_LOGICAL, False, MAXPLAYER, NO_BG_PIX, NO_CLK_PIX, NO_EXP_PIX, NO_FED_PIX, NO_HALOS, NO_IND_PIX, NO_KLI_PIX, NO_MAP_PIX, NO_ORI_PIX, NO_PIXMAPS, NO_ROM_PIX, NO_WEP_PIX, NUMDETFRAMES, NUMTEAM, NUM_BG_IMGS, NUM_PL_IMGS, NUM_TYPES, NoPixmapError, PALIVE, PEXPLODE, PFCLOAK, PFOBSERV, PFPLOCK, PLAGRI, PLFUEL, PLREPAIR, PL_PIX_AGRI, PL_PIX_ARMY, PL_PIX_FUEL, PL_PIX_IND, PL_PIX_REPAIR, PL_PIX_ROCK, PL_PIX_UKN, PTEXPLODE, PTFREE, R_OK, SCALE, STARBASE, TEXPLODE } from './consts.ts';

let mplanetImg: any;
let shipImg: any;
let torpImg: any;
let plasmaImg: any;
let cloakImg: struct_S_Object;
let explosionImg: any;
let backPix: any;
let pixmapDir: any;
let ss: struct_S_Object | null;
let ss_size: number;
let ss_next: number;
let ss_show: number;

function ReadFileToSprite(filename: Ptr | null, sprite: struct_S_Object | null, drawable: number): number {
  let $g = 0;
  let im = null;
  let width = 0;
  let height = 0;
  let nviews = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (access(filename, R_OK) !== 0) {
        fprintf(R.stderr, S("image %s is not readable\n"), filename);
        { $g = 1; continue $L; }
      }
      im = imlib_load_image(filename);
      if (!im) {
        fprintf(R.stderr, S("image %s failed to load\n"), filename);
        { $g = 1; continue $L; }
      }
      imlib_context_set_display(G.W_Display);
      imlib_context_set_visual(G.W_Visual);
      imlib_context_set_colormap(G.W_Colormap);
      imlib_context_set_image(im);
      imlib_context_set_drawable(drawable);
      imlib_render_pixmaps_for_whole_image(P(sprite, "image"), P(sprite, "shape"));
      width = imlib_image_get_width();
      height = imlib_image_get_height();
      nviews = height / width | 0;
      if (Math.imul(nviews, width) !== height) {
        nviews = 1;
      }
      sprite.drawable = drawable;
      sprite.gc = XCreateGC(G.W_Display, sprite.image, 0, null);
      sprite.view = 0;
      sprite.nviews = nviews;
      sprite.width = width;
      sprite.height = height / nviews | 0;
      sprite.cloak = 0;
      imlib_free_image_and_decache();
      return 0;
    case 1: // fail
      sprite.image = NoPixmapError;
      sprite.nviews = 1;
      return 1;
    }
    break;
  }
}

export function ReadFileToTile(filename: Ptr | null, pix: Ptr | null, drawable: number): number {
  let $g = 0;
  let im = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (access(filename, R_OK) !== 0) {
        fprintf(R.stderr, S("image %s is not readable\n"), filename);
        { $g = 1; continue $L; }
      }
      im = imlib_load_image(filename);
      if (!im) {
        fprintf(R.stderr, S("image %s failed to load\n"), filename);
        { $g = 1; continue $L; }
      }
      imlib_context_set_display(G.W_Display);
      imlib_context_set_visual(G.W_Visual);
      imlib_context_set_colormap(G.W_Colormap);
      imlib_context_set_image(im);
      imlib_context_set_drawable(drawable);
      imlib_render_pixmaps_for_whole_image(pix, null);
      imlib_free_image_and_decache();
      return 0;
    case 1: // fail
      pix.a[pix.o] = NoPixmapError;
      return 1;
    }
    break;
  }
}

function GetPixmapDir(): void {
  let pd = null;
  if (pixmapDir[0] !== 0) {
    return;
  }
  pd = getdefault(S("pixmapDir"));
  if (!!pd) {
    strncpy(P(pixmapDir), pd, 1024);
  } else {
    strcpy(P(pixmapDir), S("/usr/share/pixmaps/netrek-client-cow"));
  }
  if (strcmpi(P(pixmapDir), S("None")) === 0 || G.pixMissing & NO_PIXMAPS) {
    G.pixMissing = NO_IND_PIX | NO_FED_PIX | NO_ROM_PIX | NO_KLI_PIX | NO_ORI_PIX | NO_WEP_PIX | NO_EXP_PIX | NO_CLK_PIX | NO_MAP_PIX | NO_BG_PIX | NO_PIXMAPS;
    fprintf(R.stderr, S("pixmaps turned off\n"));
  } else {
    let buf = new struct_stat();
    if (stat(P(pixmapDir), buf) || !((buf.st_mode & 61440) >>> 0 === 16384)) {
      if (stat(S("pixmaps"), buf) || !((buf.st_mode & 61440) >>> 0 === 16384)) {
        G.pixMissing = NO_IND_PIX | NO_FED_PIX | NO_ROM_PIX | NO_KLI_PIX | NO_ORI_PIX | NO_WEP_PIX | NO_EXP_PIX | NO_CLK_PIX | NO_MAP_PIX | NO_BG_PIX | NO_PIXMAPS;
        fprintf(R.stderr, S("pixmaps not here\n"));
      } else {
        strcpy(P(pixmapDir), S("pixmaps"));
      }
    }
  }
}

export function GetPixmaps(d: any, win: struct_window | null, t: Ptr | null, g: Ptr | null): void {
  let i = 0;
  let j = 0;
  let buf = new Int8Array(2048);
  let missing = 0;
  let tactical = $cast(struct_window, t).drawable;
  let galactic = $cast(struct_window, g).drawable;
  G.W_Display = d;
  GetPixmapDir();
  for (i = 0; i < NUMTEAM + 1; ++i) {
    missing = 0;
    for (j = 0; j < NUM_TYPES; ++j) {
      sprintf(P(buf), S("%s/%s/%s"), P(pixmapDir), P(G.teamnames[i]), P(G.shipfiles[j]));
      missing += ReadFileToSprite(P(buf), $sat(shipImg[i], j), tactical);
    }
    if (missing === NUM_TYPES) {
      G.pixMissing |= G.reremap[i];
      if (!(G.pixMissing & NO_PIXMAPS)) {
        fprintf(R.stderr, S("type %s ship pixmaps not available\n"), P(G.teamnames[i]));
      }
    }
  }
  missing = 0;
  for (i = 0; i < NUMTEAM + 1; ++i) {
    for (j = 0; j < 2; ++j) {
      sprintf(P(buf), S("%s/%s/%s"), P(pixmapDir), P(G.teamnames[i]), P(G.torpfiles[j]));
      missing += ReadFileToSprite(P(buf), $sat(torpImg[i], j), tactical);
      sprintf(P(buf), S("%s/%s/%s"), P(pixmapDir), P(G.teamnames[i]), P(G.plasmafiles[j]));
      missing += ReadFileToSprite(P(buf), $sat(plasmaImg[i], j), tactical);
    }
  }
  if (missing === (NUMTEAM + 1) * 4) {
    G.pixMissing |= NO_WEP_PIX;
    if (!(G.pixMissing & NO_PIXMAPS)) {
      fprintf(R.stderr, S("type weapon pixmaps not available\n"));
    }
  }
  missing = 0;
  for (i = 0; i < 2; ++i) {
    sprintf(P(buf), S("%s/Misc/%s"), P(pixmapDir), P(G.explosionfiles[i]));
    missing += ReadFileToSprite(P(buf), $sat(explosionImg, i), tactical);
  }
  if (missing === 2) {
    G.pixMissing |= NO_EXP_PIX;
    if (!(G.pixMissing & NO_PIXMAPS)) {
      fprintf(R.stderr, S("type explosion pixmaps not available\n"));
    }
  }
  missing = 0;
  for (i = 0; i < NUM_PL_IMGS && !missing; ++i) {
    sprintf(P(buf), S("%s/Planets/Map/%s"), P(pixmapDir), P(G.mplanetfiles[i]));
    if (i === PL_PIX_AGRI && missing === 0) {
      if (ReadFileToSprite(P(buf), $sat(mplanetImg, i), galactic) !== 0) {
        sprintf(P(buf), S("%s/Planets/%s"), P(pixmapDir), P(G.mplanetfiles[i - 1]));
        ReadFileToSprite(P(buf), $sat(mplanetImg, i), galactic);
      }
    } else {
      missing += ReadFileToSprite(P(buf), $sat(mplanetImg, i), galactic);
    }
  }
  if (missing) {
    G.pixMissing |= NO_MAP_PIX;
    if (!(G.pixMissing & NO_PIXMAPS)) {
      fprintf(R.stderr, S("type map pixmaps not available\n"));
    }
  }
  sprintf(P(buf), S("%s/Misc/%s"), P(pixmapDir), P(G.cloakfile));
  if (ReadFileToSprite(P(buf), cloakImg, tactical)) {
    G.pixMissing |= NO_CLK_PIX;
    if (!(G.pixMissing & NO_PIXMAPS)) {
      fprintf(R.stderr, S("type cloak pixmaps not available\n"));
    }
  }
  missing = 0;
  for (i = 0; i < NUM_BG_IMGS; ++i) {
    sprintf(P(buf), S("%s/Misc/%s"), P(pixmapDir), P(G.bgfiles[i]));
    missing += ReadFileToTile(P(buf), P(backPix, i), galactic);
  }
  if (missing === NUM_BG_IMGS) {
    G.pixMissing |= NO_BG_PIX;
    if (!(G.pixMissing & NO_PIXMAPS)) {
      fprintf(R.stderr, S("type background pixmaps not available\n"));
    }
  }
  G.pixMissing &= ~NO_HALOS;
}

export function W_DrawSprite(in_: any, x: number, y: number, winside: number): number {
  let view = Math.imul(SCALE, winside) / 2 | 0;
  let sprite = $cast(struct_S_Object, in_);
  let dx = 0;
  let dy = 0;
  if (!sprite || sprite.view < 0 || sprite.view >= sprite.nviews) {
    return 0;
  }
  if (x > view || x < -view || y > view || y < -view) {
    return 0;
  }
  dx = x - (sprite.width / 2 | 0);
  dy = y - (sprite.height / 2 | 0);
  if (sprite.cloak > 0 && !(G.pixFlags & NO_CLK_PIX)) {
    XSetClipMask(G.W_Display, sprite.gc, cloakImg.shape);
    XSetClipOrigin(G.W_Display, sprite.gc, dx, dy - Math.imul(cloakImg.view, cloakImg.height));
  } else {
    XSetClipMask(G.W_Display, sprite.gc, sprite.shape);
    XSetClipOrigin(G.W_Display, sprite.gc, dx, dy - Math.imul(sprite.view, sprite.height));
  }
  XCopyArea(G.W_Display, sprite.image, sprite.drawable, sprite.gc, 0, Math.imul(sprite.view, sprite.height), sprite.width >>> 0, sprite.height >>> 0, dx, dy);
  return sprite.width;
}

export function W_DrawSpriteAbsolute(in_: any, x: number, y: number): void {
  let sprite = $cast(struct_S_Object, in_);
  if (!sprite) {
    return;
  }
  XSetClipMask(G.W_Display, sprite.gc, sprite.shape);
  XSetClipOrigin(G.W_Display, sprite.gc, x, y);
  XCopyArea(G.W_Display, sprite.image, sprite.drawable, sprite.gc, 0, 0, sprite.width >>> 0, sprite.height >>> 0, x, y);
}

export function W_ClearSpriteAbsolute(in_: any, x: number, y: number): void {
  let sprite = $cast(struct_S_Object, in_);
  if (!sprite) {
    return;
  }
  XSetClipMask(G.W_Display, sprite.gc, sprite.shape);
  XSetClipOrigin(G.W_Display, sprite.gc, x, y);
  XClearArea(G.W_Display, sprite.drawable, x, y, sprite.width >>> 0, sprite.height >>> 0, False);
}

export function S_Ship(playerno: number): any {
  let sprite = null;
  let this_ = null;
  if (playerno > MAXPLAYER || playerno < 0) {
    return null;
  }
  this_ = $sadd(G.players, playerno);
  if (this_.p_status !== PALIVE && this_.p_status !== PEXPLODE) {
    return null;
  }
  if ((this_.p_flags & PFOBSERV) >>> 0 && !((this_.p_flags & PFPLOCK) >>> 0)) {
    return null;
  }
  if ((this_.p_flags & PFOBSERV) >>> 0 && !((this_.p_flags & PFCLOAK) >>> 0)) {
    return null;
  }
  sprite = $sat(shipImg[G.remap[this_.p_team]], this_.p_ship.s_type);
  sprite.cloak = 0;
  sprite.view = ((this_.p_dir + (128 / sprite.nviews | 0)) / (256 / sprite.nviews | 0) | 0) % sprite.nviews;
  if (this_.p_status === PEXPLODE) {
    let i = 0;
    if (G.pixFlags & NO_EXP_PIX) {
      return null;
    }
    if (this_.p_ship.s_type === STARBASE) {
      i = this_.p_explode * 5 / G.server_ups | 0;
      sprite = explosionImg[1];
    } else {
      i = this_.p_explode * 10 / G.server_ups | 0;
      sprite = explosionImg[0];
    }
    if (i >= sprite.nviews) {
      return null;
    }
    sprite.view = i;
    this_.p_explode = this_.p_explode + 1 << 16 >> 16;
  } else if ((this_.p_flags & PFCLOAK) >>> 0 || this_.p_cloakphase > 0) {
    if (this_.p_cloakphase === (12 * G.server_ups / 10 | 0) - 1) {
      if (this_ === G.me && !(G.pixFlags & NO_CLK_PIX)) {
        sprite = cloakImg;
        sprite.view = cloakImg.nviews - 1;
      } else {
        return null;
      }
    } else {
      if ((12 * G.server_ups / 10 | 0) - 2 === 0) {
        return null;
      }
      sprite.cloak = this_.p_cloakphase;
      cloakImg.view = 0 > cloakImg.nviews - (Math.imul(this_.p_cloakphase, cloakImg.nviews - 1) / ((12 * G.server_ups / 10 | 0) - 2) | 0) - 2 ? 0 : cloakImg.nviews - (Math.imul(this_.p_cloakphase, cloakImg.nviews - 1) / ((12 * G.server_ups / 10 | 0) - 2) | 0) - 2;
    }
  }
  if (sprite.image === NoPixmapError || G.pixFlags & G.reremap[G.remap[this_.p_team]]) {
    return null;
  } else {
    return sprite;
  }
}

export function S_mPlanet(planetno: number): any {
  let sprite = null;
  let this_ = $sadd(G.planets, planetno);
  if (G.pixFlags & NO_MAP_PIX) {
    return null;
  }
  if (this_.pl_info & G.me.p_team || G.playback) {
    if (this_.pl_flags & PLAGRI && G.F_agri_pix) {
      sprite = mplanetImg[PL_PIX_AGRI];
    } else {
      sprite = mplanetImg[PL_PIX_ROCK];
    }
  } else {
    sprite = mplanetImg[PL_PIX_UKN];
  }
  sprite.view = 0;
  return sprite;
}

export function S_mArmy(planetno: number): any {
  let sprite = null;
  let this_ = $sadd(G.planets, planetno);
  if (G.pixFlags & NO_MAP_PIX || G.showgalactic !== 1) {
    return null;
  }
  if ((this_.pl_info & G.me.p_team || G.playback) && this_.pl_armies > 4) {
    sprite = mplanetImg[PL_PIX_ARMY];
    sprite.view = 0;
  }
  return sprite;
}

export function S_mRepair(planetno: number): any {
  let sprite = null;
  let this_ = $sadd(G.planets, planetno);
  if (G.pixFlags & NO_MAP_PIX || G.showgalactic !== 1) {
    return null;
  }
  if ((this_.pl_info & G.me.p_team || G.playback) && this_.pl_flags & PLREPAIR) {
    sprite = mplanetImg[PL_PIX_REPAIR];
    sprite.view = 0;
  }
  return sprite;
}

export function S_mFuel(planetno: number): any {
  let sprite = null;
  let this_ = $sadd(G.planets, planetno);
  if (G.pixFlags & NO_MAP_PIX || G.showgalactic !== 1) {
    return null;
  }
  if ((this_.pl_info & G.me.p_team || G.playback) && this_.pl_flags & PLFUEL) {
    sprite = mplanetImg[PL_PIX_FUEL];
    sprite.view = 0;
  }
  return sprite;
}

export function S_mOwner(planetno: number): any {
  let sprite = null;
  let this_ = $sadd(G.planets, planetno);
  if (G.pixFlags & NO_MAP_PIX || G.showgalactic !== 0) {
    return null;
  }
  if (this_.pl_info & G.me.p_team || G.playback) {
    sprite = $sat(mplanetImg, PL_PIX_IND + G.remap[this_.pl_owner]);
    sprite.view = 0;
  }
  return sprite;
}

export function S_Torp(torpno: number): any {
  let $t1: any;
  let sprite = null;
  let this_ = $sadd(G.torps, torpno);
  let numdetframes = 0;
  let frame = 0;
  if (this_.t_status === TEXPLODE) {
    sprite = $at2(torpImg, G.remap[$sadd(G.players, this_.t_owner).p_team], 1);
    this_.t_fuse = this_.t_fuse - 1 << 16 >> 16;
    numdetframes = Math.imul(NUMDETFRAMES, G.server_ups) / 5 | 0;
    frame = this_.t_fuse * 5 / G.server_ups | 0;
    if (this_.t_fuse <= 0) {
      this_.t_status = PTFREE;
      ($t1 = $sadd(G.players, this_.t_owner), $t1.p_ntorp = $t1.p_ntorp - 1 << 16 >> 16);
    } else if (this_.t_fuse >= numdetframes) {
      this_.t_fuse = numdetframes - 1 << 16 >> 16;
    } else {
      sprite.view = frame;
    }
  } else {
    sprite = $at2(torpImg, G.remap[$sadd(G.players, this_.t_owner).p_team], 0);
    sprite.view = (sprite.view + 1) % sprite.nviews;
  }
  if (sprite.image === NoPixmapError || G.pixFlags & NO_WEP_PIX) {
    return null;
  } else {
    return sprite;
  }
}

export function S_Plasma(plasmatorpno: number): any {
  let $t1: any;
  let sprite = null;
  let this_ = $sadd(G.plasmatorps, plasmatorpno);
  let numdetframes = 0;
  let frame = 0;
  if (this_.pt_status === PTEXPLODE) {
    sprite = $at2(plasmaImg, G.remap[$sadd(G.players, this_.pt_owner).p_team], 1);
    this_.pt_fuse = this_.pt_fuse - 1 << 16 >> 16;
    numdetframes = Math.imul(NUMDETFRAMES, G.server_ups) / 5 | 0;
    frame = this_.pt_fuse * 5 / G.server_ups | 0;
    if (this_.pt_fuse <= 0) {
      this_.pt_status = PTFREE;
      ($t1 = $sadd(G.players, this_.pt_owner), $t1.p_nplasmatorp = $t1.p_nplasmatorp - 1 << 16 >> 16);
    } else if (this_.pt_fuse >= numdetframes) {
      this_.pt_fuse = numdetframes - 1 << 16 >> 16;
    } else {
      sprite.view = frame;
    }
  } else {
    sprite = $at2(plasmaImg, G.remap[$sadd(G.players, this_.pt_owner).p_team], 0);
    sprite.view = (sprite.view + 1) % sprite.nviews;
  }
  if (sprite.image === NoPixmapError || G.pixFlags & NO_WEP_PIX) {
    return null;
  } else {
    return sprite;
  }
}

export function W_GalacticBgd(which: number): void {
  let this_ = G.mapw;
  if (backPix[which] === NoPixmapError || G.pixFlags & NO_BG_PIX) {
    W_UnsetBackgroundPixmap(this_);
  } else {
    W_SetBackgroundPixmap(this_, backPix[which]);
  }
}

export function W_LocalBgd(which: number): void {
  let this_ = G.w;
  if (backPix[which] === NoPixmapError || G.pixFlags & NO_BG_PIX) {
    W_UnsetBackgroundPixmap(this_);
  } else {
    W_SetBackgroundPixmap(this_, backPix[which]);
  }
}

export function W_SetBackground(w: Ptr | null, which: number): void {
  let this_ = w;
  if (backPix[which] === NoPixmapError || G.pixFlags & NO_BG_PIX) {
    W_UnsetBackgroundPixmap(this_);
  } else {
    W_SetBackgroundPixmap(this_, backPix[which]);
  }
}

export function W_SetBackgroundImage(w: Ptr | null, name: Ptr | null): any {
  let drawable = $cast(struct_window, w).drawable;
  let sprite = $cast(struct_S_Object, calloc(1, 56));
  let path = null;
  if (!sprite) {
    return null;
  }
  GetPixmapDir();
  path = P(new Int8Array((strlen(P(pixmapDir)) + strlen(name) + 2)));
  if (!path) {
    free(sprite);
    return null;
  }
  sprintf(path, S("%s/%s"), P(pixmapDir), name);
  if (ReadFileToSprite(path, sprite, drawable)) {
    free(sprite);
    free(path);
    return null;
  }
  free(path);
  W_SetBackgroundPixmap(w, sprite.image);
  return sprite;
}

function ss_init(w: Ptr | null): void {
  let path = null;
  let argv = new Array(2).fill(null);
  let fts = null;
  let ent = null;
  let drawable = $cast(struct_window, w).window;
  if (!!ss) {
    return;
  }
  GetPixmapDir();
  path = P(new Int8Array((strlen(P(pixmapDir)) + 4)));
  if (!path) {
    fprintf(R.stderr, S("ss_init; fail to allocate path\n"));
    exit(1);
  }
  sprintf(path, S("%s/ss"), P(pixmapDir));
  argv[0] = path;
  argv[1] = null;
  ss_size = 50;
  ss = $sarr(struct_S_Object, $u64(ss_size) * 56 / 56)[0];
  ss_next = 0;
  fts = fts_open(P(argv), FTS_LOGICAL, null);
  while (ent = fts_read(fts)) {
    if (ent.fts_info !== FTS_F) {
      continue;
    }
    memset($sadd(ss, ss_next), 0, 56);
    if (ReadFileToSprite(ent.fts_path, $sadd(ss, ss_next), drawable)) {
      continue;
    }
    ++ss_next;
    if (ss_next >= ss_size) {
      ss_size += 10;
      ss = $cast(struct_S_Object, realloc(ss, $u64(ss_size) * 56));
      if (!ss) {
        fprintf(R.stderr, S("ss_init; fail to reallocate ss\n"));
        exit(1);
      }
    }
  }
  fts_close(fts);
  free(path);
  if (ss_next > 0) {
    ss_show = random() % ss_next | 0;
  }
}

export function W_NextScreenShot(w: Ptr | null, x: number, y: number): void {
  ss_init(w);
  if (ss_next === 0) {
    return;
  }
  W_ClearSpriteAbsolute($sadd(ss, ss_show), x, y);
  ++ss_show;
  if (ss_show >= ss_next) {
    ss_show = 0;
  }
  W_DrawSpriteAbsolute($sadd(ss, ss_show), x, y);
}

export function W_DrawScreenShot(w: Ptr | null, x: number, y: number): void {
  ss_init(w);
  if (ss_next === 0) {
    return;
  }
  W_DrawSpriteAbsolute($sadd(ss, ss_show), x, y);
}

export function W_ReadImage(w: Ptr | null, name: Ptr | null): any {
  let drawable = $cast(struct_window, w).drawable;
  let sprite = $cast(struct_S_Object, calloc(1, 56));
  let path = null;
  if (!sprite) {
    return null;
  }
  GetPixmapDir();
  path = P(new Int8Array((strlen(P(pixmapDir)) + strlen(name) + 2)));
  if (!path) {
    free(sprite);
    return null;
  }
  sprintf(path, S("%s/%s"), P(pixmapDir), name);
  if (ReadFileToSprite(path, sprite, drawable)) {
    free(path);
    free(sprite);
    return null;
  }
  free(path);
  return sprite;
}

export function W_DrawImage(x: number, y: number, sprite_v: any): void {
  let sprite = $cast(struct_S_Object, sprite_v);
  if (!sprite) {
    return;
  }
  W_DrawSpriteAbsolute(sprite, x, y);
}

export function W_DropImage(sprite_v: any): void {
  let sprite = $cast(struct_S_Object, sprite_v);
  if (!sprite) {
    return;
  }
  XFreeGC(G.W_Display, sprite.gc);
  XFreePixmap(G.W_Display, sprite.image);
  XFreePixmap(G.W_Display, sprite.shape);
  free(sprite);
}

export function $init(): void {
  G.reremap = $ta(Int32Array, 5, [NO_IND_PIX, NO_FED_PIX, NO_ROM_PIX, NO_KLI_PIX, NO_ORI_PIX]);
  mplanetImg = $sarr(struct_S_Object, 11);
  shipImg = $arr(5, () => $sarr(struct_S_Object, 8));
  torpImg = $arr(5, () => $sarr(struct_S_Object, 2));
  plasmaImg = $arr(5, () => $sarr(struct_S_Object, 2));
  cloakImg = new struct_S_Object();
  explosionImg = $sarr(struct_S_Object, 2);
  backPix = new Float64Array(5);
  G.teamnames = $rows([$cs("Ind", 4),
$cs("Fed", 4),
$cs("Rom", 4),
$cs("Kli", 4),
$cs("Ori", 4)]);
  G.mplanetfiles = $rows([$cs("UNKN.png", 12),
$cs("ROCK.png", 12),
$cs("AGRI.png", 12),
$cs("army.png", 12),
$cs("repair.png", 12),
$cs("fuel.png", 12),
$cs("Ind.png", 12),
$cs("Fed.png", 12),
$cs("Rom.png", 12),
$cs("Kli.png", 12),
$cs("Ori.png", 12)]);
  G.shipfiles = $rows([$cs("SC.png", 8),
$cs("DD.png", 8),
$cs("CA.png", 8),
$cs("BB.png", 8),
$cs("AS.png", 8),
$cs("SB.png", 8),
$cs("GA.png", 8),
$cs("AT.png", 8)]);
  G.torpfiles = $rows([$cs("torp.png", 14), $cs("torp_det.png", 14)]);
  G.plasmafiles = $rows([$cs("plasma.png", 16), $cs("plasma_det.png", 16)]);
  G.cloakfile = $cs("cloak.png", 10);
  G.explosionfiles = $rows([$cs("explosion.png", 18), $cs("sbexplosion.png", 18)]);
  G.bgfiles = $rows([$cs("map_back.png", 16),
$cs("local_back.png", 16),
$cs("ghostbust.png", 16),
$cs("genocide.png", 16),
$cs("hockey.png", 16)]);
  pixmapDir = new Int8Array(1024);
  ss = null;
  ss_size = 0;
  ss_next = 0;
  ss_show = 0;
}
