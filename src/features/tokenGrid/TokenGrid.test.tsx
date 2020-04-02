import React from 'react';
import { render } from '@testing-library/react';

import TokenGrid from './TokenGrid';
import { refs } from '../../assets';

test('renders a list with 5 items', () => {
  const { getByAltText } = render(<TokenGrid />);
  refs.forEach(({ src, ref }) => {
    const item = getByAltText(`${ref} token`);
    expect(item).toBeInTheDocument();
  });
});
