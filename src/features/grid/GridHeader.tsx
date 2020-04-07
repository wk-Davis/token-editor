import React from 'react';
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@rmwc/top-app-bar';

const GridHeader: React.FunctionComponent<{}> = () => {
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

export default GridHeader;
