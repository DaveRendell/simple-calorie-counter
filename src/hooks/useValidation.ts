import { useState, useCallback } from "react";

export type ValidationRule = (value: string) => string | null;

export type ValidationRules = Record<string, ValidationRule[]>;

export function useValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (values: Record<string, string>): boolean => {
      const newErrors: Record<string, string> = {};
      for (const [field, fieldRules] of Object.entries(rules)) {
        for (const rule of fieldRules) {
          const error = rule(values[field] ?? "");
          if (error) {
            newErrors[field] = error;
            break;
          }
        }
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules],
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return { errors, validate, clearError };
}

export const required = (label: string): ValidationRule => {
  return (value) => (value.trim() ? null : `${label} is required`);
};

export const positiveNumber = (label: string): ValidationRule => {
  return (value) => {
    const num = parseInt(value, 10);
    return num > 0 ? null : `${label} must be a positive number`;
  };
};
