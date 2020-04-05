import React from 'react';

import Header from './features/header/Header';
import TokenGrid from './features/tokenGrid/TokenGrid';

import './App.css';
import '@rmwc/typography/styles';
import Editor from './features/editor/Editor';

const App: React.FunctionComponent<{}> = () => {
  return (
    <>
      <Header />
      <TokenGrid />
      <Editor />
    </>
  );
};

export default App;
