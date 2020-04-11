import React, { MutableRefObject, useRef } from 'react';
import { ColorChangeEvent } from '../ColorPicker';
import { calculateChange } from './hueUtil';

interface Props {
  hsl: tinycolor.ColorFormats.HSLA;
  onChange: (change: tinycolor.ColorFormats.HSLA, e: ColorChangeEvent) => void;
}

const Hue: React.FunctionComponent<Props> = ({ hsl, onChange }) => {
  const container: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const pointerPosition = { left: `${(hsl.h * 100) / 360}%` };

  const handleChange = (e: ColorChangeEvent) => {
    const change = calculateChange(e, hsl, container.current as HTMLDivElement);
    if (change) onChange(change, e);
  };

  return (
    <div className='hue-selector'>
      <div
        className={`hue-selector__bar`}
        onClick={handleChange}
        onMouseDown={handleChange}
        onTouchMove={handleChange}
        onTouchStart={handleChange}
        ref={container}
      >
        <style>{`
            .hue-selector__bar {
              background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0
                33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
              background: -webkit-linear-gradient(to right, #f00 0%, #ff0
                17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
            }
          `}</style>
        <div
          className='hue-selector__pointer'
          draggable
          onDrag={handleChange}
          onDragEnd={handleChange}
          style={pointerPosition}
        />
      </div>
    </div>
  );
};

export default Hue;
