import { useEffect, useRef, type InputHTMLAttributes } from 'react';

type NumericInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: number | string;
  onValueChange: (value: string) => void;
};

function normalizeNumericValue(value: string): string {
  const cleaned = value.replace(/,/g, '').replace(/[^\d.-]/g, '');
  const negative = cleaned.startsWith('-');
  const unsigned = cleaned.replace(/-/g, '');
  const decimalIndex = unsigned.indexOf('.');
  const integer = decimalIndex === -1 ? unsigned : unsigned.slice(0, decimalIndex);
  const fraction = decimalIndex === -1 ? '' : `.${unsigned.slice(decimalIndex + 1).replace(/\./g, '')}`;

  return `${negative ? '-' : ''}${integer}${fraction}`;
}

function formatNumericValue(value: string): string {
  const normalized = normalizeNumericValue(value);
  const decimalIndex = normalized.indexOf('.');
  const integer = decimalIndex === -1 ? normalized : normalized.slice(0, decimalIndex);
  const fraction = decimalIndex === -1 ? '' : normalized.slice(decimalIndex);
  const sign = integer.startsWith('-') ? '-' : '';
  const digits = sign ? integer.slice(1) : integer;

  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction}`;
}

export function NumericInput({ value, onValueChange, inputMode = 'decimal', ...props }: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rawValue = String(value);
  const displayValue = rawValue !== '' && Number(rawValue) === 0 ? '' : formatNumericValue(rawValue);
  const minValue = props.min === undefined ? undefined : Number(props.min);
  const maxValue = props.max === undefined ? undefined : Number(props.max);
  const stepValue = props.step === undefined || props.step === 'any' ? undefined : Number(props.step);

  const updateValidity = (input: HTMLInputElement, nextValue: string) => {
    if (!nextValue) {
      input.setCustomValidity('');
      return;
    }

    const numericValue = Number(nextValue);
    let message = '';
    if (!Number.isFinite(numericValue)) {
      message = 'Enter a valid number.';
    } else if (minValue !== undefined && numericValue < minValue) {
      message = `Enter a value greater than or equal to ${minValue}.`;
    } else if (maxValue !== undefined && numericValue > maxValue) {
      message = `Enter a value less than or equal to ${maxValue}.`;
    } else if (stepValue && Number.isFinite(stepValue)) {
      const baseValue = minValue ?? 0;
      const stepDifference = (numericValue - baseValue) / stepValue;
      if (Math.abs(stepDifference - Math.round(stepDifference)) > 1e-8) {
        message = `Enter a value in increments of ${stepValue}.`;
      }
    }

    input.setCustomValidity(message);
  };

  useEffect(() => {
    if (inputRef.current) updateValidity(inputRef.current, rawValue);
  }, [rawValue, minValue, maxValue, stepValue]);

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      inputMode={inputMode}
      value={displayValue}
      onChange={event => {
        const inputValue = event.currentTarget.value;
        const caretPosition = event.currentTarget.selectionStart ?? inputValue.length;
        const normalized = normalizeNumericValue(inputValue);
        updateValidity(event.currentTarget, normalized);
        onValueChange(normalized);

        const normalizedPrefix = normalizeNumericValue(inputValue.slice(0, caretPosition));
        const nextCaretPosition = formatNumericValue(normalizedPrefix).length;
        requestAnimationFrame(() => inputRef.current?.setSelectionRange(nextCaretPosition, nextCaretPosition));
      }}
    />
  );
}
