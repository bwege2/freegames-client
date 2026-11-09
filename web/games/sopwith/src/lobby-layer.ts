// The site's lobby replaces the content of the element it is given (web/src/sdk/lobby.ts, openLobby:
// host.replaceChildren) and only removes its own box when the round starts. Given the game's host it
// would take the game's canvas with it, and the round would run on a black page. So the lobby gets a
// layer of its own over the game, and the layer goes when the lobby is done (started or cancelled).
export async function inLobbyLayer<T>(host: HTMLElement, open: (layer: HTMLElement) => Promise<T>): Promise<T> {
  const layer = document.createElement('div');
  layer.style.cssText = 'position:absolute;inset:0;z-index:1;overflow:auto;background:#000';
  host.append(layer);
  try {
    return await open(layer);
  } finally {
    layer.remove();
  }
}
