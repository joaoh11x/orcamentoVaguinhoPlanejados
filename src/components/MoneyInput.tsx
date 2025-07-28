import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface MoneyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onValueChange,
  placeholder = "0,00",
  style,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Formatar o valor inicial
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatCurrency(value));
    }
  }, [value]);

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '';
    return amount.toFixed(2).replace('.', ',');
  };

  const handleTextChange = (text: string) => {
    // Remove tudo que não é número
    const numbersOnly = text.replace(/\D/g, '');
    
    if (numbersOnly === '') {
      setDisplayValue('');
      onValueChange(0);
      return;
    }

    // Converte para centavos e depois para reais
    const cents = parseInt(numbersOnly, 10);
    const reais = cents / 100;
    
    // Formata para exibição
    const formatted = formatCurrency(reais);
    setDisplayValue(formatted);
    
    // Chama o callback com o valor numérico
    onValueChange(reais);
  };

  return (
    <TextInput
      {...props}
      style={[styles.input, style]}
      value={displayValue}
      onChangeText={handleTextChange}
      placeholder={placeholder}
      keyboardType="numeric"
      maxLength={12} // Limita para evitar valores muito grandes
    />
  );
};

const styles = StyleSheet.create({
  input: {
    // Estilos básicos, podem ser sobrescritos
    fontSize: 16,
  },
});

export default MoneyInput;
