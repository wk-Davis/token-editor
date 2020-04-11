import React, { Dispatch, MutableRefObject, useRef, useState } from 'react';

import Canvas from '../canvas/Canvas';
import ColorPicker from '../colorPicker/ColorPicker';
import EditorHeader from './EditorHeader';
import Menu from '../menu/Menu';
import {
  TokenState,
  getComponentNames,
  getState,
  useDebouncedCallback,
  useThrottledCallback,
} from './editorUtil';

import './Editor.css';
import InputListItem from '../listItem/ListItem';

interface Props {
  token: string;
  unsetToken: () => void;
}

export interface ListItemsIndex {
  [filename: string]: JSX.Element;
}

const Editor: React.FunctionComponent<Props> = ({ token, unsetToken }) => {
  const saveCanvas: MutableRefObject<(() => void) | null> = useRef(null);
  const [selectedComponent, selectComponent]: [
    string | null,
    Dispatch<any>
  ] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
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
  // This is throttled so the input list items can control picker/keyboard visibility
  const setOpen = useThrottledCallback((isOpen: boolean) =>
    setPickerOpen(isOpen)
  );

  if (!token) return null;

  const componentNames = getComponentNames(token);
  const listItems: ListItemsIndex = componentNames.reduce(
    (items: ListItemsIndex, name) => {
      items[name] = (
        <InputListItem
          color={tokenState[name]}
          filename={name}
          selectComponent={() => selectComponent(name)}
          selected={selectedComponent === name}
          setColor={setColor}
          setPickerOpen={setOpen}
        />
      );
      return items;
    },
    {}
  );
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
              pickerOpen={pickerOpen}
              setColor={setColor}
              setPickerOpen={setOpen}
            />
          )}
        </div>
        <div className='col-2'>
          {componentNames && (
            <Menu listItems={listItems} filenames={componentNames} />
          )}
        </div>
      </div>
    </>
  );
};

export default Editor;
