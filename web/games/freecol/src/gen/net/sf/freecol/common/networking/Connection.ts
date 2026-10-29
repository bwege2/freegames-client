// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/Connection.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, BufferedReader, Exception, IOException, InetSocketAddress, InputStreamReader, JObject, Level, Logger, Socket, StandardCharsets, StringBuilder, StringReader, Thread, TimeoutException, XMLStreamException } from '../../../../../../jre/index.ts';

let FreeColException, FreeColDebugger, FreeColDebugger$DebugMode, FreeColDirectories, FreeColXMLReader, FreeColXMLWriter, FreeColXMLWriter$WriteScope, DisconnectMessage, QuestionMessage, ReceivingThread, ReplyMessage, TrivialMessage;

/**
 * A network connection.
 * Responsible for both sending and receiving network messages.
 */
export class Connection extends JObject {
  static logger: Logger = null;
  /**
   * The default timeout when waiting for a reply from the server. Defined
   * in milliseconds.
   *
   * Setting 30s for now since there was no timeout earlier when waiting
   * for å reply.
   */
  static readonly DEFAULT_REPLY_TIMEOUT: number = 30000;
  static readonly END_OF_STREAM: number = 10 /* \u000a */;
  static END_OF_STREAM_ARRAY: number[] = null;
  static readonly BUFFER_SIZE: number = 16384;
  static readonly NETWORK_REPLY_ID_TAG: string = 'networkReplyId';
  static readonly QUESTION_TAG: string = 'question';
  static readonly REPLY_TAG: string = 'reply';
  static readonly SEND_SUFFIX: string = '-send';
  static readonly REPLY_SUFFIX: string = '-reply';
  static readonly TIMEOUT: number = 5000;
  /**
   * The name of the connection.
   */
  name: string = null;
  /**
   * A lock for access to the socket.
   */
  socketLock: any = null;
  /**
   * The socket connected to the other end of the connection.
   */
  socket: Socket = null;
  /**
   * A lock for the input side.
   */
  inputLock: any = null;
  /**
   * The wrapped version of the input side of the socket.
   */
  br: BufferedReader = null;
  /**
   * An XML stream wrapping of an input line.
   */
  xr: FreeColXMLReader = null;
  /**
   * A lock for the output side.
   */
  outputLock: any = null;
  /**
   * Main message writer.
   */
  xw: FreeColXMLWriter = null;
  /**
   * The FreeColXMLWriter to write logging messages to.
   */
  lw: FreeColXMLWriter = null;
  /**
   * The subthread to read the input.
   */
  receivingThread: ReceivingThread = null;
  receivingThreadLock: any = null;
  /**
   * The message handler to process incoming messages with.
   */
  messageHandler: MessageHandler = null;
  /**
   * Is there an active connection.
   */
  connected: boolean = false;
  $init_Connection() {
    this.socketLock = new JObject();
    this.socket = null;
    this.inputLock = new JObject();
    this.outputLock = new JObject();
    this.receivingThreadLock = new JObject();
    this.messageHandler = null;
    this.connected = false;
  }
  /**
   * Trivial constructor.
   *
   * @param name The name of the connection.
   */
  _Connection$String(name: string): this {
    this.$init_Connection();
    this.name = name;
    this.setSocket(null);
    this.br = null;
    this.xr = null;
    this.receivingThread = null;
    this.messageHandler = null;
    this.xw = null;
    this.setCommsLogging(FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.COMMS));
    this.connected = false;
    return this;
  }
  /**
   * Creates a new {@code Connection} with the specified
   * {@code Socket} and {@link MessageHandler}.
   *
   * @param socket The socket to the client.
   * @param name The connection name.
   * @exception IOException if streams can not be derived from the socket.
   */
  _Connection$Socket$String(socket: Socket, name: string): this {
    this._Connection$String(name);
    this.setSocket(socket);
    this.br = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
    this.receivingThread = new ReceivingThread()._ReceivingThread(this, name);
    this.xw = new FreeColXMLWriter()._FreeColXMLWriter$OutputStream$WriteScope$boolean(socket.getOutputStream(), FreeColXMLWriter$WriteScope.toSave(), false);
    this.connected = true;
    return this;
  }
  /**
   * Sets up a new socket with specified host and port and uses
   * {@link #Connection(Socket, String)}.
   *
   * @param host The host to connect to.
   * @param port The port to connect to.
   * @param name The name for the connection.
   * @exception IOException if the socket creation is problematic.
   */
  _Connection$String$int$String(host: string, port: number, name: string): this {
    this._Connection$Socket$String(Connection.createSocket(host, port), name);
    return this;
  }
  /**
   * Creates a socket to communication with a given host, port pair.
   *
   * @param host The host to connect to.
   * @param port The port to connect to.
   * @return A new socket.
   * @exception IOException on failure to create/connect the socket.
   */
  static createSocket(host: string, port: number): Socket {
    let socket = new Socket();
    let addr = new InetSocketAddress(host, port);
    socket.connect(addr, Connection.TIMEOUT);
    return socket;
  }
  /**
   * Start the recieving thread.
   */
  startReceiving(): void {
    if (this.receivingThread != null) {
      this.receivingThread.start();
    }
  }
  /**
   * Get the socket.
   *
   * @return The current {@code Socket}.
   */
  getSocket(): Socket {
    {
      return this.socket;
    }
  }
  /**
   * Set the socket.
   *
   * @param socket The new {@code Socket}.
   */
  setSocket(socket: Socket): void {
    {
      this.socket = socket;
    }
  }
  /**
   * Close and clear the socket.
   */
  closeSocket(): void {
    {
      if (this.socket != null) {
        try {
          this.socket.close();
        } catch ($e0) {
          if ($J.isa($e0, IOException)) {
            let ioe = $J.exc($e0);
            Connection.logger.log(Level.WARNING, 'Error closing socket', ioe);
          } else {
            throw $e0;
          }
        } finally {
          this.socket = null;
        }
      }
    }
  }
  /**
   * Close and clear the output stream.
   */
  closeOutputStream(): void {
    {
      if (this.xw != null) {
        this.xw.close();
        this.xw = null;
      }
    }
  }
  /**
   * Close and clear the input stream.
   */
  closeInputStream(): void {
    {
      if (this.br != null) {
        try {
          this.br.close();
        } catch ($e1) {
          if ($J.isa($e1, IOException)) {
            let ioe = $J.exc($e1);
            Connection.logger.log(Level.WARNING, 'Error closing buffered input', ioe);
          } else {
            throw $e1;
          }
        } finally {
          this.br = null;
        }
      }
    }
  }
  /**
   * Is this connection alive?
   *
   * @return True if the connection is alive.
   */
  isAlive(): boolean {
    return this.getSocket() != null;
  }
  /**
   * Get the host address of this connection.
   *
   * @return The host address, or an empty string on error.
   */
  getHostAddress(): string {
    let socket = this.getSocket();
    return (socket == null) ? '' : socket.getInetAddress().getHostAddress();
  }
  /**
   * Get the port for this connection.
   *
   * @return The port number, or negative on error.
   */
  getPort(): number {
    let socket = this.getSocket();
    return (socket == null) ? -1 : socket.getPort();
  }
  /**
   * Get the printable description of the socket.
   *
   * @return *host-address*:*port-number* or an empty string on error.
   */
  getSocketName(): string {
    return (this.isAlive()) ? this.getHostAddress() + ':' + this.getPort() : '';
  }
  /**
   * Gets the message handler for this connection.
   *
   * @return The {@code MessageHandler} for this Connection.
   */
  getMessageHandler(): MessageHandler {
    return this.messageHandler;
  }
  /**
   * Sets the message handler for this connection.
   *
   * @param messageHandler The new {@code MessageHandler} for this
   *     Connection.
   * @return This {@code Connection}.
   */
  setMessageHandler(messageHandler: MessageHandler): Connection {
    this.messageHandler = messageHandler;
    return this;
  }
  /**
   * Set the output write scope.
   *
   * @param ws The new write scope.
   */
  setWriteScope(ws: FreeColXMLWriter$WriteScope): void {
    {
      if (this.xw != null) {
        this.xw.setWriteScope(ws);
      }
    }
  }
  /**
   * Gets the connection name.
   *
   * @return The connection name.
   */
  getName(): string {
    return this.name;
  }
  /**
   * Set the logging state of this connection.
   *
   * @param log If true, enable logging.
   * @return This {@code Connection}.
   */
  setCommsLogging(log: boolean): Connection {
    let lw = null;
    if (log) {
      try {
        lw = new FreeColXMLWriter()._FreeColXMLWriter$Writer$WriteScope$boolean(FreeColDirectories.getLogCommsWriter(), FreeColXMLWriter$WriteScope.toSave(), true);
      } catch ($e2) {
        if ($J.isa($e2, FreeColException) || $J.isa($e2, IOException)) {
          let ex = $J.exc($e2);
          lw = null;
          Connection.logger.log(Level.WARNING, 'Comms logs disabled', ex);
        } else {
          throw $e2;
        }
      }
    }
    this.lw = lw;
    return this;
  }
  /**
   * Signal that this connection is disconnecting.
   */
  sendDisconnect(): void {
    try {
      this.send(TrivialMessage.disconnectMessage);
    } catch ($e3) {
      if ($J.isa($e3, FreeColException) || $J.isa($e3, IOException) || $J.isa($e3, XMLStreamException)) {
        let ex = $J.exc($e3);
        Connection.logger.log(Level.WARNING, 'Failed to send disconnect', ex);
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Send a reconnect message.
   */
  sendReconnect(): void {
    try {
      this.send(TrivialMessage.reconnectMessage);
    } catch ($e4) {
      if ($J.isa($e4, FreeColException) || $J.isa($e4, IOException) || $J.isa($e4, XMLStreamException)) {
        let ex = $J.exc($e4);
        Connection.logger.log(Level.WARNING, 'Failed to send reconnect', ex);
      } else {
        throw $e4;
      }
    }
  }
  /**
   * Disconnect this connection.
   */
  disconnect(): void {
    this.connected = false;
    this.sendDisconnect();
    this.close();
  }
  getFreeColXMLReader(): FreeColXMLReader {
    return this.xr;
  }
  startListen(): string {
    let line: string;
    try {
      line = this.br.readLine();
    } catch ($e5) {
      if ($J.isa($e5, IOException)) {
        let ioe = $J.exc($e5);
        line = null;
      } else {
        throw $e5;
      }
    }
    if (line == null) {
      return DisconnectMessage.TAG;
    }
    try {
      this.xr = new FreeColXMLReader()._FreeColXMLReader$Reader(new StringReader(line));
    } catch ($e6) {
      if ($J.isa($e6, Exception)) {
        let ex = $J.exc($e6);
        return DisconnectMessage.TAG;
      } else {
        throw $e6;
      }
    }
    this.xr.nextTag();
    return this.xr.getLocalName();
  }
  getReplyId(): number {
    return (this.xr == null) ? -1 : this.xr.getAttribute$String$int(Connection.NETWORK_REPLY_ID_TAG, -1);
  }
  endListen(): void {
    this.xr = null;
  }
  /**
   * Send a message, and return the response.  Log both.
   *
   * @param message The {@code Message} to send.
   * @param timeout A timeout in milliseconds, after which a
   *      {@code TimeoutException} gets thrown when waiting
   *      for a reply.
   * @return The response.
   * @exception FreeColException on extreme confusion.
   * @exception IOException on failure to send.
   * @exception XMLStreamException on stream write error.
   * @exception TimeoutException when the timeout is reached.
   */
  askMessage(message: Message, timeout: number): Message {
    if (message == null) {
      return null;
    }
    let tag = message.getType$();
    if (Thread.currentThread() === this.receivingThread) {
      throw new IOException('wait(ReceivingThread) for: ' + tag);
    }
    let replyId = this.receivingThread.getNextNetworkReplyId();
    let qm = new QuestionMessage()._QuestionMessage$int$Message(replyId, message);
    let nro = this.receivingThread.waitForNetworkReply(replyId);
    this.sendMessage(qm);
    let response = nro.getResponse(timeout);
    if (response == null && !this.connected) {
      return null;
    } else if (!(response instanceof ReplyMessage)) {
      throw new FreeColException()._FreeColException$String('Bad response to ' + replyId + '/' + tag + ': ' + $J.str(response));
    }
    let reply = response;
    this.logMessage(reply, false);
    return reply.getMessage();
  }
  /**
   * Send a message, do not consider a response.
   *
   * Public as this is called from ReceivingThread.
   *
   * @param message The {@code Message} to send.
   * @exception FreeColException on extreme confusion.
   * @exception IOException on failure to send.
   * @exception XMLStreamException on stream problem.
   */
  sendMessage(message: Message): void {
    if (message == null) {
      return;
    }
    {
      if (this.xw == null) {
        return;
      }
      message.toXML(this.xw);
      this.xw.writeCharacters(Connection.END_OF_STREAM_ARRAY, 0, Connection.END_OF_STREAM_ARRAY.length);
      this.xw.flush();
    }
    this.logMessage(message, true);
  }
  /**
   * Log a message.
   *
   * @param message The {@code Message} to log.
   * @param send True if this is a send, false if a reply.
   */
  logMessage(message: Message, send: boolean): void {
    if (this.lw == null || message == null) {
      return;
    }
    try {
      {
        this.lw.writeComment(this.name + ((send) ? Connection.SEND_SUFFIX : Connection.REPLY_SUFFIX));
        message.toXML(this.lw);
        this.lw.writeCharacters(Connection.END_OF_STREAM_ARRAY, 0, Connection.END_OF_STREAM_ARRAY.length);
        this.lw.flush();
      }
    } catch ($e7) {
      if ($J.isa($e7, Exception)) {
        let ex = $J.exc($e7);
      } else {
        throw $e7;
      }
    }
  }
  /**
   * Handle a message using the MessageHandler.
   *
   * @param message The {@code Message} to handle.
   * @return The result of the handler.
   * @exception FreeColException if the message is malformed.
   */
  handle(message: Message): Message {
    if (message == null) {
      return null;
    }
    let mh = this.getMessageHandler();
    return (mh == null) ? null : mh.handle(this, message);
  }
  /**
   * Read a message using the MessageHandler.
   *
   * @return The {@code Message} found, if any.
   * @exception FreeColException there is a problem creating the message.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  reader(): Message {
    if (this.xr == null) {
      return null;
    }
    let mh = this.getMessageHandler();
    if (mh == null) {
      throw (new FreeColException()._FreeColException$String('No handler at ' + this.xr.getLocalName())).preserveDebug();
    }
    return mh.read(this);
  }
  /**
   * Client request.
   *
   * @param message A {@code Message} to process.
   * @exception FreeColException on handler failure.
   * @exception IOException if there is a problem sending messages.
   * @exception XMLStreamException if there is a message format problem.
   */
  request(message: Message): void {
    if (message == null) {
      return;
    }
    try {
      let response = this.askMessage(message, Connection.DEFAULT_REPLY_TIMEOUT);
      if (response != null) {
        let reply = this.handle(response);
        // assert reply == null
      }
    } catch ($e8) {
      if ($J.isa($e8, TimeoutException)) {
        let e = $J.exc($e8);
        throw new IOException(e);
      } else {
        throw $e8;
      }
    }
  }
  /**
   * Client send.
   *
   * @param message A {@code Message} to send.
   * @exception FreeColException on extreme confusion.
   * @exception IOException on write error.
   * @exception XMLStreamException if there is a message format problem.
   */
  send(message: Message): void {
    if (message != null) {
      this.sendMessage(message);
    }
  }
  /**
   * Close this connection.
   */
  close(): void {
    {
      if (this.receivingThread != null) {
        this.receivingThread.askToStop('connection closing');
        this.receivingThread.interrupt();
        this.receivingThread = null;
      }
    }
    this.closeSocket();
    this.closeInputStream();
    this.closeOutputStream();
    Connection.logger.fine('Connection closed for ' + this.name);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append('[Connection ').append(this.name).append(' (').append(this.getSocketName()).append(')]');
    return sb.toString();
  }
  static $clinit() {
    Connection.logger = Logger.getLogger($J.cls(Connection).getName());
    Connection.END_OF_STREAM_ARRAY = [Connection.END_OF_STREAM];
  }
}

$J.define(Connection, 'net.sf.freecol.common.networking.Connection', { kind: 'class', ifaces: ['java.io.Closeable'], sup: 'java.lang.Object', ctors: { 'java.lang.String,int,java.lang.String': '_Connection$String$int$String', 'java.net.Socket,java.lang.String': '_Connection$Socket$String', 'java.lang.String': '_Connection$String' }, returns: { 'getReplyId': 'int', 'getFreeColXMLReader': 'net.sf.freecol.common.io.FreeColXMLReader', 'getName': 'java.lang.String', 'getMessageHandler': 'net.sf.freecol.common.networking.MessageHandler', 'getSocketName': 'java.lang.String', 'getPort': 'int', 'getHostAddress': 'java.lang.String', 'isAlive': 'boolean', 'getSocket': 'java.net.Socket' }, clinit: true, lazy: ['logger', 'END_OF_STREAM_ARRAY'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  FreeColXMLWriter = $J.load('net.sf.freecol.common.io.FreeColXMLWriter');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  DisconnectMessage = $J.load('net.sf.freecol.common.networking.DisconnectMessage');
  QuestionMessage = $J.load('net.sf.freecol.common.networking.QuestionMessage');
  ReceivingThread = $J.load('net.sf.freecol.common.networking.ReceivingThread');
  ReplyMessage = $J.load('net.sf.freecol.common.networking.ReplyMessage');
  TrivialMessage = $J.load('net.sf.freecol.common.networking.TrivialMessage');
});
