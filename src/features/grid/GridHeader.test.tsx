import React from 'react';
import { render } from '@testing-library/react';

import GridHeader from './GridHeader';

test('renders a header with text', () => {
  const { getByText } = render(<GridHeader />);
  const header = getByText(/Token Editor/i);
  expect(header).toBeInTheDocument();
});
