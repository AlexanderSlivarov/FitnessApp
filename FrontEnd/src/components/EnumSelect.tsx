import React from "react";

export interface EnumOption {
  value: number;
  label: string;
}

interface EnumSelectProps {
  value: number;
  onChange: (value: number) => void;
  options: EnumOption[];
}

export default function EnumSelect({ value, onChange, options }: EnumSelectProps) {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
