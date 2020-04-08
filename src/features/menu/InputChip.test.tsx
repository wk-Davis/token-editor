import React from 'react';
import { render } from '@testing-library/react';

import InputChip from './InputChip';

jest.mock('../editor/Editor.tsx');

test('renders an input with a hex color value', () => {
  const { getByDisplayValue } = render(
    <InputChip name='skin' stateValue='#CCCCff' />
  );
  const value = getByDisplayValue('#CCCCFF');
  expect(value).toBeInTheDocument();
});
