"use client";

interface Props {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function QuantityInput({ value, max, onChange, disabled }: Props) {
  return (
    <div className="qty">
      <button type="button" onClick={() => onChange(value - 1)} disabled={disabled || value <= 1} aria-label="수량 감소">
        −
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="수량 증가">
        +
      </button>
    </div>
  );
}
