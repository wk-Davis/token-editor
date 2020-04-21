import React from 'react';
import { Ripple } from '@rmwc/ripple';
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@rmwc/top-app-bar';

import chevronRight from '../../assets/icons/chevron_right-18dp';
import saveIcon from '../../assets/icons/save_alt-18dp';

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
              icon={{
                strategy: 'component',
                icon: (
                  <Ripple>{chevronRight('--mdc-theme-text-on-primary')}</Ripple>
                ),
              }}
              className={`flipx`}
              onClick={unsetToken}
            />
            <TopAppBarTitle>Token Editor</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            <TopAppBarActionItem
              icon={{
                strategy: 'component',
                icon: (
                  <Ripple accent>
                    {saveIcon('--mdc-theme-text-on-primary')}
                  </Ripple>
                ),
              }}
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
