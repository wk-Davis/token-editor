import React from 'react';

import Base from './features/base/Base';
import TokenGrid from './features/tokenGrid/TokenGrid';

import './App.css';
import '@rmwc/typography/styles';

const App: React.FunctionComponent<{}> = props => {
  return (
    <Base>
      <TokenGrid />
    </Base>
  );
};

export default App;
