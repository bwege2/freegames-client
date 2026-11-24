"""What is translated, and the few decisions that are not in the source.

UNITS: the modules translated in full (every declaration of their files); whatever they use from other
files of the original (pcg, other engine headers) is translated with them, as far as it is used.
Other steps of the port add their modules here."""

# source file prefix (without extension) -> module path below web/games/openclonk/src/gen/
MODULES = [
    ('src/', ''),
    ('thirdparty/pcg/', 'pcg/'),
    ('thirdparty/blake2/', 'blake2/'),
]

import os as _os
import sys as _sys
_here = _os.path.dirname(_os.path.abspath(__file__))


class PROFILE:
    """aul: the standalone script engine of the headless build (units-aul.txt, into src/aul), which the
    tests compare with the original's c4script; sim: the headless simulation subset (units-sim.txt, into
    src/sim), which is compared with the original's debug records; game: the full game (units.txt, src/gen)"""
    aul = '--aul' in _sys.argv
    sim = '--sim' in _sys.argv
    game = not aul and not sim
    units = 'units-aul.txt' if aul else 'units-sim.txt' if sim else 'units.txt'
    ast = 'ast-aul' if aul else 'ast-sim' if sim else 'ast'
    out = 'aul' if aul else 'sim' if sim else 'gen'


# tools/units.txt: src/lib/C4Real.cpp -> module lib/C4Real (its header comes with it)
def unit_module(path):
    """src/lib/C4Real.cpp -> lib/C4Real; thirdparty/blake2/ref/blake2b-ref.c -> blake2/ref/blake2b-ref"""
    base = path.rsplit('.', 1)[0]
    for pre, rep in MODULES:
        if base.startswith(pre):
            return rep + base[len(pre):]
    return base


UNIT_LIST = []
# a unit line may name the only declarations translated from it ("src/platform/StdFile.cpp WildcardMatch ...")
UNIT_ONLY = {}


def expand_units(lines, compiled):
    """the unit list's lines with 'dir/*' expanded to the directory's files that the build compiles"""
    out = []
    for x in lines:
        x = x.split('#')[0].split()
        if not x:
            continue
        if x[0].endswith('/*'):
            d = x[0][:-1]
            out += [[f] for f in sorted(set(compiled)) if f.startswith(d) and '/' not in f[len(d):]]
        else:
            out.append(x)
    return out


def compiled_files(variant):
    import json
    db = _os.path.join(_here, '..', '..', 'work', variant, 'compile_commands.json')
    if not _os.path.exists(db):
        return []
    src = _os.path.realpath(_os.path.join(_here, '..', '..', 'orig', 'openclonk')) + '/'
    return [c['file'][len(src):] for c in json.load(open(db)) if c['file'].startswith(src)]


for _x in expand_units(open(_os.path.join(_here, '..', PROFILE.units)),
                       compiled_files('headless' if PROFILE.aul else 'full')):
    UNIT_LIST.append(_x[0])
    if len(_x) > 1:
        UNIT_ONLY[unit_module(_x[0])] = set(_x[1:])
UNITS = {unit_module(u) for u in UNIT_LIST}

# methods not translated: Class::method -> why
SKIP = {
    'C4AulScriptFunc::DumpByteCode': 'a developer tool (prints bytecode to stderr)',
    'C4Game::DrawCrewOverheadText': 'GUI text lambda; not part of the headless tick',
    'C4KeyCodeEx::KeyCode2String': 'display name of a key (GUI only); the page uses the browser key names',
    'C4MarkupTag::OpeningTag': 'C++ user-defined literal in the markup parser; GUI text only',
    'C4MarkupTag::ClosingTag': 'C++ user-defined literal in the markup parser; GUI text only',
    'C4MarkupTagColor::OpeningTag': 'C++ user-defined literal in the markup parser; GUI text only',
    'C4Player::ActivateMenuTeamSelection': 'GUI team menu',
    'C4TextureMap::LoadMap': 'std::regex tokenization of material maps; texture loading comes with rendering',
    'C4AulDebug::ProcessLine': 'developer debugger, no debugger in the browser',
    'const_iterator::operator=': 'std::stack iterator assignment in the path relocation helper',
    'C4Reloc::const_iterator::operator=': 'std::stack iterator assignment in the path relocation helper',
    'C4StartupAboutDlg::SaveCredits': 'Ctrl+S in the about screen writes the credits to Credits.txt in the working directory '
                                      '(std::ofstream), a developer\'s export; the page has no working directory to write to',
}

# fields whose address one function takes as the start of an array over the next fields:
# Class::function -> {field: the fields}
FIELD_ARRAYS = {
    # mkArrayAdaptDefArr(&x, 2, &default_shape->x): "Offset=x,y" (x and y are C4Rect's)
    'C4Shape::CompileFunc': {'x': ('x', 'y')},
}

# methods not translated that fail when they are called ($missing): Class::method -> why they are never called
NOT_PORTED = {
    'StdMeshLoader::LoadMeshXml': 'Ogre XML meshes (TinyXML); planet/ has none (only binary .mesh files)',
    'StdMeshSkeletonLoader::LoadSkeletonXml': 'Ogre XML skeletons (TinyXML); planet/ has none (only binary .skeleton files)',
    'C4Playback::StreamToRecord': 'a network record stream to a record file (zlib inflate); the port records no streams',
    'PretransformMeshVertices': 'C4DrawMeshGL.cpp: only with the workaround ForceSoftwareTransform, which C4DrawGL never sets (only to '
                                'false, C4DrawGL.cpp CStdGL::Default)',
}

# #pragma pack(n) of structs whose layout the translator computes (sizeof): the struct -> n; a packed struct not
# listed is pack(1) (C4Record.h, C4Group.h; clang's tree marks packing but does not give n)
PACK = {'tagBITMAPFILEHEADER': 2}

# base classes left out: the network callback interface of the script debugger (no debugger in the browser)
IGNORE_BASES = {'C4NetIO::CBClass', 'C4NetIOTCP', 'std::set<const C4Player *>', 'std::vector<C4Rect>'}

# written by hand in web/games/openclonk/src/rt/native.ts: name -> why
NATIVE = {
    'FixedRandom': 'C4Random.cpp with pcg32 (thirdparty/pcg): rt/random.ts, checked against the oracle (math.test.ts)',
    'Random': 'C4Random.cpp (rt/random.ts)',
    'UnsyncedRandom': 'C4Random.cpp (rt/random.ts)',
    'SeededRandom': 'C4Random.cpp (rt/random.ts)',
    'RandomCount': 'C4Random.cpp (rt/random.ts)',
    'RecordRandom': 'the debug record (C4Record) comes with the replay oracle step; until then a hook',
    'blake2b': 'thirdparty/blake2 (SSE in the original build): the reference algorithm, checked with its test vectors',
    'gethostname': 'platform: the browser has no host name (rt/native.ts)',
    'readlink': 'platform: the browser has no symbolic links (rt/native.ts)',
    'fork': 'platform: the browser has no process fork (rt/native.ts)',
    'pthread_self': 'platform: one browser thread (rt/native.ts)',
    'pthread_create': 'platform: one browser thread (rt/native.ts)',
    'flock': 'platform: no advisory file locks (rt/native.ts)',
    'chmod': 'platform: the in-memory file system has no permission bits (rt/native.ts)',
    'strerror': 'platform: the in-memory file system reports generic errors (rt/native.ts)',
    'length': 'std::char_traits<char>::length maps to rt/libc strlen (rt/libc.ts)',
    'GetResStr': 'C4Language.cpp: a key in a string table by std::regex_iterator; the same regex on JavaScript\'s RegExp (rt/native.ts)',
    'StdMesh_tim_sort': 'thirdparty/timsort (a C macro header) for StdMesh.cpp\'s face sorting: a stable sort by the same '
                        'comparator (StdMeshFaceCmp), whose result is the same as timsort\'s (rt/native.ts)',
}
if PROFILE.aul:
    NATIVE.update({
        'GetWorkingDirectory': 'platform: the browser has no working directory',
        'FileSize': 'platform files: the port\'s files are in its groups and storage (rt/files.ts)',
        'RealPath': 'platform files',
        'operator-@platform/C4TimeMilliseconds': 'platform clock (C4TimeMilliseconds.cpp)',
    })
else:
    NATIVE.update({n: 'src/zlib/gzio.c: gzip streams over rt/fs.ts (rt/gz.ts)' for n in (
        'c4_gzdopen', 'c4_gzread', 'c4_gzwrite', 'c4_gzrewind', 'c4_gzdirect', 'c4_gzclose')})

# methods written by hand in rt/native.ts ($N.Class_method, called with the object as this): name -> why
NATIVE_METHODS = {
    'C4TimeMilliseconds::Now': 'platform clock: the browser\'s performance.now()',
}
if PROFILE.aul:
    NATIVE_METHODS['C4TimeMilliseconds::AsString'] = 'platform clock'

# class names: the class (namespaces dropped, as clang prints it) -> TypeScript name
NAMES = {
    'engine<unsigned int, unsigned long, xsh_rr_mixin<unsigned int, unsigned long>, 1, '
    'specific_stream<unsigned long>, default_multiplier<unsigned long>>': 'pcg32',
}

# 64-bit integer declarations whose values all fit in 32 bits and that are kept as numbers:
# name -> why. (Every other 64-bit integer is a bigint.)
NARROW64 = {
    'SineTable': 'C4Real.cpp: sine values 0..65536, never written',
}

# the order in which the modules' global variables are set up (units.txt order; others after)
UNIT_ORDER = {unit_module(u): i for i, u in enumerate(UNIT_LIST)}

# modules rendered as empty classes/functions: presentation/editor/network code that the headless simulation
# reaches through headers but does not run. The full game profile will translate them later.
EXTRA_CLASSES = {'C4GameControlNetwork'}
OPAQUE_CLASSES = {'C4Sky', 'C4GameControlNetwork', 'StdThreadCheck', 'CStdCSec', 'CStdEvent', 'StdThread', 'StdSchedulerThread',
                  # key callbacks store a C++ member function pointer; the page drives C4PlayerControl directly
                  'C4KeyCB$C4Console', 'C4KeyCB$C4EditCursor', 'C4KeyCB$C4FullScreen', 'C4KeyCB$C4Game',
                  'C4KeyCB$C4GraphicsSystem', 'C4KeyCB$C4MusicSystem', 'C4KeyCB$C4Network2', 'C4KeyCB$C4Scoreboard',
                  'C4KeyCB$C4ToolsDlg', 'C4KeyCB$C4ViewportList', 'C4KeyCBEx$C4FullScreen$u8', 'C4KeyCBEx$C4GameControl$i32',
                  'C4KeyCBEx$C4GraphicsSystem$b', 'C4KeyCBEx$C4MessageInput$b', 'C4KeyCBEx$C4ToolsDlg$i32',
                  'C4KeyCBEx$C4ViewportList$C4Vec2D', 'C4KeyCBExPassKey$C4PlayerControl$C4KeyCodeEx',
                  # the scoreboard's dialog (gui/C4Scoreboard.cpp): presentation; the scoreboard's cells are game state
                  'C4ScoreboardDlg'}
OPAQUE = {
    'config/C4Config', 'script/C4AulDebug',
    'landscape/C4Texture',
    'landscape/fow/C4FoW', 'landscape/fow/C4FoWAmbient', 'landscape/fow/C4FoWBeam',
    'landscape/fow/C4FoWDrawStrategy', 'landscape/fow/C4FoWLight', 'landscape/fow/C4FoWLightSection',
    'landscape/fow/C4FoWRegion',
    # presentation, editor and network code reached through headers; the simulation does not run it
    'gui/C4ChatDlg', 'gui/C4DownloadDlg', 'gui/C4FileSelDlg', 'gui/C4Folder', 'gui/C4GameDialogs',
    'gui/C4GameLobby', 'gui/C4GameMessage', 'gui/C4GameOptions', 'gui/C4GameOverDlg', 'gui/C4GfxErrorDlg',
    'gui/C4Gui', 'gui/C4GuiButton', 'gui/C4GuiCheckBox', 'gui/C4GuiComboBox', 'gui/C4GuiContainers',
    'gui/C4GuiDialogs', 'gui/C4GuiEdit', 'gui/C4GuiLabels', 'gui/C4GuiListBox', 'gui/C4GuiMenu',
    'gui/C4GuiTabular', 'gui/C4LoaderScreen', 'gui/C4MainMenu', 'gui/C4Menu',
    'gui/C4MessageBoard', 'gui/C4MessageInput', 'gui/C4MouseControl', 'gui/C4PlayerInfoListBox',
    'gui/C4ScriptGuiWindow', 'gui/C4Startup', 'gui/C4UpperBoard',
    'editor/C4Console', 'editor/C4EditCursor', 'editor/C4ObjectListDlg', 'editor/C4ToolsDlg',
    'editor/C4ViewportWindow',
    'graphics/Bitmap256', 'graphics/StdPNG',
    'graphics/C4Draw', 'graphics/C4DrawT', 'graphics/C4DrawGL', 'graphics/C4DrawGLCtx',
    'graphics/C4DrawMeshGL', 'graphics/C4Shader', 'graphics/C4Surface', 'graphics/C4SurfaceLoaders',
    'graphics/C4FontLoader', 'graphics/C4GraphicsResource',
    'network/C4GameControlNetwork', 'network/C4HTTP', 'network/C4InteractiveThread',
    'network/C4League', 'network/C4NetIO', 'network/C4Network2', 'network/C4Network2Address',
    'network/C4Network2Client', 'network/C4Network2Dialogs', 'network/C4Network2Discover',
    'network/C4Network2IO', 'network/C4Network2IRC', 'network/C4Network2Players', 'network/C4Network2Reference',
    'network/C4Network2Res', 'network/C4Network2ResDlg', 'network/C4Network2Stats', 'network/C4Network2UPnPDummy',
    'platform/C4AppSDL', 'platform/C4WindowSDL', 'platform/C4GamePadCon', 'platform/C4MusicFile',
    'platform/C4MusicSystem', 'platform/C4SoundInstance', 'platform/C4SoundLoaders', 'platform/C4SoundModifiers',
    'platform/C4SoundSystem', 'platform/C4App', 'platform/C4AppT', 'platform/PlatformAbstraction',
    'game/C4Application', 'game/C4FullScreen', 'game/C4GraphicsSystem', 'game/C4Viewport',
    'object/C4ObjectGraphics',
    'control/C4Playback',
}

# the game profile (units.txt, src/gen) translates what the simulation profiles leave opaque: drawing, the GUI the
# game shows in-game, sound, the application and its window. It keeps opaque what the browser replaces (network,
# editor, the platform's windowing) and what comes with later milestones (the start menu, the lobby).
GAME_TRANSLATES = {
    'config/C4Config', 'landscape/C4Texture', 'object/C4ObjectGraphics',
    'landscape/fow/C4FoW', 'landscape/fow/C4FoWAmbient', 'landscape/fow/C4FoWBeam',
    'landscape/fow/C4FoWDrawStrategy', 'landscape/fow/C4FoWLight', 'landscape/fow/C4FoWLightSection',
    'landscape/fow/C4FoWRegion',
    'gui/C4Gui', 'gui/C4GuiButton', 'gui/C4GuiCheckBox', 'gui/C4GuiComboBox', 'gui/C4GuiContainers',
    'gui/C4GuiDialogs', 'gui/C4GuiEdit', 'gui/C4GuiLabels', 'gui/C4GuiListBox', 'gui/C4GuiMenu', 'gui/C4GuiTabular',
    'gui/C4GameDialogs', 'gui/C4GameMessage', 'gui/C4GameOverDlg', 'gui/C4PlayerInfoListBox', 'gui/C4LoaderScreen', 'gui/C4MainMenu',
    'gui/C4Menu', 'gui/C4MessageBoard', 'gui/C4MessageInput', 'gui/C4MouseControl', 'gui/C4Scoreboard',
    'gui/C4ScriptGuiWindow', 'gui/C4UpperBoard', 'gui/C4Startup',
    # the start menu (milestone 3): main menu, scenario selection, player selection and properties, options, about and
    # legal notice, the portrait selection of the player properties, the scenario selection's game options
    'gui/C4StartupMainDlg', 'gui/C4StartupScenSelDlg', 'gui/C4StartupPlrSelDlg', 'gui/C4StartupOptionsDlg',
    'gui/C4StartupAboutDlg', 'gui/C4StartupLegalDlg', 'gui/C4FileSelDlg', 'gui/C4GameOptions',
    # the scenario folders' cores (Folder.txt) and the scenario selection's option buttons (network/C4Network2Dialogs:
    # C4GameOptionButtons, with the network's dialogs of that file, which a game that is not a network game never opens)
    'gui/C4Folder', 'network/C4Network2Dialogs',
    # gamepads (SDL's game controllers, rt/sdl.ts on the browser's Gamepad API): a second player's controls
    'platform/C4GamePadCon',
    # the game's statistics (frame rate, objects, the players' graphs): kept by C4Game in every game, not only online
    'network/C4Network2Stats',
    # online play (milestone 4): the control queue's network part, a client in central mode whose host is the site's
    # server module (src/net.ts: C4Network2's place, the site's rooms)
    'network/C4GameControlNetwork',
    'graphics/Bitmap256', 'graphics/StdPNG', 'graphics/C4Draw', 'graphics/C4DrawGL', 'graphics/C4DrawGLCtx',
    'graphics/C4DrawMeshGL', 'graphics/C4Shader', 'graphics/C4Surface', 'graphics/C4SurfaceLoaders',
    'graphics/C4FacetEx', 'graphics/C4FontLoader', 'graphics/C4GraphicsResource',
    'platform/C4MusicFile', 'platform/C4MusicSystem', 'platform/C4SoundInstance', 'platform/C4SoundLoaders',
    'platform/C4SoundModifiers', 'platform/C4SoundSystem', 'platform/C4App', 'platform/C4AppSDL', 'platform/C4WindowSDL',
    'platform/PlatformAbstraction',
    'game/C4Application', 'game/C4FullScreen', 'game/C4GraphicsSystem', 'game/C4Viewport',
}
# what the site replaces: the start menu's network game dialog (the site's rooms), its mods dialog (downloads from the
# mod database) and the update dialog
GAME_OPAQUE = {'gui/C4UpdateDlg', 'gui/C4StartupNetDlg', 'gui/C4StartupModsDlg', 'graphics/C4DrawT',
               'platform/C4FileMonitor'}
# classes the runtime writes for the game profile (rt/threads.ts): the threads and their synchronization on the page's
# one thread; the translated modules re-export them, so that their subclasses extend the runtime's
NATIVE_CLASSES = {}
if PROFILE.game:
    NATIVE_CLASSES = {
        'StdThread': 'rt/threads',
        'CStdEvent': 'rt/threads',
        'CStdCSec': 'rt/threads',
        # thirdparty/pcg's pcg32 (the particles' generators): the runtime's, checked against the original (math.test.ts)
        'pcg32': 'rt/random',
    }
if PROFILE.game:
    # what the headless profiles leave out because only drawing and the GUI need it
    for _k in ('C4Game::DrawCrewOverheadText', 'C4KeyCodeEx::KeyCode2String', 'C4MarkupTag::OpeningTag',
               'C4MarkupTag::ClosingTag', 'C4MarkupTagColor::OpeningTag', 'C4TextureMap::LoadMap'):
        SKIP.pop(_k, None)
    OPAQUE = (OPAQUE - GAME_TRANSLATES) | GAME_OPAQUE
    SKIP['SetUrgencyHint'] = 'C4WindowSDL.cpp: the X11 window manager\'s urgency hint; a page has none'
    # the key callbacks hold member function pointers: translated as method names (cpp2ts/emit.py)
    OPAQUE_CLASSES = {c for c in OPAQUE_CLASSES if not c.startswith('C4KeyCB') and c not in ('C4Sky', 'C4ScoreboardDlg', 'C4GameControlNetwork')}

# The original's modal dialogs wait in a message loop of their own until they are closed (C4GUI::Dialog::DoModal:
# `while (fShow) Application.ScheduleProcs();`), inside whatever showed them: the start menu's first player dialog
# (C4StartupMainDlg::OnShown), its questions and error messages. A page cannot wait inside a function, so the game profile
# translates every function that waits in such a loop, and every function that calls one of them directly, as a
# generator (CONVENTIONS.md "Modal loops", rt/coro.ts): SUSPEND names the loops, Class::method -> the scheduler call
# in it that waits; before it the generator yields to the page, which resumes it on its next animation frame.
SUSPEND = {'Dialog::DoModal': 'ScheduleProcs'} if PROFILE.game else {}

# While a base class's constructor runs, C++ calls the base class's versions of virtual methods (the object is not of the
# derived class yet): C4GUI::Control's constructor calls SetBounds, whose UpdateSize is TextWindow::UpdateSize in JavaScript,
# before TextWindow's constructor made the windows it resizes. The classes derived from these roots keep the class whose
# constructor runs ($dyn, set after the base constructors) and their overrides of virtual methods hand a call made while a
# base class is constructed to that class's version (cpp2ts CONVENTIONS.md "Classes")
CTOR_DISPATCH = {'Element'} if PROFILE.game else set()

# classes whose locals need their destructor at the end of the scope (RAII with effects besides memory)
RAII = {
    'CodegenAstVisitor::ScopeGuard': 'C4AulCompiler.cpp: leaves the compiler\'s scope',
    'CodegenAstVisitor::StackGuard': 'C4AulCompiler.cpp: checks the value stack height when an expression is left',
    'C4DebugRecOff': 'C4Record.h: turns debug-record writing off in this block and back on in its destructor',
    'ZoomDataStackItem': 'C4Draw.h: sets the drawing zoom for a block (the parallax sky, object pictures) and restores it',
    'C4ShaderCall': 'C4Shader.h: its destructor calls Finish (glUseProgram(0))',
    'ScopedLocale': 'C4DrawMeshGL.cpp: the C locale while a mesh shader is generated, the old one restored',
    'C4ScriptUniform::Popper': 'C4Shader.h: pops the script uniforms that ScriptUniform.Push pushed (held in a std::unique_ptr)',
}
# iterators that register with their container (C4ObjectList::iterator: AddIter in the constructor, RemoveIter in the
# destructor): a range-for's begin and end iterators are destroyed after the loop
RAII_ITERATORS = {'C4ObjectList::iterator'}

# the C library: name -> function of web/games/openclonk/src/rt/libc.ts
LIBC = {n: 'c$' + n for n in '''
strlen strcmp strncmp strcasecmp strncasecmp strchr strrchr strstr strcpy strncpy strcat strncat strdup strpbrk strspn
strcspn strtok memcpy memmove memset memcmp memchr toupper tolower isspace isalpha isdigit isalnum isupper islower
isxdigit ispunct isprint iscntrl isgraph sqrt sin cos tan atan atan2 asin acos pow exp log log10 log2 floor ceil fabs fmod
round lround trunc sqrtf sinf cosf atan2f fabsf floorf ceilf powf fmodf roundf hypot hypotf atoi atol atoll strtol strtoul
strtoll strtoull strtod strtof atof sprintf snprintf printf fprintf puts fputs fputc putchar vsnprintf vsprintf vasprintf
vfprintf vprintf free malloc calloc realloc abort exit time rand srand qsort bsearch fflush getenv perror sscanf
strnlen open close read write lseek fopen fclose fread fwrite fseek ftell feof fgets fgetc unlink rename stat mkdir
access isatty crc32 uncompress compress compressBound remove _setjmp longjmp getopt_long eventfd poll sched_yield
timerfd_create timerfd_settime timerfd_gettime execv execvp
opendir readdir closedir chmod chdir getcwd fileno fdopen ferror ftruncate fstat lstat realpath rewind rmdir flock fork pthread_self pthread_create pthread_join gethostname readlink __errno_location localtime strftime setlocale strerror length
'''.split()}


def _names(f):
    return [x for x in (ln.split('#')[0].strip() for ln in open(_os.path.join(_here, '..', f))) if x]


# OpenGL, libepoxy and SDL's GL context (tools/gl.txt): rt/gl.ts as gl$<name>; under libepoxy a call glFoo(...) is a
# call through the function-pointer variable epoxy_glFoo, which names the same function
GL = {}
for _n in _names('gl.txt'):
    GL[_n] = 'gl$' + _n
    GL['epoxy_' + _n] = 'gl$' + _n
# OpenAL, ALUT and vorbisfile (tools/al.txt): rt/al.ts as al$<name>
AL = {n: 'al$' + n for n in _names('al.txt')}
# the C libraries of the game's platform layer: FreeType (tools/ft.txt, rt/freetype.ts) and SDL (tools/sdl.txt, rt/sdl.ts)
FT = {n: 'ft$' + n for n in _names('ft.txt')} if _os.path.exists(_os.path.join(_here, '..', 'ft.txt')) else {}
SDL = {n: 'sdl$' + n for n in _names('sdl.txt')} if _os.path.exists(_os.path.join(_here, '..', 'sdl.txt')) else {}
# libpng (tools/png.txt, rt/libpng.ts) and libjpeg (tools/jpeg.txt, rt/libjpeg.ts): the content's images
PNG = {n: 'png$' + n for n in _names('png.txt')}
JPEG = {n: 'jpeg$' + n for n in _names('jpeg.txt')}

# structs of the C libraries the runtime provides (SDL's events and display modes, FreeType's matrix): their locals
# are plain objects that the runtime's functions fill (rt/sdl.ts, rt/freetype.ts)
C_STRUCT_PREFIXES = ('SDL_', 'FT_', 'OggVorbis_', 'vorbis_', 'ov_callbacks', 'jpeg_', 'png_', 'itimerspec', 'timespec')
# C library structs with struct members: their value (struct itimerspec nv; nv.it_interval.tv_sec = ...)
C_STRUCT_DEFAULTS = {'itimerspec': '{ it_interval: { tv_sec: 0, tv_nsec: 0 }, it_value: { tv_sec: 0, tv_nsec: 0 } }'}
# C library structs initialized with a list: their fields in order (getopt.h struct option)
C_STRUCT_FIELDS = {'option': ('name', 'has_arg', 'flag', 'val'), 'pollfd': ('fd', 'events', 'revents'),
                   'ov_callbacks': ('read_func', 'seek_func', 'close_func', 'tell_func')}

# the C libraries' enums (tools/libenums.h, written by ast.sh into work/libenums.json): constant -> value, and the enum
# types by name (SDL_Scancode, SDL_Keymod, SDL_bool) -> (bits, signed)
LIB_ENUM_VALUES, LIB_ENUM_TYPES, LIB_TYPEDEFS = {}, {}, {}
_libenums = _os.path.join(_here, '..', '..', 'work', 'libenums.json')
if PROFILE.game and _os.path.exists(_libenums):
    import json as _json
    _l = _json.load(open(_libenums))
    LIB_ENUM_VALUES = _l['values']
    LIB_ENUM_TYPES = {k: tuple(v) for k, v in _l['types'].items()}
    # the libraries' typedefs of numbers (GLuint, ALint): a type printed with one is that number type
    LIB_TYPEDEFS = _l.get('typedefs', {})
