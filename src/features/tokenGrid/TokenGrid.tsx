import React from 'react';
import {
  ImageList,
  ImageListImage,
  ImageListItem,
  ImageListLabel,
  ImageListSupporting,
} from '@rmwc/image-list';
import { Typography } from '@rmwc/typography';

import config from '../../assets';
import envvars from '../../envvars';

import './TokenGrid.css';
import '@rmwc/image-list/styles';

const TokenGrid: React.FunctionComponent<{}> = (props) => {
  const tokenNames: string[] = Object.keys(config);
  return (
    <>
      <Typography use='subtitle1'>Select a token:</Typography>
      <ImageList withTextProtection>
        {tokenNames.map((ref: string) => {
          const isAvailable: boolean = ref === 'cleric';
          return (
            <ImageListItem className={isAvailable ? '' : 'no-hover'} key={ref}>
              <ImageListImage
                src={config[ref][envvars.REACT_APP_BASE]?.src}
                alt={`${ref} token`}
              />
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
