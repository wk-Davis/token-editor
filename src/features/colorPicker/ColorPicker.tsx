import React, { Dispatch, useEffect, useState } from 'react';
import tinycolor from 'tinycolor2';

import * as utils from './colorUtil';
import Hue from './hue/Hue';
import Saturation from './saturation/Saturation';
import chevron_right from '../../assets/icons/chevron_right-18dp.svg';

import './ColorPicker.css';

export type ColorChangeEvent =
  | React.MouseEvent<HTMLDivElement, MouseEvent>
  | React.TouchEvent<HTMLDivElement>;

export type PickerColor = {
  hex: HexStr;
  hsl: tinycolor.ColorFormats.HSLA;
  hsv: tinycolor.ColorFormats.HSVA;
  oldHue?: number;
};

interface Props {
  color: string;
  pickerOpen: boolean;
  setColor: (arg: string) => void;
  setPickerOpen: (arg: boolean) => void;
}

const ColorPicker: React.FunctionComponent<Props> = ({
  color: stateColor,
  pickerOpen: isOpen,
  setColor,
  setPickerOpen: setIsOpen,
}) => {
  const [ownColor, setOwnColor]: [
    PickerColor,
    Dispatch<PickerColor>
  ] = useState(utils.toState(stateColor));

  useEffect(() => {
    setOwnColor(utils.toState(stateColor));
  }, [stateColor]);

  const handleChange = (
    color: tinycolor.ColorFormats.HSLA | tinycolor.ColorFormats.HSVA
  ): void => {
    const isValidColor: boolean = utils.simpleCheckForValidColor(color);
    if (isValidColor) {
      const newColor = utils.toState(color, color.h || ownColor.oldHue);
      setOwnColor(newColor);
      setColor(newColor.hex);
    }
  };

  const togglePicker = (): void => {
    setIsOpen(!isOpen);
  };

  const iconColor: string = tinycolor
    .mostReadable(ownColor.hex, ['#000000', '#ffffff'], {
      level: 'AAA',
      size: 'small',
    })
    .toHex();

  return (
    <>
      <button
        className='color-toggle'
        onClick={togglePicker}
        style={{
          backgroundColor: ownColor.hex,
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
        title={`${isOpen ? 'Hide' : 'Show'} Color Picker`}
      >
        <img
          alt='arrow indicator'
          src={chevron_right}
          style={{
            filter: `invert(${iconColor === '000000' ? '0%' : '100%'})`,
          }}
        />
      </button>
      {isOpen && (
        <div className='picker'>
          <Saturation {...ownColor} onChange={handleChange} />
          <Hue {...ownColor} onChange={handleChange} />
        </div>
      )}
    </>
  );
};
export default ColorPicker;
