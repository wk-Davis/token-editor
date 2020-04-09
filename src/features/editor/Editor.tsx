import React, {
  Context,
  Dispatch,
  MutableRefObject,
  createContext,
  useReducer,
  useRef,
} from 'react';
import { saveAs } from 'file-saver';

import Canvas from '../canvas/Canvas';
import ColorPicker from '../colorPicker/ColorPicker';
import EditorHeader from './EditorHeader';
import Menu from '../menu/Menu';
import config from '../../assets';

import './Editor.css';

interface Action {
  type: string | 'selectedComponent';
  payload: string;
}

interface State {
  token: {
    [prop: string]: {
      color: string;
      src: string;
    };
  };
  selectedComponent: string;
}

export const EditorDispatch: Context<any> = createContext(null);

const Editor: React.FunctionComponent<{
  token: string;
  unsetToken: () => void;
}> = ({ token, unsetToken }) => {
  const canvas: MutableRefObject<fabric.Canvas | null> = useRef(null);
  const initialState: State = Object.assign(
    { selectedComponent: '' },
    { token: config[token] }
  );
  const reducer = (state: State, action: Action): State => {
    if (action.type === 'selectedComponent')
      return {
        ...state,
        selectedComponent: action.payload,
      };
    return {
      ...state,
      token: {
        ...state.token,
        [action.type]: {
          ...state.token[action.type],
          color: action.payload,
        },
      },
    };
  };
  const [state, dispatch]: [State, Dispatch<any>] = useReducer(
    reducer,
    initialState
  );
  const { selectedComponent } = state;

  const selectComponent = (componentName: string) => {
    dispatch({ type: 'selectedComponent', payload: componentName });
  };

  const saveCanvas: () => void = () => {
    if (canvas.current) {
      const data = canvas.current.toDataURL({
        format: 'png',
        multiplier: 1,
        enableRetinaScaling: true,
      });
      saveAs(data, `${token}.png`);
    }
  };

  if (!token) return null;
  return (
    <EditorDispatch.Provider value={dispatch}>
      <EditorHeader saveCanvas={saveCanvas} unsetToken={unsetToken} />
      <div className='editor'>
        <div className='col-1'>
          <Canvas canvas={canvas} state={state.token} />
          {selectedComponent && (
            <ColorPicker
              color={state.token[selectedComponent].color}
              dispatch={dispatch}
              selectedComponent={selectedComponent}
            />
          )}
        </div>
        <div className='col-2'>
          <Menu
            state={state.token}
            selectComponent={selectComponent}
            selectedComponent={selectedComponent}
          />
        </div>
      </div>
    </EditorDispatch.Provider>
  );
};

export default Editor;
