import React from 'react';
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarNavigationIcon,
} from '@rmwc/top-app-bar';

import chevron_right from '../../assets/icons/chevron_right-black-18dp.svg';

const EditorHeader: React.FunctionComponent<{
  unsetToken: () => void;
}> = ({ unsetToken }) => {
  return (
    <>
      <TopAppBar>
        <TopAppBarRow>
          <TopAppBarSection>
            <TopAppBarNavigationIcon
              icon={chevron_right}
              className={`flipx white`}
              onClick={unsetToken}
            />
            <TopAppBarTitle>Token Editor</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export default EditorHeader;
