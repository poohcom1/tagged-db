import { useEffect, useState } from "react";

interface Props {
  onChange?: (value: string) => void;
  value: string;

  options?: string[];
}

export const EnumEdit = ({ value, onChange, options }: Props) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <select value={currentValue} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">-</option>
      {(options ?? []).map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
};
