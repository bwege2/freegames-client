// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/FreeCol.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Collectors, DefaultParser, Exception, File, Files, HashMap, HelpFormatter, IOException, InetAddress, JError, JObject, JString, Level, Locale, Logger, NumberFormatException, Option, Options, ParseException, Paths, Runtime, StringBuilder, Thread, UnknownHostException, XMLStreamException } from '../../../../jre/index.ts';

let Dimension, SwingUtilities, ClientOptions, FreeColClient, SplashScreen, FreeColException, FreeColSeed, FreeColUserMessageException, FreeColDebugger, FreeColDebugger$DebugMode, Messages, FreeColDirectories, FreeColModFile, FreeColRules, FreeColSavegameFile, DefaultHandler, Constants$IntegrityType, NationOptions$Advantages, StringTemplate, CollectionUtils, LogBuilder, OSUtils, StringUtils, Utils, FreeColServer;

/**
 * This class is responsible for handling the command-line arguments
 * and starting either the stand-alone server or the client-GUI.
 *
 * @see net.sf.freecol.client.FreeColClient FreeColClient
 * @see net.sf.freecol.server.FreeColServer FreeColServer
 */
export class FreeCol extends JObject {
  static logger: Logger = null;
  /**
   * The FreeCol release version number.
   */
  static readonly FREECOL_VERSION: string = '1.2.0';
  /**
   * The FreeCol protocol version number.
   */
  static readonly FREECOL_PROTOCOL_VERSION: string = '0.1.6';
  /**
   * The difficulty levels.
   */
  static DIFFICULTIES: string[] = null;
  /**
   * The extension for FreeCol saved games.
   */
  static readonly FREECOL_SAVE_EXTENSION: string = 'fsg';
  /**
   * The extension for FreeCol maps.
   */
  static readonly FREECOL_MAP_EXTENSION: string = 'fsm';
  /**
   * The Java version.
   */
  static JAVA_VERSION: string = null;
  /**
   * The maximum available memory.
   */
  static MEMORY_MAX: number = 0;
  static readonly CLIENT_THREAD: string = 'FreeColClient:';
  static readonly SERVER_THREAD: string = 'FreeColServer:';
  static readonly METASERVER_THREAD: string = 'FreeColMetaServer:';
  /**
   * Specific revision number (currently the git tag of trunk at release)
   */
  static freeColRevision: string = null;
  /**
   * The locale, either default or command-line specified.
   */
  static locale: Locale = null;
  static ADVANTAGES_DEFAULT: NationOptions$Advantages = null;
  static readonly DIFFICULTY_DEFAULT: string = 'model.difficulty.medium';
  static readonly EUROPEANS_DEFAULT: number = 4;
  static readonly EUROPEANS_MIN: number = 1;
  static readonly GUI_SCALE_DEFAULT: number = 1;
  static readonly GUI_SCALE_MIN_PCT: number = 100;
  static readonly GUI_SCALE_MAX_PCT: number = 200;
  static readonly GUI_SCALE_MIN: number = 1;
  static readonly GUI_SCALE_MAX: number = 2;
  static readonly GUI_SCALE_STEP_PCT: number = 25;
  static readonly GUI_SCALE_STEP: number = 0.25;
  static LOGLEVEL_DEFAULT: Level = null;
  static readonly JAVA_VERSION_MIN: string = '11';
  static readonly MEMORY_MIN: number = 536500000;
  static readonly MEMORY_MIN_IN_MB: number = 512;
  static readonly SOFT_MEMORY_MIN: number = 2000000000;
  static readonly SOFT_MEMORY_MIN_IN_GB: number = 2;
  static readonly META_SERVER_ADDRESS: string = 'meta.freecol.org';
  static readonly META_SERVER_PORT: number = 3540;
  static readonly PORT_DEFAULT: number = 3541;
  static readonly SPLASH_DEFAULT: string = 'splash.jpg';
  static readonly TC_DEFAULT: string = 'default';
  static readonly RULES_DEFAULT: string = 'freecol';
  static readonly TIMEOUT_DEFAULT: number = 60;
  static readonly TIMEOUT_MIN: number = 10;
  static readonly TIMEOUT_MAX: number = 3600000;
  static WINDOWSIZE_FALLBACK: Dimension = null;
  static checkIntegrity: boolean = false;
  static consoleLogging: boolean = false;
  static debugStart: boolean = false;
  static fastStart: boolean = false;
  static headless: boolean = false;
  static introVideo: boolean = false;
  static javaCheck: boolean = false;
  static memoryCheck: boolean = false;
  static publicServer: boolean = false;
  static sound: boolean = false;
  static standAloneServer: boolean = false;
  /**
   * The type of advantages.
   */
  static advantages: NationOptions$Advantages = null;
  /**
   * The difficulty level id.
   */
  static difficulty: string = null;
  /**
   * The number of European nations to enable by default.
   */
  static europeanCount: number = 0;
  /**
   * A font override.
   */
  static fontName: string = null;
  static logLevels: List<FreeCol$LogLevel> = null;
  /**
   * Meta-server location.
   */
  static metaServerAddress: string = null;
  static metaServerPort: number = 0;
  /**
   * The client player name.
   */
  static name_: string = null;
  /**
   * How to name and configure the server.
   */
  static serverAddress: InetAddress = null;
  static serverPort: number = 0;
  static serverName: string = null;
  /**
   * A stream to get the splash image from.
   */
  static splashStream: InputStream = null;
  /**
   * The TotalConversion in play, defaults to "default".
   */
  static tc: string = null;
  /**
   * The ruleset in play, defaults to "freecol".
   */
  static rules: string = null;
  /**
   * The time out (seconds) for otherwise blocking commands.
   */
  static timeout: number = 0;
  /**
   * The size of window to create, defaults to impossible dimensions
   * to require windowed mode with best determined screen size.
   */
  static windowSize: Dimension = null;
  /**
   * The special client options that must be processed early.
   */
  static specialOptions: JMap<string, string> = null;
  /**
   * Definitions for all the options.
   */
  static argDir: string = null;
  static argFile: string = null;
  static optionsTable: string[][] = null;
  _FreeCol(): this {
    return this;
  }
  /**
   * The entrypoint.
   *
   * @param args The command-line arguments.
   */
  static main(args: string[]): void {
    FreeCol.freeColRevision = FreeCol.FREECOL_VERSION;
    let juc: JarURLConnection;
    try {
      juc = FreeCol.getJarURLConnection($J.cls(FreeCol));
    } catch ($e0) {
      if ($J.isa($e0, ClassCastException)) {
        let cce = $J.exc($e0);
        juc = null;
        $J.err.println('Unable to cast class properly: ' + cce.getMessage());
      } else if ($J.isa($e0, IOException)) {
        let ioe = $J.exc($e0);
        juc = null;
        $J.err.println('Unable to open class jar: ' + ioe.getMessage());
      } else {
        throw $e0;
      }
    }
    if (juc != null) {
      try {
        let revision = FreeCol.readVersion(juc);
        if (revision != null) {
          FreeCol.freeColRevision += ' (Revision: ' + revision + ')';
        }
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
          $J.err.println('Unable to load Manifest: ' + e.getMessage());
        } else {
          throw $e1;
        }
      }
      try {
        FreeCol.splashStream = FreeCol.getDefaultSplashStream(juc);
      } catch ($e2) {
        if ($J.isa($e2, Exception)) {
          let e = $J.exc($e2);
          $J.err.println('Unable to open default splash: ' + e.getMessage());
        } else {
          throw $e2;
        }
      }
    }
    let dataDirectoryArg = FreeCol.findArg('--freecol-data', args);
    let err = FreeColDirectories.setDataDirectory(dataDirectoryArg);
    if (err != null) {
      FreeCol.fatal$String(err);
    }
    let localeArg = FreeCol.findArg('--default-locale', args);
    FreeCol.setLocale(localeArg);
    Messages.loadMessageBundle(FreeCol.getLocale());
    FreeCol.handleArgs(args);
    if (FreeCol.javaCheck && $J.compareTo(FreeCol.JAVA_VERSION_MIN, FreeCol.JAVA_VERSION) > 0) {
      FreeCol.fatal$StringTemplate(StringTemplate.template$String('main.javaVersion').addName$String$String('%version%', FreeCol.JAVA_VERSION).addName$String$String('%minVersion%', FreeCol.JAVA_VERSION_MIN));
    }
    if (FreeCol.memoryCheck && FreeCol.MEMORY_MAX < FreeCol.MEMORY_MIN) {
      FreeCol.fatal$StringTemplate(StringTemplate.template$String('main.memory').addAmount('%memory%', FreeCol.MEMORY_MAX).addAmount('%minMemory%', FreeCol.MEMORY_MIN_IN_MB));
    }
    if (FreeCol.memoryCheck && FreeCol.MEMORY_MAX < FreeCol.SOFT_MEMORY_MIN) {
      $J.err.println();
      $J.err.println();
      $J.err.println(Messages.message$StringTemplate(StringTemplate.template$String('main.memoryLow').addAmount('%memory%', FreeCol.MEMORY_MAX).add$String$String('%minMemory%', FreeCol.SOFT_MEMORY_MIN_IN_GB + 'G')));
      $J.err.println();
    }
    let key = FreeColDirectories.setUserDirectories();
    if (key != null) {
      FreeCol.fatal$StringTemplate(key);
    }
    let baseLogger = Logger.getLogger('');
    for (let handler of baseLogger.getHandlers()) {
      baseLogger.removeHandler(handler);
    }
    try {
      let writer = FreeColDirectories.getLogWriter();
      baseLogger.addHandler(new DefaultHandler()._DefaultHandler(FreeCol.consoleLogging, writer));
      for (const $it3 = FreeCol.logLevels.iterator(); $it3.hasNext(); ) {
        let ll = $it3.next();
        ll.buildLogger();
      }
    } catch ($e4) {
      if ($J.isa($e4, FreeColException)) {
        let e = $J.exc($e4);
        $J.err.println('Logging initialization failure: ' + $J.str(e));
      } else {
        throw $e4;
      }
    }
    Thread.setDefaultUncaughtExceptionHandler($J.lambdaObj((thread, e) => {
      baseLogger.log(Level.WARNING, 'Uncaught exception from thread: ' + $J.str(thread), e);
      if ($J.isa(e, JError)) {
        e.printStackTrace();
        $J.system_exit(1);
      }
    }, 'uncaughtException', 'java.lang.Thread$UncaughtExceptionHandler'));
    try {
      FreeCol.specialOptions = ClientOptions.getSpecialOptions();
    } catch ($e5) {
      if ($J.isa($e5, FreeColException)) {
        let fce = $J.exc($e5);
        FreeCol.specialOptions = new HashMap();
        FreeCol.logger.log(Level.WARNING, 'Special options unavailable', fce);
      } else {
        throw $e5;
      }
    }
    let cLang: string;
    if (localeArg == null && (cLang = FreeCol.specialOptions.get(ClientOptions.LANGUAGE)) != null && !JString.equalsIgnoreCase(Messages.AUTOMATIC, cLang) && FreeCol.setLocale(cLang)) {
      let loc = FreeCol.getLocale();
      Messages.loadMessageBundle(loc);
      FreeCol.logger.info('Loaded messages for ' + $J.str(loc));
    }
    FreeColRules.loadRules();
    FreeColModFile.loadMods();
    Messages.loadModMessageBundle(FreeCol.getLocale());
    FreeCol.headless = !!(FreeCol.headless | Utils.isHeadless());
    FreeCol.processSpecialOptions();
    FreeCol.logger.info(FreeCol.getConfiguration().toString());
    if (FreeCol.standAloneServer) {
      FreeCol.startServer();
    } else {
      if (FreeCol.headless) {
        if (!FreeColDebugger.isInDebugMode$() || FreeColDebugger.getDebugRunTurns() <= 0) {
          FreeCol.fatal$Logger$String(FreeCol.logger, Messages.message$String('client.headlessDebug'));
        }
      }
      FreeCol.startClient();
    }
  }
  /**
   * Handle the special options that need to be processed early.
   */
  static processSpecialOptions(): void {
    let lb = new LogBuilder()._LogBuilder(64);
    let pmoffscreen = 'sun.java2d.pmoffscreen';
    let pmoValue = $J.system_getProperty(pmoffscreen);
    if (pmoValue == null) {
      let usePixmaps = FreeCol.specialOptions.get(ClientOptions.USE_PIXMAPS);
      if (usePixmaps != null) {
        $J.system_setProperty(pmoffscreen, usePixmaps);
        lb.add([pmoffscreen, ' using client option: ', usePixmaps]);
      } else {
        lb.add([pmoffscreen, ' unset/ignored: ']);
      }
    } else {
      lb.add([pmoffscreen, ' overrides client option: ', pmoValue]);
    }
    let openGL = 'sun.java2d.opengl';
    let openGLValue = $J.system_getProperty(openGL);
    if (openGLValue == null) {
      let useOpenGL = FreeCol.specialOptions.get(ClientOptions.USE_OPENGL);
      if (useOpenGL != null) {
        $J.system_setProperty(openGL, useOpenGL);
        lb.add([', ', openGL, ' using client option: ', useOpenGL]);
      } else {
        lb.add([', ', openGL, ' unset/ignored']);
      }
    } else {
      lb.add([', ', openGL, ' overrides client option: ', openGLValue]);
    }
    if (OSUtils.onUnix()) {
      let xrender = 'sun.java2d.xrender';
      let xrValue = $J.system_getProperty(xrender);
      if (xrValue == null) {
        let useXR = FreeCol.specialOptions.get(ClientOptions.USE_XRENDER);
        if (useXR != null) {
          $J.system_setProperty(xrender, useXR);
          lb.add([', ', xrender, ' using client option: ', useXR]);
        } else {
          lb.add([', ', xrender, ' unset/ignored']);
        }
      } else {
        lb.add([', ', xrender, ' overrides client option: ', xrValue]);
      }
    }
    lb.log(FreeCol.logger, Level.INFO);
  }
  /**
   * Get the JarURLConnection from a class.
   *
   * @param c The {@code Class} to get the connection for.
   * @return The {@code JarURLConnection}.
   * @exception IOException if the connection fails to open.
   */
  static getJarURLConnection(c: JClass): JarURLConnection {
    let resourceName = '/' + JString.replaceChar(c.getName(), 46 /* '.' */, 47 /* \u002f */) + '.class';
    let url = c.getResource(resourceName);
    return url.openConnection();
  }
  /**
   * Extract the package version from the class.
   *
   * @param juc The {@code JarURLConnection} to extract from.
   * @return A value of the package version attribute.
   * @exception IOException if the manifest is not available.
   */
  static readVersion(juc: JarURLConnection): string {
    let mf = juc.getManifest();
    return (mf == null) ? null : mf.getMainAttributes().getValue('Package-Version');
  }
  /**
   * Get a stream for the default splash file.
   *
   * Note: Not bothering to check for nulls as this is called in try
   * block that ignores all exceptions.
   *
   * @param juc The {@code JarURLConnection} to extract from.
   * @return A suitable {@code InputStream}, or null on error.
   * @exception IOException if the connection fails to open.
   */
  static getDefaultSplashStream(juc: JarURLConnection): InputStream {
    let jf = juc.getJarFile();
    let ze = jf.getEntry(FreeCol.SPLASH_DEFAULT);
    return jf.getInputStream(ze);
  }
  /**
   * Quit FreeCol.  Route all exits through here.
   *
   * @param status Exit status.
   */
  static quit(status: number): void {
    $J.system_exit(status);
  }
  /**
   * Quit and exit with an error.
   *
   * @param logger An optional {@code Logger} to log to.
   * @param err The error message.
   */
  static fatal$Logger$String(logger: Logger, err: string): void {
    if (logger != null) {
      logger.log(Level.SEVERE, err);
    }
    FreeCol.fatal$String(err);
  }
  /**
   * Exit printing fatal error message.
   *
   * @param template A {@code StringTemplate} to print.
   */
  static fatal$StringTemplate(template: StringTemplate): void {
    FreeCol.fatal$String(Messages.message$StringTemplate(template));
  }
  /**
   * Exit printing fatal error message.
   *
   * @param err The error message to print.
   */
  static fatal$String(err: string): void {
    if (err == null || (err.length === 0)) {
      err = 'Bogus null fatal error message';
      Thread.dumpStack();
    }
    $J.err.println(err);
    FreeCol.quit(1);
  }
  /**
   * Just gripe to System.err.
   *
   * @param template A {@code StringTemplate} to print.
   */
  static gripe$StringTemplate(template: StringTemplate): void {
    $J.err.println(Messages.message$StringTemplate(template));
  }
  /**
   * Just gripe to System.err.
   *
   * @param key A message key.
   */
  static gripe$String(key: string): void {
    $J.err.println(Messages.message$String(key));
  }
  /**
   * Log a warning with a stack trace.
   *
   * @param logger The {@code Logger} to log to.
   * @param warn The warning message.
   */
  static trace(logger: Logger, warn: string): void {
    FreeColDebugger.trace(logger, warn);
  }
  /**
   * Find an option before the real option handling can get started.
   * Takes care to use the *last* instance.
   *
   * @param option The option to find.
   * @param args The  command-line arguments.
   * @return The option's parameter.
   */
  static findArg(option: string, args: string[]): string {
    for (let i = (args.length - 2) | 0; i >= 0; i--) {
      if ($J.equals(option, args[i])) {
        return args[(i + 1) | 0];
      }
    }
    return null;
  }
  /**
   * Processes the command-line arguments and takes appropriate
   * actions for each of them.
   *
   * @param args The command-line arguments.
   */
  static handleArgs(args: string[]): void {
    let options = new Options();
    for (let o of FreeCol.optionsTable) {
      let arg = o[3];
      let op = new Option(o[0], o[1], arg != null, ((o[2].startsWith('cli.')) ? Messages.message$String(o[2]) : o[2]));
      if (arg != null) {
        let optional = false;
        if (arg.startsWith('!')) {
          optional = true;
          arg = arg.substring(1, arg.length);
        }
        if (arg.startsWith(FreeCol.argDir) || arg.startsWith(FreeCol.argFile)) {
          op.setType($J.cls(File));
        }
        if (arg.startsWith('cli.')) {
          arg = Messages.message$String(arg);
        }
        op.setArgName(arg);
        op.setOptionalArg(optional);
      }
      options.addOption(op);
    }
    let parser = new DefaultParser();
    let usageError = false;
    try {
      let line = parser.parse(options, args);
      if (line.hasOption('help') || line.hasOption('usage')) {
        FreeCol.printUsage(options, 0);
      }
      if (line.hasOption('advantages')) {
        let arg = line.getOptionValue('advantages');
        let a = FreeCol.selectAdvantages(arg);
        if (a == null) {
          FreeCol.fatal$StringTemplate(StringTemplate.template$String('cli.error.advantages').addName$String$String('%advantages%', FreeCol.getValidAdvantages()).addName$String$String('%arg%', arg));
        }
      }
      if (line.hasOption('check-savegame')) {
        let arg = line.getOptionValue('check-savegame');
        if (!FreeColDirectories.setSavegameFile(arg)) {
          FreeCol.fatal$StringTemplate(StringTemplate.template$String('cli.err.save').addName$String$String('%string%', arg));
        }
        FreeCol.checkIntegrity = true;
        FreeCol.standAloneServer = true;
      }
      if (line.hasOption('clientOptions')) {
        let fileName = line.getOptionValue('clientOptions');
        if (!FreeColDirectories.setClientOptionsFile(fileName)) {
          FreeCol.gripe$StringTemplate(StringTemplate.template$String('cli.error.clientOptions').addName$String$String('%string%', fileName));
        }
      }
      if (line.hasOption('debug')) {
        let arg = line.getOptionValue('debug');
        if (arg == null || (arg.length === 0)) {
          arg = FreeColDebugger$DebugMode.MENUS.toString();
        }
        if (!FreeColDebugger.setDebugModes(arg)) {
          FreeCol.gripe$StringTemplate(StringTemplate.template$String('cli.error.debug').addName$String$String('%modes%', FreeColDebugger.getDebugModes()));
        }
        FreeCol.logLevels.add(new FreeCol$LogLevel()._FreeCol$LogLevel('', Level.FINEST));
      }
      if (line.hasOption('debug-run')) {
        FreeColDebugger.enableDebugMode(FreeColDebugger$DebugMode.MENUS);
        FreeColDebugger.configureDebugRun(line.getOptionValue('debug-run'));
      }
      if (line.hasOption('debug-start')) {
        FreeCol.debugStart = true;
        FreeColDebugger.enableDebugMode(FreeColDebugger$DebugMode.MENUS);
      }
      if (line.hasOption('difficulty')) {
        let arg = line.getOptionValue('difficulty');
        let difficulty = FreeCol.selectDifficulty(arg);
        if (difficulty == null) {
          FreeCol.fatal$StringTemplate(StringTemplate.template$String('cli.error.difficulties').addName$String$String('%difficulties%', FreeCol.getValidDifficulties()).addName$String$String('%arg%', arg));
        }
      }
      if (line.hasOption('europeans')) {
        let e = FreeCol.selectEuropeanCount(line.getOptionValue('europeans'));
        if (e < 0) {
          FreeCol.gripe$StringTemplate(StringTemplate.template$String('cli.error.europeans').addAmount('%min%', FreeCol.EUROPEANS_MIN));
        }
      }
      if (line.hasOption('fast')) {
        FreeCol.fastStart = true;
        FreeCol.introVideo = false;
      }
      if (line.hasOption('font')) {
        FreeCol.fontName = line.getOptionValue('font');
      }
      if (line.hasOption('full-screen')) {
        FreeCol.windowSize = null;
      }
      if (line.hasOption('headless')) {
        FreeCol.headless = true;
      }
      if (line.hasOption('load-savegame')) {
        let arg = line.getOptionValue('load-savegame');
        if (!FreeColDirectories.setSavegameFile(arg)) {
          FreeCol.fatal$StringTemplate(StringTemplate.template$String('cli.error.save').addName$String$String('%string%', arg));
        }
      }
      if (line.hasOption('log-console')) {
        FreeCol.consoleLogging = true;
      }
      if (line.hasOption('log-file')) {
        FreeColDirectories.setLogFilePath(line.getOptionValue('log-file'));
      }
      if (line.hasOption('log-level')) {
        for (let value of line.getOptionValues('log-level')) {
          let s = JString.split(value, ':');
          FreeCol.logLevels.add((s.length === 1) ? new FreeCol$LogLevel()._FreeCol$LogLevel('', Level.parse(StringUtils.upCase$String(s[0]))) : new FreeCol$LogLevel()._FreeCol$LogLevel(s[0], Level.parse(StringUtils.upCase$String(s[1]))));
        }
      }
      if (line.hasOption('meta-server')) {
        let arg = line.getOptionValue('meta-server');
        if (!FreeCol.setMetaServer(arg)) {
          FreeCol.gripe$StringTemplate(StringTemplate.template$String('cli.error.meta-server').addName$String$String('%arg%', arg));
        }
      }
      if (line.hasOption('name')) {
        FreeCol.setName(line.getOptionValue('name'));
      }
      if (line.hasOption('no-intro')) {
        FreeCol.introVideo = false;
      }
      if (line.hasOption('no-java-check')) {
        FreeCol.javaCheck = false;
      }
      if (line.hasOption('no-memory-check')) {
        FreeCol.memoryCheck = false;
      }
      if (line.hasOption('no-sound')) {
        FreeCol.sound = false;
      }
      if (line.hasOption('no-splash')) {
        FreeCol.splashStream = null;
      }
      if (line.hasOption('private')) {
        FreeCol.publicServer = false;
      }
      if (line.hasOption('server')) {
        FreeCol.standAloneServer = true;
      }
      if (line.hasOption('server-name')) {
        FreeCol.serverName = line.getOptionValue('server-name');
      }
      if (line.hasOption('server-port')) {
        let arg = line.getOptionValue('server-port');
        if (!FreeCol.setServerPort(arg)) {
          FreeCol.fatal$StringTemplate(StringTemplate.template$String('cli.error.serverPort').addName$String$String('%string%', arg));
        }
      }
      if (line.hasOption('server-ip')) {
        let arg = line.getOptionValue('server-ip');
        if (!FreeCol.setServerAddress(arg)) {
          FreeCol.fatal$StringTemplate(StringTemplate.template$String('cli.error.serverIp').addName$String$String('%string%', arg));
        }
      }
      let seeded = (line.hasOption('seed') && FreeColSeed.setFreeColSeed(line.getOptionValue('seed')));
      if (!seeded) {
        FreeColSeed.generateFreeColSeed();
      }
      if (line.hasOption('splash')) {
        let splash = line.getOptionValue('splash');
        try {
          let fis = Files.newInputStream(Paths.get(splash));
          FreeCol.splashStream = fis;
        } catch ($e6) {
          if ($J.isa($e6, IOException)) {
            let ioe = $J.exc($e6);
            FreeCol.gripe$StringTemplate(StringTemplate.template$String('cli.error.splash').addName$String$String('%name%', splash));
          } else {
            throw $e6;
          }
        }
      }
      if (line.hasOption('tc')) {
        FreeCol.setTc(line.getOptionValue('tc'));
      }
      if (line.hasOption('rules')) {
        FreeCol.setRules(line.getOptionValue('rules'));
      }
      if (line.hasOption('timeout')) {
        let arg = line.getOptionValue('timeout');
        try {
          FreeCol.setTimeout(arg);
        } catch ($e7) {
          if ($J.isa($e7, NumberFormatException)) {
            let nfe = $J.exc($e7);
            FreeCol.gripe$StringTemplate(StringTemplate.template$String('cli.error.timeout').addName$String$String('%string%', arg).addName$String$String('%minimum%', String(FreeCol.TIMEOUT_MIN)));
          } else {
            throw $e7;
          }
        }
      }
      if (line.hasOption('user-cache-directory')) {
        let arg = line.getOptionValue('user-cache-directory');
        let errMsg = FreeColDirectories.setUserCacheDirectory(arg);
        if (errMsg != null) {
          FreeCol.gripe$StringTemplate(StringTemplate.template$String(errMsg).addName$String$String('%string%', arg));
        }
      }
      if (line.hasOption('user-config-directory')) {
        let arg = line.getOptionValue('user-config-directory');
        let errMsg = FreeColDirectories.setUserConfigDirectory(arg);
        if (errMsg != null) {
          FreeCol.gripe$StringTemplate(StringTemplate.template$String(errMsg).addName$String$String('%string%', arg));
        }
      }
      if (line.hasOption('user-data-directory')) {
        let arg = line.getOptionValue('user-data-directory');
        let errMsg = FreeColDirectories.setUserDataDirectory(arg);
        if (errMsg != null) {
          FreeCol.fatal$StringTemplate(StringTemplate.template$String(errMsg).addName$String$String('%string%', arg));
        }
      }
      if (line.hasOption('version')) {
        $J.out.println('FreeCol ' + FreeCol.getVersion());
        FreeCol.quit(0);
      }
      if (line.hasOption('windowed')) {
        let arg = line.getOptionValue('windowed');
        FreeCol.setWindowSize(arg);
      }
    } catch ($e8) {
      if ($J.isa($e8, ParseException)) {
        let e = $J.exc($e8);
        $J.err.println('\n' + e.getMessage() + '\n');
        usageError = true;
      } else {
        throw $e8;
      }
    }
    if (usageError) {
      FreeCol.printUsage(options, 1);
    }
  }
  /**
   * Prints the usage message and exits.
   *
   * @param options The command line {@code Options}.
   * @param status The status to exit with.
   */
  static printUsage(options: Options, status: number): void {
    let formatter = new HelpFormatter();
    formatter.printHelp('java -Xmx2G -jar freecol.jar [OPTIONS]', options);
    FreeCol.quit(status);
  }
  /**
   * Get the specification from a given TC file.
   *
   * @param rulesFile The {@code FreeColModFile} to load.
   * @param advantages An optional {@code Advantages} setting.
   * @param difficulty An optional difficulty level.
   * @return A {@code Specification}.
   */
  static loadSpecification(rulesFile: FreeColModFile, advantages: NationOptions$Advantages, difficulty: string): Specification {
    let spec = null;
    try {
      if (rulesFile != null) {
        spec = rulesFile.getSpecification();
      }
    } catch ($e9) {
      if ($J.isa($e9, IOException) || $J.isa($e9, XMLStreamException)) {
        let ex = $J.exc($e9);
        $J.err.println('Spec read failed in ' + rulesFile.getId() + ': ' + ex.getMessage() + '\n');
      } else {
        throw $e9;
      }
    }
    if (spec != null) {
      spec.prepare$Advantages$String(advantages, difficulty);
    }
    return spec;
  }
  /**
   * Get the specification from the currently selected rules.
   *
   * @return A {@code Specification}, quits on error.
   */
  static getRulesSpecification(): Specification {
    let spec = FreeCol.loadSpecification(FreeCol.getRulesFile(), FreeCol.getAdvantages(), FreeCol.getDifficulty());
    if (spec == null) {
      FreeCol.fatal$StringTemplate(StringTemplate.template$String('cli.error.badTC').addName$String$String('%tc%', FreeCol.getRules()));
    }
    return spec;
  }
  /**
   * Are we in headless mode, either externally true or explicitly
   * from the command line.
   *
   * @return True if in headless mode.
   */
  static getHeadless(): boolean {
    return FreeCol.headless;
  }
  /**
   * Set the headless state.
   *
   * Used by the test suite.
   *
   * @param newHeadless The new headless state.
   */
  static setHeadless(newHeadless: boolean): void {
    FreeCol.headless = newHeadless;
  }
  /**
   * Gets the default advantages type.
   *
   * @return Usually Advantages.SELECTABLE, but can be overridden at the
   *     command line.
   */
  static getAdvantages(): NationOptions$Advantages {
    return (FreeCol.advantages == null) ? FreeCol.ADVANTAGES_DEFAULT : FreeCol.advantages;
  }
  /**
   * Sets the advantages type.
   *
   * Called from NewPanel when a selection is made.
   *
   * @param as The name of the new advantages type.
   * @return The type of advantages set, or null if none.
   */
  static selectAdvantages(as$: string): NationOptions$Advantages {
    let a = CollectionUtils.find$ObjectArr$Predicate(NationOptions$Advantages.values(), Messages.matchesNamed(as$));
    if (a != null) {
      FreeCol.setAdvantages(a);
    }
    return a;
  }
  /**
   * Sets the advantages type.
   *
   * @param advantages The new {@code Advantages} type.
   */
  static setAdvantages(advantages: NationOptions$Advantages): void {
    FreeCol.advantages = advantages;
  }
  /**
   * Gets a comma separated list of localized advantage type names.
   *
   * @return A list of advantage types.
   */
  static getValidAdvantages(): string {
    return CollectionUtils.transform$ObjectArr$Predicate$Function$Collector(NationOptions$Advantages.values(), CollectionUtils.alwaysTrue(), (a) => Messages.getName$Named(a), Collectors.joining(','));
  }
  /**
   * Get a description for the advantages argument.
   *
   * @return A suitable description.
   */
  static getAdvantagesDescription(): string {
    return Messages.message$StringTemplate(StringTemplate.template$String('cli.advantages').addName$String$String('%advantages%', FreeCol.getValidAdvantages()));
  }
  /**
   * Get a description for the debug argument.
   *
   * @return A suitable description.
   */
  static getDebugDescription(): string {
    return Messages.message$StringTemplate(StringTemplate.template$String('cli.debug').addName$String$String('%modes%', FreeColDebugger.getDebugModes()));
  }
  /**
   * Gets the difficulty level.
   *
   * @return The name of a difficulty level.
   */
  static getDifficulty(): string {
    return (FreeCol.difficulty == null) ? FreeCol.DIFFICULTY_DEFAULT : FreeCol.difficulty;
  }
  /**
   * Selects a difficulty level.
   *
   * @param arg The supplied difficulty argument.
   * @return The name of the selected difficulty, or null if none.
   */
  static selectDifficulty(arg: string): string {
    let difficulty = CollectionUtils.find$Stream$Predicate(CollectionUtils.map$ObjectArr$Function(FreeCol.DIFFICULTIES, (d) => 'model.difficulty.' + d), Messages.matchesName(arg));
    if (difficulty != null) {
      FreeCol.setDifficulty$String(difficulty);
    }
    return difficulty;
  }
  /**
   * Sets the difficulty level.
   *
   * @param difficulty The actual {@code OptionGroup}
   *     containing the difficulty level.
   */
  static setDifficulty$OptionGroup(difficulty: OptionGroup): void {
    FreeCol.setDifficulty$String(difficulty.getId());
  }
  /**
   * Sets the difficulty level.
   *
   * @param difficulty The new difficulty.
   */
  static setDifficulty$String(difficulty: string): void {
    FreeCol.difficulty = difficulty;
  }
  /**
   * Gets the names of the valid difficulty levels.
   *
   * @return The valid difficulty levels, comma separated.
   */
  static getValidDifficulties(): string {
    return CollectionUtils.transform$ObjectArr$Predicate$Function$Collector(FreeCol.DIFFICULTIES, CollectionUtils.alwaysTrue(), (d) => Messages.getName$String('model.difficulty.' + d), Collectors.joining(','));
  }
  /**
   * Get the number of European nations to enable by default.
   *
   * @return The default European nation count.
   */
  static getEuropeanCount(): number {
    return FreeCol.europeanCount;
  }
  /**
   * Sets the number of enabled European nations.
   *
   * @param n The number of nations to enable.
   */
  static setEuropeanCount(n: number): void {
    FreeCol.europeanCount = n;
  }
  /**
   * Gets the valid scale factors for the GUI.
   *
   * @return A string containing these.
   */
  static getValidGUIScales(): string {
    let sb = new StringBuilder(64);
    for (let i = FreeCol.GUI_SCALE_MIN_PCT; i <= FreeCol.GUI_SCALE_MAX_PCT; i = (i + FreeCol.GUI_SCALE_STEP_PCT) | 0) {
      sb.append(String(i)).append(String.fromCharCode(44 /* ',' */));
    }
    sb.setLength((sb.length() - 1) | 0);
    return sb.toString();
  }
  /**
   * Selects a European nation count.
   *
   * @param arg The supplied count argument.
   * @return A valid nation number, or negative on error.
   */
  static selectEuropeanCount(arg: string): number {
    try {
      let n = $J.parseInt(arg);
      if (n >= FreeCol.EUROPEANS_MIN) {
        FreeCol.setEuropeanCount(n);
        return n;
      }
    } catch ($e10) {
      if ($J.isa($e10, NumberFormatException)) {
        let nfe = $J.exc($e10);
      } else {
        throw $e10;
      }
    }
    return -1;
  }
  /**
   * Get the meta-server address.
   *
   * @return The current meta-server address.
   */
  static getMetaServerAddress(): string {
    return FreeCol.metaServerAddress;
  }
  /**
   * Get the meta-server port.
   *
   * @return The current meta-server port.
   */
  static getMetaServerPort(): number {
    return FreeCol.metaServerPort;
  }
  /**
   * Set the meta-server location.
   *
   * @param arg The new meta-server location in HOST:PORT format.
   * @return True if the location was set.
   */
  static setMetaServer(arg: string): boolean {
    let s = JString.split(arg, ':');
    let port = -1;
    try {
      port = (s.length === 2) ? $J.parseInt(s[1]) : -1;
    } catch ($e11) {
      if ($J.isa($e11, NumberFormatException)) {
        let nfe = $J.exc($e11);
      } else {
        throw $e11;
      }
    }
    if (s.length !== 2 || s[0] == null || $J.equals('', s[0])) {
      return false;
    }
    FreeCol.metaServerAddress = s[0];
    FreeCol.metaServerPort = port;
    return true;
  }
  /**
   * Gets the user name.
   *
   * @return The user name, defaults to the user.name property, then to
   *     the "main.defaultPlayerName" message value.
   */
  static getName(): string {
    return (FreeCol.name_ != null) ? FreeCol.name_ : $J.system_getProperty('user.name', Messages.message$String('main.defaultPlayerName'));
  }
  /**
   * Sets the user name.
   *
   * @param name The new user name.
   */
  static setName(name: string): void {
    FreeCol.name_ = name;
    FreeCol.logger.info('Set FreeCol.name = ' + name);
  }
  /**
   * Get the selected locale.
   *
   * @return The {@code Locale} currently in use.
   */
  static getLocale(): Locale {
    return (FreeCol.locale == null) ? Locale.getDefault() : FreeCol.locale;
  }
  /**
   * Set the locale.
   *
   * Public for the test suite.
   *
   * @param localeArg The locale specification, null implies the
   *     default locale.
   * @return True if the {@code Locale} changed.
   */
  static setLocale(localeArg: string): boolean {
    let newLocale = null;
    if (localeArg == null) {
      newLocale = Locale.getDefault();
    } else {
      let index = localeArg.indexOf(String.fromCharCode(46 /* '.' */));
      if (index > 0) {
        localeArg = localeArg.substring(0, index);
      }
      newLocale = Messages.getLocale(localeArg);
    }
    if (newLocale !== FreeCol.locale) {
      FreeCol.locale = newLocale;
      Locale.setDefault(newLocale);
      return true;
    }
    return false;
  }
  /**
   * Gets the current revision of game.
   *
   * @return The current version and SVN Revision of the game.
   */
  static getRevision(): string {
    return FreeCol.freeColRevision;
  }
  /**
   * Get the default server host name.
   *
   * @return The host name.
   */
  static getServerHost(): string {
    try {
      return InetAddress.getLocalHost().getHostAddress();
    } catch ($e12) {
      if ($J.isa($e12, Exception)) {
        let e = $J.exc($e12);
      } else {
        throw $e12;
      }
    }
    return InetAddress.getLoopbackAddress().getHostAddress();
  }
  /**
   * Gets the server network port.
   *
   * @return The port number the server will be listening on.
   */
  static getServerPort(): number {
    return (FreeCol.serverPort < 0) ? FreeCol.PORT_DEFAULT : FreeCol.serverPort;
  }
  /**
   * Gets the server address.
   *
   * @return The {@code InetAddress} the server will be listening on.
   */
  static getServerName(): InetAddress {
    try {
      return (FreeCol.serverAddress == null) ? InetAddress.getByName('0.0.0.0') : FreeCol.serverAddress;
    } catch ($e13) {
      if ($J.isa($e13, UnknownHostException)) {
        let e = $J.exc($e13);
        return InetAddress.getLoopbackAddress();
      } else {
        throw $e13;
      }
    }
  }
  /**
   * Sets the server port.
   *
   * @param arg The server port number.
   * @return True if the port was set.
   */
  static setServerPort(arg: string): boolean {
    if (arg == null) {
      return false;
    }
    try {
      FreeCol.serverPort = $J.parseInt(arg);
    } catch ($e14) {
      if ($J.isa($e14, NumberFormatException)) {
        let nfe = $J.exc($e14);
        return false;
      } else {
        throw $e14;
      }
    }
    return true;
  }
  /**
   * Sets the server address.
   *
   * @param arg The server address.
   * @return True if the address was set.
   */
  static setServerAddress(arg: string): boolean {
    if (arg == null) {
      return false;
    }
    try {
      FreeCol.serverAddress = InetAddress.getByName(arg);
    } catch ($e15) {
      if ($J.isa($e15, UnknownHostException)) {
        let e = $J.exc($e15);
        return false;
      } else {
        throw $e15;
      }
    }
    return true;
  }
  /**
   * Gets the current Total-Conversion.
   *
   * @return Usually TC_DEFAULT, but can be overridden at the command line.
   */
  static getTc(): string {
    return (FreeCol.tc == null) ? FreeCol.TC_DEFAULT : FreeCol.tc;
  }
  /**
   * Sets the Total-Conversion.
   *
   * Called from NewPanel when a selection is made.
   *
   * @param tc The name of the new total conversion.
   */
  static setTc(tc: string): void {
    FreeCol.tc = tc;
  }
  /**
   * Gets the current rules
   *
   * @return Usually RULES_DEFAULT, but can be overridden at the command line.
   */
  static getRules(): string {
    return (FreeCol.rules == null) ? FreeCol.RULES_DEFAULT : FreeCol.rules;
  }
  /**
   * Sets the rules.
   *
   * Called from NewPanel when a selection is made.
   *
   * @param tc The name of the new total conversion.
   */
  static setRules(tc: string): void {
    FreeCol.rules = tc;
  }
  /**
   * Gets the FreeColModFile for the current rules.
   *
   * @return The {@code FreeColModFile}.
   */
  static getRulesFile(): FreeColModFile {
    return FreeColRules.getFreeColRulesFile(FreeCol.getRules());
  }
  /**
   * Gets the timeout.
   * Use the command line specified one if any, otherwise default
   * to `infinite' in single player and the TIMEOUT_DEFAULT for
   * multiplayer.
   *
   * @param singlePlayer True if this is a single player game.
   * @return A suitable timeout value.
   */
  static getTimeout(singlePlayer: boolean): number {
    if (FreeCol.timeout < 0) {
      FreeCol.timeout = (singlePlayer) ? FreeCol.TIMEOUT_MAX : FreeCol.TIMEOUT_DEFAULT;
    }
    return FreeCol.timeout;
  }
  /**
   * Sets the timeout.
   *
   * @param timeout A string containing the new timeout.
   */
  static setTimeout(timeout: string): void {
    let result = $J.parseLong(timeout);
    if (FreeCol.TIMEOUT_MIN <= result && result <= FreeCol.TIMEOUT_MAX) {
      FreeCol.timeout = result;
    }
  }
  /**
   * Gets the current version of game.
   *
   * @return The current version of the game using the format "x.y.z",
   *         where "x" is major, "y" is minor and "z" is revision.
   */
  static getVersion(): string {
    return FreeCol.FREECOL_VERSION;
  }
  /**
   * Gets the current version of the FreeCol protocol.
   *
   * @return The version of the FreeCol protocol.
   */
  static getFreeColProtocolVersion(): string {
    return FreeCol.FREECOL_PROTOCOL_VERSION;
  }
  /**
   * Sets the window size.
   *
   * Does not fail because any empty or invalid value is interpreted as
   * `windowed but use as much screen as possible'.
   *
   * @param arg The window size specification.
   */
  static setWindowSize(arg: string): void {
    FreeCol.windowSize = FreeCol.WINDOWSIZE_FALLBACK;
    if (arg != null) {
      let xy = JString.split(arg, '[^0-9]');
      if (xy.length === 2) {
        try {
          FreeCol.windowSize = new Dimension()._Dimension$int$int($J.parseInt(xy[0]), $J.parseInt(xy[1]));
        } catch ($e16) {
          if ($J.isa($e16, NumberFormatException)) {
            let nfe = $J.exc($e16);
          } else {
            throw $e16;
          }
        }
      }
    }
  }
  /**
   * Generate a failure message depending on a file parameter.
   *
   * @param messageId The failure message identifier.
   * @param file The {@code File} that caused the failure.
   * @return A {@code StringTemplate} with the error message.
   */
  static badFile(messageId: string, file: File): StringTemplate {
    return StringTemplate.template$String(messageId).addName$String$String('%name%', (file == null) ? '-' : file.getPath());
  }
  /**
   * Build an error template from an exception.
   *
   * @param ex The {@code Exception} to make an error from.
   * @param fallbackKey A message key to use to make a fallback message
   *     if the exception is unsuitable.
   * @return An error {@code StringTemplate}.
   */
  static errorFromException$Exception$String(ex: Exception, fallbackKey: string): StringTemplate {
    return FreeCol.errorFromException$Exception$StringTemplate(ex, StringTemplate.template$String(fallbackKey));
  }
  /**
   * Build an error template from an exception.
   *
   * @param ex The {@code Exception} to make an error from.
   * @param fallback A {@code StringTemplate} to use as a fall
   *     back if the exception is unsuitable.
   * @return An error {@code StringTemplate}.
   */
  static errorFromException$Exception$StringTemplate(ex: Exception, fallback: StringTemplate): StringTemplate {
    if (ex instanceof FreeColUserMessageException) {
      return (ex).getStringTemplate();
    }
    let msg: string;
    return (ex == null || (msg = ex.getMessage()) == null) ? fallback : (Messages.containsKey(msg)) ? StringTemplate.template$String(msg) : (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) ? StringTemplate.name_(msg) : fallback;
  }
  /**
   * We get a lot of lame bug reports with insufficient configuration
   * information.  Get a buffer containing as much information as we can
   * to embed in the log file and saved games.
   *
   * @return A {@code StringBuilder} full of configuration information.
   */
  static getConfiguration(): StringBuilder {
    let autosave = FreeColDirectories.getAutosaveDirectory();
    let clientOptionsFile = FreeColDirectories.getClientOptionsFile();
    let save = FreeColDirectories.getSaveDirectory();
    let userConfig = FreeColDirectories.getUserConfigDirectory();
    let userData = FreeColDirectories.getUserDataDirectory();
    let userMods = FreeColDirectories.getUserModsDirectory();
    let sb = new StringBuilder(256);
    sb.append('Configuration:').append('\n  version     ').append(FreeCol.getRevision()).append('\n  java:       ').append(FreeCol.JAVA_VERSION).append('\n  memory:     ').append(String(FreeCol.MEMORY_MAX)).append('\n  locale:     ').append($J.str(FreeCol.getLocale())).append('\n  data:       ').append(FreeColDirectories.getDataDirectory().getPath()).append('\n  userConfig: ').append((userConfig == null) ? 'NONE' : userConfig.getPath()).append('\n  userData:   ').append((userData == null) ? 'NONE' : userData.getPath()).append('\n  autosave:   ').append((autosave == null) ? 'NONE' : autosave.getPath()).append('\n  logFile:    ').append(FreeColDirectories.getLogFilePath()).append('\n  options:    ').append((clientOptionsFile == null) ? 'NONE' : clientOptionsFile.getPath()).append('\n  save:       ').append((save == null) ? 'NONE' : save.getPath()).append('\n  userMods:   ').append((userMods == null) ? 'NONE' : userMods.getPath()).append('\n  seed:       ').append(String(FreeColSeed.getFreeColSeed())).append('\n  debug:      ').append(FreeColDebugger.getDebugModes());
    return sb;
  }
  /**
   * Start a client.
   */
  static startClient(): void {
    SwingUtilities.invokeLater(() => {
      let splashScreen = FreeCol.createSplashScreen();
      SwingUtilities.invokeLater(() => {
        let spec = null;
        let savegame = FreeColDirectories.getSavegameFile();
        if (FreeCol.debugStart) {
          spec = FreeCol.getRulesSpecification();
        } else if (FreeCol.fastStart) {
          if (savegame == null) {
            savegame = FreeColDirectories.getLastSaveGameFile();
            if (savegame == null) {
              spec = FreeCol.getRulesSpecification();
            }
          }
        }
        new FreeColClient()._FreeColClient(splashScreen, FreeCol.fontName, FreeCol.windowSize, null, FreeCol.sound, FreeCol.introVideo, savegame, spec);
      });
    });
  }
  static createSplashScreen(): SplashScreen {
    let splashScreen = null;
    if (FreeCol.splashStream != null) {
      try {
        let defaultScreenDevice = Utils.getGoodGraphicsDevice();
        splashScreen = new SplashScreen()._SplashScreen(defaultScreenDevice, FreeCol.splashStream);
        splashScreen.setVisible(true);
      } catch ($e17) {
        if ($J.isa($e17, Exception)) {
          let e = $J.exc($e17);
          FreeCol.logger.log(Level.WARNING, 'Splash screen failure', e);
        } else {
          throw $e17;
        }
      }
    }
    return splashScreen;
  }
  /**
   * Wrapper for the test suite to start a test client.
   *
   * @param spec The {@code Specification} to use in the new client.
   * @return The new {@code FreeColClient}.
   */
  static startTestClient(spec: Specification): FreeColClient {
    FreeCol.setHeadless(true);
    return new FreeColClient()._FreeColClient(null, null, null, null, false, false, null, spec);
  }
  /**
   * Check the integrity of a FreeCol server.
   *
   * @param freeColServer The server to check.
   */
  static checkServerIntegrity(freeColServer: FreeColServer): void {
    let key: string;
    let ret: number;
    let integ = Constants$IntegrityType.INTEGRITY_GOOD;
    if (freeColServer == null) {
      FreeCol.logger.warning('Integrity test blocked');
      integ = integ.fail();
    } else {
      integ = freeColServer.getIntegrity();
    }
    switch (integ) {
      case Constants$IntegrityType.INTEGRITY_GOOD:
        key = 'cli.check-savegame.success';
        ret = 0;
        break;
      case Constants$IntegrityType.INTEGRITY_FIXED:
        key = 'cli.check-savegame.fixed';
        ret = 2;
        break;
      default:
        key = 'cli.check-savegame.failed';
        ret = 3;
        break;
    }
    FreeCol.gripe$StringTemplate(StringTemplate.template$String(key).add$String$String('%log%', FreeColDirectories.getLogFilePath()));
    FreeCol.quit(ret);
  }
  /**
   * Start the server.
   */
  static startServer(): void {
    FreeCol.logger.info('Starting stand-alone server.');
    let freeColServer: FreeColServer;
    let saveGame = FreeColDirectories.getSavegameFile();
    if (saveGame != null) {
      try {
        let fis = new FreeColSavegameFile()._FreeColSavegameFile(saveGame);
        freeColServer = new FreeColServer()._FreeColServer$FreeColSavegameFile$Specification$InetAddress$int$String(fis, null, FreeCol.serverAddress, FreeCol.serverPort, FreeCol.serverName);
        freeColServer.setPublicServer(FreeCol.publicServer);
        if (!freeColServer.registerWithMetaServer()) {
          FreeCol.fatal$String(Messages.message$String('server.noRouteToServer'));
        }
      } catch ($e18) {
        if ($J.isa($e18, Exception)) {
          let e = $J.exc($e18);
          FreeCol.logger.log(Level.SEVERE, 'Load fail', e);
          FreeCol.fatal$String(Messages.message$StringTemplate(FreeCol.badFile('error.couldNotLoad', saveGame)) + ': ' + $J.str(e));
          freeColServer = null;
        } else {
          throw $e18;
        }
      }
      if (FreeCol.checkIntegrity) {
        FreeCol.checkServerIntegrity(freeColServer);
      }
      if (freeColServer == null) {
        return;
      }
    } else {
      let spec = FreeCol.getRulesSpecification();
      try {
        freeColServer = new FreeColServer()._FreeColServer$boolean$boolean$Specification$InetAddress$int$String(FreeCol.publicServer, false, spec, FreeCol.serverAddress, FreeCol.serverPort, FreeCol.serverName);
        if (!freeColServer.registerWithMetaServer()) {
          FreeCol.fatal$String(Messages.message$String('server.noRouteToServer'));
        }
      } catch ($e19) {
        if ($J.isa($e19, Exception)) {
          let e = $J.exc($e19);
          FreeCol.fatal$String(Messages.message$String('server.initialize') + ': ' + e.getMessage());
          return;
        } else {
          throw $e19;
        }
      }
      if (FreeCol.publicServer && !freeColServer.getPublicServer()) {
        FreeCol.gripe$String(Messages.message$String('server.noRouteToServer'));
      }
    }
    let quit = FreeCol.SERVER_THREAD + 'Quit Game';
    let controller = freeColServer.getController();
    Runtime.getRuntime().addShutdownHook(new (FreeCol$1())().$c(controller)._Thread(quit));
  }
  static $clinit() {
    $J.system_setProperty('sun.java2d.uiScale', '1.0');
    $J.system_setProperty('sun.java2d.uiScale.enabled', 'false');
    FreeCol.logger = Logger.getLogger($J.cls(FreeCol).getName());
    FreeCol.DIFFICULTIES = ['veryEasy', 'easy', 'medium', 'hard', 'veryHard'];
    FreeCol.JAVA_VERSION = $J.system_getProperty('java.version');
    FreeCol.MEMORY_MAX = Runtime.getRuntime().maxMemory();
    FreeCol.freeColRevision = null;
    FreeCol.locale = null;
    FreeCol.ADVANTAGES_DEFAULT = NationOptions$Advantages.SELECTABLE;
    FreeCol.LOGLEVEL_DEFAULT = Level.INFO;
    FreeCol.WINDOWSIZE_FALLBACK = new Dimension()._Dimension$int$int(-1, -1);
    FreeCol.checkIntegrity = false;
    FreeCol.consoleLogging = false;
    FreeCol.debugStart = false;
    FreeCol.fastStart = false;
    FreeCol.headless = false;
    FreeCol.introVideo = true;
    FreeCol.javaCheck = true;
    FreeCol.memoryCheck = true;
    FreeCol.publicServer = true;
    FreeCol.sound = true;
    FreeCol.standAloneServer = false;
    FreeCol.advantages = null;
    FreeCol.difficulty = null;
    FreeCol.europeanCount = FreeCol.EUROPEANS_DEFAULT;
    FreeCol.fontName = null;
    FreeCol.logLevels = new ArrayList();
    FreeCol.logLevels.add(new FreeCol$LogLevel()._FreeCol$LogLevel('', FreeCol.LOGLEVEL_DEFAULT));
    FreeCol.metaServerAddress = FreeCol.META_SERVER_ADDRESS;
    FreeCol.metaServerPort = FreeCol.META_SERVER_PORT;
    FreeCol.name_ = null;
    FreeCol.serverAddress = null;
    FreeCol.serverPort = -1;
    FreeCol.serverName = null;
    FreeCol.tc = null;
    FreeCol.rules = null;
    FreeCol.timeout = -1;
    FreeCol.windowSize = FreeCol.WINDOWSIZE_FALLBACK;
    FreeCol.specialOptions = null;
    FreeCol.argDir = 'cli.arg.directory';
    FreeCol.argFile = 'cli.arg.file';
    FreeCol.optionsTable = [['?', 'usage', 'cli.help', null], ['@', 'help', 'cli.help', null], ['d', 'freecol-data', 'cli.freecol-data', FreeCol.argDir], ['L', 'default-locale', 'cli.default-locale', 'cli.arg.locale'], ['a', 'advantages', FreeCol.getAdvantagesDescription(), 'cli.arg.advantages'], [null, 'check-savegame', 'cli.check-savegame', FreeCol.argFile], ['O', 'clientOptions', 'cli.clientOptions', 'cli.arg.clientOptions'], [null, 'debug', FreeCol.getDebugDescription(), 'cli.arg.debug'], ['R', 'debug-run', 'cli.debug-run', 'cli.arg.debugRun'], ['S', 'debug-start', 'cli.debug-start', null], ['D', 'difficulty', 'cli.difficulty', 'cli.arg.difficulty'], ['e', 'europeans', 'cli.european-count', 'cli.arg.europeans'], [null, 'fast', 'cli.fast', null], ['f', 'font', 'cli.font', 'cli.arg.font'], ['F', 'full-screen', 'cli.full-screen', null], ['H', 'headless', 'cli.headless', null], ['l', 'load-savegame', 'cli.load-savegame', FreeCol.argFile], [null, 'log-console', 'cli.log-console', null], [null, 'log-file', 'cli.log-file', 'cli.arg.name'], [null, 'log-level', 'cli.log-level', 'cli.arg.loglevel'], ['m', 'meta-server', 'cli.meta-server', 'cli.arg.metaServer'], ['n', 'name', 'cli.name', 'cli.arg.name'], [null, 'no-intro', 'cli.no-intro', null], [null, 'no-java-check', 'cli.no-java-check', null], [null, 'no-memory-check', 'cli.no-memory-check', null], [null, 'no-sound', 'cli.no-sound', null], [null, 'no-splash', 'cli.no-splash', null], ['p', 'private', 'cli.private', null], ['r', 'rules', 'cli.rules', 'cli.arg.name'], ['Z', 'seed', 'cli.seed', 'cli.arg.seed'], [null, 'server', 'cli.server', null], [null, 'server-name', 'cli.server-name', 'cli.arg.name'], [null, 'server-ip', 'cli.server-ip', 'cli.arg.serverIp'], [null, 'server-port', 'cli.server-port', 'cli.arg.port'], ['s', 'splash', 'cli.splash', '!' + FreeCol.argFile], ['t', 'tc', 'cli.tc', 'cli.arg.name'], ['T', 'timeout', 'cli.timeout', 'cli.arg.timeout'], ['C', 'user-cache-directory', 'cli.user-cache-directory', FreeCol.argDir], ['c', 'user-config-directory', 'cli.user-config-directory', FreeCol.argDir], ['u', 'user-data-directory', 'cli.user-data-directory', FreeCol.argDir], ['v', 'version', 'cli.version', null], ['w', 'windowed', 'cli.windowed', '!cli.arg.dimensions']];
  }
}

/**
 * The levels of logging in this game.
 */
export class FreeCol$LogLevel extends JObject {
  name: string = null;
  level: Level = null;
  logger: Logger = null;
  _FreeCol$LogLevel(name: string, level: Level): this {
    this.name = name;
    this.level = level;
    this.logger = null;
    return this;
  }
  buildLogger(): void {
    this.logger = Logger.getLogger('net.sf.freecol' + (((this.name.length === 0)) ? '' : '.' + this.name));
    this.logger.setLevel(this.level);
  }
}

let $FreeCol$1: any = null;
/** An anonymous class (FreeCol.java:1725). */
function FreeCol$1(): any {
  return $FreeCol$1 ??= $J.local(class extends Thread {
    run(): void {
      this.$cv_controller.shutdown();
    }
    $c($controller): this {
      this.$cv_controller = $controller;
      return this;
    }
  }, 'net.sf.freecol.FreeCol$1', []);
}

$J.define(FreeCol, 'net.sf.freecol.FreeCol', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FreeCol' }, meths: { 'errorFromException(java.lang.Exception,net.sf.freecol.common.model.StringTemplate)': 'errorFromException$Exception$StringTemplate', 'errorFromException(java.lang.Exception,java.lang.String)': 'errorFromException$Exception$String', 'setDifficulty(java.lang.String)': 'setDifficulty$String', 'setDifficulty(net.sf.freecol.common.option.OptionGroup)': 'setDifficulty$OptionGroup', 'gripe(java.lang.String)': 'gripe$String', 'gripe(net.sf.freecol.common.model.StringTemplate)': 'gripe$StringTemplate', 'fatal(java.lang.String)': 'fatal$String', 'fatal(net.sf.freecol.common.model.StringTemplate)': 'fatal$StringTemplate', 'fatal(java.util.logging.Logger,java.lang.String)': 'fatal$Logger$String' }, clinit: true, lazy: ['logger', 'DIFFICULTIES', 'JAVA_VERSION', 'MEMORY_MAX', 'freeColRevision', 'locale', 'ADVANTAGES_DEFAULT', 'LOGLEVEL_DEFAULT', 'WINDOWSIZE_FALLBACK', 'checkIntegrity', 'consoleLogging', 'debugStart', 'fastStart', 'headless', 'introVideo', 'javaCheck', 'memoryCheck', 'publicServer', 'sound', 'standAloneServer', 'advantages', 'difficulty', 'europeanCount', 'fontName', 'logLevels', 'metaServerAddress', 'metaServerPort', 'name_', 'serverAddress', 'serverPort', 'serverName', 'splashStream', 'tc', 'rules', 'timeout', 'windowSize', 'specialOptions', 'argDir', 'argFile', 'optionsTable'] });
$J.define(FreeCol$LogLevel, 'net.sf.freecol.FreeCol$LogLevel', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,java.util.logging.Level': '_FreeCol$LogLevel' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  FreeColClient = $J.load('net.sf.freecol.client.FreeColClient');
  SplashScreen = $J.load('net.sf.freecol.client.gui.SplashScreen');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColSeed = $J.load('net.sf.freecol.common.FreeColSeed');
  FreeColUserMessageException = $J.load('net.sf.freecol.common.FreeColUserMessageException');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColModFile = $J.load('net.sf.freecol.common.io.FreeColModFile');
  FreeColRules = $J.load('net.sf.freecol.common.io.FreeColRules');
  FreeColSavegameFile = $J.load('net.sf.freecol.common.io.FreeColSavegameFile');
  DefaultHandler = $J.load('net.sf.freecol.common.logging.DefaultHandler');
  Constants$IntegrityType = $J.load('net.sf.freecol.common.model.Constants$IntegrityType');
  NationOptions$Advantages = $J.load('net.sf.freecol.common.model.NationOptions$Advantages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  OSUtils = $J.load('net.sf.freecol.common.util.OSUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  FreeColServer = $J.load('net.sf.freecol.server.FreeColServer');
});
