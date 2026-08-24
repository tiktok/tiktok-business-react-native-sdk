import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { debugConsoleStyles } from '../styles/debugConsoleStyles';

interface PayloadEditorProps<T> {
  label: string;
  value: T;
  helperText?: string;
  placeholder?: string;
  onRawChange?: (raw: string) => void;
  onParsedValueChange?: (value: T | undefined) => void;
  onValidationChange?: (error: string | null) => void;
}

function stringifyValue(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function PayloadEditor<T>({
  label,
  value,
  helperText,
  placeholder,
  onRawChange,
  onParsedValueChange,
  onValidationChange,
}: PayloadEditorProps<T>) {
  const initialRaw = useMemo(() => stringifyValue(value), [value]);
  const [rawValue, setRawValue] = useState(initialRaw);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRawValue(initialRaw);
  }, [initialRaw]);

  const handleChange = (nextValue: string) => {
    setRawValue(nextValue);
    onRawChange?.(nextValue);

    if (nextValue.trim().length === 0) {
      setError(null);
      onValidationChange?.(null);
      onParsedValueChange?.(undefined);
      return;
    }

    try {
      const parsed = JSON.parse(nextValue) as T;
      setError(null);
      onValidationChange?.(null);
      onParsedValueChange?.(parsed);
    } catch (parseError) {
      const nextError =
        parseError instanceof Error ? parseError.message : 'Invalid JSON.';
      setError(nextError);
      onValidationChange?.(nextError);
      onParsedValueChange?.(undefined);
    }
  };

  return (
    <View style={debugConsoleStyles.stack8}>
      <Text style={debugConsoleStyles.inputLabel}>{label}</Text>
      {helperText ? (
        <Text style={debugConsoleStyles.helperText}>{helperText}</Text>
      ) : null}
      <TextInput
        multiline
        value={rawValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          debugConsoleStyles.textInput,
          debugConsoleStyles.multilineInput,
        ]}
      />
      {error ? <Text style={debugConsoleStyles.errorText}>{error}</Text> : null}
    </View>
  );
}
