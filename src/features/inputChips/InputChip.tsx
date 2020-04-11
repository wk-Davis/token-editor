import React, { FormEvent, useEffect, useState } from 'react';
import tinycolor from 'tinycolor2';

import './InputChip.css';

interface Props {
  className?: string;
  name: string;
  setColor: (color: HexStr) => void;
  stateColor: string;
}

const InputChip: React.FunctionComponent<Props> = ({
  name,
  stateColor,
  setColor,
  ...props
}) => {
  const [ownColor, setOwnColor] = useState(stateColor);
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const newVal = `#${e.currentTarget.value
      .replace(/[^a-fA-F\d]/g, '')
      .slice(0, 6)}`;
    setOwnColor(newVal);
    setColor(newVal);
  };

  useEffect(() => {
    setOwnColor(stateColor);
  }, [stateColor]);

  const styles = {
    backgroundColor: stateColor,
    color: tinycolor
      .mostReadable(stateColor, ['#000000', '#ffffff'], {
        level: 'AAA',
        size: 'small',
      })
      .toHexString(),
  };

  return (
    <input
      {...props}
      className={`${props.className} input-chip`}
      name={name}
      onChange={handleChange}
      style={styles}
      value={ownColor?.toUpperCase()}
    />
  );
};

export default InputChip;
