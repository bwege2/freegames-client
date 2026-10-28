// The ported adapter (src/adapter, PolyGlot 1.4 as GNU Chess 6.3.0 has it) driven through its two pipes,
// with a scripted engine (test/adapter/harness.ts). Where the oracle (GNU Chess 6.3.0 built natively,
// re/gnuchess/oracle) shows what the adapter prints, the expectation is taken from its goldens
// (test/golden/sessions/adapter-*.json): the frontend prints the adapter's lines as they come.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Session } from './adapter/harness.ts';
import { bytes } from '../src/libc.ts';

const golden = (name: string) =>
   JSON.parse(readFileSync(join(import.meta.dirname, 'golden', 'sessions', `${name}.json`), 'utf8')) as {
      stdout: string;
      stderr: string;
      files: Record<string, string>;
      written: Record<string, string>;
   };

/** a stub engine that answers every "go" (not "go ... ponder") with the next of these moves ("move:ponder") */
const plays = (...moves: string[]) => (_pos: string, go: string) => {
   if (go.includes('ponder')) return [];
   const [move, ponder] = (moves.shift() ?? '').split(':');
   return [`info depth 1 seldepth 1 score cp 0 time 0 nodes 1 pv ${move}`, ponder ? `bestmove ${move} ponder ${ponder}` : `bestmove ${move}`];
};

test('startup: no gnuchess.ini, "uci" handshake, then isready', () => {
   const s = new Session().start();
   assert.equal(s.stderr, 'Can\'t open file "(null)": Bad address - using defaults\n');
   assert.equal(s.stderr, golden('adapter-commands').stderr);
   assert.deepEqual(s.takeEngine(), ['uci', 'isready']);
   assert.ok(s.initialized);
   assert.equal(s.take(), '');
});

test('frontend lines that arrive before "uciok" wait in their pipe', () => {
   const s = new Session({ uci: [] }); // the engine does not answer "uci" by itself
   s.start();
   assert.ok(!s.initialized);
   s.send('ping 1');
   assert.equal(s.take(), '');
   // now the engine answers
   s.engine_reply_uci();
   assert.ok(s.initialized);
   assert.equal(s.take(), 'pong 1\n');
});

test('protover 2: the feature list, as the oracle prints it', () => {
   const s = new Session().start();
   s.send('protover 2');
   const out = s.take();
   assert.ok(out.startsWith('feature done=0\n') && out.endsWith('feature variants="normal"\nfeature done=1\n'));
   assert.ok(golden('adapter-commands').stdout.includes(out));
});

test('memory, memory N (which resends "uci"), ping, commands without their argument', () => {
   const s = new Session().start();
   s.takeEngine();
   s.send('memory');
   assert.equal(s.take(), 'Current HashSize is 16 MB\n');
   s.send('memory 32');
   assert.deepEqual(s.takeEngine(), ['setoption name Hash value 32', 'uci']);
   s.send('memory');
   assert.equal(s.take(), 'Current HashSize is 32 MB\n');
   s.send('ping 7');
   assert.equal(s.take(), 'pong 7\n');
   const g = golden('adapter-commands').stdout;
   for (const cmd of ['ping', 'accepted', 'time', 'otim', 'level', 'ics', 'result', 'book ']) {
      s.send(cmd);
      const out = s.take();
      assert.equal(out, `Error (unknown command): ${cmd}\n`);
      assert.ok(g.includes(out), cmd);
   }
   s.send('hashoff');
   s.send('hashon');
   s.send('nulloff');
   s.send('nullon');
   // "memory 32" made the adapter send "uci" again and read the engine's options a second time
   // (uci.cpp parse_option() adds them to its list again): every setoption now goes out twice
   assert.deepEqual(s.takeEngine(), ['hashoff', 'hashon',
      'setoption name NullMove Pruning value Never', 'setoption name NullMove Pruning value Never',
      'setoption name NullMove Pruning value Always', 'setoption name NullMove Pruning value Always']);
});

test('a move starts the engine: setoption Ponder, position, go with the clocks; the reply is played', () => {
   const s = new Session({ go: (_p, go) => (go.includes('ponder') ? [] : ['info depth 1 seldepth 1 score cp 10 time 0 nodes 20 pv e7e5 g1f3', 'bestmove e7e5 ponder g1f3']) }).start();
   s.takeEngine();
   s.send('e2e4');
   assert.equal(s.take(), 'move e7e5\n');
   assert.deepEqual(s.takeEngine(), [
      'setoption name Ponder value true',
      'position startpos moves e2e4',
      'go wtime 300000 btime 300000',
      // the engine's expected move: ponder on it
      'position startpos moves e2e4 e7e5 g1f3',
      'go wtime 300000 btime 300000 ponder',
   ]);
   // the expected move: ponderhit, no new search
   s.send('g1f3');
   assert.deepEqual(s.takeEngine(), ['ponderhit']);
});

test('a ponder miss stops the ponder search and starts a new one', () => {
   const s = new Session({ go: plays('e7e5:g1f3', 'd7d5:c2c4') }).start();
   s.send('level 40 5 0');
   s.takeEngine();
   s.send('e2e4');
   assert.equal(s.take(), 'move e7e5\n');
   assert.deepEqual(s.takeEngine(), [
      'setoption name Ponder value true',
      'position startpos moves e2e4',
      'go wtime 300000 btime 300000 movestogo 40',
      'position startpos moves e2e4 e7e5 g1f3',
      'go wtime 300000 btime 300000 movestogo 39 ponder',
   ]);
   s.send('d2d4');
   assert.equal(s.take(), 'move d7d5\n');
   assert.deepEqual(s.takeEngine(), [
      'stop',
      'position startpos moves e2e4 e7e5 d2d4',
      'go wtime 300000 btime 300000 movestogo 39',
      'position startpos moves e2e4 e7e5 d2d4 d7d5 c2c4',
      'go wtime 300000 btime 300000 movestogo 38 ponder',
   ]);
});

test('easy: no pondering; sd, st, time, otim and level go into "go"', () => {
   const s = new Session({ go: plays('e7e5:g1f3', 'd7d5') }).start();
   s.send('easy');
   s.send('sd 4');
   s.send('time 12345');
   s.send('otim 6789');
   s.send('level 0 2:30 5');
   s.takeEngine();
   s.send('e2e4');
   assert.deepEqual(s.takeEngine(), ['position startpos moves e2e4', 'go wtime 67890 btime 123450 winc 5000 binc 5000 depth 4']);
   s.send('st 7');
   s.send('d2d4');
   assert.deepEqual(s.takeEngine(), ['position startpos moves e2e4 e7e5 d2d4', 'go movetime 7000 depth 4']);
});

test('post: the thinking lines (send_pv), in SAN', () => {
   const replies = [['info depth 2 seldepth 3 score cp -34 time 10 nodes 119 pv b8c6 b1c3', 'bestmove b8c6 ponder b1c3'], ['bestmove d7d5']];
   const s = new Session({ go: () => replies.shift() ?? [] }).start();
   s.send('easy');
   s.send('post');
   s.send('e2e4');
   assert.equal(s.take(), '2 -34 1 119 Nc6 Nc3\n2 -34 1 119 Nc6 Nc3\nmove b8c6\n');
   s.send('nopost');
   s.send('d2d4');
   assert.equal(s.take(), 'move d7d5\n');
});

test('game ends after setboard and moves, as the oracle prints them (game_comp_status)', () => {
   const s = new Session().start();
   s.send('easy');
   s.send('sd 2');
   const g = golden('adapter-gameend').stdout;
   const cases: [string, string][] = [
      ['rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3', '0-1 {Black mates}\n'],
      ['7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', '1/2-1/2 {Stalemate}\n'],
      ['8/8/4k3/8/8/4K3/8/8 w - - 0 1', '1/2-1/2 {Draw by insufficient material}\n'],
      ['8/8/4k3/8/8/4K3/8/4N3 w - - 0 1', '1/2-1/2 {Draw by insufficient material}\n'],
      ['5b2/8/4k3/8/8/4K3/8/2B5 w - - 0 1', '1/2-1/2 {Draw by insufficient material}\n'],
      ['2b5/8/4k3/8/8/4K3/8/2B5 w - - 0 1', ''],
      ['8/8/4k3/8/8/4K3/4R3/8 w - - 100 80', '1/2-1/2 {Draw by fifty-move rule}\n'],
   ];
   for (const [fen, end] of cases) {
      s.send(`setboard ${fen}`);
      assert.equal(s.take(), end, fen);
      assert.ok(g.includes(end), end);
   }
   // a repetition in force mode
   s.send('new');
   s.send('force');
   const moves = ['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8'];
   for (let i = 0; i < moves.length; i++) {
      s.send(moves[i]);
      assert.equal(s.take(), i === 7 ? '1/2-1/2 {Draw by repetition}\n' : '', moves[i]);
   }
   assert.ok(g.includes('1/2-1/2 {Draw by repetition}\n'));
});

test('the engine mates: "move", then the result', () => {
   const s = new Session({ go: plays('a1a8') }).start();
   s.send('easy');
   s.send('setboard 6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1');
   s.send('go');
   assert.equal(s.take(), 'move a1a8\n1-0 {White mates}\n');
   assert.ok(golden('adapter-gameend').stdout.includes('1-0 {White mates}\n'));
});

test('force and undo (what the frontend sends for undo), go, remove: the state machine', () => {
   const s = new Session({ go: plays('e7e5', 'g1f3', 'd2d4', 'e2e4') }).start();
   s.send('easy');
   s.send('e2e4');
   assert.equal(s.take(), 'move e7e5\n');
   s.takeEngine();
   s.send('force');
   s.send('undo');
   s.send('force');
   s.send('undo');
   assert.deepEqual(s.takeEngine(), []);
   // back at the start: "go" gives the engine white
   s.send('go');
   assert.equal(s.take(), 'move g1f3\n');
   assert.deepEqual(s.takeEngine(), ['position startpos', 'go wtime 300000 btime 300000']);
   s.send('b8c6');
   assert.equal(s.take(), 'move d2d4\n');
   // remove: two plies back, black to move again, the engine (white) waits
   s.takeEngine();
   s.send('remove');
   assert.deepEqual(s.takeEngine(), []);
   s.send('g8f6');
   assert.equal(s.take(), 'move e2e4\n');
   assert.deepEqual(s.takeEngine(), ['position startpos moves g1f3 g8f6', 'go wtime 300000 btime 300000']);
});

test('usermove MOVE, and result: the game ends, the next move starts it again (oracle: adapter-result)', () => {
   const g = golden('adapter-result');
   const s = new Session({ go: plays('b8c6', 'd7d5') }).start();
   s.send('easy');
   s.send('sd 2');
   s.send('usermove e2e4');
   assert.equal(s.take(), 'move b8c6\n');
   s.takeEngine();
   s.send('result 1-0 {White resigns}');
   assert.equal(s.take(), '');
   assert.deepEqual(s.takeEngine(), []);
   s.send('usermove d2d4');
   assert.equal(s.take(), 'move d7d5\n');
   for (const san of ['Nc6', 'd5']) assert.ok(g.stdout.includes(`My move is : ${san}\n`));
});

test('book on, bk and hint with the package book, as the oracle prints them', () => {
   const g = golden('adapter-book');
   const s = new Session({ time: 1000000000, go: plays('b8c6', 'a7a6') }).start();
   s.send('easy');
   s.send('sd 2');
   s.send('bk');
   s.send('hint');
   assert.equal(s.stdout + s.take(), ''); // no book yet
   s.send('book on');
   s.send('bk');
   const list = s.stdout;
   s.stdout = '';
   assert.equal(list, ' e4 (60%)\n d4 (27%)\n Nf3 (6%)\n c4 (6%)\n g3 (1%)\n b3 (0%)\n b4 (0%)\n\n');
   assert.ok(g.stdout.includes(list));
   s.send('hint');
   assert.equal(s.take(), 'Hint: e4\n');
   // the engine's reply is a random book move: srand(time(NULL)) with time 1000000000
   s.send('e2e4');
   assert.equal(s.take(), 'move e7e6\n');
   assert.ok(g.stdout.includes('My move is : e6\n'));
   s.send('bk');
   assert.equal(s.stdout, ' d4 (100%)\n\n');
   assert.ok(g.stdout.includes(' d4 (100%)\n\n'));
   s.stdout = '';
   s.send('hint');
   assert.equal(s.take(), 'Hint: d4\n');
   // out of the book: the engine searches (the oracle's engine played Nc6)
   s.send('g1f3');
   assert.equal(s.take(), 'move b8c6\n');
   s.send('bk');
   assert.equal(s.stdout, '\n');
});

test('another seed, another book choice (oracle: adapter-book-seed)', () => {
   const g = golden('adapter-book-seed');
   const s = new Session({ time: 1234567890, go: plays('a8a7') }).start();
   s.send('easy');
   s.send('sd 2');
   s.send('book on');
   const replies: string[] = [];
   for (const m of ['e2e4', 'g1f3', 'f1b5']) {
      s.send(m);
      replies.push(s.take());
   }
   assert.deepEqual(replies, ['move e7e5\n', 'move b8c6\n', 'move a7a6\n']);
   for (const san of ['e5', 'Nc6', 'a6']) assert.ok(g.stdout.includes(`My move is : ${san}\n`));
});

test('book best, worst, random (which sets nothing), prefer and off (oracle: adapter-book-modes)', () => {
   const g = golden('adapter-book-modes');
   const s = new Session({ time: 1000000000, go: plays('b8c6', 'd8a5') }).start();
   s.send('easy');
   s.send('sd 2');
   s.send('book on');
   s.send('book best');
   s.send('e2e4');
   assert.equal(s.take(), 'move c7c5\n');
   s.send('book worst');
   s.send('g1f3');
   assert.equal(s.take(), 'move g7g6\n');
   s.send('book random');
   s.send('f1b5'); // out of the book: the oracle's engine played Nc6
   assert.equal(s.take(), 'move b8c6\n');
   s.send('book on');
   s.send('bk');
   assert.equal(s.stdout, ' O-O (100%)\n\n');
   assert.ok(g.stdout.includes(' O-O (100%)\n\n'));
   s.stdout = '';
   s.takeEngine();
   s.send('book off');
   assert.deepEqual(s.takeEngine(), []); // OwnBook is already false in the engine
   s.send('bk');
   s.send('hint');
   assert.equal(s.stdout + s.take(), '');
   for (const san of ['c5', 'g6', 'Nc6']) assert.ok(g.stdout.includes(`My move is : ${san}\n`));
});

test('book add: book_make writes the book.bin the oracle writes, byte for byte', () => {
   const g = golden('adapter-bookadd');
   const files = new Map<string, Uint8Array>([['small.pgn', bytes(g.files['small.pgn'])]]);
   const s = new Session({ files }).start();
   s.send('easy');
   s.send('book add small.pgn');
   assert.equal(s.stdout, 'inserting games ...\n7 games.\n21 entries.\nfiltering entries ...\n6 entries.\nsorting entries ...\nsaving entries ...\nall done!\n');
   assert.ok(g.stdout.includes(s.stdout));
   assert.equal(s.file('book.bin'), g.written['book.bin']);
});

test('a bad FEN in setboard: fen_fatal, and the second error of the process exits', () => {
   const s = new Session().start();
   s.send('setboard rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNX w KQkq - 0 1');
   assert.equal(s.stderr, 'Can\'t open file "(null)": Bad address - using defaults\n'
      + 'board_from_fen(): bad FEN (a piece was expected at pos=42)\n'
      + 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNX w KQkq - 0 1\n'
      + '                                          *\n');
   assert.equal(s.exit, 1);
   assert.ok(s.exited);
});

test('gnuchess.ini in $XDG_CONFIG_HOME/gnuchess/: no error, its options are used', () => {
   const ini = '[Adapter]\n\nBook = true # use the book\nResign = true\n\n[Engine]\n\nHash = 32\nOwnBook = false\n';
   const files = new Map<string, Uint8Array>([['/cfg/gnuchess/gnuchess.ini', bytes(ini)]]);
   const s = new Session({ files, env: { XDG_CONFIG_HOME: '/cfg', HOME: '/home/user' } }).start();
   assert.equal(s.stderr, '');
   assert.deepEqual(s.takeEngine(), ['uci', 'setoption name Hash value 32', 'isready']);
   s.send('memory');
   assert.equal(s.take(), 'Current HashSize is 32 MB\n');
   s.send('hint'); // Book = true: the book was opened at startup
   assert.equal(s.take(), 'Hint: e4\n');
});
