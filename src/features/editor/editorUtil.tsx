import { MutableRefObject, useCallback, useRef } from 'react';
import config from '../../assets';

const DEBOUNCE_RATE = 150;

export interface TokenState {
  [filename: string]: HexStr;
}

export const getState = (token: string) => {
  const tokenConfig: Token = config[token];
  return Object.keys(tokenConfig).reduce(
    (state: TokenState, filename: string) => {
      state[filename] = tokenConfig[filename].color;
      return state;
    },
    {}
  );
};

export const getSources = (token: string) => {
  const tokenConfig: Token = config[token];
  return Object.keys(tokenConfig).reduce(
    (srcs: { [filename: string]: string }, filename: string) => {
      srcs[filename] = tokenConfig[filename].src;
      return srcs;
    },
    {}
  );
};

export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => unknown
): (...args: T) => void {
  const timeout: MutableRefObject<NodeJS.Timeout | null> = useRef(null);
  const debouncedFunction = useRef(callback);
  debouncedFunction.current = callback;

  const cancelDebouncedCallback: () => void = useCallback(() => {
    clearTimeout(timeout.current as NodeJS.Timeout);
    timeout.current = null;
  }, []);

  const debouncedCallback = useCallback(
    (...args: T) => {
      clearTimeout(timeout.current as NodeJS.Timeout);
      timeout.current = setTimeout(() => {
        cancelDebouncedCallback();

        debouncedFunction.current(...args);
      }, DEBOUNCE_RATE);
    },
    [cancelDebouncedCallback]
  );

  return debouncedCallback;
}
