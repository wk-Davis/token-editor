import React, {
  Dispatch,
  StatelessComponent,
  useEffect,
  useState,
} from 'react';
import { CustomPicker } from 'react-color';
import { Hue, Saturation } from 'react-color/lib/components/common';

import './ColorPicker.css';

interface PickerProps {
  hex: string;
  rgb: {};
  hsl: {};
  onChange: (...arg: any[]) => void;
}

const Pointer: React.FunctionComponent<{}> = () => {
  return <div className='hue-pointer' />;
};

const PickerComp: React.FunctionComponent<PickerProps> = (props) => {
  return (
    <div className='picker'>
      <div className='saturation-container'>
        <Saturation {...props} />
      </div>
      <div className='hue-container'>
        <Hue {...props} pointer={Pointer} />
      </div>
    </div>
  );
};

const Picker = CustomPicker(PickerComp as StatelessComponent);

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
  const [ownColor, setOwnColor]: [string, Dispatch<any>] = useState(color);
  useEffect(() => {
    setOwnColor(color);
  }, [color, selectedComponent]);

  const handleChange = (color: { hex: string }) => {
    setOwnColor(color.hex);
  };

  const handleChangeComplete = (color: { hex: string }) => {
    dispatch({ type: selectedComponent, payload: color.hex });
  };

  return (
    <>
      <Picker
        color={ownColor}
        onChange={handleChange}
        onChangeComplete={handleChangeComplete}
      />
    </>
  );
};
export default ColorPicker;
