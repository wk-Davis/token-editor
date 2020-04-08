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
import EditorHeader from './EditorHeader';
import Menu from '../menu/Menu';
import config from '../../assets';

import './Editor.css';

interface Action {
  type: string;
  payload: string;
}

interface State {
  [prop: string]: {
    color: string;
    src: string;
  };
}

export const EditorDispatch: Context<any> = createContext(null);

const Editor: React.FunctionComponent<{
  token: string;
  unsetToken: () => void;
}> = ({ token, unsetToken }) => {
  const canvas: MutableRefObject<fabric.Canvas | null> = useRef(null);
  const initialState: State = Object.assign({}, config[token]);
  const reducer = (state: State, action: Action): State => {
    return {
      ...state,
      [action.type]: {
        ...state[action.type],
        color: action.payload,
      },
    };
  };
  const [state, dispatch]: [State, Dispatch<any>] = useReducer(
    reducer,
    initialState
  );
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
          <Canvas canvas={canvas} state={state} />
          <div style={{ background: 'aliceblue', height: '100px' }}>
            <i>color palette placeholder</i>
          </div>
        </div>
        <div className='col-2'>
          <Menu state={state} />
        </div>
      </div>
    </EditorDispatch.Provider>
  );
};

export default Editor;
