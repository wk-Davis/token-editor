/* global test, expect, describe */

import color from './colorUtil';

describe('helpers/color', () => {
  describe('simpleCheckForValidColor', () => {
    test('throws on null', () => {
      const data = null;
      expect(() => color.simpleCheckForValidColor(data)).toThrowError(
        TypeError
      );
    });

    test('throws on undefined', () => {
      const data = undefined;
      expect(() => color.simpleCheckForValidColor(data)).toThrowError(
        TypeError
      );
    });

    test('no-op on number', () => {
      const data = 255;
      expect(color.simpleCheckForValidColor(data)).toEqual(data);
    });

    test('no-op on NaN', () => {
      const data = NaN;
      expect(isNaN(color.simpleCheckForValidColor(data))).toBeTruthy();
    });

    test('no-op on string', () => {
      const data = 'ffffff';
      expect(color.simpleCheckForValidColor(data)).toEqual(data);
    });

    test('no-op on array', () => {
      const data = [];
      expect(color.simpleCheckForValidColor(data)).toEqual(data);
    });

    test('no-op on rgb objects with numeric keys', () => {
      const data = { r: 0, g: 0, b: 0 };
      expect(color.simpleCheckForValidColor(data)).toEqual(data);
    });

    test('no-op on an object with an r g b a h s v key mapped to a NaN value', () => {
      const data = { r: NaN };
      expect(color.simpleCheckForValidColor(data)).toEqual(data);
    });

    test('no-op on hsl "s" percentage', () => {
      const data = { s: '15%' };
      expect(color.simpleCheckForValidColor(data)).toEqual(data);
    });

    test('no-op on hsl "l" percentage', () => {
      const data = { l: '100%' };
      expect(color.simpleCheckForValidColor(data)).toEqual(data);
    });

    test('should return false for invalid percentage', () => {
      const data = { l: '100%2' };
      expect(color.simpleCheckForValidColor(data)).toBe(false);
    });
  });

  describe('toState', () => {
    test('returns an object giving a color in all formats', () => {
      expect(color.toState('red')).toEqual({
        hsl: { a: 1, h: 0, l: 0.5, s: 1 },
        hex: '#ff0000',
        hsv: { h: 0, s: 1, v: 1, a: 1 },
        oldHue: 0,
      });
    });

    test('gives hex color with leading hash', () => {
      expect(color.toState('blue').hex).toEqual('#0000ff');
    });

    test("doesn't mutate hsl color object", () => {
      const originalData = { h: 0, s: 0, l: 0, a: 1 };
      const data = Object.assign({}, originalData);
      color.toState(data);
      expect(data).toEqual(originalData);
    });

    test("doesn't mutate hsv color object", () => {
      const originalData = { h: 0, s: 0, v: 0, a: 1 };
      const data = Object.assign({}, originalData);
      color.toState(data);
      expect(data).toEqual(originalData);
    });
  });
});
