import React, { Dispatch, useReducer } from 'react';

import Menu from './Menu';
import config from '../../assets';

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
    <div>
      {/* Canvas */}
      <Menu dispatch={dispatch} state={state} />
    </div>
  );
};

export default Editor;
