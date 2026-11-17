/* Stand-in for SDL_net's header: the oracle never opens a network connection (stub.cpp). */
#ifndef OC_ORACLE_SDL_NET_H
#define OC_ORACLE_SDL_NET_H
#include "SDL.h"
typedef struct { Uint32 host; Uint16 port; } IPaddress;
typedef struct _TCPsocket* TCPsocket;
typedef struct _SDLNet_SocketSet* SDLNet_SocketSet;
#endif
