import * as THREE from 'three';
import { FighterId, FighterProfile, InputState, MoveDefinition } from '../types';
import { createMovelistForFighter, FIGHTER_PROFILES } from '../data/fighters';
import { FighterRig } from './FighterRig';

export type FighterState =
  | 'IDLE'
  | 'WALK_F'
  | 'WALK_B'
  | 'CROUCH'
  | 'JUMP'
  | 'DASH_F'
  | 'DASH_B'
  | 'SIDESTEP'
  | 'ATTACK'
  | 'BLOCKSTUN'
  | 'HITSTUN'
  | 'AIRBORNE_JUGGLE'
  | 'KNOCKDOWN'
  | 'GETUP'
  | 'VICTORY'
  | 'DEFEATED';

export class Fighter {
  public id: FighterId;
  public profile: FighterProfile;
  public playerIndex: 1 | 2;
  public rig: FighterRig;
  public moves: Record<string, MoveDefinition>;

  public position = new THREE.Vector3();
  public velocity = new THREE.Vector3();
  public facingSign: 1 | -1 = 1; // 1 = facing +X, -1 = facing -X

  public maxHp = 175;
  public hp = 175;
  public state: FighterState = 'IDLE';
  public stateFrame = 0;
  public stunFramesRemaining = 0;

  public currentMove: MoveDefinition | null = null;
  public moveFrame = 0;
  public moveHasConnected = false;
  public queuedCancelMoveId: string | null = null;

  public comboHitsTaken = 0;
  public comboDamageTaken = 0;
  public juggleHitsCount = 0;
  public tailspinUsedInCombo = false;
  public rageArtUsedThisRound = false;

  public sidestepDirection: 1 | -1 = 1;
  public lastFrameAdvantage = 0;

  // Edge detection for single-press attack triggers
  private prevInput: InputState = {
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
    grab: false,
    rage: false,
    block: false
  };

  private animTime = 0;

  constructor(fighterId: FighterId, playerIndex: 1 | 2, startX: number) {
    this.id = fighterId;
    this.profile = FIGHTER_PROFILES[fighterId];
    this.playerIndex = playerIndex;
    this.rig = new FighterRig(this.profile);
    this.moves = createMovelistForFighter(fighterId);

    this.resetForRound(startX, playerIndex === 1 ? 1 : -1);
  }

  public resetForRound(startX: number, facing: 1 | -1): void {
    this.position.set(startX, 0, 0);
    this.velocity.set(0, 0, 0);
    this.facingSign = facing;
    this.hp = this.maxHp;
    this.state = 'IDLE';
    this.stateFrame = 0;
    this.stunFramesRemaining = 0;
    this.currentMove = null;
    this.moveFrame = 0;
    this.moveHasConnected = false;
    this.queuedCancelMoveId = null;
    this.comboHitsTaken = 0;
    this.comboDamageTaken = 0;
    this.juggleHitsCount = 0;
    this.tailspinUsedInCombo = false;
    this.rageArtUsedThisRound = false;
    this.syncTransform();
  }

  public get isRage(): boolean {
    return this.hp > 0 && this.hp <= this.maxHp * 0.28 && !this.rageArtUsedThisRound;
  }

  public get isPowerCrushActive(): boolean {
    if (this.state !== 'ATTACK' || !this.currentMove || !this.currentMove.powerCrush) return false;
    return this.moveFrame >= 4 && this.moveFrame <= this.currentMove.startupFrames + this.currentMove.activeFrames;
  }

  public get isLowCrushing(): boolean {
    if (this.state === 'JUMP') return true;
    if (this.state === 'ATTACK' && this.currentMove?.lowCrush) {
      return this.moveFrame >= 5 && this.moveFrame <= this.currentMove.startupFrames + this.currentMove.activeFrames;
    }
    return false;
  }

  public get isCrouchingState(): boolean {
    return this.state === 'CROUCH' || (this.state === 'ATTACK' && (this.currentMove?.id === 'low_d3' || this.currentMove?.id === 'low_d4'));
  }

  public isGuardingHighMid(input: InputState): boolean {
    if (
      this.state !== 'IDLE' &&
      this.state !== 'WALK_B' &&
      this.state !== 'BLOCKSTUN'
    ) {
      return false;
    }
    return (input.backward && !input.down) || (input.block && !input.down);
  }

  public isGuardingLow(input: InputState): boolean {
    if (
      this.state !== 'IDLE' &&
      this.state !== 'CROUCH' &&
      this.state !== 'WALK_B' &&
      this.state !== 'BLOCKSTUN'
    ) {
      return false;
    }
    return (input.down && input.backward) || (input.down && input.block);
  }

  public updateFrame(input: InputState, opponent: Fighter, dt: number): MoveDefinition | null {
    this.animTime += dt;
    this.stateFrame++;

    const justPressed = {
      lp: input.lp && !this.prevInput.lp,
      rp: input.rp && !this.prevInput.rp,
      lk: input.lk && !this.prevInput.lk,
      rk: input.rk && !this.prevInput.rk,
      grab: (input.grab && !this.prevInput.grab) || (input.lp && input.lk && (!this.prevInput.lp || !this.prevInput.lk)),
      rage: input.rage && !this.prevInput.rage,
      ssUp: input.sidestepUp && !this.prevInput.sidestepUp,
      ssDown: input.sidestepDown && !this.prevInput.sidestepDown
    };

    let startedMove: MoveDefinition | null = null;

    // Update facing direction when standing neutral/moving
    if (
      this.state === 'IDLE' ||
      this.state === 'WALK_F' ||
      this.state === 'WALK_B' ||
      this.state === 'CROUCH'
    ) {
      const dx = opponent.position.x - this.position.x;
      if (Math.abs(dx) > 0.08) {
        this.facingSign = dx >= 0 ? 1 : -1;
      }
      // Recover combo counter when defender returns to neutral
      this.comboHitsTaken = 0;
      this.comboDamageTaken = 0;
      this.juggleHitsCount = 0;
      this.tailspinUsedInCombo = false;
    }

    switch (this.state) {
      case 'IDLE':
      case 'WALK_F':
      case 'WALK_B':
      case 'CROUCH': {
        // Check Attack Triggers first
        const triggered = this.resolveNeutralAttack(input, justPressed);
        if (triggered) {
          this.startAttack(triggered);
          startedMove = triggered;
          break;
        }

        // Check Sidestep (3D Z-axis evasion)
        if (justPressed.ssUp || justPressed.ssDown) {
          this.state = 'SIDESTEP';
          this.stateFrame = 0;
          this.sidestepDirection = justPressed.ssUp ? -1 : 1;
          break;
        }

        // Check Jump
        if (input.up && this.position.y <= 0.01) {
          this.state = 'JUMP';
          this.stateFrame = 0;
          this.velocity.y = 7.8;
          this.velocity.x = input.forward ? this.facingSign * 3.8 : input.backward ? -this.facingSign * 3.2 : 0;
          break;
        }

        // Check Crouch
        if (input.down) {
          this.state = 'CROUCH';
          this.velocity.x = 0;
          break;
        }

        // Walk Forward / Backward
        const walkSpeed = 4.1 * this.profile.speedMultiplier;
        if (input.forward) {
          this.state = 'WALK_F';
          this.velocity.x = this.facingSign * walkSpeed;
        } else if (input.backward) {
          this.state = 'WALK_B';
          this.velocity.x = -this.facingSign * (walkSpeed * 0.82);
        } else {
          this.state = 'IDLE';
          this.velocity.x = 0;
        }
        break;
      }

      case 'SIDESTEP': {
        const ssVel = 4.8 * this.sidestepDirection;
        this.position.z += ssVel * dt;
        this.position.z = THREE.MathUtils.clamp(this.position.z, -2.6, 2.6);

        // Allow attacking out of sidestep
        const triggered = this.resolveNeutralAttack(input, justPressed);
        if (triggered) {
          this.startAttack(triggered);
          startedMove = triggered;
          break;
        }

        if (this.stateFrame >= 16) {
          this.state = 'IDLE';
          this.stateFrame = 0;
        }
        break;
      }

      case 'JUMP': {
        this.position.y += this.velocity.y * dt;
        this.velocity.y -= 21.0 * dt;

        // Jumping kick / punch
        if (justPressed.rk || justPressed.lk) {
          this.startAttack(this.moves.hopkick_uf4);
          startedMove = this.moves.hopkick_uf4;
        }

        if (this.position.y <= 0) {
          this.position.y = 0;
          this.velocity.set(0, 0, 0);
          this.state = 'IDLE';
          this.stateFrame = 0;
        }
        break;
      }

      case 'ATTACK': {
        if (!this.currentMove) {
          this.state = 'IDLE';
          break;
        }
        this.moveFrame++;
        const m = this.currentMove;

        // Forward momentum during startup
        if (this.moveFrame <= m.startupFrames && m.forwardImpulse) {
          const stepX = (m.forwardImpulse / m.startupFrames) * this.facingSign;
          this.position.x += stepX;
        }

        // Hopkick airborne arc
        if (m.lowCrush) {
          const total = m.startupFrames + m.activeFrames + m.recoveryFrames;
          const progress = Math.min(1, this.moveFrame / total);
          this.position.y = Math.sin(progress * Math.PI) * 0.72;
        }

        // Check string cancel input buffering
        if (m.cancelInto && m.cancelInto.length > 0 && this.moveFrame >= 4) {
          for (const nextId of m.cancelInto) {
            if (nextId.endsWith('_2') && (justPressed.rp || (nextId === 'jab_1_2' && justPressed.rp))) {
              this.queuedCancelMoveId = nextId;
            } else if (nextId.endsWith('_1') && justPressed.lp) {
              this.queuedCancelMoveId = nextId;
            } else if (nextId.endsWith('_3') && justPressed.lk) {
              this.queuedCancelMoveId = nextId;
            } else if (nextId.endsWith('_4') && justPressed.rk) {
              this.queuedCancelMoveId = nextId;
            }
          }
        }

        // Execute queued chain cancel right after active frames
        const cancelWindowFrame = m.startupFrames + m.activeFrames + 2;
        if (this.queuedCancelMoveId && this.moveFrame >= cancelWindowFrame) {
          const nextMove = this.moves[this.queuedCancelMoveId];
          if (nextMove) {
            this.startAttack(nextMove);
            startedMove = nextMove;
            break;
          }
        }

        const totalFrames = m.startupFrames + m.activeFrames + m.recoveryFrames;
        if (this.moveFrame >= totalFrames) {
          this.position.y = 0;
          this.currentMove = null;
          this.queuedCancelMoveId = null;
          this.state = 'IDLE';
          this.stateFrame = 0;
        }
        break;
      }

      case 'BLOCKSTUN':
      case 'HITSTUN': {
        this.velocity.x *= 0.82;
        this.stunFramesRemaining--;
        if (this.stunFramesRemaining <= 0) {
          this.state = 'IDLE';
          this.stateFrame = 0;
          this.velocity.x = 0;
        }
        break;
      }

      case 'AIRBORNE_JUGGLE': {
        this.position.y += this.velocity.y * dt;
        this.velocity.y -= 18.8 * dt;
        this.velocity.x *= 0.96;

        if (this.position.y <= 0) {
          this.position.y = 0;
          this.velocity.y = 0;
          this.velocity.x *= 0.4;
          this.state = 'KNOCKDOWN';
          this.stateFrame = 0;
        }
        break;
      }

      case 'KNOCKDOWN': {
        this.velocity.x *= 0.85;
        // Quick wake-up after 28 frames or when pressing a directional button after 18 frames
        const wantsTechRoll = input.up || input.backward || input.forward || justPressed.lp || justPressed.lk;
        if (this.stateFrame >= 32 || (this.stateFrame >= 18 && wantsTechRoll)) {
          this.state = 'GETUP';
          this.stateFrame = 0;
        }
        break;
      }

      case 'GETUP': {
        if (this.stateFrame >= 12) {
          this.state = 'IDLE';
          this.stateFrame = 0;
          this.comboHitsTaken = 0;
          this.comboDamageTaken = 0;
          this.juggleHitsCount = 0;
          this.tailspinUsedInCombo = false;
        }
        break;
      }

      case 'VICTORY':
      case 'DEFEATED': {
        this.velocity.x = 0;
        break;
      }
    }

    // Apply horizontal velocity and gradually return Z towards 0 so fighters stay aligned on stage
    this.position.x += this.velocity.x * dt;
    if (this.state !== 'SIDESTEP') {
      this.position.z = THREE.MathUtils.lerp(this.position.z, 0, dt * 3.5);
    }

    // Arena Boundary Wall Clamp (-6.8 to +6.8)
    this.position.x = THREE.MathUtils.clamp(this.position.x, -6.8, 6.8);

    // Save input state for edge detection
    this.prevInput = { ...input };

    // Procedural Bone Pose Animation
    this.animatePose();
    this.rig.updateVisuals(dt, this.isRage, this.isPowerCrushActive, this.animTime);
    this.syncTransform();

    return startedMove;
  }

  private resolveNeutralAttack(
    input: InputState,
    justPressed: { lp: boolean; rp: boolean; lk: boolean; rk: boolean; grab: boolean; rage: boolean }
  ): MoveDefinition | null {
    if (justPressed.rage) {
      if (this.isRage) {
        this.rageArtUsedThisRound = true;
        return this.moves.rage_art;
      }
      return this.moves.power_crush;
    }

    if (justPressed.grab) {
      return this.moves.throw_grab;
    }

    if (justPressed.rp) {
      if (input.down && input.forward) {
        return this.moves.launcher_df2;
      }
      if (input.forward) {
        return this.moves.lunge_f2;
      }
      return this.moves.heavy_2;
    }

    if (justPressed.lp) {
      return this.moves.jab_1;
    }

    if (justPressed.lk) {
      if (input.down) {
        return this.moves.low_d3;
      }
      return this.moves.kick_3;
    }

    if (justPressed.rk) {
      if (input.up) {
        return this.moves.hopkick_uf4;
      }
      if (input.down) {
        return this.moves.low_d4;
      }
      return this.moves.kick_4;
    }

    return null;
  }

  public startAttack(move: MoveDefinition): void {
    this.state = 'ATTACK';
    this.stateFrame = 0;
    this.currentMove = move;
    this.moveFrame = 0;
    this.moveHasConnected = false;
    this.queuedCancelMoveId = null;
    this.velocity.x = 0;
  }

  public isMoveInActiveFrames(): boolean {
    if (this.state !== 'ATTACK' || !this.currentMove || this.moveHasConnected) return false;
    const m = this.currentMove;
    return this.moveFrame >= m.startupFrames && this.moveFrame <= m.startupFrames + m.activeFrames;
  }

  public getActiveHitboxCenter(): THREE.Vector3 {
    if (!this.currentMove) return this.position.clone();
    const m = this.currentMove;
    return new THREE.Vector3(
      this.position.x + m.hitboxOffsetForward * this.facingSign,
      this.position.y + m.hitboxOffsetY,
      this.position.z
    );
  }

  private syncTransform(): void {
    this.rig.group.position.copy(this.position);
    // Rotate fighter to face along +X or -X
    this.rig.group.rotation.y = this.facingSign === 1 ? Math.PI / 2 : -Math.PI / 2;
  }

  private resetJointRotations(): void {
    const j = this.rig.joints;
    j.hips.position.set(0, 0.98, 0);
    j.hips.rotation.set(0, 0, 0);
    j.torso.rotation.set(0, 0, 0);
    j.chest.rotation.set(0, 0, 0);
    j.head.rotation.set(0, 0, 0);
    j.leftShoulder.rotation.set(0, 0, 0);
    j.leftElbow.rotation.set(0, 0, 0);
    j.rightShoulder.rotation.set(0, 0, 0);
    j.rightElbow.rotation.set(0, 0, 0);
    j.leftHip.rotation.set(0, 0, 0);
    j.leftKnee.rotation.set(0, 0, 0);
    j.rightHip.rotation.set(0, 0, 0);
    j.rightKnee.rotation.set(0, 0, 0);
  }

  private animatePose(): void {
    this.resetJointRotations();
    const j = this.rig.joints;
    const t = this.animTime;

    if (this.state === 'IDLE' || this.state === 'SIDESTEP') {
      // Dynamic Tekken bouncy fighting stance!
      const bob = Math.sin(t * 7.5) * 0.04;
      j.hips.position.y = 0.96 + bob;
      j.hips.rotation.y = -0.35;
      j.chest.rotation.y = 0.15;
      j.chest.rotation.x = 0.08;
      j.head.rotation.y = 0.22;

      // Guard hands raised in rhythm
      j.leftShoulder.rotation.set(-0.75 + Math.sin(t * 7.5) * 0.08, 0.25, 0.28);
      j.leftElbow.rotation.x = -1.35;
      j.rightShoulder.rotation.set(-0.6 + Math.cos(t * 7.5) * 0.08, -0.25, -0.25);
      j.rightElbow.rotation.x = -1.45;

      // Wide martial arts stance legs
      j.leftHip.rotation.set(-0.28, 0, 0.12);
      j.leftKnee.rotation.x = 0.42;
      j.rightHip.rotation.set(0.28, 0, -0.12);
      j.rightKnee.rotation.x = 0.35;
      return;
    }

    if (this.state === 'WALK_F' || this.state === 'WALK_B') {
      const dir = this.state === 'WALK_F' ? 1 : -1;
      const cycle = t * 11 * dir;
      j.hips.position.y = 0.95 + Math.abs(Math.sin(cycle)) * 0.04;
      j.chest.rotation.x = 0.12 * dir;

      j.leftHip.rotation.x = Math.sin(cycle) * 0.55;
      j.leftKnee.rotation.x = Math.max(0, -Math.cos(cycle) * 0.65);
      j.rightHip.rotation.x = -Math.sin(cycle) * 0.55;
      j.rightKnee.rotation.x = Math.max(0, Math.cos(cycle) * 0.65);

      j.leftShoulder.rotation.set(-0.7, 0.2, 0.25);
      j.leftElbow.rotation.x = -1.3;
      j.rightShoulder.rotation.set(-0.6, -0.2, -0.25);
      j.rightElbow.rotation.x = -1.4;
      return;
    }

    if (this.state === 'CROUCH') {
      j.hips.position.y = 0.62;
      j.chest.rotation.x = 0.35;
      j.leftHip.rotation.x = -0.95;
      j.leftKnee.rotation.x = 1.65;
      j.rightHip.rotation.x = -0.85;
      j.rightKnee.rotation.x = 1.55;
      j.leftShoulder.rotation.set(-0.9, 0.3, 0.2);
      j.leftElbow.rotation.x = -1.4;
      j.rightShoulder.rotation.set(-0.8, -0.3, -0.2);
      j.rightElbow.rotation.x = -1.4;
      return;
    }

    if (this.state === 'BLOCKSTUN') {
      j.hips.position.y = this.prevInput.down ? 0.65 : 0.92;
      j.chest.rotation.x = -0.12;
      // Crossed high/tight guard
      j.leftShoulder.rotation.set(-1.15, 0.55, 0.2);
      j.leftElbow.rotation.x = -1.6;
      j.rightShoulder.rotation.set(-1.15, -0.55, -0.2);
      j.rightElbow.rotation.x = -1.6;
      j.leftHip.rotation.x = -0.3;
      j.leftKnee.rotation.x = 0.5;
      j.rightHip.rotation.x = 0.35;
      j.rightKnee.rotation.x = 0.45;
      return;
    }

    if (this.state === 'HITSTUN') {
      const recoil = Math.sin(Math.min(1, this.stateFrame / 10) * Math.PI);
      j.hips.position.y = 0.94;
      j.torso.rotation.x = -0.45 * recoil;
      j.head.rotation.x = -0.55 * recoil;
      j.leftShoulder.rotation.set(-0.3, 0, 0.7 * recoil);
      j.rightShoulder.rotation.set(-0.3, 0, -0.7 * recoil);
      return;
    }

    if (this.state === 'AIRBORNE_JUGGLE') {
      // Dramatic airborne juggle spin/flail
      j.hips.position.y = 0.9;
      j.hips.rotation.x = -1.25 + Math.sin(t * 16) * 0.25;
      if (this.tailspinUsedInCombo) {
        j.hips.rotation.z = t * 14;
      }
      j.leftShoulder.rotation.set(-1.4, 0, 0.6);
      j.rightShoulder.rotation.set(-1.4, 0, -0.6);
      j.leftHip.rotation.x = -0.6;
      j.rightHip.rotation.x = 0.3;
      return;
    }

    if (this.state === 'KNOCKDOWN' || this.state === 'DEFEATED') {
      j.hips.position.set(0, 0.24, 0);
      j.hips.rotation.x = -Math.PI / 2 + 0.08;
      j.leftShoulder.rotation.set(-0.2, 0, 0.85);
      j.rightShoulder.rotation.set(-0.2, 0, -0.85);
      j.leftHip.rotation.z = 0.2;
      j.rightHip.rotation.z = -0.2;
      return;
    }

    if (this.state === 'GETUP') {
      const p = Math.min(1, this.stateFrame / 12);
      j.hips.position.y = THREE.MathUtils.lerp(0.28, 0.96, p);
      j.hips.rotation.x = THREE.MathUtils.lerp(-1.2, 0, p);
      return;
    }

    if (this.state === 'VICTORY') {
      // Joyful charismatic victory celebration!
      const bounce = Math.abs(Math.sin(t * 6)) * 0.12;
      j.hips.position.y = 0.98 + bounce;
      j.chest.rotation.x = -0.18;
      j.leftShoulder.rotation.set(-2.6 + Math.sin(t * 8) * 0.2, 0, 0.35);
      j.leftElbow.rotation.x = -0.3;
      j.rightShoulder.rotation.set(-2.6 - Math.sin(t * 8) * 0.2, 0, -0.35);
      j.rightElbow.rotation.x = -0.3;
      return;
    }

    if (this.state === 'ATTACK' && this.currentMove) {
      const m = this.currentMove;
      const total = m.startupFrames + m.activeFrames + m.recoveryFrames;
      const activeEnd = m.startupFrames + m.activeFrames;

      // Normalized attack impact weight (0 -> 1 during startup/active, 1 -> 0 during recovery)
      let w = 0;
      if (this.moveFrame <= m.startupFrames) {
        w = this.moveFrame / Math.max(1, m.startupFrames);
      } else if (this.moveFrame <= activeEnd) {
        w = 1.0;
      } else {
        w = 1.0 - (this.moveFrame - activeEnd) / Math.max(1, m.recoveryFrames);
      }
      w = THREE.MathUtils.clamp(w, 0, 1);

      if (m.activeLimb === 'leftHand') {
        j.hips.rotation.y = 0.55 * w;
        j.chest.rotation.y = 0.45 * w;
        j.chest.rotation.x = 0.22 * w;
        j.leftShoulder.rotation.set(-1.55 * w, -0.15 * w, 0);
        j.leftElbow.rotation.x = -0.15 * (1 - w);
        j.rightShoulder.rotation.set(-0.5, -0.2, -0.3);
        j.rightElbow.rotation.x = -1.5;
      } else if (m.activeLimb === 'rightHand') {
        const isUppercut = m.launches;
        j.hips.rotation.y = -0.68 * w;
        j.chest.rotation.y = -0.55 * w;
        j.chest.rotation.x = isUppercut ? -0.28 * w : 0.28 * w;
        j.rightShoulder.rotation.set(isUppercut ? -2.25 * w : -1.62 * w, 0.18 * w, 0);
        j.rightElbow.rotation.x = isUppercut ? -0.65 * w : -0.1 * (1 - w);
        j.leftShoulder.rotation.set(-0.5, 0.2, 0.35);
        j.leftElbow.rotation.x = -1.4;
      } else if (m.activeLimb === 'bothHands') {
        // Power Crush / 56-Inch Chest Impact / Rage Art / Throw
        j.hips.position.y = 0.92;
        j.chest.rotation.x = 0.35 * w;
        j.leftShoulder.rotation.set(-1.65 * w, -0.25 * w, 0.2);
        j.rightShoulder.rotation.set(-1.65 * w, 0.25 * w, -0.2);
        j.leftElbow.rotation.x = -0.25;
        j.rightElbow.rotation.x = -0.25;
      } else if (m.activeLimb === 'leftFoot') {
        if (m.hitLevel === 'LOW') {
          // Low Sweep (d+3)
          j.hips.position.y = 0.54;
          j.hips.rotation.y = 0.75 * w;
          j.chest.rotation.x = 0.45 * w;
          j.leftHip.rotation.set(-1.15 * w, 0.3 * w, 0.25);
          j.leftKnee.rotation.x = 0.15;
          j.rightHip.rotation.x = -0.95;
          j.rightKnee.rotation.x = 1.65;
        } else {
          // Mid Side Kick (3)
          j.hips.rotation.y = 0.65 * w;
          j.chest.rotation.x = -0.28 * w;
          j.leftHip.rotation.set(-1.55 * w, 0, 0.25 * w);
          j.leftKnee.rotation.x = 0.1 * (1 - w);
        }
      } else if (m.activeLimb === 'rightFoot') {
        if (m.hitLevel === 'LOW') {
          j.hips.position.y = 0.68;
          j.rightHip.rotation.set(-1.05 * w, 0, -0.15);
          j.rightKnee.rotation.x = 0.2;
        } else {
          // High Roundhouse / Hopkick (4 / uf+4)
          j.hips.rotation.y = -0.75 * w;
          j.chest.rotation.x = -0.35 * w;
          j.rightHip.rotation.set(-1.78 * w, 0, -0.32 * w);
          j.rightKnee.rotation.x = 0.12 * (1 - w);
        }
      }

      // Spin torso on tailspin / finishing kicks
      if (m.tailspin && this.moveFrame <= activeEnd) {
        j.hips.rotation.y += (this.moveFrame / activeEnd) * Math.PI * 2;
      }

      void total;
    }
  }
}
