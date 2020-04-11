import React from 'react';
import { render } from '@testing-library/react';

import Menu from './Menu';
import envvars from '../../envvars';
import { getComponentNames } from '../editor/editorUtil';

jest.mock('../editor/Editor.tsx');

test('renders a list with all token components', () => {
  const props = {
    listItems: {},
    filenames: getComponentNames('cleric'),
  };
  const { getByText } = render(<Menu {...props} />);
  const groupNames: string[] = props.filenames.reduce(
    (names: string[], name: string) => {
      const delimiterIndex = name.indexOf(envvars.REACT_APP_DELIMITER);
      if (delimiterIndex >= 0) {
        const groupName = name.substring(0, delimiterIndex);
        if (!names.includes(groupName)) names.push(groupName);
      }
      return names;
    },
    []
  );
  groupNames.forEach((name) => {
    expect(getByText(name)).toBeInTheDocument();
  });
});
