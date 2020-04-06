import React from 'react';
import { render } from '@testing-library/react';

import TokenGrid from './TokenGrid';
import config from '../../assets';

test('renders a list with 5 items', () => {
  const { getByAltText } = render(<TokenGrid />);
  Object.keys(config).forEach((name) => {
    const item = getByAltText(`${name} token`);
    expect(item).toBeInTheDocument();
  });
});
