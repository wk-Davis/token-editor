export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a: number;
  source: 'rgb';
}

export const calculateChange = (
  e:
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>,
  hsl: tinycolor.ColorFormats.HSLA,
  container: HTMLDivElement
): HSLColor | null => {
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
      source: 'rgb',
    };
  }

  return null;
};
