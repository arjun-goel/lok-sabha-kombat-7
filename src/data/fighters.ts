import { FighterId, FighterProfile, MoveDefinition, StageId } from '../types';

export const FIGHTER_PROFILES: Record<FighterId, FighterProfile> = {
  modi: {
    id: 'modi',
    name: 'NARENDRA MODI',
    shortName: 'MODI JI',
    title: '56-Inch Saffron Supreme',
    fightingStyle: 'Vikas-Ryu Karate & Teleprompter Kung-Fu',
    origin: '7 Lok Kalyan Marg Arena',
    signatureProp: 'lotus_mic',
    catchphrases: {
      intro: 'MITRON! Taiyaar ho jaiye!',
      win: 'Abki Baar — Full Knockout Sarkar!',
      rage: 'MITRON!! SURGICAL STRIKE!!',
      hit: ['MITRON!', '56 INCH!', 'VIKAS PUNCH!', 'WAH MODIJI WAH!', 'MASTERSTROKE!']
    },
    stats: { power: 10, speed: 8, range: 9, drama: 10 },
    colors: {
      primary: 0xfff8eb,     // Crisp cream kurta
      secondary: 0xff6b00,   // Iconic Saffron Nehru Jacket
      accent: 0xff8800,      // Bhagwa Golden Lightning
      glow: 0xff7700,
      skin: 0xdba379,
      hair: 0xf1f5f9,        // Snowy white beard & hair
      uiHex: '#ff7700',
      uiSecondaryHex: '#f59e0b'
    },
    scale: { height: 1.03, bulk: 1.15 },
    damageMultiplier: 1.08,
    speedMultiplier: 1.0,
    description: 'Wields the 56-Inch Chest Power Crush, Mann Ki Baat Sonic Uppercut (S+D+I), and the Golden Lotus Microphone!',
    voicePitch: 0.78,
    voiceRate: 0.92
  },
  mamata: {
    id: 'mamata',
    name: 'MAMATA BANERJEE',
    shortName: 'DIDI',
    title: 'Royal Bengal Hurricane',
    fightingStyle: 'Khela Hobe Taekwondo & Chappal-Jutsu',
    origin: 'Nabanna Howrah Rooftop',
    signatureProp: 'hawai_chappal',
    catchphrases: {
      intro: 'Ebar KHELA HOBE!! Hamba Hamba!',
      win: 'Joy Bangla! Didi ke rokte parbe na!',
      rage: 'HAMBA HAMBA! RAMBA RAMBA! KHELA HOBE!!',
      hit: ['KHELA HOBE!', 'HAMBA HAMBA!', 'CHAPPAL SHOT!', 'BAMBA BAMBA!', 'JOY BANGLA!']
    },
    stats: { power: 9, speed: 10, range: 9, drama: 10 },
    colors: {
      primary: 0xf8fafc,     // Crisp White Tant Saree
      secondary: 0x0284c7,   // Iconic Blue Border Saree trim
      accent: 0x00e5ff,      // Bengal Cyan Cyclone Energy
      glow: 0x00d4ff,
      skin: 0xe2ab84,
      hair: 0x1e293b,        // Neat dark bun
      uiHex: '#00d4ff',
      uiSecondaryHex: '#0284c7'
    },
    scale: { height: 0.96, bulk: 0.96 },
    damageMultiplier: 1.02,
    speedMultiplier: 1.12,
    description: 'Unstoppable street fighter armed with Blue-White Saree speed, Flying Hawai Chappal, and the Khela Hobe Football Bicycle Kick!',
    voicePitch: 1.32,
    voiceRate: 1.12
  },
  kejriwal: {
    id: 'kejriwal',
    name: 'ARVIND KEJRIWAL',
    shortName: 'KEJRIWAL',
    title: 'Muffler-Man Broom Master',
    fightingStyle: 'Aam Aadmi Aikido & Jhadu-jutsu',
    origin: 'ITO Dharna Flyover',
    signatureProp: 'muffler_broom',
    catchphrases: {
      intro: 'Sab mile huye hain ji! Jhadu chalega!',
      win: 'Free Bijli, Free Paani, Free Knockout Ji!',
      rage: 'MAHA DHARNA!! JHADU TORNADO JI!!',
      hit: ['MILE HUYE HAIN JI!', 'JHADU SWEEP!', 'FREE HIT JI!', 'KHOFF KHOFF!', 'AAM AADMI!']
    },
    stats: { power: 8, speed: 9, range: 10, drama: 10 },
    colors: {
      primary: 0x3b82f6,     // Oversized Blue Sweater
      secondary: 0x7f1d1d,   // Iconic Maroon Muffler + White Topi
      accent: 0xfacc15,      // Broom Gold Sparks
      glow: 0x38bdf8,
      skin: 0xd9a077,
      hair: 0x1e293b,
      uiHex: '#38bdf8',
      uiSecondaryHex: '#eab308'
    },
    scale: { height: 0.98, bulk: 0.95 },
    damageMultiplier: 1.0,
    speedMultiplier: 1.06,
    description: 'Equipped with the Legendary Winter Muffler, long-range Jhadu (Broom) Low Sweep, and Sonic Cough Wave!',
    voicePitch: 1.08,
    voiceRate: 1.05
  },
  rahul: {
    id: 'rahul',
    name: 'RAHUL GANDHI',
    shortName: 'RAUL BABA',
    title: 'Bharat Jodo Marathon Brawler',
    fightingStyle: 'Mohabbat Ki Dukaan Jiu-Jitsu',
    origin: 'Kanyakumari-to-Kashmir Highway',
    signatureProp: 'padyatra_torch',
    catchphrases: {
      intro: 'Daro Mat! Mohabbat ki Dukaan khul gayi!',
      win: 'Khatakhat! Khatakhat! Khatakhat Knockout!',
      rage: 'KHATAKHAT! KHATAKHAT! BHARAT JODO SMASH!!',
      hit: ['KHATAKHAT!', 'DARO MAT!', 'PADYATRA KICK!', 'SYSTEM HANG!', 'T-SHIRT POWER!']
    },
    stats: { power: 9, speed: 9, range: 8, drama: 9 },
    colors: {
      primary: 0xffffff,     // All-Weather White Polo T-Shirt
      secondary: 0x1e293b,   // Cargo Trousers
      accent: 0x22c55e,      // Tricolor Emerald Energy
      glow: 0x10b981,
      skin: 0xeab696,
      hair: 0x334155,        // Salt & pepper curls + beard
      uiHex: '#10b981',
      uiSecondaryHex: '#3b82f6'
    },
    scale: { height: 1.02, bulk: 1.04 },
    damageMultiplier: 1.04,
    speedMultiplier: 1.05,
    description: 'Immune to cold in his White T-Shirt! Delivers rapid Khatakhat-Khatakhat punch flurries and marathon flying knees.',
    voicePitch: 0.96,
    voiceRate: 1.04
  }
};

export interface StageMetadata {
  id: StageId;
  name: string;
  subtitle: string;
  accentColor: string;
  ambientHex: number;
  fogHex: number;
}

export const STAGES: StageMetadata[] = [
  {
    id: 'sansad',
    name: 'SANSAD AKHADA',
    subtitle: 'Grand Parliament Dome & Red Sandstone Courtyard',
    accentColor: '#ff7700',
    ambientHex: 0x2c1d14,
    fogHex: 0x140b06
  },
  {
    id: 'howrah',
    name: 'HOWRAH BRIDGE NIGHTS',
    subtitle: 'Kolkata Hooghly Riverfront & Yellow Taxi Arena',
    accentColor: '#00e5ff',
    ambientHex: 0x102338,
    fogHex: 0x060f1a
  },
  {
    id: 'primetime',
    name: '9 PM BREAKING NEWS STUDIO',
    subtitle: 'THE NATION WANTS TO KNOW — High-Decibel TV Debate Ring',
    accentColor: '#ef4444',
    ambientHex: 0x2a1225,
    fogHex: 0x0f0512
  }
];

export function createMovelistForFighter(fighterId: FighterId): Record<string, MoveDefinition> {
  const profile = FIGHTER_PROFILES[fighterId];
  const dmg = profile.damageMultiplier;
  const glow = profile.colors.glow;

  const customNames: Record<FighterId, {
    jab1: string;
    jab12: string;
    jab121: string;
    jab124: string;
    heavy2: string;
    df2: string;
    f2: string;
    low3: string;
    hop4: string;
    throwName: string;
    powerCrush: string;
    rageArt: string;
    cryDf2: string;
    cryLow: string;
    cryThrow: string;
  }> = {
    modi: {
      jab1: 'Chai-Pe-Charcha Jab',
      jab12: 'Double Engine Straight',
      jab121: 'Atmanirbhar Spinning Backfist',
      jab124: 'Digital India High Kick',
      heavy2: 'Teleprompter Check Hook',
      df2: 'MITRON! Electric Uppercut',
      f2: 'Vikas Bullet Train Lunge',
      low3: 'Demonetization Carpet Sweep',
      hop4: 'Vishwaguru Flying Kick',
      throwName: 'Bear-Hug Diplomacy Slam',
      powerCrush: '56-Inch Chest Armor Impact',
      rageArt: 'RAGE ART: Surgical Strike 56-Inch Lotus Finale',
      cryDf2: 'MITRON!!',
      cryLow: 'NOTE BANDI!',
      cryThrow: 'GALEY MILO MITRON!'
    },
    mamata: {
      jab1: 'Didi Rapid Slap',
      jab12: 'Hawai Chappal Twin Smack',
      jab121: 'Kalighat Tornado Backfist',
      jab124: 'Rosogolla High Roundhouse',
      heavy2: 'Nabanna File Smash',
      df2: 'KHELA HOBE! Sky Uppercut',
      f2: 'Royal Bengal Tiger Lunge',
      low3: 'Hamba-Hamba Ankle Sweep',
      hop4: 'Khela Hobe Bicycle Kick',
      throwName: 'Didi O Didi Wheelchair Spin Throw',
      powerCrush: 'Bomba-Bomba Street Barricade Charge',
      rageArt: 'RAGE ART: Hamba Hamba Ramba Ramba Cyclone',
      cryDf2: 'KHELA HOBE!!',
      cryLow: 'HAMBA HAMBA!',
      cryThrow: 'CHAPPAL KHAOGE?!'
    },
    kejriwal: {
      jab1: 'RTI Notice Jab',
      jab12: 'Free Wi-Fi One-Two',
      jab121: 'Swaraj Broom Spin Strike',
      jab124: 'Odd-Even High Kick',
      heavy2: 'Muffler Whip Hook',
      df2: 'Aam Aadmi Sky Broom Launcher',
      f2: 'VIP Wagon-R Dash Punch',
      low3: 'Mega Jhadu Clean-Sweep',
      hop4: 'Dharna Hopkick Launcher',
      throwName: 'Ink-Splash Grab & Toss',
      powerCrush: 'Winter Muffler Armor Shield',
      rageArt: 'RAGE ART: 300 Units Free Voltage Tornado',
      cryDf2: 'SAB MILE HUYE HAIN JI!',
      cryLow: 'JHADU CHALEGA!',
      cryThrow: 'DHARNA TIME JI!'
    },
    rahul: {
      jab1: 'Mohabbat Jab',
      jab12: 'Khatakhat Twin Punch',
      jab121: 'Bharat Jodo Corkscrew',
      jab124: 'Wayanad Hurricane Kick',
      heavy2: 'Aaloo-Sona Machine Hook',
      df2: 'KHATAKHAT! Uppercut Launcher',
      f2: 'Padyatra Sprint Haymaker',
      low3: 'Nyay Yatra Sliding Sweep',
      hop4: 'Push-Up Challenge Jump Kick',
      throwName: 'Parliament Wink & Hug Suplex',
      powerCrush: 'White T-Shirt Zero-Degree Armor',
      rageArt: 'RAGE ART: Khatakhat 8500 Megaton Barrage',
      cryDf2: 'KHATAKHAT!!',
      cryLow: 'DARO MAT!',
      cryThrow: 'JAADU KI JHAPPI!'
    }
  };

  const c = customNames[fighterId];

  return {
    // 1: Jab (Left Punch)
    jab_1: {
      id: 'jab_1',
      name: c.jab1,
      commandNotation: '1',
      inputHint: 'U (Left Punch)',
      hitLevel: 'HIGH',
      startupFrames: 10,
      activeFrames: 4,
      recoveryFrames: 14,
      damage: Math.round(9 * dmg),
      chipDamage: 1,
      hitStunFrames: 18,
      blockStunFrames: 11,
      pushbackOnHit: 0.25,
      pushbackOnBlock: 0.2,
      activeLimb: 'leftHand',
      hitboxRadius: 0.56,
      hitboxOffsetForward: 1.08,
      hitboxOffsetY: 1.48,
      cancelInto: ['jab_1_2'],
      sfxType: 'light',
      forwardImpulse: 0.16
    },
    // 1, 2: One-Two Twin Strike
    jab_1_2: {
      id: 'jab_1_2',
      name: c.jab12,
      commandNotation: '1, 2',
      inputHint: 'U, I',
      hitLevel: 'HIGH',
      startupFrames: 11,
      activeFrames: 5,
      recoveryFrames: 16,
      damage: Math.round(13 * dmg),
      chipDamage: 2,
      hitStunFrames: 20,
      blockStunFrames: 12,
      pushbackOnHit: 0.35,
      pushbackOnBlock: 0.3,
      activeLimb: 'rightHand',
      hitboxRadius: 0.6,
      hitboxOffsetForward: 1.18,
      hitboxOffsetY: 1.46,
      cancelInto: ['jab_1_2_1', 'jab_1_2_4'],
      sfxType: 'medium',
      forwardImpulse: 0.28
    },
    // 1, 2, 1: Finisher (Mid, Tailspin!)
    jab_1_2_1: {
      id: 'jab_1_2_1',
      name: c.jab121,
      commandNotation: '1, 2, 1',
      inputHint: 'U, I, U',
      hitLevel: 'MID',
      startupFrames: 15,
      activeFrames: 6,
      recoveryFrames: 20,
      damage: Math.round(20 * dmg),
      chipDamage: 4,
      hitStunFrames: 28,
      blockStunFrames: 12,
      pushbackOnHit: 0.9,
      pushbackOnBlock: 0.55,
      knockdown: true,
      tailspin: true,
      activeLimb: 'leftHand',
      hitboxRadius: 0.68,
      hitboxOffsetForward: 1.28,
      hitboxOffsetY: 1.35,
      sfxType: 'heavy',
      sparkColor: glow,
      forwardImpulse: 0.55
    },
    // 1, 2, 4: High Kick Finisher
    jab_1_2_4: {
      id: 'jab_1_2_4',
      name: c.jab124,
      commandNotation: '1, 2, 4',
      inputHint: 'U, I, P',
      hitLevel: 'HIGH',
      startupFrames: 16,
      activeFrames: 6,
      recoveryFrames: 20,
      damage: Math.round(24 * dmg),
      chipDamage: 4,
      hitStunFrames: 32,
      blockStunFrames: 14,
      pushbackOnHit: 1.3,
      pushbackOnBlock: 0.7,
      knockdown: true,
      tailspin: true,
      activeLimb: 'rightFoot',
      hitboxRadius: 0.7,
      hitboxOffsetForward: 1.35,
      hitboxOffsetY: 1.55,
      sfxType: 'heavy',
      sparkColor: glow,
      forwardImpulse: 0.45
    },
    // 2: Right Straight (Mid Check)
    heavy_2: {
      id: 'heavy_2',
      name: c.heavy2,
      commandNotation: '2',
      inputHint: 'I (Right Punch)',
      hitLevel: 'MID',
      startupFrames: 13,
      activeFrames: 5,
      recoveryFrames: 17,
      damage: Math.round(16 * dmg),
      chipDamage: 3,
      hitStunFrames: 22,
      blockStunFrames: 12,
      pushbackOnHit: 0.45,
      pushbackOnBlock: 0.35,
      activeLimb: 'rightHand',
      hitboxRadius: 0.62,
      hitboxOffsetForward: 1.2,
      hitboxOffsetY: 1.32,
      cancelInto: ['heavy_2_3'],
      sfxType: 'medium',
      forwardImpulse: 0.32
    },
    // 2, 3: Mid-Kick Followup
    heavy_2_3: {
      id: 'heavy_2_3',
      name: 'Manifesto Snap Kick',
      commandNotation: '2, 3',
      inputHint: 'I, O',
      hitLevel: 'MID',
      startupFrames: 15,
      activeFrames: 6,
      recoveryFrames: 20,
      damage: Math.round(21 * dmg),
      chipDamage: 4,
      hitStunFrames: 28,
      blockStunFrames: 11,
      pushbackOnHit: 1.1,
      pushbackOnBlock: 0.55,
      knockdown: true,
      activeLimb: 'leftFoot',
      hitboxRadius: 0.68,
      hitboxOffsetForward: 1.32,
      hitboxOffsetY: 1.25,
      sfxType: 'heavy',
      sparkColor: glow,
      forwardImpulse: 0.5
    },
    // df+2: SIGNATURE ELECTRIC LAUNCHER!
    launcher_df2: {
      id: 'launcher_df2',
      name: c.df2,
      battleCry: c.cryDf2,
      commandNotation: 'df+2',
      inputHint: 'S+D + I (Sky Launcher!)',
      hitLevel: 'MID',
      startupFrames: 14,
      activeFrames: 6,
      recoveryFrames: 21,
      damage: Math.round(23 * dmg),
      chipDamage: 5,
      hitStunFrames: 42,
      blockStunFrames: 14,
      pushbackOnHit: 0.35,
      pushbackOnBlock: 0.65,
      launches: true,
      launchVelocityY: 8.7,
      launchVelocityX: 1.65,
      activeLimb: 'rightHand',
      hitboxRadius: 0.72,
      hitboxOffsetForward: 1.25,
      hitboxOffsetY: 1.38,
      sfxType: 'electric',
      sparkColor: glow,
      forwardImpulse: 0.65
    },
    // f+2: Lunging Power Fist
    lunge_f2: {
      id: 'lunge_f2',
      name: c.f2,
      commandNotation: 'f+2',
      inputHint: 'D + I (Lunging Strike)',
      hitLevel: 'MID',
      startupFrames: 15,
      activeFrames: 6,
      recoveryFrames: 20,
      damage: Math.round(25 * dmg),
      chipDamage: 5,
      hitStunFrames: 30,
      blockStunFrames: 12,
      pushbackOnHit: 1.25,
      pushbackOnBlock: 0.65,
      knockdown: true,
      tailspin: true,
      activeLimb: 'rightHand',
      hitboxRadius: 0.7,
      hitboxOffsetForward: 1.38,
      hitboxOffsetY: 1.28,
      sfxType: 'electric',
      sparkColor: glow,
      forwardImpulse: 0.95
    },
    // 3: Left Mid Thrust Kick
    kick_3: {
      id: 'kick_3',
      name: 'Parliament Side Kick',
      commandNotation: '3',
      inputHint: 'O (Left Kick)',
      hitLevel: 'MID',
      startupFrames: 14,
      activeFrames: 5,
      recoveryFrames: 18,
      damage: Math.round(17 * dmg),
      chipDamage: 3,
      hitStunFrames: 22,
      blockStunFrames: 11,
      pushbackOnHit: 0.65,
      pushbackOnBlock: 0.45,
      activeLimb: 'leftFoot',
      hitboxRadius: 0.65,
      hitboxOffsetForward: 1.32,
      hitboxOffsetY: 1.18,
      cancelInto: ['kick_3_4'],
      sfxType: 'medium',
      forwardImpulse: 0.35
    },
    // 3, 4: Double Spin Kick
    kick_3_4: {
      id: 'kick_3_4',
      name: 'Landslide Victory Twin Kick',
      commandNotation: '3, 4',
      inputHint: 'O, P',
      hitLevel: 'MID',
      startupFrames: 16,
      activeFrames: 6,
      recoveryFrames: 21,
      damage: Math.round(23 * dmg),
      chipDamage: 4,
      hitStunFrames: 30,
      blockStunFrames: 12,
      pushbackOnHit: 1.2,
      pushbackOnBlock: 0.6,
      knockdown: true,
      tailspin: true,
      activeLimb: 'rightFoot',
      hitboxRadius: 0.7,
      hitboxOffsetForward: 1.38,
      hitboxOffsetY: 1.35,
      sfxType: 'heavy',
      sparkColor: glow,
      forwardImpulse: 0.55
    },
    // d+3: Low Sweep!
    low_d3: {
      id: 'low_d3',
      name: c.low3,
      battleCry: c.cryLow,
      commandNotation: 'd+3',
      inputHint: 'S + O (Low Sweep)',
      hitLevel: 'LOW',
      startupFrames: 15,
      activeFrames: 6,
      recoveryFrames: 21,
      damage: Math.round(18 * dmg),
      chipDamage: 0,
      hitStunFrames: 26,
      blockStunFrames: 8,
      pushbackOnHit: 0.4,
      pushbackOnBlock: 0.3,
      knockdown: true,
      activeLimb: 'leftFoot',
      hitboxRadius: 0.7,
      hitboxOffsetForward: 1.3,
      hitboxOffsetY: 0.35,
      cancelInto: ['low_d3_2'],
      sfxType: 'medium',
      sparkColor: 0xff5400,
      forwardImpulse: 0.45
    },
    // d+3, 2: Hellsweep Uppercut Followup
    low_d3_2: {
      id: 'low_d3_2',
      name: 'Majority Flip Uppercut',
      commandNotation: 'd+3, 2',
      inputHint: 'S+O, I',
      hitLevel: 'MID',
      startupFrames: 15,
      activeFrames: 6,
      recoveryFrames: 21,
      damage: Math.round(19 * dmg),
      chipDamage: 3,
      hitStunFrames: 35,
      blockStunFrames: 10,
      pushbackOnHit: 0.6,
      pushbackOnBlock: 0.5,
      launches: true,
      launchVelocityY: 7.5,
      launchVelocityX: 1.5,
      activeLimb: 'rightHand',
      hitboxRadius: 0.68,
      hitboxOffsetForward: 1.25,
      hitboxOffsetY: 1.2,
      sfxType: 'electric',
      sparkColor: glow,
      forwardImpulse: 0.5
    },
    // 4: Standing Magic 4 / Homing Roundhouse
    kick_4: {
      id: 'kick_4',
      name: 'Breaking News Roundhouse (Homing)',
      commandNotation: '4',
      inputHint: 'P (Right Kick)',
      hitLevel: 'HIGH',
      startupFrames: 13,
      activeFrames: 5,
      recoveryFrames: 18,
      damage: Math.round(20 * dmg),
      chipDamage: 3,
      hitStunFrames: 26,
      blockStunFrames: 12,
      pushbackOnHit: 0.85,
      pushbackOnBlock: 0.5,
      homing: true,
      knockdown: false,
      activeLimb: 'rightFoot',
      hitboxRadius: 0.68,
      hitboxOffsetForward: 1.34,
      hitboxOffsetY: 1.48,
      sfxType: 'heavy',
      forwardImpulse: 0.3
    },
    // uf+4 or u+4: Hopkick Launcher (Crushes Lows!)
    hopkick_uf4: {
      id: 'hopkick_uf4',
      name: c.hop4,
      battleCry: c.cryDf2,
      commandNotation: 'uf+4',
      inputHint: 'W + P (Low Crush Launcher)',
      hitLevel: 'MID',
      startupFrames: 15,
      activeFrames: 6,
      recoveryFrames: 22,
      damage: Math.round(22 * dmg),
      chipDamage: 4,
      hitStunFrames: 40,
      blockStunFrames: 11,
      pushbackOnHit: 0.4,
      pushbackOnBlock: 0.5,
      launches: true,
      launchVelocityY: 8.4,
      launchVelocityX: 1.55,
      lowCrush: true,
      activeLimb: 'rightFoot',
      hitboxRadius: 0.72,
      hitboxOffsetForward: 1.26,
      hitboxOffsetY: 1.36,
      sfxType: 'heavy',
      sparkColor: glow,
      forwardImpulse: 0.6
    },
    // d+4: Quick Low Shin Kick
    low_d4: {
      id: 'low_d4',
      name: 'Chappal Shin Tap',
      commandNotation: 'd+4',
      inputHint: 'S + P (Fast Low)',
      hitLevel: 'LOW',
      startupFrames: 12,
      activeFrames: 4,
      recoveryFrames: 16,
      damage: Math.round(12 * dmg),
      chipDamage: 0,
      hitStunFrames: 16,
      blockStunFrames: 9,
      pushbackOnHit: 0.3,
      pushbackOnBlock: 0.25,
      activeLimb: 'rightFoot',
      hitboxRadius: 0.62,
      hitboxOffsetForward: 1.24,
      hitboxOffsetY: 0.35,
      sfxType: 'light',
      forwardImpulse: 0.2
    },
    // G (1+3): Command Throw
    throw_grab: {
      id: 'throw_grab',
      name: c.throwName,
      battleCry: c.cryThrow,
      commandNotation: '1+3 (G)',
      inputHint: 'G (Unblockable Throw!)',
      hitLevel: 'THROW',
      startupFrames: 12,
      activeFrames: 5,
      recoveryFrames: 22,
      damage: Math.round(35 * dmg),
      chipDamage: 0,
      hitStunFrames: 45,
      blockStunFrames: 0,
      pushbackOnHit: 1.8,
      pushbackOnBlock: 0,
      knockdown: true,
      activeLimb: 'bothHands',
      hitboxRadius: 0.78,
      hitboxOffsetForward: 1.1,
      hitboxOffsetY: 1.28,
      sfxType: 'throw',
      sparkColor: 0xffb703,
      forwardImpulse: 0.45
    },
    // H (Power Crush when normal, RAGE ART when in Rage!)
    power_crush: {
      id: 'power_crush',
      name: c.powerCrush,
      battleCry: c.cryDf2,
      commandNotation: 'H (Armor)',
      inputHint: 'H (Armored Power Crush)',
      hitLevel: 'MID',
      startupFrames: 17,
      activeFrames: 7,
      recoveryFrames: 23,
      damage: Math.round(28 * dmg),
      chipDamage: 7,
      hitStunFrames: 36,
      blockStunFrames: 13,
      pushbackOnHit: 1.7,
      pushbackOnBlock: 0.85,
      powerCrush: true,
      knockdown: true,
      activeLimb: 'bothHands',
      hitboxRadius: 0.8,
      hitboxOffsetForward: 1.38,
      hitboxOffsetY: 1.25,
      sfxType: 'electric',
      sparkColor: 0xff0055,
      forwardImpulse: 0.9
    },
    rage_art: {
      id: 'rage_art',
      name: c.rageArt,
      battleCry: profile.catchphrases.rage,
      commandNotation: 'H (In Rage)',
      inputHint: 'H when HP < 25% (RAGE ART)',
      hitLevel: 'MID',
      startupFrames: 15,
      activeFrames: 10,
      recoveryFrames: 26,
      damage: Math.round(52 * dmg),
      chipDamage: 12,
      hitStunFrames: 60,
      blockStunFrames: 10,
      pushbackOnHit: 2.3,
      pushbackOnBlock: 1.0,
      powerCrush: true,
      rageArt: true,
      knockdown: true,
      launches: true,
      launchVelocityY: 9.6,
      launchVelocityX: 2.5,
      activeLimb: 'bothHands',
      hitboxRadius: 0.96,
      hitboxOffsetForward: 1.55,
      hitboxOffsetY: 1.25,
      sfxType: 'rage',
      sparkColor: 0xff003c,
      forwardImpulse: 1.45
    }
  };
}
