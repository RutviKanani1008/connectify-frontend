import { useState, useEffect } from 'react';

export const useDebounce = (value, ms = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, ms);

    return () => clearTimeout(handler);
  }, [value, ms]);

  return debouncedValue;
};
