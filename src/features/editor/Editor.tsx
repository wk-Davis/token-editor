import React, { Dispatch, useReducer } from 'react';

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

interface Props {
  token: string;
}

const Editor: React.FunctionComponent<Props> = ({ token }) => {
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
    <div className="editor">
      <div className='col-1'>
        <Canvas state={state} />
        <div style={{ background: 'aliceblue', height: '100px' }}>
          <i>color palette placeholder</i>
        </div>
      </div>
      <div className='col-2'>
        <Menu dispatch={dispatch} state={state} />
      </div>
    </div>
  );
};

export default Editor;
