import { useCallback, useState } from "react";

export const useFakeForm = (
  defaultValue: any,
  rule: (value: any) => { error: boolean; message: string },
) => {
  const [value, setValue] = useState<any>(defaultValue);
  const [error, setError] = useState({ error: false, message: "" });
  const onChange = useCallback(
    (value: any) => {
      setError(rule(value));
      setValue(value);
    },
    [rule],
  );

  return { value, error, onChange };
};
