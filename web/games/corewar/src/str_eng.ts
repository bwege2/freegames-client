// str_eng.c: pMARS's messages (ENGLISH) as the X11 build compiles them (XWINGRAPHX, not SERVER).
export const outOfMemory = "Out of memory\n";
export const warriorTerminated = "Warrior %d: %s terminated\n";
export const fatalErrorInSimulator = "Fatal error in simulator. Please report this error.\n";
export const warriorTerminatedEndOfRound = "Warrior %d: %s terminated - End of round %d\n";
export const endOfRound = "End of round %d\n";
export const pagePrompt = " RET for more, q to quit, a for all ";
export const exitingCdbToFinishSimulation = "Exiting cdb to finish simulation\n";
export const usageDisplay = "Usage: display clear|on|off|nnn\n";
export const usageExecute = "Usage: execute [address]\n";
export const usageMoveable = "Usage: moveable on|off\n";
export const pressAnyKeyToContinue = "\nPress any key to continue ";
export const usageSkip = "Usage: skip [count]\n";
export const usageWrite = "Usage: write logfile\n";
export const closingLogfile = "Closing logfile\n";
export const cannotOpenLogfile = "Cannot open logfile\n";
export const openingLogfile = "Opening logfile\n";
export const unknownCommand = "Unknown command \"%s\"\n";
export const macroStringExpansionTooLong = "Macro string expansion too long\n";
export const EOFreadingCommandInput = "EOF reading command input\n";
export const maximumLoopNestingExceeded = "Maximum loop nesting exceeded\n";
export const badRepeatCountExpression = "Bad repeat count expression\n";
export const writeErrorDiskFull = "Write error - disk full?\n";
export const badArgument = "Bad argument \"%s\"\n";
export const helpText = [
  "Command groups:\n",
  "Executing:    continue execute  go       quit     skip     step     thread\n",
  "Listing:      list     search\n",
  "Tracing:      trace    untrace  moveable\n",
  "Editing:      edit     fill\n",
  "Information:  help     progress registers\n",
  "Macro:        calc     echo     if       macro    remark   reset\n",
  "Display:      clear    close    display  switch\n",
  "Others:       pqueue   wqueue   pspace   write\n",
  "\n",
  "Command description, shortest abbreviation in ():\n",
  "(ca)lc expr1[,expr2]   calculate expression(s) and echo result(s)\n",
  "(cl)ear                clear cdb screen\n",
  "(clo)se                close right cdb panel and make left full-screen\n",
  "(c)ontinue *           exit cdb and finish simulation\n",
  "(d)isplay clear|on|off|nnn\n",
  "                       clear, turn core display on/off or set -v option to nnn\n",
  "(ec)ho string          print string (for commenting macros)\n",
  "(e)dit [range]         edit core addresses\n",
  "(e(x))ecute [address]  reset process queue to [address] and step\n",
  "(f)ill [range]         fill core addresses with instruction\n",
  "(g)o *                 execute until next trace\n",
  "(h)elp                 show this command summary\n",
  "(if) expression        execute next command in chain if expression is not 0\n",
  "(l)ist [range]         list core addresses\n",
  "(m)acro [name][,file]  execute macro [name] (from [file], [user]=keyboard)\n",
  "(m)acro                list macros\n",
  "(mo)veable on|off      enable/disable copying debug info\n",
  "(pq)ueue [1|2|off]     enter/exit process queue debug mode\n",
  "(ps)pace [1|2|off]     enter/exit pspace debug mode\n",
  "(p)rogress             show result of simulation so far\n",
  "(q)uit                 quit program\n",
  "(r)egisters            show simulator state\n",
  "(rem)ark string        macro comment\n",
  "(res)et                terminate macro/command chain processing\n",
  "(se)arch pattern       search for wildcarded pattern in core\n",
  "(sk)ip [count]         execute [count] steps silently\n",
  "(s)tep *               execute next queued instruction\n",
  "(sw)itch [1|2]         switch to left (1), right (2), or other cdb panel\n",
  "(th)read *             step through current thread\n",
  "(t)race [range]        set trace of core addresses\n",
  "(u)ntrace [range]      clear trace of core addresses\n",
  "(w)rite logfile        write all following output to logfile\n",
  "(w)rite                close logfile\n",
  "(wq)ueue [off]         enter/exit warrior queue debug mode\n",
  "* [address]            set PC to [address], then continue|go|..\n",
  "range: { e | e,e | e, | ,e | , }\n",
  "    e: { [0-9]* | . | $ | A | B | PC | PC1 | PC2 | LINES |\n",
  "         +e | -e | e+e | e-e | e*e | e/e | e%e | !e | e==e | e!=e |\n",
  "         e<e | e>e | e<=e | e>=e | e&&e | e||e | [C-Z] | [C-Z]=e | (e) }\n",
  "macro definition: macro-name=command-chain\n",
  "command-chain: link[~link]*        link: command | !! | ![e]\n",
  "!!: loop start, ![e]: loop end, e: iterations\n",
  ""
];
export const roundOfCycle = "Round %-3d of %-10d Cycle %ld\n";
export const currentlyExecutingWarrior = "Currently executing warrior %d: %-30s\n";
export const processesActive = "Processes active %-6d Process queue:\n";
export const otherWarrior = "Other warrior: %-30s\n";
export const warriorAtAddressHasActiveProcesses = "Warrior %d: %s at address [%d] has %d active process%s\n";
export const pluralEndingOfProcess = "es";
export const ofWarriorsAreAlive = "%d of %d warriors are alive\n";
export const fillWith = "Fill with: ";
export const dotByItselfEndsKeyboardInput = "[\".\" by itself ends keyboard input]\n";
export const cannotOpenMacroFile = "Cannot open macro file \"%s\"\n";
export const maximumNumberOfMacrosExceeded = "Maximum number of macros exceeded\n";
export const outOfMacroMemory = "Out of memory allocating macro memory\n";
export const unknownMacro = "Unknown macro \"%s\"\n";
export const nameByAuthorScores = "%s by %s scores %d\n";
export const resultsAre = "  Results:";
export const resultsWLT = "Results: %d %d %d\n";
export const pressAnyKey = "Press any key ..";
export const cantAllocMem = "Can't allocate memory\n";
export const cantConnect = "Can't connect to X server \"%s\"\n";
export const structureAllocFails = "Structure Allocation fails\n";
export const cantOpenFont = "Can't open font \"%s\", trying \"fixed\"\n";
export const noFixedFont = "Can't even open font \"fixed\", giving up\n";
export const noBackingStore = "X Server doesn't support backing store\n";
export const needColorDisplay = "Need a color display\n";
export const colorNotFound = "Color name \"%s\" not found in database\n";
export const noColorAvailable = "Can't allocate color, all cells allocated and no one matches\n";
export const privateMap = "Can't allocate color \"%s\"; switching to private colormap\n";
export const invalidGeom = "Invalid geometry specification\n";
export const info01 = "Program \"%s\" (length %d) by \"%s\"\n\n";
export const logicErr = "Error in %s. Line: %d\n";
export const labelRefMsg = "Label references:\n";
export const groupLabel = "Group label(s):\n";
export const textMsg = "(TEXT):";
export const stackMsg = "(STACK):";
export const labelMsg = "(LABEL):";
export const endOfChart = "***END*OF*CHART***\n\n";
export const afterPass = "After pass %d\n";
export const instrMsg = "Instruction (physical line, instr):\n\n";
export const endOfPass = "\n***END*OF*PASS***\n\n";
export const unknown = "Unknown";
export const anonymous = "Anonymous";
export const illegalAppendErr = "Attempting to append a string to an undefined label";
export const bufferOverflowErr = "Buffer overflow. Substitution is too complex";
export const illegalConcatErr = "Illegal use of string concatenation '%s'";
export const tooManyLabelsErr = "Too many labels for a declaration (last: '%s')";
export const unopenedFORErr = "Unopened FOR";
export const unclosedROFErr = "Unclosed ROF";
export const bad88FormatErr = "Bad '88 format at token '%s'";
export const badOffsetErr = "Execution starts from outside of the program";
export const noInstErr = "No instructions";
export const spaceRedErr = "Putting space between ';' and 'redcode' is useless";
export const tokenErr = "Unrecognized or improper placement of token: '%s'";
export const terminatedRedErr = "Source code terminated by ';redcode'";
export const undefinedSymErr = "Undefined label or symbol: '%s'";
export const expectNumberErr = "Expecting a number";
export const syntaxErr = "Syntax error";
export const discardLabelErr = "Discarding these labels: '%s'";
export const tooManyInstrErr = "Too many instructions (about %s more)";
export const missingErr = "Missing '%s'";
export const recursiveErr = "Recursive reference of label '%s'";
export const badExprErr = "Bad expression";
export const divZeroErr = "Division by zero";
export const overflowErr = "Arithmetic overflow detected";
export const missingAssertErr = "Missing ';assert'. Warrior may not work with the current setting";
export const concatErr = "Unable to derefer and concatenate symbol '%s'";
export const ignoreENDErr = "Both opcodes ORG and END are used. Ignoring END";
export const invalidAssertErr = "Invalid ';assert' parameter";
export const tooMuchStuffErr = "Lines generated by the source exceed the limit %d\n\tIgnoring code generation";
export const extraTokenErr = "Ignored, extra tokens in line '%s'";
export const improperPlaceErr = "Improper placement of '%s'";
export const invalid88Err = "Invalid '88 format. Proper format: '%s'";
export const incompleteOpErr = "Incomplete operand at instruction '%s'";
export const redefinitionErr = "Ignored, redefinition of label '%s'";
export const undefinedLabelErr = "Undefined label '%s'";
export const assertionFailErr = "Assertion in this line fails";
export const tooManyMsgErr = "\nToo many errors or warnings.\nProgram aborted.\n";
export const fileOpenErr = "Unable to open file '%s'";
export const fileReadErr = "Unable to read file '%s'";
export const notEnoughMemErr = "MALLOC() fails\nProgram aborted\n";
export const warning = "Warning";
export const error = "Error";
export const inLine = " in line %d: '%s'\n";
export const opcodeMsg = "opcode";
export const modifierMsg = "modifier";
export const aTerm = "A-term";
export const bTerm = "B-term";
export const currentAssertMsg = "Current parameter for ';assert': %s\n";
export const currentFORMsg = "Current parameter for FOR: %s\n";
export const CURLINEErr = "CURLINE is a reserved keyword";
export const paramCheckMsg = "Parameter checking:\n";
export const errNumMsg = "Number of errors: %d\n";
export const warNumMsg = "Number of warnings: %d\n";
export const duplicateMsg = "Duplicate errors/warnings found in line %d (%d)\n";
export const credits_screen1 = "pMARS v%d.%d.%d, %s, corewar simulator with ICWS'94 extensions\n";
export const credits_screen2 = "Copyright (C) 1993-2025 Albert Ma, Na'ndor Sieben, Stefan Strack and Mintardjo Wangsaw\n";
export const credits_screen3 = "";
export const usage_screen = "Usage:\n   pmars [options] file1 [files ..]\n   The special file - stands for standard input\n\n";
export const optionsAre = "Options:\n";
export const errTooManyOptions = "Error: Too many options\n   Consider increasing OPTNUM in clparse.c\n";
export const readingStdin = "[Reading from standard input until EOF or \"$\"]\n";
export const readOptionsFromFile = "  -@ $ Read options from file $\n";
export const standardInput = "standard input";
export const errorIsLocatedIn = "The error is located in \"%s\"\n";
export const unknownOption = "\nUnknown option \"%s\"\n";
export const badArgumentForSwitch = "\nBad argument for \"-%c\" switch\n";
export const badArgumentForXSwitch = "\nBad argument for \"-%s\" switch\n";
export const optionMustBeInTheRange = "\nOption \"-%c\" value must be in the range ";
export const tooManyParameters = "\nToo many parameters \"%s\"\n";
export const cannotOpenParameterFile = "\nCannot open parameter file\n";
export const optRounds = "Rounds to play [1]";
export const optEnterDebugger = "Enter debugger";
export const optDisabledInServerVersion = "(disabled in SERVER version)";
export const optCoreSize = "Size of core [8000]";
export const optBrief = "Brief mode (no source listings)";
export const optCycles = "Cycles until tie [80000]";
export const optVerboseAssembly = "Verbose assembly";
export const optProcesses = "Max. processes [8000]";
export const optKotH = "Output in KotH format";
export const optLength = "Max. warrior length [100]";
export const opt88 = "Enforce ICWS'88 rules";
export const optDistance = "Min. warriors distance";
export const optFixedSeries = "Fixed position series";
export const optFixedPosition = "Fixed position of warrior #2";
export const optSort = "Sort result output by score";
export const optView = "Coreview mode [103]";
export const optScoreFormula = "Score formula $ [(W*W-1)/S]";
export const optPSpaceSize = "Size of P-space [1/16th core]";
export const optPermutate = "Permutate starting positions";
export const optReadLimit = "Read limit size";
export const optWriteLimit = "Write limit size";
export const optAssemble = "Assemble warriors only";
export const optXOpt = [
  "Display to connect to",
  "Geometry of the window",
  "X font to use"
];
export const noWarriorFile = "\nNo warrior file specified\n";
export const fFExclusive = "\nOnly one of -f and -F can be given\n";
export const coreSizeTooSmall = "\nCore size is too small\n";
export const dLessThanl = "\nWarrior distance cannot be smaller than warrior length\n";
export const FLessThand = "\nPosition of warrior #2 cannot be smaller than warrior distance\n";
export const badScoreFormula = "\nBad score formula\n";
export const pSpaceTooBig = "\nP-space is bigger than core\n";
export const permutateMultiWarrior = "\nPermutation cannot be used in multiwarrior battles\n";
export const badRWLimit = "\nRead/Write limit must be a positive divisor of core size\n";
