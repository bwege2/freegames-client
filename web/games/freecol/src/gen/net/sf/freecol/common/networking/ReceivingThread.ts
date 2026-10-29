// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ReceivingThread.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Collections, Exception, HashMap, IOException, Level, Logger, SAXException, Thread, XMLStreamException } from '../../../../../../jre/index.ts';

let FreeColException, Connection, DisconnectMessage, NetworkReplyObject, ReplyMessage, TrivialMessage;

/**
 * The thread that checks for incoming messages.
 */
export class ReceivingThread extends Thread {
  static logger: Logger = null;
  /**
   * Maximum number of retries before closing the connection.
   */
  static readonly MAXIMUM_RETRIES: number = 5;
  /**
   * A map of network ids to the corresponding waiting thread.
   */
  waitingThreads: JMap<number, NetworkReplyObject> = null;
  /**
   * The connection to receive on.
   */
  connection: Connection = null;
  /**
   * Whether the thread should run.
   */
  shouldRun_: boolean = false;
  /**
   * A counter for reply ids.
   */
  nextNetworkReplyId: number = 0;
  /**
   * The constructor to use.
   *
   * @param connection The {@code Connection} this
   *     {@code ReceivingThread} belongs to.
   * @param threadName The base name for the thread.
   */
  _ReceivingThread(connection: Connection, threadName: string): this {
    this._Thread('ReceivingThread-' + threadName);
    this.waitingThreads = Collections.synchronizedMap(new HashMap());
    this.connection = connection;
    this.shouldRun_ = true;
    this.nextNetworkReplyId = 1;
    return this;
  }
  /**
   * Gets the next network reply identifier that will be used when
   * identifing a network message.
   *
   * @return The next available network reply identifier.
   */
  getNextNetworkReplyId(): number {
    return this.nextNetworkReplyId++;
  }
  /**
   * Creates and registers a new {@code NetworkReplyObject} with the
   * specified object identifier.
   *
   * @param networkReplyId The identifier of the message the calling
   *     thread should wait for.
   * @return The {@code NetworkReplyObject} containing the network
   *     message.
   */
  waitForNetworkReply(networkReplyId: number): NetworkReplyObject {
    let nro = new NetworkReplyObject()._NetworkReplyObject(networkReplyId);
    this.waitingThreads.put(networkReplyId, nro);
    return nro;
  }
  /**
   * Checks if this thread should run.
   *
   * @return True if the thread should run.
   */
  shouldRun(): boolean {
    return this.shouldRun_;
  }
  /**
   * Set the shouldRun state to false.
   *
   * @return The old value of shouldRun.
   */
  stopRun(): boolean {
    if (!this.shouldRun_) {
      return false;
    }
    this.shouldRun_ = false;
    return true;
  }
  /**
   * Stop this thread.
   *
   * @return True if the thread was previously running and is now stopped.
   */
  stopThread(): boolean {
    if (!this.stopRun()) {
      return false;
    }
    let nros: Collection<NetworkReplyObject>;
    {
      nros = this.waitingThreads.values();
    }
    for (const $it0 = nros.iterator(); $it0.hasNext(); ) {
      let o = $it0.next();
      o.interrupt();
    }
    return true;
  }
  /**
   * Ask this thread to stop work.
   *
   * @param reason A brief description of why the thread should stop.
   */
  askToStop(reason: string): void {
    if (this.stopThread()) {
      ReceivingThread.logger.info(this.getName() + ': stopped receiving thread: ' + reason);
    }
  }
  /**
   * Disconnects this thread.
   */
  disconnect(): void {
    this.askToStop('disconnect');
    this.connection.sendDisconnect();
  }
  /**
   * Create a thread to handle an incoming question message.
   *
   * @param qm The {@code QuestionMessage} to handle.
   * @param replyId The network reply.
   * @return A new {@code Thread} to do the work, or null if none required.
   */
  messageQuestion(qm: QuestionMessage, replyId: number): Thread {
    let query = qm.getMessage();
    return (query == null) ? null : new ReceivingThread$QuestionThread()._ReceivingThread$QuestionThread(this.getName() + '-question-' + replyId + '-' + query.getType$(), this.connection, query, replyId);
  }
  /**
   * Create a thread to handle an incoming ordinary message.
   *
   * @param message The {@code Message} to handle.
   * @return A new {@code Thread} to do the work, or null if none required.
   */
  messageUpdate(message: Message): Thread {
    if (message == null) {
      return null;
    }
    let inTag = message.getType$();
    return new ReceivingThread$UpdateThread()._ReceivingThread$UpdateThread(this.getName() + '-update-' + inTag, this.connection, message);
  }
  /**
   * Listens to the InputStream and calls the message handler for
   * each message received.
   *
   * @exception IOException on low level IO problems.
   * @exception SAXException if a problem occured during parsing.
   * @exception XMLStreamException if a problem occured during parsing.
   */
  listen(): void {
    let tag: string;
    let replyId = -1;
    try {
      tag = this.connection.startListen();
    } catch ($e1) {
      if ($J.isa($e1, XMLStreamException)) {
        let xse = $J.exc($e1);
        if (!this.shouldRun()) {
          return;
        }
        ReceivingThread.logger.log(Level.WARNING, this.getName() + ': listen fail', xse);
        tag = DisconnectMessage.TAG;
      } else {
        throw $e1;
      }
    }
    let t = null;
    {
      let rm: Message, nro: NetworkReplyObject, m: Message;
      switch (tag) {
        case DisconnectMessage.TAG:
          this.askToStop('listen-disconnect');
          t = this.messageUpdate(TrivialMessage.disconnectMessage);
          break;
        case Connection.REPLY_TAG:
          replyId = this.connection.getReplyId();
          try {
            rm = this.connection.reader();
          } catch ($e2) {
            if ($J.isa($e2, Exception)) {
              let ex = $J.exc($e2);
              rm = null;
              ReceivingThread.logger.log(Level.WARNING, this.getName() + ': reply fail', ex);
            } else {
              throw $e2;
            }
          }
          nro = this.waitingThreads.remove(replyId);
          if (nro == null) {
            ReceivingThread.logger.warning(this.getName() + ': did not find reply ' + replyId);
          } else {
            nro.setResponse(rm);
          }
          break;
        case Connection.QUESTION_TAG:
          replyId = this.connection.getReplyId();
          m = null;
          try {
            m = this.connection.reader();
            // assert m instanceof QuestionMessage
            t = this.messageQuestion(m, replyId);
          } catch ($e3) {
            if ($J.isa($e3, FreeColException)) {
              let fce = $J.exc($e3);
              ReceivingThread.logger.log(Level.WARNING, 'No reader for ' + replyId, fce);
              t = null;
            } else {
              throw $e3;
            }
          }
          break;
        default:
          try {
            t = this.messageUpdate(this.connection.reader());
          } catch ($e4) {
            if ($J.isa($e4, Exception)) {
              let ex = $J.exc($e4);
              ReceivingThread.logger.log(Level.FINEST, this.getName() + ': fail', ex);
              this.askToStop('listen-update-fail');
            } else {
              throw $e4;
            }
          }
          break;
      }
    }
    if (t != null) {
      t.start();
    }
    this.connection.endListen();
  }
  /**
   * {@inheritDoc}
   */
  run(): void {
    let timesFailed = 0;
    try {
      while (this.shouldRun()) {
        try {
          this.listen();
          timesFailed = 0;
        } catch ($e5) {
          if ($J.isa($e5, SAXException) || $J.isa($e5, XMLStreamException)) {
            let ex = $J.exc($e5);
            if (!this.shouldRun()) {
              break;
            }
            ReceivingThread.logger.log(Level.WARNING, this.getName() + ': XML fail', ex);
            if (++timesFailed > ReceivingThread.MAXIMUM_RETRIES) {
              this.disconnect();
            }
          } else if ($J.isa($e5, IOException)) {
            let ioe = $J.exc($e5);
            if (!this.shouldRun()) {
              break;
            }
            ReceivingThread.logger.log(Level.WARNING, this.getName() + ': IO fail', ioe);
            this.disconnect();
          } else {
            throw $e5;
          }
        }
      }
    } finally {
      this.askToStop('run complete');
    }
  }
  static $clinit() {
    ReceivingThread.logger = Logger.getLogger($J.cls(ReceivingThread).getName());
  }
}

/**
 * A class to handle questions.
 */
export class ReceivingThread$QuestionThread extends Thread {
  /**
   * The connection to communicate with.
   */
  conn: Connection = null;
  /**
   * The message to handle.
   */
  query: Message = null;
  /**
   * The reply identifier to use when sending a reply.
   */
  replyId: number = 0;
  /**
   * Build a new thread to respond to a question message.
   *
   * @param name The thread name.
   * @param conn The {@code Connection} to use for I/O.
   * @param query The {@code Message} to handle.
   * @param replyId The network reply identifier
   */
  _ReceivingThread$QuestionThread(name: string, conn: Connection, query: Message, replyId: number): this {
    this._Thread(name);
    this.conn = conn;
    this.query = query;
    this.replyId = replyId;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  run(): void {
    let reply: Message;
    try {
      reply = this.conn.handle(this.query);
    } catch ($e6) {
      if ($J.isa($e6, FreeColException)) {
        let fce = $J.exc($e6);
        ReceivingThread.logger.log(Level.WARNING, this.getName() + ': handler fail', fce);
        return;
      } else {
        throw $e6;
      }
    }
    let replyTag = (reply == null) ? 'null' : reply.getType$();
    try {
      this.conn.sendMessage(new ReplyMessage()._ReplyMessage$int$Message(this.replyId, reply));
      ReceivingThread.logger.log(Level.FINEST, this.getName() + ' -> ' + replyTag);
    } catch ($e7) {
      if ($J.isa($e7, FreeColException) || $J.isa($e7, IOException) || $J.isa($e7, XMLStreamException)) {
        let ex = $J.exc($e7);
        ReceivingThread.logger.log(Level.WARNING, this.getName() + ' -> ' + replyTag + ' failed', ex);
      } else {
        throw $e7;
      }
    }
  }
}

export class ReceivingThread$UpdateThread extends Thread {
  /**
   * The connection to use for I/O.
   */
  conn: Connection = null;
  /**
   * The message to handle.
   */
  message: Message = null;
  /**
   * Build a new thread to handle an update.
   *
   * @param name The thread name.
   * @param conn The {@code Connection} to use to send messsages.
   * @param message The {@code Message} to handle.
   */
  _ReceivingThread$UpdateThread(name: string, conn: Connection, message: Message): this {
    this._Thread(name);
    this.conn = conn;
    this.message = message;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  run(): void {
    let reply: Message;
    try {
      reply = this.conn.handle(this.message);
    } catch ($e8) {
      if ($J.isa($e8, FreeColException)) {
        let fce = $J.exc($e8);
        ReceivingThread.logger.log(Level.WARNING, this.getName() + ': handler fail', fce);
        return;
      } else {
        throw $e8;
      }
    }
    let outTag = (reply == null) ? 'null' : reply.getType$();
    try {
      this.conn.sendMessage(reply);
      ReceivingThread.logger.log(Level.FINEST, this.getName() + ' -> ' + outTag);
    } catch ($e9) {
      if ($J.isa($e9, FreeColException) || $J.isa($e9, IOException) || $J.isa($e9, XMLStreamException)) {
        let ex = $J.exc($e9);
        ReceivingThread.logger.log(Level.WARNING, this.getName() + ' -> ' + outTag + ' failed', ex);
      } else {
        throw $e9;
      }
    }
  }
}

$J.define(ReceivingThread, 'net.sf.freecol.common.networking.ReceivingThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { 'net.sf.freecol.common.networking.Connection,java.lang.String': '_ReceivingThread' }, returns: { 'getNextNetworkReplyId': 'int' }, clinit: true, lazy: ['logger'] });
$J.define(ReceivingThread$QuestionThread, 'net.sf.freecol.common.networking.ReceivingThread$QuestionThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { 'java.lang.String,net.sf.freecol.common.networking.Connection,net.sf.freecol.common.networking.Message,int': '_ReceivingThread$QuestionThread' } });
$J.define(ReceivingThread$UpdateThread, 'net.sf.freecol.common.networking.ReceivingThread$UpdateThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { 'java.lang.String,net.sf.freecol.common.networking.Connection,net.sf.freecol.common.networking.Message': '_ReceivingThread$UpdateThread' } });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Connection = $J.load('net.sf.freecol.common.networking.Connection');
  DisconnectMessage = $J.load('net.sf.freecol.common.networking.DisconnectMessage');
  NetworkReplyObject = $J.load('net.sf.freecol.common.networking.NetworkReplyObject');
  ReplyMessage = $J.load('net.sf.freecol.common.networking.ReplyMessage');
  TrivialMessage = $J.load('net.sf.freecol.common.networking.TrivialMessage');
});
