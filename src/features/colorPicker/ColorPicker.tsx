import React, {
  Dispatch,
  StatelessComponent,
  useEffect,
  useState,
} from 'react';
import ColorWrap from './ColorWrap';
import Hue from './hue/Hue';
import Saturation from './saturation/Saturation';

import chevron_right from '../../assets/icons/chevron_right-black-18dp.svg';
import getTextColor from '../common/getTextColor';

import './ColorPicker.css';

export type ColorChangeEvent =
  | React.MouseEvent<HTMLDivElement, MouseEvent>
  | React.TouchEvent<HTMLDivElement>;

export type ChangedColor = {
  hex: HexStr;
  hsl: tinycolor.ColorFormats.HSLA;
  hsv: tinycolor.ColorFormats.HSVA;
  rgb: tinycolor.ColorFormats.RGB;
  oldHue?: number;
  src?: string;
};

interface PickerProps extends ChangedColor {
  onChange: (...arg: any[]) => void;
}

const PickerComp: React.FunctionComponent<PickerProps> = (props) => {
  return (
    <div className='picker'>
      <Saturation {...props} />
      <Hue {...props} />
    </div>
  );
};

const Picker = ColorWrap(PickerComp as StatelessComponent);

interface Props {
  selectedComponent: string;
  color: string;
  dispatch: Dispatch<any>;
}

const ColorPicker: React.FunctionComponent<Props> = ({
  color,
  dispatch,
  selectedComponent,
}) => {
  const [isOpen, setIsOpen]: [boolean, Dispatch<any>] = useState(true);
  const [ownColor, setOwnColor]: [HexStr, Dispatch<HexStr>] = useState(color);
  useEffect(() => {
    setOwnColor(color);
  }, [color, selectedComponent]);

  const handleChange = (color: ChangedColor) => {
    setOwnColor(color.hex);
  };

  const handleChangeComplete = (color: ChangedColor) => {
    dispatch({ type: selectedComponent, payload: color.hex });
  };

  const togglePicker = (): void => {
    setIsOpen(!isOpen);
  };

  const iconColor: string = { black: '', white: 'white', gray: 'gray' }[
    getTextColor(ownColor)
  ];

  return (
    <>
      <button
        className='color-toggle'
        onClick={togglePicker}
        style={{
          backgroundColor: ownColor,
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
        title={`${isOpen ? 'Hide' : 'Show'} Color Picker`}
      >
        <img alt='arrow indicator' src={chevron_right} className={iconColor} />
      </button>
      {isOpen && (
        <Picker
          color={ownColor}
          onChange={handleChange}
          onChangeComplete={handleChangeComplete}
        />
      )}
    </>
  );
};
export default ColorPicker;
