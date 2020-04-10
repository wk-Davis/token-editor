interface HSVColor {
  h: number;
  s: number;
  v: number;
  a: number;
  source: 'rgb';
}

export const calculateChange = (
  e:
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>,
  hsl: tinycolor.ColorFormats.HSLA,
  container: HTMLDivElement
): HSVColor => {
  const {
    width: containerWidth,
    height: containerHeight,
  } = container.getBoundingClientRect();
  const [x, y] =
    'pageY' in e
      ? [e.pageX, e.pageY]
      : [e.touches[0].pageX, e.touches[0].pageY];
  let left: number =
    x - (container.getBoundingClientRect().left + window.pageXOffset);
  let top: number =
    y - (container.getBoundingClientRect().top + window.pageYOffset);

  if (left < 0) {
    left = 0;
  } else if (left > containerWidth) {
    left = containerWidth;
  }

  if (top < 0) {
    top = 0;
  } else if (top > containerHeight) {
    top = containerHeight;
  }

  const saturation = left / containerWidth;
  const bright = 1 - top / containerHeight;

  return {
    h: hsl.h,
    s: saturation,
    v: bright,
    a: hsl.a,
    source: 'rgb',
  };
};
