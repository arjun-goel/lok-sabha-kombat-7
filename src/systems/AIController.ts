import { AIDifficulty, DummyBehavior, InputState } from '../types';
import { Fighter } from '../entities/Fighter';

export class AIController {
  private decisionCooldown = 0;
  private activePlan:
    | 'IDLE'
    | 'APPROACH'
    | 'RETREAT_GUARD'
    | 'LOW_GUARD'
    | 'STRING_121'
    | 'LAUNCHER_DF2'
    | 'LOW_SWEEP'
    | 'HOPKICK'
    | 'THROW'
    | 'POWER_CRUSH'
    | 'SIGNATURE_SPECIAL'
    | 'JUGGLE_FOLLOWUP'
    | 'SIDESTEP' = 'IDLE';
  private planTicksRemaining = 0;
  private pulseToggle = false;

  public computeInput(
    self: Fighter,
    opponent: Fighter,
    difficulty: AIDifficulty,
    isPractice: boolean,
    dummyBehavior: DummyBehavior
  ): InputState {
    const empty: InputState = {
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

    if (isPractice && dummyBehavior !== 'cpu_fight') {
      if (dummyBehavior === 'crouch') {
        empty.down = true;
      } else if (dummyBehavior === 'guard_all') {
        const oppMove = opponent.currentMove;
        if (opponent.state === 'ATTACK' && oppMove?.hitLevel === 'LOW') {
          empty.down = true;
          empty.backward = true;
          empty.block = true;
        } else {
          empty.backward = true;
          empty.block = true;
        }
      }
      return empty;
    }

    this.pulseToggle = !this.pulseToggle;
    const dist = Math.abs(self.position.x - opponent.position.x);

    // If opponent is airborne in juggle range, follow up with a juggle combo!
    if (opponent.state === 'AIRBORNE_JUGGLE' && dist < 2.2) {
      if (dist > 1.35) {
        empty.forward = true;
      }
      if (this.pulseToggle) {
        if (!opponent.tailspinUsedInCombo && opponent.juggleHitsCount >= 1) {
          empty.forward = true;
          empty.rp = true; // f+2 tailspin
        } else {
          empty.lp = true;
          empty.rp = true;
        }
      }
      return empty;
    }

    // Defensive reaction to incoming attacks based on difficulty
    const blockChance =
      difficulty === 'easy' ? 0.18 : difficulty === 'medium' ? 0.48 : difficulty === 'hard' ? 0.74 : 0.92;

    if (opponent.state === 'ATTACK' && dist < 2.1 && this.planTicksRemaining <= 2) {
      if (Math.random() < blockChance) {
        const isLow = opponent.currentMove?.hitLevel === 'LOW';
        if (isLow) {
          empty.down = true;
          empty.backward = true;
          empty.block = true;
        } else {
          empty.backward = true;
          empty.block = true;
        }
        return empty;
      }
    }

    if (this.planTicksRemaining > 0) {
      this.planTicksRemaining--;
    } else {
      this.chooseNewPlan(self, opponent, dist, difficulty);
    }

    switch (this.activePlan) {
      case 'APPROACH':
        empty.forward = true;
        break;
      case 'RETREAT_GUARD':
        empty.backward = true;
        empty.block = true;
        break;
      case 'LOW_GUARD':
        empty.down = true;
        empty.backward = true;
        empty.block = true;
        break;
      case 'SIDESTEP':
        empty.sidestepUp = this.planTicksRemaining === 7;
        break;
      case 'STRING_121':
        if (this.planTicksRemaining === 18) empty.lp = true;
        if (this.planTicksRemaining === 10) empty.rp = true;
        if (this.planTicksRemaining === 2) empty.lp = true;
        break;
      case 'LAUNCHER_DF2':
        empty.down = true;
        empty.forward = true;
        if (this.planTicksRemaining === 4) empty.rp = true;
        break;
      case 'LOW_SWEEP':
        empty.down = true;
        if (this.planTicksRemaining === 8) empty.lk = true;
        if (this.planTicksRemaining === 1) empty.rp = true;
        break;
      case 'HOPKICK':
        empty.up = true;
        if (this.planTicksRemaining === 4) empty.rk = true;
        break;
      case 'THROW':
        empty.forward = true;
        if (this.planTicksRemaining === 3) empty.grab = true;
        break;
      case 'POWER_CRUSH':
        if (this.planTicksRemaining === 3) empty.rage = true;
        break;
      case 'SIGNATURE_SPECIAL':
        if (this.planTicksRemaining === 3) empty.special = true;
        break;
    }

    return empty;
  }

  private chooseNewPlan(self: Fighter, opponent: Fighter, dist: number, difficulty: AIDifficulty): void {
    const aggression =
      difficulty === 'easy' ? 0.35 : difficulty === 'medium' ? 0.6 : difficulty === 'hard' ? 0.8 : 0.94;

    if (dist > 2.15) {
      this.activePlan = Math.random() < 0.82 ? 'APPROACH' : 'SIDESTEP';
      this.planTicksRemaining = 12;
      return;
    }

    if (Math.random() > aggression) {
      this.activePlan = Math.random() < 0.7 ? 'RETREAT_GUARD' : 'IDLE';
      this.planTicksRemaining = 10;
      return;
    }

    // Use Rage Art when in Rage!
    if (self.isRage && dist < 1.85 && Math.random() < 0.55) {
      this.activePlan = 'POWER_CRUSH';
      this.planTicksRemaining = 5;
      return;
    }

    const roll = Math.random();
    if (roll < 0.25) {
      this.activePlan = 'STRING_121';
      this.planTicksRemaining = 20;
    } else if (roll < 0.44) {
      this.activePlan = 'LAUNCHER_DF2';
      this.planTicksRemaining = 6;
    } else if (roll < 0.60) {
      this.activePlan = 'LOW_SWEEP';
      this.planTicksRemaining = 10;
    } else if (roll < 0.74) {
      this.activePlan = 'HOPKICK';
      this.planTicksRemaining = 6;
    } else if (roll < 0.86) {
      this.activePlan = 'SIGNATURE_SPECIAL';
      this.planTicksRemaining = 6;
    } else if (roll < 0.94 && dist < 1.35) {
      this.activePlan = 'THROW';
      this.planTicksRemaining = 5;
    } else {
      this.activePlan = 'POWER_CRUSH';
      this.planTicksRemaining = 5;
    }

    void opponent;
    void this.decisionCooldown;
  }
}
