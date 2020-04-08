import React, { Context, Dispatch, createContext, useReducer } from 'react';

import Canvas from '../canvas/Canvas';
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

const Editor: React.FunctionComponent<{ token: string }> = ({ token }) => {
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
  if (!token) return null;
  return (
    <EditorDispatch.Provider value={dispatch}>
      <div className='editor'>
        <div className='col-1'>
          <Canvas state={state} />
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
