import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Editor from './Editor';
import config from '../../assets';
import envvars from '../../envvars';
import tinycolor from 'tinycolor2';

describe('Editor', () => {
  test('renders a list with all token components', async () => {
    const props = {
      token: 'cleric',
      unsetToken: () => {},
    };
    const { getByText, container, queryByText, getByTitle } = render(
      <Editor {...props} />
    );

    Object.keys(config.cleric).forEach((name) => {
      const delimiterIndex = name.indexOf(envvars.REACT_APP_DELIMITER ?? '_');
      const li = getByText(
        delimiterIndex >= 0 ? name.substring(delimiterIndex + 1) : name
      );
      expect(li).toContainHTML('<li');
    });

    const firstLi = queryByText(Object.keys(config.cleric)[0]);
    const children = firstLi?.children;
    const firstInput = children?.item(0);
    const testColor = tinycolor('red');

    if (firstLi && firstInput) {
      expect(firstInput).toContainHTML('input');
      expect(firstLi).not.toContainHTML('selected');
      expect(container).not.toContainHTML('picker');

      fireEvent.click(firstLi);
      expect(firstLi).toContainHTML('selected');
      expect(container).toContainHTML('picker');

      await new Promise((resolve) => setTimeout(resolve, 100));

      fireEvent.focus(firstInput);
      expect(container).not.toContainHTML('picker');

      const pickerToggle = getByTitle(/Color Picker/);

      fireEvent.change(firstInput, {
        target: { value: testColor.toHexString() },
      });
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(pickerToggle).toHaveStyle(
        `background-color: ${testColor.toRgbString()}`
      );
    }
  });
});
