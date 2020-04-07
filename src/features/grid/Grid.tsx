import React from 'react';
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
  setToken: (arg: string) => any;
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
            return (
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
          })}
        </ImageList>
      </div>
    </>
  );
};

export default Grid;