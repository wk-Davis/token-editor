import React, { useState, useEffect, FormEvent } from 'react';
import { ListItem, ListItemMeta } from '@rmwc/list';
import envvars from '../../envvars';
import tinycolor from 'tinycolor2';

import './ListItem.css';

interface Props {
  color: string;
  filename: string;
  selectComponent: () => void;
  selected: boolean;
  setColor: (color: HexStr) => void;
}

const InputListItem: React.FunctionComponent<Props> = ({
  color,
  filename,
  selectComponent,
  selected,
  setColor,
}) => {
  const [ownColor, setOwnColor] = useState(color);
  const delimiterIndex: number = filename.indexOf(envvars.REACT_APP_DELIMITER);
  const name: string =
    delimiterIndex >= 0 ? filename.substring(delimiterIndex + 1) : filename;

  useEffect(() => {
    setOwnColor(color);
  }, [color]);

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const newVal = `#${e.currentTarget.value
      .replace(/[^a-fA-F\d]/g, '')
      .slice(0, 6)}`;
    setOwnColor(newVal);
    setColor(newVal);
  };

  const styles = {
    backgroundColor: tinycolor(color).toHexString(),
    color: tinycolor
      .mostReadable(color, ['#000000', '#ffffff'], {
        level: 'AAA',
        size: 'small',
      })
      .toHexString(),
  };

  return (
    <ListItem onClick={selectComponent} selected={selected} tabIndex={-1}>
      {name}
      <ListItemMeta>
        <input
          className={`input-chip`}
          name={name}
          onChange={handleChange}
          onFocus={selectComponent}
          style={styles}
          value={ownColor?.toUpperCase()}
        />
      </ListItemMeta>
    </ListItem>
  );
};

export default InputListItem;
