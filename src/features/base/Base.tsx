import React from 'react';
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle
} from '@rmwc/top-app-bar';

interface Props {
  children?: any
}

const Base: React.FunctionComponent<Props> = props => {
  return (
    <div>
      <TopAppBar>
        <TopAppBarRow>
          <TopAppBarSection>
            <TopAppBarTitle>Token Editor</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
      <div>{props.children}</div>
    </div>
  );
};

export default Base;