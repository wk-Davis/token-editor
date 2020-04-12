import React from 'react';
import { render } from '@testing-library/react';

import GridHeader from './GridHeader';

describe('GridHeader', () => {
  test('renders a header with text', () => {
    const { getByText } = render(<GridHeader />);
    expect(getByText(/Token Editor/i)).toBeInTheDocument();
  });
});
