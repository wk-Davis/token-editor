import { ColorChangeEvent } from '../ColorPicker';

export const calculateChange = (
  e: ColorChangeEvent,
  hsl: tinycolor.ColorFormats.HSLA,
  container: HTMLDivElement
): tinycolor.ColorFormats.HSLA | null => {
  const containerWidth = container.clientWidth;
  const x = 'pageX' in e ? e.pageX : e.touches[0].pageX;
  const left =
    x - (container.getBoundingClientRect().left + window.pageXOffset);

  let h: number;
  if (left < 0) {
    h = 0;
  } else if (left > containerWidth) {
    h = 359;
  } else {
    const percent = (left * 100) / containerWidth;
    h = (360 * percent) / 100;
  }

  if (hsl.h !== h) {
    return {
      h,
      s: hsl.s,
      l: hsl.l,
      a: hsl.a,
    };
  }

  return null;
};
