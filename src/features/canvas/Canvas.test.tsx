import React from 'react';
import { render } from '@testing-library/react';

import Canvas from './Canvas';
import config from '../../assets';

test('renders without error', () => {
  render(<Canvas state={config.cleric} />);
});
