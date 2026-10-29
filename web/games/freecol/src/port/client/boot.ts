// Starting the client as FreeCol.main starts it for a player who launches the game (no command line in
// the browser: the arguments are the launcher's, the rest of main's steps are its own, in its order).
import { Logger } from '../../jre/index.ts';

export type ClientArgs = {
  locale: string; // en_US
  width: number;
  height: number;
  sound: boolean;
};

export function startFreeColClient(java: (n: string) => any, args: ClientArgs) {
  const FreeCol = java('net.sf.freecol.FreeCol');
  const FreeColDirectories = java('net.sf.freecol.common.io.FreeColDirectories');
  const Messages = java('net.sf.freecol.common.i18n.Messages');
  const FreeColRules = java('net.sf.freecol.common.io.FreeColRules');
  const FreeColModFile = java('net.sf.freecol.common.io.FreeColModFile');
  const ClientOptions = java('net.sf.freecol.client.ClientOptions');
  const DefaultHandler = java('net.sf.freecol.common.logging.DefaultHandler');

  FreeCol.freeColRevision = FreeCol.FREECOL_VERSION;
  const err = FreeColDirectories.setDataDirectory('/data');
  if (err != null) FreeCol.fatal$String(err);
  FreeCol.setLocale(args.locale);
  Messages.loadMessageBundle(FreeCol.getLocale());
  // handleArgs: --no-intro (the intro video is left out), --no-java-check, --no-memory-check,
  // --windowed WxH, sound as the launcher says
  FreeCol.introVideo = false;
  FreeCol.javaCheck = false;
  FreeCol.memoryCheck = false;
  FreeCol.sound = args.sound;
  FreeCol.setWindowSize(args.width + 'x' + args.height);

  const key = FreeColDirectories.setUserDirectories();
  if (key != null) FreeCol.fatal$StringTemplate(key);

  const baseLogger = Logger.getLogger('');
  for (const h of baseLogger.getHandlers()) baseLogger.removeHandler(h);
  try {
    baseLogger.addHandler(new DefaultHandler()[DefaultHandler.$meta.ctors['boolean,java.io.Writer']](FreeCol.consoleLogging, FreeColDirectories.getLogWriter()));
    for (const ll of FreeCol.logLevels) ll.buildLogger();
  } catch (e) {
    console.error('Logging initialization failure: ' + e);
  }

  try {
    FreeCol.specialOptions = ClientOptions.getSpecialOptions();
  } catch (e) {
    FreeCol.specialOptions = new (java('java.util.HashMap'))();
  }
  FreeColRules.loadRules();
  FreeColModFile.loadMods();
  Messages.loadModMessageBundle(FreeCol.getLocale());
  FreeCol.processSpecialOptions();
  FreeCol.startClient();
}
