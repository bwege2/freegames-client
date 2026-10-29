package net.sf.freecol.server.ai;

import java.util.ArrayDeque;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Supplier;

/**
 * The oracle's thread scheduling (re/freecol/NOTES.md, "AI threads"). FreeCol's AI players act in threads
 * of their own (AIPlayer.invoke) that race with the server and each other, so the original is not
 * reproducible from one run to the next: two runs with the same seed part at the first close race (seed 7,
 * turn 62). The oracle runs the original with this one change, which the port's scheduler
 * (web/games/freecol/src/port/threads.ts) reproduces:
 * - all AI work runs on one thread, one task at a time;
 * - a whole turn (setCurrentPlayerHandler) is a task, run after the task that started it;
 * - an answer to the server (a name, a founding father, a diplomatic reply) runs when the server has finished
 *   the request it is busy with, and before the next request of the AI.
 * Added to the original's sources by oracle/patch.py, with the calls in AIPlayer and DummyConnection.
 */
public final class OracleScheduler {
    private static final ExecutorService tasks = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "FreeColServer:AI");
        t.setDaemon(true);
        return t;
    });
    private static final ArrayDeque<Runnable> answers = new ArrayDeque<>();
    private static int depth = 0;
    private static boolean draining = false;
    /** Set while setCurrentPlayerHandler runs: its invoke is a whole turn. */
    public static int turnInvoke = 0;

    private OracleScheduler() {}

    /** AIPlayer.invoke: a turn becomes a task, an answer waits for the current request to finish. */
    public static void invoke(Runnable r) {
        if (turnInvoke > 0) {
            tasks.submit(() -> {
                drain();
                r.run();
                drain();
            });
        } else {
            answers.add(r);
        }
    }

    /** A task for the AI thread (the harness's first end of turn). */
    public static Future<?> submit(Runnable r) {
        return tasks.submit(() -> {
            request(() -> {
                r.run();
                return null;
            });
            drain();
        });
    }

    /** A request to the server (DummyConnection.askMessage): enter before, leave after. */
    public static <T> T request(Supplier<T> f) {
        enter();
        try {
            return f.get();
        } finally {
            leave();
        }
    }

    public static void enter() {
        if (depth == 0) drain();
        depth++;
    }

    public static void leave() {
        depth--;
        if (depth == 0) drain();
    }

    /** Runs the waiting answers, in the order they were started. */
    public static void drain() {
        if (draining) return;
        draining = true;
        try {
            Runnable r;
            while ((r = answers.poll()) != null) r.run();
        } finally {
            draining = false;
        }
    }
}
