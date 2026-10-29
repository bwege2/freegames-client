// The port set up as re/freecol/oracle/Oracle.java sets up the original: a server for a new single-player
// game, every random source reseeded from one seed, a human seat on a dummy connection that answers
// nothing, the game started (map generated, AI players made). Shared by the tests of steps 2 and 3.
import { bootPort } from './harness.ts';

export async function portNewGame(seed: number, rules: string) {
  const fc = await bootPort();
  const { Random, Locale, Collections } = await import('../src/jre/index.ts');
  const FreeCol = fc.java('net.sf.freecol.FreeCol');
  const FreeColRules = fc.java('net.sf.freecol.common.io.FreeColRules');
  const NameCache = fc.java('net.sf.freecol.common.i18n.NameCache');
  const Messages = fc.java('net.sf.freecol.common.i18n.Messages');
  Messages.loadMessageBundle(Locale.US);
  const spec = FreeCol.loadSpecification(FreeColRules.getFreeColRulesFile(rules), null, 'model.difficulty.medium');
  const random = new Random(seed);
  const server = fc.jnew('net.sf.freecol.server.FreeColServer',
    'boolean,boolean,net.sf.freecol.common.model.Specification,java.net.InetAddress,int,java.lang.String',
    false, true, spec, null, 0, 'oracle');
  server.setServerRandom(random);
  server.getInGameController().setRandom(random);
  NameCache.clearCitiesOfCibola();
  server.setGame(fc.jnew('net.sf.freecol.server.model.ServerGame', 'net.sf.freecol.common.model.Specification,java.util.Random', spec, random));
  server.setMapGenerator(fc.jnew('net.sf.freecol.server.generator.SimpleMapGenerator', 'java.util.Random', random));
  // Collections.shuffle without a Random: seeded as in the oracle
  (Collections as any).r = new Random(seed);

  const DummyConnection = 'net.sf.freecol.server.networking.DummyConnection';
  const toHuman = fc.jnew(DummyConnection, 'java.lang.String', 'Server-to-human');
  toHuman.setMessageHandler(server.getInputHandler());
  const fromHuman = fc.jnew(DummyConnection, 'java.lang.String', 'human-to-Server');
  const state = { onMessage: (_m: any) => {}, fromHuman };
  const handler = fc.$J.lambdaObj((_c: any, m: any) => {
    state.onMessage(m);
    return null;
  }, 'handle', 'net.sf.freecol.common.networking.MessageHandler');
  handler.read = () => null;
  fromHuman.setMessageHandler(handler);
  toHuman.setOtherConnection(fromHuman);
  fromHuman.setOtherConnection(toHuman);
  const FreeColServer$ServerState = fc.java('net.sf.freecol.server.FreeColServer$ServerState');
  const login = fc.jnew('net.sf.freecol.common.networking.LoginMessage',
    'net.sf.freecol.common.model.Player,java.lang.String,java.lang.String,java.lang.String,net.sf.freecol.server.FreeColServer$ServerState,boolean,boolean,net.sf.freecol.common.model.Game',
    null, 'oracle', null, FreeCol.getVersion(), FreeColServer$ServerState.PRE_GAME, true, false, null);
  login.loginHandler(server, toHuman);
  let human: any = null;
  for (const p of server.getGame().getLivePlayerList([])) if (!p.isAI()) human = p;
  server.startGame();
  const FreeColDebugger = fc.java('net.sf.freecol.common.debug.FreeColDebugger');
  const DebugMode = fc.java('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  FreeColDebugger.enableDebugMode(DebugMode.MENUS);
  return { fc, server, human, state };
}

/** The game saved as the oracle saves it (savegame.xml bytes of a .fsg in the virtual file system). */
export async function portSave(fc: any, server: any, name: string): Promise<Uint8Array> {
  const { File } = await import('../src/jre/index.ts');
  server[fc.jmethod('net.sf.freecol.server.FreeColServer', 'saveGame(java.io.File,net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.model.Unit)')](new File('/out/' + name), null, null);
  return fc.vfs.read('/out/' + name);
}

/** Directions the scripted human tries, in order (as re/freecol/oracle/Oracle.java's PREFER). */
const PREFER = ['W', 'SW', 'NW', 'S', 'N', 'SE', 'NE', 'E'];

/**
 * Plays a new game as the oracle plays it: every turn is saved (save(turn, .fsg bytes)) when it begins,
 * until TURNS or until save returns false. The human seat skips its turns, or with script plays as Oracle.java's humanTurn: each
 * unit by id (units aboard after their carrier) takes up to four steps, a colonist on land founds a
 * colony where it may, then the turn ends; all through the client's messages.
 */
export async function portPlay(g: Awaited<ReturnType<typeof portNewGame>>, turns: number, script: boolean,
  save: (turn: number, fsg: Uint8Array) => boolean | void): Promise<void> {
  const { fc, server, human, state } = g;
  const { $J, File } = await import('../src/jre/index.ts');
  const { serverRequest } = await import('../src/port/threads.ts');
  const game = server.getGame();
  const saveGame = fc.jmethod('net.sf.freecol.server.FreeColServer', 'saveGame(java.io.File,net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.model.Unit)');
  const Direction = fc.java('net.sf.freecol.common.model.Direction');
  const MoveType = fc.java('net.sf.freecol.common.model.Unit$MoveType');
  const Connection = fc.java('net.sf.freecol.common.networking.Connection');
  const getTile = fc.jmethod('net.sf.freecol.common.model.Unit', 'getTile()');
  const getMoveType = fc.jmethod('net.sf.freecol.common.model.Unit', 'getMoveType(net.sf.freecol.common.model.Direction)');
  const ask = (m: any) => state.fromHuman.askMessage(m, Connection.DEFAULT_REPLY_TIMEOUT);
  const byId = (a: any, b: any) => (a.getId() < b.getId() ? -1 : a.getId() > b.getId() ? 1 : 0);

  const humanUnit = (u: any) => {
    for (let step = 0; step < 4; step++) {
      if (u.isDisposed() || u.getMovesLeft() <= 0) return;
      const t = u[getTile]();
      if (t == null || u.isInColony()) return;
      if (!u.isNaval() && u.getLocation() === t && u.isColonist() && human.canClaimToFoundSettlement(t)) {
        ask(fc.jnew('net.sf.freecol.common.networking.BuildColonyMessage', 'java.lang.String,net.sf.freecol.common.model.Unit', human.getSettlementName(null), u));
        return;
      }
      let d: any = null;
      for (const x of PREFER) {
        const mt = u[getMoveType](Direction[x]);
        if (mt === MoveType.MOVE || mt === MoveType.MOVE_HIGH_SEAS) {
          d = Direction[x];
          break;
        }
      }
      if (d == null) return;
      ask(fc.jnew('net.sf.freecol.common.networking.MoveMessage', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction', u, d));
    }
  };
  const humanTurn = () => {
    const units = [...human.getUnitSet()].sort(byId);
    for (const u of units) {
      humanUnit(u);
      for (const c of [...u.getUnitList()].sort(byId)) humanUnit(c);
    }
    ask(fc.jnew('net.sf.freecol.common.networking.EndTurnMessage', ''));
  };

  let finish!: () => void, fail!: (e: any) => void;
  const finished = new Promise<void>((res, rej) => {
    finish = res;
    fail = rej;
  });
  // the game's threads, as Oracle.java's one AI thread; stopped at the end; an error ends the game
  let stopped = false;
  const startThread = $J.startThread;
  $J.startThread = (t: any) => queueMicrotask(() => {
    if (stopped) return;
    try {
      t.run();
    } catch (e) {
      stopped = true;
      fail(e);
    }
  });
  const task = (f: () => void) => $J.startThread({ run: () => serverRequest(f) });
  const saveTurn = (t: number) => {
    server[saveGame](new File('/out/turn.fsg'), null, null);
    const more = save(t, fc.vfs.read('/out/turn.fsg')!);
    if (t >= turns || more === false) {
      stopped = true;
      finish();
    }
  };
  let last = game.getTurn().getNumber();
  let scripted = -1;
  state.onMessage = () => {
    if (stopped) return;
    const t = game.getTurn().getNumber();
    if (t !== last) {
      last = t;
      saveTurn(t);
    }
    if (script && !stopped && t !== scripted && game.getCurrentPlayer() === human) {
      scripted = t;
      task(humanTurn);
    }
  };
  saveTurn(last);
  if (script) {
    scripted = last;
    task(humanTurn);
  } else {
    server.getInGameController().setSkippedTurns(turns + 1000);
    task(() => server.getInGameController().endTurn(human));
  }
  try {
    await finished;
  } finally {
    stopped = true;
    await new Promise((r) => setImmediate(r)); // the tasks still queued see stopped and end
    $J.startThread = startThread;
  }
}
