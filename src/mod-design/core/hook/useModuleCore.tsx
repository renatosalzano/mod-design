import { useRef, useState } from "react";

interface Props {
  focused?: boolean;
  disabled?: boolean;
  color?: "main" | "success" | "warning" | "error";
}
export function useModuleCore({ focused = false, disabled = false }: Props) {
  const [isFocused, setFocused] = useState(focused);
  const isDisabled = useRef(disabled).current;

  return { isFocused, isDisabled, setFocused };
}
