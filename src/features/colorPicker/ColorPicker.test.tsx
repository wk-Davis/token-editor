import React from 'react';
import { render } from '@testing-library/react';

import ColorPicker from './ColorPicker';
import tinycolor from 'tinycolor2';

test('renders a picker without error', () => {
  const initColor = tinycolor('#cccccc');
  const props = {
    color: initColor.toHexString(),
    pickerOpen: true,
    setColor: () => {},
    setPickerOpen: () => {},
  };
  const { getByRole } = render(<ColorPicker {...props} />);
  const button = getByRole('button');
  expect(button).toHaveStyle(`background-color: ${initColor.toRgbString()}`);
});
