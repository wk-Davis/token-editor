import React from 'react';
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@rmwc/top-app-bar';

import '@rmwc/top-app-bar/styles';

const Header: React.FunctionComponent<{}> = () => {
  return (
    <>
      <TopAppBar>
        <TopAppBarRow>
          <TopAppBarSection>
            <TopAppBarTitle>Token Editor</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export default Header;
