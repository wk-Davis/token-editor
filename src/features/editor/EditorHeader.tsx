import React from 'react';
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@rmwc/top-app-bar';

import chevron_right from '../../assets/icons/chevron_right-black-18dp.svg';
import save_icon from '../../assets/icons/save_alt-black-18dp.svg';

const EditorHeader: React.FunctionComponent<{
  saveCanvas: () => void;
  unsetToken: () => void;
}> = ({ saveCanvas, unsetToken }) => {
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
          <TopAppBarSection alignEnd>
            <TopAppBarActionItem
              className='white'
              icon={save_icon}
              onClick={saveCanvas}
              title='Save'
            />
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export default EditorHeader;
