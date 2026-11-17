// What the OpenCity oracle leaves out of the release (see build.sh): SDL (no window, no threads, the
// delays are recorded for the harness's virtual clock), the renderer, the textures, the networking,
// the graphic manager's model display and the multi-agent system. Everything here is a no-op except
// SDL_Delay, which records the delay the simulator thread would sleep (MainSim's Simulator::RCIDelay).
// The two enum headers come first, as in every source file of the release
#include "opencity_direction.h"
#include "opencity_structure_type.h"
#include "main.h"
#include "renderer.h"
#include "texture.h"
#include "netnode.h"
#include "networking.h"
#include "graphicmanager.h"
#include "movement.h"
#include "SDL_image.h"

int g_lastDelay = -1;

extern "C" {
SDL_mutex* SDL_CreateMutex(void) { static int m; return (SDL_mutex*)&m; }
int SDL_mutexP(SDL_mutex*) { return 0; }
int SDL_mutexV(SDL_mutex*) { return 0; }
void SDL_DestroyMutex(SDL_mutex*) {}
SDL_Thread* SDL_CreateThread(int (*)(void*), void*) { static int t; return (SDL_Thread*)&t; }
void SDL_WaitThread(SDL_Thread*, int* status) { if (status) *status = 0; }
void SDL_Delay(Uint32 ms) { g_lastDelay = (int)ms; }
Uint8 SDL_GetMouseState(int* x, int* y) { if (x) *x = 0; if (y) *y = 0; return 0; }
SDLMod SDL_GetModState(void) { return KMOD_NONE; }
int SDL_PushEvent(SDL_Event*) { return 0; }
void SDL_GL_SwapBuffers(void) {}
Uint8 SDL_GetAppState(void) { return 0; }
Uint32 SDL_GetTicks(void) { return 0; }
SDL_Surface* IMG_Load(const char*) { return NULL; }
}

// Renderer: the camera and the view state are not part of the game logic
Renderer::Renderer(const uint, const uint) : bHeightChange(true), bMinimapChange(true) {}
Renderer::~Renderer() {}
void Renderer::RotateLeft(const uint&) {}
void Renderer::RotateRight(const uint&) {}
void Renderer::MoveLeft(const uint&) {}
void Renderer::MoveRight(const uint&) {}
void Renderer::MoveUp(const uint&) {}
void Renderer::MoveDown(const uint&) {}
void Renderer::Home() {}
void Renderer::ZoomIn() {}
void Renderer::ZoomOut() {}
void Renderer::ToggleTerrain() {}
void Renderer::ToggleWater() {}
void Renderer::ToggleStructure() {}
void Renderer::ToggleGrid() {}
void Renderer::ToggleCompass() {}
void Renderer::ToggleProjection() {}
void Renderer::ToggleWireFrame() {}
void Renderer::DisplaySplash(const uint&, const uint&) {}
void Renderer::Display(const Map*, const Layer*) {}
void Renderer::DisplayHighlight(const Map*, const Layer*, uint, uint, uint, uint, const OPENCITY_TOOL_CODE&) {}
void Renderer::DisplayBuildPreview(const uint&, const uint&, const GLubyte&, const GLubyte&, const GLubyte&,
	const OPENCITY_GRAPHIC_CODE&) const {}
void Renderer::DisplayText(const uint&, const uint&, const GLubyte&, const GLubyte&, const GLubyte&, const string&) {}
const bool Renderer::GetSelectedWLFrom(const uint&, const uint&, uint&, uint&, const Map*, const Layer*) { return false; }
void Renderer::SetWinSize(const int&, const int&) {}

// Texture: nothing is loaded
std::map<string, std::pair<GLuint, uint> > Texture::mmapTextureCache;
Texture::Texture() : muiWidth(0), muiHeight(0), muiTextureName(0) {}
Texture::Texture(const string&) : muiWidth(0), muiHeight(0), muiTextureName(0) {}
Texture::Texture(const string&, bool) : muiWidth(0), muiHeight(0), muiTextureName(0) {}
Texture::~Texture() {}
GLuint Texture::GetName() const { return 0; }
void Texture::Building2Texture(const BuildingLayer* const, GLuint&) {}

// Networking: never opened
Networking::Networking() {}
Networking::~Networking() {}
const OPENCITY_NET_CODE Networking::Open(const string, const OC_USHORT) { return OC_NET_CLIENT_REJECTED; }
const OPENCITY_NET_CODE Networking::Close() { return OC_NET_OK; }

// Graphic manager: vehicles are not drawn
void GraphicManager::Display(const OC_FLOAT&, const OC_FLOAT&, const OC_FLOAT&, const Movement* const) const {}

// The multi-agent system is disabled in the release ("FIXME: buggy MAS"): agents are never drawn
void GraphicManager::DisplayAgent(float, float, const Agent* const) const {}

// The height map file option (--generator-height-map) is not used by the oracle; GUI drawing is not needed
extern "C" {
char* SDL_GetError(void) { return (char*)""; }
void SDL_GetRGB(Uint32, const SDL_PixelFormat* const, Uint8* r, Uint8* g, Uint8* b) { *r = *g = *b = 0; }
void SDL_FreeSurface(SDL_Surface*) {}
void gluOrtho2D(GLdouble, GLdouble, GLdouble, GLdouble) {}
}

