import React, {
  Dispatch,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from 'react';

import getTextColor from './getTextColor';
import useDebounce from './useDebounce';
import { EditorDispatch } from '../editor/Editor';

import './InputChip.css';

interface Props {
  name: string;
  stateValue: string;
  className?: string;
}

const InputChip: React.FunctionComponent<Props> = ({
  name,
  stateValue,
  ...props
}) => {
  const [ownValue, setOwnValue] = useState(stateValue);
  const dispatch: Dispatch<any> = useContext(EditorDispatch);
  const debouncedValue: string = useDebounce(ownValue, 300);

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const newVal = `#${e.currentTarget.value
      .replace(/[^a-fA-F\d]/g, '')
      .slice(0, 6)}`;
    setOwnValue(newVal.toUpperCase());
  };

  useEffect(() => {
    if (debouncedValue) dispatch({ type: name, payload: debouncedValue });
  }, [debouncedValue, dispatch, name]);

  const styles = {
    backgroundColor: `${stateValue}`,
    color: getTextColor(`${stateValue}`),
  };

  return (
    <input
      {...props}
      style={styles}
      className={`${props.className} input-chip`}
      name={name}
      value={ownValue}
      onChange={handleChange}
    />
  );
};

export default InputChip;
