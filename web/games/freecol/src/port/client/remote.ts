// The client's FreeColServer when the server runs in the other worker (server/host.ts). The original client
// starts a FreeColServer in its own JVM and keeps the object: it connects to it over a socket like any server,
// and calls a few of its methods directly (shut it down, save the game, skip turns, its state). Here
// FreeColClient.startServer asks the server worker for the server, and gets this stand-in, whose methods
// are requests to that worker; the socket is a pipe to it (net.ts).
import { $J, IOException, File, StringWriter, vfs } from '../../jre/index.ts';
import type { ClientNet } from './net.ts';

export function installRemoteServer(java: (n: string) => any, jmethod: (c: string, sig: string) => string, net: ClientNet) {
  const FreeColServer = java('net.sf.freecol.server.FreeColServer');
  const FreeColClient = java('net.sf.freecol.client.FreeColClient');
  const FreeCol = java('net.sf.freecol.FreeCol');
  const FreeColSavegameFile = java('net.sf.freecol.common.io.FreeColSavegameFile');
  const ResourceManager = java('net.sf.freecol.common.resources.ResourceManager');
  const XMLStreamException = java('javax.xml.stream.XMLStreamException');
  const failS = jmethod('net.sf.freecol.client.FreeColClient', 'failToMain(java.lang.Exception,java.lang.String)');
  const ser = jmethod('net.sf.freecol.common.model.FreeColObject', 'serialize()');
  const failT = jmethod('net.sf.freecol.client.FreeColClient', 'failToMain(java.lang.Exception,net.sf.freecol.common.model.StringTemplate)');
  /** The specification as a saved game holds it (the server worker reads it back). */
  const specXml = (spec: any): string => {
    const WriteScope = java('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
    const FreeColXMLWriter = java('net.sf.freecol.common.io.FreeColXMLWriter');
    const sw = new StringWriter();
    const xw = new FreeColXMLWriter()[FreeColXMLWriter.$meta.ctors['java.io.Writer,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope']](sw, WriteScope.toSave());
    spec[jmethod('net.sf.freecol.common.model.Specification', 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)')](xw);
    xw.close();
    return sw.toString();
  };

  /** A FreeColServer in the server worker, on a port there. */
  function remote(host: string, port: number): any {
    const ServerState = java('net.sf.freecol.server.FreeColServer$ServerState');
    const r = Object.create(FreeColServer.prototype);
    Object.assign(r, {
      $remote: true,
      getHost: () => host,
      getPort: () => port,
      getServerState: () => {
        const name = net.call('state', { port });
        return ServerState.values().find((v: any) => v.name() === name);
      },
      getController: () => ({ shutdown: () => net.call('shutdown', { port }) }),
      getInGameController: () => ({ setSkippedTurns: (n: number) => net.call('setSkippedTurns', { port, turns: n }) }),
      getGame: () => ({ setInitialActiveUnitId: (id: string) => net.call('setInitialActiveUnitId', { port, id }) }),
      getAIMain: () => null,
      registerWithMetaServer: () => true,
      removeFromMetaServer: () => true,
      updateMetaServer: () => true,
      setPublicServer: (_b: boolean) => {},
      shutdown: () => net.call('shutdown', { port }),
    });
    r[jmethod('net.sf.freecol.server.FreeColServer', 'saveGame(java.io.File,net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.model.Unit)')] =
      (file: any, options: any, active: any) => {
        const bytes: number[] = net.call('save', { port, options: options == null ? null : options[ser](), activeUnit: active == null ? null : active.getId() });
        vfs.write(file.getAbsolutePath(), Uint8Array.from(bytes));
      };
    return r;
  }

  const P = FreeColClient.prototype;
  // startServer(publicServer, singlePlayer, spec, address, port)
  P[jmethod('net.sf.freecol.client.FreeColClient', 'startServer(boolean,boolean,net.sf.freecol.common.model.Specification,java.net.InetAddress,int)')] =
    function (this: any, publicServer: boolean, singlePlayer: boolean, spec: any, _address: any, port: number) {
      let fcs;
      try {
        const a = net.call('startServer', { publicServer, singlePlayer, spec: specXml(spec), port });
        fcs = remote(a.host, a.port);
      } catch (e) {
        if ($J.isa(e, IOException)) return this[failS]($J.exc(e), 'server.initialize');
        throw e;
      }
      this.setFreeColServer(fcs);
      this.setSinglePlayer(singlePlayer);
      return fcs;
    };
  // startServer(publicServer, singlePlayer, saveFile, address, port, name)
  P[jmethod('net.sf.freecol.client.FreeColClient', 'startServer(boolean,boolean,java.io.File,java.net.InetAddress,int,java.lang.String)')] =
    function (this: any, publicServer: boolean, singlePlayer: boolean, saveFile: any, _address: any, port: number, name: string) {
      let fsg;
      try {
        fsg = new FreeColSavegameFile()[FreeColSavegameFile.$meta.ctors['java.io.File']](saveFile);
      } catch (e) {
        if ($J.isa(e, java('java.io.FileNotFoundException'))) return this[failT]($J.exc(e), FreeCol.badFile('error.couldNotFind', saveFile));
        if ($J.isa(e, IOException)) return this[failS]($J.exc(e), 'server.initialize');
        throw e;
      }
      let fcs;
      try {
        const bytes = vfs.read(new File(saveFile.getAbsolutePath()).getAbsolutePath());
        if (!bytes) throw new IOException('no file ' + saveFile.getPath());
        const a = net.call('loadServer', { publicServer, name, save: Array.from(bytes), port });
        fcs = remote(a.host, a.port);
      } catch (e) {
        if ($J.isa(e, XMLStreamException)) return this[failT]($J.exc(e), FreeCol.badFile('error.couldNotLoad', saveFile));
        if ($J.isa(e, java('java.lang.Exception'))) return this[failS]($J.exc(e), 'server.initialize');
        throw e;
      }
      this.setFreeColServer(fcs);
      this.setSinglePlayer(singlePlayer);
      this.inGameController.setGameConnected();
      ResourceManager.setSavegameFile(fsg);
      return fcs;
    };
}
