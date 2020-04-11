import React, { Dispatch, MutableRefObject, useRef, useState } from 'react';

import Canvas from '../canvas/Canvas';
import ColorPicker from '../colorPicker/ColorPicker';
import EditorHeader from './EditorHeader';
import Menu from '../menu/Menu';
import { TokenState, getState, useDebouncedCallback } from './editorUtil';

import './Editor.css';

interface Props {
  token: string;
  unsetToken: () => void;
}

const Editor: React.FunctionComponent<Props> = ({ token, unsetToken }) => {
  const saveCanvas: MutableRefObject<(() => void) | null> = useRef(null);
  const [selectedComponent, selectComponent]: [
    string | null,
    Dispatch<any>
  ] = useState(null);
  const [tokenState, setTokenState]: [TokenState, Dispatch<any>] = useState(
    getState(token)
  );
  const setColor = useDebouncedCallback((color) => {
    if (selectedComponent)
      setTokenState((prevState: TokenState) => ({
        ...prevState,
        [selectedComponent]: color,
      }));
  });

  if (!token) return null;
  return (
    <>
      <EditorHeader
        saveCanvas={saveCanvas.current as () => void}
        unsetToken={unsetToken}
      />
      <div className='editor'>
        <div className='col-1'>
          <Canvas saveCanvas={saveCanvas} state={tokenState} token={token} />
          {selectedComponent && (
            <ColorPicker
              color={tokenState[selectedComponent]}
              setColor={setColor}
            />
          )}
        </div>
        <div className='col-2'>
          <Menu
            state={tokenState}
            selectComponent={selectComponent}
            selectedComponent={selectedComponent}
            setColor={setColor}
          />
        </div>
      </div>
    </>
  );
};

export default Editor;
