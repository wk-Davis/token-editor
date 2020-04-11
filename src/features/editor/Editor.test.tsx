import React from 'react';
import { render } from '@testing-library/react';

import Editor from './Editor';
import config from '../../assets';
import envvars from '../../envvars';

test('renders a list with all token components', () => {
  const props = {
    token: 'cleric',
    unsetToken: () => {},
  };
  const { getByText } = render(<Editor {...props} />);
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
