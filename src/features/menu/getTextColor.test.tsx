import getTextColor from './getTextColor';

type Expected = 'white' | 'black';

test('getTextColor()', () => {
  const tests: Array<[string, Expected]> = [
    ['#FFFFFF', 'black'],
    ['#C0C0C0', 'black'],
    ['#808080', 'black'],
    ['000000', 'white'],
    ['FF0000', 'white'],
    ['800000', 'white'],
    ['FFFF00', 'black'],
    ['808000', 'white'],
    ['#00FF00', 'black'],
    ['#008000', 'white'],
    ['#00FFFF', 'black'],
    ['#008080', 'white'],
    ['#0000FF', 'white'],
    ['#000080', 'white'],
    ['#FF00FF', 'white'],
    ['#800080', 'white'],
  ];

  tests.forEach(([hex, expected]) => {
    const res = getTextColor(hex);
    expect(res, hex).toEqual(expected);
  });
});
