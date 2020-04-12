import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import EditorHeader from './EditorHeader';

test('renders a header with text', () => {
  const props = {
    saveCanvas: jest.fn(),
    unsetToken: jest.fn(),
  };
  const { getByText, getAllByRole } = render(<EditorHeader {...props} />);
  expect(getByText(/Token Editor/i)).toBeInTheDocument();

  const [backButton, saveButton] = getAllByRole('button');
  Object.values(props).forEach((fn) => {
    expect(fn).not.toHaveBeenCalled();
  });
  fireEvent.click(backButton);
  expect(props.unsetToken).toHaveBeenCalledTimes(1);

  fireEvent.click(saveButton);
  expect(props.saveCanvas).toHaveBeenCalledTimes(1);
});
