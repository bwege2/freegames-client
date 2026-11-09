// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2: every translated class, linked and initialized (re/shatteredpixeldungeon/tools/j2ts, do not edit).
import { $J } from './../jre/index.ts';
import './com/badlogic/gdx/graphics/Color.ts';
import './com/badlogic/gdx/graphics/Colors.ts';
import './com/badlogic/gdx/graphics/g2d/BitmapFont.ts';
import './com/badlogic/gdx/graphics/g2d/BitmapFontCache.ts';
import './com/badlogic/gdx/graphics/g2d/GlyphLayout.ts';
import './com/badlogic/gdx/graphics/g2d/PixmapPacker.ts';
import './com/badlogic/gdx/graphics/g2d/TextureRegion.ts';
import './com/badlogic/gdx/graphics/g2d/freetype/FreeType.ts';
import './com/badlogic/gdx/graphics/g2d/freetype/FreeTypeFontGenerator.ts';
import './com/badlogic/gdx/math/MathUtils.ts';
import './com/badlogic/gdx/math/RandomXS128.ts';
import './com/badlogic/gdx/utils/Align.ts';
import './com/badlogic/gdx/utils/Array.ts';
import './com/badlogic/gdx/utils/DefaultPool.ts';
import './com/badlogic/gdx/utils/FloatArray.ts';
import './com/badlogic/gdx/utils/FlushablePool.ts';
import './com/badlogic/gdx/utils/IntArray.ts';
import './com/badlogic/gdx/utils/NumberUtils.ts';
import './com/badlogic/gdx/utils/ObjectMap.ts';
import './com/badlogic/gdx/utils/ObjectSet.ts';
import './com/badlogic/gdx/utils/OrderedMap.ts';
import './com/badlogic/gdx/utils/Pool.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Assets.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Badges.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Bones.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Challenges.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Chrome.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Dungeon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/GamesInProgress.ts';
import './com/shatteredpixel/shatteredpixeldungeon/QuickSlot.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Rankings.ts';
import './com/shatteredpixel/shatteredpixeldungeon/SPDAction.ts';
import './com/shatteredpixel/shatteredpixeldungeon/SPDSettings.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ShatteredPixelDungeon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/Statistics.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/Actor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/Char.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Alchemy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Blizzard.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Blob.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/ConfusionGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/CorrosiveGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Electricity.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Fire.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Foliage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Freezing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/GooWarn.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Inferno.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/ParalyticGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Regrowth.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/SacrificialFire.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/SmokeScreen.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/StenchGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/StormCloud.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/ToxicGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/VaultFlameTraps.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/WaterOfAwareness.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/WaterOfHealth.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Web.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/blobs/WellWater.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Adrenaline.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/AdrenalineSurge.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/AllyBuff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Amok.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ArcaneArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ArtifactRecharge.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/AscensionChallenge.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Awareness.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Barkskin.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Barrier.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Berserk.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Bleeding.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Bless.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Blindness.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/BlobImmunity.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Buff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Burning.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ChampionEnemy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Charm.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Chill.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Combo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Corrosion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Corruption.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/CounterBuff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Cripple.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Daze.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Degrade.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Doom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Dread.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Drowsy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/EnhancedRings.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/FireImbue.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/FlavourBuff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Foresight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Frost.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/FrostImbue.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Fury.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/GravityChaosTracker.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/GreaterHaste.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Haste.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Healing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/HeroDisguise.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Hex.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/HoldFast.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Hunger.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Invisibility.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Invulnerability.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Levitation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/LifeLink.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Light.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/LockedFloor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/LostInventory.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MagicImmune.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MagicalSight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MagicalSleep.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MindVision.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Momentum.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MonkEnergy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Ooze.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Paralysis.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/PhysicalEmpower.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/PinCushion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Poison.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Preparation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/PrismaticGuard.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Recharging.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Regeneration.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/RevealedArea.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Roots.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ScrollEmpower.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Shadows.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ShieldBuff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Sleep.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Slow.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/SnipersMark.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/SoulMark.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Speed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Stamina.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/SuperNovaTracker.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/SwarmIntelTracker.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Terror.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/TimeStasis.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ToxicImbue.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Vertigo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Vulnerable.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/WandEmpower.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Weakness.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/buffs/WellFed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/Belongings.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/Hero.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/HeroAction.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/HeroClass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/HeroSubClass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/Talent.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/ArmorAbility.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/Ratmogrify.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/cleric/AscendedForm.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/cleric/PowerOfMany.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/cleric/Trinity.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/duelist/Challenge.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/duelist/ElementalStrike.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/duelist/Feint.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/huntress/NaturesPower.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/huntress/SpectralBlades.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/huntress/SpiritHawk.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/mage/ElementalBlast.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/mage/WarpBeacon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/mage/WildMagic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/rogue/DeathMark.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/rogue/ShadowClone.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/rogue/SmokeBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/warrior/Endure.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/warrior/HeroicLeap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/warrior/Shockwave.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/AuraOfProtection.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/BeamingRay.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/BlessSpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/BodyForm.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Cleanse.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/ClericSpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/DivineIntervention.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/DivineSense.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Flash.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/GuidingLight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HallowedGround.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HolyIntuition.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HolyLance.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HolyWard.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HolyWeapon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/InventoryClericSpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Judgement.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/LayOnHands.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/LifeLinkSpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/MindForm.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/MnemonicPrayer.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Radiance.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/RecallInscription.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/ShieldOfLight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Smite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/SpiritForm.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Stasis.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Sunray.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/TargetedClericSpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/WallOfLight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Acidic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Albino.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/ArmoredBrute.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/ArmoredStatue.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Bandit.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Bat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Bee.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Brute.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CausticSlime.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Crab.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalGuardian.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalMimic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalSpire.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalWisp.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM100.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM200.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM201.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM300.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DelayedRockFall.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DemonSpawner.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DwarfKing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/EbonyMimic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Elemental.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Eye.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/FetidRat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/FungalCore.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/FungalSentry.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/FungalSpinner.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Ghoul.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Gnoll.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollExile.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollGeomancer.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollGuard.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollSapper.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollTrickster.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GoldenMimic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Golem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Goo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GreatCrab.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Guard.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/HermitCrab.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Mimic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Mob.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/MobSpawner.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Monk.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Necromancer.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/PhantomPiranha.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Piranha.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Pylon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Rat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/RipperDemon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/RotHeart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/RotLasher.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Scorpio.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Senior.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Shaman.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Skeleton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Slime.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Snake.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/SpectralNecromancer.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Spinner.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Statue.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Succubus.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Swarm.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Tengu.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Thief.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/TormentedSpirit.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Warlock.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Wraith.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/YogDzewa.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/YogFist.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Blacksmith.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/DirectableAlly.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Ghost.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Imp.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/ImpShopkeeper.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/MirrorImage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/NPC.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/PrismaticImage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/RatKing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Sheep.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Shopkeeper.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultLaser.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultMirror.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultSentry.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultTokenDoor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Wandmaker.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultBossElemental.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultDM100.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultDM200.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultElemental.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultGhoul.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultGolem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultRat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultShaman.ts';
import './com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultSkeleton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/BadgeBanner.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/BannerSprites.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Beam.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/BlobEmitter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/CellEmitter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Chains.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/CheckedCell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/CircleArc.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/DarkBlock.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Degradation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Effects.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/EmoIcon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Enchanting.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Fireball.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Flare.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/FloatingText.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/GlowBlock.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/IceBlock.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Identification.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Lightning.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/MagicMissile.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Pushing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Ripple.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/ShadowBox.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/ShieldHalo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Speck.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/SpellSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Splash.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Surprise.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Swap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/TargetedCell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/TorchHalo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Transmuting.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/Wound.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/BlastParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/BloodParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/ChallengeParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/CorrosionParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/EarthParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/ElmoParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/EnergyParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/FlameParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/FlowParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/LeafParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/PitfallParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/PoisonParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/PurpleParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/RainbowParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/SacrificialParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/ShadowParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/ShaftParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/SmokeParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/SnowParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/SparkParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/SpectralWallParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/WebParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/WindParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/effects/particles/WoolParticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Amulet.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Ankh.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/ArcaneResin.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/BrokenSeal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Dewdrop.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/EnergyCrystal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/EquipableItem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Generator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Gold.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Heap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Honeypot.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Item.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/ItemStatusHandler.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/KindOfWeapon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/KindofMisc.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/KingsCrown.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/LiquidMetal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/LostBackpack.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Recipe.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Stylus.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/TengusMask.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Torch.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/Waterskin.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/Armor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/ClassArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/ClericArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/ClothArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/DuelistArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/HuntressArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/LeatherArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/MageArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/MailArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/PlateArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/RogueArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/ScaleArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/WarriorArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/AntiEntropy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Bulk.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Corrosion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Displacement.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Metabolism.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Multiplicity.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Overgrowth.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Stench.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Affection.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/AntiMagic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Brimstone.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Camouflage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Entanglement.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Flow.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Obfuscation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Potential.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Repulsion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Stone.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Swiftness.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Thorns.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Viscosity.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/AlchemistsToolkit.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/Artifact.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/CapeOfThorns.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/ChaliceOfBlood.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/CloakOfShadows.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/DriedRose.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/EtherealChains.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/HolyTome.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/HornOfPlenty.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/LloydsBeacon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/MasterThievesArmband.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/SandalsOfNature.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/SkeletonKey.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/TalismanOfForesight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/TimekeepersHourglass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/artifacts/UnstableSpellbook.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bags/Bag.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bags/MagicalHolster.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bags/PotionBandolier.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bags/ScrollHolder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bags/VelvetPouch.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/ArcaneBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/Bomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/Firebomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/FlashBangBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/FrostBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/HolyBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/Noisemaker.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/RegrowthBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/ShrapnelBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/SmokeBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/bombs/WoollyBomb.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/Berry.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/Blandfruit.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/ChargrilledMeat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/Food.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/FrozenCarpaccio.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/MeatPie.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/MysteryMeat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/Pasty.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/PhantomMeat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/SmallRation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/StewedMeat.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/food/SupplyRation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/journal/AlchemyPage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/journal/DocumentPage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/journal/GuidePage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/journal/Guidebook.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/journal/RegionLorePage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/keys/CrystalKey.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/keys/GoldenKey.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/keys/IronKey.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/keys/Key.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/keys/WornKey.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/Potion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfExperience.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfFrost.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfHaste.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfHealing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfInvisibility.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfLevitation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfLiquidFlame.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfMindVision.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfParalyticGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfPurity.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfStrength.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfToxicGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/AquaBrew.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/BlizzardBrew.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/Brew.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/CausticBrew.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/InfernalBrew.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/ShockingBrew.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/UnstableBrew.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/Elixir.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfAquaticRejuvenation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfArcaneArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfDragonsBlood.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfFeatherFall.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfHoneyedHealing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfIcyTouch.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfMight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfToxicEssence.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/ExoticPotion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfCleansing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfCorrosiveGas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfDivineInspiration.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfDragonsBreath.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfEarthenArmor.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfMagicalSight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfMastery.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfShielding.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfShroudingFog.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfSnapFreeze.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfStamina.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfStormClouds.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/CeremonialCandle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/CorpseDust.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/DarkGold.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/DwarfToken.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/Embers.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/EscapeCrystal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/GooBlob.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/ImpStatue.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/MetalShard.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/Pickaxe.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/quest/VaultBeacon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/remains/BowFragment.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/remains/BrokenHilt.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/remains/BrokenStaff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/remains/CloakScrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/remains/RemainsItem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/remains/SealShard.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/remains/TornPage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/Ring.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfAccuracy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfArcana.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfElements.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfEnergy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfEvasion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfForce.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfFuror.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfHaste.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfMight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfSharpshooting.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfTenacity.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfWealth.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/InventoryScroll.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/Scroll.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfIdentify.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfLullaby.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfMagicMapping.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfMirrorImage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfRage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfRecharging.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfRemoveCurse.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfRetribution.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfTeleportation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfTerror.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfTransmutation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfUpgrade.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ExoticScroll.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfAntiMagic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfChallenge.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfDivination.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfDread.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfEnchantment.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfForesight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfMetamorphosis.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfMysticalEnergy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfPassage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfPrismaticImage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfPsionicBlast.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfSirensSong.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/Alchemize.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/BeaconOfReturning.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/CurseInfusion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/InventorySpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/MagicalInfusion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/PhaseShift.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/ReclaimTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/Recycle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/Spell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/SummonElemental.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/TargetedSpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/TelekineticGrab.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/UnstableSpell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/spells/WildEnergy.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/InventoryStone.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/Runestone.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfAggression.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfAugmentation.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfBlast.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfBlink.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfClairvoyance.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfDeepSleep.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfDetectMagic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfEnchantment.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfFear.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfFlock.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfIntuition.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfShock.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ChaoticCenser.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/CrackedSpyglass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/DimensionalSundial.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ExoticCrystals.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/EyeOfNewt.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/FerretTuft.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/MimicTooth.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/MossyClump.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ParchmentScrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/PetrifiedSeed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/RatSkull.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/SaltCube.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ShardOfOblivion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ThirteenLeafClover.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/TrapMechanism.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/Trinket.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/TrinketCatalyst.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/VialOfBlood.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/trinkets/WondrousResin.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/CursedWand.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/DamageWand.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/Wand.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfBlastWave.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfCorrosion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfCorruption.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfDisintegration.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfFireblast.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfFrost.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfLightning.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfLivingEarth.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfMagicMissile.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfPrismaticLight.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfRegrowth.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfTransfusion.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfWarding.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/SpiritBow.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/Weapon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Annoying.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Dazzling.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Displacing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Explosive.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Friendly.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Polarized.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Pressurized.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Sacrificial.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Wayward.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Wondrous.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Blazing.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Blocking.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Blooming.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Chilling.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Corrupting.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Crystal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Elastic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Eldritch.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Grim.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Kinetic.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Lucky.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Projecting.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Shocking.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Unstable.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Vampiric.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Venomous.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Vorpal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/AssassinsBlade.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/BattleAxe.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Crossbow.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Cudgel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Dagger.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Dirk.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Flail.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Gauntlet.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Glaive.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Gloves.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Greataxe.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Greatshield.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Greatsword.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/HandAxe.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Katana.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Longsword.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Mace.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/MagesStaff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/MeleeWeapon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Quarterstaff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Rapier.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/RoundShield.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/RunicBlade.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Sai.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Scimitar.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Shortsword.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Sickle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Spear.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Sword.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/WarHammer.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/WarScythe.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Whip.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/WornShortsword.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Bolas.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/FishingSpear.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ForceCube.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/HeavyBoomerang.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Javelin.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Kunai.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/MissileWeapon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Shuriken.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ThrowingClub.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ThrowingHammer.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ThrowingKnife.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ThrowingSpear.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ThrowingSpike.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ThrowingStone.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Tomahawk.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Trident.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/AdrenalineDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/BlindingDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/ChillingDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/CleansingDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/Dart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/DisplacingDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/HealingDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/HolyDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/IncendiaryDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/ParalyticDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/PoisonDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/RotDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/ShockingDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/TippedDart.ts';
import './com/shatteredpixel/shatteredpixeldungeon/journal/Bestiary.ts';
import './com/shatteredpixel/shatteredpixeldungeon/journal/Catalog.ts';
import './com/shatteredpixel/shatteredpixeldungeon/journal/Document.ts';
import './com/shatteredpixel/shatteredpixeldungeon/journal/Journal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/journal/Notes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/CavesBossLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/CavesLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/CityBossLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/CityLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/DeadEndLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/HallsBossLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/HallsLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/LastLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/LastShopLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/Level.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/MiningLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/Patch.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/PrisonBossLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/PrisonLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/RegularLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/SewerBossLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/SewerLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/Terrain.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/VaultLevel.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/builders/BranchesBuilder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/builders/Builder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/builders/FigureEightBuilder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/builders/GridBuilder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/builders/LineBuilder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/builders/LoopBuilder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/builders/RegularBuilder.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/features/Chasm.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/features/Door.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/features/HighGrass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/features/LevelTransition.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/features/Maze.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/CavesPainter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/CityPainter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/HallsPainter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/MiningLevelPainter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/Painter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/PrisonPainter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/RegularPainter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/painters/SewerPainter.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/Room.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/BridgeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/ConnectionRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/MazeConnectionRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/PerimeterRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/RingBridgeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/RingTunnelRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/TunnelRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/WalkwayRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/AmbitiousImpRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/BlacksmithRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MassGraveRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineEntrance.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineGiantRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineLargeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineSecretRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineSmallRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/RitualSiteRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/RotGardenRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultAlternatingFireRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultCircleRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultCrossRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultEnemyCenterRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultFinalRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultHallwayRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultLasersRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultLongRingsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultLongRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultQuadrantsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultRingRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultRingsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultSimpleEnemyTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultTokensRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultBookcaseTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultCircleScanTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultFlamePathRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultFlamesTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultHardLaserTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultLaserTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultManyScansRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultMultipleEnemyTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultSingleEnemyTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultTreasureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/RatKingRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretArtilleryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretChestChasmRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretGardenRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretHoardRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretHoneypotRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretLaboratoryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretLarderRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretLibraryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretMazeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretRunestoneRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretSummoningRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretWellRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/DiamondGooRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/GooBossRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/SewerBossEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/SewerBossExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/ThickPillarsGooRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/ThinPillarsGooRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/WalledGooRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/ArmoryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CryptRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CrystalChoiceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CrystalPathRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CrystalVaultRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/DemonSpawnerRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/GardenRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/LaboratoryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/LibraryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/MagicWellRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/MagicalFireRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/PitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/PoolRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/RunestoneRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/SacrificeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/SentryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/ShopRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/SpecialRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/StatueRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/StorageRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/ToxicGasRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/TrapsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/TreasuryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/WeakFloorRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/AquariumRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/BurnedRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CaveRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CavesFissureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CellBlockRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/ChasmBridgeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/ChasmRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CircleBasinRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CirclePitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CircleWallRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/EmptyRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/FissureRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/GrassyGraveRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/HallwayRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/ImpShopRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/LibraryHallRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/LibraryRingRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/MinefieldRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PatchRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PillarsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PlantsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PlatformRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RegionDecoBridgeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RegionDecoLineRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RegionDecoPatchRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RingRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RitualRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RuinsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SegmentedLibraryRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SegmentedRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SewerPipeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SkullsRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StandardBridgeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StandardRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StatueLineRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StatuesRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StripedRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StudyRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SuspiciousChestRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/WaterBridgeRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/CaveEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/CavesFissureEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/CellBlockEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/ChasmBridgeEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/ChasmEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/CircleBasinEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/EntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/HallwayEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/LibraryHallEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/LibraryRingEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/PillarsEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/RegionDecoBridgeEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/RegionDecoLineEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/RegionDecoPatchEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/RingEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/RitualEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/RuinsEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/StatueLineEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/StatuesEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/WaterBridgeEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CaveExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CavesFissureExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CellBlockExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/ChasmBridgeExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/ChasmExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CircleBasinExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CircleWallEntranceRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CircleWallExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/ExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/HallwayExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/LibraryHallExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/LibraryRingExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/PillarsExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/RegionDecoBridgeExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/RegionDecoLineExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/RegionDecoPatchExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/RingExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/RitualExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/RuinsExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/StatueLineExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/StatuesExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/WaterBridgeExitRoom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/AlarmTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/BlazingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/BurningTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/ChillingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/ConfusionTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/CorrosionTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/CursingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/DisarmingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/DisintegrationTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/DistortionTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/ExplosiveTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/FlashingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/FlockTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/FrostTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/GatewayTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/GeyserTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/GnollRockfallTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/GrimTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/GrippingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/GuardianTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/OozeTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/PitfallTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/PoisonDartTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/RockfallTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/ShockingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/StormTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/SummoningTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/TeleportationTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/TenguDartTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/ToxicTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/Trap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/WarpingTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/WeakeningTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/levels/traps/WornDartTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/mechanics/Ballistica.ts';
import './com/shatteredpixel/shatteredpixeldungeon/mechanics/ConeAOE.ts';
import './com/shatteredpixel/shatteredpixeldungeon/mechanics/ShadowCaster.ts';
import './com/shatteredpixel/shatteredpixeldungeon/messages/Languages.ts';
import './com/shatteredpixel/shatteredpixeldungeon/messages/Messages.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/BlandfruitBush.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Blindweed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Earthroot.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Fadeleaf.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Firebloom.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Icecap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Mageroyal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Plant.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Rotberry.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Sorrowmoss.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Starflower.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Stormvine.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Sungrass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/plants/Swiftthistle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/AboutScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/AlchemyScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/AmuletScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/CellSelector.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/ChangesScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/GameScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/HeroSelectScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/InterlevelScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/JournalScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/NewsScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/PixelScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/RankingsScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/StartScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/SupporterScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/SurfaceScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/TitleScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/scenes/WelcomeScene.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/news/DebugNews.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/news/News.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/news/NewsArticle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/news/NewsImpl.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/news/NewsService.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/updates/AvailableUpdateData.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/updates/DebugUpdates.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/updates/UpdateImpl.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/updates/UpdateService.ts';
import './com/shatteredpixel/shatteredpixeldungeon/services/updates/Updates.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/AcidicSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/AlbinoSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/BanditSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/BatSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/BeeSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/BlacksmithSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/BruteSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/CausticSlimeSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/CharSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/CrabSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/CrystalGuardianSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/CrystalSpireSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/CrystalWispSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/DM100Sprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/DM200Sprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/DM201Sprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/DM300Sprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/DiscardedItemSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/EarthGuardianSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ElementalSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/EyeSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/FetidRatSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/FistSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/FungalCoreSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/FungalSentrySprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/FungalSpinnerSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GhostSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GhoulSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GnollExileSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GnollGeomancerSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GnollGuardSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GnollSapperSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GnollSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GnollTricksterSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GolemSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GooSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GreatCrabSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/GuardSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/HermitCrabSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/HeroSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ImpSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ItemSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ItemSpriteSheet.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/KingSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/LarvaSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/LotusSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/MimicSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/MirrorSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/MissileSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/MobSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/MonkSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/NecromancerSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/NewbornElementalSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/PhantomPiranhaSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/PiranhaSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/PrismaticSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/PylonSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/RatKingSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/RatSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/RipperSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/RotHeartSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/RotLasherSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ScorpioSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SeniorSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SentrySprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ShamanSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SheepSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ShieldedSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ShopkeeperSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SkeletonSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SlimeSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SnakeSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SpawnerSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SpectralNecromancerSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SpinnerSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/StatueSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SuccubusSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/SwarmSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/TenguSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/ThiefSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/TormentedSpiritSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/UndeadSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/VaultBossElementalSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/VaultMirrorSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/VaultTokenDoorSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/WandmakerSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/WardSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/WarlockSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/WraithSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/sprites/YogSprite.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/CustomTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonTerrainTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonTileSheet.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonWallsTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/FogOfWar.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/GridTileMap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/RaisedTerrainTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/TerrainFeaturesTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/WallBlockingTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/WallOcclusionTilemap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/tiles/custom/Carpet.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ActionIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Archs.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/AttackIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/BadgesGrid.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/BadgesList.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Banner.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/BossHealthBar.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/BuffIcon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/BuffIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/BusyIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Button.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/CharHealthIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/CheckBox.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Compass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/CurrencyIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/CustomNoteButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/DangerIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ExitButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/GameLog.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/HealthBar.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/HeroIcon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/IconButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Icons.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/InventoryPane.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/InventorySlot.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ItemButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ItemJournalButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ItemSlot.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/KeyDisplay.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/LootIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/MenuPane.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/OptionSlider.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/QuickRecipe.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/QuickSlotButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/RadialMenu.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/RedButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/RenderedTextBlock.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ResumeIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/RightClickMenu.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ScrollPane.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ScrollingGridPane.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/ScrollingListPane.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/StatusPane.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/StyledButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Tag.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/TalentButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/TalentIcon.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/TalentsPane.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/TargetHealthIndicator.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/TitleBackground.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Toast.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Toolbar.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Tooltip.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/Window.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/ChangeButton.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/ChangeIcons.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/ChangeInfo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/Pixel_Dungeon_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/WndChanges.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/WndChangesTabbed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_1_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_2_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_3_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_4_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_5_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_6_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_7_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_8_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v0_9_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v1_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v2_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v3_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/ui/changelist/v4_X_Changes.ts';
import './com/shatteredpixel/shatteredpixeldungeon/utils/DungeonSeed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/utils/GLog.ts';
import './com/shatteredpixel/shatteredpixeldungeon/utils/Holiday.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/IconTitle.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndBadge.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndBag.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndBlacksmith.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndChallenges.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndChooseAbility.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndChooseSubclass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndClericSpells.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndCombo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndDailies.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndDocument.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndEnergizeItem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndError.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndGame.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndGameInProgress.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndHardNotification.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndHero.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndHeroInfo.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndImpOld.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoArmorAbility.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoBuff.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoCell.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoItem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoMob.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoPlant.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoSubclass.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoTalent.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoTrap.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndJournal.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndJournalItem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndKeyBindings.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndList.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndMessage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndMonkAbilities.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndOptions.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndOptionsCondensed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndQuest.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndQuickBag.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndRanking.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndResurrect.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndSadGhost.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndScoreBreakdown.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndSettings.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndStory.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndSupportPrompt.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndTabbed.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndTextInput.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndTitledMessage.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndTradeItem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndUpgrade.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndUseItem.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndVictoryCongrats.ts';
import './com/shatteredpixel/shatteredpixeldungeon/windows/WndWandmaker.ts';
import './com/watabou/glscripts/Script.ts';
import './com/watabou/gltextures/Atlas.ts';
import './com/watabou/gltextures/SmartTexture.ts';
import './com/watabou/gltextures/TextureCache.ts';
import './com/watabou/glwrap/Attribute.ts';
import './com/watabou/glwrap/Blending.ts';
import './com/watabou/glwrap/Framebuffer.ts';
import './com/watabou/glwrap/Matrix.ts';
import './com/watabou/glwrap/Program.ts';
import './com/watabou/glwrap/Quad.ts';
import './com/watabou/glwrap/Renderbuffer.ts';
import './com/watabou/glwrap/Shader.ts';
import './com/watabou/glwrap/Texture.ts';
import './com/watabou/glwrap/Uniform.ts';
import './com/watabou/glwrap/Vertexbuffer.ts';
import './com/watabou/input/ControllerHandler.ts';
import './com/watabou/input/GameAction.ts';
import './com/watabou/input/InputHandler.ts';
import './com/watabou/input/KeyBindings.ts';
import './com/watabou/input/KeyEvent.ts';
import './com/watabou/input/PointerEvent.ts';
import './com/watabou/input/ScrollEvent.ts';
import './com/watabou/noosa/BitmapText.ts';
import './com/watabou/noosa/Camera.ts';
import './com/watabou/noosa/ColorBlock.ts';
import './com/watabou/noosa/Game.ts';
import './com/watabou/noosa/Gizmo.ts';
import './com/watabou/noosa/Group.ts';
import './com/watabou/noosa/Halo.ts';
import './com/watabou/noosa/Image.ts';
import './com/watabou/noosa/MovieClip.ts';
import './com/watabou/noosa/NinePatch.ts';
import './com/watabou/noosa/NoosaScript.ts';
import './com/watabou/noosa/NoosaScriptNoLighting.ts';
import './com/watabou/noosa/PointerArea.ts';
import './com/watabou/noosa/PseudoPixel.ts';
import './com/watabou/noosa/RenderedText.ts';
import './com/watabou/noosa/Resizable.ts';
import './com/watabou/noosa/Scene.ts';
import './com/watabou/noosa/ScrollArea.ts';
import './com/watabou/noosa/SkinnedBlock.ts';
import './com/watabou/noosa/TextInput.ts';
import './com/watabou/noosa/TextureFilm.ts';
import './com/watabou/noosa/Tilemap.ts';
import './com/watabou/noosa/Visual.ts';
import './com/watabou/noosa/audio/Music.ts';
import './com/watabou/noosa/audio/Sample.ts';
import './com/watabou/noosa/particles/BitmaskEmitter.ts';
import './com/watabou/noosa/particles/Emitter.ts';
import './com/watabou/noosa/particles/PixelParticle.ts';
import './com/watabou/noosa/tweeners/AlphaTweener.ts';
import './com/watabou/noosa/tweeners/CameraScrollTweener.ts';
import './com/watabou/noosa/tweeners/Delayer.ts';
import './com/watabou/noosa/tweeners/PosTweener.ts';
import './com/watabou/noosa/tweeners/ScaleTweener.ts';
import './com/watabou/noosa/tweeners/Tweener.ts';
import './com/watabou/noosa/ui/Component.ts';
import './com/watabou/noosa/ui/Cursor.ts';
import './com/watabou/utils/BArray.ts';
import './com/watabou/utils/BitmapCache.ts';
import './com/watabou/utils/BitmapFilm.ts';
import './com/watabou/utils/Bundlable.ts';
import './com/watabou/utils/Bundle.ts';
import './com/watabou/utils/Callback.ts';
import './com/watabou/utils/ColorMath.ts';
import './com/watabou/utils/DeviceCompat.ts';
import './com/watabou/utils/FileUtils.ts';
import './com/watabou/utils/GameMath.ts';
import './com/watabou/utils/GameSettings.ts';
import './com/watabou/utils/Graph.ts';
import './com/watabou/utils/PathFinder.ts';
import './com/watabou/utils/PlatformSupport.ts';
import './com/watabou/utils/Point.ts';
import './com/watabou/utils/PointF.ts';
import './com/watabou/utils/Random.ts';
import './com/watabou/utils/Rect.ts';
import './com/watabou/utils/RectF.ts';
import './com/watabou/utils/Reflection.ts';
import './com/watabou/utils/Signal.ts';
import './com/watabou/utils/SparseArray.ts';
import './freegames/spd/Oracle.ts';
import './freegames/spd/WebLauncher.ts';
import './freegames/spd/WebPlatformSupport.ts';

$J.linkAll();
$J.clinitAll([
  'com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass',
  'com.shatteredpixel.shatteredpixeldungeon.Badges$BadgeType',
  'com.shatteredpixel.shatteredpixeldungeon.Badges$Badge',
  'com.shatteredpixel.shatteredpixeldungeon.Badges',
  'com.shatteredpixel.shatteredpixeldungeon.Bones',
  'com.shatteredpixel.shatteredpixeldungeon.Challenges',
  'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type',
  'com.shatteredpixel.shatteredpixeldungeon.QuickSlot',
  'com.shatteredpixel.shatteredpixeldungeon.Dungeon',
  'com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops',
  'com.shatteredpixel.shatteredpixeldungeon.GamesInProgress',
  'com.shatteredpixel.shatteredpixeldungeon.Rankings',
  'com.watabou.input.GameAction',
  'com.watabou.input.KeyBindings',
  'com.shatteredpixel.shatteredpixeldungeon.SPDAction',
  'com.shatteredpixel.shatteredpixeldungeon.SPDSettings',
  'com.shatteredpixel.shatteredpixeldungeon.Statistics',
  'com.shatteredpixel.shatteredpixeldungeon.actors.Actor',
  'com.shatteredpixel.shatteredpixeldungeon.actors.Char',
  'com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blazing',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Potential',
  'com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property',
  'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.VaultFlameTraps',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AdrenalineSurge',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Berserk$State',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$ComboMove',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Fury',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HeroDisguise',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility',
  'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation$AttackLevel',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$DuelParticipant',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Chilling',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Venomous',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blooming',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Eldritch',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Elastic',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Projecting',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vampiric',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Unstable',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Speck',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Annoying',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Displacing',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Dazzling',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Explosive',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Friendly',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Polarized',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Pressurized',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Sacrificial',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wayward',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wondrous',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike',
  'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorruption',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.ElementalBlast',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.DeathMark$DeathMarkTracker',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Endure$EndureTracker',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.AuraOfProtection',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.AuraOfProtection$AuraBuff',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BeamingRay',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BlessSpell',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Cleanse',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineIntervention',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Flash',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HallowedGround',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyIntuition',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Judgement',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LayOnHands',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MnemonicPrayer',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Radiance',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.RecallInscription',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.RecallInscription$UsedItemTracker',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ShieldOfLight',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Sunray',
  'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.WallOfLight',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.MobSpawner',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep',
  'com.shatteredpixel.shatteredpixeldungeon.messages.Messages',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Icons',
  'com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene',
  'com.watabou.input.PointerEvent',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultLaser',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultSentry',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$ElementalForm',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$FireWall',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$FrostVortex',
  'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$LightningChase',
  'com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner',
  'com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner$State',
  'com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites$Type',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Degradation',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting$Phase',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Fireball',
  'com.watabou.noosa.TextureFilm',
  'com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Identification',
  'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ShamanParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WhiteParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$SlowParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ForceParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite',
  'com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite$Phase',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Splash',
  'com.shatteredpixel.shatteredpixeldungeon.effects.TargetedCell',
  'com.shatteredpixel.shatteredpixeldungeon.effects.Transmuting$Phase',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.BloodParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ChallengeParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.CorrosionParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EnergyParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlowParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PitfallParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SacrificialParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle',
  'com.watabou.utils.Random',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SpectralWallParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WebParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WindParticle',
  'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WoolParticle',
  'com.shatteredpixel.shatteredpixeldungeon.items.Ankh',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon',
  'com.shatteredpixel.shatteredpixeldungeon.utils.GLog',
  'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite',
  'com.watabou.noosa.audio.Sample',
  'com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton',
  'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin',
  'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand',
  'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet',
  'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion',
  'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll',
  'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfMastery',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion',
  'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment',
  'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfSirensSong',
  'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis',
  'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll',
  'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic',
  'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfElements',
  'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce',
  'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth',
  'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty',
  'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.DimensionalSundial',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ThirteenLeafClover',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser',
  'com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category',
  'com.shatteredpixel.shatteredpixeldungeon.items.Item',
  'com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal',
  'com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield',
  'com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem',
  'com.shatteredpixel.shatteredpixeldungeon.items.Generator',
  'com.shatteredpixel.shatteredpixeldungeon.items.KindOfWeapon',
  'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll$ScrollToStone',
  'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$EnhanceBomb',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$SeedToPotion',
  'com.shatteredpixel.shatteredpixeldungeon.items.Recipe',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Augment',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Obfuscation',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Swiftness',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Brimstone',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Stone',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Entanglement',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Repulsion',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Camouflage',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Flow',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Affection',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Thorns',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.AntiEntropy',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Corrosion',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Displacement',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Metabolism',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Multiplicity',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Stench',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Overgrowth',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Bulk',
  'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph',
  'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon',
  'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$KeyReplacementTracker',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew',
  'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight$HTBoost',
  'com.shatteredpixel.shatteredpixeldungeon.items.quest.CeremonialCandle',
  'com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust$DustGhostSpawner',
  'com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal',
  'com.shatteredpixel.shatteredpixeldungeon.items.quest.VaultBeacon',
  'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll',
  'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize',
  'com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning',
  'com.shatteredpixel.shatteredpixeldungeon.items.spells.ReclaimTrap',
  'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell',
  'com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser$CenserGasTracker',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion$WandUseTracker',
  'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion$ThrownUseTracker',
  'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning$LightningCharge',
  'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile$MagicCharge',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking$BlockBuff',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail$SpinAbilityTracker',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sai$ComboStrikeTracker',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Shuriken$ShurikenInstantTracker',
  'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart',
  'com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary',
  'com.shatteredpixel.shatteredpixeldungeon.journal.Catalog',
  'com.shatteredpixel.shatteredpixeldungeon.journal.Document',
  'com.shatteredpixel.shatteredpixeldungeon.journal.Journal',
  'com.shatteredpixel.shatteredpixeldungeon.journal.Notes',
  'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark',
  'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomType',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$CityEntrance',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$EntranceTerrain',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$EntranceOverhang',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$PylonEnergy',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$GreenFlame',
  'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$Smoke',
  'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$CenterPieceVisuals',
  'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$CenterPieceWalls',
  'com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel$CustomFloor',
  'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel$CenterPieceVisuals',
  'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel$CenterPieceWalls',
  'com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling',
  'com.shatteredpixel.shatteredpixeldungeon.levels.Terrain',
  'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$State',
  'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$ExitVisual',
  'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$ExitVisualWalls',
  'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel$Sink',
  'com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel',
  'com.shatteredpixel.shatteredpixeldungeon.levels.builders.GridBuilder',
  'com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm',
  'com.shatteredpixel.shatteredpixeldungeon.levels.features.HighGrass',
  'com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type',
  'com.shatteredpixel.shatteredpixeldungeon.levels.features.Maze',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MassGraveRoom$MassGraveDeco',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLaboratoryRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLibraryRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretWellRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossExitRoom$SewerExit',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossExitRoom$SewerExitOverhang',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicWellRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.TrapsRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StatueLineRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.EntranceRoom',
  'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.ExitRoom',
  'com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster',
  'com.shatteredpixel.shatteredpixeldungeon.messages.Languages$Status',
  'com.shatteredpixel.shatteredpixeldungeon.messages.Languages',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.AmuletScene',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Phase',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.JournalScene',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene$Fader',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene$Record',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$Sky',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene$Cloud',
  'com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene',
  'com.shatteredpixel.shatteredpixeldungeon.services.news.News',
  'com.shatteredpixel.shatteredpixeldungeon.services.news.NewsImpl',
  'com.shatteredpixel.shatteredpixeldungeon.services.updates.UpdateImpl',
  'com.shatteredpixel.shatteredpixeldungeon.services.updates.Updates',
  'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State',
  'com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite$GooParticle',
  'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons',
  'com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite',
  'com.shatteredpixel.shatteredpixeldungeon.sprites.StatueSprite',
  'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet',
  'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonWallsTilemap',
  'com.shatteredpixel.shatteredpixeldungeon.tiles.FogOfWar',
  'com.shatteredpixel.shatteredpixeldungeon.tiles.RaisedTerrainTilemap',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Archs',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Banner$State',
  'com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Button',
  'com.shatteredpixel.shatteredpixeldungeon.ui.CurrencyIndicator',
  'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton',
  'com.shatteredpixel.shatteredpixeldungeon.ui.DangerIndicator',
  'com.shatteredpixel.shatteredpixeldungeon.ui.GameLog',
  'com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane',
  'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot',
  'com.shatteredpixel.shatteredpixeldungeon.ui.KeyDisplay',
  'com.watabou.noosa.RenderedText$TextRenderBatch',
  'com.watabou.noosa.RenderedText',
  'com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock',
  'com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Tag',
  'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode',
  'com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$Mode',
  'com.shatteredpixel.shatteredpixeldungeon.ui.Tooltip',
  'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeIcons',
  'com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed',
  'com.shatteredpixel.shatteredpixeldungeon.utils.Holiday',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndClericSpells',
  'com.watabou.noosa.Game',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndHero',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$AlchemyTab',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$CatalogTab',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$BadgesTab',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndQuickBag',
  'com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings',
  'com.watabou.glscripts.Script',
  'com.watabou.gltextures.TextureCache',
  'com.watabou.glwrap.Framebuffer',
  'com.watabou.glwrap.Matrix',
  'com.watabou.glwrap.Quad',
  'com.watabou.glwrap.Renderbuffer',
  'com.watabou.glwrap.Shader',
  'com.watabou.glwrap.Texture',
  'com.watabou.glwrap.Vertexbuffer',
  'com.watabou.input.ControllerHandler$ControllerType',
  'com.watabou.input.ControllerHandler',
  'com.watabou.input.KeyEvent',
  'com.watabou.input.PointerEvent$Type',
  'com.watabou.input.ScrollEvent',
  'com.watabou.noosa.Camera',
  'com.watabou.noosa.Halo',
  'com.watabou.noosa.audio.Music',
  'com.watabou.noosa.particles.Emitter',
  'com.watabou.noosa.ui.Cursor',
  'com.watabou.noosa.ui.Cursor$Type',
  'com.watabou.utils.BitmapCache',
  'com.watabou.utils.Bundle',
  'com.watabou.utils.FileUtils',
  'com.watabou.utils.PathFinder',
  'freegames.spd.WebPlatformSupport',
  'com.badlogic.gdx.graphics.Color',
  'com.badlogic.gdx.utils.ObjectMap',
  'com.badlogic.gdx.graphics.Colors',
  'com.badlogic.gdx.graphics.g2d.BitmapFontCache',
  'com.badlogic.gdx.graphics.g2d.GlyphLayout',
  'com.badlogic.gdx.graphics.g2d.PixmapPacker',
  'com.badlogic.gdx.graphics.g2d.freetype.FreeType',
  'com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator',
  'com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$Hinting',
  'com.badlogic.gdx.math.MathUtils',
]);
