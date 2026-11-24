// @ts-nocheck
// OpenClonk 36de799: src/platform/C4MusicSystem.cpp, src/platform/C4MusicSystem.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { al$alcCloseDevice, al$alcCreateContext, al$alcDestroyContext, al$alcMakeContextCurrent, al$alcOpenDevice, al$alutExit, al$alutInitWithoutContext } from '../../rt/al.ts';
import { c$strchr, c$strlen } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max } from '../../rt/std.ts';

export class C4MusicSystem {
  static DefaultMusicBreak;
  static DefaultMusicBreakChance;
  static DefaultMusicMaxPositionMemory;
  Songs = null;
  SongCount = 0;
  ASongCount = 0;
  SCounter = 0;
  PlayMusicFile = null;
  Volume = 100;
  Loop = false;
  FadeMusicFile = null;
  upcoming_music_file = null;
  FadeTimeStart = new $.C4TimeMilliseconds();
  FadeTimeEnd = new $.C4TimeMilliseconds();
  is_waiting = false;
  wait_time_end = new $.C4TimeMilliseconds();
  MODInitialized = false;
  alcDevice = null;
  alcContext = null;
  game_music_level = 100;
  playlist = new $.StdCopyStrBuf();
  playlist_valid = false;
  music_break_min = 0;
  music_break_max = 0;
  music_break_chance = 0;
  music_max_position_memory = 0;

  init() {
    this.Songs = null;
    this.SongCount = 0;
    this.PlayMusicFile = null;
    this.Volume = 100;
    this.FadeMusicFile = null;
    this.upcoming_music_file = null;
    this.FadeTimeStart = new $.C4TimeMilliseconds();
    this.FadeTimeEnd = new $.C4TimeMilliseconds();
    this.is_waiting = false;
    this.wait_time_end = new $.C4TimeMilliseconds();
    this.alcDevice = null;
    this.alcContext = null;
    this.game_music_level = 100;
    this.playlist = new $.StdCopyStrBuf();
    this.playlist_valid = false;
    this.music_break_min = C4MusicSystem.DefaultMusicBreak;
    this.music_break_max = C4MusicSystem.DefaultMusicBreak;
    return this;
  }

  $dtor() {
    C4MusicSystem.prototype.Clear.call(this);
  }

  Clear() {
    this.ClearSongs();
    if (this.MODInitialized) {
      this.DeinitializeMOD();
    }
  }

  ClearGame() {
    this.game_music_level = 100;
    this.music_break_min = this.music_break_max = C4MusicSystem.DefaultMusicBreak;
    this.music_break_chance = C4MusicSystem.DefaultMusicBreakChance;
    this.music_max_position_memory = C4MusicSystem.DefaultMusicMaxPositionMemory;
    this.SetPlayList(null);
    this.is_waiting = false;
    this.upcoming_music_file = null;
  }

  UpdateVolume() {
    let config_volume = $.Clamp$i32$i32$i32($.Config.Sound.MusicVolume, 0, 100);
    this.Volume = Math.imul(config_volume, this.game_music_level) / 100 | 0;
    if (this.PlayMusicFile != null) {
      this.PlayMusicFile.SetVolume(this.Volume);
    }
  }

  Execute(force_song_execution = false) {
    if (this.FadeMusicFile != null) {
      let tNow = $.C4TimeMilliseconds.Now();
      if ($.op_ge(tNow, this.FadeTimeEnd)) {
        this.FadeMusicFile.Stop();
        this.FadeMusicFile = null;
        if (this.PlayMusicFile != null) {
          this.PlayMusicFile.SetVolume(this.Volume);
        } else if (this.upcoming_music_file != null) {
          force_song_execution = true;
        }
      } else {
        let fade_volume = Math.imul(1000, $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(tNow, this.FadeTimeStart)) / $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(this.FadeTimeEnd, this.FadeTimeStart) | 0;
        this.FadeMusicFile.SetVolume(Math.imul(this.Volume, 1000 - fade_volume | 0) / 1000 | 0);
        if (this.PlayMusicFile != null) {
          this.PlayMusicFile.SetVolume(Math.imul(this.Volume, fade_volume) / 1000 | 0);
        }
      }
    }
    if ($.Game.iTick35 === 0 || !$.Game.IsRunning || force_song_execution || $.Game.IsPaused()) {
      if (this.PlayMusicFile == null) {
        if (!this.is_waiting || $.op_ge($.C4TimeMilliseconds.Now(), this.wait_time_end)) {
          let next_file = this.upcoming_music_file;
          this.is_waiting = false;
          this.upcoming_music_file = null;
          if (next_file != null) {
            this.Play$pC4MusicFile$b$f64(next_file, false, 0);
          } else {
            this.Play$pi8$b$i32$f64$b();
          }
        }
      } else {
        this.PlayMusicFile.CheckIfPlaying();
      }
    }
  }

  NotifySuccess() {
    if (this.PlayMusicFile == null) {
      return;
    }
    if (this.Loop) {
      if (this.PlayMusicFile.Play()) {
        return;
      }
    }
    this.Stop();
    this.ScheduleWaitTime();
  }

  Init(PlayList = null) {
    if (!this.MODInitialized && !this.InitializeMOD()) {
      return false;
    }
    this.ClearSongs();
    this.LoadDir($.Config.AtSystemDataPath(S("Music.ocg")));
    this.LoadDir($.Config.AtUserDataPath(S("Music.ocg")));
    this.LoadMoreMusic();
    this.SCounter = 0;
    if (PlayList != null) {
      this.SetPlayList(PlayList);
    } else {
      this.SetPlayList(null);
    }
    this.UpdateVolume();
    return true;
  }

  InitForScenario(hGroup) {
    let fLocalMusic = false;
    let MusicDir = new $.StdStrBuf();
    if (this.GrpContainsMusic(hGroup)) {
      this.ClearSongs();
      fLocalMusic = true;
      MusicDir.Take$mStdStrBuf($.Game.ScenarioFile.GetFullName());
      this.LoadDir(MusicDir.getData());
      $.LogF($.LoadResStr(S("IDS_PRC_LOCALMUSIC")), MusicDir.getData());
    }
    let pMusicFolder = null;
    while ((pMusicFolder = $.Game.GroupSet.FindGroup(8, pMusicFolder)) != null) {
      if (!fLocalMusic) {
        this.ClearSongs();
        fLocalMusic = true;
      }
      MusicDir.Take$mStdStrBuf(pMusicFolder.GetFullName());
      MusicDir.AppendChar(47);
      MusicDir.Append$pi8(S("Music.ocg"));
      this.LoadDir(MusicDir.getData());
      $.LogF($.LoadResStr(S("IDS_PRC_LOCALMUSIC")), MusicDir.getData());
    }
    if (this.SongCount === 0) {
      return false;
    }
    this.SetPlayList(null);
    return true;
  }

  Play$pi8$b$i32$f64$b(szSongname = null, fLoop = false, fadetime_ms = 0, max_resume_time = 0, allow_break = false) {
    this.is_waiting = false;
    this.upcoming_music_file = null;
    if ($.Game.IsRunning ? $.Config.Sound.RXMusic === 0 : $.Config.Sound.FEMusic === 0) {
      return false;
    }
    if ($.Config.Sound.Verbose !== 0) {
      $.LogF(S("MusicSystem: Play(\"%s\", %s, %d, %.3lf, %s)"), szSongname != null ? szSongname : S("(null)"), fLoop ? S("true") : S("false"), fadetime_ms, max_resume_time, allow_break ? S("true") : S("false"));
    }
    let NewFile = null;
    if (szSongname != null && szSongname.a[szSongname.o + 0] !== 0) {
      for (NewFile = this.Songs; NewFile != null; NewFile = NewFile.pNext) {
        const songname = new Int8Array(256);
        $.SCopy$pi8$pi8(szSongname, P(songname, 0));
        $.DefaultExtension$pi8$pi8(P(songname, 0), S("mid"));
        if ($.SEqual($.GetFilename$2(P(NewFile.FileName, 0)), P(songname, 0))) {
          break;
        }
        $.SCopy$pi8$pi8(szSongname, P(songname, 0));
        $.DefaultExtension$pi8$pi8(P(songname, 0), S("ogg"));
        if ($.SEqual($.GetFilename$2(P(NewFile.FileName, 0)), P(songname, 0))) {
          break;
        }
      }
    } else {
      if (max_resume_time > 0) {
        let t_now = $.C4TimeMilliseconds.Now();
        for (let check_file = this.Songs; check_file != null; check_file = check_file.pNext) {
          if (!check_file.NoPlay) {
            if (check_file.HasResumePos() && check_file.GetRemainingTime() > max_resume_time) {
              if (this.music_max_position_memory === 0 || $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(t_now, check_file.GetLastInterruptionTime()) <= Math.imul(this.music_max_position_memory, 1000)) {
                if (NewFile == null || NewFile.LastPlayed < check_file.LastPlayed) {
                  NewFile = check_file;
                }
              }
            }
          }
        }
      }
      if (NewFile == null) {
        if (allow_break) {
          this.ScheduleWaitTime();
        }
        if (!this.is_waiting) {
          if ($.Config.Sound.Verbose !== 0) {
            $.LogF(S("  ASongCount=%d SCounter=%d"), this.ASongCount, this.SCounter);
          }
          let new_file_playability = 0;
          let new_file_num_rolls = 0;
          for (let check_file = this.Songs; check_file != null; check_file = check_file.pNext) {
            if (!check_file.NoPlay) {
              let check_file_playability = check_file.LastPlayed < 0 ? 3 : (this.SCounter - check_file.LastPlayed | 0) <= (this.ASongCount / 2 | 0) ? 1 : 2;
              if ($.Config.Sound.Verbose !== 0) {
                $.LogF(S("  Song LastPlayed %d [%d] (%s)"), check_file.LastPlayed, check_file_playability, check_file.GetDebugInfo().getData());
              }
              if (check_file_playability > new_file_playability) {
                new_file_num_rolls = 1;
                NewFile = check_file;
                new_file_playability = check_file_playability;
              } else if (check_file_playability === new_file_playability) {
                if (!(UnsyncedRandom$u32((new_file_num_rolls = new_file_num_rolls + 1 | 0) >>> 0) !== 0)) {
                  NewFile = check_file;
                }
              } else {
              }
            }
          }
        }
      }
    }
    if (NewFile == null && !this.is_waiting) {
      return false;
    }
    let is_fading = fadetime_ms !== 0 && NewFile !== this.PlayMusicFile && this.PlayMusicFile != null;
    if (!is_fading) {
      this.Stop();
    } else {
      let tNow = $.C4TimeMilliseconds.Now();
      if (this.FadeMusicFile != null) {
        if (this.FadeMusicFile === NewFile && (this.FadeMusicFile.IsLooping() ? 1 : 0) === (fLoop ? 1 : 0) && $.op_lt(tNow, this.FadeTimeEnd)) {
          this.FadeMusicFile = this.PlayMusicFile;
          this.PlayMusicFile = NewFile;
          this.FadeTimeEnd.$assign($.op_add$C4TimeMilliseconds$u32(tNow.$clone(), (Math.imul(fadetime_ms, $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(tNow, this.FadeTimeStart)) / $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(this.FadeTimeEnd, this.FadeTimeStart) | 0) >>> 0));
          this.FadeTimeStart.$assign($.op_sub$C4TimeMilliseconds$u32(this.FadeTimeEnd.$clone(), fadetime_ms >>> 0));
          return true;
        } else {
          this.FadeMusicFile.Stop();
        }
      }
      this.FadeMusicFile = this.PlayMusicFile;
      this.PlayMusicFile = null;
      this.FadeTimeStart.$assign(tNow);
      this.FadeTimeEnd.$assign($.op_add$C4TimeMilliseconds$u32(this.FadeTimeStart.$clone(), fadetime_ms >>> 0));
    }
    if (NewFile == null) {
      return false;
    }
    if (is_fading && (!NewFile.HasResumePos() || NewFile.GetRemainingTime() <= max_resume_time)) {
      this.upcoming_music_file = NewFile;
      this.is_waiting = true;
      this.wait_time_end.$assign(this.FadeTimeEnd);
      return false;
    }
    if (!this.Play$pC4MusicFile$b$f64(NewFile, fLoop, max_resume_time)) {
      return false;
    }
    if (is_fading) {
      this.PlayMusicFile.SetVolume(0);
    }
    return true;
  }

  Play$pC4MusicFile$b$f64(NewFile, fLoop, max_resume_time) {
    let $t1;
    if ($.Config.Sound.Verbose !== 0) {
      $.LogF(S("MusicSystem: PlaySong(\"%s\", %s, %.3lf)"), NewFile.GetDebugInfo().getData(), fLoop ? S("true") : S("false"), max_resume_time);
    }
    if (!NewFile.Play(fLoop, max_resume_time)) {
      return false;
    }
    this.PlayMusicFile = NewFile;
    NewFile.LastPlayed = ($t1 = this.SCounter, this.SCounter = this.SCounter + 1 | 0, $t1);
    this.Loop = fLoop;
    this.PlayMusicFile.SetVolume(this.Volume);
    if (!NewFile.HasBeenAnnounced()) {
      NewFile.Announce();
    }
    return true;
  }

  Stop() {
    if (this.PlayMusicFile != null) {
      this.PlayMusicFile.Stop();
      this.PlayMusicFile = null;
    }
    if (this.FadeMusicFile != null) {
      this.FadeMusicFile.Stop();
      this.FadeMusicFile = null;
    }
    return true;
  }

  FadeOut(fadeout_ms) {
    if (this.PlayMusicFile != null) {
      if (this.FadeMusicFile != null) {
        this.FadeMusicFile.Stop();
      }
      this.FadeMusicFile = this.PlayMusicFile;
      this.PlayMusicFile = null;
      this.FadeTimeStart.$assign($.C4TimeMilliseconds.Now());
      this.FadeTimeEnd.$assign($.op_add$C4TimeMilliseconds$u32(this.FadeTimeStart.$clone(), fadeout_ms >>> 0));
    }
  }

  SetPlayList(szPlayList, fForceSwitch = false, fadetime_ms = 0, max_resume_time = 0) {
    if (this.playlist_valid && this.playlist.op_eq$pi8(szPlayList)) {
      return 0;
    }
    if ($.Config.Sound.Verbose !== 0) {
      $.LogF(S("MusicSystem: SetPlayList(\"%s\", %s, %d, %.3lf)"), szPlayList != null ? szPlayList : S("(null)"), fForceSwitch ? S("true") : S("false"), fadetime_ms, max_resume_time);
    }
    let pFile = null;
    for (pFile = this.Songs; pFile != null; pFile = pFile.pNext) {
      pFile.NoPlay = true;
    }
    this.ASongCount = 0;
    if (szPlayList != null && szPlayList.a[szPlayList.o] !== 0) {
      const szFileName = new Int8Array(256);
      for (let cnt = 0; $.SGetModule(szPlayList, cnt, P(szFileName, 0), 255); cnt = cnt + 1 | 0) {
        for (pFile = this.Songs; pFile != null; pFile = pFile.pNext) {
          if (pFile.NoPlay) {
            if ($.WildcardMatch(P(szFileName, 0), $.GetFilename$2(P(pFile.FileName, 0))) || pFile.HasCategory(P(szFileName, 0))) {
              this.ASongCount = this.ASongCount + 1 | 0;
              pFile.NoPlay = false;
            }
          }
        }
      }
    } else {
      for (pFile = this.Songs; pFile != null; pFile = pFile.pNext) {
        if ($rd($.GetFilename$2(P(pFile.FileName, 0))) !== 64 && !pFile.HasCategory(S("frontend")) && !pFile.HasCategory(S("credits"))) {
          this.ASongCount = this.ASongCount + 1 | 0;
          pFile.NoPlay = false;
        }
      }
    }
    if (fForceSwitch) {
      if (this.PlayMusicFile != null) {
        fForceSwitch = this.PlayMusicFile.NoPlay;
      } else {
        fForceSwitch = !this.is_waiting || $.op_ge($.C4TimeMilliseconds.Now(), this.wait_time_end);
      }
      if (fForceSwitch) {
        this.Play$pi8$b$i32$f64$b(null, false, fadetime_ms, max_resume_time, this.PlayMusicFile != null);
      }
    }
    this.playlist.Copy$pi8(szPlayList);
    this.playlist_valid = true;
    return this.ASongCount;
  }

  ToggleOnOff() {
    if ($.Game.IsRunning) {
      $.Config.Sound.RXMusic = $.Config.Sound.RXMusic === 0 ? 1 : 0;
      if ($.Config.Sound.RXMusic === 0) {
        this.Stop();
      } else {
        this.Play$pi8$b$i32$f64$b();
      }
      $.GraphicsSystem.FlashMessageOnOff($.LoadResStr(S("IDS_CTL_MUSIC")), !($.Config.Sound.RXMusic === 0));
    } else {
      $.Config.Sound.FEMusic = $.Config.Sound.FEMusic === 0 ? 1 : 0;
      if ($.Config.Sound.FEMusic === 0) {
        this.Stop();
      } else {
        this.Play$pi8$b$i32$f64$b();
      }
    }
    return true;
  }

  LoadDir(szPath) {
    const Path = new Int8Array(256);
    const File = new Int8Array(256);
    let pDirGroup = null;
    $.SCopy$pi8$pi8$u64(szPath, P(Path, 0), 255);
    let pFileName = $.GetFilename$2(P(Path, 0));
    $.SCopy$pi8$pi8(pFileName, P(File, 0));
    $wr($padd(pFileName, -1), 0, 0);
    if (File[0] === 0) {
      $.SCopy$pi8$pi8(S("*"), P(File, 0));
    } else if (!($.SSearch(P(File, 0), S("*?")) != null)) {
      pDirGroup = new $.C4Group().init();
      if (!pDirGroup.Open(szPath)) {
        if (!pDirGroup.Open(P(Path, 0))) {
          $.LogF(S("Music File not found: %s"), szPath);
          $delete(pDirGroup);
          return;
        }
      } else {
        $.SCopy$pi8$pi8(szPath, P(Path, 0));
        $.SCopy$pi8$pi8(S("*"), P(File, 0));
      }
    }
    if (pDirGroup == null) {
      pDirGroup = new $.C4Group().init();
      if (!pDirGroup.Open(P(Path, 0))) {
        $.LogF(S("Music File not found: %s"), szPath);
        $delete(pDirGroup);
        return;
      }
    }
    const szFile = new Int8Array(256);
    pDirGroup.ResetSearch();
    while (pDirGroup.FindNextEntry$pi8$pi8$pu64$b(P(File, 0), P(szFile, 0))) {
      const strFullPath = new Int8Array(256);
      $.ssprintf$10(strFullPath, S("%s%c%s"), P(Path, 0), 47, P(szFile, 0));
      this.Load(P(strFullPath, 0));
    }
    $delete(pDirGroup);
  }

  Load(szFile) {
    if (szFile == null || szFile.a[szFile.o] === 0) {
      return;
    }
    let NewSong = null;
    let szExt = $.GetExtension(szFile);
    if ($.SEqualNoCase(szExt, S("ogg"))) {
      NewSong = new $.C4MusicFileOgg().init();
    }
    if (NewSong == null) {
      return;
    }
    NewSong.Init(szFile);
    let pCurr = this.Songs;
    while (pCurr != null && pCurr.pNext != null) {
      pCurr = pCurr.pNext;
    }
    if (pCurr != null) {
      pCurr.pNext = NewSong;
    } else {
      this.Songs = NewSong;
    }
    NewSong.pNext = null;
    this.SongCount = this.SongCount + 1 | 0;
    this.playlist_valid = false;
  }

  LoadMoreMusic() {
    let MoreMusicFile = new $.StdStrBuf();
    if (!MoreMusicFile.LoadFromFile($.Config.AtUserDataPath(S("MoreMusic.txt")))) {
      return;
    }
    let pPos = MoreMusicFile.getMData();
    while (pPos != null && pPos.a[pPos.o] !== 0) {
      const szLine = new Int8Array(1025);
      $.SCopyUntil$pi8$pi8$i8$i32$i32(pPos, P(szLine, 0), 10, 1024);
      pPos = c$strchr(pPos, 10);
      if (pPos != null) {
        pPos = pPos.add(1);
      }
      let pLine = P(szLine, 0);
      while (pLine.a[pLine.o] === 32 || pLine.a[pLine.o] === 9 || pLine.a[pLine.o] === 13) {
        pLine = pLine.add(1);
      }
      let p = $padd($padd(pLine, c$strlen(pLine)), -1);
      while (p.a[p.o] === 32 || p.a[p.o] === 9 || p.a[p.o] === 13) {
        p.a[p.o] = 0;
        p = p.add(-1);
      }
      if (pLine.a[pLine.o] === 35) {
        if ($.SEqual(pLine, S("#clear"))) {
          this.ClearSongs();
        }
        continue;
      }
      this.LoadDir(pLine);
    }
  }

  ClearSongs() {
    this.Stop();
    while (this.Songs != null) {
      let pFile = this.Songs;
      this.Songs = pFile.pNext;
      $delete(pFile);
    }
    this.SongCount = 0;
    this.FadeMusicFile = this.upcoming_music_file = this.PlayMusicFile = null;
    this.playlist_valid = false;
  }

  GrpContainsMusic(rGrp) {
    return rGrp.FindEntry$pi8$pStdStrBuf$pu64(S("*.mid")) || rGrp.FindEntry$pi8$pStdStrBuf$pu64(S("*.xm")) || rGrp.FindEntry$pi8$pStdStrBuf$pu64(S("*.it")) || rGrp.FindEntry$pi8$pStdStrBuf$pu64(S("*.s3m")) || rGrp.FindEntry$pi8$pStdStrBuf$pu64(S("*.mod")) || rGrp.FindEntry$pi8$pStdStrBuf$pu64(S("*.ogg"));
  }

  ScheduleWaitTime() {
    if (this.SCounter < 3) {
      return false;
    }
    if ((UnsyncedRandom$u32(100) | 0) >= this.music_break_chance) {
      return false;
    }
    if (this.music_break_max > 0) {
      let music_break = this.music_break_min;
      if (this.music_break_max > this.music_break_min) {
        music_break = (music_break >>> 0) + UnsyncedRandom$u32((this.music_break_max - this.music_break_min | 0) >>> 0) >>> 0 | 0;
      }
      if (music_break > 0) {
        this.is_waiting = true;
        this.wait_time_end.$assign($.op_add$C4TimeMilliseconds$u32($.C4TimeMilliseconds.Now(), music_break >>> 0));
        if ($.Config.Sound.Verbose !== 0) {
          $.LogF(S("MusicSystem: Pause (%d msecs)"), music_break);
        }
        for (let check_file = this.Songs; check_file != null; check_file = check_file.pNext) {
          check_file.ClearResumePos();
        }
      }
    }
    return this.is_waiting;
  }

  InitializeMOD() {
    this.alcDevice = al$alcOpenDevice(null);
    if (this.alcDevice == null) {
      $.LogF(S("Sound system: OpenAL create context error"));
      return false;
    }
    this.alcContext = al$alcCreateContext(this.alcDevice, null);
    if (this.alcContext == null) {
      $.LogF(S("Sound system: OpenAL create context error"));
      return false;
    }
    if (!(al$alutInitWithoutContext(null, null) !== 0)) {
      $.LogF(S("Sound system: ALUT init error"));
      return false;
    }
    this.MODInitialized = true;
    return true;
    return false;
  }

  DeinitializeMOD() {
    al$alutExit();
    al$alcDestroyContext(this.alcContext);
    al$alcCloseDevice(this.alcDevice);
    this.alcContext = null;
    this.alcDevice = null;
    this.MODInitialized = false;
  }

  SelectContext() {
    al$alcMakeContextCurrent(this.alcContext);
  }

  GetContext() {
    return this.alcContext;
  }

  GetDevice() {
    return this.alcDevice;
  }

  IsMODInitialized() {
    return this.MODInitialized;
  }

  CompileFunc(comp) {
    comp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.playlist, S("PlayList"), new $.StdCopyStrBuf()));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "game_music_level"), S("Volume"), 100));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "music_break_min"), S("MusicBreakMin"), C4MusicSystem.DefaultMusicBreak));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "music_break_max"), S("MusicBreakMax"), C4MusicSystem.DefaultMusicBreak));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "music_break_chance"), S("MusicBreakChance"), C4MusicSystem.DefaultMusicBreakChance));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "music_max_position_memory"), S("MusicMaxPositionMemory"), C4MusicSystem.DefaultMusicMaxPositionMemory));
    if (comp.isDeserializer()) {
      this.SetGameMusicLevel(this.game_music_level);
      this.SetPlayList(this.playlist.getData());
    }
  }

  SetMusicBreakMin(val) {
    this.music_break_min = $max(val, 0);
  }

  SetMusicBreakMax(val) {
    this.music_break_max = $max(val, 0);
  }

  SetMusicBreakChance(val) {
    this.music_break_chance = $.Clamp$i32$i32$i32(val, 0, 100);
  }

  SetMusicMaxPositionMemory(val) {
    this.music_max_position_memory = val;
  }

  SetGameMusicLevel(volume_percent) {
    this.game_music_level = $.Clamp$i32$i32$i32(volume_percent, 0, 500);
    this.UpdateVolume();
    return this.game_music_level;
  }

  $clone() { return new C4MusicSystem().$assign(this); }
  $assign(o) {
    this.Songs = o.Songs;
    this.SongCount = o.SongCount;
    this.ASongCount = o.ASongCount;
    this.SCounter = o.SCounter;
    this.PlayMusicFile = o.PlayMusicFile;
    this.Volume = o.Volume;
    this.Loop = o.Loop;
    this.FadeMusicFile = o.FadeMusicFile;
    this.upcoming_music_file = o.upcoming_music_file;
    this.FadeTimeStart.$assign(o.FadeTimeStart);
    this.FadeTimeEnd.$assign(o.FadeTimeEnd);
    this.is_waiting = o.is_waiting;
    this.wait_time_end.$assign(o.wait_time_end);
    this.MODInitialized = o.MODInitialized;
    this.alcDevice = o.alcDevice;
    this.alcContext = o.alcContext;
    this.game_music_level = o.game_music_level;
    this.playlist.$assign(o.playlist);
    this.playlist_valid = o.playlist_valid;
    this.music_break_min = o.music_break_min;
    this.music_break_max = o.music_break_max;
    this.music_break_chance = o.music_break_chance;
    this.music_max_position_memory = o.music_max_position_memory;
    return this;
  }
}

export class C4MusicFileInfoNode {
  str = null;
  type = 0;
  next = null;

  init() {
    this.next = null;
    this.str = null;
    return this;
  }

  $dtor() {
    if (this.str != null) {
      $delete(this.str);
    }
  }

  $clone() { return new C4MusicFileInfoNode().$assign(this); }
  $assign(o) {
    this.str = o.str;
    this.type = o.type;
    this.next = o.next;
    return this;
  }
}

export function GetMusicFileTypeByExtension(ext) {
  if ($.SEqualNoCase(ext, S("mid"))) {
    return 0 /*MUSICTYPE_MID*/;
  } else if ($.SEqualNoCase(ext, S("ogg"))) {
    return 3 /*MUSICTYPE_OGG*/;
  }
  return 4 /*MUSICTYPE_UNKNOWN*/;
}

export function $init(): void {
  C4MusicSystem.DefaultMusicBreak = 120000;
  C4MusicSystem.DefaultMusicBreakChance = 50;
  C4MusicSystem.DefaultMusicMaxPositionMemory = 420;
}

Object.assign($, { C4MusicFileInfoNode, C4MusicSystem, GetMusicFileTypeByExtension });
