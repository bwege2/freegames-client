import java.io.File;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.concurrent.CountDownLatch;

import net.sf.freecol.FreeCol;
import net.sf.freecol.common.debug.FreeColDebugger;
import net.sf.freecol.common.i18n.Messages;
import net.sf.freecol.common.i18n.NameCache;
import net.sf.freecol.common.io.FreeColDirectories;
import net.sf.freecol.common.io.FreeColModFile;
import net.sf.freecol.common.io.FreeColRules;
import net.sf.freecol.common.model.Direction;
import net.sf.freecol.common.model.Player;
import net.sf.freecol.common.model.Tile;
import net.sf.freecol.common.model.Unit;
import net.sf.freecol.common.networking.BuildColonyMessage;
import net.sf.freecol.common.model.Specification;
import net.sf.freecol.common.networking.Connection;
import net.sf.freecol.common.networking.EndTurnMessage;
import net.sf.freecol.common.networking.LoginMessage;
import net.sf.freecol.common.networking.Message;
import net.sf.freecol.common.networking.MessageHandler;
import net.sf.freecol.common.networking.MoveMessage;
import net.sf.freecol.server.FreeColServer;
import net.sf.freecol.server.generator.SimpleMapGenerator;
import net.sf.freecol.server.model.ServerGame;
import net.sf.freecol.server.model.ServerPlayer;
import net.sf.freecol.server.networking.DummyConnection;

/**
 * The server oracle (first version, Phase 1 measurements): the original FreeCol 1.2.0 server, in
 * process and headless, as its own "debug run" plays it (FreeColDebugger --debug-run: the human seat
 * skips its turns, InGameController.setSkippedTurns, and every other nation is played by the
 * original AI). The human seat is a DummyConnection, as the server gives its AI players.
 *
 * The original seeds a new game from new Random() (FreeColServer's new-game constructor ignores
 * --seed, which only reseeds loaded games). Here the server random, the in-game controller, the map
 * generator and the game (and NameCache's static cities of Cibola) are all reseeded from SEED, so
 * that one SEED gives one game: two runs give the same savegame.xml turn by turn (but for the save
 * date and the game's UUID).
 *
 * With HUMAN "script" the human seat plays instead of skipping its turns: the same few moves as
 * web/games/freecol/test/play.test.ts makes, through the messages the client sends (move, build a
 * colony, end the turn), so that the server's handling of a player's commands is compared too.
 *
 * Writes OUT/turnNNN.fsg at the start of every turn and prints wall time and live heap per turn.
 *   java -cp FreeCol.jar:CLASSES Oracle DATA_DIR OUT_DIR SEED TURNS [rules [script]]
 */
public class Oracle {
    static ServerPlayer human;
    static FreeColServer server;
    static int turns;
    static volatile int lastTurn;
    static volatile boolean started;
    static File out;
    static final CountDownLatch done = new CountDownLatch(1);
    static long tPrev = System.nanoTime();
    static boolean script;
    static int scriptedTurn = -1;
    static DummyConnection fromHuman;

    public static void main(String[] a) throws Exception {
        try {
            run(a);
        } catch (Throwable t) {
            t.printStackTrace();
            System.exit(2);
        }
        System.exit(0);
    }

    static void run(String[] a) throws Exception {
        String data = a[0];
        out = new File(a[1]);
        long seed = Long.parseLong(a[2]);
        turns = Integer.parseInt(a[3]);
        String rules = a.length > 4 ? a[4] : "freecol";
        script = a.length > 5 && a[5].equals("script");
        // -Doracle.log=FILE: every log record of the game, to find where the port first goes another way
        String logFile = System.getProperty("oracle.log");
        if (logFile != null) {
            java.util.logging.Logger root = java.util.logging.Logger.getLogger("");
            for (java.util.logging.Handler h : root.getHandlers()) root.removeHandler(h);
            final java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter(logFile), true);
            root.setLevel(java.util.logging.Level.ALL);
            root.addHandler(new java.util.logging.Handler() {
                @Override public void publish(java.util.logging.LogRecord r) {
                    pw.println(r.getLevel().getName() + " " + r.getLoggerName() + ": " + r.getMessage()
                        + (r.getThrown() != null ? " [" + r.getThrown() + "]" : ""));
                }
                @Override public void flush() { pw.flush(); }
                @Override public void close() { pw.close(); }
            });
        }
        for (String d : new String[] { "c", "d", "k" }) new File(out, d).mkdirs();
        FreeColDirectories.setDataDirectory(data);
        FreeColDirectories.setUserConfigDirectory(new File(out, "c").getPath());
        FreeColDirectories.setUserDataDirectory(new File(out, "d").getPath());
        FreeColDirectories.setUserCacheDirectory(new File(out, "k").getPath());
        FreeColDirectories.setUserDirectories();
        Messages.loadMessageBundle(Locale.US);
        FreeColRules.loadRules();
        FreeColModFile rf = FreeColRules.getFreeColRulesFile(rules);
        Specification spec = FreeCol.loadSpecification(rf, null, "model.difficulty.medium");

        // Port 0: the server's listening socket takes a free port (nothing connects to it).
        Random random = new Random(seed);
        server = new FreeColServer(false, true, spec, null, 0, "oracle");
        server.setServerRandom(random);
        server.getInGameController().setRandom(random);
        NameCache.clearCitiesOfCibola(); // static; the constructor above filled it unseeded
        server.setGame(new ServerGame(spec, random));
        server.setMapGenerator(new SimpleMapGenerator(random));
        // Collections.shuffle(list) without a Random uses one seeded from the clock (the AI's buyShip,
        // NameCache's river names): seeded here too (needs --add-opens java.base/java.util)
        java.lang.reflect.Field cr = java.util.Collections.class.getDeclaredField("r");
        cr.setAccessible(true);
        cr.set(null, new Random(seed));

        // The human seat: a dummy connection that answers nothing and notes each new turn.
        DummyConnection toHuman = new DummyConnection("Server-to-human");
        toHuman.setMessageHandler(server.getInputHandler());
        fromHuman = new DummyConnection("human-to-Server");
        fromHuman.setMessageHandler(new MessageHandler() {
            public Message handle(Connection c, Message m) {
                int t = server.getGame().getTurn().getNumber();
                if (started && t != lastTurn) {
                    lastTurn = t;
                    onTurn();
                }
                if (started && script && t != scriptedTurn && server.getGame().getCurrentPlayer() == human) {
                    // the human's turn: played as a task after the server's current work, as a client would
                    scriptedTurn = t;
                    net.sf.freecol.server.ai.OracleScheduler.submit(Oracle::humanTurn);
                }
                return null;
            }
            public Message read(Connection c) {
                return null;
            }
        });
        toHuman.setOtherConnection(fromHuman);
        fromHuman.setOtherConnection(toHuman);
        new LoginMessage(null, "oracle", null, FreeCol.getVersion(),
            FreeColServer.ServerState.PRE_GAME, true, false, null).loginHandler(server, toHuman);
        for (Player p : server.getGame().getLivePlayerList()) if (!p.isAI()) human = (ServerPlayer)p;
        System.out.println("human " + human + " " + human.getNation());

        long tg = System.nanoTime();
        server.startGame();
        System.out.printf("startGame (map generation): %.0f ms%n", (System.nanoTime() - tg) / 1e6);

        FreeColDebugger.enableDebugMode(FreeColDebugger.DebugMode.MENUS);
        if (!script) server.getInGameController().setSkippedTurns(turns + 1000);
        lastTurn = server.getGame().getTurn().getNumber();
        started = true;
        tPrev = System.nanoTime();
        onTurn();
        // the first end of turn (or the human's first turn), as the first task of the AI thread
        // (patch/OracleScheduler.java)
        if (script) {
            scriptedTurn = lastTurn;
            net.sf.freecol.server.ai.OracleScheduler.submit(Oracle::humanTurn);
        } else {
            net.sf.freecol.server.ai.OracleScheduler.submit(() -> server.getInGameController().endTurn(human));
        }
        done.await();
    }

    /** Directions the scripted human tries, in order (west first: the land lies west of the ships). */
    static final Direction[] PREFER = { Direction.W, Direction.SW, Direction.NW, Direction.S, Direction.N,
        Direction.SE, Direction.NE, Direction.E };

    /** The scripted human's turn: each unit (by id; units aboard after their carrier) acts, then the turn ends. */
    static void humanTurn() {
        try {
            List<Unit> units = new ArrayList<>(human.getUnitSet());
            units.sort(Comparator.comparing(Unit::getId));
            for (Unit u : units) {
                humanUnit(u);
                List<Unit> aboard = new ArrayList<>(u.getUnitList());
                aboard.sort(Comparator.comparing(Unit::getId));
                for (Unit c : aboard) humanUnit(c);
            }
            fromHuman.askMessage(new EndTurnMessage(), Connection.DEFAULT_REPLY_TIMEOUT);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /** Up to four steps: a colonist on land founds a colony where it may, any unit moves (no attack, no trade). */
    static void humanUnit(Unit u) throws Exception {
        for (int step = 0; step < 4; step++) {
            if (u.isDisposed() || u.getMovesLeft() <= 0) return;
            Tile t = u.getTile();
            if (t == null || u.isInColony()) return;
            if (!u.isNaval() && u.getLocation() == t && u.isColonist() && human.canClaimToFoundSettlement(t)) {
                fromHuman.askMessage(new BuildColonyMessage(human.getSettlementName(null), u), Connection.DEFAULT_REPLY_TIMEOUT);
                return;
            }
            Direction d = null;
            for (Direction x : PREFER) {
                Unit.MoveType mt = u.getMoveType(x);
                if (mt == Unit.MoveType.MOVE || mt == Unit.MoveType.MOVE_HIGH_SEAS) {
                    d = x;
                    break;
                }
            }
            if (d == null) return;
            fromHuman.askMessage(new MoveMessage(u, d), Connection.DEFAULT_REPLY_TIMEOUT);
        }
    }

    static void onTurn() {
        ServerGame g = server.getGame();
        int turn = g.getTurn().getNumber();
        long now = System.nanoTime();
        Runtime rt = Runtime.getRuntime();
        System.gc();
        long used = rt.totalMemory() - rt.freeMemory();
        System.out.printf("turn %d: %.0f ms since last, heap after gc %.1f MB%n", turn,
            (now - tPrev) / 1e6, used / 1048576.0);
        try {
            File f = new File(out, String.format("turn%03d.fsg", turn));
            server.saveGame(f, null, null);
            System.out.printf("  saved %s %d bytes%n", f.getName(), f.length());
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (turn >= turns) done.countDown();
        tPrev = System.nanoTime();
    }
}
