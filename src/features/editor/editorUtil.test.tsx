import { getState, getSources } from './editorUtil';
import config from '../../assets';
import envvars from '../../envvars';

describe('getState()', () => {
  test('returns colors indexed by filename', () => {
    const res = getState('cleric');
    Object.keys(config.cleric).forEach((name) => {
      if (name === envvars.REACT_APP_BASE)
        expect(res).toHaveProperty(name, '#000000');
      else expect(res).toHaveProperty(name, '#EEEEEE');
    });
  });
});

describe('getSources()', () => {
  test('returns source paths indexed by filename', () => {
    const res = getSources('cleric');
    Object.keys(config.cleric).forEach((name) => {
      expect(res).toHaveProperty(name, config.cleric[name].src);
    });
  });
});
