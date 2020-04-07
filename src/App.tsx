import React, { useState, Dispatch } from 'react';

import TokenGrid from './features/grid/Grid';
import Editor from './features/editor/Editor';

import './App.css';
import '@rmwc/top-app-bar/styles';
import '@rmwc/typography/styles';

const App: React.FunctionComponent<{}> = () => {
  const [selectedToken, setSelectedToken]: [
    string | null,
    Dispatch<any>
  ] = useState(null);

  return selectedToken ? (
    <Editor
      token={selectedToken}
      unsetToken={() => {
        setSelectedToken(null);
      }}
    />
  ) : (
    <TokenGrid setToken={setSelectedToken} />
  );
};

export default App;
