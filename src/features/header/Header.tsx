import React, { Dispatch } from 'react';
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@rmwc/top-app-bar';

import chevron_right from '../../assets/icons/chevron_right-black-18dp.svg';

import '@rmwc/top-app-bar/styles';

const Header: React.FunctionComponent<{
  showBack: boolean;
  unsetToken: Dispatch<any>;
}> = ({ showBack, unsetToken }) => {
  return (
    <>
      <TopAppBar>
        <TopAppBarRow>
          <TopAppBarSection>
            <TopAppBarNavigationIcon
              icon={chevron_right}
              className={`flipx white ${showBack ? '' : 'hidden'}`}
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

export default Header;
