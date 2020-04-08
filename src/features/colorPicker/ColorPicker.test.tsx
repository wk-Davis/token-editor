import React from 'react';
import { render } from '@testing-library/react';

import ColorPicker from './ColorPicker';

test('renders a picker without error', () => {
  render(
    <ColorPicker color={'#cccccc'} dispatch={() => {}} selectedComponent='' />
  );
});
