import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>(value);
  useEffect(() => {
    ref.current = value;
    return () => {
      ref.current = undefined;
    };
  }, [value]);
  return ref.current as T;
}
