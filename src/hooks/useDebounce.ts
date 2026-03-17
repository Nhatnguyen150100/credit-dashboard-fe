import React from "react";

const useDebounce = (value: any, delay: number) => {
  const debouncedValueRef = React.useRef(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      debouncedValueRef.current = value;
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValueRef.current;
};

export { useDebounce };
