/*
 * The oracle's sound layer: replaces src/sdlport/sound.cpp (build.sh). It behaves as if the
 * original sound effects and music were installed (sound_init() reports both as available, as
 * src/sdlport/sound.cpp does when the sfx/ directory exists), but plays nothing and reads no
 * file: it writes every call into the trace instead, so the tests can check that the port makes
 * the same sound calls with the same volumes and panning as the original. The non-free files
 * themselves (data/sfx, data/music) are never fetched (re/abuse/fetch.sh).
 *   S load <file>                 a sound effect is loaded (sound_effect::sound_effect)
 *   S play <file> <vol> <pitch> <pan>
 *   M load <file> | M play <file> <vol> | M stop <file> | M volume <file> <vol>
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <SDL.h>
#include <SDL/SDL_mixer.h>

#include "sound.h"
#include "setup.h"

extern flags_struct flags;
extern FILE *oracle_trace;

void open_trace_file();
static FILE *out() { open_trace_file(); return oracle_trace; }

static int sound_enabled = 0;

int sound_init(int argc, char **argv)
{
    if (flags.nosound)
        return 0;
    sound_enabled = SFX_INITIALIZED | MUSIC_INITIALIZED;
    return sound_enabled;
}

void sound_uninit()
{
}

sound_effect::sound_effect(char const *filename)
{
    // the original keeps a Mix_Chunk here; the oracle keeps the name instead
    m_chunk = (Mix_Chunk *)strdup(filename);
    if (sound_enabled)
        fprintf(out(), "S load %s\n", filename);
}

sound_effect::~sound_effect()
{
    free(m_chunk);
}

void sound_effect::play(int volume, int pitch, int panpot)
{
    if (!sound_enabled)
        return;
    fprintf(out(), "S play %s %d %d %d\n", (char *)m_chunk, volume, pitch, panpot);
}

song::song(char const *filename)
{
    data = NULL;
    Name = strdup(filename);
    song_id = 0;
    rw = NULL;
    music = NULL;
    fprintf(out(), "M load %s\n", filename);
}

song::~song()
{
    if (playing())
        stop();
    free(Name);
}

void song::play(unsigned char volume)
{
    song_id = 1;
    fprintf(out(), "M play %s %d\n", Name, volume);
}

void song::stop(long fadeout_time)
{
    song_id = 0;
    fprintf(out(), "M stop %s\n", Name);
}

int song::playing()
{
    return song_id != 0;
}

void song::set_volume(int volume)
{
    fprintf(out(), "M volume %s %d\n", Name, volume);
}
