import React from 'react';
import { Ripple } from '@rmwc/ripple';
import {
  ImageList,
  ImageListImage,
  ImageListItem,
  ImageListLabel,
  ImageListSupporting,
} from '@rmwc/image-list';
import { Typography } from '@rmwc/typography';

import GridHeader from './GridHeader';
import config from '../../assets';
import envvars from '../../envvars';

import './Grid.css';
import '@rmwc/image-list/styles';

const Grid: React.FunctionComponent<{
  setToken: (arg: string) => void;
}> = ({ setToken }) => {
  const tokenNames: string[] = Object.keys(config);
  return (
    <>
      <GridHeader />
      <div className='token-grid'>
        <Typography className='text-center' tag='p' use='subtitle1'>
          Select a token:
        </Typography>
        <ImageList withTextProtection>
          {tokenNames.map((ref: string) => {
            const isAvailable: boolean = ref === 'cleric';
            const src: string = config[ref][envvars.REACT_APP_BASE].src;
            const item = (
              <ImageListItem
                className={isAvailable ? '' : 'no-hover'}
                key={ref}
                onClick={() => {
                  isAvailable && setToken(ref);
                }}
              >
                <ImageListImage src={src} alt={`${ref} token`} />
                {!isAvailable && (
                  <ImageListSupporting>
                    <ImageListLabel>Available Soon!</ImageListLabel>
                  </ImageListSupporting>
                )}
              </ImageListItem>
            );
            return isAvailable ? <Ripple key={ref}>{item}</Ripple> : item;
          })}
        </ImageList>
      </div>
    </>
  );
};

export default Grid;
