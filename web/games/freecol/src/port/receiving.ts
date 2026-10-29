// FreeCol's ReceivingThread reads a connection's messages in a loop (one XML document per line) and
// starts a thread for each one. Here nothing may block to read: the loop's body (listen) runs once for
// each complete line that arrived on the connection's socket, when the platform layer takes the bytes in
// (pumpReceivers). Replies to waiting requests are matched there, as in the original's receiving thread;
// every other message gets its thread, as in the original.
import { $J, Logger, Level } from '../jre/index.ts';

const receivers = new Set<any>();
let logger: any = null;
/** a reply woke a waiting thread: it runs before the connection's next message is read */
let woke = false;

export function installReceiving(java: (n: string) => any) {
  const ReceivingThread = java('net.sf.freecol.common.networking.ReceivingThread');
  logger = Logger.getLogger('net.sf.freecol.common.networking.ReceivingThread');
  ReceivingThread.prototype.run = function () {
    this.$failed = 0;
    receivers.add(this);
  };
  // it listens from the moment it is started, as the original's thread does, even while the thread that
  // started it waits (the client's EDT waiting for the reply to its login)
  // In the JVM the thread a reply wakes (the client's login, which sets the game up) runs at once, while the
  // receiving thread reads on; the next message (that may need the game) comes later. Here they would run
  // in turn, the reading first: after a reply the reading pauses until the woken thread had its turn.
  const NetworkReplyObject = java('net.sf.freecol.common.networking.NetworkReplyObject');
  const setResponse = NetworkReplyObject.prototype.setResponse;
  NetworkReplyObject.prototype.setResponse = function (this: any, ...a: any[]) {
    woke = true;
    return setResponse.apply(this, a);
  };
  const start = ReceivingThread.prototype.start;
  ReceivingThread.prototype.start = function () {
    this.run();
    start.call(this);
  };
}

/**
 * Runs listen() for every complete line on every connection; true if any message was read. The client
 * (pauseAfterReply) stops after a reply that woke a thread, and reads on at its next poll.
 */
export function pumpReceivers(pauseAfterReply = false): boolean {
  let any = false;
  for (const rt of [...receivers]) {
    const socket = rt.connection.getSocket();
    const pipe = socket?.pipe;
    while (pipe && rt.shouldRun() && pipe.lines > 0) {
      pipe.lines--;
      any = true;
      try {
        woke = false;
        rt.listen();
        rt.$failed = 0;
        if (woke && pauseAfterReply) {
          woke = false;
          return true;
        }
      } catch (e) {
        if (!rt.shouldRun()) break;
        const x = $J.exc(e);
        const xml = $J.isa(x, $J.load('javax.xml.stream.XMLStreamException')) || $J.isa(x, $J.load('org.xml.sax.SAXException'));
        logger.log(Level.WARNING, rt.getName() + (xml ? ': XML fail' : ': IO fail'), x);
        if (!xml || ++rt.$failed > 5) rt.disconnect();
      }
    }
    if (!rt.shouldRun() || pipe == null || (pipe.closed && pipe.lines === 0 && !pipe.chunks.length)) {
      if (pipe?.closed && rt.shouldRun()) {
        // the end of the stream: as the original's listen() on a null line, a disconnect
        pipe.lines = 0;
        try {
          rt.listen();
        } catch (e) {
          void e;
        }
      }
      if (!rt.shouldRun()) {
        receivers.delete(rt);
        rt.askToStop('run complete');
      }
    }
  }
  return any;
}
