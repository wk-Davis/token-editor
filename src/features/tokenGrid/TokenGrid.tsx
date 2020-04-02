import React from 'react';
import {
  ImageList,
  ImageListImage,
  ImageListItem,
  ImageListLabel,
  ImageListSupporting
} from '@rmwc/image-list';
import { Typography } from '@rmwc/typography';

import { refs } from '../../assets';
import '@rmwc/image-list/styles';
import './TokenGrid.css';

const TokenGrid: React.FunctionComponent<{}> = props => {
  return (
    <>
      <Typography use='subtitle1'>Select a token:</Typography>
      <ImageList withTextProtection>
        {refs.map(({ src, ref }) => {
          const isAvailable: boolean = ref === 'cleric';
          return (
            <ImageListItem className={isAvailable ? '' : 'no-hover'} key={ref}>
              <ImageListImage src={src} alt={`${ref} token`} />
              {!isAvailable && (
                <ImageListSupporting>
                  <ImageListLabel>Available Soon!</ImageListLabel>
                </ImageListSupporting>
              )}
            </ImageListItem>
          );
        })}
      </ImageList>
    </>
  );
};

export default TokenGrid;
