import React, { MutableRefObject, useRef } from 'react';
import { ColorChangeEvent } from '../ColorPicker';
import { calculateChange } from './saturationUtil';

interface Props {
  hsv: tinycolor.ColorFormats.HSVA;
  hsl: tinycolor.ColorFormats.HSLA;
  onChange: (change: tinycolor.ColorFormats.HSVA, e: ColorChangeEvent) => void;
}

const Saturation: React.FunctionComponent<Props> = ({ hsv, hsl, onChange }) => {
  const container: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const pointerPosition = {
    top: `${-(hsv.v * 100) + 100}%`,
    left: `${hsv.s * 100}%`,
  };
  const backgroundColor = {
    background: `hsl(${hsl.h},100%, 50%)`,
  };

  const handleChange = (e: ColorChangeEvent) => {
    const change = calculateChange(e, hsl, container.current as HTMLDivElement);
    onChange(change, e);
  };

  return (
    <div className='saturation-selector'>
      <div
        className='saturation-selector__color'
        onClick={handleChange}
        onMouseDown={handleChange}
        onTouchMove={handleChange}
        onTouchStart={handleChange}
        ref={container}
        style={backgroundColor}
      >
        <style>{`
            .saturation-selector__white {
              background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));
              background: linear-gradient(to right, #fff, rgba(255,255,255,0));
            }
            .saturation-selector__black {
              background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));
              background: linear-gradient(to top, #000, rgba(0,0,0,0));
            }
          `}</style>
        <div className='saturation-selector__white'>
          <div className='saturation-selector__black' />
          <div
            className='saturation-selector__pointer'
            draggable
            onDrag={handleChange}
            onDragEnd={handleChange}
            style={pointerPosition}
          />
        </div>
      </div>
    </div>
  );
};
export default Saturation;
