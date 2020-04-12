import React from 'react';
import tinycolor from 'tinycolor2';
import { fireEvent, render } from '@testing-library/react';

import InputListItem from '../listItem/ListItem';
import envvars from '../../envvars';

describe('InputListItem', () => {
  test('renders a list item with an input and a hex color value', () => {
    const props = {
      color: '#cccfff',
      filename: 'clothes_top',
      selectComponent: jest.fn(),
      selected: true,
      setColor: jest.fn(),
      setPickerOpen: jest.fn(),
    };
    const testColor = tinycolor('#EEEEEE');
    const { getByText, getByRole } = render(<InputListItem {...props} />);
    const li = getByText(
      props.filename.substring(
        props.filename.indexOf(envvars.REACT_APP_DELIMITER) + 1
      )
    );
    expect(li).toContainHTML('li');
    expect(li).toContainHTML('selected');

    fireEvent.click(li);
    expect(props.selectComponent).toHaveBeenCalledTimes(1);
    expect(props.setColor).not.toHaveBeenCalled();
    expect(props.setPickerOpen).toHaveBeenLastCalledWith(true);

    const input = getByRole('textbox');
    expect(input).toHaveStyle(
      `background-color: ${tinycolor(props.color).toRgbString()}`
    );

    fireEvent.focus(input);
    expect(props.selectComponent).toHaveBeenCalledTimes(2);
    expect(props.setColor).not.toHaveBeenCalled();
    expect(props.setPickerOpen).toHaveBeenLastCalledWith(false);

    fireEvent.change(input, { target: { value: testColor.toHex() } });
    expect(input).toHaveStyle(`background-color: ${testColor.toRgbString()}`);
    expect(props.setColor).toHaveBeenCalled();
  });
});
