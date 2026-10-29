"""The oracle's one change to the original (re/freecol/NOTES.md, "AI threads"): FreeCol's AI threads race, so
the oracle schedules them deterministically (patch/OracleScheduler.java). This copies the two original
sources it touches, applies the change and checks that each replaced text is found exactly once.
   python3 oracle/patch.py ORIG_SRC OUT_DIR
"""
import os
import shutil
import sys

src, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))

EDITS = {
    'net/sf/freecol/server/ai/AIPlayer.java': [
        ('''        Thread thread = new Thread(runnable,
            FreeCol.SERVER_THREAD + "AIPlayer(" + getPlayer().getName() + ")");
        thread.start();
        logger.finest("Started " + thread);''',
         '''        Thread thread = new Thread(runnable,
            FreeCol.SERVER_THREAD + "AIPlayer(" + getPlayer().getName() + ")");
        logger.finest("Started " + thread);
        OracleScheduler.invoke(runnable); // the oracle: deterministic scheduling'''),
        ('''        if (getPlayer().getId().equals(currentPlayer.getId())) {
            invoke(() -> {''',
         '''        if (getPlayer().getId().equals(currentPlayer.getId())) {
            OracleScheduler.turnInvoke++; // the oracle: this invoke is a turn
            try { invoke(() -> {'''),
        ('''                    AIMessage.askEndTurn(this);
                });
        }''',
         '''                    AIMessage.askEndTurn(this);
                });
            } finally { OracleScheduler.turnInvoke--; }
        }'''),
    ],
    'net/sf/freecol/server/networking/DummyConnection.java': [
        ('''        DummyConnection other = getOtherConnection();
        if (other == null) return null;
        if (message == null) return null;
        logMessage(message, true);
        Message reply = other.handle(message);
        logMessage(reply, false);
        return reply;''',
         '''        DummyConnection other = getOtherConnection();
        if (other == null) return null;
        if (message == null) return null;
        net.sf.freecol.server.ai.OracleScheduler.enter(); // the oracle: requests and answers in order
        try {
        logMessage(message, true);
        Message reply = other.handle(message);
        logMessage(reply, false);
        return reply;
        } finally { net.sf.freecol.server.ai.OracleScheduler.leave(); }'''),
    ],
}

for rel, edits in EDITS.items():
    text = open(os.path.join(src, rel), encoding='utf-8').read()
    for old, new in edits:
        n = text.count(old)
        if n != 1:
            sys.exit(f'{rel}: expected the original text once, found it {n} times:\n{old}')
        text = text.replace(old, new)
    dst = os.path.join(out, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, 'w', encoding='utf-8').write(text)
dst = os.path.join(out, 'net/sf/freecol/server/ai/OracleScheduler.java')
shutil.copy(os.path.join(here, 'patch', 'OracleScheduler.java'), dst)
print('patched', len(EDITS), 'files and added OracleScheduler')
