export type HitLevel = 'HIGH' | 'MID' | 'LOW' | 'UNBLOCKABLE' | 'THROW';

export type FighterId = 'modi' | 'mamata' | 'rahul' | 'kejriwal';
export type StageId = 'sansad' | 'howrah' | 'primetime';
export type GameMode = 'arcade' | 'versus_cpu' | 'versus_pvp' | 'practice';
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'tekken_god';
export type DummyBehavior = 'stand' | 'crouch' | 'guard_all' | 'cpu_fight';

export interface MoveDefinition {
  id: string;
  name: string;
  battleCry?: string;      // Catchphrase shouted or shown in comic bubble!
  commandNotation: string; // e.g., "1, 2, 1" or "df+2"
  inputHint: string;       // e.g., "U, I, U" or "S+D + I"
  hitLevel: HitLevel;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  damage: number;
  chipDamage: number;
  hitStunFrames: number;
  blockStunFrames: number;
  pushbackOnHit: number;
  pushbackOnBlock: number;
  launches?: boolean;
  launchVelocityY?: number;
  launchVelocityX?: number;
  knockdown?: boolean;
  tailspin?: boolean;      // Tekken 7 "Screw / Tailspin" extender in juggle!
  homing?: boolean;        // Tracks sidestepping opponents
  powerCrush?: boolean;    // Absorbs mid/high hits during active startup
  rageArt?: boolean;       // Only usable in Rage (<25% HP)
  activeLimb: 'leftHand' | 'rightHand' | 'leftFoot' | 'rightFoot' | 'torso' | 'bothHands';
  hitboxRadius: number;
  hitboxOffsetForward: number;
  hitboxOffsetY: number;
  cancelInto?: string[];   // Moves this can chain into during hit/block window
  sfxType: 'light' | 'medium' | 'heavy' | 'electric' | 'rage' | 'throw';
  sparkColor?: number;
  forwardImpulse?: number;
  lowCrush?: boolean;      // Airborne frames avoid lows
}

export interface FighterProfile {
  id: FighterId;
  name: string;
  shortName: string;
  title: string;
  fightingStyle: string;
  origin: string;
  signatureProp: 'lotus_mic' | 'hawai_chappal' | 'muffler_broom' | 'padyatra_torch';
  catchphrases: {
    intro: string;
    win: string;
    rage: string;
    hit: string[];
  };
  memeClips: {
    select: string;
    intro: string;
    special: string;
    rage: string;
    win: string;
    hitPool: string[];
  };
  stats: {
    power: number;     // 1-10
    speed: number;     // 1-10
    range: number;     // 1-10
    drama: number;     // 1-10
  };
  colors: {
    primary: number;      // Kurta / Saree base
    secondary: number;    // Jacket / Border / Scarf
    accent: number;       // Energy / Aura
    glow: number;
    skin: number;
    hair: number;
    uiHex: string;
    uiSecondaryHex: string;
  };
  scale: {
    height: number;
    bulk: number;
  };
  damageMultiplier: number;
  speedMultiplier: number;
  description: string;
  voicePitch: number;
  voiceRate: number;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
  announcerEnabled: boolean;
  roundsToWin: number;      // 1, 2, 3
  roundTimeSeconds: number; // 30, 60, 99, 0 (infinite)
  aiDifficulty: AIDifficulty;
  graphicsQuality: 'high' | 'medium';
  showFrameData: boolean;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  up: boolean;
  down: boolean;
  sidestepUp: boolean;
  sidestepDown: boolean;
  lp: boolean;       // 1 (Left Punch)
  rp: boolean;       // 2 (Right Punch)
  lk: boolean;       // 3 (Left Kick)
  rk: boolean;       // 4 (Right Kick)
  grab: boolean;     // 1+3 / Throw
  rage: boolean;     // Rage Art / Power Crush
  block: boolean;    // Dedicated guard helper
}
