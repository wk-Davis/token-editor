import React, { FormEvent, useEffect, useState } from 'react';
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
  setPickerOpen: (arg: boolean) => void;
}

const InputListItem: React.FunctionComponent<Props> = ({
  color,
  filename,
  selectComponent,
  selected,
  setColor,
  setPickerOpen,
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

  const handleItemClick = () => {
    selectComponent();
    setPickerOpen(true);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    selectComponent();
    setPickerOpen(false);
  };

  const styles = {
    backgroundColor: tinycolor(ownColor).toHexString(),
    color: tinycolor
      .mostReadable(ownColor, ['#000000', '#ffffff'], {
        level: 'AAA',
        size: 'small',
      })
      .toHexString(),
  };

  return (
    <ListItem onClick={handleItemClick} selected={selected} tabIndex={-1}>
      {name}
      <ListItemMeta>
        <input
          className={`input-chip`}
          id={`${name}-input`}
          name={name}
          onChange={handleChange}
          onFocus={handleInputFocus}
          style={styles}
          type='text'
          value={ownColor?.toUpperCase()}
        />
      </ListItemMeta>
    </ListItem>
  );
};

export default InputListItem;
