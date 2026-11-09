// @ts-nocheck
// libGDX classes the translated game mentions that the headless runtime does not provide: graphics (GL
// textures, pixmaps, sprite batches, cameras), scene2d (the text field of the text input window), FreeType
// fonts, controllers. Each is a stub that throws, naming itself, when it is used (pendingClass); the browser
// backend replaces them with its implementations. The small enums among them are real (comparisons and
// switches on them work headless).
import { pendingClass } from '../jre/lang.ts';
import { libEnum } from './core.ts';

export const Pixmap_Format = libEnum('Pixmap_Format', 'com.badlogic.gdx.graphics.Pixmap$Format',
  ['Alpha', 'Intensity', 'LuminanceAlpha', 'RGB565', 'RGBA4444', 'RGB888', 'RGBA8888']);
export const Pixmap_Blending = libEnum('Pixmap_Blending', 'com.badlogic.gdx.graphics.Pixmap$Blending', ['None', 'SourceOver']);
export const Pixmap_Filter = libEnum('Pixmap_Filter', 'com.badlogic.gdx.graphics.Pixmap$Filter', ['NearestNeighbour', 'BiLinear']);
export const Affine2 = pendingClass('Affine2', 'com.badlogic.gdx.math.Affine2');
export const Mesh_VertexDataType = libEnum('Mesh_VertexDataType', 'com.badlogic.gdx.graphics.Mesh$VertexDataType',
  ['VertexArray', 'VertexBufferObject', 'VertexBufferObjectSubData', 'VertexBufferObjectWithVAO']);
// SpriteBatch, OrthographicCamera, Viewport and scene2d's Stage, Skin, Container, TextField, TextArea and
// ChangeListener (noosa's TextInput) are in web/scene2d.ts: a DOM text field in the browser.
