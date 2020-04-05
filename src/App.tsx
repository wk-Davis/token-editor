import React from 'react';

import Header from './features/header/Header';
import TokenGrid from './features/tokenGrid/TokenGrid';

import './App.css';
import '@rmwc/typography/styles';

const App: React.FunctionComponent<{}> = () => {
  return (
    <>
      <Header />
      <TokenGrid />
    </>
  );
};

export default App;
