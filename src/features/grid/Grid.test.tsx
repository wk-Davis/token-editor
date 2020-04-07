import React from 'react';
import { render } from '@testing-library/react';

import Grid from './Grid';
import config from '../../assets';

test('renders a list with 5 items', () => {
  const { getByAltText } = render(<Grid setToken={() => {}} />);
  Object.keys(config).forEach((name) => {
    const item = getByAltText(`${name} token`);
    expect(item).toBeInTheDocument();
  });
});
