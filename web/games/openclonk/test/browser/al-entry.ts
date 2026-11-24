// Browser side of test/sound.test.ts: src/rt/al.ts and its pointers on the page (bundled by esbuild).
import * as ALM from '../../src/rt/al.ts';
import { Ptr, S } from '../../src/rt/ptr.ts';

(globalThis as unknown as { ocal: unknown }).ocal = { ...ALM, Ptr, S };
