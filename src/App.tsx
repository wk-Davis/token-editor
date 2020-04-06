import React, { useState, Dispatch } from 'react';

import Header from './features/header/Header';
import TokenGrid from './features/tokenGrid/TokenGrid';

import Editor from './features/editor/Editor';

import './App.css';
import '@rmwc/typography/styles';

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
      {selectedToken ? (
        <Editor token={selectedToken} />
      ) : (
        <TokenGrid setToken={setSelectedToken} />
      )}
    </>
  );
};

export default App;
