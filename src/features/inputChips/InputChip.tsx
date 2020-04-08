import React, {
  Dispatch,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from 'react';

import getTextColor from '../common/getTextColor';
import useDebounce from './useDebounce';
import { EditorDispatch } from '../editor/Editor';

import './InputChip.css';

interface Props {
  className?: string;
  name: string;
  stateColor: string;
}

const InputChip: React.FunctionComponent<Props> = ({
  name,
  stateColor,
  ...props
}) => {
  const [ownColor, setOwnColor] = useState(stateColor);
  const dispatch: Dispatch<any> = useContext(EditorDispatch);
  const debouncedColor: string = useDebounce(ownColor, 300);

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const newVal = `#${e.currentTarget.value
      .replace(/[^a-fA-F\d]/g, '')
      .slice(0, 6)}`;
    setOwnColor(newVal);
  };

  const selectComponent = () => {
    dispatch({ type: 'selectedComponent', payload: name });
  };

  useEffect(() => {
    if (debouncedColor) dispatch({ type: name, payload: debouncedColor });
  }, [debouncedColor, dispatch, name]);

  useEffect(() => {
    setOwnColor(stateColor);
  }, [stateColor]);

  const styles = {
    backgroundColor: stateColor,
    color: getTextColor(stateColor),
  };

  return (
    <input
      {...props}
      className={`${props.className} input-chip`}
      name={name}
      onChange={handleChange}
      onClick={selectComponent}
      style={styles}
      value={ownColor.toUpperCase()}
    />
  );
};

export default InputChip;
