import React from 'react';
import { render } from '@testing-library/react';

import Canvas from './Canvas';
import { getState } from '../editor/editorUtil';

describe('Canvas', () => {
  test('renders canvas element without error', () => {
  const props = {
    state: getState('cleric'),
    saveCanvas: { current: () => {} },
    token: 'cleric',
  };
  const { container } = render(<Canvas {...props} />);
  expect(container).toContainHTML('canvas');
});
})

