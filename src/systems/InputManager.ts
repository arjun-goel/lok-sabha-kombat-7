import { InputState } from '../types';

export class InputManager {
  private keysDown = new Set<string>();
  private virtualInputs: Record<string, boolean> = {};
  private macroQueue: { inputs: Partial<Record<string, boolean>>; frames: number }[] = [];

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
          e.preventDefault();
        }
      }
      this.keysDown.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.virtualInputs = {};
      this.macroQueue = [];
    });
  }

  public setVirtualButton(btn: string, pressed: boolean): void {
    this.virtualInputs[btn] = pressed;
  }

  public clearAllVirtualDirections(): void {
    this.virtualInputs['left'] = false;
    this.virtualInputs['right'] = false;
    this.virtualInputs['up'] = false;
    this.virtualInputs['down'] = false;
  }

  /**
   * Triggers a 1-tap mobile/PC special combo macro (e.g. Signature Special, Sky Launcher, Low Sweep, Hopkick, 3-Hit Combo)
   */
  public triggerMobileMacro(
    macroType: 'signature_special' | 'launcher_df2' | 'low_d3' | 'hopkick_uf4' | 'combo_121'
  ): void {
    if (macroType === 'signature_special') {
      this.macroQueue = [{ inputs: { special: true }, frames: 4 }];
    } else if (macroType === 'launcher_df2') {
      this.macroQueue = [
        { inputs: { down: true, forward: true }, frames: 2 },
        { inputs: { down: true, forward: true, rp: true }, frames: 4 }
      ];
    } else if (macroType === 'low_d3') {
      this.macroQueue = [
        { inputs: { down: true }, frames: 2 },
        { inputs: { down: true, lk: true }, frames: 4 }
      ];
    } else if (macroType === 'hopkick_uf4') {
      this.macroQueue = [
        { inputs: { up: true, forward: true }, frames: 2 },
        { inputs: { up: true, forward: true, rk: true }, frames: 4 }
      ];
    } else if (macroType === 'combo_121') {
      this.macroQueue = [
        { inputs: { lp: true }, frames: 3 },
        { inputs: {}, frames: 6 },
        { inputs: { rp: true }, frames: 3 },
        { inputs: {}, frames: 8 },
        { inputs: { lp: true }, frames: 3 }
      ];
    }
  }

  public getPlayer1Input(facingSign: 1 | -1): InputState {
    let macroState: Partial<Record<string, boolean>> = {};
    if (this.macroQueue.length > 0) {
      const current = this.macroQueue[0];
      macroState = current.inputs;
      current.frames--;
      if (current.frames <= 0) {
        this.macroQueue.shift();
      }
    }

    const left = this.keysDown.has('KeyA') || !!this.virtualInputs['left'];
    const right = this.keysDown.has('KeyD') || !!this.virtualInputs['right'];
    const up = this.keysDown.has('KeyW') || !!this.virtualInputs['up'] || !!macroState['up'];
    const down = this.keysDown.has('KeyS') || !!this.virtualInputs['down'] || !!macroState['down'];

    const forward = (facingSign === 1 ? right : left) || !!macroState['forward'];
    const backward = (facingSign === 1 ? left : right) || !!macroState['backward'];

    return {
      forward,
      backward,
      up,
      down,
      sidestepUp: this.keysDown.has('KeyQ') || !!this.virtualInputs['ssUp'],
      sidestepDown: this.keysDown.has('KeyZ') || this.keysDown.has('KeyC') || !!this.virtualInputs['ssDown'],
      lp:
        this.keysDown.has('KeyJ') ||
        this.keysDown.has('KeyU') ||
        this.keysDown.has('Digit1') ||
        !!this.virtualInputs['lp'] ||
        !!macroState['lp'],
      rp:
        this.keysDown.has('KeyK') ||
        this.keysDown.has('KeyI') ||
        this.keysDown.has('Digit2') ||
        !!this.virtualInputs['rp'] ||
        !!macroState['rp'],
      lk:
        this.keysDown.has('KeyL') ||
        this.keysDown.has('KeyO') ||
        this.keysDown.has('Digit3') ||
        !!this.virtualInputs['lk'] ||
        !!macroState['lk'],
      rk:
        this.keysDown.has('Semicolon') ||
        this.keysDown.has('KeyP') ||
        this.keysDown.has('Digit4') ||
        !!this.virtualInputs['rk'] ||
        !!macroState['rk'],
      special:
        this.keysDown.has('KeyE') ||
        this.keysDown.has('KeyF') ||
        this.keysDown.has('Digit5') ||
        !!this.virtualInputs['special'] ||
        !!macroState['special'],
      grab: this.keysDown.has('KeyG') || this.keysDown.has('KeyR') || !!this.virtualInputs['grab'],
      rage: this.keysDown.has('KeyH') || this.keysDown.has('Space') || !!this.virtualInputs['rage'],
      block: this.keysDown.has('ShiftLeft') || !!this.virtualInputs['block']
    };
  }

  public getPlayer2Input(facingSign: 1 | -1): InputState {
    const left = this.keysDown.has('ArrowLeft');
    const right = this.keysDown.has('ArrowRight');
    const up = this.keysDown.has('ArrowUp');
    const down = this.keysDown.has('ArrowDown');

    const forward = facingSign === 1 ? right : left;
    const backward = facingSign === 1 ? left : right;

    return {
      forward,
      backward,
      up,
      down,
      sidestepUp: this.keysDown.has('Numpad7'),
      sidestepDown: this.keysDown.has('Numpad9'),
      lp: this.keysDown.has('Numpad4') || this.keysDown.has('Digit7'),
      rp: this.keysDown.has('Numpad5') || this.keysDown.has('Digit8'),
      lk: this.keysDown.has('Numpad1') || this.keysDown.has('Digit9'),
      rk: this.keysDown.has('Numpad2') || this.keysDown.has('Digit0'),
      special: this.keysDown.has('Numpad0') || this.keysDown.has('Enter'),
      grab: this.keysDown.has('Numpad6') || this.keysDown.has('Minus'),
      rage: this.keysDown.has('Numpad3') || this.keysDown.has('Equal'),
      block: this.keysDown.has('ShiftRight')
    };
  }
}
