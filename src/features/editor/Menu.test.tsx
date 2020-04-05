import React from 'react';
import { render } from '@testing-library/react';

import Menu from './Menu';

test('renders a list with 5 items', () => {
  const config: Config = {
    hair: '888004',
    skin: '#fff',
    clothes_bottom: '#eeefff',
    clothes_top: '#eeefff',
    shoes_body: 'eeefff',
    shoes_tongue: '345ffa',
    lineart: '#000000',
  };
  const { getAllByText, getByText } = render(<Menu />);
  Object.keys(config).forEach((name) => {
    const delimiterIndex = name.indexOf(process.env.DELIMITER ?? '_');
    const listName = getByText(
      new RegExp(
        delimiterIndex >= 0 ? name.substring(delimiterIndex + 1) : name
      )
    );
    expect(listName).toBeInTheDocument();
    const color = config[name];
    const listColor = getAllByText(new RegExp(color));
    expect(listColor).not.toHaveLength(0);
  });
});
