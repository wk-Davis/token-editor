import React, { useState, Dispatch } from 'react';

import Header from './features/header/Header';
import TokenGrid from './features/tokenGrid/TokenGrid';

import './App.css';
import '@rmwc/typography/styles';
import Editor from './features/editor/Editor';

const App: React.FunctionComponent<{}> = () => {
  const [selectedToken, setSelectedToken]: [
    string | null,
    Dispatch<any>
  ] = useState(null);

  return (
    <>
      <Header
        showBack={!!selectedToken}
        unsetToken={() => setSelectedToken(null)}
      />
      {selectedToken ? <Editor /> : <TokenGrid setToken={setSelectedToken} />}
    </>
  );
};

export default App;
