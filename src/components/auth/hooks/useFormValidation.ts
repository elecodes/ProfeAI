import { useState } from "react";

type ValidationRules = Record<string, (value: any, formData: any) => string>;

interface UseFormValidationReturn<T> {
  form: T;
  errors: Record<string, string>;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent, onSubmit: (data: T) => Promise<void>) => Promise<void>;
  resetForm: () => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

/**
 * Custom hook for form validation and state management
 * @param {T} initialState - Initial form state
 * @param {() => ValidationRules} validationRules - Function that returns validation rules
 */
export function useFormValidation<T extends Record<string, any>>(
  initialState: T,
  validationRules: () => ValidationRules
): UseFormValidationReturn<T> {
  const [form, setForm] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const validateField = (name: string, value: any) => {
    const rules = validationRules();
    const rule = rules[name];
    
    if (!rule) return "";
    
    return rule(value, form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateAll = () => {
    const rules = validationRules();
    let newErrors: Record<string, string> = {};
    
    Object.keys(rules).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, onSubmit: (data: T) => Promise<void>) => {
    e.preventDefault();
    if (loading) return;

    if (!validateAll()) return;

    setLoading(true);

    try {
      await onSubmit(form);
    } catch (err: any) {
      setErrors({ general: err.message });
    }

    setLoading(false);
  };

  const resetForm = () => {
    setForm(initialState);
    setErrors({});
    setLoading(false);
  };

  return {
    form,
    errors,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors,
  };
}
