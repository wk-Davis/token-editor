import React from 'react';
import { render } from '@testing-library/react';

import Menu from './Menu';
import config from '../../assets';
import envvars from '../../envvars';
import { getState } from '../editor/editorUtil';

jest.mock('../editor/Editor.tsx');

test('renders a list with all token components', () => {
  const props = {
    selectComponent: () => {},
    selectedComponent: null,
    setColor: () => {},
    state: getState('cleric'),
  };
  const { getByText } = render(<Menu {...props} />);
  Object.keys(config.cleric).forEach((name) => {
    const delimiterIndex = name.indexOf(envvars.REACT_APP_DELIMITER ?? '_');
    const listName = getByText(
      new RegExp(
        delimiterIndex >= 0 ? name.substring(delimiterIndex + 1) : name
      )
    );
    expect(listName).toBeInTheDocument();
  });
});
