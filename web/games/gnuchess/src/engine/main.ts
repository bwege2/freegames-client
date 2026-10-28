// Port of src/engine/main.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// main_engine() initialises the engine thread and returns instead of entering loop(): the caller then
// hands every line from the adapter to loop_step() (exported here too).

import type { EngineHost } from '../host.ts';
import { attack_init } from './attack.ts';
import { book_init } from './book.ts';
import { hash_init } from './hash.ts';
import { move_do_init } from './move_do.ts';
import { option_init } from './option.ts';
import { pawn_init_bit } from './pawn.ts';
import { piece_init } from './piece.ts';
import { loop_init } from './protocol.ts';
import { Pst } from './pst.ts';
import { random_init } from './random.ts';
import { search_alloc } from './search.ts';
import { search_full_reset } from './search_full.ts';
import { square_init } from './square.ts';
import { Trans, trans_init } from './trans.ts';
import { my_random_init, set_host } from './util.ts';
import { value_init } from './value.ts';
import { vector_init } from './vector.ts';

export { engine_state, loop_step } from './protocol.ts';

// main()
export function main_engine(host: EngineHost): void {
  set_host(host);
  // the state a new process starts with (the tests start many engines in one process)
  Pst.fill(0);
  search_full_reset();
  search_alloc();
  // init
  my_random_init(); // for opening book
  // early initialisation (the rest is done after UCI options are parsed in protocol.cpp)
  option_init();
  square_init();
  piece_init();
  pawn_init_bit();
  value_init();
  vector_init();
  attack_init();
  move_do_init();
  random_init();
  hash_init();
  trans_init(Trans);
  book_init();
  // loop
  loop_init();
}
