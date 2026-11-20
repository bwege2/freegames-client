// The oracle for the Madness Interactive Reloaded port: runs MIR 0.51.1's own code (MIR.dll built from the
// reference source, with its Walgelijk packages) without a window and writes what it computes as JSON, for
// web/games/madness/test/golden/oracle.json. Only code that needs no scene, no assets and no graphics is called;
// a CharacterComponent is made without its field initialisers (they would load the registries).
//   dotnet run -- <MIR base dir> <out.json>
using System.Globalization;
using System.Numerics;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using MIR;
using Newtonsoft.Json.Linq;
using Walgelijk;
using Walgelijk.AssetManager;

static class Oracle
{
    static readonly StringBuilder sb = new();
    static string F(float f) => float.IsFinite(f) ? ((double)f).ToString("R", CultureInfo.InvariantCulture) : "null";
    static string V(Vector2 v) => $"[{F(v.X)},{F(v.Y)}]";

    static int Main(string[] args)
    {
        var baseDir = args[0];
        sb.Append('{');
        Noise_();
        sb.Append(',');
        Utilities_();
        sb.Append(',');
        Anims(baseDir);
        sb.Append(',');
        Stats(baseDir);
        sb.Append(',');
        Armour(baseDir);
        sb.Append(',');
        Floors(baseDir);
        sb.Append(',');
        Weapons_();
        sb.Append(',');
        PrepareAssets(baseDir);
        Characters(baseDir);
        sb.Append(',');
        Random_();
        sb.Append(',');
        Incident(baseDir);
        sb.Append('}');
        File.WriteAllText(args[1], sb.ToString());
        return 0;
    }

    static void Noise_()
    {
        sb.Append("\"noise\":[");
        var rnd = new Random(1234);
        for (int i = 0; i < 300; i++)
        {
            float x = (float)(rnd.NextDouble() * 200 - 100), y = (float)(rnd.NextDouble() * 200 - 100), z = (float)(rnd.NextDouble() * 200 - 100);
            if (i > 0) sb.Append(',');
            sb.Append($"[{F(x)},{F(y)},{F(z)},{F(Noise.GetValue(x, y, z))},{F(Noise.GetSimplex(x, y, z))},{F(Noise.GetFractal(x, y, z, 3))}]");
        }
        sb.Append(']');
    }

    static void Utilities_()
    {
        sb.Append("\"utilities\":[");
        var rnd = new Random(99);
        for (int i = 0; i < 100; i++)
        {
            float a = (float)(rnd.NextDouble() * 720 - 360), b = (float)(rnd.NextDouble() * 720 - 360), t = (float)rnd.NextDouble();
            float sp = (float)(rnd.NextDouble() * 40), dt = (float)(rnd.NextDouble() * 0.05);
            var p = new Vector2(a, b);
            if (i > 0) sb.Append(',');
            sb.Append($"[{F(a)},{F(b)},{F(t)},{F(sp)},{F(dt)},{F(Utilities.DeltaAngle(a, b))},{F(Utilities.LerpAngle(a, b, t))},{F(Utilities.SmoothApproach(a, b, sp, dt))},");
            sb.Append($"{F(Utilities.SmoothAngleApproach(a, b, sp, dt))},{V(Utilities.RotatePoint(p, b, new Vector2(t * 10, -t)))},{F(Utilities.VectorToAngle(p))},");
            sb.Append($"{F(Easings.Quad.InOut(t))},{F(Easings.Cubic.InOut(t))},{F(Easings.Circ.InOut(t))},{F(Easings.Circ.Out(t))},{F(Utilities.Snap(a, 180))}]");
        }
        sb.Append(']');
    }

    static readonly Dictionary<string, CharacterAnimation> animations = [];
    static void Anims(string baseDir)
    {
        sb.Append("\"animations\":{");
        bool first = true;
        foreach (var path in Directory.EnumerateFiles(Path.Combine(baseDir, "data", "animations"), "*.anim", SearchOption.AllDirectories).Order(StringComparer.Ordinal))
        {
            var name = Path.GetFileNameWithoutExtension(path);
            var group = Path.GetFileName(Path.GetDirectoryName(path)!)!;
            var a = AnimationDeserialiser.Load(File.OpenRead(path), name, group);
            animations[name] = a;
            if (!first) sb.Append(',');
            first = false;
            sb.Append($"\"{name}\":{{\"group\":\"{group}\",\"total\":{F(a.TotalDuration)},\"relative\":{(a.RelativeHandPosition ? "true" : "false")},\"constraints\":[");
            sb.Append(string.Join(',', a.Constraints.Select(c => $"[{F(c.Time)},{(uint)c.Constraints}]")));
            sb.Append("],\"head\":"); Limb(a.HeadAnimation);
            sb.Append(",\"body\":"); Limb(a.BodyAnimation);
            sb.Append(",\"hands\":[");
            if (a.HandAnimations != null)
                for (int i = 0; i < a.HandAnimations.Length; i++)
                {
                    if (i > 0) sb.Append(',');
                    Limb(a.HandAnimations[i]);
                }
            sb.Append("]}");
        }
        sb.Append('}');
    }
    static void Limb(LimbAnimation? l)
    {
        if (l == null) { sb.Append("null"); return; }
        sb.Append($"{{\"duration\":{F(l.Duration)},\"aim\":{(l.AdjustForAim ? "true" : "false")},\"samples\":[");
        for (int i = 0; i <= 10; i++)
        {
            float t = i / 10f * 1.1f - 0.05f;
            if (i > 0) sb.Append(',');
            sb.Append($"[{F(t)},{(l.TranslationCurve != null ? V(l.TranslationCurve.Evaluate(t)) : "null")},{(l.RotationCurve != null ? F(l.RotationCurve.Evaluate(t)) : "null")},{(l.ScaleCurve != null ? V(l.ScaleCurve.Evaluate(t)) : "null")}");
            if (l is HandLimbAnimation h) { var look = h.GetHandLookForTime(t); sb.Append($",{(look.HasValue ? ((int)look.Value).ToString() : "null")}"); }
            sb.Append(']');
        }
        sb.Append("]}");
    }

    static void Stats(string baseDir)
    {
        sb.Append("\"stats\":{");
        bool first = true;
        foreach (var path in Directory.EnumerateFiles(Path.Combine(baseDir, "data", "stats"), "*.stats").Order(StringComparer.Ordinal))
        {
            var s = CharacterStatsDeserialiser.Load(path);
            if (!first) sb.Append(',');
            first = false;
            sb.Append($"\"{Path.GetFileNameWithoutExtension(path)}\":[\"{s.Name}\",{F(s.Scale)},{F(s.AimingRandomness)},{F(s.AimingSpeed)},{F(s.ShootingTimeout)},{F(s.RecoilHandlingAbility)},{F(s.AccurateShotChance)},");
            sb.Append($"{F(s.DodgeAbility)},{F(s.JumpDodgeDuration)},{F(s.WalkHopDuration)},{(int)s.AgilitySkillLevel},{F(s.PanicIntensity)},{F(s.MeleeSkill)},{F(s.MeleeKnockback)},");
            sb.Append($"{(s.CanDeflect ? "true" : "false")},{(s.DodgeOversaturate ? "true" : "false")},{F(s.HeadHealth)},{F(s.BodyHealth)},\"{string.Join(' ', s.UnarmedSeq)}\",\"{s.WalkAnimation ?? ""}\"]");
        }
        sb.Append('}');
    }

    static void Armour(string baseDir)
    {
        sb.Append("\"armour\":{");
        bool first = true;
        foreach (var path in Directory.EnumerateFiles(Path.Combine(baseDir, "data", "armour"), "*.armor", SearchOption.AllDirectories).Order(StringComparer.Ordinal))
        {
            var p = ArmourDeserialiser.Load(File.OpenRead(path), path);
            if (!first) sb.Append(',');
            first = false;
            sb.Append($"\"{Path.GetFileNameWithoutExtension(path)}\":[{(int)p.Type},{F(p.TextureScale)},{F(p.DeflectChance)},{V(p.OffsetLeft)},{V(p.OffsetRight)},{(p.Detachable ? "true" : "false")},{p.BrokenKeys?.Length ?? 0}]");
        }
        sb.Append('}');
    }

    static void Floors(string baseDir)
    {
        sb.Append("\"floors\":{");
        bool first = true;
        foreach (var path in Directory.EnumerateFiles(Path.Combine(baseDir, "data", "levels"), "lvl_*.json").Order(StringComparer.Ordinal))
        {
            var j = JObject.Parse(File.ReadAllText(path));
            var level = new Level();
            foreach (var p in (JArray?)j["FloorLine"] ?? [])
                level.FloorLine.Add(new Vector2((float)p["X"]!, (float)p["Y"]!));
            var b = j["LevelBounds"]!;
            float minX = (float)b["MinX"]!, maxX = (float)b["MaxX"]!;
            if (!first) sb.Append(',');
            first = false;
            sb.Append($"\"{Path.GetFileNameWithoutExtension(path)}\":[");
            for (int i = 0; i <= 40; i++)
            {
                float x = minX + (maxX - minX) * i / 40f;
                if (i > 0) sb.Append(',');
                sb.Append($"[{F(x)},{F(level.GetFloorLevelAt(x))},{(level.IsFlatAt(x) ? "true" : "false")}]");
            }
            sb.Append(']');
        }
        sb.Append('}');
    }

    static void Weapons_()
    {
        sb.Append("\"weapons\":{\"damage\":[");
        for (int i = 0; i < 20; i++)
        {
            float d = i * 0.17f, dist = i * 431.7f + 1;
            if (i > 0) sb.Append(',');
            sb.Append($"[{F(d)},{F(dist)},{F(WeaponComponent.GetDamageAtDistance(d, dist))},{F(BulletEmitter.GetBulletHoleSize(dist, d, i % 4 + 1))}]");
        }
        sb.Append("],\"melee\":[");
        var types = Enum.GetValues<MeleeDamageType>();
        var sizes = Enum.GetValues<MeleeSize>();
        bool first = true;
        foreach (var at in types) foreach (var asz in sizes) foreach (var vt in types) foreach (var vsz in sizes)
                    {
                        var a = new WeaponData { WeaponType = WeaponType.Melee, MeleeDamageType = at, MeleeSize = asz };
                        var v = new WeaponData { WeaponType = WeaponType.Melee, MeleeDamageType = vt, MeleeSize = vsz };
                        if (!first) sb.Append(',');
                        first = false;
                        sb.Append($"[\"{at}\",\"{asz}\",\"{vt}\",\"{vsz}\",\"{MeleeUtils.GetInteractionResponse(a, v)}\"]");
                    }
        sb.Append("]}");
    }

    /// <summary>CharacterConstants loads the body part shaders when first touched: a package with base/shaders</summary>
    static void PrepareAssets(string baseDir)
    {
        var dir = Path.Combine(AppContext.BaseDirectory, "oracle-assets");
        if (Directory.Exists(dir)) Directory.Delete(dir, true);
        Directory.CreateDirectory(Path.Combine(dir, "shaders"));
        foreach (var f in Directory.GetFiles(Path.Combine(baseDir, "shaders")))
            File.Copy(f, Path.Combine(dir, "shaders", Path.GetFileName(f)));
        var pkg = Path.Combine(AppContext.BaseDirectory, "oracle-assets.waa");
        using (var o = new FileStream(pkg, FileMode.Create))
            AssetPackageUtils.Build("base", new DirectoryInfo(dir), o, new AssetPreprocessor());
        Assets.RegisterPackage(pkg);
    }

    /// <summary>a character built as Prefabs.CreateCharacter places its limbs, without a scene</summary>
    static CharacterComponent MakeCharacter(float scale, bool flipped)
    {
        var bottom = new Vector2(100, 50);
        var bodyCenter = bottom + new Vector2(0, CharacterConstants.HalfHeight * scale);
        var hand1 = new HandAnimatedLimb { IsLeftHand = false, GlobalPosition = bodyCenter + CharacterConstants.HandOffset1 * scale };
        var hand2 = new HandAnimatedLimb { IsLeftHand = true, GlobalPosition = bodyCenter + CharacterConstants.HandOffset2 * scale };
        var pos = new CharacterPositioning(scale, bodyCenter,
            new HeadAnimatedLimb { GlobalPosition = bottom + new Vector2(10, 300) * scale },
            new BodyAnimatedLimb { GlobalPosition = bottom },
            new TwoOfThem<HandAnimatedLimb>(hand1, hand2),
            new TwoOfThem<FootLimb>(new FootLimb { GlobalPosition = bottom + new Vector2(40, 10) * scale }, new FootLimb { GlobalPosition = bottom + new Vector2(-30, -6) * scale }));
        pos.IsFlipped = flipped;
        var c = (CharacterComponent)RuntimeHelpers.GetUninitializedObject(typeof(CharacterComponent));
        typeof(CharacterComponent).GetField("Positioning")!.SetValue(c, pos);
        typeof(CharacterComponent).GetField("Animations")!.SetValue(c, new List<ActiveCharacterAnimation>());
        c.AimOrigin = pos.GlobalCenter;
        return c;
    }

    static void Characters(string baseDir)
    {
        sb.Append("\"characters\":[");
        var names = new[] { "dodge_1", "fist_melee_1", "f_headshot_fly_back", "jump_master_forward", "pickup_1", "stun_heavy_forwards", "throw_left", "melee_unarmed_2", "melee_sword_L_1", "spawn_jump" };
        bool first = true;
        int k = 0;
        foreach (var name in names)
        {
            if (!animations.TryGetValue(name, out var anim)) continue;
            foreach (var flipped in new[] { false, true })
                foreach (var scale in new[] { 1f, 1.3f })
                {
                    var c = MakeCharacter(scale, flipped);
                    c.AimTargetPosition = new Vector2(100 + (flipped ? -900 : 1100), 700 + k * 13);
                    k++;
                    // hand poses first (CharacterPositionSystem.PositionHands calls them before the animation is applied)
                    c.Positioning.Head.GlobalRotation = 4.5f * k;
                    c.Positioning.MeleeBlockProgress = (k % 3) / 3f;
                    HandPosingFunctions.FistFight(new HandPoseParams(null!, c, 1 / 60f, null));
                    var poses = $"[{V(c.Positioning.Hands[0].PosePosition)},{F(c.Positioning.Hands[0].PoseRotation)},{V(c.Positioning.Hands[1].PosePosition)},{F(c.Positioning.Hands[1].PoseRotation)}]";
                    var active = new ActiveCharacterAnimation(anim, 1);
                    c.Animations.Add(active);
                    for (int i = 0; i <= 8; i++)
                    {
                        active.UnscaledTimer = anim.TotalDuration * i / 8f;
                        var r = CharacterUtilities.CalculateAnimationResult(active, c);
                        if (!first) sb.Append(',');
                        first = false;
                        sb.Append($"{{\"anim\":\"{name}\",\"flipped\":{(flipped ? "true" : "false")},\"scale\":{F(scale)},\"aim\":{V(c.AimTargetPosition)},\"headRot\":{F(c.Positioning.Head.GlobalRotation)},\"block\":{F(c.Positioning.MeleeBlockProgress)},\"timer\":{F(active.UnscaledTimer)},\"poses\":{poses},");
                        sb.Append($"\"r\":[{V(r.BodyPosition)},{F(r.BodyRotation)},{V(r.BodyScale)},{V(r.HeadPosition)},{F(r.HeadRotation)},{V(r.HeadScale)},");
                        sb.Append($"{V(r.Hand1Position)},{F(r.Hand1Rotation)},{V(r.Hand1Scale)},{V(r.Hand2Position)},{F(r.Hand2Rotation)},{V(r.Hand2Scale)},");
                        sb.Append($"{(r.Hand1Look.HasValue ? ((int)r.Hand1Look.Value).ToString() : "null")},{(r.Hand2Look.HasValue ? ((int)r.Hand2Look.Value).ToString() : "null")}],");
                        sb.Append($"\"constraints\":{(uint)c.GetAnimationConstraints()}}}");
                    }
                }
        }
        sb.Append(']');
    }

    static void Random_()
    {
        // System.Random with a seed (IncidentConfig) and Noise.GetPerlin (TrainShakeSystem)
        sb.Append("\"random\":[");
        bool first = true;
        foreach (var seed in new[] { 0, 1, 42, 123456789, 2147483646, 977 })
        {
            var r = new Random(seed);
            var next = Enumerable.Range(0, 12).Select(i => r.Next(0, 100 + i * 37)).ToArray();
            var singles = Enumerable.Range(0, 6).Select(_ => F(r.NextSingle())).ToArray();
            var items = r.GetItems(new[] { 0, 1, 2, 3, 4, 5, 6 }, 9);
            var shuffled = Enumerable.Range(0, 20).ToArray();
            r.Shuffle(shuffled);
            if (!first) sb.Append(',');
            first = false;
            sb.Append($"{{\"seed\":{seed},\"next\":[{string.Join(',', next)}],\"single\":[{string.Join(',', singles)}],\"items\":[{string.Join(',', items)}],\"shuffle\":[{string.Join(',', shuffled)}]}}");
        }
        sb.Append("],\"perlin\":[");
        var rnd = new Random(4321);
        for (int i = 0; i < 200; i++)
        {
            float x = (float)(rnd.NextDouble() * 200 - 100), y = (float)(rnd.NextDouble() * 200 - 100), z = (float)(rnd.NextDouble() * 4000 - 2000);
            if (i > 0) sb.Append(',');
            sb.Append($"[{F(x)},{F(y)},{F(z)},{F(Noise.GetPerlin(x, y, z))}]");
        }
        sb.Append(']');
    }

    static void Incident(string baseDir)
    {
        // IncidentConfig.CreateCampaign's draws from its System.Random, line by line, on the level and weapon keys in
        // ordinal order (the registries are ConcurrentDictionaries, whose key order is not fixed in the original) and
        // without the enemy kinds (drawn from the shared Utilities random). The levels' numbers come from their files.
        var levelDir = Path.Combine(baseDir, "data", "levels");
        var files = Directory.EnumerateFiles(levelDir, "*.json", SearchOption.AllDirectories).ToDictionary(p => Path.GetFileNameWithoutExtension(p));
        var keys = files.Keys.Order(StringComparer.Ordinal).ToArray();
        string[] beginLevels = [.. keys.Where(k => k.StartsWith("lvl_incident_begin"))];
        string[] endLevels = [.. keys.Where(k => k.StartsWith("lvl_incident_end"))];
        string[] midLevels = [.. keys.Where(k => k.StartsWith("lvl_incident")).Except(beginLevels).Except(endLevels)];
        string[] wpns = [.. Directory.EnumerateFiles(Path.Combine(baseDir, "data", "weapons"), "*.json").Select(p => (string)JObject.Parse(File.ReadAllText(p))["Id"]!).Order(StringComparer.Ordinal)];
        var music = JArray.Parse(File.ReadAllText(Path.Combine(baseDir, "data", "incident_music.json"))).Select(t => (string)t!).ToArray();
        sb.Append("\"incident\":[");
        bool first = true;
        foreach (var (seed, killTarget) in new[] { (1, 100), (42, 20), (31337, 200), (123456, 57), (2024, 150) })
        {
            var rand = new Random(seed);
            var mid = midLevels.ToArray();
            var selectedMusic = music[rand.Next(0, music.Length)];
            var begin = rand.GetItems(beginLevels, 1);
            var end = rand.GetItems(endLevels, 1);
            rand.Shuffle(mid);
            string[] ids = [begin[0], .. mid.Take(5), end[0]];
            var lv = ids.Select(id => JObject.Parse(File.ReadAllText(files[id]))).Select(j => new {
                Body = (int)j["BodyCountToWin"]!, Npcs = ((JArray)j["Objects"]!).Count(o => ((string)o["$type"]!).Split(',')[0].EndsWith(".NPC")),
                Spawns = ((JArray?)j["EnemySpawnInstructions"])?.Count ?? 0, Max = (int)j["MaxEnemyCount"]! }).ToArray();
            var body = lv.Select(l => l.Body).ToArray();
            int maxCycles = 5000, sum;
            while (true)
            {
                sum = body.Sum();
                if (sum == killTarget || maxCycles-- <= 0) break;
                var sign = int.Sign(killTarget - sum);
                var i = 1 + rand.GetItems(Enumerable.Range(0, ids.Length - 2).ToArray(), 1)[0];
                if (lv[i].Spawns != 0 && lv[i].Max != 0)
                {
                    body[i] += sign;
                    body[i] = int.Max(1, int.Max(lv[i].Npcs, body[i]));
                }
            }
            var mids = new List<string>();
            for (int i = 1; i < ids.Length - 1; i++)
            {
                if (lv[i].Spawns == 0 || lv[i].Max == 0) { mids.Add("null"); continue; }
                var maxEnemy = rand.Next(2, 4);
                var maxAttack = rand.Next(2, 4);
                var w = rand.GetItems(wpns, rand.Next(2, 30));
                var interval = float.Lerp(0.01f, 0.2f, rand.NextSingle());
                int n = 0;
                for (; n < rand.Next(2, 10); n++) { }
                mids.Add($"{{\"maxEnemies\":{maxEnemy},\"maxAttacking\":{maxAttack},\"weapons\":[{string.Join(',', w.Select(x => $"\"{x}\""))}],\"interval\":{F(interval)},\"spawns\":{n}}}");
            }
            if (!first) sb.Append(',');
            first = false;
            sb.Append($"{{\"seed\":{seed},\"kills\":{killTarget},\"music\":\"{selectedMusic}\",\"levels\":[{string.Join(',', ids.Select(x => $"\"{x}\""))}],\"body\":[{string.Join(',', body)}],\"sum\":{sum},\"mid\":[{string.Join(',', mids)}]}}");
        }
        sb.Append(']');
    }
}
