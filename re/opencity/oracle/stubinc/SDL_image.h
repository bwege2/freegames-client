/* Stand-in for SDL_image's header (the oracle loads no images): stub.cpp defines IMG_Load returning NULL. */
#ifndef OC_ORACLE_SDL_IMAGE_H
#define OC_ORACLE_SDL_IMAGE_H
#include "SDL.h"
#ifdef __cplusplus
extern "C" {
#endif
SDL_Surface* IMG_Load(const char* file);
#define IMG_GetError SDL_GetError
#ifdef __cplusplus
}
#endif
#endif
