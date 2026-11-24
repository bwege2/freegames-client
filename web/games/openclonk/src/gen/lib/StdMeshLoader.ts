// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMeshLoader.cpp, src/lib/StdMeshLoader.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$sqrt } from '../../rt/libc.ts';
import { $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $copy, $itcopy, $max, $min, $missing, $reserve, $throw, $vpush, StdException, StdMap, StdPair, resize } from '../../rt/std.ts';

export class StdMeshLoader {

  static LoadMeshBinary(sourcefile, length, mat_mgr, loader, filename = null) {
    let $t1, $t2;
    let root = null;
    let stream = new $.DataStream().init(sourcefile, length);
    root = $.Chunk.Read(stream);
    if (root.GetType() !== 4096) {
      $throw(new InvalidVersion().init());
    }
    root = $.Chunk.Read(stream);
    if (root.GetType() !== 12288) {
      $throw(new InvalidVersion().init());
    }
    const cmesh = root;
    let mesh = new $.StdMesh().init();
    if (!cmesh.skeletonFile.empty()) {
      let skeleton_filename = new $.StdCopyStrBuf();
      StdMeshSkeletonLoader.MakeFullSkeletonPath(skeleton_filename, filename, cmesh.skeletonFile.c_str());
      mesh.Skeleton = loader.GetSkeletonByName(skeleton_filename);
      if (mesh.Skeleton == null) {
        let exception = new $.StdCopyStrBuf().init$pi8$b(S("The specified skeleton file was not found: "));
        exception.Append$pi8(skeleton_filename.getData());
        $throw(new InsufficientData().init(exception.getData()));
      }
    }
    0;
    let bone_lookup = new StdMap();
    for (let i = 0; i < mesh.GetSkeleton$v().GetNumBones(); i = i + 1) {
      bone_lookup.entry(mesh.GetSkeleton$v().GetBone(i).ID & 0xffff, () => 0).second = i;
    }
    $reserve(mesh.SubMeshes, cmesh.submeshes.length);
    for (let i = 0; i < cmesh.submeshes.length; i = i + 1) {
      $vpush(mesh.SubMeshes, new $.StdSubMesh().init());
      const sm = mesh.SubMeshes[mesh.SubMeshes.length - 1];
      const csm = cmesh.submeshes[i];
      sm.Material = mat_mgr.GetMaterial(csm.material.c_str());
      if (sm.Material == null) {
        $throw(new InvalidMaterial().init());
      }
      if (csm.operation !== 4) {
        $throw(new NotImplemented().init(S("Submesh operations other than TriList aren't implemented yet")));
      }
      resize(sm.Faces, Math.trunc(csm.faceVertices.length / 3), () => new $.StdMeshFace());
      for (let face = 0; face < sm.Faces.length; face = face + 1) {
        sm.Faces[face].Vertices[0] = csm.faceVertices[face * 3 + 0] >>> 0;
        sm.Faces[face].Vertices[1] = csm.faceVertices[face * 3 + 1] >>> 0;
        sm.Faces[face].Vertices[2] = csm.faceVertices[face * 3 + 2] >>> 0;
      }
      const geo = csm.hasSharedVertices ? cmesh.geometry : csm.geometry;
      sm.Vertices = $.ReadSubmeshGeometry(geo, filename).slice();
      const boneAssignments = csm.hasSharedVertices ? cmesh.boneAssignments : csm.boneAssignments;
      0;
      for (const ba of boneAssignments) {
        if (ba.vertex >= sm.GetNumVertices()) {
          $throw(new VertexNotFound().init());
        }
        if (bone_lookup.find(ba.bone & 0xffff).eq(bone_lookup.end())) {
          $throw(new BoneNotFound().init());
        }
        let bone_index = bone_lookup.entry(ba.bone & 0xffff, () => 0).second;
        const vertex = sm.Vertices[ba.vertex];
        if (vertex.bone_weight[7] !== Math.fround(0)) {
          $throw(new NotImplemented().init(S("Vertex is influenced by too many bones")));
        }
        for (let weight_index = 0; weight_index < 8; weight_index = weight_index + 1) {
          if (vertex.bone_weight[weight_index] === Math.fround(0)) {
            vertex.bone_weight[weight_index] = ba.weight;
            vertex.bone_index[weight_index] = bone_index & 0xffff;
            break;
          }
        }
      }
      for (const vertex of sm.Vertices) {
        let sum = Math.fround(0);
        for (const weight of vertex.bone_weight) {
          sum = Math.fround(sum + weight);
        }
        if (sum !== Math.fround(0)) {
          $t1 = vertex.bone_weight;
          for (let $i4 = 0; $i4 < $t1.length; $i4++) {
            const weight = P($t1, $i4);
            weight.a[weight.o] = Math.fround(weight.a[weight.o] / sum);
          }
        } else {
          vertex.bone_weight[0] = 1;
        }
      }
    }
    let first = true;
    for (let i = 0; i < mesh.SubMeshes.length + 1; i = i + 1 >>> 0) {
      let vertices = null;
      if (i < mesh.SubMeshes.length) {
        vertices = mesh.SubMeshes[i].Vertices;
      } else {
        vertices = mesh.SharedVertices;
      }
      for (const vertex of vertices) {
        let d = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(vertex.x * vertex.x) + Math.fround(vertex.y * vertex.y)) + Math.fround(vertex.z * vertex.z))));
        if (first) {
          mesh.BoundingBox.x1 = mesh.BoundingBox.x2 = vertex.x;
          mesh.BoundingBox.y1 = mesh.BoundingBox.y2 = vertex.y;
          mesh.BoundingBox.z1 = mesh.BoundingBox.z2 = vertex.z;
          mesh.BoundingRadius = d;
          first = false;
        } else {
          mesh.BoundingBox.x1 = $min(vertex.x, mesh.BoundingBox.x1);
          mesh.BoundingBox.x2 = $max(vertex.x, mesh.BoundingBox.x2);
          mesh.BoundingBox.y1 = $min(vertex.y, mesh.BoundingBox.y1);
          mesh.BoundingBox.y2 = $max(vertex.y, mesh.BoundingBox.y2);
          mesh.BoundingBox.z1 = $min(vertex.z, mesh.BoundingBox.z1);
          mesh.BoundingBox.z2 = $max(vertex.z, mesh.BoundingBox.z2);
          mesh.BoundingRadius = $max(mesh.BoundingRadius, d);
        }
      }
    }
    if (mesh.BoundingBox.x1 === mesh.BoundingBox.x2 || mesh.BoundingBox.y1 === mesh.BoundingBox.y2) {
      $throw(new EmptyBoundingBox().init());
    }
    return ($t2 = mesh, mesh = null, $t2);
  }

  static LoadMeshXml(..._) { return $missing("StdMeshLoader::LoadMeshXml"); }

  $clone() { return new StdMeshLoader().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class StdMeshLoader$LoaderException extends StdException {

  init(msg) {
    this.$setmsg(msg);
    return this;
  }

  $clone() { return new StdMeshLoader$LoaderException().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class StdMeshSkeletonLoader {
  Skeletons = new StdMap((a, b) => a.op_lt(b));
  AppendtoSkeletons = new StdMap((a, b) => a.op_lt(b));
  IncludeSkeletons = new StdMap((a, b) => a.op_lt(b));

  StoreSkeleton(groupname, filename, skeleton) {
    0;
    0;
    0;
    skeleton.PostInit();
    let filepath = new $.StdCopyStrBuf();
    StdMeshSkeletonLoader.MakeFullSkeletonPath(filepath, groupname, filename);
    this.AddSkeleton(filepath, skeleton);
    let buf_filename = new $.StdCopyStrBuf().init$pi8$b($.GetFilenameOnly(filename));
    let command_with_definition = new $.StdCopyStrBuf().init$pi8$b($.GetFilenameOnly(buf_filename.getData()));
    let command = new $.StdCopyStrBuf().init$pi8$b($.GetFilenameOnly(command_with_definition.getData()));
    let definition = new $.StdCopyStrBuf().init$pi8$b($.GetExtension(buf_filename.getData()));
    if (!command_with_definition.op_eq$StdStrBuf(command)) {
      definition.$assign(new $.StdCopyStrBuf().init$pi8$b($.GetExtension(command_with_definition.getData())));
    }
    let appendto = S("appendto");
    let include = S("include");
    if (command.op_eq$pi8(appendto)) {
      this.AppendtoSkeletons.insertPair(new StdPair($copy(filepath), $copy(definition)));
    } else if (command.op_eq$pi8(include)) {
      this.IncludeSkeletons.insertPair(new StdPair($copy(filepath), $copy(definition)));
    }
  }

  RemoveSkeleton$StdCopyStrBuf(filepath) {
    let existing_skeleton = this.Skeletons.find(filepath);
    if (!existing_skeleton.eq(this.Skeletons.end())) {
      this.Skeletons.erase($itcopy(existing_skeleton));
    }
    let appendto_skeleton = this.AppendtoSkeletons.find(filepath);
    if (!appendto_skeleton.eq(this.AppendtoSkeletons.end())) {
      this.AppendtoSkeletons.erase($itcopy(appendto_skeleton));
    }
    let include_skeleton = this.IncludeSkeletons.find(filepath);
    if (!include_skeleton.eq(this.IncludeSkeletons.end())) {
      this.IncludeSkeletons.erase($itcopy(include_skeleton));
    }
  }

  RemoveSkeleton$pi8$pi8(groupname, filename) {
    let filepath = new $.StdCopyStrBuf();
    StdMeshSkeletonLoader.MakeFullSkeletonPath(filepath, groupname, filename);
    this.RemoveSkeleton$StdCopyStrBuf(filepath);
  }

  RemoveSkeletonsInGroup(groupname) {
    let delete_skeletons = [];
    let it = null;
    for (it = this.Skeletons.begin().copy(); !it.eq(this.Skeletons.end()); it.postinc()) {
      let skeletonpath = new $.StdCopyStrBuf().init$pi8$b(it.v.first.getData());
      let group = new $.StdCopyStrBuf().init$pi8$b(groupname);
      group.ToLowerCase();
      let skeletongroup = new $.StdCopyStrBuf();
      $.GetParentPath$pi8$pStdStrBuf(skeletonpath.getData(), skeletongroup);
      if (skeletongroup.op_eq$StdStrBuf(group)) {
        $vpush(delete_skeletons, skeletonpath.$clone());
      }
    }
    for (const delete_skeleton of delete_skeletons) {
      this.RemoveSkeleton$StdCopyStrBuf(delete_skeleton);
    }
  }

  GetSkeletonByName(name) {
    let filename = new $.StdCopyStrBuf().init$StdStrBuf$b(name);
    let iter = this.Skeletons.find(filename);
    if (iter.eq(this.Skeletons.end())) {
      return null;
    }
    return iter.v.second;
  }

  LoadSkeletonXml(..._) { return $missing("StdMeshSkeletonLoader::LoadSkeletonXml"); }

  LoadSkeletonBinary(groupname, filename, sourcefile, size) {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    let chunk = null;
    let stream = new $.DataStream().init(sourcefile, size);
    let Skeleton = new $.StdMeshSkeleton().init();
    chunk = $.Chunk$2.Read(stream);
    if (chunk.GetType() !== 4096) {
      $throw(new InvalidVersion$2().init());
    }
    let bones = new StdMap();
    let animations = [];
    for (let id = $.ChunkBase$i32$2.Peek(stream); id === 4112 || id === 8192 || id === 12288 || id === 16384; id = $.ChunkBase$i32$2.Peek(stream)) {
      let chunk$2 = $.Chunk$2.Read(stream);
      switch (chunk$2.GetType()) {
        case 4112:
          {
            const cblend = chunk$2;
            if (cblend.blend_mode !== 0) {
              $.LogF(S("StdMeshLoader: CID_BlendMode not implemented."));
            }
          }
          break;
        case 8192:
          {
            const cbone = chunk$2;
            if (!bones.find(cbone.handle).eq(bones.end())) {
              $throw(new IdNotUnique().init());
            }
            let bone = new $.StdMeshBone().init();
            bone.Parent = null;
            bone.ID = cbone.handle;
            bone.Name.op_assign$pi8(cbone.name.c_str());
            bone.Transformation.translate.$assign(cbone.position);
            bone.Transformation.rotate.$assign(cbone.orientation);
            bone.Transformation.scale.$assign(cbone.scale);
            bone.InverseTransformation.$assign($.StdMeshTransformation.Inverse(bone.Transformation));
            bones.insertPair(new StdPair(cbone.handle, bone));
          }
          break;
        case 12288:
          {
            const cbparent = chunk$2;
            if (bones.find(cbparent.parentHandle).eq(bones.end()) || bones.find(cbparent.childHandle).eq(bones.end())) {
              $throw(new BoneNotFound().init());
            }
            bones.entry(cbparent.parentHandle, () => null).second.Children.push(bones.entry(cbparent.childHandle, () => null).second);
            bones.entry(cbparent.childHandle, () => null).second.Parent = bones.entry(cbparent.parentHandle, () => null).second;
          }
          break;
        case 16384:
          animations.push(($t2 = chunk$2, chunk$2 = null, $t2));
          break;
        default:
          0;
          break;
      }
      if (stream.AtEof()) {
        break;
      }
    }
    let master = null;
    for (const b of bones) {
      if (b.second.Parent == null) {
        master = b.second;
        Skeleton.AddMasterBone(master);
      }
    }
    if (master == null) {
      $throw(new MissingMasterBone().init());
    }
    for (const b of bones) {
      ($t3 = b.second, b.second = null, $t3);
    }
    bones.clear();
    let handle_lookup = new StdMap();
    for (let i = 0; i < Skeleton.GetNumBones(); i = i + 1) {
      handle_lookup.entry(Skeleton.GetBone(i).ID & 0xffff, () => 0).second = i;
    }
    $t4 = animations;
    for (let $i1 = 0; $i1 < $t4.length; $i1++) {
      const canim = P($t4, $i1);
      const anim = Skeleton.Animations.entry(new $.StdCopyStrBuf().init$pi8$b(canim.a[canim.o].name.c_str()), () => new $.StdMeshAnimation().init()).second;
      anim.Name.op_assign$pi8(canim.a[canim.o].name.c_str());
      anim.Length = canim.a[canim.o].duration;
      resize(anim.Tracks, Skeleton.GetNumBones(), () => null);
      anim.OriginSkeleton = Skeleton;
      $t5 = canim.a[canim.o].tracks;
      for (let $i2 = 0; $i2 < $t5.length; $i2++) {
        const catrack = P($t5, $i2);
        const bone = Skeleton.GetBone(handle_lookup.entry(catrack.a[catrack.o].bone, () => 0).second);
        const track = P(anim.Tracks, bone.Index);
        if (track.a[track.o] != null) {
          $throw(new MultipleBoneTracks().init());
        }
        track.a[track.o] = new $.StdMeshTrack().None();
        $t6 = catrack.a[catrack.o].keyframes;
        for (let $i3 = 0; $i3 < $t6.length; $i3++) {
          const catkf = P($t6, $i3);
          const kf = track.a[track.o].Frames.entry(catkf.a[catkf.o].time, () => new $.StdMeshKeyFrame()).second;
          kf.Transformation.rotate.$assign(catkf.a[catkf.o].rotation);
          kf.Transformation.scale.$assign(catkf.a[catkf.o].scale);
          kf.Transformation.translate.$assign($.op_mul$StdMeshQuaternion$StdMeshVector(bone.InverseTransformation.rotate, $.op_mul$StdMeshVector$StdMeshVector(bone.InverseTransformation.scale, catkf.a[catkf.o].translation)));
          kf.Transformation.$assign(TransformTransformation(kf.Transformation));
        }
      }
    }
    for (const bone of Skeleton.Bones) {
      if (bone.Parent != null) {
        bone.Transformation.$assign($.op_mul$StdMeshTransformation$StdMeshTransformation(bone.Parent.Transformation, TransformTransformation(bone.Transformation)));
      } else {
        bone.Transformation.$assign(TransformTransformation(bone.Transformation));
      }
      bone.InverseTransformation.$assign($.StdMeshTransformation.Inverse(bone.Transformation));
    }
    this.StoreSkeleton(groupname, filename, Skeleton);
  }

  ResolveIncompleteSkeletons() {
    this.DoResetSkeletons();
    this.DoAppendSkeletons();
    this.DoIncludeSkeletons();
  }

  static MakeFullSkeletonPath(out, groupname, filename) {
    out.$assign(new $.StdCopyStrBuf().init$pi8$b(groupname));
    out.AppendBackslash();
    out.Append$pi8(filename);
    out.ToLowerCase();
  }

  Clear() {
    this.Skeletons.clear();
    this.AppendtoSkeletons.clear();
    this.IncludeSkeletons.clear();
  }

  skeletons_begin() {
    return this.Skeletons.begin();
  }

  skeletons_end() {
    return this.Skeletons.end();
  }

  AddSkeleton(filepath, skeleton) {
    let key_and_value = new StdPair($copy(filepath), skeleton);
    let insert = this.Skeletons.insertPair(key_and_value);
    if ((insert.second ? 1 : 0) === 0) {
      $.LogF(S("WARNING: Overloading skeleton %s"), filepath.getData());
      this.Skeletons.entry(filepath, () => null).second = skeleton;
    }
  }

  DoResetSkeletons() {
    let it = null;
    for (it = this.Skeletons.begin().copy(); !it.eq(this.Skeletons.end()); it.postinc()) {
      let skeleton = it.v.second;
      let animations = skeleton.Animations.begin();
      while (!animations.eq(skeleton.Animations.end())) {
        if (animations.v.second.OriginSkeleton !== skeleton) {
          animations = skeleton.Animations.erase($itcopy(animations)).copy();
        } else {
          animations.inc();
        }
      }
    }
  }

  DoAppendSkeletons() {
    let it = null;
    for (it = this.AppendtoSkeletons.begin().copy(); !it.eq(this.AppendtoSkeletons.end()); it.postinc()) {
      let id = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(it.v.second);
      let destination = this.GetSkeletonByDefinition(id.getData());
      if (destination == null) {
        $.LogF(S("WARNING: Appending skeleton '%s' failed"), it.v.first.getData());
      } else {
        let source = this.GetSkeletonByName(it.v.first);
        let animations = null;
        for (animations = source.Animations.begin().copy(); !animations.eq(source.Animations.end()); animations.postinc()) {
          if (!destination.Animations.find(animations.v.first).eq(destination.Animations.end())) {
            $.LogF(S("WARNING: Overloading animation '%s' is not allowed. This animation already exists in '%s'."), animations.v.first.getData(), id.getData());
          } else {
            destination.InsertAnimation$StdMeshSkeleton$StdMeshAnimation(source, animations.v.second);
          }
        }
      }
    }
  }

  DoIncludeSkeletons() {
    let it = null;
    for (it = this.IncludeSkeletons.begin().copy(); !it.eq(this.IncludeSkeletons.end()); it.postinc()) {
      let id = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(it.v.second);
      let source = this.GetSkeletonByDefinition(id.getData());
      if (source == null) {
        $.LogF(S("WARNING: Including skeleton '%s' failed"), it.v.first.getData());
      } else {
        let destination = this.GetSkeletonByName(it.v.first);
        let animations = null;
        for (animations = source.Animations.begin().copy(); !animations.eq(source.Animations.end()); animations.postinc()) {
          if (!destination.Animations.find(animations.v.first).eq(destination.Animations.end())) {
            $.LogF(S("WARNING: Animation '%s' from %s is not included. A newer version of the animation exists in the destination file."), animations.v.first.getData(), id.getData());
          } else {
            destination.InsertAnimation$StdMeshSkeleton$StdMeshAnimation(source, animations.v.second);
          }
        }
      }
    }
  }

  None() {
    this.Skeletons = new StdMap((a, b) => a.op_lt(b));
    this.AppendtoSkeletons = new StdMap((a, b) => a.op_lt(b));
    this.IncludeSkeletons = new StdMap((a, b) => a.op_lt(b));
    return this;
  }

  $clone() { return new StdMeshSkeletonLoader().$assign(this); }
  $assign(o) {
    this.Skeletons = o.Skeletons.$clone();
    this.AppendtoSkeletons = o.AppendtoSkeletons.$clone();
    this.IncludeSkeletons = o.IncludeSkeletons.$clone();
    return this;
  }
}

export class InsufficientData extends StdMeshLoader$LoaderException {

  init(msg = S("Premature end of data stream")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InsufficientData().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class EmptyBoundingBox extends StdMeshLoader$LoaderException {

  init(msg = S("Bounding box is empty")) {
    super.init(msg);
    return this;
  }

  $clone() { return new EmptyBoundingBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class InvalidMaterial extends StdMeshLoader$LoaderException {

  init(msg = S("The material referenced by a mesh or submesh is not defined")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InvalidMaterial().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class InvalidSubmeshOp extends StdMeshLoader$LoaderException {

  init(msg = S("The render operation of a CID_Submesh_Op chunk was invalid")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InvalidSubmeshOp().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class InvalidVersion extends StdMeshLoader$LoaderException {

  init(msg = S("Mesh header does not contain the expected version")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InvalidVersion().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class InvalidVertexDeclaration extends StdMeshLoader$LoaderException {

  init(msg = S("The vertex declaration of a CID_Geometry chunk was invalid")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InvalidVertexDeclaration().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class InvalidVertexSemantic extends StdMeshLoader$LoaderException {

  init(msg = S("The vertex semantic of a CID_Geometry_Vertex_Decl_Element chunk was invalid")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InvalidVertexSemantic().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class InvalidVertexType extends StdMeshLoader$LoaderException {

  init(msg = S("The vertex type of a CID_Geometry_Vertex_Decl_Element chunk was invalid")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InvalidVertexType().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class NotImplemented extends StdMeshLoader$LoaderException {

  init(msg = S("The requested operation is not implemented")) {
    super.init(msg);
    return this;
  }

  $clone() { return new NotImplemented().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class SharedVertexGeometryForbidden extends StdMeshLoader$LoaderException {

  init(msg = S("A CID_Geometry chunk was found in a submesh with shared vertices")) {
    super.init(msg);
    return this;
  }

  $clone() { return new SharedVertexGeometryForbidden().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class VertexNotFound extends StdMeshLoader$LoaderException {

  init(msg = S("A specified vertex was not found")) {
    super.init(msg);
    return this;
  }

  $clone() { return new VertexNotFound().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class MultipleSingletonChunks extends StdMeshLoader$LoaderException {

  init(msg = S("A singleton chunk was found multiple times")) {
    super.init(msg);
    return this;
  }

  $clone() { return new MultipleSingletonChunks().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class BoneNotFound extends StdMeshLoader$LoaderException {

  init(msg = S("A specified bone was not found")) {
    super.init(msg);
    return this;
  }

  $clone() { return new BoneNotFound().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class IdNotUnique extends StdMeshLoader$LoaderException {

  init(msg = S("An element with an unique ID appeared multiple times")) {
    super.init(msg);
    return this;
  }

  $clone() { return new IdNotUnique().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class InvalidVersion$2 extends StdMeshLoader$LoaderException {

  init(msg = S("Skeleton header does not contain the expected version")) {
    super.init(msg);
    return this;
  }

  $clone() { return new InvalidVersion$2().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class MissingMasterBone extends StdMeshLoader$LoaderException {

  init(msg = S("The skeleton does not have a master bone")) {
    super.init(msg);
    return this;
  }

  $clone() { return new MissingMasterBone().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class MultipleBoneTracks extends StdMeshLoader$LoaderException {

  init(msg = S("An animation has multiple tracks for one bone")) {
    super.init(msg);
    return this;
  }

  $clone() { return new MultipleBoneTracks().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function Transpose(matrix) {
  0;
  0;
  0;
  let result = new $.StdMeshMatrix();
  $wr(result.op_call$i32$i32(0, 0), 0, matrix.op_call$i32$i32$c(0, 0));
  $wr(result.op_call$i32$i32(0, 1), 0, matrix.op_call$i32$i32$c(1, 0));
  $wr(result.op_call$i32$i32(0, 2), 0, matrix.op_call$i32$i32$c(2, 0));
  $wr(result.op_call$i32$i32(0, 3), 0, 0);
  $wr(result.op_call$i32$i32(1, 0), 0, matrix.op_call$i32$i32$c(0, 1));
  $wr(result.op_call$i32$i32(1, 1), 0, matrix.op_call$i32$i32$c(1, 1));
  $wr(result.op_call$i32$i32(1, 2), 0, matrix.op_call$i32$i32$c(2, 1));
  $wr(result.op_call$i32$i32(1, 3), 0, 0);
  $wr(result.op_call$i32$i32(2, 0), 0, matrix.op_call$i32$i32$c(0, 2));
  $wr(result.op_call$i32$i32(2, 1), 0, matrix.op_call$i32$i32$c(1, 2));
  $wr(result.op_call$i32$i32(2, 2), 0, matrix.op_call$i32$i32$c(2, 2));
  $wr(result.op_call$i32$i32(2, 3), 0, 0);
  return result;
}





export function TransformVector(vector) {
  return $.op_mul$StdMeshMatrix$StdMeshVector($.OgreToClonkMatrix, vector);
}

export function TransformPseudoVector(vector) {
  return $.op_mul$f32$StdMeshVector($.OgreToClonkDeterminant, $.op_mul$StdMeshMatrix$StdMeshVector($.OgreToClonkMatrix, vector));
}

export function TransformNormalVector(vector) {
  return $.op_mul$StdMeshMatrix$StdMeshVector($.OgreToClonkInverseTranspose, vector);
}

export function TransformScaleVector(vector) {
  let scale = $.StdMeshMatrix.Scale(vector.x, vector.y, vector.z);
  let transformed = $.op_mul$StdMeshMatrix$StdMeshMatrix($.op_mul$StdMeshMatrix$StdMeshMatrix($.OgreToClonkMatrix, scale), $.OgreToClonkInverse);
  let result = new $.StdMeshVector();
  result.x = $rd(transformed.op_call$i32$i32(0, 0));
  result.y = $rd(transformed.op_call$i32$i32(1, 1));
  result.z = $rd(transformed.op_call$i32$i32(2, 2));
  return result;
}

export function TransformQuaternion(quaternion) {
  let axis = new $.StdMeshVector();
  axis.x = quaternion.x;
  axis.y = quaternion.y;
  axis.z = quaternion.z;
  let transformed = TransformPseudoVector(axis);
  let result = new $.StdMeshQuaternion();
  result.w = quaternion.w;
  result.x = transformed.x;
  result.y = transformed.y;
  result.z = transformed.z;
  return result;
}

export function TransformVertex(vertex) {
  let pos = new $.StdMeshVector();
  let normal = new $.StdMeshVector();
  pos.x = vertex.x;
  pos.y = vertex.y;
  pos.z = vertex.z;
  normal.x = vertex.nx;
  normal.y = vertex.ny;
  normal.z = vertex.nz;
  pos.$assign(TransformVector(pos));
  normal.$assign(TransformNormalVector(normal));
  let result = vertex.$clone();
  result.x = pos.x;
  result.y = pos.y;
  result.z = pos.z;
  result.nx = normal.x;
  result.ny = normal.y;
  result.nz = normal.z;
  return result;
}

export function TransformTransformation(trans) {
  let result = new $.StdMeshTransformation().None();
  result.scale.$assign(TransformScaleVector(trans.scale));
  result.rotate.$assign(TransformQuaternion(trans.rotate));
  result.translate.$assign(TransformVector(trans.translate));
  return result;
}

export function $init(): void {
  $.OgreToClonkMatrix = $.op_mul$StdMeshMatrix$StdMeshMatrix($.StdMeshMatrix.Scale(-1, -1, -1), $.StdMeshMatrix.Rotate(Math.fround(Math.fround(3.141592653589793) / 2), 0, 1, 0));
  $.OgreToClonkInverse = $.StdMeshMatrix.Inverse($.OgreToClonkMatrix);
  $.OgreToClonkInverseTranspose = Transpose($.OgreToClonkInverse);
  $.OgreToClonkDeterminant = $.OgreToClonkMatrix.Determinant();
}

Object.assign($, { BoneNotFound, EmptyBoundingBox, IdNotUnique, InsufficientData, InvalidMaterial, InvalidSubmeshOp, InvalidVersion, InvalidVersion$2, InvalidVertexDeclaration, InvalidVertexSemantic, InvalidVertexType, MissingMasterBone, MultipleBoneTracks, MultipleSingletonChunks, NotImplemented, SharedVertexGeometryForbidden, StdMeshLoader, StdMeshLoader$LoaderException, StdMeshSkeletonLoader, TransformNormalVector, TransformPseudoVector, TransformQuaternion, TransformScaleVector, TransformTransformation, TransformVector, TransformVertex, Transpose, VertexNotFound });
