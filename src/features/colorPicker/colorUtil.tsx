import tinycolor from 'tinycolor2';
import { PickerColor } from './ColorPicker';

export const simpleCheckForValidColor = (data: any) => {
  const keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'l', 'v'];
  let checked = 0;
  let passed = 0;
  keysToCheck.forEach((letter) => {
    if (data[letter]) {
      checked += 1;
      if (!isNaN(data[letter])) {
        passed += 1;
      }
      if (letter === 's' || letter === 'l') {
        const percentExpr = /^\d+%$/;
        if (percentExpr.test(data[letter])) {
          passed += 1;
        }
      }
    }
  });
  return checked === passed ? data : false;
};

export const toState = (data: any, oldHue?: number): PickerColor => {
  const color =
    typeof data !== 'string' && 'hex' in data
      ? tinycolor(data.hex)
      : tinycolor(data);
  const hsl = color.toHsl();
  const hsv = color.toHsv();
  const rgb = color.toRgb();
  const hex = color.toHex();
  if (hsl.s === 0) {
    hsl.h = oldHue || 0;
    hsv.h = oldHue || 0;
  }
  const transparent = hex === '000000' && rgb.a === 0;

  return {
    hsl,
    hex: transparent ? 'transparent' : `#${hex}`,
    hsv,
    oldHue: data.h || oldHue || hsl.h,
  };
};

export default {
  simpleCheckForValidColor,
  toState,
};
