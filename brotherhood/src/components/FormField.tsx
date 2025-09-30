'use client';

import React, { forwardRef } from 'react';
import { AlertCircle, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  description,
  error,
  required = false,
  disabled = false,
  className,
  children,
}: FormFieldProps) {
  const fieldId = React.useId();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            error && "text-destructive",
            disabled && "text-muted-foreground"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-invalid': !!error,
          'aria-describedby': error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined,
          disabled,
        })}
      </div>
      
      {error && (
        <div 
          id={`${fieldId}-error`}
          className="flex items-center space-x-2 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Input Field
export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, description, error, required, leftIcon, rightIcon, onRightIconClick, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        disabled={props.disabled}
      >
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            className={cn(
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={onRightIconClick}
              tabIndex={-1}
            >
              {rightIcon}
            </Button>
          )}
        </div>
      </FormField>
    );
  }
);
FormInput.displayName = 'FormInput';

// Password Field
export interface FormPasswordProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const FormPassword = forwardRef<HTMLInputElement, FormPasswordProps>(
  ({ label, description, error, required, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        disabled={props.disabled}
      >
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </FormField>
    );
  }
);
FormPassword.displayName = 'FormPassword';

// Textarea Field
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  rows?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, description, error, required, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        disabled={props.disabled}
      >
        <Textarea
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);
FormTextarea.displayName = 'FormTextarea';

// Select Field
export interface FormSelectProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ 
    label, 
    description, 
    error, 
    required, 
    disabled, 
    placeholder = "선택하세요", 
    options, 
    value, 
    onValueChange,
    className,
    ...props 
  }, ref) => {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        disabled={disabled}
      >
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger 
            ref={ref}
            className={cn(
              error && "border-destructive focus:ring-destructive",
              className
            )}
            {...props}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    );
  }
);
FormSelect.displayName = 'FormSelect';

// Checkbox Field
export interface FormCheckboxProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const FormCheckbox = forwardRef<HTMLButtonElement, FormCheckboxProps>(
  ({ label, description, error, required, disabled, checked, onCheckedChange, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <Checkbox
            ref={ref}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className={cn(
              error && "border-destructive",
              className
            )}
            {...props}
          />
          {label && (
            <Label 
              htmlFor={undefined}
              className={cn(
                "text-sm font-medium cursor-pointer",
                error && "text-destructive",
                disabled && "text-muted-foreground cursor-not-allowed"
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
        </div>
      </FormField>
    );
  }
);
FormCheckbox.displayName = 'FormCheckbox';

// Radio Group Field
export interface FormRadioGroupProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const FormRadioGroup = forwardRef<HTMLDivElement, FormRadioGroupProps>(
  ({ label, description, error, required, disabled, options, value, onValueChange, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        disabled={disabled}
      >
        <RadioGroup
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          className={cn(
            error && "text-destructive",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value} 
                id={option.value}
                disabled={option.disabled || disabled}
              />
              <Label 
                htmlFor={option.value}
                className={cn(
                  "text-sm font-medium cursor-pointer",
                  error && "text-destructive",
                  (disabled || option.disabled) && "text-muted-foreground cursor-not-allowed"
                )}
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FormField>
    );
  }
);
FormRadioGroup.displayName = 'FormRadioGroup';

// Helper Text
export interface FormHelperTextProps {
  text: string;
  variant?: 'default' | 'error' | 'warning' | 'success';
  icon?: React.ReactNode;
}

export function FormHelperText({ text, variant = 'default', icon }: FormHelperTextProps) {
  const variantStyles = {
    default: 'text-muted-foreground',
    error: 'text-destructive',
    warning: 'text-yellow-600 dark:text-yellow-400',
    success: 'text-green-600 dark:text-green-400',
  };

  return (
    <div className={cn("flex items-center space-x-2 text-sm", variantStyles[variant])}>
      {icon || (variant === 'default' && <HelpCircle className="h-4 w-4" />)}
      <span>{text}</span>
    </div>
  );
}
