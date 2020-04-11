import React, { useState, Dispatch } from 'react';

import Editor from './features/editor/Editor';
import TokenGrid from './features/grid/Grid';

import './App.css';
import '@rmwc/top-app-bar/styles';
import '@rmwc/typography/styles';
import '@rmwc/list/styles';

const App: React.FunctionComponent<{}> = () => {
  const [selectedToken, setSelectedToken]: [
    string | null,
    Dispatch<any>
  ] = useState(null);

  return (
    <div className='app'>
      {selectedToken ? (
        <Editor
          token={selectedToken}
          unsetToken={() => {
            setSelectedToken(null);
          }}
        />
      ) : (
        <TokenGrid setToken={setSelectedToken} />
      )}
    </div>
  );
};

export default App;
