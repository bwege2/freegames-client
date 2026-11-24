// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMeshLoaderBinaryChunks.cpp, src/lib/StdMeshLoaderBinaryChunks.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $i64n } from '../../rt/int.ts';
import { $own, $reinterpVoid, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $fill_list, $reserve, $throw, $vpush, StdMap, StdPair, StdString, seq_insert, seq_swap } from '../../rt/std.ts';

export class ChunkBase$i32$2 {
  static ChunkHeaderLength;
  type = 0;
  size = 0;

  init() {
    this.type = 0;
    return this;
  }

  GetType() {
    return this.type;
  }

  GetSize() {
    return this.size;
  }

  static Peek(stream) {
    return stream.Peek$v$5();
  }

  $clone() { return new ChunkBase$i32$2().$assign(this); }
  $assign(o) {
    this.type = o.type;
    this.size = o.size;
    return this;
  }
}

export class ChunkBase$i32 {
  static ChunkHeaderLength;
  type = 0;
  size = 0;

  init() {
    this.type = 0;
    return this;
  }

  GetType() {
    return this.type;
  }

  GetSize() {
    return this.size;
  }

  static Peek(stream) {
    return stream.Peek$v$5();
  }

  $clone() { return new ChunkBase$i32().$assign(this); }
  $assign(o) {
    this.type = o.type;
    this.size = o.size;
    return this;
  }
}

export class BoneAssignment {
  static $layout = [["vertex", 0, "u32", 0], ["bone", 4, "u32", 0], ["weight", 8, "f32", 0]];
  static $size = 12;
  vertex = 0;
  bone = 0;
  weight = 0;

  $clone() { return new BoneAssignment().$assign(this); }
  $assign(o) {
    this.vertex = o.vertex;
    this.bone = o.bone;
    this.weight = o.weight;
    return this;
  }
}

export class Chunk extends ChunkBase$i32 {

  static Read(stream) {
    0;
    let id = 0 /*CID_Invalid*/;
    id = stream.Read$v$5();
    let size = 0;
    if (id !== 4096) {
      size = stream.Read$v$4();
      size = size - 6;
    }
    let chunk = null;
    switch (id) {
      case 4096:
        chunk = new ChunkFileHeader().None();
        break;
      case 12288:
        chunk = new ChunkMesh().init();
        break;
      case 28672:
      case 16640:
        chunk = new ChunkMeshBoneAssignments().None();
        break;
      case 24576:
        chunk = new ChunkMeshSkeletonLink().None();
        break;
      case 36864:
        chunk = new ChunkMeshBounds().None();
        break;
      case 16384:
        chunk = new ChunkSubmesh().init();
        break;
      case 16400:
        chunk = new ChunkSubmeshOp().None();
        break;
      case 20480:
        chunk = new ChunkGeometry().None();
        break;
      case 20992:
        chunk = new ChunkGeometryVertexBuffer().None();
        break;
      case 21008:
        chunk = new ChunkGeometryVertexData().init();
        break;
      case 20736:
        chunk = new ChunkGeometryVertexDecl().None();
        break;
      case 20752:
        chunk = new ChunkGeometryVertexDeclElement().None();
        break;
      default:
        $.LogF(S("StdMeshLoader: I don't know what to do with a chunk of type 0x%xu"), id);
      case 45056:
      case 40960:
        chunk = new ChunkUnknown().None();
        break;
    }
    ;
    chunk.type = id;
    chunk.size = size;
    chunk.ReadImpl(stream);
    return chunk;
  }

  None() {
    super.init();
    return this;
  }

  $clone() { return new Chunk().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Chunk$2 extends ChunkBase$i32$2 {

  static Read(stream) {
    0;
    let id = 0 /*CID_Invalid*/;
    id = stream.Read$v$5();
    let size = 0;
    if (id !== 4096) {
      size = stream.Read$v$4();
      size = size - 6;
    }
    let chunk = null;
    switch (id) {
      case 4096:
        chunk = new ChunkFileHeader$2().None();
        break;
      case 4112:
        chunk = new ChunkBlendMode().None();
        break;
      case 8192:
        chunk = new ChunkBone().None();
        break;
      case 12288:
        chunk = new ChunkBoneParent().None();
        break;
      case 16384:
        chunk = new ChunkAnimation().None();
        break;
      case 16400:
        chunk = new ChunkAnimationBaseInfo().None();
        break;
      case 16640:
        chunk = new ChunkAnimationTrack().None();
        break;
      case 16656:
        chunk = new ChunkAnimationTrackKF().None();
        break;
      case 20480:
        chunk = new ChunkAnimationLink().None();
        break;
      default:
        $.LogF(S("StdMeshLoader: I don't know what to do with a chunk of type 0x%xu"), id);
        chunk = new ChunkUnknown$2().None();
        break;
    }
    ;
    chunk.type = id;
    chunk.size = size;
    chunk.ReadImpl(stream);
    return chunk;
  }

  None() {
    super.init();
    return this;
  }

  $clone() { return new Chunk$2().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ChunkUnknown extends Chunk {

  ReadImpl(stream) {
    stream.Seek($i64n(this.GetSize()));
  }

  None() {
    return this;
  }

  $clone() { return new ChunkUnknown().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ChunkFileHeader extends Chunk {
  static VersionTable;
  static CurrentVersion;
  version = new StdString();

  ReadImpl(stream) {
    let it = ChunkFileHeader.VersionTable.find(stream.Read$v());
    if (it.eq(ChunkFileHeader.VersionTable.end())) {
      $throw(new $.InvalidVersion().init());
    }
  }

  None() {
    this.version = new StdString();
    return this;
  }

  $clone() { return new ChunkFileHeader().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.version = o.version.$clone();
    return this;
  }
}

export class ChunkMesh extends Chunk {
  hasAnimatedSkeleton = false;
  skeletonFile = new StdString();
  geometry = null;
  submeshes = [];
  boneAssignments = [];
  bounds = new $.StdMeshBox();
  radius = 0;

  init() {
    this.hasAnimatedSkeleton = false;
    this.skeletonFile = new StdString();
    this.geometry = null;
    this.submeshes = [];
    this.boneAssignments = [];
    this.bounds = new $.StdMeshBox();
    this.radius = 0;
    return this;
  }

  ReadImpl(stream) {
    this.hasAnimatedSkeleton = stream.Read$v$2();
    for (let id = ChunkBase$i32.Peek(stream); id === 20480 || id === 16384 || id === 24576 || id === 28672 || id === 32768 || id === 40960 || id === 36864 || id === 45056 || id === 49152 || id === 53248; id = ChunkBase$i32.Peek(stream)) {
      let chunk = Chunk.Read(stream);
      switch (chunk.GetType()) {
        case 20480:
          if (this.geometry != null) {
            $throw(new $.MultipleSingletonChunks().init(S("There's only one CID_Geometry chunk allowed within a CID_Mesh chunk")));
          }
          this.geometry = static_unique_cast$munique_ptr$2(chunk);
          break;
        case 16384:
          this.submeshes.push(static_unique_cast$munique_ptr(chunk));
          break;
        case 24576:
          if (!this.skeletonFile.empty()) {
            $throw(new $.MultipleSingletonChunks().init(S("There's only one CID_Mesh_Skeleton_Link chunk allowed within a CID_Mesh chunk")));
          }
          this.skeletonFile.assign(chunk.skeleton);
          break;
        case 36864:
          this.bounds.$assign(chunk.bounds);
          this.radius = chunk.radius;
          break;
        case 28672:
          {
            let assignments = chunk;
            seq_insert(this.boneAssignments, $end(this.boneAssignments), $begin(assignments.assignments), $end(assignments.assignments), (x) => x.$clone());
            break;
          }
        default:
          $.LogF(S("StdMeshLoader: I don't know what to do with a chunk of type 0x%xu inside a CID_Mesh chunk"), chunk.GetType());
        case 40960:
        case 45056:
          break;
      }
      if (stream.AtEof()) {
        break;
      }
    }
  }

  $clone() { return new ChunkMesh().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.hasAnimatedSkeleton = o.hasAnimatedSkeleton;
    this.skeletonFile = o.skeletonFile.$clone();
    this.geometry = o.geometry;
    this.submeshes = o.submeshes.slice();
    this.boneAssignments = o.boneAssignments.slice();
    this.bounds.$assign(o.bounds);
    this.radius = o.radius;
    return this;
  }
}

export class ChunkMeshSkeletonLink extends Chunk {
  skeleton = new StdString();

  ReadImpl(stream) {
    this.skeleton.assign(stream.Read$v());
  }

  None() {
    this.skeleton = new StdString();
    return this;
  }

  $clone() { return new ChunkMeshSkeletonLink().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.skeleton = o.skeleton.$clone();
    return this;
  }
}

export class ChunkSubmesh extends Chunk {
  material = new StdString();
  hasSharedVertices = false;
  faceVertices = [];
  geometry = null;
  operation = 4 /*SO_TriList*/;
  boneAssignments = [];

  init() {
    this.material = new StdString();
    this.faceVertices = [];
    this.geometry = null;
    this.operation = 4 /*SO_TriList*/;
    this.boneAssignments = [];
    return this;
  }

  ReadImpl(stream) {
    let $t1;
    this.operation = 4 /*SO_TriList*/;
    this.material.assign(stream.Read$v());
    this.hasSharedVertices = stream.Read$v$2();
    let index_count = stream.Read$v$4();
    let indexes_are_32bit = stream.Read$v$2();
    $reserve(this.faceVertices, index_count);
    while (($t1 = index_count, index_count = index_count - 1, $t1) !== 0) {
      let index = 0;
      if (indexes_are_32bit) {
        index = stream.Read$v$4();
      } else {
        index = stream.Read$v$5();
      }
      this.faceVertices.push(index);
    }
    for (let id = ChunkBase$i32.Peek(stream); id === 20480 || id === 16400 || id === 16640; id = ChunkBase$i32.Peek(stream)) {
      let chunk = Chunk.Read(stream);
      switch (chunk.GetType()) {
        case 20480:
          if (this.hasSharedVertices) {
            $throw(new $.SharedVertexGeometryForbidden().init());
          }
          if (this.geometry != null) {
            $throw(new $.MultipleSingletonChunks().init(S("There's only one CID_Geometry chunk allowed within a CID_Submesh chunk")));
          }
          this.geometry = static_unique_cast$munique_ptr$2(chunk);
          break;
        case 16400:
          this.operation = chunk.operation;
          break;
        case 16640:
          {
            let assignments = chunk;
            seq_insert(this.boneAssignments, $end(this.boneAssignments), $begin(assignments.assignments), $end(assignments.assignments), (x) => x.$clone());
          }
          break;
        default:
          $.LogF(S("StdMeshLoader: I don't know what to do with a chunk of type 0x%xu inside a CID_Submesh chunk"), chunk.GetType());
          break;
      }
      if (stream.AtEof()) {
        break;
      }
    }
  }

  $clone() { return new ChunkSubmesh().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.material = o.material.$clone();
    this.hasSharedVertices = o.hasSharedVertices;
    this.faceVertices = o.faceVertices.slice();
    this.geometry = o.geometry;
    this.operation = o.operation;
    this.boneAssignments = o.boneAssignments.slice();
    return this;
  }
}

export class ChunkSubmeshOp extends Chunk {
  operation = 0;

  ReadImpl(stream) {
    let op = stream.Read$v$5();
    if (op < 1 || op > 6) {
      $throw(new $.InvalidSubmeshOp().init());
    }
    this.operation = op | 0;
  }

  None() {
    return this;
  }

  $clone() { return new ChunkSubmeshOp().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.operation = o.operation;
    return this;
  }
}

export class ChunkMeshBoneAssignments extends Chunk {
  assignments = [];

  ReadImpl(stream) {
    let $t1;
    let bone_count = Math.trunc(this.GetSize() / 10);
    let assignment = new BoneAssignment();
    while (($t1 = bone_count, bone_count = bone_count - 1, $t1) > 0) {
      assignment.vertex = stream.Read$v$4();
      assignment.bone = stream.Read$v$5();
      assignment.weight = stream.Read$v$3();
      $vpush(this.assignments, assignment.$clone());
    }
  }

  None() {
    this.assignments = [];
    return this;
  }

  $clone() { return new ChunkMeshBoneAssignments().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.assignments = o.assignments.slice();
    return this;
  }
}

export class ChunkMeshBounds extends Chunk {
  bounds = new $.StdMeshBox();
  radius = 0;

  ReadImpl(stream) {
    this.bounds.x1 = stream.Read$v$3();
    this.bounds.y1 = stream.Read$v$3();
    this.bounds.z1 = stream.Read$v$3();
    this.bounds.x2 = stream.Read$v$3();
    this.bounds.y2 = stream.Read$v$3();
    this.bounds.z2 = stream.Read$v$3();
    this.radius = stream.Read$v$3();
  }

  None() {
    this.bounds = new $.StdMeshBox();
    return this;
  }

  $clone() { return new ChunkMeshBounds().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.bounds.$assign(o.bounds);
    this.radius = o.radius;
    return this;
  }
}

export class ChunkGeometry extends Chunk {
  vertexCount = 0;
  vertexDeclaration = [];
  vertexBuffers = [];

  ReadImpl(stream) {
    this.vertexCount = stream.Read$v$4();
    for (let id = ChunkBase$i32.Peek(stream); id === 20736 || id === 20992; id = ChunkBase$i32.Peek(stream)) {
      let chunk = Chunk.Read(stream);
      switch (chunk.GetType()) {
        case 20736:
          if (!(this.vertexDeclaration.length === 0)) {
            $throw(new $.MultipleSingletonChunks().init(S("There's only one CID_Geometry_Vertex_Decl chunk allowed within a CID_Geometry chunk")));
          }
          seq_swap(this.vertexDeclaration, chunk.declaration);
          break;
        case 20992:
          this.vertexBuffers.push(static_unique_cast$munique_ptr$4(chunk));
          break;
        default:
          $.LogF(S("StdMeshLoader: I don't know what to do with a chunk of type 0x%xu inside a CID_Geometry chunk"), chunk.GetType());
          break;
      }
      if (stream.AtEof()) {
        break;
      }
    }
  }

  None() {
    this.vertexDeclaration = [];
    this.vertexBuffers = [];
    return this;
  }

  $clone() { return new ChunkGeometry().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.vertexCount = o.vertexCount;
    this.vertexDeclaration = o.vertexDeclaration.slice();
    this.vertexBuffers = o.vertexBuffers.slice();
    return this;
  }
}

export class ChunkGeometryVertexDecl extends Chunk {
  declaration = [];

  ReadImpl(stream) {
    while (ChunkBase$i32.Peek(stream) === 20752) {
      let chunk = Chunk.Read(stream);
      0;
      this.declaration.push(static_unique_cast$runique_ptr(chunk));
      if (stream.AtEof()) {
        break;
      }
    }
  }

  None() {
    this.declaration = [];
    return this;
  }

  $clone() { return new ChunkGeometryVertexDecl().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.declaration = o.declaration.slice();
    return this;
  }
}

export class ChunkGeometryVertexDeclElement extends Chunk {
  source = 0;
  offset = 0;
  type = 0;
  semantic = 0;
  index = 0;

  ReadImpl(stream) {
    this.source = stream.Read$v$5();
    let t = stream.Read$v$5();
    if (t < 0 || t > 11) {
      $throw(new $.InvalidVertexType().init());
    }
    this.type = t;
    t = stream.Read$v$5();
    if (t < 1 || t > 9) {
      $throw(new $.InvalidVertexSemantic().init());
    }
    this.semantic = t;
    this.offset = stream.Read$v$5();
    this.index = stream.Read$v$5();
  }

  None() {
    return this;
  }

  $clone() { return new ChunkGeometryVertexDeclElement().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.source = o.source;
    this.offset = o.offset;
    this.type = o.type;
    this.semantic = o.semantic;
    this.index = o.index;
    return this;
  }
}

export class ChunkGeometryVertexBuffer extends Chunk {
  index = 0;
  vertexSize = 0;
  data = null;

  ReadImpl(stream) {
    this.index = stream.Read$v$5();
    this.vertexSize = stream.Read$v$5();
    while (ChunkBase$i32.Peek(stream) === 21008) {
      let chunk = Chunk.Read(stream);
      0;
      if (this.data != null) {
        $throw(new $.MultipleSingletonChunks().init(S("There's only one CID_Geometry_Vertex_Data chunk allowed within a CID_Geometry_Vertex_Buffer chunk")));
      }
      this.data = static_unique_cast$munique_ptr$3(chunk);
      if (stream.AtEof()) {
        break;
      }
    }
  }

  None() {
    this.data = null;
    return this;
  }

  $clone() { return new ChunkGeometryVertexBuffer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.index = o.index;
    this.vertexSize = o.vertexSize;
    this.data = o.data;
    return this;
  }
}

export class ChunkGeometryVertexData extends Chunk {
  data = null;

  init() {
    this.data = null;
    return this;
  }

  $dtor() {
    $delete($reinterpVoid(this.data, "i8"));
  }

  ReadImpl(stream) {
    this.data = P(new Int8Array(this.GetSize()), 0);
    stream.Read$px$u64(this.data, this.GetSize());
  }

  $clone() { return new ChunkGeometryVertexData().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.data = o.data;
    return this;
  }
}

export class ChunkUnknown$2 extends Chunk$2 {

  ReadImpl(stream) {
    stream.Seek($i64n(this.GetSize()));
  }

  None() {
    return this;
  }

  $clone() { return new ChunkUnknown$2().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ChunkFileHeader$2 extends Chunk$2 {
  static VersionTable;
  static CurrentVersion;
  version = new StdString();

  ReadImpl(stream) {
    let it = ChunkFileHeader$2.VersionTable.find(stream.Read$v());
    if (it.eq(ChunkFileHeader$2.VersionTable.end())) {
      $throw(new $.InvalidVersion$2().init());
    }
  }

  None() {
    this.version = new StdString();
    return this;
  }

  $clone() { return new ChunkFileHeader$2().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.version = o.version.$clone();
    return this;
  }
}

export class ChunkBlendMode extends Chunk$2 {
  blend_mode = 0;

  ReadImpl(stream) {
    this.blend_mode = stream.Read$v$5();
  }

  None() {
    return this;
  }

  $clone() { return new ChunkBlendMode().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.blend_mode = o.blend_mode;
    return this;
  }
}

export class ChunkBone extends Chunk$2 {
  name = new StdString();
  handle = 0;
  position = new $.StdMeshVector();
  orientation = new $.StdMeshQuaternion();
  scale = new $.StdMeshVector();

  ReadImpl(stream) {
    this.name.assign(stream.Read$v());
    this.handle = stream.Read$v$5();
    this.position.x = stream.Read$v$3();
    this.position.y = stream.Read$v$3();
    this.position.z = stream.Read$v$3();
    this.orientation.x = stream.Read$v$3();
    this.orientation.y = stream.Read$v$3();
    this.orientation.z = stream.Read$v$3();
    this.orientation.w = stream.Read$v$3();
    if (this.GetSize() > this.name.size() + 1 + 2 + 28) {
      this.scale.x = stream.Read$v$3();
      this.scale.y = stream.Read$v$3();
      this.scale.z = stream.Read$v$3();
    } else {
      this.scale.$assign($.StdMeshVector.UnitScale());
    }
  }

  None() {
    this.name = new StdString();
    this.position = new $.StdMeshVector();
    this.orientation = new $.StdMeshQuaternion();
    this.scale = new $.StdMeshVector();
    return this;
  }

  $clone() { return new ChunkBone().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.name = o.name.$clone();
    this.handle = o.handle;
    this.position.$assign(o.position);
    this.orientation.$assign(o.orientation);
    this.scale.$assign(o.scale);
    return this;
  }
}

export class ChunkBoneParent extends Chunk$2 {
  childHandle = 0;
  parentHandle = 0;

  ReadImpl(stream) {
    this.childHandle = stream.Read$v$5();
    this.parentHandle = stream.Read$v$5();
  }

  None() {
    return this;
  }

  $clone() { return new ChunkBoneParent().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.childHandle = o.childHandle;
    this.parentHandle = o.parentHandle;
    return this;
  }
}

export class ChunkAnimation extends Chunk$2 {
  name = new StdString();
  duration = 0;
  tracks = [];

  ReadImpl(stream) {
    this.name.assign(stream.Read$v());
    this.duration = stream.Read$v$3();
    if (!stream.AtEof() && ChunkBase$i32$2.Peek(stream) === 16400) {
      let chunk = Chunk$2.Read(stream);
      0;
      $.LogF(S("StdMeshLoader: CID_Animation_BaseInfo not implemented. Skeleton might not be imported properly."));
    }
    while (!stream.AtEof() && ChunkBase$i32$2.Peek(stream) === 16640) {
      let chunk = Chunk$2.Read(stream);
      0;
      this.tracks.push(static_unique_cast$munique_ptr$5(chunk));
    }
  }

  None() {
    this.name = new StdString();
    this.tracks = [];
    return this;
  }

  $clone() { return new ChunkAnimation().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.name = o.name.$clone();
    this.duration = o.duration;
    this.tracks = o.tracks.slice();
    return this;
  }
}

export class ChunkAnimationBaseInfo extends Chunk$2 {
  base_animation_name = new StdString();
  base_key_frame_time = 0;

  ReadImpl(stream) {
    this.base_animation_name.assign(stream.Read$v());
    this.base_key_frame_time = stream.Read$v$3();
  }

  None() {
    this.base_animation_name = new StdString();
    return this;
  }

  $clone() { return new ChunkAnimationBaseInfo().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.base_animation_name = o.base_animation_name.$clone();
    this.base_key_frame_time = o.base_key_frame_time;
    return this;
  }
}

export class ChunkAnimationTrack extends Chunk$2 {
  bone = 0;
  keyframes = [];

  ReadImpl(stream) {
    this.bone = stream.Read$v$5();
    while (ChunkBase$i32$2.Peek(stream) === 16656) {
      let chunk = Chunk$2.Read(stream);
      0;
      this.keyframes.push(static_unique_cast$munique_ptr$6(chunk));
      if (stream.AtEof()) {
        break;
      }
    }
  }

  None() {
    this.keyframes = [];
    return this;
  }

  $clone() { return new ChunkAnimationTrack().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.bone = o.bone;
    this.keyframes = o.keyframes.slice();
    return this;
  }
}

export class ChunkAnimationTrackKF extends Chunk$2 {
  time = 0;
  rotation = new $.StdMeshQuaternion();
  translation = new $.StdMeshVector();
  scale = new $.StdMeshVector();

  ReadImpl(stream) {
    this.time = stream.Read$v$3();
    this.rotation.x = stream.Read$v$3();
    this.rotation.y = stream.Read$v$3();
    this.rotation.z = stream.Read$v$3();
    this.rotation.w = stream.Read$v$3();
    this.translation.x = stream.Read$v$3();
    this.translation.y = stream.Read$v$3();
    this.translation.z = stream.Read$v$3();
    if (this.GetSize() > 32) {
      this.scale.x = stream.Read$v$3();
      this.scale.y = stream.Read$v$3();
      this.scale.z = stream.Read$v$3();
    } else {
      this.scale.$assign($.StdMeshVector.UnitScale());
    }
  }

  None() {
    this.rotation = new $.StdMeshQuaternion();
    this.translation = new $.StdMeshVector();
    this.scale = new $.StdMeshVector();
    return this;
  }

  $clone() { return new ChunkAnimationTrackKF().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.time = o.time;
    this.rotation.$assign(o.rotation);
    this.translation.$assign(o.translation);
    this.scale.$assign(o.scale);
    return this;
  }
}

export class ChunkAnimationLink extends Chunk$2 {
  file = new StdString();
  scale = new $.StdMeshVector();

  ReadImpl(stream) {
    this.file.assign(stream.Read$v());
    this.scale.x = stream.Read$v$3();
    this.scale.y = stream.Read$v$3();
    this.scale.z = stream.Read$v$3();
  }

  None() {
    this.file = new StdString();
    this.scale = new $.StdMeshVector();
    return this;
  }

  $clone() { return new ChunkAnimationLink().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.file = o.file.$clone();
    this.scale.$assign(o.scale);
    return this;
  }
}

export function static_unique_cast$munique_ptr(p) {
  let $t1;
  return ($t1 = p, p = null, $t1);
}

export function static_unique_cast$munique_ptr$2(p) {
  let $t1;
  return ($t1 = p, p = null, $t1);
}

export function static_unique_cast$munique_ptr$3(p) {
  let $t1;
  return ($t1 = p, p = null, $t1);
}

export function static_unique_cast$munique_ptr$4(p) {
  let $t1;
  return ($t1 = p, p = null, $t1);
}

export function static_unique_cast$runique_ptr(p) {
  let $t1;
  return ($t1 = p, p = null, $t1);
}

export function static_unique_cast$munique_ptr$5(p) {
  let $t1;
  return ($t1 = p, p = null, $t1);
}

export function static_unique_cast$munique_ptr$6(p) {
  let $t1;
  return ($t1 = p, p = null, $t1);
}

export function $init(): void {
  ChunkBase$i32.ChunkHeaderLength = 6;
  ChunkBase$i32$2.ChunkHeaderLength = 6;
  ChunkFileHeader.VersionTable = $fill_list(new StdMap(), $own([(($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("[MeshSerializer_v1.8]"), ChunkFileHeader.CurrentVersion)), (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("[MeshSerializer_v1.41]"), 1041)), (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("[MeshSerializer_v1.40]"), 1040))]));
  ChunkFileHeader.CurrentVersion = 1080;
  ChunkFileHeader$2.VersionTable = $fill_list(new StdMap(), $own([(($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("[Serializer_v1.80]"), ChunkFileHeader$2.CurrentVersion)), (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("[Serializer_v1.10]"), 1010))]));
  ChunkFileHeader$2.CurrentVersion = 1080;
}

Object.assign($, { BoneAssignment, Chunk, Chunk$2, ChunkAnimation, ChunkAnimationBaseInfo, ChunkAnimationLink, ChunkAnimationTrack, ChunkAnimationTrackKF, ChunkBase$i32, ChunkBase$i32$2, ChunkBlendMode, ChunkBone, ChunkBoneParent, ChunkFileHeader, ChunkFileHeader$2, ChunkGeometry, ChunkGeometryVertexBuffer, ChunkGeometryVertexData, ChunkGeometryVertexDecl, ChunkGeometryVertexDeclElement, ChunkMesh, ChunkMeshBoneAssignments, ChunkMeshBounds, ChunkMeshSkeletonLink, ChunkSubmesh, ChunkSubmeshOp, ChunkUnknown, ChunkUnknown$2, static_unique_cast$munique_ptr, static_unique_cast$munique_ptr$2, static_unique_cast$munique_ptr$3, static_unique_cast$munique_ptr$4, static_unique_cast$munique_ptr$5, static_unique_cast$munique_ptr$6, static_unique_cast$runique_ptr });
