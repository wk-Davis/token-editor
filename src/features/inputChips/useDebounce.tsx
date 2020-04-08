import { useState, useEffect } from 'react';

function useDebounce(value: string, wait: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout: NodeJS.Timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, wait);
    return () => {
      clearTimeout(timeout);
    };
  }, [value, wait]);

  return debouncedValue;
}

export default useDebounce;
