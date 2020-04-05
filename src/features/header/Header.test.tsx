import React from 'react';
import { render } from '@testing-library/react';

import Header from './Header';

test('renders a header with text', () => {
  const { getByText } = render(<Header />);
  const header = getByText(/Token Editor/i);
  expect(header).toBeInTheDocument();
});
