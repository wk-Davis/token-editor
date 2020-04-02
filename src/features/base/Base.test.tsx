import React from 'react';
import { render } from '@testing-library/react';

import Base from './Base';

test('renders a header and children', () => {
  const { getByText } = render(
    <Base>
      <p>Test!</p>
    </Base>
  );
  const header = getByText(/Token Editor/i);
  expect(header).toBeInTheDocument();
  const children = getByText('Test!');
  expect(children).toBeInTheDocument();
});
