import React from 'react';
import { render } from '@testing-library/react';

import EditorHeader from './EditorHeader';

test('renders a header with text', () => {
  const { getByText } = render(<EditorHeader />);
  const header = getByText(/Token Editor/i);
  expect(header).toBeInTheDocument();
});
