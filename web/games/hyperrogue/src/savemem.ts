// savemem.cpp of HyperRogue 13.1o: memory saving (memory saving mode, memory warnings). Package P5.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The memory reserve (CAP_MEMORY_RESERVE, 1 in the desktop build) allocates blocks of 1 MB so that running out
// of memory can be noticed; the browser has no new_handler, so every reserve block "succeeds": reserve_count
// reaches reserve_limit and the warnings never show. show_memory_menu (the dialog) was added by U4.
import { BARLEV, celldist, destroy_cell } from './cell.ts';
import { BITRUNCATED, hyperbolic, NONSTDVAR, quotient, S7 } from './classes.ts';
import { itNone, laCaribbean, laGraveyard, laMemory, laOcean, laPrincessQuest, moNone, waChasm } from './content.ts';
import { pushScreen } from './control.ts';
import { is_paired, isCyclic, isGravityLand, isHaunted, isMultitile } from './flags.ts';
import { G } from './globals.ts';
import { among, callhooks } from './hyper.ts';
import { add_heptacount, cell, heptagon } from './locations.ts';

export const PSEUDOKEY_MEMORY = 16397;

const LIM = 150;

export function destroycellcontents(c: cell): void {
  c.land = laMemory;
  c.wall = waChasm;
  c.item = itNone;
  if (!isMultitile(c.monst) && !is_paired(c.monst))
    c.monst = moNone;
}

function degrade(c: cell): void {
  c.mpdist++;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (c2.mpdist < c.mpdist - 1)
      degrade(c2);
  }
  destroycellcontents(c);
}

function slow_delete_cell(c: cell): void {
  while (c.mpdist < BARLEV())
    degrade(c);
  for (let i = 0; i < c.type; i++)
    if (c.move(i))
      c.move(i).setMove(c.c.spin(i), null);
  G.removed_cells.push(c);
  destroy_cell(c);
}

function delete_heptagon(h2: heptagon): void {
  const c = h2.c7;
  if (BITRUNCATED()) {
    for (let i = 0; i < c.type; i++)
      if (c.move(i))
        slow_delete_cell(c.move(i));
  }
  slow_delete_cell(c);
  for (let i = 0; i < S7(); i++)
    if (h2.move(i))
      h2.move(i).setMove(h2.c.spin(i), null);
  // tailored_delete(h2): ~heptagon() { heptacount--; }
  add_heptacount(-1);
}

function recursive_delete(h: heptagon, i: number): void {
  const h2 = h.move(i);
  {
    for (let j = 1; j < S7(); j++)
      if (h2.move(j) && h2.move(j).move(0) === h2)
        recursive_delete(h2, j);
  }
  if (h2.alt && h2.alt.alt === h2.alt) {
    // DEBB(debug_memory, ("destroying alternate map ", h2->alt));
    const allmaps = G.allmaps;
    for (let k = 0; k < allmaps.length; k++) {
      const hm = allmaps[k];
      if (hm.getOrigin() === h2.alt) {
        hm.destroy();
        allmaps[k] = allmaps[allmaps.length - 1];
        allmaps.pop();
        // DEBB(debug_memory, ("map found (", isize(allmaps), " altmaps total)"));
        break;
      }
    }
  }
  if (h2.alt) {
    h2.alt.cdata = null;
    h2.alt.cdata_orig = null;
  }
  delete_heptagon(h2);
  h.setMove(i, null);
}

function unsafeLand(c: cell): boolean {
  return isCyclic(c.land) || isGravityLand(c.land) || isHaunted(c.land) ||
    among(c.land, laCaribbean, laOcean, laGraveyard, laPrincessQuest);
}

export function save_memory(): void {
  if (quotient() || !hyperbolic() || NONSTDVAR()) return;
  if (!G.memory_saving_mode) return;
  if (unsafeLand(G.cwt.at)) return;
  const d = celldist(G.cwt.at);
  if (d < LIM + 10) return;

  let at = G.cwt.at.master;
  const orig = G.currentmap.gamestart().master;

  if (G.recallCell.at) {
    if (unsafeLand(G.recallCell.at)) return;
    let at2 = G.recallCell.at.master;
    let t = 0;
    while (at !== at2) {
      t++; if (t > 10000) return;
      if (celldist(at.c7) > celldist(at2.c7))
        at = at.move(0);
      else
        at2 = at2.move(0);
    }
  }

  while (celldist(at.c7) > d - LIM && at !== orig) at = at.move(0);

  // make sure it is not the same altmap
  let atalt = at.alt; if (atalt) atalt = atalt.alt;
  while (atalt && at !== orig && at.alt && at.alt.alt === atalt) at = at.move(0);

  // go back to such a point X that all the heptagons adjacent to the current 'at'
  // are the children of X. This X becomes the new 'at'
  {
    const allh: heptagon[] = [];
    let hcount = 0;
    allh[hcount++] = at;
    for (let j = 0; j < S7(); j++)
      if (allh[0].move(j))
        allh[hcount++] = at.move(j);

    let deuniq_steps = 0;

    let i = 1;
    while (i < hcount) {
      if (allh[i] === allh[0]) {
        allh[i] = allh[hcount - 1]; hcount--;
      }
      else if (celldist(allh[i].c7) > celldist(allh[0].c7))
        allh[i] = allh[i].move(0);
      else {
        if (allh[0] === orig) return;
        allh[0] = allh[0].move(0);
        i = 1;
        deuniq_steps++;
        if (deuniq_steps === 10) return;
      }
    }

    at = allh[0];
  }

  if (G.last_cleared && celldist(at.c7) < celldist(G.last_cleared.c7))
    return;

  // DEBB(debug_memory, ("celldist = ", make_pair(celldist(cwt.at), celldist(at->c7))));

  const at1 = at;
  while (at !== G.last_cleared && at !== orig) {
    const atn = at;
    at = at.move(0);

    for (let i = 1; i < S7(); i++)
      if (at.move(i) && at.move(i) !== atn)
        recursive_delete(at, i);
  }

  G.last_cleared = at1;
  // DEBB(debug_memory, ("current cellcount = ", cellcount));

  // sort(removed_cells.begin(), removed_cells.end()): by address (the creation serial, PORTING.md)
  G.removed_cells.sort((a, b) => a._id - b._id);
  callhooks(G.hooks_removecells);
  G.removed_cells.length = 0;
}

/** binary_search(removed_cells.begin(), removed_cells.end(), c) */
export function is_cell_removed(c: cell): boolean {
  if (!c) return false; // NULL is below every cell address
  const rc = G.removed_cells;
  let lo = 0, hi = rc.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rc[mid]._id < c._id) lo = mid + 1; else hi = mid;
  }
  return lo < rc.length && rc[lo] === c;
}

/** void set_if_removed(cell*& c, cell *val): the reference is (obj, key) */
export function set_if_removed<O, K extends keyof O>(obj: O, key: K, val: cell): void {
  if (is_cell_removed(obj[key] as unknown as cell)) obj[key] = val as unknown as O[K];
}

const max_reserve = 4096;

export function apply_memory_reserve(): void {
  // if(reserve_count > 0) std::set_new_handler(default_handler);
  if (G.reserve_limit > max_reserve) G.reserve_limit = max_reserve;
  if (G.reserve_limit < 0) G.reserve_limit = 0;
  while (G.reserve_count > G.reserve_limit) { G.reserve_count--; }
  while (G.reserve_count < G.reserve_limit) {
    // reserve[reserve_count] = new reserve_block; (always succeeds in the browser)
    G.reserve_count++;
  }
  // default_handler = std::get_new_handler(); if(reserve_count > 0) std::set_new_handler(reserve_handler);
}

export function memory_for_lib(): void {
  if (G.reserve_count) { G.reserve_count--; }
}

/** EX void show_memory_menu() (added by U4: the configuration's "memory configuration") */
export function show_memory_menu(): void {
  gamescreen();
  dialog_init_t(XLAT('memory'));

  dialog_addHelp_s(XLAT(
    'HyperRogue takes place in a world that is larger than anything Euclidean. ' +
    'Unfortunately, in some cases running it on an Euclidean computer might be ' +
    'a problem -- the computer could simply run out of memory. Some lands (such as the Ocean or the Brown Islands) ' +
    'may use up memory very fast!\n\n',
  ));

  // if(sizeof(void*) <= 4): "You are playing a 32-bit HyperRogue executable..." (the desktop build is 64-bit)

  dialog_addHelp_s(XLAT(
    'Although you are extremely unlikely to return to a place you have already been to, ' +
    'the game never forgets these areas, unless you start a new game, use an Orb of ' +
    'Safety (found in Land of Eternal Motion, the Prairie, and the Ocean), or activate the memory ' +
    'saving mode, which tries to intelligently predict which cells you will never find ' +
    'again and can be safely forgotten.\n\n'),
  );

  if (G.cheater) dialog_addSelItem(XLAT('cells in memory'), its(G.cellcount) + '+' + its(G.heptacount), 0);

  dialog_addBoolItem(XLAT('memory saving mode'), G.memory_saving_mode, 'f'.charCodeAt(0));
  dialog_add_action(() => { G.memory_saving_mode = !G.memory_saving_mode; if (G.memory_saving_mode) { save_memory(); apply_memory_reserve(); } });

  dialog_addBoolItem_action(XLAT('show memory warnings'), { get v() { return G.show_memory_warning; }, set v(x: boolean) { G.show_memory_warning = x; } }, 'w'.charCodeAt(0));

  // CAP_MEMORY_RESERVE
  if (G.reserve_limit > 0 && G.reserve_count < G.reserve_limit) {
    dialog_addItem(XLAT('just let me find Orb of Safety or finish the game'), 'l'.charCodeAt(0));
    dialog_add_action(() => { G.ignored_memory_warning = true; popScreen(); });
  }

  dialog_addSelItem('memory reserve', its(G.reserve_count) + '/' + its(G.reserve_limit) + ' MB', 'r'.charCodeAt(0));
  dialog_add_action(() => {
    dialog_editNumber_n({ get v() { return G.reserve_limit; }, set v(x: number) { G.reserve_limit = x; } }, 0, max_reserve, 16, 128, XLAT('memory reserve'),
      XLAT('When to show a memory warning.'),
    );
    dialog_bound_low(0);
    dialog_bound_up(max_reserve);
    dialog_get_di().reaction = apply_memory_reserve;
  });

  dialog_addItem(XLAT('clear caches'), 'c'.charCodeAt(0));
  dialog_add_action(() => { callhooks(G.hooks_clear_cache); });

  dialog_addBack();
  dialog_display();
}
import { gamescreen, popScreen } from './graph.ts';
import { XLAT } from './language.ts';
import { its } from './hprint.ts';
import {
  dialog_init_t, dialog_addHelp_s, dialog_addSelItem, dialog_addBoolItem, dialog_add_action, dialog_addBoolItem_action,
  dialog_addItem, dialog_editNumber_n, dialog_bound_low, dialog_bound_up, dialog_get_di, dialog_addBack, dialog_display,
} from './dialogs.ts';

export function protect_memory(): boolean {
  apply_memory_reserve();
  if (G.reserve_limit && G.reserve_count < G.reserve_limit && !G.ignored_memory_warning) {
    pushScreen(show_memory_menu);
    return true;
  }
  if (G.reserve_limit && G.reserve_count < 8) {
    pushScreen(show_memory_menu);
    return true;
  }
  return false;
}

export function memory_issues(): boolean {
  return !!G.reserve_limit && G.reserve_count < 16;
}
