import React from 'react';
import { render } from '@testing-library/react';

import InputChip from './InputChip';

jest.mock('../editor/Editor.tsx');

test('renders an input with a hex color value', () => {
  const props = {
    name: 'skin',
    stateColor: '#cccfff',
    setColor: () => {},
  };
  const { getByDisplayValue } = render(<InputChip {...props} />);
  const value = getByDisplayValue('#CCCFFF');
  expect(value).toBeInTheDocument();
});
