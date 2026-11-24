// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMeshLoaderBinary.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $padd, $rd, $reinterp, $reinterpVoid, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $max, $reserve, $throw, $vpush, StdMap } from '../../rt/std.ts';

export function VertexDeclarationIsSane(decl, _filename) {
  const semanticSeen = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];
  for (const element of decl) {
    switch (element.semantic) {
      case 7:
        break;
      case 1:
      case 4:
      case 5:
      case 6:
        if (semanticSeen[element.semantic]) {
          return false;
        }
        break;
      default:
        break;
    }
    semanticSeen[element.semantic] = true;
  }
  return true;
}

export function ReadNormalizedVertexData(dest, source, vdet) {
  dest[0] = dest[1] = dest[2] = Math.fround(0);
  dest[3] = Math.fround(1);
  switch (vdet) {
    case 3:
      dest[3] = $rd($reinterp($padd(source, 12), "f32"));
    case 2:
      dest[2] = $rd($reinterp($padd(source, 8), "f32"));
    case 1:
      dest[1] = $rd($reinterp($padd(source, 4), "f32"));
    case 0:
      dest[0] = $rd($reinterp($padd(source, 0), "f32"));
      break;
    case 11:
      dest[3] = Math.fround(Math.fround(source.a[source.o + 0]) / 255);
      for (let i = 0; i < 3; i = i + 1 | 0) {
        dest[i] = Math.fround(Math.fround(source.a[source.o + (3 - i | 0)]) / 255);
      }
      break;
    case 10:
      dest[3] = Math.fround(Math.fround(source.a[source.o + 0]) / 255);
      for (let i = 0; i < 3; i = i + 1 | 0) {
        dest[i] = Math.fround(Math.fround(source.a[source.o + (i + 1 | 0)]) / 255);
      }
      break;
    default:
      0;
      break;
  }
}

export function ReadSubmeshGeometry(geo, filename) {
  let $t1, $t2, $t3;
  if (!VertexDeclarationIsSane(geo.vertexDeclaration, filename)) {
    $throw(new $.InvalidVertexDeclaration().init());
  }
  let max_offset = new StdMap();
  $t1 = geo.vertexDeclaration;
  for (let $i1 = 0; $i1 < $t1.length; $i1++) {
    const el = P($t1, $i1);
    let elsize = 0;
    switch (el.a[el.o].type) {
      case 0:
        elsize = 4;
        break;
      case 1:
        elsize = 8;
        break;
      case 2:
        elsize = 12;
        break;
      case 3:
        elsize = 16;
        break;
      case 11:
      case 10:
        elsize = 4;
        break;
      default:
        0;
        break;
    }
    max_offset.entry(el.a[el.o].source, () => 0).second = $max(max_offset.entry(el.a[el.o].source, () => 0).second, el.a[el.o].offset + elsize);
  }
  let cursors = new StdMap();
  $t2 = geo.vertexBuffers;
  for (let $i1 = 0; $i1 < $t2.length; $i1++) {
    const buf = P($t2, $i1);
    if (!cursors.find(buf.a[buf.o].index).eq(cursors.end())) {
      $throw(new $.MultipleSingletonChunks().init(S("Multiple vertex buffers were bound to the same stream")));
    }
    cursors.entry(buf.a[buf.o].index, () => null).second = $reinterpVoid(buf.a[buf.o].data.data, "i8");
    if (buf.a[buf.o].vertexSize < max_offset.entry(buf.a[buf.o].index, () => 0).second) {
      $throw(new $.InsufficientData().init(S("Vertices overlapping")));
    }
    if (buf.a[buf.o].GetSize() < (geo.vertexCount - 1) * buf.a[buf.o].vertexSize + max_offset.entry(buf.a[buf.o].index, () => 0).second) {
      $throw(new $.InsufficientData().init(S("Vertex buffer too small")));
    }
    max_offset.erase(buf.a[buf.o].index);
  }
  if (!max_offset.empty()) {
    $throw(new $.InsufficientData().init(S("A vertex element references an unbound stream")));
  }
  let vertices = [];
  $reserve(vertices, geo.vertexCount);
  for (let i = 0; i < geo.vertexCount; i = i + 1) {
    let vertex = new $.StdMeshVertex().init();
    vertex.nx = vertex.ny = vertex.nz = Math.fround(0);
    vertex.x = vertex.y = vertex.z = Math.fround(0);
    vertex.u = vertex.v = Math.fround(0);
    let read_tex = false;
    $t3 = geo.vertexDeclaration;
    for (let $i2 = 0; $i2 < $t3.length; $i2++) {
      const element = P($t3, $i2);
      const values = new Float32Array(4);
      ReadNormalizedVertexData(values, $padd(cursors.entry(element.a[element.o].source, () => null).second, element.a[element.o].offset), element.a[element.o].type);
      switch (element.a[element.o].semantic) {
        case 1:
          vertex.x = values[0];
          vertex.y = values[1];
          vertex.z = values[2];
          break;
        case 4:
          vertex.nx = values[0];
          vertex.ny = values[1];
          vertex.nz = values[2];
          break;
        case 7:
          if (!read_tex) {
            vertex.u = values[0];
            vertex.v = values[1];
            read_tex = true;
          }
          break;
        default:
          break;
      }
    }
    $vpush(vertices, $.TransformVertex(vertex));
    for (const buf$2 of geo.vertexBuffers) {
      cursors.entry(buf$2.index, () => null).second = cursors.entry(buf$2.index, () => null).second.add(buf$2.vertexSize);
    }
  }
  return vertices;
}

export function $init(): void {
}

Object.assign($, { ReadNormalizedVertexData, ReadSubmeshGeometry, VertexDeclarationIsSane });
