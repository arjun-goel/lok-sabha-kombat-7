import * as THREE from 'three';
import { DummyBehavior, FighterId, GameMode, GameSettings, InputState, MoveDefinition, StageId } from '../types';
import { FIGHTER_PROFILES, STAGES } from '../data/fighters';
import { Fighter } from '../entities/Fighter';
import { SceneManager } from '../scene/SceneManager';
import { AudioEngine } from '../audio/AudioEngine';
import { InputManager } from './InputManager';
import { AIController } from './AIController';
import { VFXManager } from './VFXManager';

export interface MatchEventCallbacks {
  onHudUpdate: () => void;
  onAnnounceBanner: (title: string, subtitle?: string, color?: string, durationMs?: number) => void;
  onCalloutBubble: (playerIndex: 1 | 2, text: string, subText?: string) => void;
  onMatchEnd: (winnerIndex: 1 | 2, isArcadeComplete: boolean) => void;
}

export class GameManager {
  public sceneMgr: SceneManager;
  public audio: AudioEngine;
  public inputMgr: InputManager;
  public aiP2: AIController;
  public vfx: VFXManager;
  public settings: GameSettings;
  public callbacks: MatchEventCallbacks;

  public mode: GameMode = 'versus_cpu';
  public stageId: StageId = 'sansad';
  public dummyBehavior: DummyBehavior = 'stand';

  public p1!: Fighter;
  public p2!: Fighter;
  public p1RoundsWon = 0;
  public p2RoundsWon = 0;
  public currentRound = 1;
  public roundTimer = 60;

  public arcadeStageIndex = 0;
  private arcadeOpponents: FighterId[] = ['kejriwal', 'rahul', 'mamata'];

  public isInMenu = true;
  public isPaused = false;
  public roundPhase: 'INTRO' | 'FIGHTING' | 'ROUND_OVER' | 'MATCH_OVER' = 'INTRO';

  private phaseTimer = 0;
  private hitstopFrames = 0;
  private slowMoFactor = 1.0;
  private slowMoTimer = 0;
  private frameAccumulator = 0;
  private elapsedClock = 0;

  public lastMoveUsedText = 'Ready to Fight!';
  public lastFrameAdvantageText = '+0 (Neutral)';

  constructor(
    sceneMgr: SceneManager,
    audio: AudioEngine,
    inputMgr: InputManager,
    settings: GameSettings,
    callbacks: MatchEventCallbacks
  ) {
    this.sceneMgr = sceneMgr;
    this.audio = audio;
    this.inputMgr = inputMgr;
    this.settings = settings;
    this.callbacks = callbacks;
    this.aiP2 = new AIController();
    this.vfx = new VFXManager(this.sceneMgr.scene);

    // Spawn Modi vs Mamata in background showcase on launch!
    this.spawnFighters('modi', 'mamata');
  }

  public spawnFighters(p1Id: FighterId, p2Id: FighterId): void {
    if (this.p1) {
      this.sceneMgr.scene.remove(this.p1.rig.group);
    }
    if (this.p2) {
      this.sceneMgr.scene.remove(this.p2.rig.group);
    }

    this.p1 = new Fighter(p1Id, 1, -2.1);
    this.p2 = new Fighter(p2Id, 2, 2.1);

    this.sceneMgr.scene.add(this.p1.rig.group);
    this.sceneMgr.scene.add(this.p2.rig.group);
  }

  public startMatch(mode: GameMode, p1Id: FighterId, p2Id: FighterId, stageId: StageId): void {
    this.mode = mode;
    this.stageId = stageId;
    this.isInMenu = false;
    this.isPaused = false;
    this.p1RoundsWon = 0;
    this.p2RoundsWon = 0;
    this.currentRound = 1;

    if (mode === 'arcade') {
      const allIds: FighterId[] = ['modi', 'mamata', 'yogi', 'kejriwal', 'rahul'];
      this.arcadeOpponents = allIds.filter((id) => id !== p1Id);
      // Put Mamata or Modi as Final Boss!
      this.arcadeOpponents.sort((a, b) => (a === 'mamata' || a === 'modi' ? 1 : b === 'mamata' || b === 'modi' ? -1 : 0));
      p2Id = this.arcadeOpponents[this.arcadeStageIndex] || 'mamata';
    }

    this.sceneMgr.loadStage(stageId);
    this.spawnFighters(p1Id, p2Id);
    this.audio.startBGM();
    this.beginRound();
  }

  public beginRound(): void {
    this.p1.resetForRound(-2.2, 1);
    this.p2.resetForRound(2.2, -1);
    this.roundTimer = this.mode === 'practice' || this.settings.roundTimeSeconds === 0 ? 999 : this.settings.roundTimeSeconds;
    this.roundPhase = 'INTRO';
    this.phaseTimer = 2.1;
    this.slowMoFactor = 1.0;
    this.slowMoTimer = 0;
    this.hitstopFrames = 0;

    const roundLabel = this.mode === 'practice' ? 'PRACTICE AKHADA' : `ROUND ${this.currentRound}`;
    this.callbacks.onAnnounceBanner(
      roundLabel,
      `${this.p1.profile.shortName}  VS  ${this.p2.profile.shortName}`,
      '#ff8800',
      1400
    );
    this.callbacks.onCalloutBubble(1, this.p1.profile.catchphrases.intro);
    this.callbacks.onCalloutBubble(2, this.p2.profile.catchphrases.intro);

    // Play Player 1's iconic meme voice clip at Round Intro!
    this.audio.playMemeClip(this.p1.profile.memeClips.intro, true);

    window.setTimeout(() => {
      if (!this.isInMenu && this.roundPhase === 'INTRO') {
        this.callbacks.onAnnounceBanner('FIGHT!!', 'PRESS E FOR SPECIAL MOVE • MASH J FOR COMBO!', '#00e5ff', 850);
        this.audio.playCrowdCheer();
      }
    }, 1250);

    this.callbacks.onHudUpdate();
  }

  public restartCurrentMatch(): void {
    this.isPaused = false;
    this.p1RoundsWon = 0;
    this.p2RoundsWon = 0;
    this.currentRound = 1;
    this.beginRound();
  }

  public advanceArcadeStage(): void {
    this.arcadeStageIndex++;
    const nextOpponent = this.arcadeOpponents[this.arcadeStageIndex] || 'mamata';
    const nextStage = STAGES[this.arcadeStageIndex % STAGES.length].id;
    this.startMatch('arcade', this.p1.id, nextOpponent, nextStage);
  }

  public returnToMenu(): void {
    this.isInMenu = true;
    this.isPaused = false;
    this.slowMoFactor = 1.0;
    this.p1.resetForRound(-1.7, 1);
    this.p2.resetForRound(1.7, -1);
  }

  public update(rawDt: number): void {
    const clampedDt = Math.min(rawDt, 0.05);
    this.elapsedClock += clampedDt;

    if (this.isPaused) {
      this.sceneMgr.render();
      return;
    }

    // Update Slow-Mo timer (Tekken 7 Final Hit Slow-Motion!)
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= clampedDt;
      if (this.slowMoTimer <= 0) {
        this.slowMoFactor = 1.0;
      }
    }

    const effectiveDt = clampedDt * this.slowMoFactor;
    this.vfx.update(effectiveDt);

    if (this.isInMenu) {
      // Showcase idle animations on the main menu
      const emptyInput: InputState = {
        forward: false,
        backward: false,
        up: false,
        down: false,
        sidestepUp: false,
        sidestepDown: false,
        lp: false,
        rp: false,
        lk: false,
        rk: false,
        special: false,
        grab: false,
        rage: false,
        block: false
      };
      this.p1.updateFrame(emptyInput, this.p2, effectiveDt);
      this.p2.updateFrame(emptyInput, this.p1, effectiveDt);
      this.sceneMgr.updateCamera(this.p1.position, this.p2.position, effectiveDt, this.elapsedClock, true);
      this.sceneMgr.render();
      return;
    }

    // Handle Round Phases
    if (this.roundPhase === 'INTRO') {
      this.phaseTimer -= clampedDt;
      if (this.phaseTimer <= 0) {
        this.roundPhase = 'FIGHTING';
      }
    } else if (this.roundPhase === 'FIGHTING') {
      if (this.mode !== 'practice' && this.settings.roundTimeSeconds > 0) {
        this.roundTimer -= clampedDt;
        if (this.roundTimer <= 0) {
          this.roundTimer = 0;
          this.handleTimeOver();
        }
      } else if (this.mode === 'practice') {
        // Auto-regenerate HP in Practice mode when both fighters are neutral
        if (this.p1.state === 'IDLE' && this.p2.state === 'IDLE') {
          this.p1.hp = Math.min(this.p1.maxHp, this.p1.hp + 45 * clampedDt);
          this.p2.hp = Math.min(this.p2.maxHp, this.p2.hp + 45 * clampedDt);
        }
      }
    } else if (this.roundPhase === 'ROUND_OVER') {
      this.phaseTimer -= clampedDt;
      if (this.phaseTimer <= 0) {
        this.checkMatchProgression();
      }
    }

    // Fixed 60fps simulation tick for crisp frame-data accuracy
    this.frameAccumulator += effectiveDt;
    const fixedStep = 1 / 60;

    while (this.frameAccumulator >= fixedStep) {
      this.frameAccumulator -= fixedStep;
      this.stepSimulationFrame(fixedStep);
    }

    this.sceneMgr.updateCamera(this.p1.position, this.p2.position, clampedDt, this.elapsedClock, false);
    this.sceneMgr.render();
    this.callbacks.onHudUpdate();
  }

  private stepSimulationFrame(fixedDt: number): void {
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      return;
    }

    const canControl = this.roundPhase === 'FIGHTING';

    const emptyInput: InputState = {
      forward: false,
      backward: false,
      up: false,
      down: false,
      sidestepUp: false,
      sidestepDown: false,
      lp: false,
      rp: false,
      lk: false,
      rk: false,
      special: false,
      grab: false,
      rage: false,
      block: false
    };

    const p1Input = canControl ? this.inputMgr.getPlayer1Input(this.p1.facingSign) : emptyInput;
    const p2Input = !canControl
      ? emptyInput
      : this.mode === 'versus_pvp'
      ? this.inputMgr.getPlayer2Input(this.p2.facingSign)
      : this.aiP2.computeInput(this.p2, this.p1, this.settings.aiDifficulty, this.mode === 'practice', this.dummyBehavior);

    const p1StartedMove = this.p1.updateFrame(p1Input, this.p2, fixedDt);
    const p2StartedMove = this.p2.updateFrame(p2Input, this.p1, fixedDt);

    if (p1StartedMove) {
      this.onMoveStarted(this.p1, p1StartedMove);
    }
    if (p2StartedMove) {
      this.onMoveStarted(this.p2, p2StartedMove);
    }

    // Body Pushbox Separation so fighters never walk through each other
    this.resolvePushboxCollision();

    // Hitbox vs Hurtbox Resolution
    if (this.roundPhase === 'FIGHTING') {
      if (this.p1.isMoveInActiveFrames()) {
        this.checkAttackHit(this.p1, this.p2, p2Input);
      }
      if (this.p2.isMoveInActiveFrames()) {
        this.checkAttackHit(this.p2, this.p1, p1Input);
      }
    }
  }

  private onMoveStarted(fighter: Fighter, move: MoveDefinition): void {
    this.audio.playWhoosh(move.sfxType === 'heavy' || move.sfxType === 'electric' || move.sfxType === 'rage');
    if (fighter.playerIndex === 1) {
      this.lastMoveUsedText = `${move.name} [${move.commandNotation}] (${move.hitLevel} • ${move.startupFrames}f)`;
    }

    if (move.signatureSpecial) {
      // Dramatic Signature Special Move Presentation (Modi's 56-Inch Mann Ki Baat Lotus Blast, etc.)!
      this.sceneMgr.triggerDramaticZoom(1.52);
      this.sceneMgr.triggerCameraShake(0.24, 0.22);
      this.vfx.spawnSignatureSpecialVFX(fighter.position, fighter.facingSign, fighter.id, fighter.profile.colors.glow);
      this.callbacks.onCalloutBubble(
        fighter.playerIndex,
        move.battleCry || 'SIGNATURE SPECIAL!!',
        `🌟 ${move.name.toUpperCase()}`
      );
      this.callbacks.onAnnounceBanner(
        fighter.id === 'modi' ? '🪷 56-INCH LOTUS BLAST!!' : `🌟 ${fighter.profile.shortName} SPECIAL!`,
        move.battleCry || move.name,
        fighter.profile.colors.uiHex,
        1150
      );
      // Play iconic voice dialogue (Modi's "Andren Rajyam Laudeyam Bhojyam" clip!)
      this.audio.playMemeClip(fighter.profile.memeClips.rage, true);
      return;
    }

    if (move.battleCry) {
      this.callbacks.onCalloutBubble(fighter.playerIndex, move.battleCry, move.name);
      if (move.rageArt) {
        this.sceneMgr.triggerDramaticZoom(1.65);
        this.audio.playMemeClip(fighter.profile.memeClips.rage, true);
      } else if (move.launches || move.powerCrush || move.sfxType === 'throw') {
        this.audio.playMemeClip(fighter.profile.memeClips.special, true);
      }
    }
  }

  private resolvePushboxCollision(): void {
    const zDiff = Math.abs(this.p1.position.z - this.p2.position.z);
    if (zDiff > 0.75) return; // Sidestepping allows passing around!

    const minDistance = 0.86;
    const dx = this.p2.position.x - this.p1.position.x;
    const absDx = Math.abs(dx);

    if (absDx < minDistance) {
      const overlap = (minDistance - absDx) * 0.5;
      const dir = dx >= 0 ? 1 : -1;
      this.p1.position.x = THREE.MathUtils.clamp(this.p1.position.x - dir * overlap, -6.8, 6.8);
      this.p2.position.x = THREE.MathUtils.clamp(this.p2.position.x + dir * overlap, -6.8, 6.8);
    }
  }

  private checkAttackHit(attacker: Fighter, defender: Fighter, defenderInput: InputState): void {
    const move = attacker.currentMove;
    if (!move) return;

    // Cannot hit downed/invulnerable wake-up fighters unless low sweep
    if (defender.state === 'GETUP' || defender.state === 'DEFEATED') return;
    if (defender.state === 'KNOCKDOWN' && move.hitLevel !== 'LOW') return;

    // 3D Sidestep Evasion Check (Non-homing attacks miss if defender sidestepped out of Z lane!)
    const zDist = Math.abs(attacker.position.z - defender.position.z);
    if (!move.homing && defender.state === 'SIDESTEP' && zDist > 0.55) {
      return;
    }

    // Horizontal Reach Check
    const hitCenter = attacker.getActiveHitboxCenter();
    const dx = Math.abs(hitCenter.x - defender.position.x);
    if (dx > move.hitboxRadius + 0.44) {
      return;
    }

    // High Attack Whiff on Crouching Defender! (True Tekken Mechanic)
    if (move.hitLevel === 'HIGH' && defender.isCrouchingState && defender.state !== 'AIRBORNE_JUGGLE') {
      return;
    }

    // Low Attack Whiff on Jumping / Low-Crushing Defender!
    if (move.hitLevel === 'LOW' && defender.isLowCrushing) {
      return;
    }

    // Throws only hit standing/crouching grounded defenders
    if (move.hitLevel === 'THROW' && defender.state === 'AIRBORNE_JUGGLE') {
      return;
    }

    // Mark attack as connected so it only triggers once per swing
    attacker.moveHasConnected = true;

    // Check Guarding
    let isBlocked = false;
    if (defender.state !== 'AIRBORNE_JUGGLE' && defender.state !== 'ATTACK' && defender.state !== 'HITSTUN') {
      if (move.hitLevel === 'HIGH' || move.hitLevel === 'MID') {
        isBlocked = defender.isGuardingHighMid(defenderInput);
      } else if (move.hitLevel === 'LOW') {
        isBlocked = defender.isGuardingLow(defenderInput);
      }
    }

    const sparkPos = attacker.rig.getLimbWorldPosition(move.activeLimb);

    if (isBlocked) {
      // Blocked Hit!
      defender.state = 'BLOCKSTUN';
      defender.stateFrame = 0;
      defender.stunFramesRemaining = move.blockStunFrames;
      defender.position.x = THREE.MathUtils.clamp(
        defender.position.x + attacker.facingSign * move.pushbackOnBlock,
        -6.8,
        6.8
      );

      // Chip damage on heavy/rage moves (never kills on block)
      if (move.chipDamage > 0 && defender.hp > move.chipDamage + 1) {
        defender.hp -= move.chipDamage;
      }

      const frameAdvantage = move.blockStunFrames - move.recoveryFrames;
      this.lastFrameAdvantageText = `${frameAdvantage >= 0 ? '+' : ''}${frameAdvantage} on Block`;

      this.hitstopFrames = 4;
      this.audio.playHitImpact('block');
      this.vfx.spawnHitSparks(sparkPos, 0x38bdf8, 'block');
      return;
    }

    // Counter-Hit Check (Defender was in startup frames of an attack!)
    const isCounterHit = defender.state === 'ATTACK' && !defender.isPowerCrushActive;
    const isDefenderArmored = defender.isPowerCrushActive && move.hitLevel !== 'LOW' && move.hitLevel !== 'THROW';

    // Calculate Combo Damage Scaling (Tekken Juggle Scaling: 100% -> 70% -> 50% -> 40% -> 30%)
    const scaleTable = [1.0, 0.72, 0.54, 0.42, 0.34, 0.3];
    const scaleFactor = scaleTable[Math.min(defender.comboHitsTaken, scaleTable.length - 1)];
    const rageBonus = attacker.isRage ? 1.12 : 1.0;
    const chBonus = isCounterHit ? 1.2 : 1.0;
    const finalDamage = Math.max(2, Math.round(move.damage * scaleFactor * rageBonus * chBonus));

    // Tekken 7 Final Blow Slow-Motion Check!
    if (
      this.mode !== 'practice' &&
      defender.hp > 0 &&
      defender.hp <= finalDamage * 1.15 &&
      (move.sfxType === 'heavy' || move.sfxType === 'electric' || move.sfxType === 'rage' || move.launches)
    ) {
      this.slowMoFactor = 0.24;
      this.slowMoTimer = 0.95;
      this.sceneMgr.triggerDramaticZoom(1.55);
    }

    defender.hp = Math.max(0, defender.hp - finalDamage);
    defender.comboHitsTaken++;
    defender.comboDamageTaken += finalDamage;
    defender.rig.triggerHitFlash();

    const frameAdvantage = move.hitStunFrames - move.recoveryFrames;
    this.lastFrameAdvantageText = `${frameAdvantage >= 0 ? '+' : ''}${frameAdvantage} on Hit${isCounterHit ? ' (COUNTER!)' : ''}`;

    // Hitstop & Camera Shake
    const isBigHit =
      move.signatureSpecial || move.sfxType === 'electric' || move.sfxType === 'rage' || move.sfxType === 'heavy' || isCounterHit;
    this.hitstopFrames = move.rageArt ? 12 : move.signatureSpecial ? 10 : isBigHit ? 7 : 4;
    this.sceneMgr.triggerCameraShake(
      move.rageArt ? 0.42 : move.signatureSpecial ? 0.34 : isBigHit ? 0.22 : 0.09,
      isBigHit ? 0.24 : 0.12
    );

    this.audio.playHitImpact(move.sfxType);
    this.vfx.spawnHitSparks(
      sparkPos,
      move.sparkColor || attacker.profile.colors.glow,
      move.rageArt || move.signatureSpecial ? 'rage' : move.sfxType === 'throw' ? 'heavy' : move.sfxType
    );

    // Fun Catchphrase Comic Callout & Real Meme Voice on Big Hits / Counter Hits / Combos!
    if (isCounterHit || move.launches || move.sfxType === 'throw' || move.sfxType === 'heavy' || defender.comboHitsTaken >= 2) {
      const phrases = attacker.profile.catchphrases.hit;
      const randomCry = move.signatureSpecial && move.battleCry ? move.battleCry : phrases[Math.floor(Math.random() * phrases.length)];
      this.callbacks.onCalloutBubble(
        attacker.playerIndex,
        isCounterHit ? `COUNTER! ${randomCry}` : randomCry,
        `${defender.comboHitsTaken} HIT (${defender.comboDamageTaken} DMG)`
      );
      if (!move.signatureSpecial) {
        const pool = attacker.profile.memeClips.hitPool;
        const clipUrl = pool[Math.floor(Math.random() * pool.length)];
        this.audio.playMemeClip(clipUrl, false);
      }
    }

    // Check KO!
    if (defender.hp <= 0 && this.mode !== 'practice') {
      this.handleRoundKO(attacker, defender);
      return;
    }

    // If Defender had Power Crush armor, they absorb the hit without losing their attack!
    if (isDefenderArmored) {
      this.callbacks.onCalloutBubble(defender.playerIndex, 'ARMOR ABSORBED!!', 'POWER CRUSH');
      return;
    }

    // Apply Launch / Juggle / Tailspin / Knockdown / Hitstun Physics
    if (defender.state === 'AIRBORNE_JUGGLE') {
      defender.juggleHitsCount++;
      if (move.tailspin && !defender.tailspinUsedInCombo) {
        // Tekken 7 "Screw / Tailspin" bound extender!
        defender.tailspinUsedInCombo = true;
        defender.velocity.y = 6.6;
        defender.velocity.x = attacker.facingSign * 2.1;
        this.callbacks.onCalloutBubble(attacker.playerIndex, 'SCREW / TAILSPIN!!', 'COMBO EXTENDED');
      } else {
        // Keep opponent juggling with gradual gravity decay after many hits
        const decay = Math.max(0.45, 1 - defender.juggleHitsCount * 0.12);
        defender.velocity.y = 5.4 * decay;
        defender.velocity.x = attacker.facingSign * (1.8 + defender.juggleHitsCount * 0.35);
      }
    } else if (move.launches || (isCounterHit && move.id === 'kick_4')) {
      defender.state = 'AIRBORNE_JUGGLE';
      defender.stateFrame = 0;
      defender.juggleHitsCount = 1;
      defender.velocity.y = move.launchVelocityY || 8.2;
      defender.velocity.x = attacker.facingSign * (move.launchVelocityX || 1.6);
      this.vfx.spawnGroundDust(defender.position.x, defender.position.z, attacker.profile.colors.glow);
    } else if (move.knockdown) {
      defender.state = 'KNOCKDOWN';
      defender.stateFrame = 0;
      defender.velocity.x = attacker.facingSign * move.pushbackOnHit * 2.5;
      this.vfx.spawnGroundDust(defender.position.x, defender.position.z);
    } else {
      defender.state = 'HITSTUN';
      defender.stateFrame = 0;
      defender.stunFramesRemaining = move.hitStunFrames + (isCounterHit ? 6 : 0);
      defender.position.x = THREE.MathUtils.clamp(
        defender.position.x + attacker.facingSign * move.pushbackOnHit,
        -6.8,
        6.8
      );
    }
  }

  private handleRoundKO(winner: Fighter, loser: Fighter): void {
    this.roundPhase = 'ROUND_OVER';
    this.phaseTimer = 2.8;
    this.slowMoFactor = 0.28;
    this.slowMoTimer = 1.15;

    loser.state = 'DEFEATED';
    loser.stateFrame = 0;
    winner.state = 'VICTORY';
    winner.stateFrame = 0;

    if (winner.playerIndex === 1) {
      this.p1RoundsWon++;
    } else {
      this.p2RoundsWon++;
    }

    this.sceneMgr.triggerDramaticZoom(1.7);
    this.audio.playCrowdCheer();
    this.audio.playMemeClip(winner.profile.memeClips.win, true);

    this.callbacks.onAnnounceBanner(
      'K.O.!!',
      `${winner.profile.name} — "${winner.profile.catchphrases.win}"`,
      winner.profile.colors.uiHex,
      2400
    );
    this.callbacks.onCalloutBubble(winner.playerIndex, winner.profile.catchphrases.win, 'ROUND WINNER!');
    this.callbacks.onHudUpdate();
  }

  private handleTimeOver(): void {
    if (this.roundPhase !== 'FIGHTING') return;
    this.roundPhase = 'ROUND_OVER';
    this.phaseTimer = 2.6;

    const winner = this.p1.hp >= this.p2.hp ? this.p1 : this.p2;
    const loser = winner === this.p1 ? this.p2 : this.p1;

    winner.state = 'VICTORY';
    loser.state = 'KNOCKDOWN';

    if (winner.playerIndex === 1) {
      this.p1RoundsWon++;
    } else {
      this.p2RoundsWon++;
    }

    this.audio.speakAnnouncer(`Time Over! ${winner.profile.name} wins!`, 0.85, 1.0);
    this.callbacks.onAnnounceBanner(
      'TIME OVER!',
      `${winner.profile.name} TAKES THE MAJORITY VOTE!`,
      winner.profile.colors.uiHex,
      2200
    );
    this.callbacks.onHudUpdate();
  }

  private checkMatchProgression(): void {
    const targetWins = this.settings.roundsToWin;
    if (this.p1RoundsWon >= targetWins || this.p2RoundsWon >= targetWins) {
      this.roundPhase = 'MATCH_OVER';
      const winnerIndex: 1 | 2 = this.p1RoundsWon >= targetWins ? 1 : 2;
      const isArcadeComplete =
        this.mode === 'arcade' && winnerIndex === 1 && this.arcadeStageIndex >= this.arcadeOpponents.length - 1;
      this.callbacks.onMatchEnd(winnerIndex, isArcadeComplete);
    } else {
      this.currentRound++;
      this.beginRound();
    }
  }
}
