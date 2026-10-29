// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/NetworkReplyObject.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, InterruptedException, JObject, TimeoutException } from '../../../../../../jre/index.ts';

/**
 * Class for storing a network response.  If the response has not been
 * set when {@link #getResponse} has been called, this method will
 * block until {@link #setResponse} is called.
 */
export class NetworkReplyObject extends JObject {
  static ONE_SECOND: number = 0;
  /**
   * A unique identifier for the message to wait for.
   */
  networkReplyId: number = 0;
  /**
   * The response from the network.
   */
  response: any = null;
  /**
   * A gating flag that shows when the response is valid.  Starts false,
   * becomes true in {@link #setResponse}.
   */
  responseGiven: boolean = false;
  /**
   * The constructor.
   *
   * @param networkReplyId The unique identifier for the network message
   *                       this object will store.
   */
  _NetworkReplyObject(networkReplyId: number): this {
    this.networkReplyId = networkReplyId;
    this.response = null;
    this.responseGiven = false;
    return this;
  }
  /**
   * Gets the unique identifier for the network message this
   * object will store.
   *
   * @return the unique identifier.
   */
  getNetworkReplyId(): number {
    return this.networkReplyId;
  }
  /**
   * Gets the response. If the response has not been set, this method
   * will block until {@link #setResponse} has been called.
   *
   * @param timeout A timeout in milliseconds, after which a
   *      {@code TimeoutException} gets thrown when waiting for
   *      a reply.
   * @return the response.
   * @throws TimeoutException when the timeout is reached.
   */
  getResponse(timeout: number): any {
    let end = $J.system_currentTimeMillis() + timeout;
    while (!this.responseGiven) {
      if ($J.system_currentTimeMillis() > end) {
        throw new TimeoutException('The network request timed out: ' + timeout);
      }
      try {
        $J.monitorWait(this, NetworkReplyObject.ONE_SECOND);
      } catch ($e0) {
        if ($J.isa($e0, InterruptedException)) {
          let ie = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    return this.response;
  }
  /**
   * Sets the response and continues {@code getResponse()}.
   *
   * @param response The response.
   * @see #getResponse
   */
  setResponse(response: any): void {
    if (!this.responseGiven) {
      this.response = response;
      this.responseGiven = true;
      $J.monitorNotify(this, true);
    }
  }
  /**
   * Interrupt the wait for response.
   */
  interrupt(): void {
    this.setResponse(null);
  }
  static $clinit() {
    NetworkReplyObject.ONE_SECOND = 1000;
  }
}

$J.define(NetworkReplyObject, 'net.sf.freecol.common.networking.NetworkReplyObject', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_NetworkReplyObject' }, returns: { 'getNetworkReplyId': 'int' }, clinit: true, lazy: ['ONE_SECOND'] });
