import React, { Dispatch, useReducer } from 'react';
import { Grid, GridCell } from '@rmwc/grid';

import Canvas from './Canvas';
import Menu from './Menu';
import config from '../../assets';

import '@rmwc/grid/styles';

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
  const sizeAttr = { desktop: 6, tablet: 4, phone: 4 };
  return (
    <Grid>
      <GridCell className='center' {...sizeAttr}>
        <Canvas state={state} />
      </GridCell>
      <GridCell {...sizeAttr}>
        <Menu dispatch={dispatch} state={state} />
      </GridCell>
    </Grid>
  );
};

export default Editor;
