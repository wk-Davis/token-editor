import React from 'react';
import { render } from '@testing-library/react';

import InputListItem from '../listItem/ListItem';

jest.mock('../editor/Editor.tsx');

test('renders a list item with an input with a hex color value', () => {
  const props = {
    color: '#cccfff',
    filename: 'skin',
    selectComponent: () => {},
    selected: true,
    setColor: () => {},
  };
  const { getByDisplayValue } = render(<InputListItem {...props} />);
  const value = getByDisplayValue('#CCCFFF');
  expect(value).toBeInTheDocument();
});
