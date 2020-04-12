import React from 'react';
import { render } from '@testing-library/react';

import Grid from './Grid';
import config from '../../assets';

describe('Grid', () => {
  test('renders a list with 5 items', () => {
    const { getByAltText, getByText } = render(<Grid setToken={() => {}} />);
    expect(getByText('Select a token:')).toBeInTheDocument();
    Object.keys(config).forEach((name) => {
      expect(getByAltText(`${name} token`)).toContainHTML('img');
    });
  });
});
