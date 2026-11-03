// simulation/SaveRenderer.cpp / SaveRenderer.h, and client/ThumbnailRendererTask.cpp (doWork) as RenderThumbnail.
// The original renders thumbnails on a worker thread (ThumbnailRendererTask) and the UI polls for the result; the
// browser port renders them synchronously when they are asked for, with the same result.
import { CELL } from '../sim/config.ts';
import { Simulation } from '../sim/simulation.ts';
import { Renderer, RendererSettings, decorationEnabled } from '../graphics/renderer.ts';
import { VideoBuffer } from '../graphics/raster.ts';
import { Load } from '../save/load.ts';
import type { GameSave } from '../save/gameSave.ts';

export class SaveRenderer {
  private static instance: SaveRenderer | null = null;
  /** ExplicitSingleton<SaveRenderer>::Ref(); created on first use (the original's main() creates it) */
  static Ref(): SaveRenderer {
    if (!SaveRenderer.instance) SaveRenderer.instance = new SaveRenderer();
    return SaveRenderer.instance;
  }

  private sim: Simulation;
  private ren: Renderer;

  constructor() {
    this.sim = Simulation.Factory();
    this.ren = new Renderer();
    this.ren.sim = this.sim;
  }

  Render(save: GameSave, fire: boolean, rendererSettings: RendererSettings): VideoBuffer | null {
    // (the original takes a read lock on SimulationData's element graphics and a render mutex here: one thread)
    const sim = this.sim, ren = this.ren;

    ren.ApplySettings(rendererSettings);

    sim.clear_sim();

    Load(sim, save, true, { X: 0, Y: 0 });
    ren.ClearAccumulation();
    ren.Clear();
    if (fire) {
      ren.ApproximateAccumulation();
    }
    ren.RenderSimulation();

    const tempThumb = new VideoBuffer(save.blockSize.X * CELL, save.blockSize.Y * CELL);
    const video = ren.GetVideo();
    const size = ren.Size();
    tempThumb.BlendImage(video, 0xFF, 0, 0, size.X, size.Y);

    return tempThumb;
  }
}

/**
 * ThumbnailRendererTask(save, size, decorationLevel, fire): doWork() + Finish(), run at once. Returns the
 * thumbnail resized to fit `size` (its Size() is the task's new `size`), or null.
 */
export function RenderThumbnail(save: GameSave, sizeX: number, sizeY: number, decorationLevel = decorationEnabled, fire = false): VideoBuffer | null {
  const rendererSettings = new RendererSettings();
  rendererSettings.decorationLevel = decorationLevel;
  let thumbnail: VideoBuffer | null;
  try {
    thumbnail = SaveRenderer.Ref().Render(save, fire, rendererSettings);
  } catch (e) {
    // the task's doWork would end the worker; here a broken save just gets no thumbnail
    console.warn('SaveRenderer: ' + String((e as Error)?.message ?? e));
    thumbnail = null;
  }
  if (thumbnail) {
    thumbnail.ResizeToFit(sizeX, sizeY, true);
    return thumbnail;
  }
  return null;
}
